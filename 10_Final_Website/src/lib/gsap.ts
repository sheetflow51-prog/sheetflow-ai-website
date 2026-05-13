'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

let registered = false;
let easesInstalled = false;

/**
 * Register GSAP plugins exactly once — safe to call from any client component.
 */
export function ensureGsapRegistered() {
  if (registered) return gsap;
  if (typeof window === 'undefined') return gsap;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  registered = true;
  installCustomEases();
  return gsap;
}

/**
 * Brand easing curves — use these instead of inline cubic-beziers.
 * Names mirror the motion philosophy in 05_Motion_References/.
 */
function installCustomEases() {
  if (easesInstalled || typeof window === 'undefined') return;
  CustomEase.create('sheetflow.enter', 'M0,0 C0.25,0.46 0.45,0.94 1,1');
  CustomEase.create('sheetflow.cinematic', 'M0,0 C0.16,1 0.3,1 1,1');
  CustomEase.create('sheetflow.spring', 'M0,0 C0.34,1.56 0.64,1 1,1');
  CustomEase.create('sheetflow.intelligence', 'M0,0 C0.65,0 0.35,1 1,1');
  CustomEase.create('sheetflow.exit', 'M0,0 C0.4,0 0.2,1 1,1');
  easesInstalled = true;
}

/**
 * Sync GSAP's ScrollTrigger to Lenis's smooth scroll value
 * so timelines remain locked to the visible scroll position.
 */
export function syncScrollTriggerWithLenis() {
  if (typeof window === 'undefined') return () => {};
  ensureGsapRegistered();

  const lenis = (window as unknown as { __lenis?: { on: (e: string, fn: () => void) => void; off: (e: string, fn: () => void) => void } }).__lenis;
  if (!lenis) return () => {};

  const onScroll = () => ScrollTrigger.update();
  lenis.on('scroll', onScroll);

  const tickerCb = (time: number) => {
    const l = (window as unknown as { __lenis?: { raf: (t: number) => void } }).__lenis;
    l?.raf(time * 1000);
  };
  gsap.ticker.add(tickerCb);
  gsap.ticker.lagSmoothing(0);

  return () => {
    lenis.off('scroll', onScroll);
    gsap.ticker.remove(tickerCb);
  };
}

export { gsap, ScrollTrigger, CustomEase };
