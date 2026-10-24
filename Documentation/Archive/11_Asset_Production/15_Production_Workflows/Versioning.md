# Versioning

When to bump `v{n}` — and when not to.

## The rule

A new version is created whenever an asset is **re-rendered, re-edited,
or re-graded with intent to ship**. Cosmetic file conversions (PNG to
JPEG, resize for OG, etc.) do not create a new version — they are
*derivatives*.

## What counts as a new version

| Change                                       | New version? |
|----------------------------------------------|--------------|
| Re-rendered Spline scene                     | Yes          |
| Re-graded color                              | Yes          |
| Re-cropped composition                       | Yes          |
| Re-typed (headline change)                   | Yes          |
| Re-shot / re-generated                       | Yes          |
| Resize / format conversion only              | No (derivative) |
| Compression-only optimization                | No           |
| Renaming                                     | No           |

## Numbering

- Always integer
- Always starts at 1
- Always monotonically increasing
- Never reused (don't go back to v2 after shipping v3)

## Derivatives

When you need multiple sizes of the same shipped asset, name as:

```
{type}-{slug}-v{n}-{YYYYMMDD}.{ext}                 ← master
{type}-{slug}-v{n}-{YYYYMMDD}@1080w.{ext}           ← 1080-wide
{type}-{slug}-v{n}-{YYYYMMDD}@og.{ext}              ← OG-cropped
{type}-{slug}-v{n}-{YYYYMMDD}@thumb.{ext}           ← thumbnail crop
```

Derivatives share the version of their master.

## When to retire a version

Once `v3` ships, `v2` and `v1` are *not deleted* — they stay in
`12_Final_Exports/` so old shares / blog posts / press citations keep
resolving. They are only removed in a yearly archive pass to
`_archive/superseded/`.

## Version mismatches across an asset family

A single concept (e.g., "hero core") may have:
- `still-hero-core-v3-...`
- `reel-hero-core-v1-...`
- `og-hero-core-v2-...`
- `poster-hero-core-v4-...`

Their `v{n}` are independent. The reel does not inherit the still's
version. Don't try to sync them.

## Logging version bumps

Each new version's prompt or process should be logged via
`scripts/prompt-log.ps1` so the version history has a trace, not just a
filename.
