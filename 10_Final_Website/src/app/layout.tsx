import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
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

const display = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
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
    default: 'SheetFlow AI — The intelligence layer your spreadsheets always deserved.',
    template: '%s · SheetFlow AI',
  },
  description:
    'SheetFlow AI is the operational intelligence layer for spreadsheets. It watches your data, catches what matters, and acts before you have to ask.',
  keywords: [
    'AI spreadsheet',
    'spreadsheet automation',
    'operational intelligence',
    'AI operating system',
    'autonomous monitoring',
    'data intelligence',
  ],
  authors: [{ name: 'SheetFlow AI' }],
  creator: 'SheetFlow AI',
  publisher: 'SheetFlow AI',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'SheetFlow AI — The intelligence layer your spreadsheets always deserved.',
    description:
      "Operational intelligence for the world's most important data — your spreadsheets.",
    url: SITE_URL,
    type: 'website',
    locale: 'en_US',
    siteName: 'SheetFlow AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SheetFlow AI — The intelligence layer your spreadsheets always deserved.',
    description: 'Operational intelligence for spreadsheets. Monitor, automate, signal — without lifting a finger.',
    creator: '@sheetflowai',
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
  name: 'SheetFlow AI',
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    'The operational intelligence layer for spreadsheets — watching, resolving, and signaling so the work happens before you have to ask.',
  sameAs: [],
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
