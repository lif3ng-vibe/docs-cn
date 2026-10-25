---
title: 用视觉覆盖层做评审
tagline: "用 /impeccable critique 加浏览器覆盖层，带着 ground truth 评审运行中的页面。"
order: 3
description: "跑一次完整设计评审，同时结合 LLM 评估、自动检测器和实时浏览器覆盖层，让你确切看到眼前页面上哪些元素触发了哪些反模式。"
---

## 你将完成什么

你将对浏览器里一个运行中的页面跑一次完整设计评审，每一条被标记的反模式都直接高亮在触发它的元素上。不用截图，不用猜，也不用把一整段发现自己对照回代码。

总耗时：约十分钟。

## 前置条件

- 项目里已安装 Impeccable（没有的话先看[新手入门](/docs-cn/impeccable/tutorials/getting-started))）。
- 一个有浏览器自动化可用的宿主（带 Chrome 扩展的 Claude Code，或类似组合）。
- 一个想评审的页面，本地（`localhost:3000/pricing`）或已部署的都行。

## 第 1 步：运行 /impeccable critique

在宿主里运行：

```
/impeccable critique the pricing page at localhost:3000/pricing
```

技能会并行启动两项相互独立的评估。它们跑在各自的子 agent 里，互不污染。

### LLM 评估做什么

第一项评估读取你的源码；浏览器自动化可用时，还会在新标签页打开运行中的页面。它走一遍 impeccable 技能完整的 DO/DON'T 清单，并按 Nielsen 10 启发式、8 项认知负荷清单，以及你 `PRODUCT.md` 里的品牌契合度给页面打分。

它打开的标签页标题带 `[LLM]` 标记，方便你分清哪个是哪个。

### 自动检测器做什么

第二项评估对页面运行 `npx impeccable detect`。这是确定性的：一条条具体的模式检查，要么触发要么不触发。渐变文字、紫色配色、侧边页签边框、嵌套卡片、行宽问题、低对比度、过小的正文字号，等等。[完整样例库](/docs-cn/impeccable/slop#catalog))列出了每条规则，以及由哪一层（CLI、浏览器，还是仅 LLM 检测）捕捉。

你会拿到一份 JSON 列表，包含每条发现的元素选择器、触发的规则和一句简短描述。

## 第 2 步：打开视觉覆盖层

Impeccable 自带视觉模式，把检测到的每条反模式直接高亮在页面上。下面是它跑在一个故意做得很糟的 synthwave 落地页上的样子：

<div class="tutorial-embed">
  <div class="tutorial-embed-header">
    <span class="tutorial-embed-dot red"></span>
    <span class="tutorial-embed-dot yellow"></span>
    <span class="tutorial-embed-dot green"></span>
    <span class="tutorial-embed-title">实时检测覆盖层</span>
  </div>
  <iframe src="/docs-cn/impeccable/antipattern-examples/visual-mode-demo.html"" class="tutorial-embed-iframe" loading="lazy" title="Impeccable 视觉覆盖层运行在示例页面上"></iframe>
</div>

每个被描边的元素都带一个浮动标签，标明触发的规则。悬停描边可看完整发现。这和你在自己页面上看到的完全一样。

打开它有两种方式：

1. **[Chrome 扩展](https://chromewebstore.google.com/detail/impeccable/bdkgmiklpdmaojlpflclinlofgjfpabf)**：任何页面一键启用。点工具栏里的 Impeccable 图标，所有反模式立刻高亮。
2. **在 `/impeccable critique` 内部**：评估的浏览器环节期间，技能会打开一个带 `[Human]` 标记、检测器处于激活状态的浏览器标签页。你不用额外做任何事。

本教程里最省事的是 Chrome 扩展。装上它，打开你的定价页，点 Impeccable 图标，覆盖层会立刻出现在运行中的页面上。

## 第 3 步：合并两份评估

回到宿主，`/impeccable critique` 已经跑完并产出一份合并报告。它大致长这样：

```
AI slop verdict: FAIL
  Detected tells: gradient-text (2), ai-color-palette (1),
                  nested-cards (1), side-tab (3)

Heuristic scores (avg 2.8/4):
  Visibility of status: 3 (good)
  Match between system and real world: 2 (partial)
  Consistency and standards: 2 (partial)
  ...

Cognitive load: 3/8 failures (moderate)
  Visible options at primary decision: 6 (flag)
  Decision points stacked at top: yes (flag)
  Progressive disclosure: absent on advanced pricing toggles

What's working:
  - Clear price hierarchy
  - Strong headline

Priority issues:
  1. Hero uses gradient text on the main price
     Why: AI tell, reduces contrast, hurts scannability
     Fix: solid ink color at one weight heavier
  2. Feature comparison table has 4 nested card levels
     Why: visual noise, unclear hierarchy
     Fix: flatten to a table with zebra striping

Questions to answer:
  - Is the free tier a real product or a funnel?
  - What does a user feel when they land here from an ad vs from search?
```

## 第 4 步：修复发现

报告会给你一份优先级清单。你可以一条条来，也可以让模型一口气全修，或者介于两者之间。关键是用覆盖层来验证：

1. 让覆盖层在一个标签页里保持打开。
2. 在代码里修（或让模型全修）。
3. 刷新。覆盖层重新扫描，已解决的发现会消失。

这个反馈闭环正是覆盖层的价值所在。你能实时看到修复落地，也绝不会上线一个其实没满足规则的"修复"。

## 第 5 步：修完后重跑

过完优先级清单后，再跑一次 `/impeccable critique`。目标是 AI slop 判定干净、启发式平均分至少 3.5。认知负荷失败数应低于 2。

仍有规则触发的话，要么修掉，要么写一条压制注释说明为什么这条规则在你的上下文里不适用（检测器认一小组选择性退出的 pragma，但请节制使用）。

## 接下来可以试试

- [用 Live Mode 迭代 critique 的发现](/docs-cn/impeccable/tutorials/iterate-live))。选中 critique 标记的元素，落一条评论，让三个新方向原地热替换，把采纳的那个写回源码。
- `/impeccable audit the same page` 抓 critique 覆盖不到的实现问题（无障碍、性能、主题化）。
- critique 报告已经干净、还想做最后一轮精修时，用 `/impeccable polish`。
- critique 标记了"太挤"或"认知负荷"时，用 `/impeccable distill`。Distill 负责移除不该在那里的东西。

## 常见问题

- **覆盖层没显示发现，critique 却说有问题**。检测器抓确定性模式，critique 抓判断题。两者互补，并不重复。
- **LLM 评估和检测器结论不一致**。这很正常。LLM 是主观的，检测器是确定性的。不一致时，两边都看看，自己拍板。
- **覆盖层把页面布局搞乱了**。少见，但有些 CSS 会和注入的覆盖层样式互相影响。最稳的体验用 [Chrome 扩展](https://chromewebstore.google.com/detail/impeccable/bdkgmiklpdmaojlpflclinlofgjfpabf)，或从 CLI 跑 `npx impeccable detect` 手动应用发现。
