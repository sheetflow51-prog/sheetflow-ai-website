import { LayoutTemplate, Rocket, LayoutDashboard, Blocks } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

/**
 * Digital Craft — the device stage.
 *
 * ## What this replaces
 *
 * Four `GlassCard`s in a `lg:grid-cols-4`, each holding a lucide icon in a
 * rounded square, a title and a paragraph. It was one of the five sections
 * `docs/RC3_MOODBOARD.md` § 1 identified as literally the same object, and RC3
 * only had budget to fix one of them. This is the second.
 *
 * A section about *what we build* that shows nothing built is the same failure
 * the Automation Universe fixed: the most inherently visual thing on offer,
 * sold entirely in body copy.
 *
 * ## Why the screens are wireframes and not screenshots
 *
 * `public/work/` holds real client captures, and using them here was the first
 * idea. It is the wrong one twice over. They already carry the `/work` case
 * studies, so reusing them makes the homepage argue the same evidence twice;
 * and there is no real capture for "Landing Pages" or "Custom Digital Assets",
 * so two of four panels would have to be invented. D24 and the `ProjectEvidence`
 * type exist precisely to stop invented evidence reaching a page.
 *
 * A wireframe claims nothing. It is legibly a layout sketch rather than a
 * photograph of a thing that shipped, which is the honest register for a
 * capability statement — and it costs no image bytes at all.
 *
 * ## What was taken from Magic UI's `Safari`, and what was not
 *
 * Its full registry source was retrieved and read. The structural ideas worth
 * keeping: a fixed screen box derived from constants rather than hand-tuned
 * offsets, and an `aspect-ratio` wrapper so the frame scales without measuring.
 *
 * Dropped: the mask punch (`safariPunch`), which exists so injected media can
 * sit *behind* SVG chrome. Nothing is injected here — the screens are drawn —
 * so the mask solves a problem this component does not have. Also dropped:
 * macOS traffic lights and a photoreal Safari toolbar, which
 * `SHEETFLOW_VISUAL_DNA.md` § 9 rejects by name as "Skeuomorphism 2.0". The
 * frame is drawn flat in brand tokens: an object the visitor recognises,
 * without the faux-3D surface that makes object-mimicry read as nostalgic.
 *
 * ## Why this ships zero JavaScript
 *
 * Selecting one of four panels is a one-of-N choice, which is what a radio
 * group *is*. Four visually-hidden radios and `:checked ~` sibling selectors
 * give tab behaviour with no state, no hydration and no client boundary — so
 * this section becomes a server component and **removes** the `framer-motion`,
 * `ScrollReveal` and `GlassCard` imports the card grid needed.
 *
 * It is also better assistive-technology behaviour than the alternative was
 * going to be: a real radio group is announced as "1 of 4" and moves under
 * arrow keys natively, where a `role="tablist"` without JavaScript would be a
 * keyboard contract the component does not actually honour.
 */

type Tone = 'dim' | 'mid' | 'line' | 'accent' | 'gold';

/**
 * Tone → class name, written out rather than interpolated.
 *
 * This is not stylistic. `` `craft-sh--${tone}` `` builds a class name that
 * never exists as a literal in any source file, and Tailwind tree-shakes custom
 * rules in `@layer components` whose selectors its content scanner cannot find.
 * The first build did exactly that: all five `.craft-sh--*` rules were dropped,
 * every `<rect>` fell back to SVG's default `fill: black`, and the wireframes
 * rendered as solid black bars inside the frame.
 *
 * It compiled, it type-checked, and it was only visible in a screenshot — the
 * same lesson RC3 recorded when its beams shipped at an alpha that made them
 * invisible. Naming the five classes here is what keeps the scanner able to see
 * them.
 */
const TONE_CLASS: Record<Tone, string> = {
  dim: 'craft-sh--dim',
  line: 'craft-sh--line',
  mid: 'craft-sh--mid',
  accent: 'craft-sh--accent',
  gold: 'craft-sh--gold',
};

/** `[x, y, width, height, tone, radius]` — see `Screen` for why this is data. */
type Shape = [number, number, number, number, Tone?, number?];

interface Craft {
  id: string;
  title: string;
  body: string;
  Icon: typeof LayoutTemplate;
  /** What the frame's address bar reads while this panel is shown. */
  slug: string;
  shapes: Shape[];
}

const SCREEN = { w: 640, h: 380 };

/**
 * The four service lines, with copy carried over from the card grid
 * **verbatim**. RC4 is a visual phase and writes no marketing copy: every
 * string below is already published and already reviewed. Same rule RC2 used
 * for `WorkflowGlyph` and RC3 used for the Automation Universe.
 *
 * Each `shapes` list is a layout skeleton, deliberately coarse. Detail would
 * push it toward looking like a capture of something real, which is the one
 * thing it must not look like.
 */
const CRAFT: Craft[] = [
  {
    id: 'websites',
    title: 'Websites',
    body: 'Fast, considered sites that represent your business as well as your work does.',
    Icon: LayoutTemplate,
    slug: 'your-business.com',
    shapes: [
      [0, 0, 640, 36, 'dim', 0],
      [24, 13, 58, 10, 'accent'],
      [452, 14, 44, 8, 'line'],
      [508, 14, 44, 8, 'line'],
      [564, 11, 52, 14, 'accent', 7],
      [40, 74, 296, 18, 'mid'],
      [40, 102, 218, 18, 'mid'],
      [40, 138, 104, 28, 'accent', 6],
      [156, 138, 88, 28, 'line', 6],
      [376, 68, 240, 128, 'dim', 10],
      [40, 224, 176, 96, 'dim', 8],
      [232, 224, 176, 96, 'dim', 8],
      [424, 224, 176, 96, 'dim', 8],
      [40, 348, 560, 2, 'line', 1],
    ],
  },
  {
    id: 'landing-pages',
    title: 'Landing Pages',
    body: 'Focused pages built to convert — for a campaign, a launch, or a single offer.',
    Icon: Rocket,
    slug: 'your-business.com/offer',
    shapes: [
      [0, 0, 640, 36, 'dim', 0],
      [24, 13, 58, 10, 'accent'],
      [560, 11, 56, 14, 'gold', 7],
      [168, 68, 304, 20, 'mid'],
      [216, 96, 208, 20, 'mid'],
      [186, 132, 132, 32, 'accent', 8],
      [330, 132, 124, 32, 'line', 8],
      [120, 190, 400, 116, 'dim', 10],
      [176, 330, 60, 12, 'line', 6],
      [252, 330, 60, 12, 'line', 6],
      [328, 330, 60, 12, 'line', 6],
      [404, 330, 60, 12, 'line', 6],
    ],
  },
  {
    id: 'dashboards',
    title: 'Dashboards',
    body: 'Live views of the numbers that matter, so you always know where things stand.',
    Icon: LayoutDashboard,
    slug: 'app.your-business.com',
    shapes: [
      [0, 0, 128, 380, 'dim', 0],
      [20, 22, 62, 10, 'accent'],
      [20, 56, 88, 8, 'line'],
      [20, 78, 72, 8, 'line'],
      [20, 100, 80, 8, 'line'],
      [20, 122, 64, 8, 'line'],
      [152, 24, 108, 64, 'dim', 8],
      [272, 24, 108, 64, 'dim', 8],
      [392, 24, 108, 64, 'dim', 8],
      [512, 24, 104, 64, 'accent', 8],
      [152, 108, 348, 152, 'dim', 8],
      [176, 214, 28, 30, 'accent', 3],
      [216, 190, 28, 54, 'accent', 3],
      [256, 202, 28, 42, 'accent', 3],
      [296, 168, 28, 76, 'gold', 3],
      [336, 196, 28, 48, 'accent', 3],
      [376, 178, 28, 66, 'accent', 3],
      [416, 208, 28, 36, 'accent', 3],
      [512, 108, 104, 152, 'dim', 8],
      [152, 284, 464, 10, 'line', 5],
      [152, 310, 464, 10, 'line', 5],
      [152, 336, 320, 10, 'line', 5],
    ],
  },
  {
    id: 'custom',
    title: 'Custom Digital Assets',
    body: 'Internal tools, portals, one-off builds — designed around how you actually work.',
    Icon: Blocks,
    slug: 'tools.your-business.com',
    shapes: [
      [0, 0, 640, 36, 'dim', 0],
      [24, 13, 58, 10, 'accent'],
      [24, 60, 200, 296, 'dim', 10],
      [44, 84, 120, 10, 'accent'],
      [44, 112, 160, 8, 'line'],
      [44, 134, 132, 8, 'line'],
      [44, 168, 160, 40, 'dim', 6],
      [44, 220, 160, 40, 'dim', 6],
      [44, 272, 160, 40, 'gold', 6],
      [248, 60, 368, 140, 'dim', 10],
      [272, 88, 148, 12, 'mid'],
      [272, 116, 320, 8, 'line'],
      [272, 138, 280, 8, 'line'],
      [272, 164, 96, 20, 'accent', 6],
      [248, 216, 176, 140, 'dim', 10],
      [448, 216, 168, 140, 'dim', 10],
    ],
  },
];

/**
 * One panel's wireframe.
 *
 * The shapes are data rather than hand-written JSX because four inline SVGs of
 * twenty elements each is eighty near-identical tags, which is exactly the kind
 * of block nobody re-reads and where a wrong coordinate hides indefinitely.
 */
function Screen({ shapes }: { shapes: Shape[] }) {
  return (
    <svg
      className="craft-screen-svg"
      viewBox={`0 0 ${SCREEN.w} ${SCREEN.h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {shapes.map(([x, y, w, h, tone = 'dim', r = 4], i) => (
        <rect
          key={`${x}-${y}-${i}`}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={r}
          className={TONE_CLASS[tone]}
        />
      ))}
    </svg>
  );
}

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

        {/* The radios lead the container so `:checked ~` can reach both the
            labels and the stage. They are visually hidden but never
            `display: none` — that would take them out of the focus order and
            the whole control would stop working for the keyboard. */}
        <div className="craft">
          {CRAFT.map((c, i) => (
            <input
              key={c.id}
              type="radio"
              name="craft"
              id={`craft-${c.id}`}
              className="craft-radio"
              defaultChecked={i === 0}
            />
          ))}

          {/* No `role="group"` here: the radios are siblings *before* this
              element, not children of it, so a group role would name a
              container that holds none of the controls it claims to group. The
              shared `name="craft"` is what actually groups them, and it is what
              makes assistive technology announce "1 of 4". */}
          <div className="craft-tabs">
            {CRAFT.map((c) => {
              const Icon = c.Icon;
              return (
                <label key={c.id} htmlFor={`craft-${c.id}`} className="craft-tab">
                  <Icon className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                  <span>{c.title}</span>
                </label>
              );
            })}
          </div>

          {/* The frame. Chrome is CSS so it stays crisp at any width; only the
              screen is SVG. */}
          <div className="craft-stage">
            <div className="craft-frame">
              <div className="craft-chrome">
                <span className="craft-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="craft-omnibox" aria-hidden="true">
                  {CRAFT.map((c) => (
                    <em key={c.id} className="craft-url" data-craft={c.id}>
                      {c.slug}
                    </em>
                  ))}
                </span>
              </div>

              <div className="craft-screen">
                {CRAFT.map((c) => (
                  <div key={c.id} className="craft-panel" data-craft={c.id}>
                    <Screen shapes={c.shapes} />
                  </div>
                ))}
                {/* A single sweep across the glass. It reads as a screen that is
                    on rather than a picture of one, and it is one element
                    moving on the compositor. */}
                <span className="craft-sheen" aria-hidden="true" />
              </div>
            </div>

            {/* Stated, not implied. These are layout skeletons, and a visitor
                should not have to work out that they are not screenshots. */}
            <p className="craft-note">Indicative layouts — every build is designed from scratch.</p>
          </div>

          {/* One caption, swapped in place. Four stacked captions would be four
              more rectangles, which is the problem this section exists to
              solve. `aria-live` is deliberately absent: the radio group already
              announces the change, and a live region would say it twice. */}
          <div className="craft-captions">
            {CRAFT.map((c) => (
              <p key={c.id} className="craft-caption" data-craft={c.id}>
                {c.body}
              </p>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-md text-center text-[13px] text-ink-400 md:mt-14">
          One team, from automation to the site it runs on. Tell us what you need built.
        </p>
      </div>
    </section>
  );
}
