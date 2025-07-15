'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🔍 <span className="text-blue-600">SearchDogAi</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            One-click AI Search Engine optimization for your website. Connect your GitHub, get instant analysis,
            and boost your search visibility with a single pull request.
          </p>
          <div className="flex justify-center space-x-4 mb-12">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <span className="text-sm text-gray-500">✅ Privacy-First</span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <span className="text-sm text-gray-500">🚀 One-Click Setup</span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <span className="text-sm text-gray-500">🤖 AI-Powered</span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Free SEO Analysis</h3>
            <p className="text-gray-600">
              Get instant AI-powered analysis of your website's search engine optimization with detailed grades and recommendations.
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

        {/* Pricing Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 max-w-2xl mx-auto">
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

        {/* Waitlist Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center max-w-2xl mx-auto">
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
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-blue-300"
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
              <p className="font-semibold">🎉 You're on the list!</p>
              <p className="text-green-100">We'll notify you when SearchDogAi launches.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>&copy; 2024 SearchDogAi. Privacy-first AI SEO optimization.</p>
        </div>
      </div>
    </div>
  );
}