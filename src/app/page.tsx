'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Waitlist from '../components/Waitlist';

export default function Home() {

  const analyticsFeatures = [
    {
      icon: "📊",
      title: "AEO Analytics",
      description: "Comprehensive analysis of your website's AI Engine Optimization performance with detailed visibility scoring across multiple AI platforms."
    },
    {
      icon: "🔍",
      title: "SEO Insights",
      description: "Deep SEO analysis with keyword tracking, competitor research, and performance monitoring to optimize your traditional search presence."
    },
    {
      icon: "🎯",
      title: "Visibility Tracking",
      description: "Real-time monitoring of your brand mentions across AI search results and traditional search engines with trend analysis."
    },
    {
      icon: "📈",
      title: "Performance Reports",
      description: "Detailed reports on your AEO/SEO performance with actionable recommendations and improvement tracking over time."
    },
    {
      icon: "🤖",
      title: "AI Search Monitoring",
      description: "Track how your business appears in ChatGPT, Claude, Perplexity, and other AI search platforms with automated alerts."
    },
    {
      icon: "⚡",
      title: "Optimization Solutions",
      description: "Automated recommendations and implementation strategies to improve your visibility in both AI and traditional search results."
    }
  ];

  const solutions = [
    {
      title: "Enterprise Analytics Suite",
      description: "Complete AEO and SEO analytics platform with custom dashboards, API access, and dedicated support.",
      features: ["Custom dashboards", "API integration", "White-label reports", "Dedicated support"]
    },
    {
      title: "SMB Growth Package",
      description: "Essential analytics and optimization tools designed for small to medium businesses looking to improve their search presence.",
      features: ["Weekly reports", "Competitor analysis", "Keyword tracking", "Basic optimization"]
    },
    {
      title: "Agency Partner Program",
      description: "Comprehensive analytics platform with client management tools and reseller capabilities for digital agencies.",
      features: ["Multi-client dashboard", "Reseller pricing", "White-label branding", "Agency tools"]
    }
  ];


  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              AEO & SEO Analytics Platform
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive analytics and optimization solutions for AI Engine Optimization (AEO) and Search Engine Optimization (SEO).
              Monitor your visibility, track performance, and optimize for the future of search.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link href="#waitlist" className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg text-lg">
                Join Waitlist - 50% Off
              </Link>
              <Link href="/aeo-score" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg">
                Try AEO Score Tool
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The Search Revolution Is Here
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI-powered search is transforming how users find information. Stay ahead with comprehensive AEO and SEO analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">60%</div>
              <p className="text-gray-700 font-medium">of searches complete without clicks due to AI Overviews</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-8 text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">13.14%</div>
              <p className="text-gray-700 font-medium">of Google queries now show AI Overviews</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">30%</div>
              <p className="text-gray-700 font-medium">ranking improvement with AI-optimized SEO strategies</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">82%</div>
              <p className="text-gray-700 font-medium">of users prefer AI-powered search results</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 max-w-4xl mx-auto">
            <p className="text-gray-700 text-lg text-center leading-relaxed">
              <strong>The new reality:</strong> Traditional SEO alone isn&apos;t enough. Companies need comprehensive analytics
              to track their performance across both traditional search engines and AI platforms.
              <strong className="text-blue-600"> AEO optimization is becoming as critical as SEO</strong> for maintaining online visibility.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Features Section */}
      <div id="features" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Comprehensive Analytics Suite</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to monitor, analyze, and optimize your search presence across traditional and AI-powered platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {analyticsFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solutions Section */}
      <div id="solutions" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tailored Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect analytics and optimization package for your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Flexible Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with our free AEO Score tool, then join the waitlist for 50% off our comprehensive analytics platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free (limited time)</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">$0</div>
                <p className="text-gray-600">Get started with basic AEO analysis</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AEO Score Tool
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic visibility analysis
                </li>

              </ul>
              <Link href="/aeo-score" className="block w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium text-center">
                Try Free Tool
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">50% Off Waitlist</span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="text-2xl text-gray-400 line-through">$49</div>
                  <div className="text-4xl font-bold text-blue-600">$24.50</div>
                </div>
                <p className="text-gray-600">per month (first year with waitlist discount)</p>
              </div>
              <ul className="space-y-4 mb-8">
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
                  SEO analytics dashboard
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
                  Weekly reports
                </li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Join Waitlist - 50% Off
              </button>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">50% Off Waitlist</span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="text-2xl text-gray-400 line-through">$149</div>
                  <div className="text-4xl font-bold text-blue-600">$74.50</div>
                </div>
                <p className="text-gray-600">per month (first year with waitlist discount)</p>
              </div>
              <ul className="space-y-4 mb-8">
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
                  API access
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom integrations
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dedicated support
                </li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <Waitlist />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image src="/dog.png" alt="SearchDogAI" width={24} height={24} className="object-contain" />
              <span className="text-xl font-semibold">SearchDogAI</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/aeo" className="text-gray-400 hover:text-white transition-colors">Learn AEO</Link>
              <Link href="/aeo-score" className="text-gray-400 hover:text-white transition-colors">AEO Score</Link>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SearchDogAI. All rights reserved. Leading the future of AEO and SEO analytics.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}