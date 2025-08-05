'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function APIPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex relative">
        {/* Left Control Panel */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col blur-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-2">API Documentation</h2>
            <p className="text-gray-400 text-sm">Explore our API endpoints</p>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 p-6">
            <div className="space-y-2">
              <button className="w-full flex items-center p-4 rounded-lg text-left bg-blue-600 text-white">
                <span className="mr-3 text-xl">📊</span>
                <div>
                  <div className="font-medium">Insights</div>
                  <div className="text-sm opacity-75">Get AI-powered insights</div>
                </div>
              </button>
              
              <button className="w-full flex items-center p-4 rounded-lg text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <span className="mr-3 text-xl">🏆</span>
                <div>
                  <div className="font-medium">Rankings</div>
                  <div className="text-sm opacity-75">Retrieve ranking data</div>
                </div>
              </button>
              
              <button className="w-full flex items-center p-4 rounded-lg text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <span className="mr-3 text-xl">🔍</span>
                <div>
                  <div className="font-medium">Analysis</div>
                  <div className="text-sm opacity-75">Run AEO analysis</div>
                </div>
              </button>
              
              <button className="w-full flex items-center p-4 rounded-lg text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <span className="mr-3 text-xl">📈</span>
                <div>
                  <div className="font-medium">Trends</div>
                  <div className="text-sm opacity-75">Historical trend data</div>
                </div>
              </button>
              
              <button className="w-full flex items-center p-4 rounded-lg text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <span className="mr-3 text-xl">🏢</span>
                <div>
                  <div className="font-medium">Businesses</div>
                  <div className="text-sm opacity-75">Manage business data</div>
                </div>
              </button>
              
              <button className="w-full flex items-center p-4 rounded-lg text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <span className="mr-3 text-xl">🔐</span>
                <div>
                  <div className="font-medium">Authentication</div>
                  <div className="text-sm opacity-75">API key management</div>
                </div>
              </button>
              
              <button className="w-full flex items-center p-4 rounded-lg text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <span className="mr-3 text-xl">⚡</span>
                <div>
                  <div className="font-medium">Rate Limits</div>
                  <div className="text-sm opacity-75">Usage and limits</div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="text-xs text-gray-400 space-y-1">
              <div>API Version: v1.0</div>
              <div>Base URL: api.rankly.com</div>
              <div>Format: REST JSON</div>
            </div>
          </div>
        </div>

        {/* Main Content Area with blur overlay */}
        <div className="flex-1 flex flex-col blur-sm">
          <div className="flex-1 p-8 bg-gray-900">
            {/* Sample content that appears blurred */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">GET /api/insights</h3>
                <p className="text-gray-300 mb-4">Retrieve AI-powered insights for your business</p>
                <div className="bg-gray-900 rounded p-4 font-mono text-sm text-gray-300">
                  <div className="text-green-400">GET</div>
                  <div>curl -X GET &quot;https://api.rankly.com/v1/insights&quot; \</div>
                  <div className="ml-4">-H &quot;Authorization: Bearer YOUR_API_KEY&quot;</div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">POST /api/analysis</h3>
                <p className="text-gray-300 mb-4">Start a new AEO analysis for a website</p>
                <div className="bg-gray-900 rounded p-4 font-mono text-sm text-gray-300">
                  <div className="text-blue-400">POST</div>
                  <div>curl -X POST &quot;https://api.rankly.com/v1/analysis&quot; \</div>
                  <div className="ml-4">-H &quot;Authorization: Bearer YOUR_API_KEY&quot; \</div>
                  <div className="ml-4">-H &quot;Content-Type: application/json&quot; \</div>
                  {/* <div className="ml-4">-d "{website: example.com}"</div> */}
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">GET /api/rankings</h3>
                <p className="text-gray-300 mb-4">Get current ranking positions</p>
                <div className="bg-gray-900 rounded p-4 font-mono text-sm text-gray-300">
                  <div className="text-green-400">GET</div>
                  <div>curl -X GET &quot;https://api.rankly.com/v1/rankings?business_id=123&quot; \</div>
                  <div className="ml-4">-H &quot;Authorization: Bearer YOUR_API_KEY&quot;</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center bg-gray-800/90 backdrop-blur-sm rounded-2xl p-12 border border-gray-600 shadow-2xl">
            <div className="text-8xl mb-6">🚀</div>
            <h1 className="text-4xl font-bold text-white mb-4">Coming Soon</h1>
            <p className="text-xl text-gray-300 mb-6 max-w-md">
              Our comprehensive API documentation is currently under development
            </p>
            {/* <div className="bg-blue-600/20 text-blue-300 px-6 py-3 rounded-lg border border-blue-500/30">
              <div className="text-sm font-medium">Expected Launch: Q2 2024</div>
            </div> */}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}