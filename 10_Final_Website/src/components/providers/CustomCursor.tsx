'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { isTouchDevice, lerp } from '@/lib/utils';

/**
 * IntelligenceCursor — dual-layer cursor (ring + dot) with smooth lerp follow.
 * Expands and shifts color when hovering interactive elements
 * (any [data-cursor='hover'] or button/a).
 */
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const variant = useStore((s) => s.cursorVariant);
  const setVariant = useStore((s) => s.setCursorVariant);

  useEffect(() => {
    if (isTouchDevice()) return;
    setEnabled(true);
    document.documentElement.classList.add('cursor-none-all');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let dotX = mouseX;
    let dotY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const tick = () => {
      ringX = lerp(ringX, mouseX, 0.14);
      ringY = lerp(ringY, mouseY, 0.14);
      dotX = lerp(dotX, mouseX, 0.4);
      dotY = lerp(dotY, mouseY, 0.4);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Hover detection
    const onOver = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-cursor="hover"]')) {
        setVariant('hover');
      } else {
        setVariant('default');
      }
    };
    const onDown = () => setVariant('click');
    const onUp = () => setVariant('default');

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.documentElement.classList.remove('cursor-none-all');
    };
  }, [setVariant]);

  if (!enabled) return null;

  const ringSize =
    variant === 'hover' ? 64 : variant === 'click' ? 24 : 36;
  const ringBg =
    variant === 'hover'
      ? 'rgba(99, 102, 241, 0.12)'
      : 'rgba(255, 255, 255, 0.04)';
  const ringBorder =
    variant === 'hover'
      ? 'rgba(99, 102, 241, 0.6)'
      : 'rgba(255, 255, 255, 0.4)';

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full transition-[width,height,background,border-color] duration-200 ease-cinematic"
        style={{
          width: ringSize,
          height: ringSize,
          background: ringBg,
          border: `1px solid ${ringBorder}`,
          backdropFilter: 'blur(2px)',
          mixBlendMode: 'normal',
        }}
        aria-hidden="true"
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-white"
        style={{
          boxShadow: '0 0 12px rgba(99, 102, 241, 0.8)',
        }}
        aria-hidden="true"
      />
    </>
  );
}
