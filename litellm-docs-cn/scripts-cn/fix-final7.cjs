// 终检清零 v4：最后 7 条旧锚点 → 真实 CN/显式锚点。
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// [源页路径, 旧锚点, 新锚点]
const JOBS = [
  ['/docs/providers/anthropic', 'usage-with-litellm-proxy', '通过-litellm-代理使用'],
  ['/docs/providers/vllm', 'litellm-代理用法', 'litellm-proxy-usage'],
  ['/docs/proxy/auto_routing', '决策日志', 'decision-log'],
  ['/docs/proxy/caching', '删除缓存键cachedelete', 'deleting-cache-keys---cachedelete'],
  ['/docs/proxy/guardrails/microsoft_agent_365', 'explanation', '工作原理'],
  ['/docs/proxy/cost_tracking', 'requests-that-price-to-0', '计价为-0-的请求'],
  ['/docs/skills', 'explanation', '工作原理'],
];

function srcFileFor(pagePath) {
  const p = pagePath.replace(/^\//, '');
  const cands = [p + '.md', p + '/index.md'];
  for (const c of cands) { const f = path.join(ROOT, c); if (fs.existsSync(f)) return f; }
  return null;
}

let ok = 0;
for (const [page, oldA, newA] of JOBS) {
  const f = srcFileFor(page);
  if (!f) { console.error('no file for', page); continue; }
  let t = fs.readFileSync(f, 'utf8');
  const variants = [oldA, encodeURIComponent(oldA), decodeURIComponent(oldA)];
  let hit = false;
  for (const v of variants) {
    const re = new RegExp('#' + v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])', 'g');
    if (re.test(t)) { t = t.replace(re, '#' + newA); hit = true; }
  }
  if (hit) { fs.writeFileSync(f, t); ok++; console.log('ok', page, '::', oldA, '->', newA); }
  else console.error('link not found:', page, oldA);
}
console.log('fixed:', ok);
