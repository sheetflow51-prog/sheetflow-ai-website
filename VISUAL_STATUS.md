# VISUAL_STATUS

**RC7 — Engineering Supervisor** · generated 2026-08-11 13:43:05 UTC

Scores are the mean of the dimensions that could be measured on each page. A
dimension shown as `—` was **not measured**; it is excluded from the mean rather
than counted as zero, because an unmeasured contrast pass is not a page with bad
contrast. Weights are equal across dimensions, which is arbitrary and says so —
any other weighting would be a claim about relative importance that nobody here
has measured.

---

## 1. Page quality

| Page | Overall | spacing | alignment | typography | contrast | depth | glass | elevation | motion | responsive | hierarchy | vitals |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `http://localhost:3000/` | **73** | 50 | 50 | 42 | 81 | 60 | 94 | 60 | 70 | 100 | 100 | 100 |

## 2. What cost the most points

| Points | Page | Dimension | Why |
|---|---|---|---|
| −50 | `http://localhost:3000/` | spacing | 9 of 18 sibling gaps are off the 4px scale |
| −50 | `http://localhost:3000/` | alignment | 32 distinct left edges across 219 blocks |
| −40 | `http://localhost:3000/` | depth | 16 distinct box-shadow signatures (the VOS ladder defines 5) |
| −40 | `http://localhost:3000/` | elevation | 3 elevation-4 surfaces in one viewport; the system allows one |
| −30 | `http://localhost:3000/` | typography | 22 distinct font sizes |
| −30 | `http://localhost:3000/` | motion | 22 infinite animations running |
| −19 | `http://localhost:3000/` | contrast | 11 of 235 text nodes below WCAG AA (approximate — background walked from ancestors) |
| −15 | `http://localhost:3000/` | typography | smallest rendered text is 9px |
| −10 | `http://localhost:3000/` | typography | 3 font families |
| −6 | `http://localhost:3000/` | glass | 1 blurred surface(s) without saturate() — fog, not glass (VOS § 4.2) |
| −3 | `http://localhost:3000/` | typography | 1 paragraph(s) beyond ~95 characters per line |

## 3. Not measured

| Not measured | Why |
|---|---|
| `http://localhost:3000/` | motion — reduced-motion compliance needs a second pass with the media feature emulated |
| `http://localhost:3000/` | vitals:INP — no interaction occurred, so INP is unmeasured (not zero) |


## 4. Visual regression

| | Check | Detail | Where |
|---|---|---|---|
| ✅ | `visual:baseline` | comparing rc5 (68 views) against rc6 (61 views) | — |
| ⚠️ | `visual:regression` | 55 of 68 view(s) changed beyond motion noise | — |
| ⚠️ | `visual:missing-views` | 11 view(s) in the baseline have no counterpart | — |


## 5. Motion and glass

| | Check | Detail | Where |
|---|---|---|---|
| ✅ | `motion:layout-class` | no animations on layout-triggering properties | — |
| ⚠️ | `motion:paint-class` | 15 paint-class animation(s) against a budget of 8: @text-shine, border-color, box-shadow, @glyph-flow, filter, background, color, background-color | `src/app/globals.css:288` |
| ✅ | `motion:infinite` | 12 infinite animation(s), within the budget of 12 | — |
| ✅ | `motion:glass-count` | 8 backdrop-filter rule(s), within the budget of 20 | — |
| ⚠️ | `motion:glass-fog` | 4 backdrop blur(s) with no saturate() — VOS § 4.2 calls saturate the whole difference between glass and fog | `src/app/globals.css:333` |
| ⚠️ | `motion:reduced-motion` | 12% of animations sit inside a prefers-reduced-motion block (target 50%) | — |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/app/page.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/layout/Navigation.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/motion/Magnetic.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/motion/Parallax.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/motion/ScrollReveal.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/motion/TiltCard.tsx` |
| ⚠️ | `motion:will-change-budget` | 5 will-change hints in one component — each promotes a compositor layer for the element's lifetime | `src/components/providers/AmbientBackground.tsx:75` |
| ⚠️ | `motion:layout-animation` | Framer Motion animates layout property width — reflow every frame | `src/components/providers/LoadingScreen.tsx:133` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/providers/LoadingScreen.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/sections/FinalCTA.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/sections/Hero.tsx` |
| ⚠️ | `motion:layout-animation` | Framer Motion animates layout properties width, height — reflow every frame | `src/components/signature/Awakening.tsx:95` |
| ⚠️ | `motion:layout-animation` | Framer Motion animates layout properties width, height — reflow every frame | `src/components/signature/Awakening.tsx:96` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/signature/Awakening.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/signature/Brackets.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/signature/SectionHandoff.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/signature/Trace.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/ui/SectionHeader.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/vos/Drift.tsx` |
| ⚠️ | `motion:unguarded` | animates without any reduced-motion path | `src/components/vos/Spine.tsx` |
| ✅ | `motion:measured` | paint trace present (trace-paint-1x.json): 0 NaNms | — |


## 6. Design-system conflicts

| | Check | Detail | Where |
|---|---|---|---|
| ⚠️ | `design:arbitrary-tailwind` | 10 arbitrary Tailwind values — each is outside the scale | `src/app/book/confirmed/page.tsx:70` |
| ⚠️ | `design:off-scale-spacing` | 5 distinct off-scale px values | `src/app/book/confirmed/page.tsx` |
| ⚠️ | `design:arbitrary-tailwind` | 8 arbitrary Tailwind values — each is outside the scale | `src/app/book/page.tsx:100` |
| ⚠️ | `design:off-scale-spacing` | 5 distinct off-scale px values | `src/app/book/page.tsx` |
| ⚠️ | `design:raw-colour` | 1 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/app/layout.tsx:140` |
| ⚠️ | `design:raw-colour` | 2 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/app/manifest.ts:11` |
| ⚠️ | `design:raw-colour` | 16 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/app/opengraph-image.tsx:24` |
| ⚠️ | `design:raw-colour` | 1 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/app/pricing/page.tsx:306` |
| ⚠️ | `design:arbitrary-tailwind` | 29 arbitrary Tailwind values — each is outside the scale | `src/app/pricing/page.tsx:107` |
| ⚠️ | `design:off-scale-spacing` | 10 distinct off-scale px values | `src/app/pricing/page.tsx` |
| ⚠️ | `design:arbitrary-tailwind` | 9 arbitrary Tailwind values — each is outside the scale | `src/app/services/page.tsx:55` |
| ⚠️ | `design:off-scale-spacing` | 7 distinct off-scale px values | `src/app/services/page.tsx` |
| ⚠️ | `design:arbitrary-tailwind` | 19 arbitrary Tailwind values — each is outside the scale | `src/app/services/[slug]/page.tsx:115` |
| ⚠️ | `design:off-scale-spacing` | 7 distinct off-scale px values | `src/app/services/[slug]/page.tsx` |
| ⚠️ | `design:arbitrary-tailwind` | 14 arbitrary Tailwind values — each is outside the scale | `src/app/work/page.tsx:66` |
| ⚠️ | `design:off-scale-spacing` | 15 distinct off-scale px values | `src/app/work/page.tsx` |
| ⚠️ | `design:glass-bypass` | 1 backdrop blur(s) outside the VOS surface ladder, with no saturate() — that renders as fog, not glass | `src/app/work/page.tsx:135` |
| ⚠️ | `design:raw-colour` | 1 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/app/work/[slug]/page.tsx:137` |
| ⚠️ | `design:arbitrary-tailwind` | 38 arbitrary Tailwind values — each is outside the scale | `src/app/work/[slug]/page.tsx:140` |
| ⚠️ | `design:off-scale-spacing` | 11 distinct off-scale px values | `src/app/work/[slug]/page.tsx` |
| ⚠️ | `design:arbitrary-tailwind` | 9 arbitrary Tailwind values — each is outside the scale | `src/components/booking/QualificationForm.tsx:83` |
| ⚠️ | `design:arbitrary-tailwind` | 11 arbitrary Tailwind values — each is outside the scale | `src/components/layout/Footer.tsx:69` |
| ⚠️ | `design:raw-colour` | 2 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/layout/Navigation.tsx:179` |
| ⚠️ | `design:arbitrary-tailwind` | 5 arbitrary Tailwind values — each is outside the scale | `src/components/layout/Navigation.tsx:105` |
| ⚠️ | `design:off-scale-spacing` | 6 distinct off-scale px values | `src/components/layout/Navigation.tsx` |
| ⚠️ | `design:glass-bypass` | 4 backdrop blur(s) outside the VOS surface ladder, with no saturate() — that renders as fog, not glass | `src/components/layout/Navigation.tsx:105` |
| ⚠️ | `design:raw-colour` | 3 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/motion/Breathing.tsx:48` |
| ⚠️ | `design:raw-colour` | 1 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/motion/TiltCard.tsx:45` |
| ⚠️ | `design:arbitrary-tailwind` | 11 arbitrary Tailwind values — each is outside the scale | `src/components/pricing/RecoveryCalculator.tsx:65` |
| ⚠️ | `design:raw-colour` | 11 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/providers/AmbientBackground.tsx:92` |
| ⚠️ | `design:arbitrary-tailwind` | 14 arbitrary Tailwind values — each is outside the scale | `src/components/providers/AmbientBackground.tsx:77` |
| ⚠️ | `design:raw-colour` | 5 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/providers/CustomCursor.tsx:89` |
| ⚠️ | `design:z-index` | z-index literal(s) above 10: 9999 | `src/components/providers/CustomCursor.tsx` |
| ⚠️ | `design:raw-colour` | 1 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/providers/LoadingScreen.tsx:106` |
| ⚠️ | `design:z-index` | z-index literal(s) above 10: 100 | `src/components/providers/LoadingScreen.tsx` |
| ⚠️ | `design:raw-colour` | 2 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/providers/ParticleField.tsx:156` |
| ⚠️ | `design:raw-colour` | 1 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/providers/ScrollProgress.tsx:20` |
| ⚠️ | `design:z-index` | z-index literal(s) above 10: 80 | `src/components/providers/ScrollProgress.tsx` |
| ⚠️ | `design:arbitrary-tailwind` | 13 arbitrary Tailwind values — each is outside the scale | `src/components/sections/CaseStudy.tsx:80` |
| ⚠️ | `design:off-scale-spacing` | 8 distinct off-scale px values | `src/components/sections/CaseStudy.tsx` |
| ⚠️ | `design:arbitrary-tailwind` | 4 arbitrary Tailwind values — each is outside the scale | `src/components/sections/Faq.tsx:82` |
| ⚠️ | `design:raw-colour` | 7 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/sections/FinalCTA.tsx:69` |
| ⚠️ | `design:arbitrary-tailwind` | 6 arbitrary Tailwind values — each is outside the scale | `src/components/sections/FinalCTA.tsx:61` |
| ⚠️ | `design:raw-colour` | 10 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/sections/Hero.tsx:171` |
| ⚠️ | `design:arbitrary-tailwind` | 19 arbitrary Tailwind values — each is outside the scale | `src/components/sections/Hero.tsx:89` |
| ⚠️ | `design:off-scale-spacing` | 7 distinct off-scale px values | `src/components/sections/Hero.tsx` |
| ⚠️ | `design:raw-colour` | 6 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/sections/UniverseStage.tsx:358` |
| ⚠️ | `design:off-scale-spacing` | 7 distinct off-scale px values | `src/components/sections/WorkflowPipeline.tsx` |
| ⚠️ | `design:raw-colour` | 6 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/signature/Awakening.tsx:86` |
| ⚠️ | `design:z-index` | z-index literal(s) above 10: 60 | `src/components/signature/Awakening.tsx` |
| ⚠️ | `design:raw-colour` | 1 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/signature/Brackets.tsx:37` |
| ⚠️ | `design:raw-colour` | 3 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/signature/SectionHandoff.tsx:43` |
| ⚠️ | `design:raw-colour` | 9 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/signature/Trace.tsx:113` |
| ⚠️ | `design:raw-colour` | 9 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/three/AICore.tsx:64` |
| ⚠️ | `design:raw-colour` | 1 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/three/IntelligenceCore.tsx:66` |
| ⚠️ | `design:arbitrary-tailwind` | 4 arbitrary Tailwind values — each is outside the scale | `src/components/ui/ProofPlaceholder.tsx:34` |
| ⚠️ | `design:raw-colour` | 2 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/vos/Metric.tsx:159` |
| ⚠️ | `design:raw-colour` | 1 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/components/work/ArchitectureFlow.tsx:60` |
| ⚠️ | `design:arbitrary-tailwind` | 5 arbitrary Tailwind values — each is outside the scale | `src/components/work/ArchitectureFlow.tsx:83` |
| ⚠️ | `design:off-scale-spacing` | 7 distinct off-scale px values | `src/components/work/ArchitectureFlow.tsx` |
| ⚠️ | `design:off-scale-spacing` | 5 distinct off-scale px values | `src/components/work/WorkflowGlyph.tsx` |
| ⚠️ | `design:raw-colour` | 14 raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens | `src/lib/og-card.tsx:33` |

