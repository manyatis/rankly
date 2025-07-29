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
  createdAt: string;
  updatedAt: string;
  organizationId: number;
  userId: number;
}

interface BusinessInfoTabProps {
  businessId: number;
  onBusinessDeleted?: () => void;
}

export default function BusinessInfoTab({ businessId, onBusinessDeleted }: BusinessInfoTabProps) {
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
    recurringScans: false,
    scanFrequency: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchBusinessInfo = useCallback(async () => {
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
        recurringScans: data.business.recurringScans || false,
        scanFrequency: data.business.scanFrequency || '',
      });
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
        recurringScans: business.recurringScans || false,
        scanFrequency: business.scanFrequency || '',
      });
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/dashboard/business/${businessId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete business');
      }

      onBusinessDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete business');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
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
        
        <div className="flex items-center space-x-3">
          {!editing ? (
            <>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            </>
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

      {/* Recurring Scans */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Recurring Scans</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Enable Recurring Scans</p>
              <p className="text-sm text-gray-400">Automatically run AEO analysis on a schedule</p>
            </div>
            {editing ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.recurringScans}
                  onChange={(e) => setFormData({ ...formData, recurringScans: e.target.checked, scanFrequency: e.target.checked ? formData.scanFrequency : '' })}
                  className="sr-only peer"
                  disabled={true} // Disabled for tiered users
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 opacity-50 cursor-not-allowed"></div>
              </label>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm ${business.recurringScans ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                {business.recurringScans ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>

          {(editing && formData.recurringScans) || (!editing && business.recurringScans) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Scan Frequency
                </label>
                {editing ? (
                  <select
                    value={formData.scanFrequency}
                    onChange={(e) => setFormData({ ...formData, scanFrequency: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-600 text-gray-300 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-not-allowed opacity-50"
                    disabled={true} // Disabled for tiered users
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                ) : (
                  <p className="text-gray-100 bg-gray-700 px-3 py-2 rounded-md capitalize">
                    {business.scanFrequency || 'Not set'}
                  </p>
                )}
              </div>

              {!editing && business.nextScanDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Next Scan
                  </label>
                  <p className="text-gray-100 bg-gray-700 px-3 py-2 rounded-md">
                    {new Date(business.nextScanDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          ) : null}

          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-300 font-medium text-sm">Premium Feature</p>
                <p className="text-blue-200 text-sm mt-1">
                  Recurring scans are available for Professional and Enterprise subscribers. 
                  <a href="#" className="underline hover:text-blue-100">Upgrade your plan</a> to enable automated AEO monitoring.
                </p>
              </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-medium text-white">Delete Business</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete &quot;{business.websiteName}&quot;? This action cannot be undone and will permanently remove all associated data including:
            </p>
            
            <ul className="list-disc list-inside text-gray-400 text-sm mb-6 space-y-1">
              <li>All ranking history and trends</li>
              <li>Prompt history and analysis results</li>
              <li>AEO scores and insights</li>
              <li>Recurring scan settings</li>
            </ul>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Business'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}