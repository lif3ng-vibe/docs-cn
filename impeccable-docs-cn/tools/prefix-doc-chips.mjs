#!/usr/bin/env node
// Doc.astro 关系 chips 模板链接前缀化（canonicalPath 是逻辑参数，保持原样）
import fs from 'node:fs';

const f = 'site/layouts/Doc.astro';
const B = '/docs-cn/impeccable';
let t = fs.readFileSync(f, 'utf8');
const pairs = [
  ['href={`/docs/${cmd}`}', `href={\`${B}/docs/\${cmd}\`}`],
  ['href={`/docs/${relationships.pairs}`}', `href={\`${B}/docs/\${relationships.pairs}\`}`],
];
let n = 0;
for (const [a, b] of pairs) {
  if (t.includes(a)) { t = t.split(a).join(b); n++; }
}
fs.writeFileSync(f, t);
console.log('replaced:', n);
