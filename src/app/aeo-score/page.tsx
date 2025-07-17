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

// Helper function to extract meaningful keywords from business description
function extractKeywords(description: string, industry: string): string[] {
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'a', 'an', 'as', 'if', 'then', 'than', 'so', 'very', 'also', 'too', 'much', 'more', 'most', 'many', 'some', 'any', 'all', 'both', 'each', 'few', 'other', 'another', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now'
  ]);

  // Extract words from description
  const words = description.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // Add industry as a primary keyword
  const keywords = [industry.toLowerCase()];

  // Add unique meaningful words
  const uniqueWords = [...new Set(words)];
  keywords.push(...uniqueWords.slice(0, 4)); // Take first 4 unique meaningful words

  return keywords.filter(keyword => keyword.length > 0).slice(0, 5);
}

export default function AEOScorePage() {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ScoringResult[]>([]);
  const [overallCompetitors, setOverallCompetitors] = useState<CompetitorInfo[]>([]);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{ canUse: boolean; usageCount: number; maxUsage: number | string; tier: string } | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [editablePrompts, setEditablePrompts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'prompts'>('input');

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
  ];


  const handleGeneratePrompts = async () => {
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
          marketDescription: businessDescription, // Map businessDescription to marketDescription
          keywords: extractKeywords(businessDescription, industry) // Extract meaningful keywords
        }),
      });

      const data = await response.json();
      setGeneratedPrompts(data.prompts);
      setEditablePrompts([...data.prompts]);
      setShowPromptEditor(true);
      setActiveTab('prompts'); // Switch to prompts tab
      setIsAnalyzing(false);
      setCurrentStep('');
      setProgress(0);
    } catch (error) {
      console.error('Error generating prompts:', error);
      alert('Failed to generate prompts. Please try again.');
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
        credentials: 'include',
        body: JSON.stringify({
          businessName,
          industry,
          marketDescription: businessDescription, // Map businessDescription to marketDescription
          keywords: extractKeywords(businessDescription, industry), // Extract keywords
          providers: aiProviders,
          customPrompts: editablePrompts
        }),
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              AEO Analytics & Visibility Scoring
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              Comprehensive Answers Engine Optimization analytics to measure your business visibility across AI platforms.
              Free tool limited to 3 models. Professional has complete coverage of models.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('input')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'input'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              1. Business Information
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              disabled={!showPromptEditor}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'prompts'
                  ? 'border-blue-500 text-blue-600'
                  : showPromptEditor
                    ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    : 'border-transparent text-gray-300 cursor-not-allowed'
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
                    <div>• Limited to 3 models</div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Enter your industry (e.g., 'Software Development', 'Healthcare', 'E-commerce', 'Marketing')"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <div className="mt-2 text-sm text-gray-500">
                  <strong>Examples:</strong> Software Development, Healthcare, E-commerce, Marketing, Finance, Education, Real Estate
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Description & Keywords</label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Describe your business, target market, customers, and include your primary keywords. For example: 'We help small businesses with AEO and Answers Engine Optimization. Our customers are marketing agencies and SMB owners who want to improve their digital marketing visibility in AI search engines. Primary focus: SEO optimization, AI search, digital marketing tools.'"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32 resize-none"
                />
                <div className="mt-2 text-sm text-gray-500">
                  <strong>Include:</strong> What your business does, target customers, main problems you solve, and your primary keywords/phrases for AI search optimization.
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
                  ) : businessName.trim() && industry.trim() && businessDescription.trim() ? (
                    <span>All fields ready</span>
                  ) : (
                    <span>Fill in all required fields</span>
                  )}
                </div>
                <button
                  onClick={handleGeneratePrompts}
                  disabled={isAnalyzing || !businessName.trim() || !industry.trim() || !businessDescription.trim() || user == null || usageInfo == null || (usageInfo && !usageInfo.canUse)}
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
                    'Generate Analysis Prompts'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompts Tab */}
      {activeTab === 'prompts' && showPromptEditor && (
        <div className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Review & Edit Analysis Prompts</h2>
                <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-blue-800 font-medium">✨ AI-Generated Prompts + Proprietary Optimization</span>
                  </div>
                  <p className="text-sm text-blue-700 text-center">
                    These prompts were generated using our proprietary AI algorithms for maximum accuracy in AEO scoring.
                    You can edit them below or proceed with the optimized versions.
                  </p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                {editablePrompts.map((prompt, index) => (
                  <div key={index} className="relative group">
                    {/* Floating Professional Prompt Box */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      {/* Header with Edit Button */}
                      <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">Analysis Prompt {index + 1}</h3>
                              <p className="text-sm text-gray-600">AI-optimized query for maximum accuracy</p>
                            </div>
                          </div>
                          {/* Edit Button in Top Right */}
                          <button
                            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                            onClick={() => {
                              const textarea = document.getElementById(`prompt-${index}`) as HTMLTextAreaElement;
                              if (textarea) {
                                textarea.focus();
                                textarea.select();
                              }
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-6">
                        <div className="relative">
                          <textarea
                            id={`prompt-${index}`}
                            value={prompt}
                            onChange={(e) => {
                              const newPrompts = [...editablePrompts];
                              newPrompts[index] = e.target.value;
                              setEditablePrompts(newPrompts);
                            }}
                            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all duration-200 text-gray-700 leading-relaxed bg-gray-50 focus:bg-white hover:bg-white"
                            rows={4}
                            placeholder="Enter your custom analysis prompt to optimize AI search visibility..."
                          />

                          {/* Character Counter */}
                          <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
                            {prompt.length} chars
                          </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${prompt.trim() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm text-gray-600">
                              {prompt.trim() ? 'Ready for analysis' : 'Prompt required'}
                            </span>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const newPrompts = [...editablePrompts];
                                newPrompts[index] = generatedPrompts[index] || '';
                                setEditablePrompts(newPrompts);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              Reset to Original
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setActiveTab('input'); // Go back to input tab
                    setEditablePrompts([...generatedPrompts]);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  ← Back to Business Info
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || editablePrompts.some(p => !p.trim())}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing...</span>
                    </span>
                  ) : (
                    'Run Analysis with These Prompts'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Section */}
      {isAnalyzing && (
        <div className="bg-white py-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                {/* Compact Robot Icon */}
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white animate-bounce">
                  🤖
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Analyzing {businessName}</h3>
                  <p className="text-sm text-gray-600">{currentStep}</p>
                </div>
              </div>

              {/* Compact Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                </div>
              </div>

              <div className="text-xs text-gray-500">{Math.round(progress)}% complete</div>
            </div>
          </div>
        </div>
      )}


      {/* AI Providers Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Testing Against {aiProviders.length} Major AI Engine{aiProviders.length !== 1 ? 's' : ''} with Smart Business Queries</h3>
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
              Each AI engine will be queried based on your business description and keywords.
              {businessName && (
                <>
                  {' '}We&apos;ll check if <strong>{businessName}</strong> appears in these AI-generated company lists to measure organic visibility.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">AEO Score Results</h2>

            {/* Overall Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 mb-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-6">Overall AEO Rankings for {businessName}</h3>

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
                          <div className={`text-sm font-bold px-3 py-1 rounded-full ${competitor.score >= 60 ? 'bg-red-100 text-red-800' :
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
                          <span className="text-xs text-gray-500">AEO Score</span>
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
              <span className="text-gray-600">One-click AEO optimization</span>
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

  )
}