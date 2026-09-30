const fs = require('fs');
const f = 'scripts/check-dist.mjs';
const lines = fs.readFileSync(f, 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("if (envBase !== ''") && lines[i].includes('linkPath = linkPath.slice')) {
    lines[i] = "    let lp = linkPath;";
    lines.splice(i + 1, 0, "    if (envBase !== '' && envBase !== '/' && lp.startsWith(envBase)) lp = lp.slice(envBase.length);");
    break;
  }
}
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const joined = linkPath.startsWith')) {
    lines[i] = lines[i].split('linkPath').join('lp');
    break;
  }
}
fs.writeFileSync(f, lines.join('\n'));
console.log('lp 变量化完成');
