'use client';

import { X, ArrowLeft } from 'lucide-react';

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Subscription Cancelled</h1>
          <p className="text-gray-300 mb-6">
            No worries! Your subscription wasn&apos;t created. You can try again anytime or continue using Rankly with our free tier.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/subscribe'}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}