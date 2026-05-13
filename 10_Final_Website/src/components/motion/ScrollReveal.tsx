'use client';

import * as React from 'react';
import { ensureGsapRegistered } from '@/lib/gsap';
import { cn, prefersReducedMotion } from '@/lib/utils';

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stagger between immediate children, in seconds. */
  stagger?: number;
  /** Y offset in px to animate from. */
  y?: number;
  /** Initial blur in px (0 = no blur). */
  blur?: number;
  /** Total animation duration. */
  duration?: number;
  /** Delay before the timeline starts after entering view. */
  delay?: number;
  /** ScrollTrigger start position. */
  start?: string;
  /** Animate the wrapper itself instead of children. */
  wrapper?: boolean;
}

/**
 * ScrollReveal — GSAP-driven cinematic reveal.
 * - Animates immediate children with stagger by default
 * - Use {wrapper} to animate the container itself instead
 * - Falls back to instant visibility under reduced-motion
 */
export function ScrollReveal({
  children,
  stagger = 0.08,
  y = 32,
  blur = 8,
  duration = 0.9,
  delay = 0,
  start = 'top 80%',
  wrapper = false,
  className,
  ...props
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion()) {
      const targets = wrapper ? [node] : Array.from(node.children);
      targets.forEach((t) => {
        (t as HTMLElement).style.opacity = '1';
        (t as HTMLElement).style.transform = 'none';
        (t as HTMLElement).style.filter = 'none';
      });
      return;
    }

    let cleanup = () => {};

    (async () => {
      const gsap = ensureGsapRegistered();
      const targets = wrapper ? [node] : Array.from(node.children);

      gsap.set(targets, {
        opacity: 0,
        y,
        filter: blur > 0 ? `blur(${blur}px)` : 'none',
      });

      const trigger = gsap.to(targets, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration,
        delay,
        ease: 'sheetflow.cinematic',
        stagger: wrapper ? 0 : stagger,
        scrollTrigger: {
          trigger: node,
          start,
          once: true,
        },
      });

      cleanup = () => {
        trigger.scrollTrigger?.kill();
        trigger.kill();
      };
    })();

    return () => cleanup();
  }, [blur, delay, duration, stagger, start, wrapper, y]);

  return (
    <div ref={ref} className={cn(className)} {...props}>
      {children}
    </div>
  );
}
