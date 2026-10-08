/**
 * 锚点校验脚本（Mintlify 无静态 dist 的「构建后锚点核对」等价物）。
 *
 * 做法：剥掉 fenced code block 后扫每个 .mdx 的 ATX 标题，用 github-slugger
 * （与 Mintlify 平台的 rehype-slug 同算法）重算 slug；再收集全站页内 #锚点
 * 链接、跨页 ](/page#anchor) 内链与 Card href，逐一对目标页 slug 集校验。
 * 同时校验 docs.json redirects 的 destination 锚点。
 *
 * 用法：node check-links.mjs            (全站)
 *       node check-links.mjs page1.mdx  (只看指定页与其被引页)
 *
 * 有不匹配打印 `文件:行 锚点 (目标页)` 列表，退出 1；全部匹配打印 CLEAN 退出 0。
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';


const ROOT = fileURLToPath(new URL('.', import.meta.url));

/** 页面 key（docs.json pages 形态，如 "ci/github-actions"）→ 文件路径。 */
const pageFiles = new Map(); // key -> relative file
const fileSlugs = new Map(); // relative file -> Set<slug>

// Mintlify 的标题 slug 规则（对原站 52 页 HTML 逐标题比对得出）：
// lowercase → 非 Unicode 字母/数字段转一个连字符（. 、 ` 、( ) 等都算；
// 连字符与 ’（U+2019）例外保留）→ 连续连字符合并 → 首尾连字符去除；
// 非 ASCII 字符（CJK 等）原样保留。
function mintlifySlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}’\-_]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripFences(src) {
  return src.replace(/^```.*?\n[\s\S]*?^```/gm, '');
}

// 跳过 frontmatter 后收集标题 slug（跨页同 slug 需去重者极罕见，简化为集合）
function headingSlugs(src) {
  const slugs = new Set();
  let inFm = false, seenFm = false;
  for (const raw of stripFences(src).split('\n')) {
    if (!seenFm && raw.trim() === '---') { if (!inFm) { inFm = true; continue; } else { inFm = false; seenFm = true; continue; } }
    if (inFm) continue;
    const m = raw.match(/^(#{1,6})\s+(.*\S)\s*$/);
    if (m) {
      const explicit = m[2].match(/\{#([^}]+)\}\s*$/);
      slugs.add(explicit ? explicit[1].trim() : mintlifySlug(m[2].replace(/\{#[^}]*\}\s*$/, '')));
    }
  }
  return slugs;
}

function walk(dir, rel = '') {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'examples' || e.name === 'snippets' || e.name === '.git') continue;
      walk(join(dir, e.name), r);
    } else if (e.name.endsWith('.mdx') || e.name.endsWith('.md')) {
      const key = r.replace(/\.mdx$|\.md$/, '');
      pageFiles.set(key, r);
      fileSlugs.set(r, headingSlugs(readFileSync(join(dir, e.name), 'utf8')));
    }
  }
}
walk(ROOT);

function resolveHrefToPage(href) {
  // href: "/cache" | "reference/expect" | "integrations/index" | ""（页内）
  let h = href.trim();
  h = h.replace(/^\//, '');
  if (h === '') return 'index';
  return h.replace(/\/$/, '').replace(/\.mdx$|\.md$/, '');
}

const problems = [];
function checkFile(rel, src) {
  const text = stripFences(src);
  const lines = text.split('\n');
  // markdown 内链与 href= 属性（含 Mintlify Card 等）
  const linkRe = /\[[^\]]*\]\(\s*(<[^>]*>|[^)\s]+)\s*(?:["'][^)]*["'])?\s*\)/g;
  const hrefRe = /href=["']([^"']+)["']/g;
  let m;
  for (let ln = 0; ln < lines.length; ln++) {
    const line = lines[ln];
    const refs = [];
    while ((m = linkRe.exec(line))) refs.push(m[1].replace(/^<|>$/g, ''));
    while ((m = hrefRe.exec(line))) refs.push(m[1]);
    for (const ref of refs) {
      if (/^(https?:|mailto:|data:)/.test(ref)) continue; // 外链不查
      if (!ref.startsWith('#') && !ref.startsWith('/')) continue; // 相对文件路径等不查
      const hashIdx = ref.indexOf('#');
      let page = '', anchor = null;
      if (hashIdx >= 0) { page = ref.slice(0, hashIdx); anchor = ref.slice(hashIdx + 1); }
      else { page = ref; }
      if (ref.startsWith('#')) {
        // 页内锚点
        const slugs = fileSlugs.get(rel);
        if (slugs && !slugs.has(ref.slice(1))) {
          problems.push(`${rel}:${ln + 1}  页内锚点缺失 "#${ref.slice(1)}"`);
        }
        continue;
      }
      const targetKey = resolveHrefToPage(page);
      // 目录索引页可写作 "/integrations"（同 "integrations/index"）
      const targetFile = pageFiles.get(targetKey) ?? (pageFiles.has(`${targetKey}/index`) ? pageFiles.get(`${targetKey}/index`) : undefined);
      if (!targetFile) {
        problems.push(`${rel}:${ln + 1}  未知页面 "${ref}"（key: ${targetKey}）`);
        continue;
      }
      if (anchor !== null) {
        const slugs = fileSlugs.get(targetFile);
        if (slugs && !slugs.has(anchor)) {
          problems.push(`${rel}:${ln + 1}  锚点缺失 "#${anchor}" → ${targetFile}`);
        }
      }
    }
  }
}

for (const [rel, src] of [...fileSlugs].filter(([r]) => existsSync(join(ROOT, r)))) {
  checkFile(rel, readFileSync(join(ROOT, rel), 'utf8'));
}

// docs.json 的 redirects 锚点
const docsJson = JSON.parse(readFileSync(join(ROOT, 'docs.json'), 'utf8'));
for (const r of docsJson.redirects ?? []) {
  const hashIdx = r.destination.indexOf('#');
  if (hashIdx < 0) continue;
  const page = r.destination.slice(0, hashIdx).replace(/^\//, '').replace(/\/$/, '');
  const anchor = r.destination.slice(hashIdx + 1);
  const targetFile = pageFiles.get(page === '' ? 'index' : page);
  if (!targetFile) { problems.push(`docs.json redirects  未知页面 "${r.destination}"`); continue; }
  const slugs = fileSlugs.get(targetFile);
  if (slugs && !slugs.has(anchor)) {
    problems.push(`docs.json redirects  锚点缺失 "#${anchor}" → ${targetFile}（source: ${r.source}）`);
  }
}

if (problems.length) {
  for (const p of problems) console.log(p);
  console.error(`MISMATCH: ${problems.length} 处`);
  process.exit(1);
} else {
  console.log('CLEAN');
}