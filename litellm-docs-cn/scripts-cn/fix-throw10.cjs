// 终检清零 v3：throw10 的 16 条残余逐条定点修复。
// 旧 EN 锚点 → (目标构建键, CN 锚点包含关键词)；查不到就打印候选供人工定。
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const cn = require(path.join(ROOT, 'anchors-cn.json'));

function cnAnchor(buildKey, kws) {
  const page = cn[buildKey];
  if (!page) return null;
  for (const [id, tagged] of Object.entries(page.anchors || {})) {
    for (const kw of kws) if (id.includes(kw) || tagged.includes(kw)) return id;
  }
  return null;
}

// [源页路径, 旧锚点, 目标构建键, 关键词候选]
const JOBS = [
  ['/docs/auth_overview', 'explanation', 'docs/a2a_agent_permissions/index', ['解释', '说明', '概述']],
  ['/docs/providers/anthropic', 'translated-openai-params', 'docs/completion/input/index', ['已转换的']],
  ['/docs/providers/azure_ai', 'translated-openai-params', 'docs/completion/input/index', ['已转换的']],
  ['/docs/providers/databricks', 'translated-openai-params', 'docs/completion/input/index', ['已转换的']],
  ['/docs/providers/lm_studio', 'translated-openai-params', 'docs/completion/input/index', ['已转换的']],
  ['/docs/providers/aws_sagemaker', 'litellm-specific-params', 'docs/completion/input/index', ['专属参数']],
  ['/docs/providers/bedrock', 'litellm-specific-params', 'docs/completion/input/index', ['专属参数']],
  ['/docs/providers/anthropic', 'usage-with-litellm-proxy', 'docs/providers/anthropic/index', ['代理用法', '配合代理']],
  ['/docs/providers/vllm', 'litellm-代理用法', 'docs/rerank/index', ['litellm-proxy-usage']],
  ['/docs/proxy/auto_routing', '决策日志', 'docs/proxy/auto_routing/index', ['decision-log']],
  ['/docs/proxy/caching', '删除缓存键cachedelete', 'docs/proxy/caching_controls/index', ['deleting-cache-keys']],
  ['/docs/proxy/guardrails/microsoft_agent_365', 'explanation', 'docs/proxy/guardrails/microsoft_agent_365/index', ['解释', '说明', '概述']],
  ['/docs/proxy/prometheus', 'per-worker-admission-control', 'docs/proxy/server_tuning/index', ['准入']],
  ['/docs/proxy/prometheus', 'requests-that-price-to-0', 'docs/proxy/cost_tracking/index', ['定价', '价格为', '零成本']],
  ['/docs/skills', 'explanation', 'docs/mcp_tool_search/index', ['解释', '说明', '概述']],
];
// 特殊：prometheus 自链 #authentication-on-metrics-endpoint（缺失小节另行回归，这里先指向部署配置）
const SELF_PROM = ['/docs/proxy/prometheus', 'authentication-on-metrics-endpoint', 'docs/proxy/prometheus/index', ['部署配置']];

function srcFileFor(pagePath) {
  const p = pagePath.replace(/^\//, '');
  const cands = p === '' ? ['docs/index.md'] : [p + '.md', p + '/index.md', 'src/pages/' + p.replace(/^docs\//, '') + '.md'];
  for (const c of cands) { const f = path.join(ROOT, c); if (fs.existsSync(f)) return f; }
  return null;
}

let ok = 0;
const failed = [];
for (const [page, oldA, buildKey, kws] of [...JOBS, SELF_PROM]) {
  const newId = cnAnchor(buildKey, kws);
  const f = srcFileFor(page);
  if (!newId || !f) { failed.push(`${page} ${oldA} -> ${buildKey} kws=${kws} newId=${newId}`); continue; }
  let t = fs.readFileSync(f, 'utf8');
  const variants = [oldA, encodeURIComponent(oldA), decodeURIComponent(oldA)];
  let hit = false;
  for (const v of variants) {
    const re = new RegExp('#' + v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])', 'g');
    if (re.test(t)) { t = t.replace(re, '#' + newId); hit = true; }
  }
  if (hit) { fs.writeFileSync(f, t); ok++; console.log('ok', page, '::', oldA, '->', newId); }
  else failed.push(`${page} ${oldA} (link not found in source)`);
}
console.log('fixed:', ok);
if (failed.length) { console.log('FAILED:'); failed.forEach((x) => console.log(' ', x)); }
