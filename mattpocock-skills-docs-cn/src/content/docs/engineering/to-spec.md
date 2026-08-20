---
title: "to-spec：把对话落成规格"
source: "https://www.aihero.dev/skills-to-spec"
---

## 它做什么

`to-spec` 把你刚进行完的对话落成一份**[规格（spec）](https://www.aihero.dev/ai-coding-dictionary/spec)**，并以一条工单的形式发布到你的工单追踪器（issue tracker）。

它不会访谈你。轮到你用它时，决策已经做完，所以它做的是把已知的东西综合起来（来自对话线程、来自代码库、来自你的 `CONTEXT.md` 和 ADR），而不是开启新一轮提问。规格是一份已做决策的记录，不是做新决策的地方。

## 什么时候该用它

你需要自己输入 `/to-spec` 来调用；[智能体（agent）](https://www.aihero.dev/ai-coding-dictionary/agent)不会主动用它。

当一次构建大到一个智能体[会话（session）](https://www.aihero.dev/ai-coding-dictionary/session)装不下、必须经得起拆分到多个会话时，就用它。触发条件就这一条：

| 你现在的状态 | 该运行什么 |
| --- | --- |
| 还什么都没定 | 先用 [grill-with-docs](/engineering/grill-with-docs) |
| 已定，且工作量装得进一个[上下文窗口（context window）](https://www.aihero.dev/ai-coding-dictionary/context-window) | [implement](/engineering/implement)：跳过规格 |
| 已定，且工作跨多个会话 | `/to-spec`，然后 [to-tickets](/engineering/to-tickets) |
| 一张 [wayfinder](/engineering/wayfinder) 地图已经清空 | `/to-spec #<map_issue>` |

## 前置条件

`to-spec` 会把规格作为工单发布，所以必须先由 [setup-matt-pocock-skills](/engineering/setup-matt-pocock-skills) 为这个仓库配好追踪器和分诊（triage）标签词表。两种都可以：像 GitHub 这样的真实追踪器，或者 `.scratch/` 下的本地 markdown 文件——后者开箱即用。

## 规格是一份决策记录

规格之所以存在，是因为上下文窗口会到头。你在[追问（grilling）](https://www.aihero.dev/ai-coding-dictionary/grilling)中敲定的一切（方案的形状、你论证过的取舍、你有意拒绝的东西），都在一段即将被清空的对话里。规格就是从这场清空中活下来的东西。

所以它不验证任何东西，也不决定任何东西。它用项目自己的词汇把已定的事记录下来，让一个全新会话不必你重新解释就能接手工作。规格里任何一句你其实从没说过的话，都是缺陷。

## 先接缝，后正文

落笔之前，`to-spec` 会先勾勒出这个特性将被测试的**接缝（seam）**，并和你确认。它偏好已存在的接缝而非新造的，并且取尽量高层的接缝：一次改动里理想的接缝数量是一。

这些定下来的接缝随后会一路传下去。[tdd](/engineering/tdd) 只在事先约定的接缝上工作，[code-review](/engineering/code-review) 会对照规格评审 diff，所以一条没人同意过的接缝会以一条评审发现的形式冒出来。约束是间接的：它经由这份文档生效——这正是接缝这场对话值得在这里认真对待、而不是推迟到实现阶段的原因。

## 常见问题

**`/to-prd` 去哪了？**
就是这个技能，v1.1 改的名。现在 “Spec” 是唯一贯穿始终的术语，旧的 `to-prd` slug 已死；按新名字重新安装。取代旧词表的一对概念是*规格（spec）*与*工单（tickets）*：规格是目的地，以及把它钉死的那些决策；[工单](https://www.aihero.dev/ai-coding-dictionary/ticket)是抵达那里的执行步骤。如果你转向了（pivot），删掉没做完的工单，留下规格。

**为什么规格会打上 `ready-for-agent` 标签？我可不想让智能体照着它实现。**
这个标签的含义是“无需进一步分诊”：文档已经完整到智能体可以直接上手。它是个输入标记，不是工作指令。但如果你跑着会轮询 `ready-for-agent` 的 [AFK](https://www.aihero.dev/ai-coding-dictionary/afk) 智能体，这层区分对它们不可见，它们会兴致勃勃地试图一口气建完整个规格，而不是去领那一张张工单切片。这是该技能被报告最多的毛边。在它改变之前，在你的 AFK 智能体 prompt 里显式排除父规格，或者在 `/to-tickets` 跑完后把标签摘掉。

**为什么不从追问直接到 `/to-tickets`，省掉规格？**
多数时候确实该这么做；规格只有多会话的工作才配得上这一步。它的价值在于工单是一次性的，而规格不是：每张工单按一个全新上下文窗口的体量裁剪，做完即删即关，规格则留作承载其背后推理的唯一去处。在单会话的改动上这什么也换不来，反而多付了一步综合——而[模型（model）](https://www.aihero.dev/ai-coding-dictionary/model)在那一步可能跑偏。走追问 → `/implement` 就好。

**我刚跑完一张 wayfinder 地图，该喂给它什么？**
主地图工单：`/to-spec #<map_issue>`，而不是一张张决策工单（Decision ticket）。[wayfinder](/engineering/wayfinder) 产出的是决策而非交付物，散落在一张地图上；`to-spec` 就是把它们收拢成一份可施工文档的那一步。把地图直接绕进 `/implement`，等于把这次收拢扔掉了。

**规格是给我审的，还是只给智能体看的？**
主要是给智能体的，读起来也是那个样子：完整、密集、引用很多。值得你过目的是接缝和“范围外”一节，因为错误决策在这两处被抓住的成本最低、拖到后面发现的代价最高。通读全文是人们的真实抱怨，而且没有摘要模式：老实的回答是——如果规格让你意外，说明追问太浅，不是规格太长。

**工单开工之后，我要把规格冻住，还是让智能体改写它？**
没有什么机制让它保持同步，所以实际上它就是你当时所知的一张快照，实现第一次教会你新东西的那一刻它就开始过期。工作一上线，就把它当一次性的看待。注定比它活得久的产物是你的 `CONTEXT.md` 和 ADR；实现期间学到的、值得留存的东西，归宿在那里，不在一份被改来改去的规格里。

**我的工作是一次重构或一道模块边界，不是特性，模板合身吗？**
没那么合身，这是已知局限。模板重度依赖用户故事，而这对架构工作是个错误的形状：你会围绕本质上关于接口与不变量的决策，编出没人要的故事。改为倚重 implementation-decisions 和 testing-decisions 两节，并让耐久的架构决断经由 [grill-with-docs](/engineering/grill-with-docs) 落成 ADR，而不是硬让规格去承载它们。

**它会去追踪器里查相关工作，或引用它所遵循的 ADR 吗？**
都不会。它会读并遵循覆盖其触及区域的 ADR，但不给它们加链接；起草前也不去追踪器里搜重叠的工单，所以一份规格可能悄悄重复了别人早已立下的工作。如果这个区域事情很多，先自己去搜一遍追踪器。

**`/to-tickets` 读不了我的规格：老是截断。**
非常大的规格会超出一条追踪器工单能干净吐回的体量，又没有本地副本可兜底。解决办法是上下文卫生：在 `/to-spec` 和 `/to-tickets` 之间不要[清空（clearing）](https://www.aihero.dev/ai-coding-dictionary/clearing)或[压缩（compaction）](https://www.aihero.dev/ai-coding-dictionary/compaction)。在同一个窗口里跑完两者，规格根本不需要被重新拉取。

## 怎么算正常工作

- 它动笔就写，而不是向你抛出新一轮问题。
- 它在动笔前把接缝摆给你看，并且能少提一条就少提一条。
- 它交回来的东西用的是你项目自己的名词，而不是通用的产品管理套话。
- 里面的每条决策你都想得起来是怎么定的。没有为了填满某一节而编造的东西。
- “范围外”一节里有真东西：你拒绝掉的那些，往往是这页纸上最有用的几行。

## 它在整体中的位置

`to-spec` 是主构建链路上的一步，而且只在多会话那条分支上：

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

上游邻居是 [grill-with-docs](/engineering/grill-with-docs)——决策由它做，本技能只负责记录——以及 [wayfinder](/engineering/wayfinder)，它跑完的地图正是在这里汇入链路。下游，[to-tickets](/engineering/to-tickets) 把规格切成一张张曳光弹（tracer bullet）工单，交给 [implement](/engineering/implement) 施工。拿不准该用哪个技能或哪条流程时，[ask-matt](/engineering/ask-matt) 会给你指路。
