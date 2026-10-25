#!/usr/bin/env node
// 修复空属性被吞的损伤：`=" attr="` → `="" attr="`
// （上一轮 ""→" 清理把 alt="" 之类吞成 alt="，与下一个属性粘连）
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync('git diff --name-only', { encoding: 'utf8' })
  .trim().split(/\r?\n/)
  .filter((f) => f.endsWith('.astro'));

const RE = /=" ?([a-z-]+)=/g; // =" 后(可带空格)紧跟 下一个属性名=（值引号被吞）
let repaired = 0;
for (const f of files) {
  let t = fs.readFileSync(f, 'utf8');
  const before = t;
  t = t.replace(RE, '="" $1="');
  if (t !== before) { fs.writeFileSync(f, t); repaired++; }
}
console.log('repaired files:', repaired);
