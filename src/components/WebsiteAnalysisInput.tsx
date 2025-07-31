'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface WebsiteAnalysisInputProps {
  onLoginRequired?: () => void;
  placeholder?: string;
  buttonText?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function WebsiteAnalysisInput({ 
  onLoginRequired,
  placeholder = "Enter your website URL (e.g., example.com)",
  buttonText = "Analyze Your Site",
  size = 'medium',
  className = ""
}: WebsiteAnalysisInputProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const handleAnalyze = async () => {
    if (!websiteUrl.trim()) {
      return;
    }

    // Normalize URL
    let normalizedUrl = websiteUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Check if user is authenticated
    if (status === 'unauthenticated') {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    if (status === 'loading') {
      return;
    }

    setIsLoading(true);

    try {
      // Navigate to dashboard with URL parameter
      const params = new URLSearchParams({
        analyzeUrl: normalizedUrl,
        autoStart: 'true'
      });
      
      router.push(`/dashboard?${params.toString()}`);
    } catch (error) {
      console.error('Error starting analysis:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'flex-col sm:flex-row gap-2',
      input: 'px-3 py-2 text-sm',
      button: 'px-4 py-2 text-sm'
    },
    medium: {
      container: 'flex-col sm:flex-row gap-3',
      input: 'px-4 py-3 text-base',
      button: 'px-6 py-3 text-base'
    },
    large: {
      container: 'flex-col lg:flex-row gap-4',
      input: 'px-6 py-4 text-lg',
      button: 'px-8 py-4 text-lg'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex ${config.container} ${className}`}>
      <div className="flex-1">
        <input
          type="text"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          className={`w-full bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${config.input}`}
        />
      </div>
      
      <button
        onClick={handleAnalyze}
        disabled={!websiteUrl.trim() || isLoading}
        className={`bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center ${config.button}`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Starting...
          </>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
}