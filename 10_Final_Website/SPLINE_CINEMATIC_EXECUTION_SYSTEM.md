# SPLINE CINEMATIC EXECUTION SYSTEM

> The permanent cinematic 3D production handbook for SheetFlow AI.
>
> This document supersedes ad-hoc Spline notes and is the single source of truth for authoring, exporting, integrating, validating, and shipping every Spline scene in the SheetFlow AI experience. It assumes the production architecture in `10_Final_Website/` and the existing wrapper at [src/components/three/SplineScene.tsx](src/components/three/SplineScene.tsx) and registry at [src/lib/spline-scenes.ts](src/lib/spline-scenes.ts).
>
> Companion brief: [SPLINE_SCENE_BRIEF.md](SPLINE_SCENE_BRIEF.md) (designer-facing per-scene specs). This handbook is the engineering, art-direction, and quality system around it.

---

## Table of contents

- [PHASE 1 — Spline Execution Pipeline](#phase-1--spline-execution-pipeline)
- [PHASE 2 — Hero Intelligence Core](#phase-2--hero-intelligence-core)
- [PHASE 3 — Workflow Universe](#phase-3--workflow-universe)
- [PHASE 4 — Dashboard Intelligence Layer](#phase-4--dashboard-intelligence-layer)
- [PHASE 5 — Performance Constraints](#phase-5--performance-constraints)
- [PHASE 6 — Spline Implementation Guide](#phase-6--spline-implementation-guide)
- [PHASE 7 — Cinematic Quality Gate](#phase-7--cinematic-quality-gate)
- [Appendix A — Banned aesthetics](#appendix-a--banned-aesthetics)
- [Appendix B — Color & light reference](#appendix-b--color--light-reference)

---

## North star

A SheetFlow Spline scene is a **luxury intelligence system from the future**. Every scene must read as:

- **Restrained** — fewer than 3 active motions on screen at any time.
- **Cinematic** — slow eases, long beats, no bouncing, no fast cuts.
- **Atmospheric** — light, void, and bloom carry the mood; geometry is austere.
- **Intelligent** — the geometry suggests a *system*, not decoration.
- **Premium** — every frame could be a still in a luxury film.

If a scene would not appear in a high-end documentary about an AI system, it does not ship.

---

## PHASE 1 — Spline Execution Pipeline

The end-to-end production workflow. Every scene goes through this exact path; deviations require explicit director approval.

### 1.1 — Scene creation workflow

1. **Brief alignment.** Read the relevant section in [SPLINE_SCENE_BRIEF.md](SPLINE_SCENE_BRIEF.md) and the matching phase below. Confirm the *emotional verb* of the scene (Awakening / Descent / Operation / Invitation).
2. **Reference set.** Pull the reference frames from `04_3D_Concepts/` (or successor folder) before opening Spline. Do not author from memory.
3. **Working file naming.** `sheetflow_<scene>_v<major>.<minor>.spline` — e.g. `sheetflow_hero_v1.0.spline`. Versioning is described in §1.5.
4. **Authoring order.** Compose in this fixed order to prevent rework:
   1. Geometry primitives (no materials)
   2. Camera and framing
   3. Lights (key → fill → rim)
   4. Materials (matte first, emissive last)
   5. Motion (single beat at a time, never stacked)
   6. Post (bloom, tone-mapping)
5. **Background must be transparent.** The site's atmosphere shows through. Solid backgrounds are an automatic rejection.
6. **Camera lock on mobile.** Mouse-driven camera is desktop-only (the wrapper enforces this); confirm the static frame is a beautiful poster on its own.

### 1.2 — Export workflow

1. In Spline: **File → Export → Code Export → React**.
2. Copy the `.splinecode` URL (`https://prod.spline.design/<id>/scene.splinecode`).
3. **Capture a poster PNG** at the canonical static frame: 1440×1440 for square scenes, 2400×1200 for wide scenes. Save to `public/posters/spline_<scene>_<version>.webp` (convert to WebP, quality 80, max 220 KB).
4. Record the export in `04_3D_Concepts/spline_releases.md` (see §1.5).

### 1.3 — Optimization workflow

Run in order; stop as soon as the scene is under all budgets in [PHASE 5](#phase-5--performance-constraints).

1. **Geometry first.** Decimate, then merge meshes, then drop unused subdivisions. Spline's "Optimize" pane is a starting point, not the answer.
2. **Materials second.** Collapse duplicate materials. Replace any PBR with stylized matte where the visual difference is invisible against the void.
3. **Lights third.** Cap at 3 active lights per scene. Use baked ambient for everything else.
4. **Textures last.** Most SheetFlow scenes need zero textures. If one is required, max 1024×1024, KTX2/BasisU compressed.
5. **Re-export and re-measure.** A scene must re-pass [PHASE 5](#phase-5--performance-constraints) after every optimization round.

### 1.4 — Integration workflow

1. Add the URL under the matching env key in `.env.local` (and Vercel project env):
   - `NEXT_PUBLIC_SPLINE_SCENE_HERO`
   - `NEXT_PUBLIC_SPLINE_SCENE_WORKFLOW`
   - `NEXT_PUBLIC_SPLINE_SCENE_DASHBOARD`
   - `NEXT_PUBLIC_SPLINE_SCENE_CTA`
2. Confirm the registry entry in [src/lib/spline-scenes.ts](src/lib/spline-scenes.ts) is wired (it already is for the four canonical scenes).
3. Mount via [SplineScene.tsx](src/components/three/SplineScene.tsx) with the correct flags:
   ```tsx
   <SplineScene
     scene={SPLINE_SCENES.hero}
     poster={<HeroPoster />}
     disableInteraction
     skipOnTouch={false}
     label="Intelligence core"
   />
   ```
4. Ship behind the env gate. Empty env string → R3F fallback (`AICore`). The site is shippable without any Spline scene at any time.

### 1.5 — Versioning strategy

- **Semver per scene.** `MAJOR` = new composition or geometry language; `MINOR` = motion/lighting refinement; `PATCH` = optimization-only re-export.
- **One source of truth.** The Spline working file is canonical. The `.splinecode` URL is a build artifact and may be regenerated.
- **Release log.** `04_3D_Concepts/spline_releases.md` records each release: date, version, scene, `.splinecode` URL, poster path, file size (decoded), draw call count, approver. New rows are append-only.
- **Env vars are pinned per environment.** Preview deployments may use a `*_NEXT` URL; production is updated only after the quality gate passes.

### 1.6 — Update workflow

1. Branch the Spline working file: `sheetflow_<scene>_v<next>.spline`.
2. Author the change. Re-run §1.2 → §1.3.
3. Deploy the new URL to **Preview env first** (`NEXT_PUBLIC_SPLINE_SCENE_<NAME>` on the preview branch only).
4. Validate against [PHASE 7](#phase-7--cinematic-quality-gate).
5. Promote to production env. Keep the previous URL alive for 7 days for rollback.

### 1.7 — Rollback strategy

- **Same-day rollback** (incident, visual regression, perf regression): revert the env var to the previous URL; redeploy. No code change needed.
- **Multi-day rollback** (the new direction is wrong): revert the env var, then revert any code changes that depended on the new scene's structure (rare — the wrapper is structure-agnostic).
- **Total rollback** (Spline service outage, account compromise): set the env var to empty string. The site falls back to the R3F `AICore`. No deploy required if env is set via the host's runtime config.

### 1.8 — Fallback workflow

The site has three layers of fallback, all already implemented:

1. **Spline scene** — when env URL is set and the device passes capability checks.
2. **R3F canonical scene** (`AICore`) — when no env URL is set, or Spline fails to load.
3. **Static poster** — when `prefers-reduced-motion` is set, when `skipOnTouch` is enabled and the device is touch, or when JS is disabled.

The poster is **mandatory** for every scene. A scene without a beautiful static poster is not approved.

---

## PHASE 2 — Hero Intelligence Core

The first cinematic moment. The user lands and the scene answers a single question: *"is this a serious intelligence system?"* The answer must be unambiguous in under 1.5 seconds.

**Emotional verb:** *Awakening*.

### 2.1 — Composition

- **Centered icosahedron.** Visual center of mass at canvas center, slightly above optical center (~3% up) to feel "lifted."
- **Negative space dominates.** ~70% of the canvas is void. The core is a small, dense object inside a large, calm space.
- **Headline overlap.** The headline copy crosses the orbital rings at their outermost edge. The core never crosses the headline.

### 2.2 — Geometry language

- **Primary:** subdivided icosahedron, ~80–120 polys after subdivision.
- **Secondary:** wireframe icosahedron at 1.05× scale, opposite rotation.
- **Tertiary:** three concentric particle rings (radii 2.0 / 2.8 / 3.8 in scene units). Particles are 2px points, not meshes.
- **No fourth element.** Resist the urge to add a fourth ring, a satellite mesh, a frame, or a glyph.

### 2.3 — Orbital behavior

- Rings rotate around the world Y axis at ~0.05 rad/s.
- Adjacent rings rotate in **opposing** directions.
- Rotation is **constant velocity** (no easing, no breathing on the rings themselves).
- The core itself does not rotate; it *breathes*.

### 2.4 — Camera philosophy

- **Static frame is the default.** The scene must be beautiful with the camera completely still.
- **Mouse-driven parallax** (desktop only): lerp factor 0.04, max amplitude 0.18 on Y, 0.10 on X.
- **No orbit, no dolly, no zoom.** Ever.
- FOV: 28–32° (long lens — premium, calm).

### 2.5 — Atmosphere density

- Background: transparent (the site provides void, vignette, and grain).
- Volumetric fog: **off**. Atmosphere is implied by bloom and rim lighting, not by fog.
- Particle ambient: zero. The rings are the only particles.

### 2.6 — Lighting philosophy

- **Three-point.** Indigo key (top-left, intensity 1.0). Violet fill (bottom-right, 0.5). Cyan rim (below, 0.3).
- **Bloom on emissive only.** Threshold 0.85, intensity 0.7. The core's edges glow; nothing else does.
- **Tone-mapping:** ACES Filmic.
- **No HDRI.** Lit entirely by direct lights against transparent background.

### 2.7 — Interaction response

- Mouse parallax only. Lerped, slow, never feels "tracked."
- No click response in the scene itself (interaction belongs to the surrounding HTML/CTA).
- Touch: parallax disabled. Static frame.

### 2.8 — Motion restraint

Active motions allowed: **2 maximum**.
1. Core breathing (±2% scale, 6s sine, slow-in/slow-out).
2. Ring rotation.

Mouse parallax does not count — it is a response, not an active motion.

### 2.9 — Emotional pacing

The first 1.5 seconds of viewing must produce *recognition*, not surprise. Pacing rules:
- No animation cycle shorter than 4 seconds.
- No hard frame transitions.
- The scene's "loop" is invisible — there is no perceptible reset.

### 2.10 — Cinematic hierarchy

Reading order, in milliseconds from first paint:
- **0–400 ms:** core silhouette registers.
- **400–900 ms:** rings register as a system.
- **900–1500 ms:** breath and rotation register as *aliveness*.
- **>1500 ms:** the user is reading the headline; the scene is now ambient.

### 2.11 — Hero — Never do

- Never add a glow trail, particle ribbon, or "data flying" effect.
- Never add a glitch, RGB split, or scanline (the site adds those globally if needed).
- Never use pure white (`#ffffff`) emissive — always tinted toward indigo or violet.
- Never let the core touch a screen edge.
- Never animate the rings' radius.
- Never auto-rotate the camera.
- Never add a logo, a glyph, or text inside the scene.

---

## PHASE 3 — Workflow Universe

The user descends into the system. They should feel they are *under the surface* of a living AI infrastructure.

**Emotional verb:** *Descent*.

### 3.1 — Composition

- **Floating spreadsheet plane** at slight perspective (~12° tilt away from camera).
- **Smaller intelligence core** in the upper-right (0.6× hero core), receiving signals.
- **Foreground haze** lifts as the section enters the viewport — the user is "diving in."

### 3.2 — Node choreography

- The spreadsheet plane is a grid of cells (32×18 visible cells, only outlines).
- Cells **do not animate individually**. The plane is a stage, not a character.
- The scanning beam is the active actor — it sweeps left → right.

### 3.3 — Data stream movement

- A single **signal packet** (small luminous oblong, ~20px) emerges from a scanned cell.
- It travels to the upper-right core in **1.4s** with a cinematic ease (ease-out-cubic).
- It dissolves on arrival — no impact effect, no pulse.
- Frequency: one packet every 6s, perfectly aligned with the beam cycle.

### 3.4 — Automation storytelling

The scene tells one sentence: *"data is detected, understood, and absorbed."* That sentence repeats every 6 seconds, identically. There is no escalation, no climax — automation is calm.

### 3.5 — Environmental depth

- Three depth layers: foreground haze, mid-plane (spreadsheet), background void.
- Bloom and rim light separate the layers, not fog density.
- The core in the upper-right has its own subtle bloom — it reads as the *destination*.

### 3.6 — Focus transitions

- The viewer's eye should travel: beam → packet → core. This is enforced by:
  - Beam brightness peaking at the packet's emergence point.
  - Packet emissive brighter than the beam.
  - Core bloom brighter than both, but only when the packet arrives.
- The scene has no other visual events compete with this read.

### 3.7 — Intelligence hierarchy

| Element        | Visual weight | Brightness | Movement |
|----------------|---------------|------------|----------|
| Core (small)   | High          | High       | Breath   |
| Packet         | Medium        | Peak       | Linear→ease |
| Beam           | Medium        | Steady     | Linear   |
| Spreadsheet    | Low           | Dim        | Static   |
| Haze           | Low           | Very dim   | Slow drift |

### 3.8 — Pacing rhythm

- 6-second master cycle. Every motion is a multiple or harmonic of 6s.
- No element is faster than 1.4s.
- No element is slower than 12s.

### 3.9 — Workflow — Never do

- No "matrix rain" or falling-character effects.
- No animated cell values (no fake numbers ticking inside cells).
- No multiple simultaneous packets — one at a time.
- No camera movement.
- No color other than the indigo / violet / cyan triad.

---

## PHASE 4 — Dashboard Intelligence Layer

The believable luxury AI operating system. Enterprise-grade, but never sterile.

**Emotional verb:** *Operation*.

### 4.1 — Dashboard layering

- **Three holographic panels** at staggered Z depths (-1.5, 0, +1.5 scene units).
- Panels are translucent (opacity 0.65), edges hairlined indigo (1px).
- A **single trace line** connects them diagonally, drawn-in over 2s on first reveal.

### 4.2 — Holographic behavior

- Panels read as floating glass, not as screens.
- No bezels, no chrome, no UI scaffolding.
- Panel content is **abstract**: a thin line chart, a sparkline grid, a single big number. No labels, no axes, no logos.

### 4.3 — Ambient motion

- Panels float on a slow Y-axis sine: ±6px, 8s cycle, phase-offset across the three.
- The big number ticks up by 1 every 1.5s (mono font, no easing on the digit change).
- The trace line pulses brightness 0.4 → 0.7 → 0.4 over 4s.
- Camera is **fixed**.

### 4.4 — Information density

- One chart per panel. Maximum.
- No more than **9 visible data points** per panel.
- The big number has 4 digits maximum (e.g., `1,247`).
- Whitespace inside each panel is at least 40% of the panel area.

### 4.5 — Interaction subtlety

- No hover response in the scene (cursor is on HTML overlay, not 3D objects).
- The trace line's pulse is the only "alive" cue.
- On scroll-into-view: panels fade in over 1.2s, staggered 0.2s apart.

### 4.6 — Enterprise credibility

- Numbers and chart shapes must look *plausible* — no obvious fake data spikes.
- Panel typography is mono (system mono fallback) and identical across panels.
- The composition could screenshot as a real product still.

### 4.7 — Premium restraint

- No drop shadows.
- No gradients on panel backgrounds (only edge hairlines glow).
- No icons.
- No "sci-fi UI" overlays (concentric rings, target reticles, etc.).

### 4.8 — Dashboard — Never do

- No real product UI elements (no buttons, no menus, no scrollbars).
- No 3D-rotating panels.
- No data that climbs aggressively (the number ticks calmly).
- No more than three panels.
- No reflections on the panels.

---

## PHASE 5 — Performance Constraints

Smoothness is non-negotiable. A scene that drops below 60 FPS on the reference device is not a scene — it's a regression.

### 5.1 — Reference devices

- **Desktop reference:** MacBook Air M2 (2022), Chrome, 1440×900, AC power.
- **Mobile reference:** iPhone 12, Safari, default battery saver off.
- **Floor device:** Pixel 6a, Chrome. The scene must remain interactive (≥30 FPS) here, even if it falls back to poster.

### 5.2 — Polygon limits (per scene, total)

| Scene     | Hard cap | Target |
|-----------|----------|--------|
| Hero      | 8,000    | ~5,000 |
| Workflow  | 12,000   | ~8,000 |
| Dashboard | 6,000    | ~4,000 |
| CTA       | 5,000    | ~3,500 |

Particles count as 1 poly per particle for budgeting (Spline draws them as quads).

### 5.3 — Texture budget

- Default: **zero textures**. SheetFlow scenes are stylized matte + emissive.
- If a texture is unavoidable: 1024×1024 max, KTX2/BasisU, single channel preferred.
- No HDRIs. No environment maps. No matcaps unless explicitly approved.

### 5.4 — Animation budget

- Maximum **3 concurrent active animations** per scene (camera parallax does not count).
- Maximum **4 keyframed objects** per scene.
- All animations are sine, linear, or cubic-bezier. No spring, no bounce, no elastic.

### 5.5 — Lighting budget

- Maximum **3 dynamic lights** per scene (key, fill, rim).
- No real-time shadows. Shadows, if needed, are baked or faked with a dark plane.
- Bloom is the only post-processing effect Spline-side.

### 5.6 — Interaction budget

- Mouse parallax: lerp updates capped at 60Hz, idle when off-screen.
- No raycasting against scene meshes. Pointer events are eaten by the wrapper (`disableInteraction` is the default).
- No physics. Ever.

### 5.7 — GPU safety thresholds

| Metric                       | Floor (warn) | Ceiling (block) |
|------------------------------|--------------|-----------------|
| Frame time (desktop ref)     | 14 ms        | 18 ms           |
| Frame time (mobile ref)      | 22 ms        | 32 ms           |
| Decoded scene size           | 1.2 MB       | 1.5 MB          |
| Draw calls                   | 60           | 90              |
| Initial JS payload (Spline)  | already lazy | n/a             |

A scene that crosses any *ceiling* on the reference device is rejected.

### 5.8 — Mobile fallback rules

- `skipOnTouch={true}` for any scene that profiles >32 ms frame time on the floor device.
- Hero scene currently mounts on mobile (acceptable). Workflow and Dashboard should profile before enabling on mobile; default `skipOnTouch={true}` until validated.
- Reduced-motion users always see the poster.

### 5.9 — Performance verification

Before promoting an env URL to production:
1. Run the scene at the reference resolution for 30s; record max frame time via Chrome DevTools Performance.
2. Run the scene at the floor device; confirm ≥30 FPS or `skipOnTouch` falls back.
3. Run Lighthouse on the page; confirm Performance ≥ 85 mobile, ≥ 95 desktop. The site already passes — Spline must not regress this.
4. Record the numbers in `spline_releases.md`.

---

## PHASE 6 — Spline Implementation Guide

Step-by-step engineering instructions. This is the path from a `.splinecode` URL to a shipped scene.

### 6.1 — `.splinecode` workflow

1. Confirm the URL is HTTPS and on the `prod.spline.design` host. (Staging URLs are not allowed in production env.)
2. Confirm the URL responds with `200 OK` and `content-type: application/octet-stream` (Spline's binary format).
3. Confirm the asset is < 1.5 MB decoded. If served gzipped, decode and re-measure.
4. Add the URL to `.env.local` and to the matching env scope on Vercel (Preview vs Production).

### 6.2 — Env variable setup

```bash
# .env.local
NEXT_PUBLIC_SPLINE_SCENE_HERO=https://prod.spline.design/<id>/scene.splinecode
NEXT_PUBLIC_SPLINE_SCENE_WORKFLOW=
NEXT_PUBLIC_SPLINE_SCENE_DASHBOARD=
NEXT_PUBLIC_SPLINE_SCENE_CTA=
```

- Empty string = use R3F fallback. This is a valid production state for any scene.
- Restart `next dev` after editing `.env.local`.
- On Vercel: set these per-environment (Preview / Production), then redeploy.

### 6.3 — Scene replacement

To swap a scene without a code change:

1. Author the new Spline scene (§1.1 → §1.3).
2. Update the env var in the host (Vercel UI or CLI).
3. Redeploy (or rely on a runtime env if configured).
4. The wrapper picks up the new URL on next mount. No code change. No build change.

To swap a scene with a structural change (different aspect ratio, new poster, different `disableInteraction`):

1. Update the call site (the page component that mounts `SplineScene`).
2. Update the poster export.
3. Ship the env var change in the same release.

### 6.4 — Lazy loading

Already wired in [SplineScene.tsx](src/components/three/SplineScene.tsx):
- `next/dynamic({ ssr: false })` keeps `@splinetool/react-spline` out of the SSR bundle.
- `IntersectionObserver` with `rootMargin: '200px'` mounts the Spline component only when the wrapper approaches the viewport.
- Default `lazy={true}`. Override only for above-the-fold scenes that must paint immediately (the hero is acceptable as `lazy={true}` because its rootMargin gives a 200px head start).

### 6.5 — Hydration protection

- Spline mounts client-only (`ssr: false`). The poster renders on the server and during the pre-mount phase.
- The wrapper avoids reading `window` outside `useEffect`.
- The poster uses Next's `Image` component with `priority` for the hero scene only.
- Verify SSR with `NEXT_PUBLIC_SPLINE_SCENE_*=` empty in CI to ensure the static fallback path is hydration-safe.

### 6.6 — Reduced-motion fallback

- The wrapper reads `prefers-reduced-motion` via [src/lib/utils](src/lib/utils.ts) `prefersReducedMotion()`.
- When set: the scene never mounts; only the poster is shown.
- **The poster must therefore look intentional**, not like a missing image. This is enforced in [PHASE 7](#phase-7--cinematic-quality-gate).

### 6.7 — Debugging workflow

| Symptom                           | First check                                                             |
|-----------------------------------|-------------------------------------------------------------------------|
| Black square where scene should be| Env var empty or 404 from Spline. Check Network tab.                    |
| Scene mounts then disappears      | Wrapper unmounted by parent (route change) — verify scene is keyed stably. |
| Pop-in / flash on load            | Poster missing, or `loaded` state not gating opacity. Re-verify wrapper. |
| Mobile janky                      | Profile on floor device. Set `skipOnTouch={true}` and ship.             |
| Reduced-motion still animating    | Check `prefersReducedMotion()` returns true; verify with DevTools rendering panel. |
| Scene loads but is solid color    | Background not transparent in Spline export. Re-author and re-export.   |
| Camera orbits on touch            | The Spline scene itself has a camera controller — disable it in Spline. |

### 6.8 — Mobile optimization

- Default `skipOnTouch={false}` for hero (it's small and the breath is precious).
- Default `skipOnTouch={true}` for workflow and dashboard until profiled green on floor device.
- Always provide a poster sized at 2× pixel density for retina displays; the wrapper does not upscale.
- Verify on a real device, not Chrome's mobile emulator. Frame time is a hardware reality, not a screen size.

---

## PHASE 7 — Cinematic Quality Gate

Every scene passes this gate before its env var is promoted to production. No exceptions.

### 7.1 — Atmosphere quality

- [ ] Background is fully transparent.
- [ ] The site's vignette and grain show through cleanly.
- [ ] Bloom is present on emissive only, not blanket-applied.
- [ ] Tone mapping is ACES Filmic.

### 7.2 — Cinematic restraint

- [ ] ≤ 3 active motions on screen.
- [ ] No motion cycle shorter than 1.4s; none longer than 12s.
- [ ] No spring, bounce, or elastic easing.
- [ ] No camera orbit, dolly, or zoom (parallax only, desktop only).

### 7.3 — Emotional pacing

- [ ] The scene matches its emotional verb (Awakening / Descent / Operation / Invitation).
- [ ] First 1.5 seconds produce recognition, not surprise.
- [ ] The loop point is invisible — no perceptible reset.
- [ ] The scene is calm at second 30.

### 7.4 — Brand alignment

- [ ] Color palette is restricted to indigo / violet / cyan + void (see [Appendix B](#appendix-b--color--light-reference)).
- [ ] No banned aesthetics (see [Appendix A](#appendix-a--banned-aesthetics)).
- [ ] No logos, glyphs, or text inside the 3D scene.
- [ ] The scene reads as SheetFlow without any chrome around it.

### 7.5 — Performance integrity

- [ ] Decoded size ≤ 1.5 MB.
- [ ] Desktop ref frame time ≤ 18 ms.
- [ ] Mobile ref frame time ≤ 32 ms (or `skipOnTouch={true}`).
- [ ] Draw calls ≤ 90.
- [ ] Lighthouse Performance unchanged or improved.

### 7.6 — Visual clarity

- [ ] Geometry reads cleanly at 100% zoom on a 1440px screen.
- [ ] Geometry still reads at 50% zoom (small viewports / sidebars).
- [ ] No element touches a screen edge unintentionally.
- [ ] Negative space dominates (≥ 60% void per scene).

### 7.7 — "Feels like SheetFlow" validation

The director (or appointed cinematic reviewer) watches the scene for 30 seconds in context — meaning, on the actual page, with the surrounding HTML, motion, and audio. The scene passes only if the answer to all three questions is *yes*:

1. Could this frame be a still in a luxury film about an AI system?
2. Is this unmistakably SheetFlow without a logo?
3. Would I feel this is *premium* if I had paid for the product?

If any answer is *no* — the scene does not ship, regardless of metrics.

### 7.8 — Reduced-motion poster check

- [ ] The poster, viewed standalone, is itself a beautiful frame.
- [ ] The poster's color and composition match the live scene's static keyframe.
- [ ] No "missing image" feel — a reduced-motion user gets a curated still.

---

## Appendix A — Banned aesthetics

These are non-negotiable rejections. A scene exhibiting any of them is failed at intake, no review needed.

- Cyberpunk neon / RGB gamer palettes.
- Lens flares (J.J. Abrams style).
- Glitch, RGB split, datamosh, scanline overlays inside the Spline scene (the site adds these globally if needed).
- Matrix-style falling characters.
- Radial gradient blobs in the background.
- Holographic rainbow shimmer.
- 3D rotating logos.
- Floating chrome spheres with environment maps.
- Nebula/galaxy backgrounds.
- Lightning bolts, energy arcs, electricity effects.
- Heart-pulse or sci-fi heartbeat overlays.
- Bouncing, springy, or elastic motion.
- Pure white emissive (`#ffffff`) — always tinted.
- Auto-rotating camera ("turntable" preset).

---

## Appendix B — Color & light reference

Aligned with the brand operating system. Hex values are the floor; in-scene tints may push warmer or cooler within ±8% luminance.

| Role          | Token         | Hex        | Use                                         |
|---------------|---------------|------------|---------------------------------------------|
| Void          | `--void`      | `#070711`  | Implicit (transparent BG over site void)    |
| Indigo Key    | `--indigo`    | `#5B6CFF`  | Primary key light, core emissive            |
| Violet Fill   | `--violet`    | `#9A6CFF`  | Fill light, "descent" wash                  |
| Cyan Rim      | `--cyan`      | `#6CC8FF`  | Rim light, signal packet emissive           |
| Hairline      | `--hairline`  | `#3A3F8A`  | Panel edges, wireframe overlay              |
| Bloom Tint    | `--bloom`     | `#7B8AFF`  | Bloom color (never white)                   |

**Light intensity ratios (Hero baseline):** Key 1.0 / Fill 0.5 / Rim 0.3. Other scenes scale these uniformly; ratios are preserved.

**Bloom:** intensity 0.7 (Hero) → 0.9 (CTA). Threshold 0.85 across all scenes.

**Tone mapping:** ACES Filmic across all scenes.

---

## Closing

This handbook is the contract between the brand, the cinematic direction, and the production code. Every Spline scene that ships under SheetFlow AI passes through every phase here. The architecture is set, the identity is set, the integration is wired — what remains is execution at the level the brand promises.

*Restraint is the feature.*
