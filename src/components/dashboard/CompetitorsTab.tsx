import { useEffect, useState, useCallback } from 'react';

interface CompetitorRanking {
  id: number;
  name: string;
  website?: string;
  confidence: number;
  identifiedBy: string;
  createdAt: string;
  latestRanking?: {
    openaiRank?: number;
    claudeRank?: number;
    perplexityRank?: number;
    googleRank?: number;
    averageRank?: number;
    lastUpdated: string;
  };
}

interface MainBusinessInfo {
  id: number;
  name: string;
  website?: string;
  latestRanking?: {
    openaiRank?: number;
    claudeRank?: number;
    perplexityRank?: number;
    googleRank?: number;
    averageRank?: number;
    lastUpdated: string;
  };
}

interface CompetitorsTabProps {
  businessId: number;
}

export default function CompetitorsTab({ businessId }: CompetitorsTabProps) {
  const [competitors, setCompetitors] = useState<CompetitorRanking[]>([]);
  const [mainBusiness, setMainBusiness] = useState<MainBusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitorRankings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dashboard/competitor-rankings?businessId=${businessId}&days=30`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch competitor rankings');
      }

      const data = await response.json();
      
      // Sort competitors by average rank (highest first, then by name for ties)
      const sortedCompetitors = (data.competitors || []).sort((a: CompetitorRanking, b: CompetitorRanking) => {
        const aAvg = a.latestRanking?.averageRank;
        const bAvg = b.latestRanking?.averageRank;
        
        // Put competitors with no data at the end
        if (!aAvg && !bAvg) return a.name.localeCompare(b.name);
        if (!aAvg) return 1;
        if (!bAvg) return -1;
        
        // Sort by average rank (highest first)
        if (bAvg !== aAvg) return bAvg - aAvg;
        
        // If tied, sort by name alphabetically
        return a.name.localeCompare(b.name);
      });
      
      setCompetitors(sortedCompetitors);
      setMainBusiness(data.mainBusiness);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch competitor rankings');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchCompetitorRankings();
    }
  }, [businessId, fetchCompetitorRankings]);

  const getRankColor = (rank?: number) => {
    if (rank === undefined || rank === null) return 'text-gray-400';
    if (rank >= 80) return 'text-green-400';
    if (rank >= 60) return 'text-yellow-400';
    if (rank >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRankBadge = (rank?: number) => {
    if (rank === undefined || rank === null) return 'N/A';
    return `${rank}/100`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-600 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-64 animate-pulse"></div>
          </div>
        </div>

        {/* Main Business Skeleton */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="h-6 bg-gray-600 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-4 bg-gray-600 rounded w-16 mx-auto mb-2 animate-pulse"></div>
                <div className="h-8 bg-gray-700 rounded w-12 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitors Skeleton */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="h-6 bg-gray-600 rounded w-40 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-600 rounded w-32 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-48 animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-gray-600 rounded w-16 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="text-center">
                      <div className="h-4 bg-gray-600 rounded w-12 mx-auto mb-1 animate-pulse"></div>
                      <div className="h-6 bg-gray-700 rounded w-8 mx-auto animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-300 mb-2">Error Loading Competitors</h3>
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchCompetitorRankings}
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
          <h2 className="text-2xl font-bold text-white">Competitor Rankings</h2>
          <p className="text-gray-400 mt-1">Compare your website performance against top competitors</p>
        </div>
      </div>

      {/* Main Business Rankings */}
      {mainBusiness && (
        <div className="bg-gray-800 border border-blue-600 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-medium text-white">Your Website</h3>
          </div>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-medium text-white">{mainBusiness.name}</h4>
              {mainBusiness.website && (
                <a 
                  href={mainBusiness.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {mainBusiness.website}
                </a>
              )}
            </div>
            {mainBusiness.latestRanking && (
              <span className="text-xs text-gray-400">
                Updated {formatDate(mainBusiness.latestRanking.lastUpdated)}
              </span>
            )}
          </div>

          {mainBusiness.latestRanking ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-sm mb-1">OpenAI</p>
                <p className={`text-lg font-semibold ${getRankColor(mainBusiness.latestRanking.openaiRank)}`}>
                  {getRankBadge(mainBusiness.latestRanking.openaiRank)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Claude</p>
                <p className={`text-lg font-semibold ${getRankColor(mainBusiness.latestRanking.claudeRank)}`}>
                  {getRankBadge(mainBusiness.latestRanking.claudeRank)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Perplexity</p>
                <p className={`text-lg font-semibold ${getRankColor(mainBusiness.latestRanking.perplexityRank)}`}>
                  {getRankBadge(mainBusiness.latestRanking.perplexityRank)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Google</p>
                <p className={`text-lg font-semibold ${getRankColor(mainBusiness.latestRanking.googleRank)}`}>
                  {getRankBadge(mainBusiness.latestRanking.googleRank)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Average</p>
                <p className={`text-lg font-semibold ${getRankColor(mainBusiness.latestRanking.averageRank)}`}>
                  {getRankBadge(mainBusiness.latestRanking.averageRank)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">No ranking data available</p>
              <p className="text-gray-500 text-sm mt-1">Run an analysis to see rankings</p>
            </div>
          )}
        </div>
      )}

      {/* Competitors */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Top 8 Competitors</h3>
        
        {competitors.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-4xl mb-4">🔍</div>
            <h4 className="text-lg font-medium text-white mb-2">No Competitors Found</h4>
            <p className="text-gray-400 mb-4">
              Competitors are automatically identified during AEO analysis.
            </p>
            <p className="text-gray-500 text-sm">
              Run an analysis to discover your competitors and see their rankings.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={competitor.id} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-gray-400 text-sm mr-3">#{index + 1}</span>
                      <h4 className="font-medium text-white">{competitor.name}</h4>
                    </div>
                    {competitor.website && (
                      <a 
                        href={competitor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm ml-8"
                      >
                        {competitor.website}
                      </a>
                    )}
                  </div>
                  {competitor.latestRanking && (
                    <span className="text-xs text-gray-400">
                      Updated {formatDate(competitor.latestRanking.lastUpdated)}
                    </span>
                  )}
                </div>

                {competitor.latestRanking ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center ml-8">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">OpenAI</p>
                      <p className={`font-medium ${getRankColor(competitor.latestRanking.openaiRank)}`}>
                        {getRankBadge(competitor.latestRanking.openaiRank)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Claude</p>
                      <p className={`font-medium ${getRankColor(competitor.latestRanking.claudeRank)}`}>
                        {getRankBadge(competitor.latestRanking.claudeRank)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Perplexity</p>
                      <p className={`font-medium ${getRankColor(competitor.latestRanking.perplexityRank)}`}>
                        {getRankBadge(competitor.latestRanking.perplexityRank)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Google</p>
                      <p className={`font-medium ${getRankColor(competitor.latestRanking.googleRank)}`}>
                        {getRankBadge(competitor.latestRanking.googleRank)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Average</p>
                      <p className={`font-medium ${getRankColor(competitor.latestRanking.averageRank)}`}>
                        {getRankBadge(competitor.latestRanking.averageRank)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 ml-8">
                    <p className="text-gray-500 text-sm">No ranking data available</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3">Ranking Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            <span className="text-gray-300">Excellent (80-100)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
            <span className="text-gray-300">Good (60-79)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
            <span className="text-gray-300">Fair (40-59)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
            <span className="text-gray-300">Poor (0-39)</span>
          </div>
        </div>
      </div>
    </div>
  );
}