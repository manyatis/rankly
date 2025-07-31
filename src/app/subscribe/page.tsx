import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SubscriptionFlow from '@/components/payments/SubscriptionFlow';

export const metadata: Metadata = {
  title: 'Subscribe - Rankly',
  description: 'Choose the perfect plan for your AI Engine Optimization needs',
};

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <SubscriptionFlow />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}