'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../hooks/useAuth';
import HeroSection from '../components/home/HeroSection';
import PricingSection from '../components/home/PricingSection';

export default function Home() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
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


  const solutions = [
    {
      title: "Agency & Freelance Pro",
      description: "Complete AI engine analytics platform designed for SEO professionals managing multiple clients with automated report generation.",
      features: ["Multi-client dashboards", "White-label reports", "API integration", "Priority support"]
    },
    {
      title: "DIY Business Package",
      description: "Perfect for small to medium businesses managing their own SEO strategy. Get AI-powered recommendations and easy-to-understand reports.",
      features: ["Automated recommendations", "Simple reports", "Competitor tracking", "Self-service optimization"]
    },
    {
      title: "Enterprise Solution",
      description: "Advanced AI engine analytics for large organizations with custom integrations, dedicated support, and unlimited report generation.",
      features: ["Custom integrations", "Unlimited reports", "Dedicated account manager", "Advanced analytics"]
    }
  ];

  const dashboardSlides = [
    {
      title: "Main Dashboard",
      subtitle: "Professional AI Engine Analytics Platform",
      component: (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Rankly Dashboard</h3>
                <p className="text-gray-400 text-sm">Professional AI Engine Analytics Platform</p>
              </div>
            </div>
            <div className="flex space-x-1 bg-gray-700 rounded-lg p-1 overflow-x-auto">
              <div className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium bg-blue-600 text-white whitespace-nowrap">Overview</div>
              <div className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-gray-300 whitespace-nowrap">AI Visibility</div>
              <div className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-gray-300 whitespace-nowrap">Conversations</div>
              <div className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-gray-300 whitespace-nowrap">Analytics</div>
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
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
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


  const dashboardPreviewSlides = [
    {
      title: "Main Dashboard",
      subtitle: "Complete visibility into your AI search performance",
      component: (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Rankly Dashboard</h3>
                <p className="text-gray-400 text-sm">Professional AI Engine Analytics Platform</p>
              </div>
            </div>
            <div className="flex space-x-1 bg-gray-700 rounded-lg p-1 overflow-x-auto">
              <div className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium bg-blue-600 text-white whitespace-nowrap">Overview</div>
              <div className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-gray-300 whitespace-nowrap">AI Visibility</div>
              <div className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-gray-300 whitespace-nowrap">Conversations</div>
              <div className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-gray-300 whitespace-nowrap">Analytics</div>
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
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.rank === 3 ? 'bg-blue-600' : 'bg-gray-600'}`}>
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
      setCurrentDashboardSlide((prev) => (prev + 1) % dashboardPreviewSlides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [dashboardPreviewSlides.length]);


  return (
    <div className="min-h-screen bg-gray-900" style={{ fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <Navbar />

      <HeroSection onCreateAccount={handleCreateAccount} />

      {/* Statistics Section */}
      <div className="bg-gray-900 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              AI Search Rankings Join The SEO Equation 
            </h2>
            {/* <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Freelance SEOs need quick client reports. Businesses want to handle their own SEO. Our AI-powered platform 
              aggregates rankings from all major AI engines and generates actionable recommendations automatically.
            </p> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center border border-gray-600">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">60%</div>
              <p className="text-gray-300 font-medium text-xs sm:text-sm lg:text-base">of searches complete without clicks</p>
              <p className="text-gray-400 text-xs mt-2">Source: SparkToro/Datos Study (2024)</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center border border-gray-600">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-600 mb-2">13.14%</div>
              <p className="text-gray-300 font-medium text-xs sm:text-sm lg:text-base">of Google queries now show AI Overviews</p>
              <p className="text-gray-400 text-xs mt-2">Source: Semrush Study (March 2025)</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center border border-gray-600">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 mb-2">525%</div>
              <p className="text-gray-300 font-medium text-xs sm:text-sm lg:text-base">revenue growth for AI search engines in 2024</p>
              <p className="text-gray-400 text-xs mt-2">Source: Industry Analysis (2024)</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center border border-gray-600">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 mb-2">78%</div>
              <p className="text-gray-300 font-medium text-xs sm:text-sm lg:text-base">of enterprises now use AI in business functions</p>
              <p className="text-gray-400 text-xs mt-2">Source: McKinsey AI Survey (2024)</p>
            </div>
          </div>

          {/* Additional Impact Statistics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center border border-gray-600">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600 mb-2">25%</div>
              <p className="text-gray-300 font-medium text-xs sm:text-sm lg:text-base">predicted drop in traditional search volume by 2026</p>
              <p className="text-gray-400 text-xs mt-2">Source: Gartner Research (2024)</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center border border-gray-600">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-600 mb-2">$13.8B</div>
              <p className="text-gray-300 font-medium text-xs sm:text-sm lg:text-base">AI spending surge in 2024 (6x increase from 2023)</p>
              <p className="text-gray-400 text-xs mt-2">Source: Enterprise AI Reports (2024)</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center border border-gray-600">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2">34.5%</div>
              <p className="text-gray-300 font-medium text-xs sm:text-sm lg:text-base">drop in click-through rates when AI Overviews appear</p>
              <p className="text-gray-400 text-xs mt-2">Source: Ahrefs Study (2024)</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto">
            <p className="text-gray-300 text-base sm:text-lg text-center leading-relaxed">
              We use a <strong className="text-blue-600">multi-agentic AI workflow</strong> to handle prompt generation, 
              analysis, and recommendations automatically.
            </p>
          </div>

          {/* Research-Backed Methodology Section */}
          <div className="mt-16 sm:mt-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Research-Backed Ranking Methodology
              </h3>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Our AEO scoring methodology incorporates established research principles and known ranking factors that influence AI search visibility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white">Content Authority</h4>
                </div>
                <p className="text-gray-300">
                  Based on established E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) principles and content quality signals that AI models use for source evaluation.
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white">Semantic Relevance</h4>
                </div>
                <p className="text-gray-300">
                  Leveraging natural language processing principles for semantic understanding and context matching in AI model information retrieval.
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white">Citation Patterns</h4>
                </div>
                <p className="text-gray-300">
                  Analyzing how AI models select and rank information sources based on established citation behavior patterns in information retrieval systems.
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white">Structured Data</h4>
                </div>
                <p className="text-gray-300">
                  Incorporating structured data principles and schema markup that enhance AI model information extraction and understanding.
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white">Recency Signals</h4>
                </div>
                <p className="text-gray-300">
                  Based on temporal relevance principles and how AI models weight information freshness and update frequency in their responses.
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white">User Engagement</h4>
                </div>
                <p className="text-gray-300">
                  Incorporating user interaction patterns and engagement metrics that influence how AI systems rank and present information.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-8 border border-gray-600">
              <div className="text-center">
                <h4 className="text-xl font-bold text-white mb-4">
                  Built on Established Research Principles
                </h4>
                <p className="text-gray-300 mb-6 max-w-3xl mx-auto">
                  Our methodology draws from established research in natural language processing, information retrieval, and AI system behavior 
                  to create a comprehensive AEO scoring approach.
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
                  <span className="bg-gray-700 px-4 py-2 rounded-full shadow-sm border border-gray-600">Natural Language Processing</span>
                  <span className="bg-gray-700 px-4 py-2 rounded-full shadow-sm border border-gray-600">Information Retrieval</span>
                  <span className="bg-gray-700 px-4 py-2 rounded-full shadow-sm border border-gray-600">AI System Behavior</span>
                  <span className="bg-gray-700 px-4 py-2 rounded-full shadow-sm border border-gray-600">Search Quality Guidelines</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mt-16 sm:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* SEO Effectiveness Chart */}
            <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-600">
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">SEO Click-Through Rates</h3>
                <p className="text-gray-300 text-sm sm:text-base">Position #1 organic search result CTR over time</p>
              </div>
              <div className="relative h-48 sm:h-64 bg-gray-700 rounded-lg p-4">
                <div className="h-full flex items-end justify-between gap-1">
                  {/* Real CTR data for position #1 */}
                  {[
                    { year: '2019', value: 45.0, label: '45%' },
                    { year: '2020', value: 43.8, label: '44%' },
                    { year: '2021', value: 42.5, label: '43%' },
                    { year: '2022', value: 41.2, label: '41%' },
                    { year: '2023', value: 39.8, label: '40%' },
                    { year: '2024', value: 38.4, label: '38%' },
                    { year: '2025', value: 36.9, label: '37%' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 relative">
                      <div className="text-xs font-medium text-gray-600 mb-1 absolute -top-6">{item.label}</div>
                      <div
                        className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-md transition-all duration-1000 ease-out min-h-[4px]"
                        style={{ height: `${Math.max(4, (item.value / 50) * 160)}px` }}
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
                  <span>18% decline since 2019</span>
                </div>
              </div>
            </div>

            {/* AI Search Growth Chart */}
            <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-600">
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">AI Search Tool Usage</h3>
                <p className="text-gray-300 text-sm sm:text-base">Monthly active users (millions) for AI search platforms</p>
                <p className="text-gray-500 text-xs mt-1">Source: Google court documents & public disclosures</p>
              </div>
              <div className="relative h-48 sm:h-64 bg-gray-700 rounded-lg p-4">
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


      {/* Dashboard Preview Section */}
      <div className="bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            {/* <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Professional Reports for SEOs & Businesses</h2> */}
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Generate comprehensive AI engine ranking reports with automated recommendations tailored for your websites. Perfect for freelance SEOs creating client deliverables 
              and businesses managing their own SEO strategy.
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
              <h3 className="text-xl font-semibold mb-2 text-white">Instant Report Generation</h3>
              <p className="text-gray-300">Generate professional client reports in minutes. Perfect for freelance SEOs who need quick, comprehensive analysis.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">AI-Powered Recommendations</h3>
              <p className="text-gray-300">Our multi-agentic AI analyzes your rankings and automatically generates actionable optimization strategies.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">DIY-Friendly Interface</h3>
              <p className="text-gray-300">Easy-to-use platform designed for businesses managing their own SEO without technical expertise required.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/aeo-score" className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-base sm:text-lg shadow-lg inline-block">
                Test Your Site Free Now
              </Link>
            </div>
          </div>

        </div>
      </div>
{/* 
      <SolutionsSection 
        solutions={solutions}
        dashboardSlides={dashboardSlides}
        currentSlide={currentSlide}
        onSlideChange={setCurrentSlide}
      /> */}

      <PricingSection 
        onCreateAccount={handleCreateAccount}
        onPlanSelection={handlePlanSelection}
      />

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Generate Professional SEO Reports?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join freelance SEOs and businesses using our AI-powered platform to quickly generate comprehensive ranking reports 
            and optimization recommendations.
          </p>
          <button
            onClick={handleCreateAccount}
            className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-base sm:text-lg cursor-pointer"
          >
            Start Generating Reports
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image src="/eye.png" alt="Rankly" width={24} height={24} />
              <span className="text-xl font-semibold">Rankly</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/learn" className="text-gray-400 hover:text-white transition-colors">Learn More</Link>
              <Link href="/aeo-score" className="text-gray-400 hover:text-white transition-colors">Generate Report</Link>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 American Code LLC. All rights reserved. AI-powered report generation for SEO professionals.</p>
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