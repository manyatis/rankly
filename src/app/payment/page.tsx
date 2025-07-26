'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';

// Square Web SDK types
interface SquarePayments {
  card(): Promise<SquareCard>;
}

interface SquareCard {
  attach(selector: string): Promise<void>;
  tokenize(): Promise<{ status: string; token?: string; errors?: Array<{ message: string }> }>;
}

declare global {
  interface Window {
    Square: {
      payments(applicationId: string, locationId: string): SquarePayments;
    };
  }
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  description: string;
}

const pricingPlans: Record<string, PricingPlan> = {
  indie: {
    id: 'indie',
    name: 'Indie',
    price: 2000, // $20.00 in cents (on sale from $45)
    features: [
      'Access to all models',
      '5 usage per day',
      'Weekly/daily automatic email reports'
    ],
    description: 'Perfect for individual developers and small projects'
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 7500, // $75.00 in cents (pre-release from $150)
    features: [
      'Complete coverage of all AI models',
      'Unlimited AEO analysis',
      'Advanced analytics dashboard',
      'Competitor tracking',
      'Weekly/daily automatic email reports'
    ],
    description: 'Ideal for growing businesses and agencies'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 25000, // $250.00 in cents (pre-release from $500)
    features: [
      'Everything in Professional',
      'Expert consultation',
      'AI-insights & recommendations',
      'Custom action plans',
      'Development support'
    ],
    description: 'For large organizations with specific needs'
  }
};

function PaymentPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cardForm, setCardForm] = useState<SquareCard | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    if (!loading && !user) {
      router.push('/');
      return;
    }

    // Get plan from URL params
    const planId = searchParams.get('plan');
    if (planId && pricingPlans[planId]) {
      setSelectedPlan(pricingPlans[planId]);
    } else {
      router.push('/');
    }

    // Load Square Web SDK
    const script = document.createElement('script');
    script.src = 'https://web.squarecdn.com/v1/square.js';
    script.async = true;
    document.head.appendChild(script);
  }, [user, loading, router, searchParams]);

  const handlePaymentSuccess = (result: string) => {
    console.debug('Payment successful:', result);
    router.push(`/payment/success?plan=${selectedPlan?.id}`);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setError('Payment failed. Please try again.');
    setPaymentProcessing(false);
  };

  if (loading || !selectedPlan) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Purchase</h1>
          <p className="text-gray-600">You&apos;re subscribing to the {selectedPlan.name} plan</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Billing</span>
                <span className="font-medium">Monthly</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${(selectedPlan.price / 100).toFixed(2)}/month
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">What&apos;s included:</h3>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div id="card-container" className="mb-6"></div>
            
            <button
              onClick={async () => {
                if (!cardForm) {
                  // Initialize Square payment form
                  if (window.Square) {
                    const payments = window.Square.payments(
                      process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
                      process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
                    );
                    
                    const card = await payments.card();
                    await card.attach('#card-container');
                    setCardForm(card);
                    return;
                  }
                }
                
                // Process payment
                setPaymentProcessing(true);
                setError(null);
                
                try {
                  if (!cardForm) {
                    handlePaymentError('Payment form not initialized');
                    return;
                  }
                  
                  const tokenResult = await cardForm.tokenize();
                  
                  if (tokenResult.status === 'OK') {
                    const response = await fetch('/api/payments/square', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        sourceId: tokenResult.token,
                        amount: selectedPlan.price,
                        planId: selectedPlan.id,
                        planName: selectedPlan.name,
                        userEmail: user?.email
                      }),
                    });

                    const result = await response.json();
                    
                    if (response.ok) {
                      handlePaymentSuccess(result);
                    } else {
                      handlePaymentError(result.error || 'Payment failed');
                    }
                  } else {
                    handlePaymentError('Card validation failed');
                  }
                } catch (err: unknown) {
                  console.error('Payment error:', err);
                  handlePaymentError('Payment processing error. Please try again.');
                }
              }}
              disabled={paymentProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {paymentProcessing ? 'Processing...' : `Pay $${(selectedPlan.price / 100).toFixed(2)}`}
            </button>

            {paymentProcessing && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-gray-600">Processing payment...</span>
                </div>
              </div>
            )}

            <div className="mt-6 text-xs text-gray-500">
              <p>Your payment is secured by Square. We don&apos;t store your card information.</p>
              <p className="mt-1">By completing this purchase, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            ← Back to pricing
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}