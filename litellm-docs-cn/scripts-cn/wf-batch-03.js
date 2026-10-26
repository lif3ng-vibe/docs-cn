export const meta = {
  name: 'translate-litellm-cn',
  description: 'Translate LiteLLM docs batch to Chinese: one file per agent; oversized files split into parts then merged',
  phases: [
    {title: 'Translate', detail: 'one file per agent'},
    {title: 'Merge', detail: 'concatenate oversized-file parts'},
  ],
}

const ROOT = 'C:/Users/lif3n/src/docs/litellm-docs-cn'
const files = [{"path":"docs/a2a_agent_card.md","lines":235},{"path":"docs/adding_provider/adding_guardrail_support.md","lines":450},{"path":"docs/adding_provider/generic_guardrail_api.md","lines":475},{"path":"docs/adding_provider/new_rerank_provider.md","lines":153},{"path":"docs/apply_guardrail.md","lines":182},{"path":"docs/auto_router/benchmarks.md","lines":165},{"path":"docs/auto_router/decision_classifiers.md","lines":248},{"path":"docs/caching/local_caching.md","lines":92},{"path":"docs/completion/audio.md","lines":319},{"path":"docs/completion/json_mode.md","lines":430},{"path":"docs/completion/multiple_deployments.md","lines":53},{"path":"docs/completion/shared_session.md","lines":214},{"path":"docs/completion/vision.md","lines":326},{"path":"docs/container_files.md","lines":388},{"path":"docs/contributing.md","lines":121},{"path":"docs/debugging/hosted_debugging.md","lines":1},{"path":"docs/enterprise/compliance.md","lines":41},{"path":"docs/evals_api.md","lines":442},{"path":"docs/extras/creating_adapters.md","lines":207},{"path":"docs/files_endpoints.md","lines":336},{"path":"docs/fine_tuning.md","lines":261},{"path":"docs/guides/code_interpreter.md","lines":175},{"path":"docs/guides/finetuned_models.md","lines":75},{"path":"docs/learn/sdk_quickstart.md","lines":175},{"path":"docs/mcp_openapi.md","lines":250},{"path":"docs/mcp_server_submissions.md","lines":221},{"path":"docs/mcp_servers/linear.md","lines":192},{"path":"docs/moderation.md","lines":147},{"path":"docs/providers/azure_document_intelligence.md","lines":409},{"path":"docs/providers/azure/azure_embedding.md","lines":94},{"path":"docs/providers/bedrock_realtime_with_audio.md","lines":363},{"path":"docs/providers/cometapi.md","lines":149},{"path":"docs/providers/compactifai.md","lines":223},{"path":"docs/providers/custom_llm_server.md","lines":633},{"path":"docs/providers/featherless_ai.md","lines":57},{"path":"docs/providers/gemini.md","lines":2704},{"path":"docs/providers/infinity.md","lines":301},{"path":"docs/providers/nvidia_nim_rerank.md","lines":357},{"path":"docs/providers/ollama.md","lines":493},{"path":"docs/providers/openai/responses_api.md","lines":1198},{"path":"docs/providers/s3_vectors.md","lines":199},{"path":"docs/providers/sap.md","lines":815},{"path":"docs/providers/sarvam.md","lines":93},{"path":"docs/providers/scaleway.md","lines":104},{"path":"docs/providers/synthetic.md","lines":120},{"path":"docs/providers/valkey_vector_stores.md","lines":240},{"path":"docs/providers/vertex_partner.md","lines":952},{"path":"docs/providers/vertex_realtime.md","lines":349},{"path":"docs/providers/vllm.md","lines":727},{"path":"docs/providers/xai.md","lines":284},{"path":"docs/providers/zai.md","lines":138},{"path":"docs/proxy/billing_metrics.md","lines":141},{"path":"docs/proxy/budget_fallbacks.md","lines":107},{"path":"docs/proxy/caching.md","lines":233},{"path":"docs/proxy/call_hooks.md","lines":529},{"path":"docs/proxy/clientside_auth.md","lines":291},{"path":"docs/proxy/credential_routing.md","lines":275},{"path":"docs/proxy/credential_usage_tracking.md","lines":20},{"path":"docs/proxy/dynamic_logging.md","lines":269},{"path":"docs/proxy/endpoint_activity.md","lines":163},{"path":"docs/proxy/guardrails/crowdstrike_aidr.md","lines":257},{"path":"docs/proxy/guardrails/enkryptai.md","lines":204},{"path":"docs/proxy/guardrails/javelin.md","lines":367},{"path":"docs/proxy/guardrails/policy_templates.md","lines":297},{"path":"docs/proxy/guardrails/secret_detection.md","lines":557},{"path":"docs/proxy/guardrails/sensitive_data_routing.md","lines":127},{"path":"docs/proxy/guardrails/typesafe.md","lines":127},{"path":"docs/proxy/lens/deployment/docker.md","lines":32},{"path":"docs/proxy/lens/deployment/kubernetes.md","lines":154},{"path":"docs/proxy/lens/first-trace.md","lines":195},{"path":"docs/proxy/lens/imported/integrations/langgraph.md","lines":82},{"path":"docs/proxy/lens/imported/integrations/pydantic-ai.md","lines":103},{"path":"docs/proxy/lens/integrations/hermes.md","lines":27},{"path":"docs/proxy/managed_finetuning.md","lines":190},{"path":"docs/proxy/multi_tenant_architecture.md","lines":72},{"path":"docs/proxy/public_teams.md","lines":41},{"path":"docs/proxy/rate_limit_tiers.md","lines":63},{"path":"docs/proxy/request_headers.md","lines":80},{"path":"docs/proxy/request_tags.md","lines":183},{"path":"docs/proxy/roi_calculator.md","lines":137},{"path":"docs/proxy/ui_logs_sessions.md","lines":310},{"path":"docs/rules.md","lines":89},{"path":"docs/sandbox.md","lines":421},{"path":"docs/secret_managers/google_kms.md","lines":36},{"path":"docs/shared_responsibility.md","lines":59},{"path":"docs/traffic_mirroring.md","lines":84},{"path":"docs/troubleshoot/ui_issues.md","lines":50},{"path":"docs/vertex_batch_passthrough.md","lines":159},{"path":"docs/videos.md","lines":685}]

function rules() {
  return [
    '你是 LiteLLM 文档汉化子代理，只负责分配给你的这一个文件，一次回复只做这一个文件。',
    '先 Read ' + ROOT + '/GLOSSARY.md 并严格遵守（术语表、不译/要译红线、全角标点、中英文间半角空格、CJK 粗体闭合）。',
    '译风：意译、无翻译腔；产品名/工具名不译；术语首次出现可附英文原词。',
    '硬性红线：',
    '- 不动：代码块与行内代码、{{role}} 占位符（逐字保留）、import 语句、JSX 标签与组件名、::: 提示块标记本身、链接与图片的路径/URL、frontmatter 的 id/slug/数字/布尔字段、标题的显式 {#锚点} 后缀。',
    '- 要译：frontmatter 的 title/description/sidebar_label（id 不动）、正文散文、表格表头与说明列（Method/命令/取值/默认值列不译）、提示块内容与 [自定义标题]、链接与图片的文字部分、组件 props 中用户可见字符串（label/title/desc 等）。',
    '- 页内锚点链接 (#xxx)：按你译出的新标题重算新锚点（github-slugger 规则：小写、空格转 -、去标点、保留 CJK）并替换。',
    '- 跨页链接（xxx.md#anchor 或 /docs/xxx#anchor）：只译链接文字，路径与 #anchor 原样保留，不要改。',
    '- CJK 粗体闭合（必查）：句读与括注移出粗体——「**……。**后文」✗ 改「**……**。后文」✓；「**词（注）**后文」✗ 改「**词**（注）后文」✓。',
    '- 最终汇报极简：一行，done <相对路径> (headings:N)；失败写 ERROR <原因>。',
  ].join('\n')
}

function singlePrompt(f) {
  return rules() + '\n\n文件：' + ROOT + '/' + f.path + '（共 ' + f.lines + ' 行）\n' +
    '步骤：\n' +
    '1. Read 原文件。\n' +
    '2. 全文翻译（遵守上方红线），用 Write 写回同一路径 ' + ROOT + '/' + f.path + '。\n' +
    '3. 生成锚点映射：对正文中每个 markdown 标题（# 到 ####）输出一行「原英文标题 | 中文标题 | 新锚点」（新锚点=新标题按 github-slugger 规则的 slug，不含 #），用 Write 存到 ' + ROOT + '/.anchor-maps/' + f.path + '.map.md（目录不存在先创建）。frontmatter 里的 title 不算标题锚点。\n' +
    '4. 汇报一行：done ' + f.path + ' (headings:N)'
}

function partPrompt(f, k, parts, from, to) {
  const safeRel = f.path.replace(/\//g, '__')
  return rules() + '\n\n文件：' + ROOT + '/' + f.path + '（共 ' + f.lines + ' 行）——超长文件分 ' + parts + ' 段接力翻译，你负责第 ' + k + '/' + parts + ' 段：约第 ' + from + '..' + to + ' 行。\n' +
    '步骤：\n' +
    '1. Read 原文件（完整读入）。\n' +
    '2. 确定你的行区间：从第 ' + from + ' 行开始、到第 ' + to + ' 行后的最近一个 markdown 标题边界为止（最后一段则到文件尾）。区间外的内容一个字都不许放进你的产出。\n' +
    '3. 翻译区间内容（遵守红线），Write 到 ' + ROOT + '/.parts/' + safeRel + '/' + k + '.md —— 文件里只有你这一段。\n' +
    '4. 区间内每个 markdown 标题输出一行「原英文标题 | 中文标题 | 新锚点」，Write 到 ' + ROOT + '/.parts/' + safeRel + '/' + k + '.map.md。若区间内没有标题，写一行「（本段无标题）」。\n' +
    '5. 汇报一行：done ' + f.path + '#' + k + ' (' + from + '-' + to + ')'
}

function mergePrompt(f, parts) {
  const safeRel = f.path.replace(/\//g, '__')
  return '你是拼接子代理，任务纯机械，不翻译任何内容。\n' +
    '目录 ' + ROOT + '/.parts/' + safeRel + '/ 下有 1.md..' + parts + '.md（同一文件的译文分段）与 1.map.md..' + parts + '.map.md（对应锚点映射）。\n' +
    '步骤：\n' +
    '1. 逐个 Read 分段（1 到 ' + parts + '），按序拼接（段与段之间直接相接；仅当 markdown 块边界需要时保留一个空行）。\n' +
    '2. 用 Write 把拼接结果写到 ' + ROOT + '/' + f.path + '。\n' +
    '3. 逐个 Read 各 .map.md，按序拼接（过滤「（本段无标题）」行），Write 到 ' + ROOT + '/.anchor-maps/' + f.path + '.map.md。\n' +
    '4. 校验：序号无断档、每段非空。异常报 ERROR。\n' +
    '5. 汇报一行：merged ' + f.path + ' (parts:' + parts + ')'
}

async function translateOne(f) {
  if (f.lines > 900) {
    const parts = Math.ceil(f.lines / 900)
    const per = Math.ceil(f.lines / parts)
    let dead = 0
    for (let k = 1; k <= parts; k++) {
      const from = (k - 1) * per + 1
      const to = Math.min(k * per, f.lines)
      const r = await agent(partPrompt(f, k, parts, from, to), {label: f.path + ' #' + k + '/' + parts, phase: 'Translate'})
      if (r === null) dead += 1
    }
    if (dead) return {path: f.path, error: dead + ' part(s) skipped'}
    const merged = await agent(mergePrompt(f, parts), {label: 'merge ' + f.path, phase: 'Merge'})
    return {path: f.path, ok: merged !== null}
  }
  const r = await agent(singlePrompt(f), {label: f.path, phase: 'Translate'})
  return {path: f.path, ok: r !== null}
}

phase('Translate')
// 并发自限：按 CONCURRENCY 个一组分块推进（而非全量 parallel）。
// 用户要求总并发 ≤5：批与批串行（一次只跑一条流水线），此处即全局并发上限。
const CONCURRENCY = 5
const results = []
for (let i = 0; i < files.length; i += CONCURRENCY) {
  const chunk = files.slice(i, i + CONCURRENCY)
  const r = await parallel(chunk.map((f) => () => translateOne(f)))
  results.push(...r)
  log('进度 ' + Math.min(i + CONCURRENCY, files.length) + '/' + files.length)
}
const failed = results.filter((r) => r && r.error)
const skipped = results.filter((r) => r === null).length
log('完成 ' + (results.length - failed.length) + '/' + files.length + '，分段失败 ' + failed.length + '，跳过 ' + skipped)
return {total: files.length, failed, skipped}
