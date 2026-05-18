# Flashpoint Post-Deploy Verification Checklist

Date: 2026-05-18

Scope: Use only after Ryan approves pushing/deploying the unpublished `main` commits.

## Do Not Start Until

- Ryan explicitly approves the push/deploy.
- The pushed branch is `main`.
- The intended local commit is recorded before push.
- The deployment pipeline has finished.

## Publication Check

After deployment completes, confirm GitHub `main` points at the intended commit:

```bash
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Pass condition: both commands identify the same commit.

## Production API And Web Check

Run the deployment verifier:

```bash
npm run verify:deploy
```

Default targets:

- Web: `https://escalation-web.pages.dev`
- API: `https://escalation-api.rjameson.workers.dev`
- Evidence: `output/deploy-verification/evidence.json`

Pass condition: the command exits `0`, `evidence.json` reports `status: "passed"`, the API bootstrap contains the expected scenario, profile creation works, episode start works, the web shell loads, and the web bundle references the API origin.

## Deployed Browser Smoke

Run desktop deployed smoke:

```bash
PLAYTEST_WEB_URL=https://escalation-web.pages.dev \
PLAYTEST_OUTPUT_DIR=output/playwright-deployed-current \
npm run smoke:browser
```

Run 390px mobile deployed smoke:

```bash
PLAYTEST_WEB_URL=https://escalation-web.pages.dev \
PLAYTEST_VIEWPORT_WIDTH=390 \
PLAYTEST_VIEWPORT_HEIGHT=900 \
PLAYTEST_OUTPUT_DIR=output/playwright-deployed-current-mobile \
npm run smoke:browser
```

Pass condition: both smokes exit `0`, complete the scripted run to report, and their summaries show no console errors and no page errors.

## Visual Inspection

Open representative screenshots before declaring canonical readiness:

- `output/playwright-deployed-current/99-report.png`
- `output/playwright-deployed-current-mobile/01-decision-selected.png`
- `output/playwright-deployed-current-mobile/99-report.png`

Pass condition: report language, aftermath imagery, mobile decision selection, and commit controls match the local readiness evidence and are not showing the stale deployed report-copy contract.

## Writeback After Passing

If all checks pass:

1. Update `CURRENT_STATUS.md` with the deployed verification result.
2. Add a newest-first entry to `/Users/ryanjameson/Desktop/Lifehub/SYSTEM/COMPLETION_LOG.md`.
3. Only then consider whether the active goal is complete.

If any check fails, treat the failure as a real deployed blocker and fix or document it before marking canonical readiness complete.
