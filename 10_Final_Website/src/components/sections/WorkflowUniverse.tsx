'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Activity, Database, Bell, FileSpreadsheet, GitBranch, Sparkles } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface Node {
  id: string;
  label: string;
  sub: string;
  x: number; // percent
  y: number;
  Icon: typeof Activity;
  type: 'source' | 'process' | 'output' | 'alert';
}

const NODES: Node[] = [
  { id: 's1', label: 'Sales Pipeline',    sub: 'Google Sheets · 12 cols', x: 13, y: 22, Icon: FileSpreadsheet, type: 'source' },
  { id: 's2', label: 'Inventory Tracker', sub: 'Excel · live sync',       x: 13, y: 72, Icon: Database,        type: 'source' },
  { id: 'p1', label: 'Anomaly Detection', sub: '4σ threshold · auto',     x: 38, y: 28, Icon: Activity,        type: 'process' },
  { id: 'p2', label: 'Forecast Model',    sub: '90-day rolling',          x: 38, y: 66, Icon: GitBranch,       type: 'process' },
  { id: 'p3', label: 'Intelligence Core', sub: 'SheetFlow.AI',            x: 62, y: 46, Icon: Sparkles,        type: 'process' },
  { id: 'o1', label: 'Slack Signal',      sub: '#ops · #revenue',         x: 87, y: 22, Icon: Bell,            type: 'alert' },
  { id: 'o2', label: 'Weekly Report',     sub: 'Mon · 8:00 AM',           x: 87, y: 72, Icon: FileSpreadsheet, type: 'output' },
];

const EDGES: [string, string][] = [
  ['s1', 'p1'],
  ['s1', 'p2'],
  ['s2', 'p2'],
  ['s2', 'p1'],
  ['p1', 'p3'],
  ['p2', 'p3'],
  ['p3', 'o1'],
  ['p3', 'o2'],
];

const NODE_COLOR: Record<Node['type'], string> = {
  source:  '#A5B4FC',
  process: '#818CF8',
  output:  '#34D399',
  alert:   '#FBBF24',
};

export function WorkflowUniverse() {
  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const intensity = useSpring(
    useTransform(scrollYProgress, [0.15, 0.5, 0.85], [0, 1, 0.6]),
    { stiffness: 100, damping: 30, mass: 0.8 },
  );
  const coreScale   = useTransform(intensity, [0, 1], [1, 1.25]);
  const coreGlow    = useTransform(intensity, [0, 1], [0.25, 0.7]);
  const veilOpacity = useTransform(intensity, [0, 0.5, 1], [0, 0.45, 0.7]);

  return (
    <section ref={sectionRef} id="workflow" className="section relative">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,102,241,0.08), transparent 70%)',
          opacity: veilOpacity,
        }}
      />
      <div className="container-edge">
        <SectionHeader
          kicker="The Workflow Universe"
          title={
            <>
              Every spreadsheet, every formula,{' '}
              <span className="text-ink-300">every signal — connected.</span>
            </>
          }
          description="SheetFlow AI builds an intelligent graph across your data — sources, processes, outputs. Watch information flow, models update, and signals fire across your entire operational surface."
          align="center"
          className="mx-auto items-center text-center"
        />

        {/* Mobile: horizontal scroll wrapper so nodes never crowd or clip.
            scroll-fade-edge masks the right edge to hint at more content. */}
        <div className="scrollbar-none scroll-fade-edge mt-14 overflow-x-auto overflow-y-visible -mx-6 px-6 md:mt-20 md:mx-0 md:px-0 md:overflow-visible">
        <motion.div
          className="relative mx-auto aspect-[16/8] w-full min-w-[700px] max-w-6xl rounded-3xl border border-white/[0.06] bg-surface-1/40 p-8 backdrop-blur-xl md:min-w-0"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* SVG edge layer */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 50"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#818CF8" stopOpacity="0.08" />
                <stop offset="50%"  stopColor="#818CF8" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {EDGES.map(([a, b], i) => {
              const A = nodeMap[a];
              const B = nodeMap[b];
              // Connect right-edge of source to left-edge of target.
              // HW ≈ half-width of a node box in SVG x-units (~150px / 1152px max-w ≈ 6.5 units).
              const HW = 6.5;
              const x1 = A.x + HW;
              const y1 = A.y / 2;
              const x2 = B.x - HW;
              const y2 = B.y / 2;
              // Cubic-bezier S-curve: horizontal tangent at both endpoints = clean flow lines.
              const pull = Math.max((x2 - x1) * 0.45, 6);
              const path = `M ${x1} ${y1} C ${x1 + pull} ${y1} ${x2 - pull} ${y2} ${x2} ${y2}`;
              return (
                <g key={i}>
                  <motion.path
                    d={path}
                    stroke="url(#edgeGrad)"
                    strokeWidth="0.28"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <circle r="0.45" fill="#A5B4FC" opacity="0.85">
                    <animateMotion
                      dur="2.4s"
                      repeatCount="indefinite"
                      begin={`${1.5 + i * 0.3}s`}
                      path={path}
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Node boxes */}
          {NODES.map((n, i) => {
            const Icon = n.Icon;
            return (
              <motion.div
                key={n.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: 0.6 + i * 0.08,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                <div
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-surface-2/80 px-3.5 py-2.5 backdrop-blur-md"
                  style={{
                    boxShadow: `0 0 24px ${NODE_COLOR[n.type]}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-md"
                      style={{
                        background: `linear-gradient(135deg, ${NODE_COLOR[n.type]}33, ${NODE_COLOR[n.type]}11)`,
                        border:     `1px solid ${NODE_COLOR[n.type]}55`,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: NODE_COLOR[n.type] }} strokeWidth={2.2} />
                    </div>
                    <span className="text-[12px] font-medium text-white">{n.label}</span>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-ink-400">{n.sub}</span>
                </div>
                {n.id === 'p3' && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 -m-4 rounded-2xl"
                    style={{
                      background: 'radial-gradient(circle, rgba(99,102,241,0.45), transparent 70%)',
                      filter:  'blur(12px)',
                      opacity: coreGlow,
                      scale:   coreScale,
                    }}
                  />
                )}
              </motion.div>
            );
          })}

          {/* Live indicator */}
          <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-signal-success/30 bg-signal-success/10 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-success animate-pulse-live" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-signal-success">
              Universe Online
            </span>
          </div>
        </motion.div>
        </div>{/* end mobile scroll wrapper */}
      </div>
    </section>
  );
}
