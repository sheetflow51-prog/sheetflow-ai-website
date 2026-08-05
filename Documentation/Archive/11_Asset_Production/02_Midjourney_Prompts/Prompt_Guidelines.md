# Prompt Guidelines

Rules every prompt in this library follows. If a prompt breaks one, it gets
rewritten — not "ehh, it looks good."

---

## The Five Rules

1. **One subject. One light. One mood.** Three or fewer concepts per prompt.
2. **Lead with composition, end with style.** "Wide shot of X, lit by Y, shot
   on ARRI" — not "ARRI shot of X."
3. **No banned words.** See README. They produce generic AI art.
4. **Specify what you don't want.** Use `--no` for the cliché traps.
5. **Always include the SheetFlow style suffix.** Consistency is the brand.

---

## Prompt anatomy

```
[shot type] of [subject], [environment], [light direction + temperature],
[material/texture], [atmosphere details],
[camera + lens], [color grade],
[SheetFlow style suffix]
--ar [ratio] --style raw --stylize 200 --v 6
--no neon, rgb, glow, holographic grids, lens flare
```

---

## Stylize, Chaos, Weird

| Parameter   | SheetFlow default | Notes                                   |
|-------------|-------------------|-----------------------------------------|
| `--stylize` | 200               | 100–300 range. Below 100 = literal.     |
| `--chaos`   | omit (= 0)        | 5–15 only when exploring variations.    |
| `--weird`   | omit              | Avoid. Goes off-brand fast.             |
| `--style`   | raw               | Default. Removes Midjourney house style.|
| `--v`       | 6 (or latest)     | Always latest stable, never beta.       |

---

## Aspect ratios used

| Use                    | Ratio   |
|------------------------|---------|
| Hero / desktop         | 16:9    |
| OG image               | 1.91:1  |
| Poster (vertical)      | 2:3     |
| Reel / story           | 9:16    |
| Square social          | 1:1     |
| Portrait social        | 4:5     |

---

## Versioning a prompt

When a prompt ships an asset, log it:

```
### hero-core-v3
prompt: [exact string]
seed:   1739280472
best:   _archive/midjourney/abc123.png
ar:     16:9
note:   v2 had too much haze; reduced atmosphere noun count, sharper subject
```

Keep variants. Delete nothing — the failed prompts teach the most.

---

## Iteration discipline

- 4 generations per prompt. If none hit, the prompt is wrong, not the model.
- Change ONE variable per iteration. Otherwise you can't learn.
- Save the best raw + best upscale. Discard 2 lowest. Move on.
- If you've done 12 generations on one concept, stop. Walk. Come back tomorrow.

---

## When in doubt

Ask: would this image fit on apple.com? If no, it's not done.
