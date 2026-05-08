import { readFileSync } from 'node:fs';

const EXPECTED_RETENTION_DAYS = 14;

const checks = [
  {
    file: '.github/workflows/deploy.yml',
    requiredText: [
      'Summarize deployment verification',
      'VERIFY_DEPLOY_ARTIFACT_NAME: flashpoint-deploy-verification-${{ github.run_id }}',
      'uses: actions/upload-artifact@v6',
      'name: flashpoint-deploy-verification-${{ github.run_id }}',
      `retention-days: ${EXPECTED_RETENTION_DAYS}`,
    ],
  },
  {
    file: '.github/workflows/deployed-browser-smoke.yml',
    requiredText: [
      'Upload smoke diagnostics',
      'uses: actions/upload-artifact@v6',
      'name: flashpoint-deployed-smoke-diagnostics-${{ github.run_id }}',
      `retention-days: ${EXPECTED_RETENTION_DAYS}`,
    ],
  },
];

let failed = false;

for (const check of checks) {
  const content = readFileSync(check.file, 'utf8');
  const missing = check.requiredText.filter((text) => !content.includes(text));
  if (missing.length > 0) {
    failed = true;
    console.error(`Diagnostic retention drift in ${check.file}:`);
    for (const text of missing) {
      console.error(`  missing: ${text}`);
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Production diagnostic artifact retention is ${EXPECTED_RETENTION_DAYS} days where required.`);
