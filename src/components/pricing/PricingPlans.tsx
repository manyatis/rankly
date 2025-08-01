'use client';

import { useState, useEffect } from 'react';
import { Check, Star, Zap, Crown, Users } from 'lucide-react';

interface SubscriptionPlan {
  id: number;
  planId: string;
  name: string;
  priceCents: number;
  billingPeriod: string;
  features: string[];
  description: string;
}

interface FreePlan {
  id: 'free';
  planId: 'free';
  name: 'Free';
  priceCents: 0;
  billingPeriod: 'forever';
  features: string[];
  description: string;
}

interface PricingPlansProps {
  onPlanSelect?: (plan: SubscriptionPlan | FreePlan) => void;
  onCreateAccount?: () => void;
  showFree?: boolean;
  title?: string;
  subtitle?: string;
  isSubscriptionFlow?: boolean;
}

export default function PricingPlans({ 
  onPlanSelect, 
  onCreateAccount,
  showFree = false,
  title = "Choose Your Plan",
  subtitle = "Unlock the full potential of AI Engine Optimization with our subscription plans. Get deeper insights, automated scanning, and priority support.",
  isSubscriptionFlow = false
}: PricingPlansProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const freePlan: FreePlan = {
    id: 'free',
    planId: 'free',
    name: 'Free',
    priceCents: 0,
    billingPeriod: 'forever',
    description: '1 site analysis included',
    features: [
      '1 free site analysis',
      'Manual analysis execution',
      'All AI engines coverage',
      'Basic visibility analysis'
    ]
  };

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

  const handlePlanSelect = (plan: SubscriptionPlan | FreePlan) => {
    if (plan.planId === 'free' && onCreateAccount) {
      onCreateAccount();
      return;
    }

    // For subscription flow, only allow free and indie plans
    if (isSubscriptionFlow && plan.planId !== 'indie' && plan.planId !== 'free') {
      return;
    }

    // If we're on the homepage pricing section (not subscription flow), route paid plans to /subscribe
    if (!isSubscriptionFlow && plan.planId !== 'free') {
      window.location.href = '/subscribe';
      return;
    }
    
    if (onPlanSelect) {
      onPlanSelect(plan);
    }
  };

  const formatPrice = (priceCents: number): string => {
    return `$${(priceCents / 100).toFixed(0)}`;
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Users className="w-6 h-6 text-gray-400" />;
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
    return planId === 'indie';
  };

  const isPlanDisabled = (planId: string): boolean => {
    // Free plan is never disabled
    if (planId === 'free') return false;
    // In subscription flow, only indie is enabled
    return isSubscriptionFlow ? planId !== 'indie' : false;
  };

  const getPlanButtonText = (plan: SubscriptionPlan | FreePlan): string => {
    if (plan.planId === 'free') return 'Create Account';
    if (isPlanDisabled(plan.planId)) return 'Coming Soon';
    if (isSubscriptionFlow) return `Choose ${plan.name}`;
    return 'Get Started';
  };

  const getPlanButtonClass = (plan: SubscriptionPlan | FreePlan): string => {
    if (plan.planId === 'free') {
      return 'w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium cursor-pointer';
    }
    
    if (isPlanDisabled(plan.planId)) {
      return 'w-full bg-gray-800 text-gray-500 cursor-not-allowed py-3 px-4 rounded-lg font-medium transition-colors';
    }

    if (isPlanPopular(plan.planId)) {
      return 'w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer';
    }

    return 'w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer';
  };

  const getPlanCardClass = (plan: SubscriptionPlan | FreePlan): string => {
    const baseClass = 'relative bg-gray-900 border rounded-xl p-6 transition-all duration-200 flex flex-col h-full';
    
    if (isPlanDisabled(plan.planId)) {
      return `${baseClass} border-gray-800 opacity-60 cursor-not-allowed`;
    }
    
    if (isPlanPopular(plan.planId)) {
      return `${baseClass} border-blue-500 ring-2 ring-blue-500/20 transform scale-105 cursor-pointer`;
    }
    
    if (plan.planId === 'free') {
      return `${baseClass} border-gray-600 cursor-pointer`;
    }
    
    return `${baseClass} border-gray-700 hover:border-gray-600 cursor-pointer`;
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

  const allPlans = showFree ? [freePlan, ...plans] : plans;
  const gridCols = showFree ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      {/* Plans Grid */}
      <div className={`grid ${gridCols} gap-8 max-w-6xl mx-auto`}>
        {allPlans.map((plan) => (
          <div
            key={plan.id}
            className={getPlanCardClass(plan)}
            onClick={() => handlePlanSelect(plan)}
          >
            {/* Popular Badge */}
            {isPlanPopular(plan.planId) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                  Most Popular
                </span>
              </div>
            )}
            
            {/* Coming Soon Badge */}
            {isPlanDisabled(plan.planId) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gray-600 text-gray-300 px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                  Coming Soon
                </span>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                {getPlanIcon(plan.planId)}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-bold text-white">
                  {formatPrice(plan.priceCents)}
                </span>
                {plan.priceCents > 0 && (
                  <span className="text-gray-400 ml-1">/{plan.billingPeriod}</span>
                )}
              </div>
              <p className="text-gray-400 text-sm">{plan.description}</p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8 flex-grow">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <button
              className={getPlanButtonClass(plan)}
              disabled={isPlanDisabled(plan.planId)}
            >
              {getPlanButtonText(plan)}
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      {isSubscriptionFlow && (
        <div className="text-center text-sm text-gray-500">
          <p>All plans include a 30-day money-back guarantee. Cancel anytime.</p>
        </div>
      )}
    </div>
  );
}