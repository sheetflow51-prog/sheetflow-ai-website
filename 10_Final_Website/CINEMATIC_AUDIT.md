# Cinematic Experience Audit

> A walkthrough of every signature moment, atmosphere layer, and motion decision in the SheetFlow AI website — what's working, what's restrained on purpose, and what's deliberately *not* there.

*Last reviewed: 2026-05-06 · After signature phase ship*

---

## The four standards (still the bar)

| Standard | The test | Result |
|---|---|---|
| Aesthetic | Does this feel like Apple, Stripe, and a futuristic AI lab designed it together? | ✓ Hero, Final CTA, Dashboard meet the bar. Workflow Universe is close. |
| Copy | Could a competitor say this exact thing? | ✓ Headlines, kickers, CTAs all proprietary. |
| Motion | Does this motion communicate something, or is it decoration? | ✓ Every animation has a referent (see breakdown below). |
| Technical | Most precise implementation, performant at 60fps? | ✓ 17.4 kB page / 163 kB First Load. R3F + Bloom passes are dynamic-imported. |

---

## Signature moments — emotional pacing

### 1. HERO AI AWAKENING — `Awakening.tsx`

**Story:** The system *comes online* after the LoadingScreen exits.

**Beats:**
| t (ms) | What happens | Why |
|---|---|---|
| 0–500 | Indigo bloom expands from screen-center | Establishes "the intelligence wakes here" |
| 300–1100 | Single radial halo sweeps outward | Visual cue of presence — like a sonar ping |
| 200–1400 | Vertical wash veil fades through | Emotional "swell" — atmosphere thickens then settles |
| 400–1800 | Single horizontal scan line crosses the viewport | Sci-fi grammar; one frame of "intelligence reading the room" |

**What this is NOT:**
- Not a "ta-da". No bounce, no popping in.
- Not retriggerable. Plays exactly once per session via `ranRef`.
- Not loud. All overlays peak at <0.6 alpha and fade to zero.

**Restraint check:** Total scene duration 1.4s. Apple's iPhone hero scenes are ~2-3s. We're shorter on purpose because the user is here to *use* the site, not watch it.

---

### 2. WORKFLOW UNIVERSE TRANSFORMATION — `WorkflowUniverse.tsx`

**Story:** As the user scrolls into the section, the universe *intensifies* — the user feels they're moving deeper into a living system.

**Mechanics:**
- `useScroll` against the section element
- `intensity` = scrollYProgress mapped to 0→1→0.6 (peaks mid-section, fades on exit)
- Spring smoother (stiffness 100, damping 30) prevents jitter

**What changes with intensity:**
- **Center node ("Intelligence Core") glow:** scale 1→1.25, opacity 0.25→0.7
- **Veil overlay:** opacity 0→0.7 — section subtly darkens around the core, focusing attention
- Edges + nodes themselves stay constant (would compete for attention)

**Restraint check:** Only *one* element scales. Only *one* atmospheric layer changes opacity. The rest of the section is steady — restraint is what makes the focal change legible.

---

### 3. FINAL CTA IMMERSIVE TRANSITION — `FinalCTA.tsx`

**Story:** As the user reaches the bottom of the page, the environment closes around them. The conversation narrows to a single decision.

**Mechanics:**
- `useScroll` with `offset: ['start end', 'end end']`
- `descent` = scrollYProgress smoothed by spring (stiffness 100, damping 30, mass 0.7)

**What changes with descent:**
- **Violet wash:** opacity 0.05→0.28 (with `mix-blend: screen` — adds light, doesn't darken)
- **Edge vignette:** opacity 0.4→0.95 (closes around the content)
- **Headline scale:** 0.96→1.0 (the closing line subtly grows)
- **Core glow scale + opacity:** 0.9→1.15, 0.2→0.8 (right-edge AI core "approaches")
- **Accent halo behind headline:** opacity 0.2→0.8 (background brightens around the message)

**The five layers play in concert:** vignette closes ↘, halo opens ↗, headline grows ↗, color deepens. The user feels gravity, even though they're scrolling against it.

**Restraint check:** No additional motion is added during descent — no particles speeding up, no extra sparkles. The atmosphere shifts; the actors don't move.

---

## Atmosphere & ambient systems

| Layer | Function | When active |
|---|---|---|
| `AmbientBackground.tsx` | Cursor-tracked aurora gradient | Always |
| `NoiseTexture.tsx` | Film grain via inline SVG fractalNoise | Always |
| `ParticleField.tsx` | Canvas data atmosphere with cursor repulsion | Hero + Final CTA |
| `AICore.tsx` | R3F icosahedron + orbital rings + bloom | Hero + Final CTA (right edge) |
| `SectionHandoff.tsx` | Scroll-velocity-aware divider line | Between every section |

These layers create a constant low hum of *aliveness* without ever competing for attention. The grain, especially, is what makes the dark UI feel filmic instead of flat.

---

## Audio-ready architecture (built, not active)

The site is wired for ambient sound, but **never autoplays**.

- [`src/lib/audio.ts`](./src/lib/audio.ts) — singleton WebAudio engine. Categories: `ui`, `signal`, `ambient`. Never initializes until a real user gesture.
- [`AudioProvider.tsx`](./src/components/providers/AudioProvider.tsx) — registers the sound library, attaches one-shot gesture listener.
- [`AudioToggle`](./src/components/ui/AudioToggle.tsx) — in nav. Audio is **off by default**; the user opts in.
- [`useSound`](./src/lib/hooks/useSound.ts) — call from any component to trigger a sound. No-ops if disabled.

When real audio assets land in `public/audio/`:
- `ui-hover.mp3`, `ui-click.mp3` — micro-interaction tones
- `signal-notify.mp3`, `signal-success.mp3` — intelligence-event tones
- `ambient-atmos.mp3` — looped atmospheric bed (controlled by toggle)

The architecture is ready. The sounds are not ours to ship without curation.

---

## Motion choreography per section

| Section | Reveal type | Stagger | Notes |
|---|---|---|---|
| Hero | Sequenced custom (badge → headline → sub → CTA → trust) | 120ms | Each element has its own delay; runs once on mount |
| Workflow Universe | `whileInView` cascade (header → graph → nodes) | ~80ms node-to-node | Edges path-draw, then nodes spring in (overshoot 1.56) |
| AI Dashboard | Header + dashboard slide in; floating cards delayed +600/+850ms | n/a | TiltCard wraps the dashboard — depth-reactive on hover |
| Feature Storytelling | Bento cards stagger | 60ms | Mouse-tracked highlight on hover (`feature-card`) |
| Case Study | Card stagger | 100ms | Quote cards lift on hover (`card-interactive`) |
| Infrastructure | Lines path-draw, then nodes spring in | 40ms | Pulses central node at 4s sine breath |
| Final CTA | Sequenced (badge → headline → sub → CTAs → meta) | 150ms | Wrapped by descent atmosphere shift |

---

## What we deliberately did NOT add

These are tempting and we rejected each:

- ❌ **Autoplay video heroes** — bandwidth waste, attention waste
- ❌ **Letter-by-letter headline drops** — too splashy for the brand
- ❌ **Audio on hover (default on)** — instantly cheap; reserved as opt-in
- ❌ **Cursor trails / particle ribbons** — beautiful for 3 seconds, exhausting for 30
- ❌ **Glitch RGB-offset on hover** — 2010s cyberpunk; not our brand
- ❌ **Scroll-jacked horizontal sections** — fights our smooth Lenis vertical narrative
- ❌ **Bouncing entrance springs** — bounce on first impression reads as cheap
- ❌ **Hover on every card** doing different things — interaction inconsistency we explicitly avoided

---

## Performance posture

- 3D is dynamic-imported (`ssr: false`) — the AI core doesn't block first paint
- Canvas particle field caps at 260 particles + reduced-motion bypass
- Lenis suspends under reduced-motion
- Backdrop blurs limited to ≤4 simultaneous surfaces in any viewport
- Spline scenes lazy-mount via IntersectionObserver with 200px rootMargin
- Audio engine never initializes without a gesture — zero pre-gesture cost
- All scroll-driven motion uses `useSpring` smoothers — no per-frame layout thrash

**Build size:** 17.4 kB page / 163 kB First Load (Next 15, App Router). Three.js + R3F + drei + postprocessing live in async chunks behind `next/dynamic`.

---

## Reduced motion contract

When `prefers-reduced-motion: reduce` is set:

- Lenis is bypassed (native scroll)
- Custom cursor is hidden
- All Framer `whileInView` animations are disabled by media query
- Magnetic / TiltCard / Parallax / ScrollReveal each early-return
- Awakening sequence sets progress = 1 instantly
- Particle field does not mount
- 3D core still mounts but receives no animated mouse input

---

## What's left for a hypothetical Phase 4 polish (optional)

These are NOT shipped and would require explicit user direction:

1. **Scroll-position-driven bloom strength** on the AI core — bloom intensity rises as the hero exits viewport, mirroring "ascending energy"
2. **Per-card live data** in the dashboard — replace the static MRR with a live ticker using a fake-data WebSocket
3. **GSAP scroll-pinned feature scrub** — replace bento with a horizontal scrub on desktop only (already documented in `/05_Motion_References/scroll_storytelling/`)
4. **Spline scene plug-in** — drop real `.splinecode` URLs into `.env.local`; `SplineScene` wrapper is ready
5. **Real audio assets** — design 5 small loops and one-shots, ≤200KB each

None of these are needed to ship. They're the next dial-up if the brand wants to go further.

---

## The closing thought

> The brief asked for "memorable cinematic moments and emotional atmosphere."

The hero awakening, the workflow descent, and the final CTA closing are the three explicit moments.
The grain, the cursor, the breathing badges, the magnetic CTAs are the *atmosphere*.

The rest is restraint — what we *didn't* build is what makes the moments land.

**The site does not perform for the user. It comes alive when they arrive, settles when they read, and closes around them when they're ready to act.**

---

*This audit lives in the production codebase at `10_Final_Website/CINEMATIC_AUDIT.md`. Update it whenever a signature moment changes.*
