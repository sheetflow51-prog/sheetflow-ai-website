# Spline Scenes

Three production scenes power the SheetFlow universe. Each has its own brief.

| Scene                              | File                                         | Where it lives             |
|------------------------------------|----------------------------------------------|----------------------------|
| Hero Intelligence Core             | [Hero_Intelligence_Core.md](Hero_Intelligence_Core.md) | Homepage hero          |
| Workflow Universe                  | [Workflow_Universe.md](Workflow_Universe.md)           | Product / how-it-works |
| Dashboard Intelligence Layer       | [Dashboard_Intelligence_Layer.md](Dashboard_Intelligence_Layer.md) | Dashboard / case studies |

Shared standards live in [Optimization_Checklist.md](Optimization_Checklist.md).

---

## Scene production protocol

For every Spline scene:

1. Read the scene brief end to end. Do not skim.
2. Block geometry first. Light second. Motion third. Never invert.
3. Camera is a character — handheld breathing, never robotic.
4. Export at the resolution declared in the brief, not "whatever Spline opens at."
5. Run through the [Optimization Checklist](Optimization_Checklist.md) before
   handing off.
6. Embed export ID in filename: `scene-{slug}-v{n}-{YYYYMMDD}.spline`.

---

## Performance budget (hard limits)

| Metric                 | Target           | Hard cap        |
|------------------------|------------------|-----------------|
| Initial bundle         | < 1.2 MB         | 1.8 MB          |
| Polygons               | < 80k            | 120k            |
| Materials              | < 12             | 20              |
| Lights                 | < 6              | 8               |
| Frame budget @ 60fps   | < 12 ms          | 16 ms           |

Anything over the hard cap goes back to optimization, not to ship.
