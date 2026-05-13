# Typography Experiments

> Trials, observations, and rejections on the type system.

---

## Active experiments

### The headline gradient fade
- **What**: `linear-gradient(180deg, #FFF 0%, rgba(255,255,255,0.55) 100%)` clipped to text.
- **Why**: Pure white headlines on dark feel "stamped"; the fade introduces depth and recession.
- **Settings tried**:
  - Stop at 40% white → too dim, headline loses presence
  - Stop at 70% white → fade is barely visible, looks like a bug
  - **Stop at 55% white → goldilocks** ✓
- **Status**: Adopted as `.text-fade` utility.

### The accent gradient (indigo → violet → cyan)
- **What**: `linear-gradient(135deg, #818CF8 0%, #A78BFA 50%, #06B6D4 100%)` for emphasis spans.
- **Why**: One-color brand emphasis (just indigo) reads as a button color, not a phrase. Three-stop gradient reads as "intelligence."
- **Trial 1**: 90deg gradient — too horizontal-marquee-feel. Rejected.
- **Trial 2**: 135deg with cyan ending → adopted. The cyan stop is the "intelligence" tell.
- **Status**: Adopted as `.text-accent-gradient`.

### Headline scale — the cinematic test
- **Test**: Render headline at 64px / 96px / 128px on a 1440px desktop viewport.
- **64px**: feels like a normal SaaS headline. Rejected — competitive parity.
- **96px**: feels confident, but ordinary at award level.
- **128px (capped via `clamp(64px, 9vw, 128px)`)**: monumental. Reads as a brand statement, not a section title. ✓
- **Status**: Adopted in `tailwind.config.ts` as `text-monument`.

### Letter-spacing at scale
- **Observation**: At 96px+, default letter-spacing reads loose. -0.04em is tight enough to feel unified without becoming cramped.
- **Apple parallel**: Apple's iPhone hero uses ~-0.05em at hero scale.
- **Status**: Adopted (`letter-spacing: -0.04em` on `.headline-monument`).

### Line-height at scale
- **96px headline at line-height 1.0**: text crowds itself if it wraps. Painful descenders.
- **96px at 1.1**: too airy.
- **96px at 0.95**: tight, monumental, headers stack like architecture. ✓ — used for monument scale only.
- **Section headlines (clamp 36→64) keep 1.0** because they rarely wrap in production layouts.

---

## Anti-patterns rejected

- **All-caps display headlines** → feels like a 2010s startup. Rejected.
- **Italic display headlines** → reads as luxury / fashion, not intelligence. Rejected.
- **Variable-weight oscillation** ("intelligence at 200, layer at 800") → cute on Awwwards, fragile in production with web font swapping. Rejected.
- **Mixed serif + sans display** → gravitas-by-pastiche. Rejected. Sans throughout, weight-driven hierarchy.

---

## Vocabulary

| Token | Use |
|---|---|
| `text-monument` | Hero only. One per page. |
| `text-cinematic` | Final CTA, big section headers in narrative arc. |
| `text-headline` | Standard section headlines (most sections). |
| `text-subhead` | Card titles, large body emphasis. |
| `text-kicker` | All section eyebrow labels. Always uppercase, 11px, +0.12em. |

---

*Reference system: `/01_Brand_Research/typography/typography_system.md`*
