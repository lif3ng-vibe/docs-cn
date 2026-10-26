export const meta = {
  name: 'translate-litellm-cn',
  description: 'Translate LiteLLM docs batch to Chinese: one file per agent; oversized files split into parts then merged',
  phases: [
    {title: 'Translate', detail: 'one file per agent'},
    {title: 'Merge', detail: 'concatenate oversized-file parts'},
  ],
}

const ROOT = 'C:/Users/lif3n/src/docs/litellm-docs-cn'
const files = [{"path":"docs/anthropic_unified/structured_output.md","lines":295},{"path":"docs/auto_router/evaluate.md","lines":76},{"path":"docs/auto_router/index.md","lines":148},{"path":"docs/auto_router/recommended_configurations.md","lines":355},{"path":"docs/completion/anthropic_advisor_tool.md","lines":490},{"path":"docs/completion/batching.md","lines":281},{"path":"docs/completion/computer_use.md","lines":448},{"path":"docs/completion/document_understanding.md","lines":417},{"path":"docs/completion/drop_params.md","lines":240},{"path":"docs/completion/function_call.md","lines":554},{"path":"docs/completion/usage.md","lines":99},{"path":"docs/contribute_integration/custom_webhook_api.md","lines":114},{"path":"docs/decisions.md","lines":392},{"path":"docs/image_edits.md","lines":649},{"path":"docs/image_variations.md","lines":32},{"path":"docs/interactions.md","lines":268},{"path":"docs/load_test_rpm.md","lines":349},{"path":"docs/mcp_client_allowlist.md","lines":180},{"path":"docs/mcp_servers/slack.md","lines":178},{"path":"docs/memory_management.md","lines":401},{"path":"docs/provider_registration/index.md","lines":325},{"path":"docs/providers/ai21.md","lines":215},{"path":"docs/providers/anyscale.md","lines":55},{"path":"docs/providers/bedrock_mantle.md","lines":514},{"path":"docs/providers/bedrock_vector_store.md","lines":337},{"path":"docs/providers/bedrock.md","lines":2909},{"path":"docs/providers/docker_model_runner.md","lines":278},{"path":"docs/providers/empower.md","lines":90},{"path":"docs/providers/friendliai.md","lines":64},{"path":"docs/providers/groq.md","lines":372},{"path":"docs/providers/inception.md","lines":190},{"path":"docs/providers/jina_ai.md","lines":172},{"path":"docs/providers/microsoft_365_copilot.md","lines":206},{"path":"docs/providers/mistral_batches.md","lines":114},{"path":"docs/providers/nebius.md","lines":196},{"path":"docs/providers/openai_compatible.md","lines":154},{"path":"docs/providers/prism.md","lines":320},{"path":"docs/providers/recraft.md","lines":304},{"path":"docs/providers/scx_ai.md","lines":236},{"path":"docs/providers/text_completion_openai.md","lines":163},{"path":"docs/providers/topaz.md","lines":28},{"path":"docs/providers/vertex_ai/videos.md","lines":307},{"path":"docs/providers/xai_realtime.md","lines":191},{"path":"docs/providers/xiaomi_mimo.md","lines":138},{"path":"docs/proxy/alerting.md","lines":604},{"path":"docs/proxy/caching_object_storage.md","lines":80},{"path":"docs/proxy/caching_semantic.md","lines":247},{"path":"docs/proxy/client_setup/codex_cli.md","lines":198},{"path":"docs/proxy/debugging.md","lines":205},{"path":"docs/proxy/guardrails/conduct.md","lines":125},{"path":"docs/proxy/guardrails/litellm_content_filter.md","lines":895},{"path":"docs/proxy/guardrails/llm_as_a_judge.md","lines":148},{"path":"docs/proxy/guardrails/policy_tags.md","lines":140},{"path":"docs/proxy/guardrails/promptguard.md","lines":259},{"path":"docs/proxy/guardrails/qualifire.md","lines":258},{"path":"docs/proxy/guardrails/repelloai.md","lines":294},{"path":"docs/proxy/guardrails/zscaler_ai_guard.md","lines":166},{"path":"docs/proxy/health_check_routing.md","lines":363},{"path":"docs/proxy/lens/coding-agents.md","lines":104},{"path":"docs/proxy/lens/deployment/litellm.md","lines":137},{"path":"docs/proxy/lens/deployment/upgrades.md","lines":36},{"path":"docs/proxy/lens/framework-examples.md","lines":701},{"path":"docs/proxy/lens/imported/integrations/langchain.md","lines":82},{"path":"docs/proxy/lens/imported/integrations/opentelemetry.md","lines":89},{"path":"docs/proxy/load_balancing.md","lines":436},{"path":"docs/proxy/manifests_to_microservices.md","lines":218},{"path":"docs/proxy/multi_region.md","lines":184},{"path":"docs/proxy/multiple_admins.md","lines":227},{"path":"docs/proxy/pass_through_guardrails.md","lines":251},{"path":"docs/proxy/pass_through.md","lines":475},{"path":"docs/proxy/plugins.md","lines":159},{"path":"docs/proxy/provider_discounts.md","lines":54},{"path":"docs/proxy/realtime_webrtc.md","lines":84},{"path":"docs/proxy/reliability.md","lines":1170},{"path":"docs/proxy/rules.md","lines":61},{"path":"docs/proxy/self_serve.md","lines":439},{"path":"docs/proxy/sync_anthropic_beta_headers.md","lines":129},{"path":"docs/proxy/tag_routing.md","lines":811},{"path":"docs/proxy/tool_policies.md","lines":231},{"path":"docs/proxy/ui_search_tools.md","lines":50},{"path":"docs/proxy/ui_spend_log_settings.md","lines":93},{"path":"docs/proxy/user_management_heirarchy.md","lines":19},{"path":"docs/secret_managers/google_secret_manager.md","lines":40},{"path":"docs/secret_managers/overview.md","lines":69},{"path":"docs/self_hosted_coding_agents/moyai/architecture.md","lines":154},{"path":"docs/troubleshoot/pip_venv_upgrade.md","lines":122},{"path":"src/pages/completion/supported.md","lines":98},{"path":"src/pages/contributing.md","lines":42},{"path":"src/pages/embedding/supported_embedding.md","lines":5}]

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
