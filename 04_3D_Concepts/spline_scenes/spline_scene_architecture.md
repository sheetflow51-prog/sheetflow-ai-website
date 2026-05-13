# SheetFlow AI — Spline Scene Architecture

---

## 01. Spline Strategy

Spline allows creating interactive 3D scenes that embed directly in web pages.
For SheetFlow AI, Spline scenes are used at three specific moments:
1. **Hero Section** — The primary visual statement
2. **Feature Reveal** — A specific capability demonstrated in 3D
3. **Footer / CTA** — A closing visual moment

Each scene is purpose-built — not generic 3D decoration.

---

## 02. Hero Scene: "The Intelligence Field"

### Scene Brief
A dark environment with a central geometric intelligence object.
Three orbital rings of particles rotate around it.
Floating data panels drift slowly in the background.
Everything responds to mouse movement with gentle parallax.

### Objects
```
[AI Core]
- Geometry: Icosahedron, subdivision 4
- Material: Custom shader — indigo emissive with metallic base
- Behavior: Slow Y rotation, breathing scale

[Orbital Ring 1]
- Geometry: Torus, radius 2.5, tube 0.02
- Material: Line material, indigo
- Particles: 200 scattered along the torus path
- Behavior: Rotating at 15°/s

[Orbital Ring 2]  
- Geometry: Torus, radius 3.5, tilted 30°
- Particles: 300 — violet color
- Behavior: Counter-rotating at 10°/s

[Floating Data Panels]
- 5 small flat planes with grid texture
- Positioned at varying depths (z: -1 to -4)
- Slight drift animation (using noise-based movement)
- Semi-transparent with edge glow

[Background Stars]
- 2000 point particles
- Size: 0.5–1.5 units
- Distribution: Hemisphere facing camera
- Behavior: Static (depth anchors the scene)
```

### Mouse Interaction (Spline Events)
```
Mouse Move →
  • Camera: rotates ±5° on X and Y following mouse
  • AI Core: tilts 2° toward mouse direction
  • Data Panels: slight parallax (move slower than camera)

Hover AI Core →
  • Core: scale 1.0 → 1.1 over 0.4s
  • Bloom intensity increases
  • Orbital ring speed increases slightly

Click AI Core →
  • Signal pulse animation: ring expands from core outward
  • All connection lines flash once
```

### Export Settings
```
Quality: High (for desktop)
Pixel Ratio: Auto (respect device DPR)
Render On Demand: No (continuous for ambient animation)
Background: Transparent (page background shows through)
```

---

## 03. Feature Scene: "Data Detection"

### Scene Brief
A flat spreadsheet grid floating in space.
A scanning beam sweeps across it.
When an anomaly is detected, the cell glows and a signal emits.
Used in the "Autonomous Monitoring" feature section.

### Scene Objects
```
[Spreadsheet Grid]
- Geometry: Flat plane with line grid subdivisions
- Material: Dark surface with subtle grid lines emitting slight glow
- Size: 8 × 5 units
- Tilt: rotateX(-30deg) for perspective presentation

[Data Cells]
- Approx 40 cells visible
- Most: dimly lit numbers (gray, static)
- Anomaly cell: initially same as others

[Scanning Beam]
- A horizontal plane, thin, colored cyan/teal
- Moves from left to right: 4 second cycle
- Emissive material — acts as light source

[Anomaly Trigger]
- When scan beam crosses the anomaly cell:
  - Cell color transitions to amber
  - A ripple expands from cell
  - Signal packet emits upward

[Signal Packet]
- Small glowing sphere
- Travels from anomaly cell upward/out of scene
- Simulates alert being sent
```

### Scroll Trigger Integration
```javascript
// Connect Spline scene to scroll position
import { Application } from '@splinetool/runtime';

const splineApp = new Application(canvas);
await splineApp.load('https://prod.spline.design/[id]/scene.splinecode');

ScrollTrigger.create({
  trigger: '#feature-monitoring',
  start: 'top 60%',
  onEnter: () => {
    // Trigger the detection sequence
    splineApp.emitEvent('keydown', 'trigger-detection');
  }
});
```

---

## 04. CTA Scene: "The Invitation"

### Scene Brief
The same intelligence core from the hero, but closer, softer.
The camera has moved in — you're now inside the system.
The particles are sparser, the light is warmer.
It feels like an invitation to step further in.

### Atmosphere Changes from Hero
- Bloom: slightly increased (warmer, more inviting)
- Particle density: 40% of hero scene (less overwhelming)
- Core: same geometry but material has slight warmth added
- Camera: 30% closer — more intimate scale

---

## 05. Performance Architecture

### Scene Size Budgets
```
Hero Scene:    max 2MB (prioritize quality for first impression)
Feature Scene: max 800KB (functional, not atmospheric)
CTA Scene:     max 600KB (reuses hero assets where possible)
```

### Loading Strategy
```javascript
// Progressive Spline loading
const loadSplineScene = async (canvasId, sceneUrl) => {
  // Show placeholder skeleton
  const placeholder = document.getElementById(`${canvasId}-placeholder`);
  placeholder.style.display = 'block';
  
  // Lazy load only when near viewport
  const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      
      // Load Spline runtime dynamically
      const { Application } = await import('@splinetool/runtime');
      const canvas = document.getElementById(canvasId);
      const app = new Application(canvas);
      await app.load(sceneUrl);
      
      // Fade in
      gsap.to(canvas, { opacity: 1, duration: 0.6 });
      placeholder.style.display = 'none';
    }
  }, { rootMargin: '200px' });
  
  observer.observe(document.getElementById(canvasId));
};
```

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
