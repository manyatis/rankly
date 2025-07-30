'use client';

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

interface RecurringScanSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | null;
  lastScanDate: string | null;
  nextScanDate: string | null;
  hasAccess: boolean;
  userPlan: string;
}

interface AutomationSetupTabProps {
  businessId: number;
}

export default function AutomationSetupTab({ businessId }: AutomationSetupTabProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recurringScanSettings, setRecurringScanSettings] = useState<RecurringScanSettings | null>(null);
  const [updatingRecurringScans, setUpdatingRecurringScans] = useState(false);
  const [triggeringImmediate, setTriggeringImmediate] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [businessResponse, recurringScanResponse] = await Promise.all([
        fetch(`/api/dashboard/business/${businessId}`),
        fetch(`/api/dashboard/recurring-scans/${businessId}`)
      ]);
      
      if (!businessResponse.ok) {
        throw new Error('Failed to fetch business information');
      }

      const businessData = await businessResponse.json();
      setBusiness(businessData.business);

      if (recurringScanResponse.ok) {
        const scanData = await recurringScanResponse.json();
        setRecurringScanSettings(scanData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch automation settings');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchData();
    }
  }, [businessId, fetchData]);

  const handleRecurringScansToggle = async () => {
    if (!business || !recurringScanSettings) return;

    const newEnabled = !recurringScanSettings.enabled;
    setUpdatingRecurringScans(true);
    
    try {
      const response = await fetch('/api/dashboard/recurring-scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          enabled: newEnabled,
          frequency: newEnabled ? (recurringScanSettings.frequency || 'weekly') : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update recurring scans');
      }

      // Refresh the data
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recurring scans');
    } finally {
      setUpdatingRecurringScans(false);
    }
  };

  const handleFrequencyChange = async (frequency: 'daily' | 'weekly' | 'monthly') => {
    if (!business || !recurringScanSettings) return;

    setUpdatingRecurringScans(true);
    
    try {
      const response = await fetch('/api/dashboard/recurring-scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          enabled: true,
          frequency
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update scan frequency');
      }

      // Refresh the data
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update scan frequency');
    } finally {
      setUpdatingRecurringScans(false);
    }
  };

  const handleTriggerImmediateScan = async () => {
    if (!business) return;

    setTriggeringImmediate(true);
    
    try {
      const response = await fetch(`/api/dashboard/recurring-scans/${business.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'trigger'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to trigger scan');
      }

      const data = await response.json();
      
      // Show success message
      setError(`✅ ${data.message}`);
      setTimeout(() => setError(null), 5000);

      // Refresh the data
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger immediate scan');
    } finally {
      setTriggeringImmediate(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-600 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-96 animate-pulse"></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="space-y-6">
            <div className="h-6 bg-gray-600 rounded w-40 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-600 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-48 animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-gray-600 rounded w-20 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !error.startsWith('✅')) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-300 mb-2">Error Loading Automation Settings</h3>
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchData}
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
      <div>
        <h2 className="text-2xl font-bold text-white">Automation Setup</h2>
        <p className="text-gray-400 mt-1">Configure automated AEO analysis and monitoring for {business.websiteName}</p>
      </div>

      {/* Success Message */}
      {error && error.startsWith('✅') && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
          <p className="text-green-400">{error}</p>
        </div>
      )}

      {/* Recurring Scans Configuration */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Recurring Analysis</h3>
            <p className="text-gray-400 mt-1">Automatically run AEO analysis on a schedule</p>
          </div>
          <div className="flex items-center">
            <svg className="w-8 h-8 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {recurringScanSettings ? (
          <div className="space-y-6">
            {/* Main Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div>
                <h4 className="text-lg font-medium text-white">Enable Recurring Scans</h4>
                <p className="text-sm text-gray-400">Automatically analyze your website&apos;s AEO performance</p>
              </div>
              
              {recurringScanSettings.hasAccess ? (
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    recurringScanSettings.enabled 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {recurringScanSettings.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={handleRecurringScansToggle}
                    disabled={updatingRecurringScans}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                      recurringScanSettings.enabled ? 'bg-blue-600' : 'bg-gray-600'
                    } ${updatingRecurringScans ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        recurringScanSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ) : (
                <span className="px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-400">
                  Upgrade Required
                </span>
              )}
            </div>

            {/* Configuration Options - Only show if enabled and has access */}
            {recurringScanSettings.enabled && recurringScanSettings.hasAccess && (
              <div className="space-y-6">
                {/* Frequency Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Scan Frequency
                    </label>
                    <div className="space-y-2">
                      {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                        <label key={freq} className="flex items-center">
                          <input
                            type="radio"
                            name="frequency"
                            value={freq}
                            checked={recurringScanSettings.frequency === freq}
                            onChange={() => handleFrequencyChange(freq)}
                            disabled={updatingRecurringScans}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700 disabled:opacity-50"
                          />
                          <span className="ml-3 text-white capitalize">{freq}</span>
                          <span className="ml-2 text-xs text-gray-400">
                            {freq === 'daily' && '(Every day at 8 AM)'}
                            {freq === 'weekly' && '(Every week at 8 AM)'}
                            {freq === 'monthly' && '(Monthly at 8 AM)'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Next Scan Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Next Scheduled Scan
                    </label>
                    {recurringScanSettings.nextScanDate ? (
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="text-white font-medium">
                              {new Date(recurringScanSettings.nextScanDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-gray-400">
                              at {new Date(recurringScanSettings.nextScanDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">No scan scheduled</p>
                    )}
                  </div>
                </div>

                {/* Last Scan Info */}
                {recurringScanSettings.lastScanDate && (
                  <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-white font-medium">Last Automatic Scan</h4>
                        <p className="text-gray-400">
                          {new Date(recurringScanSettings.lastScanDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Trigger */}
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium mb-2">Manual Override</h4>
                      <p className="text-blue-200 text-sm">
                        Need results sooner? Trigger an immediate scan that will run within the next hour.
                      </p>
                    </div>
                    <button
                      onClick={handleTriggerImmediateScan}
                      disabled={triggeringImmediate}
                      className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
                    >
                      {triggeringImmediate ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Triggering...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Trigger Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Access Information */}
            {!recurringScanSettings.hasAccess ? (
              <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-orange-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-orange-300 font-medium text-lg mb-2">Upgrade Required</h4>
                    <p className="text-orange-200 mb-4">
                      Recurring scans are available for <strong>Indie+ subscribers</strong> (current plan: <strong>{recurringScanSettings.userPlan}</strong>). 
                      Upgrade to enable automated AEO monitoring and never miss important ranking changes.
                    </p>
                    <div className="flex space-x-4">
                      <a
                        href="/payment"
                        className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors font-medium"
                      >
                        Upgrade Plan
                      </a>
                      <a
                        href="/learn"
                        className="text-orange-300 hover:text-orange-200 underline font-medium px-4 py-2"
                      >
                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-green-300 font-medium">Automation Available</h4>
                    <p className="text-green-200 text-sm mt-1">
                      Your <strong>{recurringScanSettings.userPlan}</strong> plan includes automated AEO monitoring. 
                      Configure your preferred schedule above to start tracking changes automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-600 rounded w-48"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-700 rounded"></div>
          </div>
        )}
      </div>

      {/* Future Automation Features */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Coming Soon</h3>
            <p className="text-gray-400 mt-1">Additional automation features in development</p>
          </div>
          <div className="flex items-center">
            <svg className="w-8 h-8 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 opacity-60">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <h4 className="text-white font-medium">Alert Notifications</h4>
            </div>
            <p className="text-gray-400 text-sm">Get email/Slack alerts when your AEO scores change significantly</p>
          </div>

          <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 opacity-60">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h4 className="text-white font-medium">Automated Reports</h4>
            </div>
            <p className="text-gray-400 text-sm">Weekly/monthly PDF reports delivered to your inbox</p>
          </div>

          {/* <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 opacity-60">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h4 className="text-white font-medium">Competitor Monitoring</h4>
            </div>
            <p className="text-gray-400 text-sm">Automatically track competitor AEO performance changes</p>
          </div> */}

          <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 opacity-60">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h4 className="text-white font-medium">Smart Optimization</h4>
            </div>
            <p className="text-gray-400 text-sm">Auto Generated AI-powered code changes</p>
          </div>
        </div>
      </div>
    </div>
  );
}