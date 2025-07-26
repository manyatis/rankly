'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import LoginModal from '@/components/LoginModal';

export default function LearnPage() {
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
              Understanding AEO
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              Learn how Answer Engine Optimization and Generative Engine Optimization are revolutionizing search, why traditional SEO is becoming obsolete, and how AI is changing consumer behavior forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleCreateAccount}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg cursor-pointer"
              >
                Start Optimizing Now
              </button>
              <Link href="/aeo-score" className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg border-2 border-blue-600">
                Test Your AEO Score
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* What is AEO */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What is AEO?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The next evolution of search optimization for an AI-first world
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Answer Engine Optimization (AEO)</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                AEO is the practice of optimizing content to be selected, cited, and featured by AI-powered answer engines like ChatGPT, Claude, Perplexity, and Google&apos;s AI Overviews.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>Focuses on direct answers to user queries</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>Optimizes for AI citation and reference</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>Emphasizes authoritative, structured content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>Targets conversational search patterns</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.566l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Generative Engine Optimization (GEO)</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                GEO is the strategic optimization of content to improve visibility and citation in AI-generated responses from large language models and generative AI systems.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>Optimizes for generative AI model training data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>Focuses on factual accuracy and source attribution</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>Emphasizes comprehensive, well-structured information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>Targets AI knowledge synthesis patterns</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* The Evolution of Search */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The Evolution of Search</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              How traditional SEO is evolving to meet the demands of an AI-first search landscape
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Changing User Behavior</h3>
              <p className="text-gray-600 leading-relaxed">
                60% of searches now complete without clicks due to AI Overviews and instant answers. Users are finding value in immediate, comprehensive responses.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Direct Answer Preference</h3>
              <p className="text-gray-600 leading-relaxed">
                AI provides complete answers directly in search results, meeting user needs without requiring additional clicks or site visits.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.75.75 0 01.642-.413 24.5 24.5 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.412-.993-2.67-2.43-2.902A24.394 24.394 0 0010 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Conversational Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Users are adopting conversational, natural language queries with AI assistants, creating new opportunities for content optimization.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">The Search Landscape is Transforming</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Traditional Search Patterns Shifting:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• 20-40% change in organic click behavior</li>
                  <li>• 25% growth predicted in AI-assisted search by 2026</li>
                  <li>• 13.14% of queries now feature AI Overviews</li>
                  <li>• New opportunities emerging in conversational search</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">AI Search Adoption Accelerating:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• 82% of users embrace AI-powered results</li>
                  <li>• ChatGPT referral traffic up 1,800%</li>
                  <li>• 86% of marketers expanding AI strategy</li>
                  <li>• Major search engines investing in AI features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How AI Changes Consumer Behavior */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How AI is Revolutionizing Consumer Behavior</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding the fundamental shift in how people discover, research, and interact with information
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">The Old Way: Traditional Search</h3>
              <div className="bg-gray-50 rounded-xl p-8">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">User types keywords</h4>
                      <p className="text-gray-600 text-sm">&quot;best running shoes 2024&quot;</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Scans 10 blue links</h4>
                      <p className="text-gray-600 text-sm">Clicks multiple results</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Reads multiple articles</h4>
                      <p className="text-gray-600 text-sm">Compares information manually</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Makes decision</h4>
                      <p className="text-gray-600 text-sm">After 20+ minutes of research</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">The New Way: AI-Powered Search</h3>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Asks natural question</h4>
                      <p className="text-gray-600 text-sm">&quot;What are the best running shoes for marathon training with flat feet?&quot;</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Gets instant, personalized answer</h4>
                      <p className="text-gray-600 text-sm">AI synthesizes multiple sources</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Asks follow-up questions</h4>
                      <p className="text-gray-600 text-sm">&quot;What&apos;s the price range?&quot; &quot;Where can I buy them?&quot;</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Makes informed decision</h4>
                      <p className="text-gray-600 text-sm">In under 5 minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">The Impact on Businesses</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-orange-600 mb-3">Traditional SEO Challenges:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Limited visibility in AI search results</li>
                  <li>• Adapting to changing user behavior</li>
                  <li>• Need for content strategy evolution</li>
                  <li>• Keeping pace with AI developments</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-3">AEO-Enhanced Businesses:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Featured in AI-generated responses</li>
                  <li>• Higher quality traffic and leads</li>
                  <li>• Increased brand authority</li>
                  <li>• Future-ready digital presence</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Differences */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">AEO vs Traditional SEO: Key Differences</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding what&apos;s different and why it matters for your business
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Aspect</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Traditional SEO</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">AEO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Primary Focus</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Ranking in search results</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Being cited by AI systems</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Content Strategy</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Keyword-focused content</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Authoritative, structured answers</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Target Audience</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Search engine algorithms</td>
                  <td className="px-6 py-4 text-sm text-gray-700">AI models and human queries</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Success Metrics</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Rankings, traffic, CTR</td>
                  <td className="px-6 py-4 text-sm text-gray-700">AI citations, brand mentions</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">User Behavior</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Click and browse</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Ask and get answers</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Optimization Target</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Search engine crawlers</td>
                  <td className="px-6 py-4 text-sm text-gray-700">AI training data inclusion</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Master AEO?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Don&apos;t let your competitors dominate AI search results. Start optimizing for the future of search today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleCreateAccount}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg cursor-pointer"
            >
              Start Free
            </button>
            <Link href="/aeo-score" className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-400 transition-colors font-medium text-lg border-2 border-white">
              Test Your AEO Score
            </Link>
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
              <span className="text-gray-600">Master AEO optimization</span>
              <span className="text-gray-600">&copy; {new Date().getFullYear()} SearchDogAI</span>
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