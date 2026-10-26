#!/usr/bin/env node
// 补齐 4 个 helper chunk 的可见文案翻译（对齐既有批次口径）
import fs from 'node:fs';

const jobs = [
  ['command-syntax.DBfTYi8Z.js', [
    ['`Most Agents`', '`大多数智能体`'],
  ]],
  ['copy-feedback.C9pP2RQV.js', [
    ['`Copied`', '`已复制`'],
    ['`Command copied.`', '`命令已复制。`'],
    ['`Couldn’t copy. Select the command and copy it manually.`', '`复制被浏览器拦截。请手动选中命令复制。`'],
  ]],
  ['install-controls.Cm-kywS4.js', [
    ['`Copied. Run the command in Claude Code, then open /plugin → Discover and install Impeccable before continuing here.`', '`已复制。在 Claude Code 里运行该命令，然后打开 /plugin → Discover 安装 Impeccable，再回到这里继续。`'],
    ['`Copied. Run the install command in your terminal, then continue here.`', '`已复制。在终端里运行安装命令，然后回到这里继续。`'],
    ['`Start a new chat in your project, then run:`', '`在项目里新建对话，然后运行：`'],
    ['`Reload Claude Code. In the agent chat, run:`', '`重载 Claude Code。在智能体对话里运行：`'],
    ['`Reload your coding tool. In the agent chat, run:`', '`重载你的编程工具。在智能体对话里运行：`'],
    ['`Marketplace installs are for Claude Code`', '`市场安装仅适用于 Claude Code`'],
  ]],
  ['live-demo.D-mUrM-H.js', [
    ['`Pick any element on your live page.`', '`在运行中的页面上点选任意元素。`'],
    ['`Open the command palette: the design vocabulary.`', '`打开命令面板：设计词汇表。`'],
    ['`Pick a design verb, or just describe it.`', '`挑一个设计动词，或者直接描述。`'],
    ['`Circle what’s off-brand…`', '`圈出不像这个品牌的地方…`'],
    ['`match the suites below`', '`匹配下面的示例组`'],
    ['`…and say what you want.`', '`…再说出你想要什么。`'],
    ['`Mark + note are sent to your agent.`', '`标记和批注会发给你的智能体。`'],
    ['`Generating three variants…`', '`正在生成三个变体…`'],
    ['`Variant 1 of 3.`', '`变体 1 / 3。`'],
    ['`Variant 2 of 3.`', '`变体 2 / 3。`'],
    ['`Variant 3 of 3.`', '`变体 3 / 3。`'],
    ['`Accepted. Written to source.`', '`已采纳，写入源码。`'],
    ['`Three variants. Pick the one you want.`', '`三个变体。挑你想要的那个。`'],
  ]],
];

let total = 0;
let miss = 0;
for (const [file, pairs] of jobs) {
  const p = 'site/_astro/' + file;
  let t = fs.readFileSync(p, 'utf8');
  for (const [a, b] of pairs) {
    if (t.includes(a)) { t = t.split(a).join(b); total++; }
    else { console.log('MISS ' + file + ': ' + a.slice(0, 40)); miss++; }
  }
  fs.writeFileSync(p, t);
}
console.log('translated:', total, 'missed:', miss);
