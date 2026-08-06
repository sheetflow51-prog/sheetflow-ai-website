# DEC-302 — Brand Asset Hierarchy

**Status:** Adopted · **Date:** 2026-08-06 · **Scope:** All brand assets
**Extends:** [DEC-301 — Logo Canon](./DEC-301_LOGO_CANON.md)

---

## Decision

1. `10_Final_Website/public/logo.png` is the **only** canonical artwork.
2. Every raster asset — favicon, Apple icon, OpenGraph, social avatar, manifest
   icons — **must be derived directly from** `public/logo.png`.
3. SVG assets are **engineering approximations for scalability only**.
4. The website, metadata, and exported raster assets **must never** replace the
   canonical PNG with a reconstructed SVG.
5. Any future logo update **starts by replacing** `public/logo.png`, after which
   the asset generator regenerates every derivative automatically.

---

## Compliance

Audited at adoption. Clauses 1–4 were already satisfied by the DEC-301 work;
clause 5 was not, and required a change.

### Clauses 1–4 — verified

| Check | Result |
|---|---|
| Any brand SVG referenced from `src/` | none |
| Any SVG→raster path in the generator | none |
| Raster source | `sharp(SOURCE)` where `SOURCE` is `public/logo.png`, exclusively |

Every shipped bitmap is a crop and resample of the canonical PNG:

```
lockup crop  full badge, sphere and wordmark   -> apple-icon 180, icon-192,
                                                  lockup-256/512, maskable-512,
                                                  avatars 400/800/1024
icon crop    sphere only, stopping above type  -> favicon 16/32/48,
                                                  app/icon.png, icon-64/96,
                                                  the OpenGraph mark
```

There is deliberately **no vector favicon**: browsers prefer an SVG icon when
one is offered, which would put an approximation in the most visible slot.

### Clause 5 — required a change

The generator previously carried the bounds of *this specific* render as
hard-coded constants:

```js
const M = {
  badge: { left: 2, top: 1, size: 242 },
  sphere: { cx: 115.5, cy: 94.0, d: 120.5 },
  wordmarkTop: 153,
};
```

Under those, replacing `logo.png` would **not** have regenerated correct
derivatives. A new master with different dimensions or composition would have
been cropped against stale numbers — producing silently wrong assets, or
crashing on an out-of-bounds extract. Clause 5 would have been false in
practice while appearing true in the docs.

The generator now **measures the PNG on every run**, classifying its pixels:

| Feature | How it is found |
|---|---|
| Background | modal corner colour, or alpha < 24 |
| Badge | every pixel that is not background |
| Sphere | saturated pixels — `max−min > 45` and `max > 90` |
| Wordmark | first row below the sphere with a near-white run ≥ 5% of badge width — high enough that the sparkle field cannot trip it |

Auto-measurement reproduces the hand-measured geometry:

```
badge        d=242 at (122.5, 122.0)      hand-measured: identical
wordmark top y=153                        hand-measured: identical
icon crop    r=58                          hand-measured: identical
sphere       d=123.5 at (117.0, 93.5)     hand-measured: 120.5 at (115.5, 94.0)
```

The 1.5px sphere delta comes from a slightly broader saturation threshold
catching more of the outer glow. It shifts the icon crop by one pixel and the
vector's sphere ratio by 2.5%. The lockup crops are byte-identical.

### Failing loudly

A measurement the classifier cannot trust aborts the build rather than emitting
a broken asset set. Verified against synthetic masters:

| Master | Result |
|---|---|
| Non-square badge (300×200 ellipse) | `badge is not square` — build aborts, nothing written |
| Mark occupying 30% of canvas | `badge occupies less than half the canvas` — aborts |
| Valid badge, **no wordmark** (300×300) | Succeeds. `wordmark top: none detected`, icon radius taken from the sphere's own extent |

The last case matters: clause 5 permits a future master with no wordmark, and
the generator handles it without modification.

---

## Replacing the logo

1. Drop the new artwork at `10_Final_Website/public/logo.png`.
2. Run `npm run brand`.
3. Read the measurement block it prints and confirm the numbers look right.
4. Commit the regenerated assets.

No other file needs editing. If the generator aborts, its message names the
failed check — **update the classifier in `measure()` to match the new
composition; do not hand-write the numbers back in.** Hard-coded constants are
precisely what clause 5 forbids.

---

## Consequences

- `public/logo.png` may not be deleted or moved. It is the master.
- Assets under `public/brand/` are build output. Editing them by hand is a
  violation; the next run overwrites the edit.
- Adding a raster consumer means adding a crop of the canonical PNG to the
  generator, never referencing an SVG.
- The vector masters remain for print, embroidery, monochrome and large-format —
  the cases raster genuinely cannot serve.

---

## Open

Carried from DEC-301: the vector reconstruction is a faithful but inexact
approximation. Flat vector cannot reproduce a 3D render's ribbon interleaving,
specular falloff or depth. Pixel-accurate vector would need a professional trace
of `logo.png` or the original 3D source — not further parametric refinement.

Nothing on the website depends on it, so this is not urgent. It becomes urgent
the first time large-format print is required.
