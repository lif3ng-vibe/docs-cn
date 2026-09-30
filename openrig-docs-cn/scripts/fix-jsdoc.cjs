const fs = require('fs');
const f = 'scripts/check-dist.mjs';
let s = fs.readFileSync(f, 'utf8');
const NL = String.fromCharCode(10);
const oldLine = "  if (html.includes('**')) star.push(f);";
const newBlock = [
  '  let at = html.indexOf("**");',
  '  while (at !== -1) {',
  '    const prev = html[at - 1];',
  '    if (prev !== "/") {',
  '      star.push(f);',
  '      break;',
  '    }',
  '    at = html.indexOf("**", at + 1);',
  '  }'
].join(NL);
if (s.includes(oldLine)) {
  s = s.split(oldLine).join(newBlock);
  fs.writeFileSync(f, s);
  console.log('JSDoc 白名单已加');
} else {
  console.log('旧行未找到');
}
