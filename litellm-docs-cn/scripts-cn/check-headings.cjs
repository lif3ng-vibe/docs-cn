// 标题数对账：anchors-en.json 里每页的标题数 vs 译文文件的标题数。
// 译文 < 原文 → 分段合并丢内容（静默损伤）；输出差额清单。
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const anchorsEn = JSON.parse(fs.readFileSync(path.join(ROOT, 'anchors-en.json'), 'utf8'));

function countHeadings(text) {
  // 剥代码围栏后数标题（含引用块内的 `> ####` 形态——Docusaurus 同样为其生成锚点）
  const stripped = text.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '');
  const md = (stripped.match(/^\s*>\s*#{1,6} |^#{1,6} /gm) || []).length;
  // JSX 组件标题（<Heading as=... id="...">）同样产生页内锚点
  const jsx = (stripped.match(/<Heading[^>]*\bid=/g) || []).length;
  return md + jsx;
}

const bad = [];
for (const [key, page] of Object.entries(anchorsEn)) {
  // 构建键 → 源文件路径（docs/proxy/auto_routing/index → docs/proxy/auto_routing.md，
  // 目录 index → 目录下 index.md；根级 src/pages → src/pages/*.md）
  let rel = null;
  const tryPaths = [];
  if (key.endsWith('/index')) {
    tryPaths.push(key.replace(/\/index$/, '.md'), key.replace(/\/index$/, '/index.md'));
  } else {
    tryPaths.push(key + '.md', key + '/index.md');
  }
  for (const t of tryPaths) {
    const cand = path.join(ROOT, t);
    if (fs.existsSync(cand)) { rel = t; break; }
    const alt = t.replace(/^docs\//, 'src/pages/');
    if (fs.existsSync(path.join(ROOT, alt))) { rel = alt; break; }
  }
  if (!rel) continue;
  const enCount = Object.keys(page.anchors || {}).length;
  const cnCount = countHeadings(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  if (cnCount < enCount) bad.push(`${rel} EN:${enCount} CN:${cnCount} 缺 ${enCount - cnCount}`);
}
bad.sort();
console.log(bad.length ? '标题缺失：' : 'ALL-MATCH');
for (const b of bad) console.log(b);
