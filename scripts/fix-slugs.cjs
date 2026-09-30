#!/usr/bin/env node
// EN 镜像 sidebar slug + 锚点表键统一按 Starlight 归一规则（小写、去点、README 保留原样小写）。
const fs = require('fs');

function normSlug(s) {
  return s.toLowerCase().replace(/\./g, '');
}

// 1) EN astro.config.mjs 的 slug
const cfg = 'openrig-docs-en/astro.config.mjs';
let c = fs.readFileSync(cfg, 'utf8');
c = c.replace(/slug: '([^']*)'/g, function (m, g1) {
  return "slug: '" + normSlug(g1) + "'";
});
fs.writeFileSync(cfg, c);
console.log('astro.config slug 归一完成');

// 2) gen-anchor-json.cjs 的 pageKey 归一并重生成锚点表
const gen = 'C:/Users/lif3n/src/openrig-docs-cn/scripts/gen-anchor-json.cjs';
let g = fs.readFileSync(gen, 'utf8');
const oldLine = "  const pageKey = '/' + rel.replace(/\\.md$/, '');";
const newLine = "  const pageKey = '/' + normSlug(rel.replace(/\\.md$/, ''));";
if (g.includes(oldLine)) {
  g = g.split(oldLine).join(newLine);
  const helper = "function normSlug(s) {\n  return s.toLowerCase().replace(/\\./g, '');\n}\n\n";
  g = g.replace('const map = {};', helper + '\nconst map = {};');
  fs.writeFileSync(gen, g);
  console.log('gen-anchor-json pageKey 归一完成');
} else {
  console.log('gen-anchor-json 形态已变');
}