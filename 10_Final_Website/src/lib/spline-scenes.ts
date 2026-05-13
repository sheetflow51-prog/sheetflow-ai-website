/**
 * Spline scene registry.
 *
 * Replace the placeholder URLs once production .splinecode exports are
 * available. The keys map to the design intent in:
 *   04_3D_Concepts/spline_scenes/spline_scene_architecture.md
 *
 * To export from Spline:
 *   File → Export → Code Export → React → copy the .splinecode URL
 */

export const SPLINE_SCENES = {
  /** Hero — Intelligence Field. Icosahedron core + orbital rings + floating panels. */
  hero:
    process.env.NEXT_PUBLIC_SPLINE_SCENE_HERO ??
    '',
  /** Workflow — Data Detection. Spreadsheet grid + scanning beam + signal packet. */
  workflow:
    process.env.NEXT_PUBLIC_SPLINE_SCENE_WORKFLOW ??
    '',
  /** Dashboard — Floating holographic analytics panels. */
  dashboard:
    process.env.NEXT_PUBLIC_SPLINE_SCENE_DASHBOARD ??
    '',
  /** Final CTA — Invitation. Soft monolith + ambient particles. */
  cta:
    process.env.NEXT_PUBLIC_SPLINE_SCENE_CTA ??
    '',
} as const;

export type SplineSceneKey = keyof typeof SPLINE_SCENES;
