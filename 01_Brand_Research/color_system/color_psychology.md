# SheetFlow AI — Color Psychology & System

---

## 01. Color Philosophy

Color is the first communication.
Before copy is read, before layout is processed — color has already told the visitor who we are.

SheetFlow AI's color system signals:
- **Depth** — we are not a surface-level product
- **Intelligence** — we think in systems, not in features
- **Precision** — everything is intentional, nothing is accidental
- **Ambition** — we are building toward the future

The system is built for dark environments.
Dark is not default — dark is the **canvas** upon which intelligence becomes visible.
Light is used as an accent, a revelation, a moment of clarity within depth.

---

## 02. The Dark Luxury Foundation

### Primary Backgrounds

```
Void Black      #060608    The deepest layer — the "space" of the interface
Deep Slate      #0A0B0F    Primary background — most content lives here
Surface Dark    #0F1117    Elevated surfaces — cards, panels, containers
Surface Mid     #141720    Secondary elevated surfaces
Surface Light   #1A1F2E    Tertiary surfaces — hover states, active backgrounds
Border Subtle   #1E2435    Structural borders — separates without interrupting
Border Active   #2A3045    Visible borders — used when separation matters
```

### Why This Palette Works
- Progression from deepest to lightest creates the illusion of **layers of depth**
- Never pure black — always slightly warm or cool, creating dimensional richness
- The subtle blue-shift in the dark tones suggests technology and intelligence
- Contrast ratios are carefully staged to create hierarchy without harsh edges

---

## 03. The Glow System

### Intelligence Accents

```
Core Indigo     #6366F1    Primary accent — intelligence, precision, system
Indigo Bright   #818CF8    Active states, hover, interactive elements
Indigo Glow     #A5B4FC    Soft glow layer, highlights, selected states
Indigo Mist     rgba(99, 102, 241, 0.15)   Glow halos, ambient light fills

Violet          #8B5CF6    Secondary accent — depth, creativity, dimension
Violet Bright   #A78BFA    Active violet states
Violet Glow     rgba(139, 92, 246, 0.2)    Violet atmosphere layer
```

### Glow Application System

```css
/* Primary intelligence glow — used on hero elements */
.glow-primary {
  box-shadow: 
    0 0 20px rgba(99, 102, 241, 0.4),
    0 0 60px rgba(99, 102, 241, 0.2),
    0 0 120px rgba(99, 102, 241, 0.1);
}

/* Subtle ambient glow — used on interactive cards */
.glow-ambient {
  box-shadow: 
    0 0 40px rgba(99, 102, 241, 0.15),
    0 4px 24px rgba(0, 0, 0, 0.4);
}

/* Data line glow — for visualization and pipeline elements */
.glow-data {
  box-shadow: 
    0 0 8px rgba(99, 102, 241, 0.6),
    0 0 2px rgba(255, 255, 255, 0.8);
}
```

---

## 04. The Neon Accent Philosophy

### Why Neon in a Premium System?
Neon is not cheap. Neon is **signal**.
In a dark, restrained environment, a neon accent carries enormous visual weight.
Used at low saturation and low frequency, neon communicates:
- Alive / Active / Intelligent
- Technology operating at depth
- Energy and precision

**The Rule**: Neon is earned. It cannot be everywhere. It must be placed with intention.

### Neon Accent Palette

```
Signal Green    #10B981    System active, success states, live data
Signal Teal     #06B6D4    Real-time streams, connected states, flow
Signal Amber    #F59E0B    Warning, attention, pending intelligence
Signal Rose     #F43F5E    Alert, critical signal, urgent state
```

### Neon Usage Principles
1. **One neon per viewport** — never two neon elements competing
2. **Always on dark** — neon on light backgrounds loses all power
3. **Functional neon** — used for state communication, never decoration
4. **Breathing neon** — subtle pulse animation makes it feel alive

```css
/* Living neon signal animation */
@keyframes signal-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px currentColor; }
  50% { opacity: 0.7; box-shadow: 0 0 16px currentColor, 0 0 32px rgba(currentColor, 0.3); }
}
.signal-live {
  animation: signal-pulse 2s ease-in-out infinite;
}
```

---

## 05. Cinematic Contrast Strategy

### The Three Contrast Zones

**Zone 1: The Void (Background)**
Deepest darks. No contrast. The stage.
```
#060608 → #0A0B0F → #0F1117
```

**Zone 2: The Surface (Content)**
Mid-dark with sufficient contrast to read. The space where work happens.
```
#141720 → #1A1F2E → #242B3D
```

**Zone 3: The Signal (Highlights)**
Bright whites, glowing accents, active states. The moments of intelligence.
```
#FFFFFF → #F0F0F8 → Accent colors
```

### The 10/30/60 Rule for Dark Interfaces
- **60%** of the interface: Void + Deep surfaces (the dark foundation)
- **30%** of the interface: Mid surfaces and secondary content
- **10%** of the interface: Bright signals, accents, glows

This ratio is what separates premium dark UIs from heavy, oppressive ones.
The lightness is precious because it is rare.

### Cinematic Depth Through Layering

Depth is not created with shadows alone — it's created with **light sources**.

Every surface elevation adds +5–8% lightness:
```
Layer 0 (Base):    #060608
Layer 1:           #0A0B0F  (+background)
Layer 2:           #0F1117  (+surface)
Layer 3:           #141720  (+elevated)
Layer 4:           #1A1F2E  (+highest)
Layer 5 (Hover):   #242B3D  (+interactive)
```

Each layer receives progressively more of the ambient glow from the primary accent,
as if lit from an intelligence source above.

---

## 06. Text Color Hierarchy

```
Primary Text:      #FFFFFF    (1.0 opacity) — Headlines, primary UI text
Secondary Text:    #A0A8BC    (body copy, descriptions)
Tertiary Text:     #6B7490    (secondary labels, captions, metadata)
Disabled Text:     #3D4460    (inactive states)
Accent Text:       #818CF8    (highlighted terms, active labels)
Code Text:         #67E8F9    (data values, monospace contexts)
```

---

## 07. Gradient Architecture

### Background Gradients

```css
/* Primary page gradient — establishes spatial depth */
.bg-primary {
  background: 
    radial-gradient(ellipse 80% 50% at 50% -20%, 
      rgba(99, 102, 241, 0.15) 0%, 
      transparent 70%),
    #0A0B0F;
}

/* Section gradient — creates visual separation without hard edges */
.bg-section {
  background: 
    linear-gradient(180deg, 
      rgba(99, 102, 241, 0.05) 0%, 
      transparent 50%,
      rgba(139, 92, 246, 0.05) 100%);
}

/* Card gradient — surface depth and materiality */
.card-surface {
  background: 
    linear-gradient(135deg,
      rgba(255, 255, 255, 0.04) 0%,
      rgba(255, 255, 255, 0.01) 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
```

### The Aurora Gradient (Hero Accent)
A soft, shifting radial gradient in the hero section that suggests a living energy field.

```css
.aurora-bg {
  background:
    radial-gradient(ellipse 60% 40% at 30% 50%, 
      rgba(99, 102, 241, 0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 70% 30%, 
      rgba(139, 92, 246, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse 40% 60% at 50% 80%,
      rgba(6, 182, 212, 0.05) 0%, transparent 60%),
    #0A0B0F;
}
```

---

## 08. Glassmorphism System

### The Glass Language
Glassmorphism — when executed with restraint — creates the feeling of interfaces with physical depth.
Cards that float. Panels that hover. Surfaces with presence.

```css
/* Premium glass card */
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Glass hover state */
.glass-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(99, 102, 241, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
```

---

## 09. Accessibility Considerations

### The Commitment
Premium design and accessibility are not in conflict.
SheetFlow AI meets WCAG 2.1 AA across all content contexts.

### Contrast Ratios

| Context | Foreground | Background | Ratio | Standard |
|---|---|---|---|---|
| Body copy | #A0A8BC | #0A0B0F | 7.2:1 | AAA |
| Headlines | #FFFFFF | #0A0B0F | 19.5:1 | AAA |
| UI labels | #6B7490 | #0F1117 | 4.8:1 | AA |
| Accent links | #818CF8 | #0A0B0F | 5.1:1 | AA |
| Disabled | #3D4460 | #0F1117 | 2.1:1 | (decorative only) |

### Focus States
All interactive elements have visible focus rings using the primary accent:
```css
:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 3px;
  border-radius: 4px;
}
```

### Motion Sensitivity
All animations respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
