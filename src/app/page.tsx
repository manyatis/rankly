'use client';

import { useState } from 'react';

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
    <div className="min-h-screen bg-white" style={{fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center space-x-2 text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors">
              <img src="/dog.png" alt="SearchDogAi" width="24" height="24" className="object-contain" />
              <span>SearchDogAi</span>
            </a>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Pricing</a>
              <a href="#waitlist" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-md">Get Started</a>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Strategic AI SEO Solutions
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Professional SEO optimization through automated GitHub integration. 
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
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered process makes SEO optimization effortless in just two simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
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
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive SEO solutions designed to maximize your website&apos;s potential.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
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
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, One-Time Pricing</h2>
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
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gray-50 rounded-lg p-12 text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Join the Waitlist</h2>
            <p className="text-xl text-gray-600 mb-8">
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
                  className="flex-1 px-4 py-3 rounded-md text-gray-900 bg-white border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
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
                <p className="text-gray-600">We&apos;ll notify you when SearchDogAi launches.</p>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-900">
                <path d="M18 6c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zM8 6c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z" fill="currentColor"/>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 1.74.63 3.34 1.68 4.58L12 20l5.32-6.42C18.37 12.34 19 10.74 19 9c0-3.87-3.13-7-7-7z" fill="currentColor"/>
                <circle cx="10" cy="10" r="1" fill="white"/>
                <circle cx="14" cy="10" r="1" fill="white"/>
                <path d="M12 13c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="white"/>
              </svg>
              <span className="text-xl font-semibold text-gray-900">SearchDogAi</span>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <span className="text-gray-600">Privacy-first AI SEO optimization</span>
              <span className="text-gray-600">&copy; {new Date().getFullYear()} SearchDogAi</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}