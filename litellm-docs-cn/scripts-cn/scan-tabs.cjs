// 属性感知的 Tabs/TabItem 配对扫描：报告孤儿闭合标签所在行。
const fs = require('fs');
const file = process.argv[2];
const lines = fs.readFileSync(file, 'utf8').split('\n');
let dt = 0, di = 0;
const negs = [];
lines.forEach((l, i) => {
  const opensT = (l.match(/<Tabs[ >]/g) || []).length;
  const closesT = (l.match(/<\/Tabs>/g) || []).length;
  const opensI = (l.match(/<TabItem[ >]/g) || []).length;
  const closesI = (l.match(/<\/TabItem>/g) || []).length;
  dt += opensT - closesT;
  di += opensI - closesI;
  if (dt < 0 || di < 0) { negs.push(`line ${i + 1}: depth T=${dt} I=${di} :: ${l.trim().slice(0, 60)}`); dt = Math.max(dt, 0); di = Math.max(di, 0); }
});
if (dt || di) console.log(`END imbalance: Tabs dt=${dt} TabItem di=${di}`);
console.log(negs.length ? negs.join('\n') : 'no negative-depth closes');
