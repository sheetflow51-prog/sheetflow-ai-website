# Launch Posters

Editorial, single-image moments. A poster is the version of SheetFlow that
hangs on a wall — no UI, no marketing chrome, just brand temperature.

## Use cases

- Product Hunt / launch day hero
- "We're hiring" cards
- Quote posters for founder content
- Conference / off-site backdrops
- LinkedIn announcement images (when a screenshot would be wrong)

## Format

- **Aspect:** 4:5 portrait (default), 3:2 landscape (event use)
- **Resolution:** 2400 × 3000 px minimum
- **Color:** Display P3 working space, sRGB on export
- **Format:** PNG-24 (lossless), JPEG 92 for socials

## Composition rules

1. **One subject.** Two visual ideas = no poster.
2. **60% negative space minimum.** Posters breathe.
3. **Type sits in the lower third or upper-left quadrant.** Never center.
4. **Logo is small.** 4–6% of the long edge. Never larger.
5. **Light source is offscreen.** Implied, not depicted.

## Voice

Posters are *quiet*. If a viewer needs to lean in to read, that is correct.
If the message arrives in <0.5s, the poster is too loud.

## Workflow

1. Brief → choose one prompt from
   [Launch_Posters](../02_Midjourney_Prompts/Launch_Posters.md)
2. Generate 4-up, pick best, upscale subtle
3. Drop into Figma `posters.fig` for type layer
4. Export to `_inbox/` named `poster-{slug}-v{n}-{YYYYMMDD}.png`
5. Run `scripts/normalize-filenames.ps1` if needed
6. Move to `13_Asset_Review/pending/` for sign-off
