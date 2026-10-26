// 分段模式 workflow 生成器：每个代理翻译一个自包含分段（.parts/in/<name>/k.md），原位写回。
// 锚点映射写到分段旁 map/k.md；拼接由 merge-parts.cjs（主循环脚本）完成，不经代理。
// 用法：node scripts-cn/gen-workflow-parts.cjs scripts-cn/retranslate-parts.json scripts-cn/wf-parts.js
const fs = require('fs');
const path = require('path');
const [, , listFile, outFile] = process.argv;
const files = JSON.parse(fs.readFileSync(path.join(__dirname, listFile), 'utf8'));

const script = `export const meta = {
  name: 'translate-litellm-parts',
  description: 'Translate pre-split LiteLLM doc parts: one self-contained part per agent, in place',
  phases: [{title: 'Translate', detail: 'one part per agent; script splits and merges outside the workflow'}],
}

const ROOT = 'C:/Users/lif3n/src/docs/litellm-docs-cn'
const files = ${JSON.stringify(files)}

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
    '- 分段可能从标题前的内容开始或在标题后结束——翻译你拿到的整个文件即可，不必补全上下文。',
    '- 最终汇报极简：一行，done <文件名>；失败写 ERROR <原因>。',
  ].join('\\n')
}

phase('Translate')
// 并发自限：分块推进（总并发 ≤5）
const CONCURRENCY = 5
const results = []
for (let i = 0; i < files.length; i += CONCURRENCY) {
  const chunk = files.slice(i, i + CONCURRENCY)
  const r = await parallel(chunk.map((f) => () => agent(
    rules() + '\\n\\n文件：' + ROOT + '/' + f.path + '（共 ' + f.lines + ' 行）\\n' +
    '步骤：\\n' +
    '1. Read 该文件（整体翻译对象，自包含分段）。\\n' +
    '2. 全文翻译（遵守上方红线），用 Write 写回同一路径 ' + ROOT + '/' + f.path + '。\\n' +
    '3. 锚点映射：文件内每个 markdown 标题一行「原英文标题 | 中文标题 | 新锚点」（新锚点=github-slugger 规则，不含 #），用 Write 存到 ' + ROOT + '/' + f.mapPath + '（目录不存在先创建）。无标题则写一行「（本段无标题）」。\\n' +
    '4. 汇报一行：done ' + f.name,
    {label: f.name, phase: 'Translate'},
  )))
  results.push(...r)
  log('进度 ' + Math.min(i + CONCURRENCY, files.length) + '/' + files.length)
}
const skipped = results.filter((r) => r === null).length
log('完成 ' + (results.length - skipped) + '/' + files.length + '，跳过 ' + skipped)
return {total: files.length, skipped}
`;

fs.writeFileSync(outFile, script);
console.log('written', outFile, 'parts:', files.length);
