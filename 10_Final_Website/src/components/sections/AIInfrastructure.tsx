'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Breathing } from '@/components/motion/Breathing';
import { prefersReducedMotion } from '@/lib/utils';

// Plain names only — position is computed below so every node sits at an
// even angle around the core.
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
const RADIUS_Y = 46;

function nodePosition(index: number, total: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2; // start at 12 o'clock
  return {
    x: 50 + RADIUS_X * Math.cos(angle),
    y: 50 + RADIUS_Y * Math.sin(angle),
  };
}

// Only nodes whose index is a multiple of this fire the always-on traveling
// signal (0,5,10,15 → four of nineteen) — keeps the "living data" feeling
// inside the ~3-motion budget, echoing WorkflowPipeline's single-packet feel.
const SIGNAL_STEP = 5;
const SIGNAL_DURATION = 1.3; // one hop, inside the 1100–1600ms cinematic band
const SIGNAL_STAGGER = 1.15;
const SIGNAL_REPEAT_DELAY = 4.7;

// SSR-safe layout effect: measurement must run before paint so lines never
// flash from an unmeasured (center-anchored) state.
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface Size {
  w: number;
  h: number;
}

interface NodeGeometry {
  /** node (pill center) in container px */
  nx: number;
  ny: number;
  /** point on the pill's inner edge, facing the core, in container px */
  edgeX: number;
  edgeY: number;
}

const FALLBACK_PILL: Size = { w: 96, h: 30 };

export function AIInfrastructure() {
  const diagramRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Array<HTMLDivElement | null>>([]);
  const inView = useInView(diagramRef, { once: true, margin: '-10%' });
  const [hovered, setHovered] = useState<number | null>(null);
  const [dims, setDims] = useState<Size | null>(null);
  const [pillSizes, setPillSizes] = useState<Size[]>([]);
  const flowActive = inView && !prefersReducedMotion();

  // Measure the constellation box and every pill in real pixels, then wire
  // each line to the pill's true inner edge. Uniform px space (rather than the
  // old distorted 0–100 viewBox) lets a line terminate exactly AT the box for
  // any pill width and any container size.
  useIsoLayoutEffect(() => {
    const el = diagramRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return; // hidden (e.g. <sm)
      const sizes = INTEGRATIONS.map((_, i) => {
        const pill = pillRefs.current[i];
        if (!pill) return { ...FALLBACK_PILL };
        const pr = pill.getBoundingClientRect();
        return { w: pr.width, h: pr.height };
      });
      setDims({ w: rect.width, h: rect.height });
      setPillSizes(sizes);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Fonts loading late can change pill widths after first paint.
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts?.ready?.then(measure).catch(() => {});
    }
    return () => ro.disconnect();
  }, []);

  // Ray-cast from the core to each pill's bounding box to find where the line
  // meets the box's inner edge (the side facing the centre).
  const geometry = useMemo<NodeGeometry[] | null>(() => {
    if (!dims) return null;
    const { w: W, h: H } = dims;
    const cX = W / 2;
    const cY = H / 2;
    return INTEGRATIONS.map((_, i) => {
      const { x, y } = nodePosition(i, INTEGRATIONS.length);
      const nx = (x / 100) * W;
      const ny = (y / 100) * H;
      const dx = cX - nx;
      const dy = cY - ny;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const ps = pillSizes[i] ?? FALLBACK_PILL;
      const hw = ps.w / 2;
      const hh = ps.h / 2;
      // Distance from pill centre to its edge along the ray toward the core.
      const tx = ux !== 0 ? hw / Math.abs(ux) : Infinity;
      const ty = uy !== 0 ? hh / Math.abs(uy) : Infinity;
      const t = Math.min(tx, ty);
      // End the rail ~9px INSIDE the pill (toward its centre). The pill is
      // opaque and painted above the SVG, so the line disappears exactly at
      // the box boundary — a flush, gap-free connection for every pill,
      // regardless of width or angle. (Clamped so tiny pills don't overshoot.)
      const tIn = Math.max(t - 9, 0);
      return {
        nx,
        ny,
        edgeX: nx + ux * tIn,
        edgeY: ny + uy * tIn,
      };
    });
  }, [dims, pillSizes]);

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

        {/* Phones (<sm): the radial layout can only fit behind a horizontal
            scroll, which crowds badly at 375px. A calm wrap-grid keeps every
            tool legible with no horizontal page scroll. */}
        <div className="mt-12 sm:hidden">
          <div className="mx-auto mb-8 flex w-max items-center gap-2 rounded-full border border-accent-bright/40 bg-surface-1/80 px-4 py-2 shadow-[0_0_30px_rgba(59,130,246,0.35)] backdrop-blur-xl">
            <Breathing period={6} amount={0.06}>
              <span className="block h-2 w-2 rounded-full bg-accent-bright shadow-[0_0_10px_rgba(96,165,250,0.9)]" />
            </Breathing>
            <span className="font-display text-[12px] font-semibold tracking-tight text-white">
              SheetFlow
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-accent-bright">
              Automation
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {INTEGRATIONS.map((name, i) => (
              <motion.div
                key={`m-${name}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.025, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-full border border-accent/45 bg-surface-2/70 px-3 py-1.5 shadow-[0_0_14px_rgba(59,130,246,0.16)] backdrop-blur-md"
              >
                <span className="text-[11px] font-medium text-white/90">{name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tablet / desktop (sm+): the wired radial constellation. */}
        <div
          className="scrollbar-none scroll-fade-edge mt-14 hidden overflow-x-auto overflow-y-visible -mx-6 px-6 sm:block md:mx-0 md:mt-0 md:overflow-visible md:px-0"
          tabIndex={0}
          role="region"
          aria-label="Integration diagram"
        >
          <motion.div
            ref={diagramRef}
            className="relative mx-auto aspect-[16/8] w-full min-w-[760px] max-w-6xl md:mt-20 md:min-w-0"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 1.0 }}
          >
            {/* Center node — SheetFlow AI. Sits above the SVG (z-10) so every
                line appears to emanate from behind the hub. */}
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

            {/* Wiring layer — pixel-space viewBox matched 1:1 to the measured
                container so a line ending at a pill's inner edge really lands
                on that edge. Rendered only once geometry is measured. */}
            {dims && geometry && (
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox={`0 0 ${dims.w} ${dims.h}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* Connector rails — core → pill inner edge. */}
                {INTEGRATIONS.map((name, i) => {
                  const g = geometry[i];
                  const isHovered = hovered === i;
                  return (
                    <motion.line
                      key={`line-${name}`}
                      x1={dims.w / 2}
                      y1={dims.h / 2}
                      x2={g.edgeX}
                      y2={g.edgeY}
                      stroke={isHovered ? 'rgba(147, 197, 253, 0.95)' : 'rgba(96, 165, 250, 0.4)'}
                      strokeWidth={isHovered ? 2.4 : 1.3}
                      strokeLinecap="round"
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

                {/* Live signal — travels the FULL rail, core → pill inner edge,
                    on a loop. Only the base set (every 5th node) plus the
                    hovered node animate, staggered so ~1–2 are ever in flight. */}
                {flowActive &&
                  INTEGRATIONS.map((name, i) => {
                    const isHovered = hovered === i;
                    const inBaseSet = i % SIGNAL_STEP === 0;
                    if (!inBaseSet && !isHovered) return null;
                    const g = geometry[i];
                    return (
                      <motion.circle
                        key={`pulse-${name}-${isHovered}`}
                        r={isHovered ? 3.4 : 2.6}
                        fill={isHovered ? '#BFDBFE' : '#60A5FA'}
                        initial={{ opacity: 0 }}
                        animate={{
                          cx: [dims.w / 2, g.edgeX],
                          cy: [dims.h / 2, g.edgeY],
                          opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                          duration: isHovered ? 1.1 : SIGNAL_DURATION,
                          repeat: Infinity,
                          repeatDelay: isHovered ? 0.25 : SIGNAL_REPEAT_DELAY,
                          delay: isHovered ? 0 : (i / SIGNAL_STEP) * SIGNAL_STAGGER,
                          ease: 'easeInOut',
                        }}
                      />
                    );
                  })}
              </svg>
            )}

            {/* Integration nodes */}
            {INTEGRATIONS.map((name, i) => {
              const { x, y } = nodePosition(i, INTEGRATIONS.length);
              const isHovered = hovered === i;
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
                  <div
                    ref={(el) => {
                      pillRefs.current[i] = el;
                    }}
                    className={`rounded-full border bg-surface-2 px-3 py-1.5 backdrop-blur-md transition-all ${
                      isHovered
                        ? 'border-accent-bright/80 bg-accent/20 shadow-[0_0_30px_rgba(59,130,246,0.42)]'
                        : 'border-accent/50 shadow-[0_0_16px_rgba(59,130,246,0.20)]'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-white/90">{name}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>{/* end radial (sm+) wrapper */}

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
