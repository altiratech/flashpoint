# Flashpoint Local Browser Proof Refresh

Date: 2026-05-18

Scope: fresh local desktop and 390px mobile browser proof for playable-v1 readiness.

## Runtime

- Local API/web server started with cached Node `v22.22.3` by putting `/Users/ryanjameson/.npm/_npx/52027bd8fc0022aa/node_modules/.bin` first on `PATH`.
- Web URL: `http://127.0.0.1:5173`
- API URL: `http://localhost:8787`
- Server was stopped after verification; ports `5173` and `8787` were clear after the run.

## Commands

```bash
PATH=/Users/ryanjameson/.npm/_npx/52027bd8fc0022aa/node_modules/.bin:$PATH \
PLAYTEST_OUTPUT_DIR=output/playwright-2026-05-18-refresh-desktop \
npm run smoke:browser
```

```bash
PATH=/Users/ryanjameson/.npm/_npx/52027bd8fc0022aa/node_modules/.bin:$PATH \
PLAYTEST_VIEWPORT_WIDTH=390 \
PLAYTEST_VIEWPORT_HEIGHT=900 \
PLAYTEST_OUTPUT_DIR=output/playwright-2026-05-18-refresh-mobile \
npm run smoke:browser
```

## Result

Both smokes passed.

| Artifact | Result |
| --- | --- |
| `output/playwright-2026-05-18-refresh-desktop/smoke-summary.json` | `status: "passed"`, viewport `1440x1100`, 6 decision windows, no console errors, no page errors |
| `output/playwright-2026-05-18-refresh-mobile/smoke-summary.json` | `status: "passed"`, viewport `390x900`, 6 decision windows, no console errors, no page errors |

Representative screenshots inspected:

- `output/playwright-2026-05-18-refresh-desktop/99-report.png`
- `output/playwright-2026-05-18-refresh-mobile/01-decision-selected.png`
- `output/playwright-2026-05-18-refresh-mobile/99-report.png`

Visual read:
- Desktop report rendered the final report, aftermath image, run recap, and Homefront section coherently.
- Mobile selected-decision screenshot showed the selected response, commit path, variant choices, and advisor surfaces without hiding the primary action.
- Mobile report opened cleanly with the final report text, return-to-setup action, aftermath image, and run recap visible.

## Remaining Gate

This refresh strengthens local playable-v1 evidence only. Canonical readiness still requires Ryan approval to push/deploy, then production `npm run verify:deploy` and deployed desktop/mobile browser smoke.
