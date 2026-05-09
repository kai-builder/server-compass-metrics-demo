import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/NavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Server Compass Metrics Demo',
  description: 'Demo app for testing metrics features',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen p-6 max-w-7xl mx-auto">
          <NavBar />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
