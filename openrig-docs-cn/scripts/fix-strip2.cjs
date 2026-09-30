const fs = require('fs');
const f = 'scripts/check-dist.mjs';
let s = fs.readFileSync(f, 'utf8');
const BS = String.fromCharCode(92);
const q = String.fromCharCode(39);
const oldLine = '  html = html.replace(/<(?:code|pre)[^>]*>[' + BS + 's' + BS + 'S]*?<' + BS + '/(?:code|pre)>/g, ' + q + ' ' + q + ');';
const newLine = '  html = html.replace(/<(code|pre)[^>]*>[' + BS + 's' + BS + 'S]*?<' + BS + '/$1>/g, ' + q + ' ' + q + ');';
const count = s.split(oldLine).length - 1;
if (count > 0) {
  s = s.split(oldLine).join(newLine);
  fs.writeFileSync(f, s);
  console.log('反向引用版替换: ' + count + ' 行');
} else {
  console.log('旧行未找到');
}
