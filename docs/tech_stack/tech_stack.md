# SheetFlow AI Website - Tech Stack

## Overview

Technology choices for building a world-class, AI-native product website with immersive 3D, sophisticated animations, and high performance.

---

## Frontend Framework

### Next.js 14+ (App Router)
- **Why:** SSG/SSR flexibility, excellent performance, React ecosystem
- **Features used:** App Router, Server Components, Image Optimization, Font Optimization
- **Deployment:** Vercel (first-class support)

---

## Styling

### Tailwind CSS
- **Why:** Utility-first, rapid development, consistent design system
- **Version:** 3.x
- **Plugins:** @tailwindcss/typography, @tailwindcss/forms

### CSS Modules
- **Why:** Component-scoped styles where Tailwind falls short
- **Usage:** Complex animations, component-specific overrides

---

## Animation

### GSAP 3 (GreenSock Animation Platform)
- **Why:** Industry standard for complex web animations, ScrollTrigger plugin
- **Plugins:** ScrollTrigger, TextPlugin, SplitText
- **Usage:** Scroll animations, text effects, timeline sequences

### Framer Motion
- **Why:** React-native animations, layout animations, gesture support
- **Usage:** Page transitions, component mount/unmount animations

---

## 3D & Immersive

### Spline
- **Why:** Designer-friendly 3D tool with web export
- **Integration:** @splinetool/react-spline
- **Usage:** Hero scene, workflow visualization, dashboard preview

### Three.js (optional)
- **Why:** Lower-level 3D control for custom particle systems
- **Usage:** Particle effects, custom shaders if needed

---

## State Management

### Zustand
- **Why:** Lightweight, simple API, no boilerplate
- **Usage:** UI state, navigation state, user preferences

---

## Forms

### React Hook Form
- **Why:** Performance-first, uncontrolled components, minimal re-renders
- **Validation:** Zod schema validation

---

## Analytics

### Plausible (Privacy-First)
- **Why:** GDPR-compliant, lightweight, no cookie consent needed
- **Alternative:** Mixpanel for product analytics

### Google Analytics 4
- **Why:** Free, comprehensive, industry standard
- **Usage:** Traffic and conversion tracking

---

## Monitoring

### Sentry
- **Why:** Real-time error tracking, performance monitoring
- **Usage:** Error reporting, session replays

---

## Deployment

### Vercel
- **Why:** Best-in-class Next.js hosting, edge network, instant deploys
- **Features:** Preview deployments, analytics, edge functions

### Cloudflare
- **Why:** CDN, DDoS protection, image optimization
- **Usage:** DNS, CDN layer, additional caching

---

## Development Tools

| Tool | Purpose |
|------|---------|
| TypeScript | Type safety, better DX |
| ESLint | Code linting |
| Prettier | Code formatting |
| Husky | Git hooks for quality |
| Vitest | Unit testing |
| Playwright | E2E testing |

---

## Package Dependencies (estimated)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "gsap": "^3.12.0",
    "framer-motion": "^11.0.0",
    "@splinetool/react-spline": "^2.0.0",
    "zustand": "^4.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "tailwindcss": "^3.0.0"
  }
}
```

---

## Performance Strategy

1. **Code Splitting** - Next.js automatic per-page splitting
2. **Image Optimization** - next/image with WebP conversion
3. **Font Optimization** - next/font with font-display swap
4. **Lazy Loading** - Spline scenes load on viewport entry
5. **Bundle Analysis** - @next/bundle-analyzer for monitoring

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Last 2 major |
| Firefox | Last 2 major |
| Safari | Last 2 major |
| Edge | Last 2 major |
| Mobile Chrome | Last 2 major |
| Mobile Safari | Last 2 major |

---

Last Updated: 2026-05-06
