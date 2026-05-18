# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- Canonical playable v1 is published on `main` and deployed to the Cloudflare Pages/Worker preview pair.
- Verified playable product commit: `9a3b3ac31636a408ce493e76c8aae66f4e36018f`.
- GitHub Deploy run `26008508011` succeeded: quality gate, API deploy, web deploy, and built-in deployment verification all passed.
- Production API/web verification passed locally via `npm run verify:deploy`; evidence is in `output/deploy-verification/evidence.json`.
- Deployed desktop browser smoke passed against `https://escalation-web.pages.dev`; evidence is in `output/playwright-deployed-current/`.
- Deployed 390px mobile browser smoke passed against `https://escalation-web.pages.dev`; evidence is in `output/playwright-deployed-current-mobile/`.
- Required deployed screenshots were inspected: desktop report, mobile selected-decision, and mobile report.
- The flagship loop is playable end-to-end in production: setup -> first briefing -> decision review -> committed choices -> immediate consequences -> mandate report -> setup return.

Validation:
- Pre-publish local gate passed: `npm run verify:playable-v1:local` checked 8 smoke summaries, 12 screenshot/artifacts, and 2 recovery summaries.
- Production verifier passed: API health, bootstrap, profile creation, episode start, web shell, and deployed web bundle API-origin assertion.
- Deployed browser smokes completed to report with no console errors and no page errors on desktop and 390px mobile.
- The global shell still reports Node v20.17.0, so normal `npm run dev`/`quickstart` intentionally fail early until the shell uses Node >=22; `.node-version` and `.nvmrc` point version managers to Node 22.

Next:
- No playable-v1 readiness gate remains open.
- Non-blocking follow-up: GitHub reported one moderate Dependabot vulnerability notice on push; triage separately from playable-v1 readiness.
