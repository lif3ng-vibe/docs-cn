// ollama-wide-check.mjs —— 宽屏复现：同一 URL 多视口截图 + 布局量测
// 用法: node ollama-wide-check.mjs <url> <输出前缀>
import { chromium } from 'playwright';

const url = process.argv[2] || 'https://lif3ng-vibe.github.io/docs-cn/ollama/';
const prefix = process.argv[3] || 'wide';
const browser = await chromium.launch();
const errors = [];
for (const vp of [{ width: 1920, height: 1080 }, { width: 1280, height: 800 }]) {
  const page = await browser.newPage({ viewport: vp });
  page.on('pageerror', (e) => errors.push(`${vp.width}: ${String(e).slice(0, 120)}`));
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2500);
  const m = await page.evaluate(() => {
    const main = document.querySelector('main') || document.querySelector('article');
    const bodyChildren = [...document.body.children].map((el) => ({
      tag: el.tagName, id: el.id, cls: (el.className || '').toString().slice(0, 60),
      w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height,
      display: getComputedStyle(el).display,
    }));
    return {
      bodyW: document.body.getBoundingClientRect().width,
      mainBox: main ? { w: main.getBoundingClientRect().width, h: main.getBoundingClientRect().height, vis: getComputedStyle(main).visibility, disp: getComputedStyle(main).display } : null,
      textLen: (document.body.innerText || '').length,
      bodyChildren,
    };
  });
  console.log(`== ${vp.width}x${vp.height}: bodyW=${m.bodyW} textLen=${m.textLen} main=${JSON.stringify(m.mainBox)}`);
  console.log('   body children:', m.bodyChildren.map((c) => `${c.tag}#${c.id}[${c.cls.slice(0, 30)}] ${Math.round(c.w)}x${Math.round(c.h)} ${c.display}`).join('\n                 '));
  await page.screenshot({ path: `${prefix}-${vp.width}.png` });
  await page.close();
}
console.log('pageerrors:', errors.slice(0, 4));
await browser.close();
