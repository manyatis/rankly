'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripeConfig } from '@/lib/stripe';

// Initialize Stripe
const stripePromise = loadStripe(stripeConfig.publishableKey);

interface CardFormProps {
  onSuccess: (subscriptionId: string) => void;
  onError: (error: string) => void;
  planName: string;
  planPrice: string;
  planId: string;
}

function CardForm({ onSuccess, onError, planName, planPrice, planId }: CardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Create subscription on component mount
  useEffect(() => {
    createSubscription();
  }, []);

  const createSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/create-stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        // Subscription created successfully without payment needed
        onSuccess(data.subscriptionId);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      onError(error instanceof Error ? error.message : 'Failed to create subscription');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found');
      setIsLoading(false);
      return;
    }

    // Confirm the payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      }
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setIsLoading(false);
    } else if (paymentIntent.status === 'succeeded') {
      // Confirm payment and update subscription status
      try {
        const confirmResponse = await fetch('/api/subscriptions/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id })
        });

        const confirmResult = await confirmResponse.json();
        
        if (confirmResult.success) {
          onSuccess(confirmResult.subscriptionId || paymentIntent.id);
        } else {
          onError(confirmResult.error || 'Failed to confirm payment');
        }
      } catch (err) {
        console.error('Error confirming payment:', err);
        onError('Payment succeeded but failed to update subscription');
      }
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#9ca3af',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Payment Details</h3>
        <p className="text-gray-400 text-sm">
          Subscribe to {planName} for {planPrice}/month
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Information
          </label>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || !clientSecret || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            !stripe || !clientSecret || isLoading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading 
            ? 'Processing...' 
            : !clientSecret 
            ? 'Setting up...'
            : `Subscribe to ${planName}`
          }
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Secure payment powered by Stripe</p>
        <p>Your card information is encrypted and secure</p>
      </div>
    </div>
  );
}

export default function StripeCardForm(props: CardFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CardForm {...props} />
    </Elements>
  );
}