const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  await page.goto('http://localhost:3000');

  // Wait for map load
  await page.waitForTimeout(2000);

  // Click on search, search for something to see results
  await page.click('#q');
  await page.fill('#q', 'pizza');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'search_before.png' });

  // Then clear and open directions
  await page.click('#qClear');
  await page.waitForTimeout(500);

  // We need to trigger directions. Let's click on a point in the map to open 'place'
  await page.mouse.click(150, 300);
  await page.waitForTimeout(1000);
  await page.click('#placeTo');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'directions_after_fix.png' });

  await browser.close();
})();
