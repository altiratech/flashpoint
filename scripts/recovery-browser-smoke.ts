import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { chromium, type Browser, type Page } from '@playwright/test';

const webUrl = process.env.PLAYTEST_WEB_URL ?? 'http://127.0.0.1:5173';
const outputDir = process.env.PLAYTEST_OUTPUT_DIR ?? 'output/playwright-recovery';
const viewportWidth = Number.parseInt(process.env.PLAYTEST_VIEWPORT_WIDTH ?? '1440', 10);
const viewportHeight = Number.parseInt(process.env.PLAYTEST_VIEWPORT_HEIGHT ?? '1200', 10);

const clickByRole = async (page: Page, name: RegExp, timeout = 10_000): Promise<void> => {
  const button = page.getByRole('button', { name }).first();
  await button.waitFor({ state: 'visible', timeout });
  await button.click();
};

const waitForSetup = async (page: Page): Promise<void> => {
  await page.getByText(/Configure Scenario Run/i).first().waitFor({ timeout: 20_000 });
};

const waitForBriefing = async (page: Page): Promise<void> => {
  await page.getByText(/The Situation/i).first().waitFor({ timeout: 20_000 });
};

const waitForReport = async (page: Page): Promise<void> => {
  await page.getByText(/Final Report/i).first().waitFor({ timeout: 20_000 });
};

const capture = async (page: Page, name: string): Promise<void> => {
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true, timeout: 20_000 });
};

const chooseAndCommitFirstResponse = async (
  page: Page,
  beforeCommit?: () => Promise<void>
): Promise<void> => {
  await clickByRole(page, /Make Your Call|Proceed To Decision/i);
  const responsePanel = page.locator('section', { hasText: /What Do You Do\?|Available Moves/i }).first();
  await responsePanel.waitFor({ state: 'visible', timeout: 10_000 });
  const openButton = responsePanel.getByRole('button', { name: /Backchannel Diplomacy/i }).first();
  await openButton.waitFor({ state: 'visible', timeout: 10_000 });
  await openButton.click();
  await page.getByText(/Review Before Commit|Your Move/i).last().waitFor({ state: 'visible', timeout: 5_000 });
  await beforeCommit?.();
  await clickByRole(page, /Commit Your Move/i);
};

const waitForPostCommit = async (page: Page): Promise<'briefing' | 'report'> => {
  const deadline = Date.now() + 30_000;
  const report = page.getByText(/Final Report/i).first();
  const nextBriefing = page.getByRole('button', { name: /Make Your Call|Proceed To Decision/i }).first();

  while (Date.now() < deadline) {
    const reachedReport =
      (await report.isVisible().catch(() => false)) ||
      (await page.locator('body').innerText({ timeout: 1_000 }).then((text) => /Final Report|Run Recap|What Happened And Why/i.test(text)).catch(() => false));
    if (reachedReport) {
      return 'report';
    }
    if (await nextBriefing.isVisible().catch(() => false)) {
      await page.waitForTimeout(750);
      const reachedReportAfterSettling =
        (await report.isVisible().catch(() => false)) ||
        (await page.locator('body').innerText({ timeout: 1_000 }).then((text) => /Final Report|Run Recap|What Happened And Why/i.test(text)).catch(() => false));
      if (reachedReportAfterSettling) {
        return 'report';
      }
      return 'briefing';
    }
    await page.waitForTimeout(300);
  }

  throw new Error('Timed out waiting for next briefing or report after commit.');
};

const assertNoRuntimeErrors = (consoleErrors: string[], pageErrors: string[]): void => {
  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    throw new Error([
      'Recovery smoke captured runtime errors.',
      ...consoleErrors.map((entry) => `console: ${entry}`),
      ...pageErrors.map((entry) => `pageerror: ${entry}`)
    ].join('\n'));
  }
};

const run = async (): Promise<void> => {
  await mkdir(outputDir, { recursive: true });
  const browser: Browser = await chromium.launch({ headless: process.env.PLAYTEST_HEADED !== '1' });
  const page = await browser.newPage({ viewport: { width: viewportWidth, height: viewportHeight } });
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const steps: string[] = [];

  try {
    await page.goto(webUrl);
    await waitForSetup(page);
    await capture(page, '00-setup');

    await clickByRole(page, /Begin Scenario/i);
    await waitForBriefing(page);
    await capture(page, '01-briefing');

    await clickByRole(page, /Return To Setup/i);
    await waitForSetup(page);
    await page.getByText(/Continue Latest Run/i).first().waitFor({ state: 'visible', timeout: 10_000 });
    steps.push('returned setup with latest active run visible');
    await capture(page, '02-returned-setup');

    await page.reload();
    await waitForSetup(page);
    await clickByRole(page, /Continue Latest Run/i);
    await waitForBriefing(page);
    steps.push('reloaded setup and resumed latest active run');
    await capture(page, '03-resumed-run');

    await clickByRole(page, /Return To Setup/i);
    await waitForSetup(page);
    await clickByRole(page, /Remove active run|^Remove$/i);
    await page.getByText(/Continue Latest Run/i).first().waitFor({ state: 'hidden', timeout: 10_000 });
    steps.push('removed the primary latest active run');
    await capture(page, '04-latest-removed');

    await clickByRole(page, /Begin Scenario/i);
    await waitForBriefing(page);
    for (let windowIndex = 1; windowIndex <= 10; windowIndex += 1) {
      await chooseAndCommitFirstResponse(
        page,
        windowIndex === 1 ? () => capture(page, '05-selected-decision') : undefined
      );
      const next = await waitForPostCommit(page);
      if (windowIndex === 1) {
        await capture(page, '06-post-commit-state');
      }
      if (next === 'report') {
        break;
      }
      await waitForBriefing(page);
    }

    await waitForReport(page);
    steps.push('completed a run to mandate report');
    await capture(page, '07-report');

    await clickByRole(page, /Return To Scenario Setup|Return To Setup/i);
    await waitForSetup(page);
    await page.getByText(/Completed Reports/i).first().waitFor({ state: 'visible', timeout: 10_000 });
    await page.reload();
    await waitForSetup(page);
    await clickByRole(page, /Open Report/i);
    await waitForReport(page);
    steps.push('reloaded setup and reopened completed report');
    await capture(page, '08-reopened-report');

    await clickByRole(page, /Return To Scenario Setup|Return To Setup/i);
    await waitForSetup(page);
    await clickByRole(page, /Remove completed report|^Remove$/i);
    await page.getByText(/Completed Reports/i).first().waitFor({ state: 'hidden', timeout: 10_000 });
    steps.push('removed completed report from local shelf');
    await capture(page, '09-report-removed');

    assertNoRuntimeErrors(consoleErrors, pageErrors);

    await writeFile(
      path.join(outputDir, 'smoke-summary.md'),
      [
        '# Flashpoint Recovery Browser Smoke: passed',
        '',
        `- URL: ${webUrl}`,
        `- Viewport: ${viewportWidth}x${viewportHeight}`,
        `- Steps: ${steps.length}`,
        '',
        ...steps.map((step) => `- ${step}`)
      ].join('\n')
    );
    console.log('Recovery browser smoke completed successfully.');
    console.log(`Screenshots: ${outputDir}`);
  } catch (error) {
    await capture(page, 'failure-state').catch(() => undefined);
    await writeFile(
      path.join(outputDir, 'smoke-summary.md'),
      [
        '# Flashpoint Recovery Browser Smoke: failed',
        '',
        `- URL: ${webUrl}`,
        `- Viewport: ${viewportWidth}x${viewportHeight}`,
        `- Error: ${error instanceof Error ? error.message : String(error)}`,
        '',
        ...steps.map((step) => `- ${step}`)
      ].join('\n')
    );
    throw error;
  } finally {
    await browser.close();
  }
};

run().catch((error) => {
  console.error(`Recovery browser smoke failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
