'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import { Check, RotateCw, AlertCircle, Lightbulb, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
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
    positionScore: number;
    visibilityScore: number;
    relevanceScore: number;
  };
  analysis: string;
  queryVariations: QueryResult[];
  overallVisibility: number;
  competitorAnalysis: CompetitorInfo[];
  missedResponses: QueryResult[];
}

interface AnalysisRecommendation {
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'quick' | 'moderate' | 'significant';
}

interface WebsiteAnalysisResult {
  url: string;
  businessName: string;
  industry: string;
  location?: string;
  description: string;
  keywords: string[];
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
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  
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

  // Check usage limits when user changes or component mounts
  const checkUsageLimits = useCallback(async () => {
    if (!user?.email) return null;
    
    try {
      const response = await fetch('/api/usage-check', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsageInfo(data);
        return data;
      }
    } catch (error) {
      console.error('Error checking usage limits:', error);
    }
    return null;
  }, [user?.email]);

  // Check rate limits
  const checkRateLimits = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/rate-limit-check', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyzeWebsiteRateLimit(data.analyzeWebsite || { canUse: true, waitMinutes: 0 });
        setGeneratePromptsRateLimit(data.generatePrompts || { canUse: true, waitMinutes: 0 });
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

  // Fetch feature flags on component mount
  useEffect(() => {
    fetch('/api/feature-flags')
      .then(res => res.json())
      .then(data => setFeatureFlags(data.flags || {}))
      .catch(err => console.error('Failed to fetch feature flags:', err));
  }, []);

  // Handle keywords input with real-time limit to 10 keywords
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    const commaCount = (inputValue.match(/,/g) || []).length;
    
    // Allow up to 9 commas (which means 10 keywords)
    if (commaCount <= 9) {
      setKeywords(inputValue);
    }
    // If we're at the limit and user is trying to add more, prevent it
    // But allow deletion by checking if the new value is shorter
    else if (inputValue.length < keywords.length) {
      setKeywords(inputValue);
    }
  };

  const keywordCount = keywords.split(',').filter(k => k.trim().length > 0).length;

  useEffect(() => {
    if (user?.email) {
      checkUsageLimits();
    }
  }, [user?.email, checkUsageLimits]);

  const allAiProviders: AIProvider[] = [
    { name: 'OpenAI', model: '', color: 'bg-green-100 text-green-800' },
    { name: 'Claude', model: '', color: 'bg-orange-100 text-orange-800' },
    { name: 'Perplexity', model: '', color: 'bg-blue-100 text-blue-800' },
    { name: 'Google', model: '', color: 'bg-blue-100 text-blue-800' },
  ];

  // Filter providers based on feature flags
  const aiProviders = allAiProviders.filter(provider => {
    if (provider.name === 'Google' && !featureFlags.googleAI) {
      return false;
    }
    return true;
  });


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

    setError(null);

    try {
      const response = await fetch('/api/generate-prompts-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          businessName,
          industry,
          location: location.trim() || undefined,
          marketDescription: businessDescription,
          keywords: parseKeywords(keywords)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          setError(errorData.error || 'Rate limit exceeded. Please try again later.');
          // Refresh rate limits
          checkRateLimits();
          return;
        }
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedPrompts(data.prompts);
      setEditablePrompts([...data.prompts]);
      setShowPromptEditor(true);
      setActiveTab('prompts');
    } catch (error) {
      console.error('Error generating prompts:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate prompts');
    }
  };

  const funMessages = [
    '🤖 Teaching AIs about your business...',
    '🔍 Scanning the digital landscape...',
    '📊 Crunching visibility metrics...',
    '🎯 Analyzing your competition...',
    '💡 Discovering ranking opportunities...',
    '🚀 Calculating your AEO potential...',
    '⚡ Almost there, final calculations...',
    '🎉 Putting the finishing touches...',
    '✨ Preparing your insights...',
    '🏆 Your results are ready!'
  ];

  const handleAnalyze = async () => {
    if (!businessName.trim() || !industry.trim() || !businessDescription.trim()) return;

    // Check if user is logged in
    if (!user?.email) {
      setLoginModalOpen(true);
      return;
    }

    // Check usage limits
    if (usageInfo && !usageInfo.canUse) {
      alert(`Daily limit reached. You've used ${usageInfo.usageCount}/${usageInfo.maxUsage} free analytics today. Please upgrade for unlimited access.`);
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setResults([]);
    setWebsiteAnalysis(null);

    // Start with fun messages rotation
    let messageIndex = 0;
    setCurrentStep(funMessages[messageIndex]);
    const messageInterval = setInterval(() => {
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
          
          // Scroll to results
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }, 1500);
      }, 500);

    } catch (error) {
      console.error('Error analyzing:', error);
      clearInterval(messageInterval);
      
      setIsAnalyzing(false);
      setCurrentStep('');
      setProgress(0);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    }
  };

  const analyzeWebsite = async () => {
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

    setError(null);
    setIsExtractingInfo(true);
    setExtractedInfo(null);

    try {
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: websiteUrlForExtraction }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          setError(errorData.error || 'Rate limit exceeded. Please try again later.');
          // Refresh rate limits
          checkRateLimits();
          return;
        }
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      setExtractedInfo({
        businessName: data.businessName,
        industry: data.industry,
        location: data.location,
        businessDescription: data.businessDescription,
        keywords: data.keywords,
        confidence: data.confidence
      });

    } catch (error) {
      console.error('Error analyzing website:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze website');
    } finally {
      setIsExtractingInfo(false);
    }
  };

  const applyExtractedInfo = () => {
    if (!extractedInfo) return;

    setBusinessName(extractedInfo.businessName);
    setIndustry(extractedInfo.industry);
    setLocation(extractedInfo.location || '');
    setBusinessDescription(extractedInfo.businessDescription);
    setKeywords(extractedInfo.keywords.join(', '));
    setWebsiteUrl(websiteUrlForExtraction);

    // Switch to manual workflow
    setWorkflowType('manual');
    setExtractedInfo(null);
    setWebsiteUrlForExtraction('');
  };

  const canAnalyze = businessName.trim() && industry.trim() && businessDescription.trim();

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Discover Your AI Visibility
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            See how your business ranks across leading AI engines and get personalized optimization strategies
          </p>
        </div>

        {/* Usage Info */}
        {usageInfo && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm text-gray-400">
                  Daily Usage: <span className="text-white font-medium">{usageInfo.usageCount}/{usageInfo.maxUsage}</span>
                </div>
                <div className="ml-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    usageInfo.tier === 'free' ? 'bg-green-900 text-green-200' :
                    usageInfo.tier === 'indie' ? 'bg-blue-900 text-blue-200' :
                    usageInfo.tier === 'professional' ? 'bg-purple-900 text-purple-200' :
                    'bg-yellow-900 text-yellow-200'
                  }`}>
                    {usageInfo.tier.charAt(0).toUpperCase() + usageInfo.tier.slice(1)} Plan
                  </span>
                </div>
              </div>
              {!usageInfo.canUse && (
                <Link 
                  href="/dashboard" 
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Upgrade Plan →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Workflow Selection */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setWorkflowType('website')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  workflowType === 'website'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                🌐 Start with Website
              </button>
              <button
                onClick={() => setWorkflowType('manual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  workflowType === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                ✏️ Manual Entry
              </button>
            </div>
          </div>

          {workflowType === 'website' && !extractedInfo && (
            <div className="text-center">
              <div className="max-w-md mx-auto">
                <p className="text-gray-300 mb-4">
                  Let our AI analyze your website and extract business information automatically
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={websiteUrlForExtraction}
                    onChange={(e) => setWebsiteUrlForExtraction(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={analyzeWebsite}
                    disabled={!websiteUrlForExtraction.trim() || isExtractingInfo || !analyzeWebsiteRateLimit.canUse}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isExtractingInfo ? (
                      <>
                        <RotateCw className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Website'
                    )}
                  </button>
                </div>
                {!analyzeWebsiteRateLimit.canUse && (
                  <p className="text-yellow-400 text-sm mt-2">
                    Please wait {analyzeWebsiteRateLimit.waitMinutes} minute{analyzeWebsiteRateLimit.waitMinutes !== 1 ? 's' : ''} before analyzing another website.
                  </p>
                )}
              </div>
            </div>
          )}

          {extractedInfo && (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Extracted Information</h3>
                <div className="text-sm text-gray-400">
                  Confidence: {Math.round(extractedInfo.confidence)}%
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Business Name</label>
                  <div className="px-3 py-2 bg-gray-600 rounded text-white text-sm">{extractedInfo.businessName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Industry</label>
                  <div className="px-3 py-2 bg-gray-600 rounded text-white text-sm">{extractedInfo.industry}</div>
                </div>
                {extractedInfo.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                    <div className="px-3 py-2 bg-gray-600 rounded text-white text-sm">{extractedInfo.location}</div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <div className="px-3 py-2 bg-gray-600 rounded text-white text-sm">{extractedInfo.businessDescription}</div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Keywords</label>
                <div className="px-3 py-2 bg-gray-600 rounded text-white text-sm">{extractedInfo.keywords.join(', ')}</div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={applyExtractedInfo}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Use This Information
                </button>
                <button
                  onClick={() => setExtractedInfo(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Main Form */}
        {(workflowType === 'manual' || extractedInfo) && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'input'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Business Information
              </button>
              <button
                onClick={() => setActiveTab('prompts')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'prompts'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Query Prompts {generatedPrompts.length > 0 && `(${generatedPrompts.length})`}
              </button>
            </div>

            {activeTab === 'input' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Industry *
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Healthcare, Technology, Retail"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City, State or Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Website URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Description *
                  </label>
                  <textarea
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what your business does, your main products/services, and what makes you unique..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Keywords & Topics ({keywordCount}/10)
                  </label>
                  <textarea
                    value={keywords}
                    onChange={handleKeywordsChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., digital marketing, SEO services, content strategy, social media management"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Separate keywords with commas. Maximum 10 keywords.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleGeneratePrompts}
                    disabled={!canAnalyze || !generatePromptsRateLimit.canUse}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Generate Smart Prompts
                  </button>
                  {!generatePromptsRateLimit.canUse && (
                    <p className="text-yellow-400 text-sm flex items-center">
                      Please wait {generatePromptsRateLimit.waitMinutes} minute{generatePromptsRateLimit.waitMinutes !== 1 ? 's' : ''} before generating more prompts.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'prompts' && (
              <div className="space-y-6">
                {generatedPrompts.length === 0 ? (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No prompts generated yet</p>
                    <p className="text-sm text-gray-500">
                      Fill out your business information and click &quot;Generate Smart Prompts&quot; to create optimized queries
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        Generated Prompts ({generatedPrompts.length})
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPromptIndex(Math.max(0, currentPromptIndex - 1))}
                          disabled={currentPromptIndex === 0}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-sm text-gray-400">
                          {currentPromptIndex + 1} of {generatedPrompts.length}
                        </span>
                        <button
                          onClick={() => setCurrentPromptIndex(Math.min(generatedPrompts.length - 1, currentPromptIndex + 1))}
                          disabled={currentPromptIndex === generatedPrompts.length - 1}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {showPromptEditor && (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Edit Prompt {currentPromptIndex + 1}
                        </label>
                        <textarea
                          value={editablePrompts[currentPromptIndex] || ''}
                          onChange={(e) => {
                            const newPrompts = [...editablePrompts];
                            newPrompts[currentPromptIndex] = e.target.value;
                            setEditablePrompts(newPrompts);
                          }}
                          rows={4}
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">All Prompts Preview</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {editablePrompts.map((prompt, index) => (
                          <div key={index} className="text-sm text-gray-400 bg-gray-600 p-2 rounded">
                            <span className="text-blue-400">#{index + 1}:</span> {prompt.substring(0, 100)}{prompt.length > 100 ? '...' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Analyze Button */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze || isAnalyzing}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
              >
                {isAnalyzing ? 'Analyzing...' : `Analyze with ${aiProviders.length} AI Engines`}
              </button>
              
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {aiProviders.map((provider) => (
                  <span key={provider.name} className={`px-3 py-1 rounded-full text-xs font-medium ${provider.color}`}>
                    {provider.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
            <div className="text-center">
              <div className="mb-4">
                <div className="text-lg font-medium text-white mb-2">{currentStep}</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
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
          <div ref={resultsRef} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Your AEO Analysis Results</h2>
            
            {/* Website Analysis Summary */}
            {websiteAnalysis && (
              <div className="bg-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Website Analysis Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{websiteAnalysis.aeoOptimization.currentScore}/100</div>
                    <div className="text-sm text-gray-400">Current AEO Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{websiteAnalysis.contentAnalysis.wordCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Words Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{websiteAnalysis.recommendations.length}</div>
                    <div className="text-sm text-gray-400">Recommendations</div>
                  </div>
                </div>
                <div className="text-gray-300">
                  <p className="mb-4">{websiteAnalysis.summary}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">Strengths</h4>
                      <ul className="text-sm space-y-1">
                        {websiteAnalysis.aeoOptimization.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-400 mb-2">Areas for Improvement</h4>
                      <ul className="text-sm space-y-1">
                        {websiteAnalysis.aeoOptimization.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Engine Results */}
            <div className="space-y-6">
              {results.map((result, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${result.provider.color} mr-3`}>
                        {result.provider.name}
                      </span>
                      <div className="text-2xl font-bold text-white">
                        {result.aeoScore}/100
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Visibility</div>
                      <div className="text-lg font-semibold text-blue-400">{result.overallVisibility}%</div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-600 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Position Score</div>
                      <div className="text-xl font-bold text-white">{result.factors.positionScore}/50</div>
                    </div>
                    <div className="bg-gray-600 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Visibility Score</div>
                      <div className="text-xl font-bold text-white">{result.factors.visibilityScore}/30</div>
                    </div>
                    <div className="bg-gray-600 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Relevance Score</div>
                      <div className="text-xl font-bold text-white">{result.factors.relevanceScore}/20</div>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-white mb-2">Analysis</h4>
                    <p className="text-gray-300">{result.analysis}</p>
                  </div>

                  {/* Query Performance */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">Query Performance</h4>
                      <button 
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                        onClick={() => {
                          const element = document.getElementById(`queries-${index}`);
                          element?.classList.toggle('hidden');
                        }}
                      >
                        <span>View Details</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      <div className="bg-green-900 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-400">
                          {result.queryVariations.filter(q => q.mentioned).length}
                        </div>
                        <div className="text-xs text-green-300">Mentions</div>
                      </div>
                      <div className="bg-red-900 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-red-400">
                          {result.missedResponses.length}
                        </div>
                        <div className="text-xs text-red-300">Missed</div>
                      </div>
                      <div className="bg-blue-900 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-400">
                          {result.queryVariations.filter(q => q.mentioned && q.rankPosition <= 3).length}
                        </div>
                        <div className="text-xs text-blue-300">Top 3</div>
                      </div>
                      <div className="bg-purple-900 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-purple-400">
                          {Math.round(result.queryVariations.reduce((sum, q) => sum + q.relevanceScore, 0) / result.queryVariations.length)}
                        </div>
                        <div className="text-xs text-purple-300">Avg Score</div>
                      </div>
                    </div>

                    <div id={`queries-${index}`} className="hidden space-y-2">
                      {result.queryVariations.map((query, qIndex) => (
                        <div key={qIndex} className="bg-gray-600 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-white truncate mr-4">
                              {query.query}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {query.mentioned ? (
                                <>
                                  <span className="px-2 py-1 bg-green-900 text-green-200 rounded text-xs">
                                    #{query.rankPosition}
                                  </span>
                                  <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs">
                                    {(query.relevanceScore * 10)}%
                                  </span>
                                </>
                              ) : (
                                <span className="px-2 py-1 bg-red-900 text-red-200 rounded text-xs">
                                  Not Mentioned
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 line-clamp-2">
                            {query.response.substring(0, 200)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Competitors */}
                  {result.competitorAnalysis.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-white mb-3">Top Competitors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {result.competitorAnalysis.slice(0, 4).map((competitor, cIndex) => (
                          <div key={cIndex} className="bg-gray-600 rounded-lg p-3">
                            <div className="font-medium text-white text-sm mb-1">{competitor.name}</div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">{competitor.mentions} mentions</span>
                              <span className="text-blue-400">{competitor.score}/100</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Items */}
            <div className="mt-8 bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Next Steps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-400 mb-3">Immediate Actions</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Focus on improving queries where you&apos;re not mentioned
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Analyze top-performing competitors&apos; strategies
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Create content targeting your missed opportunities
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-400 mb-3">Long-term Strategy</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Build authority in your industry niche
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Optimize for semantic search and AI understanding
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Monitor and track your AEO progress regularly
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  View Full Dashboard & Insights →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => setLoginModalOpen(false)}
      />
    </div>
  );
}