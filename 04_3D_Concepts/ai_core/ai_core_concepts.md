# SheetFlow AI — AI Core 3D Concepts

---

## 01. The Visual Metaphor for Intelligence

SheetFlow AI's intelligence needs a visual form.
Not abstract. Not literal. Something that communicates the *nature* of how AI intelligence works:
- Distributed (not centralized)
- Relational (patterns and connections)
- Active (continuously processing)
- Invisible yet consequential (you don't see it but you feel its effects)

**The Primary Metaphor: The Data Constellation**
A 3D network of connected nodes — like a neural network but structured like a data system.
Nodes represent data points. Edges represent intelligent relationships.
The system continuously processes: nodes pulse, edges animate, clusters form and dissolve.

---

## 02. The AI Core — Hero 3D Scene

### Scene Description
A central luminous core — a geometric form suggesting crystallized intelligence.
The core is surrounded by orbital data streams — rings of particle data circling at different speeds.
From the core, intelligent "signals" pulse outward along data connection lines.
The entire structure breathes — expanding and contracting with a 6-second heartbeat.

### Visual Specifications

**Core Object**:
- Geometry: Icosahedron (20 faces) with subdivision → smooth at distance, faceted up close
- Material: Emissive with accent color (#6366F1), slight wireframe overlay
- Scale: 1 unit diameter
- Animation: Slow rotation on Y axis (0.2 rad/s), subtle scale breathing (1.0 → 1.05)

**Orbital Rings**:
- Count: 3 rings
- Ring 1: Inner orbit, 1.8 unit radius, 200 particles, rotation 0.4 rad/s
- Ring 2: Mid orbit, 2.8 unit radius, 300 particles, rotation -0.25 rad/s (opposite)
- Ring 3: Outer orbit, 4.0 unit radius, 400 particles, rotation 0.15 rad/s
- Particle material: Points material, accent glow, 2px size

**Connection Lines**:
- From core to floating data nodes in outer space
- Lines animate with a traveling "signal" effect (bright dot moving along path)
- New connections form as ScrollTrigger progress increases

**Lighting**:
- Ambient: Dim blue-purple (#1a1a3e), intensity 0.3
- Point light at core: Accent color, intensity 2.0, distance 8
- Rim light (back): Violet (#8B5CF6), intensity 0.6
- No direct sunlight — everything lit from intelligence outward

### Camera Movement
```
At rest: Static, slight auto-rotation (Y axis, very slow)
On mouse move: Responds with 2° tilt in mouse direction (damped)
On scroll: Camera slowly pulls back, revealing more of the constellation
At section end: Camera has pulled back 30% — the core is smaller, the network is visible
```

---

## 03. Three.js Implementation Architecture

```javascript
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

class AICore {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.clock = new THREE.Clock();
    
    this.init();
  }
  
  init() {
    // Renderer setup
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);
    
    // Camera position
    this.camera.position.z = 8;
    
    // Post-processing with bloom for glow effect
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.6,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    this.composer.addPass(bloomPass);
    
    this.buildCore();
    this.buildOrbitalRings();
    this.buildConnectionLines();
    this.buildAmbientParticles();
    this.setupLights();
    this.animate();
  }
  
  buildCore() {
    // The central intelligence object
    const geometry = new THREE.IcosahedronGeometry(0.6, 4);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6366F1'),
      emissive: new THREE.Color('#6366F1'),
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false
    });
    
    this.core = new THREE.Mesh(geometry, material);
    this.scene.add(this.core);
    
    // Wireframe overlay
    const wireGeometry = new THREE.IcosahedronGeometry(0.62, 1);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: '#818CF8',
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
    this.core.add(wireframe);
  }
  
  buildOrbitalRings() {
    const configs = [
      { radius: 1.8, count: 200, speed: 0.4, color: '#6366F1' },
      { radius: 2.8, count: 300, speed: -0.25, color: '#8B5CF6' },
      { radius: 4.0, count: 400, speed: 0.15, color: '#06B6D4' }
    ];
    
    this.rings = configs.map(({ radius, count, speed, color }) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const spread = (Math.random() - 0.5) * 0.3;
        positions[i * 3] = Math.cos(angle) * (radius + spread);
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
        positions[i * 3 + 2] = Math.sin(angle) * (radius + spread);
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size: 0.025,
        transparent: true,
        opacity: 0.7
      });
      
      const ring = new THREE.Points(geometry, material);
      ring.userData.speed = speed;
      this.scene.add(ring);
      return ring;
    });
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const t = this.clock.getElapsedTime();
    
    // Core rotation and breathing
    this.core.rotation.y = t * 0.2;
    this.core.rotation.x = Math.sin(t * 0.3) * 0.1;
    const breathe = 1 + Math.sin(t * 0.8) * 0.03;
    this.core.scale.setScalar(breathe);
    
    // Orbital rings rotation
    this.rings.forEach(ring => {
      ring.rotation.y += ring.userData.speed * 0.01;
    });
    
    this.composer.render();
  }
}
```

---

## 04. Visual Language of Intelligence

### The Signal Pulse
When SheetFlow AI detects something important, a pulse travels outward from the core.
This is the key interaction moment — the visualization communicates "something happened."

Implementation: An expanding torus (ring geometry) that scales up from the core position,
accompanied by a brief intensity increase in the bloom pass.

### The Data Stream
Particles flowing from peripheral nodes toward the core — data being analyzed.
Direction reversal communicates intelligence output: core → periphery means "acting on data."

### The Cluster Formation
Related data nodes gradually drift toward each other, forming visible clusters.
Represents pattern recognition — the AI finding meaning in data.

---

*Last Updated: 2026 | SheetFlow AI Brand Intelligence*
