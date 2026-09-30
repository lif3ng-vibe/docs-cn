const fs = require('fs');
const f = 'scripts/check-dist.mjs';
const lines = fs.readFileSync(f, 'utf8').split('\n');
const addLine = "  html = html.replace(/ data-code=\"[^\"]*\"/g, ' data-code=\"\"');";
if (lines[28].includes('<style')) {
  lines.splice(29, 0, addLine);
  fs.writeFileSync(f, lines.join('\n'));
  console.log('已插到 30 行前');
} else {
  console.log('29 行不是 style 行:', JSON.stringify(lines[28]));
}
