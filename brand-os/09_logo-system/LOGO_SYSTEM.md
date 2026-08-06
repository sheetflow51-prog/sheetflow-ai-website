# SheetFlow Brand OS — Phase 9: Logo System

> The mark is not redesigned here. It is made producible.
>
> Source of truth: [`scripts/build-brand-assets.mjs`](../../10_Final_Website/scripts/build-brand-assets.mjs)
> · Output: [`public/brand/`](../../10_Final_Website/public/brand/)

---

## Operating principle

**One geometry, every variant derived.** Nine SVGs that each redeclare the same
arcs will drift the first time a curve is nudged. They are generated from a
single definition instead:

```bash
cd 10_Final_Website && node scripts/build-brand-assets.mjs
```

Editing a `public/brand/*.svg` by hand is a brand violation — the next build
overwrites it. Change the script.

---

## What the mark is

The canonical identity is the 3D render at `public/logo.png`: a dark navy disc
carrying a sphere wrapped in blue and gold ribbons, a bright core, a sparkle
field, and the wordmark beneath.

The production mark is a **flat vector reconstruction** of that render. Nothing
was reinvented — badge, palette, sphere, ribbons, core, sparkles and wordmark
all carry over. What changed is that photographic depth-of-field and raster
bloom were replaced with geometry that stays crisp at 16px and prints in one
pass.

### Ribbon construction

Each ribbon is a **lune**: the region inside the sphere circle (r=86) but
outside a second circle (r=76) whose centre is offset from it.

The offset is the whole design. A *concentric* inner circle yields a constant
width crescent, and two of those mirrored read as a pie chart or a loading
spinner — static. An *offset* inner circle makes the ribbon taper to a point at
one end, which is what reads as flow. The two ribbons take opposite offsets
(`-24,+12` gold, `+24,-12` blue) so they interlock rather than mirror.

Gold draws last, so it passes in front on the right.

### Palette

Blue and gold only, straight from [`01_design-tokens`](../01_design-tokens/TOKENS.md).
No colour in the mark is invented:

| Role | Token | Hex |
|---|---|---|
| Badge centre → edge | — | `#16294D` → `#070B14` |
| Sphere body | — | `#31589F` → `#0A1329` |
| Gold ribbon | `gold.bright` → `gold` → `gold.deep` | `#F6D089` → `#E9A23B` → `#C4832A` |
| Blue ribbon | `accent.deep` → `accent` → `accent.light` | `#2563EB` → `#3B82F6` → `#93C5FD` |
| Core | — | `#F2F7FF` → `#3B82F6` |

---

## The variants

| File | Use |
|---|---|
| `sheetflow-primary.svg` | **Primary.** Vertical lockup, wordmark inside the badge. Matches the original render's composition. |
| `sheetflow-icon.svg` | **Icon.** Badge + sphere, no wordmark. Any lockup where the name is set in live text. |
| `sheetflow-icon-small.svg` | Icon simplified for **≤32px** — no sparkles, no rim light, larger core. Also `src/app/icon.svg`. |
| `sheetflow-icon-flat.svg` | Solid fills, **no gradients**. Print, embroidery, single-pass output. |
| `sheetflow-horizontal.svg` | Icon left, wordmark right. Email signatures, letterheads, wide slots. |
| `sheetflow-mono-white.svg` | Monochrome lockup for dark backgrounds. |
| `sheetflow-mono-black.svg` | Monochrome lockup for light backgrounds. |
| `sheetflow-icon-mono-white.svg` / `-black.svg` | Monochrome icon, no wordmark. |

### Raster exports

| Path | Size | Use |
|---|---|---|
| `raster/favicon-16/32/48.png` | 16–48 | Browser tabs. From the **simplified** master. |
| `src/app/apple-icon.png` | 180 | iOS home screen. |
| `raster/icon-192.png`, `icon-512.png` | 192, 512 | PWA manifest. |
| `raster/icon-maskable-512.png` | 512 | Android adaptive icons. Content sits inside the central 80% safe zone. |
| `social/avatar-400/800/1024.png` | 400–1024 | Social profile avatars. |

---

## Rules

### Clear space
Keep free space equal to **one quarter of the badge diameter** on all sides.
Nothing crosses it — not text, not rules, not another logo.

### Minimum sizes
- Icon: **16px** digital (use the simplified master below 32px), **8mm** print.
- Horizontal lockup: **120px** wide. Below that the wordmark fills in — use the
  icon alone.
- Primary vertical lockup: **64px**. Its wordmark is the limiting factor.

### Backgrounds
The badge carries its own dark disc, so the full-colour mark sits on anything.
On busy imagery, prefer the badge variants over the mono icon — the disc is what
guarantees separation.

Never place the full-colour mark on a mid-blue or gold field; the ribbons lose
against it. Use monochrome there.

### Never
- Recolour the ribbons. Blue and gold are the identity.
- Rotate, skew, or squash. Scale uniformly.
- Add a drop shadow, outer glow, or bevel. The core already carries the light.
- Reconstruct the wordmark in another typeface.
- Place the icon and a separate "SheetFlow" wordmark next to `logo.png` — that
  render already contains the name, which is exactly the duplication the icon
  variant exists to prevent.

---

## The wordmark

**Inter Bold (700)**, letter-spacing `-0.02em`, matching the site's `--font-sans`.
The display serif (Fraunces) is for headlines and is never used for the logo.

The lockup SVGs carry the wordmark as **live text**, not outlined paths. This
repository has no font-to-path toolchain, and an eyeballed trace would be worse
than live text. The consequence is that a machine without Inter renders those
files in a fallback sans.

This does not affect anything shipped: every raster export is icon-only, and the
website sets the wordmark in HTML with its own loaded font. For print handoff,
open the lockup in a vector editor and convert text to outlines first.

---

## Where the site consumes it

| Consumer | Asset |
|---|---|
| `components/ui/Logo.tsx` | `sheetflow-icon.svg` + live-text wordmark |
| `components/providers/LoadingScreen.tsx` | `sheetflow-primary.svg` |
| `app/icon.svg` | simplified icon master |
| `app/apple-icon.png` | 180px export |
| `app/manifest.ts` | 192 / 512 / maskable-512 |
| `app/layout.tsx` (Organization JSON-LD) | `raster/icon-512.png` |
| `app/opengraph-image.tsx` | `lib/brand-mark.ts` data URI |

`lib/brand-mark.ts` is generated. The OG routes run on the edge runtime, which
has no filesystem and so cannot read the SVG masters at request time; embedding
the mark as a data URI keeps them on the same geometry as everything else
rather than carrying a hand-copied duplicate.

---

## Legacy

`public/logo.png` is retained as the canonical reference render and is still the
artwork of record for the identity. It is no longer referenced by any component:
it is 248×252 (not square), too small for a 512px manifest icon, and has the
wordmark baked in, which made it unusable in any lockup that also sets the name.
