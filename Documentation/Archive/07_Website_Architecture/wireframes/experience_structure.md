# SheetFlow AI — Experience Structure & Wireframes

---

## 01. The Full Page Structure

```
╔══════════════════════════════════════════════════════════════╗
║  NAVIGATION                                                   ║
║  [Logo]  Product  Solutions  Pricing  Docs    [Start Free]   ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    SECTION 1: HERO                           ║
║                    (100vh minimum)                           ║
║                                                              ║
║           [3D Intelligence Visualization]                    ║
║                     floating behind                          ║
║                                                              ║
║                    ┌───────────┐                             ║
║                    │  KICKER   │                             ║
║                    └───────────┘                             ║
║                                                              ║
║              THE HEADLINE LIVES HERE                         ║
║               In Large, Bold Type                            ║
║                                                              ║
║         The sub-headline explains in 1–2 lines,              ║
║          never more than 20 words. Centered here.            ║
║                                                              ║
║         [Start Free Trial]    [Watch it work →]              ║
║                                                              ║
║    Trusted by teams at:  [logo] [logo] [logo] [logo]         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                 SECTION 2: THE PROBLEM                       ║
║                   (80vh, centered text)                      ║
║                                                              ║
║              You've tried the tools.                         ║
║              You've hired the analysts.                      ║
║              The spreadsheets still don't work.              ║
║                                                              ║
║         [extended problem narrative copy]                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              SECTION 3: PRODUCT REVEAL                       ║
║               (150vh — scroll-linked)                        ║
║                                                              ║
║   ┌─────────────────────────────────────────────────────┐   ║
║   │                                                     │   ║
║   │   [ANIMATED PRODUCT DEMONSTRATION]                  │   ║
║   │   Before → Activation → After                       │   ║
║   │   Driven by scroll position                         │   ║
║   │                                                     │   ║
║   └─────────────────────────────────────────────────────┘   ║
║                                                              ║
║         Label evolves as scroll advances:                    ║
║         "Before" → "Activating..." → "Intelligence Active"  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║            SECTION 4: FEATURE ARCHITECTURE                   ║
║               (120vh — bento grid)                           ║
║                                                              ║
║   Section Header:                                            ║
║   "Everything your data needs to think for itself."          ║
║                                                              ║
║   ┌──────────────────────┬──────────────────────────────┐   ║
║   │                      │              │               │   ║
║   │   LARGE FEATURE      │  FEATURE B   │  FEATURE C   │   ║
║   │   CELL (animated)    │              │               │   ║
║   │                      │              │               │   ║
║   ├────────────┬─────────┴──────────────┴───────────────┤   ║
║   │ FEATURE D  │                                        │   ║
║   │            │         WIDE FEATURE E                 │   ║
║   │            │         (command palette demo)         │   ║
║   └────────────┴────────────────────────────────────────┘   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              SECTION 5: SOCIAL PROOF                         ║
║                   (80vh)                                     ║
║                                                              ║
║   ┌─────────────────────────────────────────────────────┐   ║
║   │  [Stat]  [Stat]  [Stat]  [Stat]                    │   ║
║   │  2,400+  18M+    94%     4.9★                      │   ║
║   │  Teams   Cells   Saved   Rating                    │   ║
║   └─────────────────────────────────────────────────────┘   ║
║                                                              ║
║   ┌──────────────────────────────────────────────────────┐  ║
║   │ "Quote from a real customer that demonstrates        │  ║
║   │  a specific, credible result they achieved."         │  ║
║   │                            — Name, Title, Company   │  ║
║   └──────────────────────────────────────────────────────┘  ║
║                                                              ║
║   Logo row: [Co1] [Co2] [Co3] [Co4] [Co5] [Co6]            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║               SECTION 6: FINAL CTA                          ║
║                   (80vh)                                     ║
║                                                              ║
║         [echoed background from hero]                        ║
║                                                              ║
║              "Start today."                                  ║
║         "See results this week."                             ║
║                                                              ║
║      [Start Free — No Credit Card Required]                  ║
║                                                              ║
║         Setup in 5 minutes. Cancel anytime.                  ║
║    Join 2,400+ teams already running smarter.                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  FOOTER                                                      ║
║  [Logo]  [Tagline]                                           ║
║  Product / Solutions / Pricing / Docs / Blog                 ║
║  Legal / Privacy / Terms                                     ║
║  © 2026 SheetFlow AI                                         ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 02. Component Wireframes

### Navigation Component
```
┌──────────────────────────────────────────────────────────────┐
│ [●] SheetFlow AI     Product ▾  Solutions ▾  Pricing  Docs  │
│                                                  [Log In] [Start Free ›]│
└──────────────────────────────────────────────────────────────┘
```

### Hero CTA Pair
```
┌─────────────────────────────┐     ┌──────────────────┐
│     Start Free Trial        │     │  Watch it work → │
└─────────────────────────────┘     └──────────────────┘
       Primary (filled)                Secondary (ghost)
```

### Feature Card — Collapsed
```
┌────────────────────────────────┐
│ ●  Feature Name                │
│                                │
│    Short description of the    │
│    capability in 1–2 lines.    │
│                                │
│    [animated preview or icon]  │
│                                │
└────────────────────────────────┘
```

### Feature Card — Hover/Expanded
```
┌────────────────────────────────┐ ← border glows
│ ●  Feature Name                │
│                                │
│    Short description of the    │
│    capability in 1–2 lines.    │
│                                │
│    [animated preview active]   │
│                                │
│ ─────────────────────────────  │ ← reveals
│ Additional detail and benefit  │
│ statement here.                │
│                                │
│ Learn more →                   │
└────────────────────────────────┘
  ↑ card lifted 4px, shadow deepened
```

### Testimonial Card
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  "The specific quote goes here — real words, real      │
│   result, specific enough to be credible."             │
│                                                        │
│  ┌────┐  Name Lastname                                 │
│  │ 👤 │  Title, Company Name                          │
│  └────┘                                                │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 03. Responsive Breakpoint Architecture

### Desktop (1280px+)
Full experience. All sections at full complexity. Parallax active.

### Laptop (1024px–1279px)
95% of desktop experience. Slightly reduced section spacing.

### Tablet (768px–1023px)
Bento grid → 2 columns. Side-by-side sections → stacked.
Particle count: 60% of desktop.

### Mobile (375px–767px)
Single column. All sections stacked. CTA full-width.
3D scene simplified but present. Horizontal scrolls removed.

### Small Mobile (<375px)
Everything still works. Typography scales down proportionally.
CTAs stack and size to fit screen.

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
