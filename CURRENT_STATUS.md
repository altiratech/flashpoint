# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- `main` has a local v1 gameplay hardening slice ready to commit; do not push without deployment approval because `main` pushes trigger the live site pipeline.
- ALT-38 deployed API/web verification is complete: Pages uses `VITE_API_BASE_URL=https://escalation-api.rjameson.workers.dev`, deploy verification checks the bundled API origin, and recent production smoke/telemetry/rate-limit paths are proven.
- The core playable loop works locally: setup -> live briefing -> decision windows -> committed choices -> mandate report.
- Setup is lighter and more game-like: duplicate admin-style Run Profile/Operator Notes surfaces are gone, Replay Settings is collapsed, and the first screen now shows a local U.S. household crisis image.
- Live briefings keep the stronger scene image in the hero slot, demote maps/SVGs to supporting evidence, and carry Homefront pressure through gas, groceries, 401k, and family-text signals.
- Lower live-briefing detail is less card-heavy: Truth Model items render as compact reads, Watch Items default to one outside signal, and Immediate Outcome uses one scan-friendly readout instead of three repeated cards.
- The final report now includes a Homefront section so ordinary-life consequences remain visible at the end of the run.
- Browser smoke has default, varied, public-econ, and deployed-output paths; the local harness accepts current UI labels and checks public/economic coverage categories instead of unreachable exact-image assertions.

Validation:
- Passed: `npm run validate:content`, `npm run diagnose:visual-targets`, `npm run lint`, full `npm test`, `git diff --check`, `npm run build`.
- Passed browser checks: default full-run smoke, varied full-run smoke, public-econ full-run smoke, desktop screenshots, density-slice screenshot review, and 390px mobile setup -> first briefing -> decision view.
- Mobile verification confirmed no horizontal overflow at 390px; refreshed local console output had no app runtime errors after the favicon fix.

Next:
- Recommended next slice: tune Homefront thresholds/copy across later turns and continue image QA on non-default paths.
