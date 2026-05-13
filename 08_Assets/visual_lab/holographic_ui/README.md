# Holographic UI

> Floating, layered, translucent panels that read as projected light, not solid surface.

---

## The principle

Holographic UI is **translucent + layered + lit**. Take any one of those away and you have something else (frosted glass, a card stack, a flat panel).

Our `AIDashboard` section is the canonical holographic moment in this codebase.

---

## The three layers of a holographic surface

```
[Front]   primary content (full opacity, blur 0)
   ↓
[Mid]     callouts, signals (~85% opacity, blur 0, slight 3D rotation)
   ↓
[Back]    ambient context (~60% opacity, blur 4-8px, deeper rotation)
```

Each layer translates on Z to create real depth. CSS:

```css
.holo-stack {
  transform-style: preserve-3d;
  perspective: 2000px;
}
.holo-back  { transform: translateZ(-40px); opacity: 0.6; filter: blur(6px); }
.holo-mid   { transform: translateZ(-10px); opacity: 0.85; }
.holo-front { transform: translateZ(20px); }
```

---

## Things that make a holographic UI *believable*

### Edge highlights
Real holograms have a faint top-edge highlight (where projection light hits the air densest).

```css
.holo-front::before {
  content: '';
  position: absolute;
  top: 0; left: 12px; right: 12px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
}
```

Already shipped in `glassmorphism_system.md`'s award-grade card recipe.

### Scan lines (ultra-subtle)
0.04 alpha, 4px repeat, 0deg orientation. Anything more is "old TV"; anything less is invisible.

### Drift on idle
A holographic panel is never perfectly still. The AI Core idle breath (sin(t * 0.8) * 0.03) translates well to dashboard surfaces — a 6-second period, ±0.3px translate, ±0.2deg rotate.

---

## Patterns from `04_3D_Concepts/holographic_ui/holographic_interfaces.md`

| Pattern | Status |
|---|---|
| Multi-Z transform stack | Adopted in `AIDashboard.tsx` (3 layers via floating cards + main card) |
| Scan line repeating gradient | Adopted in `AIDashboard.tsx` main card overlay |
| Edge highlight | Reserved for next polish pass on bento grid |
| Glitch RGB offset on hover | Rejected (see `scifi_ui_references/`) |
| Drift idle motion | Pending GSAP timeline |

---

## Common mistakes

- **Too much transparency** — at >0.7 opacity drop, primary content becomes unreadable. Cap at 0.6 for back layer.
- **Hard rotation angles** — anything over 15° on either axis reads as "broken perspective" rather than "depth."
- **Z-translate without perspective** — without `perspective: 2000px` on the parent, transformZ does nothing visible on flat layouts.
- **Bloom on holographic content** — the layered transparency already provides the glow; adding bloom blows it out.

---

*Production hook: `AIDashboard.tsx` uses `perspective: '2000px'` and `transformStyle: 'preserve-3d'` on the parent, with `translateZ(40px/60px)` on floating cards.*
