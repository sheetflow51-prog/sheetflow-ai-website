import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { JsonLd } from '@/components/seo/JsonLd';
import { ServiceBreadcrumb } from '@/components/sections/ServiceBreadcrumb';
import { Button } from '@/components/ui/Button';
import { SectionHandoff } from '@/components/signature/SectionHandoff';
import { services } from '@/content/services';
import { servicesIndexGraph } from '@/lib/structured-data';

/**
 * `/services` — the index.
 *
 * This page earns its place twice. It is the hub the four service pages link
 * back to, and it is the intermediate crumb that makes `BreadcrumbList` honest:
 * `Home › Services › WhatsApp Automation` names three pages that all exist.
 * Without it the trail would have a hole in the middle, which is worse than no
 * breadcrumb at all.
 */

export const metadata: Metadata = {
  title: 'AI automation services',
  description:
    'Lead capture, WhatsApp follow-ups, appointment booking and CRM automation — built inside the tools your business already runs, and owned by you.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'AI automation services · SheetFlow AI',
    description:
      'Lead capture, WhatsApp follow-ups, appointment booking and CRM automation — built inside the tools your business already runs.',
    url: '/services',
    type: 'website',
  },
};

export default function ServicesIndexPage() {
  return (
    <>
      <JsonLd graph={servicesIndexGraph()} />

      <section className="section pt-28 md:pt-36" aria-labelledby="services-heading">
        <div className="container-edge">
          <ServiceBreadcrumb
            trail={[
              { name: 'Home', href: '/' },
              { name: 'Services', href: '/services' },
            ]}
          />

          <div className="max-w-4xl">
            <span className="kicker">Services</span>
            <h1 id="services-heading" className="headline-cinematic text-fade text-balance mt-5">
              The busywork, handed over.
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-ink-200 text-pretty md:text-[19px]">
              Each of these is a system built inside the accounts you already own — your CRM,
              your calendar, your messaging tools. They are usually built together, and each
              one works on its own.
            </p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="card-interactive group flex flex-col gap-3 p-7"
                data-cursor="hover"
              >
                <span className="text-[11px] font-medium uppercase tracking-widest text-accent-bright/80">
                  {s.kicker}
                </span>
                <h2 className="font-display text-[22px] font-semibold leading-snug text-white">
                  {s.name}
                </h2>
                <p className="text-[15px] leading-relaxed text-ink-300 text-pretty">
                  {s.metaDescription}
                </p>
                <span className="mt-2 inline-flex items-center gap-2 text-[13px] text-white/80">
                  Read more
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 ease-cinematic group-hover:translate-x-1"
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SectionHandoff />

      <section className="section" aria-labelledby="services-cta-heading">
        <div className="container-edge">
          <h2
            id="services-cta-heading"
            className="headline-section text-fade text-balance max-w-3xl"
          >
            Not sure which one you need?
          </h2>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-300 text-pretty">
            That is what the free 20-minute session is for. Just connect with us: you do not need
            to know the tech. You tell us where work gets stuck, we map it out together, and you
            leave with a clear next step whether or not you work with us. No commitment.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" href="/book">
              Book your free 20-minute session
            </Button>
            <Link
              href="/#faq"
              className="inline-flex min-h-[24px] items-center text-[14px] text-ink-300 transition-colors hover:text-white"
              data-cursor="hover"
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
