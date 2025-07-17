'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentAnalyticsSlide, setCurrentAnalyticsSlide] = useState(0);
  const [currentDashboardSlide, setCurrentDashboardSlide] = useState(0);
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleCreateAccount = () => {
    setLoginModalOpen(true);
  };

  const handleLogin = () => {
    setLoginModalOpen(false);
  };

  const handlePlanSelection = (planId: string) => {
    if (loading) return;

    if (!user) {
      // If user is not logged in, open login modal
      setLoginModalOpen(true);
      return;
    }

    // If user is logged in, redirect to payment page
    router.push(`/payment?plan=${planId}`);
  };

  const analyticsFeatures = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Analyze Response Quality",
      description: "Analyze responses which included or didn't include your business - understand how AI engines respond about your brand with detailed visibility scoring."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      title: "Brand Visibility Analysis",
      description: "See how engines respond about your brand with comprehensive monthly views of visibility across the top engines."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Competitive Intelligence",
      description: "See how you stack up against your competition with detailed competitor analysis and benchmarking across all AI platforms."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      title: "AI Search Insights & Plans",
      description: "Get insights and plans to improve your AI search presence with automated recommendations and implementation strategies."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Dedicated Support",
      description: "Get dedicated support from our team to help you optimize your AI search presence and maximize your visibility."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Monthly Visibility Reports",
      description: "Monthly view of visibility across the top engines with trend analysis and performance tracking over time."
    }
  ];

  const solutions = [
    {
      title: "Enterprise Analytics Suite",
      description: "Complete AEO analytics platform with custom dashboards, API access, and dedicated support.",
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

  const dashboardSlides = [
    {
      title: "Main Dashboard",
      subtitle: "Professional AEO Analytics Platform",
      component: (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">SearchDogAI Dashboard</h3>
                <p className="text-gray-400 text-sm">Professional AEO Analytics Platform</p>
              </div>
            </div>
            <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
              <div className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white">Overview</div>
              <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">AI Visibility</div>
              <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Conversations</div>
              <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Analytics</div>
            </div>
          </div>
          <div className="p-6">
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
          </div>
        </div>
      )
    },
    {
      title: "Agent Analytics",
      subtitle: "Monitor AI crawler activity and content optimization insights",
      component: (
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
          </div>
        </div>
      )
    },
    {
      title: "Competitive Intelligence",
      subtitle: "Deep dive into your competitive landscape across AI platforms",
      component: (
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
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-4">Competitive Ranking</h4>
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
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">2</span>
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
      )
    }
  ];

  const analyticsSlides = [
    {
      title: "Conversation Explorer",
      subtitle: "Discover what people ask AI about your industry",
      component: (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gray-800 border-b border-gray-700 px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-white">Conversation Explorer</h3>
                <p className="text-gray-400 text-xs lg:text-sm">Discover what people ask AI about your industry</p>
              </div>
            </div>
            <div className="flex space-x-1 bg-gray-700 rounded-lg p-1 overflow-x-auto">
              <div className="px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium text-gray-300 whitespace-nowrap">Overview</div>
              <div className="px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium bg-blue-600 text-white whitespace-nowrap">Conversations</div>
              <div className="px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium text-gray-300 whitespace-nowrap">Analytics</div>
              <div className="px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium text-gray-300 whitespace-nowrap">Insights</div>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Top AI Queries About Your Industry</h4>
                <div className="space-y-4">
                  {[
                    { query: "Best marketing automation tools for 2025", mentions: 847, trend: "+23%" },
                    { query: "CRM software comparison guide", mentions: 612, trend: "+18%" },
                    { query: "Email marketing platforms that integrate with AI", mentions: 534, trend: "+31%" }
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
              <div className="bg-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Query Volume Trends</h4>
                <div className="flex items-end space-x-2 h-32">
                  {[42, 58, 71, 65, 89, 94, 87, 103, 98, 112].map((height, idx) => (
                    <div key={idx} className="bg-blue-500 rounded-t flex-1" style={{ height: `${height / 2}px` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Industry Analytics",
      subtitle: "Deep insights into your market landscape",
      component: (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gray-800 border-b border-gray-700 px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-white">Industry Analytics</h3>
                <p className="text-gray-400 text-xs lg:text-sm">Deep insights into your market landscape</p>
              </div>
            </div>
            <div className="flex space-x-1 bg-gray-700 rounded-lg p-1 overflow-x-auto">
              <div className="px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium text-gray-300 whitespace-nowrap">Overview</div>
              <div className="px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium text-gray-300 whitespace-nowrap">Conversations</div>
              <div className="px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium bg-blue-600 text-white whitespace-nowrap">Analytics</div>
              <div className="px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium text-gray-300 whitespace-nowrap">Insights</div>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Emerging Topics & Opportunities</h4>
                <div className="space-y-4">
                  {[
                    { topic: "AI-powered customer segmentation", score: 94, status: "Hot" },
                    { topic: "Privacy-first marketing analytics", score: 87, status: "Rising" },
                    { topic: "Automated workflow optimization", score: 81, status: "Growing" }
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
                        'bg-yellow-500 text-black'
                      }`}>
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Market Positioning</h4>
                <div className="space-y-3">
                  {[
                    { category: "Marketing Tech", rank: 3, total: 50, score: 78 },
                    { category: "AI Analytics", rank: 2, total: 25, score: 85 },
                    { category: "Search Optimization", rank: 5, total: 40, score: 72 }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-600 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">{item.category}</span>
                        <span className="text-gray-300 text-xs">#{item.rank} of {item.total}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-500 rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${item.score}%` }}></div>
                        </div>
                        <span className="text-white text-xs font-medium">{item.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const dashboardPreviewSlides = [
    {
      title: "Main Dashboard",
      subtitle: "Complete visibility into your AI search performance",
      component: (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">SearchDogAI Dashboard</h3>
                <p className="text-gray-400 text-sm">Professional AEO Analytics Platform</p>
              </div>
            </div>
            <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
              <div className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white">Overview</div>
              <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">AI Visibility</div>
              <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Conversations</div>
              <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Analytics</div>
            </div>
          </div>
          <div className="p-6">
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
          </div>
        </div>
      )
    },
    {
      title: "Performance Analytics",
      subtitle: "Detailed performance breakdown across AI platforms",
      component: (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Performance Analytics</h3>
                <p className="text-gray-400 text-sm">Detailed performance breakdown across AI platforms</p>
              </div>
            </div>
            <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
              <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Overview</div>
              <div className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white">Analytics</div>
              <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Conversations</div>
              <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300">Competitors</div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-4">AI Platform Performance</h4>
                <div className="space-y-3">
                  {[
                    { platform: "OpenAI (ChatGPT)", score: 85, color: "bg-green-500" },
                    { platform: "Google Gemini", score: 81, color: "bg-blue-500" },
                    { platform: "Perplexity", score: 76, color: "bg-purple-500" },
                    { platform: "Claude", score: 72, color: "bg-orange-500" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{item.platform}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-600 rounded-full h-2">
                          <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.score}%` }}></div>
                        </div>
                        <span className="text-white text-sm font-medium">{item.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-4">Competitive Intelligence</h4>
                <div className="space-y-3">
                  {[
                    { rank: 1, company: "HubSpot", score: 92, change: "+3%" },
                    { rank: 2, company: "Salesforce", score: 89, change: "-1%" },
                    { rank: 3, company: "Your Company", score: 78, change: "+12%" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.rank === 3 ? 'bg-blue-600' : 'bg-gray-600'}`}>
                          <span className="text-xs font-bold text-white">{item.rank}</span>
                        </div>
                        <span className={`text-sm ${item.rank === 3 ? 'text-blue-300 font-medium' : 'text-gray-300'}`}>{item.company}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium text-sm ${item.rank === 3 ? 'text-blue-300' : 'text-white'}`}>{item.score}%</div>
                        <div className={`text-xs ${item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{item.change}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Auto-cycle through slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dashboardSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [dashboardSlides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnalyticsSlide((prev) => (prev + 1) % analyticsSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [analyticsSlides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDashboardSlide((prev) => (prev + 1) % dashboardPreviewSlides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [dashboardPreviewSlides.length]);


  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              AEO Analytics Platform
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive analytics and optimization solutions for Answers Engine Optimization (AEO).
              Free tool limited to 3 models. Professional has complete coverage of models.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
              <button
                onClick={handleCreateAccount}
                className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg text-base sm:text-lg cursor-pointer"
              >
                Create Account - Get Started
              </button>
              <Link href="/aeo-score" className="bg-white text-blue-600 border-2 border-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-base sm:text-lg">
                Try Free AEO Tool
              </Link>
            </div>

            {/* Top Models Section */}
            <div className="mt-12 sm:mt-16">
              <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 font-medium">
                Track your performance across the top AI platforms:
              </p>
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8">
                {/* ChatGPT */}
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">ChatGPT</span>
                </div>

                {/* Perplexity */}
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.958-.896 3.728-2.043 5.146-.706.866-1.544 1.59-2.465 2.079-.915.485-1.885.75-2.88.75s-1.965-.265-2.88-.75c-.921-.489-1.759-1.213-2.465-2.079-1.147-1.418-1.874-3.188-2.043-5.146C2.644 7.15 2.518 6.05 2.518 5s.126-2.15.274-3.16c.169-1.958.896-3.728 2.043-5.146C5.541-4.172 6.379-4.896 7.3-5.385 8.215-5.87 9.185-6.135 10.18-6.135s1.965.265 2.88.75c.921.489 1.759 1.213 2.465 2.079 1.147 1.418 1.874 3.188 2.043 5.146.148 1.01.274 2.11.274 3.16s-.126 2.15-.274 3.16z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Perplexity</span>
                </div>

                {/* Claude */}
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Claude</span>
                </div>

                {/* Google AI Overviews */}
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Google AI Overviews</span>
                </div>

                {/* Grok */}
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Grok</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              The Search Revolution Is Here
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              AI-powered search is transforming how users find information. Stay ahead with comprehensive AEO analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 sm:p-8 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">60%</div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">of searches complete without clicks due to AI Overviews</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 sm:p-8 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">13.14%</div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">of Google queries now show AI Overviews</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 sm:p-8 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">30%</div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">ranking improvement with AI-optimized search strategies</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 sm:p-8 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">82%</div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">of users prefer AI-powered search results</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto">
            <p className="text-gray-700 text-base sm:text-lg text-center leading-relaxed">
              <strong>The new reality:</strong> Traditional search optimization alone isn&apos;t enough. Companies need comprehensive analytics
              to track their performance across both traditional search engines and AI platforms.
              <strong className="text-blue-600"> AEO optimization is becoming critical</strong> for maintaining online visibility.
            </p>
          </div>

          {/* Charts Section */}
          <div className="mt-16 sm:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* SEO Effectiveness Chart */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">SEO Click-Through Rates</h3>
                <p className="text-gray-600 text-sm sm:text-base">Position #1 organic search result CTR over time</p>
              </div>
              <div className="relative h-48 sm:h-64 bg-gray-50 rounded-lg p-4">
                <div className="h-full flex items-end justify-between gap-1">
                  {/* Real CTR data for position #1 */}
                  {[
                    { year: '2019', value: 33.0, label: '33%' },
                    { year: '2020', value: 32.1, label: '32%' },
                    { year: '2021', value: 30.8, label: '31%' },
                    { year: '2022', value: 29.5, label: '30%' },
                    { year: '2023', value: 28.2, label: '28%' },
                    { year: '2024', value: 27.6, label: '28%' },
                    { year: '2025', value: 26.8, label: '27%' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 relative">
                      <div className="text-xs font-medium text-gray-600 mb-1 absolute -top-6">{item.label}</div>
                      <div
                        className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-md transition-all duration-1000 ease-out min-h-[4px]"
                        style={{ height: `${Math.max(4, (item.value / 35) * 160)}px` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">{item.year}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center text-orange-600 text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14l5-5 5 5z" />
                  </svg>
                  <span>19% decline since 2019</span>
                </div>
              </div>
            </div>

            {/* AI Search Growth Chart */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">AI Search Tool Usage</h3>
                <p className="text-gray-600 text-sm sm:text-base">Monthly active users (millions) for AI search platforms</p>
              </div>
              <div className="relative h-48 sm:h-64 bg-gray-50 rounded-lg p-4">
                <div className="h-full flex items-end justify-between gap-1">
                  {/* Real usage data in millions of users */}
                  {[
                    { year: '2019', value: 0, label: '0M' },
                    { year: '2020', value: 0, label: '0M' },
                    { year: '2021', value: 0, label: '0M' },
                    { year: '2022', value: 10, label: '10M' },
                    { year: '2023', value: 180, label: '180M' },
                    { year: '2024', value: 400, label: '400M' },
                    { year: '2025', value: 600, label: '600M' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 relative">
                      <div className="text-xs font-medium text-gray-600 mb-1 absolute -top-6">{item.label}</div>
                      <div
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-md transition-all duration-1000 ease-out min-h-[4px]"
                        style={{ height: `${Math.max(4, (item.value / 600) * 160)}px` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">{item.year}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center text-green-600 text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14l5-5 5 5z" transform="rotate(180 12 12)" />
                  </svg>
                  <span>From 0 to 600M users since 2022</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Analytics Features Section */}
      <div id="features" className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Comprehensive Analytics Suite</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to monitor, analyze, and optimize your search presence across traditional and AI-powered platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {analyticsFeatures.map((feature, index) => (
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
                  style={{ transform: `translateX(-${currentAnalyticsSlide * 100}%)` }}
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
                onClick={() => setCurrentAnalyticsSlide(currentAnalyticsSlide === 0 ? analyticsSlides.length - 1 : currentAnalyticsSlide - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => setCurrentAnalyticsSlide((currentAnalyticsSlide + 1) % analyticsSlides.length)}
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
                  onClick={() => setCurrentAnalyticsSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentAnalyticsSlide ? 'bg-blue-500' : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
            
            {/* Slide Title */}
            <div className="text-center mt-4">
              <h3 className="text-xl font-bold text-white mb-1">{analyticsSlides[currentAnalyticsSlide].title}</h3>
              <p className="text-gray-400 text-sm">{analyticsSlides[currentAnalyticsSlide].subtitle}</p>
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

          {/* Dashboard Preview Carousel */}
          <div className="mb-16">
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
                    style={{ transform: `translateX(-${currentDashboardSlide * 100}%)` }}
                  >
                    {dashboardPreviewSlides.map((slide, index) => (
                      <div key={index} className="w-full flex-shrink-0">
                        {slide.component}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                <button
                  onClick={() => setCurrentDashboardSlide(currentDashboardSlide === 0 ? dashboardPreviewSlides.length - 1 : currentDashboardSlide - 1)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setCurrentDashboardSlide((currentDashboardSlide + 1) % dashboardPreviewSlides.length)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Slide Indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {dashboardPreviewSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDashboardSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentDashboardSlide ? 'bg-blue-500' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
              
              {/* Slide Title */}
              <div className="text-center mt-4">
                <h3 className="text-xl font-bold text-white mb-1">{dashboardPreviewSlides[currentDashboardSlide].title}</h3>
                <p className="text-gray-400 text-sm">{dashboardPreviewSlides[currentDashboardSlide].subtitle}</p>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Real-Time Monitoring</h3>
              <p className="text-gray-600">Track your AI visibility across all major platforms with live updates and trend analysis.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Competitive Intelligence</h3>
              <p className="text-gray-600">See how you stack up against competitors with comprehensive ranking analysis.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
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
                onClick={() => setCurrentSlide(currentSlide === 0 ? dashboardSlides.length - 1 : currentSlide - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => setCurrentSlide((currentSlide + 1) % dashboardSlides.length)}
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
                  onClick={() => setCurrentSlide(index)}
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

      {/* Pricing Section */}
      <div id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Flexible Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create your account to access our free AEO Score tool and get pre-release discounts on our comprehensive analytics platform.
            </p>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
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
                onClick={handleCreateAccount}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium cursor-pointer"
              >
                Create Account
              </button>
            </div>

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
                onClick={() => handlePlanSelection('indie')}
                disabled={true}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium cursor-pointer"
              >
                Get Indie Plan
              </button>
            </div>

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
            <p>&copy; 2025 SearchDogAI. All rights reserved. Leading the future of AEO analytics.</p>
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