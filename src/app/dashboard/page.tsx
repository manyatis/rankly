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
import ExecuteTab from '@/components/dashboard/ExecuteTab';

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
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchOrganizations();
    }
  }, [session]);

  useEffect(() => {
    if (selectedOrganization) {
      fetchBusinesses(selectedOrganization);
    }
  }, [selectedOrganization]);

  // Automatically switch to execute tab when no businesses exist
  useEffect(() => {
    if (businesses.length === 0 && activeTab !== 'execute') {
      setActiveTab('execute');
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
        }
      } else {
        console.error('Failed to fetch organizations:', response.status);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
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
        } else {
          setSelectedBusiness(null);
        }
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const handleOrganizationChange = (orgId: number) => {
    setSelectedOrganization(orgId);
    setSelectedBusiness(null);
  };

  const handleBusinessChange = (businessId: number) => {
    setSelectedBusiness(businessId);
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

  if (status === 'loading' || (session?.user && loading)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
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
                  onChange={(e) => handleBusinessChange(parseInt(e.target.value))}
                  disabled={businesses.length === 0}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {businesses.length === 0 ? (
                    <option value="">No businesses available</option>
                  ) : (
                    <>
                      <option value="">Select a business</option>
                      {businesses.map((business) => (
                        <option key={business.id} value={business.id}>
                          {business.websiteName}
                        </option>
                      ))}
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
                {activeTab === 'trends' && <TrendsTab businessId={selectedBusiness} />}
                {activeTab === 'insights' && <AIInsightsTab businessId={selectedBusiness} />}
                {activeTab === 'business' && <BusinessInfoTab businessId={selectedBusiness} />}
                {activeTab === 'prompts' && <PromptsTab businessId={selectedBusiness} />}
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