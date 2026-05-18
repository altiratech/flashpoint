# Flashpoint Deployed Playable V1 Verification

Date: 2026-05-18

Scope: post-approval publication and deployed browser verification for canonical playable-v1 readiness.

## Publication

- Published branch: `main`
- Published commit: `9a3b3ac31636a408ce493e76c8aae66f4e36018f`
- GitHub remote `main`: `9a3b3ac31636a408ce493e76c8aae66f4e36018f`
- GitHub Deploy run: `26008508011`
- Run result: passed

Jobs passed:
- `quality_gate`
- `deploy_api`
- `deploy_web`
- `verify_deploy`

## Production Verifier

Command:

```bash
npm run verify:deploy
```

Result: passed.

Evidence:
- `output/deploy-verification/evidence.json`
- API origin: `https://escalation-api.rjameson.workers.dev`
- Web URL: `https://escalation-web.pages.dev`
- Verified scenario: `northern_strait_black_swan`
- Web bundle references the expected API origin.

## Deployed Browser Smokes

Desktop command:

```bash
PATH=/Users/ryanjameson/.npm/_npx/52027bd8fc0022aa/node_modules/.bin:$PATH \
PLAYTEST_WEB_URL=https://escalation-web.pages.dev \
PLAYTEST_OUTPUT_DIR=output/playwright-deployed-current \
npm run smoke:browser
```

Result: passed.

Mobile command:

```bash
PATH=/Users/ryanjameson/.npm/_npx/52027bd8fc0022aa/node_modules/.bin:$PATH \
PLAYTEST_WEB_URL=https://escalation-web.pages.dev \
PLAYTEST_VIEWPORT_WIDTH=390 \
PLAYTEST_VIEWPORT_HEIGHT=900 \
PLAYTEST_OUTPUT_DIR=output/playwright-deployed-current-mobile \
npm run smoke:browser
```

Result: passed.

Evidence:
- `output/playwright-deployed-current/smoke-summary.json`: passed, viewport `1440x1100`, 6 decision windows, no console errors, no page errors.
- `output/playwright-deployed-current-mobile/smoke-summary.json`: passed, viewport `390x900`, 6 decision windows, no console errors, no page errors.

Representative screenshots inspected:
- `output/playwright-deployed-current/99-report.png`
- `output/playwright-deployed-current-mobile/01-decision-selected.png`
- `output/playwright-deployed-current-mobile/99-report.png`

Visual read:
- Desktop report rendered the final report, aftermath image, run recap, and Homefront section coherently.
- Mobile selected-decision screenshot showed the selected response and commit path.
- Mobile report opened cleanly with final report text, return-to-setup action, aftermath image, and run recap visible.

## Verdict

Canonical playable-v1 readiness is verified for the current production preview pair. No remaining playable-v1 readiness gate is open.
