# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- `main` is pushed to `origin/main`; latest app/runtime commits include `0e54056` (deploy verification run summary), `ba0f591` (diagnostic retention policy), and `c42ec73` (post-game report review).
- Linear `ALT-38` is implemented through deployed API/web verification: D1-backed `rate_limit_buckets`, route-normalized API rate-limit keys, ordered remote D1 migrations, retry/idempotency tests, bootstrap ETag caching, Pages + Worker smoke coverage, production 429 proof, and bounded expired-bucket retention.
- Deployed Pages bakes `VITE_API_BASE_URL=https://escalation-api.rjameson.workers.dev`; `scripts/verify-deploy.sh` fails if the deployed JS bundle does not reference the expected Worker API origin.
- Post-game reports now open with a `Run Snapshot` review surface: strategic read, pivotal decision, alternative line, final pressure, final turn count, episode short ID, and anchor chips into report sections.
- Client telemetry now writes explicit ISO timestamps from the API layer, avoiding the prior literal `CURRENT_TIMESTAMP` values in remote D1 rows.
- `.github/workflows/verify-rate-limit.yml` is a manual production diagnostic for the no-op `POST /api/rate-limit-smoke` limiter path; it proves normal responses before the threshold and a 429 with positive `Retry-After`.
- Browser smoke has default, varied, public-econ, and deployed-output paths; `.github/workflows/deployed-browser-smoke.yml` runs manually/weekly, verifies fresh remote D1 telemetry, and uploads screenshots plus context/log/summary diagnostics.
- Deploy verifies remote D1 schema before Worker deploy, writes a compact GitHub run summary, and uploads 14-day `flashpoint-deploy-verification-*` artifacts; deployed smoke diagnostics also use explicit 14-day retention.
- Deployed browser smoke has passed for default, varied, and public-econ paths. The public-econ path proves White House, semiconductor-fab, and market-crash imagery on production Pages.
- Dependency-security posture is hardened: production `npm audit --omit=dev` is clean after upgrading Hono, Drizzle ORM, Wrangler/Workers types, Vite/PostCSS, React, and patched `picomatch` transitive overrides. Local Node floor is now 22+; GitHub uses Node 24.
- Remaining full `npm audit` findings are four moderate dev-only `drizzle-kit`/old esbuild-loader advisories; `npm audit fix --force` would downgrade `drizzle-kit`, so monitor upstream instead.

Validation:
- Passed today for diagnostic-retention hardening: `npm run verify:diagnostic-retention`, `node --check scripts/check-diagnostic-retention.mjs`, `git diff --check`, `npm run lint`, `npm run ci:phase1`, and `npm run build`.
- Passed today for report-review product slice: `npm run lint`, `npm test -- tests/engine/report-causality.test.ts`, full `npm test`, `git diff --check`, `npm run build`, and local browser completion flows at desktop and 390px mobile.
- GitHub Verify Telemetry run `25515946549` passed against remote D1: `session_start=1`, `decision_made=6`, `game_completed=1`, with ISO timestamps from `2026-05-07T18:57:25.991Z` through `2026-05-07T18:57:33.676Z`.
- GitHub Deploy run `25522467022` succeeded for `c9a2f6f`; deployed browser smoke run `25522550433` passed the combined browser + fresh telemetry gate with not-before `2026-05-07T21:17:11Z`, artifact `6866605807`, and counts of 1 session, 6 decisions, and 1 completion.
- GitHub Deploy run `25523189838` succeeded for `a419279`; the new remote D1 schema verifier proved 11 runtime tables and 9 named indexes before the Worker deploy. Prior run `25523069627` intentionally failed on legacy nullable `episodes.adversary_profile_id`, then the verifier was scoped to runtime-required existence/type for that hot-added column.
- GitHub Deploy run `25530855073` succeeded for `68414fe`; Verify Rate Limit run `25530923840` passed against production with limit 120, 120 allowed responses, 429 on attempt 121, and `Retry-After: 53`.
- GitHub Deploy run `25579917726` succeeded for `ba0f591`; the new diagnostic-retention drift check passed inside `ci:phase1`, and artifact `6888977928` expires on `2026-05-22`.
- GitHub Deploy run `25585412691` succeeded for `c42ec73`; deploy verification uploaded artifact `6890896964`.

Next:
- Continue app-facing vertical slices. Recommended next: make the report/review path persistent and reopenable from a completed episode so the improved report becomes a usable review workflow, not just an end-screen.
