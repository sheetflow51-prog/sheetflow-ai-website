import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn — class name composer.
 * Combines clsx (conditional) with tailwind-merge (conflict resolution).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Linear interpolation — used heavily in scroll/cursor systems.
 */
export const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

/**
 * Clamp a value between min/max.
 */
export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/**
 * Map a value from one range to another.
 */
export const mapRange = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => outMin + ((v - inMin) * (outMax - outMin)) / (inMax - inMin);

/**
 * Detect reduced-motion preference (SSR-safe).
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Detect coarse pointer (touch device).
 */
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
};
