# Flashpoint Dependency Security Triage

Last checked: 2026-05-07

## Current Audit Result

- `npm --cache ./tmp/npm-cache audit --omit=dev --json`: 0 production/runtime advisories.
- `npm --cache ./tmp/npm-cache audit --json`: 4 moderate advisories, all dev-only through `drizzle-kit` -> `@esbuild-kit/esm-loader` -> old transitive `esbuild`.
- Runtime/security upgrades applied: `hono` 4.12.18, `drizzle-orm` 0.45.2, `wrangler` 4.89.1, `@cloudflare/workers-types` 4.20260507.1, `vite` 6.4.2, `postcss` 8.5.14, `picomatch` overrides to 2.3.2/4.0.4, `react`/`react-dom` 19.2.6, and related lockfile refresh.

## Runtime Findings

- No open production/runtime advisories after the dependency refresh.
- Keep Hono and Drizzle on supported current release lines; do not reintroduce dynamic SQL identifier construction without a local escaping review.

## Dev/Build Findings

- Remaining `npm audit` findings are moderate and confined to `drizzle-kit`'s dev dependency chain. npm reports a downgrade to `drizzle-kit@0.18.1` as the available fix, which is not an acceptable hardening move because it reverts the migration toolkit line.
- `wrangler` 4.89.1 and current Cloudflare local tooling require Node >=22. Use Node 22+ locally; GitHub workflows run on Node 24.
- Do not run local dev servers on public interfaces.

## Follow-Up

- Re-run `npm audit --omit=dev` before public playtest and deploys.
- Monitor `drizzle-kit` for an upstream release that removes the stale `@esbuild-kit/esm-loader` chain without downgrading.
- Do not apply broad `npm audit fix --force` without a browser/gameplay regression pass; it can change Vite/Wrangler behavior.
