# Production Diagnostics

Flashpoint keeps production smoke evidence short-lived by default. The goal is enough time for audit/debugging after a deployment or scheduled smoke run, without turning GitHub Actions artifacts into a permanent data store.

## Retention Policy

- Deploy verification artifacts use `flashpoint-deploy-verification-${{ github.run_id }}` and are retained for 14 days.
- Deployed browser smoke artifacts use `flashpoint-deployed-smoke-diagnostics-${{ github.run_id }}` and are retained for 14 days.
- GitHub job summaries are the fast path for recent Deploy verification status; artifacts are the detailed audit trail.
- Do not store production diagnostics in the repo. Download an artifact only for active investigation, then keep any durable conclusion in `progress.md`, `CURRENT_STATUS.md`, or `SYSTEM/COMPLETION_LOG.md`.
- If a diagnostic artifact contains evidence that must outlive 14 days, summarize the finding in repo-local docs rather than increasing blanket artifact retention.

## Drift Check

Run this after changing production diagnostic workflows:

```bash
npm run verify:diagnostic-retention
```

The check currently enforces artifact names, upload steps, 14-day retention, and the Deploy verification run-summary step.
