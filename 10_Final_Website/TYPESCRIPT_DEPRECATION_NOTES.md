# TypeScript `baseUrl` Deprecation — Resolution Notes

**Date:** 2026-05-12
**File touched:** [tsconfig.json](tsconfig.json)
**Repo state at fix:** Next.js `15.0.3`, TypeScript `^5.6.3`, React `18.3.1`

---

## TL;DR

Removed `"baseUrl": "."` from `tsconfig.json`. Kept the `paths` mapping
exactly as it was. `npm run type-check` and `npm run build` both pass.

That's the entire fix.

---

## What changed

**Before:**

```jsonc
{
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**After:**

```jsonc
{
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Exactly one line removed. No file imports, no source code, no
`next.config.mjs`, no Tailwind config, no tooling needed to change.

---

## Why the warning existed

Historically, `paths` mappings were resolved relative to `baseUrl`. So
the project's `"@/*": ["./src/*"]` was interpreted as:

> "When you see `@/foo`, look at `<baseUrl>/src/foo`"

But that pattern came with side effects:

1. **`baseUrl` also enables bare-specifier imports** — without `paths`,
   setting `baseUrl: "."` would let you write `import x from "src/x"`
   instead of `from "./src/x"`. This is implicit, undocumented in 90% of
   codebases, and behaves like a module-resolution side door.
2. **Tooling drift.** Bundlers, jest, eslint resolvers, and IDEs each
   had to reproduce TS's `baseUrl + paths` algorithm. Each implementation
   diverged slightly, causing "works in IDE, fails at build" bugs.
3. **`paths` doesn't need `baseUrl`.** Starting with TypeScript 4.1,
   `paths` can resolve relative to the **tsconfig file's directory**
   when `baseUrl` is absent. That's the modern, intended way.

TypeScript 5.x began surfacing the deprecation guidance precisely because
the cleanup path — drop `baseUrl`, keep `paths` — is mechanical and
non-breaking for the vast majority of projects.

---

## Why removing `baseUrl` is safe here

Three conditions made this a no-risk edit:

1. **Path patterns are already relative.** Our mapping is
   `"@/*": ["./src/*"]` — the value starts with `./`, so it resolves
   against the tsconfig directory whether or not `baseUrl` is set.
2. **No bare-specifier imports exist in the codebase.** A grep for
   `from "src/` finds nothing. All imports use either the `@/` alias or
   relative paths.
3. **`moduleResolution` is `"bundler"`.** This is the resolution mode
   Next.js 15 + Webpack/Turbopack uses; it natively supports `paths`
   without `baseUrl` (and is the configuration the Next.js team
   recommends as of Next 14+).

---

## TypeScript 7.0 implications

The TypeScript team has signaled that TS 7.0 will:

- Remove the implicit `baseUrl` behavior entirely (the bare-specifier
  side door)
- Continue supporting `paths` without `baseUrl` — this is the official
  forward-compatible pattern
- Keep `baseUrl` itself as a settable option (likely with a different,
  narrower semantic), but most projects will stop needing it

By making this change now we are **already on the TS 7.0 path**. No
further migration work is required in `tsconfig.json` for this concern.

---

## Why this solution beats the alternatives

| Option                                            | Verdict |
|---------------------------------------------------|---------|
| **Remove `baseUrl`, keep `paths` as-is** (chosen) | ✅ One line, no behavior change, future-proof, recommended by TS team and Next.js docs |
| Remove both `baseUrl` and `paths`, switch to relative imports everywhere | ❌ Massive churn across the codebase, loses ergonomics, no real benefit |
| Keep `baseUrl: "."`, suppress the warning         | ❌ Punts the work; will break on TS 7.0; signals stagnation |
| Keep `baseUrl: "./src"` and drop `./src` from paths | ❌ Re-enables the bare-specifier side door, worse than original |
| Switch to per-package workspaces / Project References | ❌ Over-engineering for a single Next.js app |

The chosen path is the minimum viable, maximally compatible change.

---

## Future migration recommendations

These are not urgent — call them annual hygiene items, not P0 work.

### 1. When TypeScript 5.7+ is adopted: re-check `moduleResolution`

`"bundler"` is current best-practice for Next.js. If the Next.js team
publishes a different recommendation in a 16.x release, follow theirs —
they tune this to whatever Webpack/Turbopack does internally.

### 2. When migrating to TypeScript 7.0

Expected scope of changes (pre-RC): **none for this file**. The fix we
just made is the migration. Re-verify by running:

```bash
npm run type-check && npm run build
```

If anything breaks, the most likely culprit is a transitive `@types/*`
package, not this project's config.

### 3. Watch for `moduleResolution: "node16" | "nodenext"` if SSR-only

If at any point this project drops the bundler in favor of pure
Node-resolved SSR (highly unlikely with Next.js, but possible for a
shared `lib/`), switch `moduleResolution` to `"nodenext"`. `paths` will
continue to work the same way relative to tsconfig location.

### 4. Consider `"verbatimModuleSyntax": true`

Unrelated to this fix, but a good companion modernization for TS 5.x+.
It enforces explicit `import type` syntax — catches accidental
type-only imports getting bundled. Low-effort, high-signal.

### 5. Don't reintroduce `baseUrl` for "convenience"

If a future developer wants to write `import x from "components/foo"`
without the `@/` prefix, the answer is **add a new path alias**, not
re-enable `baseUrl`. Path aliases are explicit; `baseUrl` is implicit.

---

## Verification commands

For anyone reviewing this change:

```bash
cd 10_Final_Website
npm run type-check     # tsc --noEmit — must exit 0
npm run build          # next build — must exit 0
npm run lint           # next lint — should not regress
```

All three pass on the post-fix tsconfig.

---

## References

- TypeScript handbook — [Module Resolution: paths](https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths)
- TypeScript 5.0 release notes — [bundler resolution](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#--moduleresolution-bundler)
- Next.js docs — [TypeScript config](https://nextjs.org/docs/app/api-reference/config/typescript)
