import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Video, IndianRupee, ShieldCheck } from 'lucide-react';

import { JsonLd } from '@/components/seo/JsonLd';
import { ServiceBreadcrumb } from '@/components/sections/ServiceBreadcrumb';
import { SectionHandoff } from '@/components/signature/SectionHandoff';
import { QualificationForm } from '@/components/booking/QualificationForm';
import { bookingGraph } from '@/lib/structured-data';
import { WHATSAPP_URL } from '@/lib/contact';

/**
 * `/book` — the conversion page.
 *
 * ## Why a page, when a Calendly link already existed
 *
 * Every CTA on the site used to jump straight to Calendly. That works, and it
 * throws away two things: the visitor arrives cold, so the call opens with
 * discovery questions they could have answered in ten seconds; and the funnel
 * has no observable step on our side, so "how many people who intended to book
 * actually did" was unmeasurable.
 *
 * This page adds one qualification step and keeps the hand-off. It costs a
 * click and buys context on every call plus a measurable conversion point.
 *
 * ## What it deliberately does not do
 *
 * No Calendly embed script (see `lib/booking.ts`), no chat widget, no exit
 * popup, no countdown. The page's job is to remove friction from booking, and
 * every one of those adds some.
 *
 * The facts in the strip below — 30 minutes, Google Meet, free, no commitment —
 * are read from the live Calendly event type, not asserted. Verified against
 * the API on 2026-08-07.
 */

export const metadata: Metadata = {
  title: 'Book a free automation audit',
  description:
    'Book a free 30-minute automation audit. We map where your enquiries arrive, where they stall, and which steps are worth automating first — and you leave with the map either way.',
  alternates: { canonical: '/book' },
  openGraph: {
    title: 'Book a free automation audit · SheetFlow AI',
    description:
      'A free 30-minute call. We map where your enquiries arrive, where they stall, and what is worth automating first. No commitment.',
    url: '/book',
    type: 'website',
  },
};

const FACTS = [
  { icon: Clock, label: '30 minutes' },
  { icon: Video, label: 'Google Meet' },
  { icon: IndianRupee, label: 'Free' },
  { icon: ShieldCheck, label: 'No commitment' },
];

const EXPECT = [
  {
    title: 'Where your enquiries actually arrive',
    detail:
      'Every channel a lead can reach you on, mapped in one place — including the ones nobody is watching.',
  },
  {
    title: 'Where they stall',
    detail:
      'The specific points where a lead waits: the unread form, the message answered tomorrow, the follow-up that never went.',
  },
  {
    title: 'What is worth automating first',
    detail:
      'Ranked by what it costs you now, not by what is most impressive to build. Sometimes the answer is one alert.',
  },
  {
    title: 'The map, whether or not you hire us',
    detail:
      'You leave with the same document either way. If automation is not the answer for you, we will say so on the call.',
  },
];

export default function BookPage() {
  return (
    <>
      <JsonLd graph={bookingGraph()} />

      <section className="section pt-28 md:pt-36" aria-labelledby="book-heading">
        <div className="container-edge">
          <ServiceBreadcrumb
            trail={[
              { name: 'Home', href: '/' },
              { name: 'Book an audit', href: '/book' },
            ]}
          />

          <div className="max-w-4xl">
            <span className="kicker">Free automation audit</span>
            <h1 id="book-heading" className="headline-cinematic text-fade text-balance mt-5">
              Thirty minutes. Then you know.
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-ink-200 text-pretty md:text-[19px]">
              We map where enquiries reach you, where they go cold, and what is worth automating
              first. Answer four questions below and pick a time — the call starts with your
              situation instead of with introductions.
            </p>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {FACTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-[13px] text-ink-200">
                <Icon
                  className="h-4 w-4 text-accent-bright/80"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-14">
            <QualificationForm />
          </div>

          <p className="mt-6 text-[13px] leading-relaxed text-ink-300">
            Prefer to message first?{' '}
            <a
              href={WHATSAPP_URL}
              className="text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white"
              data-cursor="hover"
            >
              Ask on WhatsApp
            </a>{' '}
            — same person, no form.
          </p>
        </div>
      </section>

      <SectionHandoff />

      <section className="section" aria-labelledby="expect-heading">
        <div className="container-edge">
          <span className="kicker">On the call</span>
          <h2 id="expect-heading" className="headline-section text-fade text-balance mt-5 max-w-3xl">
            What you walk away with.
          </h2>

          <ol className="mt-12 grid gap-4 md:grid-cols-2">
            {EXPECT.map((item, i) => (
              <li key={item.title} className="flex flex-col gap-3 rounded-2xl glass p-7">
                <span
                  className="font-mono text-[11px] font-medium tracking-widest text-accent-bright/80"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-[19px] font-semibold leading-snug text-white text-balance">
                  {item.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-ink-200 text-pretty">
                  {item.detail}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-12 max-w-2xl border-l border-white/[0.08] pl-5 text-[13px] leading-relaxed text-ink-300">
            It is not a sales pitch with a diagram at the end. If your enquiry volume does not
            justify the work, that is a useful answer and you will get it on the call — see{' '}
            <Link
              href="/pricing"
              className="text-white/80 underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-white"
              data-cursor="hover"
            >
              how engagements are scoped
            </Link>{' '}
            before you book if that helps you decide.
          </p>
        </div>
      </section>
    </>
  );
}
