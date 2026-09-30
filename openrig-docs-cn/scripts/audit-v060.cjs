#!/usr/bin/env node
const fs = require('fs');

function getIds(file) {
  const s = new Set();
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.match(/id="[^"]+"/g) || []) {
    s.add(m.slice(4, -1));
  }
  return s;
}

const pfile = 'dist/reference/getting-started/index.html';
const pids = getIds(pfile);
console.log('getting-started 页有 逐席位权限模式:', pids.has('逐席位权限模式'));

const v = fs.readFileSync('dist/releases/v060/index.html', 'utf8');
for (const h of v.match(/href="[^"]*getting-started[^"]*"/g) || []) {
  const raw = h.slice(h.indexOf('#') + 1, -1);
  let dec = raw;
  try { dec = decodeURIComponent(raw); } catch (e) {}
  console.log('v0.6.0 锚点 raw:', JSON.stringify(raw), '解码:', JSON.stringify(dec), '命中 id:', pids.has(dec));
}

const rbfile = 'dist/reference/rig-bundle/index.html';
const rbids = getIds(rbfile);
console.log('rig-bundle 页有 cli-命令面:', rbids.has('cli-命令面'));

const v2 = fs.readFileSync('dist/releases/v062/index.html', 'utf8');
for (const h of v2.match(/href="[^"]*rig-bundle[^"]*"/g) || []) {
  const raw = h.slice(h.indexOf('#') + 1, -1);
  let dec = raw;
  try { dec = decodeURIComponent(raw); } catch (e) {}
  console.log('v0.6.2 锚点 raw:', JSON.stringify(raw), '解码:', JSON.stringify(dec), '命中 id:', rbids.has(dec));
}
