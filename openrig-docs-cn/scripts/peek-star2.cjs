const fs = require('fs');
const html = fs.readFileSync('dist/as-built/architecture/content-surfaces/index.html', 'utf8');
let i = html.indexOf('**');
let n = 0;
while (i !== -1 && n < 3) {
  console.log('at', i, ':', JSON.stringify(html.slice(i - 80, i + 60)));
  i = html.indexOf('**', i + 1);
  n++;
}
