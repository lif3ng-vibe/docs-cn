export const meta = {
  name: 'translate-litellm-cn',
  description: 'Translate LiteLLM docs batch to Chinese: one file per agent; oversized files split into parts then merged',
  phases: [
    {title: 'Translate', detail: 'one file per agent'},
    {title: 'Merge', detail: 'concatenate oversized-file parts'},
  ],
}

const ROOT = 'C:/Users/lif3n/src/docs/litellm-docs-cn'
const files = [{"path":"docs/a2a_cost_tracking.md","lines":148},{"path":"docs/a2a_iteration_budgets.md","lines":189},{"path":"docs/aiohttp_benchmarks.md","lines":39},{"path":"docs/anthropic_unified/messages_to_responses_mapping.md","lines":124},{"path":"docs/api_stability_policy.md","lines":31},{"path":"docs/assistants.md","lines":353},{"path":"docs/audio_transcription.md","lines":178},{"path":"docs/auto_router/user_setup.md","lines":82},{"path":"docs/benchmarks.md","lines":100},{"path":"docs/caching/caching_api.md","lines":81},{"path":"docs/completion/http_handler_config.md","lines":154},{"path":"docs/completion/knowledgebase.md","lines":696},{"path":"docs/completion/predict_outputs.md","lines":110},{"path":"docs/embedding/supported_embedding.md","lines":831},{"path":"docs/enterprise.md","lines":176},{"path":"docs/extras/code_quality.md","lines":14},{"path":"docs/integrations/index.md","lines":347},{"path":"docs/integrations/observability_index.md","lines":37},{"path":"docs/learn/index.md","lines":148},{"path":"docs/load_test_advanced.md","lines":225},{"path":"docs/mcp_authentication.md","lines":237},{"path":"docs/mcp_oauth_passthrough.md","lines":456},{"path":"docs/mcp_obo_auth.md","lines":265},{"path":"docs/mcp_rest_api.md","lines":280},{"path":"docs/mcp_servers/atlassian.md","lines":159},{"path":"docs/providers/anthropic_preserved_thinking.md","lines":65},{"path":"docs/providers/azure_ai_agents.md","lines":485},{"path":"docs/providers/azure/azure_speech.md","lines":75},{"path":"docs/providers/bedrock_batches.md","lines":365},{"path":"docs/providers/cloudflare_workers.md","lines":59},{"path":"docs/providers/codestral.md","lines":255},{"path":"docs/providers/crusoe.md","lines":197},{"path":"docs/providers/deepgram.md","lines":88},{"path":"docs/providers/fireworks_ai.md","lines":747},{"path":"docs/providers/gemini/videos.md","lines":437},{"path":"docs/providers/google_ai_studio/image_gen.md","lines":294},{"path":"docs/providers/google_ai_studio/realtime.md","lines":236},{"path":"docs/providers/litellm_proxy.md","lines":286},{"path":"docs/providers/llamagate.md","lines":206},{"path":"docs/providers/minimax.md","lines":640},{"path":"docs/providers/openai.md","lines":1347},{"path":"docs/providers/poe.md","lines":140},{"path":"docs/providers/predibase.md","lines":248},{"path":"docs/providers/sambanova.md","lines":322},{"path":"docs/providers/tencent.md","lines":205},{"path":"docs/providers/triton-inference-server.md","lines":272},{"path":"docs/providers/vertex_speech.md","lines":429},{"path":"docs/providers/wandb_inference.md","lines":198},{"path":"docs/providers/watsonx/audio_transcription.md","lines":58},{"path":"docs/providers/xai_batches.md","lines":130},{"path":"docs/providers/xinference.md","lines":165},{"path":"docs/proxy_auth.md","lines":334},{"path":"docs/proxy/agentic_loop_hook.md","lines":106},{"path":"docs/proxy/arize_phoenix_prompts.md","lines":135},{"path":"docs/proxy/caching_controls.md","lines":448},{"path":"docs/proxy/caching_redis.md","lines":379},{"path":"docs/proxy/cli_sso.md","lines":414},{"path":"docs/proxy/cli.md","lines":539},{"path":"docs/proxy/client_setup/claude_code.md","lines":84},{"path":"docs/proxy/client_setup/claude_desktop.md","lines":96},{"path":"docs/proxy/docker_quick_start.md","lines":214},{"path":"docs/proxy/guardrails/aim_security.md","lines":162},{"path":"docs/proxy/guardrails/guardrails_ai.md","lines":116},{"path":"docs/proxy/guardrails/hiddenlayer.md","lines":191},{"path":"docs/proxy/guardrails/microsoft_purview.md","lines":187},{"path":"docs/proxy/guardrails/prompt_security.md","lines":604},{"path":"docs/proxy/guardrails/tool_permission.md","lines":250},{"path":"docs/proxy/guardrails/xecguard.md","lines":315},{"path":"docs/proxy/key_auth_arch.md","lines":49},{"path":"docs/proxy/lens/api.md","lines":93},{"path":"docs/proxy/lens/deployment.md","lines":43},{"path":"docs/proxy/lens/deployment/development.md","lines":53},{"path":"docs/proxy/lens/deployment/server.md","lines":69},{"path":"docs/proxy/model_access_groups.md","lines":501},{"path":"docs/proxy/perf.md","lines":13},{"path":"docs/proxy/prometheus.md","lines":1006},{"path":"docs/proxy/provider_margins.md","lines":220},{"path":"docs/proxy/rust_gateway.md","lines":92},{"path":"docs/proxy/shared_health_check.md","lines":307},{"path":"docs/proxy/tag_budgets.md","lines":359},{"path":"docs/proxy/timeout.md","lines":299},{"path":"docs/proxy/ui_logs.md","lines":154},{"path":"docs/proxy/ui.md","lines":140},{"path":"docs/proxy/ui/bulk_edit_users.md","lines":30},{"path":"docs/proxy/ui/page_visibility.md","lines":122},{"path":"docs/realtime.md","lines":259},{"path":"docs/response_api.md","lines":2005},{"path":"docs/secret_managers/hashicorp_vault.md","lines":234},{"path":"docs/skills_gateway.md","lines":175},{"path":"docs/vector_stores/create.md","lines":394}]

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
