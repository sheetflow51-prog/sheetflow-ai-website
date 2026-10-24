import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, Plus } from 'lucide-react';

import { JsonLd } from '@/components/seo/JsonLd';
import { ServiceBreadcrumb } from '@/components/sections/ServiceBreadcrumb';
import { Button } from '@/components/ui/Button';
import { SectionHandoff } from '@/components/signature/SectionHandoff';
import { Brackets } from '@/components/signature/Brackets';
import { getService, services, type ServicePage } from '@/content/services';
import { serviceGraph } from '@/lib/structured-data';

/**
 * `/services/[slug]` — one page per catalogued service.
 *
 * ## Why these exist
 *
 * A single route caps topical authority: one page cannot be the best answer to
 * six different questions, and no amount of schema substitutes for pages that
 * cover a topic. Each of these is a genuine topic cluster — its own URL, its
 * own `Service` node, its own questions, and internal links in both directions.
 *
 * ## Statically generated, exhaustively
 *
 * `generateStaticParams` enumerates every slug and `dynamicParams = false`
 * turns anything else into a 404 rather than rendering an empty shell at
 * request time. The content is a compiled-in module, so there is nothing to
 * fetch and no reason for these to be dynamic.
 *
 * Visual language is the homepage's: existing tokens, existing components, no
 * new patterns. `EXPERIENCE_GOVERNANCE.md` and DEC-301/302 govern here too.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    // Overrides the layout's `canonical: '/'`. Without this every sub-page
    // would declare the homepage canonical and ask to be de-indexed in favour
    // of it — the single most damaging thing a sub-page can get wrong.
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: `/services/${service.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: service.metaTitle,
      description: service.metaDescription,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = service.related
    .map((s) => getService(s))
    .filter((s): s is ServicePage => Boolean(s));

  return (
    <>
      <JsonLd graph={serviceGraph(service)} />

      {/* pt for the fixed 64px nav. Homepage sections clear it via their own
          top padding; a page that starts with a breadcrumb has none to borrow. */}
      <section className="section pt-28 md:pt-36" aria-labelledby="service-heading">
        <div className="container-edge">
          <ServiceBreadcrumb
            trail={[
              { name: 'Home', href: '/' },
              { name: 'Services', href: '/services' },
              { name: service.shortLabel, href: `/services/${service.slug}` },
            ]}
          />

          {/* The signature L-corner motif, from the same component the hero and
              final CTA use. SHEETFLOW_VISUAL_DNA §10.2 reserves it for regions
              the brand wants remembered as a *frame* rather than a card, which
              is what a service page's opening statement is. Reused rather than
              re-drawn: aria-hidden, pointer-events-none, sub-1KB, and
              framer-motion is already in the bundle. */}
          <div className="relative max-w-4xl py-6">
            <Brackets inset={-8} size={22} />
            <span className="kicker">{service.kicker}</span>
            <h1
              id="service-heading"
              className="headline-cinematic text-fade text-balance mt-5"
            >
              {service.headline}
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-ink-200 text-pretty md:text-[19px]">
              {service.lede}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" href="/book">
                Book free audit
              </Button>
              {/* `/#how-it-works`, matching where the nav's "How we work"
                  goes. Both moved off `/#product` in RC5 when the section that
                  anchor named left the homepage narrative. An early version
                  pointed this same label at `/#faq`, so two controls with
                  identical text led to different places — hence the note. */}
              <Button variant="secondary" size="lg" href="/#how-it-works" trailing={false}>
                How we work
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SectionHandoff />

      {/* What this looks like today — observable symptoms, not claimed losses. */}
      <section className="section" aria-labelledby="symptoms-heading">
        <div className="container-edge">
          <h2 id="symptoms-heading" className="headline-section text-fade text-balance max-w-3xl">
            You already know the shape of this.
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {service.symptoms.map((symptom) => (
              <li key={symptom} className="card p-6">
                <p className="text-[15px] leading-relaxed text-ink-200 text-pretty">{symptom}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SectionHandoff />

      <section className="section" aria-labelledby="steps-heading">
        <div className="container-edge">
          <h2 id="steps-heading" className="headline-section text-fade text-balance max-w-3xl">
            What we build.
          </h2>
          <ol className="mt-12 flex flex-col divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {service.steps.map((step, i) => (
              <li key={step.title} className="grid gap-3 py-7 md:grid-cols-[4rem_1fr] md:gap-8">
                {/* /80, not /70. Composited on void, `accent-bright/70`
                    measures 4.27:1 — under the 4.5:1 AA floor — and axe
                    flagged it. /80 is 5.33:1 and is the opacity `.kicker`
                    already uses, so this stays inside the design system
                    rather than inventing a one-off value.

                    aria-hidden because the <ol> already conveys the order;
                    the numeral is a visual echo, not extra information. It
                    still has to pass contrast — it is visible text, and a
                    low-vision sighted reader is exactly who it is for. */}
                <span
                  className="font-mono text-[13px] text-accent-bright/80"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-[19px] font-semibold leading-snug text-white md:text-[21px]">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-200 text-pretty">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <SectionHandoff />

      <section className="section" aria-labelledby="integrations-heading">
        <div className="container-edge">
          <h2
            id="integrations-heading"
            className="headline-section text-fade text-balance max-w-3xl"
          >
            Built into the tools you already run.
          </h2>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-300 text-pretty">
            Everything is built inside your own accounts. If we stop working together, the
            systems keep running and you retain full access to them.
          </p>
          <ul className="mt-10 flex flex-wrap gap-2">
            {service.integrations.map((tool) => (
              <li
                key={tool}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13px] text-ink-200"
              >
                <Check className="h-3.5 w-3.5 text-accent-bright/80" strokeWidth={2.5} aria-hidden="true" />
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SectionHandoff />

      {/* Same native <details> pattern as the homepage FAQ, for the same
          reasons: the answers ship in the HTML whether or not the panel is
          open, so crawlers and LLM retrievers read them without interacting. */}
      <section id="faq" className="section" aria-labelledby="service-faq-heading">
        <div className="container-edge">
          <h2
            id="service-faq-heading"
            className="headline-section text-fade text-balance max-w-3xl"
          >
            {service.shortLabel}, specifically.
          </h2>
          <div className="mt-12 max-w-3xl divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {service.faqs.map((item) => (
              <details
                key={item.id}
                id={item.id}
                className="group py-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary
                  className="flex cursor-pointer list-none items-start justify-between gap-6 rounded-sm text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
                  data-cursor="hover"
                >
                  <h3 className="font-display text-[17px] font-semibold leading-snug text-white md:text-[19px]">
                    {item.question}
                  </h3>
                  <Plus
                    className="mt-1 h-4 w-4 shrink-0 text-ink-300 transition-transform duration-300 ease-cinematic group-open:rotate-45"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 max-w-2xl pr-10 text-[15px] leading-relaxed text-ink-200 text-pretty">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SectionHandoff />

      {/* Links in both directions are what make this a cluster rather than four
          orphan pages: siblings across, and the homepage back up. */}
      <section className="section" aria-labelledby="related-heading">
        <div className="container-edge">
          <h2 id="related-heading" className="headline-section text-fade text-balance max-w-3xl">
            Usually built alongside.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/services/${r.slug}`}
                className="card-interactive group flex flex-col gap-3 p-7"
                data-cursor="hover"
              >
                <span className="text-[11px] font-medium uppercase tracking-widest text-accent-bright/80">
                  {r.kicker}
                </span>
                <h3 className="font-display text-[21px] font-semibold leading-snug text-white">
                  {r.name}
                </h3>
                <p className="text-[15px] leading-relaxed text-ink-300 text-pretty">
                  {r.metaDescription}
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

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" href="/book">
              Book free audit
            </Button>
            <Link
              href="/services"
              className="inline-flex min-h-[24px] items-center text-[14px] text-ink-300 transition-colors hover:text-white"
              data-cursor="hover"
            >
              All services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
