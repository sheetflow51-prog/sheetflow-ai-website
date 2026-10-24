'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/utils';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

/**
 * Maximum distance, in CSS pixels, at which two particles are joined by a line.
 * Doubles as the spatial grid's cell size — see the connection pass — so the
 * two can never disagree about what counts as a neighbour.
 */
const LINK_DIST = 100;

/**
 * ParticleField — canvas 2D data atmosphere.
 * Particles ride a slow flow-field current, connect within 120px, and react to
 * the cursor. Used as a background layer on the hero & key sections.
 */
export default function ParticleField({
  density = 0.00012, // particles per pixel² — auto-scaled
  className = '',
  connect = true,
  reactive = true,
  fixed = false,
}: {
  density?: number;
  className?: string;
  connect?: boolean;
  reactive?: boolean;
  fixed?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (prefersReducedMotion()) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let raf = 0;
    // Cached instead of calling getBoundingClientRect() on every RAF tick
    // and every mousemove event. Only resize() needs the real measurement.
    let rect = { width: 0, height: 0, left: 0, top: 0 };

    const resize = () => {
      rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      // Capped low: this is now a single site-wide, always-on fixed canvas,
      // and the connection pass below is O(n²). 130 keeps the network legible
      // while roughly quartering per-frame pair checks vs. the old 260 cap.
      const count = Math.min(
        Math.floor(rect.width * rect.height * density),
        130,
      );
      particles = new Array(count).fill(0).map(() => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.5 + 0.3,
      }));
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    /**
     * The field drifts slowly, so it is redrawn at ~30fps rather than at the
     * display's refresh rate. Halving the frame count halves every cost in
     * this loop and is imperceptible on motion this gentle — a particle moves
     * well under a pixel between frames.
     */
    const FRAME_MS = 1000 / 30;
    let lastFrame = 0;

    const tick = (now = performance.now()) => {
      if (now - lastFrame < FRAME_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Slow global flow-field phase — makes the whole network drift like a
      // gentle current instead of jittering in place. Cheap: one read/frame.
      const t = performance.now() * 0.0002;

      // Update + draw particles
      for (const p of particles) {
        // Mouse repulsion
        if (reactive) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (1 - dist / 120) * 0.4;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Flow field — a soft curl current so particles glide cohesively.
        p.vx += Math.cos(p.y * 0.011 + t) * 0.006;
        p.vy += Math.sin(p.x * 0.011 + t) * 0.006;

        // Speed limit
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) {
          p.vx = (p.vx / speed) * 1.5;
          p.vy = (p.vy / speed) * 1.5;
        }

        // Drift back to baseline (light damping keeps the current from piling up)
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.vx += (Math.random() - 0.5) * 0.006;
        p.vy += (Math.random() - 0.5) * 0.006;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = rect.width;
        if (p.x > rect.width) p.x = 0;
        if (p.y < 0) p.y = rect.height;
        if (p.y > rect.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${p.alpha})`;
        ctx.fill();
      }

      /**
       * Connection lines, via a uniform spatial grid.
       *
       * The naive form compares every pair — 8,385 distance checks a frame at
       * 130 particles, which was the single largest contributor to the site's
       * Total Blocking Time. Since a line is only ever drawn under LINK_DIST,
       * a particle can only connect to something in its own grid cell or an
       * adjacent one.
       *
       * Cell size equals LINK_DIST, and each cell scans only the four cells
       * "ahead" of it plus itself, so every pair is still considered exactly
       * once. Cost drops from O(n²) to roughly O(n · neighbours).
       */
      if (connect) {
        // Subtle global shimmer so the lattice reads as "alive", not static.
        const shimmer = 0.85 + Math.sin(t * 3) * 0.15;
        const cols = Math.max(1, Math.ceil(rect.width / LINK_DIST));
        const rows = Math.max(1, Math.ceil(rect.height / LINK_DIST));

        // Rebuilt per frame: particles move, and clearing is cheaper than
        // tracking cell transitions.
        const cells: Particle[][] = Array.from({ length: cols * rows }, () => []);
        for (const p of particles) {
          const cx = Math.min(cols - 1, Math.max(0, Math.floor(p.x / LINK_DIST)));
          const cy = Math.min(rows - 1, Math.max(0, Math.floor(p.y / LINK_DIST)));
          cells[cy * cols + cx].push(p);
        }

        // Right, down-left, down, down-right — the half-neighbourhood that
        // visits each unordered pair once.
        const NEIGHBOURS = [
          [1, 0],
          [-1, 1],
          [0, 1],
          [1, 1],
        ] as const;

        ctx.lineWidth = 0.6;

        for (let cy = 0; cy < rows; cy++) {
          for (let cx = 0; cx < cols; cx++) {
            const bucket = cells[cy * cols + cx];
            if (!bucket.length) continue;

            const link = (a: Particle, b: Particle) => {
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const d2 = dx * dx + dy * dy;
              // Compare squared distances — avoids a sqrt per candidate pair.
              if (d2 >= LINK_DIST * LINK_DIST) return;
              const opacity = (1 - Math.sqrt(d2) / LINK_DIST) * 0.18 * shimmer;
              ctx.beginPath();
              ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            };

            for (let i = 0; i < bucket.length; i++) {
              for (let j = i + 1; j < bucket.length; j++) link(bucket[i], bucket[j]);
            }

            for (const [ox, oy] of NEIGHBOURS) {
              const nx = cx + ox;
              const ny = cy + oy;
              if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
              const other = cells[ny * cols + nx];
              for (const a of bucket) for (const b of other) link(a, b);
            }
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    // Pause the RAF loop (and its O(n²) connection-line pass) entirely while
    // off-screen — this canvas is mounted in both Hero and FinalCTA.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf) raf = requestAnimationFrame(tick);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(canvas);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [density, connect, reactive]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none ${fixed ? 'fixed' : 'absolute'} inset-0 h-full w-full ${className}`}
    />
  );
}
