'use client';

import { LayoutTemplate, Rocket, LayoutDashboard, Blocks } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

interface Craft {
  id: string;
  title: string;
  body: string;
  Icon: typeof LayoutTemplate;
}

// A distinct service line from the automation work: design & build.
// Kept deliberately monochrome (single accent) so it reads as quiet range,
// not a second loud grid — the automation sections carry the color.
const CRAFT: Craft[] = [
  {
    id: 'websites',
    title: 'Websites',
    body: 'Fast, considered sites that represent your business as well as your work does.',
    Icon: LayoutTemplate,
  },
  {
    id: 'landing-pages',
    title: 'Landing Pages',
    body: 'Focused pages built to convert — for a campaign, a launch, or a single offer.',
    Icon: Rocket,
  },
  {
    id: 'dashboards',
    title: 'Dashboards',
    body: 'Live views of the numbers that matter, so you always know where things stand.',
    Icon: LayoutDashboard,
  },
  {
    id: 'custom',
    title: 'Custom Digital Assets',
    body: 'Internal tools, portals, one-off builds — designed around how you actually work.',
    Icon: Blocks,
  },
];

export function DigitalCraft() {
  return (
    <section id="build" className="section relative">
      <div className="container-edge">
        <SectionHeader
          kicker="Beyond Automation"
          title={
            <>
              Websites, dashboards, and every digital asset —{' '}
              <span className="text-ink-300">built around your business.</span>
            </>
          }
          description="Automation is where most of our work starts, not where it ends. We design and build the websites, landing pages, and dashboards your business runs on — each one made to order, each one yours to keep."
        />

        <ScrollReveal
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-16 md:gap-5 lg:grid-cols-4"
          y={24}
          duration={0.7}
          stagger={0.08}
        >
          {CRAFT.map((c) => {
            const Icon = c.Icon;
            return (
              <div key={c.id}>
                <GlassCard variant="feature" className="group h-full" interactive>
                  <div className="relative flex h-full flex-col">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
                      <Icon
                        className="h-4 w-4 text-accent-bright"
                        strokeWidth={2.2}
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mt-6 text-[19px] font-semibold leading-[1.2] tracking-tight text-white md:text-[20px]">
                      {c.title}
                    </h3>

                    <p className="mt-2.5 text-[14px] leading-relaxed text-ink-300/95">
                      {c.body}
                    </p>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </ScrollReveal>

        <p className="mx-auto mt-10 max-w-md text-center text-[13px] text-ink-400 md:mt-14">
          One team, from automation to the site it runs on. Tell us what you need built.
        </p>
      </div>
    </section>
  );
}
