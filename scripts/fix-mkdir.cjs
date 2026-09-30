const fs = require('fs');
const f = 'scripts/new-en-mirror.cjs';
const lines = fs.readFileSync(f, 'utf8').split('\n');
let done = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function writeContent(')) {
    lines.splice(i + 1, 0, '\tfs.mkdirSync(path.dirname(file), { recursive: true });');
    done++;
    break;
  }
}
fs.writeFileSync(f, lines.join('\n'));
console.log('mkdir 补丁: ' + done);
