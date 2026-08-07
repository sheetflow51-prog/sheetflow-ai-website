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

/**
 * Three weights, not six.
 *
 * The original six (300–800) were declared before anything used them. Audited
 * 2026-08-07 across `src`: `font-light` (300), `font-bold` (700) and
 * `font-extrabold` (800) have **zero** usages — no Tailwind utility, no
 * arbitrary `font-[700]`, no raw declaration. The only `fontWeight: 700` in the
 * codebase is inside the OG image routes, which render through Satori with
 * `fontFamily: 'sans-serif'` and never touch this font.
 *
 * Headlines are unaffected either way: `.headline-*` uses `--font-display`
 * (Fraunces), not this.
 *
 * **This is hygiene, not a performance win, and the difference was measured.**
 * The change was made expecting a smaller font payload — each declared weight
 * looked like another woff2 on the critical path. The build says otherwise:
 * 607,148 bytes across 19 files, 4 preloaded totalling 228,864 bytes, **byte
 * for byte identical before and after**. Inter is a variable font on Google
 * Fonts, so `next/font` emits one file per *subset*, not per weight; the weight
 * array never affected what shipped.
 *
 * Kept anyway, because declaring three weights that exist beats declaring six
 * where half are fiction. But do not cite it as an optimisation — it moved
 * nothing, and the real shared cost turned out to be `LoadingScreen`.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600'],
});

// A distinct editorial serif for headlines — separates "display" from "sans"
// (both were Inter before) and reads closer to a premium studio brand than a SaaS dashboard.
/**
 * Roman only — and unlike the weight trim above, this one is worth 81.7 kB.
 *
 * `style: ['normal', 'italic']` was declared here; italic is rendered **nowhere**
 * in the codebase. Audited 2026-08-07 across `src`: the only occurrence of the
 * string "italic" was this line. No `italic` Tailwind utility, no `font-style`
 * declaration, no `<em>` styled to the display face.
 *
 * **Styles are not weights, and the distinction is the whole point.** The note
 * on Inter above records that trimming *weights* changed nothing, because
 * `next/font` emits one file per **subset**. That is true and still true — but
 * it does not generalise to styles. A style is a separate `@font-face` with a
 * separate `src`, so declaring italic emitted a second Fraunces file and, being
 * a layout-declared font, Next **preloaded** it.
 *
 * Measured in the build before this change: `8010b10db0d5feb2` — `font-family:
 * Fraunces; font-style: italic` — was **81,704 bytes and `rel="preload"`**, the
 * largest of the four preloaded fonts and 36% of the 228,864-byte preloaded
 * font payload. On the Lighthouse mobile profile (1.6 Mbps) that is ~0.4 s of
 * critical-path transfer spent on a face nothing on the site can render.
 *
 * Restoring italic is one line, and costs that 81.7 kB back.
 */
const display = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: 'variable',
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
