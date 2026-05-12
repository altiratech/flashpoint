# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- `main` is pushed to `origin/main`; latest pushed app/runtime commits include `eb922f0` (setup clock chrome sync), `3ed708c` (live scenario return-to-setup), and `462933c` (primary continue latest run).
- Linear `ALT-38` is implemented through deployed API/web verification: D1-backed rate limits, ordered remote D1 migrations, retry/idempotency tests, bootstrap ETag caching, Pages + Worker smoke coverage, production 429 proof, and bounded expired-bucket retention.
- Deployed Pages bakes `VITE_API_BASE_URL=https://escalation-api.rjameson.workers.dev`; `scripts/verify-deploy.sh` fails if the deployed JS bundle does not reference the expected Worker API origin.
- Reports open with a `Run Snapshot`; completed reports, active runs, and recent setup activity are indexed locally so users can resume, reopen, remove stale entries, jump from activity rows, and understand recent run state after reload.
- Setup promotes the latest active run, reflects selected clock mode, and live scenarios can return to setup/recovery shelves without a page reload.
- New local slice: setup/live/report and turn-stage transitions now reset window scroll to the top and move keyboard focus to the active `<main>` surface, including initial setup after bootstrap.
- New local audit slice: gameplay text now has a 0.68rem rendered floor with larger body copy, and obvious policy-terminal labels were rewritten to plainer player language (`The Situation`, `Your Call`, `What Do You Do?`, `Your Move`, `Warning Signs`).
- `docs/UX_MULTIAGENT_REVIEW_2026-05-12.md` captures the multi-agent UX/product review: fix now, prototype next, save for later, do not do, agent assignments, and review criteria.
- Client telemetry writes explicit ISO timestamps from the API layer, avoiding the prior literal `CURRENT_TIMESTAMP` values in remote D1 rows.
- `.github/workflows/verify-rate-limit.yml` is a manual production diagnostic for the no-op `POST /api/rate-limit-smoke` limiter path.
- Browser smoke has default, varied, public-econ, and deployed-output paths; `.github/workflows/deployed-browser-smoke.yml` runs manually/weekly, verifies fresh remote D1 telemetry, and uploads screenshots plus context/log/summary diagnostics.
- Deploy verifies remote D1 schema before Worker deploy, writes a compact GitHub run summary, and uploads 14-day `flashpoint-deploy-verification-*` artifacts.
- Dependency-security posture is hardened; production `npm audit --omit=dev` is clean. Remaining full `npm audit` findings are four moderate dev-only `drizzle-kit`/old esbuild-loader advisories; monitor upstream instead of forcing a downgrade.

Validation:
- Current audit slice passed: `npm run lint`, full `npm test`, `git diff --check`, `npm run build`, and browser checks at desktop plus 390px mobile proving no visible tiny text below the 0.68rem floor and no horizontal overflow.
- Current scroll/focus slice passed: `npm run lint`, full `npm test`, `git diff --check`, `npm run build`, reviewer approval, and browser verification at desktop plus 390px mobile for setup -> live, summary -> decision, return to setup, report open, and initial setup after bootstrap.
- Recent app slices passed `npm run lint`, full `npm test`, `git diff --check`, `npm run build`, and local browser completed-report plus active-run reload/resume/remove/clear/recent-activity/clock-mode/live-return/continue-latest flows at desktop and 390px mobile.
- GitHub Deploy run `25705387122` succeeded for `eb922f0` with artifact `6932923493`; run `25708569214` succeeded for `3ed708c` with artifact `6934047934`; run `25709500869` succeeded for `462933c` with artifact `6934351772`.

Next:
- Continue app-facing vertical slices. Recommended next: implement the persistent selected-response review strip before commit, then continue the briefing density and hero-image promotion slices from `PRODUCT_AUDIT.md`.
