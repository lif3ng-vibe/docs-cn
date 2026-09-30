const fs = require('fs');
const f = 'scripts/check-dist.mjs';
let s = fs.readFileSync(f, 'utf8');
const BS = String.fromCharCode(92);
const q = String.fromCharCode(39);
const oldLine = '  html = html.replace(/<(?:code|pre)[^>]*>[' + BS + 's' + BS + 'S]*?<' + BS + '/(?:code|pre)>/g, ' + q + ' ' + q + ');';
const dup = oldLine + String.fromCharCode(10) + oldLine;
if (s.includes(oldLine)) {
  s = s.replace(oldLine, dup);
  fs.writeFileSync(f, s);
  console.log('strip 行已复制两遍（双 pass 剥嵌套）');
} else {
  console.log('strip 行未找到，检查字节');
}
