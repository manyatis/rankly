import { useRouter } from 'next/navigation';

interface AIProvider {
  name: string;
  model: string;
  color: string;
}

interface CompetitorInfo {
  name: string;
  mentions: number;
  score: number;
}

interface QueryResult {
  query: string;
  response: string;
  mentioned: boolean;
  rankPosition: number;
  relevanceScore: number;
}

interface ScoringResult {
  provider: AIProvider;
  response: string;
  aeoScore: number;
  analysis: string;
  queryVariations: QueryResult[];
  overallVisibility: number;
  competitorAnalysis: CompetitorInfo[];
  missedResponses: QueryResult[];
}

interface ResultsStepProps {
  results: ScoringResult[];
  overallCompetitors: CompetitorInfo[];
  queryIndexes: {[key: number]: number};
  setQueryIndexes: React.Dispatch<React.SetStateAction<{[key: number]: number}>>;
}

export default function ResultsStep({
  results,
  overallCompetitors: _overallCompetitors,
  queryIndexes,
  setQueryIndexes
}: ResultsStepProps) {
  const router = useRouter();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Step 4: Analysis Results</h3>
        <p className="text-gray-400">Your AEO analysis is complete! Review your rankings and insights below.</p>
      </div>

      {/* AI Insights Button - Moved to top */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-blue-300 mb-2">🧠 AI Insights Available</h4>
        <p className="text-blue-200 mb-4">
          Get detailed recommendations on how to improve your AEO rankings based on this analysis.
        </p>
        <button
          onClick={() => {
            router.push('/dashboard?tab=insights');
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          📊 View AI Insights
        </button>
      </div>

      
      <div className="space-y-6">
        {results.map((result, index) => {
          const currentQueryIndex = queryIndexes[index] || 0;
          
          const updateQueryIndex = (newIndex: number) => {
            setQueryIndexes(prev => ({
              ...prev,
              [index]: newIndex
            }));
          };
          
          return (
            <div key={index} className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${result.provider.color}`}>
                    {result.provider.name}
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className={`text-2xl font-bold ${getScoreColor(result.aeoScore)}`}>
                    {result.aeoScore}/100
                  </span>
                  <span className={`text-sm ${getScoreColor(result.aeoScore)}`}>
                    {getScoreLabel(result.aeoScore)}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <h5 className="text-white font-medium mb-2">Analysis Summary</h5>
                <p className="text-gray-300 text-sm">{result.analysis}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h6 className="text-white font-medium mb-2">Visibility Score</h6>
                  <div className="text-2xl font-bold text-blue-400">{result.overallVisibility.toFixed(1)}%</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h6 className="text-white font-medium mb-2">Mentioned In</h6>
                  <div className="text-2xl font-bold text-green-400">
                    {result.queryVariations.filter(q => q.mentioned).length}/{result.queryVariations.length}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h6 className="text-white font-medium mb-2">Avg Rank Position</h6>
                  <div className="text-2xl font-bold text-purple-400">
                    {result.queryVariations.filter(q => q.mentioned).length > 0 
                      ? Math.round(result.queryVariations.filter(q => q.mentioned).reduce((sum, q) => sum + q.rankPosition, 0) / result.queryVariations.filter(q => q.mentioned).length)
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>

              {/* Query Results - Scrollable */}
              {result.queryVariations.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h6 className="text-white font-medium">Query Results</h6>
                    <div className="text-sm text-gray-400">
                      {currentQueryIndex + 1} of {result.queryVariations.length}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={`border rounded-lg p-4 ${
                      result.queryVariations[currentQueryIndex]?.mentioned 
                        ? 'bg-green-900/30 border-green-600' 
                        : 'bg-red-900/30 border-red-600'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            result.queryVariations[currentQueryIndex]?.mentioned ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          <span className="text-sm font-medium text-white">
                            Query {currentQueryIndex + 1}
                          </span>
                          {result.queryVariations[currentQueryIndex]?.mentioned && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Rank {result.queryVariations[currentQueryIndex].rankPosition} • 
                              Score {result.queryVariations[currentQueryIndex].relevanceScore}
                            </span>
                          )}
                          {!result.queryVariations[currentQueryIndex]?.mentioned && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Not Found
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-300 mb-3 font-medium">
                        &quot;{result.queryVariations[currentQueryIndex]?.query}&quot;
                      </div>
                      
                      <div className="text-sm text-gray-300 bg-gray-900 p-3 rounded border border-gray-600 max-h-32 overflow-y-auto">
                        {result.queryVariations[currentQueryIndex]?.response}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateQueryIndex(Math.max(0, currentQueryIndex - 1))}
                          disabled={currentQueryIndex === 0}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ← Previous
                        </button>
                        <button
                          onClick={() => updateQueryIndex(Math.min(result.queryVariations.length - 1, currentQueryIndex + 1))}
                          disabled={currentQueryIndex === result.queryVariations.length - 1}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next →
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        {result.queryVariations.filter(q => q.mentioned).length} found, {result.queryVariations.filter(q => !q.mentioned).length} missed
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}