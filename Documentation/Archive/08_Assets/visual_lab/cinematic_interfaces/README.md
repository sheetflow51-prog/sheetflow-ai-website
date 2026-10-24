# Cinematic Interfaces

> Real, shipping interfaces that feel cinematic. The shortlist.

---

## The shortlist

| Product | What's cinematic about it |
|---|---|
| **Linear** | The motion vocabulary is so small that any motion at all reads as deliberate. The page transitions are imperceptible — and that imperceptibility is the point. |
| **Arc Browser** | The browser itself behaves like a cinematic surface. Tabs slide, sidebars dissolve, command bar floats. Not gimmicky — it makes the browser feel like a stage. |
| **Vercel** | The dark mode is composed, not just inverted. Every layer has weight. |
| **Stripe** | The pacing of the homepage is a film — establishing shot, problem, solution, evidence, invitation. We borrowed this structure verbatim. |
| **Apple Vision Pro launch site** | The ultimate volumetric web experience. Floating spatial UI without feeling like a tech demo. |
| **Retool / Replit** | The dashboard surface itself reads as the product. Editorial motion + functional density. |
| **Spline** | The hero IS the product. Every interaction proves the tool. |

---

## What "cinematic" means in practice

It's not about scale or budget. It's about **two qualities**:

### 1. Pacing
Every screen has a rhythm. Cuts arrive when they're earned, not when the timer says. A cinematic interface doesn't reveal its content the moment you arrive — it *unfolds*.

**Implementation hooks in our codebase**:
- Hero reveal sequence: 0ms badge → 200ms headline → 400ms sub → 600ms CTAs → 800ms trust strip
- ScrollTrigger gates: every section reveal waits until 80% of the section is in view
- Lenis smoothing: the scroll itself is decelerated so the user can feel the cuts

### 2. Restraint
Cinematic interfaces *withhold*. Most SaaS sites show you everything immediately. A cinematic interface knows that a thing seen is a thing forgotten — but a thing earned is remembered.

**Implementation hooks**:
- The hero shows only one big idea ("Your data, finally alive.") and one CTA pair. Everything else lives below.
- Feature cards show kicker + headline + body — never lists of bullet points unless the user expands them.
- The scroll progress bar is 1px tall — present, not loud.

---

## Things every cinematic UI does

- **Establishes a horizon line.** Even on a flat page, your eye can locate "where the product lives." On Stripe, it's the gradient. On Linear, it's the mid-content card stack. On us, it's the AI core glow at viewport center.
- **Has a quiet zone.** A section where motion stops, color desaturates, density relaxes. Without quiet zones, cinematic = exhausting. Our `Footer` is the quiet zone.
- **Earns the climax.** The final CTA is louder than every section before it. We do this with the gradient halo and Magnetic primary CTA.

---

## Things we've explicitly borrowed

| Borrowed pattern | From | Where in our code |
|---|---|---|
| Establish-shot hero with single CTA pair | Stripe | `Hero.tsx` |
| Inline scroll-locked motion (no jacking) | Linear | `Parallax.tsx` |
| Constellation of integrations | Vercel | `AIInfrastructure.tsx` |
| Live signal indicators on dashboard | Replit / Retool | `AIDashboard.tsx`, `Footer.tsx` |
| Final CTA as monolith | Apple | `FinalCTA.tsx` |

---

## Things we've explicitly rejected

- **Fullscreen autoplay video heroes** (Webflow showcase trend) → bandwidth-heavy, locks user in the hero too long
- **Horizontal pinned story scrubs** (gsap-feature-pages everywhere) → fights against our smooth Lenis vertical scroll narrative
- **Per-pixel scroll-jacked 3D** (Apple-AirPods-style) → out of reach for a B2B SaaS budget; would also feel try-hard

---

*Reference: `/02_Design_Inspirations/references/awwwards_breakdown.md`*
