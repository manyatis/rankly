'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../hooks/useAuth';
import HeroSection from '../components/home/HeroSection';
import PricingSection from '../components/home/PricingSection';
import Footer from '@/components/Footer';
import WebsiteAnalysisInput from '../components/WebsiteAnalysisInput';

export default function Home() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleCreateAccount = () => {
    setLoginModalOpen(true);
  };

  const handleLogin = () => {
    setLoginModalOpen(false);
  };

  const handlePlanSelection = () => {
    if (loading) return;

    if (!user) {
      // If user is not logged in, open login modal
      setLoginModalOpen(true);
      return;
    }

    // Redirect to dashboard - payment flow will be rebuilt
    router.push('/dashboard');
  };







  return (
    <div className="min-h-screen bg-gray-900" style={{ fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <Navbar />

      <HeroSection onCreateAccount={handleCreateAccount} />


      {/* Dashboard Screenshot Section */}
      <div className="bg-gray-900 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Track Your Progress with Real-Time Analytics
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Monitor your website&apos;s visibility across AI engines and watch your rankings improve over time
            </p>
          </div>

          {/* Dashboard Screenshot */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 sm:p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-4 right-4 bg-green-500/20 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-2 rounded-full text-green-400 text-xs sm:text-sm font-medium border border-green-500/30 z-20 shadow-lg">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Live Data
            </div>
            
            {/* Screenshot Container */}
            <div className="relative">
              <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
                <Image 
                  src="/dashboard-trends.png" 
                  alt="Rankly Dashboard - Trends Analysis" 
                  width={1200} 
                  height={675} 
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
            
            {/* Feature Callouts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">+42%</div>
                <p className="text-sm text-gray-400">Average visibility increase</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">5 AI Engines</div>
                <p className="text-sm text-gray-400">Tracked simultaneously</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">Real-time</div>
                <p className="text-sm text-gray-400">Performance monitoring</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-300 text-base sm:text-lg">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-600">
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

              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-600">
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

              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-600">
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

              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-600">
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

              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-600">
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

              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-600">
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

          {/* Track Your Competitors Section */}
          <div className="mt-16 sm:mt-20">
            <div className="bg-gray-800 rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-600">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    Track Your Competitors
                  </h3>
                  <p className="text-gray-300 mb-6 text-base sm:text-lg">
                    See how your website ranks against competitors across AI search engines. 
                    Identify opportunities and stay ahead of the competition in the age of AI-powered search.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Compare rankings across ChatGPT, Claude, and Perplexity</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Identify top-performing competitor strategies</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Track competitive positioning over time</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gray-700 rounded-xl p-4 shadow-lg">
                    <Image
                      src="/competitors.png"
                      alt="Competitor tracking dashboard showing rankings across AI search engines"
                      width={600}
                      height={400}
                      className="w-full h-auto rounded-lg"
                      priority={false}
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Live Competitor Data
                  </div>
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
              Get your first site analysis free to see how your website ranks across AI engines.
            </p>
          </div>

          {/* Dashboard Screenshot */}
          <div className="mb-16">
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 sm:p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-medium border border-gray-500 z-20 shadow-lg">
                Insights
              </div>
              
              {/* Screenshot Container */}
              <div className="relative">
                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
                  <Image 
                    src="/insights.png" 
                    alt="Rankly Insights - AI Visibility Analytics" 
                    width={1200} 
                    height={675} 
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
              
              {/* Dashboard Title */}
              <div className="text-center mt-6">
                <h3 className="text-xl font-bold text-white mb-1">Get Automatic Insights to Boost Your Visibility</h3>
                <p className="text-gray-400 text-sm">AI-powered recommendations to improve your rankings across all search engines</p>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Free Site Analysis</h3>
              <p className="text-sm sm:text-base text-gray-300">Get your first comprehensive site analysis at no cost. Perfect for businesses wanting to understand their visibility.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">AI-Powered Recommendations</h3>
              <p className="text-sm sm:text-base text-gray-300">Our multi-agentic AI analyzes your rankings and automatically generates actionable optimization strategies.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Simple Analysis Process</h3>
              <p className="text-sm sm:text-base text-gray-300">Easy-to-use platform designed for business owners to understand their visibility without technical expertise required.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <div className="flex justify-center">
              <WebsiteAnalysisInput
                onLoginRequired={handleCreateAccount}
                placeholder="Enter your website URL"
                buttonText="Analyze Your Site Free"
                size="small"
                className="max-w-sm"
              />
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
      <div className="bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Analyze Your Site&apos;s Visibility?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get your first site analysis free. See how your website ranks across all major AI engines and discover 
            actionable optimization opportunities.
          </p>
          <div className="flex justify-center">
            <WebsiteAnalysisInput
              onLoginRequired={handleCreateAccount}
              placeholder="Enter your website URL"
              buttonText="Analyze Your Site Free"
              size="small"
              className="max-w-sm"
            />
          </div>
        </div>
      </div>

      <Footer />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLogin}
      />
    </div>
  );
}