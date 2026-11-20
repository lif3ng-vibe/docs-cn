// -zh 中文样张视觉自检:逐页检测 SVG text 是否溢出 viewBox,并对采样页截图
// 用法:node tools/zh-check.mjs [采样数,默认 12](依赖 127.0.0.1:4177 本地 serve)
import { createRequire } from 'node:module';
import { readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'ollama-docs-cn', 'package.json'));
const { chromium } = require('playwright');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const zhFiles = readdirSync(join(ROOT, 'site', 'gallery')).filter(f => f.endsWith('-zh.html')).sort();
const SAMPLE = Number(process.argv[2] || 12);
const OUT = join(ROOT, '.shots');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const overflowPages = [];
for (let i = 0; i < zhFiles.length; i++) {
  const f = zhFiles[i];
  await page.goto(`http://127.0.0.1:4177/docs-cn/diagram-design/gallery/${f}`, { waitUntil: 'load' });
  await page.waitForTimeout(150);
  const bad = await page.evaluate(() => {
    const out = [];
    for (const svg of document.querySelectorAll('svg')) {
      const vb = svg.viewBox && svg.viewBox.baseVal;
      if (!vb || !vb.width) continue;
      for (const t of svg.querySelectorAll('text')) {
        try {
          const b = t.getBBox();
          if (b.width === 0) continue;
          if (b.x < -2 || b.y < -2 || b.x + b.width > vb.width + 2 || b.y + b.height > vb.height + 2) {
            out.push(t.textContent.trim().slice(0, 36));
          }
        } catch {}
      }
    }
    return [...new Set(out)];
  });
  if (bad.length) overflowPages.push(`${f}: ${bad.join(' | ')}`);
  if (i % Math.max(1, Math.floor(zhFiles.length / SAMPLE)) === 0) {
    await page.screenshot({ path: join(OUT, `zh-${String(i).padStart(3, '0')}.png`) });
  }
}
await browser.close();
console.log(`checked ${zhFiles.length} -zh pages, overflow-suspect: ${overflowPages.length}`);
if (overflowPages.length) console.log(overflowPages.slice(0, 40).join('\n'));
