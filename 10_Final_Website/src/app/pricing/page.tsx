import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Minus } from 'lucide-react';

import { JsonLd } from '@/components/seo/JsonLd';
import { ServiceBreadcrumb } from '@/components/sections/ServiceBreadcrumb';
import { Button } from '@/components/ui/Button';
import { SectionHandoff } from '@/components/signature/SectionHandoff';
import { RecoveryCalculator } from '@/components/pricing/RecoveryCalculator';
import { tiers, comparison, pricingFaqs, formatPrice } from '@/content/pricing';
import { pricingGraph } from '@/lib/structured-data';

/**
 * `/pricing`.
 *
 * ## Why there are numbers on this page at all
 *
 * Published under founder authorisation on 2026-08-07 (D25). ₹19,999 and
 * ₹4,999/month are the figures already quoted to prospects in the outreach
 * scripts — publishing them is disclosure, not a new commitment.
 *
 * ## What this page refuses to do
 *
 * No struck-through anchor price, no countdown, no "most popular" badge on a
 * tier nobody has bought, no delivery timeline, and no ROI promise. Each of
 * those is a claim about something unmeasured, and the site's whole proof
 * architecture exists to stop exactly that.
 *
 * The `featured` tier is marked as the one **we recommend**, not as the one
 * most customers choose — the second is a sales statistic nobody here has.
 */

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'SheetFlow pricing: a production site with lead capture from ₹19,999 one-time, ongoing AI automation from ₹4,999 per month, and scoped bespoke engagements. No delivery-timeline or ROI promises we have not measured.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing · SheetFlow AI',
    description:
      'A production site with lead capture from ₹19,999 one-time. Ongoing AI automation from ₹4,999 per month. Bespoke engagements scoped on a call.',
    url: '/pricing',
    type: 'website',
  },
};

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
              What it costs, before you call.
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-ink-200 text-pretty md:text-[19px]">
              Most agencies make you book a call to hear a number. Here it is up front, so you
              can decide whether the conversation is worth your time.
            </p>
          </div>

          {/* ------------------------------------------------------- Tiers */}
          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {tiers.map((tier) => {
              const price = formatPrice(tier.price);
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
                    <div className="font-display text-[32px] font-semibold leading-none text-white">
                      {price.lead}
                    </div>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-ink-400">
                      {price.note}
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

                  <Button
                    variant={tier.featured ? 'primary' : 'secondary'}
                    href={tier.cta.href}
                    className="w-full justify-center"
                  >
                    {tier.cta.label}
                  </Button>
                </section>
              );
            })}
          </div>

          <p className="mt-10 max-w-3xl border-l border-white/[0.08] pl-5 text-[13px] leading-relaxed text-ink-300">
            Prices are in Indian rupees and exclude tax. Foundation starts at ₹19,999 — scope
            moves it. We publish no delivery timeline and no return figure, because neither has
            been measured across enough projects to state honestly; you get both, specific to
            your business, on the audit call.
          </p>
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
            Find out what yours would cost.
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
