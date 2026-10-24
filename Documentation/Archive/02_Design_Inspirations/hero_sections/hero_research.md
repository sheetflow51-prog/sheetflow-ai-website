# SheetFlow AI — Hero Section Research

---

## 01. The Purpose of a Hero Section

The hero section has one job: **earn the next 5 seconds**.

It is not a summary. It is not a pitch.
It is an opening statement that makes the visitor lean forward.

A world-class hero achieves five things simultaneously:
1. **Immediate identification** — "This is for me / not for me" in <1 second
2. **Intrigue** — Raises a question the visitor wants answered
3. **Premium signal** — Communicates brand quality before any words are read
4. **Promise** — Implies transformation without stating features
5. **Invitation** — Creates a pull toward engagement

---

## 02. Hero Anatomy — The Six Layers

### Layer 1: The Background Environment
The world the hero exists within.
This is the atmospheric layer — gradients, 3D, particles, or video.
It sets the emotional temperature of the entire brand.

**Options by Impact Level**:
- Gradient mesh (accessible, elegant, fast)
- Particle system (alive, technical, interactive)
- 3D scene via Spline/Three.js (maximum impact, requires performance management)
- Video loop (cinematic, but file size risk)

**SheetFlow AI Direction**:
A deep dark background (#0A0B0F) with a large, soft radial gradient in the primary accent color positioned above-center.
A particle field suggests a data network — thousands of nodes connected by fine lines.
The particles respond gently to mouse movement.

### Layer 2: The Navigation
Minimal. Transparent. Fixed.
Logo left, navigation right, CTA right-most.
Blurs the background on scroll (backdrop-filter: blur).

### Layer 3: The Pre-Headline (Kicker)
A small, all-caps label above the main headline.
Sets category context. Signals trust.
```
INTRODUCING SHEETFLOW AI 2.0
or
TRUSTED BY 2,400+ DATA TEAMS
or
THE AI OPERATING SYSTEM FOR DATA WORK
```

### Layer 4: The Headline
The most important element on the page.
Large, bold, centered, restrained.
Maximum 8 words. Ideally 4–6.

**SheetFlow AI Hero Headlines (Options)**:

*Option A — Mystery + Promise*
> "Your Data,
> Finally Alive."

*Option B — Category Declaration*
> "The Intelligence Layer
> Your Spreadsheets Deserve."

*Option C — Post-Era Framing*
> "Beyond Spreadsheets.
> Beyond Automation.
> Beyond."

*Option D — Consequence-First*
> "Every morning, your operation
> has already made its decisions."

*Option E — The Revelation*
> "Your spreadsheets were waiting
> for a brain.
> Now they have one."

### Layer 5: The Sub-Headline
Explains the headline in 1–2 sentences.
Functional, precise, still elevated.
Maximum 20 words.

> "SheetFlow AI transforms your spreadsheet infrastructure into an autonomous intelligence system — watching, thinking, acting without being asked."

### Layer 6: The CTA Pair
Primary CTA: Action-oriented, high contrast
Secondary CTA: Contextual, link-style

```
[Start Free Trial]     [Watch it work →]
```

---

## 03. Hero Typographic Architecture

### The Scale Relationship

```
Kicker:        12px, weight 500, tracking +0.12em, opacity 0.5
Headline:      80px – 120px, weight 700–800, tracking -0.04em, lh 0.9
Sub-headline:  18px – 22px, weight 400, tracking 0, lh 1.6, opacity 0.7
CTA Primary:   15px – 16px, weight 600, tracking +0.01em
CTA Secondary: 15px – 16px, weight 400, tracking 0, opacity 0.7
```

### The Reveal Sequence
The hero doesn't appear all at once. It unfolds:

```
0ms:    Background renders (gradient/particles)
200ms:  Kicker fades up
400ms:  First line of headline translates up + fades in
600ms:  Second line of headline translates up + fades in
800ms:  Sub-headline fades in
1000ms: CTA buttons fade in + slight upward translate
1400ms: Social proof / badge row fades in
```

---

## 04. Hero Visual Patterns by Reference Brand

### Apple Hero Pattern
**Structure**: Full-viewport image/video, centered type, minimal UI
**Motion**: The subject enters screen as user arrives (product in motion)
**Type**: White on photographic/cinematic background
**CTA**: Two links — no buttons
**Emotional Effect**: Aspiration, beauty, desire

**SheetFlow AI Application**:
Use this structure for the product reveal moment — not the primary hero, but the "meet the product" section below it.

### Stripe Hero Pattern
**Structure**: Left-weighted content, gradient blob background, floating UI elements
**Motion**: Gradient shifts as user scrolls; UI elements float at different speeds
**Type**: Very large headline, small sub
**CTA**: Buttons with strong visual distinction
**Emotional Effect**: Confidence, scale, infrastructure

**SheetFlow AI Application**:
Borrow the "floating product UI" motif — product screenshots that float at different z-depths above the background.

### Linear Hero Pattern
**Structure**: Centered, text-dominant, dark
**Motion**: Signature scroll that moves through product UI
**Type**: Giant centered headline, minimal sub-text
**CTA**: Simple pair, understated
**Emotional Effect**: Sophistication, precision, seriousness

**SheetFlow AI Application**:
Match the centered confidence. Resist adding too many elements. The headline IS the hero.

### Vercel Hero Pattern
**Structure**: Full-viewport dark, globe visualization front-and-center
**Motion**: Globe rotates continuously, responds to mouse
**Type**: Headline frames the visualization
**CTA**: Understated — the visualization sells
**Emotional Effect**: Scale, infrastructure, awe

**SheetFlow AI Application**:
Replace the globe with a 3D data network visualization. The nodes are spreadsheet data points; the connections are SheetFlow AI intelligence. Mouse interaction rotates the scene.

---

## 05. Hero Animation Deep Dive

### The "Magnetic" Headline Effect
Large headline text that tilts very slightly (1–3 degrees) toward the mouse position.
Creates the feeling that the interface is aware of the visitor.

```js
// Magnetic headline implementation concept
document.addEventListener('mousemove', (e) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const rx = (e.clientY - cy) / cy * -2; // -2deg to +2deg
  const ry = (e.clientX - cx) / cx * 2;
  headline.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
});
```

### The Particle Data Network
A canvas-based particle system representing a live data network:
- 200–400 particles (nodes) on desktop
- Each particle represents a data point
- Connections draw between nearby particles (threshold: ~120px)
- New connections form and dissolve — suggesting live data flow
- Primary accent color for particles; dimmer lines for connections
- Mouse proximity creates a localized "attraction field"

### The Scanning Line Effect
A horizontal scan line slowly traverses the hero section from top to bottom.
Like a radar sweep — communicates that intelligence is continuously monitoring.
Repeat cycle: every 8–12 seconds.
Color: accent with low opacity (0.3–0.5).

### Text Scramble / Decode Effect
On page load, headline characters briefly display random characters before "resolving" to the correct text.
Communicates: the AI is computing. The answer is being found.

---

## 06. Social Proof Integration in Hero

### The Trust Bar
A row of 5–8 company logos, desaturated, below the CTA:
```
"Used by teams at:"
[Logo] [Logo] [Logo] [Logo] [Logo]
```

### The Live Counter
A real-time or animated counter that reinforces scale:
```
"Monitoring 1,247,832 spreadsheet cells right now"
```

### The Quote Pull
A single testimonial quote with attribution, very small, as the final hero element:
```
"SheetFlow AI is the first data tool that actually thinks."
— Head of Operations, [Company]
```

---

## 07. Mobile Hero Considerations

Mobile heroes must sacrifice less than you think.
The headline can be nearly as large proportionally.
The background 3D/particle effect should be simplified (lower particle count, no complex interactions).
The sub-headline may need to shorten.
CTA stack vertically.
Social proof compresses into a count + avatar strip.

```
Mobile hero hierarchy:
- Kicker label (centered)
- 3-line headline (56px–64px, centered)
- 2-line sub-headline (16px)
- Full-width CTA button
- Link CTA below
- Trust badges (icon strip)
```

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
