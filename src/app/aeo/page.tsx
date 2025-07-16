'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Waitlist from '@/components/Waitlist';

export default function AEOPage() {

  const companies = [
    {
      name: "Profound",
      description: "Leading AEO platform designed for enterprise brands with global footprints. Delivers sophisticated answer engine optimization capabilities that go beyond basic tracking.",
      features: [
        "AI conversation monitoring with predictive analytics",
        "Conversation Explorer for AI search volume insights",
        "Brand mention tracking and sentiment analysis",
        "Enterprise-focused AEO solutions"
      ],
      category: "Enterprise Platform"
    },
    {
      name: "Writesonic",
      description: "Powerful Generative Engine Optimization (GEO) tools designed to help content be selected and cited by AI systems like ChatGPT, Google's AI Overview, and Microsoft Copilot.",
      features: [
        "Content optimization for AI citation",
        "Multi-platform AI targeting",
        "Real-time optimization suggestions",
        "Content generation and optimization"
      ],
      category: "Content Optimization"
    },
    {
      name: "NoGood",
      description: "Proven strategies and research helping leading brands master AI discovery across ChatGPT, Gemini, Perplexity, Google's AIO, and beyond.",
      features: [
        "Goodie - all-in-one AEO platform",
        "Real-time monitoring across AI platforms",
        "AEO and SEO-optimized content creation",
        "Traffic and conversion tracking"
      ],
      category: "Full-Service Agency"
    },
    {
      name: "AI Monitor",
      description: "Comprehensive monitoring of brand mentions and sentiment analysis in the evolving AI search environment with robust tracking capabilities.",
      features: [
        "Multi-platform AI monitoring",
        "Brand mention tracking",
        "Sentiment analysis",
        "Competitive intelligence"
      ],
      category: "Monitoring & Analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Top AEO Companies & Solutions
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover the leading AI Engine Optimization (AEO) companies that are shaping how businesses optimize for AI-powered search engines and chatbots in 2025.
            </p>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The AEO Market Landscape</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The AEO industry has exploded since January 2025, with significant venture capital investment and growing enterprise adoption as businesses prepare for the AI-first search future.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">25%</div>
              <p className="text-sm text-gray-600">predicted drop in traditional search volume by 2026 (Gartner)</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">13.14%</div>
              <p className="text-sm text-gray-600">of all queries now show Google&apos;s AI Overviews</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">2025</div>
              <p className="text-sm text-gray-600">year AEO interest exploded with major VC funding</p>
            </div>
          </div>
        </div>
      </div>

      {/* AEO Companies */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Leading AEO Companies</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These companies are at the forefront of AI Engine Optimization, helping businesses dominate AI-powered search results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {companies.map((company, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{company.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    {company.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {company.description}
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {company.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SearchDogAi Positioning */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-12 text-white text-center">
            <h2 className="text-4xl font-bold mb-6">
              Skip the Complex Setup - Get Started in One Click
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              While enterprise AEO platforms require extensive setup and ongoing management, SearchDogAI offers a revolutionary one-click solution that delivers professional AEO and SEO optimization through automated GitHub integration.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3">⚡ Instant Setup</h3>
                <p className="opacity-90">Connect your GitHub repository and let our AI agents handle the rest - no complex platform onboarding required.</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3">🤖 AI-Powered Optimization</h3>
                <p className="opacity-90">Our specialized models analyze your site and implement both SEO and AEO improvements automatically via pull request.</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3">💰 Affordable Pricing</h3>
                <p className="opacity-90">One-time $24.75 for waitlist members vs. thousands per month for enterprise platforms.</p>
              </div>
            </div>

            <Link href="/#waitlist" className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors shadow-md inline-block">
              Join Waitlist - Get 75% Off
            </Link>
          </div>
        </div>
      </div>

      {/* Why AEO Matters */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why AEO Is Critical for Your Business</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The shift to AI-powered search is happening now. Here&apos;s why you need AEO optimization today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">The Challenge</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• 60% of searches now complete without clicks due to AI Overviews</li>
                <li>• 20-40% reduction in organic click-through rates</li>
                <li>• ChatGPT referral traffic increased dramatically in 2025</li>
                <li>• Traditional SEO alone is no longer sufficient</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">The Solution</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• 86% of SEO professionals have integrated AI into their strategy</li>
                <li>• 30% improvement in rankings within 6 months with AI optimization</li>
                <li>• 82% of users find AI-powered search more helpful</li>
                <li>• Early AEO adoption provides competitive advantage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gray-50 rounded-lg p-12 text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Optimize for AI Search?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of businesses preparing for the AI-first search future. Get notified when SearchDogAI launches with your exclusive 75% discount.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 rounded-md text-gray-900 bg-white border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  Join Waitlist
                </button>
              </form>
            ) : (
              <div className="bg-gray-100 rounded-lg p-6 max-w-md mx-auto">
                <p className="font-semibold text-gray-900">🎉 You&apos;re on the list!</p>
                <p className="text-gray-600">We&apos;ll notify you when SearchDogAI launches.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image src="/dog.png" alt="SearchDogAI" width={20} height={20} className="object-contain" />
              <span className="text-xl font-semibold text-gray-900">SearchDogAI</span>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <span className="text-gray-600">One-click AEO & SEO optimization</span>
              <span className="text-gray-600">&copy; {new Date().getFullYear()} SearchDogAI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}