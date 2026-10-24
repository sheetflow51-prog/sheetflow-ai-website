# SheetFlow AI — User Journey & UX Flow

---

## 01. The Visitor Psychology Map

### Who Arrives and What State They're In

**The Frustrated Operator** (40% of traffic)
Came from: Google search for "automate spreadsheet workflows" or "spreadsheet AI"
Mental state: Low-grade frustration with their current tools; hopeful but skeptical
Need: To feel understood before being sold to
Decision speed: Medium (3–7 days) — needs to see it working

**The Curious Explorer** (30% of traffic)
Came from: Twitter/X, newsletter, a colleague's recommendation
Mental state: Open, not urgent — exploring what's possible
Need: To be impressed, to have their imagination expanded
Decision speed: Slow (weeks) — they'll share before they buy

**The Active Buyer** (20% of traffic)
Came from: A direct search, a competitor comparison
Mental state: Evaluating options — has budget, has need, has urgency
Need: To justify the decision. Features, pricing, proof.
Decision speed: Fast (same day) — in decision mode

**The Returning Visitor** (10% of traffic)
Came back to: Convert, compare pricing again, or try the product
Mental state: Already convinced; needs a smooth path to action
Decision speed: Immediate — waiting is a failure of the UX

---

## 02. The Emotional Progression Architecture

### The Ideal Journey State Sequence

```
ARRIVAL STATE          TARGET STATE           HOW WE GET THERE
─────────────────────────────────────────────────────────────────
Skeptical              Intrigued              Hero headline + visual
  ↓
Intrigued              Identified             Problem section
  ↓
Identified             Curious                Product reveal
  ↓
Curious                Excited                Feature architecture
  ↓
Excited                Trusting               Social proof
  ↓
Trusting               Convicted              Impact / transformation section
  ↓
Convicted              Ready                  CTA section
  ↓
Ready                  Signed Up              Frictionless registration
```

---

## 03. Time-on-Page Benchmarks

For each section, we target specific engagement:

| Section | Target Time | What Success Looks Like |
|---|---|---|
| Hero | 8–15 seconds | They scroll rather than bounce |
| Problem | 15–25 seconds | Scroll slows (reading) |
| Product Reveal | 20–40 seconds | Scroll slows significantly; repeat views |
| Feature Arch | 30–60 seconds | Card hover interactions |
| Social Proof | 10–20 seconds | Logo recognition + quote reading |
| CTA | 5–15 seconds | Convert or bounce (clear signal) |

---

## 04. Entry Point UX Design

### Navigation Structure
The navigation communicates hierarchy and intent at a glance:

```
[Logo]    Product   Solutions   Pricing   Docs   Blog    [Start Free] [Log In]
```

**Mobile Navigation**:
```
[Logo]                                              [≡]
```

Opens to full-screen overlay with generous spacing and clear hierarchy.

### Navigation Behavior
- Transparent at top of page
- Blurs background (backdrop-filter) after 50px scroll
- Shadow appears after 100px
- "Log In" becomes less prominent; "Start Free" remains prominent

---

## 05. The Conversion Flow

### Path A: Direct Conversion (The Active Buyer)
```
Hero → CTA click → Signup page → Product
Total path length: 2 clicks
```

### Path B: Nurture then Convert (The Frustrated Operator)
```
Hero → Scroll → Problem Recognition → Product Demo → Features → Social Proof → CTA → Signup
Total path length: ~8 minutes, 1 click to convert
```

### Path C: Explorer to Evangelist
```
Hero → Deep scroll → Features → Blog → Leave → Return (referral) → Convert
Total path length: Multiple sessions over days
```

### The No-Dead-End Principle
Every section has a clear "next action" — even if it's just "keep scrolling."
There is no point in the page where the visitor feels stranded.

---

## 06. Interaction Map — Section by Section

### Hero Section Interactions
```
Mouse Move → Background particle field responds
Scroll Down → Hero content fades, next section reveals
Click "Start Free Trial" → Transition to signup (veil animation)
Click "Watch it work" → Modal opens with demo video (or inline demo)
Hover CTAs → Magnetic button effect
```

### Feature Cards Interactions
```
Hover → Card tilts (3D), reveals additional detail
Click → Expands card OR navigates to feature deep-dive page
Scroll through bento grid → Staggered reveal animations
```

### Social Proof Interactions
```
Hover logo → Company name appears
Click testimonial → Expands to full case study excerpt
Counter stats → Count up on viewport entry
```

---

## 07. Accessibility UX Standards

### Keyboard Navigation
Every interactive element reachable by Tab key.
Focus order: logical, left-to-right, top-to-bottom.
Skip-to-main-content link as first element.

### Screen Reader Experience
All images have meaningful alt text.
Animation content doesn't convey critical information (not reliant on motion).
Form labels always associated with inputs.

### Low-Vision Support
All text meets WCAG AA contrast (4.5:1 for body, 3:1 for large text).
Text never embedded in images.
Zoom to 200% doesn't break layout.

---

## 08. Mobile UX Architecture

### Mobile-First Considerations
40% of SheetFlow AI visitors will be on mobile.
The mobile experience must be complete — not a simplified desktop.

**Mobile Hero**:
- Single-column, centered
- 3D scene simplified (lower particle count, no tilt interaction)
- Headline breaks at natural rhythm points
- CTAs full-width, stacked vertically

**Mobile Navigation**:
- Hamburger menu → Full-screen overlay
- Large touch targets (48px minimum)
- Close button prominent and accessible

**Mobile Scroll**:
- Horizontal scrolls replaced by vertical scrolls
- Bento grids become single-column stacks
- All animations respect `prefers-reduced-motion`

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
