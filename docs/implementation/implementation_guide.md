# SheetFlow AI Website - Implementation Guide

## Getting Started

This guide outlines the step-by-step process for building the SheetFlow AI website from the ground up.

---

## Project Setup

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest sheetflow-website \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### 2. Install Core Dependencies

```bash
npm install gsap @gsap/react framer-motion @splinetool/react-spline zustand
npm install react-hook-form zod @hookform/resolvers
npm install -D @types/node
```

### 3. Project Structure (within 10_Final_Website/frontend)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── pricing/page.tsx
│   ├── features/page.tsx
│   └── about/page.tsx
├── components/
│   ├── ui/          # Base UI components
│   ├── sections/    # Page sections
│   ├── layout/      # Header, Footer, etc.
│   └── 3d/          # Spline wrappers
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── styles/          # Global styles
└── types/           # TypeScript types
```

---

## Component Development Order

1. **Layout components** (Header, Footer)
2. **Base UI components** (Button, Card, Input)
3. **Section components** (Hero, Features, Pricing)
4. **3D wrapper components** (SplineHero, SplineWorkflow)
5. **Animation components** (AnimatedText, ScrollReveal)

---

## Animation Implementation

### GSAP ScrollTrigger Setup

```tsx
// hooks/useGSAP.ts
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollAnimation(selector: string) {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(selector, 
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: selector,
            start: 'top 80%',
          }
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [selector])

  return ref
}
```

### Reduced Motion

```css
/* Always respect user preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Spline Integration

```tsx
// components/3d/SplineHero.tsx
'use client'
import Spline from '@splinetool/react-spline'
import { Suspense } from 'react'

export function SplineHero() {
  return (
    <Suspense fallback={<HeroFallback />}>
      <Spline
        scene={process.env.NEXT_PUBLIC_SPLINE_HERO!}
        onLoad={(spline) => {
          // Handle scene load
        }}
      />
    </Suspense>
  )
}

function HeroFallback() {
  return <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900" />
}
```

---

## Design Token Setup (Tailwind)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          500: '#6366f1',
          900: '#1e1b4b',
        },
        surface: {
          glass: 'rgba(255,255,255,0.05)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      }
    }
  }
}
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SPLINE_HERO=https://prod.spline.design/SCENE_ID/scene.splinecode
NEXT_PUBLIC_SPLINE_WORKFLOW=https://prod.spline.design/SCENE_ID/scene.splinecode
NEXT_PUBLIC_SPLINE_DASHBOARD=https://prod.spline.design/SCENE_ID/scene.splinecode
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=sheetflow.ai
SENTRY_DSN=https://...
```

---

## Performance Checklist

- [ ] Enable Next.js image optimization
- [ ] Implement lazy loading for Spline scenes
- [ ] Use font-display: swap for custom fonts
- [ ] Add loading skeletons for async content
- [ ] Implement ISR (Incremental Static Regeneration) where needed
- [ ] Analyze and optimize JavaScript bundles
- [ ] Compress and optimize all images
- [ ] Enable Vercel Edge Network caching
- [ ] Test Core Web Vitals before launch

---

## Pre-Launch Checklist

- [ ] All pages built and responsive
- [ ] Forms submitting correctly
- [ ] Analytics tracking active
- [ ] Error monitoring configured
- [ ] SEO meta tags complete
- [ ] Open Graph images created
- [ ] Sitemap generated
- [ ] 404 page designed
- [ ] Cookie/privacy policy page
- [ ] Lighthouse 90+ on all pages
- [ ] Cross-browser testing complete
- [ ] Mobile testing on real devices

---

Last Updated: 2026-05-06
