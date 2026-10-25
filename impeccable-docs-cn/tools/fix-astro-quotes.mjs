#!/usr/bin/env node
// 1) 清理 astro 模板行里上游遗留的属性双引号笔误（href="..."")
// 2) DocsSidebar 模板链接前缀化
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const dirs = ['site/pages', 'site/components', 'site/layouts'];
const files = new Set();
for (const d of dirs) {
  try {
    const out = execSync(`grep -rl "" ${d} --include=*.astro`, { encoding: 'utf8' });
    for (const f of out.trim().split(/\r?\n/)) if (f) files.add(f);
  } catch { /* no match */ }
}

let n = 0;
for (const f of files) {
  let t = fs.readFileSync(f, 'utf8');
  const lines = t.split('\n');
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<') && lines[i].includes('""')) {
      const fixed = lines[i].split('""').join('"');
      if (fixed !== lines[i]) { lines[i] = fixed; changed = true; }
    }
  }
  if (changed) { fs.writeFileSync(f, lines.join('\n')); n++; }
}

const sbPath = 'site/components/DocsSidebar.astro';
let sb = fs.readFileSync(sbPath, 'utf8');
const B = '/docs-cn/impeccable';
sb = sb.split('href={`/tutorials/${t.id}`}')
  .join(`href={\`${B}/tutorials/\${t.id}\`}`);
sb = sb.split('href={`/docs/${entry.id}`}')
  .join(`href={\`${B}/docs/\${entry.id}\`}`);
sb = sb.split('href={`/docs/${cmd.slug}`}')
  .join(`href={\`${B}/docs/\${cmd.slug}\`}`);
fs.writeFileSync(sbPath, sb);

console.log('quote-cleaned files:', n, '| sidebar prefixed');
