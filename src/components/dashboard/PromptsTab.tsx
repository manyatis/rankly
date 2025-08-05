import { useEffect, useState, useCallback } from 'react';

interface PromptHistory {
  id: number;
  prompts: string[];
  keywords: string[];
  createdAt: string;
  runUuid?: string;
}

interface PromptsTabProps {
  businessId: number;
}

export default function PromptsTab({ businessId }: PromptsTabProps) {
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptHistory | null>(null);

  const fetchPromptHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dashboard/prompts?businessId=${businessId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch prompt history');
      }

      const data = await response.json();
      setPromptHistory(data.prompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompt history');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchPromptHistory();
    }
  }, [businessId, fetchPromptHistory]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-8 bg-gray-600 rounded w-44 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-72 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prompt List Skeleton */}
          <div className="space-y-4">
            <div className="h-6 bg-gray-600 rounded w-32 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-4 bg-gray-600 rounded w-20 animate-pulse"></div>
                    <div className="h-3 bg-gray-700 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="mb-2">
                    <div className="h-3 bg-gray-600 rounded w-16 mb-1 animate-pulse"></div>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, idx) => (
                        <div key={idx} className="h-5 bg-gray-700 rounded w-12 animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                  <div className="h-3 bg-gray-700 rounded w-24 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Details Skeleton */}
          <div>
            <div className="h-6 bg-gray-600 rounded w-32 mb-4 animate-pulse"></div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
              <div className="w-12 h-12 bg-gray-600 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-64 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-300 mb-2">Error Loading Prompts</h3>
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchPromptHistory}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Prompt History</h2>
        <p className="text-gray-400 mt-1">Review prompts used in previous AEO analyses</p>
      </div>

      {promptHistory.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Prompts Found</h3>
          <p className="text-gray-400 mb-4">
            No prompt history found for this business.
          </p>
          <p className="text-sm text-gray-500">
            Run an AEO analysis to start building your prompt history.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prompt List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Recent Analyses</h3>
            <div className="space-y-3">
              {promptHistory.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPrompt(item)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPrompt?.id === item.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-white">
                      Analysis #{promptHistory.length - index}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-400">Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.keywords.slice(0, 3).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                      {item.keywords.length > 3 && (
                        <span className="inline-block bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded">
                          +{item.keywords.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    {item.prompts.length} prompt{item.prompts.length !== 1 ? 's' : ''} used
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Details */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Prompt Details</h3>
            {selectedPrompt ? (
              <div className="space-y-4">
                {/* Analysis Info */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Analysis Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-400">Date:</span>
                      <span className="ml-2 text-white">
                        {new Date(selectedPrompt.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {selectedPrompt.runUuid && (
                      <div>
                        <span className="font-medium text-gray-400">Run ID:</span>
                        <span className="ml-2 text-white font-mono text-xs">
                          {selectedPrompt.runUuid}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-400">Total Prompts:</span>
                      <span className="ml-2 text-white">{selectedPrompt.prompts.length}</span>
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Keywords Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-900 text-blue-300 text-sm px-3 py-1 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prompts */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Prompts</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedPrompt.prompts.map((prompt, index) => (
                      <div key={index} className="border-l-4 border-blue-600 pl-4 py-2">
                        <div className="text-xs font-medium text-gray-400 mb-1">
                          Prompt {index + 1}
                        </div>
                        <div className="text-sm text-white bg-gray-700 p-3 rounded">
                          {prompt}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <div className="text-gray-500 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-400">Select an analysis from the list to view prompt details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}