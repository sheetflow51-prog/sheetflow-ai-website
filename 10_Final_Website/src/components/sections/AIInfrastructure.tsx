'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';

// Split across three rows that scroll in alternating directions. Grouping is
// loosely by kind (capture / ops / money) but the visual point is a calm,
// continuously-moving "wall of tools" — no lines, no geometry to misalign.
const ROWS: string[][] = [
  ['WhatsApp', 'Instagram', 'Gmail', 'Google Sheets', 'Google Cal', 'Calendly', 'Slack'],
  ['HubSpot', 'Pipedrive', 'Airtable', 'n8n', 'Claude', 'Zapier'],
  ['Make', 'GoHighLevel', 'Twilio', 'Stripe', 'QuickBooks', 'Mailchimp'],
];

function Pill({ name, i }: { name: string; i: number }) {
  // Alternate the accent dot blue / gold to echo the logo without a rainbow.
  const dot = i % 2 === 0 ? 'bg-accent-bright' : 'bg-violet-bright';
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-accent/40 bg-surface-2/80 px-4 py-2 shadow-[0_0_16px_rgba(59,130,246,0.14)] backdrop-blur-md">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="whitespace-nowrap text-[13px] font-medium text-white/90">{name}</span>
    </div>
  );
}

function MarqueeRow({ items, reverse, duration }: { items: string[]; reverse?: boolean; duration: number }) {
  // Doubled list + translateX(-50%) = seamless loop. Pause on hover.
  const doubled = [...items, ...items];
  return (
    <div
      className="sf-row relative overflow-hidden py-1"
      style={{
        WebkitMaskImage:
          'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)',
        maskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)',
      }}
    >
      <div
        className="sf-marquee flex w-max gap-3 pr-3"
        style={{ animation: `${reverse ? 'sf-marq-r' : 'sf-marq-l'} ${duration}s linear infinite` }}
      >
        {doubled.map((name, i) => (
          <Pill key={`${name}-${i}`} name={name} i={i} />
        ))}
      </div>
    </div>
  );
}

export function AIInfrastructure() {
  return (
    <section id="integrations" className="section relative">
      {/* Background grid + a soft central glow so the wall of tools sits on light */}
      <div className="absolute inset-0 -z-10 grid-backdrop opacity-30" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[720px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(59,130,246,0.12), rgba(233,162,59,0.05) 45%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      <style>{marqueeCss}</style>

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

        <motion.div
          className="mt-14 flex flex-col gap-4 md:mt-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <MarqueeRow items={ROWS[0]} duration={46} />
          <MarqueeRow items={ROWS[1]} reverse duration={40} />
          <MarqueeRow items={ROWS[2]} duration={52} />
        </motion.div>

        <motion.p
          className="mx-auto mt-10 max-w-md text-center text-[13px] text-ink-400 md:mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          50+ integrations supported · Custom connections built on request · Your stack stays yours
        </motion.p>
      </div>
    </section>
  );
}

const marqueeCss = `
@keyframes sf-marq-l { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes sf-marq-r { from { transform: translateX(-50%); } to { transform: translateX(0); } }
.sf-row:hover .sf-marquee { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .sf-marquee { animation: none !important; transform: none !important; }
  .sf-row { overflow-x: auto; }
}
`;
