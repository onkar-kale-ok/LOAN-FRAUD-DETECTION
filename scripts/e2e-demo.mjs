import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS = '/opt/cursor/artifacts';
const SHOTS = path.join(ARTIFACTS, 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: path.join(ARTIFACTS, 'pw-video'), size: { width: 1440, height: 900 } },
});
const page = await context.newPage();

const log = (...args) => console.log('[e2e]', ...args);

try {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForSelector('text=AI Fraud Detection');
  log('App loaded');

  await page.screenshot({
    path: path.join(SHOTS, 'dashboard_evaluation_tab.png'),
    fullPage: true,
  });

  // Select Rahul Sharma scenario
  await page.locator('select').nth(1).selectOption('APP-2026-8842');
  await page.waitForTimeout(400);
  log('Scenario selected');

  // Run evaluation
  await page.getByRole('button', { name: /Run AI Fraud Evaluation/i }).click();
  await page.waitForSelector('text=Evaluation Result', { timeout: 10000 });
  await page.waitForTimeout(600);
  log('Evaluation complete');

  await page.screenshot({
    path: path.join(SHOTS, 'evaluation_result_high_risk.png'),
    fullPage: true,
  });

  // Toggle JSON view
  await page.getByRole('button', { name: /Raw JSON/i }).click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(SHOTS, 'evaluation_json_view.png'),
    fullPage: true,
  });

  // Fraud Log tab
  await page.getByRole('button', { name: /Fraud Log/i }).click();
  await page.waitForSelector('text=Fraud Application Log');
  await page.waitForSelector('text=Investigate in AI Assistant', { timeout: 15000 });
  await page.waitForTimeout(400);
  log('Fraud log visible');

  await page.screenshot({
    path: path.join(SHOTS, 'fraud_log_analyst.png'),
    fullPage: true,
  });

  // Switch to GUEST role
  await page.locator('header select').selectOption('GUEST');
  await page.waitForTimeout(400);
  log('GUEST role applied');

  await page.screenshot({
    path: path.join(SHOTS, 'fraud_log_guest_masked.png'),
    fullPage: true,
  });

  // Investigate → Assistant
  await page.getByRole('button', { name: /Investigate in AI Assistant/i }).first().click();
  await page.waitForSelector('text=AI Fraud Assistant');
  await page.waitForTimeout(400);
  log('Navigated to assistant');

  // Quick action
  await page.getByRole('button', { name: /Why is this High Risk/i }).click();
  await page.waitForSelector('text=AI Assistant', { timeout: 10000 });
  await page.waitForTimeout(1200);
  log('Chat reply received');

  await page.screenshot({
    path: path.join(SHOTS, 'assistant_chat_reply.png'),
    fullPage: true,
  });

  // Verify evaluated tag on scenario dropdown by going back
  await page.getByRole('button', { name: /New Evaluation/i }).click();
  await page.waitForTimeout(400);
  const options = await page.locator('select').nth(1).locator('option').allTextContents();
  const evaluated = options.find((o) => o.includes('[Evaluated'));
  log('Evaluated option present:', !!evaluated, evaluated?.slice(0, 80));

  await page.screenshot({
    path: path.join(SHOTS, 'scenario_evaluated_tag.png'),
    fullPage: true,
  });

  log('E2E SUCCESS');
} catch (err) {
  console.error('[e2e] FAILED', err);
  await page.screenshot({
    path: path.join(SHOTS, 'e2e_failure.png'),
    fullPage: true,
  }).catch(() => {});
  process.exitCode = 1;
} finally {
  const video = page.video();
  await context.close();
  await browser.close();
  if (video) {
    const videoPath = await video.path();
    const dest = path.join(ARTIFACTS, 'dashboard_e2e_walkthrough.webm');
    fs.copyFileSync(videoPath, dest);
    log('Video saved to', dest);
  }
}
