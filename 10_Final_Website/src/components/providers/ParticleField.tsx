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
      const count = Math.min(
        Math.floor(rect.width * rect.height * density),
        260,
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

    const tick = () => {
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

      // Connection lines
      if (connect) {
        // Subtle global shimmer so the lattice reads as "alive", not static.
        const shimmer = 0.85 + Math.sin(t * 3) * 0.15;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const opacity = (1 - dist / 120) * 0.18 * shimmer;
              ctx.beginPath();
              ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
              ctx.lineWidth = 0.6;
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
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
