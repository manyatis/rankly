import Link from 'next/link';

interface Solution {
  title: string;
  description: string;
  features: string[];
}

interface DashboardSlide {
  title: string;
  subtitle: string;
  component: React.ReactNode;
}

interface SolutionsSectionProps {
  solutions: Solution[];
  dashboardSlides: DashboardSlide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

export default function SolutionsSection({ 
  solutions, 
  dashboardSlides, 
  currentSlide, 
  onSlideChange 
}: SolutionsSectionProps) {
  const nextSlide = () => {
    onSlideChange((currentSlide + 1) % dashboardSlides.length);
  };

  const prevSlide = () => {
    onSlideChange(currentSlide === 0 ? dashboardSlides.length - 1 : currentSlide - 1);
  };

  return (
    <div id="solutions" className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tailored Solutions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect analytics and optimization package for your business needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {solutions.map((solution, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{solution.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {solution.description}
              </p>
              <ul className="space-y-3 mb-8">
                {solution.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Dashboard Carousel */}
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl overflow-hidden">
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
                {dashboardSlides.map((slide, index) => (
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
            {dashboardSlides.map((_, index) => (
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
            <h3 className="text-xl font-bold text-white mb-1">{dashboardSlides[currentSlide].title}</h3>
            <p className="text-gray-400 text-sm">{dashboardSlides[currentSlide].subtitle}</p>
          </div>
        </div>

        {/* CTA after Agent Analytics */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Full Visibility Into AI Crawling Activity</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Track how AI crawlers interact with your content and optimize for maximum visibility across all platforms.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/aeo-score" className="bg-gray-800 text-white px-8 py-4 rounded-lg hover:bg-gray-900 transition-colors font-medium text-lg shadow-sm inline-block">
                Test Your Site Now
              </Link>
              <a href="#pricing" className="bg-white text-gray-800 border-2 border-gray-800 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg inline-block">
                Upgrade for Full Monitoring
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}