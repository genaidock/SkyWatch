import { Inter } from 'next/font/google';
import Script from 'next/script';
import { FlightProvider } from '@/context/FlightContext';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SkyWatch — Live Flight Radar',
  description: 'Real-time aircraft tracking with ADS-B data',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SkyWatch',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#040d14',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7524010618497905"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} bg-bg text-text overflow-hidden h-[100dvh]`}>
        <FlightProvider>
          {children}
        </FlightProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
