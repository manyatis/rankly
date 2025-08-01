import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import WebsiteEntryStep from './execute-steps/WebsiteEntryStep';
import BusinessInfoStep from './execute-steps/BusinessInfoStep';
import PromptReviewStep from './execute-steps/PromptReviewStep';
import ResultsStep from './execute-steps/ResultsStep';

interface ExecuteTabProps {
  businessId: number | null;
  onBusinessCreated?: () => void;
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
    .slice(0, 10);
}

export default function ExecuteTab({ businessId, onBusinessCreated }: ExecuteTabProps) {
  // const router = useRouter();
  const { user } = useAuth();
  
  // Form data states
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  
  // Step workflow states - start at business-info if business is selected, otherwise website-entry
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState<'website-entry' | 'business-info' | 'prompt-review' | 'results'>(
    businessId ? 'business-info' : 'website-entry'
  );
  const [websiteUrlForExtraction, setWebsiteUrlForExtraction] = useState('');
  const [isExtractingInfo, setIsExtractingInfo] = useState(false);
  // const [extractedInfo, setExtractedInfo] = useState<{
  //   businessName: string;
  //   industry: string;
  //   location?: string;
  //   businessDescription: string;
  //   keywords: string[];
  //   confidence: number;
  // } | null>(null);
  
  // Transition states
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ScoringResult[]>([]);
  const [overallCompetitors, setOverallCompetitors] = useState<CompetitorInfo[]>([]);
  // const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  // const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [editablePrompts, setEditablePrompts] = useState<string[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  // Query index states for each result
  const [queryIndexes, setQueryIndexes] = useState<{[key: number]: number}>({});
  
  // Error and usage states
  const [error, setError] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<{ canUse: boolean; usageCount: number; maxUsage: number | string; tier: string } | null>(null);
  
  // Loading states
  const [isLoadingBusinessInfo, setIsLoadingBusinessInfo] = useState(false);
  
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
    { name: 'Google', model: '', color: 'bg-blue-100 text-blue-800' },
  ];

  // Check rate limits using consolidated endpoint
  const checkRateLimits = useCallback(async () => {
    if (!user?.email) return;

    try {
      const [analyzeResponse, generateResponse] = await Promise.all([
        fetch('/api/usage-check?action=analyzeWebsite', { credentials: 'include' }),
        fetch('/api/usage-check?action=generatePrompts', { credentials: 'include' })
      ]);

      if (analyzeResponse.ok) {
        const analyzeData = await analyzeResponse.json();
        setAnalyzeWebsiteRateLimit({
          canUse: analyzeData.rateLimit?.canUse ?? true,
          waitMinutes: analyzeData.rateLimit?.waitMinutes || 0
        });
      }

      if (generateResponse.ok) {
        const generateData = await generateResponse.json();
        setGeneratePromptsRateLimit({
          canUse: generateData.rateLimit?.canUse ?? true,
          waitMinutes: generateData.rateLimit?.waitMinutes || 0
        });
      }
    } catch (error) {
      console.error('Error checking rate limits:', error);
    }
  }, [user?.email]);

  const checkUsageLimits = useCallback(async () => {
    if (!user?.email) return;

    try {
      const response = await fetch('/api/usage-check?checkWebsiteLimit=true', {
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
      const interval = setInterval(checkRateLimits, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.email, checkRateLimits, checkUsageLimits]);

  // Load business information if businessId is provided
  useEffect(() => {
    if (businessId) {
      const fetchBusinessInfo = async () => {
        setIsLoadingBusinessInfo(true);
        try {
          const response = await fetch(`/api/dashboard/business/${businessId}`);
          if (response.ok) {
            const data = await response.json();
            const business = data.business;
            setBusinessName(business.websiteName || '');
            setIndustry(business.industry || '');
            setLocation(business.location || '');
            setWebsiteUrl(business.websiteUrl || '');
            setBusinessDescription(business.description || '');
            // Load recent keywords if available
            if (business.recentKeywords && business.recentKeywords.length > 0) {
              setKeywords(business.recentKeywords.join(', '));
            }
          }
        } catch (error) {
          console.error('Error fetching business info:', error);
          setError('Failed to load business information. Please try again.');
        } finally {
          setIsLoadingBusinessInfo(false);
        }
      };
      fetchBusinessInfo();
    }
  }, [businessId]);

  // Handle keywords input with real-time limit to 10 keywords
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    const commaCount = (inputValue.match(/,/g) || []).length;
    
    if (commaCount <= 9) {
      setKeywords(inputValue);
    } else if (inputValue.length < keywords.length) {
      setKeywords(inputValue);
    }
  };

  // Smooth transition between steps
  const transitionToStep = (nextStep: typeof currentWorkflowStep) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentWorkflowStep(nextStep);
      setIsTransitioning(false);
    }, 100);
  };

  // Handle website information extraction
  const handleExtractWebsiteInfo = async () => {
    if (!websiteUrlForExtraction.trim()) return;
    
    if (!user?.email) {
      setError('Please log in to use website analysis');
      return;
    }

    if (!analyzeWebsiteRateLimit.canUse) {
      setError(`You're doing that too frequently. Try again in ${analyzeWebsiteRateLimit.waitMinutes} minute${analyzeWebsiteRateLimit.waitMinutes !== 1 ? 's' : ''}.`);
      return;
    }

    if (usageInfo && !usageInfo.canUse) {
      setError(`Daily limit reached. You've used ${usageInfo.usageCount}/${usageInfo.maxUsage} free analytics today. Please upgrade for unlimited access.`);
      return;
    }

    setIsExtractingInfo(true);
    setError(null);

    try {
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
      // setExtractedInfo(extractedData);
      
      setBusinessName(extractedData.businessName);
      setIndustry(extractedData.industry);
      setLocation(extractedData.location || '');
      setWebsiteUrl(normalizedUrl);
      setBusinessDescription(extractedData.businessDescription);
      setKeywords(extractedData.keywords.join(', '));
      
      await checkRateLimits();
      transitionToStep('business-info');
      
    } catch (error) {
      console.error('Error extracting website info:', error);
      setError(error instanceof Error ? error.message : 'Failed to extract website information. Please try again.');
    } finally {
      setIsExtractingInfo(false);
    }
  };

  const handleGeneratePrompts = async () => {
    if (!businessName.trim() || !industry.trim() || !businessDescription.trim() || !keywords.trim()) return;

    if (!user?.email) {
      setError('Please log in to generate prompts');
      return;
    }

    if (!generatePromptsRateLimit.canUse) {
      setError(`You're doing that too frequently. Try again in ${generatePromptsRateLimit.waitMinutes} minute${generatePromptsRateLimit.waitMinutes !== 1 ? 's' : ''}.`);
      return;
    }

    if (usageInfo && !usageInfo.canUse) {
      setError(`Daily limit reached. You've used ${usageInfo.usageCount}/${usageInfo.maxUsage} free analytics today. Please upgrade for unlimited access.`);
      return;
    }

    setIsAnalyzing(true);
    // setCurrentStep('🧠 Generating optimized prompts...');
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
      // setGeneratedPrompts(data.prompts);
      setEditablePrompts([...data.prompts]);
      setCurrentPromptIndex(0);
      setIsAnalyzing(false);
      // setCurrentStep('');
      setProgress(0);
      
      await checkRateLimits();
      transitionToStep('prompt-review');
    } catch (error) {
      console.error('Error generating prompts:', error);
      setError('Failed to generate prompts. Please try again.');
      setIsAnalyzing(false);
      // setCurrentStep('');
      setProgress(0);
    }
  };

  const handleAnalyze = async () => {
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
        
        // Trigger dashboard refresh after business creation
        onBusinessCreated?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create business');
        return;
      }
    }

    setIsAnalyzing(true);
    setProgress(0);
    // setCurrentStep('🎪 The robots are getting excited...');

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
      // setCurrentStep(funMessages[messageIndex]);
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
          businessId: targetBusinessId,
          industry,
          location: location.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          marketDescription: businessDescription,
          keywords: parseKeywords(keywords),
          providers: aiProviders,
          customPrompts: editablePrompts
        }),
      });

      clearInterval(estimationInterval);
      clearInterval(messageInterval);

      setProgress(90);
      // setCurrentStep('🎉 Wrapping up the magic...');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      setTimeout(() => {
        setProgress(100);
        // setCurrentStep('✨ Ta-da! Your rankings are ready!');

        setTimeout(() => {
          setResults(data.results);
          setOverallCompetitors(data.overallCompetitorAnalysis || []);
          setIsAnalyzing(false);
          // setCurrentStep('');
          setProgress(0);
          checkUsageLimits();
          
          transitionToStep('results');
          
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
      // setCurrentStep('');
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Manual Analysis</h2>
        <p className="text-gray-400 mt-1">
          {businessId 
            ? "Run a new AEO analysis for this business"
            : "Create a new business and run your first analysis"
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

      {/* Step-based Workflow Content */}
      <div className={`bg-gray-800 border border-gray-700 rounded-lg transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
        {/* Step 1: Website Entry */}
        {currentWorkflowStep === 'website-entry' && (
          <WebsiteEntryStep
            websiteUrlForExtraction={websiteUrlForExtraction}
            setWebsiteUrlForExtraction={setWebsiteUrlForExtraction}
            isExtractingInfo={isExtractingInfo}
            handleExtractWebsiteInfo={handleExtractWebsiteInfo}
            user={user}
            usageInfo={usageInfo}
            analyzeWebsiteRateLimit={analyzeWebsiteRateLimit}
          />
        )}

        {/* Step 2: Business Info Confirmation */}
        {currentWorkflowStep === 'business-info' && (
          <BusinessInfoStep
            businessName={businessName}
            setBusinessName={setBusinessName}
            industry={industry}
            setIndustry={setIndustry}
            location={location}
            setLocation={setLocation}
            websiteUrl={websiteUrl}
            setWebsiteUrl={setWebsiteUrl}
            businessDescription={businessDescription}
            setBusinessDescription={setBusinessDescription}
            keywords={keywords}
            handleKeywordsChange={handleKeywordsChange}
            parseKeywords={parseKeywords}
            handleGeneratePrompts={handleGeneratePrompts}
            isAnalyzing={isAnalyzing}
            user={user}
            usageInfo={usageInfo}
            generatePromptsRateLimit={generatePromptsRateLimit}
            businessId={businessId}
            isLoadingBusinessInfo={isLoadingBusinessInfo}
          />
        )}

        {/* Step 3: Prompt Review */}
        {currentWorkflowStep === 'prompt-review' && (
          <PromptReviewStep
            editablePrompts={editablePrompts}
            setEditablePrompts={setEditablePrompts}
            currentPromptIndex={currentPromptIndex}
            setCurrentPromptIndex={setCurrentPromptIndex}
            handleAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            progress={progress}
            user={user}
            usageInfo={usageInfo}
          />
        )}

        {/* Step 4: Results */}
        {currentWorkflowStep === 'results' && results.length > 0 && (
          <div ref={resultsRef}>
            <ResultsStep
              results={results}
              overallCompetitors={overallCompetitors}
              queryIndexes={queryIndexes}
              setQueryIndexes={setQueryIndexes}
            />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-2">About AEO Analysis</h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            <strong className="text-gray-300">AEO (Answers Engine Optimization)</strong> analyzes your business visibility across multiple AI search engines including ChatGPT, Claude, Perplexity, and Google.
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