import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ExecuteTabProps {
  businessId: number | null;
}

interface AIProvider {
  name: string;
  model: string;
  color: string;
}

interface ScoringResult {
  provider: AIProvider;
  response: string;
  aeoScore: number;
  factors: {
    accuracy: number;
    relevance: number;
    completeness: number;
    brandMention: number;
    citations: number;
    visibility: number;
    ranking: number;
  };
  analysis: string;
  queryVariations: QueryResult[];
  overallVisibility: number;
  competitorAnalysis: CompetitorInfo[];
  missedResponses: QueryResult[];
}

interface CompetitorInfo {
  name: string;
  mentions: number;
  score: number;
}

interface QueryResult {
  query: string;
  response: string;
  mentioned: boolean;
  rankPosition: number;
  relevanceScore: number;
  wordPositionData?: {
    matches: Array<{
      matchedText: string;
      position: number;
      lineNumber: number;
      confidence: number;
      matchType: 'exact' | 'fuzzy' | 'partial';
      context: string;
    }>;
    totalMatches: number;
    averagePosition: number;
    lineNumbers: number[];
    businessMentionDensity: number;
  };
}

// Helper function to parse keywords from user input
function parseKeywords(keywordString: string): string[] {
  if (!keywordString.trim()) return [];
  
  return keywordString
    .split(/[,\n]+/)
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 0)
    .slice(0, 10); // Limit to 10 keywords
}

export default function ExecuteTab({ businessId }: ExecuteTabProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Form data states
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  
  // Workflow states
  const [workflowType, setWorkflowType] = useState<'manual' | 'website'>('website');
  const [websiteUrlForExtraction, setWebsiteUrlForExtraction] = useState('');
  const [isExtractingInfo, setIsExtractingInfo] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<{
    businessName: string;
    industry: string;
    location?: string;
    businessDescription: string;
    keywords: string[];
    confidence: number;
  } | null>(null);
  
  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ScoringResult[]>([]);
  const [overallCompetitors, setOverallCompetitors] = useState<CompetitorInfo[]>([]);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [editablePrompts, setEditablePrompts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'prompts'>('input');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  // Error and usage states
  const [error, setError] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<{ canUse: boolean; usageCount: number; maxUsage: number | string; tier: string } | null>(null);
  
  // Rate limiting states
  const [analyzeWebsiteRateLimit, setAnalyzeWebsiteRateLimit] = useState<{
    canUse: boolean;
    waitMinutes: number;
  }>({ canUse: true, waitMinutes: 0 });
  const [generatePromptsRateLimit, setGeneratePromptsRateLimit] = useState<{
    canUse: boolean;
    waitMinutes: number;
  }>({ canUse: true, waitMinutes: 0 });
  
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const aiProviders: AIProvider[] = [
    { name: 'OpenAI', model: '', color: 'bg-green-100 text-green-800' },
    { name: 'Claude', model: '', color: 'bg-orange-100 text-orange-800' },
    { name: 'Perplexity', model: '', color: 'bg-blue-100 text-blue-800' },
  ];

  // Check rate limits
  const checkRateLimits = useCallback(async () => {
    if (!user?.email) return;

    try {
      const [analyzeResponse, generateResponse] = await Promise.all([
        fetch('/api/rate-limit-check?action=analyzeWebsite', { credentials: 'include' }),
        fetch('/api/rate-limit-check?action=generatePrompts', { credentials: 'include' })
      ]);

      if (analyzeResponse.ok) {
        const analyzeData = await analyzeResponse.json();
        setAnalyzeWebsiteRateLimit({
          canUse: analyzeData.canUse,
          waitMinutes: analyzeData.waitMinutes || 0
        });
      }

      if (generateResponse.ok) {
        const generateData = await generateResponse.json();
        setGeneratePromptsRateLimit({
          canUse: generateData.canUse,
          waitMinutes: generateData.waitMinutes || 0
        });
      }
    } catch (error) {
      console.error('Error checking rate limits:', error);
    }
  }, [user?.email]);

  const checkUsageLimits = useCallback(async () => {
    if (!user?.email) return;

    try {
      const response = await fetch('/api/usage-check', {
        credentials: 'include'
      });
      const data = await response.json();
      setUsageInfo(data);
    } catch (error) {
      console.error('Error checking usage limits:', error);
    }
  }, [user?.email]);

  // Check rate limits and usage when user changes or component mounts
  useEffect(() => {
    if (user?.email) {
      checkRateLimits();
      checkUsageLimits();
      // Check rate limits every 30 seconds to update wait times
      const interval = setInterval(checkRateLimits, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.email, checkRateLimits, checkUsageLimits]);

  // Handle keywords input with real-time limit to 10 keywords
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    const commaCount = (inputValue.match(/,/g) || []).length;
    
    // Allow up to 9 commas (which means 10 keywords)
    if (commaCount <= 9) {
      setKeywords(inputValue);
    }
    // If we're at the limit and user is trying to add more, prevent it
    // unless they're deleting (inputValue is shorter than current)
    else if (inputValue.length < keywords.length) {
      setKeywords(inputValue);
    }
  };

  // Handle website information extraction
  const handleExtractWebsiteInfo = async () => {
    if (!websiteUrlForExtraction.trim()) return;
    
    // Check if user is logged in
    if (!user?.email) {
      setError('Please log in to use website analysis');
      return;
    }

    // Check rate limit first
    if (!analyzeWebsiteRateLimit.canUse) {
      setError(`You're doing that too frequently. Try again in ${analyzeWebsiteRateLimit.waitMinutes} minute${analyzeWebsiteRateLimit.waitMinutes !== 1 ? 's' : ''}.`);
      return;
    }

    // Check usage limits
    if (usageInfo && !usageInfo.canUse) {
      setError(`Daily limit reached. You've used ${usageInfo.usageCount}/${usageInfo.maxUsage} free analytics today. Please upgrade for unlimited access.`);
      return;
    }

    setIsExtractingInfo(true);
    setError(null);

    try {
      // Add https:// if no protocol is present
      let normalizedUrl = websiteUrlForExtraction.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const response = await fetch('/api/extract-website-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const extractedData = await response.json();
      setExtractedInfo(extractedData);
      
      // Refresh rate limits after successful request
      await checkRateLimits();
      
    } catch (error) {
      console.error('Error extracting website info:', error);
      setError(error instanceof Error ? error.message : 'Failed to extract website information. Please try again.');
    } finally {
      setIsExtractingInfo(false);
    }
  };

  // Handle using the extracted information
  const handleUseExtractedInfo = () => {
    if (!extractedInfo) return;
    
    // Populate the form fields with extracted information
    setBusinessName(extractedInfo.businessName);
    setIndustry(extractedInfo.industry);
    setLocation(extractedInfo.location || '');
    setWebsiteUrl(websiteUrlForExtraction);
    setBusinessDescription(extractedInfo.businessDescription);
    setKeywords(extractedInfo.keywords.join(', '));
    
    // Switch to manual workflow to show the populated fields
    setWorkflowType('manual');
    setExtractedInfo(null);
  };

  const handleGeneratePrompts = async () => {
    if (!businessName.trim() || !industry.trim() || !businessDescription.trim() || !keywords.trim()) return;

    // Check if user is logged in
    if (!user?.email) {
      setError('Please log in to generate prompts');
      return;
    }

    // Check rate limit first
    if (!generatePromptsRateLimit.canUse) {
      setError(`You're doing that too frequently. Try again in ${generatePromptsRateLimit.waitMinutes} minute${generatePromptsRateLimit.waitMinutes !== 1 ? 's' : ''}.`);
      return;
    }

    // Check usage limits
    if (usageInfo && !usageInfo.canUse) {
      setError(`Daily limit reached. You've used ${usageInfo.usageCount}/${usageInfo.maxUsage} free analytics today. Please upgrade for unlimited access.`);
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep('🧠 Generating optimized prompts...');
    setProgress(30);

    try {
      const response = await fetch('/api/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          businessName,
          industry,
          location: location.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          marketDescription: businessDescription,
          keywords: parseKeywords(keywords)
        }),
      });

      const data = await response.json();
      setGeneratedPrompts(data.prompts);
      setEditablePrompts([...data.prompts]);
      setCurrentPromptIndex(0);
      setShowPromptEditor(true);
      setActiveTab('prompts');
      setIsAnalyzing(false);
      setCurrentStep('');
      setProgress(0);
      
      // Refresh rate limits after successful request
      await checkRateLimits();
    } catch (error) {
      console.error('Error generating prompts:', error);
      setError('Failed to generate prompts. Please try again.');
      setIsAnalyzing(false);
      setCurrentStep('');
      setProgress(0);
    }
  };

  const handleAnalyze = async () => {
    // Create business first if needed
    let targetBusinessId = businessId;
    
    if (!businessId) {
      try {
        const createResponse = await fetch('/api/dashboard/create-business', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            websiteName: businessName.trim(),
            websiteUrl: websiteUrl.trim() || null,
            industry: industry.trim() || null,
            location: location.trim() || null,
            description: businessDescription.trim(),
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || 'Failed to create business');
        }

        const { business } = await createResponse.json();
        targetBusinessId = business.id;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create business');
        return;
      }
    }

    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStep('🎪 The robots are getting excited...');

    // Fun, non-specific loading messages
    const funMessages = [
      '🎪 The robots are getting excited...',
      '🎨 AI artists painting your digital portrait...',
      '🚀 Launching queries into cyberspace...',
      '🎯 Playing hide and seek with your business...',
      '🧬 Mixing magical algorithms...',
      '🎭 AI agents putting on a show...',
      '🌟 Sprinkling some digital fairy dust...',
      '🎵 Humming while they work...',
      '🎲 Rolling the cyber dice...',
      '🎊 Almost ready to party...'
    ];

    let messageIndex = 0;
    const messageInterval: NodeJS.Timeout = setInterval(() => {
      messageIndex = (messageIndex + 1) % funMessages.length;
      setCurrentStep(funMessages[messageIndex]);
    }, 5000);

    try {
      const startTime = Date.now();

      let currentProgress = 0;
      const estimationInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        let estimatedDuration;
        if (elapsed < 5000) {
          estimatedDuration = 50000;
          currentProgress = (elapsed / estimatedDuration) * 15;
        } else if (elapsed < 50000) {
          estimatedDuration = 50000;
          currentProgress = 15 + ((elapsed - 5000) / 15000) * 60;
        } else {
          estimatedDuration = 50000;
          currentProgress = 75 + ((elapsed - 20000) / 15000) * 15;
        }

        const clampedProgress = Math.min(85, Math.max(currentProgress, 0));
        setProgress(clampedProgress);
      }, 1000);

      const response = await fetch('/api/aeo-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          businessName,
          businessId: businessId,
          industry,
          location: location.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          marketDescription: businessDescription,
          keywords: parseKeywords(keywords),
          providers: aiProviders,
          customPrompts: editablePrompts,
          businessId: targetBusinessId
        }),
      });

      clearInterval(estimationInterval);
      clearInterval(messageInterval);

      setProgress(90);
      setCurrentStep('🎉 Wrapping up the magic...');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      setTimeout(() => {
        setProgress(100);
        setCurrentStep('✨ Ta-da! Your rankings are ready!');

        setTimeout(() => {
          setResults(data.results);
          setOverallCompetitors(data.overallCompetitorAnalysis || []);
          setIsAnalyzing(false);
          setCurrentStep('');
          setProgress(0);
          checkUsageLimits();
          
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }, 300);
        }, 1000);
      }, 500);

    } catch (error) {
      if (messageInterval) clearInterval(messageInterval);
      console.error('Error analyzing AEO scores:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze AEO scores. Please try again.');
      setIsAnalyzing(false);
      setCurrentStep('');
      setProgress(0);
    }
  };

  const handleAnalyzeExisting = () => {
    if (!businessId) {
      setError('No business selected');
      return;
    }

    // Redirect to AEO score page with just the business ID
    router.push(`/aeo-score?businessId=${businessId}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Execute AEO Analysis</h2>
        <p className="text-gray-400 mt-1">
          {businessId 
            ? "Run a new AEO analysis for this business or create a new business"
            : "Create a new business and run your first AEO analysis"
          }
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-200 font-medium">Error</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-red-100 text-sm mt-2">{error}</p>
        </div>
      )}

      {/* Existing Business Analysis */}
      {businessId && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-300 mb-2">Analyze Current Business</h3>
          <p className="text-blue-200 mb-4">
            Run a new AEO analysis for the currently selected business using its existing information.
          </p>
          <button
            onClick={handleAnalyzeExisting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🔍 Run AEO Analysis
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('input')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === 'input'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`}
            >
              1. Business Information
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              disabled={!showPromptEditor}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === 'prompts'
                ? 'border-blue-500 text-blue-400'
                : showPromptEditor
                  ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                  : 'border-transparent text-gray-600 cursor-not-allowed'
                }`}
            >
              2. Review & Edit Prompts
              {showPromptEditor && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Ready
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'input' && (
            <div className="space-y-6">
              {/* Workflow Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Choose Your Workflow</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setWorkflowType('website')}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all text-left ${
                      workflowType === 'website'
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                        🌐
                      </div>
                      <span className="font-semibold text-white">Website Auto Fill</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium ml-2">AI-Powered</span>
                    </div>
                    <p className="text-sm text-gray-300">Just enter your website URL and let AI extract all business information automatically.</p>
                  </button>
                  
                  <button
                    onClick={() => setWorkflowType('manual')}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all text-left ${
                      workflowType === 'manual'
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                        ✏️
                      </div>
                      <span className="font-semibold text-white">Manual Entry</span>
                    </div>
                    <p className="text-sm text-gray-300">Enter your business details manually for complete control over the information.</p>
                  </button>
                </div>
              </div>

              {/* Website Analysis Workflow */}
              {workflowType === 'website' && (
                <div>
                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-600/30">
                    <h4 className="text-lg font-semibold text-white mb-4">🧠 AI Auto Fill</h4>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-white mb-2">Website URL</label>
                      <input
                        type="url"
                        value={websiteUrlForExtraction}
                        onChange={(e) => setWebsiteUrlForExtraction(e.target.value)}
                        placeholder="Enter your website URL (e.g., https://yoursite.com)"
                        className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                      />
                      <div className="mt-2 text-sm text-gray-300">
                        <strong>AI will extract:</strong> Business name, industry, location, description, and SEO keywords automatically
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <button
                        onClick={handleExtractWebsiteInfo}
                        disabled={isExtractingInfo || !websiteUrlForExtraction.trim() || !user || !usageInfo || (usageInfo && !usageInfo.canUse) || !analyzeWebsiteRateLimit.canUse}
                        className="bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExtractingInfo ? (
                          <span className="flex items-center space-x-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Analyzing Website...</span>
                          </span>
                        ) : (
                          '🔍 Analyze Website'
                        )}
                      </button>
                      
                      {/* Rate limit error message */}
                      {!analyzeWebsiteRateLimit.canUse && user?.email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-red-400">
                            Too frequent. Try again in {analyzeWebsiteRateLimit.waitMinutes} minute{analyzeWebsiteRateLimit.waitMinutes !== 1 ? 's' : ''}.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Display extracted information */}
                  {extractedInfo && (
                    <div className="mt-6 bg-green-900/30 rounded-lg p-6 border border-green-600/30">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">✅ Extracted Information</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-300">Confidence:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            extractedInfo.confidence >= 80 ? 'bg-green-100 text-green-800' :
                            extractedInfo.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {extractedInfo.confidence}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-green-200 mb-1">Business Name</label>
                          <div className="bg-gray-800 p-3 rounded border border-gray-600 text-white">{extractedInfo.businessName}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-200 mb-1">Industry</label>
                          <div className="bg-gray-800 p-3 rounded border border-gray-600 text-white">{extractedInfo.industry}</div>
                        </div>
                        {extractedInfo.location && (
                          <div>
                            <label className="block text-sm font-medium text-green-200 mb-1">Location</label>
                            <div className="bg-gray-800 p-3 rounded border border-gray-600 text-white">{extractedInfo.location}</div>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-green-200 mb-1">Keywords ({extractedInfo.keywords.length})</label>
                          <div className="bg-gray-800 p-3 rounded border border-gray-600 text-white">{extractedInfo.keywords.join(', ')}</div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-1">Business Description</label>
                        <div className="bg-gray-800 p-3 rounded border border-gray-600 text-white">{extractedInfo.businessDescription}</div>
                      </div>
                      
                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={handleUseExtractedInfo}
                          className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                          ✅ Use This Information
                        </button>
                        <button
                          onClick={() => setExtractedInfo(null)}
                          className="cursor-pointer bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                        >
                          🔄 Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Manual Entry Workflow */}
              {workflowType === 'manual' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Business Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Enter your business name (e.g., 'Acme Corp', 'Rankly')"
                        className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Industry</label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="Enter your industry (e.g., 'SaaS', 'E-commerce', 'Healthcare')"
                        className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Location (Optional)</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter your location (e.g., 'San Francisco, CA', 'New York')"
                        className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Website URL (Optional)</label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="Enter your website URL (e.g., https://yoursite.com)"
                        className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Business Description</label>
                    <textarea
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      rows={4}
                      placeholder="Describe your business, products, or services. Be specific about what makes your business unique and who your target customers are."
                      className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Keywords (Up to 10)</label>
                    <textarea
                      value={keywords}
                      onChange={handleKeywordsChange}
                      rows={3}
                      placeholder="Enter relevant keywords separated by commas (e.g., SEO, digital marketing, analytics, automation)"
                      className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-400">
                        These keywords help generate more targeted and relevant prompts for testing.
                      </p>
                      <span className="text-xs text-gray-500">
                        {parseKeywords(keywords).length}/10 keywords
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <button
                      onClick={handleGeneratePrompts}
                      disabled={isAnalyzing || !businessName.trim() || !industry.trim() || !businessDescription.trim() || !keywords.trim() || !user || !usageInfo || (usageInfo && !usageInfo.canUse) || !generatePromptsRateLimit.canUse}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Generating Prompts...
                        </span>
                      ) : (
                        <span>
                          🧠 Generate AI Prompts
                        </span>
                      )}
                    </button>
                    
                    {/* Rate limit error message */}
                    {!generatePromptsRateLimit.canUse && user?.email && (
                      <div className="flex items-center justify-center space-x-2 text-sm mt-2">
                        <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-400">
                          Too frequent. Try again in {generatePromptsRateLimit.waitMinutes} minute{generatePromptsRateLimit.waitMinutes !== 1 ? 's' : ''}.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prompts' && showPromptEditor && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Review & Edit Generated Prompts</h3>
                <div className="text-sm text-gray-400">
                  {currentPromptIndex + 1} of {editablePrompts.length} prompts
                </div>
              </div>

              {editablePrompts.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Prompt {currentPromptIndex + 1}
                    </label>
                    <textarea
                      value={editablePrompts[currentPromptIndex] || ''}
                      onChange={(e) => {
                        const newPrompts = [...editablePrompts];
                        newPrompts[currentPromptIndex] = e.target.value;
                        setEditablePrompts(newPrompts);
                      }}
                      rows={4}
                      className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPromptIndex(Math.max(0, currentPromptIndex - 1))}
                        disabled={currentPromptIndex === 0}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setCurrentPromptIndex(Math.min(editablePrompts.length - 1, currentPromptIndex + 1))}
                        disabled={currentPromptIndex === editablePrompts.length - 1}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                    
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !user || !usageInfo || (usageInfo && !usageInfo.canUse)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Analyzing...
                        </span>
                      ) : (
                        '🚀 Start AEO Analysis'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-center">
            <div className="mb-4">
              <div className="text-2xl mb-2">{currentStep}</div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400 mt-2">{Math.round(progress)}% complete</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div ref={resultsRef} className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-white mb-6">AEO Analysis Results</h3>
            
            {results.map((result, index) => (
              <div key={index} className="mb-8 last:mb-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${result.provider.color}`}>
                      {result.provider.name}
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className={`text-2xl font-bold ${getScoreColor(result.aeoScore)}`}>
                      {result.aeoScore}/100
                    </span>
                    <span className={`text-sm ${getScoreColor(result.aeoScore)}`}>
                      {getScoreLabel(result.aeoScore)}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Analysis Summary</h4>
                  <p className="text-gray-300 text-sm">{result.analysis}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-2">About AEO Analysis</h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            <strong className="text-gray-300">AEO (AI Engine Optimization)</strong> analyzes your business visibility across multiple AI search engines including ChatGPT, Claude, and Perplexity.
          </p>
          <p>
            The analysis will generate targeted prompts, test them across AI platforms, and provide a comprehensive ranking score based on:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Position ranking across AI responses (50% weight)</li>
            <li>Visibility across different query types (30% weight)</li>
            <li>Word count and relevance in responses (20% weight)</li>
          </ul>
          <p>
            Results are automatically saved to your dashboard for tracking trends over time.
          </p>
        </div>
      </div>
    </div>
  );
}