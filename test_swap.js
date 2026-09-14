const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:3000');

  await page.waitForTimeout(1000);

  // Set some stops and swap
  await page.evaluate(() => {
    openDirections();
    setStop(0, { lng: 10, lat: 20, label: 'Start' });
    setStop(1, { lng: 30, lat: 40, label: 'End' });
  });

  await page.click('#swap');

  const stops = await page.evaluate(() => stops.map(s => s.point));
  console.log(stops);

  await browser.close();
})();
