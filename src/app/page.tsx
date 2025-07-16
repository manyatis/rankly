'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { sendWaitlistEmail } from '../api/send-email';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  }

  const steps = [
    {
      number: 1,
      title: "Connect Your GitHub",
      description: "Provide our GitHub app with access & allow us to perform the analysis and grade for your project. None of your IP will be stored."
    },
    {
      number: 2,
      title: "AI Agent Optimization",
      description: "Wait for our agent to automatically introduce your SEO optimizations, test them, ensure compatibility, and then open a PR for review."
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      sendWaitlistEmail(email);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting email:', err);
      alert('Failed to join waitlist.');
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors">
              <Image src="/dog.png" alt="SearchDogAI" width={24} height={24} className="object-contain" />
              <span>SearchDogAI</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Features</a>
              <a href="/aeo" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">What is AEO</a>
              <a href="/aeo-score" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">AEO Score Tool</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Pricing</a>
              <a href="#waitlist" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-md">Get Started</a>
            </div>
            <button className='md:hidden p-2 text-gray-600 hover:text-gray-900' onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="absolute inset-0 bg-black opacity-50" onClick={closeMobileMenu} />
              <div className={`absolute right-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col p-6 space-y-6 mt-16">
                  <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg" onClick={closeMobileMenu}>Features</a>
                  <a href="/aeo" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg" onClick={closeMobileMenu}>What is AEO</a>
                  <a href="/aeo-score" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg" onClick={closeMobileMenu}>AEO Score Tool</a>
                  <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg" onClick={closeMobileMenu}>Pricing</a>
                  <a href="#waitlist" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-md text-center" onClick={closeMobileMenu}>Get Started</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* AI Search Statistics Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              AI Search Is Reshaping SEO & Introducing AEO
            </h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto mb-8">
              The search landscape is rapidly evolving. AI Engine Optimization (AEO) is now essential alongside traditional SEO to ensure visibility in AI-powered search results.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">60%</div>
              <p className="text-sm text-gray-600">of searches now complete without clicks thanks to AI Overviews</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">86%</div>
              <p className="text-sm text-gray-600">of SEO professionals have integrated AI into their strategy</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">20-40%</div>
              <p className="text-sm text-gray-600">reduction in organic click-through rates due to AI Overviews</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">82%</div>
              <p className="text-sm text-gray-600">of users find AI-powered search more helpful than traditional search</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm max-w-4xl mx-auto">
            <p className="text-gray-700 text-center leading-relaxed">
              <strong>The reality:</strong> Google&apos;s AI Overviews now appear in 13.14% of all queries (up from 6.49% in just two months),
              while 19% of search results now include AI-generated content. Companies using AI in their SEO strategies
              see <strong className="text-blue-600">30% improvement in rankings within 6 months</strong>.
              The future isn&apos;t about ranking #1 anymore — it&apos;s about being the answer AI engines choose through AEO optimization.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Strategic AI SEO & AEO Solutions
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Professional SEO and AI Engine Optimization (AEO) through automated GitHub integration.
              Comprehensive analysis, targeted improvements, and seamless implementation via pull request.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <a href="#waitlist" className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-md">
                Get Started
              </a>
              <a href="#features" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered process makes SEO optimization effortless in just two simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg text-xl font-bold mb-6">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive SEO and AEO solutions designed to maximize your website&apos;s potential.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="p-8 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">SEO Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant AI-powered analysis of your website&apos;s search engine optimization with detailed grades and recommendations.
              </p>
            </div>
            <div className="p-8 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">AEO Optimization</h3>
              <p className="text-gray-600 leading-relaxed">
                AI Engine Optimization specifically designed to make your content visible and preferred by AI search engines like ChatGPT and Claude.
              </p>
            </div>
            <div className="p-8 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Automated Optimization</h3>
              <p className="text-gray-600 leading-relaxed">
                Our specially trained models create targeted improvements and submit them via pull request - no manual work required.
              </p>
            </div>
            <div className="p-8 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Privacy-First Approach</h3>
              <p className="text-gray-600 leading-relaxed">
                Zero data storage. Your website data is analyzed in real-time and never saved to our servers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, One-Time Pricing</h2>
            <p className="text-xl text-gray-600">Professional SEO optimization with transparent pricing</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$99</span>
                <span className="text-gray-500 ml-2">one-time payment</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-gray-800 font-semibold">
                  🎉 Waitlist members get 75% OFF!
                </p>
                <p className="text-gray-700">
                  Your price: <span className="font-bold text-2xl text-green-600">$24.75</span>
                  <span className="ml-2 text-sm text-green-600 font-semibold">Save $74.25!</span>
                </p>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-gray-900 mr-3">✓</span>
                  Complete SEO analysis and grading
                </li>
                <li className="flex items-center">
                  <span className="text-gray-900 mr-3">✓</span>
                  AEO optimization for AI search engines
                </li>
                <li className="flex items-center">
                  <span className="text-gray-900 mr-3">✓</span>
                  Automated optimization pull request
                </li>
                <li className="flex items-center">
                  <span className="text-gray-900 mr-3">✓</span>
                  AI-powered search engine improvements
                </li>
                <li className="flex items-center">
                  <span className="text-gray-900 mr-3">✓</span>
                  Zero data storage guarantee
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Section */}
      <div id="waitlist" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gray-50 rounded-lg p-6 sm:p-8 md:p-12 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Join the Waitlist</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8">
              Be among the first to optimize your website with AI. Get notified when we launch and secure your 75% discount!
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 rounded-md text-gray-900 bg-white border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:outline-none text-base"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  Join Wait List
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
              <span className="text-gray-600">Privacy-first AI SEO & AEO optimization</span>
              <span className="text-gray-600">&copy; {new Date().getFullYear()} SearchDogAI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}