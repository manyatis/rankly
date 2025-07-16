'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors">
            <Image src="/dog.png" alt="SearchDogAI" width={24} height={24} className="object-contain" />
            <span>SearchDogAI</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Analytics</Link>
            <Link href="/#solutions" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Solutions</Link>
            <Link href="/aeo-score" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">AEO Score Tool</Link>
            <Link href="/aeo" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Learn AEO</Link>
            <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Pricing</Link>
            <Link href="/#waitlist" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-md">Join Waitlist</Link>
          </div>
          <button className='md:hidden p-2 text-gray-600 hover:text-gray-900' onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
            <div className={`absolute right-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex flex-col p-6 space-y-6 mt-16">
                <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg" onClick={closeMobileMenu}>Analytics</Link>
                <Link href="/#solutions" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg" onClick={closeMobileMenu}>Solutions</Link>
                <Link href="/aeo-score" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg" onClick={closeMobileMenu}>AEO Score Tool</Link>
                <Link href="/aeo" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg" onClick={closeMobileMenu}>Learn AEO</Link>
                <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg" onClick={closeMobileMenu}>Pricing</Link>
                <Link href="/#waitlist" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-md text-center" onClick={closeMobileMenu}>Join Waitlist</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}