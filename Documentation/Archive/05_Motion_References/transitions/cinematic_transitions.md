# SheetFlow AI — Cinematic Transition System

---

## 01. Transition Philosophy

In cinema, a transition is never just a mechanical move between scenes.
It is the *emotional tissue* between two moments.

The best transitions do three things:
1. **Close** the previous idea with finality
2. **Bridge** the emotional gap between moments
3. **Open** the next idea with anticipation

SheetFlow AI's transitions operate on this principle.
Every section change should feel like a scene cut in a film — purposeful, felt, memorable.

---

## 02. The Transition Vocabulary

### Cut (Hard Transition)
No in-between. One thing, then another.
Used when the contrast between sections is the point.
```
Hero (problem) → Cut → Product (solution)
```

### Dissolve (Opacity Transition)
The outgoing element fades as the incoming element fades in.
Used for emotional continuity — the feeling persists while the content changes.
Duration: 400–600ms

### Wipe (Spatial Transition)
A boundary moves across the screen, revealing new content.
Directional: left-to-right (progress), top-to-bottom (descent/revelation).
Used for product feature reveals.

### Morph (Shape Transition)
An element transforms into the next element.
A button morphs into a modal. A data point expands into a chart.
Used for semantic continuity — the relationship between two things is shown.

### Push (Depth Transition)
New content emerges from depth (z-axis), pushing current content forward or back.
Used for section transitions on scroll.
Creates the feeling of moving through a 3D space.

---

## 03. Section-to-Section Transition Architecture

### Hero → Feature Reveal Transition

The hero section dissolves into depth as the user scrolls.
The background stays; the content recedes.
The feature section emerges from below.

```javascript
// Hero exit / Feature entry
gsap.timeline({
  scrollTrigger: {
    trigger: '#hero',
    start: 'bottom 80%',
    end: 'bottom 20%',
    scrub: 1
  }
})
.to('#hero-content', {
  y: -60,
  opacity: 0,
  ease: "none"
})
.from('#feature-section', {
  y: 80,
  opacity: 0,
  ease: "none"
}, 0);
```

### Feature → Social Proof Transition

The feature visualization "compresses" into a stat number.
Communicates: "this is what that capability produces."

```javascript
// Feature to proof — number reveal
gsap.timeline({
  scrollTrigger: {
    trigger: '#proof-section',
    start: 'top 70%',
    once: true
  }
})
.from('.stat-numbers', {
  textContent: 0,
  duration: 2,
  ease: "power2.out",
  snap: { textContent: 1 },
  stagger: 0.3
});
```

---

## 04. Premium Navigation Transitions

### The Blur Reveal (Apple.com Pattern)
Navigation bar that begins transparent and blurs the background on scroll.

```css
.nav {
  background: transparent;
  backdrop-filter: blur(0px);
  transition: backdrop-filter 0.3s ease, background 0.3s ease;
}

.nav.scrolled {
  background: rgba(10, 11, 15, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
```

```javascript
// Nav scroll state
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});
```

---

## 05. Page Transition System (Multi-Page)

### The Philosophy
Page transitions should communicate that the new page is *connected* to the previous one.
They are part of the same experience, the same world.

### The Veil Transition
A dark overlay that expands from the center to cover the current page,
then contracts from the center to reveal the new page.

```javascript
// Page veil transition
async function navigateTo(url) {
  const veil = document.querySelector('.page-veil');
  
  // Cover current page
  await gsap.to(veil, {
    clipPath: 'circle(150% at 50% 50%)',
    duration: 0.5,
    ease: "power2.inOut"
  });
  
  // Navigate
  window.location.href = url;
}

// On new page load — reveal
window.addEventListener('load', () => {
  const veil = document.querySelector('.page-veil');
  gsap.to(veil, {
    clipPath: 'circle(0% at 50% 50%)',
    duration: 0.5,
    ease: "power2.inOut",
    delay: 0.1
  });
});
```

### The Slide Transition (SPA Context)
For React Router / Next.js single-page applications:

```javascript
// Route transition variants (Framer Motion)
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(4px)'
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]  // Custom spring-like ease
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(4px)',
    transition: {
      duration: 0.3,
      ease: [0.7, 0, 0.84, 0]
    }
  }
};
```

---

## 06. Micro-Transition Library

### Button State Transitions

```css
/* Primary button */
.btn-primary {
  transition: 
    transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.2s ease,
    background-color 0.15s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5);
}
.btn-primary:active {
  transform: translateY(0px) scale(0.98);
  transition-duration: 0.08s;
}
```

### Card Hover Transitions

```css
.feature-card {
  transition:
    transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}
.feature-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.35);
}
```

### Link Underline Transition

```css
.smart-link {
  position: relative;
  text-decoration: none;
}
.smart-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: #6366F1;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.smart-link:hover::after {
  width: 100%;
}
```

---

## 07. Loading State Transitions

### The Intelligence Loading Pattern
When SheetFlow AI "thinks," the loading state communicates computation, not just waiting.

```css
@keyframes intelligence-compute {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0.4;
  }
  50% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 0 0 100%);
    opacity: 0.4;
  }
}

.computing-indicator {
  animation: intelligence-compute 1.2s ease-in-out infinite;
  background: linear-gradient(90deg, transparent, #6366F1, transparent);
  height: 2px;
}
```

### Skeleton Screen Transitions
Skeleton screens pulse with a moving gradient shimmer:

```css
@keyframes skeleton-shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.03) 25%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.03) 75%
  );
  background-size: 800px 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 6px;
}
```

---

## 08. Apple / Stripe / Linear Transition References

### Apple
- **Duration**: 0.4s–0.5s for most transitions
- **Easing**: Custom cubic-bezier that feels buttery and precise
- **Character**: Nothing bounces. Nothing overshoots. Every motion is measured and complete.

### Stripe
- **Duration**: 0.2s–0.3s for interactive states, 0.6s–0.8s for reveal animations
- **Easing**: Power2/Power3 easeOut — fast start, elegant finish
- **Character**: Purposeful. Every transition serves the content.

### Linear
- **Duration**: 0.15s–0.25s for UI transitions (extremely responsive)
- **Easing**: Custom spring for enter states, ease-in for exit
- **Character**: Feels like a native app. Instant. Precise. Never "webby."

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
