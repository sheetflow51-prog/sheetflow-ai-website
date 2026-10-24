import {
  AudioLines,
  BookOpenCheck,
  Boxes,
  Building2,
  CircleCheck,
  ClipboardCheck,
  Cpu,
  Ear,
  FileCode2,
  FileText,
  Filter,
  FolderInput,
  Inbox,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  MessageCircle,
  MessagesSquare,
  MousePointerClick,
  PackageCheck,
  PhoneCall,
  ScanLine,
  ScanText,
  Search,
  Send,
  Share2,
  Sheet,
  ShieldCheck,
  Sparkles,
  Table2,
  Volume2,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ArchitectureStage } from '@/content/work';

/**
 * WorkflowGlyph — the pipeline a build actually runs, drawn.
 *
 * ## Why this exists
 *
 * Five of the ten case studies are internal systems with no deployment to
 * screenshot. Before RC2 their `/work` tiles rendered a label, ~150px of empty
 * box, and three file paths — so half the portfolio grid read as broken cards
 * beside five finished ones. That is the inverse of the truth: those five are
 * the largest engineering on the site. See `docs/RC2_VISUAL_AUDIT.md` § V1–V3.
 *
 * ## It draws published data, and invents nothing
 *
 * Every node is a `project.architecture[].stage` — a string that is already
 * reviewed, already published, and already rendered in prose in the detail
 * cards below this glyph. There is no separate "diagram content" that could
 * drift out of agreement with the case study, because there is no separate
 * content at all.
 *
 * That constraint improved the result rather than limiting it. The brief
 * sketched the accounting system as `WhatsApp → AI → Ledger`; the published
 * architecture is `Receive → Parse → Stage → Post`, and the `Stage` node is the
 * human-verification boundary that the whole case study is about. The sketch
 * would have drawn a diagram contradicting the page under it.
 *
 * ## Why it is markup and not an SVG
 *
 * Same reason `ArchitectureFlow` is an `<ol>`: an SVG flowchart is one image to
 * a screen reader, and the connectors — which carry the sequence — reach the
 * accessibility tree as nothing at all. Here the `<ol>` *is* the sequence and
 * every label is real text. Connectors are decorative CSS drawn behind the
 * nodes, so removing them removes styling, not meaning.
 *
 * It is also why there is no viewBox: text inside a scaled `<svg>` shrinks with
 * the box, and a 10px label at a 320px card width would have been ~5px.
 *
 * ## Cost
 *
 * No `'use client'`, no motion library, no runtime. RC2 opened with **9.1 kB**
 * of gzip JS headroom against a 360 kB budget, so a client component here was
 * not affordable at any quality. lucide icons render to inline SVG on the
 * server and ship no JavaScript.
 *
 * Motion is likewise rationed. The connector dashes drift **on hover only** —
 * `/work` renders five of these and five always-running animations on a route
 * that scores 64 on mobile is a cost with no defence. The `panel` variant plays
 * a single 900ms cascade on load and then stops.
 */

/**
 * Stage name → icon.
 *
 * Keyed by the exact published `stage` string rather than by inference from its
 * words. A keyword matcher would silently hand a wrong-but-plausible icon to
 * any stage added later; a missing key here falls back to a neutral mark, and
 * `tests/e2e/work.spec.ts` asserts that every published stage has an entry, so
 * the fallback is a safety net rather than a rendering path anyone relies on.
 */
const STAGE_ICONS: Record<string, LucideIcon> = {
  // Client and demonstration builds — an enquiry moving through a website.
  'Capture': Inbox,
  'Qualify': ShieldCheck,
  'Route': Share2,
  'Track': LayoutDashboard,
  'Be found': Search,
  'Confirm': CircleCheck,
  'Answer': MessagesSquare,
  'Publish inventory': Building2,
  'Deliver': FileCode2,
  'Persuade': Sparkles,
  'Model': Boxes,
  'Compose': LayoutGrid,
  'Reach': MousePointerClick,

  // WhatsApp Accounting OS — a message becoming a ledger entry.
  'Receive': MessageCircle,
  'Parse': ScanText,
  'Stage': ClipboardCheck,
  'Post': BookOpenCheck,

  // WPC Design Automation — an image becoming a toolpath.
  'Ingest': FolderInput,
  'Compile': Cpu,
  'Emit roles': Layers,
  'Deliver atomically': PackageCheck,

  // Outbound Lead Engine — a raw sheet becoming a conversation.
  'Clean & score': Filter,
  'Send': Send,
  'Listen': Ear,

  // AI Voice Receptionist — a dial becoming a logged outcome.
  'Dial': PhoneCall,
  'Converse': AudioLines,
  'Speak': Volume2,
  'Record': FileText,

  // Bank Statement Parser — a PDF becoming a workbook.
  'Read': ScanLine,
  'Structure': Table2,
  'Publish to Excel': Sheet,
};

/** Exported for the parity test, which asserts every published stage is keyed. */
export const KNOWN_STAGES = Object.keys(STAGE_ICONS);

type GlyphVariant = 'tile' | 'panel' | 'rail';

/**
 * Per-variant geometry, as CSS custom properties.
 *
 * The connector has to meet the node at its vertical centre, and the node size
 * changes per variant and per breakpoint. Driving both from one `--glyph-node`
 * value means the connector's `top` is `calc(var(--glyph-node) / 2)` and cannot
 * drift out of alignment when a size is tuned.
 */
const GEOMETRY: Record<GlyphVariant, string> = {
  tile: 'glyph-tile',
  panel: 'glyph-panel',
  rail: 'glyph-rail',
};

export function WorkflowGlyph({
  stages,
  variant = 'rail',
  className,
  /**
   * Renders the stage's first architecture node as a sublabel. `panel` only —
   * at tile and rail sizes a second line of type below a 44px node crowds the
   * label it is meant to support.
   */
  withDetail = false,
  /**
   * Names the list for assistive technology.
   *
   * Required wherever the glyph is **not** `aria-hidden`, which is the `/work`
   * tile alone. There, the stage names are not restated anywhere else on the
   * page, so hiding them would remove information rather than remove noise —
   * but an unlabelled `<ol>` reading "Receive, Parse, Stage, Post" inside a card
   * link gives no clue what the four words are. In the `panel` and `rail`
   * placements the surrounding element carries `aria-hidden`, because there the
   * same stage names are announced in full by the architecture section.
   */
  label,
}: {
  stages: ArchitectureStage[];
  variant?: GlyphVariant;
  className?: string;
  withDetail?: boolean;
  label?: string;
}) {
  return (
    <ol
      aria-label={label}
      className={cn(
        'glyph relative flex w-full items-start justify-between',
        GEOMETRY[variant],
        className,
      )}
    >
      {stages.map((stage, i) => {
        const Icon = STAGE_ICONS[stage.stage] ?? Workflow;
        return (
          <li
            key={stage.stage}
            className="glyph-step relative flex min-w-0 flex-1 flex-col items-center"
            /* Drives the one-shot cascade in the `panel` variant. Inline
               because the delay is per-index and Tailwind cannot express an
               arbitrary computed value per element. */
            style={{ '--glyph-i': i } as React.CSSProperties}
          >
            {/* Connector back to the previous node. `right-1/2 w-full` spans
                exactly from this node's centre to the previous node's centre,
                whatever the column width — no magic numbers, and it stays
                aligned when the grid reflows. Decorative: the <ol> already
                carries the sequence. */}
            {i > 0 && <span aria-hidden="true" className="glyph-link" />}

            <span className="glyph-node" aria-hidden="true">
              <Icon className="glyph-icon" strokeWidth={1.9} />
            </span>

            <span className="glyph-label">{stage.short ?? stage.stage}</span>

            {withDetail && stage.nodes[0] && (
              <span className="glyph-detail">{stage.nodes[0]}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
