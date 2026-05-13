# SheetFlow AI — GSAP Motion System

---

## 01. Animation Philosophy

Motion is not decoration. Motion is **communication**.

Every animation SheetFlow AI deploys answers one of these questions:
- *What just changed?* (State communication)
- *Where should I look?* (Attention direction)
- *What is happening in this system?* (Intelligence narration)
- *Is this alive?* (Ambient intelligence signal)

### The Three Laws of SheetFlow AI Motion

**Law 1: Motion Must Earn Its Place**
If an animation does not communicate something, it does not exist.
No animation for animation's sake.

**Law 2: Intelligence Has Weight**
AI intelligence should feel like it has physical presence.
Responses should carry a sense of computation — not instant, not slow, but *processing*.

**Law 3: The System Breathes**
The interface is alive. When nothing is happening, something subtle should still move.
Ambient motion at extremely low intensity maintains the "living system" feeling.

---

## 02. GSAP Architecture

### Recommended GSAP Plugins

```javascript
// Core installation
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { SplitText } from 'gsap/SplitText'; // Club GSAP
import { CustomEase } from 'gsap/CustomEase';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(
  ScrollTrigger, 
  TextPlugin, 
  SplitText, 
  CustomEase, 
  DrawSVGPlugin
);
```

### SheetFlow AI Custom Easing Library

```javascript
// Register custom eases
CustomEase.create("sheetflow.enter", "M0,0 C0.16,1 0.3,1 1,1");
// Smooth spring enter — used for content reveal

CustomEase.create("sheetflow.exit", "M0,0 C0.7,0 0.84,0 1,1");
// Smooth exit — used for content leaving

CustomEase.create("sheetflow.spring", "M0,0 C0.34,1.56 0.64,1 1,1");
// Spring overshoot — used for interactive elements

CustomEase.create("sheetflow.intelligence", "M0,0 C0.4,0 0.2,1 1,1");
// Computed feel — used for AI response animations

CustomEase.create("sheetflow.cinematic", "M0,0 C0.165,0.84 0.44,1 1,1");
// Smooth cinematic — Apple-inspired ease for hero elements
```

---

## 03. Page Load Sequence

### The Intelligence Boot Sequence

The page "boots" when it loads — like an operating system initializing.

```javascript
// Master page load timeline
function bootSequence() {
  const tl = gsap.timeline({ defaults: { ease: "sheetflow.cinematic" } });

  // Stage 1: Background awakens (0–600ms)
  tl.from('.bg-gradient', {
    opacity: 0,
    duration: 0.6,
    ease: "none"
  }, 0);

  // Stage 2: Navigation renders (400–700ms)
  tl.from('nav', {
    y: -20,
    opacity: 0,
    duration: 0.5
  }, 0.4);

  // Stage 3: Hero kicker label (600–900ms)
  tl.from('.hero-kicker', {
    y: 10,
    opacity: 0,
    duration: 0.4,
    letterSpacing: "0.2em",  // starts wide, contracts to correct
  }, 0.6);

  // Stage 4: Headline — split text reveal (800ms–1400ms)
  const headline = new SplitText('.hero-headline', { type: 'lines' });
  tl.from(headline.lines, {
    y: 60,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: "sheetflow.enter"
  }, 0.8);

  // Stage 5: Sub-headline (1100–1600ms)
  tl.from('.hero-sub', {
    y: 20,
    opacity: 0,
    duration: 0.6
  }, 1.1);

  // Stage 6: CTA buttons (1300–1700ms)
  tl.from('.cta-group > *', {
    y: 20,
    opacity: 0,
    stagger: 0.1,
    duration: 0.5
  }, 1.3);

  // Stage 7: Particle system activates (1500ms+)
  tl.call(() => initParticles(), [], 1.5);

  // Stage 8: Trust bar (1700–2000ms)
  tl.from('.trust-bar', {
    opacity: 0,
    duration: 0.5
  }, 1.7);

  return tl;
}
```

---

## 04. Scroll Animation System

### ScrollTrigger Architecture

```javascript
// Master scroll animation initializer
function initScrollAnimations() {
  
  // Section fade-up reveal (used everywhere)
  gsap.utils.toArray('.reveal-section').forEach(section => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        end: "top 40%",
        scrub: false,
        once: true
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: "sheetflow.enter"
    });
  });

  // Stagger grid reveals (for bento grids, feature lists)
  gsap.utils.toArray('.reveal-grid').forEach(grid => {
    const items = grid.querySelectorAll('.grid-item');
    gsap.from(items, {
      scrollTrigger: {
        trigger: grid,
        start: "top 80%",
        once: true
      },
      y: 40,
      opacity: 0,
      stagger: { amount: 0.5, from: "start" },
      duration: 0.7,
      ease: "sheetflow.enter"
    });
  });

  // Headline split text reveal
  gsap.utils.toArray('.headline-reveal').forEach(el => {
    const split = new SplitText(el, { type: 'lines, words' });
    gsap.from(split.words, {
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true
      },
      y: '100%',
      opacity: 0,
      stagger: 0.03,
      duration: 0.6,
      ease: "sheetflow.enter"
    });
  });

  // Parallax depth layers
  gsap.utils.toArray('.parallax-slow').forEach(el => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      },
      y: "-15%",
      ease: "none"
    });
  });

  gsap.utils.toArray('.parallax-fast').forEach(el => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      },
      y: "15%",
      ease: "none"
    });
  });
}
```

---

## 05. Premium Timing Reference

### Timing Philosophy
Not too fast (feels broken), not too slow (feels heavy).
Premium interfaces feel *instantly responsive* while still having perceptible motion.

```
Instant feedback:     0ms       (visual acknowledgment of input — cursor change)
Micro-interactions:   80–150ms  (button states, hover effects)
UI transitions:       150–250ms (panel opens, dropdown appears)
Content reveals:      400–700ms (section entrances, card reveals)
Page transitions:     600–900ms (between pages)
Cinematic moments:    800–1200ms (hero reveals, climactic animations)
Ambient animations:   2000ms+   (breathing effects, slow orbits)
```

### The 60fps Commitment
All animations must target 60fps minimum.
Only use `transform` and `opacity` for animated properties (GPU-accelerated).
Never animate `width`, `height`, `top`, `left`, `margin` — these trigger layout recalculation.

---

## 06. Feature Demo Animations

### The "System Thinking" Animation
Used when demonstrating SheetFlow AI's intelligence:

```javascript
function demonstrateIntelligence(container) {
  const tl = gsap.timeline();
  
  // Step 1: Data change detected
  tl.to('.cell-highlight', {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderColor: '#6366F1',
    duration: 0.3,
    ease: "sheetflow.intelligence"
  });

  // Step 2: AI processing indicator
  tl.from('.ai-processing', {
    opacity: 0,
    scale: 0.8,
    duration: 0.3
  }, ">0.1");

  // Step 3: Analysis lines draw
  tl.from('.analysis-lines path', {
    drawSVG: '0%',
    duration: 0.8,
    stagger: 0.1,
    ease: "sheetflow.cinematic"
  }, ">0.2");

  // Step 4: Intelligence result appears
  tl.from('.intelligence-result', {
    y: 10,
    opacity: 0,
    duration: 0.4,
    ease: "sheetflow.spring"
  }, ">0.1");

  // Step 5: Action triggers
  tl.from('.action-triggered', {
    x: -20,
    opacity: 0,
    stagger: 0.15,
    duration: 0.4
  }, ">0.2");

  return tl;
}
```

---

## 07. Ambient Motion System

### The Living Interface
When no user interaction is occurring, the interface should still breathe.

```javascript
// Ambient particle breathing
gsap.to('.particle-field', {
  scale: 1.05,
  duration: 4,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut"
});

// Background gradient drift
gsap.to('.bg-gradient-1', {
  x: '3%',
  y: '-2%',
  duration: 12,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut"
});

gsap.to('.bg-gradient-2', {
  x: '-2%',
  y: '3%',
  duration: 16,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut"
});

// Live data pulse (for "active" indicators)
gsap.to('.live-indicator', {
  opacity: 0.4,
  scale: 0.95,
  duration: 1.5,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut"
});
```

---

## 08. Reduced Motion Compliance

```javascript
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
  // Disable all GSAP animations
  gsap.globalTimeline.pause();
  
  // Apply instant CSS transitions instead
  document.documentElement.classList.add('reduced-motion');
} else {
  // Full animation system
  initAnimations();
}
```

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
