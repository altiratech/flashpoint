# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- `main` is cleanly pushed to `origin/main`; the latest deployed hardening commits are `1674f8a` (remote D1 migrations before deploy), `c08a6a9` (Pages build API-origin guardrail), `5684fb0` (cross-origin telemetry/browser-smoke fix), and `7570602` (Actions runtime + deployed browser smoke workflow).
- Linear `ALT-38` is implemented through deployed preview verification: D1-backed `rate_limit_buckets`, route-normalized API rate-limit keys, ordered remote D1 migrations, retry/idempotency tests, bootstrap ETag caching, and real Pages + Worker smoke coverage.
- GitHub Deploy run `25508810499` succeeded for `7570602`: quality gate, remote D1 migrations, API Worker deploy, Pages deploy, and production verification all passed on `actions/*@v6` with Node 24.
- Deployed Pages now bakes `VITE_API_BASE_URL=https://escalation-api.rjameson.workers.dev`; `scripts/verify-deploy.sh` fails if the deployed JS bundle does not reference the expected API origin.
- Cross-origin telemetry now avoids `sendBeacon` credentialed CORS semantics and uses `fetch(..., keepalive, credentials: 'omit')`; same-origin/local telemetry can still use `sendBeacon`.
- Browser smoke now has default, varied, public-econ, and deployed-output paths; `.github/workflows/deployed-browser-smoke.yml` runs deployed browser smoke manually and weekly, uploads screenshots, and is deliberately separate from every push deploy.
- Gameplay/UX recovery pass covers Linear `ALT-27` through `ALT-44`; `ALT-38` is no longer blocked on deployed API/web smoke.

Validation:
- Passed previously for ALT-38: `npm test`, `npm run lint`, `npm run validate:content`, `npm run simulate:balance`, `npm run db:migrate:plan`, `npm run build`, and `git diff --check`.
- Passed today: `bash -n scripts/verify-deploy.sh`, `VITE_API_BASE_URL=https://escalation-api.rjameson.workers.dev npm run build --workspace @wargames/web`, `npm run typecheck --workspace @wargames/web`, `npm run verify:deploy`, and `PLAYTEST_WEB_URL=https://escalation-web.pages.dev PLAYTEST_OUTPUT_DIR=output/playwright-deployed npm run smoke:browser`.
- GitHub run `25508927459` manually verified the new deployed browser smoke workflow: Node 24, Playwright Chromium install, six decision windows, mandate report reached, and 14 screenshots uploaded as artifact `6860857832`.
- Known red: `npm audit` remains red for no-fix Hono/Drizzle runtime advisories; see `DEPENDENCY_SECURITY_TRIAGE.md`.

Next:
- Continue vertical-slice hardening with dependency-security posture or add a targeted manual deployed smoke strategy for varied/public-econ paths if visual coverage needs production proof.
