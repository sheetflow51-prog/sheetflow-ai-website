# Naming Conventions

One pattern, applied everywhere:

```
{type}-{slug}-v{n}-{YYYYMMDD}.{ext}
```

## Type prefixes (canonical)

| Prefix     | Asset category              | Lives in                       |
|------------|-----------------------------|--------------------------------|
| `still`    | Hero stills, atmospheric    | `12_Final_Exports/stills/`     |
| `reel`     | Short-form video            | `12_Final_Exports/reels/`      |
| `spline`   | Exported Spline scene       | `12_Final_Exports/spline/`     |
| `poster`   | Editorial single-image      | `12_Final_Exports/posters/`    |
| `thumb`    | Thumbnail (16:9 cover)      | `12_Final_Exports/thumbnails/` |
| `og`       | Open Graph card             | `12_Final_Exports/og/`         |
| `social`   | Social post                 | `12_Final_Exports/social/`     |
| `portrait` | Founder / team imagery      | `12_Final_Exports/portraits/`  |
| `case`     | Case study asset            | `12_Final_Exports/case-studies/` |
| `ref`      | Reference (inspiration)     | `03_Reference_Collection/`     |

## Slug rules

- Lowercase only
- Words separated by hyphens
- Strict `[a-z0-9-]` — no underscores, no spaces, no special chars
- Max 5 tokens (`hero-core-intelligence-layer` not
  `the-very-bright-hero-core-intelligence-layer-final`)
- Customer/proper nouns: slugify (`North Gate Capital` → `northgate`)

## Version (`v{n}`)

- Integer starting at 1
- Increments on every meaningful revision (see [Versioning.md](Versioning.md))
- No `v0`, no `v1.1`, no `v-final`

## Date (`YYYYMMDD`)

- Always the date of *export*, not the date the work started
- 8 digits, no separators
- Always UTC-equivalent local date — pick a convention and hold it

## Extension

Lowercase only. Allowed:

- Images: `.png`, `.jpg`, `.jpeg`, `.webp`, `.tiff`
- Video:  `.mp4`, `.mov`, `.webm`, `.prores`
- Spline: `.spline`, `.splinecode`
- Source: `.fig`, `.sketch`, `.psd`, `.ae`, `.prproj`

## Examples

✅ Correct:
- `still-hero-core-v3-20260512.png`
- `reel-launch-teaser-v1-20260415.mp4`
- `og-home-v2-20260512.png`
- `case-northgate-environmental-v1-20260512.png`

❌ Wrong:
- `Hero Core FINAL.png` — capitals, spaces, no type prefix, no version, no date
- `still_hero_core_v3.png` — underscores, no date
- `still-hero-v3.0-20260512.png` — non-integer version
- `still-hero-core-v3.png` — no date

## Enforcement

`scripts/normalize-filenames.ps1` rewrites any incoming file to match.
`scripts/lock-asset.ps1` rejects any file that doesn't match.
