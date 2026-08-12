/**
 * The Visual Operating System.
 *
 * Reusable primitives that sections compose, rather than components that
 * sections duplicate. See `VISUAL_OPERATING_SYSTEM.md` for the engine roster,
 * which engines are implemented and in use, and the migration order for the
 * sections that have not moved onto the system yet.
 *
 * Everything exported here is a **server component or a pure constant**. The
 * whole system's client-JavaScript cost is zero, which is what makes it
 * affordable to put on every section: `VISUAL_DNA_V2.md` § 9 keeps the 360 kB
 * gzip budget hard.
 *
 * RC5 added the page-level tier. Every engine below `Chapter` composes *within*
 * a section; `Chapter` composes the sections themselves, which is the level the
 * homepage's actual defect lived at — nine self-contained pages on one route.
 */

export { Ambient, type AmbientTier, type AmbientTone } from './Ambient';
export { Surface, type Elevation, type SurfaceProps } from './Surface';
export { Spine, SpineNode, type SpineProps } from './Spine';
export {
  Artifact,
  Schematic,
  type ArtifactProps,
  type ArtifactTone,
  type Provenance,
  type SchematicProps,
  type Shape,
} from './Artifact';
export {
  BrowserFrame,
  DeviceFrame,
  type BrowserFrameProps,
  type DeviceFrameProps,
} from './Frames';
export {
  Metric,
  MetricGroup,
  Sparkline,
  type MetricGroupProps,
  type MetricProps,
  type SparklineProps,
} from './Metric';
export { Drift, type DriftProps } from './Drift';
export { Chapter, type ChapterProps } from './Chapter';
