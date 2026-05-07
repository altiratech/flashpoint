# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- `main` is cleanly pushed to `origin/main`; the latest deployed hardening commits are `5684fb0` (cross-origin telemetry/browser-smoke fix), `7570602` (Actions runtime + deployed browser smoke workflow), `41bbb3c` (dependency-security hardening), and `d852d26` (deployed smoke variant hardening).
- Linear `ALT-38` is implemented through deployed preview verification: D1-backed `rate_limit_buckets`, route-normalized API rate-limit keys, ordered remote D1 migrations, retry/idempotency tests, bootstrap ETag caching, and real Pages + Worker smoke coverage.
- GitHub Deploy run `25508810499` succeeded for `7570602`: quality gate, remote D1 migrations, API Worker deploy, Pages deploy, and production verification all passed on `actions/*@v6` with Node 24.
- Deployed Pages now bakes `VITE_API_BASE_URL=https://escalation-api.rjameson.workers.dev`; `scripts/verify-deploy.sh` fails if the deployed JS bundle does not reference the expected API origin.
- Cross-origin telemetry now avoids `sendBeacon` credentialed CORS semantics and uses `fetch(..., keepalive, credentials: 'omit')`; same-origin/local telemetry can still use `sendBeacon`.
- Browser smoke now has default, varied, public-econ, and deployed-output paths; `.github/workflows/deployed-browser-smoke.yml` runs deployed browser smoke manually and weekly, uploads screenshots, and is deliberately separate from every push deploy.
- Deployed browser smoke has now passed for default, varied, and public-econ paths. The public-econ workflow uses deterministic seed `public-econ-2` and proves White House, semiconductor-fab, and market-crash imagery on production Pages.
- Dependency-security posture is hardened: production `npm audit --omit=dev` is clean after upgrading Hono, Drizzle ORM, Wrangler/Workers types, Vite/PostCSS, React, and patched `picomatch` transitive overrides. Local Node floor is now 22+; GitHub uses Node 24.
- Remaining full `npm audit` findings are four moderate dev-only `drizzle-kit`/old esbuild-loader advisories; `npm audit fix --force` would downgrade `drizzle-kit`, so monitor upstream instead.

Validation:
- Passed previously for ALT-38: `npm test`, `npm run lint`, `npm run validate:content`, `npm run simulate:balance`, `npm run db:migrate:plan`, `npm run build`, and `git diff --check`.
- Passed today: `bash -n scripts/verify-deploy.sh`, `VITE_API_BASE_URL=https://escalation-api.rjameson.workers.dev npm run build --workspace @wargames/web`, `npm run typecheck --workspace @wargames/web`, `npm run verify:deploy`, and `PLAYTEST_WEB_URL=https://escalation-web.pages.dev PLAYTEST_OUTPUT_DIR=output/playwright-deployed npm run smoke:browser`.
- GitHub run `25508927459` manually verified the new deployed browser smoke workflow: Node 24, Playwright Chromium install, six decision windows, mandate report reached, and 14 screenshots uploaded as artifact `6860857832`.
- Passed for dependency-security slice: `npm --cache ./tmp/npm-cache audit --omit=dev --json`, `npm --cache ./tmp/npm-cache ls picomatch`, `npm run lint`, `npm test`, `npm run validate:content`, `npm run simulate:balance`, `npm run test:token-regression`, `npm run db:migrate:plan`, and `npm run build`.
- GitHub Deploy run `25511497622` succeeded for `41bbb3c`; local `npm run verify:deploy` also passed after deploy.
- GitHub Deploy run `25513612449` succeeded for `d852d26`; deployed browser smoke runs `25512759745` (`varied`) and `25513708960` (`public-econ`, artifact `6862933387`) passed.

Next:
- Continue vertical-slice hardening beyond ALT-38; remaining dependency note is to monitor `drizzle-kit` for a dev-only audit fix that does not downgrade the toolkit.
