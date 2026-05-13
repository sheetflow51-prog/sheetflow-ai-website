# SheetFlow Brand OS — Phase 5: Social + Video System

> A SheetFlow reel must be recognizable in **2 seconds with no logo on screen.**
>
> If a viewer scrolls past and can't tell it from a generic AI startup ad, the system has failed.

---

## The cinematic identity transfer

Every motion-graphics asset inherits the same four-layer atmosphere as the website:

```
[ FRONT ]  on-screen text + UI overlays
[ HUM   ]  pulses, breathing badges, AI core
[ FILM  ]  grain (always on, 0.035 alpha, overlay)
[ AIR   ]  aurora wash (cursor-replaced by camera-tracked drift)
[ VOID  ]  #060608 base
```

Removing any one breaks the brand — *especially in video*, where motion is doing 80% of the work.

---

## Format spec — by surface

| Surface | Aspect | Duration | Loop | Audio default |
|---|---|---|---|---|
| **Instagram feed** | 1:1 (1080×1080) | 8–15s | yes | muted-readable |
| **Instagram reel / TikTok** | 9:16 (1080×1920) | 15–30s | optional | sound-up |
| **YouTube short** | 9:16 (1080×1920) | 30–60s | no | sound-up |
| **YouTube hero / launch trailer** | 16:9 (3840×2160) | 60–90s | no | sound-up |
| **LinkedIn / X post** | 16:9 (1920×1080) | 15–45s | yes | muted-readable |
| **Display ad** | 16:9 / 1:1 / 9:16 | 6s / 15s | required | muted |

**Muted-readable** is the default constraint: any asset that ships without sound must communicate fully without it.

---

## Cinematic transitions — the four approved cuts

| Cut | When | Form |
|---|---|---|
| **Cinematic fade** | Section to section | 250ms cross-fade with 12% blur peak |
| **Trace wipe** | Topic shift | A `<TraceLine>` draws across the frame; new content rests on the line, then the line dissolves |
| **Bracket reveal** | Highlight moment | Brackets snap in around a target, hold, dissolve |
| **Vignette close** | End of asset | Radial vignette closes from edges to center on a held headline |

Hard cuts are forbidden except for documentary-style insert shots (rare). Whip pans, glitches, RGB splits, and zoom-blasts are all anti-pattern.

---

## Text timing — the legibility law

A piece of text must be on screen for at least:

```
displayTime (s) = max(1.2, wordCount × 0.35)
```

A 6-word line stays for ≥2.1s. A 3-word punch stays for ≥1.2s. The viewer's eye, not the editor's impatience, sets the rhythm.

For headlines that exceed 8 words, **split into two beats** — never compress timing.

---

## Motion pacing — per surface

| Surface | Cadence | Why |
|---|---|---|
| **Hero / launch trailer** | Slow, cinematic. 1 cut every 3–4s. Single focus per beat. | Earns "luxury intelligence" register |
| **Reel / short** | Medium. 1 cut every 1.5–2.5s. ≤6 beats per asset. | Watchable in scroll-stopping context without becoming chaos |
| **Display ad** | Tight. 6s cap means 3 beats max: hook → proof → CTA. | Adtech surface demands density without sacrificing restraint |

The 80ms stagger from the website applies in motion graphics too — when multiple elements enter together, they enter on `80ms` offsets. Constancy across mediums is the brand's signature.

---

## On-screen text — the type system in motion

| Type | Spec | Use in video |
|---|---|---|
| **Statement** (sans, monumental) | 96–160px equivalent, white→55% gradient, blur-in over 900ms | The single big idea per beat |
| **Kicker** (mono, ALL CAPS) | 24–32px, indigo or `ink.300`, tracking 0.12em, fade-in | Section eyebrow, location stamp, time stamp |
| **System** (mono, regular) | 18–28px, `ink.200`, type-on cadence | AI status, file paths, log lines |
| **Body** (sans, regular) | 28–40px, `ink.200`, soft fade-in, single line | Captions, supporting facts |

**Three rules:**
1. Never two Statement-tier lines on screen at once.
2. Body and System never animate during their reading window.
3. Kickers always lead a Statement, never the other way around.

---

## Atmosphere rules in video

### Aurora is camera-tracked, not cursor-tracked
The radial aurora drifts slowly relative to the implied camera position. In a 30s reel, the aurora completes about ½ of a slow lateral pan. Subtle, almost subliminal.

### Grain is mandatory
0.035 alpha noise overlay on every frame. Without it, the asset reads as cheap CG. With it, the asset reads as filmic. There is no compromise here.

### The icosahedron is the brand's protagonist
When in doubt, the icosahedron + orbital rings is the visual subject. It can be:
- *Lit* (full brightness, full bloom) — establishing shots
- *Resolved* (mid-bright, settled) — explanatory beats
- *Dormant* (low-bright, single ring) — quieter moments

These three lighting states are the only allowed treatments. A bouncing, rainbow, glitched, or cartoon icosahedron is a brand violation.

---

## Audio mood direction

> Sound is *texture*, never melody.

### Three sonic registers

| Register | Use | Reference texture |
|---|---|---|
| **Bed** | Always on if audio is enabled | Sub-bass drone, ≤0.18 gain, no rhythm |
| **Pulse** | Marks data moments | Soft, low-pass-filtered tick at section transitions |
| **Voice** | Optional, sparing | Whispered, processed (high-pass at 200Hz, slight reverb) |

### Forbidden sound design
- ❌ Music with melodic content (we use texture)
- ❌ Drum hits, builds, drops — anything that resembles a "trailer hit"
- ❌ Synth sweeps / risers
- ❌ Voice without processing (dry voice reads as advertisement)
- ❌ Hover sounds, click sounds, any UI feedback in non-UI context
- ❌ Compression / sidechaining tricks

The audio brand is **the sound of a server room at 3 a.m. with one screen glowing.**

---

## Futuristic visual hierarchy in motion

A SheetFlow video frame, at any moment, has a strict attention hierarchy:

1. **The single subject** (icosahedron, headline, data visualization, or product mock)
2. **The Statement** (one line of on-screen text)
3. **The atmosphere** (aurora, grain, ambient particles)
4. **The kicker / mono frame** (timestamp, location, system label)

Anything outside these four roles is removed. A frame with five competing elements is rejected at review.

---

## Reel templates — the three approved forms

### Template A — *The Watch*
A workbook on screen. SheetFlow's bracket selector traces over a row, a column, a cell. A `<MonoLabel>` log line types in: `RECONCILED · 14 cells`. The bracket dissolves. Title card.

15–20 seconds. Used for: feature explainers, "how it works" snippets, social-first product moments.

### Template B — *The Awakening*
Black void. A single particle. Particles multiply. The icosahedron forms. The orbital rings ignite. The headline lands: *Spreadsheets, finally alive.* Fade.

8–15 seconds. Used for: launches, brand films, ad-frame openings.

### Template C — *The Architecture*
Camera dollies through layered HoloPanels showing live data flowing between them. Connector trace lines draw between panels. The camera pulls back to reveal the full architecture. Final headline.

30–60 seconds. Used for: hero trailers, investor films, feature deep-dives.

These three templates are the **only** approved reel structures. A new template requires a brand-OS amendment before it ships.

---

## Asset hand-off pack

Every motion-graphics deliverable ships with:

- `.mp4` (h.264, 25 Mbps for 4K, 12 Mbps for 1080p)
- `.mov` (ProRes 422 HQ for upstream re-edit)
- `.lottie` / `.json` for any UI-embedded reels
- A still poster frame (`.png` at the highest-impact moment)
- A *muted-caption variant* with on-screen captions baked in
- Audio stem (separate `.wav`) for the bed only — never the full mix
