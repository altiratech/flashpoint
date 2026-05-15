# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- `main` is ahead of `origin/main` with local playable-v1 hardening commits; do not push without deployment approval because `main` pushes trigger the live site pipeline.
- ALT-38 deployed API/web verification is complete; no Cloudflare, D1, DNS, workflow-secret, or production-config changes are in the current local slice.
- The flagship loop is locally playable end-to-end: setup -> first briefing -> decision review -> committed choices -> immediate consequences -> mandate report -> setup return -> active-run/report reopen and local cleanup.
- Setup is lighter and game-like, with the U.S. household crisis image promoted and admin-style chrome reduced.
- Briefings are less card-heavy, keep stronger photographic crisis evidence in the hero slot, carry Homefront pressure through gas/groceries/retirement/family-text signals, and now promote the resolved turn's consequence images before generic beat previews.
- Opening Homefront values are now tense without overstating day-one panic; later meter deterioration still escalates ordinary-life pressure.
- The selected-response review strip owns the primary commit action so decision mode no longer shows duplicate commit controls.
- The final mandate report preserves selected variant/custom action labels, includes Homefront consequences, and now promotes a state-derived aftermath image from existing local raster assets.
- Active-run recovery now resolves expired countdowns on resume instead of reopening stale decisions.
- The setup `Continue Latest Run` panel now has a direct Remove action for the latest active run.
- Browser smoke coverage includes default, varied, strict public-econ, desktop recovery/reopen/cleanup, 390px mobile recovery/reopen/cleanup, and 390px public-econ image coverage.

Validation:
- Passed: `npm run validate:content`, `npm run diagnose:visual-targets`, `npm run diagnose:decision-visuals`, `npm run simulate:balance`, `npm run lint`, full `npm test`, `npm run test:token-regression`, `git diff --check`, `npm run build`.
- Passed browser checks: `npm run smoke:browser`, `npm run smoke:browser:varied`, strict `npm run smoke:browser:public-econ`, 390px strict public-econ via `node --import tsx scripts/full-run-browser-smoke.ts`, `npm run smoke:browser:recovery`, and 390px mobile recovery smoke.

Next:
- Ryan decides whether to approve push/deploy for the latest local hardening commits.
- Remaining non-blocking product work: selected-decision imagery is intentionally absent for v1 to keep the review/commit moment focused; continue report/detail copy cleanup where policy-room language remains.
