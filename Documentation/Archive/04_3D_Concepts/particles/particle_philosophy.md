# SheetFlow AI — Particle System Philosophy

---

## 01. Why Particles

Particles are the visual language of data at scale.

A single data point is invisible. Thousands of data points, moving in relation to each other,
become *information* — patterns, flows, emergent behavior.

This is the perfect visual metaphor for SheetFlow AI:
individual spreadsheet cells (particles) organized into intelligence (patterns).

### Particle System Goals
1. Communicate data volume and movement without being literal
2. Create the feeling of a living, breathing system
3. Provide ambient motion that doesn't distract from content
4. React to user interaction to signal interface awareness

---

## 02. The Primary Particle Field (Hero)

### Concept: The Data Atmosphere
The hero background is a field of several hundred particles.
They drift slowly, form temporary connections when near each other,
and respond to mouse proximity.

### Technical Specification

```javascript
class DataAtmosphere {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      particleCount: window.innerWidth > 768 ? 300 : 100,
      connectionDistance: 120,
      mouseRadius: 150,
      particleSize: { min: 1, max: 2.5 },
      speed: { min: 0.1, max: 0.4 },
      color: {
        particle: '99, 102, 241',
        connection: '99, 102, 241',
        mouseGlow: '99, 102, 241'
      },
      ...options
    };
    
    this.particles = [];
    this.mouse = { x: -1000, y: -1000 };
    this.animFrame = null;
    
    this.init();
  }
  
  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }
  
  createParticles() {
    this.particles = Array.from({ length: this.options.particleCount }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * this.options.speed.max,
      vy: (Math.random() - 0.5) * this.options.speed.max,
      size: this.options.particleSize.min + 
            Math.random() * (this.options.particleSize.max - this.options.particleSize.min),
      opacity: 0.3 + Math.random() * 0.5,
      pulseOffset: Math.random() * Math.PI * 2
    }));
  }
  
  animate() {
    const { ctx, canvas, options } = this;
    const t = performance.now() / 1000;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    this.particles.forEach(p => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Boundary wrap
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      
      // Mouse repulsion / attraction
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < options.mouseRadius) {
        const force = (options.mouseRadius - dist) / options.mouseRadius;
        p.vx -= (dx / dist) * force * 0.02;
        p.vy -= (dy / dist) * force * 0.02;
        
        // Speed limit after mouse interaction
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) {
          p.vx = (p.vx / speed) * 1.5;
          p.vy = (p.vy / speed) * 1.5;
        }
      } else {
        // Gradual return to base speed
        p.vx *= 0.995;
        p.vy *= 0.995;
        if (Math.abs(p.vx) < options.speed.min) {
          p.vx += (Math.random() - 0.5) * 0.1;
        }
      }
      
      // Pulse opacity
      const pulseOpacity = p.opacity + Math.sin(t + p.pulseOffset) * 0.1;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${options.color.particle}, ${pulseOpacity})`;
      ctx.fill();
    });
    
    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < options.connectionDistance) {
          const opacity = (1 - dist / options.connectionDistance) * 0.3;
          ctx.beginPath();
          ctx.moveTo(this.particles[i].x, this.particles[i].y);
          ctx.lineTo(this.particles[j].x, this.particles[j].y);
          ctx.strokeStyle = `rgba(${options.color.connection}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    
    // Mouse glow
    if (this.mouse.x > 0) {
      const gradient = ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, options.mouseRadius
      );
      gradient.addColorStop(0, `rgba(${options.color.mouseGlow}, 0.06)`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    this.animFrame = requestAnimationFrame(() => this.animate());
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  
  destroy() {
    cancelAnimationFrame(this.animFrame);
    document.removeEventListener('mousemove', this.mouseHandler);
  }
}
```

---

## 03. Particle Performance Philosophy

### The Budget
On desktop: 300–400 particles maximum
On mobile: 80–120 particles maximum
Connections: Only draw when within `connectionDistance` (spatial optimization)

### The Optimization Technique
Spatial partitioning — divide the canvas into a grid, only check connections between particles in the same or adjacent cells:

```javascript
// Simplified spatial grid for connection optimization
buildGrid() {
  const cellSize = this.options.connectionDistance;
  this.grid = {};
  
  this.particles.forEach((p, i) => {
    const cellX = Math.floor(p.x / cellSize);
    const cellY = Math.floor(p.y / cellSize);
    const key = `${cellX},${cellY}`;
    
    if (!this.grid[key]) this.grid[key] = [];
    this.grid[key].push(i);
  });
}
```

This reduces connection checks from O(n²) to O(n × k) where k is average particles per cell.

---

## 04. Particle Variation Systems

### System 1: The Data Flow (Section Background)
Particles flowing in a consistent direction — left to right, slightly varied y.
Represents data moving through the system.
Color: accent at low opacity.
Speed: consistent directional flow.

### System 2: The Neural Field (Feature Section)
Particles clustered in groups, with strong intra-cluster connections and weak inter-cluster connections.
Represents pattern recognition — islands of related data.
Clusters slowly drift, occasionally merging.

### System 3: The Signal Burst (Interaction Response)
On certain interactions (button click, feature trigger), a burst of particles emits from the interaction point.
Particles expand outward, fade, and dissolve.
Duration: 800ms total.
Count: 30–50 particles per burst.

```javascript
function signalBurst(x, y, container) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0; 
    width: 100vw; height: 100vh;
    pointer-events: none; z-index: 1000;
  `;
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = Array.from({ length: 40 }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 0.5) * 8,
    size: 1 + Math.random() * 2,
    life: 1.0
  }));
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= 0.025;
      
      if (p.life > 0) {
        alive = true;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.life})`;
        ctx.fill();
      }
    });
    
    if (alive) requestAnimationFrame(animate);
    else canvas.remove();
  };
  
  animate();
}
```

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
