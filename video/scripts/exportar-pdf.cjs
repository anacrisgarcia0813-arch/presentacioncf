const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
  const p = await b.newPage({ viewport: { width: 794, height: 1123 } });
  await p.goto('file://' + process.argv[2]);
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: process.argv[3], format: 'A4', printBackground: true });
  await p.screenshot({ path: process.argv[4], fullPage: true });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  console.log('altura px', h);
  await b.close();
})();
