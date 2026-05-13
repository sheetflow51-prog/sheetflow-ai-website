# Reels & Video Pipeline

The motion arm of the SheetFlow brand. Every video is a 15–45 second short
film. We are not making "social content" — we are making cinema, sized for
phones.

---

## Video families

| File                                       | Length    | Aspect | Cadence       |
|--------------------------------------------|-----------|--------|---------------|
| [Launch_Teasers.md](Launch_Teasers.md)     | 12–18s    | 9:16   | Quarterly     |
| [Product_Videos.md](Product_Videos.md)     | 30–60s    | 16:9   | Per feature   |
| [Motion_Typography.md](Motion_Typography.md)| 8–15s    | 9:16, 1:1 | Bi-weekly  |
| [Reel_Pipeline.md](Reel_Pipeline.md)       | n/a       | n/a    | Process doc   |

---

## Universal video rules

1. **First frame matters more than the rest.** It must hold on its own as a still.
2. **First second decides retention.** No logos, no titles. Open with the
   visual hook.
3. **Pacing**: 1 visual idea per 2.5 seconds maximum.
4. **Sound is 50% of the asset.** No video ships without sound design.
5. **Letterboxing**: 9:16 reels with 16:9 cinema content get top/bottom bars
   in pure black + minimal type. Premium signal.

---

## Pacing grammar

| Element              | Default duration |
|----------------------|------------------|
| Opening hold         | 0.8–1.2s         |
| Standard cut         | 2.0–3.0s         |
| Reveal beat          | 1.6s             |
| Type card            | 1.4s in, 0.8s out|
| Final hold (logo)    | 1.2s             |

Reels under 12s feel rushed. Reels over 18s lose retention. Live in 12–18s.

---

## Shot rhythm

Three rhythms only. Pick one per reel and commit:

- **Breath rhythm**: long holds (2.5s+), one cut every visual idea.
  Used for: cinematic launches, atmosphere reels.
- **Pulse rhythm**: 1.5s cuts on a hidden tempo. Music-led.
  Used for: feature highlights, comparison reels.
- **Reveal rhythm**: build → hold → cut. The "ta-da" structure.
  Used for: product reveals, before/after, transformations.

Never mix rhythms in one reel.

---

## Motion timing

| Easing                             | Use                                  |
|------------------------------------|--------------------------------------|
| `cubic-bezier(0.22, 1.0, 0.36, 1.0)` | Element entrances (text, panels)   |
| `cubic-bezier(0.16, 1.0, 0.3, 1.0)`  | Camera moves                       |
| `cubic-bezier(0.32, 0.0, 0.0, 1.0)`  | Whip transitions (rare)            |
| Spring(240, 28)                    | Punctuation moments                  |

Linear is forbidden except progress bars and ticker readouts.

---

## Typography in motion

- **Display type enters by mass**: scale 0.96 → 1.0 with 12% opacity → 100% over 480ms.
- **Stagger lines**: 80ms between siblings.
- **Hold long**: type stays 1.4s+ minimum. We don't make TikToks.
- **Exit by drift**: scale 1.0 → 0.98 with opacity fade over 320ms.
- Tracking on display: -0.02em. Animated tracking is showing off — don't.

---

## Transition style

The SheetFlow vocabulary:

- **Match cut**: same shape across two scenes (preferred for cinematic launches)
- **Light wipe**: a soft amber light passes through frame revealing the next scene
- **Crossfade with hold**: 320ms with 80ms hold of both at 50% opacity
- **Hard cut on beat**: only on pulse-rhythm reels

Forbidden:
- Whip pans as default
- Glitch transitions
- Star wipes / shape wipes
- Spinning logos
- Any preset that ships with Premiere

---

## Sound direction

| Layer        | Source                              | Notes                          |
|--------------|-------------------------------------|--------------------------------|
| Score        | Custom or Splice (curated only)     | Slow, low, breathing           |
| Ambient bed  | Room tone, low hum, distant air     | Always present, even at -36dB  |
| Whoosh / FX  | Designed, not stock                 | One per cut, max               |
| Vocal        | Optional. Always processed (not raw)| If present, mixed -12 LUFS     |

**Master at -14 LUFS for IG/social. -16 LUFS for YouTube/site.**

---

## Tooling

| Stage                 | Tool                                |
|-----------------------|-------------------------------------|
| Plate generation      | Midjourney + Spline                 |
| Animation             | After Effects + Cinema 4D Lite      |
| AI motion             | Runway Gen-3, Kling 1.5             |
| Edit                  | Premiere or DaVinci Resolve         |
| Color                 | DaVinci Resolve                     |
| Sound                 | Logic / Pro Tools                   |
| Final encode          | DaVinci → H.265, then HandBrake     |

---

## Export targets

| Surface            | Codec    | Resolution      | Bitrate    | Notes              |
|--------------------|----------|-----------------|------------|--------------------|
| IG Reel            | H.264    | 1080×1920       | 12 Mbps    | -14 LUFS           |
| IG Story           | H.264    | 1080×1920       | 10 Mbps    | -14 LUFS           |
| YouTube            | H.265    | 3840×2160       | 35 Mbps    | -16 LUFS           |
| Site embed         | H.265    | 1920×1080       | 8 Mbps     | -16 LUFS, looping  |
| Site hero MP4      | H.265    | 1920×1080       | 4 Mbps     | Silent, 6s loop    |
