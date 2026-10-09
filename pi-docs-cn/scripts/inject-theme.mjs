#!/usr/bin/env node
/**
 * inject-theme.mjs —— 把 pi.dev 风格皮肤注入 Mintlify 导出产物
 *
 * 做三件事：
 *   1) theme-src/theme.css → dist/theme.css
 *   2) theme-src/fonts/*.woff2|.otf → dist/fonts/（CSS 内用相对路径 url(fonts/…)，
 *      子路径部署时随 /docs-cn/pi/theme.css 自然解析，prefix-dist 无需改写）
 *   3) 每个页面的 index.html 在页头闭合标签前注入 <link rel="stylesheet" href="/theme.css" />，
 *      位于导出内联 <style>（docs.json 烘焙的 token）之后，同特异性按序覆盖。
 *
 * 幂等：已有标记的页面跳过。用法：node scripts/inject-theme.mjs [dist目录]
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, process.argv[2] || 'dist');
const MARK = '<link rel="stylesheet" href="/theme.css" />';

let pages = 0, injected = 0;
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') {
      pages++;
      const html = readFileSync(p, 'utf8');
      if (html.includes(MARK)) continue;
      if (!html.includes('</head>')) throw new Error(`</head> 未找到: ${p}`);
      writeFileSync(p, html.replace('</head>', `${MARK}</head>`));
      injected++;
    }
  }
})(DIST);

mkdirSync(join(DIST, 'fonts'), { recursive: true });
for (const f of readdirSync(join(ROOT, 'theme-src', 'fonts'))) {
  copyFileSync(join(ROOT, 'theme-src', 'fonts', f), join(DIST, 'fonts', f));
}
writeFileSync(join(DIST, 'theme.css'), readFileSync(join(ROOT, 'theme-src', 'theme.css')));

console.log(`[theme] 页面 ${pages}，注入 ${injected}，theme.css + ${readdirSync(join(DIST, 'fonts')).length} 字体就位`);
if (!existsSync(join(DIST, 'theme.css'))) throw new Error('theme.css 未落盘');
