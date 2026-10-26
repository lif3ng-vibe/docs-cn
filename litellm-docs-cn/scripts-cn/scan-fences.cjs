// 全站围栏奇偶扫描：奇数围栏 = 断裂文件清单。
const fs = require('fs');
const path = require('path');
function walk(d, out) {
  for (const e of fs.readdirSync(d, {withFileTypes: true})) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (/\.(md|mdx)$/.test(e.name)) out.push(f);
  }
}
const files = [];
walk('docs', files);
walk(path.join('src', 'pages'), files);
const bad = [];
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const n = (t.match(/^[ \t]*```/gm) || []).length;
  if (n % 2) bad.push(path.relative('.', f).split(path.sep).join('/') + ' fences:' + n);
}
console.log(bad.length ? 'ODD-FENCE files:' : 'ALL-EVEN');
bad.forEach((b) => console.log(b));
