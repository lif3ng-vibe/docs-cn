export const meta = {
  name: 'translate-litellm-cn',
  description: 'Translate LiteLLM docs batch to Chinese: one file per agent; oversized files split into parts then merged',
  phases: [
    {title: 'Translate', detail: 'one file per agent'},
    {title: 'Merge', detail: 'concatenate oversized-file parts'},
  ],
}

const ROOT = 'C:/Users/lif3n/src/docs/litellm-docs-cn'
const files = [{"path":"docs/adding_provider/adding_guardrail_support.md","lines":450},{"path":"docs/fine_tuning.md","lines":261},{"path":"docs/image_edits.md","lines":649},{"path":"docs/proxy/guardrails/quick_start.md","lines":961},{"path":"docs/proxy/prometheus.md","lines":1006},{"path":"docs/routing.md","lines":2233},{"path":"docs/self_hosted_coding_agents/moyai.md","lines":114},{"path":"docs/proxy/user_keys.md","lines":1149},{"path":"docs/response_api.md","lines":2005}]

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
