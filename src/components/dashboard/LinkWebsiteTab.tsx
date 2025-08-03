import { useState, useEffect, useCallback } from 'react';
import ProgressLoader from '../ui/ProgressLoader';
import JobsInProgress from './JobsInProgress';

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
  id: string;
  status: 'not-started' | 'processing' | 'prompt-forming' | 'model-analysis' | 'completed' | 'failed';
  currentStep: string;
  progressPercent: number;
  progressMessage?: string;
  error?: string;
  businessId?: number;
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
  const [analysisJob, setAnalysisJob] = useState<AnalysisJob | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [usageInfo, setUsageInfo] = useState<{
    usageCount: number;
    maxUsage: number | string;
    canUse: boolean;
    tier: string;
  } | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [jobsRefreshTrigger, setJobsRefreshTrigger] = useState(0);

  // Auto-populate URL if provided from hero section
  useEffect(() => {
    if (pendingAnalysisUrl && !websiteUrl) {
      setWebsiteUrl(pendingAnalysisUrl);
      if (onClearPendingUrl) {
        onClearPendingUrl();
      }
    }
  }, [pendingAnalysisUrl, websiteUrl, onClearPendingUrl]);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Fetch usage info on component mount
  useEffect(() => {
    fetchUsageInfo();
  }, []);

  const fetchUsageInfo = async () => {
    try {
      const response = await fetch('/api/usage-check');
      if (response.ok) {
        const data = await response.json();
        setUsageInfo({
          usageCount: data.usageCount,
          maxUsage: data.maxUsage,
          canUse: data.canUse,
          tier: data.tier
        });
      }
    } catch (error) {
      console.error('Failed to fetch usage info:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const startJobPolling = useCallback((jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/analyze-url-async?jobId=${jobId}`);
        if (!statusResponse.ok) {
          console.error('Failed to fetch job status');
          return;
        }
        
        const jobStatus = await statusResponse.json();
        setAnalysisJob(jobStatus);
        setProgress(jobStatus.progressPercent || 0);
        setProgressMessage(jobStatus.progressMessage || 'Processing...');
        
        if (jobStatus.status === 'completed') {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          
          // Get business info from completed job
          if (jobStatus.businessId) {
            // Fetch business details for results display
            try {
              const businessResponse = await fetch(`/api/dashboard/businesses/${jobStatus.businessId}`);
              if (businessResponse.ok) {
                const businessData = await businessResponse.json();
                setResult({
                  business: {
                    id: businessData.id,
                    name: businessData.websiteName,
                    url: businessData.websiteUrl,
                    industry: businessData.industry,
                    location: businessData.location,
                    description: businessData.description
                  },
                  extractedInfo: jobStatus.extractedInfo || {
                    businessName: businessData.websiteName,
                    industry: businessData.industry,
                    location: businessData.location,
                    description: businessData.description,
                    keywords: [],
                    confidence: 100
                  }
                });
                setStep('results');
              }
            } catch (error) {
              console.error('Failed to fetch business details:', error);
            }
          }
          
          setIsAnalyzing(false);
          await fetchUsageInfo();
          setJobsRefreshTrigger(prev => prev + 1);
        } else if (jobStatus.status === 'failed') {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          setError(jobStatus.error || 'Analysis failed');
          setIsAnalyzing(false);
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    }, 2000); // Poll every 2 seconds
    
    setPollingInterval(interval);
  }, [pollingInterval]);

  const handleAnalysisStart = useCallback(async (urlToAnalyze: string) => {
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
    setProgressMessage('Creating analysis job...');

    try {
      // Create analysis job
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

      // Store the job info and start polling
      setAnalysisJob(data);
      startJobPolling(data.jobId);
      setJobsRefreshTrigger(prev => prev + 1);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
      setIsAnalyzing(false);
      setProgress(0);
      setProgressMessage('');
    }
  }, [startJobPolling]);

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

  // Handle selecting a job from the jobs list
  const handleJobSelect = (jobId: string) => {
    console.log('📊 Selected job for monitoring:', jobId);
    
    // Check if this job is already being monitored
    if (analysisJob?.id === jobId) {
      return;
    }
    
    // Start monitoring the selected job
    setAnalysisJob({ id: jobId } as AnalysisJob);
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);
    setProgressMessage('Connecting to job...');
    
    // Start polling for this job
    startJobPolling(jobId);
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
              {/* <div className="text-blue-400 text-6xl mb-6">LINK</div> */}
              <h3 className="text-xl font-semibold text-white mb-4">Add Website for Tracking</h3>
              <p className="text-gray-300 mb-8">
                Enter any website URL and we&apos;ll automatically extract business information, generate analysis prompts, and run your first AEO analysis. <span className="text-gray-400">(~4 minutes)</span>
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
                  disabled={isAnalyzing || !websiteUrl.trim() || !usageInfo?.canUse}
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
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

                {/* Usage Counter */}
                {usageInfo && (
                  <div className="text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-700 border border-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className={`${!usageInfo.canUse ? 'text-red-400' : 'text-gray-300'}`}>
                        {usageInfo.usageCount}/{usageInfo.maxUsage === -1 ? 'unlimited' : usageInfo.maxUsage} 
                        <span className="text-gray-400 ml-1">analyses used</span>
                      </span>
                    </div>
                    {!usageInfo.canUse && (
                      <p className="text-red-400 text-sm mt-2">Daily analysis limit reached</p>
                    )}
                  </div>
                )}
                
                {loadingUsage && (
                  <div className="text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-700 border border-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                      <span className="text-gray-300">Loading usage...</span>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <ProgressLoader
                  isLoading={isAnalyzing}
                  progress={progress}
                  message={progressMessage}
                  subtitle="Analysis running in background - You can navigate away and return later"
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

          {/* Jobs in Progress */}
          <JobsInProgress 
            refreshTrigger={jobsRefreshTrigger}
            onJobSelect={handleJobSelect}
          />

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