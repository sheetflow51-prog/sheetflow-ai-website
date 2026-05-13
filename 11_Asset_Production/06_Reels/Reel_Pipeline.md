# Reel Pipeline — Production Workflow

The exact step-by-step from idea → published reel.

---

## Step 1 — Brief (1 page max)

Each reel begins with a brief in `06_Reels/briefs/{slug}.md`:

```
# {slug} reel
- Goal:        what this reel does for the brand
- Audience:    who it's for (be specific)
- Length:      target seconds
- Aspect:      9:16 / 16:9 / 1:1
- Rhythm:      breath / pulse / reveal
- Hook frame:  what the first frame is
- Final beat:  what the last frame is
- Music vibe:  3-word reference
- Type plan:   1 line of copy max
```

If the brief takes more than one page, the reel is too complex.

---

## Step 2 — Storyboard (6–10 frames)

Frames are stills, not sketches. Pull from:
- Existing Midjourney library (`02_Midjourney_Prompts/`)
- New Midjourney generations
- Spline scene captures
- Real photography

Save: `06_Reels/storyboards/{slug}/01.png` … `10.png`

---

## Step 3 — Asset gathering

Drop everything needed into `_inbox/reels/{slug}/`:
- Plates (stills)
- Generated motion (Runway/Kling outputs)
- Spline exports
- Type layouts (from Figma)
- Music demo
- SFX picks

Run `scripts/organize-inbox.ps1 reels {slug}` to fold into an active project folder.

---

## Step 4 — Edit pass (offline)

- Import to Premiere/Resolve.
- Cut on the rhythm you committed to in the brief. Don't drift.
- No color grading yet. No final type. Pure rhythm.
- Export "offline_v1.mp4" for review.

---

## Step 5 — Sound pass

Sound before color. Always. Color is determined by emotion, and sound
sets emotion.

- Score in (full piece, not loops)
- Ambient bed
- One designed transition SFX per cut
- Optional vocal, processed (never raw)
- Export "sound_v1.mp4"

---

## Step 6 — Color pass

DaVinci Resolve. Match against
[Lighting moodboard](../04_Moodboards/Lighting.md):
- Lift: cool sapphire
- Gamma: neutral
- Gain: warm rim
- Saturation: 70–80% of source max
- Highlights: roll off softly (never clip)

Export "graded_v1.mp4".

---

## Step 7 — Type & finishing

- Add display type per [Typography moodboard](../04_Moodboards/Typography.md)
- Title-safe: keep type 8% inside frame on all sides
- Final logo card (if any) sized small — never full-frame logo
- Letterbox if mixing aspects

Export "final_v1.mp4".

---

## Step 8 — Review gate

Pass to [Asset Review](../13_Asset_Review/Review_Checklist.md).
Six tests. Pass all. Or back to step 6 (or wherever it failed).

---

## Step 9 — Lock & encode

```
scripts/lock-asset.ps1 -type reel -slug {slug} -version {n}
```

Encodes per export targets in [README](README.md), names files correctly,
moves to `12_Final_Exports/reels/{slug}/`, updates
[Production Status](../15_Production_Workflows/Production_Status.md).

---

## Step 10 — Publish

Outside the scope of this pipeline — handed to the social/launch ops team.
Production's job ends at `12_Final_Exports/`.
