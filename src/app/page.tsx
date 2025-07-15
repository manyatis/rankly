'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Error submitting email:', err);
      alert('Failed to join waitlist.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Background decoration */}
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🔍</span>
              <span className="text-xl font-bold text-gray-900">SearchDogAi</span>
            </a>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#waitlist" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Join Waitlist</a>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">SearchDogAi</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional SEO optimization through automated GitHub integration. 
            Comprehensive analysis, targeted improvements, and seamless implementation via pull request.
          </p>
          <div className="flex justify-center space-x-4 mb-12">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Privacy-First</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm font-semibold text-gray-700">GitHub Integration</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Automated Analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI-powered process makes SEO optimization effortless in just two simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-6">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-lg">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div id="features" className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Free SEO Analysis</h3>
            <p className="text-gray-600">
              Get instant AI-powered analysis of your website&apos;s search engine optimization with detailed grades and recommendations.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-3">Automated Optimization</h3>
            <p className="text-gray-600">
              Our specially trained models create targeted improvements and submit them via pull request - no manual work required.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-3">Privacy-First Approach</h3>
            <p className="text-gray-600">
              Zero data storage. Your website data is analyzed in real-time and never saved to our servers.
            </p>
          </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div id="pricing" className="bg-white rounded-2xl shadow-xl p-8 mb-16 max-w-2xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, One-Time Pricing</h2>
            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">$99</span>
              <span className="text-gray-500 ml-2">one-time payment</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold">
                🎉 Waitlist members get 75% OFF!
              </p>
              <p className="text-green-700">
                Your price: <span className="font-bold text-2xl">$24.75</span>
                <span className="ml-2 text-sm">Save $74.25!</span>
              </p>
            </div>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Complete SEO analysis and grading
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Automated optimization pull request
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                AI-powered search engine improvements
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Zero data storage guarantee
              </li>
            </ul>
          </div>
          </div>
        </div>
      </div>

      {/* Waitlist Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div id="waitlist" className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center max-w-2xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 backdrop-blur-sm"></div>
          <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Join the Waitlist</h2>
          <p className="text-blue-100 mb-6">
            Be among the first to optimize your website with AI. Get notified when we launch and secure your 75% discount!
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 bg-white border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Join Waitlist
              </button>
            </form>
          ) : (
            <div className="bg-green-500 rounded-lg p-4 max-w-md mx-auto">
              <p className="font-semibold">🎉 You&apos;re on the list!</p>
              <p className="text-green-100">We&apos;ll notify you when SearchDogAi launches.</p>
            </div>
          )}
          </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-600 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <span className="text-2xl">🔍</span>
                <span className="text-xl font-bold text-gray-700">SearchDogAi</span>
              </div>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                <span className="text-gray-500">Privacy-first AI SEO optimization</span>
                <span className="text-gray-500">&copy; 2024 SearchDogAi</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}