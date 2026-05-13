# 09_Spline_Scenes

## Purpose

Production-ready Spline 3D scenes for website integration. Each scene corresponds to a specific section of the website.

## Contents

### hero_scene/
- Main landing page 3D scene
- AI core floating orb
- Particle system layer
- Interaction: mouse tracking, scroll animation
- Export: Spline viewer embed + canvas fallback

### workflow_scene/
- Workflow universe visualization
- Connected nodes and data flow
- Process automation animation
- Interaction: scroll-triggered progression
- Export: Spline embed with GSAP sync

### dashboard_scene/
- 3D dashboard mockup
- Floating UI elements
- Data visualization layers
- Interaction: hover reveals, click interactions
- Export: Spline embed

### experiments/
- Prototype scenes for testing
- Visual style explorations
- Performance benchmarks
- Rejected concepts (kept for reference)

## Integration Specifications

### Embedding Method
```html
<!-- Option 1: Spline Viewer (easiest) -->
<spline-viewer url="https://prod.spline.design/..."></spline-viewer>

<!-- Option 2: React Component -->
import Spline from '@splinetool/react-spline';
<Spline scene="https://prod.spline.design/..." />
```

### Performance Targets
- Scene load time: <3 seconds
- File size: <50MB per scene
- Frame rate: 60fps on modern hardware, 30fps minimum
- Mobile: Simplified scene or static fallback

### z-index Layering
- Spline canvas: z-index 0
- Overlay gradients: z-index 1
- HTML content: z-index 10+
- Navigation: z-index 100+

## Scene Documentation

Each scene folder should contain:
- `scene.spline` - Source file
- `README.md` - Scene description and specs
- `preview.png` - Static preview image
- `notes.md` - Design decisions and iterations

---

Updated: 2026-05-06
