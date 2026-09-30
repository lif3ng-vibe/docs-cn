const fs = require('fs');
const path = require('path');
const DIST = path.join('scripts', '..', 'dist');

const idsByDir = new Map();
const files = [];
function walk2(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk2(p);
    } else if (e.name.endsWith('.html')) {
      files.push(p);
    }
  }
}
walk2(DIST);
for (const f of files) {
  const rel = path.relative(DIST, f).split(String.fromCharCode(92)).join('/');
  const dir = path.posix.dirname(rel);
  if (!idsByDir.has(dir)) idsByDir.set(dir, new Set());
  const page = fs.readFileSync(f, 'utf8');
  for (const m of page.match(/id="[^"]+"/g) || []) {
    idsByDir.get(dir).add(m.slice(4, -1));
  }
}
console.log('v062 dir ids:', JSON.stringify(idsByDir.get('reference/rig-bundle')), '→ has cli-命令面:', idsByDir.get('reference/rig-bundle').has('cli-命令面')));
console.log('v0516 dir ids:', JSON.stringify(idsByDir.get('reference/rig-spec')), '→ has 选择-claude-指令文件:', idsByDir.get('reference/rig-spec').has('选择-claude-指令文件')));
const v062 = fs.readFileSync('dist/releases/v062/index.html', 'utf8');
for (const m of v062.match(/href="[^"]*rig-bundle[^"]*"/g) || []) {
  const inner = m.slice(6, -1);
  const hashAt = inner.indexOf('#');
  let frag = inner.slice(hashAt + 1);
  try { frag = decodeURIComponent(frag); } catch (err) { frag = frag; }
  console.log('v062 锚点:', JSON.stringify(frag), '命中:', idsByDir.get('reference/rig-bundle').has(frag)));
}
