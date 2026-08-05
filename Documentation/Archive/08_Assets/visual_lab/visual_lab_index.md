# Visual Lab — SheetFlow AI Creative Intelligence Database

> A working memory of every aesthetic decision, motion observation, lighting reference, and interaction pattern that shapes the SheetFlow AI experience.
>
> If a designer or future contributor wants to know **why** something looks or feels the way it does — they read this.
>
> **For the *what* and the *rules* — the immutable brand constitution — read [`/SHEETFLOW_VISUAL_DNA.md`](../../SHEETFLOW_VISUAL_DNA.md). The Visual Lab is observational; the DNA doc is prescriptive.**

---

## Why this exists

The website's intelligence docs (`/01_Brand_Research`, `/05_Motion_References`, etc.) define the system.
The **Visual Lab** is what the system *learns from*. It collects:

- Screenshots & frame-grabs from sites that exemplify a quality we want
- Motion observations broken down by exact timing & easing
- Typography experiments (rejected and accepted)
- Gradient & glass recipes the team has tested
- Lighting & atmosphere references from cinema, products, sci-fi UIs
- Interaction patterns we want to study, not necessarily copy

Where intelligence docs are **prescriptive**, the Visual Lab is **observational** — it captures what we noticed, not what we mandated.

---

## Folder map

| Folder | What lives here |
|---|---|
| [screenshots/](./screenshots/) | Raw frame grabs of moments worth studying — hero sections, transitions, rare hovers |
| [motion_references/](./motion_references/) | Annotated motion breakdowns — timing, easing, layered choreography |
| [typography_experiments/](./typography_experiments/) | Headline trials, kerning notes, gradient text recipes, scale experiments |
| [gradient_experiments/](./gradient_experiments/) | Aurora, mesh, conic, and noise-blended gradients with CSS recipes |
| [glass_experiments/](./glass_experiments/) | Glassmorphism layer stacks — backdrop-filter combos, border highlights, shadows |
| [lighting_references/](./lighting_references/) | Cinematic lighting study (cinema, product photography, AI lab marketing) |
| [cursor_ideas/](./cursor_ideas/) | Cursor variants tested or considered — magnetic, trailing, contextual |
| [apple_motion_references/](./apple_motion_references/) | Apple-specific patterns: page transitions, micro-easings, cinematic stagger |
| [scifi_ui_references/](./scifi_ui_references/) | Cinema-grade fictional interfaces (Blade Runner, Iron Man HUD, Foundation) |
| [cinematic_interfaces/](./cinematic_interfaces/) | Real interfaces that feel cinematic — Linear, Arc, Vercel, Retool |
| [holographic_ui/](./holographic_ui/) | Floating panels, scan lines, transparency stacks, depth choreography |
| [dashboard_inspirations/](./dashboard_inspirations/) | Floating analytics, real-time data layouts, signal visualizations |
| [premium_spacing/](./premium_spacing/) | Whitespace audits, spacing rhythm, monumental layouts |
| [interaction_patterns/](./interaction_patterns/) | Hover physics, magnetic systems, depth-reactive UIs, ambient motion |

Each folder contains a `README.md` with the current creative direction for that lane.

---

## How to contribute to the lab

When you observe something worth saving:

1. Screenshot or capture the artifact (drop in the appropriate folder).
2. Add or update the folder's `README.md` with:
   - **What you observed** (one-line)
   - **Where you saw it** (URL, app, scene)
   - **Why it works** (the design principle behind it)
   - **Whether SheetFlow AI should adopt it** (yes / no / maybe-later, with reason)
3. If it changes a project decision, also update the relevant intelligence doc (e.g. `05_Motion_References/...`).

The Visual Lab is allowed to contain rejected ideas. They are useful precisely because they prevent re-litigation.

---

## The relationship between the Lab and the Constitution

| | Visual Lab | SHEETFLOW_VISUAL_DNA.md |
|---|---|---|
| **Tone** | Observational, exploratory | Prescriptive, immutable |
| **Contains** | Screenshots, breakdowns, recipes, rejected ideas | Rules, signatures, anti-patterns |
| **Editable by** | Anyone working on the brand | Only via documented amendment process |
| **Asks** | "What did we notice?" | "What do we never break?" |
| **When to read** | When researching a new section or interaction | When making any design decision |

If the Lab and the Constitution disagree, the **Constitution wins.** The Lab may then propose an amendment.

---

## The aesthetic standard (kept here for proximity)

Every artifact in this lab is evaluated against the four standards that govern the brand:

> **Aesthetic** — Does this feel like Apple, Stripe, and a futuristic AI lab designed it together?
> **Copy** — Could a competitor say this exact thing? If yes, rewrite.
> **Motion** — Does this motion communicate something, or is it decoration?
> **Technical** — Is this the most precise implementation possible, while remaining performant at 60fps?

If a Visual Lab entry fails any of the four — note it, but don't bring it into production.

---

## What this lab is NOT

- Not a moodboard. Moodboards are for emotion. The Visual Lab is for evidence.
- Not a Pinterest. Every entry must have a *why*.
- Not a place to store final assets. Production assets live in `08_Assets/` directly.
- Not exhaustive — only artifacts that earn their keep.

---

*Last reviewed: 2026-05-06 | Owned by: Brand & Production Design*
