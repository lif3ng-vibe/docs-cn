const fs = require('fs');

const f = 'scripts/check-dist.mjs';
let s = fs.readFileSync(f, 'utf8');
const lines = s.split('\n');
lines.forEach(function (line, i) {
  if (line.includes('const target')) {
    console.log('L' + (i + 1) + ':', JSON.stringify(line));
  }
});
const old = 'path.posix.join(path.posix.dirname(rel), p)';
const nw = 'path.posix.normalize(path.posix.join(path.posix.dirname(rel), p))';
if (s.includes(old)) {
  s = s.split(old).join(nw);
  fs.writeFileSync(f, s);
  console.log('normalize 已补入 target');
} else {
  console.log('target 已带 normalize（先前生效）');
}
fs.writeFileSync(f, s);
