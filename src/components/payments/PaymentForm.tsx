'use client';

import { useState, useEffect, useRef } from 'react';
import { CreditCard, Shield, Check } from 'lucide-react';

interface SubscriptionResult {
  success: boolean;
  subscriptionId: string;
  status: string;
  planId: string;
  planName: string;
  message: string;
}

interface SquareError {
  message?: string;
}

interface PaymentFormProps {
  planId: string;
  planName: string;
  price: string;
  onSuccess: (result: SubscriptionResult) => void;
  onError: (error: string) => void;
}


interface SquareCard {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<{ token?: string; errors?: SquareError[] }>;
}

interface Square {
  payments: (appId: string, locationId: string) => {
    card: () => SquareCard;
  };
}

declare global {
  interface Window {
    Square?: Square;
  }
}

export default function PaymentForm({ 
  planId, 
  planName, 
  price, 
  onSuccess, 
  onError 
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSquareLoaded, setIsSquareLoaded] = useState(false);
  const [card, setCard] = useState<SquareCard | null>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSquare = async () => {
      if (window.Square) {
        initializeSquare();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sandbox.web.squarecdn.com/v1/square.js'; // Use production URL for production
      script.async = true;
      script.onload = () => {
        if (window.Square) {
          initializeSquare();
        }
      };
      script.onerror = () => {
        onError('Failed to load Square payment form');
      };
      document.head.appendChild(script);
    };

    const initializeSquare = async () => {
      try {
        if (!window.Square) {
          throw new Error('Square not loaded');
        }

        const payments = window.Square.payments(
          process.env.NEXT_PUBLIC_SQUARE_APP_ID!,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
        );

        const cardInstance = payments.card();
        await cardInstance.attach('#card-container');
        
        setCard(cardInstance);
        setIsSquareLoaded(true);
      } catch (error) {
        console.error('Error initializing Square:', error);
        onError('Failed to initialize payment form');
      }
    };

    loadSquare();

    return () => {
      // Cleanup Square resources if needed
      const cardContainer = cardContainerRef.current;
      if (card && cardContainer) {
        // Square cards don't have explicit cleanup, but we can clear the container
        cardContainer.innerHTML = '';
      }
    };
  }, [onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!card) {
      onError('Payment form not initialized');
      return;
    }

    setIsLoading(true);

    try {
      // Tokenize the card
      const result = await card.tokenize();
      
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message || 'Card tokenization failed');
      }

      if (!result.token) {
        throw new Error('Failed to tokenize card');
      }

      // Call our API to create the subscription
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardToken: result.token,
          planId: planId
        }),
      });

      const data = await response.json() as SubscriptionResult & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Subscription creation failed');
      }

      onSuccess(data);
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 border border-gray-700 rounded-lg p-6">
      {/* Plan Summary */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">{planName} Plan</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Monthly subscription</span>
          <span className="text-2xl font-bold text-blue-400">{price}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <CreditCard className="inline-block w-4 h-4 mr-2" />
            Payment Information
          </label>
          <div 
            id="card-container"
            ref={cardContainerRef}
            className="min-h-[60px] p-3 bg-gray-800 border border-gray-600 rounded-md"
            style={{
              '--sq-form-background-color': '#1f2937',
              '--sq-form-border-color': '#4b5563',
              '--sq-form-text-color': '#f9fafb',
              '--sq-form-placeholder-color': '#9ca3af',
              '--sq-form-focus-border-color': '#3b82f6'
            } as React.CSSProperties}
          >
            {!isSquareLoaded && (
              <div className="flex items-center justify-center h-[60px] text-gray-400">
                Loading payment form...
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start space-x-2 text-sm text-gray-400">
          <Shield className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
          <span>
            Your payment information is encrypted and secure. Powered by Square.
          </span>
        </div>

        {/* Features List */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-300">What&apos;s included:</p>
          <div className="space-y-1">
            {getFeaturesByPlan(planId).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-400">
                <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isSquareLoaded || isLoading}
          className={`
            w-full py-3 px-4 rounded-md font-medium transition-colors
            ${!isSquareLoaded || isLoading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {isLoading ? 'Processing...' : `Subscribe to ${planName} - ${price}`}
        </button>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          You can cancel anytime from your account settings.
        </p>
      </form>
    </div>
  );
}

function getFeaturesByPlan(planId: string): string[] {
  switch (planId) {
    case 'indie':
      return [
        '3 websites',
        'Advanced AEO analysis',
        'Recurring scans (daily/weekly/monthly)',
        'Detailed insights',
        'Query results visibility'
      ];
    case 'professional':
      return [
        '10 websites',
        'Premium AEO analysis',
        'Unlimited manual scans',
        'Daily recurring scans',
        'AI-powered insights',
        'Competitor tracking',
        'Priority support'
      ];
    case 'enterprise':
      return [
        'Unlimited websites',
        'Enterprise AEO analysis',
        'Custom scan frequency',
        'Advanced AI insights',
        'Expert consultation',
        'Dedicated support',
        'White-label reports',
        'API access'
      ];
    default:
      return ['Basic features'];
  }
}