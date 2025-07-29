'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import TrendsTab from '@/components/dashboard/TrendsTab';
import AIInsightsTab from '@/components/dashboard/AIInsightsTab';
import BusinessInfoTab from '@/components/dashboard/BusinessInfoTab';
import PromptsTab from '@/components/dashboard/PromptsTab';
import ExecuteTab from '@/components/dashboard/ExecuteTabNew';

interface Organization {
  id: number;
  name: string;
  domain?: string;
}

interface Business {
  id: number;
  websiteName: string;
  websiteUrl?: string;
  industry?: string;
  location?: string;
  description?: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<number | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'trends' | 'insights' | 'business' | 'prompts' | 'execute'>('trends');
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [websiteLimitInfo, setWebsiteLimitInfo] = useState<{
    canAddWebsite: boolean;
    currentCount: number;
    limit: number;
    remainingSlots: number | null;
    tier: string;
    isUnlimited: boolean;
  } | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchOrganizations();
      fetchWebsiteLimitInfo();
    }
  }, [session]);

  useEffect(() => {
    if (selectedOrganization) {
      fetchBusinesses(selectedOrganization);
    }
  }, [selectedOrganization]);

  // Automatically switch to appropriate tab based on business availability
  useEffect(() => {
    if (businesses.length === 0 && activeTab !== 'execute') {
      setActiveTab('execute');
    } else if (businesses.length > 0 && activeTab === 'execute') {
      setActiveTab('trends'); // Default to trends when businesses exist
    }
  }, [businesses.length, activeTab]);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/dashboard/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
        if (data.organizations.length > 0) {
          setSelectedOrganization(data.organizations[0].id);
        } else {
          setInitialLoadComplete(true);
        }
      } else {
        console.error('Failed to fetch organizations:', response.status);
        setInitialLoadComplete(true);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setInitialLoadComplete(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async (orgId: number) => {
    try {
      const response = await fetch(`/api/dashboard/businesses?organizationId=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses);
        if (data.businesses.length > 0) {
          setSelectedBusiness(data.businesses[0].id);
          // Give a brief moment for the business selection to settle before showing content
          setTimeout(() => setInitialLoadComplete(true), 300);
        } else {
          setSelectedBusiness(null);
          setInitialLoadComplete(true);
        }
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setInitialLoadComplete(true);
    }
  };

  const fetchWebsiteLimitInfo = async () => {
    try {
      const response = await fetch('/api/dashboard/website-limit-check');
      if (response.ok) {
        const data = await response.json();
        setWebsiteLimitInfo(data);
      }
    } catch (error) {
      console.error('Error fetching website limit info:', error);
    }
  };

  const handleOrganizationChange = (orgId: number) => {
    setSelectedOrganization(orgId);
    setSelectedBusiness(null);
    setInitialLoadComplete(false);
  };

  const handleBusinessChange = (businessId: number) => {
    setSelectedBusiness(businessId);
    setInitialLoadComplete(false);
    // Brief delay to allow tab component to start loading
    setTimeout(() => setInitialLoadComplete(true), 200);
  };

  const selectedOrgName = organizations.find(org => org.id === selectedOrganization)?.name || 'Select Organization';
  const selectedBusinessName = businesses.find(biz => biz.id === selectedBusiness)?.websiteName || 'Select Business';

  const tabs = [
    { id: 'trends', name: 'Trends', icon: '📈', description: 'View ranking trends over time' },
    { id: 'insights', name: 'AI Insights', icon: '🧠', description: 'AI-generated recommendations' },
    { id: 'business', name: 'Business Info', icon: '🏢', description: 'Manage business details' },
    { id: 'prompts', name: 'Prompts', icon: '💬', description: 'Review prompt history' },
    { id: 'execute', name: 'Execute Analysis', icon: '🔍', description: 'Run new AEO analysis' },
  ] as const;

  if (status === 'loading' || (session?.user && (loading || !initialLoadComplete))) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Navbar />
        
        <div className="flex-1 flex">
          {/* Sidebar Skeleton */}
          <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
            {/* Header with Dropdowns Skeleton */}
            <div className="p-6 border-b border-gray-700">
              <div className="mb-4">
                <div className="h-4 bg-gray-600 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-600 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Navigation Tabs Skeleton */}
            <div className="flex-1 p-6">
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gray-600 rounded mr-3 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded w-20 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-700 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Selection Info Skeleton */}
            <div className="p-6 border-t border-gray-700 bg-gray-800/50">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-600 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-gray-700 rounded w-20 animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-600 rounded w-12 animate-pulse"></div>
                  <div className="h-3 bg-gray-700 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-8">
              <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="h-8 bg-gray-600 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-64 animate-pulse"></div>
                  </div>
                  <div className="h-10 bg-gray-600 rounded w-32 animate-pulse"></div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="h-4 bg-gray-600 rounded w-20 mb-2 animate-pulse"></div>
                      <div className="flex items-center">
                        <div className="h-8 bg-gray-700 rounded w-12 animate-pulse"></div>
                        <div className="h-4 bg-gray-600 rounded w-8 ml-2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart/Content Skeleton */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="h-6 bg-gray-600 rounded w-48 mb-6 animate-pulse"></div>
                  <div className="h-80 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center border border-gray-700">
            <div className="text-6xl mb-6">🔐</div>
            <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
            <p className="text-gray-300 mb-6">
              You need to be logged in to access the dashboard. Please sign in to continue.
            </p>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign in with Google
            </button>
            <p className="text-sm text-gray-400 mt-4">
              New users will be automatically registered upon first login.
            </p>
          </div>
        </div>
        <Footer />
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onSuccess={() => setLoginModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Header with Dropdowns */}
          <div className="p-6 border-b border-gray-700">
            {/* Organization Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization
              </label>
              <div className="relative">
                <select
                  value={selectedOrganization || ''}
                  onChange={(e) => handleOrganizationChange(parseInt(e.target.value))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  {organizations.length === 0 ? (
                    <option value="">No organizations</option>
                  ) : (
                    organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Business Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business / Website
              </label>
              <div className="relative">
                <select
                  value={selectedBusiness || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'add-new') {
                      setActiveTab('execute');
                      setSelectedBusiness(null);
                    } else if (value) {
                      handleBusinessChange(parseInt(value));
                    } else {
                      setSelectedBusiness(null);
                    }
                  }}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  {businesses.length === 0 ? (
                    websiteLimitInfo?.canAddWebsite ? (
                      <option value="add-new">Add a new business</option>
                    ) : (
                      <option value="" disabled>
                        Website limit reached ({websiteLimitInfo?.tier} - {websiteLimitInfo?.limit} website{websiteLimitInfo?.limit !== 1 ? 's' : ''})
                      </option>
                    )
                  ) : (
                    <>
                      {/* <option value="">Select a business</option> */}
                      {businesses.map((business) => (
                        <option key={business.id} value={business.id}>
                          {business.websiteName}
                        </option>
                      ))}
                      {websiteLimitInfo?.canAddWebsite ? (
                        <option value="add-new">+ Add a new business</option>
                      ) : (
                        <option value="" disabled>
                          --- Limit reached ({websiteLimitInfo?.tier} - {websiteLimitInfo?.limit} website{websiteLimitInfo?.limit !== 1 ? 's' : ''}) ---
                        </option>
                      )}
                    </>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex-1 p-6">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={!selectedBusiness && tab.id !== 'execute'}
                  className={`w-full flex items-start p-4 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : !selectedBusiness && tab.id !== 'execute'
                      ? 'text-gray-500 cursor-not-allowed bg-gray-700/50'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-2xl">{tab.icon}</span>
                  <div>
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-sm opacity-75">{tab.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Selection Info */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Organization:</span>
                <span className="text-gray-300 font-medium truncate ml-2">{selectedOrgName}</span>
              </div>
              {selectedBusiness && (
                <div className="flex justify-between">
                  <span>Business:</span>
                  <span className="text-gray-300 font-medium truncate ml-2">{selectedBusinessName}</span>
                </div>
              )}
              {websiteLimitInfo && (
                <div className="flex justify-between pt-1 border-t border-gray-600/50 mt-2">
                  <span>Websites:</span>
                  <span className={`font-medium truncate ml-2 ${websiteLimitInfo.canAddWebsite ? 'text-gray-300' : 'text-yellow-400'}`}>
                    {websiteLimitInfo.currentCount}/{websiteLimitInfo.isUnlimited ? '∞' : websiteLimitInfo.limit}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-8">
            {!selectedBusiness && businesses.length > 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-500 text-6xl mb-6">📊</div>
                <h2 className="text-3xl font-semibold text-white mb-4">No Business Selected</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Select a business from the sidebar to view its analytics and manage settings.
                </p>
              </div>
            ) : (
              <div className="h-full">
                {activeTab === 'trends' && selectedBusiness && <TrendsTab businessId={selectedBusiness} />}
                {activeTab === 'insights' && selectedBusiness && <AIInsightsTab businessId={selectedBusiness} />}
                {activeTab === 'business' && selectedBusiness && (
                  <BusinessInfoTab 
                    businessId={selectedBusiness} 
                    onBusinessDeleted={() => {
                      // Refresh businesses list, website limit info, and reset selection
                      if (selectedOrganization) {
                        fetchBusinesses(selectedOrganization);
                      }
                      fetchWebsiteLimitInfo();
                      setActiveTab('execute');
                    }} 
                  />
                )}
                {activeTab === 'prompts' && selectedBusiness && <PromptsTab businessId={selectedBusiness} />}
                {activeTab === 'execute' && <ExecuteTab businessId={selectedBusiness} />}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => setLoginModalOpen(false)}
      />
    </div>
  );
}