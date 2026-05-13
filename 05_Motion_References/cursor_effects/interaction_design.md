# SheetFlow AI — Cursor & Interaction Design

---

## 01. Why Custom Cursors Signal Premium

The cursor is the visitor's only physical presence in the interface.
It is the point of contact between the visitor and the experience.

Most websites use the system default cursor — invisible design thinking.
Premium experiences design the cursor intentionally — it becomes a statement.

A custom cursor communicates:
- This experience was designed to the last detail
- The interface is aware of the visitor's presence
- This is not a website — this is a world

---

## 02. SheetFlow AI Cursor System

### The Intelligence Cursor

A circular cursor that replaces the default on desktop.
Small at rest, expands on hover over interactive elements.

```javascript
class IntelligenceCursor {
  constructor() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'cursor-intelligence';
    document.body.appendChild(this.cursor);
    
    this.dot = document.createElement('div');
    this.dot.className = 'cursor-dot';
    document.body.appendChild(this.dot);
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    
    this.init();
  }
  
  init() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      // Dot follows immediately (no lag)
      gsap.set(this.dot, {
        x: e.clientX,
        y: e.clientY
      });
    });
    
    // Large cursor follows with slight delay (elastic feel)
    gsap.ticker.add(() => {
      const dx = this.mouseX - this.cursorX;
      const dy = this.mouseY - this.cursorY;
      this.cursorX += dx * 0.12;
      this.cursorY += dy * 0.12;
      
      gsap.set(this.cursor, {
        x: this.cursorX,
        y: this.cursorY
      });
    });
    
    // Interactive element states
    const interactiveElements = document.querySelectorAll('a, button, [data-cursor]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => this.expand(el));
      el.addEventListener('mouseleave', () => this.contract());
    });
  }
  
  expand(element) {
    const type = element.dataset.cursor || 'hover';
    
    gsap.to(this.cursor, {
      scale: type === 'view' ? 3 : 1.8,
      opacity: type === 'hover' ? 0.8 : 1,
      duration: 0.3,
      ease: "power2.out"
    });
    
    if (type === 'view') {
      this.cursor.innerHTML = '<span>View</span>';
    }
  }
  
  contract() {
    gsap.to(this.cursor, {
      scale: 1,
      opacity: 0.6,
      duration: 0.3,
      ease: "power2.out"
    });
    this.cursor.innerHTML = '';
  }
}
```

```css
/* Cursor styles */
* { cursor: none; }

.cursor-intelligence {
  position: fixed;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(99, 102, 241, 0.6);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
  transform: translate(-50%, -50%);
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.cursor-dot {
  position: fixed;
  width: 4px;
  height: 4px;
  background: #6366F1;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10000;
  transform: translate(-50%, -50%);
}
```

---

## 03. Magnetic Element Interaction

### The Magnetic Pull Effect
Buttons and important interactive elements that pull the cursor toward them when nearby.
Creates a tactile, physical quality — the interface reaches out to the visitor.

```javascript
function initMagneticElements() {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.3;
      const dy = (e.clientY - cy) * 0.3;
      
      gsap.to(el, {
        x: dx,
        y: dy,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.4)"
      });
    });
  });
}
```

---

## 04. Hover Intelligence System

### The Reveal Hover
Card hover states that reveal hidden content — like lifting a veil.

```css
.intelligence-card {
  position: relative;
  overflow: hidden;
}

.intelligence-card .hidden-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 20px;
  background: linear-gradient(0deg, rgba(10,11,15,0.95), transparent);
}

.intelligence-card:hover .hidden-content {
  transform: translateY(0);
}
```

### The Tilt Effect
Cards that tilt in 3D toward the mouse position.

```javascript
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = ((e.clientY - cy) / rect.height) * -8;
      const ry = ((e.clientX - cx) / rect.width) * 8;
      
      gsap.to(card, {
        rotateX: rx,
        rotateY: ry,
        duration: 0.3,
        ease: "power2.out",
        transformPerspective: 1000
      });
      
      // Move inner highlight with mouse
      const highlight = card.querySelector('.card-highlight');
      if (highlight) {
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        highlight.style.background = 
          `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.08), transparent 60%)`;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)"
      });
    });
  });
}
```

---

## 05. Interactive Background System

### Mouse-Reactive Gradient
The background gradient reacts to mouse position.

```javascript
function initMouseGradient() {
  let mouseX = 50;
  let mouseY = 50;
  let currentX = 50;
  let currentY = 50;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 100;
    mouseY = (e.clientY / window.innerHeight) * 100;
  });
  
  gsap.ticker.add(() => {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;
    
    document.querySelector('.mouse-gradient').style.background = `
      radial-gradient(
        ellipse 60% 40% at ${currentX}% ${currentY}%, 
        rgba(99, 102, 241, 0.12), 
        transparent 70%
      )
    `;
  });
}
```

### Particle Attraction Field
Particles near the cursor are attracted to it, then return to their original positions.

---

## 06. Click Interaction Design

### The Ripple (Refined)
Not the Material Design ripple — a more sophisticated, contained version.

```javascript
function initClickRipples() {
  document.querySelectorAll('.ripple-surface').forEach(el => {
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      Object.assign(ripple.style, {
        width: size + 'px',
        height: size + 'px',
        left: x + 'px',
        top: y + 'px'
      });
      
      el.appendChild(ripple);
      
      gsap.fromTo(ripple, {
        scale: 0,
        opacity: 0.4
      }, {
        scale: 1,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => ripple.remove()
      });
    });
  });
}
```

```css
.ripple-surface { position: relative; overflow: hidden; }

.click-ripple {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.4), transparent);
  pointer-events: none;
  transform-origin: center;
}
```

---

## 07. Scroll Hijacking — When to Use, When to Avoid

### The Responsibility
Scroll hijacking (overriding native scroll behavior) creates the most immersive experiences
but also creates the worst user experiences when done poorly.

**Use scroll hijacking ONLY when**:
- The section has a genuinely better experience with controlled scroll
- The section has a defined start and end point
- There is a clear visual indicator that "escape" is possible
- Performance is guaranteed at 60fps

**Never use it when**:
- The section has variable-length content
- Mobile cannot maintain smooth performance
- The user might need to back-navigate through it repeatedly

### SheetFlow AI Scroll Hijack Zones
```
Zone A (Hero): No hijack — natural scroll starts the experience
Zone B (Feature Demo): Single pinned section with scrub — the product assembly sequence
Zone C (Feature List): Horizontal scroll within pin — curated, bounded
Zone D (Proof): No hijack — natural scroll preserves reading flow
Zone E (CTA): No hijack — conversion context demands no friction
```

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
