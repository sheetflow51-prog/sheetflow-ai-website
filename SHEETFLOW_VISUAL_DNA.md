# SheetFlow AI — Visual DNA

> The permanent creative constitution.
> Every visual decision, motion choice, and atmospheric system that makes this brand recognizable in seconds.
>
> If a question can be answered by reading this document, **do not relitigate it.**

---

## Table of contents

0. [Identity in one sentence](#0-identity-in-one-sentence)
1. [Visual philosophy](#1-visual-philosophy)
2. [Motion philosophy](#2-motion-philosophy)
3. [Atmosphere philosophy](#3-atmosphere-philosophy)
4. [Spacing philosophy](#4-spacing-philosophy)
5. [Interaction philosophy](#5-interaction-philosophy)
6. [The signature system — what is uniquely ours](#6-the-signature-system--what-is-uniquely-ours)
7. [The cinematic identity rules](#7-the-cinematic-identity-rules)
8. [Anti-patterns — what we never do](#8-anti-patterns--what-we-never-do)
9. [Forbidden aesthetics](#9-forbidden-aesthetics)
10. [Signature behaviors — the brand memory triggers](#10-signature-behaviors--the-brand-memory-triggers)
11. [Future scalability — how the system extends](#11-future-scalability--how-the-system-extends)
12. [The decision protocol](#12-the-decision-protocol)

---

## 0. Identity in one sentence

> **A luxury intelligence system from the future.**

If a design choice does not contribute to that sentence, it is wrong.

Not "futuristic SaaS." Not "AI startup." Not "developer tool." A **luxury intelligence system**, designed and shipped by people who believe spreadsheets deserved to think 40 years ago.

---

## 1. Visual philosophy

### The five visual axioms

1. **Dark is the canvas, light is the subject.** The page begins at `#060608` (Void). Light arrives from purpose: a glowing core, an indigo gradient, a status pulse. Light is *information*, not decoration.

2. **Restraint is the signature.** A monumental headline beside two CTAs reads as confidence. The same screen with five animated icons reads as anxiety. We always remove before we add.

3. **Depth without weight.** Every surface is translucent enough to suggest a layer beneath it. No surface is so heavy it grounds the eye. The composition floats.

4. **Geometry as identity.** The icosahedron is ours. The orbital ring is ours. The 4px-repeat scan line is ours. Repeat them. Don't reinvent them.

5. **Words live next to numbers.** Sans for prose. Mono for data. Mono for status. Mono for any sentence the AI itself might generate. The mono *is* the AI's voice.

### The visual hierarchy of attention

When the user lands on any screen, attention should resolve in this order, in under 800ms:

| # | Element | Anchored by |
|---|---|---|
| 1 | The single big idea (headline) | Type scale, gradient fade |
| 2 | The tone of the system (AI core / atmosphere) | Bloom, motion, glow |
| 3 | The proof of life (live indicator) | Pulse cadence, `Watching` kicker |
| 4 | The action (CTA pair) | Indigo halo, magnetic hover |
| 5 | The trust (logos, sub-copy) | Calm muted color, smaller scale |

Anything not contributing to one of those five is competing with them.

---

## 2. Motion philosophy

### The two-ease rule

We use exactly two custom curves for primary motion:

| Name | Bezier | Use |
|---|---|---|
| `sheetflow.cinematic` | `(0.16, 1, 0.3, 1)` | All scene reveals, scroll-driven motion, headline appearances |
| `sheetflow.spring` | `(0.34, 1.56, 0.64, 1)` | Return-to-rest after interaction (magnetic settle, click bounceback) |

A third (`sheetflow.intelligence` — slow-in, slow-out) is reserved for ambient breathing.

Anything else — *anything* — is a smell. If you can't justify a new ease in writing, don't add it.

### The one-second universe

Every motion event lives within a single, governable budget:

- **Micro-interactions** (hover, click): 100–250ms
- **Scene reveals** (section enter): 600–1000ms
- **Cinematic moments** (awakening, descent, handoff): 1100–1600ms

Anything beyond 1600ms is no longer animation; it is performance. Performance is for video, not for sites.

### Stagger cadence

We stagger at **80ms** between adjacent elements. Apple's law is 100ms; on dark UI we found the eye reads slightly slower, so we accelerate by 20%. Once chosen, this is universal across the site.

### The motion vocabulary

We have **five verbs**. Every animation in the codebase is one of these:

1. **Enter** — translate up + fade + de-blur
2. **Settle** — overshoot + decay (spring)
3. **Breathe** — sine cycle on scale or opacity
4. **Travel** — scroll-coupled translation/rotation
5. **Trace** — path-draw (SVG strokeDasharray)

If a proposed motion is not one of these five, it should not be in the system.

### Calm intelligence, never energetic chaos

If a screen has more than three things moving at once, the screen has failed. Ambient motion (breathing badges, drifting aurora) counts at half-weight. Active motion (reveals, magnetic hover) counts at full weight. **Total active motion budget: 3 simultaneous, ever.**

---

## 3. Atmosphere philosophy

### The four atmospheric layers (always present, always quiet)

```
[ FRONT ]   Content (text, cards, CTAs)
            ↑
[ HUM   ]   Cursor, badge pulses, breathing indicators
            ↑
[ FILM  ]   Noise grain (0.035 opacity, mix-blend overlay)
            ↑
[ AIR   ]   Aurora gradient (cursor-tracked, mouse-lerped 0.04)
            ↑
[ VOID  ]   #060608 base
```

Every page on the site has all four layers active. Removing any one breaks the brand.

### Light is colored

Our light is never white. Indigo (`#6366F1`) is the primary light. Violet (`#8B5CF6`) is the supporting light. Cyan (`#06B6D4`) is the deep light, used only at horizons and in the accent gradient's third stop.

Pure white is reserved for type and status dots. White light from a non-text source reads as "loading" or "broken."

### Atmosphere intensifies on descent

The page is not constant. Hero is 80% void. Mid-sections are 50% surface. Final CTA is 75% void again — but with an active violet wash that did not exist in the hero. The atmosphere we *return to* is not the atmosphere we *started with*.

This is the brand's emotional arc. Don't break it.

### The 60/30/10 rule (averaged)

Across the page:
- 60% void / dark surfaces
- 30% mid-tone (cards, glass, dividers)
- 10% bright signals (accents, status, CTAs)

Per-section may deviate. The page average must hold.

---

## 4. Spacing philosophy

### Whitespace is the most expensive resource

Cheap design fills the canvas. Premium design defends it. **Every screen has more empty space than content.**

### The scale is doubling, not linear

```
4 → 8 → 12 → 16 → 24 → 32 → 48 → 64 → 96 → 128 → 192 → 256
```

Lower range increments by 4–8. Upper range doubles. The doubling at scale is what makes whitespace feel *intentional* — at 192px, the viewer perceives the gap as a deliberate frame, not an accident.

### Section padding budget

Every `.section` has minimum 80px / maximum 160px vertical padding. Anything below 80 reads as a card; anything above 160 reads as a chapter break, which we already get from `SectionHandoff`.

### The headline isolation rule

A monumental headline gets at least **2× its line-height** in vertical breathing room on every side. A 96px headline gets ≥192px above and below before any other content competes.

This is the difference between "an h1" and "a monument."

### Card-to-card gap

12px. Always. Bento grids, case studies, feature cards. Not 8 (stuffed), not 16 (loose), not 24 (separate).

### The gap of last resort

If two elements look right but are visually disconnected, **add space, do not add a divider.** A divider is a confession that the spacing failed.

---

## 5. Interaction philosophy

### Interactivity costs attention

Every magnetic hover, every tilt, every glow is an *attention spend.* Spend it where the user makes a decision. Do not spend it on body text, footer links, or scan grids.

### The interaction tier system

| Tier | Use on | Treatment |
|---|---|---|
| **Decision** | Primary CTAs, the one button per section that drives the funnel | Magnetic + glow halo + spring settle |
| **Consideration** | Cards the user evaluates one at a time (case studies, features) | Cursor-tracked highlight + lift on hover + accent border |
| **Scan** | Feature lists, footer links, integration grid | Quiet color shift only |
| **Glance** | Body text, captions | No interaction |

Mixing tiers is the most common interaction failure mode. A magnetic body-text link is a misuse of attention.

### The reduced-motion contract

Reduced motion is a *kill switch*, never a slow-mo. Half-speed motion is still vestibular hostile.

When `prefers-reduced-motion: reduce`:
- Awakening sets progress = 1 instantly
- Magnetic / TiltCard / Parallax / ScrollReveal early-return
- Lenis bypassed
- Cursor disabled
- Particle field does not mount

The site remains functional and beautiful at standstill.

### The cursor *is* a brand element

Two layers, lerp-followed (ring 0.14, dot 0.40). Hover state expands ring to 64px and shifts color to indigo. We do **not** add cursor trails, RGB blend modes, or contextual labels — those have been tried and rejected (see `08_Assets/visual_lab/cursor_ideas/`).

---

## 6. The signature system — what is uniquely ours

These elements, used together, identify SheetFlow AI within seconds. None can be removed without diminishing the brand.

### 6.1 The geometric language

| Element | Form | Where it appears |
|---|---|---|
| **Icosahedron core** | Subdivided icosahedron, indigo emissive, wireframe overlay | Hero, Final CTA |
| **Orbital rings** | 3 concentric particle rings, radii 2.0 / 2.8 / 3.8, opposing rotation | Around the AI core |
| **Stacked horizontal lines** | 3 parallel rules — references to spreadsheet rows | Logo mark, badge `AI` |
| **Single-orbit ring** | 1 thin circle, indigo gradient stroke, 45% alpha | Around logo, around live status |

Anything labeled "the AI" must be one of these forms or a clear derivative. Do not invent new geometric languages without ratifying them in this document.

### 6.2 The signature color moves

| Move | Recipe | Use |
|---|---|---|
| **Headline gradient fade** | `linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.55) 100%)` clipped to text | Every hero/section headline |
| **Accent gradient (intelligence)** | `linear-gradient(135deg, #818CF8 0%, #A78BFA 50%, #06B6D4 100%)` | The proper noun emphasis: *finally alive*, *let it watch itself* |
| **Aurora atmosphere** | Three radial gradients (indigo 0.18, violet 0.12, cyan 0.06) cursor-tracked | Page-wide ambient layer |
| **Live signal pulse** | Green `#10B981` 6px dot, 2s sine 1→0.85 scale + 1→0.5 opacity | Every "live" / "watching" / "active" indicator |

The order matters: fade → accent → aurora → pulse. Always indigo-led, violet-supported, cyan-deep, green-status.

### 6.3 The signature texture

A 4px repeating linear gradient at 0.04 alpha, applied as `::after` overlay on holographic surfaces:

```css
background-image: repeating-linear-gradient(
  0deg,
  rgba(255, 255, 255, 0.04) 0px,
  rgba(255, 255, 255, 0.04) 1px,
  transparent 1px,
  transparent 4px
);
```

Plus the page-wide film grain (inline SVG fractalNoise, 0.035 alpha, mix-blend overlay).

**Both are mandatory.** The grain is what makes the dark UI feel filmic; the scan line is what marks something as a *holographic surface* (versus a normal card).

### 6.4 The signature lighting

Three-point lighting on every page:

- **Key** — indigo aurora blob top-left, opacity 0.18
- **Fill** — violet aurora blob bottom-right, opacity 0.12
- **Rim** — cyan horizon at 50% / 100%, opacity 0.06

Bloom on the AI core. Inner highlight (`box-shadow: 0 1px 0 rgba(255,255,255,0.05) inset`) on every glass surface.

Anything lit from above with a hard shadow is wrong. We do not have hard shadows; we have ambient drops.

### 6.5 The signature motion cadence

| Behavior | Cadence |
|---|---|
| Element stagger | 80ms |
| Headline reveal | 900ms cinematic ease |
| Idle breath | 6s sine, ±2% |
| Live pulse | 2s sine, 1→0.85 scale |
| Cursor lerp (ring / dot) | 0.14 / 0.40 |
| Section reveal trigger | 80% in view |

These are constants. Do not tune them per-component without amending this document.

### 6.6 The signature spacing rhythm

- Section vertical padding: 80–160px
- Headline-to-sub: 28px
- Sub-to-CTA: 40px
- Card-to-card: 12px
- Body line-height: 1.55–1.65

If a layout is "off," check these first. 90% of "this looks wrong" is one of them being violated.

### 6.7 The signature atmosphere behavior

The site **comes alive** (Awakening) and **closes around** (Final CTA descent). It does not hold a constant atmosphere. The arc is:

```
  Awakening ─→ Ambient ─→ Workflow descent ─→ Quiet middle ─→ Final descent
   bright      steady      intensifies           breath          closes in
```

Any new section added to the site must be placed knowing where in this arc it sits and respecting the surrounding atmosphere.

---

## 7. The cinematic identity rules

### Rule 1 — One big idea per scene
Every screen has exactly one headline-level idea. If a section feels like it has two, split it into two sections.

### Rule 2 — Establish, intensify, resolve
The page mirrors a film: hero (establish), middle sections (intensify), final CTA (resolve). The rhythm is not negotiable.

### Rule 3 — The user moves the camera, not the brand
Scroll is the camera dolly. We do not scroll-jack. We do not pin sections except as documented in `05_Motion_References/`. The user has agency.

### Rule 4 — Static first, motion second
A screen must work as a still image before any animation runs. If you can't take a screenshot of a section that conveys its meaning in 5 seconds, the section is not yet shippable.

### Rule 5 — Sound is opt-in, never default
Audio is built but dormant. The user enables it. Even when enabled, the ambient bed is ≤0.18 gain. No sound effect ever exceeds the cinematic atmosphere.

### Rule 6 — Type does not move under reading
Headlines may animate on entry. After they land, they do not move. Body text never animates. Reading is sacred.

### Rule 7 — Restraint is louder than loudness
A page with three motions, three colors, and one big idea is more cinematic than a page with thirty of each.

---

## 8. Anti-patterns — what we never do

These have been tried, considered, or seen elsewhere — and rejected.

### Motion anti-patterns
- ❌ Bounce on first impression (any "ta-da")
- ❌ Cursor trails or particle ribbons
- ❌ Letter-by-letter character drops
- ❌ Glitch RGB-offset on hover
- ❌ Animation that requires re-watching to be understood
- ❌ Scroll-jacked horizontal sections
- ❌ Parallax that makes text drift slower than its background (always rotates the visual hierarchy wrongly)
- ❌ Hover-trigger sound effects (always rejected)
- ❌ Random hover scale on every element

### Visual anti-patterns
- ❌ Lens flare
- ❌ Animated gradient color shifting (we animate position only)
- ❌ Hard color stops in gradients (always include `transparent` waypoints)
- ❌ All-caps display headlines
- ❌ Italic display headlines
- ❌ Mixed serif + sans display
- ❌ Variable-weight oscillation in headlines
- ❌ Border on top of border (use shadow + border, never two borders)
- ❌ Glass on glass (use elevation Z-stack instead)

### Copy anti-patterns
- ❌ Words: *revolutionary, seamless, leverage, AI-powered, unleash, supercharge, next-gen*
- ❌ Lists of three adjectives in headlines ("Fast, simple, and powerful.")
- ❌ Question headlines ("Want to save time?")
- ❌ Generic SaaS bullet points

### Audio anti-patterns
- ❌ Autoplay anything, ever
- ❌ Hover sounds (default on)
- ❌ Click sounds louder than ambient
- ❌ Music with melody (we use texture)

---

## 9. Forbidden aesthetics

These are the aesthetic cousins of our brand that we explicitly reject. If a design references one of these, it is wrong, even if it looks "cool."

| Forbidden | Why we reject it |
|---|---|
| **Cyberpunk** (Tokyo neon, Japanese typography, glitch text, scanline TV) | Reads as fictional, not premium |
| **RGB gamer aesthetic** (saturated rainbow accents, sharp angles, tribal motifs) | Reads as adolescent |
| **Memphis / postmodern** (squiggles, primary colors, geometric chaos) | Reads as designy, not intelligent |
| **Skeuomorphism 2.0** (faux 3D buttons, wood textures, leather) | Reads as nostalgic |
| **Brutalist tech** (Helvetica + raw HTML + sharp grid) | Reads as anti-design, anti-luxury |
| **Generic AI startup** (gradient blobs + "Powered by AI" + Inter + emojis) | Indistinguishable from competitors |
| **Crypto / Web3 aesthetic** (chrome 3D, hot pink → cyan gradients, Y2K revival) | Wrong era, wrong tone, wrong audience |
| **Healthcare-soft** (rounded squares, mint green, illustrations of people) | Wrong industry vibe |

When in doubt, ask: *Does this aesthetic predate or exceed luxury?* If predates (skeuomorphism, brutalist), it's regressive. If exceeds (cyberpunk, gamer), it's unserious. We sit precisely at *luxury intelligence.*

---

## 10. Signature behaviors — the brand memory triggers

These are the moments and motifs that, repeated across the site, make the brand stick. They are not decorations; they are the memory hooks.

### 10.1 The four memory triggers

1. **The Awakening** — the cinematic flourish on first load. Plays once. Burns into memory.
2. **The Workflow Descent** — the section gets brighter as you reach its core, then dims as you exit. The user's body remembers descending into intelligence.
3. **The Final Closing** — the ending vignette closes around the headline. The user remembers being *held* at the end.
4. **The cursor's intelligence** — the ring trails the dot. The user feels they have *intelligence following them* across the page.

### 10.2 The recurring motifs

These visual elements appear in multiple places. Repetition is the point — it builds recognition.

| Motif | Appears in |
|---|---|
| Icosahedron + orbital rings | Hero (3D), Final CTA (3D), logo (2D abstraction), Workflow center node (icon abstraction) |
| Three horizontal lines | Logo mark, Workflow source nodes, AI badge |
| Indigo glow halo | Primary CTA, AI core, intelligence node, awakening sequence |
| Live pulse (green dot) | Footer status, Hero trust strip, Dashboard `Live` badge |
| Mono kicker text | Every section eyebrow, every status indicator, every data label |
| Single horizontal scan | Awakening sequence, holographic surface overlay (slowed), AI Dashboard scan layer |
| 1px gradient divider | Section handoffs, footer top edge, footer column rule |

### 10.3 The signature emotional anchors

The user should leave the site remembering *how it felt*, not what it said.

- The hero felt like **awakening** (post-load flourish)
- The middle felt like **descending** (workflow intensify, dashboard close-up)
- The end felt like **invitation** (vignette closes, halo opens)
- Throughout, the cursor felt like **intelligence** (dual-layer trail)

These are the four feelings. If a future expansion does not produce one of these on its target page, it has failed to extend the brand.

---

## 11. Future scalability — how the system extends

The visual DNA must scale across mediums. Each medium inherits some signatures, drops others, and gains its own.

### 11.1 Product UI (the actual app)

- **Inherits**: Indigo accent, mono for AI-generated text, glass cards, dark base, live pulse for active monitoring, icosahedron motif on the AI command center
- **Drops**: Aurora gradient (too distracting in a working tool), magnetic CTAs (too playful), full-page reveals
- **Gains**: Functional density, tabular data styling, sticky panels, keyboard shortcut overlays

### 11.2 Mobile app

- **Inherits**: Color system, type scale (proportionally), live pulse, mono for AI voice
- **Drops**: 3D AI core (battery), custom cursor (no cursor), ambient noise grain (low-DPR mobile = banding)
- **Gains**: Tab-bar choreography, gesture-based reveals, haptic patterns to replace cursor feedback

### 11.3 Dashboards

- **Inherits**: Glass card stack, kicker labels, live pulse, scan-line texture on highlighted panels, signal-success/warning/danger color discipline
- **Drops**: Reveal animations on data refresh (tabular data must be instantly trustable)
- **Gains**: Density patterns from `08_Assets/visual_lab/dashboard_inspirations/`

### 11.4 Video & advertisements

- **Inherits**: AI core 3D form, accent gradient, motion cadence (cinematic ease), kicker mono labels
- **Drops**: Scroll-driven anything, hover states (no hover in video)
- **Gains**: Audio bed (ambient), 24fps cinematic frame rate, end-frame logo + tagline lockup

### 11.5 Social media (image posts)

- **Inherits**: Type scale, gradient fade headline, accent gradient on emphasis, dark base
- **Drops**: Glass (transparent layers don't survive compression)
- **Gains**: Single-frame lockup discipline, 1:1 / 4:5 / 9:16 layouts

### 11.6 Presentations

- **Inherits**: All of the above
- **Drops**: Animation (slides are static)
- **Gains**: Title slide template, section divider template, data slide template, end frame

### The expansion principle

> Every new medium must feel like a *quieter* version of the website, not a *louder* one. The website is the loudest the brand ever gets.

This protects against scope creep into noise. If a video ad has more motion than the homepage, the ad is wrong.

---

## 12. The decision protocol

When in doubt, follow this protocol — in order — and stop at the first clear answer.

### Q1: Does this serve the sentence?
> *Does this contribute to "a luxury intelligence system from the future"?*

If no → reject.

### Q2: Does this respect the four atmospheric layers?
Are the void, air, film, and hum all present? If a proposal removes any → reject.

### Q3: Does this fit the motion vocabulary (Enter / Settle / Breathe / Travel / Trace)?

If it's a sixth verb → reject or escalate to amend this document.

### Q4: Does it match the signature system (geometry, color, texture, lighting, cadence, spacing, atmosphere)?

If it diverges from any signature → reject.

### Q5: Does it appear in the anti-patterns list?

If yes → reject.

### Q6: Does it match a forbidden aesthetic?

If yes → reject hard.

### Q7: Does it produce one of the four signature feelings (awakening / descending / invitation / intelligence)?

If no → it may still be acceptable as utility, but not as a signature moment.

If a proposal survives all seven, ship it.

---

## Appendix A — The asset map

| Resource | Location |
|---|---|
| Brand strategy | [/01_Brand_Research/](./01_Brand_Research/) |
| Design research | [/02_Design_Inspirations/](./02_Design_Inspirations/) |
| UI systems & glass | [/03_UI_Systems/](./03_UI_Systems/) |
| 3D & holographic | [/04_3D_Concepts/](./04_3D_Concepts/) |
| Motion philosophy | [/05_Motion_References/](./05_Motion_References/) |
| Copy & narrative | [/06_Content_System/](./06_Content_System/) |
| UX architecture | [/07_Website_Architecture/](./07_Website_Architecture/) |
| Visual Lab (creative memory) | [/08_Assets/visual_lab/](./08_Assets/visual_lab/) |
| Production website | [/10_Final_Website/](./10_Final_Website/) |
| Cinematic experience audit | [/10_Final_Website/CINEMATIC_AUDIT.md](./10_Final_Website/CINEMATIC_AUDIT.md) |

---

## Appendix B — The constitution amendment process

This document is not immutable. It is *durable*.

To amend a rule:

1. Document the proposed change as a one-paragraph rationale (not "I think it looks better")
2. Identify which existing artifact (in production, in the visual lab, on a competitor site) demonstrates the alternative
3. Specify which signature, motion, or atmospheric system would be replaced
4. Pass the seven-question decision protocol with the *amended* version

Amendments require strong reason. Casual ones erode the brand.

---

*The website is the loudest the brand ever gets. The constitution is the quietest place it lives.*
*Both are true. Both must be defended.*

*Last reviewed: 2026-05-07 · Version 1.0 · Owned by: Brand Direction*
