'use client';

import dynamic from 'next/dynamic';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ParticleField from '@/components/providers/ParticleField';
import { Magnetic } from '@/components/motion/Magnetic';
import { Brackets } from '@/components/signature/Brackets';
import { Trace } from '@/components/signature/Trace';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

const IntelligenceCore = dynamic(() => import('@/components/three/IntelligenceCore'), { ssr: false });

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

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden py-24 md:py-44"
    >
      {/* Particle field */}
      <ParticleField className="opacity-60" reactive />

      {/* Signature L-bracket frame — closes the brand memory loop with the hero (VISUAL_DNA § 10.2) */}
      <Brackets inset={32} size={22} animate />

      {/* Cinematic violet wash — intensifies on descent */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[6]"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 70% 50%, rgba(139,92,246,1), transparent 60%)',
          opacity: violetIntensity,
          mixBlendMode: 'screen',
        }}
      />

      {/* Subtle 3D core glow on the right edge — scales/brightens with descent */}
      <motion.div
        className="pointer-events-none absolute -right-40 top-1/2 -z-10 hidden h-[700px] w-[700px] -translate-y-1/2 lg:block"
        style={{ scale: coreScale, opacity: coreOpacity }}
      >
        <IntelligenceCore scene="cta" disableInteraction skipOnTouch />
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
            'radial-gradient(circle, rgba(99,102,241,0.22), transparent 60%)',
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
            <Badge variant="ai">The Invitation</Badge>
          </motion.div>

          <motion.h2
            className="headline-cinematic text-fade text-balance mt-6 max-w-[18ch] origin-left"
            initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ scale: headlineScale }}
          >
            Stop watching your data.{' '}
            <span className="text-accent-gradient text-glow">Let it watch itself.</span>
          </motion.h2>

          <motion.p
            className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-300 text-balance md:mt-7 md:text-[18px]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            Activate intelligence on your first spreadsheet in under four minutes.
            The first signal will probably surprise you. Most of them do.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Magnetic strength={10} inner={1.6}>
              <Button variant="primary" size="lg" onClick={() => track('final_cta_click', { variant: 'activate' })}>
                Activate intelligence
              </Button>
            </Magnetic>
            <Magnetic strength={6} inner={1.4}>
              <Button variant="ghost" size="lg" trailing="arrow" onClick={() => track('final_strategist_click')}>
                Talk to a strategist
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
              SOC 2 Type II
            </span>
            <span>·</span>
            <span>GDPR aligned</span>
            <span>·</span>
            <span>Read-only by default</span>
            <span>·</span>
            <span>Cancel any time</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
