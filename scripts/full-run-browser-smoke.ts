import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { chromium, type Browser, type Page } from '@playwright/test';

const webUrl = process.env.PLAYTEST_WEB_URL ?? 'http://127.0.0.1:5173';
const outputDir = process.env.PLAYTEST_OUTPUT_DIR ?? 'output/playwright';
const maxDecisionWindows = Number.parseInt(process.env.PLAYTEST_MAX_WINDOWS ?? '10', 10);
const headed = process.env.PLAYTEST_HEADED === '1';
const responseStrategy = process.env.PLAYTEST_RESPONSE_STRATEGY ?? 'default';
const timerMode = process.env.PLAYTEST_TIMER_MODE ?? 'off';
const deterministicSeed = process.env.PLAYTEST_SEED?.trim() ?? '';
const viewportWidth = Number.parseInt(process.env.PLAYTEST_VIEWPORT_WIDTH ?? '1440', 10);
const viewportHeight = Number.parseInt(process.env.PLAYTEST_VIEWPORT_HEIGHT ?? '1100', 10);

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const safeName = (value: string): string => value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
const usFocusedImagePattern = /\/assets\/images\/tw_us_[^,\s)]+/g;
const genericFallbackImagePattern = /\/assets\/images\/img_\d+\.svg/g;

const waitForAppReady = async (page: Page): Promise<void> => {
  await page.waitForLoadState('domcontentloaded');
  await page.getByText(/Altira Flashpoint/i).first().waitFor({ timeout: 20_000 });
};

const clickByRole = async (page: Page, name: RegExp, timeout = 10_000): Promise<boolean> => {
  const button = page.getByRole('button', { name }).first();
  try {
    await button.waitFor({ state: 'visible', timeout });
    await button.click();
    return true;
  } catch {
    return false;
  }
};

const waitForBriefing = async (page: Page, timeout = 20_000): Promise<void> => {
  await page.getByText(/The Situation|Situation Summary/i).first().waitFor({ timeout });
};

const waitForDecisionView = async (page: Page, timeout = 10_000): Promise<void> => {
  await page.getByText(/What Do You Do\?|Response Options|Available Moves/i).first().waitFor({ timeout });
};

interface ResponsePreference {
  name: RegExp;
  variantName?: RegExp;
}

interface VisibleImageRead {
  src: string;
  alt: string;
  caption: string;
}

const defaultResponsePreferences: ResponsePreference[] = [
  { name: /Backchannel Diplomacy/i },
  { name: /Intelligence Surge/i },
  { name: /Military Posture Increase/i },
  { name: /Resource Stockpiling/i },
  { name: /Military Posture Decrease/i },
  { name: /Offer Limited Concession/i }
];

const variedResponsePreferences: ResponsePreference[] = [
  { name: /Public Strategic Address/i, variantName: /Hard Red Line/i },
  { name: /Broad Sanctions/i, variantName: /Maximal Package/i },
  { name: /Resource Stockpiling/i, variantName: /Emergency Buffer/i },
  { name: /Military Posture Increase/i, variantName: /Broadcast Deterrence/i },
  { name: /Intelligence Surge/i, variantName: /Allied Attribution Cell/i },
  { name: /Targeted Sanctions/i, variantName: /Enforcement Wave/i },
  { name: /Cyber Intrusion/i, variantName: /Deep Mapping/i },
  { name: /Offer Limited Concession/i, variantName: /Public Offramp/i },
  { name: /Backchannel Diplomacy/i, variantName: /Firm Channel/i }
];

const publicEconomicResponsePreferences: ResponsePreference[] = [
  { name: /Public Strategic Address/i, variantName: /Calibrated Address/i },
  { name: /Targeted Sanctions/i, variantName: /Signaling Tranche/i },
  { name: /Broad Sanctions/i, variantName: /Maximal Package/i },
  { name: /Resource Stockpiling/i, variantName: /Emergency Buffer/i },
  { name: /Military Posture Increase/i, variantName: /Broadcast Deterrence/i },
  { name: /Intelligence Surge/i, variantName: /Allied Attribution Cell/i },
  { name: /Offer Limited Concession/i, variantName: /Public Offramp/i },
  { name: /Backchannel Diplomacy/i, variantName: /Firm Channel/i },
  { name: /Military Posture Decrease/i, variantName: /Public Decompression/i }
];

const publicEconomicCoverageRequirements = [
  {
    label: 'White House briefing pressure scene',
    pattern: /\/assets\/images\/tw_us_white_house_press_briefing\.png/
  },
  {
    label: 'semiconductor fab disruption scene',
    pattern: /\/assets\/images\/tw_us_semiconductor_fab_disruption\.png/
  },
  {
    label: 'market crash chip crisis scene',
    pattern: /\/assets\/images\/tw_us_market_crash_chip_crisis\.png/
  }
];

const preferencesForWindow = (windowIndex: number): ResponsePreference[] => {
  if (responseStrategy === 'public-econ') {
    return [
      ...publicEconomicResponsePreferences,
      ...variedResponsePreferences,
      ...defaultResponsePreferences
    ];
  }

  if (responseStrategy === 'varied') {
    const offset = (windowIndex - 1) % variedResponsePreferences.length;
    return [
      ...variedResponsePreferences.slice(offset),
      ...variedResponsePreferences.slice(0, offset),
      ...defaultResponsePreferences
    ];
  }

  return defaultResponsePreferences;
};

const configureDeterministicSeed = async (page: Page): Promise<void> => {
  if (!deterministicSeed) {
    return;
  }

  const advancedButton = page.getByRole('button', { name: /Open/i }).filter({ hasText: /Open/i }).last();
  if (await advancedButton.isVisible().catch(() => false)) {
    await advancedButton.click();
  }

  const seedInput = page.getByPlaceholder(/Leave blank for auto-seed/i).first();
  await seedInput.waitFor({ state: 'visible', timeout: 5_000 });
  await seedInput.fill(deterministicSeed);
};

const configureTimerMode = async (page: Page): Promise<void> => {
  if (timerMode === 'off') {
    return;
  }

  if (!['standard', 'relaxed'].includes(timerMode)) {
    throw new Error(`Unsupported PLAYTEST_TIMER_MODE: ${timerMode}`);
  }

  const label = timerMode === 'standard' ? /Standard timed/i : /Relaxed timed/i;
  const timerButton = page.getByRole('button', { name: label }).first();
  await timerButton.waitFor({ state: 'visible', timeout: 5_000 });
  await timerButton.click();
};

const readClockChip = async (page: Page): Promise<string> =>
  page
    .locator('.console-chip', { hasText: /Clock/i })
    .first()
    .innerText({ timeout: 5_000 })
    .then((text) => text.replace(/\s+/g, ' ').trim());

const verifyTimedBriefingClock = async (page: Page): Promise<string | null> => {
  if (timerMode === 'off') {
    return null;
  }

  const clockText = await readClockChip(page);
  if (!/\bClock\s+\d+s\b/i.test(clockText)) {
    throw new Error(`Timed mode did not show a running briefing clock. Saw: ${clockText}`);
  }

  await page.getByText(/watch floors, insurers, and allied capitals/i).first().waitFor({ state: 'visible', timeout: 5_000 });

  return clockText;
};

const verifyTimedDecisionClock = async (page: Page, windowIndex: number): Promise<string | null> => {
  if (timerMode === 'off') {
    return null;
  }

  const expectedLabel = timerMode === 'standard' ? /Standard timed/i : /Relaxed timed/i;
  const clockPanel = page.locator('div', { hasText: /Decision Clock/ }).filter({ hasText: expectedLabel }).first();
  await clockPanel.waitFor({ state: 'visible', timeout: 5_000 });
  const clockText = (await clockPanel.innerText()).replace(/\s+/g, ' ').trim();
  if (!/\d+ seconds remain before this window resolves as inaction/i.test(clockText)) {
    throw new Error(`Timed mode decision clock copy was not visible. Saw: ${clockText}`);
  }
  if (!/watch floors, insurers, and allied capitals|shipping desks are already guessing/i.test(clockText)) {
    throw new Error(`Timed mode pressure copy was not visible in the decision clock. Saw: ${clockText}`);
  }

  if (windowIndex === 1) {
    const extendButton = page.getByRole('button', { name: /Extend Clock/i }).first();
    await extendButton.waitFor({ state: 'visible', timeout: 5_000 });
    if (!(await extendButton.isEnabled())) {
      throw new Error('Timed mode first decision did not expose an enabled Extend Clock control.');
    }
    await extendButton.click();
    await sleep(500);
  }

  return clockText;
};

const chooseFirstAvailableResponse = async (page: Page, windowIndex: number): Promise<string> => {
  const responsePanel = page.locator('section', { hasText: /What Do You Do\?|Response Options|Available Moves/i }).first();
  await responsePanel.waitFor({ state: 'visible', timeout: 10_000 });

  let responseButton = responsePanel.getByRole('button').filter({ hasText: /\bOpen\b/i }).first();
  let selectedPreference: ResponsePreference | null = null;
  for (const preference of preferencesForWindow(windowIndex)) {
    const candidate = responsePanel.getByRole('button', { name: preference.name }).first();
    if (await candidate.isVisible().catch(() => false)) {
      responseButton = candidate;
      selectedPreference = preference;
      break;
    }
  }

  await responseButton.waitFor({ state: 'visible', timeout: 10_000 });

  const label = (await responseButton.innerText()).split('\n')[0]?.trim() ?? 'unknown-response';
  await responseButton.click();
  await page.getByText(/Review Before Commit|Selected Response|Your Move/i).last().waitFor({ state: 'visible', timeout: 5_000 });

  if (selectedPreference?.variantName) {
    const variantButton = responsePanel.getByRole('button', { name: selectedPreference.variantName }).last();
    if (await variantButton.isVisible().catch(() => false)) {
      await variantButton.click();
    }
  }

  await page.getByRole('button', { name: /Commit Your Move|Commit Selected Response/i }).first().waitFor({ state: 'visible', timeout: 5_000 });
  const selectedLine = await responsePanel
    .getByText(/How hard to push:|Response envelope:/i)
    .last()
    .innerText()
    .catch(() => '');
  return selectedLine ? `${label} · ${selectedLine.replace(/^(How hard to push|Response envelope):\s*/i, '').trim()}` : label;
};

const readVisibleImages = async (page: Page): Promise<VisibleImageRead[]> => {
  return page.locator('figure').evaluateAll((figures) =>
    figures
      .map((figure) => {
        const image = figure.querySelector('img');
        if (!image) {
          return null;
        }

        return {
          src: image.getAttribute('src') ?? '',
          alt: image.getAttribute('alt') ?? '',
          caption: figure.querySelector('figcaption')?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
        };
      })
      .filter((entry): entry is VisibleImageRead => Boolean(entry?.src))
  );
};

const captureStep = async (page: Page, name: string): Promise<VisibleImageRead[]> => {
  const file = path.join(outputDir, `${safeName(name)}.png`);
  if (name === '99-report') {
    await page.screenshot({ path: file, fullPage: false, timeout: 10_000 });
    await page.getByText(/Run Recap/i).first().evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: path.join(outputDir, '99-report-recap.png'), fullPage: false, timeout: 10_000 });
    await page.getByText(/What The Room Missed/i).first().evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: path.join(outputDir, '99-report-missed.png'), fullPage: false, timeout: 10_000 });
    const beijingReadSection = page.getByText(/How Beijing's Read Changed/i).first().locator('xpath=ancestor::section[1]');
    await beijingReadSection.evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: path.join(outputDir, '99-report-beijing-read.png'), fullPage: false, timeout: 10_000 });
    const beijingReadText = (await beijingReadSection.textContent()) ?? '';
    if (/Bluff risk|Trigger risk|Humiliation pressure|\b0\.\d+\b/i.test(beijingReadText)) {
      throw new Error('Final report Beijing-read section still exposes legacy probability/table language.');
    }
    return readVisibleImages(page);
  }

  try {
    await page.screenshot({ path: file, fullPage: true, timeout: 20_000 });
  } catch (error) {
    throw error;
  }
  return readVisibleImages(page);
};

const writeSmokeSummary = async (input: {
  status: 'passed' | 'failed';
  currentUrl?: string;
  error?: string;
  failureScreenshot?: string;
  screenshotError?: string;
  decisionLog: string[];
  timerLog: string[];
  imageLog: string[];
  consoleErrors: string[];
  pageErrors: string[];
}): Promise<void> => {
  const summary = {
    status: input.status,
    webUrl,
    currentUrl: input.currentUrl ?? null,
    responseStrategy,
    timerMode,
    seed: deterministicSeed || null,
    viewport: {
      width: viewportWidth,
      height: viewportHeight
    },
    maxDecisionWindows,
    failureScreenshot: input.failureScreenshot ?? null,
    screenshotError: input.screenshotError ?? null,
    error: input.error ?? null,
    decisionWindows: input.decisionLog.length,
    decisions: input.decisionLog,
    timers: input.timerLog,
    visibleImages: input.imageLog,
    consoleErrors: input.consoleErrors,
    pageErrors: input.pageErrors,
    completedAt: new Date().toISOString()
  };

  await writeFile(path.join(outputDir, 'smoke-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  await writeFile(
    path.join(outputDir, 'smoke-summary.md'),
    [
      `# Flashpoint Deployed Browser Smoke: ${input.status}`,
      '',
      `- URL: ${webUrl}`,
      `- Current URL: ${input.currentUrl ?? 'n/a'}`,
      `- Response strategy: ${responseStrategy}`,
      `- Timer mode: ${timerMode}`,
      `- Seed: ${deterministicSeed || 'n/a'}`,
      `- Viewport: ${viewportWidth}x${viewportHeight}`,
      `- Decision windows: ${input.decisionLog.length}`,
      `- Failure screenshot: ${input.failureScreenshot ?? 'n/a'}`,
      `- Error: ${input.error ?? 'n/a'}`,
      `- Screenshot error: ${input.screenshotError ?? 'n/a'}`,
      '',
      '## Decisions',
      input.decisionLog.length > 0 ? input.decisionLog.map((entry) => `- ${entry}`).join('\n') : '- n/a',
      '',
      '## Timers',
      input.timerLog.length > 0 ? input.timerLog.map((entry) => `- ${entry}`).join('\n') : '- n/a',
      '',
      '## Visible Images',
      input.imageLog.length > 0 ? input.imageLog.map((entry) => `- ${entry}`).join('\n') : '- n/a',
      '',
      '## Console Errors',
      input.consoleErrors.length > 0 ? input.consoleErrors.map((entry) => `- ${entry}`).join('\n') : '- n/a',
      '',
      '## Page Errors',
      input.pageErrors.length > 0 ? input.pageErrors.map((entry) => `- ${entry}`).join('\n') : '- n/a',
      ''
    ].join('\n'),
    'utf8'
  );
};

const waitForPostCommitAdvance = async (page: Page, windowIndex: number): Promise<void> => {
  const deadline = Date.now() + 60_000;
  const reportHeading = page.getByText(/Final Report/i).first();
  const nextDecisionButton = page.getByRole('button', { name: /Make Your Call|Proceed To Decision|Return To Selected Response/i }).first();

  while (Date.now() < deadline) {
    const reachedReport =
      (await reportHeading.isVisible().catch(() => false)) ||
      (await page.locator('body').innerText({ timeout: 1_000 }).then((text) => /Final Report|Run Recap|What Happened And Why/i.test(text)).catch(() => false));
    if (reachedReport) {
      return;
    }

    const reachedNextBriefing =
      (await nextDecisionButton.isVisible().catch(() => false)) && (await nextDecisionButton.isEnabled().catch(() => false));
    if (reachedNextBriefing) {
      await sleep(750);
      const reachedReportAfterSettling =
        (await reportHeading.isVisible().catch(() => false)) ||
        (await page.locator('body').innerText({ timeout: 1_000 }).then((text) => /Final Report|Run Recap|What Happened And Why/i.test(text)).catch(() => false));
      if (reachedReportAfterSettling) {
        return;
      }
      return;
    }

    await sleep(250);
  }

  throw new Error(`Commit did not advance beyond decision mode for window ${windowIndex}.`);
};

const run = async (): Promise<void> => {
  await mkdir(outputDir, { recursive: true });

  let browser: Browser | null = null;
  let page: Page | null = null;
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const decisionLog: string[] = [];
  const timerLog: string[] = [];
  const imageLog: string[] = [];

  try {
    browser = await chromium.launch({ headless: !headed });
    page = await browser.newPage({ viewport: { width: viewportWidth, height: viewportHeight } });

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(webUrl, { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    await configureTimerMode(page);
    await configureDeterministicSeed(page);
    imageLog.push(`00-setup: ${(await captureStep(page, '00-setup')).map((entry) => entry.src).join(', ') || 'no images'}`);

    if (!(await clickByRole(page, /Begin Scenario/i))) {
      throw new Error('Could not find the Begin Scenario button.');
    }

    await waitForBriefing(page, 20_000);
    const briefingClock = await verifyTimedBriefingClock(page);
    if (briefingClock) {
      timerLog.push(`first briefing: ${briefingClock}`);
    }
    imageLog.push(
      `01-first-briefing: ${(await captureStep(page, '01-first-briefing')).map((entry) => entry.src).join(', ') || 'no images'}`
    );

    for (let index = 1; index <= maxDecisionWindows; index += 1) {
      if (await page.getByText(/Final Report/i).first().isVisible().catch(() => false)) {
        break;
      }

      if (!(await clickByRole(page, /Make Your Call|Proceed To Decision|Return To Selected Response/i))) {
        throw new Error(`Could not enter decision mode for window ${index}.`);
      }

      await waitForDecisionView(page, 10_000);
      const decisionClock = index === 1 ? await verifyTimedDecisionClock(page, index) : null;
      if (decisionClock && index === 1) {
        timerLog.push(`first decision: visible and extendable`);
      }
      const responseLabel = await chooseFirstAvailableResponse(page, index);
      decisionLog.push(`${index}: ${responseLabel}`);
      imageLog.push(
        `${String(index).padStart(2, '0')}-decision-selected: ${
          (await captureStep(page, `${String(index).padStart(2, '0')}-decision-selected`))
            .map((entry) => entry.src)
            .join(', ') || 'no images'
        }`
      );

      if (!(await clickByRole(page, /Commit Your Move|Commit Selected Response/i))) {
        throw new Error(`Could not commit selected response for window ${index}.`);
      }

      await waitForPostCommitAdvance(page, index);

      if (await page.getByText(/Final Report/i).first().isVisible().catch(() => false)) {
        await page.getByText(/What Happened And Why/i).first().waitFor({ timeout: 10_000 });
        imageLog.push(`99-report: ${(await captureStep(page, '99-report')).map((entry) => entry.src).join(', ') || 'no images'}`);
        break;
      }

      await waitForBriefing(page, 15_000);
      imageLog.push(
        `${String(index + 1).padStart(2, '0')}-briefing: ${
          (await captureStep(page, `${String(index + 1).padStart(2, '0')}-briefing`))
            .map((entry) => entry.src)
            .join(', ') || 'no images'
        }`
      );
    }

    if (!(await page.getByText(/Final Report/i).first().isVisible().catch(() => false))) {
      throw new Error(`Run did not reach the post-game report within ${maxDecisionWindows} windows.`);
    }

    if (responseStrategy === 'varied') {
      const uniqueResponseFamilies = new Set(
        decisionLog.map((entry) => entry.replace(/^\d+:\s*/, '').split('·')[0]?.trim()).filter(Boolean)
      );
      const uniqueUsFocusedImages = new Set(imageLog.flatMap((entry) => entry.match(usFocusedImagePattern) ?? []));

      if (uniqueResponseFamilies.size < 3) {
        throw new Error(`Varied smoke only exercised ${uniqueResponseFamilies.size} response family/families.`);
      }

      if (uniqueUsFocusedImages.size < 4) {
        throw new Error(`Varied smoke only surfaced ${uniqueUsFocusedImages.size} US-focused image(s).`);
      }
    }

    if (responseStrategy === 'public-econ') {
      const visibleImages = imageLog.flatMap((entry) => entry.match(usFocusedImagePattern) ?? []);
      const uniqueVisibleImages = new Set(visibleImages);
      const missingRequirements = publicEconomicCoverageRequirements.filter((requirement) =>
        visibleImages.every((image) => !requirement.pattern.test(image))
      );

      if (uniqueVisibleImages.size < 3) {
        throw new Error(`Public/economic smoke only surfaced ${uniqueVisibleImages.size} US-focused image(s).`);
      }

      if (missingRequirements.length > 0) {
        throw new Error(
          `Public/economic smoke missed required coverage: ${missingRequirements
            .map((requirement) => requirement.label)
            .join(', ')}`
        );
      }
    }

    const genericFallbackImages = imageLog.flatMap((entry) => entry.match(genericFallbackImagePattern) ?? []);
    if (genericFallbackImages.length > 0) {
      throw new Error(`Browser smoke surfaced generic fallback art: ${[...new Set(genericFallbackImages)].join(', ')}`);
    }

    if (consoleErrors.length > 0 || pageErrors.length > 0) {
      throw new Error(
        [
          'Browser smoke reached the report but captured runtime errors.',
          ...consoleErrors.map((entry) => `console: ${entry}`),
          ...pageErrors.map((entry) => `pageerror: ${entry}`)
        ].join('\n')
      );
    }

    console.log('Browser smoke completed successfully.');
    console.log(`URL: ${webUrl}`);
    console.log(`Response strategy: ${responseStrategy}`);
    if (deterministicSeed) {
      console.log(`Seed: ${deterministicSeed}`);
    }
    console.log(`Decision windows: ${decisionLog.length}`);
    console.log(decisionLog.join('\n'));
    console.log('Visible images:');
    console.log(imageLog.join('\n'));
    console.log(`Screenshots: ${outputDir}`);
    await writeSmokeSummary({
      status: 'passed',
      currentUrl: page.url(),
      decisionLog,
      timerLog,
      imageLog,
      consoleErrors,
      pageErrors
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    let failureScreenshot: string | undefined;
    let screenshotError: string | undefined;
    if (page) {
      failureScreenshot = path.join(outputDir, 'failure-state.png');
      try {
        await page.screenshot({ path: failureScreenshot, fullPage: true });
      } catch (screenshotFailure) {
        screenshotError = screenshotFailure instanceof Error ? screenshotFailure.message : String(screenshotFailure);
        failureScreenshot = undefined;
      }
    }

    await writeSmokeSummary({
      status: 'failed',
      currentUrl: page?.url(),
      error: message,
      failureScreenshot,
      screenshotError,
      decisionLog,
      timerLog,
      imageLog,
      consoleErrors,
      pageErrors
    });

    console.error(`Browser smoke failed: ${message}`);
    console.error(`URL: ${webUrl}`);
    if (failureScreenshot) {
      console.error(`Failure screenshot: ${failureScreenshot}`);
    }
    console.error(`If no local app is running, start it with: npm run dev`);
    process.exitCode = 1;
  } finally {
    await browser?.close();
  }
};

void run();
