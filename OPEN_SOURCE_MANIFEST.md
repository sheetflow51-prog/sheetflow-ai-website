# Open Source Manifest

> Every third-party implementation this project reuses, and — equally — every
> one it evaluated and declined, with the reason.
> Created **2026-08-07**. Maintained on every phase that writes UI or utilities.

## How to read this

A manifest that only lists what was adopted reads like an endorsement and hides
the more useful half: what was considered and rejected, so the next person does
not re-run the same evaluation. Both are recorded here.

**The honest headline: zero third-party UI components have been imported into
this codebase, and that is a decision (D15), not an oversight.** The reasoning
is in the "Declined" table. If you are here to add one, read that first — it
may already answer you, and if it does not, it tells you what would change the
answer.

---

## Reused — shipping in the product

### Runtime dependencies

These are the libraries the site actually ships. Listed because "open source
we depend on" is the question this file exists to answer, and `package.json`
records the version but never the reason.

| Package | Licence | What it does here | Why this one |
|---|---|---|---|
| `next` 16.2.6 | MIT | App Router, RSC, image optimisation, metadata, OG image generation at the edge | The deployment target is Vercel; the metadata and `ImageResponse` APIs remove two whole categories of hand-rolled code (see the OG cards below) |
| `react` / `react-dom` 19 | MIT | — | Next 16 requires it |
| `framer-motion` 11 | MIT | Section reveals, mobile menu transitions, `SectionHeader` stagger | Declarative `whileInView` with viewport margins; hand-rolling IntersectionObserver choreography for 10 sections is the reinvention this file exists to prevent. **Costs 90 ms of load-phase main thread** — the second-ranked entry, and a known trade |
| `gsap` 3 | MIT (standard) | ScrollTrigger-driven signature moments | Nothing else does scrub-linked timelines at this quality. 37 ms load-phase |
| `lenis` 1 | MIT | Smooth scroll | Small, framework-agnostic, does not fight native scroll anchoring |
| `zustand` 5 | MIT | Nav scroll state, audio store | 1 kB against Context re-render churn |
| `lucide-react` | ISC | Icons | Tree-shakeable, consistent 24px grid, no icon-font hack |
| `clsx` + `tailwind-merge` | MIT | `cn()` class composition | The standard pair; writing a correct Tailwind conflict resolver is a genuinely hard problem already solved |
| `class-variance-authority` | Apache-2.0 | `Button` variants | Typed variant maps, no runtime cost worth naming |
| `tailwindcss` 3.4 | MIT | The token system's delivery mechanism | `brand-os/01_design-tokens` mirrors into `tailwind.config.ts` |
| `@vercel/analytics`, `@vercel/speed-insights` | Apache-2.0 | Field Web Vitals | The only source of *field* data; lab numbers cannot answer A2 |
| `sharp` 0.34 / libvips | Apache-2.0 / LGPL-2.1 | `npm run brand` raster pipeline | DEC-302's generator. libvips is LGPL and used as an unmodified library dependency, not linked into shipped code |

### Verification and tooling

| Package | Licence | What it does here |
|---|---|---|
| `@playwright/test` 1.62 | Apache-2.0 | 132-test suite against the production build |
| `@axe-core/playwright` 4.12 | MPL-2.0 | WCAG 2.1 AA gate, default and reduced-motion paths |
| `lighthouse` 13.4 | Apache-2.0 | `npm run audit:lh`, median of N |
| `eslint` 9 + `eslint-config-next` | MIT | Flat config |
| `typescript` 5.6 | Apache-2.0 | The real gate — `next build` does not fail on type errors (D6) |
| `@next/bundle-analyzer` | MIT | `npm run analyze` treemap |

### Skills and agent tooling

| Source | Licence | Reused | Notes |
|---|---|---|---|
| [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) @ `14ddef5` | **MIT** | 7 Claude Skills — `ui-ux-pro-max`, `design-system`, `design`, `brand`, `banner-design`, `slides`, `ui-styling` | Cloned to `C:/Users/pc/Claude_Skills/repo`, installed to `~/.claude/skills/`. **Verified 2026-08-07: all 7 installed copies are byte-identical to the repo — no local drift.** Two have been used on this project (`ui-ux-pro-max` for review, `design-system` for token reconciliation); the other five are installed and unused, because the visual language is frozen by `EXPERIENCE_GOVERNANCE.md` and DEC-301/302 |

**Modifications made to any of the above: none.** Every package is consumed at
its published version through `package.json`; no vendored forks, no patched
`node_modules`, no `patch-package`.

---

## Written custom, and why nothing was reused

Each of these was checked against an existing solution before being written.
Recording the *reason* matters more than the outcome — an unexplained "we built
it ourselves" is indistinguishable from not having looked.

| What | Existing option considered | Why custom won |
|---|---|---|
| **FAQ disclosure** (`sections/Faq.tsx`, service pages) | Radix Accordion, shadcn/ui Accordion, Headless UI Disclosure | Native `<details>/<summary>` beats all three *for this requirement*. The answers must be in the DOM whether or not JS ran, because crawlers and LLM retrievers do not click — every JS accordion fails that. Keyboard handling, focus and expanded state are the browser's, so they cannot drift out of sync with ARIA. Find-in-page opens the panel for free. **Fewer bytes and strictly better semantics** |
| **Breadcrumb** (`ServiceBreadcrumb.tsx`) | shadcn/ui Breadcrumb | ~40 lines against a dependency, and shadcn's version would need restyling to the token system anyway. The non-obvious parts — `aria-current="page"`, last crumb not a link, markup/JSON-LD parity — are requirements no library ships by default |
| **Social cards** (`lib/og-card.tsx`) | Static PNGs, Vercel OG playground templates, `@vercel/og` | `next/og` **is** the reused implementation — Satori and resvg do the work. What is custom is 150 lines of layout, which is the part that has to be ours because it is brand |
| **Bundle budget** (`scripts/audit-bundle.mjs`) | `bundlesize`, `size-limit` | Both assume a per-entry config listing files; Turbopack emits content-hashed chunk names that change every build. Walking `.next/static` and gzipping is ~60 lines and needs no maintenance when a chunk name changes |
| **Main-thread profiler** (`scripts/profile-main-thread.mjs`) | `source-map` npm package | Would have added a dependency for ~40 lines of Base64-VLQ decoding, in a script that already speaks CDP directly. Also lets the script read each chunk's trailing `sourceMappingURL` — the thing Turbopack breaks if you derive map names by appending `.map` |
| **Lighthouse runner** (`scripts/audit-lighthouse.mjs`) | `chrome-launcher` | Reuses Playwright's already-downloaded Chromium over CDP. Adding `chrome-launcher` means a second browser binary **and** audits measuring a different engine than the tests |
| **Design tokens** | Tailwind defaults, shadcn theme presets | The palette is derived from `logo.png` (DEC-301). A preset would replace the brand with someone else's |
| **Pricing table / comparison grid** (`app/pricing/page.tsx`) | shadcn/ui Table, Tailwind UI pricing sections, Magic UI pricing blocks | The markup is ~60 lines; the value is entirely in the **content governance** — which capability maps to which catalogued service, which price shape is a floor (`minPrice`) versus a fixed fee, which limit each tier must state. A component supplies the markup and none of that, and adds bytes to a site whose measured constraint is bandwidth (D23). The one non-obvious requirement — `th[scope="row"]` plus a **focusable** scroll region for WCAG 2.1.1 — is exactly what no library ships correctly by default, and it is what failed axe here before it was fixed |
| **Architecture diagram** (`components/work/ArchitectureFlow.tsx`) | Mermaid, React Flow, Excalidraw exports, any SVG flowchart | **An SVG flowchart is an image to a screen reader.** The connectors carry the meaning and none of it reaches the accessibility tree. An ordered list *is* the semantics — stages happen in sequence, each has named parts — with the arrows as decorative CSS on top of correct markup. React Flow would also add a client component and a canvas to a page that currently ships neither |
| **Booking form** (`components/booking/QualificationForm.tsx`) | react-hook-form + zod, Formik, Calendly's inline widget | Four fields, two of them selects. Native constraint validation is already announced correctly by screen readers and already localised by the browser; a validation library would replace working behaviour with behaviour we maintain. The **hard** requirement — that the form still works with JavaScript disabled, because its input names *are* Calendly's prefill parameters — is unachievable with any JS-driven form library (D26) |
| **Recovery calculator** (`components/pricing/RecoveryCalculator.tsx`) | Any ROI-calculator component or template | Every one hard-codes the flattering variable — "recover 40% of missed leads!" — which is a fabricated outcome claim this project forbids. The custom version takes **every** input from the visitor, the recovery rate included, so its output cannot be a claim about our results. The constraint is ethical rather than technical, and no library encodes it |
| **Case-study capture** (`scripts/capture-work-shots.mjs`) | Puppeteer, `playwright-screenshots`, a hosted screenshot API | Playwright is already a dependency and the binary it manages is the one the suite runs against. A hosted API would put **published imagery** behind a third party's uptime and pricing |

---

## Declined — evaluated, not adopted

| Source | Licence | Verdict | Reason |
|---|---|---|---|
| **21st.dev / Magic MCP** (`@21st-dev/magic@0.2.2`) | — | **Declined (D15)**, and separately blocked | Importing components built on someone else's tokens forks the design system — the exact drift DEC-302 exists to prevent. Also needs a `TWENTY_FIRST_API_KEY` and cannot start until folder trust is granted |
| **Magic UI, Aceternity, HyperUI, Motion Primitives** | MIT (verified for Magic UI and Motion Primitives) | **Declined (D15)** | Same reasoning. `brand-os/03_component-language` already defines the component language, implemented against the project's tokens |
| **Origin UI** | ⛔ **AGPL-3.0** | **Declined on licence, independently of D15** | Its repo now redirects to Cal.com's `cosscom/coss`. Strong copyleft — needs legal review, not developer judgement. See the verified table above |
| **React Bits** | ⚠️ **NOASSERTION** | **Declined on licence, independently of D15** | Terms could not be verified. Unverified terms are a stop for commercial reuse |
| **shadcn/ui** | MIT | **Declined for now (D15)** | Copy-in rather than a dependency, so it would not fork the build — but every component still arrives with opinions the tokens then have to override. Its Accordion and Breadcrumb are the two that would apply, and both lost on merit above |
| **Radix UI** | MIT | **Declined for now, with a named trigger** | Genuinely the right answer for one thing: focus management in a modal or combobox. **The site has no such surface.** Adopt the moment one is built — do not pre-install |
| **Tailwind UI** | Commercial | Not evaluated | Paid licence; no entitlement recorded for this project |
| **Supabase MCP** (`@supabase/mcp-server-supabase@0.9.0`) | — | **Declined — no consumer** | This is a static marketing site with no database, no API routes and no auth. Nothing for it to talk to |
| **Cloudflare MCP** (`@cloudflare/mcp-server-cloudflare@0.2.0`) | — | **Declined — no consumer** | Deploys to Vercel. Two deployment control planes is a footgun, exactly as recorded for Netlify |
| **Docker MCP** | — | **Not applicable** | `docker --version` → not installed on this machine, and the project has no containers |
| **Browserbase** (`@browserbasehq/mcp-server-browserbase@2.4.3`) | — | **Declined — redundant** | Cloud browser infrastructure. Playwright already runs locally against the production build, which is what the gate measures |
| **Browser MCP** (`@browsermcp/mcp@0.1.3`) | — | **Not auto-installed** | Requires a Chrome extension plus a local bridge. Too much moving machinery to install unattended, same call as BrowserTools |
| **Firecrawl** (`firecrawl-mcp@3.23.4`) / **Exa** (`exa-mcp-server@3.4.0`) | — | **Deferred — needs a key, thin marginal value** | `WebSearch` and `WebFetch` are built into the harness. These win for bulk crawling and semantic search over many pages, which no current task needs. Both need paid API keys |
| **Figma MCP** (`figma-developer-mcp@0.13.2`) | MIT | **Declined — nothing to read** | No SheetFlow design file exists, and the account is starter tier / View seat. It is gate 1 in the capability-selection order and has lost on this ground every time |
| **Memory MCP** (`@modelcontextprotocol/server-memory@2026.7.4`) | MIT | **Conflict — founder decision needed** | Previously declined: the harness has file-based memory and `AI_RUNTIME_MEMORY.md` is the project's durable memory *by design*, reviewable in git; a parallel opaque store splits the source of truth. It appears on the latest requested list, which may or may not be a considered reversal. **Not installed pending a decision** — see the note below |
| **`@modelcontextprotocol/server-github`** | MIT | **Rejected** | npm marks it `Package no longer supported`. The remote server at `api.githubcopilot.com/mcp/` replaces it |
| **Fetch MCP / Puppeteer MCP** | MIT | Declined | `WebFetch` is built in; Puppeteer is superseded by Playwright + chrome-devtools, and a third driver means a third Chromium download |

### On Memory MCP specifically

This is the one item where a standing recorded decision and the latest request
disagree, so it is surfaced rather than resolved unilaterally. The original
reasoning still holds — `AI_RUNTIME_MEMORY.md` is deliberately a *reviewable*
memory, and its value comes precisely from being in git where a wrong entry can
be caught in a diff. An opaque parallel store cannot be reviewed that way.

**If the intent is genuinely to add it**, say so and it goes in. If it appeared
on the list as one of the usual suspects, the existing decision stands.

---

## The GitHub search — performed 2026-08-07

**`gh` is authenticated** (`sheetflow51-prog`), so the gap recorded in the first
revision of this file is closed. The named registries were looked up on GitHub
directly rather than from memory, and **two of the seven turned out to be
materially different from their reputation.**

| Registry | Repo | ★ | **Licence (verified)** | Last push |
|---|---|---|---|---|
| shadcn/ui | `shadcn-ui/ui` | 120.7k | **MIT** | 2026-08-06 |
| Magic UI | `magicuidesign/magicui` | 21.8k | **MIT** | 2026-07-31 |
| Radix UI | `radix-ui/primitives` | 19.1k | **MIT** | 2026-07-31 |
| Motion Primitives | `ibelick/motion-primitives` | 5.9k | **MIT** | 2026-03-19 |
| **React Bits** | `DavidHDev/react-bits` | 45.0k | ⚠️ **NOASSERTION** | 2026-08-06 |
| **Origin UI** | `origin-space/originui` → **`cosscom/coss`** | 10.4k | ⛔ **AGPL-3.0** | 2026-08-04 |
| 21st.dev Magic MCP | `21st-dev/magic-mcp` | 5.6k | ⚠️ **no LICENSE file** | 2026-07-31 |

### The two that matter

**Origin UI — `origin-space/originui` now redirects to `cosscom/coss`, which is
Cal.com's design system and is licensed AGPL-3.0.** That is strong copyleft.
Whatever the provenance story, the repository sitting at that path today is not
an MIT component registry, and copying from it into a commercial marketing site
would need legal review rather than a developer's judgement. **Do not copy from
Origin UI without re-verifying what you are actually looking at.**

**React Bits reports `NOASSERTION`** — GitHub could not match its LICENSE to a
standard licence, and the file did not decode through the API. That is not the
same as "no licence", but it *is* "terms unverified", and unverified terms are a
stop for commercial reuse until someone reads them.

**`21st-dev/magic-mcp` has no LICENSE file at all** (`/license` → 404). The npm
package is separate from the repo, but a component *generator* whose repo
carries no licence is worth knowing about before its output is pasted into a
codebase.

These three were previously listed in this file as "mixed MIT" on reputation.
That was wrong, and it is exactly what the search was for.

### What the search concluded for the work in hand

**Nothing was imported, and for a reason specific to this phase rather than the
standing D15 objection.** Phase H is performance work: the homepage fails its
own mobile gate at 48. Every registry above ships *visual components* — reusing
one adds JavaScript to a page whose problem is that it renders too much. The
lever these numbers point at is `content-visibility`, a CSS platform feature
with no package behind it.

Radix remains the named exception with a named trigger: adopt it the moment a
modal, combobox or command palette exists. The site still has none.

---

## Phase Y — 2026-08-08

### The evaluation, and why the answer is still zero

Phase Y added five case studies and two new UI branches: the internal-build card
tile on `/work`, and the artifact ledger on `/work/[slug]`. Both were candidates
for reuse. Neither took a dependency.

**The artifact ledger is a description list.** `<dl>` with a monospace term and a
prose detail, on the existing `glass` surface, using the `divide-y` border
treatment already used by the Build section directly below it on the same page.
A component library cannot supply that more cheaply than the twelve lines it
takes — and importing one would introduce a second visual language into a page
whose whole argument is consistency.

**The card tile is the same story.** It reuses `card-interactive`, the existing
`aspect-[16/10]` frame and `font-mono` at the established tracking. The point of
the tile is that an internal build occupies the *same slot* as a screenshot, so
the grid does not reflow and the two kinds of work read as one portfolio.

### The registries were re-checked for the categories Phase Y asks about

Phase Y §11 names booking flow, pricing page, testimonial section, FAQ, timeline,
animated cards, accessibility helpers, SEO utilities, schema generation,
breadcrumbs, sitemap and OpenGraph as reuse candidates. **Every one of them is
already built here, and each was built for a reason a generic implementation
would break:**

| Candidate | Status in this repo | Why a library version would be worse |
|---|---|---|
| Booking flow | `/book` with a qualification step | Ships **zero third-party JavaScript**. Every embeddable booking widget is third-party JavaScript |
| Pricing page | `/pricing` with a break-even calculator | Prices are typed content with a calculator over the visitor's own figure; a pricing *table* component solves the easy half |
| Testimonial section | **Deliberately absent** | There are no testimonials. A component would be an empty slot inviting someone to fill it — the exact failure `content/proof.ts` exists to make impossible |
| FAQ | `content/faq.ts` → rendered `<dl>` + `FAQPage` JSON-LD | Answers must be **in the DOM without interaction**, or an answer engine quoting the page reads empty question nodes. Most FAQ components are disclosure widgets |
| Timeline | Not present | Nothing to sequence. Adding one would invite fabricated project timelines — explicitly forbidden by D24 |
| Animated cards | `card-interactive` + `ScrollReveal` | Phase J measured TBT as **73–91% paint**, not JavaScript. Adding animation libraries targets the wrong cost |
| Accessibility helpers | axe-core in the suite, **zero AA violations** across 6 route/motion combinations | The suite is the helper. A runtime library would not have caught the WCAG 2.1.1 defect Phase K found on the mobile profile |
| SEO utilities, schema generation | `lib/structured-data.ts`, hand-built entity graph with `@id` pinning | Generic generators emit a second `WebSite` node. This graph was **specifically designed to avoid that** — see the regression test asserting exactly one |
| Breadcrumbs | `ServiceBreadcrumb` + `BreadcrumbList`, every crumb fetched by test | Already asserted reachable, which no library ships |
| Sitemap, OpenGraph | `sitemap.xml` route + **8 edge-runtime OG/Twitter image routes** | Framework-native. A plugin would replace working framework code with a dependency |

**Licence findings are unchanged** — Origin UI is still AGPL-3.0, React Bits
still `NOASSERTION`, `21st-dev/magic-mcp` still has no LICENSE file. Nothing was
re-fetched this phase because nothing was imported, and re-running the audit
would restate a conclusion no new evidence bears on.

Radix remains the named exception with the same named trigger: **adopt it the
moment a modal, combobox or command palette exists.** The site still has none.

### GitHub MCP

Still requires OAuth, still impossible in a non-interactive session. `gh` CLI
substituted completely — it enumerated the repositories and established the
finding in Evidence Matrix §2.14. Licence verification via the GitHub API was
not needed, because no candidate reached the point of being imported.

---

## Phase Z — 2026-08-08

**Components reused: zero. Evaluation run, not skipped.**

Three pieces of UI were written this phase:

| Component | Size | What a library would have supplied |
|---|---|---|
| `DemoNotice` — the disclosure panel on a demonstration case study | ~22 lines | An alert/callout box |
| The "Demonstration" card marker on `/work` | ~4 lines | A badge |
| `Companion` — a second figure with a caption and a qualifying note | ~34 lines | A figure with caption |

Every one has a mature MIT implementation available — shadcn/ui `Alert`, Magic
UI badges, any card library. All three were still written here, and the reason
is the same in each case and worth stating once properly:

**The value in these components is not the markup.** It is that the disclosure
is mandatory in the type (`basis` and `note` are required fields, so the panel
cannot render empty), that it is positioned *above* the screenshot rather than
below it, and that its presence is asserted by test. An imported alert box
supplies a rounded rectangle with an icon and none of that — while adding a
dependency and a second visual language to pages whose measured constraint is
bytes.

The existing primitives — `glass`, `card-interactive`, the `font-mono` scale —
already produce markup that matches every other surface on the site. Importing
a component to replace them would have made the pages look *less* consistent,
not more.

**Licensing findings are unchanged** from the Phase H audit: Origin UI is
AGPL-3.0, React Bits is NOASSERTION, `21st-dev/magic-mcp` ships no LICENSE;
shadcn/ui, Magic UI, Radix and Motion Primitives are confirmed MIT. Nothing
this phase altered that assessment, and nothing new was vendored.

**Third-party code in the artifacts described, not consumed by this site:** the
AK Dental build loads three.js r128 from cdnjs and the Saraswati dashboard loads
Chart.js 4.4.1 from jsDelivr. Both are dependencies of *other people's
deployments* that our case studies describe — they are recorded here for
accuracy about what those builds contain, and neither enters this repository's
dependency graph.

---

## Release Candidate 1 — 2026-08-08

**Components reused: zero, and this time there was nothing to evaluate.**

RC1 authored **no UI component**. The three code changes were:

| Change | What it is |
|---|---|
| `min-w-0` on a grid item and a truncating list | Two Tailwind utilities, releasing a `min-width: auto` floor |
| Nav breakpoint `md:` → `lg:` on three classes | A breakpoint token change |
| A `matchMedia` effect closing the menu at the desktop breakpoint | 12 lines, no dependency |

None of these has a library equivalent, because none of them is a component.
They are corrections to how existing markup behaves at widths nobody had
measured — the kind of fix an imported component would have hidden rather than
solved, since a third-party card would carry its own `min-width` behaviour and
the same class of bug would simply move.

**Worth stating plainly**, because "reuse before building" is a standing policy
and a reader is entitled to know it was considered: a headless UI library
(shadcn/ui `NavigationMenu`, Radix `NavigationMenu`) *would* have supplied a
responsive nav with a breakpoint-aware sheet, and would plausibly have shipped
without the scroll-lock bug found here.

It was still the wrong trade. The existing nav is ~60 lines, matches the site's
visual language exactly, and ships in a bundle whose measured constraint is
bytes. Replacing working markup with a dependency to fix a one-line breakpoint
and a twelve-line effect would have cost more than it returned — and the bug it
would have avoided is now **fixed, documented and impossible to reintroduce
silently**, which is the durable version of the same benefit.

**Licensing findings unchanged** from the Phase H audit: Origin UI AGPL-3.0,
React Bits NOASSERTION, `21st-dev/magic-mcp` no LICENSE; shadcn/ui, Magic UI,
Radix and Motion Primitives confirmed MIT. Nothing was vendored this release.

**Third-party code in the artifacts described, not consumed by this site:**
unchanged — three.js r128 via cdnjs in the AK Dental build, Chart.js 4.4.1 via
jsDelivr in the Saraswati dashboard. Both belong to deployments our case studies
*describe*; neither enters this repository's dependency graph.

---

## Release Candidate 4 — 2026-08-10

Two homepage sections were rebuilt: `AIInfrastructure` (distribution bus) and
`DigitalCraft` (device stage). Both are cases where the policy says to look
first, and the record of looking is the point.

### Retrieved and read in full

| Source | Component | Licence | Outcome |
|---|---|---|---|
| Magic UI | `Safari` | MIT | **Structure adapted, surface refused** |
| Magic UI | `AnimatedBeam` | MIT | Re-confirmed the RC3 rejection; see below |

`Safari`'s registry source was fetched from `magicui.design/r/safari.json` and
read end to end. Three ideas in it are good and were kept, in spirit rather
than by copy:

- The screen box is derived from named constants (`SCREEN_X`, `SCREEN_WIDTH`…)
  rather than hand-tuned offsets, so the frame and its contents cannot drift.
- An `aspect-ratio` wrapper scales the whole thing with no measurement.
- The chrome is one flat layer, not a stack of shadowed divs.

Two were dropped, for stated reasons:

- **The `safariPunch` mask.** It exists so injected media (`imageSrc`,
  `videoSrc`) can sit *behind* SVG chrome with the window's rounded bottom
  clipping it. Nothing is injected here — the screens are drawn — so the mask
  solves a problem this component does not have, and carrying it would be ~40
  lines of `mask`/`clipPath` defs earning nothing.
- **The photoreal macOS toolbar** — traffic lights in red/amber/green, the
  reload and sidebar glyphs, the lock icon. `SHEETFLOW_VISUAL_DNA.md` § 9
  rejects this by name as *"Skeuomorphism 2.0 … reads as nostalgic"*. The dots
  are kept as three flat grey circles: the *object* is recognisable, the
  *surface* is not imitated.

**Nothing was vendored.** No file from Magic UI is in this repository. What was
taken is an approach, which is what the MIT licence makes free and what
attribution here records anyway.

### Why `AnimatedBeam` was rejected a second time

RC4's first draft of the infrastructure bus was an SVG gutter with one curve per
branch, which is `AnimatedBeam`'s exact shape. It failed on the same axis RC3
found: branch rows are content-sized, so endpoints are unknown until layout
runs, and the library's answer — `getBoundingClientRect` in an effect under a
`ResizeObserver`, one per beam — is six observers and a frame of pop-in for a
diagram that never moves.

The shipped connector is a CSS spine with per-row stubs. It needs no coordinate
system at all, so there is nothing to measure and nothing to re-measure.

### Surveyed, nothing taken

**Aceternity UI, React Bits, Motion Primitives, Origin UI, shadcn/ui registry.**
Every candidate for these two sections is WebGL (~150 kB gzip against 8.4 kB of
headroom), Lottie/Rive (35–80 kB of runtime for motion that cannot respond to
hover or focus), or a scroll effect built on a motion library this phase was
removing rather than adding. `21st.dev / Magic MCP` remains not installed and
needs an API key; nothing was wanted from it.

**Licensing findings unchanged** from the Phase H audit and re-confirmed here:
Origin UI AGPL-3.0, React Bits NOASSERTION, `21st-dev/magic-mcp` no LICENSE;
shadcn/ui, Magic UI, Radix and Motion Primitives confirmed MIT.

### Dependencies added

**Zero** — in RC3 and RC4 both. The two new sections between them *removed*
`framer-motion` from two client boundaries and cut 2.5 kB of gzipped JavaScript.
