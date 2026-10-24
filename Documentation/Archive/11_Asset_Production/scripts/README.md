# Scripts

Lightweight PowerShell utilities for managing the asset pipeline.

| Script                              | Purpose                                       |
|-------------------------------------|-----------------------------------------------|
| `organize-inbox.ps1`                | Triage `_inbox/` into category folders        |
| `normalize-filenames.ps1`           | Enforce naming convention across a folder     |
| `categorize-export.ps1`             | Sort raw exports into `12_Final_Exports/...`  |
| `lock-asset.ps1`                    | Move reviewed asset to final exports + log    |
| `prompt-log.ps1`                    | Append a prompt run to `14_Prompt_Library/`   |
| `production-status.ps1`             | Print summary of in-flight assets             |

All scripts are pure PowerShell (no external deps). Run from anywhere; they
resolve `$PSScriptRoot` to find the production root.

## Conventions

- Scripts are **idempotent** — safe to re-run.
- Scripts never delete original files; they move to `_archive/` or copy.
- Every script logs to `15_Production_Workflows/_logs/{script}-{date}.log`.
- All scripts respect the SheetFlow naming convention:
  `{type}-{slug}-v{n}-{YYYYMMDD}.{ext}`
