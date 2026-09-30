const fs = require('fs');
const f = 'scripts/new-en-mirror.cjs';
const lines = fs.readFileSync(f, 'utf8').split('\n');
let removed = 0;
let replaced = 0;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('fs.mkdirSync(path.dirname(file)')) {
    lines.splice(i, 1);
    removed++;
  }
}
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('for (const { siteFile, md } of rewritten) fs.writeFileSync')) {
    lines[i] = '\tfor (const { siteFile, md } of rewritten) {';
    lines.splice(i + 1, 0, '\t\tfs.mkdirSync(path.dirname(path.join(docsDir, siteFile)), { recursive: true });');
    lines.splice(i + 2, 0, '\t\tfs.writeFileSync(path.join(docsDir, siteFile), md, \'utf8\');');
    lines.splice(i + 3, 0, '\t}');
    replaced++;
    break;
  }
}
fs.writeFileSync(f, lines.join('\n'));
console.log('删除错位 ' + removed + ' 行；替换循环 ' + replaced + ' 处');
