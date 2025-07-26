'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
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

interface AeoScore {
  id: number;
  date: string;
  score: number;
  businessName: string;
  keywords: string[];
  visibility: number;
  ranking: number;
  relevance: number;
  accuracy: number;
  createdAt: string;
  updatedAt: string;
}

function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scores, setScores] = useState<AeoScore[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    // Check authentication and plan access
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user && user.plan !== 'professional' && user.plan !== 'enterprise') {
      router.push('/');
      return;
    }

    // Get business name from URL params
    const business = searchParams.get('business');
    if (business) {
      setBusinessName(business);
    }
  }, [user, loading, router, searchParams]);

  useEffect(() => {
    if (businessName && user) {
      fetchScores();
    }
  }, [businessName, days, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchScores = async () => {
    if (!businessName.trim()) return;

    setFetchLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/aeo-scores?businessName=${encodeURIComponent(businessName)}&days=${days}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch scores');
      }

      const data = await response.json();
      setScores(data);
    } catch (err: unknown) {
      console.error('Error fetching scores:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scores');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSearch = () => {
    if (businessName.trim()) {
      fetchScores();
    }
  };

  // Prepare chart data
  const chartData = {
    labels: scores.map(score => {
      const date = new Date(score.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'AEO Score',
        data: scores.map(score => score.score),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Visibility %',
        data: scores.map(score => score.visibility),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Ranking Score',
        data: scores.map(score => score.ranking),
        borderColor: 'rgb(245, 101, 101)',
        backgroundColor: 'rgba(245, 101, 101, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `AEO Performance for ${businessName}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user || (user.plan !== 'professional' && user.plan !== 'enterprise')) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard Access Required</h1>
            <p className="text-gray-600 mb-8">
              The AEO Dashboard is available for Professional and Enterprise plans only.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upgrade Your Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AEO Performance Dashboard</h1>
          <p className="text-gray-600">
            Track your AEO score over time and monitor your AI Engine Optimization performance.
          </p>
        </div>

        {/* Search Controls */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div>
              <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                id="days"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              disabled={!businessName.trim() || fetchLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              {fetchLoading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Chart */}
        {scores.length > 0 && (
          <div className="bg-white border rounded-lg p-6 mb-8">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Summary Stats */}
        {scores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Latest Score</h3>
              <p className="text-3xl font-bold text-blue-600">
                {scores[scores.length - 1]?.score || 0}
              </p>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Average Score</h3>
              <p className="text-3xl font-bold text-green-600">
                {Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)}
              </p>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Highest Score</h3>
              <p className="text-3xl font-bold text-purple-600">
                {Math.max(...scores.map(s => s.score))}
              </p>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Data Points</h3>
              <p className="text-3xl font-bold text-gray-600">
                {scores.length}
              </p>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!fetchLoading && scores.length === 0 && businessName && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
            <p className="text-gray-600 mb-4">
              No AEO scores found for &quot;{businessName}&quot; in the last {days} days.
            </p>
            <button
              onClick={() => router.push('/aeo-score')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Run AEO Analysis
            </button>
          </div>
        )}

        {/* Getting Started */}
        {!businessName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Welcome to Your AEO Dashboard</h3>
            <p className="text-blue-700 mb-4">
              Enter your business name above to view your AEO performance over time.
            </p>
            <p className="text-sm text-blue-600">
              Data is automatically saved when you run AEO analyses. Start by running an analysis to see your first data point.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}