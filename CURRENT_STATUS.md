# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- `main` is cleanly pushed to `origin/main`; the latest deployed hardening commits are `1674f8a` (remote D1 migrations before deploy), `c08a6a9` (Pages build API-origin guardrail), and `5684fb0` (cross-origin telemetry/browser-smoke fix).
- Linear `ALT-38` is implemented through deployed preview verification: D1-backed `rate_limit_buckets`, route-normalized API rate-limit keys, ordered remote D1 migrations, retry/idempotency tests, bootstrap ETag caching, and real Pages + Worker smoke coverage.
- GitHub Deploy run `25507708225` succeeded for `5684fb0`: quality gate, remote D1 migrations, API Worker deploy, Pages deploy, and production verification all passed.
- Deployed Pages now bakes `VITE_API_BASE_URL=https://escalation-api.rjameson.workers.dev`; `scripts/verify-deploy.sh` fails if the deployed JS bundle does not reference the expected API origin.
- Cross-origin telemetry now avoids `sendBeacon` credentialed CORS semantics and uses `fetch(..., keepalive, credentials: 'omit')`; same-origin/local telemetry can still use `sendBeacon`.
- Browser smoke now has default, varied, public-econ, and deployed-output paths; deployed default smoke reached the mandate report on `https://escalation-web.pages.dev`.
- Gameplay/UX recovery pass covers Linear `ALT-27` through `ALT-44`; `ALT-38` is no longer blocked on deployed API/web smoke.

Validation:
- Passed previously for ALT-38: `npm test`, `npm run lint`, `npm run validate:content`, `npm run simulate:balance`, `npm run db:migrate:plan`, `npm run build`, and `git diff --check`.
- Passed today: `bash -n scripts/verify-deploy.sh`, `VITE_API_BASE_URL=https://escalation-api.rjameson.workers.dev npm run build --workspace @wargames/web`, `npm run typecheck --workspace @wargames/web`, `npm run verify:deploy`, and `PLAYTEST_WEB_URL=https://escalation-web.pages.dev PLAYTEST_OUTPUT_DIR=output/playwright-deployed npm run smoke:browser`.
- Deployed browser smoke exercised six decision windows and reached `Mandate Assessment` with no captured console/page errors.
- Known red: `npm audit` remains red for no-fix Hono/Drizzle runtime advisories; see `DEPENDENCY_SECURITY_TRIAGE.md`.
- Known yellow: GitHub Actions warns that Node.js 20 action runtimes are deprecated for `actions/checkout@v4` and `actions/setup-node@v4`.

Next:
- Continue vertical-slice hardening with the GitHub Actions Node runtime warning and decide whether deployed full-browser smoke should become a manual/scheduled CI check.
