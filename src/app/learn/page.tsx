'use client';

import Link from 'next/link';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import LoginModal from '@/components/LoginModal';
import Image from 'next/image';

export default function LearnPage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleCreateAccount = () => {
    setLoginModalOpen(true);
  };

  const handleLogin = () => {
    setLoginModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900" style={{ fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <Navbar />

      {/* What is AEO */}
      <div className="bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">SEO + AEO + GEO: The Complete Search Strategy</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              How modern optimization techniques work together to maximize your search visibility
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8">
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Traditional SEO Foundation</h3>
              <p className="text-blue-100 mb-4 leading-relaxed">
                Your existing SEO foundation remains crucial: technical optimization, content quality, user experience, and authority building.
              </p>
              <ul className="space-y-2 text-blue-100">
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2 mt-1">•</span>
                  <span>Technical SEO & site performance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2 mt-1">•</span>
                  <span>Keyword research & content strategy</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2 mt-1">•</span>
                  <span>Link building & domain authority</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2 mt-1">•</span>
                  <span>User experience optimization</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8">
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.75.75 0 01.642-.413 24.5 24.5 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.412-.993-2.67-2.43-2.902A24.394 24.394 0 0010 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">+ AEO Enhancement Layer</h3>
              <p className="text-green-100 mb-4 leading-relaxed">
                AEO amplifies your SEO by optimizing for AI-powered answer engines and conversational search patterns.
              </p>
              <ul className="space-y-2 text-green-100">
                <li className="flex items-start">
                  <span className="text-green-300 mr-2 mt-1">•</span>
                  <span>Structured data for AI understanding</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-300 mr-2 mt-1">•</span>
                  <span>Direct answer format optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-300 mr-2 mt-1">•</span>
                  <span>Conversational query targeting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-300 mr-2 mt-1">•</span>
                  <span>AI citation-friendly content</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-8">
              <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.566l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">+ GEO Future-Proofing</h3>
              <p className="text-purple-100 mb-4 leading-relaxed">
                GEO ensures your content is positioned for inclusion in AI training data and generative responses.
              </p>
              <ul className="space-y-2 text-purple-100">
                <li className="flex items-start">
                  <span className="text-purple-300 mr-2 mt-1">•</span>
                  <span>Authoritative source positioning</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-300 mr-2 mt-1">•</span>
                  <span>Factual accuracy optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-300 mr-2 mt-1">•</span>
                  <span>Comprehensive topic coverage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-300 mr-2 mt-1">•</span>
                  <span>AI model training data inclusion</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* The Evolution of Search */}
      <div className="bg-gray-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Your SEO Strategy Needs AEO & GEO</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Don&apos;t abandon SEO—amplify it with AI-focused optimization for maximum search visibility
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-700 rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">SEO Still Drives Discovery</h3>
              <p className="text-gray-300 leading-relaxed">
                Traditional SEO ensures your content is discoverable by both search engines and AI systems. Strong SEO creates the foundation for AI visibility.
              </p>
            </div>

            <div className="bg-gray-700 rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">AEO Amplifies Authority</h3>
              <p className="text-gray-300 leading-relaxed">
                AEO techniques enhance your existing content authority, making your SEO-optimized pages more likely to be cited by AI systems.
              </p>
            </div>

            <div className="bg-gray-700 rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.75.75 0 01.642-.413 24.5 24.5 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.412-.993-2.67-2.43-2.902A24.394 24.394 0 0010 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">GEO Future-Proofs Content</h3>
              <p className="text-gray-300 leading-relaxed">
                GEO ensures your SEO content remains valuable as AI systems evolve, positioning you for long-term search visibility.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">The Integrated Approach: SEO + AEO + GEO</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-white mb-3">Traditional SEO Foundation Stays Strong:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Technical SEO remains crucial for AI crawling</li>
                  <li>• Quality content signals authority to AI systems</li>
                  <li>• Domain authority influences AI source selection</li>
                  <li>• User experience impacts AI ranking factors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">AEO & GEO Enhance Your SEO Investment:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• 300% more visibility across search channels</li>
                  <li>• Higher quality traffic from AI referrals</li>
                  <li>• Enhanced brand authority in AI responses</li>
                  <li>• Future-proof content strategy development</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How AI Changes Consumer Behavior */}
      <div className="bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How to Layer AEO & GEO on Your Existing SEO</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Practical steps to enhance your current SEO strategy without starting from scratch
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Your Current SEO Process</h3>
              <div className="bg-gray-800 rounded-xl p-8">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Keyword research & planning</h4>
                      <p className="text-gray-400 text-sm">Traditional SEO foundation</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Content creation & optimization</h4>
                      <p className="text-gray-400 text-sm">High-quality, targeted content</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Technical SEO & link building</h4>
                      <p className="text-gray-400 text-sm">Authority and crawlability</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Monitor & optimize rankings</h4>
                      <p className="text-gray-400 text-sm">Traditional SERP visibility</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Enhanced with AEO & GEO Layers</h3>
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">+</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Add conversational keyword research</h4>
                      <p className="text-green-100 text-sm">&quot;How to&quot;, &quot;What is&quot;, &quot;Best way&quot; queries</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">+</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Structure content for AI citation</h4>
                      <p className="text-green-100 text-sm">Clear answers, fact-based content</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">+</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Enhanced schema & structured data</h4>
                      <p className="text-green-100 text-sm">AI-readable information architecture</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">+</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Track AI citations & mentions</h4>
                      <p className="text-green-100 text-sm">Multi-channel visibility monitoring</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">The ROI of Integrated SEO + AEO + GEO</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-orange-400 mb-3">SEO-Only Approach Limitations:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Missing 40% of AI-powered search traffic</li>
                  <li>• Limited future-proofing for evolving search</li>
                  <li>• Reduced brand authority in AI responses</li>
                  <li>• Slower adaptation to user behavior changes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-3">Integrated Strategy Benefits:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• 300% increase in total search visibility</li>
                  <li>• Enhanced brand authority across all channels</li>
                  <li>• Future-proof content investment</li>
                  <li>• Higher-intent traffic from AI referrals</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Differences */}
      <div className="bg-gray-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">SEO + AEO + GEO: Integrated Strategy Comparison</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              How each approach builds on the others for maximum search impact
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-gray-700 rounded-xl shadow-sm">
              <thead>
                <tr className="bg-gray-600">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Aspect</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Traditional SEO</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">+ AEO Layer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">+ GEO Layer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-white">Primary Focus</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Traditional SERP rankings</td>
                  <td className="px-6 py-4 text-sm text-gray-300">+ AI answer citations</td>
                  <td className="px-6 py-4 text-sm text-gray-300">+ Training data inclusion</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-white">Content Strategy</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Keyword-optimized content</td>
                  <td className="px-6 py-4 text-sm text-gray-300">+ Direct answer formats</td>
                  <td className="px-6 py-4 text-sm text-gray-300">+ Comprehensive authority</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-white">Technical Optimization</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Core Web Vitals & crawling</td>
                  <td className="px-6 py-4 text-sm text-gray-300">+ Enhanced schema markup</td>
                  <td className="px-6 py-4 text-sm text-gray-300">+ AI-readable structure</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-white">Success Metrics</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Rankings, traffic, CTR</td>
                  <td className="px-6 py-4 text-sm text-gray-300">+ AI citations & mentions</td>
                  <td className="px-6 py-4 text-sm text-gray-300">+ Brand authority signals</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-white">User Intent</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Traditional search queries</td>
                  <td className="px-6 py-4 text-sm text-gray-300">+ Conversational questions</td>
                  <td className="px-6 py-4 text-sm text-gray-300">+ Complex research queries</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-white">Timeline</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Immediate foundation</td>
                  <td className="px-6 py-4 text-sm text-gray-300">+ 6-month enhancement</td>
                  <td className="px-6 py-4 text-sm text-gray-300">+ Long-term positioning</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to start free?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Don&apos;t let your competitors dominate AI search results. Start optimizing for the future of search today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-400 transition-colors font-medium text-lg border-2 border-white">
              Get Your Rank
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-semibold text-white hover:text-gray-300 transition-colors">
              <Image src="/lucy.png" alt="Rankly" width={24} height={24} />
              <span>Rankly</span>
            </Link>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <span className="text-gray-400">Amplify SEO with AEO & GEO</span>
              <span className="text-gray-400">&copy; {new Date().getFullYear()} Rankly</span>
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