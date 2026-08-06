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
import { BOOKING_URL, WHATSAPP_NUMBER } from '@/lib/contact';
import { faqs } from '@/content/faq';

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

const organizationJsonLd = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'SheetFlow AI',
  url: SITE_URL,
  // Square 512 cut of the canonical render. Google's structured-data guidance
  // expects a logo it can crop predictably; the raw 248x252 source was neither
  // square nor large enough.
  logo: `${SITE_URL}/brand/raster/lockup-512.png`,
  description:
    'AI automation agency for growing businesses — lead capture, WhatsApp follow-ups, appointment booking, CRM and reporting automation.',
  sameAs: [
    'https://x.com/sheetflow51',
    'https://www.instagram.com/sheetflow51',
    'https://www.linkedin.com/in/sheet-flow-1173563a7',
    'https://github.com/sheetflow51-prog',
  ],
  /**
   * NOT typed as `LocalBusiness`. That subtype requires a `PostalAddress`, and
   * SheetFlow publishes no street address or locality anywhere — inventing one
   * to satisfy a schema would be fabricated business information, which both
   * this project's first standing rule and Google's own structured-data policy
   * forbid. `Organization` is the accurate type for a remote service business.
   * Revisit only if a real registered address is provided.
   */
  telephone: `+${WHATSAPP_NUMBER}`,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: `+${WHATSAPP_NUMBER}`,
      url: BOOKING_URL,
      availableLanguage: ['en', 'hi'],
    },
  ],
  /**
   * GEO signal. `knowsAbout` is how an assistant answering "who does WhatsApp
   * automation for clinics" decides whether this entity is relevant, and it is
   * read directly rather than inferred from prose. Every entry below maps to a
   * service the site actually sells (see `hasOfferCatalog`) or a tool named in
   * the integrations section — nothing aspirational, or it becomes a claim.
   */
  knowsAbout: [
    'Business process automation',
    'AI workflow automation',
    'Lead capture automation',
    'WhatsApp Business API automation',
    'Appointment booking automation',
    'CRM automation',
    'Automated business reporting',
    'Invoice reminder automation',
    'n8n workflow orchestration',
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
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'SheetFlow AI',
  url: SITE_URL,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en',
};

/**
 * FAQPage — built from the same `faqs` array the visible section renders.
 *
 * Google's structured-data guidance requires FAQPage markup to match on-page
 * content; markup that answers questions the page does not is treated as spam.
 * Deriving both from one source makes that class of mismatch impossible.
 *
 * This is also the page's primary answer-engine surface: AI Overviews,
 * Perplexity and ChatGPT browsing quote question/answer pairs far more readily
 * than prose, and they quote them verbatim — which is why every answer in
 * content/faq.ts is restricted to claims the product can back.
 */
const faqJsonLd = {
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/#faq`,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    '@id': `${SITE_URL}/#${f.id}`,
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

/**
 * WebPage — ties the homepage to the organisation and names the entity the
 * page is about. Retrieval systems resolve entities before they resolve
 * keywords, so stating the subject explicitly is worth more than any phrasing
 * change in the copy.
 */
const webPageJsonLd = {
  '@type': 'WebPage',
  '@id': `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: 'SheetFlow AI — AI automation agency for growing businesses.',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
  primaryImageOfPage: `${SITE_URL}/brand/raster/lockup-512.png`,
  inLanguage: 'en',
};

/** The complete entity graph for the homepage, emitted as one script. */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [organizationJsonLd, websiteJsonLd, webPageJsonLd, faqJsonLd],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable}`}>
      <body className="relative bg-void font-sans text-white antialiased">
        {/* One linked @graph rather than four loose blocks. Every node carries
            an @id and references the others, so a consumer resolves the whole
            entity set — organisation, site, page, questions — in a single pass
            instead of guessing how separate blocks relate. */}
        {/* `react/no-danger` is not enabled in eslint.config.mjs, so a disable
            directive here is inert and ESLint reports it as unused. The content
            is JSON.stringify of a local literal — no external input reaches it. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
