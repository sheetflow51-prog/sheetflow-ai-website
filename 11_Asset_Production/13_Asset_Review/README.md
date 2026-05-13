# Asset Review

The QA gate. Nothing reaches `12_Final_Exports/` without passing through here.

---

## How review works

1. Asset lands in `13_Asset_Review/pending/{slug}-v{n}/`
2. Reviewer opens [Review_Checklist.md](Review_Checklist.md), runs all six tests
3. Outcome routes:
   - **Pass** → `scripts/lock-asset.ps1` moves it to `12_Final_Exports/`
   - **Fail** → moves to `13_Asset_Review/rejected/{slug}-v{n}/` with notes
   - **Iterate** → stays in `pending/` with notes for the producer

---

## The Six Tests

Every asset, every type:

1. **Cinematic** — film-still energy, not banner-ad energy
2. **Restraint** — nothing decorative; everything earns its place
3. **Atmosphere** — depth, weight, mood
4. **Light over color** — sculpted, not painted
5. **Quiet confidence** — whispers, doesn't shout
6. **Feels like SheetFlow** — would Apple/Linear/Vercel respect it?

Detailed rubric in [Review_Checklist.md](Review_Checklist.md).

---

## Reviewer notes format

```markdown
# {slug}-v{n} review — YYYY-MM-DD

Reviewer: {name}
Asset type: {still | reel | spline | poster | …}

## Six Tests
- Cinematic:        [pass | fail]  — note
- Restraint:        [pass | fail]  — note
- Atmosphere:       [pass | fail]  — note
- Light over color: [pass | fail]  — note
- Quiet confidence: [pass | fail]  — note
- Feels like SF:    [pass | fail]  — note

## Outcome
[Pass | Iterate | Reject]

## If Iterate / Reject — required changes
- ...
```

---

## When in conflict

If two reviewers disagree, the **stricter** opinion wins. We err toward
restraint. An asset that's "almost there" can ship next round; an asset
that ships at "almost there" damages the brand permanently.
