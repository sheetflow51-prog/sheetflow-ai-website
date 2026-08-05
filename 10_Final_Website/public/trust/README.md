# Trust Logo Assets

Client logos for the Hero trust strip.

## Current state

**The trust strip does not render.** `src/content/proof.ts` holds no verified
trust logos, so `publishedTrustLogos()` returns an empty array and `Hero.tsx`
skips the block entirely.

This directory contains no logo files, by design.

Earlier revisions shipped text placeholders (STRATA, ARC.OPS, NORTHFIELD,
OBSIDIAN, PARALLEL, KINETIK, and later NORTH CLINIC, OAKWOOD REALTY, BRIGHTPATH,
SUMMIT COACHING, LUMEN AGENCY). Those were invented names presented as clients.
They have been removed. **Do not recreate them, and do not generate logo files
for them** — a logo turns a text placeholder into a forged endorsement.

## Adding a real client logo

1. Obtain **written** permission from the client for logo usage. No exceptions.
2. Export the logo as SVG, monochrome, all paths set to `currentColor`.
3. Save as `<client-slug>.svg` in this directory.
4. Add a `status: 'verified'` entry to `trustLogos` in `src/content/proof.ts`,
   including the `verification` block recording who granted permission and when.
5. Set `NEXT_PUBLIC_FEATURE_TRUST_LOGOS=true`.

No component changes are required. The strip appears automatically.

## Visual treatment

Per `FINAL_EXECUTION_LAYER.md §2.3`:

- Mono treatment: white at 60% opacity against void
- All logos at the same OPTICAL weight (not pixel height)
- 5–8 logos maximum
- On hover (desktop only): opacity lifts to 90% over 240ms

## Never ship a logo without written permission.
