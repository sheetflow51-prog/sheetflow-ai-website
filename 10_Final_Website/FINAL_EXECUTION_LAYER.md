# FINAL EXECUTION LAYER

> The master launch-production handbook for the live SheetFlow AI experience.
>
> The systems are built. The architecture is set. The brand is defined. What remains is the **production of real assets and the orchestration of go-live**. This document is the playbook.
>
> Companion handbooks (do not duplicate — defer to them where overlap exists):
> - [SPLINE_CINEMATIC_EXECUTION_SYSTEM.md](SPLINE_CINEMATIC_EXECUTION_SYSTEM.md) — 3D production handbook
> - [SPLINE_SCENE_BRIEF.md](SPLINE_SCENE_BRIEF.md) — designer-facing scene specs
> - [DEPLOYMENT.md](DEPLOYMENT.md) — engineering deploy + audit checklist
> - [CINEMATIC_AUDIT.md](CINEMATIC_AUDIT.md) — production audit baseline

---

## Table of contents

- [PHASE 1 — Spline Production Package](#phase-1--spline-production-package)
- [PHASE 2 — Visual Asset System](#phase-2--visual-asset-system)
- [PHASE 3 — Case Study Cinematic System](#phase-3--case-study-cinematic-system)
- [PHASE 4 — Launch Content Ecosystem](#phase-4--launch-content-ecosystem)
- [PHASE 5 — Deployment & Go-Live Execution](#phase-5--deployment--go-live-execution)
- [PHASE 6 — Cinematic Final Review](#phase-6--cinematic-final-review)
- [Appendix — Asset directory map](#appendix--asset-directory-map)

---

## North star

A SheetFlow AI launch must read as a **luxury intelligence system from the future** — across the website, the Spline scenes, every social post, every screenshot, every founder portrait. The brand is not a website; it is an *atmosphere* that must remain consistent at every touchpoint.

Three rules govern every asset and every launch decision:

1. **Restraint over volume.** Fewer, better assets win.
2. **Atmosphere over information.** The mood reads in 1.5 seconds; the message reads in 5.
3. **Cinematic over trendy.** A trend dates an asset; a cinematic frame does not.

---

## PHASE 1 — Spline Production Package

The handoff package for the Spline artist. It allows a high-end 3D designer to execute every scene with **minimal ambiguity** and **zero brand-tone drift**.

This phase is the *handoff envelope*. The full execution system lives in [SPLINE_CINEMATIC_EXECUTION_SYSTEM.md](SPLINE_CINEMATIC_EXECUTION_SYSTEM.md); the per-scene specs live in [SPLINE_SCENE_BRIEF.md](SPLINE_SCENE_BRIEF.md). What follows is what to *send the artist*, organized scene-by-scene.

### 1.1 — What the artist receives

A single zip / shared folder named `SHEETFLOW_SPLINE_PACKAGE_v1/` containing:

```
SHEETFLOW_SPLINE_PACKAGE_v1/
├── 00_README.md                         ← summary + non-negotiables
├── 01_brand_dna/
│   ├── color_tokens.md                  ← indigo / violet / cyan / void hex values
│   ├── motion_dna.md                    ← cinematic / spring / intelligence curves
│   ├── light_reference.md               ← three-point intensities, bloom values
│   └── banned_aesthetics.md             ← copy from SPLINE_CINEMATIC_EXECUTION_SYSTEM Appendix A
├── 02_scenes/
│   ├── 01_hero_intelligence_core/
│   ├── 02_workflow_universe/
│   ├── 03_dashboard_layer/
│   └── 04_optional_ambient_background/
├── 03_export_specs/
│   ├── export_checklist.md
│   ├── optimization_targets.md
│   └── handback_format.md
└── 04_quality_gate/
    └── approval_checklist.md            ← copy from SPLINE_CINEMATIC_EXECUTION_SYSTEM Phase 7
```

Each scene folder contains:
- `brief.md` (the scene's spec from [SPLINE_SCENE_BRIEF.md](SPLINE_SCENE_BRIEF.md))
- `references/` — 6–10 reference frames (still images), labelled by intent
- `motion_reference.mp4` (or animated GIF) — the *feeling* in 5 seconds, no longer
- `lighting_reference.png` — the three-point setup, annotated
- `camera_behavior.md` — what the camera does (and does not do)
- `forbidden.md` — the per-scene "never do" list

### 1.2 — Hero Intelligence Core

| Element                | Direction                                                                                  |
|------------------------|--------------------------------------------------------------------------------------------|
| **Geometry language**  | Subdivided icosahedron (~80–120 polys) + wireframe overlay at 1.05× + 3 particle rings.    |
| **Composition**        | Centered, ~3% above optical center. Negative space ≥ 70%. Headline overlaps outer ring.    |
| **Camera**             | Static frame default. Desktop mouse parallax: lerp 0.04, Y amp 0.18, X amp 0.10. No orbit. |
| **Lighting**           | Indigo key 1.0 (top-left) · Violet fill 0.5 (bottom-right) · Cyan rim 0.3 (below).         |
| **Bloom**              | Threshold 0.85 · Intensity 0.7 · Tinted (`#7B8AFF`) — never white.                         |
| **Motion**             | Core breath ±2% / 6s sine · Rings 0.05 rad/s opposing · 2 active motions max.              |
| **Interaction**        | Pointer events disabled by wrapper. No clicks. Touch = static frame.                       |
| **Pacing**             | 0–400 ms silhouette · 400–900 ms ring system · 900–1500 ms aliveness.                      |
| **Emotional verb**     | *Awakening*.                                                                               |
| **Forbidden**          | Glow trails · particle ribbons · glitch · pure white emissive · auto-rotate · text/logos.  |
| **Exports**            | `.splinecode` URL (≤ 1.5 MB decoded) + 1440×1440 WebP poster.                              |

### 1.3 — Workflow Universe

| Element                | Direction                                                                                  |
|------------------------|--------------------------------------------------------------------------------------------|
| **Geometry language**  | Floating spreadsheet plane (32×18 cells, outlines only) + small core (0.6× hero) upper-right. |
| **Composition**        | Plane tilted ~12° from camera. Core upper-right "receives." Foreground haze lifts on enter.|
| **Camera**             | Fixed. No parallax, no orbit.                                                              |
| **Lighting**           | Indigo key from upper-right toward core · Violet fill on plane · Beam is its own light.    |
| **Motion**             | Beam sweeps L→R 6s linear · One signal packet, 1.4s ease-out-cubic, dissolves on arrival · Core breath 0.6× hero. |
| **Story**              | One sentence: *data is detected, understood, absorbed*. Repeats every 6s, identically.     |
| **Pacing**             | 6s master cycle. No motion < 1.4s, none > 12s.                                             |
| **Emotional verb**     | *Descent*.                                                                                 |
| **Forbidden**          | Matrix rain · animated cell values · multiple packets · camera move · color outside triad. |
| **Exports**            | `.splinecode` URL + 2400×1200 WebP poster.                                                 |

### 1.4 — Dashboard Intelligence Layer

| Element                | Direction                                                                                  |
|------------------------|--------------------------------------------------------------------------------------------|
| **Geometry language**  | Three holographic panels at Z = -1.5 / 0 / +1.5 · Hairlined indigo edges (1px) · Translucent 0.65. |
| **Composition**        | Panels staggered diagonally · Single trace line connects them · ≥ 40% whitespace per panel.|
| **Camera**             | Fixed.                                                                                     |
| **Lighting**           | Indigo from above-left · Cyan rim along far edge · Mild specular only on edges.            |
| **Motion**             | Panels float ±6px / 8s sine, phase-offset · Big number ticks +1 / 1.5s · Trace pulses 0.4→0.7 / 4s. |
| **Content**            | Per panel: 1 thin line chart OR 1 sparkline grid OR 1 big number (≤ 4 digits). Abstract — no labels. |
| **Reveal**             | On scroll-into-view: panels fade in 1.2s, staggered 0.2s.                                  |
| **Emotional verb**     | *Operation*.                                                                               |
| **Forbidden**          | Real UI elements (buttons/menus/scrollbars) · 3D rotation · drop shadows · gradient panel BGs · icons. |
| **Exports**            | `.splinecode` URL + 2400×1400 WebP poster.                                                 |

### 1.5 — Optional Ambient Background System

A single subtle ambient scene that can sit behind hero copy *between* the named scenes (or as a perpetual layer for sections without their own 3D). **Optional** — ship without it if it cannot meet the bar.

| Element                | Direction                                                                                  |
|------------------------|--------------------------------------------------------------------------------------------|
| **Geometry language**  | A single drifting mesh: faint elongated trapezoid or "panel sliver." No central object.    |
| **Composition**        | Off-center (golden ratio horizontal). Heavily vignetted. ≥ 85% void.                       |
| **Camera**             | Fully static.                                                                              |
| **Lighting**           | Indigo key only · Bloom intensity 0.5 (lower than hero).                                   |
| **Motion**             | Single drift on X-axis, 24s cycle, slow-in/slow-out. One ambient particle field, sub-flicker. |
| **Performance**        | Tighter than hero — ≤ 4,000 polys, ≤ 1.0 MB decoded, ≤ 60 draw calls.                      |
| **Mobile**             | `skipOnTouch={true}` by default.                                                           |
| **Forbidden**          | Anything that competes with the foreground content. The scene exists to *not be noticed first*. |
| **Exports**            | `.splinecode` URL + 2400×1400 WebP poster.                                                 |

### 1.6 — Export specifications (artist handback)

The artist returns:

1. The `.splinecode` URL (`https://prod.spline.design/<id>/scene.splinecode`).
2. The poster WebP at the spec'd dimensions.
3. A short Loom (or equivalent) walkthrough — 60 seconds — showing: the static frame, the loop, the parallax (if applicable), and the reduced-motion poster as it would appear standalone.
4. A filled `approval_checklist.md` (from `04_quality_gate/`).
5. The `.spline` working file — for archival.

### 1.7 — Optimization requirements

Re-stated from [SPLINE_CINEMATIC_EXECUTION_SYSTEM.md Phase 5](SPLINE_CINEMATIC_EXECUTION_SYSTEM.md#phase-5--performance-constraints) — the artist must self-verify:

| Scene     | Polys cap | Decoded size | Draw calls |
|-----------|-----------|--------------|------------|
| Hero      | 8,000     | ≤ 1.5 MB     | ≤ 90       |
| Workflow  | 12,000    | ≤ 1.5 MB     | ≤ 90       |
| Dashboard | 6,000     | ≤ 1.2 MB     | ≤ 70       |
| Ambient   | 4,000     | ≤ 1.0 MB     | ≤ 60       |

Scenes that fail any cap are returned for simplification — geometry first, materials second, lights third, textures last.

### 1.8 — Interaction expectations

- Pointer events are eaten by the React wrapper (`disableInteraction`); the artist should still build scenes that *would be cinematic if interactive* (no orbit-only-makes-sense framing).
- No camera controllers active in the export. Any orbit/pan controllers in Spline must be removed before export.
- No links, no tooltips, no Spline UI overlays.

---

## PHASE 2 — Visual Asset System

The launch-day asset checklist. Every asset on this list either ships or is **explicitly deferred** with a placeholder strategy. Nothing on this list lives in "TBD" status at go-live.

### 2.1 — Founder imagery direction

Use only if a founder photo is going on the site. If not — skip; the brand reads strongly without one.

- **Single portrait, three-quarter angle**, head-and-shoulder framing, ~85mm equivalent.
- **Background:** dark void (matte black or charcoal `#0B0B12`) — never a gradient, never a brand color.
- **Lighting:** single key from camera-left, soft fill, no rim. Skin reads cool-neutral, not warm.
- **Wardrobe:** monochrome (black, charcoal, deep navy). No logos, no patterns, no jewelry larger than a wedding band.
- **Expression:** neutral-to-slight, eyes engaged, no smile-for-the-camera.
- **Post:** light grain (matches site grain), cool grade, no skin smoothing artifacts.
- **Format:** WebP, served at 800×1000 (3:4), retina 1600×2000 source.
- **Forbidden:** office-environment shots, "casual moment" candids, group photos, branded backdrops.

### 2.2 — Case study visual direction

Each case study gets *exactly* the same visual scaffolding (consistency is the point):

- **Hero still:** abstract cinematic frame (NOT a screenshot). Examples: a single lit panel against void; a faint waveform; a drifting geometric primitive. Render or stock-light, never real-world photography.
- **Before / After:** two stacked frames, identical aspect, identical typography, the *same metric* presented twice. See [§3.4](#34--metrics-presentation) for metric formatting.
- **Process gallery:** 3 frames maximum. Each frame is a *moment* (data ingested → automation runs → decision made), not a step-by-step screenshot.
- **Closing still:** the brand mark + a single line of customer voice, set against void.
- **Aspect ratios:** all stills are 16:10 (1600×1000) for desktop, 4:5 (1080×1350) for mobile/social. No 1:1, no 9:16, no 16:9.

### 2.3 — Trust-strip logo treatment

- **Mono treatment, white at 60% opacity** on the void background. Never client brand colors.
- All logos rendered at the **same optical weight** (not the same pixel height — visually balanced by mass).
- 5–8 logos maximum. More than 8 reads as small-agency. Fewer than 5 reads as early-stage.
- 24px tracking between logos at desktop, 16px at mobile.
- **Permission required** for every logo. Until permission is signed, the placeholder text marks (`STRATA`, `ARC.OPS`, etc.) ship — they are *intentional* placeholders, not bugs.
- On hover (desktop only): logo lifts to 90% opacity over 240ms, no other change.

### 2.4 — Social preview imagery

The dynamic OG image at `/opengraph-image` already renders the brand aurora + headline + brackets. Static fallbacks needed for platforms that cache aggressively:

| Asset                         | Dimensions   | Path                              | Purpose                               |
|-------------------------------|--------------|-----------------------------------|---------------------------------------|
| Default OG (dynamic)          | 1200×630     | `/opengraph-image`                | Already wired — verify on launch.     |
| Twitter card (dynamic)        | 1200×630     | `/twitter-image`                  | Already wired.                        |
| LinkedIn share fallback       | 1200×627     | `/public/social/linkedin.webp`    | Static — for LI's caching quirks.     |
| Square (IG profile share)     | 1080×1080    | `/public/social/square.webp`      | For pasted-link previews on IG.       |
| Story / Reel cover            | 1080×1920    | `/public/social/story.webp`       | Used in [Phase 4](#phase-4--launch-content-ecosystem). |

All social fallbacks share the same composition language: brand aurora · brackets · single headline line · no people, no UI.

### 2.5 — Dashboard screenshots

If real product screenshots are needed (case studies, "in action" sections):

- Capture at **2× retina** (e.g., 2560×1600 logical = 5120×3200 actual), then downscale.
- Crop to **16:10**, never the full browser chrome.
- Strip all customer data — replace with neutral placeholder (numbers in the 1,000–9,999 range, names from a generic list).
- Apply the **brand grade**: slight cool shift, +5% contrast, mild grain. Match the site's atmosphere.
- Render screenshots inside a **floating glass panel** mockup (PNG with hairline indigo edge), never raw.
- WebP, quality 82, max 220 KB per image.

### 2.6 — Cinematic mockups

For sections that need to *imply* a product without showing one:

- **Frosted-glass panels** at slight depth, indigo hairlines, no UI inside. The Dashboard Spline scene is the canonical reference.
- **Always against void**, never on white or gradient backgrounds.
- **Type-led overlays** beat UI-led ones — a single big number with a 12px label outperforms a fake chart 9 times out of 10.
- Export as PNG (transparency required) for easy compositing into HTML/CSS sections.

### 2.7 — Typography compositions

For posters, social, hero stills:

- **Display face:** the site display family (defined in [tailwind.config.ts](tailwind.config.ts)). Never substitute.
- **Body face:** the site body family. Never substitute.
- **Mono:** for numbers and metrics only.
- **Tracking:** display tight (-0.02em), body neutral (0), mono slightly loose (+0.02em).
- **Color:** white at 92% on void. Never pure white. Never any other color for type unless it is a metric in indigo.
- **One headline per composition.** Two lines max. Under 9 words.
- **Hierarchy:** display · subhead · body · meta. Never flatten — never display + display.

### 2.8 — Launch poster concepts

Three poster compositions to render at 2400×3000 (printable 4:5):

1. **The Awakening.** Hero core silhouetted on void, headline below, brackets at corners.
2. **The Descent.** Workflow plane in perspective, signal packet mid-flight, single line of copy.
3. **The Invitation.** CTA-style: monolith + violet wash, headline "*Build the system that runs your business.*"

Each poster has a **dark mode** (default) and a **light mode** (charcoal `#1A1A22` instead of pure black, for print on coated stock).

### 2.9 — Thumbnail systems

For YouTube, blog headers, sharing surfaces. Three slots, every video/article uses one:

- **Thumb-A · Geometric.** Single primitive (icosahedron, panel, ring) on void. Headline 4–6 words.
- **Thumb-B · Atmospheric.** Aurora/light wash, no geometry. Headline 2–4 words.
- **Thumb-C · Architectural.** Multiple panels at depth, brackets visible. Headline 5–8 words.

All thumbs are 1280×720, WebP, quality 85, max 180 KB. **No faces** in thumbnails. **No arrows or circles** highlighting things. **No reaction emojis.**

### 2.10 — Visual hierarchy rules

A single rule governs every composition: **one focal point, two supporting layers, void.**

- **Focal point** = the thing the eye lands on first (1.5s). One per composition.
- **Supporting layers** = what reinforces the focal point on second pass (3–5s). Two maximum.
- **Void** = the rest. Always ≥ 50% of the canvas.

Compositions that violate this rule are rejected at the asset gate.

---

## PHASE 3 — Case Study Cinematic System

Case studies are the proof layer. They must read as **premium product documentaries**, not agency portfolio blocks. The format is identical for every case study — variation is the customer's story, not the structure.

### 3.1 — Before / After rhythm

The narrative arc of every case study, in five beats:

1. **The friction.** What was slow, manual, error-prone. (One sentence + one frame.)
2. **The discovery.** What SheetFlow saw that the customer didn't. (One sentence + one frame.)
3. **The intervention.** What was built. (One sentence + one frame — abstract, not screenshot.)
4. **The outcome.** Numbers. (Metrics block — see [§3.4](#34--metrics-presentation).)
5. **The voice.** Customer quote. (Pull-quote, not a paragraph — under 30 words.)

Every case study has these five beats, in this order. Variations are stylistic, not structural.

### 3.2 — Automation storytelling

The customer is the protagonist. SheetFlow is the *infrastructure that quietly resolved the problem*. Tone:

- **Show the friction; don't dramatize it.** "The team rekeyed 1,400 rows weekly" beats "the team was drowning."
- **Show the resolution; don't gloat.** "Now they don't" beats "we transformed their business."
- **Show the proof; don't sell.** Metrics with units, time-bound, comparable. No marketing adjectives.
- **The customer voice closes; the brand never closes its own case study.**

### 3.3 — Visual pacing

Each beat occupies one full viewport on desktop, scrolled through with cinematic transitions:

- Each beat enters via fade-up (24px translate, 800ms cinematic ease).
- Each beat dwells — no auto-advance.
- The next beat begins ≥ 50vh below the current one. Negative space separates the beats.
- Total scroll length per case study: 5–7 viewports. Longer is bloat. Shorter is incomplete.

### 3.4 — Metrics presentation

The proof beat (#4) is the most important visual. Its layout is fixed:

```
        [ FRICTION ]                    [ OUTCOME ]
        ──────────                      ──────────
         8.5 hrs                          22 min
         per week                         per week
         (manual reconciliation)          (automated)

                          ━━━━━━━━━━
                          96% time saved
                          ━━━━━━━━━━
```

Rules:
- **Two columns,** identical typography, identical scale.
- **Mono font** for every number.
- **Units always present** ("hrs", "min", "$/mo", "rows", "%").
- **Time bound** ("per week", "per quarter") — never bare numbers.
- **One synthesized takeaway line** below ("96% time saved"), in indigo.
- **No charts** in the proof beat — charts dilute. The contrast of two big numbers is the point.

### 3.5 — Motion direction

- Beat transitions: fade-up only. No slide-from-side, no zoom, no parallax.
- The metrics block animates the numbers from the *friction* value to the *outcome* value over 1.6s, ease-out-cubic, **once**, on first viewport entry. Never loops.
- The customer quote fades in 800ms after the metrics settle. Sequencing matters — proof first, then voice.

### 3.6 — Proof hierarchy

Reading order, enforced by visual weight:

1. The metrics block (largest, brightest, indigo accent).
2. The customer voice (pull-quote, italic, 70% opacity).
3. The intervention frame (abstract still, 50% opacity overlay).
4. The friction line (small, body opacity).

The metrics are the proof. Everything else is context.

### 3.7 — Emotional persuasion structure

A SheetFlow case study persuades by **understatement**:

- The friction is described matter-of-factly. Not "they were drowning" — "they rekeyed 1,400 rows weekly."
- The outcome is described mechanically. Not "we revolutionized" — "now it runs in 22 minutes, untouched."
- The customer voice carries the *emotion*. The brand voice carries the *facts*.

This split is non-negotiable. The brand never emotes; the customer never reports metrics.

### 3.8 — Case study — Never do

- No **logo wall** at the top of a case study (the trust strip already handles brand validation).
- No **Lorem ipsum** placeholders ever — write real copy or delay launch.
- No **before/after sliders.** They cheapen the proof.
- No **client testimonial videos** (yet). Video raises the production bar across every other asset; defer until v2.
- No **"how we did it" technical breakdowns.** Defer to a separate technical post if needed.
- No **multiple metrics blocks** per case study. One is the proof.

---

## PHASE 4 — Launch Content Ecosystem

The launch is not the website going live — it is a **coordinated atmospheric reveal across surfaces**. Every surface speaks the same visual language; every post is on-brand or it doesn't ship.

### 4.1 — Surface map

| Surface             | Format                         | Rhythm             | Owner                |
|---------------------|--------------------------------|--------------------|----------------------|
| Instagram (feed)    | 4:5 stills, 9:16 reels         | 3 posts in launch week, then weekly | Founder + brand     |
| Instagram (story)   | 9:16, 15s max                  | Daily during launch week           | Founder              |
| Reels / TikTok      | 9:16, 12–18s                   | 1 reel at launch, 1/week for 4 weeks| Brand + editor       |
| YouTube Shorts      | 9:16, ≤ 60s                    | Same edit as Reels, re-published   | Editor               |
| Twitter / X         | Single image + thread          | Launch day thread, then 2/week     | Founder              |
| LinkedIn            | Single image + long post       | Launch day post, then 1/week       | Founder              |
| Cinematic showcase  | 16:9, 60–90s, hosted on site   | One asset, evergreen               | Brand + editor       |

### 4.2 — Pacing rules

- **Launch day:** the cinematic showcase + one post per surface. No more. Do not flood.
- **Launch week:** one post per surface per day, on rotation. Each post is a *moment* (a frame, a quote, a metric, a clip).
- **Post-launch:** weekly cadence. Quality over volume. **Skip a week before posting something off-brand.**

### 4.3 — Visual rhythm

Across all surfaces, every post belongs to one of three types — and the rotation enforces consistency:

- **Type A · The Frame.** A single cinematic still (geometric or atmospheric). Caption: a single line.
- **Type B · The Proof.** A metric block (from a case study or a public stat). Caption: the friction → outcome story in 2 sentences.
- **Type C · The Voice.** A customer or founder quote on void. Caption: attribution only.

Rotation: A → C → B → A → C → B. Never two of the same type back-to-back.

### 4.4 — Caption tone

- **Lowercase preferred** for short captions (Type A, C). Uppercase for headlines and metrics within frames.
- **No emojis.** No hashtag stacks (≤ 3 hashtags, lowercase, never trending).
- **No "thread 🧵" cliches, no "1/" numbering at the start.** Threads start with the substance.
- **Never sell in the caption.** Sell in the link in bio, in the LinkedIn long post, in the website. Captions are atmosphere.

Caption length:
- Instagram feed: 1–3 sentences.
- Twitter: 1 sentence per tweet, 4–7 tweets per thread.
- LinkedIn: 4–8 short paragraphs, no fluff intro, no "PSA."
- Reels: 1 sentence as caption, the *clip* carries the message.

### 4.5 — Motion timing (Reels / Shorts)

For every short-form video, a fixed beat structure:

| Beat               | Duration  | Content                                                |
|--------------------|-----------|--------------------------------------------------------|
| 0 — Hook           | 0–1.5s    | A single cinematic frame · brand mark visible · 1 line of type |
| 1 — Setup          | 1.5–4s    | The friction (one shot, slow push or static)           |
| 2 — Reveal         | 4–10s     | The intervention (Spline scene or screenshot mockup)   |
| 3 — Proof          | 10–14s    | The metric (animated number from friction → outcome)   |
| 4 — Close          | 14–17s    | Brand mark + one line "*we build the systems that run your business.*" |

Every Reel is 12–18 seconds. The above structure compresses to 12s by tightening 1 and 2.

### 4.6 — Atmosphere consistency

Across every surface — feed, story, reel, thread, post:

- **Background:** site void (`#070711`) or void-equivalent. Never pure black, never any other color.
- **Type:** display + body + mono — same hierarchy as the site.
- **Color accent:** indigo only. Violet for "descent" themed posts; cyan for "signal" themed posts. Never mixed.
- **Brackets:** the signature corner brackets appear on every full-frame composition. They are the visual fingerprint.
- **Grain:** subtle film grain (the site's atmosphere) baked into every still and video.

### 4.7 — Cinematic sequencing (launch week)

A 7-day visual arc. Each day reinforces the previous:

| Day | Theme           | Surface mix                         | Asset focus                                |
|-----|-----------------|-------------------------------------|--------------------------------------------|
| 0   | Awakening       | All surfaces                        | Cinematic showcase + Type A frame post     |
| 1   | The friction    | Twitter, LinkedIn, IG story         | Type B proof (anonymized stat)             |
| 2   | The intervention| Reels, IG feed                      | Type A frame (Workflow scene still)        |
| 3   | The voice       | Twitter, IG story                   | Type C founder quote                       |
| 4   | The system      | LinkedIn, IG feed                   | Type A frame (Dashboard scene still)       |
| 5   | The proof       | Twitter thread, LinkedIn            | Type B (case study metric block)           |
| 6   | The invitation  | All surfaces                        | Type A frame (CTA composition) + link      |

After day 6, the cadence drops to 1 post per surface per week, on the same A/C/B rotation.

### 4.8 — Cinematic product showcase

The single hero piece of launch content: a 60–90 second film embedded on the site (and posted to YouTube + LinkedIn).

- **Format:** 16:9, 4K source, 1080p delivery. WebM (VP9) for the site, MP4 (H.264) for socials.
- **Audio:** ambient pad + a single signature whoosh at the proof moment. **Voice-over optional.** If used: under 80 words total, calm, factual.
- **Structure:** Awakening (15s) → Descent (20s) → Operation (20s) → Invitation (15s). Maps directly to the four Spline scenes.
- **Type:** appears 3 times — title (start), one mid-card, brand close (end). All white-on-void, no transitions.
- **Forbidden:** music drops, beat-synced cuts, talking heads, kinetic type, motion graphics templates.

### 4.9 — Content — Never do

- Never post a screenshot of the website. Post a *frame* from it instead.
- Never post a "we just launched" celebration with confetti or champagne emojis.
- Never quote a metric without its time bound or unit.
- Never post a meme.
- Never engage with bait posts in the launch week — atmosphere over engagement.
- Never run a giveaway, a discount code, or a "tag a friend" mechanic. The brand doesn't bargain.

---

## PHASE 5 — Deployment & Go-Live Execution

The real-world launch sequence. The engineering side is fully covered in [DEPLOYMENT.md](DEPLOYMENT.md); this phase is the **launch-day choreography** that wraps it.

### 5.1 — Deployment order

Strict T-minus sequence — do not skip ahead.

| Time      | Step                                                                   | Owner          |
|-----------|------------------------------------------------------------------------|----------------|
| T-7 days  | All Spline scenes received, gated, and staged in Preview env           | 3D + Eng       |
| T-5 days  | All visual assets in `/public/`, posters wired                         | Brand          |
| T-3 days  | Case studies finalized (real copy, real metrics, signed permissions)   | Brand + founder|
| T-2 days  | Final preflight: `npm run preflight` from [DEPLOYMENT.md](DEPLOYMENT.md) — green | Eng           |
| T-1 day   | Lighthouse pass on Preview deployment ≥ targets                        | Eng            |
| T-1 day   | Social previews validated (LI Inspector, Twitter Validator, OG.xyz)    | Eng + brand    |
| T-1 day   | Launch content drafted and scheduled (Phase 4 day 0 assets)            | Brand          |
| T-0       | Promote Preview → Production deployment in Vercel                      | Eng            |
| T-0       | Verify [DEPLOYMENT.md post-deploy verification table](DEPLOYMENT.md)  | Eng            |
| T-0 +1h   | Publish launch content (Phase 4 day 0)                                 | Brand + founder|
| T-0 +24h  | First-day observation checklist ([§5.10](#510--post-launch-observation-checklist)) | Eng + growth |

### 5.2 — Asset insertion order

To avoid a half-loaded launch (real copy + placeholder images, or real images + draft copy):

1. **Static assets first.** Posters, OG images, favicons, manifest icons. Cached aggressively.
2. **Text content second.** Headlines, body, case studies, customer voice. Re-deployed.
3. **Spline env vars third.** Once §5.3 is green for each scene, set the env var and redeploy.
4. **Social fallback images last.** Push after the dynamic OG is verified live.

Never insert an asset into the production env before its quality gate has passed.

### 5.3 — Spline replacement order

Promote Spline scenes one at a time. Each scene goes through this gate before the env var is set:

1. Quality gate passed ([SPLINE_CINEMATIC_EXECUTION_SYSTEM.md Phase 7](SPLINE_CINEMATIC_EXECUTION_SYSTEM.md#phase-7--cinematic-quality-gate)) → ✅
2. Performance gate passed ([SPLINE_CINEMATIC_EXECUTION_SYSTEM.md Phase 5](SPLINE_CINEMATIC_EXECUTION_SYSTEM.md#phase-5--performance-constraints)) → ✅
3. Director sign-off ("feels like SheetFlow" review) → ✅
4. Set env var on **Preview only**, redeploy, validate live for 24h.
5. Promote env var to **Production**.

Order of promotion (smallest blast radius first):
1. **Dashboard** (mid-page, smallest scene)
2. **Workflow** (mid-page, larger)
3. **Hero** (top of page, highest visibility)
4. **CTA / Ambient** (last)

If any scene regresses Lighthouse Performance below 85 mobile, revert its env var (set to empty string) and ship without it.

### 5.4 — QA process

Pre-launch QA, in this order:

1. **Routes** — every URL in the [DEPLOYMENT.md verification table](DEPLOYMENT.md) returns expected content.
2. **Headers** — `curl -I` confirms every security header from [DEPLOYMENT.md](DEPLOYMENT.md).
3. **Metadata** — view source on `/`, confirm both JSON-LD blocks (`Organization`, `WebSite`) present.
4. **Forms** — inquiry form submits successfully; success state shows; spam protection active.
5. **Links** — every external link opens in new tab with `rel="noopener noreferrer"`.
6. **Copy** — banned-copy lint passes (no "ROI guaranteed", "10x", "AI-powered" hyperbole, etc., per brand governance).
7. **Reduced motion** — DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` → confirm posters render, no scenes mount, no jarring transitions.

### 5.5 — Mobile verification

On real devices (not emulators):

- **iPhone 12 (Safari)** — primary mobile reference.
- **Pixel 6a (Chrome)** — floor device.
- **iPad Air (Safari)** — tablet check.

For each device, verify:
- Hero loads in < 3s on 4G.
- Cursor is hidden (custom cursor is desktop-only).
- Spline scenes either run smooth (≥ 30 FPS) or fall back to poster cleanly.
- Touch targets ≥ 44px.
- No horizontal scroll at any width 320–430px.
- Form inputs do not zoom on focus (font-size ≥ 16px).

### 5.6 — Browser testing

| Browser           | Version          | Required pass                                   |
|-------------------|------------------|-------------------------------------------------|
| Chrome (desktop)  | Latest stable    | Full feature set                                |
| Safari (macOS)    | Latest stable    | Full feature set                                |
| Safari (iOS)      | Latest stable    | Mobile feature set, Spline degrades gracefully  |
| Firefox (desktop) | Latest stable    | Full feature set, GSAP and R3F functional       |
| Edge (desktop)    | Latest stable    | Full feature set                                |
| Chrome (Android)  | Latest stable    | Mobile feature set                              |

**Not supported:** IE11 (already past EOL), Opera Mini (data-saver mode breaks JS heavy pages by design — site degrades to text-only, which is fine).

### 5.7 — Social preview testing

After each deploy, paste `https://sheetflow.ai/` into:

1. **LinkedIn Post Inspector** — `https://www.linkedin.com/post-inspector/` — click "Inspect" twice (once to refresh cache).
2. **Twitter Card Validator** — `https://cards-dev.twitter.com/validator`.
3. **OpenGraph debugger** — `https://www.opengraph.xyz/`.
4. **Slack** — paste the URL into a private DM and check the unfurl.
5. **Discord** — same.
6. **iMessage** — link preview test.

Failure modes to watch:
- LinkedIn shows a stale image → click "Inspect" again to bust cache.
- Twitter shows no card → confirm `twitter:card` meta + dynamic `/twitter-image` returns 200.
- Slack shows the favicon instead of OG → confirm `og:image` is absolute URL, not relative.

### 5.8 — Lighthouse validation

Targets (from [DEPLOYMENT.md](DEPLOYMENT.md)):

- Performance ≥ 85 mobile, ≥ 95 desktop
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO = 100

Run on production URL, mobile preset, throttled 4G, three runs, report the *median*. A single bad run is normal; a median below target is a real regression.

### 5.9 — Analytics validation

Within 1 hour of go-live:

- **Vercel Analytics** receiving Web Vitals (CLS, INP, LCP, FCP, TTFB).
- **Plausible** (or chosen provider) showing live visitors and the homepage pageview event.
- **Goal funnel** wired: hero CTA click → final CTA click → form submit. Verify the events fire in DevTools Network tab.
- **No PII** in analytics payloads — confirm in DevTools.

### 5.10 — Post-launch observation checklist

First 24 hours:

- [ ] Vercel deployment status: no errors in Functions / Edge logs.
- [ ] Lighthouse on production: targets met (re-run after T-0 +1h).
- [ ] Web Vitals: LCP p75 < 2.5s, CLS p75 < 0.1, INP p75 < 200ms.
- [ ] No 5xx errors in Vercel → Logs.
- [ ] No 404s to expected routes (check Vercel → Logs → filter 404).
- [ ] Inquiry form: at least one test submission per environment delivered.
- [ ] Social shares: spot-check each platform shows correct OG.
- [ ] DNS: `sheetflow.ai` and `www.sheetflow.ai` both resolve, redirect chain correct.
- [ ] HSTS header present and `preload` directive valid (submit to hstspreload.org).

First week:

- [ ] Rerun Lighthouse on three device classes (low-end Android, iPhone SE, MacBook Air).
- [ ] Review the 404 log — expect zero hits to expected routes.
- [ ] Confirm analytics goal funnel: hero CTA → final CTA → form submit.
- [ ] Replace remaining placeholder client logos with real ones (signed permission).
- [ ] Wire any deferred Spline scenes that have since landed.
- [ ] Inquiry form spam-rate check; add hCaptcha if signal-to-noise drops < 80%.

### 5.11 — Rollback protocol

Tiered, fastest-first:

1. **Spline regression** (a scene tanks performance or looks wrong): set the env var to empty string in Vercel → site falls back to R3F `AICore`. **No deploy needed.** ~30 seconds.
2. **Asset regression** (poster, OG image, screenshot): replace the file in `/public/`, redeploy. ~3 minutes.
3. **Copy regression** (typo, wrong metric): edit the source file, redeploy. ~3 minutes.
4. **Code regression** (broken interaction, JS error): Vercel → Deployments → previous green deploy → **Promote to Production**. **Instant**, no rebuild. See [DEPLOYMENT.md](DEPLOYMENT.md) rollback section.
5. **Total outage** (security incident, build pipeline broken): point DNS to a static maintenance page hosted separately. Last resort. ~15 minutes if DNS TTL is set short.

For every rollback above tier 1: log the incident, the root cause, and the fix in `incidents.md` (create on first incident). The brand learns; the brand does not panic.

---

## PHASE 6 — Cinematic Final Review

The director-level review. To be performed in person (or on a single shared screen-share) after all phases above are complete. The reviewer is the founder or a designated brand steward.

The review answers seven questions. Each gets one of three answers: **Yes**, **No**, **Not yet**. The launch goes only when every answer is **Yes**.

### Q1 — Does this feel unmistakably SheetFlow AI?

Test: load the site in a private window, watch for 30 seconds with the volume off. Could this be any other AI agency? If the answer requires thinking, the answer is *No*.

What "Yes" looks like:
- The aurora + grain + brackets + scan signature are present in every section.
- The void background is *the* background — never a gradient, never an image.
- The cursor, the typography, the corner brackets read as the same designer's hand throughout.
- A reasonable competitor's site, placed next to it, looks generic by comparison.

### Q2 — Does this feel emotionally memorable?

Test: 24 hours after the review, can the reviewer recall *one specific frame* from the experience without prompting? If they describe "a tech website with dark mode," the answer is *No*.

What "Yes" looks like:
- The Awakening (hero) and the Invitation (final CTA) are the two memory pegs.
- One headline can be quoted verbatim a day later.
- One Spline scene moment (a breath, a packet, a panel arrival) is remembered as a feeling.

### Q3 — Does this feel premium without trying too hard?

Test: read every adjective on the page out loud. If any adjective sounds like it's *trying* to sound premium ("revolutionary," "world-class," "cutting-edge"), the answer is *No*.

What "Yes" looks like:
- The copy is matter-of-fact. The atmosphere does the persuasion.
- No trophies, badges, or "as featured in" rows.
- Negative space is the loudest design element.
- Every typeface, color, and motion choice is restrained.

### Q4 — Does this feel cinematic instead of trendy?

Test: compare the site to three "trendy AI startup" sites from the current year. Does ours look *of this year*, or *of the next decade*?

What "Yes" looks like:
- No glassmorphism stacking competition.
- No 3D bento grids.
- No neon gradients.
- No "AI orb" stock animations.
- The motion language is film, not Figma.

### Q5 — Does this feel restrained?

Test: count active motions on screen at any given moment. Count typefaces. Count accent colors. Count call-to-action variants.

What "Yes" looks like:
- ≤ 3 active motions on screen at once, anywhere on the site.
- 2 typefaces (display + body) + 1 mono.
- 1 accent color (indigo) + 2 supporting (violet, cyan).
- 1 primary CTA, used consistently — not 6 buttons competing.

### Q6 — Does this feel like a future luxury AI company?

Test: imagine the customer has just paid an enterprise contract value (six figures). Does the website *match* what they bought?

What "Yes" looks like:
- The website would not look out of place if it were the brand expression of a top-tier consultancy.
- The brand mark, set in isolation against void, looks like an institution — not a launch.
- The headline is confident, not aspirational. ("We build the systems that run your business" beats "We're on a mission to revolutionize…")
- Nothing on the site begs for attention.

### Q7 — Would this stand out among elite global startup websites?

Test: open the site in one tab, and 5 elite AI/SaaS sites in adjacent tabs (e.g., Linear, Vercel, Anthropic, Replit, Stripe). Tab through them.

What "Yes" looks like:
- Ours has more atmosphere than most of them.
- Ours is more restrained than most of them.
- A first-time visitor could identify ours blindfolded by typography + cursor + atmosphere alone.
- The site doesn't try to *be* any of them — it is its own category.

### Final review verdict

| Question                                                 | Verdict |
|----------------------------------------------------------|---------|
| 1 · Unmistakably SheetFlow                               |         |
| 2 · Emotionally memorable                                |         |
| 3 · Premium without trying too hard                      |         |
| 4 · Cinematic instead of trendy                          |         |
| 5 · Restrained                                           |         |
| 6 · Future luxury AI company                             |         |
| 7 · Stands out among elite global startup sites          |         |

**Launch when every cell is Yes. Defer when any cell is Not yet. Rework when any cell is No.**

The brand's reputation lives or dies on this review. There is no urgency that justifies launching with a *No*.

---

## Appendix — Asset directory map

The expected layout under `10_Final_Website/` at launch.

```
10_Final_Website/
├── public/
│   ├── posters/
│   │   ├── spline_hero_v1.0.webp
│   │   ├── spline_workflow_v1.0.webp
│   │   ├── spline_dashboard_v1.0.webp
│   │   └── spline_ambient_v1.0.webp        ← if ambient ships
│   ├── social/
│   │   ├── linkedin.webp                   ← static fallback
│   │   ├── square.webp
│   │   └── story.webp
│   ├── case-studies/
│   │   ├── <study-slug>/
│   │   │   ├── hero.webp
│   │   │   ├── intervention.webp
│   │   │   ├── before.webp
│   │   │   └── after.webp
│   ├── trust/
│   │   └── <client>.svg                    ← mono-treated, permission signed
│   ├── founder/
│   │   └── portrait.webp                   ← optional
│   └── og-fallback.webp                    ← static OG fallback
├── SPLINE_CINEMATIC_EXECUTION_SYSTEM.md
├── SPLINE_SCENE_BRIEF.md
├── DEPLOYMENT.md
├── CINEMATIC_AUDIT.md
└── FINAL_EXECUTION_LAYER.md                ← this file
```

Files with `<placeholder>` paths are produced during Phase 2; all are referenced by code or by the dynamic OG generator.

---

## Closing

The architecture is set. The brand is defined. The handbooks are written. What remains is **execution at the level the brand promises**.

Every Spline scene that ships passes the [Cinematic Execution System](SPLINE_CINEMATIC_EXECUTION_SYSTEM.md). Every asset that ships passes [Phase 2](#phase-2--visual-asset-system). Every case study that ships follows [Phase 3](#phase-3--case-study-cinematic-system). Every post that ships follows [Phase 4](#phase-4--launch-content-ecosystem). Every deployment follows [Phase 5](#phase-5--deployment--go-live-execution). And the launch only happens when [Phase 6](#phase-6--cinematic-final-review) is unanimous *Yes*.

*Restraint is the feature. The launch is the proof.*
