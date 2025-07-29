import { useState, useEffect, useCallback } from 'react';

interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'quick' | 'moderate' | 'significant';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  status: 'new' | 'in_progress' | 'completed' | 'dismissed';
  aiProvider?: string;
  confidence?: number;
  recommendations: string[];
  currentScore?: number;
  potentialImprovement?: number;
  affectedQueries?: number;
}

interface AIInsightsTabProps {
  businessId: number | null;
}

export default function AIInsightsTab({ businessId }: AIInsightsTabProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCriticality, setFilterCriticality] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchInsights = useCallback(async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/ai-insights?businessId=${businessId}`);
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      } else {
        console.error('Failed to fetch AI insights:', response.status);
        setError('Failed to load AI insights');
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setError('Error loading AI insights');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchInsights();
    } else {
      setInsights([]);
      setLoading(false);
    }
  }, [businessId, fetchInsights]);

  const updateInsightStatus = async (insightId: string, status: AIInsight['status']) => {
    try {
      const response = await fetch(`/api/dashboard/ai-insights/${insightId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setInsights(prev => 
          prev.map(insight => 
            insight.id === insightId ? { ...insight, status } : insight
          )
        );
      }
    } catch (error) {
      console.error('Error updating insight status:', error);
    }
  };

  const getCriticalityColor = (criticality: AIInsight['criticality']) => {
    switch (criticality) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCriticalityIcon = (criticality: AIInsight['criticality']) => {
    switch (criticality) {
      case 'critical': return (
        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
        </svg>
      );
      case 'high': return (
        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
      );
      case 'medium': return (
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      );
      case 'low': return (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      );
      default: return (
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      );
    }
  };

  const getStatusColor = (status: AIInsight['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-900/20 text-blue-300 border-blue-700';
      case 'in_progress': return 'bg-yellow-900/20 text-yellow-300 border-yellow-700';
      case 'completed': return 'bg-green-900/20 text-green-300 border-green-700';
      case 'dismissed': return 'bg-gray-900/20 text-gray-400 border-gray-600';
      default: return 'bg-gray-900/20 text-gray-300 border-gray-600';
    }
  };

  const criticalityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  const filteredInsights = insights
    .filter(insight => {
      const criticalityMatch = filterCriticality === 'all' || insight.criticality === filterCriticality;
      const statusMatch = filterStatus === 'all' || insight.status === filterStatus;
      // By default, hide dismissed insights unless specifically filtering for them
      const shouldShow = filterStatus === 'dismissed' || insight.status !== 'dismissed';
      return criticalityMatch && statusMatch && shouldShow;
    })
    .sort((a, b) => criticalityOrder[a.criticality] - criticalityOrder[b.criticality]);

  const criticalInsights = insights.filter(i => i.criticality === 'critical').length;
  const highInsights = insights.filter(i => i.criticality === 'high').length;
  const newInsights = insights.filter(i => i.status === 'new').length;

  if (!businessId) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-500 text-6xl mb-6">🧠</div>
        <h2 className="text-3xl font-semibold text-white mb-4">No Business Selected</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Select a business from the sidebar to view AI-generated insights and recommendations.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading AI insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 text-6xl mb-6">⚠️</div>
        <h2 className="text-3xl font-semibold text-white mb-4">Error Loading Insights</h2>
        <p className="text-gray-400 mb-8">{error}</p>
        <button
          onClick={fetchInsights}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">AI Insights</h2>
        <p className="text-gray-400 mt-1">
          AI-generated recommendations and insights from your latest AEO analysis
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Insights</p>
              <p className="text-2xl font-bold text-white">{insights.length}</p>
            </div>
            <div className="text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-300">Critical Issues</p>
              <p className="text-2xl font-bold text-red-400">{criticalInsights}</p>
            </div>
            <div className="text-red-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-300">High Priority</p>
              <p className="text-2xl font-bold text-orange-400">{highInsights}</p>
            </div>
            <div className="text-orange-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300">New Insights</p>
              <p className="text-2xl font-bold text-blue-400">{newInsights}</p>
            </div>
            <div className="text-blue-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 0l-1 1m1-1l1 1M5 12H3m2 0l-1-1m1 1l-1 1m14-1h2m-2 0l1-1m-1 1l1 1M12 21v-1m0 0l-1-1m1 1l1-1"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-300">Criticality:</label>
          <select
            value={filterCriticality}
            onChange={(e) => setFilterCriticality(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-300">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-500 mb-6">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-semibold text-white mb-4">No Insights Available</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Run an AEO analysis to generate AI-powered insights and recommendations for your business.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{getCriticalityIcon(insight.criticality)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCriticalityColor(insight.criticality)}`}>
                        {insight.criticality.charAt(0).toUpperCase() + insight.criticality.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                    
                    {/* Metrics */}
                    {(insight.currentScore !== undefined || insight.potentialImprovement !== undefined || insight.affectedQueries !== undefined) && (
                      <div className="flex space-x-4 mb-3 text-sm">
                        {insight.currentScore !== undefined && (
                          <div className="text-gray-400">
                            Current Score: <span className="text-white font-medium">{insight.currentScore}/100</span>
                          </div>
                        )}
                        {insight.potentialImprovement !== undefined && (
                          <div className="text-gray-400">
                            Potential: <span className="text-green-400 font-medium">+{insight.potentialImprovement} points</span>
                          </div>
                        )}
                        {insight.affectedQueries !== undefined && (
                          <div className="text-gray-400">
                            Affected Queries: <span className="text-white font-medium">{insight.affectedQueries}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recommendations */}
                    {insight.recommendations.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-white mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 ml-4">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Meta Information */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Category: {insight.category}</span>
                      <span>•</span>
                      <span>Impact: {insight.impact}</span>
                      <span>•</span>
                      <span>Effort: {insight.effort}</span>
                      {insight.aiProvider && (
                        <>
                          <span>•</span>
                          <span>Source: {insight.aiProvider}</span>
                        </>
                      )}
                      {insight.confidence !== undefined && (
                        <>
                          <span>•</span>
                          <span>Confidence: {insight.confidence}%</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(insight.status)}`}>
                    {insight.status.replace('_', ' ').charAt(0).toUpperCase() + insight.status.replace('_', ' ').slice(1)}
                  </span>
                  
                  <div className="relative group">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="p-2">
                        <button
                          onClick={() => updateInsightStatus(insight.id, 'in_progress')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-md transition-colors"
                        >
                          Mark as In Progress
                        </button>
                        <button
                          onClick={() => updateInsightStatus(insight.id, 'completed')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-md transition-colors"
                        >
                          Mark as Completed
                        </button>
                        <button
                          onClick={() => updateInsightStatus(insight.id, 'dismissed')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-md transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}