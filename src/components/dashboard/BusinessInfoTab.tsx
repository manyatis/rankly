import { useEffect, useState, useCallback } from 'react';

interface Business {
  id: number;
  websiteName: string;
  websiteUrl?: string;
  industry?: string;
  location?: string;
  description?: string;
  recurringScans?: boolean;
  scanFrequency?: string;
  lastScanDate?: string;
  nextScanDate?: string;
  useLocationInAnalysis?: boolean;
  createdAt: string;
  updatedAt: string;
  organizationId: number;
  userId: number;
}


interface BusinessInfoTabProps {
  businessId: number;
  onBusinessUnlinked?: () => void;
}

export default function BusinessInfoTab({ businessId, onBusinessUnlinked }: BusinessInfoTabProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [updatingLocationSetting, setUpdatingLocationSetting] = useState(false);

  const fetchBusinessInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const businessResponse = await fetch(`/api/dashboard/business/${businessId}`);
      
      if (!businessResponse.ok) {
        throw new Error('Failed to fetch business information');
      }

      const businessData = await businessResponse.json();
      setBusiness(businessData.business);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch business information');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchBusinessInfo();
    }
  }, [businessId, fetchBusinessInfo]);

  const handleUnlink = async () => {
    setUnlinking(true);
    try {
      const response = await fetch(`/api/dashboard/business/${businessId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unlink website');
      }

      onBusinessUnlinked?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink website');
    } finally {
      setUnlinking(false);
      setShowUnlinkConfirm(false);
    }
  };

  const handleLocationToggle = async () => {
    if (!business) return;

    setUpdatingLocationSetting(true);
    try {
      const response = await fetch(`/api/dashboard/business/${businessId}/location-setting`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          useLocationInAnalysis: !business.useLocationInAnalysis
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update location setting');
      }

      const data = await response.json();
      setBusiness(prev => prev ? { ...prev, useLocationInAnalysis: data.useLocationInAnalysis } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location setting');
    } finally {
      setUpdatingLocationSetting(false);
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-600 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-600 rounded w-16 animate-pulse"></div>
        </div>

        {/* Business Information Skeleton */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-600 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
            <div className="md:col-span-2">
              <div className="h-4 bg-gray-600 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-24 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Metadata Skeleton */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="h-6 bg-gray-600 rounded w-20 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 bg-gray-600 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isSuccessMessage = error.startsWith('Success:');
    return (
      <div className={`${isSuccessMessage ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'} border rounded-lg p-6`}>
        <h3 className={`text-lg font-medium ${isSuccessMessage ? 'text-green-300' : 'text-red-300'} mb-2`}>
          {isSuccessMessage ? 'Success' : 'Error Loading Business Information'}
        </h3>
        <p className={`${isSuccessMessage ? 'text-green-400' : 'text-red-400'}`}>{error}</p>
        {!isSuccessMessage && (
          <button
            onClick={fetchBusinessInfo}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Business not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Website Information</h2>
          <p className="text-gray-400 mt-1">View website details and settings (read-only)</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUnlinkConfirm(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            Unlink Website
          </button>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website URL
            </label>
            <div className="text-gray-100 bg-gray-700 px-3 py-2 rounded-md">
              {business.websiteUrl ? (
                <a 
                  href={business.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-lg font-medium"
                >
                  {business.websiteUrl}
                </a>
              ) : (
                'Not specified'
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Business Name
            </label>
            <p className="text-gray-100 bg-gray-700 px-3 py-2 rounded-md">
              {business.websiteName || 'Not specified'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Industry
            </label>
            <p className="text-gray-100 bg-gray-700 px-3 py-2 rounded-md">
              {business.industry || 'Not specified'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Location
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Use in analysis:</span>
                <button
                  onClick={handleLocationToggle}
                  disabled={updatingLocationSetting}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    business.useLocationInAnalysis ? 'bg-blue-600' : 'bg-gray-600'
                  } ${updatingLocationSetting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      business.useLocationInAnalysis ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <p className="text-gray-100 bg-gray-700 px-3 py-2 rounded-md">
              {business.location || 'Not specified'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {business.useLocationInAnalysis 
                ? 'Location will be included in analysis queries' 
                : 'Location will be ignored for generic online business analysis'}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <p className="text-gray-100 bg-gray-700 px-3 py-2 rounded-md min-h-[100px]">
              {business.description || 'No description available'}
            </p>
          </div>
        </div>

        <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-300 font-medium text-sm">Website Information is Read-Only</p>
              <p className="text-blue-200 text-sm mt-1">
                Website details are automatically extracted and cannot be edited to ensure consistency across all organizations tracking this website.
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Metadata */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Metadata</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-400">Created:</span>
            <span className="ml-2 text-gray-100">
              {new Date(business.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-400">Last Updated:</span>
            <span className="ml-2 text-gray-100">
              {new Date(business.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-400">Business ID:</span>
            <span className="ml-2 text-gray-100 font-mono">{business.id}</span>
          </div>
        </div>
      </div>

      {/* Unlink Confirmation Modal */}
      {showUnlinkConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-orange-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />

              </svg>
              <h3 className="text-lg font-medium text-white">Unlink Website</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to unlink &quot;{business.websiteName}&quot; from your organization?
            </p>
            
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-green-300 font-medium text-sm">Website Data Preserved</p>
                  <p className="text-green-200 text-sm mt-1">
                    The website and all its ranking history will remain in the system. Other organizations can still track this website and you can re-link it later.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUnlinkConfirm(false)}
                disabled={unlinking}
                className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlink}
                disabled={unlinking}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {unlinking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Unlinking...
                  </>
                ) : (
                  'Unlink Website'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}