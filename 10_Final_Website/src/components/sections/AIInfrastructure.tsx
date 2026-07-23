'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Breathing } from '@/components/motion/Breathing';
import { prefersReducedMotion } from '@/lib/utils';

// Plain names only — position is computed below so every node sits at an
// even angle around the core. The old version hand-picked x/y coordinates
// per node, which is why lines crossed awkwardly and spacing felt random.
const INTEGRATIONS = [
  'WhatsApp',
  'Instagram',
  'Gmail',
  'Google Sheets',
  'Google Cal',
  'Calendly',
  'Slack',
  'HubSpot',
  'Pipedrive',
  'Airtable',
  'n8n',
  'Claude',
  'Zapier',
  'Make',
  'GoHighLevel',
  'Twilio',
  'Stripe',
  'QuickBooks',
  'Mailchimp',
] as const;

const RADIUS_X = 43;
// Pill width scales with label length ("Google Sheets", "GoHighLevel") but
// every node sits at the same radius, so arc distance between neighbors is
// NOT proportional to pill width. At the min-w-[760px] mobile breakpoint the
// tightest adjacent pairs (Gmail/"Google Sheets", Stripe/QuickBooks) worked
// out to ~4-5px of clearance — visually crowded. RADIUS_Y is raised (not
// RADIUS_X) because those pairs are separated on the vertical axis, and the
// mobile scroll wrapper is overflow-y-visible (no clip risk) vs.
// overflow-x-auto (growing RADIUS_X eats into real edge-clipping margin for
// the nodes nearest the left/right extremes, e.g. GoHighLevel/Calendly, for
// no benefit to the actual tight pairs). This roughly doubles their margin
// without changing the horizontal-clipping safety margin at all.
// 44 was calibrated against a 760px floor, but the real narrowest render
// width is ~704px (md: breakpoint drops min-w-[760px] at 768px, while
// container-edge padding stays at its sm: tier down to 640px) — nudged up
// for real safety margin at that width, not just the assumed one.
const RADIUS_Y = 46;

function nodePosition(index: number, total: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2; // start at 12 o'clock
  return {
    x: 50 + RADIUS_X * Math.cos(angle),
    y: 50 + RADIUS_Y * Math.sin(angle),
  };
}

export function AIInfrastructure() {
  const diagramRef = useRef<HTMLDivElement>(null);
  const inView = useInView(diagramRef, { once: true, margin: '-10%' });
  const [hovered, setHovered] = useState<number | null>(null);
  const flowActive = inView && !prefersReducedMotion();

  return (
    <section id="integrations" className="section relative">
      {/* Background grid */}
      <div className="absolute inset-0 -z-10 grid-backdrop opacity-30" aria-hidden="true" />

      <div className="container-edge">
        <SectionHeader
          kicker="Plays Nicely With Your Stack"
          title={
            <>
              Works with the tools{' '}
              <span className="text-ink-300">your team already uses.</span>
            </>
          }
          description="No rip-and-replace. SheetFlow plugs into your CRM, calendar, WhatsApp, sheets and inbox — automating what's already in place."
          align="center"
          className="mx-auto items-center text-center"
        />

        {/* Mobile: horizontal scroll wrapper so ecosystem nodes stay legible.
            scroll-fade-edge softens the right edge to hint at more content. */}
        <div className="scrollbar-none scroll-fade-edge mt-14 overflow-x-auto overflow-y-visible -mx-6 px-6 md:mt-0 md:mx-0 md:px-0 md:overflow-visible" tabIndex={0} role="region" aria-label="Integration diagram">
        <motion.div
          ref={diagramRef}
          className="relative mx-auto aspect-[16/8] w-full min-w-[760px] max-w-6xl md:mt-20 md:min-w-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1.0 }}
        >
          {/* Center node — SheetFlow AI */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div
                className="absolute inset-0 -m-12 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(59, 130, 246,0.4), transparent 70%)',
                  filter: 'blur(20px)',
                }}
                aria-hidden="true"
              />
              {/* Shared, reduced-motion-guarded primitive — replaces a
                  hand-rolled breathe with its own easing and no guard at all. */}
              <Breathing period={6} amount={0.02}>
                <div
                  className="relative flex h-28 w-28 items-center justify-center rounded-full border border-accent-bright/40 bg-surface-1/80 backdrop-blur-xl"
                  style={{
                    boxShadow: '0 0 40px rgba(59, 130, 246,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="text-center">
                    <p className="font-display text-[11px] font-semibold tracking-tight text-white">
                      SheetFlow
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-accent-bright">
                      Automation
                    </p>
                  </div>
                </div>
              </Breathing>
            </div>
          </div>

          {/* Connection lines — square viewBox matched to plain 0-100 x/y so
              node position math is identical between the SVG and the DOM.

              Reveal is driven by the shared `inView` boolean (one reliable
              IntersectionObserver on the diagramRef container) rather than a
              per-line whileInView/viewport trigger. An SVG <line> has zero
              fill area — only a stroke — so its intersection bounding box is
              thin, and for the node at index 0 (top of the circle) it is
              perfectly vertical (x1 === x2), giving it a literal zero-width
              box. IntersectionObserver's ratio math on thin/degenerate SVG
              primitives is inconsistent across browsers, which is why some
              lines were getting stuck at their initial pathLength:0/opacity:0
              state — invisible — even though their x/y geometry (shared with
              the node div via the same nodePosition() call) was always
              correct. Gating on one shared, known-good boolean fixes that. */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {INTEGRATIONS.map((name, i) => {
              const { x, y } = nodePosition(i, INTEGRATIONS.length);
              const isHovered = hovered === i;
              return (
                <motion.line
                  key={`line-${name}`}
                  x1="50"
                  y1="50"
                  x2={x}
                  y2={y}
                  stroke={isHovered ? 'rgba(147, 197, 253, 0.95)' : 'rgba(96, 165, 250, 0.4)'}
                  strokeWidth={isHovered ? '0.45' : '0.22'}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{
                    pathLength: { duration: 0.8, delay: 0.2 + i * 0.03 },
                    opacity: { duration: 0.8, delay: 0.2 + i * 0.03 },
                    stroke: { duration: 0.25 },
                    strokeWidth: { duration: 0.25 },
                  }}
                />
              );
            })}

            {/* Persistent connection ports — a lit dot at every node where its
                line terminates, so each box reads as wired to the core even at
                rest. Sits under the translucent pill and glows through it. */}
            {INTEGRATIONS.map((name, i) => {
              const { x, y } = nodePosition(i, INTEGRATIONS.length);
              const isHovered = hovered === i;
              return (
                <motion.circle
                  key={`port-${name}`}
                  cx={x}
                  cy={y}
                  r={isHovered ? '0.8' : '0.5'}
                  fill={isHovered ? '#93C5FD' : '#60A5FA'}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: isHovered ? 1 : 0.75 } : { opacity: 0 }}
                  transition={{ opacity: { duration: 0.4, delay: 0.35 + i * 0.03 }, r: { duration: 0.2 } }}
                />
              );
            })}

            {/* Live signal — travels from the core to a node and back on a
                loop. Only every 5th node animates by default (plus whichever
                node is hovered) — with 19 integrations, animating all of them
                at once was the main cause of the reported lag. This keeps the
                "living data" feeling at a fraction of the animation cost. */}
            {flowActive &&
              INTEGRATIONS.map((name, i) => {
                const isHovered = hovered === i;
                const inBaseSet = i % 5 === 0;
                if (!inBaseSet && !isHovered) return null;
                const { x, y } = nodePosition(i, INTEGRATIONS.length);
                return (
                  <motion.circle
                    // Keying on isHovered forces a real remount (not just a
                    // prop diff) on hover. Without it, the always-on base-set
                    // circles (i % 3 === 0) never restart their cycle on
                    // hover — framer-motion shallow-compares each keyframe
                    // array against the previous render, and cx/cy/opacity
                    // are a pure function of i, so they read as "unchanged"
                    // and the hover-triggered transition never actually
                    // re-fires; only r/fill (plain props) updated instantly.
                    key={`pulse-${name}-${isHovered}`}
                    r={isHovered ? '0.7' : '0.45'}
                    fill={isHovered ? '#BFDBFE' : '#60A5FA'}
                    initial={{ opacity: 0 }}
                    animate={{
                      cx: [50, x],
                      cy: [50, y],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: isHovered ? 1.1 : 2.4,
                      repeat: Infinity,
                      repeatDelay: isHovered ? 0.2 : 2.2,
                      // The (i % 6) stagger is only meant to desync the
                      // always-on base-set nodes so they don't pulse in
                      // lockstep. Applying it to a hover-triggered node too
                      // meant hovering nodes with a high i % 6 (e.g. Calendly,
                      // Claude, Stripe) could sit for up to 1.5s before their
                      // dot appeared at all — easy to read as "hover doesn't
                      // produce a dot" during a quick check. Hover should
                      // always start immediately.
                      delay: isHovered ? 0 : (i % 6) * 0.3,
                      ease: 'easeInOut',
                    }}
                  />
                );
              })}
          </svg>

          {/* Integration nodes */}
          {INTEGRATIONS.map((name, i) => {
            const { x, y } = nodePosition(i, INTEGRATIONS.length);
            return (
              <motion.div
                key={name}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="rounded-full border border-accent/45 bg-surface-2/70 px-3 py-1.5 shadow-[0_0_16px_rgba(59,130,246,0.18)] backdrop-blur-md transition-all hover:border-accent-bright/80 hover:bg-accent/15 hover:shadow-[0_0_30px_rgba(59,130,246,0.42)]">
                  <span className="text-[11px] font-medium text-white/90">{name}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        </div>{/* end mobile scroll wrapper */}

        <motion.p
          className="mx-auto mt-8 max-w-md text-center text-[13px] text-ink-400 md:mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          50+ integrations supported · Custom connections built on request · Your stack stays yours
        </motion.p>
      </div>
    </section>
  );
}
