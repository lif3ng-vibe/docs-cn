---
title: "to-tickets：拆成曳光弹工单"
source: "https://www.aihero.dev/skills-to-tickets"
---

## 它做什么

`to-tickets` 接过一份计划、一份[规格（spec）](https://www.aihero.dev/ai-coding-dictionary/spec)，或你正身处的这段对话，把它拆解成工单追踪器（issue tracker）上的一组**[工单（ticket）](https://www.aihero.dev/ai-coding-dictionary/ticket)**。每张工单都声明自己的**阻塞边（blocking edge）**：必须先完成、它才能开工的那些工单。

每张工单都是一枚**曳光弹（tracer bullet）**：一条窄而完整的路径，纵贯改动的每一层（schema、API、UI、测试），落地那一刻就能独立演示。正是这条约束让它有别于拆分工作的显然做法——一次切一层、最后再集成。它还把每张工单裁到装得进一个全新的[上下文窗口（context window）](https://www.aihero.dev/ai-coding-dictionary/context-window)，因为将来领走这张工单的，是一个从未见过你规格的[会话（session）](https://www.aihero.dev/ai-coding-dictionary/session)。

## 什么时候该用它

你需要自己输入 `/to-tickets` 来调用。[智能体（agent）](https://www.aihero.dev/ai-coding-dictionary/agent)不会主动用它。

| 你现在的状态 | 该运行什么 |
| --- | --- |
| 你有一张规格工单，且构建跨多个会话 | `/to-tickets`，或 `/to-tickets #<spec_issue>` |
| 计划只在对话里，从没写下来 | `/to-tickets` 直接读线程，不需要规格 |
| 整个改动装得进一个上下文窗口 | [implement](/engineering/implement)，跳过工单 |
| 还什么都没定 | [grill-with-docs](/engineering/grill-with-docs)，然后 [to-spec](/engineering/to-spec) |
| 一张 [wayfinder](/engineering/wayfinder) 地图已经清空 | 先 [to-spec](/engineering/to-spec) 收拢地图，再 `/to-tickets` |

`to-tickets` 产出的工单从构造上就是智能体就绪（agent-ready）的。不要对它们跑[分诊（triage）](/engineering/triage)。分诊是给从别人那里来的工作准备的。

## 前置条件

`to-tickets` 要往追踪器里发布，所以必须先由 [setup-matt-pocock-skills](/engineering/setup-matt-pocock-skills) 为这个仓库配好追踪器和分诊标签词表。两种都可以：像 GitHub 或 Linear 这样的真实追踪器，或者 `.scratch/` 下的本地 markdown 文件——后者开箱即用。

## 要曳光弹，不要分层

**水平切分（horizontal slicing）**一次交付改动的一层。所有层都落地之前什么都跑不起来，而每张工单的验收标准又必须伸进别的工单所拥有的工作里。**垂直切片（vertical slice）**（即曳光弹）则一次交付一条贯穿全部层的细路径，因此可以单独验证，并且拥有它考核的一切。

这是人们违反得最频繁的规则，后果有充分记录。有个团队跑过一个按层切分的 26 张工单堆栈（corpus、producer、aggregator、selector），结果每关闭一张工单大约要二十次智能体运行，其中约四分之三是返工。他们自己的复盘把每一类失败都追溯到了水平切分，而不是实现本身。

任何东西发布之前，会先发生两件事。`to-tickets` 会找前置重构（prefactoring，原则是“先把改动变容易，再做那个容易的改动”），并把这类工作排在最前。然后它把拆分结果摆成一份带编号的清单来考你：粒度对不对，阻塞边是不是真的，有没有该合并或该拆开的。你点头之前什么都不会进追踪器，而这场盘问就是你提出异议的地方。

## 阻塞边

这些边正是这件产物的意义所在。它们因追踪器而呈现为两种形态：

| 追踪器 | 边存在哪里 | 你怎么消化它们 |
| --- | --- | --- |
| 本地 markdown | 每张工单一个文件，位于 `.scratch/<feature>/issues/<NN>-<slug>.md`，按阻塞者靠前编号 | 从上到下，手工执行 |
| 真实追踪器（GitHub、Linear） | 原生阻塞链接，或追踪器支持时的子工单（sub-issue） | 阻塞项全部完成的工单就在**前线（frontier）**上，可以领取 |

无论哪种，边都写在工单里。媒介只决定是否有什么能并行地依据它们行动。`to-tickets` 负责产出这件产物；跑起来（一次一个会话，或一支舰队）是你的活，不是技能的。

## 宽重构的例外

有一种形状会打破曳光弹规则。**宽重构（wide refactor）**是一次单一的机械式改动（重命名一个列、改一个共享符号的类型），其**爆炸半径（blast radius）**呈扇形铺满整个代码库，一处编辑破坏成千上万个调用点，没有任何垂直切片能以绿色落地。

对这种形状，`to-tickets` 改用**扩张——收缩（expand–contract）**来排序：

- **扩张（Expand）**：把新形态加在旧形态旁边，什么都不会坏。
- **迁移（Migrate）**：按爆炸半径分批（按包、按目录）把调用点搬过去，一批一张工单，每张都被扩张那张阻塞。CI 保持绿色，因为旧形态还在。
- **收缩（Contract）**：一旦没有调用方残留就删掉旧形态，放在一张被所有迁移批次阻塞的工单里。

若连单个批次都无法独自保持绿色，就让它们共用一条集成分支，并全部阻塞最后一张“集成并验证”工单。只有在那张工单上，绿色才被承诺。

## 常见问题

**一个三行的改动，它拆出了十二张工单。**
过度拆分是这个技能被报告最多的摩擦点，而且在各实践者那里表现一致：[模型（model）](https://www.aihero.dev/ai-coding-dictionary/model)默认产出原子单元，丢掉了能让它们有意义的分组。盘问那一步正是为此存在的：让它合并，它就会合并。更根本的回答是工单有下限：如果整个改动装得进一个上下文窗口，你根本不需要这个技能。直接上 [implement](/engineering/implement)。

**工单出来是一层一张：所有 schema 一张，所有 API 另一张。**
这正是垂直切片规则要防的失败，而技能偶尔仍会产出它。在盘问那一步，对每张工单问一个问题来抓它：这张做完我能演示什么？答不上来的工单就是水平切片。有人因此给每张工单加了一行“演示路径（demo path）”，并反馈说这能把模型往垂直分解上轻轻推一把。

**在 GitHub 上，工单没有被创建为规格工单的子工单。**
已知且未修复。十几运行、跨多个模型都有报告，[最完整的是 issue #554](https://github.com/mattpocock/skills/issues/554)，而且在 Codex 上比在 Claude 上更严重。`gh` 自 v2.94 起原生支持：`gh issue create --parent <n>`，事后补挂用 `gh issue edit <parent> --add-sub-issue <n>`。在追踪器模板改为优先使用这些之前，跑完后自己把父链接接好才是可靠的做法。

**“Blocked by”被写进了工单正文，而不是一条真正的阻塞链接。**
同类问题，[见 issue #513](https://github.com/mattpocock/skills/issues/513)，那里智能体甚至断言 GitHub 根本没有原生的阻塞关系。其实是有的：`gh issue create --blocked-by 12,15`。因为阻塞方先发布，它们的编号在创建时总是可用的。正文文本本意是给没有原生边能力的追踪器兜底，不是默认选项。

**本地工单放哪？v1.1 的说明说放根目录一个 `tickets.md`。**
当时是这么说的，而那是个 bug：单一共享文件在并行智能体写入时还会互相竞争。本地模式现在是每张工单一个文件，放在 `.scratch/<feature-slug>/issues/<NN>-<slug>.md`，按依赖顺序排，与本地追踪器模板早已描述的布局一致。`NN` 前缀是真实的工单 ID，所以 `/implement 03` 就能用，不必重敲一长串标题。

**它试图读我的规格时老是截断。**
非常大的规格会超出一条追踪器工单能干净吐回的体量，又没有本地副本可兜底，于是智能体烧掉一个个[工具调用（tool call）](https://www.aihero.dev/ai-coding-dictionary/tool-call)反复拉取片段，始终到不了结尾。在 `/to-spec` 和 `/to-tickets` 之间不要[清空（clearing）](https://www.aihero.dev/ai-coding-dictionary/clearing)或[压缩（compaction）](https://www.aihero.dev/ai-coding-dictionary/compaction)。在同一个上下文窗口里跑完两者，规格根本不需要被拉回来。

**验收标准什么也没考核到：有些还没动工就已经通过了。**
模板只要你给标准，却没说这些标准必须能失败，于是就有了这种事。三种形态反复出现：一条标准在基础 commit 上就已经为真；一条标准只能靠别的工单拥有的工作来满足；还有一条只是复述需求，而不是从产物推导出来。垂直切片能防掉大部分（一条交付此前不存在的行为的切片，在基础 commit 上天然就是红的），但这个检查值得亲手做。对每条标准，说出那个能证明它为假的观察，并确认它在实现者起步的那个 commit 上确实失败。

**工单发布出去了，我到底怎么跑它们？**
技能到产物为止，没有自动派发模式。派发是手动的：看一眼看板，数一数没有未完成阻塞项的工单有几张，就开几个智能体会话。一张工单一个全新上下文，中间清空。注意 [implement](/engineering/implement) 完工后并不会可靠地关闭或勾掉工单——GitHub 和本地 markdown 上都一样——所以工单状态要你自己更新。

## 怎么算正常工作

- 每张工单都答得上“这张做完我能演示什么”，而且答案是一种行为，不是一层。
- 清单带着编号回到你手上，每张都有一行 “Blocked by”，且这发生在任何东西发布之前。
- 排在最上面的那张没有阻塞项，可以立刻开工。
- 工单正文里没有文件路径或行号——原型（prototype）产出的代码片段除外。
- 每张工单读起来都像你不在场、一个全新会话也能做完的样子。
- 找到的前置重构排在顺序最前面，而不是混进特性工单里。

## 它在整体中的位置

`to-tickets` 是主构建链路上的一步：

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

上游是 [to-spec](/engineering/to-spec)，它递来一份已敲定的规格供其切分；把两者保持在同一个不间断的上下文窗口里。下游是 [implement](/engineering/implement)，它每个全新会话构建一张工单，测试上驱动 [tdd](/engineering/tdd)，收尾用 [code-review](/engineering/code-review)。拿不准该用哪个技能或哪条流程时，[ask-matt](/engineering/ask-matt) 会给你指路。
