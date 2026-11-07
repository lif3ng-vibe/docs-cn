// mermaid 渲染冒烟：对 dist 起 preview（须先 `npm run preview` 在 4321 端口），
// 加载 capy 页等待 svg[id^="mermaid-"]，验证流程图真实渲染。
// 用法：node scripts/mermaid-smoke.mjs [distDir]
import { chromium } from '../../ollama-docs-cn/node_modules/playwright/index.mjs';

const base = 'http://localhost:4321';
const pages = ['/capy/', '/recommended-harness/'];

const browser = await chromium.launch();
let fail = 0;
for (const p of pages) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(base + p, { waitUntil: 'networkidle' });
  try {
    await page.waitForSelector('svg[id^="mermaid-"]', { timeout: 8000 });
    const count = await page.locator('svg[id^="mermaid-"]').count();
    const hasNodes = await page.locator('svg[id^="mermaid-"] .node, svg[id^="mermaid-"] path').first().isVisible();
    console.log(`${p}: 渲染出 ${count} 个 svg，节点可见=${hasNodes} ✓`);
    await page.screenshot({ path: `.mermaid-smoke-${p.replace(/\//g, '')}.png`, fullPage: false });
  } catch {
    fail++;
    console.log(`${p}: 8s 内未出现 mermaid svg ✗`);
    const txt = await page.locator('pre.mermaid').first().textContent().catch(() => null);
    console.log('  pre.mermaid 残留:', txt ? txt.slice(0, 60) : '无');
  }
  await page.close();
}
await browser.close();
process.exit(fail ? 1 : 0);
