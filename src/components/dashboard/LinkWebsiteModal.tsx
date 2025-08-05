import { useState } from 'react';

interface LinkWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (businessId: number) => void;
}

interface WebsiteAnalysisResult {
  business: {
    id: number;
    name: string;
    url: string;
    industry: string;
    location: string;
    description: string;
  };
  extractedInfo: {
    businessName: string;
    industry: string;
    location?: string;
    description: string;
    keywords: string[];
    confidence: number;
  };
}

export default function LinkWebsiteModal({ isOpen, onClose, onSuccess }: LinkWebsiteModalProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WebsiteAnalysisResult | null>(null);
  const [step, setStep] = useState<'input' | 'results'>('input');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteUrl.trim()) {
      setError('Please enter a website URL');
      return;
    }

    // Basic URL validation
    let normalizedUrl = websiteUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteUrl: normalizedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze website');
      }

      setResult(data);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze website');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleComplete = () => {
    if (result) {
      onSuccess(result.business.id);
      handleClose();
    }
  };

  const handleClose = () => {
    setWebsiteUrl('');
    setError(null);
    setResult(null);
    setStep('input');
    setIsAnalyzing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Link New Website</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isAnalyzing}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'input' && (
          <>
            <p className="text-gray-300 mb-6">
              Enter a website URL to automatically extract business information and set up AEO tracking.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website URL
                </label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="example.com or https://example.com"
                  disabled={isAnalyzing}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-red-300 font-medium">Error</p>
                      <p className="text-red-200 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing || !websiteUrl.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing Website...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Link Website
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* How it Works */}
            <div className="mt-6 bg-gray-700/50 border border-gray-600 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-3">How it Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">1</span>
                  </div>
                  <p className="text-gray-300 font-medium">Extract Info</p>
                  <p className="text-gray-400 text-xs">AI analyzes website content to extract business details</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">2</span>
                  </div>
                  <p className="text-gray-300 font-medium">Run Analysis</p>
                  <p className="text-gray-400 text-xs">Performs initial AEO analysis across AI platforms</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">3</span>
                  </div>
                  <p className="text-gray-300 font-medium">Start Tracking</p>
                  <p className="text-gray-400 text-xs">Website is linked and ready for ongoing monitoring</p>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 'results' && result && (
          <>
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-green-300 font-medium">Website Successfully Linked!</p>
                  <p className="text-green-200 text-sm mt-1">
                    Initial AEO analysis has been completed and the website is now being tracked.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Website Information</h3>
                <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Website:</span>
                    <p className="text-white font-medium">{result.business.name}</p>
                    <a 
                      href={result.business.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      {result.business.url}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Industry:</span>
                    <p className="text-white">{result.business.industry}</p>
                  </div>
                  {result.business.location && (
                    <div>
                      <span className="text-gray-400 text-sm">Location:</span>
                      <p className="text-white">{result.business.location}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 text-sm">Description:</span>
                    <p className="text-white text-sm">{result.business.description}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-3">Extracted Keywords</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {result.extractedInfo.keywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-300 font-medium text-sm">Next Steps</p>
                    <p className="text-blue-200 text-sm mt-1">
                      View your initial AEO rankings in the <strong>Trends</strong> tab, check competitor analysis in the <strong>Competitors</strong> tab, or run additional analyses in the <strong>Manual Analysis</strong> tab.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Continue to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}