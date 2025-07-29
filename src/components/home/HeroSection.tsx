import Link from 'next/link';

interface HeroSectionProps {
  onCreateAccount: () => void;
}

export default function HeroSection({ onCreateAccount }: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Analyze Your Site&apos;s AI Visibility
          </h1>
          <p className="text-lg text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
            Get 1 site analysis free - See how your website ranks across all major AI engines and get actionable optimization recommendations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            <Link href="/dashboard" className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg text-base sm:text-lg">
              Analyze Your Site Free
            </Link>
            <button
              onClick={onCreateAccount}
              className="bg-white text-blue-600 border-2 border-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-base sm:text-lg cursor-pointer"
            >
              View Dashboard
            </button>
          </div>

          {/* Top Models Section */}
          <div className="mt-12 sm:mt-16">
            <p className="text-gray-300 text-sm sm:text-base mb-6 sm:mb-8 font-medium">
              Analyze your site&apos;s visibility across all major AI engines:
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8">
              {/* ChatGPT */}
              <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-600">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-300">ChatGPT</span>
              </div>

              {/* Perplexity */}
              <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-600">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.958-.896 3.728-2.043 5.146-.706.866-1.544 1.59-2.465 2.079-.915.485-1.885.75-2.88.75s-1.965-.265-2.88-.75c-.921-.489-1.759-1.213-2.465-2.079-1.147-1.418-1.874-3.188-2.043-5.146C2.644 7.15 2.518 6.05 2.518 5s.126-2.15.274-3.16c.169-1.958.896-3.728 2.043-5.146C5.541-4.172 6.379-4.896 7.3-5.385 8.215-5.87 9.185-6.135 10.18-6.135s1.965.265 2.88.75c.921.489 1.759 1.213 2.465 2.079 1.147 1.418 1.874 3.188 2.043 5.146.148 1.01.274 2.11.274 3.16s-.126 2.15-.274 3.16z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-300">Perplexity</span>
              </div>

              {/* Claude */}
              <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-600">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-300">Claude</span>
              </div>

              {/* Google AI Overviews */}
              <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-600">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-300">Google AI Overviews</span>
              </div>

              {/* Grok */}
              <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-600">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-300">Grok</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}