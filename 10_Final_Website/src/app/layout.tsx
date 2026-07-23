import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sheetflow.ai';

import SmoothScroll from '@/components/providers/SmoothScroll';
import CustomCursor from '@/components/providers/CustomCursor';
import LoadingScreen from '@/components/providers/LoadingScreen';
import ScrollProgress from '@/components/providers/ScrollProgress';
import AmbientBackground from '@/components/providers/AmbientBackground';
import NoiseTexture from '@/components/providers/NoiseTexture';
import GsapProvider from '@/components/providers/GsapProvider';
import AudioProvider from '@/components/providers/AudioProvider';
import Awakening from '@/components/signature/Awakening';
import MotionProvider from '@/components/providers/MotionProvider';
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
    site: '@Sheetflow51',
    creator: '@Sheetflow51',
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'SheetFlow AI',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    'AI automation agency for growing businesses — lead capture, WhatsApp follow-ups, appointment booking, CRM and reporting automation.',
  sameAs: [
    'https://x.com/Sheetflow51',
    'https://www.instagram.com/sheetflow51',
    'https://www.linkedin.com/company/sheetflow51',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'AI Automation Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Missed Lead Alerts',
          description:
            'Instant notifications the moment a lead comes in — so nothing waits 24 hours for a reply.',
          serviceType: 'Lead capture automation',
          provider: { '@id': `${SITE_URL}/#organization` },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'WhatsApp Follow-Ups',
          description:
            'An AI assistant that answers questions, qualifies leads, and books calls on WhatsApp — 24/7.',
          serviceType: 'WhatsApp automation',
          provider: { '@id': `${SITE_URL}/#organization` },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Appointment Booking',
          description:
            'A self-serve booking flow that syncs to your calendar and CRM. No back-and-forth.',
          serviceType: 'Appointment booking automation',
          provider: { '@id': `${SITE_URL}/#organization` },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Daily Business Reports',
          description:
            'A clean morning email with leads, bookings, revenue and what needs your attention today.',
          serviceType: 'Business reporting automation',
          provider: { '@id': `${SITE_URL}/#organization` },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'CRM Auto-Updates',
          description:
            'Forms, calls and chats flow into HubSpot, Pipedrive or GoHighLevel automatically. No manual entry.',
          serviceType: 'CRM automation',
          provider: { '@id': `${SITE_URL}/#organization` },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Invoice Reminders',
          description:
            'Polite, automated nudges that get invoices paid faster — without you chasing clients.',
          serviceType: 'Invoice reminder automation',
          provider: { '@id': `${SITE_URL}/#organization` },
        },
      },
    ],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SheetFlow AI',
  url: SITE_URL,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable}`}>
      <body className="relative bg-void font-sans text-white antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <MotionProvider>
          <LoadingScreen />
          <Awakening />
          <CustomCursor />
          <AmbientBackground />
          <NoiseTexture />
          <ScrollProgress />
          <SmoothScroll>
            <GsapProvider>
              <AudioProvider>
                <Navigation />
                <main className="relative z-10">{children}</main>
                <Footer />
              </AudioProvider>
            </GsapProvider>
          </SmoothScroll>
        </MotionProvider>
        {/* Vercel Analytics — zero-config Web Vitals + pageview tracking */}
        <Analytics />
        {/* Vercel Speed Insights — CWV monitoring in production */}
        <SpeedInsights />
      </body>
    </html>
  );
}
