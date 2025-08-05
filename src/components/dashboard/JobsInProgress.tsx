import { useState, useEffect } from 'react';

interface AnalysisJob {
  id: string;
  websiteUrl: string;
  businessId: number | null;
  status: string;
  currentStep: string;
  progressPercent: number;
  progressMessage?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  isManualAnalysis: boolean;
}

interface JobsInProgressProps {
  refreshTrigger?: number; // Used to trigger refresh from parent
  onJobSelect?: (jobId: string) => void; // Callback when user selects a job
}

export default function JobsInProgress({ refreshTrigger, onJobSelect }: JobsInProgressProps) {
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/analysis-jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        setError(null);
      } else {
        throw new Error('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [refreshTrigger]);

  // Filter for active (non-completed) jobs
  const activeJobs = jobs.filter(job => 
    job.status !== 'completed' && job.status !== 'failed'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'bg-gray-600 text-gray-300';
      case 'processing': return 'bg-blue-600 text-blue-100';
      case 'prompt-forming': return 'bg-yellow-600 text-yellow-100';
      case 'model-analysis': return 'bg-purple-600 text-purple-100';
      case 'completed': return 'bg-green-600 text-green-100';
      case 'failed': return 'bg-red-600 text-red-100';
      default: return 'bg-gray-600 text-gray-300';
    }
  };

  const getStatusText = (status: string, currentStep: string) => {
    if (status === 'processing') {
      switch (currentStep) {
        case 'website-analysis': return 'Analyzing Website';
        case 'prompt-forming': return 'Generating Prompts';
        case 'model-analysis': return 'Running AI Analysis';
        default: return 'Processing';
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3">Jobs in Progress</h3>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span className="ml-2 text-gray-400">Loading jobs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3">Jobs in Progress</h3>
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-white">Jobs in Progress</h3>
        <button
          onClick={fetchJobs}
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh jobs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {activeJobs.length === 0 ? (
        <div className="text-center py-6">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 text-sm">No jobs currently running</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeJobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-gray-900 border border-gray-600 rounded-lg p-3 hover:border-gray-500 transition-colors cursor-pointer"
              onClick={() => onJobSelect?.(job.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {getStatusText(job.status, job.currentStep)}
                  </span>
                  {job.isManualAnalysis && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-300">
                      Manual
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{formatTimeAgo(job.createdAt)}</span>
              </div>
              
              <div className="text-sm text-white mb-1 truncate" title={job.websiteUrl}>
                {job.websiteUrl}
              </div>
              
              {job.progressMessage && (
                <div className="text-xs text-gray-400 mb-2">{job.progressMessage}</div>
              )}
              
              {job.status === 'processing' && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${job.progressPercent}%` }}
                  ></div>
                </div>
              )}
              
              {job.error && (
                <div className="text-xs text-red-400 mt-1">{job.error}</div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {jobs.length > activeJobs.length && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            {jobs.length - activeJobs.length} completed jobs available
          </p>
        </div>
      )}
    </div>
  );
}