'use client';

import Link from 'next/link';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import LoginModal from '@/components/LoginModal';
import Image from 'next/image';

export default function AEOPage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleCreateAccount = () => {
    setLoginModalOpen(true);
  };

  const handleLogin = () => {
    setLoginModalOpen(false);
  };


  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              AEO Simplified
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              Get superior Answer Engine Optimization with AI-powered insights, built-in WordPress support, and privacy-first analytics - all at a fraction of enterprise platform costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCreateAccount}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg cursor-pointer"
              >
                Start Free
              </button>
              <Link href="/dashboard" className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg border-2 border-blue-600">
                Check Your AEO Score
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Rankly Outperforms Enterprise Platforms</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              While competitors charge $5,000-$15,000/month for basic AEO services, we deliver superior results through advanced AI technology and seamless integrations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <p className="text-sm text-gray-600">more accurate AI search predictions vs. traditional tools</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">$150/mo</div>
              <p className="text-sm text-gray-600">Professional plan vs. $5,000-$15,000/month enterprise pricing</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">5min</div>
              <p className="text-sm text-gray-600">setup time vs. 6-month enterprise implementations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Features */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete AEO Solution Suite</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to dominate AI-powered search results, built with privacy-first principles and enterprise-grade security.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">🔍 AI-Powered Insights</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  Core Feature
                </span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Advanced AI models analyze 15+ search engines and provide actionable recommendations to improve your visibility in AI-powered results.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">Real-time AI search result monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">Automated content optimization suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">Competitor gap analysis and insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">Smart fix recommendations with priority scoring</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">🔒 Privacy-First Analytics</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  Privacy Focused
                </span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Simple, powerful analytics that respect user privacy while providing deep insights into your AEO performance and improvements.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">GDPR-compliant analytics tracking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">No cookies or personal data collection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">Simple dashboard with key metrics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">Weekly performance reports</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">🔌 WordPress Plugin</h3>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                  Built-in Integration
                </span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Seamlessly integrate AEO optimization into your WordPress workflow with our purpose-built plugin that works with any theme.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">One-click installation and setup</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">Automatic schema markup optimization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">Compatible with popular SEO plugins</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">Real-time content optimization suggestions</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">👥 Expert Consulting</h3>
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                  Professional Service
                </span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get hands-on support from AEO specialists who understand the nuances of AI search optimization and can accelerate your results.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">1-on-1 strategy sessions with AEO experts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">Custom implementation roadmaps</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">Content audit and optimization guidance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2 mt-1">•</span>
                    <span className="text-gray-600">Priority support and implementation help</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Comparison */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-12 text-white text-center">
            <h2 className="text-4xl font-bold mb-6">
              Enterprise Results at Startup Pricing
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Get more accurate AEO insights and better results than $15k/month enterprise platforms, with built-in privacy protection and WordPress integration.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm text-left">
                <h3 className="text-2xl font-semibold mb-4 text-center">Enterprise Platforms</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-red-300 mr-3">✗</span>
                    <span className="opacity-90">$5,000-$15,000/month pricing</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-300 mr-3">✗</span>
                    <span className="opacity-90">6-month implementation timelines</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-300 mr-3">✗</span>
                    <span className="opacity-90">Basic monitoring and alerts</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-300 mr-3">✗</span>
                    <span className="opacity-90">Limited AI engine coverage</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-300 mr-3">✗</span>
                    <span className="opacity-90">No built-in privacy protection</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm text-left">
                <h3 className="text-2xl font-semibold mb-4 text-center">Rankly</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-green-300 mr-3">✓</span>
                    <span className="opacity-90">$150/month Professional, $500/month Enterprise</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-300 mr-3">✓</span>
                    <span className="opacity-90">5-minute setup and deployment</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-300 mr-3">✓</span>
                    <span className="opacity-90">AI-powered fix recommendations</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-300 mr-3">✓</span>
                    <span className="opacity-90">15+ AI engines monitored</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-300 mr-3">✓</span>
                    <span className="opacity-90">GDPR-compliant, privacy-first</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCreateAccount}
                className="bg-white text-green-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors shadow-md inline-block cursor-pointer"
              >
                Start Free
              </button>
              <Link href="/dashboard" className="bg-green-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-400 transition-colors shadow-md inline-block">
                Get Free AEO Score
              </Link>
            </div>
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
                <li>• Traditional search optimization alone is no longer sufficient</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">The Solution</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• 86% of search professionals have integrated AI into their strategy</li>
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
              Join thousands of businesses preparing for the AI-first search future. Create your account now to access our free tool and lock in pre-release discounts.
            </p>

            <button
              onClick={handleCreateAccount}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg cursor-pointer"
            >
              Create Account - Get Discount
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-semibold text-white hover:text-gray-300 transition-colors">
              <Image src="/lucy.png" alt="Rankly" width={24} height={24} />
              <span>Rankly</span>
            </Link>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <span className="text-gray-600">One-click AEO optimization</span>
              <span className="text-gray-600">&copy; {new Date().getFullYear()} Rankly</span>
            </div>
          </div>
        </div>
      </footer>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLogin}
      />
    </div>
  );
}