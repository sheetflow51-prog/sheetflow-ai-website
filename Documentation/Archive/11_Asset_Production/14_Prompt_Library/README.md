# Prompt Library

The institutional memory of every generation run. Used to:
- Reproduce assets when source files are lost
- Trace which prompt produced which winning still
- Onboard new collaborators to SheetFlow's working prompt grammar
- Audit drift — when prompts start straying from brand

## Files

| File              | Purpose                                          |
|-------------------|--------------------------------------------------|
| `prompt-log.md`   | Append-only log of every prompt run (most recent first) |
| `winners/`        | Subset of prompts that produced shipped assets   |
| `experiments/`    | Prompts under active exploration, not yet shipped|
| `retired/`        | Prompts deprecated due to drift or staleness     |

## Logging a prompt run

Use the helper:

```powershell
./scripts/prompt-log.ps1 `
  -Tool midjourney `
  -Prompt "matte ceramic core, two-temperature light..." `
  -Params "--ar 16:9 --stylize 200 --style raw" `
  -Output "still-hero-core-v1-20260512.png" `
  -Outcome "shipped"
```

This appends a dated entry to `prompt-log.md`. The script handles
formatting and ordering. Do not edit `prompt-log.md` by hand.

## Promoting a prompt to "winner"

When a prompt produces a shipped asset (locked into `12_Final_Exports/`):
1. Copy the log entry to `winners/{type}-{slug}.md`
2. Add a brief annotation: *why* it worked, *what to keep*, *what to vary*
3. Future generations can riff from here

## Retiring a prompt

If a prompt is producing drift (palette wrong, banned elements creeping in):
1. Move from `winners/` to `retired/`
2. Add a one-line note: *what went wrong, when, and what replaced it*
3. Never delete — retired prompts are training data for the next refresh

## Reading the library

Skim `winners/` before opening Midjourney. The prompts that already work
are infinitely cheaper than the ones you'd write fresh.
