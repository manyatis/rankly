'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import TrendsTab from '@/components/dashboard/TrendsTab';
import AIInsightsTab from '@/components/dashboard/AIInsightsTab';
import BusinessInfoTab from '@/components/dashboard/BusinessInfoTab';
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

// Utility functions for localStorage persistence
const getStoredActiveTab = (): 'trends' | 'insights' | 'business' | 'competitors' | 'automation' | 'execute' | 'link-website' => {
  if (typeof window === 'undefined') return 'trends';
  const stored = localStorage.getItem('dashboard-active-tab');
  const validTabs = ['trends', 'insights', 'business', 'competitors', 'automation', 'execute', 'link-website'];
  return (stored && validTabs.includes(stored)) ? stored as 'trends' | 'insights' | 'business' | 'competitors' | 'automation' | 'execute' | 'link-website' : 'trends';
};

const setStoredActiveTab = (tab: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dashboard-active-tab', tab);
  }
};

const getStoredSelectedBusiness = (): number | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('dashboard-selected-business');
  return stored ? parseInt(stored, 10) : null;
};

const setStoredSelectedBusiness = (businessId: number | null) => {
  if (typeof window !== 'undefined') {
    if (businessId) {
      localStorage.setItem('dashboard-selected-business', businessId.toString());
    } else {
      localStorage.removeItem('dashboard-selected-business');
    }
  }
};

function DashboardContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<number | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'trends' | 'insights' | 'business' | 'competitors' | 'automation' | 'execute' | 'link-website'>(getStoredActiveTab());
  const [isLoading, setIsLoading] = useState(true);
  const [organizationsLoaded, setOrganizationsLoaded] = useState(false);
  const [businessesLoaded, setBusinessesLoaded] = useState(false);
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
  const [pendingAnalysisUrl, setPendingAnalysisUrl] = useState<string | null>(null);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (session?.user) {
      fetchOrganizations();
      fetchWebsiteLimitInfo();
      
      // Check for URL parameters for website analysis
      const analyzeUrl = searchParams.get('analyzeUrl');
      const autoStart = searchParams.get('autoStart');
      
      if (analyzeUrl && autoStart === 'true') {
        setPendingAnalysisUrl(analyzeUrl);
        setActiveTab('link-website');
      }
    }
  }, [session, searchParams]);

  // Fetch feature flags on component mount
  useEffect(() => {
    fetch('/api/feature-flags')
      .then(res => res.json())
      .then(data => setFeatureFlags(data.flags || {}))
      .catch(err => console.error('Failed to fetch feature flags:', err));
  }, []);

  useEffect(() => {
    if (organizations.length > 0 && !selectedOrganization) {
      setSelectedOrganization(organizations[0].id);
    }
  }, [organizations, selectedOrganization]);

  useEffect(() => {
    if (selectedOrganization) {
      fetchBusinesses(selectedOrganization);
    }
  }, [selectedOrganization]);

  // Only complete loading when both org and business data are loaded
  useEffect(() => {
    if (organizationsLoaded && businessesLoaded) {
      // Set selected business after both are loaded
      if (businesses.length > 0 && !selectedBusiness) {
        const storedBusinessId = getStoredSelectedBusiness();
        const businessExists = businesses.find(b => b.id === storedBusinessId);
        
        if (businessExists) {
          setSelectedBusiness(storedBusinessId);
        } else {
          setSelectedBusiness(businesses[0].id);
        }
      }// NEW: If no businesses exist, default to link-website tab
else if (businesses.length === 0) {
  setActiveTab('link-website');
  setStoredActiveTab('link-website');
}

      setIsLoading(false);
    }
  }, [organizationsLoaded, businessesLoaded, businesses, selectedBusiness]);

  const handleTabChange = (tab: 'trends' | 'insights' | 'business' | 'competitors' | 'automation' | 'execute' | 'link-website') => {
    setActiveTab(tab);
    setStoredActiveTab(tab);
    // Close sidebar on mobile after tab selection
    setSidebarOpen(false);
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/dashboard/organizations', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setOrganizationsLoaded(true);
    }
  };

  const fetchBusinesses = async (orgId: number) => {
    try {
      const response = await fetch(`/api/dashboard/businesses?organizationId=${orgId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses || []);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setBusinessesLoaded(true);
    }
  };

  const fetchWebsiteLimitInfo = async () => {
    try {
      const response = await fetch('/api/dashboard/website-limit-info', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setWebsiteLimitInfo(data);
      }
    } catch (error) {
      console.error('Error fetching website limit info:', error);
    }
  };


  const handleBusinessChange = (businessId: number) => {
    setSelectedBusiness(businessId);
    setStoredSelectedBusiness(businessId);
  };

  const handleBusinessUpdate = () => {
    if (selectedOrganization) {
      fetchBusinesses(selectedOrganization);
    }
    fetchWebsiteLimitInfo();
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex">
          {/* Loading Sidebar */}
          <div className="w-64 bg-gray-800 border-r border-gray-700">
            <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
              <div className="w-32 h-6 bg-gray-600 rounded animate-pulse"></div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div className="w-full h-10 bg-gray-600 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div className="w-full h-10 bg-gray-600 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                {Array.from({length: 6}).map((_, i) => (
                  <div key={i} className="w-full h-8 bg-gray-600 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Loading Main Content */}
          <div className="flex-1 min-w-0">
            <div className="h-full p-6">
              <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="h-8 bg-gray-600 rounded w-40 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-56 animate-pulse"></div>
                  </div>
                  <div className="h-10 bg-gray-600 rounded w-32 animate-pulse"></div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                {/* Chart Skeleton */}
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

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-6">Dashboard Access Required</h1>
            <p className="text-gray-400 mb-8">Please sign in to access your dashboard.</p>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
        <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} onSuccess={() => setLoginModalOpen(false)} />
      </div>
    );
  }

  const selectedBusinessData = businesses.find(b => b.id === selectedBusiness);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Dashboard</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="p-4">
            {/* Organization Selector */}
            {organizations.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Organization</label>
                <select
                  value={selectedOrganization || ''}
                  onChange={(e) => setSelectedOrganization(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm font-medium shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-500 hover:bg-gray-750 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25rem 1.25rem',
                    paddingRight: '2.5rem'
                  }}
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Business Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
              {businesses.length > 0 ? (
                <select
                  value={selectedBusiness || ''}
                  onChange={(e) => handleBusinessChange(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm font-medium shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-500 hover:bg-gray-750 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25rem 1.25rem',
                    paddingRight: '2.5rem'
                  }}
                >
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.websiteName}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-gray-400 text-sm p-2 border border-gray-600 rounded-lg">
                  No websites linked yet
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <nav className="space-y-1">
              <button
                onClick={() => handleTabChange('trends')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'trends'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Trends
              </button>
              <button
                onClick={() => handleTabChange('automation')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'automation'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Automation Setup
              </button>
              <button
                onClick={() => handleTabChange('insights')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'insights'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                AI Insights
              </button>
              <button
                onClick={() => handleTabChange('business')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'business'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Website Info
              </button>
              <button
                onClick={() => handleTabChange('competitors')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'competitors'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Competitors
              </button>
              <button
                onClick={() => handleTabChange('execute')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'execute'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Manual Analysis
              </button>
              <button
                onClick={() => handleTabChange('link-website')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'link-website'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Link Website
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              ≡
            </button>
            <h1 className="text-lg font-semibold text-white">
              {selectedBusinessData?.websiteName || 'Dashboard'}
            </h1>
            <div></div>
          </div>

          {/* Content Area */}
          <div className="h-full">
            {false && !selectedBusiness && businesses.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">No Websites Found</h3>
                  <p className="text-gray-400 mb-4">
                    Link your first website to start tracking your AEO performance.
                  </p>
                  <button
                    onClick={() => handleTabChange('link-website')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Link Website
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full p-3 sm:p-6 overflow-x-hidden">
                {activeTab === 'trends' && selectedBusiness && <TrendsTab businessId={selectedBusiness} featureFlags={featureFlags} />}
                {activeTab === 'insights' && selectedBusiness && <AIInsightsTab businessId={selectedBusiness} />}
                {activeTab === 'business' && selectedBusiness && (
                  <BusinessInfoTab 
                    businessId={selectedBusiness} 
                    onBusinessUnlinked={handleBusinessUpdate}
                  />
                )}
                {activeTab === 'competitors' && selectedBusiness && <CompetitorsTab businessId={selectedBusiness} />}
                {activeTab === 'automation' && selectedBusiness && <AutomationSetupTab businessId={selectedBusiness} />}
                {activeTab === 'execute' && selectedBusiness && <ExecuteTab businessId={selectedBusiness} />}
                {activeTab === 'link-website' && (
                  <LinkWebsiteTab 
                    onWebsiteLinked={handleBusinessUpdate}
                    websiteLimitInfo={websiteLimitInfo}
                    pendingAnalysisUrl={pendingAnalysisUrl}
                    onClearPendingUrl={() => setPendingAnalysisUrl(null)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex">
          {/* Loading Sidebar */}
          <div className="w-64 bg-gray-800 border-r border-gray-700">
            <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
              <div className="w-32 h-6 bg-gray-600 rounded animate-pulse"></div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div className="w-full h-10 bg-gray-600 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div className="w-full h-10 bg-gray-600 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                {Array.from({length: 6}).map((_, i) => (
                  <div key={i} className="w-full h-8 bg-gray-600 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Loading Main Content */}
          <div className="flex-1 min-w-0">
            <div className="h-full p-6">
              <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="h-8 bg-gray-600 rounded w-40 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-56 animate-pulse"></div>
                  </div>
                  <div className="h-10 bg-gray-600 rounded w-32 animate-pulse"></div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                {/* Chart Skeleton */}
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
    }>
      <DashboardContent />
    </Suspense>
  );
}