// 跨文件锚点回修：翻译完成后统一执行。
// 读 .anchor-maps/**/*.map.md（行格式：原英文标题 | 中文标题 | 新锚点），
// 把各 md 正文里 `](path.md#oldSlug)` 的 oldSlug（= slugger(原英文标题)）
// 改写为新锚点。链接路径与文字不动。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import GithubSlugger from 'github-slugger';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'docs');
const MAPS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.anchor-maps');
const slugger = new GithubSlugger();

// 1) 收集映射：targetRelPath -> { oldSlug: newSlug }
const maps = new Map();
function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.map.md')) yield p;
  }
}
for (const mf of walk(MAPS)) {
  // <name>.md.map.md → docs 内相对路径 <name>.md；map 目录结构对应 docs 子目录
  const rel = path.relative(MAPS, mf).replace(/\.map\.md$/, '');
  const table = {};
  for (const line of fs.readFileSync(mf, 'utf8').split('\n')) {
    const parts = line.split('|').map((s) => s.trim());
    if (parts.length < 3 || !parts[0] || !parts[2]) continue;
    const oldSlug = slugger.slug(parts[0]);
    if (oldSlug !== parts[2]) table[oldSlug] = parts[2];
  }
  if (Object.keys(table).length) maps.set(rel.replace(/\\/g, '/'), table);
}
console.log(`载入映射文件 ${maps.size} 份`);

// 2) 扫正文跨文件锚点链接
function* walkDocs(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walkDocs(p);
    else if (/\.(md|mdx)$/.test(e.name)) yield p;
  }
}

let fixed = 0, missed = 0;
const LINK = /\]\(([^)#\s]+\.md)(#[^)\s]+)\)/g;
for (const file of walkDocs(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  const out = src.replace(LINK, (m, p, anchor) => {
    const target = path.posix.normalize(path.posix.join(path.dirname(path.relative(ROOT, file)).replace(/\\/g, '/') || '.', p));
    const table = maps.get(target);
    if (!table) return m; // 目标未译或无映射
    const old = anchor.slice(1);
    const nw = table[old];
    if (!nw) { missed++; console.log(`MISS ${path.relative(ROOT, file)} -> ${target}#${old}`); return m; }
    fixed++;
    return `](${p}#${nw})`;
  });
  if (out !== src) fs.writeFileSync(file, out);
}
console.log(`跨文件锚点改写 ${fixed} 处，未命中 ${missed} 处`);
