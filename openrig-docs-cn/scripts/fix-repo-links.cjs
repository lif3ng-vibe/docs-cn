#!/usr/bin/env node
// 把正文里指向仓库源码树的相对链接（../../packages/… 与仓库根 README/CHANGELOG）
// 改写为 GitHub 绝对 URL。镜像站不含这些文件，不改写就是死链。
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'content', 'docs');
const RE = /\]\((?:\.\.\/)+(?:packages|scripts|skills)\/([^)\s]+)\)/g;
const ROOT_RE = /\]\((?:\.\.\/)+((?:CHANGELOG|README)\.md)(#[^)\s]*)?\)/g;

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(md|mdx)$/.test(e.name)) yield p;
  }
}

let n = 0;
for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  const out = src
    .replace(RE, (_m, rel) => {
      n++;
      return `](https://github.com/mvschwarz/openrig/blob/main/${rel})`;
    })
    .replace(ROOT_RE, (_m, name, hash) => {
      n++;
      return `](https://github.com/mvschwarz/openrig/blob/main/${name}${hash || ''})`;
    });
  if (out !== src) fs.writeFileSync(file, out);
}
console.log('仓库链接改写: ' + n + ' 处');
process.exit(0);