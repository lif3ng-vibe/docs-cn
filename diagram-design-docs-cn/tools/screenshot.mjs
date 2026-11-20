// 视觉冒烟：用 Playwright 截首页（dark/light）与示例页，产物存 .shots/（不入库）
// 依赖兄弟项目 ollama-docs-cn 的 playwright 安装。
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'ollama-docs-cn', 'package.json'));
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:4177/docs-cn/diagram-design';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', '.shots');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
for (const mode of ['dark', 'light']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(m => { try { localStorage.setItem('dd-mode', m); } catch (e) {} }, mode);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(OUT, `home-${mode}-viewport.png`) });
  await page.screenshot({ path: join(OUT, `home-${mode}-full.png`), fullPage: true });
  // 示例页
  await page.goto(BASE + '/examples/exploded.html', { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(OUT, `ex-exploded-${mode}.png`), fullPage: true });
  await page.goto(BASE + '/examples/axonometric-plan-campus-animated.html', { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(OUT, `ex-campus-anim-${mode}.png`), fullPage: true });
  if (errors.length) console.log(`[${mode}] page errors:`, errors.slice(0, 5));
  await ctx.close();
}
await browser.close();
console.log('shots saved to ' + OUT);
