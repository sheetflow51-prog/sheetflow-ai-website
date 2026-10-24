# SheetFlow AI — Holographic Interface Concepts

---

## 01. The Holographic Design Language

Holographic interfaces communicate: *this system exists at a higher level of reality.*

The visual techniques that create "holographic" feeling:
1. **Scan lines** — subtle horizontal lines suggesting a display medium
2. **Color separation** — slight RGB offset suggesting light physics
3. **Edge glow** — interface elements that emit light from their boundaries
4. **Depth layering** — multiple transparent planes at different z-depths
5. **Flicker / instability** — brief glitches that confirm the system is real and running

---

## 02. The Floating Dashboard Concept

### Description
A product UI screenshot that floats in 3D space.
Not a flat image — a dimensional object with:
- Front face: the product UI
- Side edges: visible thickness (2–4px dark edge)
- Ambient occlusion shadow beneath
- Edge glow from the primary accent color
- Subtle scan-line texture overlay

### CSS Implementation

```css
.holographic-dashboard {
  position: relative;
  transform: perspective(2000px) rotateX(8deg) rotateY(-12deg);
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  
  /* The main face */
  background: #0F1117;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  /* The glow */
  box-shadow:
    0 0 0 1px rgba(99, 102, 241, 0.1),
    0 20px 80px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(99, 102, 241, 0.15),
    0 0 120px rgba(99, 102, 241, 0.05);
}

/* Scan line overlay */
.holographic-dashboard::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.08) 2px,
    rgba(0, 0, 0, 0.08) 4px
  );
  pointer-events: none;
  z-index: 10;
}

/* Top edge highlight */
.holographic-dashboard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.6),
    rgba(255, 255, 255, 0.4),
    rgba(99, 102, 241, 0.6),
    transparent
  );
  z-index: 11;
}

/* Interactive tilt */
.holographic-dashboard:hover {
  transform: perspective(2000px) rotateX(4deg) rotateY(-6deg) translateY(-8px);
  box-shadow:
    0 0 0 1px rgba(99, 102, 241, 0.2),
    0 40px 100px rgba(0, 0, 0, 0.7),
    0 0 80px rgba(99, 102, 241, 0.2),
    0 0 160px rgba(99, 102, 241, 0.1);
}
```

---

## 03. The HUD (Heads-Up Display) Overlay Concept

### Description
Data overlays that appear on top of the main product screenshot.
Like a fighter pilot's HUD — real-time intelligence superimposed on reality.

### HUD Element Types

**Data Callout**:
A line extends from a specific point in the UI to a floating label with data.

```css
.hud-callout {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hud-callout-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, rgba(99,102,241,0.8), rgba(99,102,241,0.2));
}

.hud-callout-label {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #818CF8;
  white-space: nowrap;
  
  /* Scan animation */
  animation: hud-scan 3s ease-in-out infinite;
}

@keyframes hud-scan {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

**Status Indicator**:
```
● LIVE    ▲ +23%    ⚡ 142 actions today
```

**Intelligence Badge**:
```
┌─────────────────┐
│ AI CONFIDENCE   │
│ ██████████ 97%  │
└─────────────────┘
```

---

## 04. The Glitch Effect System

### Philosophy
Glitches are not errors. In the context of AI systems, a glitch communicates:
*this is a real, running system — not a static image.*

The glitch is a moment of authenticity — the system briefly revealing its own processes.

### CSS Glitch Animation

```css
@keyframes glitch-primary {
  0%, 90%, 100% { transform: translate(0); clip-path: none; }
  91% { transform: translate(-2px, 0); clip-path: inset(10% 0 80% 0); }
  92% { transform: translate(2px, 0); clip-path: inset(80% 0 10% 0); }
  93% { transform: translate(0); clip-path: none; }
}

@keyframes glitch-rgb {
  0%, 90%, 100% { 
    text-shadow: none;
  }
  91% {
    text-shadow: 
      -2px 0 rgba(255, 0, 0, 0.7),
      2px 0 rgba(0, 255, 255, 0.7);
  }
  93% {
    text-shadow: 
      2px 0 rgba(255, 0, 0, 0.5),
      -2px 0 rgba(0, 255, 255, 0.5);
  }
}

.glitch-text {
  animation: 
    glitch-primary 8s infinite,
    glitch-rgb 8s infinite;
}
```

### Glitch Timing
- Frequency: Every 8–12 seconds (rare enough to be surprising)
- Duration: 200–400ms (brief — makes it feel accidental)
- Trigger: On hover for interactive elements; automatically for ambient ones

---

## 05. The Transparency Stack

### Multi-Layer Holographic Display

A stack of semi-transparent "screens" at slightly different z-positions and slight rotations.
Creates the depth illusion of a multi-dimensional data display.

```css
.holographic-stack {
  position: relative;
  transform-style: preserve-3d;
  perspective: 1200px;
}

.holographic-stack .layer {
  position: absolute;
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 12px;
  background: rgba(15, 17, 23, 0.8);
  backdrop-filter: blur(4px);
}

.holographic-stack .layer:nth-child(1) {
  transform: translateZ(0px) rotateX(0deg);
  opacity: 1;
}

.holographic-stack .layer:nth-child(2) {
  transform: translateZ(-20px) rotateX(-2deg) translateY(10px);
  opacity: 0.6;
}

.holographic-stack .layer:nth-child(3) {
  transform: translateZ(-40px) rotateX(-4deg) translateY(20px);
  opacity: 0.3;
}
```

---

## 06. Spline Integration Concepts

### Spline Scene: The Intelligence Hub
A Spline-built 3D scene for the hero section.

**Scene Elements**:
- Central geometric form (icosahedron or octahedron) — the AI core
- Floating data panels around the core — transparent planes with data
- Connection lines between panels and core
- Particle system as scene background
- Post-processing: bloom on emissive elements

**Interactions in Spline**:
- Mouse orbit: The entire scene rotates gently with mouse movement
- Hover over panels: Panel scales slightly, glow intensifies
- Scroll: Camera moves on a predefined path as user scrolls the page

**Export for Web**:
```html
<!-- Spline viewer embed -->
<spline-viewer 
  url="https://prod.spline.design/[scene-id]/scene.splinecode"
  events-target="global"
></spline-viewer>
```

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
