const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:3000');
  await page.waitForTimeout(2000);

  // click search to open results and place
  await page.evaluate(() => {
    document.querySelector('#dir').classList.add('on');
    document.querySelector('#searchCard').classList.add('hide');
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'directions_ui.png' });
  await browser.close();
})();
