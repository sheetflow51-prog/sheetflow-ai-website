import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Chapter, Surface } from '@/components/vos';
import { beat } from '@/content/narrative';
import { formatPrice, tiers } from '@/content/pricing';

/**
 * The terms — chapter 07, the *Pricing* beat.
 *
 * ## Why the homepage has a price on it at all
 *
 * The RC5 brief states the narrative a visitor should be able to follow without
 * leaving the page: what SheetFlow is → how the automation works → proof →
 * results → **pricing** → booking. Before RC5 the homepage went from a case
 * study straight to "book a free audit", so the one question every visitor has
 * between those two — *what does this cost* — was answered on a different
 * route, or not at all before the form.
 *
 * ## Every figure here is already published
 *
 * Nothing is authored in this file. The three tiers, their prices, their
 * one-line summaries and their **limits** all come from `content/pricing.ts`,
 * which carries the founder authorisation (D25) and the rule about what may go
 * in it. `formatPrice` is imported rather than reimplemented, so the homepage
 * and `/pricing` cannot state different numbers.
 *
 * ## The limit line is not padding
 *
 * Each card states what its tier **does not cover**, in the tier's own words,
 * beside what it does. That is the single most unusual thing on the page and it
 * is deliberate: `content/pricing.ts` records that no delivery timeline, ROI
 * claim, discount anchor or "most popular" badge may appear here, and a pricing
 * block with all of those removed and nothing put back reads as evasive. The
 * honest replacement for a persuasion device is a disclosure.
 *
 * The homepage does not repeat the full feature lists or the comparison grid.
 * Three summaries and their limits are what a narrative beat needs; the
 * complete tables are one link away and are the reason `/pricing` exists.
 *
 * ## Where the closing paragraph came from
 *
 * Verbatim from `FeatureStorytelling`, the six-card grid RC5 removed from the
 * homepage (`docs/RC5_NARRATIVE.md` § 2). Five of its six pillars restated the
 * six automations in chapter 01 and the five stages in chapter 03; the sixth —
 * ownership and lock-in — said something no other section said, and it is a
 * statement about *terms*. So it moved here rather than being deleted with the
 * grid that carried it.
 *
 * Server component. Zero JavaScript.
 */

export function Terms() {
  const { mark, tier: ambientTier, tone, grid } = beat('pricing-beat');

  return (
    <Chapter
      id="pricing-beat"
      mark={mark}
      tier={ambientTier}
      tone={tone}
      grid={grid}
      kicker="What it costs"
      title={
        <>
          Published prices,{' '}
          <span className="text-ink-300">and what each one does not cover.</span>
        </>
      }
      description="A production site with lead capture from ₹19,999 one-time. Ongoing AI automation from ₹4,999 per month. Bespoke engagements scoped on a call."
    >
      <ul className="chapter-stage terms">
        {tiers.map((t, i) => {
          const price = formatPrice(t.price);
          return (
            <Surface
              key={t.id}
              as="li"
              /* One presented surface per viewport (§ 4.1), and it is the tier
                 `content/pricing.ts` marks as the one **we recommend** — which
                 is not the same claim as "most customers choose this", a sales
                 statistic nobody here has. */
              elevation={t.featured ? 4 : 2}
              /* Written out rather than interpolated — see the note in
                 `vos/Ambient.tsx`. A class name assembled from a template
                 literal is a literal in no source file, so Tailwind's content
                 scanner cannot see it and tree-shakes the rule; RC4 shipped
                 exactly that bug and only a screenshot found it. */
              className={
                t.featured
                  ? 'terms-card terms-card--featured reveal-view'
                  : 'terms-card reveal-view'
              }
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <p className="terms-name">
                {t.name}
                {t.featured ? <span className="terms-flag">We recommend</span> : null}
              </p>

              <p className="terms-price">
                {price.lead}
                <span className="terms-price-note">{price.note}</span>
              </p>

              <p className="terms-summary">{t.summary}</p>

              {/* Stated with the same weight as the summary above it, not in a
                  footnote. A limit set in 9px grey is a disclosure nobody
                  reads, which is the same as not disclosing it. */}
              <p className="terms-limit">
                <span className="terms-limit-mark">Not included</span>
                {t.limit}
              </p>

              <Link href={t.cta.href} className="terms-cta" data-cursor="hover">
                {t.cta.label}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
              </Link>
            </Surface>
          );
        })}
      </ul>

      <div className="terms-foot">
        <Link href="/pricing" className="terms-more" data-cursor="hover">
          See what each tier includes, line by line
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 ease-cinematic group-hover:translate-x-1"
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </Link>

        <p className="terms-own">
          <strong className="terms-own-lead">Built carefully. Yours to own.</strong> Read-only
          access by default. Every action logged. We hand over the keys — no lock-in, no platform
          tax. Cancel anytime.
        </p>
      </div>
    </Chapter>
  );
}
