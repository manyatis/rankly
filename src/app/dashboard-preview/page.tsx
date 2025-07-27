'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for wireframe
  const mockData = {
    visibility: {
      overall: 78,
      openai: 85,
      claude: 72,
      perplexity: 76,
      gemini: 81,
      trend: '+12%'
    },
    mentions: {
      total: 2847,
      positive: 2156,
      neutral: 531,
      negative: 160,
      trend: '+8%'
    },
    traffic: {
      aiTraffic: '24.3K',
      organicShare: '31%',
      trend: '+15%'
    },
    competitors: [
      { name: 'HubSpot', score: 92, change: '+3%' },
      { name: 'Salesforce', score: 89, change: '-1%' },
      { name: 'Marketo', score: 78, change: '+5%' },
      { name: 'Mailchimp', score: 71, change: '-2%' }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white" style={{ fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <Navbar />
      
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Rankly Dashboard</h1>
              <p className="text-gray-400 mt-1">Professional AEO Analytics Platform Preview</p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'visibility', label: 'AI Visibility' },
              { id: 'conversations', label: 'Conversation Explorer' },
              { id: 'agents', label: 'Agent Analytics' },
              { id: 'competitors', label: 'Competitive Intelligence' },
              { id: 'insights', label: 'AI Insights' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">AI Visibility Score</h3>
              <span className="text-green-400 text-sm">{mockData.visibility.trend}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{mockData.visibility.overall}%</div>
            <div className="text-sm text-gray-400">Across all AI platforms</div>
            <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${mockData.visibility.overall}%` }}></div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">Brand Mentions</h3>
              <span className="text-green-400 text-sm">{mockData.mentions.trend}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{mockData.mentions.total.toLocaleString()}</div>
            <div className="text-sm text-gray-400">This month</div>
            <div className="flex space-x-2 mt-4">
              <div className="flex-1 bg-green-500 h-2 rounded-full"></div>
              <div className="flex-1 bg-yellow-500 h-2 rounded-full"></div>
              <div className="flex-1 bg-red-500 h-2 rounded-full"></div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">AI-Driven Traffic</h3>
              <span className="text-green-400 text-sm">{mockData.traffic.trend}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{mockData.traffic.aiTraffic}</div>
            <div className="text-sm text-gray-400">{mockData.traffic.organicShare} of organic traffic</div>
            <div className="mt-4 text-xs text-gray-500">↗ Trending up significantly</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">Competitive Position</h3>
              <span className="text-green-400 text-sm">+2 positions</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">#3</div>
            <div className="text-sm text-gray-400">In industry ranking</div>
            <div className="mt-4 text-xs text-gray-500">Above industry average</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - AI Platform Performance */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Platform Breakdown */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6">AI Platform Performance</h3>
              <div className="space-y-4">
                {[
                  { name: 'OpenAI (ChatGPT)', score: mockData.visibility.openai, color: 'bg-green-500', icon: '🤖' },
                  { name: 'Google Gemini', score: mockData.visibility.gemini, color: 'bg-blue-500', icon: '🔍' },
                  { name: 'Perplexity', score: mockData.visibility.perplexity, color: 'bg-purple-500', icon: '🧠' },
                  { name: 'Claude (Anthropic)', score: mockData.visibility.claude, color: 'bg-orange-500', icon: '🎭' }
                ].map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <div>
                        <div className="font-medium text-white">{platform.name}</div>
                        <div className="text-sm text-gray-400">Visibility Score</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">{platform.score}%</div>
                        <div className="w-24 bg-gray-600 rounded-full h-2 mt-1">
                          <div className={`${platform.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${platform.score}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation Trends */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6">AI Conversation Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Top Queries About Your Brand</h4>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-300">• &quot;Best marketing automation tools&quot;</div>
                    <div className="text-gray-300">• &quot;CRM software comparison&quot;</div>
                    <div className="text-gray-300">• &quot;Email marketing platforms&quot;</div>
                    <div className="text-gray-300">• &quot;Lead generation tools&quot;</div>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Emerging Topics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-300">• AI-powered marketing</div>
                    <div className="text-gray-300">• Privacy-first analytics</div>
                    <div className="text-gray-300">• Automation workflows</div>
                    <div className="text-gray-300">• Customer segmentation</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Analytics */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6">AI Agent Crawling Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">847</div>
                  <div className="text-sm text-gray-400">Pages Crawled</div>
                  <div className="text-xs text-green-400 mt-1">+23% this week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">156</div>
                  <div className="text-sm text-gray-400">Content Citations</div>
                  <div className="text-xs text-green-400 mt-1">+31% this week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">92%</div>
                  <div className="text-sm text-gray-400">Indexing Success</div>
                  <div className="text-xs text-yellow-400 mt-1">Stable</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Competitive Intelligence & Insights */}
          <div className="space-y-6">
            
            {/* Competitive Intelligence */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6">Competitive Intelligence</h3>
              <div className="space-y-3">
                {mockData.competitors.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{competitor.name}</div>
                        <div className="text-xs text-gray-400">AI Visibility</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{competitor.score}%</div>
                      <div className={`text-xs ${competitor.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {competitor.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6">AI-Powered Insights</h3>
              <div className="space-y-4">
                <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div>
                      <h4 className="font-medium text-blue-100 mb-1">Opportunity Detected</h4>
                      <p className="text-sm text-blue-200">Your content performs 23% better on Perplexity. Consider optimizing for their citation format.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <h4 className="font-medium text-yellow-100 mb-1">Content Gap Alert</h4>
                      <p className="text-sm text-yellow-200">Competitors are gaining ground on &quot;AI marketing tools&quot; queries. Action recommended.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <h4 className="font-medium text-green-100 mb-1">Growth Trend</h4>
                      <p className="text-sm text-green-200">Your brand mentions increased 47% after recent product launch. Momentum is building!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                  Generate Full Report
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                  Run Competitive Analysis
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                  Export Data
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                  Create Action Plan
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}