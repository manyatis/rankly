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

interface TrendsTabProps {
  businessId: number;
}

export default function TrendsTab({ businessId }: TrendsTabProps) {
  const [rankingData, setRankingData] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);

  const fetchRankingData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dashboard/ranking-history?businessId=${businessId}&days=${timeRange}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch ranking data');
      }

      const data = await response.json();
      setRankingData(data.rankings);
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

  const chartData = {
    labels: rankingData.map(item => {
      const date = new Date(item.createdAt);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Average Rank',
        data: rankingData.map(item => item.averageRank || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'OpenAI Rank',
        data: rankingData.map(item => item.openaiRank || 0),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Claude Rank',
        data: rankingData.map(item => item.claudeRank || 0),
        borderColor: 'rgb(139, 69, 19)',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Perplexity Rank',
        data: rankingData.map(item => item.perplexityRank || 0),
        borderColor: 'rgb(245, 101, 101)',
        backgroundColor: 'rgba(245, 101, 101, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Ranking Trends - Last ${timeRange} Days`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Ranking Score'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
  };

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Ranking Trends</h2>
          <p className="text-gray-400 mt-1">Track your AEO performance over time</p>
        </div>
        
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

      {/* Stats Cards */}
      {latestData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <Line data={chartData} options={chartOptions} />
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
    </div>
  );
}