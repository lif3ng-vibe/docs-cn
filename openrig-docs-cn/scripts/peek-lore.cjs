const fs = require('fs');
const html = fs.readFileSync('dist/reference/lore-routing/index.html', 'utf8');
let t = html.replace(/<script[\s\S]*?<\/script>/g, ' ');
t = t.replace(/<style[\s\S]*?<\/style>/g, ' ');
t = t.replace(/<(code|pre)[^>]*>[\s\S]*?<\/\1>/g, ' ');
t = t.replace(/<[^>]+>/g, ' ');
let i = t.indexOf('**');
let shown = 0;
while (i !== -1 && shown < 2) {
  const prev = i > 0 ? t[i - 1] : '';
  console.log('at', i, 'prev:', JSON.stringify(prev), 'ctx:', JSON.stringify(t.slice(Math.max(0, i - 70), i + 70)));
  i = t.indexOf('**', i + 1);
  shown++;
}
if (shown === 0) {
  console.log('剥离后无星——星在属性或未剥离结构里');
  const j = html.indexOf('**');
  console.log('原文首个星 at', j, ':', JSON.stringify(html.slice(j - 100, j + 60)));
}
