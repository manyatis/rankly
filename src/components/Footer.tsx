import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12 safe-bottom">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Image src="/king.png" alt="rankly" width={20} height={20} className="sm:w-6 sm:h-6" />
            <span className="text-lg sm:text-xl font-semibold">rankly</span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Dashboard</Link>
            <Link href="/api" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">API</Link>
            <Link href="/learn" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Learn</Link>
            <Link href="/#pricing" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Pricing</Link>
            <Link href="/subscribe" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Pricing</Link>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
          <p className="text-xs sm:text-sm">&copy; 2025 American Code LLC. All rights reserved. AI-powered report generation for SEO professionals.</p>
        </div>
      </div>
    </footer>
  );
}