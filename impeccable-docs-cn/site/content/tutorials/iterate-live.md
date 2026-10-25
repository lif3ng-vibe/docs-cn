---
title: 用 Live Mode 迭代 UI
tagline: "点选元素，生成三个变体，采纳其一。不离开代码的画布式迭代。"
order: 2
description: "用 /impeccable live 在开发服务器里对真实元素做视觉迭代：选取、标注、生成三个变体、采纳想要的那个，并让它写回源码。"
---

## 你将完成什么

你将在开发服务器上用 `/impeccable live` 迭代一小块 UI（一个 hero、一张卡片、一个区块），最终把三个 AI 生成的变体之一作为真实代码写回源码。你会体验到画布式的选取、标注和三选一轮换流程。

总耗时：约十分钟。大头花在挑要迭代的对象上。

## 前置条件

- 已安装 Impeccable（没有的话先看[新手入门](/docs-cn/impeccable/tutorials/getting-started))）。还没跑过的话，先运行 `/impeccable init`：变体要靠 `PRODUCT.md` 和 `DESIGN.md` 来贴合品牌。
- 一个跑着 HMR 的开发服务器（Vite、Next.js、SvelteKit、Astro、Nuxt、Bun），或在浏览器里打开的一个静态 HTML 文件。
- 一个至少有一块你想迭代的 UI 的页面。一张订阅卡片、一个 hero、一档价格，小到能装进脑子里的东西就行。

## 第 1 步：启动 Live Mode

在宿主里运行：

```
/impeccable live
```

技能会在 8400 端口起一个小的本地辅助服务器，并向你的开发入口文件注入一个加载选择器的 `<script>` 标签。如果项目有严格的 Content Security Policy，首次运行会检测到它，并提出一个一次性的、仅限开发环境的 `script-src` 和 `connect-src` 补丁。接受这个补丁：它由 `NODE_ENV === "development"` 保护，随时可以撤销。

打开你的开发服务器 URL（不是 8400 端口，那是辅助服务器，不是应用）。你会看到页面底部有一个深色胶囊，**Pick** 处于高亮状态。

## 第 2 步：选取元素

<div class="docs-viz-step">
  <div class="docs-viz-picker-row">
    <div class="docs-viz-picker-target">
      <span class="docs-viz-picker-pin">1</span>
      邮件订阅
      <span class="docs-viz-picker-note">更俏皮一点</span>
    </div>
  </div>
</div>

点选你想迭代的元素。它周围会出现选择器描边，选中项旁边会弹出一个浅色上下文条，左边是命令芯片，右边是自由文本框。

按下 Go 之前，你可以做几件事：

- **点命令芯片**（默认是 `impeccable`，即自由发挥）。选一个具体动作如 `bolder`、`delight`、`layout` 或 `typeset`，把变体约束在一个维度上。
- **在自由文本框里打字。**"更俏皮一点。""少一点 SaaS 味。""要像杂志发出来的邮件。"
- **落一个评论针**，点已选元素上的任意位置即可。针的位置有含义：靠近标题的评论说的是标题，不是整个元素。
- **画一笔**，在元素上拖动即可。闭合圈 = "这部分重要"。箭头 = 方向。叉 = "删掉这个"。技能按形状读笔画，不按像素内容。

感觉简报清楚了，就按 **Go**。

## 第 3 步：在三个变体间切换

<div class="docs-viz-step">
  <div class="docs-viz-variants">
    <div class="docs-viz-variant docs-viz-variant--v1">
      <span class="docs-viz-variant-badge">1 / 3</span>
      <span class="docs-viz-variant-kicker">No. 04</span>
      <p class="docs-viz-variant-title">信件，<em>偶尔</em>寄出。</p>
      <span class="docs-viz-variant-btn">给我寄一期</span>
    </div>
    <div class="docs-viz-variant docs-viz-variant--v2 is-active">
      <span class="docs-viz-variant-badge">2 / 3</span>
      <span class="docs-viz-variant-kicker">Dispatch</span>
      <p class="docs-viz-variant-title">设计笔记，<br>每两周<br>周四发。</p>
      <span class="docs-viz-variant-btn">订阅 →</span>
    </div>
    <div class="docs-viz-variant docs-viz-variant--v3">
      <span class="docs-viz-variant-badge">3 / 3</span>
      <span class="docs-viz-variant-kicker">Field Notes</span>
      <p class="docs-viz-variant-title">一封月度信件，写给还在认真读邮件的人。</p>
      <span class="docs-viz-variant-btn">收下 ✺</span>
    </div>
  </div>
</div>

你会看到一个转圈（"Generating variants..."），几秒之内，三个变体原地热替换进页面。不是预览——是你真实开发服务器上、带着你真实上下文渲染出来的真实 DOM。

用方向键（或上下文条上的前进/后退按钮）在变体间切换。右上角的计数器显示 `1 / 3`、`2 / 3`、`3 / 3`。

这三个变体被设计成**真正不同**，不是同一个想法的三种变奏。自由发挥的变体锚定三种不同的设计原型（大报报头、超大字符海报、目录式规格行，等等）。指定动作的变体则沿动作所指的维度变化：`colorize` 给你三个色相族，`animate` 给你三套动效语汇，`layout` 给你三种结构排布。

如果两个变体感觉撞了调，那就是技能的"眯眼测试"失败模式。你可以对选择器说"再来一次，三个都太像了"，换一套新的。

## 第 4 步：采纳其一

<div class="docs-viz-step" style="text-align:center">
  <span class="docs-viz-accept-pill">变体 2 已写入源码</span>
</div>

找到喜欢的那个后，在上下文条上点 **Accept**（或按回车）。会发生三件事：

1. 页面上被选中的元素替换为采纳的变体。
2. 变体写回源码：选择器注入的那个文件；如果 live 在第 1 步检测到生成文件，则写到组件源码。
3. 如果这次采纳涉及 CSS，相关规则会归并进项目真实的样式表，而不是留在行内。

三个都不要（按 Escape），原样保留。不留痕迹，也没有注释掉的残渣。

## 第 5 步：停止 Live Mode

迭代完之后，停掉辅助服务器：

- 在宿主聊天里说 **"stop live mode"**，或
- 点选择器胶囊上的 **×**，或
- 关掉浏览器标签页：辅助服务器会在 8 秒后检测到连接断开，干净退出。

停止时也会从开发入口移除 `<script>` 标签，并停掉 8400 端口上的辅助服务器。

## 接下来可以试试

- 在 `/impeccable polish` 之后对另一个页面跑 `/impeccable live`，把打磨后的版本和另外两个方向做 A/B。
- 搭配[用视觉覆盖层做评审](/docs-cn/impeccable/tutorials/critique-with-overlay))：先跑 critique、修掉优先问题，再用 live 在 critique 标记的元素上探索新方向。
- 想要先 shape 后构建的流程（端到端的新功能，而不是单个元素）时，用 `/impeccable craft`。

## 常见问题

- **选择器始终没出现在页面上。**要么辅助服务器没起来（看终端里的报错），要么 CSP 拦了注入。重跑 `/impeccable live`，让它重新检查 CSP。如果首次运行时你拒绝了补丁，删掉 `.impeccable/live/config.json` 里的 `cspChecked` 一行再重跑。
- **按 Go 时提示 "element lives in a generated file"**。live 检测到选中的元素在编译产物里，不在源文件里。它会走一条回退路径，让变体仍落到真正的源码。跟着提示走；不要强行采纳进生成文件。
- **变体不贴品牌。**检查 `PRODUCT.md` 和 `DESIGN.md` 是否在项目根目录。没有它们，live 会偏向通用默认值。先运行 `/impeccable init` 和 `/impeccable document`。
- **辅助端口被占用。**另一个 live 会话把服务器留在了后台。`/impeccable live stop` 会释放端口。
