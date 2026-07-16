import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Forge — AI Developer Companion',
  description: 'Your personalized AI companion for learning, building, and growing as a developer.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-forge-bg text-forge-text antialiased">{children}</body>
    </html>
  );
}
