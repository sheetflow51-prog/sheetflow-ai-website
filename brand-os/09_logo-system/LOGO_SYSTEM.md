# SheetFlow Brand OS — Phase 9: Logo System

> The mark is not redesigned here. It is made producible.
>
> Governed by [DEC-301 — Logo Canon](../07_governance/DEC-301_LOGO_CANON.md) and
> [DEC-302 — Brand Asset Hierarchy](../07_governance/DEC-302_BRAND_ASSET_HIERARCHY.md).
> Source of truth: [`public/logo.png`](../../10_Final_Website/public/logo.png).
> Generator: [`scripts/build-brand-assets.mjs`](../../10_Final_Website/scripts/build-brand-assets.mjs).

---

## Operating principle

**The original PNG is the identity. Everything else is derived from it.**

```bash
cd 10_Final_Website && npm run brand
```

Editing anything in `public/brand/` by hand is a brand violation — the next
build overwrites it. Change the generator.

`public/logo.png` may not be deleted, moved, or regenerated.

## Replacing the logo

1. Drop the new artwork at `public/logo.png`.
2. Run `npm run brand`.
3. Read the measurement block it prints and confirm the numbers look right.
4. Commit the regenerated assets.

Nothing else needs editing. The generator measures the PNG on every run — badge,
sphere and wordmark bounds are recovered by classifying its pixels, never
hard-coded — so a new master regenerates every derivative on its own.

If it aborts, the message names the failed check. **Update the classifier in
`measure()` to match the new composition; do not hand-write numbers back in.**
Hard-coded constants are exactly what DEC-302 clause 5 forbids.

A master with no wordmark is supported: the icon crop then takes the sphere's
own extent.

---

## The two tiers

### Tier 1 — Raster, cut from the original

Every shipped bitmap is a crop and resample of `logo.png`. These carry the real
ribbon flow, the real sphere, the real feel, because they *are* the original
artwork. **Use these on the website, always.**

Two crops:

| Crop | Contents | Used at |
|---|---|---|
| **Lockup** | Badge + sphere + wordmark — the complete mark | ≥180px |
| **Icon** | Sphere alone, cropped to stop above the wordmark | 16–96px |

The icon crop exists because the lockup's type is illegible below roughly 64px.
Dropping type that cannot be read is a smaller compromise than shipping mush.

| Path | Size | Use |
|---|---|---|
| `raster/favicon-16/32/48.png` | 16–48 | Browser tabs |
| `src/app/icon.png` | 32 | Next.js app-dir favicon |
| `raster/icon-64.png`, `icon-96.png` | 64, 96 | Navigation mark (96 covers 3× DPR) |
| `src/app/apple-icon.png` | 180 | iOS home screen |
| `raster/icon-192.png` | 192 | PWA manifest |
| `raster/lockup-256.png` | 256 | Loading screen |
| `raster/lockup-512.png` | 512 | PWA manifest, Organization JSON-LD |
| `raster/icon-maskable-512.png` | 512 | Android adaptive icons, 80% safe zone |
| `social/avatar-400/800/1024.png` | 400–1024 | Social profile avatars |

Largest upscale in the set is the 1024 avatar at 4.1× from source; the 512s are
2.1×.

### Tier 2 — Vector, scalability-only

For print, embroidery, monochrome reproduction and large-format work — cases a
raster genuinely cannot serve.

**These are a faithful but inexact reconstruction.** Flat vector cannot
reproduce a 3D render's ribbon interleaving, specular falloff or depth. Do not
substitute them for the raster on the website.

| File | Use |
|---|---|
| `sheetflow-primary.svg` | Vertical lockup, wordmark inside the badge |
| `sheetflow-icon.svg` | Icon, no wordmark |
| `sheetflow-icon-flat.svg` | Solid fills, no gradients — single-pass output |
| `sheetflow-horizontal.svg` | Icon left, wordmark right |
| `sheetflow-mono-white/black.svg` | Monochrome lockup |
| `sheetflow-icon-mono-white/black.svg` | Monochrome icon |

There is deliberately **no vector favicon**. Browsers prefer an SVG icon when
one is offered, which would put the least faithful asset in the most visible
slot.

---

## Geometry

Measured from the PNG on every run, never chosen. Current master:

```
canvas        248 x 252
badge         d=242   at (122.5, 122.0)
sphere        d=123.5 at (117.0,  93.5)
wordmark top  y=153

sphere : badge diameter   0.5103
sphere centre offset      (-2.3%, -11.8%) of badge diameter
```

The sphere sits **above** badge centre — that offset exists to make room for the
wordmark and is part of the silhouette. It is neutralised only in the icon
variants, where there is no wordmark.

### How the sphere is built (vector tier)

The original is a ribbon **wound around a sphere** on a tilted axis. Each turn
is a circle in a plane perpendicular to that axis. Under orthographic
projection, a circle of radius `r` with unit normal `a`, centred at
`R·cos(β)·a`, becomes an ellipse with semi-major `r` and semi-minor `r·|a_z|`,
the major axis perpendicular to `a`'s projection.

The generator computes this directly rather than approximating it with
hand-drawn crescents. Rings are painted back-to-front.

The sphere interior is **dark navy**. There is no glowing central core; an
earlier revision invented one.

### Palette

Blue and gold only, from [`01_design-tokens`](../01_design-tokens/TOKENS.md).
Ribbons run blue on the left flank to gold on the right, as the original reads
across the coil.

---

## Rules

### Clear space
One quarter of the badge diameter on all sides. Nothing crosses it.

### Minimum sizes
- Icon: **16px** digital, **8mm** print.
- Horizontal lockup: **120px** wide. Below that, use the icon alone.
- Vertical lockup: **64px**. Its wordmark is the limiting factor.

### Backgrounds
The badge carries its own dark disc, so the full-colour mark sits on anything.
On busy imagery prefer the badge variants over the mono icon — the disc is what
guarantees separation. Never place the full-colour mark on a mid-blue or gold
field; use monochrome there.

### Never
- Recolour the ribbons. Blue and gold are the identity.
- Rotate, skew, or squash. Scale uniformly.
- Add a drop shadow, outer glow, or bevel.
- Reconstruct the wordmark in another typeface.
- Use a vector variant where a raster cut of the original would serve.
- Pair `logo.png` with a separate "SheetFlow" wordmark — that render already
  contains the name, which is what the icon crop exists to avoid.

---

## The wordmark

**Inter Bold (700)**, letter-spacing `-0.02em`, matching the site's
`--font-sans`. The display serif (Fraunces) is never used for the logo.

The vector lockups carry the wordmark as **live text**, not outlined paths.
There is no font-to-path toolchain here, and an eyeballed trace would drift from
the original lettering. Nothing shipped depends on it — every raster is cut from
the PNG, and the website sets the wordmark in HTML with its own loaded font.
For print handoff, convert text to outlines in a vector editor first.

---

## Where the site consumes it

| Consumer | Asset |
|---|---|
| `components/ui/Logo.tsx` | `raster/icon-96.png` + live-text wordmark |
| `components/providers/LoadingScreen.tsx` | `raster/lockup-256.png` |
| `app/icon.png` | 32px icon crop |
| `app/apple-icon.png` | 180px lockup |
| `app/manifest.ts` | `icon-192`, `lockup-512`, `icon-maskable-512` |
| `app/layout.tsx` (Organization JSON-LD) | `raster/lockup-512.png` |
| `app/opengraph-image.tsx` | `lib/brand-mark.ts` data URI (96px icon crop) |

`lib/brand-mark.ts` is generated. The OG routes run on the edge runtime, which
has no filesystem, so the mark is inlined as a base64 PNG — cut from the
original like everything else, not the vector.

---

## If pixel-accurate vector is ever needed

Large-format print, vehicle livery or signage would need a true vector master.
The correct route is a professional trace of `logo.png`, or the original 3D
source — not further parametric refinement of the reconstruction here.
