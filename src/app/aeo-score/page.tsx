'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/hooks/useAuth';

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
}

export default function AEOScorePage() {
  const [businessName, setBusinessName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ScoringResult[]>([]);
  const [overallCompetitors, setOverallCompetitors] = useState<CompetitorInfo[]>([]);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{canUse: boolean; usageCount: number; maxUsage: number | string; tier: string} | null>(null);
  
  const { user } = useAuth();

  const handleCreateAccount = () => {
    setLoginModalOpen(true);
  };

  const handleLogin = () => {
    setLoginModalOpen(false);
  };
  const checkUsageLimits = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/usage-check', {
        headers: { 'Authorization': `Bearer ${user.email}` }
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
  ];


  const handleAnalyze = async () => {
    if (!businessName.trim() || !keyword.trim()) return;
    
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

    // Use single keyword
    const keywordArray = [keyword.trim()];

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
    }, 3000); // Change message every 3 seconds

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
          estimatedDuration = 35000;
          currentProgress = (elapsed / estimatedDuration) * 15; // First 15% in 5 seconds
        } else if (elapsed < 20000) {
          // 5-20 seconds: main processing
          estimatedDuration = 35000;
          currentProgress = 15 + ((elapsed - 5000) / 15000) * 60; // Next 60% over 15 seconds
        } else {
          // 20+ seconds: final phase
          estimatedDuration = 35000;
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
        body: JSON.stringify({ businessName, keywords: keywordArray, providers: aiProviders }),
      });

      const duration = Date.now() - startTime;
      console.log(`API call took ${duration}ms`);

      // Clear intervals
      clearInterval(estimationInterval);
      clearInterval(messageInterval);

      // Final steps
      setProgress(90);
      setCurrentStep('🎉 Wrapping up the magic...');

      const data = await response.json();

      // Complete the progress
      setTimeout(() => {
        setProgress(100);
        setCurrentStep('✨ Ta-da! Your rankings are ready!');

        // Show results after brief celebration
        setTimeout(() => {
          setResults(data.results);
          setOverallCompetitors(data.overallCompetitorAnalysis || []);
          setIsAnalyzing(false);
          setCurrentStep('');
          setProgress(0);
          // Refresh usage info after successful analysis
          checkUsageLimits();
        }, 1000);
      }, 500);

    } catch (error) {
      if (messageInterval) clearInterval(messageInterval);
      console.error('Error analyzing AEO scores:', error);
      alert('Failed to analyze AEO scores. Please try again.');
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
    <div className="min-h-screen bg-white" style={{ fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              AEO/GEO Analytics & Visibility Scoring
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive Answers Engine Optimization analytics to measure your business visibility across AI platforms.
              Free tool limited to 3 models and weakest analytic engines. Professional has complete coverage of models.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Start Your AEO Analytics Report</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-800 font-medium">Free Tool Limitations:</span>
                </div>
                <div className="ml-7 text-sm text-blue-700 space-y-1">
                  <div>• Limited to 3 models and weakest analytic engines</div>
                  <div>• <strong>Professional:</strong> Complete coverage of all AI models</div>
                  <div>• <strong>Enterprise:</strong> Includes consultation, AI-insights, action plans, and development support</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business name (e.g., 'Acme Corp', 'SearchDogAI')"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Keyword or Phrase</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter your primary keyword or phrase (e.g., 'AEO', 'GEO', 'Answers Engine Optimization', 'digital marketing')"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <div className="mt-2 text-sm text-gray-500">
                <strong>Examples:</strong> AEO, GEO, Answers Engine Optimization, digital marketing, restaurant delivery, software development, healthcare consulting
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {!user ? (
                  <span className="text-red-600 font-medium">⚠️ Login required</span>
                ) : usageInfo && !usageInfo.canUse ? (
                  <span className="text-red-600 font-medium">❌ Daily limit reached ({usageInfo.usageCount}/{usageInfo.maxUsage})</span>
                ) : usageInfo && usageInfo.maxUsage === 'unlimited' ? (
                  <span className="text-blue-600 font-medium">🚀 Unlimited usage ({usageInfo.tier} plan)</span>
                ) : usageInfo ? (
                  <span className="text-green-600 font-medium">✅ {typeof usageInfo.maxUsage === 'number' ? usageInfo.maxUsage - usageInfo.usageCount : 'unlimited'} uses remaining today</span>
                ) : keyword.trim().length > 0 ? (
                  <span>Keyword ready</span>
                ) : (
                  <span>Enter a keyword or phrase</span>
                )}
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || user == null || usageInfo == null || (usageInfo && !usageInfo.canUse)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden cursor-pointer"
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
                  'Generate Analytics Report'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Section */}
      {isAnalyzing && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="relative">
                  {/* Animated Robot/Dog Icon */}
                  <div className="w-20 h-20 mx-auto mb-4">
                    <div className="relative animate-bounce">
                      <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto flex items-center justify-center text-white text-2xl">
                        🤖
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Floating Keyword */}
                  <div className="absolute inset-0 pointer-events-none">
                    {keyword.trim() && (
                      <div
                        className="absolute text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full animate-ping"
                        style={{
                          top: '20%',
                          left: '10%',
                          animationDuration: '2s'
                        }}
                      >
                        {keyword.trim()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Analyzing {businessName}</h3>
              <p className="text-gray-600 mb-6">{currentStep}</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-6">{Math.round(progress)}% complete</div>

              {/* Fun Loading Messages */}
              <div className="text-gray-600 mb-4">
                {progress < 30 && "🔍 Searching through AI knowledge bases..."}
                {progress >= 30 && progress < 70 && "🧠 AI engines are thinking hard..."}
                {progress >= 70 && progress < 95 && "📊 Crunching the numbers..."}
                {progress >= 95 && "🎉 Almost done!"}
              </div>

              {/* Dancing Dots */}
              <div className="flex justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Providers Section */}
      {businessName && keyword && (
        <div className="bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Testing Against {aiProviders.length} Major AI Engine{aiProviders.length !== 1 ? 's' : ''} with Smart Keyword Queries</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {aiProviders.map((provider, index) => (
                <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${provider.color}`}>
                    {provider.name}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{provider.model}</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 max-w-3xl mx-auto">
                Each AI engine will be asked to list companies based on your keyword: <strong>{keyword.trim()}</strong>.
                We&apos;ll check if <strong>{businessName}</strong> appears in these AI-generated company lists to measure organic visibility.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">AEO/GEO Score Results</h2>

            {/* Overall Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 mb-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-6">Overall AEO/GEO Rankings for {businessName}</h3>

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
                        <span className="text-4xl font-bold text-gray-900">
                          {Math.round(results.reduce((sum, r) => sum + r.aeoScore, 0) / results.length)}
                        </span>
                        <span className="text-sm text-gray-500">Average Score</span>
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
                    <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
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
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 ease-out ${result.aeoScore >= 80 ? 'bg-green-500' : result.aeoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${result.aeoScore}%` }}
                        ></div>
                      </div>

                      <div className="text-sm text-gray-600">
                        Found in {result.queryVariations.filter(q => q.mentioned).length} AI-generated company lists
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-sm text-gray-600">
                  <p>Rankings based on comprehensive analysis across major AI engines.</p>
                </div>
              </div>
            </div>

            {/* Overall Competitor Analysis */}
            {overallCompetitors.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-lg p-8 mb-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-4">Overall Competitor Landscape</h3>
                  <p className="text-gray-700">
                    Competitors identified across all AI models during analysis of <strong>{businessName}</strong>
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {overallCompetitors.map((competitor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900">{competitor.name}</span>
                          <div className="text-xs text-gray-600 mt-1">
                            {competitor.mentions} mention{competitor.mentions !== 1 ? 's' : ''} across models
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                            competitor.score >= 60 ? 'bg-red-100 text-red-800' : 
                            competitor.score >= 40 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {competitor.score}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {overallCompetitors.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-4">🎉</div>
                      <p>No significant competitors found across all AI models!</p>
                      <p className="text-sm mt-2">This could indicate a unique market position or niche focus.</p>
                    </div>
                  )}
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Competitor scores represent frequency of mentions across all AI model responses.
                      Higher scores indicate stronger competitive presence in AI search results.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Results */}
            <div className="space-y-8">
              {results.map((result, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">{result.provider.name}</h3>
                    <div className={`text-3xl font-bold ${getScoreColor(result.aeoScore)}`}>
                      {result.aeoScore}/100
                    </div>
                  </div>

                  {/* AI Engine Ranking */}
                  <div className="bg-white rounded-lg p-6 mb-6">
                    <h4 className="font-semibold mb-4 text-center">{result.provider.name} Ranking</h4>
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
                          <span className="text-xs text-gray-500">AEO/GEO Score</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${result.aeoScore >= 80 ? 'bg-green-100 text-green-800' : result.aeoScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {getScoreLabel(result.aeoScore)} Performance
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Appears in {result.queryVariations.filter(q => q.mentioned).length} AI-generated lists
                      </div>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">AI Response:</h4>
                    <div className="bg-white p-4 rounded border text-gray-700">
                      {result.response}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {result.queryVariations.filter(q => q.mentioned).length}
                        </div>
                        <div className="text-sm text-gray-600">Mentions Found</div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${result.overallVisibility >= 50 ? 'text-green-600' : result.overallVisibility >= 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {result.overallVisibility}%
                        </div>
                        <div className="text-sm text-gray-600">Visibility Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Query Details */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-4">Query Details:</h4>
                    <div className="space-y-3">
                      {result.queryVariations.map((query, qIdx) => (
                        <div key={qIdx} className={`border rounded-lg p-4 ${query.mentioned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${query.mentioned ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                              <span className="text-sm font-medium text-gray-900">
                                Query {qIdx + 1}
                              </span>
                              {query.mentioned && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Found • Rank {query.rankPosition} • Score {query.relevanceScore}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-700 mb-2 font-medium">
                            &quot;{query.query}&quot;
                          </div>
                          <div className="relative group">
                            <div className="text-sm text-gray-600 bg-white p-3 rounded border cursor-pointer hover:bg-gray-50 transition-colors">
                              {query.response.length > 200 ? (
                                <>
                                  {query.response.substring(0, 200)}...
                                  <span className="text-blue-600 font-medium ml-1">hover to see full response</span>
                                </>
                              ) : (
                                query.response
                              )}
                            </div>
                            {query.response.length > 200 && (
                              <div className="absolute left-0 top-full mt-2 w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="text-sm text-gray-700 max-h-60 overflow-y-auto">
                                  {query.response}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Analysis:</h4>
                    <p className="text-gray-700">{result.analysis}</p>
                  </div>

                  {/* Competitor Analysis */}
                  {result.competitorAnalysis && result.competitorAnalysis.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-4">Top Competitors Found:</h4>
                      <div className="bg-white rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {result.competitorAnalysis.slice(0, 8).map((competitor, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-900">{competitor.name}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">{competitor.mentions}×</span>
                                <span className={`text-sm font-medium ${competitor.score >= 60 ? 'text-green-600' : competitor.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {competitor.score}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Missed Responses */}
                  {result.missedResponses && result.missedResponses.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-4">Responses Without Your Business:</h4>
                      <div className="space-y-3">
                        {result.missedResponses.slice(0, 3).map((missed, idx) => (
                          <div key={idx} className="bg-red-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-red-800 mb-2">
                              Query: {missed.query}
                            </div>
                            <div className="relative group">
                              <div className="text-sm text-red-700 bg-white p-3 rounded border cursor-pointer hover:bg-gray-50 transition-colors">
                                {missed.response.length > 200 ? (
                                  <>
                                    {missed.response.substring(0, 200)}...
                                    <span className="text-blue-600 font-medium ml-1">hover to see full response</span>
                                  </>
                                ) : (
                                  missed.response
                                )}
                              </div>
                              {missed.response.length > 200 && (
                                <div className="absolute left-0 top-full mt-2 w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                  <div className="text-sm text-gray-700 max-h-60 overflow-y-auto">
                                    {missed.response}
                                  </div>
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

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Optimize for AI Search?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses preparing for the AI-first search future. Create your account now to access our free tool and lock in pre-release discounts.
          </p>
          <button 
            onClick={handleCreateAccount}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg cursor-pointer"
          >
            Create Account - Get Discount
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image src="/dog.png" alt="SearchDogAI" width={20} height={20} className="object-contain" />
              <span className="text-xl font-semibold text-gray-900">SearchDogAI</span>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <span className="text-gray-600">One-click AEO & GEO optimization</span>
              <span className="text-gray-600">&copy; {new Date().getFullYear()} SearchDogAI</span>
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
  );
}