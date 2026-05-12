# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- `main` is pushed to `origin/main`; latest app/runtime commits include `eb922f0` (setup clock chrome sync), `3ed708c` (live scenario return-to-setup), and `462933c` (primary continue latest run).
- Linear `ALT-38` is implemented through deployed API/web verification: D1-backed `rate_limit_buckets`, route-normalized API rate-limit keys, ordered remote D1 migrations, retry/idempotency tests, bootstrap ETag caching, Pages + Worker smoke coverage, production 429 proof, and bounded expired-bucket retention.
- Deployed Pages bakes `VITE_API_BASE_URL=https://escalation-api.rjameson.workers.dev`; `scripts/verify-deploy.sh` fails if the deployed JS bundle does not reference the expected Worker API origin.
- Reports now open with a `Run Snapshot`; completed reports, active runs, and recent setup activity are indexed locally so users can resume, reopen, remove stale entries, jump from activity rows, and understand recent run state after reload. Setup now promotes the latest active run, reflects the selected clock mode, and live scenarios can return to setup/recovery shelves without a page reload.
- Client telemetry now writes explicit ISO timestamps from the API layer, avoiding the prior literal `CURRENT_TIMESTAMP` values in remote D1 rows.
- `.github/workflows/verify-rate-limit.yml` is a manual production diagnostic for the no-op `POST /api/rate-limit-smoke` limiter path; it proves normal responses before the threshold and a 429 with positive `Retry-After`.
- Browser smoke has default, varied, public-econ, and deployed-output paths; `.github/workflows/deployed-browser-smoke.yml` runs manually/weekly, verifies fresh remote D1 telemetry, and uploads screenshots plus context/log/summary diagnostics.
- Deploy verifies remote D1 schema before Worker deploy, writes a compact GitHub run summary, and uploads 14-day `flashpoint-deploy-verification-*` artifacts; deployed smoke diagnostics also use explicit 14-day retention.
- Deployed browser smoke has passed for default, varied, and public-econ paths. The public-econ path proves White House, semiconductor-fab, and market-crash imagery on production Pages.
- Dependency-security posture is hardened: production `npm audit --omit=dev` is clean after upgrading Hono, Drizzle ORM, Wrangler/Workers types, Vite/PostCSS, React, and patched `picomatch` transitive overrides. Local Node floor is now 22+; GitHub uses Node 24.
- Remaining full `npm audit` findings are four moderate dev-only `drizzle-kit`/old esbuild-loader advisories; `npm audit fix --force` would downgrade `drizzle-kit`, so monitor upstream instead.

Validation:
- Passed today for diagnostic-retention hardening: `npm run verify:diagnostic-retention`, `node --check scripts/check-diagnostic-retention.mjs`, `git diff --check`, `npm run lint`, `npm run ci:phase1`, and `npm run build`.
- Passed today for report review/reopen/resume/cleanup/activity/clock-chrome/live-return/continue-latest slices: `npm run lint`, full `npm test`, `git diff --check`, `npm run build`, and local browser completed-report plus active-run reload/resume/remove/clear/recent-activity/clock-mode/live-return/continue-latest flows at desktop and 390px mobile.
- GitHub Verify Telemetry run `25515946549` passed against remote D1: `session_start=1`, `decision_made=6`, `game_completed=1`, with ISO timestamps from `2026-05-07T18:57:25.991Z` through `2026-05-07T18:57:33.676Z`.
- GitHub Deploy run `25522467022` succeeded for `c9a2f6f`; deployed browser smoke run `25522550433` passed the combined browser + fresh telemetry gate with not-before `2026-05-07T21:17:11Z`, artifact `6866605807`, and counts of 1 session, 6 decisions, and 1 completion.
- GitHub Deploy run `25523189838` succeeded for `a419279`; the new remote D1 schema verifier proved 11 runtime tables and 9 named indexes before the Worker deploy. Prior run `25523069627` intentionally failed on legacy nullable `episodes.adversary_profile_id`, then the verifier was scoped to runtime-required existence/type for that hot-added column.
- GitHub Deploy run `25530855073` succeeded for `68414fe`; Verify Rate Limit run `25530923840` passed against production with limit 120, 120 allowed responses, 429 on attempt 121, and `Retry-After: 53`.
- GitHub Deploy run `25579917726` succeeded for `ba0f591`; the new diagnostic-retention drift check passed inside `ci:phase1`, and artifact `6888977928` expires on `2026-05-22`.
- GitHub Deploy run `25705387122` succeeded for `eb922f0` with artifact `6932923493`; run `25708569214` succeeded for `3ed708c` with artifact `6934047934`; run `25709500869` succeeded for `462933c` with artifact `6934351772`.

Next:
- Continue app-facing vertical slices. Recommended next: harden live decision clarity with a persistent selected-response review strip before commit.
