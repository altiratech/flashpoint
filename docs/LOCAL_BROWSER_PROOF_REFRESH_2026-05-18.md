# Flashpoint Local Browser Proof Refresh

Date: 2026-05-18

Scope: fresh local desktop, 390px mobile, timed, recovery, and public/economic browser proof for playable-v1 readiness.

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

```bash
PATH=/Users/ryanjameson/.npm/_npx/52027bd8fc0022aa/node_modules/.bin:$PATH \
PLAYTEST_TIMER_MODE=standard \
PLAYTEST_OUTPUT_DIR=output/playwright-2026-05-18-refresh-timed \
npm run smoke:browser
```

```bash
PATH=/Users/ryanjameson/.npm/_npx/52027bd8fc0022aa/node_modules/.bin:$PATH \
PLAYTEST_VIEWPORT_WIDTH=390 \
PLAYTEST_VIEWPORT_HEIGHT=900 \
PLAYTEST_OUTPUT_DIR=output/playwright-2026-05-18-refresh-recovery-mobile \
npm run smoke:browser:recovery
```

```bash
PATH=/Users/ryanjameson/.npm/_npx/52027bd8fc0022aa/node_modules/.bin:$PATH \
PLAYTEST_RESPONSE_STRATEGY=public-econ \
PLAYTEST_SEED=public-econ-2 \
PLAYTEST_VIEWPORT_WIDTH=390 \
PLAYTEST_VIEWPORT_HEIGHT=900 \
PLAYTEST_OUTPUT_DIR=output/playwright-2026-05-18-refresh-public-econ-mobile \
npm run smoke:browser
```

## Result

Both smokes passed.

| Artifact | Result |
| --- | --- |
| `output/playwright-2026-05-18-refresh-desktop/smoke-summary.json` | `status: "passed"`, viewport `1440x1100`, 6 decision windows, no console errors, no page errors |
| `output/playwright-2026-05-18-refresh-mobile/smoke-summary.json` | `status: "passed"`, viewport `390x900`, 6 decision windows, no console errors, no page errors |
| `output/playwright-2026-05-18-refresh-timed/smoke-summary.json` | `status: "passed"`, standard timed mode, first briefing clock and first-decision extension verified |
| `output/playwright-2026-05-18-refresh-recovery-mobile/smoke-summary.md` | passed, viewport `390x900`, active-run resume/removal and completed-report reopen/removal covered |
| `output/playwright-2026-05-18-refresh-public-econ-mobile/smoke-summary.json` | `status: "passed"`, viewport `390x900`, public/economic image route with seed `public-econ-2`, 5 decision windows, no console errors, no page errors |

Representative screenshots inspected:

- `output/playwright-2026-05-18-refresh-desktop/99-report.png`
- `output/playwright-2026-05-18-refresh-mobile/01-decision-selected.png`
- `output/playwright-2026-05-18-refresh-mobile/99-report.png`
- `output/playwright-2026-05-18-refresh-timed/01-first-briefing.png`
- `output/playwright-2026-05-18-refresh-recovery-mobile/09-report-removed.png`
- `output/playwright-2026-05-18-refresh-public-econ-mobile/99-report.png`

Visual read:
- Desktop report rendered the final report, aftermath image, run recap, and Homefront section coherently.
- Mobile selected-decision screenshot showed the selected response, commit path, variant choices, and advisor surfaces without hiding the primary action.
- Mobile report opened cleanly with the final report text, return-to-setup action, aftermath image, and run recap visible.
- Timed briefing showed the authored `CLOCK 90S` state and pressure copy before the first decision.
- Recovery cleanup returned to setup with the local run/report shelf cleared.
- Public/economic mobile report rendered cleanly after surfacing the expected domestic/economic image route.

## Remaining Gate

This refresh strengthens local playable-v1 evidence only. Canonical readiness still requires Ryan approval to push/deploy, then production `npm run verify:deploy` and deployed desktop/mobile browser smoke.
