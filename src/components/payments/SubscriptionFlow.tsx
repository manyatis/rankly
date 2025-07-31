'use client';

import { useState, useEffect } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import CheckoutButton from './StripeCardForm';
import PricingPlans from '@/components/pricing/PricingPlans';

interface SubscriptionPlan {
  id: number;
  planId: string;
  name: string;
  priceCents: number;
  billingPeriod: string;
  features: string[];
  description: string;
}

export default function SubscriptionFlow() {
  const [, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'plans' | 'payment' | 'success'>('plans');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load subscription plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan | { planId: string }) => {
    // Only allow indie plan for now
    if (plan.planId !== 'indie') {
      return; // Do nothing for disabled plans
    }
    // Cast to SubscriptionPlan since we know it's indie
    setSelectedPlan(plan as SubscriptionPlan);
    setStep('payment');
    setError(null);
  };

  // This function is no longer used with Checkout but kept for potential future use
  // const handlePaymentSuccess = async (subscriptionId: string) => {
  //   if (!selectedPlan) return;
  //   
  //   console.log('Payment successful for subscription:', subscriptionId);
  //   setStep('success');
  // };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const formatPrice = (priceCents: number): string => {
    return `$${(priceCents / 100).toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-400">Loading subscription plans...</div>
      </div>
    );
  }

  if (error && step === 'plans') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  // Success Step
  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to {selectedPlan?.name}!</h2>
          <p className="text-gray-300 mb-6">
            Your subscription is now active. You can start using all the features right away.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Payment Step
  if (step === 'payment' && selectedPlan) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => {
            setStep('plans');
            setError(null);
          }}
          className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to plans
        </button>

        {/* Selected Plan Summary */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedPlan.name} Plan</h3>
                <p className="text-gray-400 text-sm">{selectedPlan.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {formatPrice(selectedPlan.priceCents)}
              </div>
              <div className="text-gray-400 text-sm">/{selectedPlan.billingPeriod}</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Payment Form */}
        <CheckoutButton 
          onError={handlePaymentError}
          planName={selectedPlan.name}
          planPrice={formatPrice(selectedPlan.priceCents)}
          planId={selectedPlan.planId}
        />
      </div>
    );
  }

  // Plans Selection Step
  return (
    <PricingPlans
      onPlanSelect={handlePlanSelect}
      showFree={true}
      title="Choose Your Plan"
      subtitle="Unlock the full potential of AI Engine Optimization with our subscription plans. Get deeper insights, automated scanning, and priority support."
      isSubscriptionFlow={true}
    />
  );
}