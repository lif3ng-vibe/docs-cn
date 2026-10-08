/**
 * GitHub Pages 子路径部署的前处理：把 mint export 产物中的根绝对引用
 * 改写为带部署前缀的形态。
 *
 * 覆盖形态（HTML 属性 / RSC payload 的 \" 转义形态 / JS chunk 字符串）：
 *   "/_next…        站点静态资源（Next chunks，含 JS 内硬编码）
 *   "/images…、"/favicons…、"/logo-*.png、"/favicon-*.png   根资产
 *   "/<page>"、"/<page>#…   页面内链（key 集合从 mdx 文件树推导，
 *                           含 integrations/index→/integrations 的折叠形态）
 *
 * 不动：https:// 外链、# 页内锚点、canonical/og:url（保留指向原站，镜像 SEO 友好）。
 * export 产物里混入的非站点文件（.anchor-maps、*.mjs、.gitignore）一并剔除。
 *
 * 用法：node postprocess-export.mjs <export解包目录> <前缀如 /docs-cn/tester-army-e2e>
 */
import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , targetDir, rawBase] = process.argv;
if (!targetDir || !rawBase) { console.error('用法: node postprocess-export.mjs <目录> <前缀>'); process.exit(1); }
const BASE = ('/' + rawBase.replace(/^\/+|\/+$/g, ''));

// 页面 key 集合：从项目 mdx 树推导（不含 examples/snippets/.anchor-maps）。
// 注意:t='/' 绝不能进替换表——payload 里 \" + "/" 会二次命中已改写串产生双前缀。
const PROJ = fileURLToPath(new URL('.', import.meta.url));
const pageUrls = new Set(['/index', '/llms.txt']);
const indexUrls = new Set(); // 目录索引折叠形态（integrations/index → /integrations）单独入表
function walkMdx(dir, rel = '') {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (['node_modules', 'examples', 'snippets', '.git', '.anchor-maps'].includes(e.name)) continue;
      walkMdx(join(dir, e.name), r);
    } else if (e.name.endsWith('.mdx') || e.name.endsWith('.md')) {
      const key = r.replace(/\.mdx$|\.md$/, '');
      pageUrls.add('/' + key);
      pageUrls.add('/' + key + '/index');
      if (key.endsWith('/index')) indexUrls.add('/' + key.slice(0, -'/index'.length));
    }
  }
}
walkMdx(PROJ);
const rootAssets = ['/_next', '/images', '/favicons', '/logo-black.png', '/logo-white.png', '/favicon-black.png', '/favicon-white.png', '/llms.txt', '/sitemap.xml', '/sitemap-index.xml'];
const targets = [...rootAssets, ...pageUrls, ...indexUrls].sort((a, b) => b.length - a.length); // 长者先行，防 /ci 抢 /ci/github-actions
// redirects 的 source 路径（/mobile-ci 等）也入表
const docs = JSON.parse(readFileSync(join(PROJ, 'docs.json'), 'utf8'));
for (const r of docs.redirects ?? []) targets.push(r.source.replace(/#.*/, ''));
console.log(`改写目标：${targets.length} 个前缀 + /_next 系`);

// 剔除非站点杂项
for (const junk of ['.anchor-maps', 'check-links.mjs', 'fix-anchors.mjs', '.gitignore', 'GLOSSARY.md', 'README.md', 'package.json', 'package-lock.json', 'postprocess-export.mjs', 'scan-en-lines.mjs', 'scan-bold.mjs', 'export.zip']) {
  const p = join(targetDir, junk);
  if (existsSync(p)) { rmSync(p, { recursive: true, force: true }); }
}

function rewrite(html) {
  let out = html;
  // 0. 首页 URL "/"（引-斜杠-引 的完整 token，payload 与 href 两形态；不碰 \"​/> 序列）
  for (const q of ['"', '\\"', "'"]) { out = out.split(`${q}/${q}`).join(`${q}${BASE}/${q}`); }
  // 1. /_next（HTML 属性 "、payload \\" 转义、JS 字符串）；再补单引号 JS 形态
  for (const q of ['"', '\\"', "'"]) { out = out.split(`${q}/_next`).join(`${q}${BASE}/_next`); }
  // 2. 页面与资产路径：前缀替换（无闭合锚，"/images/icons/x.svg" 这类带子路径的也命中）
  for (const t of targets) {
    if (t === '/_next') continue;
    for (const q of ['"', '\\"', "'"]) { out = out.split(`${q}${t}`).join(`${q}${BASE}${t}`); }
  }
  return out;
}

let files = 0, changed = 0;
function walk2(dir, rel = '') {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) { walk2(join(dir, e.name), r); continue; }
    // 只改 HTML：引用都在 HTML 属性与内嵌 RSC payload 里；JS/CSS 一动就
    // 可能弄破语法（实测改 JS 会 SyntaxError），JS 内的少量 /_next 硬编码
    // 引用属于可选功能（如搜索 worker），404 只降级不致命。
    if (!/\.html$/.test(e.name)) continue;
    files++;
    const path = join(dir, e.name);
    const before = readFileSync(path, 'utf8');
    const after = before.includes(BASE) ? before : rewrite(before);
    if (after !== before) { writeFileSync(path, after); changed++; }
  }
}
walk2(targetDir);
console.log(`处理 ${files} 个 HTML，改写 ${changed} 个（BASE=${BASE}）`);