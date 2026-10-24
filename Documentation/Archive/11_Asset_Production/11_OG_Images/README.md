# OG Images (Open Graph + Social Share Cards)

The image that renders when a SheetFlow link is shared on LinkedIn, X,
Slack, iMessage. Often the first SheetFlow asset a viewer ever sees.

Treat this as the most critical small format in the system.

## Format

- **Aspect:** 1.91:1
- **Resolution:** 1200 × 630 px (exact)
- **Format:** PNG (lossless) or JPEG-92
- **File size:** < 1MB strictly
- **Color:** sRGB only — most social previews are not P3-aware

## Layout grid

```
+------------------------------------------------+
|                                                |
|   [Type column 60%]    [Visual column 40%]     |
|                                                |
|   Headline                                     |
|   Sub                                          |
|                                                |
|   sheetflow.ai                                 |
+------------------------------------------------+
```

- Type left, visual right. Always.
- Visual is a crop from `12_Final_Exports/stills/` — never a new render.
- Bottom-left: tiny domain stamp `sheetflow.ai` at 14–16pt.

## Type rules

- Headline: 7 words max, single line
- Söhne Halbfett or GT America Bold, ~64pt
- Tracking -0.02em
- White at 92% opacity over atmospheric dim layer
- Sub: optional, Inter Regular, 24pt, 70% opacity

## What ships

One OG per:
- Site root (homepage)
- Each landing page variant
- Each blog post
- Each launch / announcement
- Each case study

## What never ships

- A literal product screenshot as the OG
- Logo-only OG (lazy)
- OG with no headline
- An OG that doesn't match the page content
- An OG above 1MB

## File naming

`og-{page-slug}-v{n}-{YYYYMMDD}.png`

Examples:
- `og-home-v3-20260512.png`
- `og-launch-2026q2-v1-20260512.png`
- `og-case-northgate-v2-20260512.png`

## Workflow

1. Pick / crop atmospheric visual from
   [12_Final_Exports/stills](../12_Final_Exports/)
2. Layout in Figma `og.fig` template
3. Type in the matching page headline (verbatim where possible)
4. Export PNG to `_inbox/`
5. Review at 320 × 168 thumbnail size (sanity check)
6. Lock into `12_Final_Exports/og/`
