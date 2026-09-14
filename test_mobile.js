const { chromium } = require('playwright');

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

  // Wait for MapLibre to load
  await page.waitForTimeout(2000);

  // click direction button
  await page.evaluate(() => {
    document.getElementById('searchCard').classList.add('hide');
    document.getElementById('dir').classList.add('on');
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'directions_mobile.png' });

  await browser.close();
})();
