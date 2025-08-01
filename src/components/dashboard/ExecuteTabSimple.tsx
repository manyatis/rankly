import { useState, useEffect } from 'react';
import ProgressLoader from '../ui/ProgressLoader';

interface ExecuteTabSimpleProps {
  businessId: number | null;
}

interface AnalysisResult {
  success: boolean;
  message: string;
  business: {
    id: number;
    name: string;
    url: string;
    industry: string;
    location: string;
    description: string;
  };
  usedStoredData: {
    keywords: string;
    prompts: string;
  };
  analysisResult: unknown;
}

interface UsageInfo {
  usageCount: number;
  maxUsage: number | string;
  canUse: boolean;
  tier: string;
}

export default function ExecuteTabSimple({ businessId }: ExecuteTabSimpleProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Fetch usage information on component mount and when analysis completes
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
      console.error('Error fetching usage info:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  useEffect(() => {
    fetchUsageInfo();
  }, []);

  const handleRunAnalysis = async () => {
    if (!businessId) {
      setError('No website selected. Please select a website from the sidebar first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setProgressMessage('Initializing analysis...');

    // Progress tracking with realistic timing for manual analysis
    const progressSteps = [
      { progress: 10, message: 'Loading stored business data...', duration: 1000 },
      { progress: 25, message: 'Retrieving previous prompts...', duration: 1500 },
      { progress: 40, message: 'Generating AEO analysis queries...', duration: 2000 },
      { progress: 60, message: 'Running queries across AI platforms...', duration: 8000 },
      { progress: 80, message: 'Processing rankings and competitors...', duration: 2000 },
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

    const progressInterval = setInterval(updateProgress, 100);

    try {
      const response = await fetch('/api/dashboard/execute-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Complete the progress
      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('Analysis complete!');
      
      // Show completion for a moment before showing results
      setTimeout(() => {
        setResult(data);
        setIsAnalyzing(false);
      }, 500);
      
      // Refresh usage info after successful analysis
      await fetchUsageInfo();
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setIsAnalyzing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  if (!businessId) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-6xl mb-6">SEARCH</div>
        <h2 className="text-2xl font-semibold text-white mb-4">No Website Selected</h2>
        <p className="text-gray-400 mb-8">
          Select a website from the sidebar to run AEO analysis, or use the <strong className="text-blue-400">&quot;Link New Website for Tracking&quot;</strong> button to add a new website.
        </p>
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-300 font-medium text-sm">New to AEO?</p>
              <p className="text-blue-200 text-sm mt-1">
                Simply enter any website URL and we&apos;ll automatically extract the business information and run your first analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Manual Analysis</h2>
          <p className="text-gray-400 mt-1">Run AEO analysis using stored website data and prompts</p>
        </div>
      </div>

      {/* Analysis Button Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-blue-400 text-5xl mb-4">FAST</div>
          <h3 className="text-xl font-semibold text-white mb-3">Quick Analysis</h3>
          <p className="text-gray-300 mb-6">
            Run AEO analysis using the stored website information and previous prompts, or generate new ones automatically.
          </p>
          
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || !usageInfo?.canUse}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Running Analysis...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Run AEO Analysis
              </>
            )}
          </button>
          
          {/* Usage Counter */}
          {usageInfo && (
            <div className="mt-4 text-center">
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
            <div className="mt-4 text-center">
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
            subtitle="This usually takes 15-25 seconds - Please keep this tab open"
            className="mt-6"
          />
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">How it Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">1</span>
            </div>
            <h4 className="font-medium text-white mb-2">Load Data</h4>
            <p className="text-gray-400 text-sm">Uses stored website information and recent prompts from your analysis history</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">2</span>
            </div>
            <h4 className="font-medium text-white mb-2">Generate/Use Prompts</h4>
            <p className="text-gray-400 text-sm">Automatically generates new prompts if none exist, or uses your most recent ones</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">3</span>
            </div>
            <h4 className="font-medium text-white mb-2">Analyze & Score</h4>
            <p className="text-gray-400 text-sm">Runs analysis across all AI providers and generates AEO scores with competitor data</p>
          </div>
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
              <p className="text-red-300 font-medium">Analysis Failed</p>
              <p className="text-red-200 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-green-300 font-medium">Analysis Complete!</p>
              <p className="text-green-200 text-sm mt-1">{result.message}</p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Website:</span>
                  <span className="ml-2 text-green-200">{result.business.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Industry:</span>
                  <span className="ml-2 text-green-200">{result.business.industry}</span>
                </div>
                <div>
                  <span className="text-gray-400">Keywords:</span>
                  <span className="ml-2 text-green-200">{result.usedStoredData.keywords}</span>
                </div>
                <div>
                  <span className="text-gray-400">Prompts:</span>
                  <span className="ml-2 text-green-200">{result.usedStoredData.prompts}</span>
                </div>
              </div>

              <p className="text-green-200 text-sm mt-3">
                Switch to the <strong>Trends</strong> tab to view your new ranking results!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}