---
title: "codebase-design：深模块设计"
source: "https://www.aihero.dev/skills-codebase-design"
---

## 它做什么

`codebase-design` 校准你设计模块时使用的词汇：**模块（module）**、**接口（interface）**、**深度（depth）**、**接缝（seam）**、**适配器（adapter）**、**杠杆（leverage）**、**局部性（locality）**。它逐一给出精确定义，禁用松散的替身词（"component"、"service"、"API"、"boundary"），并陈述从这些词直接推出的几条原则。

它是一份参考，不是一个流程。没有要跑的循环，不产出任何东西，也没有它向你提问的检查点。其他所有碰到设计的技能都借用它的词汇；它自己只把语言给你，然后止步。调用前必须知道这一点，因为一个没有流程也没有停止规则的技能，如果你把一个[会话](https://www.aihero.dev/ai-coding-dictionary/session)对准它说"开工"，它会即兴发明一个流程。实际长什么样，见下面的问题。

## 什么时候该用它

输入 `/codebase-design`，或设计任务合适时由智能体自动够到。

你已经知道要重设计的是哪段代码、需要思考它的形状时用它：接缝放在哪、接口能压多小、一次抽取是否物有所值。它也是你用来裁决"一个词到底什么意思"之争的工具。

好几个技能坐在它近旁。要哪个，取决于真正的问题是什么：

| 问题 | 技能 |
|---|---|
| 单个模块的形状：它的接口、它的接缝、它的深度 | `codebase-design` |
| *领域的用词*："account" 有三个意思，两个人说 "cancellation" 各有所指 | [domain-modeling](/engineering/domain-modeling) |
| 你还不知道该重设计*哪个*模块 | [improve-codebase-architecture](/engineering/improve-codebase-architecture)（负责找候选的勘察） |
| 你要的是有人跟你的设计抬杠，而不只是命名 | [grilling](/productivity/grilling) |
| 有一个具体行为要构建，而且你想要能在重构中幸存的测试 | [tdd](/engineering/tdd) |

## 词汇表

这份词汇表就是这个技能。每个术语都对照其余术语定义，而且每个都附上它取代的词。

| 术语 | 含义 | 别说 |
|---|---|---|
| **模块（Module）** | 任何有接口和实现的东西。刻意不区分规模：一个函数、一个类、一个包、一条纵贯各层的切片都算。 | unit、component、service |
| **接口（Interface）** | 调用方要正确使用它必须知道的一切：类型签名，外加不变量、顺序约束、错误形态、必要配置、性能特征。 | API、signature |
| **深度（Depth）** | 接口处的杠杆：调用方或测试每学一单位接口，能驱动多少行为。**深**：小接口背后藏着大量行为。**浅**：接口几乎和实现一样复杂。 | （无） |
| **接缝（Seam）** | Michael Feathers 的术语：一个无须就地编辑就能改变行为的位置。它是接口的*落点*，放哪里是一项独立决策，与它背后放什么分开。 | boundary |
| **适配器（Adapter）** | 在某条接缝上满足一个接口的具体之物。命名的是角色，不是质料：一个内存假件和一个 Postgres 仓库都是适配器。 | （无） |
| **杠杆（Leverage）** | 调用方从深度中得到的：每学一单位接口换来的能力。 | （无） |
| **局部性（Locality）** | 维护者从深度中得到的：变更、bug 和验证集中在一处。修一次，处处修好。 | （无） |

深度刻意*不*定义为实现行数与接口行数之比——那是 Ousterhout 自己的定义，那套指标会奖励往实现里注水。这里用的是"深度即杠杆"。

## 四条原则

- **深度是接口的属性，不是实现的属性。** 深模块内部可以由小而可换的零件搭建，只是不暴露给调用方。一个模块可以有供自己测试使用的内部接缝，和接口处的一条外部接缝。
- **删除测试（deletion test）。** 想象删掉这个模块。复杂度若是随之消失，它就是个传递层；若是在 N 个调用方身上重新冒出来，它就物有所值。
- **接口即测试面。** 调用方和测试穿越同一条接缝。如果你想测到接口*以内*，这个模块的形状就不对。
- **一个适配器意味着一条假想的接缝。两个适配器才意味着一条真的。** 在真有东西隔着它变化之前别切接缝。只有一个适配器的接缝只是间接层。

两份配套文件走得更深，技能按需读取而非开卷全读。[DEEPENING.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/DEEPENING.md) 把候选模块的依赖分作四类（进程内、本地可替换、远程但自有、真外部），因为类别决定加深后的模块如何跨接缝受测。[DESIGN-IT-TWICE.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/DESIGN-IT-TWICE.md) 起并行[子智能体](https://www.aihero.dev/ai-coding-dictionary/subagent)为同一模块产出三个以上截然不同的接口，再按深度、局部性和接缝位置比较。

## 常见问题

**在 TypeScript 里到底怎么建一个深模块？**

关于这个技能被问得最多的问题，而它不回答。它定义深模块*是什么*；对怎么拦住一个越界的 import 伸进接口之内，它只字未提。[Issue #458](https://github.com/mattpocock/skills/issues/458) 说得直白："假设我们对接口满意，它藏住了细节，等等。但我们怎么*强制*它？我想没有 lint 或清晰的护栏，人和 LLM 一样会随时间把它弄脏。"Matt 在那个线程里的回答是三个选项：包进一个 class 或 IIFE，接受这个 class 会变得巨大；做成 monorepo 里的一个包，接受 monorepo 工具链；或用 [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) 这样的 linter 禁掉绕过接口的 import。他另外说过 Effect 是最佳机制、dependency-cruiser 次之。仓库的 `in-progress/` 桶里有一个 `setup-ts-deep-modules` 技能，铺设 `src/packages/<name>/index.ts` 约定，但它是 beta 频道技能、没有文档页，也没有随附 lint 规则。

**我把一个会话对准它，它烧了 100k [token](https://www.aihero.dev/ai-coding-dictionary/token) 去重设计我从没提过的东西。**

已知，已立为 [issue #449](https://github.com/mattpocock/skills/issues/449)。这个技能是模型调用的，自我描述是词汇表，但里面没有任何东西硬性拦住智能体把它当作可运行的流程。被指示"在 /codebase-design 里继续并推进未决决策"的智能体，够到了它找得到的最具动作感的内容：`DESIGN-IT-TWICE.md` 里的并行子智能体。它重新勘察了一个先前会话早已摸清的代码库，跑了很远才开口问。驱动类技能才有的护栏（检查点、一次一问、不自动推进）这里一概没有，因为参考本来就没有。变通办法是点名一个驱动技能，让这个技能坐在底下：`/grill-with-docs`、`/improve-codebase-architecture` 或 `/tdd`，配上 `codebase-design` 作词汇。issue 仍开放。

**`design-an-interface` 去哪了？有 `/interface-design` 这个技能吗？**

`design-an-interface` 已移除并并入本技能。没有丢失任何东西：它的"设计它两次"技法（并行子智能体生成截然不同的设计，源自 Ousterhout）作为 `DESIGN-IT-TWICE.md` 随本技能发布。另外，好几个人要过一个专用的 `/interface-design` 技能来实现深模块/薄接口这套哲学；这套哲学已经住在这里，没有另立技能的计划。如果你是冲着这两个名字来的，你要看的就是这一页。

**这不就是一套文件结构约定吗？文件夹、barrel 文件、特性切片之类的？**

不是，而且在反复的反对下技能一直守住这条线。[Issue #95](https://github.com/mattpocock/skills/issues/95) 提议一套形式化的分形树文件结构作为深模块的具体实现；得到的答复是两者正交："深模块关乎接口的设计和经由严格接口的访问，与文件系统长什么样无关。用你这套做法做出浅模块，看起来完全可能。"同样的话在 #458 里也出现过："我觉得你把模块的概念和文件系统绑得太紧了。文件系统当然可以是对模块形状的有用提示，但构造深模块不需要动用文件系统。"词汇表把**模块**刻意定义为不分规模，就是这个用意。

**`tdd` 真的在用这套词汇吗？**

现在在用了。很长时间里并没有。原先住在 `tdd` 内部的深模块笔记，在 v1.0 被移除、换成了这个共享技能，但接替它们的指针一直没加上，于是 `tdd` 自己给"接缝"下了定义、什么也不引用。缺口已补上：指针现在就在技能里，在开放问题是接口的形状而非测试时够到。`tdd` 仍拥有作为你*测试*所在边界的"接缝"；本技能拥有它背后的模块形状。

**design-it-twice 模式在 Claude Code 之外能用吗？**

不能干净地用。`DESIGN-IT-TWICE.md` 说的是"用 Agent 工具并行起 3+ 个子智能体"，那是 Claude Code 自己的[工具](https://www.aihero.dev/ai-coding-dictionary/tool)和名字。仓库为其他[框架](https://www.aihero.dev/ai-coding-dictionary/harness)（含 Codex）提供元数据，而那些框架在这个名字下可能什么都不暴露，所以并行设计阶段的可移植性不如技能元数据暗示的那样好。已记为 [issue #564](https://github.com/mattpocock/skills/issues/564)，开放中。

**我能往词汇表里加自己的概念吗？比如 connascence、模块秘密（module secrets）、[渐进披露](https://www.aihero.dev/ai-coding-dictionary/progressive-disclosure)？**

有人提议的正是这几个。[Issue #180](https://github.com/mattpocock/skills/issues/180) 想把 Parnas 的模块秘密和 Page-Jones 的 connascence 加进来，作为给*什么*正越过接缝泄漏命名的层，还附了能用的 diff；[issue #303](https://github.com/mattpocock/skills/issues/303) 提议在实现内部做渐进披露，让一个公共接口处很深的模块，底下不再是一整块不分化的板。两者都开放未合。随附的词汇表刻意很小，而它保持小的理由写在技能自己身上：一致的语言就是全部意义所在，一个没人一致使用的术语比没有术语更糟。

## 正常工作的标志

- 设计对话不再产出 "component"、"service"、"boundary" 这些词，开始产出"模块""接口""接缝"。
- 有人能指着一个提议中的抽取，不带含糊地说出它过不过得了删除测试。
- 一条提议中的接缝，随附的名字里有第二个适配器，而不止第一个。
- 对接口的讨论覆盖不变量、顺序和错误形态，而不只类型签名。
- 调用它不会开启一个会话。如果智能体仅凭 `/codebase-design` 就开始读文件、提议重构，它就把参考错当成了驱动。

## 它在全局中的位置

`codebase-design` 是一个**随时可单独够到的独立技能**，是工程技能底下的词汇层，而非任何链条上的一环。它最近的邻居是 [domain-modeling](/engineering/domain-modeling)——问题*领域*用词的平行参考，而非模块的形状。两者常常要一起用，因为给一个深模块起好名字，两边的词都需要。另一个是 [improve-codebase-architecture](/engineering/improve-codebase-architecture)：它勘察代码库寻找加深候选，并把每一个都用这套词汇表写出来——它找到模块，本技能是你设计它的工作台。拿不准哪个技能或流程（flow）合适时，[ask-matt](/engineering/ask-matt) 为你路由。
