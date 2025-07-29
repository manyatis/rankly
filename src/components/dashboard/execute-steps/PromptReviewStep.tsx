interface PromptReviewStepProps {
  editablePrompts: string[];
  setEditablePrompts: (prompts: string[]) => void;
  currentPromptIndex: number;
  setCurrentPromptIndex: (index: number) => void;
  handleAnalyze: () => void;
  isAnalyzing: boolean;
  progress: number;
  user: { email: string } | null;
  usageInfo: { canUse: boolean } | null;
}

export default function PromptReviewStep({
  editablePrompts,
  setEditablePrompts,
  currentPromptIndex,
  setCurrentPromptIndex,
  handleAnalyze,
  isAnalyzing,
  progress,
  user,
  usageInfo
}: PromptReviewStepProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Step 3: Review & Edit Prompts</h3>
        <p className="text-gray-400">Review the generated prompts and make any adjustments before analysis</p>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-white">Generated Prompts</h4>
          <div className="text-sm text-gray-400">
            {currentPromptIndex + 1} of {editablePrompts.length} prompts
          </div>
        </div>

        {editablePrompts.length > 0 && (
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <label className="block text-sm font-medium text-white mb-2">
                Prompt {currentPromptIndex + 1}
              </label>
              <textarea
                value={editablePrompts[currentPromptIndex] || ''}
                onChange={(e) => {
                  const newPrompts = [...editablePrompts];
                  newPrompts[currentPromptIndex] = e.target.value;
                  setEditablePrompts(newPrompts);
                }}
                rows={4}
                className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPromptIndex(Math.max(0, currentPromptIndex - 1))}
                  disabled={currentPromptIndex === 0}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentPromptIndex(Math.min(editablePrompts.length - 1, currentPromptIndex + 1))}
                  disabled={currentPromptIndex === editablePrompts.length - 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
              
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !user || !usageInfo || (usageInfo && !usageInfo.canUse)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isAnalyzing ? (
                  <span className="flex items-center">
                    <div className="relative w-8 h-8 mr-3">
                      <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                        <circle
                          cx="16"
                          cy="16"
                          r="12"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          className="opacity-25"
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="12"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 12}`}
                          strokeDashoffset={`${2 * Math.PI * 12 * (1 - progress / 100)}`}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">
                        {Math.round(progress)}%
                      </div>
                    </div>
                    Analyzing...
                  </span>
                ) : (
                  '🚀 Start AEO Analysis'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}