// ollama-browser-smoke.mjs —— 浏览器级冒烟：验证子路径部署不被客户端路由弹回站点根
// 用法: node ollama-browser-smoke.mjs <起始URL>
import { chromium } from 'playwright';

const start = process.argv[2] || 'http://localhost:3199/docs-cn/ollama/';
const browser = await chromium.launch();
const page = await browser.newPage();
const failures = [];
const errors = [];
const notFound = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 200)));
page.on('response', (r) => { if (r.status() === 404) notFound.push(r.url()); });

await page.goto(start, { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(3000); // 等水合 + 可能的 replaceState 规范化

const u1 = page.url();
console.log('1) 落地后 URL:', u1);
if (!u1.includes('/docs-cn/ollama')) failures.push('落地 URL 被改写: ' + u1);

// 点侧边栏站内链接（href 以 / 开头，排除外链），连点 3 个验证软导航
const links = page.locator('aside a[href^="/"], nav a[href^="/docs-cn/"]');
const n = Math.min(await links.count(), 3);
if (!n) {
  failures.push('找不到站内侧边栏链接');
} else {
  for (let i = 0; i < n; i++) {
    const lk = links.nth(i);
    const href = await lk.getAttribute('href');
    await lk.click();
    await page.waitForTimeout(2000);
    const u2 = page.url();
    console.log(`2) 点击[${i}] ${href} → ${u2}`);
    if (!u2.includes('/docs-cn/ollama')) { failures.push(`软导航 URL 被改写: ${href} → ${u2}`); break; }
    const body = await page.textContent('body');
    if (!/[一-龥]/.test(body)) { failures.push(`导航后页面无中文内容: ${u2}`); break; }
  }
}

await page.screenshot({ path: 'smoke.png', fullPage: false });
console.log('404 资源:', [...new Set(notFound)].slice(0, 8));
console.log('console errors:', errors.slice(0, 3));
console.log(failures.length ? 'FAIL:\n- ' + failures.join('\n- ') : 'PASS: URL 保持前缀，软导航正常');
await browser.close();
process.exit(failures.length ? 1 : 0);
