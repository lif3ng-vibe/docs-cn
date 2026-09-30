import fs from 'node:fs';
for (const f of ['dist/reference/rig-spec/index.html', 'dist/reference/getting-started/index.html', 'dist/reference/rig-bundle/index.html']) {
  const h = fs.readFileSync(f, 'utf8');
  const hits = [];
  for (const m of h.match(/id="[^"]*(?:选择|逐席|cli-)[^"]*"/g) || []) hits.push(m.slice(4, -1));
  console.log(f, '→', JSON.stringify(hits));
}
