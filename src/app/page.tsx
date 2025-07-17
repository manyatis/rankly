'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import LoginModal from '../components/LoginModal';

export default function Home() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleCreateAccount = () => {
    setLoginModalOpen(true);
  };

  const handleLogin = () => {
    setLoginModalOpen(false);
  };

  const analyticsFeatures = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "AEO & GEO Analytics",
      description: "Comprehensive analysis of your website's Answers Engine Optimization performance with detailed visibility scoring across multiple AI platforms."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Search Insights",
      description: "Deep search analysis with keyword tracking, competitor research, and performance monitoring to optimize your traditional search presence."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      title: "Visibility Tracking",
      description: "Real-time monitoring of your brand mentions across AI search results and traditional search engines with trend analysis."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      title: "Performance Reports",
      description: "Detailed reports on your AEO & GEO performance with actionable recommendations and improvement tracking over time."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "AI Search Monitoring",
      description: "Track how your business appears in ChatGPT, Claude, Perplexity, and other AI search platforms with automated alerts."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Optimization Solutions",
      description: "Automated recommendations and implementation strategies to improve your visibility in both AI and traditional search results."
    }
  ];

  const solutions = [
    {
      title: "Enterprise Analytics Suite",
      description: "Complete AEO & GEO analytics platform with custom dashboards, API access, and dedicated support.",
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
              AEO & GEO Analytics Platform
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive analytics and optimization solutions for Answers Engine Optimization (AEO) & Generative Engine Optimization (GEO).
              Free tool limited to 3 models and weakest analytic engines. Professional has complete coverage of models.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <button 
                onClick={handleCreateAccount}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg text-lg cursor-pointer"
              >
                Create Account - Get Started
              </button>
              <Link href="/aeo-score" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg">
                Try Free AEO Tool
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
              AI-powered search is transforming how users find information. Stay ahead with comprehensive AEO & GEO analytics.
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
              <p className="text-gray-700 font-medium">ranking improvement with AI-optimized search strategies</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">82%</div>
              <p className="text-gray-700 font-medium">of users prefer AI-powered search results</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 max-w-4xl mx-auto">
            <p className="text-gray-700 text-lg text-center leading-relaxed">
              <strong>The new reality:</strong> Traditional search optimization alone isn&apos;t enough. Companies need comprehensive analytics
              to track their performance across both traditional search engines and AI platforms.
              <strong className="text-blue-600"> AEO & GEO optimization is becoming critical</strong> for maintaining online visibility.
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {analyticsFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* AI Conversation Explorer Screenshot */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Conversation Explorer</h3>
                    <p className="text-gray-400 text-sm">Discover what people ask AI about your industry</p>
                  </div>
                </div>
                
                <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
                  <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Overview</div>
                  <div className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white">Conversations</div>
                  <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Analytics</div>
                  <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Insights</div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Queries */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-4">Top AI Queries About Your Industry</h4>
                    <div className="space-y-4">
                      {[
                        { query: "Best marketing automation tools for 2025", mentions: 847, trend: "+23%" },
                        { query: "CRM software comparison guide", mentions: 612, trend: "+18%" },
                        { query: "Email marketing platforms that integrate with AI", mentions: 534, trend: "+31%" },
                        { query: "Lead generation tools for B2B companies", mentions: 423, trend: "+12%" },
                        { query: "Marketing analytics dashboard recommendations", mentions: 387, trend: "+8%" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium mb-1">&quot;{item.query}&quot;</div>
                            <div className="text-gray-300 text-xs">{item.mentions} mentions across AI platforms</div>
                          </div>
                          <div className="text-green-400 text-sm font-medium">{item.trend}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emerging Topics */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-4">Emerging Topics & Opportunities</h4>
                    <div className="space-y-4">
                      {[
                        { topic: "AI-powered customer segmentation", score: 94, status: "Hot" },
                        { topic: "Privacy-first marketing analytics", score: 87, status: "Rising" },
                        { topic: "Automated workflow optimization", score: 81, status: "Growing" },
                        { topic: "Real-time personalization engines", score: 76, status: "Emerging" },
                        { topic: "Cross-platform attribution modeling", score: 68, status: "New" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium mb-1">{item.topic}</div>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-500 rounded-full h-1.5">
                                <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${item.score}%` }}></div>
                              </div>
                              <span className="text-gray-300 text-xs">{item.score}%</span>
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            item.status === 'Hot' ? 'bg-red-500 text-white' :
                            item.status === 'Rising' ? 'bg-orange-500 text-white' :
                            item.status === 'Growing' ? 'bg-yellow-500 text-black' :
                            'bg-blue-500 text-white'
                          }`}>
                            {item.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Query Volume Chart */}
                <div className="mt-6 bg-gray-700 rounded-lg p-6">
                  <h4 className="text-white font-semibold mb-4">Query Volume Trends (Last 30 Days)</h4>
                  <div className="flex items-end space-x-2 h-32">
                    {[42, 58, 71, 65, 89, 94, 87, 103, 98, 112, 127, 134, 129, 145, 156, 162, 171, 168, 185, 192, 201, 198, 215, 223, 234, 229, 247, 256, 268, 275].map((height, idx) => (
                      <div key={idx} className="bg-blue-500 rounded-t flex-1" style={{ height: `${height / 4}px` }}></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs mt-2">
                    <span>30 days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA after Conversation Explorer */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Unlock These Insights?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                See what people are asking AI about your industry and discover untapped opportunities with our free analytics tool.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/aeo-score" className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg shadow-sm inline-block">
                  Start Free Analysis
                </Link>
                <button 
                  onClick={handleCreateAccount}
                  className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg cursor-pointer"
                >
                  Create Account for More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Preview Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Professional Dashboard Experience</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get complete visibility into your AI search performance with our enterprise-grade analytics platform.
            </p>
          </div>

          {/* Main Dashboard Screenshot */}
          <div className="mb-16">
            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">SearchDogAI Dashboard</h3>
                      <p className="text-gray-400 text-sm">Professional AEO Analytics Platform</p>
                    </div>
                  </div>
                  
                  {/* Navigation Tabs */}
                  <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
                    <div className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white">Overview</div>
                    <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">AI Visibility</div>
                    <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Conversations</div>
                    <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Analytics</div>
                    <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Competitors</div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">AI Visibility Score</div>
                      <div className="text-2xl font-bold text-white">78%</div>
                      <div className="text-green-400 text-xs">+12%</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">Brand Mentions</div>
                      <div className="text-2xl font-bold text-white">2,847</div>
                      <div className="text-green-400 text-xs">+8%</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">AI Traffic</div>
                      <div className="text-2xl font-bold text-white">24.3K</div>
                      <div className="text-green-400 text-xs">+15%</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">Industry Rank</div>
                      <div className="text-2xl font-bold text-white">#3</div>
                      <div className="text-green-400 text-xs">+2 positions</div>
                    </div>
                  </div>

                  {/* Charts Area */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-4">AI Platform Performance</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">OpenAI (ChatGPT)</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-600 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            <span className="text-white text-sm font-medium">85%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Google Gemini</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-600 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '81%' }}></div>
                            </div>
                            <span className="text-white text-sm font-medium">81%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Perplexity</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-600 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                            </div>
                            <span className="text-white text-sm font-medium">76%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Claude</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-600 rounded-full h-2">
                              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                            </div>
                            <span className="text-white text-sm font-medium">72%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-4">Competitive Intelligence</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">1</span>
                            </div>
                            <span className="text-gray-300 text-sm">HubSpot</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium text-sm">92%</div>
                            <div className="text-green-400 text-xs">+3%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">2</span>
                            </div>
                            <span className="text-gray-300 text-sm">Salesforce</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium text-sm">89%</div>
                            <div className="text-red-400 text-xs">-1%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">3</span>
                            </div>
                            <span className="text-blue-300 text-sm font-medium">Your Company</span>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-300 font-medium text-sm">78%</div>
                            <div className="text-green-400 text-xs">+12%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Real-Time Monitoring</h3>
              <p className="text-gray-600">Track your AI visibility across all major platforms with live updates and trend analysis.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Competitive Intelligence</h3>
              <p className="text-gray-600">See how you stack up against competitors with comprehensive ranking analysis.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Actionable Insights</h3>
              <p className="text-gray-600">Get AI-powered recommendations and action plans to improve your search visibility.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/aeo-score" className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg inline-block">
                Try Analytics Tool Free
              </Link>
              <a href="#pricing" className="bg-gray-100 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-lg inline-block">
                View Pricing & Sign Up
              </a>
            </div>
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

          {/* Agent Analytics Screenshot */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Agent Analytics</h3>
                    <p className="text-gray-400 text-sm">Monitor AI crawler activity and content optimization insights</p>
                  </div>
                </div>
                
                <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
                  <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Overview</div>
                  <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Conversations</div>
                  <div className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white">Agent Analytics</div>
                  <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Insights</div>
                </div>
              </div>

              <div className="p-6">
                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">2,847</div>
                    <div className="text-sm text-gray-400 mb-1">Pages Crawled</div>
                    <div className="text-xs text-green-400">+23% this week</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">456</div>
                    <div className="text-sm text-gray-400 mb-1">Content Citations</div>
                    <div className="text-xs text-green-400">+31% this week</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">94%</div>
                    <div className="text-sm text-gray-400 mb-1">Indexing Success</div>
                    <div className="text-xs text-yellow-400">Stable</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">78%</div>
                    <div className="text-sm text-gray-400 mb-1">Content Quality</div>
                    <div className="text-xs text-green-400">+8% improvement</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Crawler Activity */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-4">AI Crawler Activity by Platform</h4>
                    <div className="space-y-4">
                      {[
                        { platform: "ChatGPT Browser", requests: 1247, success: 96, color: "bg-green-500" },
                        { platform: "Perplexity Indexer", requests: 892, success: 94, color: "bg-purple-500" },
                        { platform: "Claude Web Reader", requests: 634, success: 91, color: "bg-orange-500" },
                        { platform: "Gemini Search Agent", requests: 423, success: 89, color: "bg-blue-500" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-gray-600 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-sm font-medium">{item.platform}</span>
                            <span className="text-gray-300 text-xs">{item.requests} requests</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-500 rounded-full h-2">
                              <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.success}%` }}></div>
                            </div>
                            <span className="text-white text-xs font-medium">{item.success}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Performance */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-4">Content Performance Insights</h4>
                    <div className="space-y-4">
                      <div className="p-3 bg-green-900 border border-green-700 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h5 className="text-green-100 font-medium text-sm">High-Performance Content</h5>
                            <p className="text-green-200 text-xs">Your product pages have 89% citation rate</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-yellow-900 border border-yellow-700 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h5 className="text-yellow-100 font-medium text-sm">Optimization Opportunity</h5>
                            <p className="text-yellow-200 text-xs">Blog posts need better structured data markup</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-900 border border-blue-700 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <div>
                            <h5 className="text-blue-100 font-medium text-sm">AI Recommendation</h5>
                            <p className="text-blue-200 text-xs">Add FAQ sections to improve query matching</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Crawling Timeline */}
                <div className="mt-6 bg-gray-700 rounded-lg p-6">
                  <h4 className="text-white font-semibold mb-4">Recent Crawler Activity Timeline</h4>
                  <div className="space-y-3">
                    {[
                      { time: "2 minutes ago", agent: "ChatGPT", action: "Indexed 23 product pages", status: "success" },
                      { time: "8 minutes ago", agent: "Perplexity", action: "Crawled blog section", status: "success" },
                      { time: "15 minutes ago", agent: "Claude", action: "Failed to access sitemap", status: "warning" },
                      { time: "32 minutes ago", agent: "Gemini", action: "Updated knowledge base with new content", status: "success" },
                      { time: "1 hour ago", agent: "ChatGPT", action: "Deep crawl of documentation", status: "success" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-2">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'success' ? 'bg-green-400' : 
                          item.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <div className="flex-1">
                          <div className="text-white text-sm">{item.action}</div>
                          <div className="text-gray-400 text-xs">{item.agent} • {item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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

      {/* Pricing Section */}
      <div id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Flexible Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create your account to access our free AEO Score tool and get pre-release discounts on our comprehensive analytics platform.
            </p>
          </div>

          {/* Competitive Intelligence Screenshot */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl mb-16">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Competitive Intelligence</h3>
                    <p className="text-gray-400 text-sm">Deep dive into your competitive landscape across AI platforms</p>
                  </div>
                </div>
                
                <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
                  <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Overview</div>
                  <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Analytics</div>
                  <div className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white">Competitors</div>
                  <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Insights</div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Market Position */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-4">Market Position Analysis</h4>
                    <div className="space-y-4">
                      {[
                        { rank: 1, company: "HubSpot", score: 92, change: "+3", trend: "up", highlight: false },
                        { rank: 2, company: "Salesforce", score: 89, change: "-1", trend: "down", highlight: false },
                        { rank: 3, company: "Your Company", score: 78, change: "+12", trend: "up", highlight: true },
                        { rank: 4, company: "Marketo", score: 76, change: "+5", trend: "up", highlight: false },
                        { rank: 5, company: "Mailchimp", score: 71, change: "-2", trend: "down", highlight: false },
                        { rank: 6, company: "ActiveCampaign", score: 68, change: "+1", trend: "up", highlight: false }
                      ].map((item, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${
                          item.highlight ? 'bg-blue-900 border-blue-600' : 'bg-gray-600 border-gray-500'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                item.highlight ? 'bg-blue-600 text-white' : 'bg-gray-500 text-white'
                              }`}>
                                {item.rank}
                              </div>
                              <span className={`font-medium ${item.highlight ? 'text-blue-200' : 'text-white'}`}>
                                {item.company}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${item.highlight ? 'text-blue-200' : 'text-white'}`}>
                                {item.score}%
                              </div>
                              <div className={`text-xs ${
                                item.trend === 'up' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {item.change}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Platform Breakdown */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-4">Platform-Specific Competition</h4>
                    <div className="space-y-4">
                      {[
                        { platform: "ChatGPT", your: 78, hubspot: 85, salesforce: 82, lead: "HubSpot" },
                        { platform: "Perplexity", your: 81, hubspot: 79, salesforce: 77, lead: "You" },
                        { platform: "Claude", your: 72, hubspot: 88, salesforce: 83, lead: "HubSpot" },
                        { platform: "Gemini", your: 84, hubspot: 91, salesforce: 86, lead: "HubSpot" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-gray-600 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium text-sm">{item.platform}</span>
                            <span className="text-xs text-gray-300">Leader: {item.lead}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-blue-300 text-xs">You</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-500 rounded-full h-1.5">
                                  <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${item.your}%` }}></div>
                                </div>
                                <span className="text-blue-300 text-xs w-8">{item.your}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300 text-xs">HubSpot</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-500 rounded-full h-1.5">
                                  <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${item.hubspot}%` }}></div>
                                </div>
                                <span className="text-gray-300 text-xs w-8">{item.hubspot}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300 text-xs">Salesforce</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-500 rounded-full h-1.5">
                                  <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${item.salesforce}%` }}></div>
                                </div>
                                <span className="text-gray-300 text-xs w-8">{item.salesforce}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Competitive Insights */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                      </svg>
                      <div>
                        <h5 className="text-green-100 font-medium text-sm">Opportunity Found</h5>
                        <p className="text-green-200 text-xs">You&apos;re leading on Perplexity - leverage this advantage!</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
                      </svg>
                      <div>
                        <h5 className="text-yellow-100 font-medium text-sm">Gap Identified</h5>
                        <p className="text-yellow-200 text-xs">Focus on ChatGPT optimization to close the gap</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z"/>
                      </svg>
                      <div>
                        <h5 className="text-blue-100 font-medium text-sm">Trend Analysis</h5>
                        <p className="text-blue-200 text-xs">Your growth rate (+12%) outpaces competitors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA after Competitive Intelligence */}
          <div className="text-center mt-12 mb-16">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Beat Your Competition in AI Search</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Get detailed competitive intelligence and discover opportunities to outrank your competitors across all AI platforms.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/aeo-score" className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg shadow-sm inline-block">
                  Analyze Competition Free
                </Link>
                <button 
                  onClick={handleCreateAccount}
                  className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg hover:bg-indigo-50 transition-colors font-medium text-lg cursor-pointer"
                >
                  Get Competitive Advantage
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">$0</div>
                <p className="text-gray-600">Requires account creation</p>
              </div>
              <ul className="space-y-4 mb-8">
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
                  Weakest analytic engines
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic visibility analysis
                </li>
              </ul>
              <button 
                onClick={handleCreateAccount}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Create Account
              </button>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">Pre-Release</span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="text-2xl text-gray-400 line-through">$150</div>
                  <div className="text-4xl font-bold text-blue-600">$75</div>
                </div>
                <p className="text-gray-600">per month (create account before release for discount)</p>
              </div>
              <ul className="space-y-4 mb-8">
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
                  Weekly reports
                </li>
              </ul>
              <button 
                onClick={handleCreateAccount}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Account - Get Discount
              </button>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">Pre-Release</span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="text-2xl text-gray-400 line-through">$500</div>
                  <div className="text-4xl font-bold text-blue-600">$250</div>
                </div>
                <p className="text-gray-600">per month (create account before release for discount)</p>
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
                onClick={handleCreateAccount}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Account - Get Discount
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Optimize for AI Search?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses preparing for the AI-first search future. Create your account now to access our free tool and lock in pre-release discounts.
          </p>
          <button 
            onClick={handleCreateAccount}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg cursor-pointer"
          >
            Create Account - Get Discount
          </button>
        </div>
      </div>

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
            <p>&copy; 2025 SearchDogAI. All rights reserved. Leading the future of AEO & GEO analytics.</p>
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