'use client';

import { useState, useEffect } from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
import PaymentForm from './PaymentForm';

interface SubscriptionPlan {
  id: number;
  planId: string;
  name: string;
  priceCents: number;
  billingPeriod: string;
  features: string[];
  description: string;
}

interface SubscriptionPlansProps {
  onSubscriptionSuccess?: () => void;
}

export default function SubscriptionPlans({ onSubscriptionSuccess }: SubscriptionPlansProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

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
    setSelectedPlan(plan);
    setShowPaymentForm(true);
    setPaymentError(null);
  };

  const handlePaymentSuccess = (result: { planName: string; subscriptionId: string }) => {
    console.log('✅ Subscription created successfully:', result);
    setShowPaymentForm(false);
    setSelectedPlan(null);
    
    // Show success message or redirect
    alert(`Successfully subscribed to ${result.planName}! Your subscription is now active.`);
    
    // Call the success callback if provided
    if (onSubscriptionSuccess) {
      onSubscriptionSuccess();
    }
    
    // Optionally redirect to dashboard
    window.location.href = '/dashboard';
  };

  const handlePaymentError = (errorMessage: string) => {
    console.error('❌ Payment error:', errorMessage);
    setPaymentError(errorMessage);
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
    return planId === 'professional'; // Mark Professional as popular
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-400">Loading subscription plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (showPaymentForm && selectedPlan) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <button
            onClick={() => {
              setShowPaymentForm(false);
              setSelectedPlan(null);
              setPaymentError(null);
            }}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Back to plans
          </button>
        </div>
        
        {paymentError && (
          <div className="max-w-md mx-auto p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{paymentError}</p>
          </div>
        )}
        
        <PaymentForm
          planId={selectedPlan.planId}
          planName={selectedPlan.name}
          price={formatPrice(selectedPlan.priceCents) + '/month'}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Unlock the full potential of AI Engine Optimization with our subscription plans. 
          Get deeper insights, automated scanning, and priority support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`
              relative bg-gray-900 border rounded-xl p-6 transition-all duration-200
              ${isPlanPopular(plan.planId)
                ? 'border-purple-500 ring-2 ring-purple-500/20 transform scale-105'
                : 'border-gray-700 hover:border-gray-600'
              }
            `}
          >
            {isPlanPopular(plan.planId) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
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
              onClick={() => handlePlanSelect(plan)}
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-colors
                ${isPlanPopular(plan.planId)
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              Subscribe to {plan.name}
            </button>
          </div>
        ))}
      </div>

      {/* Free Plan Card */}
      <div className="max-w-md mx-auto">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-3">
            <Check className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Free Plan</h3>
          <div className="mb-2">
            <span className="text-3xl font-bold text-white">$0</span>
            <span className="text-gray-400 ml-1">/month</span>
          </div>
          <p className="text-gray-400 text-sm mb-6">Perfect for trying out Rankly</p>
          
          <div className="space-y-2 mb-6 text-left">
            <div className="flex items-start space-x-3">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300 text-sm">1 website</span>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300 text-sm">Basic AEO analysis</span>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300 text-sm">Manual scans only</span>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300 text-sm">2 analyses per day</span>
            </div>
          </div>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full py-3 px-4 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            Continue with Free
          </button>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>All plans include a 30-day money-back guarantee. Cancel anytime.</p>
      </div>
    </div>
  );
}