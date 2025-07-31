import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscribe - Rankly',
  description: 'Choose the perfect plan for your AI Engine Optimization needs',
};

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}