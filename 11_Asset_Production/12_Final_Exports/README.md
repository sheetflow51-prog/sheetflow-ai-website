# Final Exports

The shipped vault. Assets here are **locked** — production-grade, reviewed,
and ready for use on the site, in pitches, in press, in social.

## How assets get here

Only one sanctioned path:

```
13_Asset_Review/pending/{slug}-v{n}/   ← reviewer approves
        │
        ▼
   scripts/lock-asset.ps1
        │
        ▼
12_Final_Exports/{category}/{slug}-v{n}-{date}.{ext}
        +
15_Production_Workflows/production-ledger.csv (row appended)
```

**Never** move files into `12_Final_Exports/` manually. Always
`scripts/lock-asset.ps1`. The ledger keeps the chain of custody.

## Category subfolders

```
12_Final_Exports/
├── stills/         — hero stills, atmospheric plates
├── reels/          — IG reels, launch teasers, product videos
├── spline/         — exported MP4 fallbacks + .splinecode bundles
├── posters/        — editorial single-image moments
├── thumbnails/     — YouTube, Loom, podcast covers
├── og/             — Open Graph / share cards
├── social/         — single-image social posts
├── portraits/      — founder and team imagery
└── case-studies/   — per-customer subfolders
```

## What lives here

- Final, color-corrected, named, reviewed assets only
- Both the masters AND any required derivatives (e.g., poster master +
  poster-1080w + poster-2400w)

## What does NOT live here

- Working files (Figma, Spline scenes, raw photos) — those stay in their
  source folders
- Iterations, rejects, "almost there" — those stay in `13_Asset_Review/`
- Anything without a normalized filename

## Filename convention (enforced)

`{type}-{slug}-v{n}-{YYYYMMDD}.{ext}`

The `lock-asset.ps1` script rejects assets that don't match.

## Read-only by convention

Once locked, never edit in place. If a change is needed:
1. Pull the file back to `_inbox/` as a new version
2. Run it through the full pipeline again (review included)
3. Lock the new version — the prior version stays for history

This is how we get to a year-end retrospective without a graveyard
of half-fixed files.
