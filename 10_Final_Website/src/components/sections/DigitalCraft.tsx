import { LayoutTemplate, Rocket, LayoutDashboard, Blocks } from 'lucide-react';
import { Artifact, BrowserFrame, Chapter, Schematic, type Shape } from '@/components/vos';
import { beat } from '@/content/narrative';

/**
 * Digital Craft — the device stage. Chapter 05.
 *
 * ## What this replaced, and what RC5 changed
 *
 * RC4 replaced four `GlassCard`s in a `lg:grid-cols-4` — one of the five
 * sections `docs/RC3_MOODBOARD.md` § 1 identified as literally the same object
 * — with a browser window whose screen swaps between four builds. That
 * composition is unchanged and correct.
 *
 * What RC5 changed is that **none of it was reusable**. The frame, its chrome,
 * its omnibox, its screen, its sheen and a second private copy of the wireframe
 * renderer all lived inline in this file, so the site had two browser-window
 * implementations waiting to happen and two five-entry tone maps with different
 * alphas. It is item 1 of the migration list in `VISUAL_OPERATING_SYSTEM.md`.
 *
 * Now: `BrowserFrame` draws the window, `Schematic` draws the screens, and
 * `Artifact` emits the provenance caption that this file used to hand-write.
 * What is left here is what is genuinely this section's — the four builds, and
 * the radio group that swaps them.
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
 * ## Why this ships zero JavaScript
 *
 * Selecting one of four panels is a one-of-N choice, which is what a radio
 * group *is*. Four visually-hidden radios and `:checked ~` sibling selectors
 * give tab behaviour with no state, no hydration and no client boundary.
 *
 * It is also better assistive-technology behaviour than the alternative was
 * going to be: a real radio group is announced as "1 of 4" and moves under
 * arrow keys natively, where a `role="tablist"` without JavaScript would be a
 * keyboard contract the component does not actually honour.
 */

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
 * **verbatim**. RC4 was a visual phase and wrote no marketing copy: every
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

export function DigitalCraft() {
  const { mark, tier, tone, grid } = beat('build');

  return (
    <Chapter
      id="build"
      mark={mark}
      tier={tier}
      tone={tone}
      grid={grid}
      kicker="Beyond automation"
      title={
        <>
          Websites, dashboards, and every digital asset —{' '}
          <span className="text-ink-300">built around your business.</span>
        </>
      }
      description="Automation is where most of our work starts, not where it ends. We design and build the websites, landing pages, and dashboards your business runs on — each one made to order, each one yours to keep."
    >
      {/* The radios lead the container so `:checked ~` can reach the labels,
          the stage and the captions alike. They are visually hidden but never
          `display: none` — that would take them out of the focus order and the
          whole control would stop working for the keyboard. */}
      <div className="craft chapter-stage">
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

        <div className="craft-stage">
          {/* `Artifact` with `children` renders no `Surface` of its own — a
              child that is already a frame *is* the surface, and wrapping it in
              another gives a frame inside a frame. What it does contribute is
              the caption, which this file used to write by hand and which
              § 6 requires. */}
          <Artifact
            provenance="indicative"
            note="Indicative layouts — every build is designed from scratch."
          >
            <BrowserFrame
              sheen
              ratio={`${SCREEN.w} / ${SCREEN.h}`}
              url={CRAFT.map((c) => (
                <em key={c.id} className="vos-browser-url craft-url" data-craft={c.id}>
                  {c.slug}
                </em>
              ))}
            >
              {CRAFT.map((c) => (
                <div key={c.id} className="craft-panel" data-craft={c.id}>
                  {/* `slice`, not `meet`: the frame fixes the aspect here, so a
                      letterboxed drawing would leave two bands of dead screen. */}
                  <Schematic shapes={c.shapes} view={SCREEN} fit="slice" />
                </div>
              ))}
            </BrowserFrame>
          </Artifact>
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

      <p className="mt-10 max-w-md text-[13px] text-ink-400 md:mt-14">
        One team, from automation to the site it runs on. Tell us what you need built.
      </p>
    </Chapter>
  );
}
