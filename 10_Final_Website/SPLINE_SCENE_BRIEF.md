# SheetFlow AI — Spline Scene Brief

> Hand this brief to the Spline designer. Each scene exports as a `.splinecode` URL that goes into `.env.local` (key listed per scene).

The site is shippable without any of these — it falls back to the canonical R3F `AICore`. These scenes are *progressive enhancement*: when their env var is set, the site upgrades automatically.

**All four scenes share the same DNA:** dark void, indigo-led intelligence light, restrained motion, no fast cuts, no bouncing, no flashing. If a frame would not appear in a luxury film about an AI system, it does not belong.

---

## 1 · Hero — *Intelligence Core*

**Env key:** `NEXT_PUBLIC_SPLINE_SCENE_HERO`
**Size on canvas:** ~820 × 820 px square, sits behind the headline
**Disable interaction:** yes (no orbit, no drag) — pointer events are eaten by the wrapper

### What the scene contains
- A subdivided **icosahedron** at center
- A wireframe overlay icosahedron, slightly larger, rotating opposite direction
- **Three concentric orbital rings** (radii ≈ 2.0 / 2.8 / 3.8) — ultra-thin particle rings, opposing rotation
- An ambient indigo bloom light from upper-left
- A violet fill light from lower-right
- A faint cyan rim from below

### Motion
- The icosahedron breathes (±2% scale, 6s sine, slow-in/slow-out)
- Rings rotate ~0.05 rad/s, opposing pairs
- A **subtle camera-orbit** drives off mouse position (lerp 0.04, 0.18 amplitude on Y)
- Total motion budget: this is the only active motion in the scene

### Lighting
- Three-point: indigo key (top-left), violet fill (bottom-right), cyan rim (below)
- Bloom on the core (intensity ~0.7, threshold ~0.85)
- Tone-mapping: ACES Filmic
- Background: **transparent** — the site's atmosphere shows through

### Forbidden
- No glow trails, no particle ribbons, no "data flying" effects
- No glitch, no RGB split, no scanline overlay (the site adds those)
- No pure white emissive

---

## 2 · Workflow — *Data Detection Field*

**Env key:** `NEXT_PUBLIC_SPLINE_SCENE_WORKFLOW`
**Size on canvas:** full-width section background, ≈ 1400 × 700 px
**Disable interaction:** yes

### What the scene contains
- A **floating spreadsheet plane** at slight perspective (cells visible as a faint grid)
- A **scanning beam** sweeping the plane left → right, indigo, ~6s cycle
- A small **signal packet** that emerges from the scanned region and travels to the upper-right corner
- The intelligence core (smaller version of the hero core) hovers in the upper-right, "receiving" the signal
- Atmospheric haze in the foreground, lifting

### Motion
- Sweeping beam: linear, 6s cycle, fades at the edges
- Signal packet: cinematic ease, 1.4s travel time, dissolves on arrival at the core
- Core: same breath as the hero core, scaled to 0.6×

### Lighting
- Indigo key from upper-right (toward the core)
- Soft violet fill on the spreadsheet plane
- The scanning beam is its own light source (rim-lit cells)

---

## 3 · Dashboard — *Holographic Analytics*

**Env key:** `NEXT_PUBLIC_SPLINE_SCENE_DASHBOARD`
**Size on canvas:** ≈ 1200 × 700 px, mid-section
**Disable interaction:** yes

### What the scene contains
- Three **floating holographic panels** at staggered depths
- Each panel shows abstract analytics: a thin line chart, a sparkline grid, a single big number
- Panels are translucent (opacity ~0.65), edges hairlined indigo
- A faint **trace line** connects the panels diagonally (indigo gradient, drawn-in)
- Background: void with subtle aurora

### Motion
- Panels float on a slow Y-axis sine (±6px, 8s)
- Numbers tick up subtly (mono-font value increment, 1 step every 1.5s)
- The trace line slowly pulses brightness (0.4 → 0.7 → 0.4, 4s)
- Camera does *not* orbit — fixed perspective

### Lighting
- Indigo from above-left
- Cyan rim along the far edge of the deepest panel
- Mild specular on panel edges, no harsh reflections

---

## 4 · Final CTA — *The Invitation*

**Env key:** `NEXT_PUBLIC_SPLINE_SCENE_CTA`
**Size on canvas:** ≈ 700 × 700 px, off-center on the right
**Disable interaction:** yes

### What the scene contains
- The hero icosahedron, scaled 1.15×, slightly **dimmer** than the hero version
- A single, slow orbital ring (no triple-ring stack)
- A **vignette atmosphere** closing radially around the core
- Slow violet wash bleeds in from the right edge

### Motion
- The core breathes ±3% (a touch larger than the hero — the closing scene "intensifies")
- The ring rotates at half hero-speed
- The violet wash drifts on a 12s cycle, very subtle

### Lighting
- Violet-led (the brand's "descent" color), not indigo
- Cyan rim from below, slightly brighter than the hero
- Bloom intensity ~0.9 (more than hero — this is the closing moment)

---

## Export checklist (Spline → handoff)

In Spline, after authoring each scene:

1. **File → Export → Code Export → React**
2. Copy the `.splinecode` URL (looks like `https://prod.spline.design/<id>/scene.splinecode`)
3. Paste into `.env.local` (or Vercel project env) under the matching `NEXT_PUBLIC_SPLINE_SCENE_*` key
4. Verify the camera **does not orbit on touch** — mobile users should see a static, beautiful frame
5. Verify the scene fits in **≤ 1.5 MB** decoded (Spline file size, not source size)
6. Confirm the scene has **transparent background**

If any scene crosses the 1.5 MB budget, simplify the geometry before optimizing textures. The brand's atmosphere comes from the site, not the 3D file.

---

## Quality gate

A Spline scene is approved when, viewed at 100% zoom on a 1440px screen for 5 seconds:

- [ ] It produces the *Awakening* feeling (hero) / *Descent* (workflow, dashboard) / *Invitation* (CTA)
- [ ] It is unmistakable as SheetFlow without any logo on screen
- [ ] No motion exceeds 1600ms per cycle (cinematic ceiling)
- [ ] Total active motions on screen ≤ 3
- [ ] No banned aesthetic touches (cyberpunk, RGB gamer, gradient blob, lens flare)
- [ ] Reduced-motion preview (static frame) is itself a beautiful poster
