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
- Optional custom-response input now stays collapsed and quiet until opened, keeping the normal response-selection workflow dominant on desktop and mobile.
- Action cards and selected-response consequence reads now use direct player-facing language; bare ambiguous commands like `sanctions` still route to review instead of accidental execution.
- The final mandate report preserves selected variant/custom action labels, includes Homefront consequences, and now promotes a state-derived aftermath image from existing local raster assets.
- Report labels, advisor readouts, and generated causality/detail lines use plainer English in the player-facing surfaces instead of policy-room shorthand.
- Active-run recovery now resolves expired countdowns on resume instead of reopening stale decisions.
- The setup `Continue Latest Run` panel now has a direct Remove action for the latest active run.
- Browser smoke coverage includes default, varied, strict public-econ, desktop recovery/reopen/cleanup, 390px mobile recovery/reopen/cleanup, and 390px public-econ image coverage; the smoke harness now waits on current report labels and avoids hanging on the tall report screenshot.

Validation:
- Passed: `npm run validate:content`, `npm run diagnose:visual-targets`, `npm run diagnose:decision-visuals`, `npm run simulate:balance`, `npm run lint`, full `npm test`, `npm run test:token-regression`, `git diff --check`, `npm run build`.
- Passed browser checks: `npm run smoke:browser`, `npm run smoke:browser:varied`, strict `npm run smoke:browser:public-econ`, `npm run smoke:browser:recovery`, 390px mobile recovery smoke, and a 390px custom-response open/review smoke.

Next:
- Ryan decides whether to approve push/deploy for the latest local hardening commits.
- Remaining non-blocking product work: selected-decision imagery is intentionally absent for v1 to keep the review/commit moment focused; deeper authored debrief/report text can still be tuned if Ryan wants a more civilian voice throughout.
