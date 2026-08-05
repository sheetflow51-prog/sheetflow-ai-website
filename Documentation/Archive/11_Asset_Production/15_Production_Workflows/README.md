# Production Workflows

The operational layer of the asset pipeline. Conventions, ledgers, and
the running record of what's in flight.

## Files in this folder

| File                          | Purpose                                  |
|-------------------------------|------------------------------------------|
| [Naming_Conventions.md](Naming_Conventions.md) | The one filename pattern, with all type prefixes |
| [Versioning.md](Versioning.md) | When to bump `v{n}`, what's a major vs minor change |
| [Production_Status.md](Production_Status.md) | Snapshot dashboard of in-flight work |
| `production-ledger.csv`       | Append-only record of every locked asset |
| `_logs/`                      | Per-run logs from all scripts            |
| `_inbox/`                     | Figma/Sketch exports awaiting routing    |

## The two artifacts that matter most

**1. `production-ledger.csv`** — append-only, never edited. Every asset
that ships passes through `scripts/lock-asset.ps1`, which adds a row.
This is the chain of custody: when did it ship, who reviewed it, where
are the notes.

**2. `_logs/`** — every script invocation drops a timestamped log here.
If you ever need to know "why did this asset get moved?", the answer is
in `_logs/`.

## How to use this folder

You generally don't touch this folder by hand. Scripts read from and
write to it; you observe via `scripts/production-status.ps1`.

The exception: when conventions evolve, update
[Naming_Conventions.md](Naming_Conventions.md) and
[Versioning.md](Versioning.md) — and only then update the scripts to
match. Documentation leads, scripts follow.

## Logs retention

`_logs/` is *not* checked into source control. The retention policy:
keep 90 days locally, archive monthly snapshots to `_archive/logs/`.
