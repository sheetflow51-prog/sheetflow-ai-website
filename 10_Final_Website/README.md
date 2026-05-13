# SheetFlow AI — Production Website

> The cinematic, AI-native marketing site built on top of the brand intelligence system in this workspace.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 + custom design tokens |
| Animation | Framer Motion + GSAP-ready easing curves |
| Smooth scroll | Lenis |
| 3D | React Three Fiber + Drei + @react-three/postprocessing |
| State | Zustand |
| Icons | Lucide |
| Class composition | clsx + tailwind-merge + cva |

The intelligence behind every design decision lives in the parent workspace. **Read [`../MASTER_INDEX.md`](../MASTER_INDEX.md) before changing anything visual.**

---

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Production build
```bash
npm run build
npm run start
```

### Type-check
```bash
npm run type-check
```

---

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout — fonts, providers, navigation, footer
│   ├── page.tsx            # Homepage — composes all sections
│   └── globals.css         # Design tokens, utility classes, base styles
├── components/
│   ├── layout/
│   │   ├── Navigation.tsx  # Scroll-aware glass nav
│   │   └── Footer.tsx      # 4-column footer
│   ├── providers/
│   │   ├── SmoothScroll.tsx       # Lenis cinematic scroll
│   │   ├── CustomCursor.tsx       # Dual-layer intelligence cursor
│   │   ├── LoadingScreen.tsx      # Intelligence boot sequence
│   │   ├── ScrollProgress.tsx     # Top progress line
│   │   ├── AmbientBackground.tsx  # Mouse-reactive gradient
│   │   └── ParticleField.tsx      # Canvas data atmosphere
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── WorkflowUniverse.tsx
│   │   ├── AIDashboard.tsx
│   │   ├── FeatureStorytelling.tsx
│   │   ├── CaseStudy.tsx
│   │   ├── AIInfrastructure.tsx
│   │   └── FinalCTA.tsx
│   ├── three/
│   │   └── AICore.tsx      # R3F icosahedron + orbital rings + bloom
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── GlassCard.tsx
│       ├── Kicker.tsx
│       ├── Logo.tsx
│       └── SectionHeader.tsx
└── lib/
    ├── utils.ts            # cn(), lerp, clamp, motion detection
    ├── store.ts            # Zustand global store
    └── hooks/
        ├── useReveal.ts    # IntersectionObserver-based reveal
        └── useMouseTrack.ts # Track cursor → CSS vars
```

---

## The Design System

All visual primitives derive from **two layers**:

1. **Tailwind config** ([`tailwind.config.ts`](./tailwind.config.ts)) — colors, type scale, easing, keyframes, shadows
2. **Global CSS** ([`src/app/globals.css`](./src/app/globals.css)) — token CSS variables, component classes (`.glass`, `.btn-primary`, `.feature-card`, `.kicker`, etc.)

### Naming convention
- **Tokens**: `--color-*`, `--space-*`
- **Surfaces**: `bg-surface-{0..4}`, `bg-void`
- **Accents**: `text-accent`, `text-accent-bright`, `text-accent-gradient`
- **Typography classes**: `.headline-monument`, `.headline-cinematic`, `.headline-section`, `.text-fade`, `.text-glow`

### Aesthetic standard
> *Does this feel like Apple, Stripe, and a futuristic AI lab designed it together?*

If the answer is no, do not ship.

---

## Performance Notes

- **3D scene** lazy-loaded via `next/dynamic` with `ssr: false`. Bloom effect uses MSAA-disabled composer.
- **Particle field** scales density to `density × width × height` and caps at 260 particles.
- **Lenis** is suspended when `prefers-reduced-motion: reduce`.
- **Custom cursor** disabled on coarse pointers (touch).
- `optimizePackageImports` is enabled in `next.config.mjs` for tree-shaking three / framer / lucide.

### Performance Budget
- Lighthouse Performance: 90+
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Total Blocking Time: <200ms
- Cumulative Layout Shift: <0.1

---

## Reduced Motion

The site respects `prefers-reduced-motion`:
- All animations collapse to ~0ms via global media query
- Lenis is bypassed
- Custom cursor is bypassed
- Canvas particle field is bypassed
- 3D core still mounts but receives no animated mouse input

---

## Adding a Section

1. Create `src/components/sections/MySection.tsx`.
2. Use `<SectionHeader>` for the kicker + headline + description.
3. Wrap with `<section className="section">` and `<div className="container-edge">`.
4. Animate in with Framer Motion (`whileInView` + `viewport={{ once: true, margin: '-15%' }}`).
5. Add to `src/app/page.tsx` between `<Divider />` instances.

---

## Environment Variables (when wiring real data)

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_ANALYTICS_ID=
SPLINE_SCENE_HERO=
SPLINE_SCENE_WORKFLOW=
SPLINE_SCENE_DASHBOARD=
SENTRY_DSN=
```

---

## Where the Brand Lives

This codebase is a **rendering** of the brand intelligence in the parent workspace. When in doubt:

- **Copy** → `../06_Content_System/`
- **Color & Type** → `../01_Brand_Research/`
- **Motion timing** → `../05_Motion_References/`
- **Section logic** → `../07_Website_Architecture/`
- **3D scenes** → `../04_3D_Concepts/`

---

*Built to the standards of Apple, Stripe, Linear, Vercel.*
*This is the intelligence layer the spreadsheet always deserved.*
