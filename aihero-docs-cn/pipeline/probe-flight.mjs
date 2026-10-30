#!/usr/bin/env node
// probe-flight.mjs — 探查指定页 flight 中是否真包含某字符串（以及出现形态）
import fs from 'node:fs';
const args = process.argv.slice(2);
const useBaseline = args.includes('--baseline');
const page = args.find(a => !a.startsWith('--')) || 'publish-your-mcp-server-to-npm';
const needles = args.filter(a => !a.startsWith('--')).slice(1);
const base = useBaseline ? 'data/site-en-baseline' : 'site';
const html = fs.readFileSync(`${base}/${page}/index.html`, 'utf8');
const RX = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
const segs = [];
let m;
while ((m = RX.exec(html))) {
  try { segs.push(JSON.parse('"' + m[1] + '"')); } catch { segs.push(null); }
}
console.log(`segments: ${segs.length}, total ${segs.reduce((s, x) => s + (x?.length || 0), 0)} chars`);
for (const n of needles) {
  const hits = [];
  segs.forEach((s, i) => { if (s && s.includes(n)) hits.push(i); });
  console.log(`"${n}": ${hits.length ? 'flight seg ' + hits.slice(0, 5).join(',') : 'NOT in flight'}`);
  if (!hits.length) {
    // 在整页 raw html 找（含非 flight 区域）
    console.log(`   raw html contains: ${html.includes(n)}`);
    // 形态探测：找 X on / Share 等近似
    if (n === 'Share on X') {
      const i = segs.join('\u0000').indexOf('Share');
      console.log('   "Share" 近似位置:', i >= 0 ? JSON.stringify(segs.join('\u0000').slice(i - 40, i + 60)) : '无');
    }
  }
}
