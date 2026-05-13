# Moodboard — Motion

## Direction
The system breathes. It does not perform. It is unhurried because it is certain.

## References to study
- Apple keynote scene transitions
- Linear's panel and sidebar transitions
- Vercel deployment cascade animation
- Arc browser tab swap
- Rauno Freiberg's portfolio interactions
- Family iPhone app launch sequence
- 2001 Space Odyssey docking ballet
- Slow motion moon over a still landscape

## Adjectives
breathing · weighted · choreographed · unhurried · certain · physics-correct

## Anti-references
- Bounce easing on professional surfaces
- Default `ease` curve (the dead giveaway)
- Auto-playing carousels
- Endless parallax
- Loading spinners that spin past 600ms
- Scroll-jacking
- Character-by-character typewriter effects

## SheetFlow motion grammar
| Surface             | Duration | Easing                                     |
|---------------------|----------|--------------------------------------------|
| Micro (button hover)| 180ms    | cubic-bezier(0.32, 0.72, 0.0, 1.0)         |
| Standard (panel in) | 320ms    | cubic-bezier(0.16, 1.0, 0.3, 1.0)          |
| Cinematic (hero)    | 800ms    | cubic-bezier(0.22, 1.0, 0.36, 1.0)         |
| Page transition     | 480ms    | spring(stiffness=240, damping=28)          |

## What "breathing" means
Slow scale 1.000 → 1.012 → 1.000 over 7s, ease-in-out-sine.
On every cinematic element. Always.
