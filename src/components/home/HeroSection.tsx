import Link from 'next/link';
import AIEngineCarousel from './AIEngineCarousel';
import WebsiteAnalysisInput from '../WebsiteAnalysisInput';

interface HeroSectionProps {
  onCreateAccount: () => void;
}

export default function HeroSection({ onCreateAccount }: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Track Your Brand&apos;s AI Engine Visibility
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 leading-relaxed">
              Monitor how ChatGPT, Claude, Perplexity, Google AI Overviews, and more recommend your business. 
              Get AEO insights to improve your brand visibility in AI search results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8 sm:mb-12">
              <Link href="/dashboard" className="bg-gray-700 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors font-medium shadow-lg text-sm">
                Get Started
              </Link>
              <WebsiteAnalysisInput
                onLoginRequired={onCreateAccount}
                placeholder="Enter your website URL"
                buttonText="Analyze Your Site"
                size="small"
                className="flex-1 max-w-sm"
              />
            </div>

            {/* AI Models Carousel Section */}
            <AIEngineCarousel />
          </div>

          {/* Right Column - Video Only */}
          <div>
            {/* Demo Video */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              <video 
                controls 
                muted
                autoPlay
                playsInline
                className="w-full h-auto min-h-[300px] sm:min-h-[350px] lg:min-h-[400px]"
                poster="/video-poster.jpg"
              >
                <source src="/Rankly Demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}