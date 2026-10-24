'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Magnetic } from '@/components/motion/Magnetic';
import { Ambient, Surface } from '@/components/vos';
import { Brackets } from '@/components/signature/Brackets';
import { Trace } from '@/components/signature/Trace';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { prefersReducedMotion } from '@/lib/utils';
import { EASE } from '@/lib/motion';
import { beat } from '@/content/narrative';

/**
 * The close — the resolution, and unnumbered for that reason.
 *
 * ## The descent, moved to CSS
 *
 * RC4's version ran `useScroll` scoped to this section, fed a `useSpring`
 * (stiffness 100, damping 30, mass 0.7), and derived **five** `useTransform`s
 * from it: a wash opacity, a vignette opacity, a headline scale, and a scale
 * and opacity on the corner glow. Five motion values re-evaluated per scroll
 * frame, three of them driving properties on full-viewport elements.
 *
 * The effect is worth keeping — atmosphere intensifying as the reader arrives
 * at the closing scene is the arc's last beat. `VISUAL_DNA_V2.md` § 7.2 is
 * explicit that this is now a CSS job, so the descent is one
 * `animation-timeline: view()` opacity ramp on one wash, and the headline
 * scale is dropped entirely — type does not move under reading (§ 7.1), and
 * scaling an `h2` from 0.96 to 1 as it is read was always in tension with that.
 *
 * The base atmosphere is `Ambient tier="full"`, which is what § 8.3 assigns to
 * the two ends of the arc, so this section stops hand-rolling four gradients
 * that the engine already owns.
 */

export function FinalCTA() {
  const { track } = useAnalytics();
  const { tier, tone } = beat('contact');

  // Continuous ambient motion (traveling beam + CTA sheen) mounts only after
  // hydration and only when reduced-motion is not requested.
  const [runMotion, setRunMotion] = useState(false);
  useEffect(() => {
    setRunMotion(!prefersReducedMotion());
  }, []);

  return (
    /* 44 → 30 at md. The panel now carries up to 68px of its own padding, and
       176px of section padding on top of that put the closing headline most of
       a viewport away from the beat above it. */
    <section id="contact" data-theme="dark" data-stage="band" className="relative isolate overflow-hidden py-20 md:py-30">
      <Ambient tier={tier} tone={tone} />
      {/* Continuous signal beam traveling the closing section's top edge —
          mirrors the hero's bottom-edge beam (gold-led here) so the two
          bookends "hand off" the running signal. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-[4] h-px"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet/25 to-transparent" />
        {runMotion && (
          <motion.span
            className="absolute inset-y-0 left-0 w-40 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgb(var(--color-gold-bright) / 0.9) 42%, rgb(var(--color-accent-bright) / 0.85) 58%, transparent)',
              boxShadow: '0 0 12px 1px rgb(var(--color-gold-bright) / 0.45)',
            }}
            initial={{ x: '-20vw', opacity: 0 }}
            animate={{ x: ['-20vw', '120vw'], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 5.5,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 1.4,
            }}
          />
        )}
      </div>


      {/* Signature L-bracket frame — closes the brand memory loop with the hero (VISUAL_DNA § 10.2) */}
      <Brackets inset={32} size={22} animate />

      {/* The descent. One element, one property, on the compositor — where
          RC4 had four elements and five spring-driven motion values. It rests
          at full intensity, so a browser without scroll timelines gets the
          finished closing scene rather than a dim one. */}
      <div className="cta-descent" aria-hidden="true" />

      {/* Edge vignette. Static now: it was ramping 0.4 → 0.95 across the same
          scroll range as the wash above, which is two elements animating the
          same idea. */}
      <div
        className="pointer-events-none absolute inset-0 -z-[5]"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% 50%, transparent 30%, rgb(var(--color-void) / 0.85) 90%)',
          opacity: 0.8,
        }}
      />

      <div className="container-edge relative z-10">
        {/* A surface, and centred — as of RC6.

            This is the last thing a visitor sees before deciding, and it was
            the only beat on the page with no object in it: a headline, a
            paragraph and two controls, left-aligned in a 1280 container, on a
            wash. On the 1440 capture the right half of the closing screen held
            nothing at all, so the page ended on its emptiest frame.

            Centred rather than left, deliberately, and it is not a break with
            the alignment system — the close sits outside the chapter rail by
            construction (it carries no mark, per `content/narrative.ts`), and
            it already mirrors the hero in three other ways: the bracket frame,
            the edge beam handing the signal back, and the `Trace`. The hero is
            centred. Closing the loop means closing it here too.

            `elevation={3}`, not 4: the `presented` tier is spent on the
            recommended pricing card two chapters up, and § 4.1's rule is per
            viewport rather than per page — but a lifted glass panel over the
            full-tier wash and the descent is already the strongest surface on
            the route, and taking 4 as well would leave nothing above it. */}
        <Surface
          elevation={3}
          className="close-panel mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <Badge variant="ai">Let's Build Yours</Badge>
          </motion.div>

          <motion.h2
            className="headline-cinematic text-fade text-balance mt-6 max-w-[20ch]"
            initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          >
            Stop doing the busywork.{' '}
            <span className="text-accent-gradient text-glow">Let SheetFlow run it.</span>
          </motion.h2>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-ink-200 text-balance md:mt-7 md:text-[18px]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            Book a free 30-minute automation audit. We'll map exactly what we'd automate
            in your business — leads, follow-ups, bookings, reports — and show you the
            hours and revenue you'd get back. No commitment.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Magnetic strength={10} inner={1.6}>
              <span className="relative inline-flex">
                <Button
                  variant="primary"
                  size="lg"
                  href="/book"
                  onClick={() => track('final_cta_click', { variant: 'audit' })}
                >
                  Book a free automation audit
                </Button>
                {runMotion && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
                  >
                    <motion.span
                      className="absolute inset-y-0 left-0 w-1/2 -skew-x-12"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent, rgb(var(--color-accent-light) / 0.28) 38%, rgb(var(--c-fg) / 0.42) 50%, rgb(var(--color-gold-bright) / 0.34) 62%, transparent)',
                      }}
                      initial={{ x: '-160%' }}
                      animate={{ x: ['-160%', '260%'] }}
                      transition={{
                        duration: 1.15,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatDelay: 4.5,
                      }}
                    />
                  </span>
                )}
              </span>
            </Magnetic>
            <Magnetic strength={6} inner={1.4}>
              <Button
                variant="ghost"
                size="lg"
                trailing="arrow"
                href="#customers"
                onClick={() => track('final_case_studies_click')}
              >
                See our work
              </Button>
            </Magnetic>
          </motion.div>

          {/* Signature Trace — mirror of the hero motif, closing the loop */}
          <motion.div
            className="mt-10 md:mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Trace orientation="horizontal" length={200} nodes={5} active={4} />
          </motion.div>


          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[12px] text-ink-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-success" />
              30-min free audit
            </span>
            <span>·</span>
            <span>No commitment</span>
            <span>·</span>
            <span>Your tools stay yours</span>
            <span>·</span>
            <span>Cancel any time</span>
          </motion.div>
        </Surface>
      </div>
    </section>
  );
}
