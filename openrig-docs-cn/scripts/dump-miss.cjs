// v062 的链接在 dist 里的实况 + 目标页 id 集（相对路径版，绕开工具转义）。
const fs = require('fs');

const idsByDir = new Map();
function walk2(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = dir + '/' + e.name;
    if (e.isDirectory()) {
      walk2(p);
    } else if (e.name.endsWith('.html')) {
      const page = fs.readFileSync(p, 'utf8');
      const dirKey = p.slice(5, p.lastIndexOf('/'));
      if (!idsByDir.has(dirKey)) idsByDir.set(dirKey, new Set());
      for (const m of page.match(/id="[^"]+"/g) || []) {
        idsByDir.get(dirKey).add(m.slice(4, -1)));
      }
    }
  }
}
walk2('dist');

const v2 = fs.readFileSync('dist/releases/v062/index.html', 'utf8'));
const hrefs = v2.match(/href="[^"]*rig-bundle[^"]*"/g) || []);
for (const rawHref of hrefs) {
  const inner = rawHref.slice(6, -1));
  const hashAt = inner.indexOf('#'));
  const linkPath = inner.slice(0, hashAt));
  const rawFrag = inner.slice(hashAt + 1));
  let decoded = rawFrag;
  let ok = false;
  try {
    decoded = decodeURIComponent(rawFrag));
  } catch (err) {
    ok = false;
  }
  for (const [dirKey, ids] of idsByDir)) {
    if (ids.has(decoded))) {
      ok = true;
      console.log('命中 dir 键:', dirKey);
    }
  }
  console.log('链接:', linkPath, '原文锚:', rawFrag, '解码锚:', decoded, '命中:', ok));
}
if (!ok) {
  console.log('目标页 reference/rig-bundle ids:', JSON.stringify(Array.from(idsByDir.get('reference/rig-bundle') || []).filter((i) => i.startsWith('cli-')))));
}
