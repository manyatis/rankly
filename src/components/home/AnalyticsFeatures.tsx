import WebsiteAnalysisInput from '../WebsiteAnalysisInput';

interface AnalyticsFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface AnalyticsSlide {
  title: string;
  subtitle: string;
  component: React.ReactNode;
}

interface AnalyticsFeaturesProps {
  features: AnalyticsFeature[];
  analyticsSlides: AnalyticsSlide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onCreateAccount: () => void;
}

export default function AnalyticsFeatures({ 
  features, 
  analyticsSlides, 
  currentSlide, 
  onSlideChange, 
  onCreateAccount 
}: AnalyticsFeaturesProps) {
  const nextSlide = () => {
    onSlideChange((currentSlide + 1) % analyticsSlides.length);
  };

  const prevSlide = () => {
    onSlideChange(currentSlide === 0 ? analyticsSlides.length - 1 : currentSlide - 1);
  };

  return (
    <div id="features" className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Comprehensive Analytics Suite</h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to monitor, analyze, and optimize your search presence across traditional and AI-powered platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Analytics Carousel */}
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 lg:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium border border-gray-500 z-20 shadow-lg">
            🔍 Preview
          </div>
          <div className="animate-pulse absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform translate-x-[-100%] animate-shimmer"></div>
          
          {/* Carousel Container */}
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {analyticsSlides.map((slide, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    {slide.component}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {analyticsSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => onSlideChange(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide ? 'bg-blue-500' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
          
          {/* Slide Title */}
          <div className="text-center mt-4">
            <h3 className="text-xl font-bold text-white mb-1">{analyticsSlides[currentSlide].title}</h3>
            <p className="text-gray-400 text-sm">{analyticsSlides[currentSlide].subtitle}</p>
          </div>
        </div>

        {/* CTA after Conversation Explorer */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Unlock These Insights?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              See what people are asking AI about your industry and discover untapped opportunities with our free analytics tool.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <WebsiteAnalysisInput
                onLoginRequired={onCreateAccount}
                placeholder="Enter your website URL"
                buttonText="Start Analysis"
                size="small"
                className="max-w-sm"
              />
              <button
                onClick={onCreateAccount}
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg cursor-pointer"
              >
                Create Account for More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}