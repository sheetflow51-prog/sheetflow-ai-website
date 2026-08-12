import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Chapter } from '@/components/vos';
import { beat } from '@/content/narrative';
import { publishedCaseStudies } from '@/content/proof';
import type { CaseStudyCard } from '@/content/work';

/**
 * The homepage work section — chapter 04, the *Proof* beat.
 *
 * ## Why this is no longer a client component
 *
 * It was `'use client'` for one reason: `ScrollReveal`, an
 * IntersectionObserver-driven entrance stagger on the card grid. RC5 replaced
 * it with `.reveal-view`, which is the same gesture in CSS behind
 * `@supports (animation-timeline: view())`, with no observer and no hydration.
 *
 * The stagger is expressed as a per-card `animation-delay` rather than by
 * `ScrollReveal`'s children-mapping, which also fixes a subtlety the JS version
 * had: it revealed all three cards off a single observer on the *container*, so
 * on a narrow viewport where the cards stack, card three animated in while it
 * was still 900px below the fold.
 *
 * ## What changed, and the distinction that drives it
 *
 * This section used to render a placeholder reading "we publish results only
 * once we can prove them", because no customer evidence had been permissioned.
 * Publication permission arrived on 2026-08-07 (D24) — but **only for the work,
 * not for outcomes**. Those are two different claims and the section now treats
 * them as such:
 *
 *   - **The builds are shown.** Real clients, real screenshots, links to
 *     running deployments. A visitor can verify every one by clicking it.
 *   - **The metrics are still absent**, and the section still says so. No
 *     outcome has been measured against a stated method and confirmed with a
 *     client, so `publishedCaseStudies()` still returns nothing and the
 *     measured-results block below still does not render.
 *
 * When a verified case study does arrive, `publishedCaseStudies()` starts
 * returning it and the metric strip appears with no change here — which is the
 * property `content/proof.ts` exists to guarantee.
 */

export function CaseStudy({ cards }: { cards: CaseStudyCard[] }) {
  // Verified, permissioned *outcome* entries — still empty, deliberately.
  const measured = publishedCaseStudies();
  const hasMeasured = measured.length > 0;
  const { mark, tier, tone, grid } = beat('customers');

  return (
    <Chapter
      id="customers"
      mark={mark}
      tier={tier}
      tone={tone}
      grid={grid}
      kicker="Selected work"
      title={
        <>
          Built, deployed,{' '}
          <span className="text-ink-300">and still running.</span>
        </>
      }
      description="Production sites and automation systems for clinics, physiotherapy and real estate. Each one links to the live deployment — nothing here has to be taken on trust."
    >
      {/* The homepage shows the three client builds only. `/work` carries the
          internal systems too, but they have no screenshot by construction —
          an internal project has no `shot` field — and a three-up image grid
          is the wrong surface to introduce them on. */}
      <div className="chapter-stage grid gap-4 md:grid-cols-3">
        {cards.map((p, i) => (
          <Link
            key={p.slug}
            href={`/work/${p.slug}`}
            className="card-interactive reveal-view group flex h-full flex-col overflow-hidden p-0"
            data-cursor="hover"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/[0.06]">
              {/* These three screenshots are the only photographic evidence on
                  the homepage — real, shipped, linked to the running
                  deployment — and RC5 was dimming them with a scrim that ran
                  to 75% void. It was reading as an image treatment; on the
                  capture it read as three washed-out thumbnails, which is an
                  expensive thing to do to the one asset class that needs no
                  provenance caption because a photograph of a shipped thing is
                  self-evidencing.
                  The scrim is kept — the card's title needs a floor to sit on
                  — at 45% and confined to the bottom third, plus a small
                  contrast lift that resolves on hover. */}
              <Image
                src={p.shot.src}
                alt={p.shot.alt}
                fill
                sizes="(min-width: 768px) 30vw, 92vw"
                className="object-cover object-top brightness-[0.94] saturate-[1.05] transition-[transform,filter] duration-700 ease-cinematic group-hover:scale-[1.03] group-hover:brightness-100"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/45 from-0% via-transparent via-34% to-transparent"
              />
            </div>

            <div className="flex flex-1 flex-col gap-2 p-6">
              <div className="flex items-start justify-between gap-3">
                {/* `min-h` on the title, not on the card. Three clients whose
                    names run to one, two and two lines gave three different
                    meta baselines on the 1440 capture — the row read as ragged
                    even though `h-full` had already equalised the cards. Two
                    lines of 18px display leading-snug is 52px. */}
                <h3 className="min-h-[52px] font-display text-[18px] font-semibold leading-snug text-white text-balance">
                  {p.client}
                </h3>
                <ArrowUpRight
                  className="mt-0.5 h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-bright"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                {p.sector} · {p.location}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* The measured-outcome strip. Renders only when a verified,
          permissioned figure exists — which today it does not. */}
      {hasMeasured && (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {measured.map((s) => (
            <div key={s.slug} className="rounded-2xl glass p-7">
              <div className="font-display text-3xl font-semibold text-accent-gradient">
                {s.metric}
              </div>
              <p className="mt-1 text-[12px] text-ink-300">{s.metricLabel}</p>
              <p className="mt-2 text-[11px] leading-snug text-ink-300">
                {s.verification.methodology}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href="/work"
          className="group inline-flex min-h-[24px] items-center gap-2 text-[14px] text-white transition-colors"
          data-cursor="hover"
        >
          Read the case studies
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 ease-cinematic group-hover:translate-x-1"
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </Link>

        {!hasMeasured && (
          <p className="max-w-xl text-[13px] leading-relaxed text-ink-300">
            You will not find percentages on those pages. We publish a result only once it is
            measured against a stated method and confirmed with the client — until then each
            case study says so plainly.
          </p>
        )}
      </div>
    </Chapter>
  );
}
