// 扫描构建产物 HTML 正文字面 **（CJK 粗体闭合失败的特征）。
// 剥掉 script/style/code/pre 与全部标签后查 '**'。
// 用法：node scripts-cn/check-bold.cjs [buildDir]
const fs = require('fs');
const path = require('path');

const BUILD = path.resolve(process.argv[2] || path.join(__dirname, '..', 'build'));
const hits = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      const rel = path.relative(BUILD, full).replace(/\\/g, '/');
      const html = fs.readFileSync(full, 'utf8');
      let text = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<(code|pre)[\s\S]*?<\/\1>/gi, ' ');
      text = text.replace(/<[^>]+>/g, ' ');
      let idx = text.indexOf('**');
      while (idx >= 0) {
        hits.push(rel + ' :: ' + text.slice(Math.max(0, idx - 60), idx + 60).replace(/\s+/g, ' '));
        idx = text.indexOf('**', idx + 2);
      }
    }
  }
}
walk(BUILD);
if (!hits.length) {
  console.log('CLEAN');
  process.exit(0);
}
console.log(hits.length + ' hits:');
for (const h of hits.slice(0, 40)) console.log(h);
process.exit(1);
