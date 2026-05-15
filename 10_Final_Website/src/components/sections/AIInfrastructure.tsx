'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';

const INTEGRATIONS = [
  ['Google Sheets', 4, 6],
  ['Excel', 8, 22],
  ['Airtable', 16, 10],
  ['Notion', 28, 26],
  ['Slack', 40, 12],
  ['Salesforce', 58, 18],
  ['HubSpot', 70, 8],
  ['Stripe', 82, 24],
  ['QuickBooks', 92, 16],
  ['Linear', 12, 62],
  ['Zapier', 26, 76],
  ['Webhooks', 38, 80],
  ['Postgres', 54, 80],
  ['Snowflake', 66, 70],
  ['BigQuery', 78, 78],
  ['Discord', 88, 62],
] as const;

export function AIInfrastructure() {
  return (
    <section id="integrations" className="section relative">
      {/* Background grid */}
      <div className="absolute inset-0 -z-10 grid-backdrop opacity-30" aria-hidden="true" />

      <div className="container-edge">
        <SectionHeader
          kicker="The Ecosystem"
          title={
            <>
              The intelligence layer{' '}
              <span className="text-ink-300">connects to everything.</span>
            </>
          }
          description="SheetFlow AI is a layer, not a silo. It bonds with the spreadsheets, databases, communication tools, and operational systems your team already uses."
          align="center"
          className="mx-auto items-center text-center"
        />

        {/* Mobile: horizontal scroll wrapper so ecosystem nodes stay legible.
            scroll-fade-edge softens the right edge to hint at more content. */}
        <div className="scrollbar-none scroll-fade-edge mt-14 overflow-x-auto overflow-y-visible -mx-6 px-6 md:mt-0 md:mx-0 md:px-0 md:overflow-visible">
        <motion.div
          className="relative mx-auto aspect-[16/8] w-full min-w-[700px] max-w-6xl md:mt-20 md:min-w-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1.0 }}
        >
          {/* Center node — SheetFlow AI */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div
                className="absolute inset-0 -m-12 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)',
                  filter: 'blur(20px)',
                }}
                aria-hidden="true"
              />
              <motion.div
                className="relative flex h-28 w-28 items-center justify-center rounded-full border border-accent-bright/40 bg-surface-1/80 backdrop-blur-xl"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                style={{
                  boxShadow: '0 0 40px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                <div className="text-center">
                  <p className="font-display text-[11px] font-semibold tracking-tight text-white">
                    SheetFlow
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-accent-bright">
                    Core
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Connection lines */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 50"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {INTEGRATIONS.map((node, i) => {
              const [, x, y] = node;
              return (
                <motion.line
                  key={`line-${i}`}
                  x1="50"
                  y1="25"
                  x2={x}
                  y2={y / 2}
                  stroke="rgba(129, 140, 248, 0.15)"
                  strokeWidth="0.15"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.04 }}
                />
              );
            })}
          </svg>

          {/* Integration nodes */}
          {INTEGRATIONS.map((node, i) => {
            const [name, x, y] = node;
            return (
              <motion.div
                key={name}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.04, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div className="rounded-full border border-white/10 bg-surface-2/60 px-3 py-1.5 backdrop-blur-md transition-all hover:border-accent/40 hover:bg-surface-2/90">
                  <span className="text-[11px] font-medium text-white/85">{name}</span>
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
          + 60 more integrations · Native connectors built monthly · Open API for the rest
        </motion.p>
      </div>
    </section>
  );
}
