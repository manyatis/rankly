'use client';

import { useState, useEffect, useRef } from 'react';

// Generate unique ID for each card form instance
let cardFormIdCounter = 0;

interface SquareCard {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<{ token?: string; errors?: Array<{ message: string }> }>;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Square?: any;
  }
}

interface SimpleCardFormProps {
  onSuccess: (token: string) => void;
  onError: (error: string) => void;
  planName?: string;
  planPrice?: string;
}

export default function SimpleCardForm({ onSuccess, onError, planName, planPrice }: SimpleCardFormProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [card, setCard] = useState<SquareCard | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [cardContainerId] = useState(() => `card-container-${++cardFormIdCounter}`);

  useEffect(() => {
    let isMounted = true;
    
    const initializeSquare = async () => {
      try {
        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return; // Component unmounted
        
        if (!window.Square) {
          console.error('Square not loaded');
          return;
        }

        const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
        const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

        if (!appId || !locationId) {
          console.error('Square configuration missing');
          return;
        }

        const payments = window.Square.payments(appId, locationId);
        const cardInstance = await payments.card();
        
        if (!isMounted) return; // Component unmounted
        
        await cardInstance.attach(`#${cardContainerId}`);
        
        if (isMounted) {
          setCard(cardInstance);
          setIsLoaded(true);
          setMessage('Card form loaded successfully!');
        }
        
      } catch (error) {
        if (isMounted) {
          console.error('Square initialization error:', error);
          setMessage(`Error: ${error}`);
        }
      }
    };

    const loadScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="square.js"]');
      if (existingScript || window.Square) {
        initializeSquare();
        return;
      }

      const script = document.createElement('script');
      // Determine environment from app ID (sandbox app IDs start with 'sandbox-')
      const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID || '';
      const isSandbox = appId.startsWith('sandbox-');
      script.src = isSandbox 
        ? 'https://sandbox.web.squarecdn.com/v1/square.js'
        : 'https://web.squarecdn.com/v1/square.js';
      script.async = true;
      script.onload = () => {
        if (isMounted) initializeSquare();
      };
      script.onerror = () => {
        if (isMounted) setMessage('Failed to load Square script');
      };
      document.head.appendChild(script);
    };

    loadScript();
    
    return () => {
      isMounted = false;
      // Cleanup card instance
      if (card) {
        try {
          // Square cards don't have explicit cleanup, but clear container
          const container = document.getElementById(cardContainerId);
          if (container) {
            container.innerHTML = '';
          }
        } catch (error) {
          console.log('Cleanup error:', error);
        }
      }
    };
  }, [cardContainerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!card) {
      setMessage('Card form not ready');
      return;
    }

    setIsProcessing(true);
    setMessage('Processing...');

    try {
      const result = await card.tokenize();
      
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      if (result.token) {
        setMessage('Payment successful! Processing...');
        onSuccess(result.token);
      } else {
        throw new Error('No token received');
      }
      
    } catch (error) {
      console.error('Tokenization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setMessage(`Error: ${errorMessage}`);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 border border-gray-700 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        {planName ? `Payment for ${planName}` : 'Payment Information'}
      </h2>
      {planPrice && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Total Amount</span>
            <span className="text-2xl font-bold text-blue-400">{planPrice}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Payment Information
          </label>
          <div 
            id={cardContainerId}
            ref={cardContainerRef}
            className="min-h-[60px] p-3 bg-gray-800 border border-gray-600 rounded-md"
          >
            {!isLoaded && (
              <div className="text-gray-400 text-center">Loading...</div>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!isLoaded || isProcessing}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
        >
          {isProcessing ? 'Processing...' : (planName ? `Subscribe to ${planName}` : 'Process Payment')}
        </button>
      </form>
      
      {message && (
        <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded-md">
          <p className="text-sm text-gray-300">{message}</p>
        </div>
      )}
    </div>
  );
}