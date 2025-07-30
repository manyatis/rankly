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
  createdAt: string;
  openaiRank?: number;
  claudeRank?: number;
  perplexityRank?: number;
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
}

export default function TrendsTab({ businessId }: TrendsTabProps) {
  const [rankingData, setRankingData] = useState<RankingData[]>([]);
  const [queryResults, setQueryResults] = useState<QueryResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);

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

      // Fetch query results
      const queryResponse = await fetch(
        `/api/dashboard/query-results?businessId=${businessId}&days=${timeRange}`
      );
      
      if (queryResponse.ok) {
        const queryData = await queryResponse.json();
        setQueryResults(queryData.queryResults || []);
      } else {
        // If query results fail, continue without them
        console.warn('Failed to fetch query results');
        setQueryResults([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ranking data');
    } finally {
      setLoading(false);
    }
  }, [businessId, timeRange]);

  useEffect(() => {
    if (businessId) {
      fetchRankingData();
    }
  }, [businessId, timeRange, fetchRankingData]);

  // Generate chart data dynamically including competitors
  const generateChartData = () => {
    const labels = rankingData.map(item => {
      const date = new Date(item.createdAt);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const datasets = [
      {
        label: 'Average Rank',
        data: rankingData.map(item => item.averageRank || null),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 4,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'OpenAI',
        data: rankingData.map(item => item.openaiRank || null),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Claude',
        data: rankingData.map(item => item.claudeRank || null),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Perplexity',
        data: rankingData.map(item => item.perplexityRank || null),
        borderColor: 'rgb(248, 113, 113)',
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      }
    ];

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
    if (!current || !previous) return null;
    return current - previous;
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
            className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      {latestData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Average Rank</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                {latestData.averageRank || 0}
              </span>
              {calculateChange(latestData.averageRank, previousData?.averageRank) !== null && (
                <span className={`ml-2 text-sm ${
                  calculateChange(latestData.averageRank, previousData?.averageRank)! > 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {calculateChange(latestData.averageRank, previousData?.averageRank)! > 0 ? '+' : ''}
                  {calculateChange(latestData.averageRank, previousData?.averageRank)}
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">OpenAI Rank</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-400">
                {latestData.openaiRank || 0}
              </span>
              {calculateChange(latestData.openaiRank, previousData?.openaiRank) !== null && (
                <span className={`ml-2 text-sm ${
                  calculateChange(latestData.openaiRank, previousData?.openaiRank)! > 0 
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {calculateChange(latestData.openaiRank, previousData?.openaiRank)! > 0 ? '+' : ''}
                  {calculateChange(latestData.openaiRank, previousData?.openaiRank)}
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Claude Rank</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-orange-400">
                {latestData.claudeRank || 0}
              </span>
              {calculateChange(latestData.claudeRank, previousData?.claudeRank) !== null && (
                <span className={`ml-2 text-sm ${
                  calculateChange(latestData.claudeRank, previousData?.claudeRank)! > 0 
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {calculateChange(latestData.claudeRank, previousData?.claudeRank)! > 0 ? '+' : ''}
                  {calculateChange(latestData.claudeRank, previousData?.claudeRank)}
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Perplexity Rank</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-red-400">
                {latestData.perplexityRank || 0}
              </span>
              {calculateChange(latestData.perplexityRank, previousData?.perplexityRank) !== null && (
                <span className={`ml-2 text-sm ${
                  calculateChange(latestData.perplexityRank, previousData?.perplexityRank)! > 0 
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {calculateChange(latestData.perplexityRank, previousData?.perplexityRank)! > 0 ? '+' : ''}
                  {calculateChange(latestData.perplexityRank, previousData?.perplexityRank)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Chart */}
      {rankingData.length > 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-6">
          <div className="h-64 sm:h-80 lg:h-96">
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
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-white">Query Analysis</h3>
              <p className="text-gray-400 text-sm mt-1">
                Detailed results from {queryResults.length} queries across AI platforms
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round((queryResults.filter(q => q.mentioned).length / queryResults.length) * 100)}%
              </div>
              <div className="text-xs text-gray-400">Mentioned</div>
            </div>
          </div>

          {/* Query Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <h4 className="text-md font-medium text-white mb-3">Recent Queries</h4>
            {queryResults.slice(0, 10).map((query) => (
              <div key={query.id} className="border border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-4">
                    <p className="text-white font-medium mb-1">{query.query}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        query.aiProvider === 'openai' ? 'bg-green-900 text-green-300' :
                        query.aiProvider === 'claude' ? 'bg-orange-900 text-orange-300' :
                        query.aiProvider === 'perplexity' ? 'bg-red-900 text-red-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {query.aiProvider.toUpperCase()}
                      </span>
                      <span className="text-gray-400">
                        {new Date(query.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {query.mentioned ? (
                      <div>
                        <div className="text-green-400 font-medium">✓ Mentioned</div>
                        {query.rankPosition && (
                          <div className="text-xs text-gray-400">Position {query.rankPosition}</div>
                        )}
                        {query.relevanceScore && (
                          <div className="text-xs text-gray-400">Relevance {query.relevanceScore}%</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-red-400 font-medium">✗ Not Mentioned</div>
                    )}
                  </div>
                </div>
                
                {/* Response Preview */}
                <details className="group">
                  <summary className="cursor-pointer text-sm text-blue-400 hover:text-blue-300 mb-2 group-open:mb-3">
                    View AI Response ({query.wordCount} words)
                  </summary>
                  <div className="bg-gray-900 rounded-md p-3 text-sm text-gray-300 max-h-32 overflow-y-auto">
                    {query.response.length > 300 ? 
                      query.response.substring(0, 300) + '...' : 
                      query.response
                    }
                  </div>
                </details>
              </div>
            ))}
            
            {queryResults.length > 10 && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  Showing 10 of {queryResults.length} queries. 
                  <span className="text-blue-400"> View more in detailed analysis.</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}