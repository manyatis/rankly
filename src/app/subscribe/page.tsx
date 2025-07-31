'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import SubscriptionFlow from '@/components/payments/SubscriptionFlow';

export default function SubscribePage() {
  const { status } = useSession();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center py-12 sm:py-20 px-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 text-center border border-gray-700">
            <div className="text-6xl mb-6">🔐</div>
            <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
            <p className="text-gray-300 mb-6">
              You need to be logged in to manage your subscription. Please sign in to continue.
            </p>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
            >
              Sign in with Google
            </button>
            <p className="text-sm text-gray-400 mt-4">
              New users will be automatically registered upon first login.
            </p>
          </div>
        </div>
        <Footer />
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onSuccess={() => setLoginModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <SubscriptionFlow />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}