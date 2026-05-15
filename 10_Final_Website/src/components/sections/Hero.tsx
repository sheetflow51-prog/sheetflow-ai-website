'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Sparkles, Play } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ParticleField from '@/components/providers/ParticleField';
import { Magnetic } from '@/components/motion/Magnetic';
import { Parallax } from '@/components/motion/Parallax';
import { Brackets } from '@/components/signature/Brackets';
import { Trace } from '@/components/signature/Trace';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

// 3D core is heavy → ssr: false + lazy.
// IntelligenceCore upgrades to a Spline scene when NEXT_PUBLIC_SPLINE_SCENE_HERO
// is set; otherwise falls back to the R3F AICore.
const IntelligenceCore = dynamic(() => import('@/components/three/IntelligenceCore'), {
  ssr: false,
  loading: () => null,
});

const reveal = {
  hidden: { opacity: 0, y: 32, filter: 'blur(8px)' },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.12 },
  }),
};

const TRUST_LOGOS = ['STRATA', 'ARC.OPS', 'NORTHFIELD', 'OBSIDIAN', 'PARALLEL', 'KINETIK'];

export function Hero() {
  const { track } = useAnalytics();

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden pt-24 pb-20 md:pt-36 md:pb-32">
      {/* Layered backgrounds */}
      <div className="absolute inset-0 -z-10 signature-grid opacity-50" aria-hidden="true" />
      <ParticleField className="-z-10" reactive />

      {/* Signature L-bracket frame — recurring brand motif (see VISUAL_DNA § 10.2) */}
      <Brackets inset={32} size={22} animate />

      {/* AI core — placed behind the headline, full-bleed, with subtle scroll parallax */}
      <Parallax
        range={120}
        scale={1.04}
        className="pointer-events-none absolute inset-0 -z-10 mx-auto flex items-center justify-center opacity-90"
      >
        <div className="aspect-square h-[80vh] max-h-[820px] w-auto max-w-[820px]">
          <IntelligenceCore scene="hero" disableInteraction skipOnTouch />
        </div>
      </Parallax>

      {/* Cinematic vignette */}
      <div
        className="pointer-events-none absolute inset-0 -z-[5]"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 60%, transparent 30%, rgba(6,6,8,0.6) 75%, rgba(6,6,8,0.95) 100%)',
        }}
      />

      <div className="container-edge relative z-10 mx-auto flex flex-col items-center text-center">
        <motion.div initial="hidden" animate="show" variants={reveal} custom={0}>
          <Badge variant="ai" className="mb-7">
            <Sparkles className="h-3 w-3" strokeWidth={2.4} />
            Introducing the Intelligence Layer
          </Badge>
        </motion.div>

        <motion.h1
          className="headline-monument text-fade text-balance max-w-[18ch]"
          initial="hidden"
          animate="show"
          variants={reveal}
          custom={1}
        >
          Your data,{' '}
          <span className="text-accent-gradient text-glow">finally alive.</span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-balance text-[17px] leading-[1.55] text-ink-300 md:mt-7 md:text-xl"
          initial="hidden"
          animate="show"
          variants={reveal}
          custom={2}
        >
          SheetFlow AI is the operational intelligence layer for spreadsheets.
          It watches your data, catches what matters, and acts before you
          have to ask.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          initial="hidden"
          animate="show"
          variants={reveal}
          custom={3}
        >
          <Magnetic strength={10} inner={1.6}>
            <Button variant="primary" size="lg" onClick={() => track('hero_cta_click', { variant: 'activate' })}>
              Activate intelligence
            </Button>
          </Magnetic>
          <Magnetic strength={8} inner={1.4}>
            <Button variant="secondary" size="lg" trailing={<Play className="h-3.5 w-3.5" fill="currentColor" />} onClick={() => track('hero_demo_click')}>
              Watch the demo
            </Button>
          </Magnetic>
        </motion.div>

        <motion.div
          className="mt-8 flex items-center gap-2 text-[12px] text-ink-400"
          initial="hidden"
          animate="show"
          variants={reveal}
          custom={4}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-signal-success animate-pulse-live" />
          Free to start. No credit card. 4 minutes to first signal.
        </motion.div>

        {/* Trust strip */}
        <motion.div
          className="mt-14 flex w-full max-w-3xl flex-col items-center gap-4 md:mt-20"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
        >
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink-400">
            Trusted by intelligence-driven teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 opacity-50 grayscale sm:gap-x-10">
            {TRUST_LOGOS.map((name) => (
              <span
                key={name}
                className="font-display text-[12px] font-semibold tracking-[0.18em] text-white/60 sm:text-[13px]"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Signature Trace — recurring memory motif under the trust strip */}
        <motion.div
          className="mt-8 md:mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <Trace orientation="horizontal" length={180} nodes={5} active={3} />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-2 text-[11px] uppercase tracking-widest text-ink-400 md:mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          aria-hidden="true"
        >
          <span>Scroll to begin</span>
          <div className="relative h-12 w-px overflow-hidden bg-white/10">
            <motion.div
              className="absolute left-0 top-0 h-1/3 w-full bg-gradient-to-b from-transparent via-accent-bright to-transparent"
              animate={{ y: ['-100%', '300%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
