import Link from 'next/link';
import AIEngineCarousel from './AIEngineCarousel';
import WebsiteAnalysisInput from '../WebsiteAnalysisInput';

interface HeroSectionProps {
  onCreateAccount: () => void;
}

export default function HeroSection({ onCreateAccount }: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              Boost your site&apos;s rank among the top AI models
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-4 sm:mb-6 leading-relaxed">
              Increase exposure to millions of customers as AI usages continue to soar.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-6 sm:mb-8 lg:mb-12">
              <Link href="/dashboard" className="bg-gray-700 text-white px-4 sm:px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors font-medium shadow-lg text-sm order-2 sm:order-1 flex-shrink-0">
                Get Started
              </Link>
              <WebsiteAnalysisInput
                onLoginRequired={onCreateAccount}
                placeholder="Enter your website URL"
                buttonText="Analyze Your Site"
                size="small"
                className="flex-1 sm:max-w-sm order-1 sm:order-2"
              />
            </div>

            {/* AI Models Carousel Section */}
            <div className="mt-4 sm:mt-6">
              <AIEngineCarousel />
            </div>
          </div>

          {/* Right Column - Video Only */}
          {/* <div className="order-1 lg:order-2">
            Demo Video
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-black">
              <video 
                controls 
                muted
                autoPlay
                playsInline
                className="w-full h-auto aspect-video min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px]"
                poster="/video-poster.jpg"
              >
                <source src="/Rankly Demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}