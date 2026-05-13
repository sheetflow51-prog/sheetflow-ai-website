# Spline Scene Posters

Static poster images displayed while Spline scenes load and as the
permanent fallback for `prefers-reduced-motion` users.

## Required files

| File | Dimensions | Max size | Scene |
|---|---|---|---|
| `spline_hero_v1.0.webp` | 1440×1440 | 220 KB | Hero Intelligence Core |
| `spline_workflow_v1.0.webp` | 2400×1200 | 220 KB | Workflow Universe |
| `spline_dashboard_v1.0.webp` | 2400×1400 | 220 KB | Dashboard Intelligence Layer |
| `spline_cta_v1.0.webp` | 1440×1440 | 220 KB | Final CTA / Invitation |

## Source

The Spline artist delivers these as part of the handback package
(see `FINAL_EXECUTION_LAYER.md §1.6`).

Interim approach: screenshot the R3F AICore scene at the canonical
static frame, crop to the required dimensions, export to WebP quality 80.

## Notes

- All posters must be beautiful as standalone frames (see `SPLINE_CINEMATIC_EXECUTION_SYSTEM.md §7.8`)
- Reduced-motion users ONLY ever see the poster — it must not look like a missing image
- Convert PNG sources to WebP with: `cwebp -q 80 input.png -o output.webp`

Until real Spline posters arrive, the `<AICore />` R3F component renders
as the poster via the `poster` prop in `IntelligenceCore.tsx`.
