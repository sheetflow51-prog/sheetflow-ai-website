# SheetFlow AI — Typography System

---

## 01. Typography Philosophy

Typography is not decoration. Typography is voice made visible.

SheetFlow AI's typography communicates before a single word is read.
The shapes, the weight, the spacing — they all signal:
*precision, intelligence, depth, and restraint.*

Our typographic system is built on two tensions held in balance:
- **Geometric precision** ↔ **Human warmth**
- **Bold authority** ↔ **Quiet elegance**

The result: typography that feels engineered but alive.

---

## 02. Primary Typeface: Display / Headline

### Recommended: **Söhne** (Klim Type Foundry)
*The premium choice. Used by Linear, Figma, and leading tech brands.*

**Why Söhne**:
- Rooted in Akzidenz-Grotesk — the most authoritative grotesque
- Has the geometric precision of Helvetica with more character and warmth
- Performs exceptionally at large display sizes
- Carries institutional weight without feeling corporate
- Optical corrections make it feel custom even at massive scale

**Alternative (Free/Available)**: **Inter**
- Designed by Rasmus Andersson specifically for interfaces
- Excellent screen rendering at all sizes
- Widely supported — feels familiar but premium when used with restraint

**Alternative (Distinctive)**: **General Sans** (Pangram Pangram)
- Modern grotesque with subtle geometric character
- Slightly more distinctive than Inter
- Free for commercial use

### Usage Guidelines for Display Typeface

```
Headline sizes:    96px – 120px (desktop hero)
                   64px – 80px  (section headers)
                   48px – 56px  (feature titles)

Weight:            700–800 for primary headlines
                   300–400 for subheadlines (contrast weight)

Letter-spacing:    -0.03em to -0.05em (tight, premium)
Line-height:       0.9 – 1.0 for large display
                   1.1 – 1.2 for medium headers

Color:             #FFFFFF primary
                   #A0A0A0 secondary / descriptive
                   Gradient: linear from #FFFFFF to rgba(255,255,255,0.4)
```

---

## 03. Secondary Typeface: Body / UI

### Recommended: **Inter** (or match with Söhne Text)

**Why Inter for Body**:
- Optimized for screen rendering at 12px–18px
- Neutrally designed — supports the content without competing
- Consistent baseline grid behavior
- Perfect for data, tables, labels, and interface elements

### Usage Guidelines for Body Typeface

```
Body sizes:        16px – 18px (primary reading)
                   14px – 15px (secondary / UI labels)
                   12px – 13px (micro / captions)

Weight:            400 for body text
                   500 for emphasis
                   600 for UI labels and data points

Letter-spacing:    0 to +0.01em for body
                   +0.08em to +0.12em for labels (all-caps context)
Line-height:       1.6 – 1.75 for body paragraphs
                   1.4 for UI and compact contexts
```

---

## 04. Accent Typeface: Code / Data

### Recommended: **JetBrains Mono** or **Berkeley Mono**

**For code samples, data values, terminal aesthetics**:
- Monospaced for data integrity feeling
- JetBrains Mono has beautiful ligatures and high readability
- Berkeley Mono is premium — has a slightly warmer character

```
Code / data sizes: 13px – 15px
Weight:            400 regular
Letter-spacing:    0
Line-height:       1.6
Color:             Neon accent (see color system)
                   or #E0E0E0 on dark backgrounds
```

---

## 05. Apple-Inspired Typography Principles

Apple's typography success is built on:

**1. Extreme Size Contrast**
The hero headline is massive. The subtext is small.
The jump creates visual hierarchy that feels intentional and confident.

Application for SheetFlow AI:
```
Hero headline:  96px – 120px, weight 700
Hero sub:       18px – 22px,  weight 400
Ratio:          ~5:1 to 6:1
```

**2. Weight Contrast**
Pair ultra-light with ultra-bold within the same typeface.
This creates rhythm and visual sophistication without changing fonts.

```
"The operating system   ← weight 300, opacity 0.6
 your data deserves."   ← weight 700, opacity 1.0
```

**3. Centered Hierarchy**
Large display text centered, max-width constrained.
Creates monumental, cinematic presence.

**4. Optical Margin Alignment**
Large type hanging slightly outside the grid — feels more natural.

---

## 06. Linear-Inspired Typography Principles

Linear's typography signals:
- Precision engineering
- Developer respect
- Intentional density

**Key Learnings**:
1. **Small, confident UI type** — every label feels intentional
2. **Generous white space around type** — isolation = importance
3. **Functional beauty** — no decorative type, every element serves a purpose
4. **Monospaced accents** for data/code contexts

---

## 07. Headline Hierarchy System

### The Seven Levels

```
H1 — The Monument
Size: 96px–120px | Weight: 700–800 | ls: -0.04em | lh: 0.9
Use: Single hero statement per page maximum
Example: "Your data, finally alive."

H2 — The Declaration  
Size: 56px–72px | Weight: 700 | ls: -0.03em | lh: 0.95
Use: Section openers, major feature statements
Example: "Intelligence built into the foundation."

H3 — The Statement
Size: 40px–48px | Weight: 600 | ls: -0.02em | lh: 1.0
Use: Feature group titles, sub-section headers
Example: "Autonomous monitoring. Zero configuration."

H4 — The Signal
Size: 28px–32px | Weight: 600 | ls: -0.01em | lh: 1.1
Use: Card titles, feature labels, callout headers
Example: "Live Pipeline Intelligence"

H5 — The Label
Size: 18px–22px | Weight: 500 | ls: 0 | lh: 1.2
Use: Sub-labels, section navigation, descriptors
Example: "For data-driven operators"

H6 — The Whisper
Size: 11px–13px | Weight: 500 | ls: +0.1em | lh: 1.4
Use: Category labels, kickers (ALL CAPS), micro-headers
Example: "WORKFLOW INTELLIGENCE"

Body — The Current
Size: 16px–18px | Weight: 400 | ls: 0 | lh: 1.7
Use: Paragraph copy, explanatory text
```

---

## 08. Spacing Philosophy

### The Spatial System

Typography doesn't exist in isolation — it breathes inside space.

**The Golden Ratio Spacing System**
Base unit: `8px`
Scale: 8, 16, 24, 40, 64, 104, 168

**Between headline and body**: 24px–40px
**Between sections**: 120px–200px (generous; creates cinematic breathing room)
**Between card title and description**: 12px–16px

### The Isolation Principle
Important elements deserve isolation.
A headline surrounded by space feels more powerful than a headline surrounded by other elements.

Apply: Give the hero headline 200px+ of space above and below before other content intrudes.

### Vertical Rhythm
All type sits on a baseline grid of 8px.
Line heights are always multiples of 8px.
This creates the invisible harmony that makes the page feel "right."

---

## 09. Gradient Typography Technique

### The Fade Effect (Premium Signal)
Headlines that fade from white to semi-transparent read as depth — like text receding into the interface.

```css
/* Gradient headline technique */
.gradient-headline {
  background: linear-gradient(
    180deg,
    #FFFFFF 0%,
    rgba(255, 255, 255, 0.4) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### When to Use
- Secondary lines of the hero headline
- Large decorative type that serves as background texture
- Sub-headlines that should feel subordinate without disappearing

---

## 10. Futuristic Typography Techniques

### Glitch Text (Used Sparingly)
Brief, controlled glitch animations on key terms reinforce the AI/tech aesthetic.
Never on body copy. Only on a single, meaningful word in context.

### Data-Stream Characters
Monospaced code style for numbers, metrics, data points.
Reinforces the technical intelligence of the platform.

### Masked / Revealed Text
Type that appears to be "loading" or being decoded on first view.
Creates the feeling of intelligence being computed in real-time.

### Light Bleed on Text
Subtle glow / bloom effect on key headline words using text-shadow.
Especially effective on neon accent-colored key terms.

```css
/* Subtle headline glow */
.glow-text {
  text-shadow: 
    0 0 40px rgba(99, 102, 241, 0.3),
    0 0 80px rgba(99, 102, 241, 0.1);
}
```

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
