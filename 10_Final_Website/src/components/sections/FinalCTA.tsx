'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Magnetic } from '@/components/motion/Magnetic';
import { Brackets } from '@/components/signature/Brackets';
import { Trace } from '@/components/signature/Trace';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { BOOKING_URL } from '@/lib/contact';
import { prefersReducedMotion } from '@/lib/utils';

export function FinalCTA() {
  const { track } = useAnalytics();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end'],
  });
  // The "descent" — atmosphere intensifies as the user reaches the closing scene.
  const descent = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.7,
  });
  // Ambient violet wash deepens, vignette darkens, headline scale breathes up.
  const violetIntensity = useTransform(descent, [0, 0.6, 1], [0.05, 0.18, 0.28]);
  const vignetteIntensity = useTransform(descent, [0, 0.6, 1], [0.4, 0.7, 0.95]);
  const headlineScale = useTransform(descent, [0, 0.7], [0.96, 1]);
  const coreScale = useTransform(descent, [0, 1], [0.9, 1.15]);
  const coreOpacity = useTransform(descent, [0, 0.4, 1], [0.2, 0.5, 0.8]);

  // Continuous ambient motion (traveling beam + CTA sheen) mounts only after
  // hydration and only when reduced-motion is not requested.
  const [runMotion, setRunMotion] = useState(false);
  useEffect(() => {
    setRunMotion(!prefersReducedMotion());
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative isolate overflow-hidden py-24 md:py-44"
    >
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
                'linear-gradient(90deg, transparent, rgba(244, 192, 99,0.9) 42%, rgba(96, 165, 250,0.85) 58%, transparent)',
              boxShadow: '0 0 12px 1px rgba(244, 192, 99,0.45)',
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

      {/* Cinematic violet wash — intensifies on descent */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[6]"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 70% 50%, rgba(233, 162, 59,1), transparent 60%)',
          opacity: violetIntensity,
          mixBlendMode: 'screen',
        }}
      />

      {/* Subtle 3D core glow on the right edge — scales/brightens with descent */}
      <motion.div
        className="pointer-events-none absolute -right-40 top-1/2 -z-10 hidden h-[700px] w-[700px] -translate-y-1/2 lg:block"
        style={{ scale: coreScale, opacity: coreOpacity }}
      >
        {/* Lightweight static brand glow (no second video) — keeps the closing
            scene atmospheric without a second decoding <video> (perf). */}
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(59,130,246,0.35), rgba(233,162,59,0.12) 45%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
      </motion.div>

      {/* Edge vignette — darkens as the closing scene approaches */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-[5]"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% 50%, transparent 30%, rgba(6,6,8,0.85) 90%)',
          opacity: vignetteIntensity,
        }}
      />

      {/* Soft accent halo behind the headline */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-[5] h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(circle, rgba(59, 130, 246,0.22), transparent 60%)',
          opacity: useTransform(descent, [0, 0.5, 1], [0.2, 0.6, 0.8]),
          filter: 'blur(10px)',
        }}
      />

      <div className="container-edge relative z-10">
        <div className="mx-auto flex max-w-3xl flex-col items-start lg:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge variant="ai">Let's Build Yours</Badge>
          </motion.div>

          <motion.h2
            className="headline-cinematic text-fade text-balance mt-6 max-w-[20ch] origin-left"
            initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ scale: headlineScale }}
          >
            Stop doing the busywork.{' '}
            <span className="text-accent-gradient text-glow">Let SheetFlow run it.</span>
          </motion.h2>

          <motion.p
            className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-300 text-balance md:mt-7 md:text-[18px]"
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
            className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
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
                  href={BOOKING_URL}
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
                          'linear-gradient(90deg, transparent, rgba(147, 197, 253,0.28) 38%, rgba(255,255,255,0.42) 50%, rgba(244, 192, 99,0.34) 62%, transparent)',
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
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 text-[12px] text-ink-400"
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
        </div>
      </div>
    </section>
  );
}
