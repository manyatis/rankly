'use client';

import { useState } from 'react';
import { sendWaitlistEmail } from '../api/send-email';

interface WaitlistProps {
  variant?: 'default' | 'aeo';
  title?: string;
  description?: string;
  discount?: string;
  className?: string;
}

export default function Waitlist({ 
  variant = 'default',
  title,
  description,
  discount = '50%',
  className = ''
}: WaitlistProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  // Default variant (used in main page and AEO score page)
  if (variant === 'default') {
    return (
      <div id="waitlist" className={`bg-gradient-to-r from-blue-600 to-indigo-600 py-20 ${className}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {title || `Join the Waitlist & Save ${discount}`}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {description || 'Be among the first to access our comprehensive AEO and SEO analytics platform. Early members get 50% off their first year.'}
          </p>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white text-gray-900"
                required
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Join Waitlist
              </button>
            </form>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
              <div className="text-white text-lg font-medium mb-2">Welcome to the waitlist!</div>
              <p className="text-blue-100">You&apos;re secured for {discount} off when we launch. We&apos;ll be in touch soon with early access!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // AEO variant (used in AEO page)
  return (
    <div className={`bg-white py-20 ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-gray-50 rounded-lg p-12 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {title || 'Ready to Optimize for AI Search?'}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {description || `Join thousands of businesses preparing for the AI-first search future. Get notified when SearchDogAI launches with your exclusive ${discount} discount.`}
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
                Join Waitlist
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
  );
}