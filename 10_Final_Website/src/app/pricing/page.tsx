import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Minus } from 'lucide-react';

import { JsonLd } from '@/components/seo/JsonLd';
import { ServiceBreadcrumb } from '@/components/sections/ServiceBreadcrumb';
import { Button } from '@/components/ui/Button';
import { SectionHandoff } from '@/components/signature/SectionHandoff';
import { RecoveryCalculator } from '@/components/pricing/RecoveryCalculator';
import {
  tiers,
  comparison,
  pricingFaqs,
  engagementSteps,
  scopeDrivers,
  CUSTOM_SCOPE_LABEL,
} from '@/content/pricing';
import { pricingGraph } from '@/lib/structured-data';
import { tierBookingUrl } from '@/lib/booking';
import { WHATSAPP_URL } from '@/lib/contact';

/**
 * `/pricing`.
 *
 * ## Why there are no numbers on this page
 *
 * D38 (2026-10-23) withdrew the D25 prices on the founder's instruction. Each
 * tier is an engagement shape, quoted in writing after the audit call. So the
 * missing number reads as "scoped" rather than "hidden", the page publishes
 * what the audit measures (`scopeDrivers`) and how an engagement runs
 * (`engagementSteps`).
 *
 * ## What this page refuses to do
 *
 * No price, range or anchor, no countdown, no "most popular" badge on a tier
 * nobody has bought, no production delivery timeline, and no ROI promise. The
 * one fixed time is the sprint's 48–72 hour time-box, authorised in D38.
 *
 * ## Every tier books directly
 *
 * Each card's primary CTA is a plain link to the Calendly audit event carrying
 * the tier (`tierBookingUrl`), so the call starts knowing what was being
 * considered. The secondary link keeps the qualification form at `/book` for
 * anyone who wants to share details first.
 *
 * The `featured` tier is marked as the one **we recommend**, not as the one
 * most customers choose — the second is a sales statistic nobody here has.
 */

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'SheetFlow engagements: a Foundation Audit & Rapid Sprint, an Autonomous Operations Engine, and Enterprise Bespoke Infrastructure. Each is scoped and quoted in writing after a free 30-minute automation audit.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing · SheetFlow AI',
    description:
      'Three engagements, each scoped and quoted in writing after a free 30-minute automation audit. No price list invented before we have seen your systems.',
    url: '/pricing',
    type: 'website',
  },
};

/**
 * Enterprise scope points.
 *
 * Every line describes **what is scoped**. The service-level agreement is the
 * one D38 added on the founder's authority, and it is stated as a contract term
 * — its response times are agreed per engagement, so none is printed here.
 * "Priority support" and "dedicated success manager" stay absent: inventing a
 * support tier to make the section look substantial is the same class of
 * fabrication as inventing a metric.
 */
const ENTERPRISE_POINTS = [
  'Each location keeps its own calendar, numbers and intake',
  'Enquiries route to the team that owns them, not to a shared inbox',
  'Reporting rolls up across locations and breaks down by each',
  'Integrations built against any API or webhook in your stack',
  'Service levels written into the contract, then reviewed on a schedule',
  'Scope agreed in writing before any build starts',
];

const enterpriseTier = tiers.find((t) => t.id === 'enterprise') ?? tiers[tiers.length - 1];

/** Availability marker for the comparison grid. */
function Availability({ included, capability, tier }: { included: boolean; capability: string; tier: string }) {
  return included ? (
    <>
      <Check
        className="mx-auto h-4 w-4 text-accent-bright"
        strokeWidth={2.6}
        aria-hidden="true"
      />
      {/* The icon is the only thing a sighted user needs; a screen reader gets
          the full statement, because "check" in a grid cell means nothing when
          the row and column headers are read separately from it. */}
      <span className="sr-only">{`${capability}: included in ${tier}`}</span>
    </>
  ) : (
    <>
      <Minus className="mx-auto h-4 w-4 text-ink-400/50" strokeWidth={2} aria-hidden="true" />
      <span className="sr-only">{`${capability}: not included in ${tier}`}</span>
    </>
  );
}

export default function PricingPage() {
  return (
    <>
      <JsonLd graph={pricingGraph()} />

      {/* ---------------------------------------------------------- Header */}
      <section className="section pt-28 md:pt-36" aria-labelledby="pricing-heading">
        <div className="container-edge">
          <ServiceBreadcrumb
            trail={[
              { name: 'Home', href: '/' },
              { name: 'Pricing', href: '/pricing' },
            ]}
          />

          <div className="max-w-4xl">
            <span className="kicker">Pricing</span>
            <h1 id="pricing-heading" className="headline-cinematic text-fade text-balance mt-5">
              Scoped to your systems, not to a price list.
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-ink-200 text-pretty md:text-[19px]">
              Every business we automate runs a different stack, so we quote the work after we
              have seen it. What does not change is published here: what each engagement
              includes, where it stops, and how it is quoted.
            </p>
          </div>

          {/* ------------------------------------------------------- Tiers */}
          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {tiers.map((tier) => {
              return (
                <section
                  key={tier.id}
                  id={tier.id}
                  aria-labelledby={`tier-${tier.id}`}
                  className={[
                    'relative flex scroll-mt-28 flex-col gap-6 rounded-2xl p-7 md:p-8',
                    tier.featured
                      ? 'glass-strong border border-accent-bright/25'
                      : 'glass border border-white/[0.06]',
                  ].join(' ')}
                >
                  {tier.featured && (
                    <span className="absolute -top-3 left-7 rounded-full border border-accent-bright/30 bg-void px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent-bright">
                      What we usually recommend
                    </span>
                  )}

                  <div>
                    <h2
                      id={`tier-${tier.id}`}
                      className="font-display text-[24px] font-semibold text-white"
                    >
                      {tier.name}
                    </h2>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-300 text-pretty">
                      {tier.audience}
                    </p>
                  </div>

                  <div className="border-y border-white/[0.06] py-6">
                    <div className="font-display text-[24px] font-semibold leading-tight text-white">
                      {tier.engagement.model}
                    </div>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-ink-400">
                      {tier.engagement.quote}
                    </p>
                  </div>

                  <p className="text-[15px] leading-relaxed text-ink-200 text-pretty">
                    {tier.summary}
                  </p>

                  <ul className="flex flex-col gap-3">
                    {tier.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check
                          className="mt-1 h-3.5 w-3.5 shrink-0 text-accent-bright/80"
                          strokeWidth={2.6}
                          aria-hidden="true"
                        />
                        <span className="text-[14px] leading-relaxed text-ink-100">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* The limit is stated on the card, not hidden in a footnote.
                      A tier that does not say what it excludes sells the
                      objection to the sales call instead of answering it. */}
                  <p className="mt-auto border-t border-white/[0.06] pt-5 text-[12px] leading-relaxed text-ink-300">
                    <span className="text-white/70">Where it stops: </span>
                    {tier.limit}
                  </p>

                  <div className="flex flex-col gap-3">
                    <Button
                      variant={tier.featured ? 'primary' : 'secondary'}
                      href={tierBookingUrl(tier)}
                      className="w-full justify-center"
                    >
                      {tier.cta}
                    </Button>
                    <Link
                      href="/book"
                      className="inline-flex min-h-[24px] items-center justify-center text-[13px] text-ink-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
                      data-cursor="hover"
                    >
                      {CUSTOM_SCOPE_LABEL}
                    </Link>
                  </div>
                </section>
              );
            })}
          </div>

          <p className="mt-10 max-w-3xl border-l border-white/[0.08] pl-5 text-[13px] leading-relaxed text-ink-300">
            Every engagement is quoted in writing after the free audit call, in Indian rupees and
            excluding tax, never from a price list. We publish no return figure and no timeline
            for production builds, because neither has been measured across enough projects to
            state honestly. The one fixed time on this page is the sprint&rsquo;s 48&ndash;72 hour
            time-box, a limit we set on our own work once scope and access are agreed. Usage
            charges &mdash; WhatsApp message fees from Meta, AI model usage, hosting &mdash; are
            billed by those providers to your own accounts, never through us.
          </p>
        </div>
      </section>

      <SectionHandoff />

      {/* ----------------------------------------------- How it is scoped */}
      <section className="section" aria-labelledby="scope-heading">
        <div className="container-edge">
          <span className="kicker">How it is scoped</span>
          <h2 id="scope-heading" className="headline-section text-fade text-balance mt-5 max-w-3xl">
            Four steps, and a decision of yours at each.
          </h2>

          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {engagementSteps.map((step, i) => (
              <li
                key={step.id}
                className="glass flex flex-col gap-3 rounded-2xl border border-white/[0.06] p-6"
              >
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-400">
                  {`Step ${i + 1}`}
                </span>
                <h3 className="font-display text-[19px] font-semibold text-white">{step.name}</h3>
                <p className="text-[14px] leading-relaxed text-ink-200 text-pretty">{step.detail}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 max-w-3xl">
            <h3 className="font-display text-[19px] font-semibold text-white">
              What the audit measures to set the quote
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {scopeDrivers.map((driver) => (
                <li key={driver} className="flex items-start gap-2.5">
                  <Check
                    className="mt-1 h-3.5 w-3.5 shrink-0 text-accent-bright/80"
                    strokeWidth={2.6}
                    aria-hidden="true"
                  />
                  <span className="text-[15px] leading-relaxed text-ink-100">{driver}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <SectionHandoff />

      {/* ------------------------------------------------------ Comparison */}
      <section className="section" aria-labelledby="compare-heading">
        <div className="container-edge">
          <span className="kicker">Compare</span>
          <h2 id="compare-heading" className="headline-section text-fade text-balance mt-5 max-w-3xl">
            What is in each one.
          </h2>

          {/* Horizontal scroll is contained here rather than on the body: a
              table that cannot fit a 360px viewport must scroll itself.

              `tabIndex={0}` is required, not decorative. A container that
              scrolls but cannot receive focus is unreachable by keyboard —
              axe flags it `scrollable-region-focusable` (serious, WCAG 2.1.1),
              and it failed exactly that way on the mobile profile where the
              table actually overflows. Focusable alone would announce as an
              unnamed group, so it is also a named region. */}
          <div
            className="mt-12 -mx-6 overflow-x-auto px-6 md:mx-0 md:px-0"
            tabIndex={0}
            role="region"
            aria-labelledby="compare-heading"
          >
            <table className="w-full min-w-[640px] border-collapse text-left">
              <caption className="sr-only">
                Capabilities included in each SheetFlow pricing tier
              </caption>
              <thead>
                <tr className="border-b border-white/[0.1]">
                  <th scope="col" className="py-4 pr-4 text-[13px] font-medium text-ink-300">
                    Capability
                  </th>
                  {tiers.map((tier) => (
                    <th
                      key={tier.id}
                      scope="col"
                      className="w-[140px] px-3 py-4 text-center font-display text-[15px] font-semibold text-white"
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.capability} className="border-b border-white/[0.05]">
                    <th
                      scope="row"
                      className="py-4 pr-4 text-[14px] font-normal leading-relaxed text-ink-100"
                    >
                      {row.capability}
                    </th>
                    {tiers.map((tier) => (
                      <td key={tier.id} className="px-3 py-4 text-center">
                        <Availability
                          included={row.availability[tier.id] ?? false}
                          capability={row.capability}
                          tier={tier.name}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SectionHandoff />

      {/* ------------------------------------------------------ Calculator */}
      <section className="section" aria-labelledby="calculator-heading">
        <div className="container-edge">
          <span className="kicker">Your numbers</span>
          <h2
            id="calculator-heading"
            className="headline-section text-fade text-balance mt-5 max-w-3xl"
          >
            What late replies are costing you.
          </h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink-300 text-pretty">
            Every figure below is yours, including the recovery rate. We have not published a
            recovery figure of our own, because none has been measured — so this multiplies your
            estimates rather than asserting ours.
          </p>

          <div className="mt-12">
            <RecoveryCalculator />
          </div>
        </div>
      </section>

      <SectionHandoff />

      {/* ------------------------------------------------------ Enterprise */}
      <section className="section" aria-labelledby="enterprise-heading">
        <div className="container-edge">
          <div className="relative overflow-hidden rounded-2xl glass-strong p-8 md:p-14">
            {/* Decorative only; the section reads correctly without it. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_15%_0%,rgb(var(--color-accent) / 0.14),transparent_65%)]"
            />

            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
              <div>
                <span className="kicker">Enterprise &amp; multi-location</span>
                <h2
                  id="enterprise-heading"
                  className="headline-section text-fade text-balance mt-5"
                >
                  More than one location, one team, or one system.
                </h2>
                <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-200 text-pretty">
                  Branches with their own calendars, enquiries that must route to the right team,
                  a stack with something in it nobody else integrates. Pricing these from a page
                  would be a number invented to fill a column.
                </p>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-300 text-pretty">
                  The audit is the same 30 minutes. What changes is that we map every location and
                  system before quoting, and you get the scope in writing.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="lg" href={tierBookingUrl(enterpriseTier)}>
                    Book automation audit
                  </Button>
                  <a
                    href={WHATSAPP_URL}
                    className="inline-flex min-h-[24px] items-center text-[14px] text-ink-300 transition-colors hover:text-white"
                    data-cursor="hover"
                  >
                    Or message on WhatsApp
                  </a>
                </div>
              </div>

              <ul className="flex flex-col gap-4 border-t border-white/[0.08] pt-8 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
                {ENTERPRISE_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-accent-bright/80"
                      strokeWidth={2.6}
                      aria-hidden="true"
                    />
                    <span className="text-[15px] leading-relaxed text-ink-100 text-pretty">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <SectionHandoff />

      {/* ------------------------------------------------------------ FAQs */}
      <section className="section" aria-labelledby="pricing-faq-heading">
        <div className="container-edge">
          <span className="kicker">Questions</span>
          <h2
            id="pricing-faq-heading"
            className="headline-section text-fade text-balance mt-5 max-w-3xl"
          >
            About pricing.
          </h2>

          <dl className="mt-12 max-w-3xl divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {pricingFaqs.map((f) => (
              <div key={f.id} id={f.id} className="scroll-mt-28 py-7">
                <dt className="font-display text-[19px] font-semibold leading-snug text-white text-balance">
                  {f.question}
                </dt>
                <dd className="mt-3 text-[15px] leading-relaxed text-ink-200 text-pretty">
                  {f.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <SectionHandoff />

      {/* ------------------------------------------------------------- CTA */}
      <section className="section" aria-labelledby="pricing-cta-heading">
        <div className="container-edge">
          <h2
            id="pricing-cta-heading"
            className="headline-section text-fade text-balance max-w-3xl"
          >
            Find out what yours would take.
          </h2>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-300 text-pretty">
            Thirty minutes, no commitment. We map where your enquiries arrive, where they stall,
            and what is worth automating first — and you leave with the map either way.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" href="/book">
              Book free audit
            </Button>
            <Link
              href="/work"
              className="inline-flex min-h-[24px] items-center text-[14px] text-ink-300 transition-colors hover:text-white"
              data-cursor="hover"
            >
              See what we have built
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
