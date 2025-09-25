import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/layout/navigation';
import AuthSessionProvider from '@/components/providers/session-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  title: 'Absensi Standalone',
  description: 'Employee attendance management system with GPS tracking',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthSessionProvider>
          <div id="root">
            <Navigation />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
