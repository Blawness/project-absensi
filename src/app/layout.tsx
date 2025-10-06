import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/layout/navigation';
import { TopBar } from '@/components/layout/top-bar';
import AuthSessionProvider from '@/components/providers/session-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  title: 'Absensi PKP',
  description: 'Employee attendance management system with GPS tracking',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
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
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1a1a1a" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} bg-gray-950 text-gray-100`}>
        <AuthSessionProvider>
          <div id="root" className="flex min-h-screen">
            <Navigation />
            <div className="flex-1 flex flex-col">
              <TopBar />
              <main className="flex-1 bg-gray-950 p-6">
                {children}
              </main>
            </div>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
