// 从构建产物 build/ 提取每个文档页的标题锚点清单 → anchors-en.json
// 用途：翻译后锚点回修的「旧 id 权威底稿」（配合 .anchor-maps/*.map.md）。
const fs = require('fs');
const path = require('path');

const BUILD = path.join(__dirname, '..', 'build');
const OUT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'anchors-en.json');

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
}

const files = [];
walk(BUILD, files);
const manifest = {};
for (const file of files) {
  const rel = path.relative(BUILD, file).replace(/\\/g, '/');
  if (rel.startsWith('blog') || rel.startsWith('release_notes')) continue;
  const html = fs.readFileSync(file, 'utf8');
  // 页面路由键：docs/proxy/index.html → docs/proxy/index；根 index.html → index
  let key = rel.replace(/\.html$/, '').replace(/\/index$/, '/index');
  key = key.replace(/\/index$/, '/index') === key ? key : key;
  if (key === 'index') key = 'index';
  const anchors = {};
  const re = /<h([1-4])[^>]*?\bid=("([^">]+)"|([^\s">]+))[^>]*>([\s\S]*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(html))) {
    const id = m[3] || m[4];
    const text = m[5]
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, ' ')
      .trim();
    anchors[id] = `h${m[1]} ${text}`.trim();
  }
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  manifest[key] = {title: titleMatch ? titleMatch[1] : '', anchors};
}
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 1));
console.log(`pages: ${Object.keys(manifest).length}, anchors total: ${Object.values(manifest).reduce((n, p) => n + Object.keys(p.anchors).length, 0)}`);
