const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000');

  await page.waitForTimeout(1000);

  // type in search
  await page.fill('#q', 'pizza');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'search_results_mobile.png' });

  // now do it for directions
  await page.evaluate(() => {
    openDirections();
  });

  const inputs = await page.$$('.field input');
  await inputs[0].fill('pizza');

  await page.waitForTimeout(500);
  await page.screenshot({ path: 'directions_results_mobile.png' });

  await browser.close();
})();
