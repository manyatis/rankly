import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Image src="/lucy.png" alt="Rankly" width={24} height={24} />
            <span className="text-xl font-semibold">Rankly</span>
          </div>
          <div className="flex space-x-6">
            <Link href="/learn" className="text-gray-400 hover:text-white transition-colors">Learn More</Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Generate Report</Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 American Code LLC. All rights reserved. AI-powered report generation for SEO professionals.</p>
        </div>
      </div>
    </footer>
  );
}