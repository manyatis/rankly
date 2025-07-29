interface BusinessInfoStepProps {
  businessName: string;
  setBusinessName: (name: string) => void;
  industry: string;
  setIndustry: (industry: string) => void;
  location: string;
  setLocation: (location: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (url: string) => void;
  businessDescription: string;
  setBusinessDescription: (description: string) => void;
  keywords: string;
  handleKeywordsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  parseKeywords: (keywordString: string) => string[];
  handleGeneratePrompts: () => void;
  isAnalyzing: boolean;
  user: { email: string } | null;
  usageInfo: { canUse: boolean } | null;
  generatePromptsRateLimit: {
    canUse: boolean;
    waitMinutes: number;
  };
  businessId?: number | null;
  isLoadingBusinessInfo?: boolean;
}

export default function BusinessInfoStep({
  businessName,
  setBusinessName,
  industry,
  setIndustry,
  location,
  setLocation,
  websiteUrl,
  setWebsiteUrl,
  businessDescription,
  setBusinessDescription,
  keywords,
  handleKeywordsChange,
  parseKeywords,
  handleGeneratePrompts,
  isAnalyzing,
  user,
  usageInfo,
  generatePromptsRateLimit,
  businessId,
  isLoadingBusinessInfo = false
}: BusinessInfoStepProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {businessId ? 'Business Information' : 'Step 2: Confirm Business Information'}
        </h3>
        <p className="text-gray-400">
          {businessId 
            ? 'Review your business information and add keywords for analysis'
            : 'Review and edit the extracted information as needed'
          }
        </p>
      </div>
      
      <div className="space-y-6">
        {isLoadingBusinessInfo && businessId ? (
          // Loading skeleton
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-600 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            <div>
              <div className="h-4 bg-gray-600 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-24 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-600 rounded w-28 mb-2 animate-pulse"></div>
              <div className="h-20 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <div className="h-12 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        ) : (
          // Actual form
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Business Name
              {businessId && <span className="text-xs text-gray-400 ml-2">(locked)</span>}
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name"
              className={`w-full p-4 border border-gray-600 rounded-lg focus:ring-2 focus:border-blue-500 outline-none placeholder-gray-400 ${
                businessId 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed focus:ring-gray-500' 
                  : 'bg-gray-700 text-white focus:ring-blue-500'
              }`}
              readOnly={businessId ? true : false}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Enter your industry"
              className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Location (Optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location"
              className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Website URL
              {businessId && <span className="text-xs text-gray-400 ml-2">(locked)</span>}
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="Enter your website URL"
              className={`w-full p-4 border border-gray-600 rounded-lg focus:ring-2 focus:border-blue-500 outline-none placeholder-gray-400 ${
                businessId 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed focus:ring-gray-500' 
                  : 'bg-gray-700 text-white focus:ring-blue-500'
              }`}
              readOnly={businessId ? true : false}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Business Description</label>
          <textarea
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            rows={4}
            placeholder="Describe your business, products, or services..."
            className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Keywords (Up to 10)
            {businessId && keywords && <span className="text-xs text-green-400 ml-2">(loads from recent analysis)</span>}
          </label>
          <textarea
            value={keywords}
            onChange={handleKeywordsChange}
            rows={3}
            placeholder="Enter relevant keywords separated by commas"
            className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-400">
              {businessId && keywords 
                ? 'Keywords from your most recent analysis. You can edit them for this new analysis.'
                : 'These keywords help generate more targeted and relevant prompts.'
              }
            </p>
            <span className="text-xs text-gray-500">
              {parseKeywords(keywords).length}/10 keywords
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={handleGeneratePrompts}
            disabled={isAnalyzing || !businessName.trim() || !industry.trim() || !businessDescription.trim() || !keywords.trim() || !user || !usageInfo || (usageInfo && !usageInfo.canUse) || !generatePromptsRateLimit.canUse}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Generating Prompts...
              </span>
            ) : (
              '🧠 Generate AI Prompts'
            )}
          </button>
          
          {/* Rate limit error message */}
          {!generatePromptsRateLimit.canUse && user?.email && (
            <div className="flex items-center justify-center space-x-2 text-sm mt-2">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400">
                Too frequent. Try again in {generatePromptsRateLimit.waitMinutes} minute{generatePromptsRateLimit.waitMinutes !== 1 ? 's' : ''}.
              </span>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}