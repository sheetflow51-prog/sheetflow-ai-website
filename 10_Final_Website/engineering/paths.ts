/**
 * Every path this system touches, resolved once.
 *
 * Two rules are encoded here rather than repeated at each call site:
 *
 * 1. **State is a dot directory, not a source directory.** `.engineering/`
 *    holds baselines, locks and caches. It is gitignored: a perf baseline is a
 *    property of *this machine* — 4 cores, Intel HD 620, 7.88 GB — and
 *    committing it would let a faster box's numbers silently become this box's
 *    budget.
 *
 * 2. **Reports are written where humans already look.** The three status
 *    documents land at the repository root next to `ENVIRONMENT_STATUS.md` and
 *    `VISUAL_OPERATING_SYSTEM.md`, not inside the tooling directory, because a
 *    report nobody opens is not a report.
 */

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** `10_Final_Website/` — the npm workspace, where every script and config lives. */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** The repository root, one level up. Reports and docs live here. */
export const REPO = resolve(ROOT, '..');

export const ENGINEERING_DIR = join(ROOT, 'engineering');
export const SRC = join(ROOT, 'src');
export const SCRIPTS = join(ROOT, 'scripts');
export const TESTS = join(ROOT, 'tests');

/** Machine-local state: baselines, locks, caches. Gitignored. */
export const STATE_DIR = join(ROOT, '.engineering');

/** Where the .mjs supervisor moves things instead of deleting them. */
export const QUARANTINE = join(ROOT, '.env-quarantine');

export const SUPERVISOR_SCRIPT = join(SCRIPTS, 'session-supervisor.mjs');

/** Existing measurement outputs this system ingests rather than duplicates. */
export const LIGHTHOUSE_DIR = join(ROOT, '.lighthouse');
export const NEXT_DIR = join(ROOT, '.next');

/** Screenshot sets used as visual-regression baselines. */
export const CAPTURES_DIR = join(REPO, 'docs', '_captures');

/** The documents this system is required to produce. */
export const REPORTS = {
  engineering: join(REPO, 'ENGINEERING_STATUS.md'),
  visual: join(REPO, 'VISUAL_STATUS.md'),
  system: join(REPO, 'SYSTEM_HEALTH.md'),
  build: join(REPO, 'BUILD_STATUS.md'),
  quality: join(REPO, 'QUALITY_GATE.md'),
};

/** Routes the supervisor treats as the site's surface area. Derived from
 *  `src/app/**\/page.tsx`; the dynamic segments are pinned to one real slug
 *  each, because `/work/[slug]` is not a URL a browser can visit. */
export const ROUTES = [
  '/',
  '/work',
  '/services',
  '/pricing',
  '/book',
] as const;

export const rel = (p: string): string => p.replace(REPO, '').replace(/\\/g, '/').replace(/^\//, '');

/**
 * Undo MSYS path mangling on a route argument.
 *
 * Git Bash rewrites arguments that look like POSIX paths into Windows ones
 * before the process ever sees them: `--routes /` arrives as
 * `C:/Program Files/Git/`, and `/work` as `C:/Program Files/Git/work`.
 *
 * This has now caused two distinct failures, which is why it lives here rather
 * than in whichever module noticed it first. It silently keyed a performance
 * baseline to the Git installation directory, and then — after being fixed in
 * one place but not the other — it sent the page probe to navigate at a local
 * directory listing instead of the site. That run produced a full set of
 * plausible numbers: a 100/100 visual score, sixteen "console errors" that were
 * Chrome's own directory-listing scripts, and a complaint about a missing `h1`.
 * Every figure was real and none of it was about this website. A wrong scope
 * fails loudly; a wrong URL fails quietly and looks like data.
 *
 * The conversion is deterministic and therefore reversible.
 */
export function unmangleRoute(value: string | undefined): string | undefined {
  if (!value) return value;
  const m = /^[A-Za-z]:[\\/].*[\\/]Git[\\/]?(.*)$/.exec(value);
  if (!m) return value;
  return '/' + m[1].replace(/\\/g, '/');
}
