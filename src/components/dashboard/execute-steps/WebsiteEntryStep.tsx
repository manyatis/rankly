interface WebsiteEntryStepProps {
  websiteUrlForExtraction: string;
  setWebsiteUrlForExtraction: (url: string) => void;
  isExtractingInfo: boolean;
  handleExtractWebsiteInfo: () => void;
  user: { email: string } | null;
  usageInfo: { canUse: boolean } | null;
  analyzeWebsiteRateLimit: {
    canUse: boolean;
    waitMinutes: number;
  };
}

export default function WebsiteEntryStep({
  websiteUrlForExtraction,
  setWebsiteUrlForExtraction,
  isExtractingInfo,
  handleExtractWebsiteInfo,
  user,
  usageInfo,
  analyzeWebsiteRateLimit
}: WebsiteEntryStepProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Step 1: Enter Your Website</h3>
        <p className="text-gray-400">We&apos;ll analyze your website and extract business information automatically</p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-600/30">
        <h4 className="text-lg font-semibold text-white mb-4">🧠 Website Analysis</h4>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Website URL</label>
          <input
            type="url"
            value={websiteUrlForExtraction}
            onChange={(e) => setWebsiteUrlForExtraction(e.target.value)}
            placeholder="Enter your website URL (e.g., https://yoursite.com)"
            className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
          />
          <div className="mt-2 text-sm text-gray-300">
            <strong>AI will extract:</strong> Business name, industry, location, description, and SEO keywords automatically
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            onClick={handleExtractWebsiteInfo}
            disabled={isExtractingInfo || !websiteUrlForExtraction.trim() || !user || !usageInfo || (usageInfo && !usageInfo.canUse) || !analyzeWebsiteRateLimit.canUse}
            className="bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExtractingInfo ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing Website...</span>
              </span>
            ) : (
              '🔍 Analyze Website'
            )}
          </button>
          
          {/* Rate limit error message */}
          {!analyzeWebsiteRateLimit.canUse && user?.email && (
            <div className="flex items-center space-x-2 text-sm">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400">
                Too frequent. Try again in {analyzeWebsiteRateLimit.waitMinutes} minute{analyzeWebsiteRateLimit.waitMinutes !== 1 ? 's' : ''}.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}