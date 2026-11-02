// ollama-timeline-check.mjs —— 硬导航水合时间线观测（URL/文本/404/截图分阶段）
// 用法: node ollama-timeline-check.mjs <url> <输出前缀>
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3199/docs-cn/ollama/quickstart/';
const prefix = process.argv[3] || 'tl';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const nf = [];
page.on('response', (r) => { if (r.status() >= 400) nf.push(r.status() + ' ' + r.url().slice(-90)); });
await page.goto(url, { waitUntil: 'load', timeout: 30000 });
for (const ms of [500, 1200, 2500, 5000]) {
  await page.waitForTimeout(ms === 500 ? 500 : ms - (ms === 1200 ? 500 : ms === 2500 ? 1200 : 2500));
  const body = await page.evaluate(() => (document.body.innerText || '').length);
  const cjk = await page.evaluate(() => /[一-龥]/.test(document.body.innerText));
  const robot = await page.evaluate(() => (document.body.innerText || '').length < 500);
  console.log(`t≈${ms}ms url=${page.url().slice(-60)} textLen=${body} 中文=${cjk} 疑似404页=${robot}`);
  if (ms === 2500 || ms === 5000) await page.screenshot({ path: `${prefix}-${ms}.png` });
}
console.log('≥400 响应:', nf.slice(0, 6).join('\n  ') || '无');
await browser.close();