# Glass Experiments

> Recipes for glass surfaces — what works, what looks cheap, what feels Apple-grade.

---

## The five-layer glass stack (production)

A single "good" glass card in this codebase is composed of:

```css
.glass {
  background: rgba(255, 255, 255, 0.03);            /* 1. base tint */
  border: 1px solid rgba(255, 255, 255, 0.06);      /* 2. edge definition */
  backdrop-filter: blur(20px) saturate(180%);       /* 3. content lensing */
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.05) inset,        /* 4. inner highlight */
    0 8px 24px rgba(0, 0, 0, 0.3);                  /* 5. ambient drop */
}
```

The non-obvious one is **layer 4** (inner highlight). Without it, the card looks like a div with a border. With it, the card looks like a piece of glass that catches the room's light.

---

## What's been tried

### Border style
- **Solid 1px** → too crisp on dark UI. Reads like a CSS framework.
- **Linear gradient border (top→bottom, white→transparent)** → great for hero cards, expensive (requires `mask-composite`). Adopted on award-grade cards only.
- **`rgba(255,255,255,0.06)` flat** → ✓ default. Quiet, premium.

### Saturation
- `saturate(100%)` (no boost) → glass looks gray/dead behind colored backgrounds.
- `saturate(180%)` ✓ — colors bloom through the glass, makes the layer feel like a living lens.
- `saturate(220%)` → starts to look cartoony.

### Backdrop blur
- `blur(8px)` — appropriate for nav.
- `blur(20px)` — default for cards. ✓
- `blur(40px)` — modal/overlay only. Heavy GPU cost; cap usage.

### Inner highlight intensity
- `0,1,0 rgba(255,255,255,0.04) inset` → barely there.
- `0,1,0 rgba(255,255,255,0.05) inset` ✓ default
- `0,1,0 rgba(255,255,255,0.10) inset` → too much; reads as a hover state on rest.

---

## Performance notes

`backdrop-filter` triggers a paint on each repaint of content behind it. Avoid:

- Stacking 4+ glass surfaces in the same viewport
- Animating backdrop-filter (use `opacity` on a sibling pseudo instead)
- Glass on full-bleed sections (the entire viewport repaints when content scrolls)

When perf matters more than aesthetics, fall back to `.glass-subtle` (12px blur, no saturate).

---

## Hover state

```css
.card-interactive:hover {
  background: rgba(255, 255, 255, 0.05);            /* +0.02 alpha */
  border-color: rgba(99, 102, 241, 0.35);           /* indigo edge */
  transform: translateY(-4px);                       /* lift */
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.08) inset,
    0 20px 60px rgba(0, 0, 0, 0.4),                  /* deeper drop */
    0 0 0 1px rgba(99, 102, 241, 0.1),               /* halo */
    0 0 40px rgba(99, 102, 241, 0.1);                /* glow */
}
```

Three things change on hover, in order of importance:
1. Border becomes accent — *the card declares interactivity.*
2. Card lifts 4px — *the card declares it's responding to you.*
3. Glow appears — *the card declares it's awake.*

Anything more (color change, scale, etc.) is decoration.

---

## What we won't do

- **Glass everywhere** — overuse turns the entire UI into a foggy bath.
- **Glass on text-only blocks** — glass implies depth; text on glass reads as "the headline is a card," which it isn't.
- **Glass + glass nested** — the inner glass becomes invisible. Use elevation (z-stack) instead of nested transparency.

---

*Production CSS: `src/app/globals.css` → `.glass`, `.glass-strong`, `.glass-subtle`, `.feature-card`.*
*Reference system: `/03_UI_Systems/glassmorphism/glassmorphism_system.md`*
