# SheetFlow AI — Visual DNA v2

> The creative constitution, amended.
>
> **v1 is not repealed.** Roughly 70% of it is correct, load-bearing, and
> restated here unchanged. This document exists because the other 30% is either
> **factually out of date**, or is **actively preventing the site from becoming
> memorable** — and both claims are evidenced below rather than asserted.
>
> Positioning is unchanged: premium, enterprise, trustworthy. *A luxury
> intelligence system.* Nothing here softens that. The evolution is toward
> **Apple HIG depth, Spatial UI, Liquid Glass, cinematic storytelling and
> editorial layout** — and away from a uniform grid of translucent rectangles,
> which is what v1's rules, followed literally, actually produce.

---

## 0. What v1 got right, and keeps

Restated so nobody has to diff two documents to find the live rules.

| Rule | Status |
|---|---|
| Dark is the canvas, light is the subject | **Kept, unchanged** |
| Light is *information*, not decoration | **Kept** — and promoted; it is now the test for every glow |
| Two primary eases (`cinematic`, `spring`) + one ambient | **Kept, unchanged** |
| Motion budget: three simultaneous active motions | **Kept**, scoped in § 4 |
| Reduced motion is a kill switch, never a slow-mo | **Kept, unchanged and absolute** |
| Mono is the AI's voice; sans is prose | **Kept, unchanged** |
| Whitespace is the most expensive resource | **Kept** |
| Static first — a section must work as a still image | **Kept, and made testable** in § 7 |
| Interaction tiers (Decision / Consideration / Scan / Glance) | **Kept, unchanged** |
| No cyberpunk, gamer, crypto, Memphis, healthcare-soft | **Kept, unchanged** |
| No fabricated evidence, ever | **Kept and hardened** — now a visual rule, § 6 |

---

## 1. The three defects in v1, with evidence

### 1.1 The constitution describes a palette the site abandoned

v1 § 3 states: *"Indigo (`#6366F1`) is the primary light. Violet (`#8B5CF6`) is
the supporting light."* v1 § 6.2 specifies the accent gradient as
`#818CF8 → #A78BFA → #06B6D4`.

**None of those colours are in the product.** `tailwind.config.ts`:

```
accent.DEFAULT  #3B82F6   (blue, not indigo #6366F1)
gold.DEFAULT    #E9A23B   (the logo's second brand colour)
violet.DEFAULT  #E9A23B   ← deprecated alias. It holds GOLD.
```

The `violet` token's own doc comment records what happened: *"The 0920b03
rebrand moved the palette to the logo's blue + gold and repurposed this token to
hold gold values, leaving the name describing a colour it no longer contains."*

So a designer who follows the constitution faithfully produces **off-brand
work**, and a developer who writes `violet-500` gets gold. This is the single
most expensive defect in v1, because it is invisible: the document reads as
authoritative and is simply wrong.

**v2 § 2 restates the palette from the code**, which is the only source that has
ever been true.

### 1.2 The mandated signature geometry does not ship

v1 § 6.1 lists the **icosahedron core** and **orbital rings** first among
elements that *"identify SheetFlow AI within seconds"*, and says *"None can be
removed without diminishing the brand."*

They were removed. `src/components/three/` is imported by no rendered route, and
the production bundle contains **zero Three.js symbols** — verified two ways in
RC3: no chunk contains `THREE` or `WebGLRenderer`, and the entire JS output is
**1,071 kB raw on this build**, where three.js alone exceeds that.

The brand did not diminish. What actually propagated was the element v1 lists
**third**: the **three stacked rules** — spreadsheet rows — which now appear in
the logo, the Automation Universe core and the Infrastructure hub, and which are
the reason those two diagrams read as one family.

**v2 § 3 promotes the rules to the primary mark** and demotes the icosahedron to
an optional accent that must earn its ~150 kB before it returns.

### 1.3 Restraint collapsed into repetition — and v1 has no rule that stops it

v1 § 1.2 (*"Restraint is the signature"*) and § 7.7 (*"Restraint is louder than
loudness"*) are both correct. They were also, in practice, the justification for
the site's worst visual failure.

RC3 measured it: **five of nine homepage sections were literally the same
object** — a lucide icon in a rounded square, a title, a body paragraph and a
corner gradient glow, in a grid. A visitor scrolling the page met that rectangle
more than twenty-five times. Every one of those sections was individually
restrained. Collectively they were indistinguishable.

**Restraint is choosing few elements. Repetition is choosing one element and
using it everywhere.** v1 never distinguishes them, and it contains no rule
requiring a section to look like its own subject. That omission is the direct
cause.

**v2 adds the missing axiom** (§ 5, *Every section shows its subject*) and the
centerpiece test.

---

## 2. The palette, restated from the code

This section supersedes v1 § 3 *"Light is colored"* and v1 § 6.2 entirely.

| Role | Token | Hex | Use |
|---|---|---|---|
| **Void** | `void` | `#060608` | The canvas. Page base. |
| **Primary light** | `accent` | `#3B82F6` | The intelligence. Beams, active states, primary CTA. |
| **Primary light, lifted** | `accent-bright` | `#60A5FA` | Icons, lit strokes. |
| **Primary light, air** | `accent-light` | `#93C5FD` | Signals in flight, focus rings, hairlines. |
| **Second brand colour** | `gold` | `#E9A23B` | The logo's gold. Sparse, and always the *resolution* of something — the paid invoice, the booked slot, the delivered report. |
| **Gold, lifted** | `gold-bright` | `#F4C063` | Highlight bar, one accent per composition. |
| **Horizon** | `cyan` | `#06B6D4` | Rim light and gradient end-stop only. Never a fill. |
| **Status** | `signal-*` | success `#10B981` · warning `#F59E0B` · danger `#F43F5E` | Status only. Never decoration. |

**The gold rule is new and is the strongest colour rule in v2.** Blue is the
system working; **gold is the system having worked**. One gold element per
composition, and it must mark an outcome. This is what stops a two-colour brand
from becoming a two-colour gradient smear.

**Type contrast floor is unchanged and non-negotiable:** `ink-400` is `#717B98`
because the previous `#6B7490` measured 4.26:1 against a 4.5:1 AA floor and axe
flagged it site-wide. No text colour ships without a measured ratio.

---

## 3. The signature system, corrected

### 3.1 The primary mark — three stacked rules

Three parallel horizontal rules, centre rule longest. Spreadsheet rows.

This is the mark. It scales from a 16px favicon to a 68px diagram core, it
survives being drawn in SVG, CSS or a font, and it is already carrying the brand
in three separate compositions. **Any new "this is the intelligence" object must
contain it or clearly derive from it.**

### 3.2 The signature silhouettes — one per object class

New in v2, and the rule that prevents RC4's near-miss (two glowing discs on one
page reading as the same object twice):

| Object class | Silhouette | Where |
|---|---|---|
| **A source of intelligence** | Disc + concentric rings | Automation Universe core |
| **A distributor** | Rounded plate, wider than tall | Infrastructure hub |
| **A stage in a sequence** | Square-ish node on a rail | Pipeline stations |
| **An artifact the system produced** | Framed rectangle (window, device, card) | Evidence surfaces |

**Two objects of different classes must not share a silhouette on the same
page.** This is what makes a page read as a system with parts, rather than as
one shape repeated.

### 3.3 Retired from the signature set

- **Icosahedron core, orbital particle rings** — not in the product; ~150 kB
  gzip to reinstate against a 360 kB budget. Optional accent, not signature.
- **The 4px scan-line texture, as a mandate.** v1 § 6.3 says *"Both are
  mandatory."* Texture on every surface is a paint cost applied uniformly,
  which is the definition of decoration rather than information. **Grain stays
  page-wide** (it is what makes dark UI filmic). **Scan line becomes opt-in**,
  and marks exactly one thing: a surface the system is actively writing to.

---

## 4. Depth — the part v1 does not have

v1 says *"Depth without weight"* and stops. It specifies no ladder, and the
consequence was measured in RC3: `.glass`, `.glass-strong` and `.glass-subtle`
sit **within ~1.5% alpha of one another**, so stacking them does not read as a
hierarchy. RC3 had to invent a fourth tier mid-phase to get one surface to look
lifted.

This is the **Apple HIG depth / Liquid Glass** requirement, and it needs real
numbers.

### 4.1 The elevation ladder

Five tiers, each **visibly** distinct from its neighbours. The rule is that
alpha, blur and shadow all move together — one property alone does not read as
depth.

| Tier | Reads as | Fill alpha | Blur | Shadow |
|---|---|---|---|---|
| `0 · recessed` | A well cut into the page | 0.02 | 4px | inset only |
| `1 · flush` | Sits in the page | 0.035 | 12px | none |
| `2 · raised` | Sits on the page | 0.055 | 20px | 0 12px 32px |
| `3 · lifted` | Floats above the page | 0.08 | 28px | 0 24px 70px |
| `4 · presented` | The one thing being shown | 0.11 | 36px | 0 32px 90px + accent bloom |

**At most one tier-4 surface per viewport.** If two things are being presented,
nothing is.

### 4.2 Liquid Glass — what it actually means here

Not "more blur". Three properties together:

1. **Saturation lift.** `backdrop-filter: blur(N) saturate(180%)`. Glass that
   does not saturate reads as fog. This is the single biggest difference between
   cheap and expensive glass.
2. **A specular top edge.** `box-shadow: 0 1px 0 rgba(255,255,255,α) inset`,
   α scaling with tier. Light lands on the top edge of a real pane.
3. **A refracted border.** The border is *lighter at the top and darker at the
   bottom* — a gradient border, not a flat one. Flat borders read as strokes;
   graded borders read as edges.

### 4.3 Spatial UI — the z-grammar

Every composition places its elements on exactly three planes, and never more:

```
  [ SUBJECT   ]  the centerpiece. Tier 3–4. Sharpest, most saturated.
  [ CONTEXT   ]  supporting content. Tier 1–2.
  [ ATMOSPHERE]  ambient light and grain. No tier; never interactive.
```

Depth is expressed by **blur, saturation and scale together** — not by drop
shadow alone. An element further back is *less saturated*, not merely darker.

---

## 5. The axiom v1 was missing

> **Every section shows its subject.**

If a section sells a system that moves data, it must draw that system. If it
sells an artifact, it must show the artifact. Body copy describing a visual
thing is a failure of the section, not a style choice.

### The centerpiece test

Every section has exactly one **centerpiece**, and it passes three checks:

1. **Describable in one sentence** to someone who has not seen it. *"Six systems
   feeding one core."* *"A browser window that switches between four kinds of
   build."* If it takes two sentences, it is decoration.
2. **Not a card grid.** A grid of equal rectangles is the default that happens
   when no centerpiece was chosen.
3. **Unique on the page.** Its silhouette class (§ 3.2) is not used by another
   section's centerpiece.

### The repetition ceiling

**No single visual object may be the centerpiece of more than one homepage
section.** RC3's twenty-five rectangles is the failure state this exists to
prevent, and the count is now a tracked number, not a vibe.

---

## 6. Evidence is a visual system, not just a content rule

v1 has nothing about this. It is the most enterprise-differentiating rule the
brand has, and it was living only in the type system (`ProjectEvidence`, D24).

**Every artifact rendered on this site carries a visible provenance mark.**

| Kind | Mark | Means |
|---|---|---|
| **Real capture** | no mark needed; it is a photograph | This shipped. Verifiable. |
| **Indicative** | mono caption, always adjacent | A layout sketch. Claims nothing. |
| **Illustrative of published copy** | mono caption + the published string quoted verbatim | Draws only what the page already says |
| **Seeded / demo** | explicit label on the surface | Data is not a customer's |

**A drawn artifact may never contain a number, a name, a timestamp or a message
body that is not already published elsewhere on the site.** This is why RC4's
device-stage screens are coarse wireframes rather than convincing dashboards:
convincing is the failure mode. The wireframe is not a compromise, it is the
correct register.

---

## 7. Motion, amended

### 7.1 Kept unchanged

Two eases. Micro 100–250ms, reveals 600–1000ms, cinematic 1100–1600ms. Stagger
80ms. **Three simultaneous active motions, maximum.** Reduced motion is a kill
switch. Type does not move under reading.

**Scoping clarified:** the three-motion cap is **per viewport**, not per page. A
page with five sections each running one ambient loop is fine; three things
moving in the 900px a visitor is looking at is the ceiling.

### 7.2 The cost model changed, and the rules should follow

v1 was written when scroll-coupled motion meant JavaScript — a scroll listener,
a spring, a React re-render per frame. **That is no longer true.** CSS
scroll-driven animations (`animation-timeline`, `scroll()`, `view()`) are
supported in Chrome/Edge 115+, Firefox 132+ and Safari 18+, run on the
compositor, and cost **zero JavaScript**.

This directly changes what is affordable. Aceternity's Tracing Beam — the
canonical "beam traces the journey as you scroll" effect — is `useScroll` +
`useTransform` + two `useSpring`s + a measured SVG height, re-rendering on every
frame. The identical visual is four lines of CSS with no measurement and no
JavaScript at all.

**Rule:** scroll-coupled motion is authored in CSS. A scroll listener in
JavaScript now requires written justification, not the reverse.

**Always behind `@supports`, and always degrading to the finished static
state** — never to an invisible one.

### 7.3 Rule 3 is amended — pinning is permitted

v1 § 7 Rule 3: *"We do not scroll-jack. We do not pin sections."*

The first half is right and stays. The second half conflates two different
things, and it is the single biggest barrier in v1 to a memorable page.

| | What it does | Verdict |
|---|---|---|
| **Scroll-jacking** | Hijacks scroll *velocity or direction* — one wheel gesture equals one section, momentum overridden, the user cannot control position | **Forbidden, permanently** |
| **Sticky composition** | An element holds position while the page scrolls **at its native speed**. Nothing is intercepted. Scrollbar, keyboard, trackpad momentum, find-in-page all behave normally | **Permitted** |

Sticky composition is the grammar of every reference this brand aims at. The
user still moves the camera — v1 Rule 3's actual principle — they simply move it
past something that holds.

**Conditions:** never sticky on a `<h1>` that is an LCP candidate; never taller
than the viewport; must collapse to normal flow below `md`, where a sticky
column is just lost height.

---

## 8. Layout, amended

### 8.1 The 12px gap rule is repealed

v1 § 4: *"Card-to-card gap: 12px. Always."*

A constant gap enforces a uniform grid, and a uniform grid is what the site
became. Gap is **relationship**, and relationship is not constant:

| Relationship | Gap |
|---|---|
| Facets of one object (stat tiles, chips) | 8–12px |
| Peers in a set (case-study cards) | 12–16px |
| Steps in a sequence | 32–56px — the gap *is* the passage of time |
| Chapters (section to section) | 96–160px |

### 8.2 Editorial layout is now permitted, and preferred for narrative

v1 assumes centred symmetry everywhere. Symmetry is right for a *statement* — a
hero, a CTA. It is wrong for a *story*, because a story has a reading order and
symmetry refuses to express one.

**Narrative sections use an asymmetric two-column editorial grid:** a held left
column carrying the chapter, a scrolling right column carrying the sequence.
Optical alignment beats mathematical alignment; large numerals are set in
display type and allowed to be large.

### 8.3 Atmosphere is budgeted, not mandated

v1 § 3: *"Every page has all four layers active. Removing any one breaks the
brand."*

Measured reality: paint and compositing are **73–91% of the main thread**, and
the homepage scores **52** on mobile Lighthouse — attributed to the hero's
ambient layers. v1 mandates a cost it never priced.

**Atmosphere is now tiered**, and a section declares which tier it needs:

| Tier | Layers | For |
|---|---|---|
| `full` | Void + aurora + grain + hum | Hero, Final CTA — the two ends of the arc |
| `standard` | Void + one directional wash + grain | Most sections |
| `quiet` | Void + grain | Dense sections where content is the light |

The emotional arc v1 § 6.7 describes is preserved — it is *carried by the tier
sequence*, which is a stronger guarantee than "always all four".

---

## 9. The decision protocol, v2

Before shipping any visual work, in order:

1. **Does it show the section's subject?** (§ 5) If not, stop.
2. **Is the centerpiece unique on the page?** (§ 3.2, § 5)
3. **Is every drawn artifact's provenance marked?** (§ 6)
4. **Are there ≤ 3 active motions in one viewport, and does reduced motion kill
   them without stranding anything?** (§ 7.1)
5. **Is exactly one surface at tier 4?** (§ 4.1)
6. **Is there one gold element, and does it mark an outcome?** (§ 2)
7. **Does it work as a still image?** (v1 § 7 Rule 4) — and this is now
   *testable*: take the screenshot. Both RC3 and RC4 shipped defects that
   compiled, type-checked, and were only visible in a capture.
8. **Bundle budgets: JS ≤ 360 kB gzip, CSS ≤ 40 kB gzip.** Unchanged and hard.

---

## 10. What v2 does not change

Stated so this is not read as a licence.

- **No cyberpunk, gamer, crypto, Memphis, or healthcare-soft.** Unchanged.
- **No faux-3D surfaces** — neomorphism, claymorphism, glossy skeuomorphic
  bevels. v1 § 9 is right: they predate luxury. *Object-mimicry* (a browser
  frame, a phone frame) is permitted and is not the same thing — the object is
  recognisable, the surface is not imitated.
- **No maximalism.** Density where density is the message; never noise.
- **No letter-by-letter reveals, glitch, cursor trails, lens flare, animated
  gradient hue-shifting, all-caps display headlines.** All unchanged.
- **No fabricated evidence.** Hardened, not relaxed.
- **Accessibility is a constraint, not a trade.** WCAG 2.1 AA, 0 axe violations,
  every interactive element reachable with a visible focus indicator. A visual
  idea that costs a violation is not shipped — it is redesigned.
