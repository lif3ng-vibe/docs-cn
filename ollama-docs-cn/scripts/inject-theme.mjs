#!/usr/bin/env node
/**
 * inject-theme.mjs —— 给 Mintlify 导出产物注入 CJK 字体微调 + Pagefind 本地搜索
 *
 * 做三件事：
 *   1) theme-src/theme.css → dist/theme.css
 *   2) theme-src/fonts/*.woff2|.otf → dist/fonts/（CSS 内用相对路径 url(fonts/…)，
 *      子路径部署时随 /docs-cn/pi/theme.css 自然解析，prefix-dist 无需改写）
 *   3) 每个页面的 index.html 在页头闭合标签前注入 <link rel="stylesheet" href="/theme.css" />，
 *      位于导出内联 <style>（docs.json 烘焙的 token）之后，同特异性按序覆盖；
 *      并在 </body> 前注入 Pagefind 搜索弹层（拦截 Mintlify 自带搜索钮与 ⌘K——
 *      匿名导出无搜索索引，原生搜索是死的）。
 *
 * 幂等：已有标记的页面跳过。用法：node scripts/inject-theme.mjs [dist目录]
 * 环境变量 DOCS_BASE：部署前缀（供搜索结果链接的 baseUrl，默认 /docs-cn/pi）。
 * 前置：pagefind 已按 --site dist 产出 dist/pagefind/（本脚本不改写其内部）。
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, process.argv[2] || 'dist');
const BASE = (process.env.DOCS_BASE || '/docs-cn/ollama').replace(/\/+$/, '');
const MARK = '<link rel="stylesheet" href="/theme.css" />';
const SEARCH_SNIPPET = `
<div id="pf-overlay" hidden>
  <div id="pf-backdrop"></div>
  <div id="pf-panel"><div id="pf-search"></div></div>
</div>
<link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
<link rel="stylesheet" href="/theme-search.css" />
<script src="/pagefind/pagefind-ui.js" defer></script>
<script>
(function () {
  var BASE = '${BASE}/';
  var booted = false;
  function open() {
    var ov = document.getElementById('pf-overlay');
    if (!ov) return;
    ov.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    if (!booted && window.PagefindUI) {
      new PagefindUI({
        element: '#pf-search',
        baseUrl: BASE,
        showImages: false,
        autofocus: true,
        translations: {
          placeholder: '搜索文档…',
          clear_search: '清除',
          load_more: '加载更多结果',
          search_label: '搜索本站',
          zero_results: '没有找到「[QUERY]」的相关结果',
          many_results: '「[QUERY]」共 [COUNT] 条结果',
          one_result: '「[QUERY]」共 1 条结果',
          searching: '正在搜索「[QUERY]」…'
        }
      });
      booted = true;
    }
    var inp = document.querySelector('#pf-search input');
    if (inp) setTimeout(function () { inp.focus(); }, 50);
  }
  function close() {
    var ov = document.getElementById('pf-overlay');
    if (!ov) return;
    ov.hidden = true;
    document.documentElement.style.overflow = '';
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button[class*="group/search"], #search-bar-entry-mobile');
    if (t) { e.preventDefault(); e.stopPropagation(); open(); return; }
    if (e.target.closest('#pf-backdrop')) close();
  }, true);
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault(); open();
    } else if (e.key === 'Escape') {
      close();
    }
  }, true);
})();
</script>`;

let pages = 0, injected = 0;
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') {
      pages++;
      const html = readFileSync(p, 'utf8');
      // 幂等（顺序无关）：theme link 在 prefix 后会带 BASE 前缀，两种形态任一存在即已注入
      const already =
        html.includes(MARK) || html.includes(`<link rel="stylesheet" href="${BASE}/theme.css" />`);
      let out = html;
      if (!already) {
        if (!html.includes('</head>')) throw new Error(`</head> 未找到: ${p}`);
        out = out.replace('</head>', `${MARK}</head>`);
        injected++;
      }
      // Mintlify 的 markdown 视图 alternate 声明指向 <page>.md——导出产物无此文件，剥掉防 404（幂等）
      out = out.replace(/<link rel="alternate" type="text\/markdown"[^>]*\/?>/g, '');
      // 汉化站语义：<html lang> 改 zh-CN（pagefind 亦按此选 CJK 字符级索引，幂等）
      out = out.replace(/(<html[^>]*?)lang="en"/, '$1lang="zh-CN"');
      if (!out.includes('id="pf-overlay"')) {
        if (!out.includes('</body>')) throw new Error(`</body> 未找到: ${p}`);
        out = out.replace('</body>', `${SEARCH_SNIPPET}</body>`);
      }
      if (out !== html) writeFileSync(p, out);
    }
  }
})(DIST);

let fontCount = 0;
const fontDir = join(ROOT, 'theme-src', 'fonts');
if (existsSync(fontDir)) {
  mkdirSync(join(DIST, 'fonts'), { recursive: true });
  for (const f of readdirSync(fontDir)) {
    copyFileSync(join(fontDir, f), join(DIST, 'fonts', f));
    fontCount++;
  }
}

// 匿名导出不含 _mintlify/export-assets/（fontawesome 图标、google fonts css，
// 线上由 CDN 供给）——从本地入库副本 _mintlify-assets/ 补齐，防图标 404。
const mintAssets = join(ROOT, '_mintlify-assets');
let assetCount = 0;
if (existsSync(mintAssets)) {
  (function copyAssets(src, rel) {
    for (const f of readdirSync(src, { withFileTypes: true })) {
      const s = join(src, f.name);
      const r = rel ? `${rel}/${f.name}` : f.name;
      if (f.isDirectory()) copyAssets(s, r);
      else {
        const d = join(DIST, '_mintlify', 'export-assets', r);
        mkdirSync(join(d, '..'), { recursive: true });
        copyFileSync(s, d);
        assetCount++;
      }
    }
  })(mintAssets, '');
}
writeFileSync(join(DIST, 'theme.css'), readFileSync(join(ROOT, 'theme-src', 'theme.css')));
writeFileSync(join(DIST, 'theme-search.css'), readFileSync(join(ROOT, 'theme-src', 'theme-search.css')));

// ---------- 生成 sitemap.xml 与 llms.txt（Mintlify 匿名导出不带，页头引用会 404） ----------
const SITE_URL = (process.env.DOCS_SITE_URL || 'https://lif3ng-vibe.github.io').replace(/\/+$/, '');
const pagesMeta = [];
(function collect(dir, rel) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) collect(p, rel ? `${rel}/${e.name}` : e.name);
    else if (e.name === 'index.html') {
      const t = (readFileSync(p, 'utf8').match(/<title>([^<]*)<\/title>/) || [])[1] || rel || 'Ollama';
      pagesMeta.push({ path: rel, title: t });
    }
  }
})(DIST, '');
pagesMeta.sort((a, b) => (a.path === '' ? -1 : b.path === '' ? 1 : a.path.localeCompare(b.path)));
const urls = pagesMeta.map((p) => {
  const loc = p.path === '' ? `${SITE_URL}${BASE}/` : `${SITE_URL}${BASE}/${p.path}/`;
  return `  <url><loc>${loc}</loc></url>`;
});
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
);
const lines = pagesMeta.map((p) => {
  const url = p.path === '' ? `${SITE_URL}${BASE}/` : `${SITE_URL}${BASE}/${p.path}/`;
  return `- [${p.title}](${url})`;
});
writeFileSync(
  join(DIST, 'llms.txt'),
  `# Ollama 中文文档（非官方镜像）\n\n> Ollama 官方文档中文镜像，源 https://docs.ollama.com 。本文件为 LLM 友好的站点索引。\n\n## 文档\n\n${lines.join('\n')}\n`,
);

console.log(`[theme] 页面 ${pages}，注入 ${injected}，theme.css + 搜索弹层 + ${fontCount} 字体 + ${assetCount} mint 资产就位；sitemap.xml ${pagesMeta.length} URL + llms.txt 已生成`);
if (!existsSync(join(DIST, 'theme.css'))) throw new Error('theme.css 未落盘');
