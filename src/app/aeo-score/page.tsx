'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';

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

interface AnalysisRecommendation {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'quick' | 'moderate' | 'significant';
  impact: 'high' | 'medium' | 'low';
}

interface WebsiteAnalysisResult {
  url: string;
  title: string;
  contentAnalysis: {
    wordCount: number;
    hasStructuredData: boolean;
    headingStructure: string[];
    authoritySignals: string[];
    citationCount: number;
  };
  aeoOptimization: {
    currentScore: number;
    strengths: string[];
    weaknesses: string[];
  };
  recommendations: AnalysisRecommendation[];
  summary: string;
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

export default function AEOScorePage() {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ScoringResult[]>([]);
  const [, setOverallCompetitors] = useState<CompetitorInfo[]>([]);
  const [websiteAnalysis, setWebsiteAnalysis] = useState<WebsiteAnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{ canUse: boolean; usageCount: number; maxUsage: number | string; tier: string } | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [editablePrompts, setEditablePrompts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'prompts'>('input');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
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

  const { user } = useAuth();

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

  // Check rate limits when user changes or component mounts
  useEffect(() => {
    if (user?.email) {
      checkRateLimits();
      // Check rate limits every 30 seconds to update wait times
      const interval = setInterval(checkRateLimits, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.email, checkRateLimits]);

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
      setLoginModalOpen(true);
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

  const handleLogin = () => {
    setLoginModalOpen(false);
  };
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

  // Check usage limits when user changes
  useEffect(() => {
    if (user?.email) {
      checkUsageLimits();
    } else {
      setUsageInfo(null);
    }
  }, [user?.email, checkUsageLimits]);


  const aiProviders: AIProvider[] = [
    { name: 'OpenAI', model: '', color: 'bg-green-100 text-green-800' },
    { name: 'Claude', model: '', color: 'bg-orange-100 text-orange-800' },
    { name: 'Perplexity', model: '', color: 'bg-blue-100 text-blue-800' },
    { name: 'Google', model: '', color: 'bg-blue-100 text-blue-800' },
  ];


  const handleGeneratePrompts = async () => {
    if (!businessName.trim() || !industry.trim() || !businessDescription.trim() || !keywords.trim()) return;

    // Check if user is logged in
    if (!user?.email) {
      setLoginModalOpen(true);
      return;
    }

    // Check rate limit first
    if (!generatePromptsRateLimit.canUse) {
      setError(`You're doing that too frequently. Try again in ${generatePromptsRateLimit.waitMinutes} minute${generatePromptsRateLimit.waitMinutes !== 1 ? 's' : ''}.`);
      return;
    }

    // Check usage limits
    if (usageInfo && !usageInfo.canUse) {
      alert(`Daily limit reached. You've used ${usageInfo.usageCount}/${usageInfo.maxUsage} free analytics today. Please upgrade for unlimited access.`);
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
          location: location.trim() || undefined, // Include location if specified
          websiteUrl: websiteUrl.trim() || undefined, // Include website URL if specified
          marketDescription: businessDescription, // Map businessDescription to marketDescription
          keywords: parseKeywords(keywords) // Parse user-provided keywords
        }),
      });

      const data = await response.json();
      setGeneratedPrompts(data.prompts);
      setEditablePrompts([...data.prompts]);
      setCurrentPromptIndex(0); // Reset to first prompt
      setShowPromptEditor(true);
      setActiveTab('prompts'); // Switch to prompts tab
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
    }, 5000); // Change message every 3 seconds

    // Calculate total operations: 1 provider × 5 queries each = 5 total operations
    // const totalProviders = aiProviders.length;
    // const queriesPerProvider = 5; // This should match MAX_QUERIES from backend
    // const totalOperations = totalProviders * queriesPerProvider;

    // Message rotation is set up above

    try {
      const startTime = Date.now();

      // More realistic time-based progress with better estimates
      let currentProgress = 0;
      const estimationInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        // More realistic estimates based on actual AI API call timing
        // Each query takes about 2-4 seconds, we have 2 providers × 5 queries = 10 total
        // So estimate 20-40 seconds total
        let estimatedDuration;
        if (elapsed < 5000) {
          // First 5 seconds: slow ramp up
          estimatedDuration = 50000;
          currentProgress = (elapsed / estimatedDuration) * 15; // First 15% in 5 seconds
        } else if (elapsed < 50000) {
          // 5-20 seconds: main processing
          estimatedDuration = 50000;
          currentProgress = 15 + ((elapsed - 5000) / 15000) * 60; // Next 60% over 15 seconds
        } else {
          // 20+ seconds: final phase
          estimatedDuration = 50000;
          currentProgress = 75 + ((elapsed - 20000) / 15000) * 15; // Final 15% slowly
        }

        const clampedProgress = Math.min(85, Math.max(currentProgress, 0));
        setProgress(clampedProgress);

        // Update message based on time elapsed and progress
        if (elapsed < 8000) {
          setCurrentStep(funMessages[Math.floor(Math.random() * 3)]); // Early messages
        } else if (elapsed < 20000) {
          setCurrentStep(funMessages[Math.floor(Math.random() * 4) + 3]); // Middle messages
        } else {
          setCurrentStep(funMessages[Math.floor(Math.random() * 3) + 7]); // Late messages
        }
      }, 1000); // Update every second

      const response = await fetch('/api/aeo-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          businessName,
          industry,
          location: location.trim() || undefined, // Include location if specified
          websiteUrl: websiteUrl.trim() || undefined, // Include website URL if specified
          marketDescription: businessDescription, // Map businessDescription to marketDescription
          keywords: parseKeywords(keywords), // Parse user-provided keywords
          providers: aiProviders,
          customPrompts: editablePrompts
        }),
      });

      const duration = Date.now() - startTime;
      console.debug(`API call took ${duration}ms`);

      // Clear intervals
      clearInterval(estimationInterval);
      clearInterval(messageInterval);

      // Final steps
      setProgress(90);
      setCurrentStep('🎉 Wrapping up the magic...');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Complete the progress
      setTimeout(() => {
        setProgress(100);
        setCurrentStep('✨ Ta-da! Your rankings are ready!');

        // Show results after brief celebration
        setTimeout(() => {
          setResults(data.results);
          setOverallCompetitors(data.overallCompetitorAnalysis || []);
          setWebsiteAnalysis(data.websiteAnalysis || null);
          setIsAnalyzing(false);
          setCurrentStep('');
          setProgress(0);
          // Refresh usage info after successful analysis
          checkUsageLimits();
          
          // Scroll to results section after a short delay
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-gray-900" style={{ fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">

            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 mt-6 max-w-4xl mx-auto border border-gray-600">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-300 font-semibold">Multi-Agentic AI Analysis</span>
              </div>
              <p className="text-sm text-blue-200 text-center">
                Our AI agents automatically analyze your rankings across all major AI engines and generate 
                actionable recommendations - perfect for professional reports and DIY optimization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border-b border-red-700">
          <div className="max-w-4xl mx-auto px-6 py-4">
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
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
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
      </div>

      {/* Tab Content */}
      {activeTab === 'input' && (
        <div className="bg-gray-900 ">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-gray-800 rounded-lg p-8">
              
              {/* Workflow Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Choose Your Workflow</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setWorkflowType('website')}
                    className={`cursor-pointer  p-4 rounded-lg border-2 transition-all text-left ${
                      workflowType === 'website'
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center mb-2" >
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                        🌐
                      </div>
                      <span className="font-semibold text-white ">Website Auto Fill</span>
                      <div className="flex items-center space-x-2">
                        <span></span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">AI-Powered</span>
                        <div className="relative group">
                          {/* <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium cursor-help">
                            Indie+
                          </span> */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-600">
                            This AI-powered feature will be exclusive to Indie+ subscribers. Currently free during preview period!
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">Just enter your website URL and let AI extract all business information automatically.</p>
                  </button>
                  
                  <button
                    onClick={() => setWorkflowType('manual')}
                    className={`cursor-pointer  p-4 rounded-lg border-2 transition-all text-left ${
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
                <div className="mb-8">
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
                <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name (e.g., 'Acme Corp', 'Rankly')"
                  className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Enter your industry (e.g., 'Software Development', 'Healthcare', 'E-commerce', 'Marketing')"
                  className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                />
                <div className="mt-2 text-sm text-gray-300">
                  <strong>Examples:</strong> Software Development, Healthcare, E-commerce, Marketing, Finance, Education, Real Estate
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="Enter your website URL (e.g., 'https://www.yoursite.com')"
                  className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                />
                <div className="mt-2 text-sm text-gray-300">
                  <strong>Include your website:</strong> This will be used for future analysis and optimization recommendations
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Location (Optional)
                  <div className="inline-block ml-2 relative group">
                    <span className="text-xs text-gray-300 cursor-help">
                      💡
                    </span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-600">
                      If specified, this location will be included in the analysis prompts to provide more targeted results. Leave blank for general analysis.
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
                    </div>
                  </div>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your location (e.g., 'New York', 'San Francisco Bay Area', 'London, UK')"
                  className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                />
                <div className="mt-2 text-sm text-gray-300">
                  <strong>Optional:</strong> City, region, or country to include in prompts for location-specific analysis
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Business Description, How Customers Find You</label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Describe your business, target market, and how customers will find you. For example: 'We help small businesses with digital marketing optimization. Our customers are marketing agencies and SMB owners who want to improve their search visibility across traditional and AI-powered search engines.'"
                  className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32 resize-none placeholder-gray-400"
                />
                <div className="mt-2 text-sm text-gray-300">
                  <strong>Include:</strong> What your business does, target customers, and main problems you solve.
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">SEO Keywords</label>
                <textarea
                  value={keywords}
                  onChange={handleKeywordsChange}
                  placeholder="Enter your primary SEO keywords/phrases, separated by commas. For example: SEO optimization, search marketing, digital visibility tools, AI search engines, marketing analytics"
                  className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 resize-none placeholder-gray-400"
                />
                <div className="mt-2 text-sm text-gray-300">
                  <strong>Separate with commas:</strong> Your primary SEO keywords and phrases for comprehensive search optimization. 
                  <span className={`font-medium ${(keywords.match(/,/g) || []).length >= 9 ? 'text-red-400' : 'text-green-400'}`}>
                    {Math.min((keywords.match(/,/g) || []).length + (keywords.trim() ? 1 : 0), 10)}/10 keywords
                  </span>
                </div>
              </div>
              </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-300">
                  {!user ? (
                    <span className="text-red-400 font-medium">⚠️ Login required</span>
                  ) : usageInfo && !usageInfo.canUse ? (
                    <span className="text-red-400 font-medium">❌ Daily limit reached ({usageInfo.usageCount}/{usageInfo.maxUsage})</span>
                  ) : usageInfo && usageInfo.maxUsage === 'unlimited' ? (
                    <span className="text-blue-400 font-medium">🚀 Unlimited usage ({usageInfo.tier} plan)</span>
                  ) : usageInfo ? (
                    <span className="text-green-400 font-medium">✅ {typeof usageInfo.maxUsage === 'number' ? usageInfo.maxUsage - usageInfo.usageCount : 'unlimited'} uses remaining today</span>
                  ) : businessName.trim() && industry.trim() && businessDescription.trim() && keywords.trim() ? (
                    <span>All fields ready</span>
                  ) : (
                    <span>Fill in all required fields</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <button
                    onClick={handleGeneratePrompts}
                    disabled={isAnalyzing || !businessName.trim() || !industry.trim() || !businessDescription.trim() || !keywords.trim() || user == null || usageInfo == null || (usageInfo && !usageInfo.canUse) || !generatePromptsRateLimit.canUse}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden cursor-pointer"
                  >
                  {isAnalyzing ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating Prompts...</span>
                    </span>
                  ) : !user ? (
                    'Login to Generate Report'
                  ) : (usageInfo && !usageInfo.canUse) ? (
                    'Daily Limit Reached'
                  ) : (
                    'Generate Report Prompts'
                  )}
                  </button>
                  
                  {/* Rate limit error message */}
                  {!generatePromptsRateLimit.canUse && user?.email && (
                    <div className="flex items-center space-x-2 text-sm sm:mt-1">
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
            </div>
          </div>
        </div>
      )}

      {/* Prompts Tab */}
      {activeTab === 'prompts' && showPromptEditor && (
        <div className="bg-gray-900">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-8 border border-gray-600">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">AI-Generated Report Prompts</h2>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-blue-300 font-medium">✨ Multi-Agentic AI Report Generation</span>
                  </div>
                  <p className="text-sm text-gray-300 text-center">
                    Our AI agents use these prompts alongside proprietary algorithms to generate comprehensive ranking reports 
                    with automated recommendations - perfect for client deliverables.
                  </p>
                </div>
              </div>

              {/* Compact Prompt Editor with Navigation */}
              <div className="mb-8">
                {editablePrompts.length > 0 && (
                  <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-600 overflow-hidden">
                    {/* Header with Navigation */}
                    <div className="relative bg-gradient-to-r from-gray-700 to-gray-600 px-6 py-4 border-b border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-white">Analysis Prompts</h3>
                            <p className="text-sm text-gray-300">AI-optimized queries for maximum accuracy</p>
                          </div>
                        </div>
                        
                        {/* Prompt Navigation */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-300">
                            {currentPromptIndex + 1} of {editablePrompts.length}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setCurrentPromptIndex(Math.max(0, currentPromptIndex - 1))}
                              disabled={currentPromptIndex === 0}
                              className="p-2 rounded bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setCurrentPromptIndex(Math.min(editablePrompts.length - 1, currentPromptIndex + 1))}
                              disabled={currentPromptIndex === editablePrompts.length - 1}
                              className="p-2 rounded bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Prompt Content */}
                    <div className="p-6">
                      <div className="relative">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-white">Prompt {currentPromptIndex + 1}</h4>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${editablePrompts[currentPromptIndex]?.trim() ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            <span className="text-sm text-gray-300">
                              {editablePrompts[currentPromptIndex]?.trim() ? 'Ready for analysis' : 'Prompt required'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-4 max-h-80 overflow-y-auto border border-gray-600">
                          <textarea
                            value={editablePrompts[currentPromptIndex] || ''}
                            onChange={(e) => {
                              const newPrompts = [...editablePrompts];
                              newPrompts[currentPromptIndex] = e.target.value;
                              setEditablePrompts(newPrompts);
                            }}
                            className="w-full h-64 p-4 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all duration-200 leading-relaxed placeholder-gray-400"
                            placeholder="Enter your custom analysis prompt to optimize AI search visibility..."
                          />
                        </div>

                        {/* Character Counter and Actions */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
                          <div className="text-xs text-gray-400">
                            {(editablePrompts[currentPromptIndex] || '').length} characters
                          </div>
                          <button
                            onClick={() => {
                              const newPrompts = [...editablePrompts];
                              newPrompts[currentPromptIndex] = generatedPrompts[currentPromptIndex] || '';
                              setEditablePrompts(newPrompts);
                            }}
                            className="cursor-pointer text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          >
                            Reset to Original
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setActiveTab('input'); // Go back to input tab
                  }}
                  className="cursor-pointer px-6 py-3 border border-gray-600 text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  ← Back to Business Info
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !user || !usageInfo || (usageInfo && !usageInfo.canUse)}
                  className="cursor-pointer bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing...</span>
                    </span>
                  ) : !user ? (
                    'Login to Generate Report'
                  ) : (usageInfo && !usageInfo.canUse) ? (
                    'Daily Limit Reached'
                  ) : (
                    'Generate!'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Section */}
      {isAnalyzing && (
        <div className="bg-gray-900 py-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 text-center border border-gray-600">
              <div className="flex items-center justify-center space-x-4 mb-4">
                {/* Compact Robot Icon */}
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white animate-bounce">
                  🤖
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">Analyzing {businessName}</h3>
                  <p className="text-sm text-gray-300">{currentStep}</p>
                </div>
              </div>

              {/* Compact Progress Bar */}
              <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                </div>
              </div>

              <div className="text-xs text-gray-400">{Math.round(progress)}% complete</div>
            </div>
          </div>
        </div>
      )}


      {/* AI Providers Section */}
      <div className="bg-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">Automated Report Generation Across {aiProviders.length} Major AI Engine{aiProviders.length !== 1 ? 's' : ''}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {aiProviders.map((provider, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4 text-center shadow-sm">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${provider.color}`}>
                  {provider.name}
                </span>
                <div className="text-xs text-gray-400 mt-1">{provider.model}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-300 max-w-3xl mx-auto">
              <strong>Perfect for client reports:</strong> Our AI agents automatically query each engine with optimized prompts 
              and generate professional ranking analysis with actionable recommendations.
              {businessName && (
                <>
                  {' '}We&apos;ll analyze how <strong>{businessName}</strong> ranks across all AI platforms and provide optimization strategies.
                </>
              )}
            </p>
          </div>

          {/* Research Methodology Section */}
          <div className="mt-12 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl p-8">
            <div className="text-center mb-8">
              <h4 className="text-xl font-bold text-white mb-3">
                Automated AI Analysis & Recommendations
              </h4>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Our multi-agentic AI system automatically evaluates 6 key ranking factors and generates specific, 
                actionable recommendations perfect for professional reports or DIY implementation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h5 className="text-sm font-semibold text-white">Content Authority</h5>
                </div>
                <p className="text-xs text-gray-400">
                  Traditional SEO E-E-A-T principles now extended to AI model source evaluation
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h5 className="text-sm font-semibold text-white">Semantic Relevance</h5>
                </div>
                <p className="text-xs text-gray-400">
                  SEO semantic optimization extended to AI search context matching
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h5 className="text-sm font-semibold text-white">Citation Patterns</h5>
                </div>
                <p className="text-xs text-gray-400">
                  How AI engines select and rank sources - an evolution of traditional link authority
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h5 className="text-sm font-semibold text-white">Structured Data</h5>
                </div>
                <p className="text-xs text-gray-400">
                  Traditional SEO structured data now critical for AI information extraction
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h5 className="text-sm font-semibold text-white">Recency Signals</h5>
                </div>
                <p className="text-xs text-gray-400">
                  Freshness and update frequency considerations
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h5 className="text-sm font-semibold text-white">User Engagement</h5>
                </div>
                <p className="text-xs text-gray-400">
                  Interaction patterns and engagement metrics
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Based on established research principles in natural language processing and information retrieval
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div ref={resultsRef} id="aeo-results" className="bg-gray-900 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">AI Engine Ranking Report</h2>

            {/* Overall Summary */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-8 mb-8 border border-gray-600">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-6">AI Engine Rankings for {businessName}</h3>

                {/* Average Score Circle */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="relative w-48 h-48">
                      <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#E5E7EB"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="url(#gradient)"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(results.reduce((sum, r) => sum + r.aeoScore, 0) / results.length / 100) * 440} 440`}
                          strokeLinecap="round"
                          className="transition-all duration-1500 ease-out"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="50%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#06B6D4" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {Math.round(results.reduce((sum, r) => sum + r.aeoScore, 0) / results.length)}
                        </span>
                        <span className="text-sm text-gray-300">Average Score</span>
                        <div className="mt-2">
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${Math.round(results.reduce((sum, r) => sum + r.aeoScore, 0) / results.length) >= 80 ? 'bg-green-100 text-green-800' : Math.round(results.reduce((sum, r) => sum + r.aeoScore, 0) / results.length) >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {getScoreLabel(Math.round(results.reduce((sum, r) => sum + r.aeoScore, 0) / results.length))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Provider Rankings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((result, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${result.provider.color}`}>
                          {result.provider.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-2xl font-bold ${getScoreColor(result.aeoScore)}`}>
                            {result.aeoScore}
                          </span>
                          <span className="text-gray-400">/100</span>
                        </div>
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="w-full bg-gray-600 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 ease-out ${result.aeoScore >= 80 ? 'bg-green-500' : result.aeoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${result.aeoScore}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-sm text-gray-300">
                  <p>Rankings based on comprehensive analysis across major AI engines.</p>
                </div>
              </div>
            </div>


            {/* Website Analysis Results */}
            {websiteAnalysis && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-8 mb-8 border border-gray-600">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">Website AEO Analysis</h3>
                  <p className="text-gray-300">
                    Analysis of <strong>{websiteAnalysis.url}</strong> for AI engine optimization
                  </p>
                </div>

                {/* AEO Score */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="relative w-40 h-40">
                      <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          stroke="#E5E7EB"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          stroke={websiteAnalysis.aeoOptimization.currentScore >= 80 ? "#10B981" : websiteAnalysis.aeoOptimization.currentScore >= 60 ? "#F59E0B" : "#EF4444"}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(websiteAnalysis.aeoOptimization.currentScore / 100) * 314} 314`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(websiteAnalysis.aeoOptimization.currentScore)}`}>
                          {websiteAnalysis.aeoOptimization.currentScore}
                        </span>
                        <span className="text-xs text-gray-300">Website Score</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-600">
                  <h4 className="text-lg font-semibold text-white mb-3">Analysis Summary</h4>
                  <p className="text-gray-300">{websiteAnalysis.summary}</p>
                </div>

                {/* Content Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
                    <h5 className="text-md font-semibold text-white mb-4">Content Analysis</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Word Count:</span>
                        <span className="text-white font-medium">{websiteAnalysis.contentAnalysis.wordCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Structured Data:</span>
                        <span className={`font-medium ${websiteAnalysis.contentAnalysis.hasStructuredData ? 'text-green-400' : 'text-red-400'}`}>
                          {websiteAnalysis.contentAnalysis.hasStructuredData ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Authority Signals:</span>
                        <span className="text-white font-medium">{websiteAnalysis.contentAnalysis.authoritySignals.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">External Links:</span>
                        <span className="text-white font-medium">{websiteAnalysis.contentAnalysis.citationCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
                    <h5 className="text-md font-semibold text-white mb-4">Strengths & Weaknesses</h5>
                    
                    {websiteAnalysis.aeoOptimization.strengths.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-sm font-medium text-green-400 mb-2">✅ Strengths</h6>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {websiteAnalysis.aeoOptimization.strengths.slice(0, 3).map((strength, idx) => (
                            <li key={idx}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {websiteAnalysis.aeoOptimization.weaknesses.length > 0 && (
                      <div>
                        <h6 className="text-sm font-medium text-red-400 mb-2">⚠️ Areas for Improvement</h6>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {websiteAnalysis.aeoOptimization.weaknesses.slice(0, 3).map((weakness, idx) => (
                            <li key={idx}>• {weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actionable Recommendations */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
                  <h4 className="text-lg font-semibold text-white mb-4">🎯 Actionable Recommendations</h4>
                  <div className="space-y-4">
                    {websiteAnalysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg p-4 border border-gray-500">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {rec.priority.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-400">{rec.category}</span>
                          </div>
                          <div className="flex space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              rec.effort === 'quick' ? 'bg-green-900 text-green-300' :
                              rec.effort === 'moderate' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {rec.effort}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              rec.impact === 'high' ? 'bg-blue-900 text-blue-300' :
                              rec.impact === 'medium' ? 'bg-purple-900 text-purple-300' :
                              'bg-gray-900 text-gray-300'
                            }`}>
                              {rec.impact} impact
                            </span>
                          </div>
                        </div>
                        <h5 className="text-white font-semibold mb-2">{rec.title}</h5>
                        <p className="text-gray-300 text-sm">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Results */}
            <div className="space-y-8">
              {results.map((result, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-8 border border-gray-600">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">{result.provider.name}</h3>
                    <div className={`text-3xl font-bold ${getScoreColor(result.aeoScore)}`}>
                      {result.aeoScore}/100
                    </div>
                  </div>

                  {/* AI Engine Ranking */}
                  <div className="bg-gray-700 rounded-lg p-6 mb-6 border border-gray-600">
                    <h4 className="font-semibold mb-4 text-center text-white">{result.provider.name} Ranking</h4>
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            stroke="#E5E7EB"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            stroke={result.aeoScore >= 80 ? "#10B981" : result.aeoScore >= 60 ? "#F59E0B" : "#EF4444"}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(result.aeoScore / 100) * 314} 314`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl font-bold ${getScoreColor(result.aeoScore)}`}>
                            {result.aeoScore}
                          </span>
                          <span className="text-xs text-gray-300">AEO Score</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${result.aeoScore >= 80 ? 'bg-green-100 text-green-800' : result.aeoScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {getScoreLabel(result.aeoScore)} Performance
                      </div>
                      <div className="text-sm text-gray-300 mt-2">
                        Appears in {result.queryVariations.filter(q => q.mentioned).length} AI-generated lists
                      </div>
                    </div>
                  </div>


                  {/* Summary Stats */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-400">
                          {result.queryVariations.filter(q => q.mentioned).length}
                        </div>
                        <div className="text-sm text-gray-300">Mentions Found</div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${result.overallVisibility >= 50 ? 'text-green-400' : result.overallVisibility >= 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {result.overallVisibility}%
                        </div>
                        <div className="text-sm text-gray-300">Visibility Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Query Details */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-4 text-white">Query Details:</h4>
                    <div className="space-y-3">
                      {result.queryVariations.map((query, qIdx) => (
                        <div key={qIdx} className={`border rounded-lg p-4 ${query.mentioned ? 'bg-green-900/30 border-green-600' : 'bg-gray-700 border-gray-600'}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${query.mentioned ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                              <span className="text-sm font-medium text-white">
                                Query {qIdx + 1}
                              </span>
                              {query.mentioned && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Found • Rank {query.rankPosition} • Score {query.relevanceScore}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-300 mb-2 font-medium">
                            &quot;{query.query}&quot;
                          </div>
                          
                          {/* Word Position Analysis */}
                          {query.wordPositionData && query.wordPositionData.totalMatches > 0 && (
                            <div className="mb-3 p-3 bg-blue-900/30 rounded-lg border border-blue-600">
                              <h5 className="text-sm font-semibold text-blue-300 mb-2">🔍 Word Position Analysis</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div className="text-center">
                                  <div className="font-bold text-blue-300">{query.wordPositionData.totalMatches}</div>
                                  <div className="text-blue-400">Total Matches</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-blue-300">{Math.round(query.wordPositionData.averagePosition)}</div>
                                  <div className="text-blue-400">Avg Position</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-blue-300">{query.wordPositionData.lineNumbers.length}</div>
                                  <div className="text-blue-400">Lines Found</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-blue-300">{query.wordPositionData.businessMentionDensity.toFixed(1)}%</div>
                                  <div className="text-blue-400">Mention Density</div>
                                </div>
                              </div>
                              
                              {/* Individual Matches */}
                              <div className="mt-3">
                                <h6 className="text-xs font-medium text-blue-300 mb-2">Found Matches:</h6>
                                <div className="space-y-1">
                                  {query.wordPositionData.matches.slice(0, 3).map((match, matchIdx) => (
                                    <div key={matchIdx} className="flex items-center space-x-2 text-xs">
                                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                                        match.matchType === 'exact' ? 'bg-green-500' : 
                                        match.matchType === 'fuzzy' ? 'bg-yellow-500' : 'bg-orange-500'
                                      }`}></span>
                                      <span className="font-medium text-gray-300">&quot;{match.matchedText}&quot;</span>
                                      <span className="text-gray-400">Line {match.lineNumber}</span>
                                      <span className="text-gray-400">Pos {match.position}</span>
                                      <span className={`px-1 py-0.5 rounded text-xs ${
                                        match.confidence >= 90 ? 'bg-green-100 text-green-700' :
                                        match.confidence >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-orange-100 text-orange-700'
                                      }`}>
                                        {match.confidence}%
                                      </span>
                                    </div>
                                  ))}
                                  {query.wordPositionData.matches.length > 3 && (
                                    <div className="text-xs text-gray-400 italic">
                                      +{query.wordPositionData.matches.length - 3} more matches
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div>
                            {query.response.length > 200 ? (
                              <details className="text-sm">
                                <summary className="text-gray-300 bg-gray-700 p-3 rounded border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors">
                                  {query.response.substring(0, 200)}...
                                  <span className="text-blue-400 font-medium ml-1">tap to see full response</span>
                                </summary>
                                <div className="mt-2 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg p-4">
                                  <div className="max-h-60 overflow-y-auto">
                                    {query.response}
                                  </div>
                                </div>
                              </details>
                            ) : (
                              <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded border border-gray-600">
                                {query.response}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2 text-white">Analysis:</h4>
                    <p className="text-gray-300">{result.analysis}</p>
                  </div>


                  {/* Missed Responses */}
                  {result.missedResponses && result.missedResponses.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-4 text-white">Responses Without Your Business:</h4>
                      <div className="space-y-3">
                        {result.missedResponses.slice(0, 3).map((missed, idx) => (
                          <div key={idx} className="bg-red-900/30 rounded-lg p-4 border border-red-600">
                            <div className="text-sm font-medium text-red-300 mb-2">
                              Query: {missed.query}
                            </div>
                            <div>
                              {missed.response.length > 200 ? (
                                <details className="text-sm">
                                  <summary className="text-red-200 bg-gray-800 p-3 rounded border border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors">
                                    {missed.response.substring(0, 200)}...
                                    <span className="text-blue-400 font-medium ml-1">tap to see full response</span>
                                  </summary>
                                  <div className="mt-2 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg p-4">
                                    <div className="max-h-60 overflow-y-auto">
                                      {missed.response}
                                    </div>
                                  </div>
                                </details>
                              ) : (
                                <div className="text-sm text-red-200 bg-gray-800 p-3 rounded border border-gray-600">
                                  {missed.response}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-semibold text-white hover:text-gray-300 transition-colors">
              <Image src="/lucy.png" alt="Rankly" width={24} height={24} />
              <span>Rankly</span>
            </Link>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <span className="text-gray-400">AI-powered reports for SEO professionals</span>
              <span className="text-gray-400">&copy; {new Date().getFullYear()} Rankly</span>
            </div>
          </div>
        </div>
      </footer>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLogin}
      />
    </div>

  )
}