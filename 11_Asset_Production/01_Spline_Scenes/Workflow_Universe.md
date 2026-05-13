# Scene 02 — Workflow Universe

The "how it works" scene. It must communicate **complexity made calm**.
A constellation of interconnected nodes that breathe like a living system.

---

## Scene goal

Show that SheetFlow connects everything — without showing logos, arrows, or
"AI brain" clichés. The visitor should feel: "this is orchestrated, not
chaotic."

---

## Geometry direction

- 9–13 nodes. Never a round number. Never a perfect grid.
- Nodes are soft cubes (rounded 24%) or sliced spheres. Choose one family.
- Connections: thin volumetric light beams (not lines). 0.6 unit thickness,
  emissive 8–14%. Beams pulse softly — never strobe.
- One **anchor node** is slightly larger and sits off-center golden-ratio.
  That's the user's eye target.
- Negative space is the design. 60% of the frame should be empty.

---

## Camera references

- Dune (2021) — Greig Fraser's wide stillness, scale through emptiness.
- The Social Network opening — Fincher's locked frames, controlled drift.
- Stripe's homepage gradient era — confident, unhurried.

Camera behavior:

- 50mm. Locked off. **No drift.** Stability sells the system.
- Scroll-driven: as user scrolls, camera trucks 18 units forward and pitches
  down 4°. Tied to scroll progress, eased with cubic-out.

---

## Lighting references

- Single dominant key from upper-left, cool 6000K.
- Negative fill from lower-right (a black flag in real terms) — keeps shadow
  side genuinely dark. Apple does this.
- Beam emission lights itself; do not double-light beams.
- Volumetric haze 3–4% — beams should read because of haze, not because of
  bloom.

Avoid bloom. Bloom is the cheap fog machine of 3D.

---

## Movement philosophy

- Nodes float independently — perlin-noise driven, ±0.3 units, period 9–14s.
- Beams pulse: opacity 0.6 → 1.0 → 0.6, period 3.7s, offset per beam.
- One "data event" every 6–9s: a brighter pulse travels one beam end to end.
  Random selection, never sequenced.
- The system never feels like it's performing for you. It just is.

---

## Interaction notes

- Hover a node: it lifts 0.4 units, beams to its neighbors brighten 30%.
- Click is reserved for product flows — not in the cinematic scene.
- Reduced motion: freeze positions, keep beam pulses at 30% amplitude.

---

## Performance constraints

| Constraint     | Value         |
|----------------|---------------|
| Polygons       | 65k           |
| Materials      | 8             |
| Lights         | 5             |
| Bundle         | 1.2 MB        |
| Mobile         | static frame + parallax tilt |

---

## Export workflow

Same protocol as the hero scene — see
[Hero_Intelligence_Core.md](Hero_Intelligence_Core.md) export section.
Final lives at `12_Final_Exports/spline/workflow-universe-v{n}/`.

---

## Done = looks like

A galaxy that has rules. You can't predict its movement, but you trust it.
