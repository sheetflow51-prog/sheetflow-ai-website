# DEC-301 — Logo Canon

**Status:** Adopted · **Date:** 2026-08-06 · **Scope:** Brand identity, all media

---

## Decision

**`10_Final_Website/public/logo.png` is the canonical SheetFlow brand identity.**

The generated SVG logo system is the *engineering implementation* of that
identity — not a redesign, and not a competing master.

### Requirements

1. Never drift away from the original silhouette.
2. Never simplify beyond recognizability.
3. Keep the sphere proportions identical.
4. Preserve the blue and gold ribbon flow.
5. Preserve the same emotional feel.
6. Use the generated SVGs **only where scalability is required**.

**Whenever uncertainty exists, the original PNG wins.** The generator
reproduces the original as accurately as possible; it never reinterprets it.

---

## Why this needed deciding

The first implementation inverted the relationship. It treated the vector as
the master and the PNG as a reference, then used the vector everywhere. Three
measurable regressions followed:

| Drift | Original | First implementation |
|---|---|---|
| Sphere : badge diameter | **0.498** | 0.672 — **31% oversized** |
| Sphere centre offset | (−2.9%, −11.6%) | (0, 0) — centred, offset lost |
| Sphere interior | Dark navy | A glowing white-blue core that **does not exist** in the original |

The ribbon construction had also been reinterpreted: the original is a ribbon
**wound around a sphere** on a tilted axis, and the first implementation
replaced it with two mirrored crescents.

None of this was visible without measuring. That is the point of the decision.

---

## How it is enforced

### Measurement, not preference

`scripts/build-brand-assets.mjs` recovers the geometry from the PNG by
classifying its pixels, and derives every proportion from those measurements:

```
badge     bbox x   2-243, y   1-243  ->  d 242, centre (122.5, 122.0)
sphere    bbox x  54-177, y  36-152  ->  120.5 mean d, centre (115.5, 94.0)
wordmark  rows y 153-171
```

Requirement 3 is therefore a constant in the script, not a judgement call.

### Raster is cut from the original

Every shipped bitmap — favicons, PWA icons, apple-icon, social avatars, the
navigation mark, the loading screen, the OG image — is a **crop and resample of
`logo.png`**. They carry the real ribbon flow and the real emotional feel
because they *are* the original artwork.

Two crops exist:

- **Lockup** — the full badge, sphere and wordmark. Used at every size where
  the wordmark still reads (≥180px).
- **Icon** — the sphere alone, cropped to stop at the wordmark's first row
  (y=152). Used at 16–96px, where the lockup's type would turn to mush.
  Dropping illegible type is the lesser violation of requirement 2.

The largest upscale in the set is the 1024px avatar, 4.1× from source. The
512px exports are 2.1×.

### Vector is scalability-only

The SVG masters exist for print, embroidery, monochrome reproduction and
large-format work — cases a raster genuinely cannot serve. They are **a
faithful but inexact reconstruction**: flat vector cannot reproduce a 3D
render's ribbon interleaving, specular falloff, or depth.

They must not be substituted for the raster on the website. The vector favicon
was removed for exactly this reason — browsers prefer an SVG icon when offered,
which would have put the least faithful asset in the most visible slot.

The vector's sphere is modelled as true projected latitude rings on a tilted
axis, so its construction matches the original's rather than approximating it
with hand-drawn shapes. It remains an approximation.

---

## Consequences

- `public/logo.png` may not be deleted, moved, or regenerated. It is the master.
- Changing any measurement in the generator requires re-deriving it from the
  PNG, not adjusting it by eye.
- A new mark, or a change to the existing one, supersedes this decision and
  requires a new PNG master plus a new decision record.
- If a rendering context needs the mark and neither crop fits, the answer is a
  new crop of the original — not a vector substitution.

---

## Open

The vector reconstruction is the weakest link in the system. If pixel-accurate
vector is ever required (large-format print, vehicle livery, signage), the
correct route is a professional trace of `logo.png`, not further parametric
refinement. That would need the original 3D source or a vectorisation pass, and
is out of scope here.
