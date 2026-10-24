import {
  Artifact,
  Chapter,
  DeviceFrame,
  SpineNode,
  type Elevation,
  type Provenance,
  type Shape,
} from '@/components/vos';
import { beat } from '@/content/narrative';

/**
 * The Run — the first section built entirely on the Visual Operating System.
 *
 * ## What it replaces
 *
 * Five `GlassCard`s in an `lg:flex-row`, each with a lucide icon in a rounded
 * square, a 17px title, a 13px paragraph and a status line. At 1440px that gave
 * each stage a **165px column**, which is why the published titles wrapped as
 * "New lead / arrives" and "AI replies & / qualifies". It was the last-but-one
 * of the five sections `docs/RC3_MOODBOARD.md` § 1 identified as the same
 * object repeated.
 *
 * The deeper failure was that a section about a **sequence in time** rendered as
 * a **grid of equals**. Five identical rectangles side by side say "five
 * features". Nothing in the composition said "then", and nothing said which
 * stage mattered.
 *
 * ## The composition, and what RC5 changed about it
 *
 * RC4 built this as a self-contained editorial grid: a **sticky left chapter**
 * carrying the headline, and a right column of stages on their own private
 * rail. That was right for one section redesigned in isolation, and wrong once
 * the whole page had a rail of its own — two vertical lines on one page read as
 * two systems, and the sticky column repeated a headline the page's chapter
 * head was already carrying 300px to its left.
 *
 * So the private rail is gone and the five stages mount on the **page** rail
 * (`Chapter`). The line that numbers the chapters is now the line the workflow
 * hangs off, which is not a compromise — it is the clearest statement the page
 * makes that these are parts of one system rather than nine drawings of one.
 *
 * The width that frees up goes to the stages: each is now its own editorial
 * row, the sentence on the left and the artifact it describes on the right,
 * instead of a 420px figure under a 46ch paragraph.
 *
 * § 8.1 repealed the constant 12px gap, and this section is why: the gap
 * between stages is **44–56px**, because here the gap *is* the passage of time.
 *
 * ## Where the emphasis goes
 *
 * § 4.1 allows exactly one `presented` surface, and § 2 allows exactly one gold
 * element, which must mark an outcome. Both are spent on the same stage —
 * **Appointment booked** — because that is the word in the section's own
 * headline: *"From first contact to booked."* Every other artifact is tier 2
 * and monochrome-blue. The composition now has a subject.
 *
 * `CRM updated` carries the `live` scan line (§ 3.3), which marks exactly one
 * thing: a surface the system is writing to.
 *
 * ## What it costs
 *
 * Zero JavaScript. The previous revision was `'use client'` and imported
 * `framer-motion`, `useInView`, `useRef`, `GlassCard` and `prefersReducedMotion`
 * to run an entrance stagger and a travelling packet. Both are now CSS —
 * the packet replaced by a scroll-traced spine, which is a better answer to
 * "show me this is a sequence" than a dot on a loop, because it is driven by
 * the reader's own progress through the story.
 */

interface Stage {
  id: string;
  num: string;
  title: string;
  detail: string;
  status: string;
  /** Status-dot colour. A token class, never a raw hex. */
  dot: string;
  elevation: Elevation;
  provenance: Provenance;
  /** Marks the surface the system is actively writing to. Exactly one. */
  live?: boolean;
  shapes?: Shape[];
  view?: { w: number; h: number };
}

const ART = { w: 420, h: 200 };

/**
 * Calendar geometry, computed rather than typed out.
 *
 * Fifteen hand-written `<rect>`s is the block nobody re-reads and where a wrong
 * coordinate hides indefinitely — and one of these cells is the section's only
 * gold element, so it is the one rectangle that must be in the right place.
 */
const CAL_COLS = [24, 98, 172, 246, 320];
const CAL_ROWS = [56, 98, 140];
const BOOKED = { col: 2, row: 1 };

const CALENDAR: Shape[] = [
  [24, 20, 372, 20, 'dim', 6],
  ...CAL_ROWS.flatMap((y, r) =>
    CAL_COLS.map(
      (x, c): Shape =>
        r === BOOKED.row && c === BOOKED.col
          ? [x, y, 66, 34, 'gold', 6]
          : [x, y, 66, 34, 'dim', 6],
    ),
  ),
];

/**
 * The five stages, with **every published string carried over verbatim** —
 * title, detail and status alike.
 *
 * This is the same rule RC2 used for `WorkflowGlyph`, RC3 for the Automation
 * Universe and RC4 for the device stage: a visual phase writes no marketing
 * copy, so nothing here needs content sign-off and no drawing can drift out of
 * agreement with the page it sits on.
 *
 * It also constrains the artifacts, which is the point. Every label a schematic
 * implies is a literal word of the sentence above it — "web form", "WhatsApp",
 * "missed call"; "contact details, notes and status"; "leads, bookings". None
 * of them invents a number, a name, a timestamp or a message body
 * (`VISUAL_DNA_V2.md` § 6).
 */
const STAGES: Stage[] = [
  {
    id: 'lead',
    num: '01',
    title: 'New lead arrives',
    detail:
      'A web form, WhatsApp message or missed call — every enquiry lands in one place.',
    status: 'Captured',
    dot: 'bg-accent-bright',
    elevation: 2,
    provenance: 'illustrative',
    // Three inputs converging on one inbox — the sentence above, drawn.
    shapes: [
      [24, 34, 96, 26, 'line', 6],
      [24, 86, 96, 26, 'line', 6],
      [24, 138, 96, 26, 'line', 6],
      [128, 46, 62, 2, 'accent', 1],
      [128, 98, 62, 2, 'accent', 1],
      [128, 150, 62, 2, 'accent', 1],
      [188, 46, 2, 106, 'accent', 1],
      [190, 98, 54, 2, 'accent', 1],
      [248, 58, 148, 84, 'dim', 10],
      [268, 80, 108, 9, 'mid', 4],
      [268, 100, 84, 8, 'line', 4],
      [268, 118, 96, 8, 'line', 4],
    ],
  },
  {
    id: 'reply',
    num: '02',
    title: 'AI replies & qualifies',
    detail:
      'An assistant answers on WhatsApp in seconds and asks the right questions.',
    status: 'Replied · <60s',
    dot: 'bg-signal-success',
    elevation: 2,
    provenance: 'illustrative',
    // Rendered as a phone, not shapes — see the JSX below. A stage whose copy
    // says "on WhatsApp" is showing a phone; a browser window would be the
    // wrong object and a bare card would be no object at all (§ 3.2).
  },
  {
    id: 'book',
    num: '03',
    title: 'Appointment booked',
    detail: 'Qualified leads get a link and land straight on your calendar.',
    status: 'Scheduled',
    dot: 'bg-gold-bright',
    // The one presented surface, and the one gold element. This is the word in
    // the section's headline.
    elevation: 4,
    provenance: 'illustrative',
    shapes: CALENDAR,
  },
  {
    id: 'crm',
    num: '04',
    title: 'CRM updated',
    detail: 'Contact details, notes and status sync across automatically. No typing.',
    status: 'Synced',
    dot: 'bg-accent-light',
    elevation: 2,
    provenance: 'illustrative',
    live: true,
    // Three field rows, because the sentence names three fields.
    shapes: [
      [24, 20, 372, 160, 'dim', 10],
      [48, 46, 84, 10, 'line', 4],
      [148, 46, 176, 10, 'mid', 4],
      [344, 42, 16, 16, 'accent', 8],
      [48, 88, 84, 10, 'line', 4],
      [148, 88, 208, 10, 'mid', 4],
      [48, 130, 84, 10, 'line', 4],
      [148, 130, 132, 10, 'mid', 4],
      [344, 126, 16, 16, 'accent', 8],
    ],
  },
  {
    id: 'report',
    num: '05',
    title: 'Daily report sent',
    detail: 'You wake up to a clean summary of leads, bookings and what needs you.',
    status: 'Delivered · 8am',
    dot: 'bg-accent',
    elevation: 2,
    provenance: 'illustrative',
    // Three rows, because the sentence names three things. No figures: a bar
    // with a length is a shape, a bar with a number beside it is a claim.
    shapes: [
      [24, 20, 372, 160, 'dim', 10],
      [48, 44, 116, 12, 'mid', 5],
      [48, 82, 78, 9, 'line', 4],
      [140, 79, 132, 14, 'accent', 3],
      [48, 116, 78, 9, 'line', 4],
      [140, 113, 92, 14, 'accent', 3],
      [48, 150, 78, 9, 'line', 4],
      [140, 147, 164, 14, 'accent', 3],
    ],
  },
];

export function WorkflowPipeline() {
  const { mark, tier, tone, grid } = beat('how-it-works');

  return (
    <Chapter
      id="how-it-works"
      mark={mark}
      tier={tier}
      tone={tone}
      grid={grid}
      kicker="How it works"
      title={
        <>
          From first contact to booked{' '}
          <span className="text-ink-300">— automatically.</span>
        </>
      }
      description="One lead, start to finish. Follow a single enquiry through the system — replied to, qualified, booked, logged and reported — without anyone lifting a finger."
    >
      {/* No `<Spine>` here any more. The rail these stations sit on belongs to
          the chapter, and it is traced by the reader's own scroll progress
          across the whole page rather than restarting at this section. */}
      <ol className="run-stages chapter-stage">
        {STAGES.map((s) => (
          <li key={s.id} className="run-stage reveal-view">
            <SpineNode className="run-node" />

            <div className="run-copy">
              <p className="run-index">{s.num}</p>
              <h3 className="run-title">{s.title}</h3>
              <p className="run-body">{s.detail}</p>

              <p className="run-status">
                <span className={`run-status-dot ${s.dot}`} aria-hidden="true" />
                {s.status}
              </p>
            </div>

            <div className="run-figure">
              {s.shapes ? (
                <Artifact
                  shapes={s.shapes}
                  view={s.view ?? ART}
                  elevation={s.elevation}
                  live={s.live}
                  provenance={s.provenance}
                />
              ) : (
                <Artifact provenance={s.provenance} elevation={s.elevation}>
                  <DeviceFrame className="run-phone">
                    <div className="run-chat" aria-hidden="true">
                      <span className="run-chat-bar" />
                      <span className="run-chat-bubble run-chat-bubble--in">
                        <i />
                        <i />
                      </span>
                      <span className="run-chat-bubble run-chat-bubble--out">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className="run-chat-bubble run-chat-bubble--in">
                        <i />
                      </span>
                    </div>
                  </DeviceFrame>
                </Artifact>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="run-coda">
        One journey shown here. The same system runs every lead, every day.
      </p>
    </Chapter>
  );
}
