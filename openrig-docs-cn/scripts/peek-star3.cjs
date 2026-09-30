const fs = require('fs');
const html = fs.readFileSync('dist/as-built/architecture/content-surfaces/index.html', 'utf8');
let html2 = html.replace(/<script[\s\S]*?<\/script>/g, ' ');
html2 = html2.replace(/<style[\s\S]*?<\/style>/g, ' ');
html2 = html2.replace(/<(code|pre)[^>]*>[\s\S]*?<\/\1>/g, ' ');
html2 = html2.replace(/<[^>]+>/g, ' ');
const at = html2.indexOf('**');
console.log('after-strip 首个 ** at:', at);
if (at !== -1) {
  console.log('prev 字节:', JSON.stringify(html2[at - 1]), '上下文:', JSON.stringify(html2.slice(at - 60, at + 60)));
}
