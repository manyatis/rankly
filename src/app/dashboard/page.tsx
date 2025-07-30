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
import ExecuteTab from '@/components/dashboard/ExecuteTabSimple';
import CompetitorsTab from '@/components/dashboard/CompetitorsTab';
import LinkWebsiteTab from '@/components/dashboard/LinkWebsiteTab';
import AutomationSetupTab from '@/components/dashboard/AutomationSetupTab';

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
  const [activeTab, setActiveTab] = useState<'automation' | 'trends' | 'insights' | 'business' | 'competitors' | 'prompts' | 'execute' | 'link-website'>('automation');
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
          setActiveTab('link-website')
        }
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setInitialLoadComplete(true);
    }
  };

  const fetchWebsiteLimitInfo = async () => {
    try {
      const response = await fetch('/api/usage-check?checkWebsiteLimit=true');
      if (response.ok) {
        const data = await response.json();
        // Map the consolidated response to the expected format
        if (data.websites) {
          setWebsiteLimitInfo({
            canAddWebsite: data.websites.canAdd,
            currentCount: data.websites.currentCount,
            limit: data.websites.limit,
            remainingSlots: data.websites.remaining,
            tier: data.tier,
            isUnlimited: data.websites.limit === -1
          });
        }
      }
    } catch (error) {
      console.error('Error fetching website limit info:', error);
    }
  };

  // Commented out unused function - kept for potential future use
  // const refreshBusinesses = async () => {
  //   if (selectedOrganization) {
  //     await fetchBusinesses(selectedOrganization);
  //     await fetchWebsiteLimitInfo();
  //   }
  // };

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

  const handleWebsiteLinked = (businessId: number) => {
    // Refresh businesses list and select the new one
    if (selectedOrganization) {
      fetchBusinesses(selectedOrganization).then(() => {
        setSelectedBusiness(businessId);
        setActiveTab('automation');
        setTimeout(() => setInitialLoadComplete(true), 200);
      });
    }
    fetchWebsiteLimitInfo();
  };

  const selectedOrgName = organizations.find(org => org.id === selectedOrganization)?.name || 'Select Organization';
  const selectedBusinessName = businesses.find(biz => biz.id === selectedBusiness)?.websiteName || 'Select Business';

  const tabs = [
    { 
      id: 'automation', 
      name: 'Automation Setup', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      description: 'Configure recurring scans' 
    },
    { 
      id: 'trends', 
      name: 'Trends', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ), 
      description: 'View ranking trends over time' 
    },
    { 
      id: 'insights', 
      name: 'AI Insights', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ), 
      description: 'AI-generated recommendations' 
    },
    { 
      id: 'business', 
      name: 'Website Info', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0-9c-5 0-9 4-9 9s4 9 9 9" />
        </svg>
      ), 
      description: 'View website details' 
    },
    { 
      id: 'competitors', 
      name: 'Competitors', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ), 
      description: 'Compare competitor rankings' 
    },
    { 
      id: 'prompts', 
      name: 'Prompts', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ), 
      description: 'Review prompt history' 
    },
    { 
      id: 'execute', 
      name: 'Manual Analysis', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ), 
      description: 'Run new AEO analysis' 
    },
    { 
      id: 'link-website', 
      name: 'Link Website', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ), 
      description: 'Add new website for tracking' 
    },
  ] as const;

  if (status === 'loading' || (session?.user && (loading || !initialLoadComplete))) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Navbar />
        
        <div className="flex-1 flex">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:flex w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
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
            {/* Mobile header skeleton */}
            <div className="lg:hidden bg-gray-800 border-b border-gray-700 p-2 sm:p-3 sticky top-12 sm:top-14 z-40">
              <div className="h-4 sm:h-5 bg-gray-600 rounded w-20 mx-auto animate-pulse"></div>
            </div>
            
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
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
        <div className="flex items-center justify-center py-12 sm:py-20 px-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 text-center border border-gray-700">
            <div className="text-6xl mb-6">🔐</div>
            <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
            <p className="text-gray-300 mb-6">
              You need to be logged in to access the dashboard. Please sign in to continue.
            </p>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
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
      
      <div className="flex-1 flex relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-gray-800 border-r border-gray-700 flex flex-col transition-transform duration-300 ease-in-out safe-top overflow-y-auto hide-scrollbar`}>
          {/* Mobile close button */}
          <div className="lg:hidden flex justify-end p-2 sm:p-3 border-b border-gray-700">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white cursor-pointer"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Header with Dropdowns */}
          <div className="p-4 sm:p-6 border-b border-gray-700">
            {/* Organization Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization
              </label>
              <div className="relative">
                <select
                  value={selectedOrganization || ''}
                  onChange={(e) => handleOrganizationChange(parseInt(e.target.value))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
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
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                >
                  {businesses.length === 0 ? (
                    <option value="" disabled>
                      No websites linked
                    </option>
                  ) : (
                    <>
                      {/* <option value="">Select a website</option> */}
                      {businesses.map((business) => (
                        <option key={business.id} value={business.id}>
                          {business.websiteName}
                        </option>
                      ))}
                      {websiteLimitInfo?.canAddWebsite ? (
                        <option value="add-new">+ Add a new website</option>
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
          <div className="flex-1 p-4 sm:p-6">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false); // Close sidebar on mobile when tab is selected
                  }}
                  disabled={!selectedBusiness && tab.id !== 'execute' && tab.id !== 'link-website'}
                  className={`w-full flex items-start p-4 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white cursor-pointer'
                      : !selectedBusiness && tab.id !== 'execute' && tab.id !== 'link-website'
                      ? 'text-gray-500 cursor-not-allowed bg-gray-700/50'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer'
                  }`}
                >
                  <div className="mr-3 mt-1">{tab.icon}</div>
                  <div>
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-sm opacity-75">{tab.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Selection Info */}
          <div className="p-4 sm:p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Organization:</span>
                <span className="text-gray-300 font-medium truncate ml-2">{selectedOrgName}</span>
              </div>
              {selectedBusiness && (
                <div className="flex justify-between">
                  <span>Website:</span>
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
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Mobile header bar */}
          <div className="lg:hidden bg-gray-800 border-b border-gray-700 p-2 sm:p-3 flex items-center justify-between sticky top-12 sm:top-14 z-40">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-gray-400 hover:text-white cursor-pointer"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-sm sm:text-base font-medium text-white">
              {tabs.find(tab => tab.id === activeTab)?.name || 'Dashboard'}
            </h1>
            <div className="w-7 sm:w-8"> {/* Spacer for centering */}</div>
          </div>
          
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {!selectedBusiness && businesses.length > 0 ? (
              <div className="text-center py-12 sm:py-20">
                <div className="text-gray-500 text-4xl sm:text-6xl mb-4 sm:mb-6">📊</div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-4">No Website Selected</h2>
                <p className="text-sm sm:text-base text-gray-400 mb-8 max-w-md mx-auto px-4">
                  Select a website from the sidebar to view its analytics and manage settings.
                </p>
              </div>
            ) : (
              <div className="h-full">
                {activeTab === 'trends' && selectedBusiness && <TrendsTab businessId={selectedBusiness} />}
                {activeTab === 'insights' && selectedBusiness && <AIInsightsTab businessId={selectedBusiness} />}
                {activeTab === 'business' && selectedBusiness && (
                  <BusinessInfoTab 
                    businessId={selectedBusiness} 
                    onBusinessUnlinked={() => {
                      // Refresh businesses list, website limit info, and reset selection
                      if (selectedOrganization) {
                        fetchBusinesses(selectedOrganization);
                      }
                      fetchWebsiteLimitInfo();
                      setActiveTab('execute');
                    }} 
                  />
                )}
                {activeTab === 'competitors' && selectedBusiness && <CompetitorsTab businessId={selectedBusiness} />}
                {activeTab === 'prompts' && selectedBusiness && <PromptsTab businessId={selectedBusiness} />}
                {activeTab === 'execute' && (
                  <ExecuteTab 
                    businessId={selectedBusiness} 
                  />
                )}
                {activeTab === 'automation' && selectedBusiness && <AutomationSetupTab businessId={selectedBusiness} />}
                {activeTab === 'link-website' && (
                  <LinkWebsiteTab 
                    onWebsiteLinked={handleWebsiteLinked}
                    websiteLimitInfo={websiteLimitInfo}
                  />
                )}
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