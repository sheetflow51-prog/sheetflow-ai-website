# RC2 — Before / After Screenshot Matrix

> **2026-08-09.** Two complete matrices, **70 images each, fully paired — every
> "after" frame has a same-named "before" frame at the same breakpoint.**
> Verified programmatically: 70 / 70 / 0 unpaired.

| | Directory | Build | Captured |
|---|---|---|---|
| **Before** | `10_Final_Website/release-preview-rc1/` | RC1 | 2026-08-08 |
| **After** | `10_Final_Website/release-preview/` | RC2, `BUILD_ID oKLd_Z0cXoHU1cK3_RdD1` | 2026-08-09 |

Both were produced by the same script,
[`scripts/capture-release-preview.mjs`](../10_Final_Website/scripts/capture-release-preview.mjs),
against a production server — so any difference between a pair is a change in
the site, not a change in how it was photographed.

**Freshness was verified before capture, not assumed.** `.next/BUILD_ID` was
matched against the served HTML first. RC1's first 66-image matrix was captured
from a stale `.next` and was caught only by reading a byte count off a
screenshot; that is why this step exists.

---

## How to read it

```
release-preview<-rc1>/<breakpoint>/<route>-<hero|full>.png
```

| Breakpoint | Device | Frames |
|---|---|---|
| `desktop` | 1440 × 900 | 20 — hero + full |
| `laptop` | 1280 × 800 | 10 — hero |
| `tablet` | iPad (gen 7) | 10 — hero |
| `large-mobile` | iPhone 15 Pro Max, 430 px | 10 — hero |
| `mobile` | Pixel 7, 412 px | 20 — hero + full |

Full-page shots only at the widest and narrowest widths: the homepage is
~11,850 CSS px tall at 1440 and ~15,000 on a phone, and capturing that at five
widths costs minutes to tell you what the two extremes already do.

Every capture pins the same three things, each learned from a capture that
lied: the page is scrolled end to end so IntersectionObserver reveals fire;
animations are finished through the Web Animations API *after* that scroll, not
merely frozen by CSS; and the custom cursor is hidden, because a screenshot has
no pointer and the synthetic one parks a ring in the middle of the copy.

---

## The frames that carry the change

Open these pairs first.

### 1 · `/work` — the finding this phase existed for

| | |
|---|---|
| **Files** | `desktop/portfolio-full.png`, `mobile/portfolio-full.png` |
| **Before** | Cards 6–10 are near-empty boxes: a label, ~150 px of nothing, three monospace file paths. The grid reads as five finished cards followed by five broken ones. |
| **After** | Each of those five draws its build's pipeline — icon nodes joined by connectors, terminal node in gold — above a one-line artifact summary. Visual weight now matches the five screenshot cards. |

### 2 · Internal case study — a page that had nothing to look at

| | |
|---|---|
| **Files** | `desktop/case-study-internal-hero.png`, `desktop/case-study-internal-full.png`, and the `mobile/` pair |
| **Before** | breadcrumb → kicker → headline → lede → mono meta → evidence ledger. No image, no diagram, no anchor. |
| **After** | A "System pipeline" panel sits above the ledger: large nodes, stage names, and each stage's first architecture node as a monospace sublabel. Plays a single 620 ms cascade on load and stops. |

### 3 · The architecture section — all ten case studies

| | |
|---|---|
| **Files** | `desktop/case-study-*-full.png` (all three kinds) |
| **Before** | Four glass cards. The only mark of sequence was a 16 px hairline, `hidden` below 1280 px. |
| **After** | A centred rail above the cards shows the whole pipeline at a glance. The section titled *"How the work moves through it"* now shows movement. |

### 4 · The closing CTA — eleven routes

| | |
|---|---|
| **Files** | `desktop/portfolio-full.png` (foot), `desktop/case-study-*-full.png` (foot) |
| **Before** | A headline, a paragraph and two controls on flat void — the least designed block on the page, and the last thing a visitor sees. |
| **After** | Contained in `.cta-panel`: aurora wash, signature top edge, 20 px glass radius. No new visual vocabulary — three things the design system already defined. |

### 5 · Client case study — the control

| | |
|---|---|
| **Files** | `desktop/case-study-client-hero.png` |
| **Before / After** | **Above the fold, unchanged.** Client pages still lead with the real 1280×800 deployment screenshot, because a photograph of a running site is stronger evidence than any diagram. Only the architecture rail and the CTA panel differ, further down. |

### 6 · The homepage — deliberately untouched

| | |
|---|---|
| **Files** | `desktop/homepage-full.png`, `mobile/homepage-full.png` |
| **Before / After** | **Expected to be identical apart from `.feature-card`'s 28 px → 20 px corner radius.** RC2 added nothing to the homepage: it scores 52 on mobile, its bottleneck is paint, and this was not the phase to touch it. A large diff here would be a defect, not an improvement. |

---

## Routes with no visual change expected

`services`, `service-whatsapp-automation`, `pricing`, `booking`,
`booking-confirmed` — five of the ten routes. RC2's changes are scoped to
`/work`, `/work/[slug]`, the shared `.feature-card` radius, and the
easing-constant refactor, which is behaviour-preserving by construction.

These frames are in the matrix as a **negative control**: they should look the
same, and a difference in them is a regression to investigate rather than a
feature to celebrate.

---

## Regenerating either side

```bash
# 1. Build, and confirm the server serves that build
npm run build && npm start
cat .next/BUILD_ID                      # must appear in the served HTML

# 2. Capture
node scripts/capture-release-preview.mjs                 # → release-preview/
SHOTS_DIR=release-preview-rc1 node scripts/capture-release-preview.mjs
```

Both directories are gitignored (`release-preview*/`, ~57 MB each). They are
regenerable review artifacts, not source. The screenshots that *are* committed
live in `public/work/` — those are published evidence, pinned deliberately so
what the site shows cannot drift when a third party changes their homepage.
