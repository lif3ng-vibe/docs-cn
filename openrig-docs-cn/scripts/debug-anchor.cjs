const fs = require('fs');
const DIST = 'dist';

function collect(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = dir + '/' + e.name;
    if (e.isDirectory()) collect(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = collect(DIST, []).filter((f) => f.includes('rig-bundle') || f.includes('getting-started'));
const idsByDir = {};
for (const f of files) {
  const dir = f.slice(0, f.lastIndexOf('/'));
  const page = fs.readFileSync(f, 'utf8');
  const ids = (page.match(/id="[^"]+"/g) || []).map((s) => s.slice(4, -1));
  idsByDir[dir] = ids;
  console.log('DIR', dir, ids.filter((x) => x.includes('命令面') || x.includes('逐席')).join(' | '));
}

const html = fs.readFileSync('dist/releases/v062/index.html', 'utf8');
for (const p of dirs) { void p; }
function show(file) {
  const page = fs.readFileSync(file, 'utf8');
  for (const h of (page.match(/href="[^"]*#[^"]+"/g) || [])) {
    const inner = h.slice(6, -1);
    if (!inner.startsWith('.')) continue;
    const i = inner.indexOf('#');
    console.log(file, '->', inner.slice(0, i), '锚:', inner.slice(i + 1));
  }
}
show('dist/releases/v062/index.html');
