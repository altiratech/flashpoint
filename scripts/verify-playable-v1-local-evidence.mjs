#!/usr/bin/env node
import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'output/playwright-node22-rerun-desktop/99-report.png',
  'output/playwright-node22-rerun-mobile/01-decision-selected.png',
  'output/playwright-node22-rerun-mobile/99-report.png',
  'output/playwright-node22-rerun-timed/01-first-briefing.png',
  'output/playwright-node22-rerun-recovery-mobile/09-report-removed.png',
  'output/playwright-node22-rerun-public-econ-mobile/99-report.png',
  'output/playwright-2026-05-18-refresh-desktop/99-report.png',
  'output/playwright-2026-05-18-refresh-mobile/01-decision-selected.png',
  'output/playwright-2026-05-18-refresh-mobile/99-report.png',
  'output/playwright-2026-05-18-refresh-timed/01-first-briefing.png',
  'output/playwright-2026-05-18-refresh-recovery-mobile/09-report-removed.png',
  'output/playwright-2026-05-18-refresh-public-econ-mobile/99-report.png'
];

const jsonChecks = [
  {
    path: 'output/playwright-node22-rerun-desktop/smoke-summary.json',
    expect: {
      viewport: { width: 1440, height: 1100 },
      decisionWindows: 6
    }
  },
  {
    path: 'output/playwright-node22-rerun-mobile/smoke-summary.json',
    expect: {
      viewport: { width: 390, height: 900 },
      decisionWindows: 6
    }
  },
  {
    path: 'output/playwright-node22-rerun-timed/smoke-summary.json',
    expect: {
      viewport: { width: 1440, height: 1100 },
      decisionWindows: 6,
      timerMode: 'standard',
      timers: ['first briefing: CLOCK 90S', 'first decision: visible and extendable']
    }
  },
  {
    path: 'output/playwright-node22-rerun-public-econ-mobile/smoke-summary.json',
    expect: {
      viewport: { width: 390, height: 900 },
      responseStrategy: 'public-econ',
      seed: 'public-econ-2',
      decisionWindows: 5
    }
  },
  {
    path: 'output/playwright-2026-05-18-refresh-desktop/smoke-summary.json',
    expect: {
      viewport: { width: 1440, height: 1100 },
      decisionWindows: 6
    }
  },
  {
    path: 'output/playwright-2026-05-18-refresh-mobile/smoke-summary.json',
    expect: {
      viewport: { width: 390, height: 900 },
      decisionWindows: 6
    }
  },
  {
    path: 'output/playwright-2026-05-18-refresh-timed/smoke-summary.json',
    expect: {
      viewport: { width: 1440, height: 1100 },
      decisionWindows: 6,
      timerMode: 'standard',
      timers: ['first briefing: CLOCK 90S', 'first decision: visible and extendable']
    }
  },
  {
    path: 'output/playwright-2026-05-18-refresh-public-econ-mobile/smoke-summary.json',
    expect: {
      viewport: { width: 390, height: 900 },
      responseStrategy: 'public-econ',
      seed: 'public-econ-2',
      decisionWindows: 5
    }
  }
];

const recoverySummaryPaths = [
  'output/playwright-node22-rerun-recovery-mobile/smoke-summary.md',
  'output/playwright-2026-05-18-refresh-recovery-mobile/smoke-summary.md'
];
const requiredRecoveryLines = [
  '# Flashpoint Recovery Browser Smoke: passed',
  '- Viewport: 390x900',
  '- returned setup with latest active run visible',
  '- reloaded setup and resumed latest active run',
  '- removed the primary latest active run',
  '- completed a run to mandate report',
  '- reloaded setup and reopened completed report',
  '- removed completed report from local shelf'
];

const errors = [];

const readJson = async (filePath) => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${filePath}: unable to read JSON (${error.message})`);
    return null;
  }
};

const assertEqual = (label, actual, expected) => {
  if (actual !== expected) {
    errors.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

const assertNoErrors = (filePath, summary) => {
  const consoleErrors = summary.consoleErrors ?? [];
  const pageErrors = summary.pageErrors ?? [];
  if (consoleErrors.length > 0) {
    errors.push(`${filePath}: consoleErrors not empty`);
  }
  if (pageErrors.length > 0) {
    errors.push(`${filePath}: pageErrors not empty`);
  }
};

for (const filePath of requiredFiles) {
  try {
    await access(filePath);
  } catch {
    errors.push(`${filePath}: required screenshot/artifact missing`);
  }
}

for (const check of jsonChecks) {
  const summary = await readJson(check.path);
  if (!summary) {
    continue;
  }

  assertEqual(`${check.path} status`, summary.status, 'passed');
  assertNoErrors(check.path, summary);

  if (check.expect.viewport) {
    assertEqual(`${check.path} viewport.width`, summary.viewport?.width, check.expect.viewport.width);
    assertEqual(`${check.path} viewport.height`, summary.viewport?.height, check.expect.viewport.height);
  }
  if ('decisionWindows' in check.expect) {
    assertEqual(`${check.path} decisionWindows`, summary.decisionWindows, check.expect.decisionWindows);
  }
  if (check.expect.timerMode) {
    assertEqual(`${check.path} timerMode`, summary.timerMode, check.expect.timerMode);
  }
  if (check.expect.responseStrategy) {
    assertEqual(`${check.path} responseStrategy`, summary.responseStrategy, check.expect.responseStrategy);
  }
  if (check.expect.seed) {
    assertEqual(`${check.path} seed`, summary.seed, check.expect.seed);
  }
  if (check.expect.timers) {
    const timers = summary.timers ?? [];
    for (const expectedTimer of check.expect.timers) {
      if (!timers.includes(expectedTimer)) {
        errors.push(`${check.path}: missing timer evidence ${JSON.stringify(expectedTimer)}`);
      }
    }
  }
}

for (const recoverySummaryPath of recoverySummaryPaths) {
  try {
    const recoverySummary = await readFile(recoverySummaryPath, 'utf8');
    for (const requiredLine of requiredRecoveryLines) {
      if (!recoverySummary.includes(requiredLine)) {
        errors.push(`${recoverySummaryPath}: missing ${JSON.stringify(requiredLine)}`);
      }
    }
  } catch (error) {
    errors.push(`${recoverySummaryPath}: unable to read (${error.message})`);
  }
}

if (errors.length > 0) {
  console.error('Playable v1 local evidence verification failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Playable v1 local evidence verification passed.');
console.log(
  `Checked ${jsonChecks.length} smoke summaries, ${requiredFiles.length} screenshots/artifacts, and ${recoverySummaryPaths.length} recovery flow summaries.`
);
