---
tagline: "为项目一次性配好 Impeccable。上下文、Live Mode，以及从哪儿起步。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-file">
    <div class="docs-viz-file-header">
      <span class="docs-viz-file-name">PRODUCT.md</span>
      <span class="docs-viz-file-status">每条命令都会加载</span>
    </div>
    <div class="docs-viz-file-body">
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Register</span>
        <span class="docs-viz-file-v">Product。设计服务于任务。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Users</span>
        <span class="docs-viz-file-v">值班的 SRE，快速扫读，常常身处暗处。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Brand voice</span>
        <span class="docs-viz-file-v">冷静、克制，不炒作。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Anti-references</span>
        <span class="docs-viz-file-v">紫色渐变。玻璃拟态。"提升你的生产力"。</span>
      </div>
    </div>
    <div class="docs-viz-file-footer">每条命令在写下第一行代码之前都会读它。</div>
  </div>
  <p class="docs-viz-caption">一份写好的 PRODUCT.md。只有策略：谁、做什么、为什么。没有颜色、没有字体、没有像素值——那些在 DESIGN.md 里。</p>
</div>

## 什么时候用

在项目开始时运行一次 `/impeccable init`。没有它，其他每条命令都得靠猜：大路货的 SaaS 语调、保守的默认字体、AI 味的配色。有了它，每条命令生成之前都会先读你的回答。

这些时候用它：

- **刚在新项目里装好 Impeccable**。这是第一件要跑的事。跳过的话，其他命令也会把你往这儿推。
- **项目的品牌方向变了**。新的定位、新的受众、新的语调。重跑一次 `init`，更新后的上下文就会流经每条命令。
- **另一条命令说"没找到设计上下文"**就停下了。这就是信号：先跑 init，再继续。

## 工作原理

一次代码库扫描，喂饱 init 写出的一切：

- **`PRODUCT.md`** 是策略文件。存的是受众、产品目的、语调、反面参照、设计原则、无障碍需求，以及品牌/产品路线的选择。回答"谁、做什么、为什么"。
- **`DESIGN.md`** 是视觉文件。颜色、字体排印、层级高度、组件、该做与不该做。回答"长什么样"。由受委托的 `/impeccable document` 命令撰写，init 在最后会调用它。
- **Live Mode 配置**。同一次爬取已经摸清了你的框架和入口文件，所以 init 会预配置 `/impeccable live`，让它直接进入变体模式，免去首次设置。

流程先扫描代码库（README、package.json、组件、令牌、品牌资产），然后请你确认一个核心选择：这是品牌界面还是产品界面？

- **品牌**：落地页、营销页、作品集、campaign。印象本身就是产品。
- **产品**：应用 UI、仪表盘、管理后台、工具。设计帮人完成任务。

文档把这一选择称为**调性（register）**。它决定字体排印、动效、颜色和密度。之后，init 只问它推断不出来的东西：用户、用三个真实的词形容个性、正面与反面参照、无障碍要求。

PRODUCT.md 只放策略。没有颜色、没有字体、没有像素值。那些在 DESIGN.md 里。把两个文件分开是刻意的：视觉系统演进时，策略可以保持稳定。完整的加载顺序和两个文件如何配合，见 [Design Context](/docs-cn/impeccable/docs/context))。

收尾时，它会根据扫描结果推荐最合适的后续命令：新工作用 `craft` 或 `shape`，已有的东西用 `critique` 或 `audit`，视觉迭代用 `live`。不用再猜从哪儿开始。

## 试一试

```
/impeccable init
```

预计一段 5 到 8 分钟的访谈。第一个问题通常是品牌/产品选择；其余都很短。Init 会复述它从代码里推断出的东西（"从路由看，这像个产品界面，对吗？"），你只需确认，不用从零开始。

过程中它会主动提出帮你运行 `/impeccable document`。没有特别的理由就答应下来。一份真正的 DESIGN.md，正是变体、打磨和审计保持品牌一致的关键。

## 常见陷阱

- **为了"先快速试一条命令"而跳过它**。结果会是其他每条命令都在半路访谈你。先跑 init 更快，不是更慢。
- **给出大路货的回答**。"现代又简洁"没有用。"温暖、机械感、有态度"才有用。要具体。要敢于和保守默认值唱反调。
- **把 PRODUCT.md 当成不可改动**。文件是你的。如果 init 写进去的东西不太对，就改。每条命令读的都是当前文件。
- **参照只列形容词**。品牌、产品、印刷品：要点名，不要描述。"Klim Type Foundry 的样张页"，而不是"技术感、干净"。反面参照也要同样具体。
