# Lighting References

> Cinematic lighting study. The website is lit, not just colored.

---

## The lighting principle

A frame in cinema is built around **three light sources**:

1. **Key light** — the dominant directional source.
2. **Fill light** — softer, opposite the key, prevents black shadows.
3. **Rim light** — backlight that separates subject from background.

The SheetFlow AI website applies the same rule:

| Layer | Role | Implementation |
|---|---|---|
| Aurora gradient (top-left blob, indigo) | Key light | `AmbientBackground.tsx` first radial-gradient |
| Aurora gradient (bottom-right, violet) | Fill | second radial-gradient |
| Bloom around AI core | Rim | postprocessing Bloom in `AICore.tsx` |
| Card inner-highlight | Catch light | `box-shadow` inset on `.glass` |

---

## References studied

### Blade Runner 2049 — neon as architecture
- **What**: Light is treated as an architectural element. Neon doesn't decorate — it defines space.
- **Translation to UI**: Our accent halos define interactive surfaces, not just color them. The button's halo is "you can touch this," not "look at this."
- **Status**: Adopted as the philosophy behind `.btn-primary` glow stack.

### Apple Vision Pro launch reveal
- **What**: The product floats in volumetric haze. There's no "background"; only depth and light.
- **Translation**: Hero AI core sits in a vignette gradient (no hard edges). The vignette implies infinite depth, not a backdrop.
- **Status**: Adopted in `Hero.tsx` (radial vignette mask).

### Tron: Legacy — the grid as light source
- **What**: Light emerges from the geometry itself, not external sources.
- **Translation**: Workflow Universe nodes glow from their colored stroke, not from external shadows. Each node is its own pixel of light.
- **Status**: Adopted in `WorkflowUniverse.tsx` (per-node `boxShadow` colored by type).

### Stripe — daylit minimalism
- **What**: When Stripe wants premium, it removes light — calm, even illumination.
- **Translation**: Footer and dense info sections do not get aurora gradients. Calm space requires absence of light gestures.
- **Status**: Adopted (no ambient gradient under `Footer.tsx`).

---

## Three things we never do

- **Lens flare** — a 2010s holdover. Always rejected.
- **Animated bloom intensity** — bloom is a layer property, not a beat. Constant intensity only.
- **Multiple competing key lights** — one indigo direction wins; everything else fills/rims.

---

## The "intelligence glow" recipe (signature)

When SheetFlow AI wants to indicate aliveness or signal status:

```css
filter: drop-shadow(0 0 12px rgba(129, 140, 248, 0.5));
```

Single-source, soft, non-pulsing (unless the badge specifies live state). The pulse is reserved for `live` states only — see `.badge-live` in `globals.css`.

---

*Reference systems:*
- *`/01_Brand_Research/color_system/color_psychology.md` (the color/light theory)*
- *`/04_3D_Concepts/ai_core/ai_core_concepts.md` (3D bloom configuration)*
