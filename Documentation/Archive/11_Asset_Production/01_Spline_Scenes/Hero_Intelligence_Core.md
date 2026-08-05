# Scene 01 — Hero Intelligence Core

The first thing every visitor sees. It must read in **two seconds** as:
"this is intelligent, this is alive, this is luxury."

---

## Scene goal

A weightless, slowly rotating geometric core suspended in volumetric light.
It is not a logo. It is the **idea of intelligence** rendered as form.

The visitor should not be able to name what they're looking at — only that
it feels deliberate, expensive, and quiet.

---

## Geometry direction

- A central form: subdivided icosahedron OR layered concentric rings.
  Pick one and commit. No Frankenstein composites.
- Surface: matte ceramic with a 6–10% specular spike. Never glossy.
- Inner core visible through subtle refraction — implies depth, not transparency.
- Tertiary elements: 2–4 micro satellites orbiting on offset elliptical paths.
  They exist for parallax, not decoration.
- No particles. No sparkles. No "data points." If you want energy, use light.

---

## Camera references

- Apple Vision Pro launch reveal — the slow lateral drift, the locked focus.
- Arrival (2016) — Bradford Young's stillness, depth of field as emotion.
- Blade Runner 2049 — Roger Deakins' negative space and atmosphere.
- Linear's homepage hero — geometric calm, no urgency.

Camera behavior:

- 32mm equivalent. Slight handheld breathing (≤ 0.4° drift, 4s loop).
- No dolly. No orbit. Just **breath**.
- Mouse parallax: max 6° pitch, 8° yaw. Heavy easing (cubic-out, 1.2s).

---

## Lighting references

- Key: large soft area light, cool 5600K, top-front, ~30% intensity.
- Fill: warm bounce 3200K from below, ~8% intensity. Just enough to keep it
  from going clinical.
- Rim: a single hard light, 90° behind, sculpts silhouette.
- Volumetric: light fog at 4–6% density. This is the secret to "atmosphere."
- HDRI: muted studio, blurred. Never an outdoor scene.

If it looks like a product render, it's wrong. If it looks like a still from
a film, it's right.

---

## Movement philosophy

- One primary rotation: 0.06 rad/s on Y. Slow enough that you almost don't see it.
- One secondary breath: scale 1.000 → 1.012 → 1.000 over 7s, ease-in-out-sine.
- Satellites: independent orbits, 14s and 23s periods (prime-ish, never sync).
- Never linear. Never looping visibly. The eye must not catch the seam.

---

## Interaction notes

- Mouse parallax only. No click interactions on hero.
- Scroll: scene scales 1.0 → 0.78, opacity 1.0 → 0.4 over first 80vh.
- Reduced motion: freeze rotation, keep breathing at 50% amplitude.
- Mobile: replace with pre-rendered 6s loop @ 1080×1920, max 1.4 MB.

---

## Performance constraints

| Constraint        | Value                              |
|-------------------|------------------------------------|
| Polygon budget    | 45k total                          |
| Materials         | 5                                  |
| Lights            | 4 (key, fill, rim, ambient)        |
| Bundle target     | 900 KB                             |
| Mobile fallback   | MP4 loop, H.265, < 1.4 MB          |

---

## Export workflow

1. Lock geometry. Snapshot: `01_hero_geo_lock_v{n}.spline`
2. Light pass review against this brief.
3. Export web embed → `12_Final_Exports/spline/hero-core-v{n}/`
4. Export MP4 fallback → same folder, named `hero-core-fallback-v{n}.mp4`
5. Update [Production Status](../15_Production_Workflows/Production_Status.md).

---

## Done = looks like

A still frame from a film you can't quite place. Quiet. Lit, not colored.
You feel it before you understand it.
