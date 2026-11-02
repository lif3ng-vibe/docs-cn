#!/usr/bin/env node
// 二分实验配置器：组合 docs.json 的 tabs / openapi 变体
// 用法: node ollama-bisect-config.mjs <工作目录> <源docs.json目录> <模式>
// 模式: full(完整复现) | noendpoints(去Endpoints组留openapi字段) | nospec(留Endpoints去openapi字段)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [wd, srcDir, mode] = process.argv.slice(2);
const d = JSON.parse(readFileSync(join(wd, 'docs.json'), 'utf8'));
const src = JSON.parse(readFileSync(join(srcDir, 'docs.json'), 'utf8'));
// 重建：Guide + Integrations + API 实验体
d.navigation.tabs = [src.navigation.tabs[0], src.navigation.tabs[1]];
const api = JSON.parse(JSON.stringify(src.navigation.tabs[2]));
if (mode === 'noendpoints') {
  delete api.openapi;
  api.groups = api.groups.filter((g) => g.group !== 'Endpoints');
} else {
  // full / nospec 都带 Endpoints；nospec 只删 openapi 字段
  if (mode === 'nospec') delete api.openapi;
}
d.navigation.tabs.push(api);
writeFileSync(join(wd, 'docs.json'), JSON.stringify(d, null, 2));
console.log(`mode=${mode} tabs=${d.navigation.tabs.map((t) => t.tab || t['tab']).join(',')} openapi=${api.openapi ?? 'none'}`);
