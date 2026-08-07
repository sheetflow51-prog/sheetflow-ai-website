import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sheetflow.ai';

import SmoothScroll from '@/components/providers/SmoothScroll';
import LoadingScreen from '@/components/providers/LoadingScreen';
import GsapProvider from '@/components/providers/GsapProvider';
import MotionProvider from '@/components/providers/MotionProvider';
// The decorative layer — particles, aurora, cursor, grain, scroll rail, boot
// flourish and the dormant audio engine — loads after the browser goes idle.
// See DeferredAtmosphere for why.
import DeferredAtmosphere from '@/components/providers/DeferredAtmosphere';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});

// A distinct editorial serif for headlines — separates "display" from "sans"
// (both were Inter before) and reads closer to a premium studio brand than a SaaS dashboard.
const display = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: 'variable',
  style: ['normal', 'italic'],
  // Just optical size — refined hairline contrast at monument headline scale,
  // sturdier at small sizes. Skipping the SOFT/WONK axes to stay premium, not playful.
  axes: ['opsz'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SheetFlow AI — AI automation agency for growing businesses.',
    template: '%s · SheetFlow AI',
  },
  description:
    'SheetFlow builds AI automations that capture leads, follow up on WhatsApp, book appointments, and keep your CRM updated — so your business runs itself.',
  keywords: [
    'AI automation agency',
    'WhatsApp automation',
    'lead capture automation',
    'CRM automation',
    'appointment booking automation',
    'small business automation',
    'AI follow-up systems',
  ],
  authors: [{ name: 'SheetFlow AI' }],
  creator: 'SheetFlow AI',
  publisher: 'SheetFlow AI',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'SheetFlow AI — AI automation agency for growing businesses.',
    description:
      'AI automations for lead capture, WhatsApp follow-ups, appointment booking, CRM updates and daily reports — built for clinics, agencies, coaches and service businesses.',
    url: SITE_URL,
    type: 'website',
    locale: 'en_US',
    siteName: 'SheetFlow AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SheetFlow AI — AI automation agency for growing businesses.',
    description: 'We automate the busywork running your business — leads, follow-ups, bookings, CRM, reports.',
    site: '@sheetflow51',
    creator: '@sheetflow51',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: '#060608',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable}`}>
      <body className="relative bg-void font-sans text-white antialiased">
        <MotionProvider>
          <LoadingScreen />
          <SmoothScroll>
            <GsapProvider>
              <Navigation />
              <main className="relative z-10">{children}</main>
              <Footer />
            </GsapProvider>
          </SmoothScroll>
          <DeferredAtmosphere />
        </MotionProvider>
        {/* Vercel Analytics — zero-config Web Vitals + pageview tracking */}
        <Analytics />
        {/* Vercel Speed Insights — CWV monitoring in production */}
        <SpeedInsights />
      </body>
    </html>
  );
}
