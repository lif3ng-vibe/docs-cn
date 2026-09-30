const fs = require('fs');
const f = 'scripts/check-dist.mjs';
const lines = fs.readFileSync(f, 'utf8').split('\n');
const BS = String.fromCharCode(92);
const oldFrag = '<' + BS + '/$1>';
const newFrag = '<' + BS + '/$' + '1'.replace('1', '1') + '>';
const targetFrag = '<' + BS + '/removeme>';
let n = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(oldFrag)) {
    lines[i] = lines[i].split(oldFrag).join('<' + BS + '/' + BS + '1>');
    n++;
  }
}
fs.writeFileSync(f, lines.join('\n'));
console.log('backref 修正: ' + n + ' 行');
