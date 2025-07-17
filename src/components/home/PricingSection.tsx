interface PricingSectionProps {
  onCreateAccount: () => void;
  onPlanSelection: (planId: string) => void;
}

export default function PricingSection({ onCreateAccount, onPlanSelection }: PricingSectionProps) {
  return (
    <div id="pricing" className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Flexible Pricing</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create your account to access our free AEO Score tool and get pre-release discounts on our comprehensive analytics platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm flex flex-col h-full">
            <div className="text-center mb-6 lg:mb-8">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">$0</div>
              <p className="text-gray-600 text-sm lg:text-base">Requires account creation</p>
            </div>
            <ul className="space-y-3 lg:space-y-4 mb-6 lg:mb-8 flex-grow">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Limited to 3 models only
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                1 usage per day
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Basic visibility analysis
              </li>
            </ul>
            <button
              onClick={onCreateAccount}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium cursor-pointer"
            >
              Create Account
            </button>
          </div>

          {/* Indie Plan */}
          <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border-2 border-green-500 relative flex flex-col h-full">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-500 text-white px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-medium">On Sale</span>
            </div>
            <div className="text-center mb-6 lg:mb-8">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Indie</h3>
              <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2">
                <div className="text-xl lg:text-2xl text-gray-400 line-through">$45</div>
                <div className="text-3xl lg:text-4xl font-bold text-green-600">$20</div>
              </div>
              <p className="text-gray-600 text-sm lg:text-base">per month (limited time offer)</p>
            </div>
            <ul className="space-y-3 lg:space-y-4 mb-6 lg:mb-8 flex-grow">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Access to all models
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                5 usage per day
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Weekly/daily automatic email reports
              </li>
            </ul>
            <button
              onClick={() => onPlanSelection('indie')}
              disabled={true}
              className="w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed font-medium opacity-60"
            >
              Coming Soon
            </button>
          </div>

          {/* Professional Plan */}
          <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border-2 border-blue-500 relative flex flex-col h-full">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-medium">Pre-Release</span>
            </div>
            <div className="text-center mb-6 lg:mb-8">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2">
                <div className="text-xl lg:text-2xl text-gray-400 line-through">$150</div>
                <div className="text-3xl lg:text-4xl font-bold text-blue-600">$75</div>
              </div>
              <p className="text-gray-600 text-sm lg:text-base">per month (create account before release for discount)</p>
            </div>
            <ul className="space-y-3 lg:space-y-4 mb-6 lg:mb-8 flex-grow">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete coverage of all AI models
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited AEO analysis
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced analytics dashboard
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Competitor tracking
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Weekly/daily automatic email reports
              </li>
            </ul>
            <button
              disabled
              className="w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed font-medium opacity-60"
            >
              Coming Soon
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border-2 border-blue-500 relative flex flex-col h-full">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-medium">Pre-Release</span>
            </div>
            <div className="text-center mb-6 lg:mb-8">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2">
                <div className="text-xl lg:text-2xl text-gray-400 line-through">$500</div>
                <div className="text-3xl lg:text-4xl font-bold text-blue-600">$250</div>
              </div>
              <p className="text-gray-600 text-sm lg:text-base">per month (create account before release for discount)</p>
            </div>
            <ul className="space-y-3 lg:space-y-4 mb-6 lg:mb-8 flex-grow">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Everything in Professional
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Expert consultation
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI-insights & recommendations
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Custom action plans
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Development support
              </li>
            </ul>
            <button
              disabled
              className="w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed font-medium opacity-60"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}