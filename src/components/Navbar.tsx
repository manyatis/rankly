'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';
import LoginModal from './LoginModal';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    setLoginModalOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
    setUserDropdownOpen(false);
  };

  const closeUserDropdown = () => {
    setUserDropdownOpen(false);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-xl font-semibold text-white hover:text-gray-300 transition-colors">
            <Image src="/lucy.png" alt="Rankly" width={24} height={24} />
            <span>Rankly</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {/* <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Analytics</Link> */}
            {/* <Link href="/#solutions" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Solutions</Link> */}
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors font-medium">Dashboard</Link>
            <Link href="/learn" className="text-gray-300 hover:text-white transition-colors font-medium">Learn</Link>
            <Link href="/#pricing" className="text-gray-300 hover:text-white transition-colors font-medium">Pricing</Link>
            {/* <Link href="/aeo" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">About Us</Link> */}
            {loading ? (
              <div className="flex items-center space-x-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-600 rounded w-20"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <span className="text-gray-300 font-medium">{user.email.split("@")[0]}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={closeUserDropdown} />
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-20">
                      <div className="py-2">
                        <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-600">
                          Signed in as
                        </div>
                        <div className="px-4 py-2 text-sm font-medium text-gray-200 truncate">
                          {user.email}
                        </div>
                        <div className="border-t border-gray-600">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors cursor-pointer"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
          <button className='md:hidden p-2 text-gray-300 hover:text-white' onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black opacity-50" onClick={closeMobileMenu} />
            <div className={`absolute right-0 top-0 h-full w-64 bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex flex-col p-6 space-y-6 mt-16">
                {/* <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg" onClick={closeMobileMenu}>Analytics</Link> */}
                {/* <Link href="/#solutions" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg" onClick={closeMobileMenu}>Solutions</Link> */}
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors font-medium text-lg" onClick={closeMobileMenu}>Dashboard</Link>
                <Link href="/learn" className="text-gray-300 hover:text-white transition-colors font-medium text-lg" onClick={closeMobileMenu}>Learn More</Link>
                <Link href="/#pricing" className="text-gray-300 hover:text-white transition-colors font-medium text-lg" onClick={closeMobileMenu}>Pricing</Link>
                {/* <Link href="/aeo" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg" onClick={closeMobileMenu}>About Us</Link> */}
                {loading ? (
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-600 rounded w-32"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-10 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                ) : user ? (
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-200">{user.email.split("@")[0]}</div>
                        <div className="text-xs text-gray-400 truncate">{user.email}</div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full bg-red-900/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-900/30 transition-colors font-medium text-sm cursor-pointer"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        setLoginModalOpen(true);
                        closeMobileMenu();
                      }}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md text-center cursor-pointer"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLogin}
      />
    </nav>
  );
}