# Moodboard — Interfaces

## Direction
Surfaces that feel both **density-rich** and **calm**. Glass with depth,
not glass as a sticker.

## References to study
- Apple Vision OS (the new gold standard)
- Linear's command palette + sidebar
- Stripe checkout
- Arc browser
- Raycast launcher
- Things 3
- Notion's calm density
- Foundation (TV) Lumon-style terminal — clinical depth

## Adjectives
layered · breathable · clinical · purposeful · trustworthy · alive-but-still

## Anti-references
- Glassmorphism with no light source
- Neumorphism (dated)
- Purple-blue gradients on every panel
- Iconography for every label
- Floating menus with no anchor
- Skeuomorphic chrome (knobs, gauges)
- Hover effects on every element
- Modal overload

## SheetFlow surface vocabulary
```
Glass panel:
  background:   rgba(20, 24, 28, 0.55)
  backdrop:     blur(24px) saturate(140%)
  border:       1px solid rgba(255,255,255,0.06)
  inner glow:   inset 0 1px 0 rgba(255,255,255,0.08)
  shadow:       0 32px 80px rgba(0,0,0,0.45)

Solid card:
  background:   #14181C
  border:       1px solid #20262C
  hover lift:   translateY(-2px), shadow grows 18%

Accent line:
  stroke:       #D4A76A at 60% opacity
  width:        1px
  use:          rare; only on active state
```

## The interface principle
Most things should not react. When something does, it earns weight.
