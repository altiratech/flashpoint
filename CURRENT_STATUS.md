# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- `main` is ahead of `origin/main` with local playable-v1 hardening commits; do not push without deployment approval because `main` pushes trigger the live site pipeline.
- ALT-38 deployed API/web verification is complete; no Cloudflare, D1, DNS, workflow-secret, or production-config changes are in the current local slice.
- Current deployed API/web verification still passes on the existing live baseline, but deployed browser smoke with the current local harness fails after reaching the report because live Pages has not received the local report-copy contract yet.
- The flagship loop is locally playable end-to-end: setup -> first briefing -> decision review -> committed choices -> immediate consequences -> mandate report -> setup return -> active-run/report reopen and local cleanup.
- Setup is lighter and game-like, with the U.S. household crisis image promoted and admin-style chrome reduced.
- Briefings are less card-heavy, cap truth reads to the strongest items, keep stronger photographic crisis evidence in the hero slot, quarantine generic `img_###` fallback art from support visuals when stronger evidence exists, carry Homefront pressure, and promote resolved-turn consequence images before generic beat previews.
- Opening Homefront values are now tense without overstating day-one panic; later meter deterioration still escalates ordinary-life pressure.
- Mobile decision entry now lands on the urgent call surface instead of the global header, with response cards visible in the first viewport.
- The selected-response review strip owns the primary commit action and appears only after a move is selected, so decision mode no longer shows duplicate or premature commit controls.
- Optional custom-response input now stays collapsed and quiet until opened, keeping the normal response-selection workflow dominant on desktop and mobile.
- Action cards and selected-response consequence reads now use direct player-facing language; bare ambiguous commands like `sanctions` still route to review instead of accidental execution.
- The final mandate report preserves selected variant/custom action labels, includes Homefront consequences, promotes a state-derived aftermath image, and surfaces pivotal-decision and alternate-path consequences in the opening recap.
- Final report labels, advisor readouts, missed-read notes, roads-not-taken labels, and Beijing-read sections use plainer English instead of policy-room shorthand, visible score math, decimal belief tables, or probability-style model averages.
- Timed mode is now real from the flagship opening: Standard timed starts with an authored 90-second clock, pressure copy appears in the briefing and decision clock, the first decision can extend time, and expired countdowns resolve across briefing/decision views and on resume.
- The setup `Continue Latest Run` panel now has a direct Remove action for the latest active run.
- Browser smoke coverage includes default, varied, strict public-econ, timed desktop/mobile, desktop recovery/reopen/cleanup, 390px mobile recovery/reopen/cleanup, and 390px public-econ image coverage; the smoke harness now captures top-of-report, report-recap, missed-room, and Beijing-read screenshots without hanging on the tall report, and no longer accepts old selected-response/response-envelope labels as passing fallbacks.

Validation:
- Current 2026-05-17 code-gate recheck passed: `npm run ci:phase1`, `npm run lint`, and `npm run build`.
- Fresh local browser proof passed under temporary Node 22 (`npx -y -p node@22 -c ...`): desktop full-run smoke, 390px mobile full-run smoke, 390px recovery/reopen/cleanup smoke, standard timed smoke, and 390px public-econ image-route smoke.
- The global shell still reports Node v20.17.0, so normal `npm run dev`/`quickstart` intentionally fail early until the shell uses Node >=22; `.node-version` and `.nvmrc` point version managers to Node 22.
- Prior browser coverage also includes varied, no-fallback-art, decision-entry/review, rendered-report readability, custom-response-through-report, and Beijing-read report smokes.

Next:
- Ryan decides whether to approve push/deploy for the latest local hardening commits.
- Remaining non-blocking product work: selected-decision imagery is intentionally absent for v1 to keep the review/commit moment focused; deeper authored debrief/report text can still be tuned if Ryan wants a more civilian voice throughout.
