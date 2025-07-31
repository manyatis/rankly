'use client';

import { useState, useEffect } from 'react';
import { Check, Star, Zap, Crown, ArrowLeft } from 'lucide-react';
import StripeCardForm from './StripeCardForm';

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
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
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

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    // Only allow indie plan for now
    if (plan.planId !== 'indie') {
      return; // Do nothing for disabled plans
    }
    setSelectedPlan(plan);
    setStep('payment');
    setError(null);
  };

  const handlePaymentSuccess = async (subscriptionId: string) => {
    if (!selectedPlan) return;
    
    console.log('Payment successful for subscription:', subscriptionId);
    setStep('success');
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const formatPrice = (priceCents: number): string => {
    return `$${(priceCents / 100).toFixed(0)}`;
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'indie':
        return <Star className="w-6 h-6 text-blue-400" />;
      case 'professional':
        return <Zap className="w-6 h-6 text-purple-400" />;
      case 'enterprise':
        return <Crown className="w-6 h-6 text-yellow-400" />;
      default:
        return <Check className="w-6 h-6 text-gray-400" />;
    }
  };

  const isPlanPopular = (planId: string): boolean => {
    return planId === 'indie'; // Indie is most popular
  };

  const isPlanDisabled = (planId: string): boolean => {
    return planId !== 'indie'; // Only indie is enabled
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
              {getPlanIcon(selectedPlan.planId)}
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
        <StripeCardForm 
          onSuccess={handlePaymentSuccess}
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
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Unlock the full potential of AI Engine Optimization with our subscription plans. 
          Get deeper insights, automated scanning, and priority support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`
              relative bg-gray-900 border rounded-xl p-6 transition-all duration-200
              ${isPlanDisabled(plan.planId)
                ? 'border-gray-800 opacity-60 cursor-not-allowed'
                : isPlanPopular(plan.planId)
                ? 'border-blue-500 ring-2 ring-blue-500/20 transform scale-105 cursor-pointer'
                : 'border-gray-700 hover:border-gray-600 cursor-pointer'
              }
            `}
            onClick={() => handlePlanSelect(plan)}
          >
            {isPlanPopular(plan.planId) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            {isPlanDisabled(plan.planId) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gray-600 text-gray-300 px-4 py-1 rounded-full text-sm font-medium">
                  Coming Soon
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                {getPlanIcon(plan.planId)}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-bold text-white">
                  {formatPrice(plan.priceCents)}
                </span>
                <span className="text-gray-400 ml-1">/{plan.billingPeriod}</span>
              </div>
              <p className="text-gray-400 text-sm">{plan.description}</p>
            </div>

            <div className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <button
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-colors
                ${isPlanDisabled(plan.planId)
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : isPlanPopular(plan.planId)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
                }
              `}
              disabled={isPlanDisabled(plan.planId)}
            >
              {isPlanDisabled(plan.planId) ? 'Coming Soon' : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>All plans include a 30-day money-back guarantee. Cancel anytime.</p>
      </div>
    </div>
  );
}