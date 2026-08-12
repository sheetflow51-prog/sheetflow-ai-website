import { MessageCircle, Users, CalendarClock, Workflow, CreditCard, Boxes } from 'lucide-react';
import { Chapter } from '@/components/vos';
import { beat } from '@/content/narrative';

/**
 * AI Infrastructure — the distribution bus.
 *
 * ## What this replaces, and why it was the top of the RC4 list
 *
 * RC3 planned this section as "Move 4" and **did not deliver it**, for a reason
 * it recorded honestly (`docs/RC3_SUMMARY.md` § 7): the six branches wrapped to
 * two rows at `lg:grid-cols-3`, so a distribution bus could only connect the
 * first row. A half-connected diagram reads worse than a clean grid, so the
 * clean grid stayed and the debt was written down.
 *
 * The fix is the one RC3 named: a **bilateral tree** — hub on the left,
 * branches on the right, one row per branch. That is a layout change rather
 * than a polish change, which is why it needed its own phase.
 *
 * ## Why every connector is CSS, and there is no SVG
 *
 * The obvious implementation is an SVG bus in a gutter column, with one curve
 * per branch. It was written and rejected on a specific defect: branch rows are
 * content-sized (a category with six tool chips is taller than one with two),
 * so the curve endpoints are unknown until layout runs. Every escape from that
 * costs something real:
 *
 *   - Measure at runtime → `getBoundingClientRect` in an effect under a
 *     `ResizeObserver`, which is precisely the Magic UI `AnimatedBeam` cost
 *     model RC3 rejected for the Automation Universe.
 *   - Fix the row heights → chips overflow at the `md` breakpoint, where the
 *     branch column is at its narrowest.
 *   - `preserveAspectRatio="none"` with proportional geometry → correct, and it
 *     was the near-miss. Non-uniform scale distorts the travelling signal: a
 *     4px dot renders as a 1.35:1 ellipse in the gutter's real aspect ratio.
 *     `vector-effect` fixes strokes, not shapes.
 *
 * A vertical spine with horizontal stubs needs **no coordinate system at all**.
 * It is also the canonical way this diagram is drawn everywhere it is drawn for
 * real — n8n, Zapier and AWS architecture diagrams all use a bus and stubs, not
 * a fan of curves. Nothing is measured, so nothing can drift.
 *
 * ## Why this is a server component
 *
 * The previous revision was `'use client'` and imported `framer-motion`,
 * `useInView`, `Breathing` and `prefersReducedMotion` to run an entrance reveal,
 * a breathing hub and one trunk signal. None of that needs state: they are three
 * animations that play on their own schedule. Moved to CSS, the section holds no
 * state, so it ships **zero JavaScript** — this change *removes* bundle weight
 * rather than adding it. Same conclusion the Automation Universe reached.
 *
 * ## Accessibility
 *
 * Every connector is a pseudo-element, so the tree is decoration that assistive
 * technology never sees, and the content is a plain nested list: six categories,
 * each with its tools. The travelling signal is behind
 * `prefers-reduced-motion: no-preference` in the stylesheet.
 */

interface Branch {
  id: string;
  label: string;
  Icon: typeof MessageCircle;
  /** Icon tint. A token class, never a raw hex. */
  tint: string;
  tools: string[];
}

/**
 * The six categories, carried over from the previous revision **verbatim**.
 *
 * RC4 is a visual phase and writes no marketing copy: every string below is
 * already published and already reviewed, so no diagram can drift out of
 * agreement with the page it sits on. Same rule RC2 used for `WorkflowGlyph`
 * and RC3 used for the Automation Universe.
 */
const BRANCHES: Branch[] = [
  {
    id: 'messaging',
    label: 'Messaging & Leads',
    Icon: MessageCircle,
    tint: 'text-accent-bright',
    tools: ['WhatsApp', 'Instagram', 'Gmail', 'Slack', 'Mailchimp', 'Twilio'],
  },
  {
    id: 'crm',
    label: 'CRM & Pipeline',
    Icon: Users,
    tint: 'text-gold-bright',
    tools: ['HubSpot', 'Pipedrive', 'GoHighLevel', 'Airtable'],
  },
  {
    id: 'scheduling',
    label: 'Scheduling',
    Icon: CalendarClock,
    tint: 'text-accent-light',
    tools: ['Google Cal', 'Calendly'],
  },
  {
    id: 'automation',
    label: 'Automation & AI',
    Icon: Workflow,
    tint: 'text-accent',
    tools: ['n8n', 'Zapier', 'Make', 'Claude', 'Microsoft Excel'],
  },
  {
    id: 'payments',
    label: 'Payments',
    Icon: CreditCard,
    tint: 'text-gold',
    tools: ['Stripe', 'QuickBooks'],
  },
  {
    id: 'more',
    label: 'Custom & More',
    Icon: Boxes,
    tint: 'text-accent-light',
    tools: ['Notion', 'Google Drive', 'Telegram', 'Webhooks', '+40 more'],
  },
];

export function AIInfrastructure() {
  const { mark, tier, tone, grid } = beat('integrations');

  return (
    <Chapter
      id="integrations"
      mark={mark}
      tier={tier}
      tone={tone}
      grid={grid}
      kicker="Plays nicely with your stack"
      title={
        <>
          One hub, wired into{' '}
          <span className="text-ink-300">every tool you already use.</span>
        </>
      }
      description="No rip-and-replace. SheetFlow sits at the centre and branches out into your messaging, CRM, calendar, automation and billing — orchestrating what's already in place."
    >
      <div className="infra chapter-stage">
          {/* The hub is drawn as a *plate*, not a disc, deliberately. The
              Automation Universe already owns the radial core on this page, and
              two glowing circles would be the same repetition RC3 exists to
              remove. A stacked unit reads as infrastructure; a disc reads as a
              second sun. The three rules are the logo mark
              (SHEETFLOW_VISUAL_DNA.md § 6.1), which is what keeps them one
              family rather than two unrelated drawings. */}
          <div className="infra-hub">
            <div className="infra-hub-plate">
              <span className="infra-hub-rules" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <p className="infra-hub-name">SheetFlow</p>
              <p className="infra-hub-role">Automation</p>
            </div>
          </div>

          <ul className="infra-branches">
            {BRANCHES.map((b, i) => {
              const Icon = b.Icon;
              return (
                <li
                  key={b.id}
                  className="infra-branch"
                  /* Stagger index for the travelling signal. One packet per
                     stub, spaced so the bus reads as distributing top-to-bottom
                     rather than pulsing all six at once — the same
                     one-in-flight discipline as the Universe's beams. */
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <span className="infra-branch-badge">
                    <Icon className={`h-4 w-4 ${b.tint}`} strokeWidth={2.2} aria-hidden="true" />
                  </span>

                  <div className="infra-branch-body">
                    <p className="infra-branch-label">{b.label}</p>
                    <ul className="infra-tools">
                      {b.tools.map((t) => (
                        <li key={t} className="infra-tool">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-10 max-w-md text-[13px] text-ink-400 md:mt-12">
          50+ integrations supported · Custom connections built on request · Your stack stays yours
        </p>
    </Chapter>
  );
}
