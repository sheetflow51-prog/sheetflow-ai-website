# Premium Spacing

> Whitespace is the most expensive resource in design. This is how we spend it.

---

## The premium spacing principle

> Cheap design fills the canvas. Premium design defends it.

Every section on this site has more empty space than content. That's the rule.

---

## The scale we use

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
--space-32: 128px
--space-40: 160px
--space-48: 192px
--space-64: 256px
```

Notice: the scale doubles in the lower range (8 → 16 → 32) but accelerates in the upper range (32 → 64 → 128 → 256). The big numbers are exponential; the small numbers are linear.

**Why**: At small scale, ~8px increments read as deliberate. At large scale, only ~doubling reads as "intentional whitespace" rather than "padding accident."

---

## How we use the scale (rules of thumb)

| Pairing | Value | Use |
|---|---|---|
| Inline siblings | 8-16px | Inside a button, between icon + text |
| Adjacent stacked elements | 16-24px | Between a label and its input |
| Card content blocks | 24-32px | Inside a card, between sections of content |
| Card-to-card gap | 12-24px | Bento grid spacing (we use 12px) |
| Section internal padding | 80-160px (vertical) | The space *inside* a `.section` |
| Section-to-section | (handled by `.section` padding) | Avoid additional gap; let section padding compose |
| Hero top offset | 128-160px | Below nav |

---

## The "monumental headline" rule

A hero headline gets at least **2× its line-height** in vertical breathing room, on every side.

If the headline is 96px tall, it gets ≥192px above and below before any other content competes.

This is the difference between "an h1" and "a monument."

---

## Things we don't do

- **Inconsistent gaps** — never use a value not in the scale (e.g. 18px). It looks like an accident.
- **Dense card grids** — gap-2 (8px) feels stuffed; gap-3 (12px) is our floor.
- **Hero crammed against nav** — even on mobile, hero starts ≥96px from the top of the visible area.
- **Trailing whitespace dumps** — section ends with 0 visible content for 80px. The eye reads "the page is broken." Always end a section with the section ending, not with whitespace.

---

## What we did differently from the design system docs

The intelligence doc (`02_Design_Inspirations/layouts/layout_psychology.md`) recommends the 60/30/10 dark interface rule (60% void, 30% mid surface, 10% bright signal).

In practice we found:
- **Hero** runs closer to 80% void (heavier emptiness) — appropriate for monumental impression
- **Sections with cards** run closer to 50% surface (cards take space)
- **Final CTA** runs closer to 75% void — to recreate the hero's gravity at the end of the page

The 60/30/10 is a *target average* across the page, not a per-section quota.

---

## Production audit

Run this checklist on any new section:

- [ ] Does the section have ≥80px top + bottom padding?
- [ ] Does the headline have ≥40px space between it and the next thing?
- [ ] Are all gaps multiples of 4 (always) and ideally on the scale tokens?
- [ ] If there are cards, is the card-card gap ≥12px?
- [ ] Is there a quiet zone (paragraph, single CTA, or pure whitespace) before the next section?

If any answer is no, the section is not yet shippable.

---

*Production tokens: `tailwind.config.ts → spacing` extension; CSS variables in `globals.css`.*
