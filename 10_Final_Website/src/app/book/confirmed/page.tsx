import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Calendar, Mail, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { SectionHandoff } from '@/components/signature/SectionHandoff';
import { StripQueryString } from '@/components/booking/StripQueryString';
import { WHATSAPP_URL } from '@/lib/contact';

/**
 * `/book/confirmed` — the post-booking page.
 *
 * ## This page is not wired up yet, and that is a founder action
 *
 * Note (2026-11-16): Cal.com's free plan has no custom redirect after booking
 * (founder-reported), so today Cal.com bookers see Cal.com's own confirmation
 * and do not reach this page. The text below applies if that changes.
 *
 * The booking page can redirect a booker here, but the redirect is configured
 * **in the scheduler's dashboard**, not from this codebase, and setting it
 * before this branch is deployed would send real bookers to a page that does
 * not exist yet. To turn it on, after deploy and once `CAL_BOOKING_URL` points
 * at the Cal.com event:
 *
 *   Cal.com → the 20-minute event → Redirect on booking →
 *   https://sheetflow.click/book/confirmed, with "Forward parameters" OFF
 *
 * Forwarding must stay off because it appends the booker's name, email and the
 * booking uid to this URL. The uid is enough to cancel or reschedule the
 * booking, and anything in a query string ends up in browser history, request
 * logs and analytics. `StripQueryString` below removes it from the address bar
 * in case the setting is ever turned back on, and our analytics drops query
 * strings before sending anything (`SiteAnalytics`), but neither can reach the
 * request log of the page load itself, so turning it off is the real fix.
 *
 * Until then the page is reachable but unlinked, and the scheduler shows its
 * own confirmation. Nothing is broken by leaving it off. The copy names no
 * scheduler, because the booking, the calendar invite and the confirmation
 * email come from whichever one the visitor used (Cal.com, or Calendly while
 * the D46 fallback is in use).
 *
 * ## Why it is noindex
 *
 * A confirmation page has no search intent behind it, and indexing one means
 * people arrive at "You're booked" without having booked. It is excluded from
 * the sitemap for the same reason.
 */

export const metadata: Metadata = {
  title: 'Your session is booked',
  description:
    'Your free 20-minute discovery & help session is confirmed. The calendar invite and Google Meet link are in your inbox.',
  alternates: { canonical: '/book/confirmed' },
  robots: { index: false, follow: true },
};

const NEXT = [
  {
    icon: Mail,
    title: 'Check your inbox',
    detail:
      'The confirmation email and calendar invite, with the Google Meet link, are in your inbox. If they have not arrived in a few minutes, look in spam before rebooking.',
  },
  {
    icon: Calendar,
    title: 'Nothing to prepare',
    detail:
      'The answers you gave travel with the booking, so we already have the shape of it. No tech knowledge needed. If you want to bring anything, rough numbers help most, such as enquiries per week or hours spent on manual work.',
  },
  {
    icon: MessageCircle,
    title: 'Need to change it?',
    detail:
      'The reschedule and cancel links are in the confirmation email. Use those rather than rebooking, so the old slot is released.',
  },
];

export default function BookingConfirmedPage() {
  return (
    <>
      <StripQueryString />
      <section className="section pt-28 md:pt-36" aria-labelledby="confirmed-heading">
        <div className="container-edge">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-bright/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent-bright">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
              Confirmed
            </span>
            <h1 id="confirmed-heading" className="headline-cinematic text-fade text-balance mt-6">
              You are booked.
            </h1>
            <p className="mt-7 text-[17px] leading-relaxed text-ink-200 text-pretty md:text-[19px]">
              The invite is in your inbox with the meeting link. We&rsquo;ll work through it
              together. See you then.
            </p>
          </div>

          <ul className="mt-16 grid gap-4 md:grid-cols-3">
            {NEXT.map(({ icon: Icon, title, detail }) => (
              <li key={title} className="flex flex-col gap-4 rounded-2xl glass p-7">
                <Icon
                  className="h-5 w-5 text-accent-bright/80"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <h2 className="font-display text-[18px] font-semibold leading-snug text-white">
                  {title}
                </h2>
                <p className="text-[14px] leading-relaxed text-ink-200 text-pretty">{detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SectionHandoff />

      <section className="section" aria-labelledby="confirmed-next-heading">
        <div className="container-edge">
          <h2
            id="confirmed-next-heading"
            className="headline-section text-fade text-balance max-w-3xl"
          >
            While you wait.
          </h2>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-300 text-pretty">
            Have a look at what we have built for businesses like yours, or what the work
            typically costs.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button variant="secondary" href="/work">
              See our work
            </Button>
            <Link
              href="/pricing"
              className="inline-flex min-h-[24px] items-center text-[14px] text-ink-300 transition-colors hover:text-white"
              data-cursor="hover"
            >
              See pricing
            </Link>
            <a
              href={WHATSAPP_URL}
              className="inline-flex min-h-[24px] items-center text-[14px] text-ink-300 transition-colors hover:text-white"
              data-cursor="hover"
            >
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
