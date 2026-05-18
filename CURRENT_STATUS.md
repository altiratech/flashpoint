# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- `main` is ahead of `origin/main` with local playable-v1 hardening commits; do not push without deployment approval because `main` pushes trigger the live site pipeline.
- ALT-38 deployed API/web verification is complete; no Cloudflare, D1, DNS, workflow-secret, or production-config changes are in the current local slice.
- Current deployed API/web verification still passes on the existing live baseline, but deployed browser smoke with the current local harness fails after reaching the report because live Pages has not received the local report-copy contract yet.
- The flagship loop is locally playable end-to-end: setup -> first briefing -> decision review -> committed choices -> immediate consequences -> mandate report -> setup return -> active-run/report reopen and local cleanup.
- Setup, briefings, decision review, custom response, timed mode, recovery/removal, final report, and report-copy surfaces have been hardened for the playable-v1 loop.
- Browser smoke coverage includes default, varied, strict public-econ, timed desktop/mobile, desktop recovery/reopen/cleanup, 390px mobile recovery/reopen/cleanup, and 390px public-econ image coverage.

Validation:
- Current 2026-05-17 code-gate recheck passed: `npm run ci:phase1`, `npm run lint`, and `npm run build`.
- Current 2026-05-18 local browser rerun passed under temporary Node 22 (`npx -y -p node@22 -c ...`): desktop full-run smoke and 390px mobile full-run smoke, with representative screenshots inspected in `output/playwright-node22-rerun-desktop/` and `output/playwright-node22-rerun-mobile/`.
- Current 2026-05-18 extended local browser rerun also passed under temporary Node 22: standard timed desktop smoke, 390px recovery/reopen/cleanup smoke, and 390px public-econ image-route smoke, with representative timed, recovery-cleanup, and public-econ report screenshots inspected.
- Fresh 2026-05-18 local browser proof refresh passed under cached Node 22: desktop, 390px mobile, timed desktop, 390px recovery, and 390px public-econ smokes in `output/playwright-2026-05-18-refresh-*`, with representative screenshots inspected.
- The global shell still reports Node v20.17.0, so normal `npm run dev`/`quickstart` intentionally fail early until the shell uses Node >=22; `.node-version` and `.nvmrc` point version managers to Node 22.
- Local playable-v1 evidence verifier: `npm run verify:playable-v1:local` checks the canonical Node 22 rerun artifacts plus the fresh 2026-05-18 browser proof refresh, required screenshot artifacts, recovery steps, console errors, and page errors.
- Readiness audit: `docs/PLAYABLE_V1_READINESS_AUDIT_2026-05-18.md` maps the goal requirements to current evidence, includes the local evidence verifier, avoids stale self-referential commit counts, and identifies deployment approval plus post-deploy smoke as the remaining canonical gate.
- UX review reconciliation: `docs/UX_MULTIAGENT_REVIEW_2026-05-12.md` now marks its original fix-now findings as covered locally by the playable-v1 evidence, with remaining ideas treated as optional polish unless a fresh browser pass finds a regression.
- Handoff reconciliation: `ESCALATION_CODEX_HANDOFF.md` now has a supersession note clarifying that early incomplete-timer/git/browser-validation claims are historical, not current local blockers.
- Post-deploy checklist: `docs/POST_DEPLOY_VERIFICATION_CHECKLIST_2026-05-18.md` captures the exact publication, production verifier, deployed browser smoke, screenshot inspection, and writeback steps to run after approval.

Next:
- Ryan decides whether to approve push/deploy for the latest local hardening commits.
- Remaining non-blocking product work: selected-decision imagery is intentionally absent for v1 to keep the review/commit moment focused; deeper authored debrief/report text can still be tuned if Ryan wants a more civilian voice throughout.
