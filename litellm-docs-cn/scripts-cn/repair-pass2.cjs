// 回修 pass2：EN/CN 锚点按文档顺序配对（两构建锚点数一致的页面），全局改写旧锚点链接。
// 这是对 map 驱动 repair-anchors 的兜底（覆盖无 map/未验证条目）。
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'anchors-en.json'), 'utf8'));
const cn = JSON.parse(fs.readFileSync(path.join(ROOT, 'anchors-cn.json'), 'utf8'));

// 页键 → {old:[ids按序], new:[ids按序]}（两方数量一致才可配对）
const pairs = {};
for (const key of Object.keys(en)) {
  const olds = Object.keys(en[key].anchors || {});
  const c = cn[key];
  if (!c) continue;
  const news = Object.keys(c.anchors || {});
  if (olds.length !== news.length || !olds.length) continue;
  pairs[key] = {olds, news};
}
console.log('pairable pages:', Object.keys(pairs).length);

// 待扫描源文件
function walk(d, out) {
  for (const e of fs.readdirSync(d, {withFileTypes: true})) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (/\.(md|mdx)$/.test(e.name)) out.push(f);
  }
}
const files = [];
walk(path.join(ROOT, 'docs'), files);
walk(path.join(ROOT, 'src', 'pages'), files);

function norm(p) { return p.replace(/\\/g, '/').replace(/\.mdx?$/, ''); }
function resolveKey(fromFile, href) {
  let p = href;
  if (p.startsWith('/docs/')) p = p.slice('/docs/'.length);
  else if (p.startsWith('/')) p = p.slice(1);
  else p = path.relative(path.join(ROOT, 'docs'), path.resolve(path.dirname(fromFile), p)).replace(/\\/g, '/');
  p = norm(p);
  const cands = [p, p + '/index', 'docs/' + p.replace(/^docs\//, ''), 'docs/' + p.replace(/^docs\//, '') + '/index'];
  const noPages = p.replace(/^src\/pages\//, '');
  cands.push(noPages, noPages + '/index');
  for (const c of cands) if (pairs[c]) return c;
  return null;
}

let filesChanged = 0, linksChanged = 0;
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src.replace(/\]\(([^)#\s]*)?(#[^)\s]+)?\)/g, (whole, href = '', anchor = '') => {
    if (!anchor || /^https?:/.test(href || '')) return whole;
    const oldAnchor = decodeURIComponent(anchor.slice(1));
    const key = !href ? resolveKey(file, norm(path.relative(ROOT, file))) : resolveKey(file, href);
    if (!key) return whole;
    const pr = pairs[key];
    if (!pr) return whole;
    // 旧锚点可能是编码形态
    const raw = anchor.slice(1);
    const idx = pr.olds.indexOf(oldAnchor) !== -1 ? pr.olds.indexOf(oldAnchor) : pr.olds.indexOf(raw);
    if (idx < 0) return whole;
    const newId = pr.news[idx];
    if (!newId || newId === raw) return whole;
    linksChanged++;
    return `](${href}#${newId})`;
  });
  if (out !== src) { filesChanged++; fs.writeFileSync(file, out); }
}
console.log('files changed:', filesChanged, '| links rewritten:', linksChanged);
