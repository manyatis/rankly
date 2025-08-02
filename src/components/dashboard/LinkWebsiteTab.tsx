import { useState, useEffect } from 'react';
import ProgressLoader from '../ui/ProgressLoader';

interface LinkWebsiteTabProps {
  onWebsiteLinked: (businessId: number) => void;
  websiteLimitInfo?: {
    canAddWebsite: boolean;
    currentCount: number;
    limit: number;
    remainingSlots: number | null;
    tier: string;
    isUnlimited: boolean;
  } | null;
  pendingAnalysisUrl?: string | null;
  onClearPendingUrl?: () => void;
}

interface AnalysisJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progressPercent: number;
  progressMessage: string;
  error?: string;
  business?: {
    id: number;
    websiteName: string;
    websiteUrl: string;
    industry: string;
    location?: string;
    description: string;
  };
  extractedInfo?: {
    businessName: string;
    industry: string;
    location?: string;
    description: string;
    keywords: string[];
    confidence: number;
  };
}

interface WebsiteAnalysisResult {
  business: {
    id: number;
    name: string;
    url: string;
    industry: string;
    location: string;
    description: string;
  };
  extractedInfo: {
    businessName: string;
    industry: string;
    location?: string;
    description: string;
    keywords: string[];
    confidence: number;
  };
}

export default function LinkWebsiteTab({ onWebsiteLinked, websiteLimitInfo, pendingAnalysisUrl, onClearPendingUrl }: LinkWebsiteTabProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WebsiteAnalysisResult | null>(null);
  const [step, setStep] = useState<'input' | 'results'>('input');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [autoStartTriggered, setAutoStartTriggered] = useState(false);
  const [analysisJob, setAnalysisJob] = useState<AnalysisJob | null>(null);
  const [useAsyncMode, setUseAsyncMode] = useState(true); // Use async mode by default

  // Auto-populate URL and start analysis if provided from hero section
  useEffect(() => {
    if (pendingAnalysisUrl && !websiteUrl && !autoStartTriggered) {
      setWebsiteUrl(pendingAnalysisUrl);
      setAutoStartTriggered(true);
      if (onClearPendingUrl) {
        onClearPendingUrl();
      }
      
      // Auto-start the analysis after a brief delay to ensure state is set
      setTimeout(() => {
        handleAnalysisStart(pendingAnalysisUrl);
      }, 100);
    }
  }, [pendingAnalysisUrl, websiteUrl, autoStartTriggered, onClearPendingUrl]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      const interval = (window as any).__analysisInterval;
      if (interval) {
        clearInterval(interval);
        delete (window as any).__analysisInterval;
      }
    };
  }, []);

  const handleAnalysisStart = async (urlToAnalyze: string) => {
    const trimmedUrl = urlToAnalyze.trim();
    if (!trimmedUrl) {
      setError('Please enter a website URL');
      return;
    }

    // Basic URL validation
    let normalizedUrl = trimmedUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);
    setProgressMessage('Initializing analysis...');

    // Progress tracking with realistic timing
    const progressSteps = [
      { progress: 5, message: 'Connecting to website...', duration: 1000 },
      { progress: 15, message: 'Extracting website content...', duration: 2000 },
      { progress: 30, message: 'AI analyzing business information...', duration: 3000 },
      { progress: 45, message: 'Identifying industry and keywords...', duration: 2000 },
      { progress: 60, message: 'Generating AEO analysis prompts...', duration: 3000 },
      { progress: 75, message: 'Running queries across AI platforms...', duration: 8000 },
      { progress: 90, message: 'Processing rankings and competitors...', duration: 2000 },
      { progress: 95, message: 'Saving results to your dashboard...', duration: 1000 },
    ];

    // const currentStepIndex = 0; // Unused - kept for potential future use
    const startTime = Date.now();

    // Update progress based on realistic timing
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      
      // Find the appropriate step based on elapsed time
      let cumulativeTime = 0;
      for (let i = 0; i < progressSteps.length; i++) {
        cumulativeTime += progressSteps[i].duration;
        if (elapsed < cumulativeTime) {
          const step = progressSteps[i];
          const stepStartTime = cumulativeTime - step.duration;
          const stepProgress = Math.min((elapsed - stepStartTime) / step.duration, 1);
          
          const prevProgress = i > 0 ? progressSteps[i - 1].progress : 0;
          const currentProgress = prevProgress + (step.progress - prevProgress) * stepProgress;
          
          setProgress(Math.min(currentProgress, step.progress));
          if (stepProgress < 1) {
            setProgressMessage(step.message);
          }
          break;
        }
      }
    };

    if (useAsyncMode) {
      // Use async endpoint for background processing
      try {
        const response = await fetch('/api/analyze-url-async', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ websiteUrl: normalizedUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to start analysis');
        }

        // Store the job info
        setAnalysisJob(data);
        
        // Start polling for job status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/analyze-url-async?jobId=${data.jobId}`);
            const jobStatus = await statusResponse.json();
            
            setAnalysisJob(jobStatus);
            setProgress(jobStatus.progressPercent);
            setProgressMessage(jobStatus.progressMessage);
            
            if (jobStatus.status === 'completed') {
              clearInterval(pollInterval);
              clearInterval(progressInterval);
              
              // Transform to result format
              setResult({
                business: jobStatus.business,
                extractedInfo: jobStatus.extractedInfo,
              });
              setStep('results');
              setIsAnalyzing(false);
            } else if (jobStatus.status === 'failed') {
              clearInterval(pollInterval);
              clearInterval(progressInterval);
              throw new Error(jobStatus.error || 'Analysis failed');
            }
          } catch (error) {
            console.error('Error polling job status:', error);
          }
        }, 1000); // Poll every second
        
        // Store interval ID for cleanup
        (window as any).__analysisInterval = pollInterval;
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start analysis');
        setIsAnalyzing(false);
        setProgress(0);
        setProgressMessage('');
      }
    } else {
      // Original synchronous mode
      const progressInterval = setInterval(updateProgress, 100);

      try {
        const response = await fetch('/api/analyze-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ websiteUrl: normalizedUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to analyze website');
        }

        // Complete the progress
        clearInterval(progressInterval);
        setProgress(100);
        setProgressMessage('Analysis complete!');
        
        // Show completion for a moment before showing results
        setTimeout(() => {
          setResult(data);
          setStep('results');
          setIsAnalyzing(false);
        }, 500);
        
      } catch (err) {
        clearInterval(progressInterval);
        setError(err instanceof Error ? err.message : 'Failed to analyze website');
        setIsAnalyzing(false);
        setProgress(0);
        setProgressMessage('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAnalysisStart(websiteUrl);
  };

  const handleComplete = () => {
    if (result) {
      onWebsiteLinked(result.business.id);
      // Reset form for next use
      setWebsiteUrl('');
      setError(null);
      setResult(null);
      setStep('input');
    }
  };

  const handleReset = () => {
    setWebsiteUrl('');
    setError(null);
    setResult(null);
    setStep('input');
    setIsAnalyzing(false);
    setProgress(0);
    setProgressMessage('');
  };

  // Check if user has reached website limit
  const hasReachedLimit = websiteLimitInfo && !websiteLimitInfo.canAddWebsite;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Link New Website</h2>
          <p className="text-gray-400 mt-1">Add a website for AEO tracking and analysis</p>
        </div>
        {step === 'results' && !hasReachedLimit && (
          <button
            onClick={handleReset}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Link Another Website
          </button>
        )}
      </div>

      {/* Website Limit Reached */}
      {hasReachedLimit && (
        <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-orange-400 mr-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-orange-300 mb-2">Website Limit Reached</h3>
              <p className="text-orange-200 mb-4">
                You&apos;ve reached your website tracking limit ({websiteLimitInfo?.currentCount}/{websiteLimitInfo?.isUnlimited ? 'unlimited' : websiteLimitInfo?.limit} websites) 
                for the <strong>{websiteLimitInfo?.tier}</strong> tier.
              </p>
              <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4 mb-4">
                <h4 className="text-orange-300 font-medium mb-2">Current Usage:</h4>
                <div className="space-y-1 text-sm text-orange-200">
                  <div className="flex justify-between">
                    <span>Websites tracked:</span>
                    <span>{websiteLimitInfo?.currentCount}/{websiteLimitInfo?.isUnlimited ? 'unlimited' : websiteLimitInfo?.limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="capitalize">{websiteLimitInfo?.tier}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-orange-300 font-medium">Options to continue:</h4>
                <div className="space-y-2 text-sm text-orange-200">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong>Unlink a website</strong> - Go to any website&apos;s info tab and unlink it to free up a slot</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong>Upgrade your plan</strong> - Get more website slots and additional features</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <a 
                  href="#" 
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  Upgrade Plan
                </a>
                <button 
                  onClick={() => {/* Navigate to a business tab to unlink */}}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                >
                  Manage Websites
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'input' && !hasReachedLimit && (
        <>
          {/* Main Input Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="text-blue-400 text-6xl mb-6">LINK</div>
              <h3 className="text-xl font-semibold text-white mb-4">Add Website for Tracking</h3>
              <p className="text-gray-300 mb-8">
                Enter any website URL and we&apos;ll automatically extract business information, generate analysis prompts, and run your first AEO analysis.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 text-left">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="example.com or https://example.com"
                    disabled={isAnalyzing}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzing || !websiteUrl.trim()}
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center text-lg font-medium"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Link Website & Run Analysis
                    </>
                  )}
                </button>

                {/* Progress Bar */}
                <ProgressLoader
                  isLoading={isAnalyzing}
                  progress={progress}
                  message={progressMessage}
                  subtitle={useAsyncMode ? "Analysis running in background - You can navigate away" : "This usually takes 20-30 seconds - Please keep this tab open"}
                  className="mt-6"
                />
              </form>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-300 font-medium">Error</p>
                  <p className="text-red-200 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Usage Limits Display */}
          {usageInfo && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Usage Limits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Daily Usage */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-300">Daily Analysis</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      usageInfo.dailyUsage.canUse ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {usageInfo.tier.charAt(0).toUpperCase() + usageInfo.tier.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      {usageInfo.dailyUsage.isUnlimited ? 'Unlimited' : 
                        `${usageInfo.dailyUsage.current}/${usageInfo.dailyUsage.limit}`
                      }
                    </span>
                    <span className={`text-sm ${
                      usageInfo.dailyUsage.canUse ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {usageInfo.dailyUsage.canUse ? '✓ Available' : '✗ Limit Reached'}
                    </span>
                  </div>
                  {!usageInfo.dailyUsage.isUnlimited && (
                    <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(usageInfo.dailyUsage.current / usageInfo.dailyUsage.limit) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Rate Limit */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-300">Rate Limit (5 min)</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      usageInfo.rateLimit?.canUse !== false ? 'bg-green-900 text-green-300' : 'bg-orange-900 text-orange-300'
                    }`}>
                      {usageInfo.rateLimit?.canUse !== false ? 'Available' : 'Cooldown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      {usageInfo.rateLimit ? 
                        `${usageInfo.rateLimit.remaining} remaining` : 
                        'Available'
                      }
                    </span>
                    {usageInfo.rateLimit && !usageInfo.rateLimit.canUse && (
                      <span className="text-sm text-orange-400">
                        Wait {usageInfo.rateLimit.waitMinutes}m
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Usage Help */}
              <div className="mt-4 text-sm text-gray-400">
                <p>
                  <strong>Daily Limit:</strong> Total analyses per day. Resets at midnight UTC.
                </p>
                <p className="mt-1">
                  <strong>Rate Limit:</strong> Prevents rapid successive requests. Resets every 5 minutes.
                </p>
              </div>
            </div>
          )}

          {/* How it Works */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">How it Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-medium text-white mb-2">Extract Information</h4>
                <p className="text-gray-400 text-sm">AI analyzes the website content to automatically extract business details, industry, and relevant keywords</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-medium text-white mb-2">Run Initial Analysis</h4>
                <p className="text-gray-400 text-sm">Generates optimized prompts and performs AEO analysis across ChatGPT, Claude, and Perplexity</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-medium text-white mb-2">Start Tracking</h4>
                <p className="text-gray-400 text-sm">Website is linked to your organization and ready for ongoing AEO monitoring and competitor analysis</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">What You Get</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-white font-medium">Automatic Business Info</p>
                  <p className="text-gray-400">Industry, location, description extracted from website</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-white font-medium">Competitor Discovery</p>
                  <p className="text-gray-400">Identifies top competitors automatically</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-white font-medium">Multi-AI Analysis</p>
                  <p className="text-gray-400">Rankings across ChatGPT, Claude, Perplexity</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-white font-medium">Historical Tracking</p>
                  <p className="text-gray-400">Trend analysis and ranking history</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {step === 'results' && result && (
        <>
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-400 mr-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-green-300 mb-2">Website Successfully Linked!</h3>
                <p className="text-green-200">
                  Initial AEO analysis has been completed and the website is now being tracked in your organization.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Website Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                  <div className="space-y-1">
                    <p className="text-white font-medium text-lg">{result.business.name}</p>
                    <a 
                      href={result.business.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      {result.business.url}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Industry</label>
                  <p className="text-white">{result.business.industry}</p>
                </div>
                {result.business.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                    <p className="text-white">{result.business.location}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <p className="text-white text-sm">{result.business.description}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Generated Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.extractedInfo.keywords.map((keyword, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-blue-300 font-medium">Next Steps</p>
                  <p className="text-blue-200 text-sm mt-1">
                    Click &quot;Continue to Dashboard&quot; to view your initial AEO rankings in the <strong>Trends</strong> tab, 
                    check competitor analysis in the <strong>Competitors</strong> tab, or run additional analyses.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleComplete}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-lg font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Continue to Dashboard
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}