'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
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
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Welcome to Rankly!</h1>
          <p className="text-gray-300 mb-6">
            Your subscription is now active. You can start using all the premium features right away.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}