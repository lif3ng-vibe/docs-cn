// ollama-flaky-check.mjs —— 塌陷频率统计：N 次硬导航，记录塌/好 + URL + 内容特征
// 用法: node ollama-flaky-check.mjs <url> <次数>
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3199/docs-cn/ollama/quickstart/';
const N = Number(process.argv[3] || 6);
const browser = await chromium.launch();
for (let i = 0; i < N; i++) {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const nf = [];
  p.on('response', (r) => { if (r.status() >= 400) nf.push(r.status()); });
  await p.goto(url, { waitUntil: 'load', timeout: 30000 });
  await p.waitForTimeout(3000);
  const r = await p.evaluate(() => {
    const t = document.body.innerText || '';
    const main = document.querySelector('main');
    return {
      url: location.pathname.slice(-25),
      textLen: t.length,
      mainW: main ? Math.round(main.getBoundingClientRect().width) : -1,
      hasRobotImg: !!document.querySelector('img[alt="404"], img[src*="not-found"], img[src*="404"]'),
      h1: (document.querySelector('h1') || {}).textContent?.slice(0, 20) || '',
    };
  });
  console.log(`#${i} ${r.url} textLen=${r.textLen} mainW=${r.mainW} h1="${r.h1}" errRes=${nf.length ? nf.join(',') : '无'}`);
  await p.close();
}
await browser.close();