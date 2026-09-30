#!/usr/bin/env node
// 相对 .md 内链 → 根绝对路由链接（/dir/page/#frag）。
// Starlight 不改写 .md 相对链接，dist 里原样保留会在浏览器 404；
// 根绝对路由链接由 CI 的 base sed 统一加前缀（hub 标准流程）。
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'content', 'docs');
const LINK = /\]\(((?:\.\.?\/|[^)/\s#])[^)\s#]*\.md)(#[^)\s]*)?\)/g;

function walk(dir, base, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = dir + '/' + e.name;
    const rel = base ? base + '/' + e.name : e.name;
    if (e.isDirectory()) {
      walk(p, rel, out);
    } else if (/\.(md|mdx)$/.test(e.name)) {
      out.push({ file: p, rel: rel });
    }
  }
  return out;
}

const files = walk(ROOT, '', []);
let n = 0;
for (const item of files) {
  const src = fs.readFileSync(item.file, 'utf8');
  const fileDir = path.posix.dirname(item.rel);
  const out = src.replace(LINK, function (m, linkPath, frag) {
    if (linkPath.startsWith('/')) return m;
    if (linkPath.includes('://')) return m;
    const joined = path.posix.join(fileDir, linkPath);
    const route = path.posix.normalize(joined).replace(/\.md$/, '');
    n++;
    return '](' + '/' + route + '/' + (frag || '') + ')';
  });
  if (out !== src) fs.writeFileSync(item.file, out);
}
console.log('相对 md 链接改写为路由链接: ' + n + ' 处');
process.exit(0);
