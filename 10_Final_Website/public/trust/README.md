# Trust Logo Assets

Client logos displayed in the Hero trust strip.

## Current state

The trust strip currently renders text-based placeholder names
(STRATA, ARC.OPS, NORTHFIELD, OBSIDIAN, PARALLEL, KINETIK) — these are
intentional brand-compliant placeholders, not broken UI. They ship as-is
until real logos are available with signed permission.

## When real logos are ready

1. Obtain written permission from each client for logo usage.
2. Export logo as SVG (monochrome — all paths set to `currentColor`).
3. Save as `<client-slug>.svg` (e.g., `strata-ops.svg`).
4. Update `src/components/sections/Hero.tsx` — replace the `<span>` text
   render with a `<Image>` render from this directory.

## Visual treatment

Per `FINAL_EXECUTION_LAYER.md §2.3`:
- Mono treatment: white at 60% opacity against void
- All logos at the same OPTICAL weight (not pixel height)
- 5–8 logos maximum
- On hover (desktop only): opacity lifts to 90% over 240ms

## Never ship a logo without written permission.
