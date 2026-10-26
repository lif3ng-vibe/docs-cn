// 给目标标题追加密式 {#旧锚点}，保住跨页深链（一处编辑 vs N 处改链）。
const fs = require('fs');

// [文件, 标题行包含的子串, 要保留的显式锚点]
const jobs = [
  ['docs/completion/prompt_compression.md', '服务端回调循环', 'server-side-callback-loop-v1messages'],
  ['docs/enterprise.md', '完整功能清单', 'full-feature-list'],
  ['docs/providers/gemini.md', '语音转写', 'audio-transcription-speech-to-text'],
  ['docs/providers/azure/azure.md', '批处理', 'azure-batches-api'],
  ['docs/rerank.md', '代理', 'litellm-proxy-usage'],
  ['docs/proxy/reliability.md', '工作原理', 'explanation'],
  ['docs/proxy/reliability.md', '上下文窗口回退', 'context-window-fallbacks'],
  ['docs/proxy/guardrails/quick_start.md', '仅观察', 'observe-only-one-direction-with-logging_only_scope'],
  ['docs/proxy/guardrails/custom_guardrail.md', '编写自定义防护栏类', '1-write-a-customguardrail-class'],
  ['docs/proxy/cost_tracking.md', '花费查询端点', 'spend-list-endpoints-spendkeys-and-spendusers'],
  ['docs/proxy/caching_controls.md', '删除缓存键', 'deleting-cache-keys---cachedelete'],
  ['docs/proxy/auto_routing.md', '会话亲和', 'session-affinity'],
  ['docs/proxy/auto_routing.md', '决策日志', 'decision-log'],
  ['docs/fine_tuning.md', '支持的 `hyperparameters`', 'supported-hyperparameters'],
];

for (const [file, needle, id] of jobs) {
  let t = fs.readFileSync(file, 'utf8');
  const lines = t.split('\n');
  let hit = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*>\s*#{1,6} |^#{1,6} /.test(lines[i]) && lines[i].includes(needle)) { hit = i; break; }
  }
  if (hit < 0) { console.error('NOT FOUND:', file, needle); continue; }
  if (lines[hit].includes('{#')) { console.log('skip (has id):', file, needle); continue; }
  lines[hit] = lines[hit].replace(/\s*$/, '') + ' {#' + id + '}';
  fs.writeFileSync(file, lines.join('\n'));
  console.log('ok', file, '::', lines[hit].slice(0, 60));
}
