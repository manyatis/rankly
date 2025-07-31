'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2, Star, Zap, TrendingUp, BarChart3, Clock, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setIsVerifying(false);
      return;
    }

    // Give webhooks a moment to process, then redirect to dashboard
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  const benefits = [
    {
      icon: <Star className="w-6 h-6 text-blue-400" />,
      title: "Premium AI Models",
      description: "Access to all AI engines including ChatGPT, Claude, and Perplexity"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-green-400" />,
      title: "Advanced Analytics",
      description: "Detailed insights into your AI search visibility and competitor tracking"
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-400" />,
      title: "Automated Scanning",
      description: "Daily, weekly, or monthly automated AEO analysis for your websites"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-yellow-400" />,
      title: "Trend Analysis",
      description: "Historical data and trends to track your AEO performance over time"
    },
    {
      icon: <Users className="w-6 h-6 text-red-400" />,
      title: "Competitor Intelligence",
      description: "Monitor and analyze your top competitors in AI search results"
    },
    {
      icon: <Zap className="w-6 h-6 text-indigo-400" />,
      title: "Priority Support",
      description: "Get help when you need it with our dedicated support team"
    }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-8">
              <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
              <p className="text-red-300 mb-6">{error}</p>
              <button
                onClick={() => window.location.href = '/subscribe'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-4">Processing your subscription...</h1>
              <p className="text-gray-300">
                Please wait while we activate your account. This should only take a few seconds.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to Rankly Premium! 🎉</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your subscription is now active and you have access to all premium features. 
              Let&apos;s get you started on optimizing your AI search visibility!
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  {benefit.icon}
                  <h3 className="text-lg font-semibold text-white ml-3">{benefit.title}</h3>
                </div>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-gray-300 mb-6">
              Head to your dashboard to add your first website and start your AEO analysis journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/account'}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                View Account Settings
              </button>
            </div>
          </div>

          {/* Quick Start Guide */}
          <div className="mt-12 bg-gray-900 border border-gray-700 rounded-lg p-8">
            <h3 className="text-xl font-bold text-white mb-6">Quick Start Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Add Your Website</h4>
                <p className="text-gray-400 text-sm">Enter your website URL in the dashboard to get started</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Run Analysis</h4>
                <p className="text-gray-400 text-sm">Execute your first AEO analysis to see how you rank</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Set Up Automation</h4>
                <p className="text-gray-400 text-sm">Configure recurring scans to track your progress over time</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}