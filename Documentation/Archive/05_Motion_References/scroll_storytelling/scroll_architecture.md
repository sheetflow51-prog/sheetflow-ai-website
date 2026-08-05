# SheetFlow AI — Scroll Storytelling Architecture

---

## 01. The Scroll Manifesto

Scroll is not navigation. Scroll is **time**.

When a user scrolls through SheetFlow AI's homepage, they are not moving through space.
They are moving through a story. Each pixel of scroll advance is a moment of narrative.

The best scroll experiences feel like:
- A film unfolding at the user's pace
- A book where turning the page reveals the next revelation
- A guided tour through a world you've never seen

SheetFlow AI's scroll architecture is built on this understanding.

---

## 02. Scroll Architecture Overview

### The Page as a Timeline

```
SCROLL POSITION    NARRATIVE MOMENT          EMOTIONAL STATE
────────────────────────────────────────────────────────────
0px                The Promise               Wonder / Intrigue
(Hero Section)
                   ↓
600px              The Recognition           Identification
(Problem Statement)
                   ↓
1400px             The Revelation            Curiosity → Excitement
(Product Reveal)
                   ↓
2200px             The Exploration           Discovery
(Feature Architecture)
                   ↓
3200px             The Evidence              Trust
(Social Proof)
                   ↓
4000px             The Consequence           Conviction
(Impact Section)
                   ↓
4800px             The Invitation            Readiness
(CTA)
```

---

## 03. Scroll Velocity Intelligence

### Slow Scroll = Reader Mode
When scroll velocity is low (<200px/second):
- Richer details appear (tooltips, micro-animations)
- Text animations play at full speed
- The experience rewards careful reading

### Fast Scroll = Scanner Mode
When scroll velocity is high (>600px/second):
- Section headers scale up briefly to be readable mid-scroll
- Key statistics pulse to catch attention
- A subtle "you've passed something important" haptic-like signal

```javascript
// Scroll velocity detection
let lastY = 0;
let velocity = 0;

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;
  velocity = Math.abs(currentY - lastY);
  lastY = currentY;
  
  document.documentElement.dataset.scrollVelocity = 
    velocity > 600 ? 'fast' : 
    velocity > 200 ? 'medium' : 'slow';
});
```

---

## 04. ScrollTrigger Architecture Patterns

### Pattern 1: Pin + Scrub (Horizontal Scroll)
A section that stays "pinned" while the user scrolls horizontally through features.
Used for the feature showcase — user scrolls down, but the content moves right.

```javascript
// Horizontal feature scroll
gsap.to('.feature-track', {
  xPercent: -80,
  ease: "none",
  scrollTrigger: {
    trigger: '.feature-section',
    pin: true,
    scrub: 1,
    end: () => `+=${document.querySelector('.feature-track').offsetWidth}`,
    snap: {
      snapTo: 1 / (featureCount - 1),
      duration: { min: 0.2, max: 0.5 },
      ease: "power2.inOut"
    }
  }
});
```

### Pattern 2: Scrub Morph (Continuous Transformation)
An element continuously transforms based on scroll progress.
Used for the 3D visualization section.

```javascript
// 3D scene responds to scroll
ScrollTrigger.create({
  trigger: '#visualization-section',
  start: 'top top',
  end: 'bottom bottom',
  pin: '#visualization-canvas',
  scrub: 2,
  onUpdate: (self) => {
    const progress = self.progress;
    // Rotate the 3D scene based on scroll progress
    scene.rotation.y = progress * Math.PI * 2;
    // Move camera forward
    camera.position.z = 10 - (progress * 5);
    // Change lighting
    ambientLight.intensity = 0.3 + (progress * 0.7);
  }
});
```

### Pattern 3: Batch Reveal (Performance Optimized)
For long lists of elements, batch them rather than individual ScrollTriggers.

```javascript
// Batch reveal for grid items
ScrollTrigger.batch('.grid-item', {
  onEnter: batch => {
    gsap.from(batch, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      stagger: 0.06,
      ease: "sheetflow.enter"
    });
  },
  start: "top 85%",
  once: true
});
```

### Pattern 4: The Parallax Stack
Multiple layers moving at different speeds to create depth.

```javascript
// Parallax depth system
const layers = [
  { selector: '.parallax-bg', speed: 0.1 },
  { selector: '.parallax-mid', speed: 0.3 },
  { selector: '.parallax-fore', speed: 0.5 },
  { selector: '.parallax-float', speed: 0.7 }
];

layers.forEach(({ selector, speed }) => {
  gsap.utils.toArray(selector).forEach(el => {
    gsap.to(el, {
      yPercent: -100 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });
});
```

---

## 05. Cinematic Scroll Techniques

### The Ken Burns Parallax
Static images that slowly drift/scale as the user scrolls.
Creates a "documentary footage" quality — stillness with life.

### The Reveal Mask
Content hidden behind a mask that expands to reveal it on scroll.
The mask can be: a circle expanding, a horizontal wipe, text cutting through imagery.

```javascript
// Circular reveal
gsap.from('.masked-content', {
  clipPath: 'circle(0% at 50% 50%)',
  scrollTrigger: {
    trigger: '.masked-section',
    start: 'top 70%',
    end: 'top 20%',
    scrub: 1
  },
  ease: "none"
});
```

### The Text Deciphering Effect
Headline that "decodes" as user scrolls — random characters resolve into real text.

```javascript
function decipherText(element) {
  const originalText = element.textContent;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let iteration = 0;
  
  const interval = setInterval(() => {
    element.textContent = originalText.split('').map((char, index) => {
      if (index < iteration) return char;
      if (char === ' ') return ' ';
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    
    iteration += 0.5;
    if (iteration >= originalText.length) clearInterval(interval);
  }, 30);
}
```

### The Counter Cascade
A series of statistics that count up in sequence as the user scrolls into view.
Each number represents a proof point — and the counting makes it feel earned.

---

## 06. Scroll Storytelling Section Design

### Act I: The Hero (0–100vh)
**Scroll behavior**: Fixed. The hero waits.
**Motion**: Ambient particle field. Subtle gradient drift.
**First interaction**: Begin scrolling starts the "opening credits" — hero content rises.

### Act II: The Problem (100–200vh)
**Scroll behavior**: Normal scroll with pin at transition point
**Motion**: Brief pin where the problem statement grows in scale and opacity
**Narrative device**: The pain is made visible. Numbers appear showing cost/waste.

### Act III: The Product (200–400vh)
**Scroll behavior**: Pin with scrub — the most complex scroll section
**Motion**: The product UI "assembles" as the user scrolls
- First: Empty interface materializes
- Second: Data populates
- Third: SheetFlow AI activates — changes are detected
- Fourth: Intelligence responds — automations fire

### Act IV: The Features (400–700vh)
**Scroll behavior**: Horizontal scroll within pinned section
**Motion**: Feature cards slide in from right; active card expands

### Act V: The Proof (700–900vh)
**Scroll behavior**: Normal scroll with number count-up
**Motion**: Company logos appear with stagger; testimonials unfold

### Act VI: The CTA (900–1000vh)
**Scroll behavior**: Fixed background, content floats in
**Motion**: The background recalls the hero gradient — full circle.
**Final beat**: The headline from the hero echoes in the CTA.

---

## 07. Scroll Performance Standards

### The 16ms Budget
At 60fps, each frame has 16ms to render.
ScrollTrigger calculations must complete in <5ms to leave room for everything else.

**Performance Rules**:
- Use `will-change: transform` on frequently animated elements
- Never animate `position`, `width`, `height`, `margin` during scroll
- Use `translate3d` instead of `translate` to force GPU compositing
- Keep the number of simultaneous scrub animations below 20
- Debounce heavy calculations with `ScrollTrigger.refresh()`

### Lazy Initialization
Only initialize scroll animations for sections within ±2 viewports of current position.

```javascript
// Lazy init pattern
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      initSectionAnimations(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { rootMargin: '200px' });

document.querySelectorAll('.animated-section').forEach(el => {
  observer.observe(el);
});
```

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
