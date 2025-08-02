import { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RankingData {
  id: number;
  date: string;
  createdAt: string;
  openaiRank?: number;
  claudeRank?: number;
  perplexityRank?: number;
  googleRank?: number;
  averageRank?: number;
  websiteScore?: number;
}

interface QueryResultData {
  id: number;
  query: string;
  aiProvider: string;
  response: string;
  mentioned: boolean;
  rankPosition?: number;
  relevanceScore?: number;
  wordCount?: number;
  businessDensity?: number;
  createdAt: string;
}

interface TrendsTabProps {
  businessId: number;
  featureFlags?: Record<string, boolean>;
}

interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalCount: number;
}

export default function TrendsTab({ businessId, featureFlags = {} }: TrendsTabProps) {
  const [rankingData, setRankingData] = useState<RankingData[]>([]);
  const [queryResults, setQueryResults] = useState<QueryResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loadingQueries, setLoadingQueries] = useState(false);

  const fetchRankingData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch main business ranking data
      const rankingResponse = await fetch(
        `/api/dashboard/ranking-history?businessId=${businessId}&days=${timeRange}`
      );
      
      if (!rankingResponse.ok) {
        throw new Error('Failed to fetch ranking data');
      }

      const rankingData = await rankingResponse.json();
      setRankingData(rankingData.rankings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ranking data');
    } finally {
      setLoading(false);
    }
  }, [businessId, timeRange]);

  const fetchQueryResults = useCallback(async (page: number = 1) => {
    setLoadingQueries(true);

    try {
      // Fetch query results from the latest run only, with pagination
      const queryResponse = await fetch(
        `/api/dashboard/query-results?businessId=${businessId}&days=${timeRange}&page=${page}&limit=10&latestRunOnly=true`
      );
      
      if (queryResponse.ok) {
        const queryData = await queryResponse.json();
        setQueryResults(queryData.queryResults || []);
        setPagination(queryData.pagination);
      } else {
        // If query results fail, continue without them
        console.warn('Failed to fetch query results');
        setQueryResults([]);
        setPagination(null);
      }
    } catch (err) {
      console.warn('Failed to fetch query results:', err);
      setQueryResults([]);
      setPagination(null);
    } finally {
      setLoadingQueries(false);
    }
  }, [businessId, timeRange]);


  useEffect(() => {
    if (businessId) {
      fetchRankingData();
      fetchQueryResults(1);
      setCurrentPage(1);
    }
  }, [businessId, timeRange, fetchRankingData, fetchQueryResults]);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchQueryResults(newPage);
  };

  // Generate chart data dynamically including competitors
  const generateChartData = () => {
    // Generate complete date range for the time period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);
    
    const dateRange: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Create labels from the complete date range
    const labels = dateRange.map(date => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    });
    
    // Map data to the complete date range
    const mapDataToDateRange = (field: keyof RankingData) => {
      return dateRange.map(date => {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        const dataPoint = rankingData.find(item => {
          const itemDate = new Date(item.date).toISOString().split('T')[0];
          return itemDate === dateStr;
        });
        
        // Skip data points where all ranking values are 0 (invalid data)
        if (dataPoint && field !== 'websiteScore') {
          const hasValidRankingData = (dataPoint.openaiRank || 0) > 0 || 
                                     (dataPoint.claudeRank || 0) > 0 || 
                                     (dataPoint.perplexityRank || 0) > 0 ||
                                     (dataPoint.googleRank || 0) > 0;
          if (!hasValidRankingData) {
            return null;
          }
        }
        
        return dataPoint ? dataPoint[field] || null : null;
      });
    };

    const datasets = [
      {
        label: 'Average Rank',
        data: mapDataToDateRange('averageRank'),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 4,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'OpenAI',
        data: mapDataToDateRange('openaiRank'),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Claude',
        data: mapDataToDateRange('claudeRank'),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Perplexity',
        data: mapDataToDateRange('perplexityRank'),
        borderColor: 'rgb(248, 113, 113)',
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      }
    ];

    // Only add Google dataset if feature flag is enabled
    if (featureFlags.googleAI) {
      datasets.push({
        label: 'Google',
        data: mapDataToDateRange('googleRank'),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      });
    }

    return { labels, datasets };
  };


  const chartData = generateChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: `Ranking Trends - Last ${timeRange} Days`,
        font: {
          size: 14
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          font: {
            size: 10
          },
          maxRotation: 45,
          minRotation: 0
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  // Get latest and previous data for summary cards
  const latestData = rankingData[rankingData.length - 1];
  const previousData = rankingData[rankingData.length - 2];

  const calculateChange = (current?: number, previous?: number) => {
    if (current === undefined || current === null) return null;
    if (previous === undefined || previous === null) return null;
    return current - previous;
  };

  const formatChange = (change: number | null) => {
    if (change === null) return null;
    if (change === 0) return '+0';
    return change > 0 ? `+${change}` : `${change}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-600 rounded w-40 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-56 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-600 rounded w-32 animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="h-4 bg-gray-600 rounded w-20 mb-2 animate-pulse"></div>
              <div className="flex items-center">
                <div className="h-8 bg-gray-700 rounded w-12 animate-pulse"></div>
                <div className="h-4 bg-gray-600 rounded w-8 ml-2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="h-6 bg-gray-600 rounded w-48 mb-6 animate-pulse"></div>
          <div className="h-80 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-300 mb-2">Error Loading Trends</h3>
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchRankingData}
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Ranking Trends</h2>
          <p className="text-gray-400 mt-1">
            Track your AEO performance over time
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value) as 7 | 14 | 30)}
            className="px-4 py-2.5 bg-gray-800 text-white text-sm font-medium border border-gray-600 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-500 hover:bg-gray-750 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25rem 1.25rem',
              paddingRight: '2.5rem'
            }}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      {latestData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4" title="Today's Average Rank">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Average Rank</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                {latestData.averageRank || 0}
              </span>
              {(() => {
                const change = calculateChange(latestData.averageRank, previousData?.averageRank);
                const formattedChange = formatChange(change);
                if (formattedChange !== null) {
                  return (
                    <span className={`ml-2 text-sm ${
                      change === 0 ? 'text-gray-400' :
                      change! > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formattedChange}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4" title="Today's OpenAI Rank">
            <h3 className="text-sm font-medium text-gray-400 mb-1">OpenAI Rank</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-400">
                {latestData.openaiRank || 0}
              </span>
              {(() => {
                const change = calculateChange(latestData.openaiRank, previousData?.openaiRank);
                const formattedChange = formatChange(change);
                if (formattedChange !== null) {
                  return (
                    <span className={`ml-2 text-sm ${
                      change === 0 ? 'text-gray-400' :
                      change! > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formattedChange}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4" title="Today's Claude Rank">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Claude Rank</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-orange-400">
                {latestData.claudeRank || 0}
              </span>
              {(() => {
                const change = calculateChange(latestData.claudeRank, previousData?.claudeRank);
                const formattedChange = formatChange(change);
                if (formattedChange !== null) {
                  return (
                    <span className={`ml-2 text-sm ${
                      change === 0 ? 'text-gray-400' :
                      change! > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formattedChange}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4" title="Today's Perplexity Rank">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Perplexity Rank</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-red-400">
                {latestData.perplexityRank || 0}
              </span>
              {(() => {
                const change = calculateChange(latestData.perplexityRank, previousData?.perplexityRank);
                const formattedChange = formatChange(change);
                if (formattedChange !== null) {
                  return (
                    <span className={`ml-2 text-sm ${
                      change === 0 ? 'text-gray-400' :
                      change! > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formattedChange}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {featureFlags.googleAI && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4" title="Today's Google Rank">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Google Rank</h3>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-blue-400">
                  {latestData.googleRank || 0}
                </span>
                {(() => {
                  const change = calculateChange(latestData.googleRank, previousData?.googleRank);
                  const formattedChange = formatChange(change);
                  if (formattedChange !== null) {
                    return (
                      <span className={`ml-2 text-sm ${
                        change === 0 ? 'text-gray-400' :
                        change! > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formattedChange}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
        </div>
      )}


      {/* Chart */}
      {rankingData.length > 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-6 overflow-hidden">
          <div className="h-64 sm:h-80 lg:h-96 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Ranking Data</h3>
          <p className="text-gray-400 mb-4">
            No ranking history found for this business in the last {timeRange} days.
          </p>
          <p className="text-sm text-gray-500">
            Run an AEO analysis to start tracking performance trends.
          </p>
        </div>
      )}

      {/* Query Results Section */}
      {queryResults.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-medium text-white">Query Analysis</h3>
              <p className="text-gray-400 text-sm mt-1 break-words">
                Latest analysis run {pagination ? `(${pagination.totalCount} queries total)` : `(${queryResults.length} queries)`}
              </p>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round((queryResults.filter(q => q.mentioned).length / queryResults.length) * 100)}%
              </div>
              <div className="text-xs text-gray-400">Mentioned</div>
            </div>
          </div>

          {/* Query Results Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-green-400">
                {queryResults.filter(q => q.mentioned).length}
              </div>
              <div className="text-sm text-gray-400">Mentioned</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-red-400">
                {queryResults.filter(q => !q.mentioned).length}
              </div>
              <div className="text-sm text-gray-400">Not Mentioned</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-blue-400">
                {queryResults.filter(q => q.mentioned && q.rankPosition).length > 0 
                  ? Math.round(queryResults
                      .filter(q => q.mentioned && q.rankPosition)
                      .reduce((sum, q) => sum + q.rankPosition!, 0) / 
                    queryResults.filter(q => q.mentioned && q.rankPosition).length)
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-gray-400">Avg Position</div>
            </div>
          </div>

          {/* Individual Query Results */}
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium text-white">
                {loadingQueries ? 'Loading Queries...' : 'Latest Run Queries'}
              </h4>
              {pagination && (
                <div className="text-sm text-gray-400">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
              )}
            </div>
            {queryResults.map((query) => (
              <div key={query.id} className="border border-gray-600 rounded-lg p-3 sm:p-4 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0 sm:pr-4">
                    <p className="text-white font-medium mb-1 break-words">{query.query}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        query.aiProvider === 'openai' ? 'bg-green-900 text-green-300' :
                        query.aiProvider === 'claude' ? 'bg-orange-900 text-orange-300' :
                        query.aiProvider === 'perplexity' ? 'bg-red-900 text-red-300' :
                        query.aiProvider === 'google' ? 'bg-blue-900 text-blue-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {query.aiProvider.toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-xs sm:text-sm">
                        {new Date(query.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    {query.mentioned ? (
                      <div>
                        <div className="text-green-400 font-medium text-sm">Mentioned</div>
                        {query.rankPosition && (
                          <div className="text-xs text-gray-400">Position {query.rankPosition}</div>
                        )}
                        {query.relevanceScore && (
                          <div className="text-xs text-gray-400">Relevance {query.relevanceScore}%</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-red-400 font-medium text-sm">Not Mentioned</div>
                    )}
                  </div>
                </div>
                
                {/* Response Preview */}
                <details className="group">
                  <summary className="cursor-pointer text-sm text-blue-400 hover:text-blue-300 mb-2 group-open:mb-3">
                    View AI Response ({query.wordCount} words)
                  </summary>
                  <div className="bg-gray-900 rounded-md p-2 sm:p-3 text-xs sm:text-sm text-gray-300 max-h-32 overflow-y-auto overflow-x-hidden break-words whitespace-pre-wrap">
                    {query.response.length > 300 ? 
                      query.response.substring(0, 300) + '...' : 
                      query.response
                    }
                  </div>
                </details>
              </div>
            ))}
            
            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 py-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage || loadingQueries}
                  className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loadingQueries}
                        className={`px-3 py-2 rounded-md text-sm ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage || loadingQueries}
                  className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            )}
            
            {pagination && (
              <div className="text-center text-sm text-gray-400 py-2">
                Showing {queryResults.length} of {pagination.totalCount} queries from latest analysis
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}