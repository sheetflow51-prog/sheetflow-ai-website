# Production Status

How to read the state of the asset pipeline at any moment.

## Live status

Run from anywhere:

```powershell
./scripts/production-status.ps1
```

Prints a one-screen dashboard:

```
SheetFlow Asset Production — Status
==================================================
Generated: 2026-05-12 14:22

Inbox (untriaged)
--------------------------------------------------
  _inbox total                        12
  _inbox/unknown                       2

Generation pipelines
--------------------------------------------------
  Spline scenes (working)              3
  Midjourney prompts (md)              9
  References collected                47
  Moodboards (md)                      8

Asset categories (in-flight)
--------------------------------------------------
  Launch posters                       4
  Reels                                6
  Thumbnails                           3
  ...

Review gate
--------------------------------------------------
  Pending review                       5
  Rejected                             2

Shipped (12_Final_Exports)
--------------------------------------------------
  Stills                              23
  Reels                                4
  Posters                              3
  ...
```

Read-only; never modifies anything.

## Manual checks

If the script isn't enough:

| Question                                | Where to look                          |
|-----------------------------------------|----------------------------------------|
| What's queued for review?               | `13_Asset_Review/pending/`             |
| What's been rejected and why?           | `13_Asset_Review/rejected/*.md`        |
| What was the last thing locked?         | `production-ledger.csv` (last row)     |
| Why did this file get moved here?       | `_logs/` (grep for filename)           |
| Which prompts produced shipped assets?  | `14_Prompt_Library/winners/`           |
| What's still sitting in the inbox?      | `_inbox/` + `_inbox/_unknown/`         |

## The ledger

`production-ledger.csv`:

| Column      | Meaning                                          |
|-------------|--------------------------------------------------|
| date        | Date asset was locked into `12_Final_Exports/`   |
| asset       | Filename or folder name                          |
| category    | Subfolder it landed in                           |
| reviewer    | Name from `review-*.md` (if present)             |
| notes_file  | Filename of the review notes (in the locked dir) |

Append-only. Never edit historic rows.

## Cadence (suggested)

- **Daily:** `production-status.ps1` first thing
- **Weekly:** review `_inbox/_unknown/` — anything stuck there is a
  routing gap; update `organize-inbox.ps1` rules
- **Monthly:** prune `_logs/`, snapshot to `_archive/logs/{YYYY-MM}/`
- **Quarterly:** archive superseded versions to `_archive/superseded/`
