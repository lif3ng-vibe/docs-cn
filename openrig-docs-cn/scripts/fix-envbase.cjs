const fs = require('fs');
const f = 'scripts/check-dist.mjs';
const lines = fs.readFileSync(f, 'utf8').split('\n');
const CLS = '/[' + '/' + ']+$/';
lines[8] = "const envBase = (process.env.DOCS_BASE || '/').replace(/[/]+$/, '');";
let stripLineIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('test(linkPath)')) {
    stripLineIdx = i;
    break;
  }
}
if (stripLineIdx !== -1) {
  const next = lines[stripLineIdx + 1] || '';
  if (!next.includes('envBase')) {
    lines.splice(stripLineIdx + 1, 0, "    if (envBase !== '' && envBase !== '/' && linkPath.startsWith(envBase)) linkPath = linkPath.slice(envBase.length);");
  }
}
fs.writeFileSync(f, lines.join('\n'));
console.log('line9 已修; strip 行 at', stripLineIdx + 2);
