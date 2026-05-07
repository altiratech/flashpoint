# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- `main` is pushed to `origin/main`; latest hardening commits are `3a0107f` (client telemetry timestamp fix), `c9a2f6f` (fresh telemetry gate inside deployed smoke), and `a419279` (remote D1 schema verifier).
- Linear `ALT-38` is implemented through deployed API/web verification: D1-backed `rate_limit_buckets`, route-normalized API rate-limit keys, ordered remote D1 migrations, retry/idempotency tests, bootstrap ETag caching, and Pages + Worker smoke coverage.
- Deployed Pages bakes `VITE_API_BASE_URL=https://escalation-api.rjameson.workers.dev`; `scripts/verify-deploy.sh` fails if the deployed JS bundle does not reference the expected Worker API origin.
- Cross-origin telemetry uses `fetch(..., keepalive, credentials: 'omit')`; same-origin/local telemetry can still use `sendBeacon`.
- Client telemetry now writes explicit ISO timestamps from the API layer, avoiding the prior literal `CURRENT_TIMESTAMP` values in remote D1 rows.
- `.github/workflows/verify-telemetry.yml` remains a manual remote D1 diagnostic for required `session_start`, `decision_made`, and `game_completed` events.
- Browser smoke has default, varied, public-econ, and deployed-output paths; `.github/workflows/deployed-browser-smoke.yml` runs deployed smoke manually/weekly, accepts deterministic seeds, uploads screenshots, and now verifies fresh remote D1 telemetry after each enabled smoke run.
- Deploy now verifies remote D1 schema after migrations and before Worker deploy via `npm run verify:d1:schema:remote`, checking runtime tables, critical columns, and named indexes.
- Deployed browser smoke has passed for default, varied, and public-econ paths. The public-econ path proves White House, semiconductor-fab, and market-crash imagery on production Pages.
- Dependency-security posture is hardened: production `npm audit --omit=dev` is clean after upgrading Hono, Drizzle ORM, Wrangler/Workers types, Vite/PostCSS, React, and patched `picomatch` transitive overrides. Local Node floor is now 22+; GitHub uses Node 24.
- Remaining full `npm audit` findings are four moderate dev-only `drizzle-kit`/old esbuild-loader advisories; `npm audit fix --force` would downgrade `drizzle-kit`, so monitor upstream instead.

Validation:
- Passed previously for ALT-38: `npm test`, `npm run lint`, `npm run validate:content`, `npm run simulate:balance`, `npm run db:migrate:plan`, `npm run build`, and `git diff --check`.
- Passed today for telemetry hardening: `node --check scripts/verify-telemetry-remote.mjs`, `npm run lint`, `npm test`, `git diff --check`, and `npm run build`.
- GitHub Deploy run `25511497622` succeeded for `41bbb3c`; local `npm run verify:deploy` also passed after deploy.
- GitHub Deploy run `25513612449` succeeded for `d852d26`; deployed browser smoke runs `25512759745` (`varied`) and `25513708960` (`public-econ`, artifact `6862933387`) passed.
- GitHub Deploy run `25515741321` succeeded for `3a0107f`; deployed browser smoke run `25515887208` passed with artifact `6863855083`.
- GitHub Verify Telemetry run `25515946549` passed against remote D1: `session_start=1`, `decision_made=6`, `game_completed=1`, with ISO timestamps from `2026-05-07T18:57:25.991Z` through `2026-05-07T18:57:33.676Z`.
- GitHub Deploy run `25522467022` succeeded for `c9a2f6f`; deployed browser smoke run `25522550433` passed the combined browser + fresh telemetry gate with not-before `2026-05-07T21:17:11Z`, artifact `6866605807`, and counts of 1 session, 6 decisions, and 1 completion.
- GitHub Deploy run `25523189838` succeeded for `a419279`; the new remote D1 schema verifier proved 11 runtime tables and 9 named indexes before the Worker deploy. Prior run `25523069627` intentionally failed on legacy nullable `episodes.adversary_profile_id`, then the verifier was scoped to runtime-required existence/type for that hot-added column.

Next:
- Continue vertical-slice hardening beyond ALT-38; next narrow slice should be another production-observable risk, with `drizzle-kit` still monitored for a no-downgrade dev-only audit fix.
