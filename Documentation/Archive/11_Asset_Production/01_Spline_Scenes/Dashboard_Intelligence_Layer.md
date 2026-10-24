# Scene 03 — Dashboard Intelligence Layer

The scene that sits behind product/dashboard pages. It must say:
"this product is alive, and it's working for you."

---

## Scene goal

A subtle, depth-layered field of glass panels and floating data forms.
Not a dashboard. The **idea** of a dashboard, behind real UI.

This scene exists to give the actual product UI **atmosphere**. It is a
backdrop, not a hero.

---

## Geometry direction

- 4–6 frosted glass panels at varying depths (z: 0, -2, -5, -8, -12).
- Each panel holds an abstract data form: bar shapes, soft gradients, or a
  single line graph. **Never real numbers.**
- Glass: 12% opacity, 0.8 roughness, 1.45 IOR. It must read as glass, not
  plastic.
- Behind everything: a soft horizon gradient (deep blue-black → warm graphite).

---

## Camera references

- Apple's Mac Studio launch backplate scenes.
- Foundation (Apple TV+) holographic UI moments.
- Severance — clinical depth, controlled focus.

Camera behavior:

- 85mm. Shallow DoF — only the front panel is sharp.
- No movement. The product UI moves; the scene is the still pond beneath it.

---

## Lighting references

- Top-down soft key, cool 6500K.
- Subtle warm rim from screen-right (3000K, 5%) for skin tone harmony when
  founder portraits sit in front.
- No volumetric haze. This scene is **clean**, not atmospheric.

The dashboard scene is the one place restraint goes even further.

---

## Movement philosophy

- Panels drift on z by ±0.15 units, period 11s. Almost imperceptible.
- Data forms inside panels animate on a 4s loop, eased.
- No interaction-based motion. The product UI handles all interaction.

---

## Interaction notes

- None. This scene is wallpaper for product surfaces.
- Reduced motion: freeze entirely.

---

## Performance constraints

| Constraint  | Value       |
|-------------|-------------|
| Polygons    | 30k         |
| Materials   | 6           |
| Lights      | 3           |
| Bundle      | 700 KB      |
| Mobile      | static PNG @ 2x, gradient + blur |

---

## Done = looks like

You almost don't notice it's there. Then you do, and the whole product feels
more expensive.
