# Cursor Ideas

> The cursor is a brand element on this site. Treat it accordingly.

---

## The current production cursor

Two layers, lerp-followed:

| Layer | Size at rest | Lerp coefficient | Behavior |
|---|---|---|---|
| **Dot** | 6px solid white | 0.40 | Tracks the pointer almost exactly |
| **Ring** | 36px hollow | 0.14 | Trails behind, expanding to 64px on hover |

Code: `src/components/providers/CustomCursor.tsx`

The dot represents *intent*. The ring represents *intelligence catching up* — a literal embodiment of the brand's "intelligence layer" idea.

---

## Variants tested

### Single-dot cursor
- **Result**: Felt like a Mac OS cursor. Forgettable.
- **Verdict**: Rejected.

### Cursor with trail
- **Result**: Beautiful for two seconds. Then nauseating during reading.
- **Verdict**: Rejected. Reserve trails for click moments only (signal burst).

### Crosshair cursor
- **Result**: Reads as a sci-fi targeting reticle. Cool but wrong tone — implies aim, not awareness.
- **Verdict**: Rejected for now. Could fit a "data exploration" experience.

### Mix-blend-mode: difference cursor
- **Tested**: The ring inverts colors over text, becoming visible against any background.
- **Issue**: On glass surfaces, blend-mode reveals every blur edge — looks broken.
- **Verdict**: Rejected. Stuck with `mix-blend-mode: normal` and a subtle white ring.

### Magnetic cursor (ring snaps to interactive elements)
- **Tested**: Ring locks onto buttons within 60px range, easing into a square shape that hugs the button.
- **Issue**: Conflicts with the magnetic-button behavior already on CTAs (the *button* moves toward the cursor — having the cursor also move toward the button creates a vibrating loop).
- **Verdict**: Rejected. Pick one party for the magnetic dance. The button leads.

---

## Cursor states currently shipped

| State | Trigger | Visual |
|---|---|---|
| `default` | rest | 36px ring, white border 0.4 alpha |
| `hover` | over `<a>`, `<button>`, or `[data-cursor="hover"]` | 64px ring, accent border 0.6 alpha, soft accent fill |
| `click` | mousedown | ring shrinks to 24px, snaps |
| `text` (reserved) | over text input | not yet implemented; ring would become a vertical 2×24 caret |

---

## Disabled cases

The cursor is disabled when:
- `pointer: coarse` (touch device)
- `prefers-reduced-motion: reduce`
- `document.body` does not have `cursor-none-all` class (hidden state)

Native cursor returns instantly in these cases.

---

## Ideas not yet shipped

### "Signal echo" on click
On click, fire 12-particle starburst from the click point. Already documented in `04_3D_Concepts/particles/particle_philosophy.md`. Implementation pending — would live as `cursorSignalBurst()` in `CustomCursor.tsx`.

### Contextual intent labels
On certain elements, the ring expands to a tiny label (e.g. "VIEW DEMO →") instead of just a circle. Used to great effect on awwwards.com. Worth prototyping for primary CTAs.

### Idle drift
After 3s of no movement, the dot drifts slowly toward screen center, suggesting the system is "waiting attentively." Could read as alive or as broken — needs prototype.

---

*Reference: `/05_Motion_References/cursor_effects/interaction_design.md`*
