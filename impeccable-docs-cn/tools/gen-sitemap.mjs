#!/usr/bin/env node
// 从 build 产物重生成 sitemap.xml 与 robots.txt（上游遗留旧清单 → 全量）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(root, 'build');
const SITE = 'https://lif3ng-vibe.github.io/docs-cn/impeccable';

const pages = [];
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f === 'index.html') {
      let rel = path.relative(build, p).split(path.sep).join('/');
      rel = rel.slice(0, -'/index.html'.length); // docs/polish
      if (rel === 'index') rel = '';
      pages.push('/' + rel);
    }
  }
}
walk(build);

const today = new Date().toISOString().slice(0, 10);
const urls = pages.map((p) => (p === '/' ? '/' : p + '/'));
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map((u) => `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(root, 'site/public/sitemap.xml'), xml);
fs.writeFileSync(
  path.join(root, 'site/public/robots.txt'),
  `# 汉化镜像（非官方翻译，内容版权归原作）\nUser-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
);
console.log('sitemap urls:', urls.length);
