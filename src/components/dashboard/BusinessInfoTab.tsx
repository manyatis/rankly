import { useEffect, useState } from 'react';

interface Business {
  id: number;
  websiteName: string;
  websiteUrl?: string;
  industry?: string;
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  organizationId: number;
  userId: number;
}

interface BusinessInfoTabProps {
  businessId: number;
}

export default function BusinessInfoTab({ businessId }: BusinessInfoTabProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    websiteName: '',
    websiteUrl: '',
    industry: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    if (businessId) {
      fetchBusinessInfo();
    }
  }, [businessId]);

  const fetchBusinessInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dashboard/business/${businessId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch business information');
      }

      const data = await response.json();
      setBusiness(data.business);
      setFormData({
        websiteName: data.business.websiteName || '',
        websiteUrl: data.business.websiteUrl || '',
        industry: data.business.industry || '',
        location: data.business.location || '',
        description: data.business.description || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch business information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/dashboard/business/${businessId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update business information');
      }

      const data = await response.json();
      setBusiness(data.business);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business information');
    }
  };

  const handleCancel = () => {
    if (business) {
      setFormData({
        websiteName: business.websiteName || '',
        websiteUrl: business.websiteUrl || '',
        industry: business.industry || '',
        location: business.location || '',
        description: business.description || '',
      });
    }
    setEditing(false);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-300 mb-2">Error Loading Business Information</h3>
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchBusinessInfo}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
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
          <h2 className="text-2xl font-bold text-white">Business Information</h2>
          <p className="text-gray-400 mt-1">Manage your business details and settings</p>
        </div>
        
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={handleCancel}
              className="bg-gray-600 text-gray-200 px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Business Information */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website Name
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.websiteName}
                onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., example.com"
              />
            ) : (
              <p className="text-gray-100 bg-gray-700 px-3 py-2 rounded-md">
                {business.websiteName || 'Not specified'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website URL
            </label>
            {editing ? (
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            ) : (
              <p className="text-gray-100 bg-gray-700 px-3 py-2 rounded-md">
                {business.websiteUrl ? (
                  <a 
                    href={business.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {business.websiteUrl}
                  </a>
                ) : (
                  'Not specified'
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Industry
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Technology, Healthcare, etc."
              />
            ) : (
              <p className="text-gray-100 bg-gray-700 px-3 py-2 rounded-md">
                {business.industry || 'Not specified'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., San Francisco, CA"
              />
            ) : (
              <p className="text-gray-100 bg-gray-700 px-3 py-2 rounded-md">
                {business.location || 'Not specified'}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            {editing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your business, products, or services..."
              />
            ) : (
              <p className="text-gray-100 bg-gray-700 px-3 py-2 rounded-md min-h-[100px]">
                {business.description || 'No description provided'}
              </p>
            )}
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
    </div>
  );
}