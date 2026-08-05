# SheetFlow AI — Asset Production System

The operational workspace for producing every cinematic asset that ships under the
SheetFlow AI brand. Engineering, architecture, Brand OS, and deployment are done.
This pipeline turns the brand into **real visual output**.

---

## North Star

We are not making "AI content."
We are making a **luxury cinematic intelligence universe**.

Every asset must feel like:

- Apple keynote restraint
- Linear's geometric calm
- Vercel's confident minimalism
- A film, not a website
- Atmosphere over decoration
- Stillness over noise
- Light over color

If an asset doesn't feel like SheetFlow, it doesn't ship.

---

## Pipeline Map

| #  | Folder                       | Purpose                                              |
|----|------------------------------|------------------------------------------------------|
| 01 | `01_Spline_Scenes/`          | Spline scene briefs, geometry, lighting, exports     |
| 02 | `02_Midjourney_Prompts/`     | Cinematic prompt library, organized by use case      |
| 03 | `03_Reference_Collection/`   | Curated visual research                              |
| 04 | `04_Moodboards/`             | Atmosphere, lighting, motion, typography boards      |
| 05 | `05_Launch_Posters/`         | Launch-day key art and poster compositions           |
| 06 | `06_Reels/`                  | Instagram / vertical motion pipeline                 |
| 07 | `07_Thumbnails/`             | Video thumbnails, link previews                      |
| 08 | `08_Social_Posts/`           | Static social posts (LinkedIn, X, IG grid)           |
| 09 | `09_Founder_Imagery/`        | Founder portraits, behind-the-scenes                 |
| 10 | `10_Case_Study_Assets/`      | Customer/case study visuals                          |
| 11 | `11_OG_Images/`              | Open Graph / Twitter cards                           |
| 12 | `12_Final_Exports/`          | Approved, locked, ready-to-publish assets            |
| 13 | `13_Asset_Review/`           | QA gate — every asset passes through here            |
| 14 | `14_Prompt_Library/`         | Master prompt index across tools                     |
| 15 | `15_Production_Workflows/`   | Conventions, versioning, status tracking             |

Plus:

- `_inbox/` — drop new references / raw exports here for triage
- `_archive/` — superseded assets, kept for history
- `scripts/` — automation utilities

---

## Lifecycle of an Asset

```
INSPIRATION   →  03_Reference_Collection  /  04_Moodboards
        ↓
DIRECTION     →  prompt or scene brief
        ↓
GENERATION    →  Midjourney / Spline / camera / motion tool
        ↓
RAW EXPORT    →  _inbox/  (auto-organized via scripts/)
        ↓
REVIEW        →  13_Asset_Review/  (passes the SheetFlow Test)
        ↓
LOCK          →  12_Final_Exports/  with versioned name
        ↓
PUBLISH       →  site / social / OG / case study
```

Nothing ships from `_inbox/`. Nothing ships from a folder other than
`12_Final_Exports/`. This is enforced by convention and by
`scripts/lock-asset.ps1`.

---

## The SheetFlow Test

Before any asset moves to `12_Final_Exports/`, it must pass all six:

1. **Cinematic** — would this fit in a film, not a banner ad?
2. **Restraint** — is anything decorative? remove it.
3. **Atmosphere** — does it have weight, depth, mood?
4. **Light over color** — is it lit, not colored?
5. **Quiet confidence** — does it whisper, not shout?
6. **Feels like SheetFlow** — would Apple, Linear, Vercel respect it?

Failures route back to `13_Asset_Review/rejected/` with notes.

---

## Tooling Stack

| Discipline      | Primary tool                      |
|-----------------|-----------------------------------|
| 3D scenes       | Spline                            |
| Stills          | Midjourney v6+ / Flux             |
| Motion          | Runway / Kling / After Effects    |
| Type            | Figma + custom variable fonts     |
| Sound           | Splice + custom sound design      |
| Compositing     | After Effects / DaVinci Resolve   |

---

## How to use this workspace

1. Read [Production Workflows](15_Production_Workflows/README.md) once before
   producing anything.
2. Pull direction from
   [Reference Collection](03_Reference_Collection/README.md) and
   [Moodboards](04_Moodboards/README.md).
3. Generate with prompts from
   [Prompt Library](14_Prompt_Library/README.md) /
   [Midjourney Prompts](02_Midjourney_Prompts/README.md) or scene briefs from
   [Spline Scenes](01_Spline_Scenes/README.md).
4. Drop raw output in `_inbox/`. Run `scripts/organize-inbox.ps1`.
5. Review against [Asset Review checklist](13_Asset_Review/Review_Checklist.md).
6. Lock with `scripts/lock-asset.ps1`.

---

## Status

This system is **live**. Every cinematic asset for SheetFlow AI now flows
through it.
