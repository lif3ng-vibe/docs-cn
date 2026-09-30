const fs = require('fs');

function getIds(file) {
  const rawIdList = fs.readFileSync(file, 'utf8').match(/id="[^"]+"/g) || [];
  const set = new Set();
  for (const rawId of rawIdList) {
    set.add(rawId.slice(4, -1));
  }
  return set;
}

const target = 'dist/reference/rig-bundle/index.html';
const targetIds = getIds(target);
const hasCli = targetIds.has('cli-命令面');
console.log('v062 目标页有 cli-命令面:', hasCli);

const v2 = fs.readFileSync('dist/releases/v062/index.html', 'utf8');
const hrefList = v2.match(/href="[^"]*rig-bundle\.md[^"]*"/g) || [];
for (const rawHref of hrefList) {
  const inner = rawHref.slice(6, -1);
  const hash = inner.indexOf('#');
  const linkPath = inner.slice(0, hash);
  const rawFrag = inner.slice(hash + 1);
  let decoded = rawFrag;
  try {
    decoded = decodeURIComponent(rawFrag);
  } catch (err) {
    decoded = rawFrag;
  }
  const hit = targetIds.has(decoded);
  console.log('v0.6.2 锚点:', JSON.stringify(rawFrag), '解码:', JSON.stringify(decoded), '命中:', hit, '路径:', linkPath);
}
