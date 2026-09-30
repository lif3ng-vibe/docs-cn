#!/usr/bin/env node
// 仓库源码树的站外链接（packages/scripts/skills + 根 README/CHANGELOG）一律指向 GitHub。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..', 'src', 'content', 'docs');
const RE = /\]\((?:\.\.\/)+(?:packages|scripts|skills)\/([^)\s]+)\)/g;
const ROOT_RE = /\]\((?:\.\.\/){2,}((?:CHANGELOG|README)\.md)(#[^)\s]*)?\)/g;

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(?:md|mdx)$/i.test(e.name)) yield p;
  }
}

let n = 0;
for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  const out = src
    .replace(RE, (_m, rel) => {
      n++;
      return '](https://github.com/mvschwarz/openrig/blob/main/' + rel + ')';
    })
    .replace(ROOT_RE, (_m, name, hash) => {
      n++;
      return '](https://github.com/mvschwarz/openrig/blob/main/' + name + (hash || '') + ')';
    });
  if (out !== src) fs.writeFileSync(file, out);
}
console.log('仓库链接改写: ' + n + ' 处');
