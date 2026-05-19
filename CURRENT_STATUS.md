# Current Status

Product: Flashpoint / ESCALATION scenario and response simulation.

Current state:
- Canonical playable v1 is published on `main` and deployed to the Cloudflare Pages/Worker preview pair.
- The follow-up image/UX polish is pushed and deployed on `main`.
- Northern Strait hero cues use newer U.S./domestic raster assets where available, stale generated SVG/fallback art is demoted when real images exist, first-time navigation/copy density is simplified, and the known old photo set is retired from live selection.
- Public preview: `https://escalation-web.pages.dev`.

Validation:
- Published playable-v1 proof remains in `docs/DEPLOYED_PLAYABLE_V1_VERIFICATION_2026-05-18.md`.
- Local polish verification passed: `npm run validate:content`, `npm run diagnose:decision-visuals`, `npm run diagnose:visual-targets`, `npm run build`, `git diff --check`, desktop browser smoke, and 390px mobile browser smoke.
- Deploy workflow `26092265833` passed quality gate, API deploy, web deploy, and production verification for commit `e530c04`.
- Fresh deployed verification passed: `npm run verify:deploy`, desktop browser smoke, 390px mobile browser smoke, and manual screenshot inspection.
- Deployed screenshots are in `output/playwright-image-ux-polish-deployed/` and `output/playwright-image-ux-polish-deployed-mobile/`.
- Stale-photo corrective deployment `26128350857` passed; `npm run verify:deploy`, deployed desktop smoke, deployed 390px mobile smoke, and waited screenshot inspection passed.
- The global shell still reports Node v20.17.0, so local verification used the Node 22 path from the cached Playwright runtime.

Next:
- Ryan can review the public preview at `https://escalation-web.pages.dev`.
- Non-blocking follow-up: GitHub previously reported one moderate Dependabot vulnerability notice; triage separately from gameplay polish.
