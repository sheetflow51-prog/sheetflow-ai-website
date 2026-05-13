'use client';

import { useEffect, useRef } from 'react';

/**
 * useMouseTrack — sets --mouse-x / --mouse-y CSS custom properties
 * on the host element so radial highlights can track the cursor.
 */
export function useMouseTrack<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    let lastX = 50;
    let lastY = 50;

    const onMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      lastX = ((e.clientX - rect.left) / rect.width) * 100;
      lastY = ((e.clientY - rect.top) / rect.height) * 100;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        node.style.setProperty('--mouse-x', `${lastX}%`);
        node.style.setProperty('--mouse-y', `${lastY}%`);
      });
    };

    node.addEventListener('mousemove', onMove);
    return () => {
      node.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}
