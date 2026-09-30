const fs = require('fs');
const f = 'scripts/check-dist.mjs';
let s = fs.readFileSync(f, 'utf8');
const NL = String.fromCharCode(10);
const BS = String.fromCharCode(92);
const q = String.fromCharCode(34);
const styleLine = '  html = html.replace(/<style[' + BS + 's' + BS + 'S]*?<' + BS + '/style>/g, ' + q + ' ' + q + ');';
const addLine = '  html = html.replace(/ data-code="[^"]*"/g, ' + q + ' data-code=' + q + q + ');';
if (s.includes(styleLine) && !s.includes('data-code=' + q + q)) {
  s = s.split(styleLine).join(styleLine + NL + addLine);
  fs.writeFileSync(f, s);
  console.log('data-code 属性剥离已加');
} else {
  console.log('未找到 style 行或已存在');
}
