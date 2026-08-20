---
title: "grill-with-docs：带领域建模的追问"
source: "https://www.aihero.dev/skills-grill-with-docs"
---

## 它做什么

`grill-with-docs` 围绕一个方案或设计对你展开访谈，直到你和[智能体](https://www.aihero.dev/ai-coding-dictionary/agent)对它有了同一份理解，并且在此过程中把敲定的词汇和硬决策写进你的仓库。它与 [grill-me](/productivity/grill-me) 跑的是同一场访谈（一轮问题，然后等待，再下一轮），只是对准的是一个代码库。

它是**[有状态](https://www.aihero.dev/ai-coding-dictionary/stateful)**的。其他所有追问（grilling）技能都把[会话](https://www.aihero.dev/ai-coding-dictionary/session)留在你脑子里；这一个把文件留在磁盘上。一个术语敲定的那一刻，它就落进 `CONTEXT.md`，而不是攒到最后批量写入。一项决策过了三道闸门，它就落成一份架构决策记录（ADR）。全部区别就在这里，而人们对这个技能的大部分麻烦也来源于此：产物是真实仓库里的真实文件，所以它们可能在你以为有的时候缺席，也可能在不止一个人书写它们时悄悄漂移。

## 何时该用它

通过输入 `/grill-with-docs` 调用；智能体不会自己动用它。

在一次变更的开头、在一个仓库里、方案还很模糊、这东西该叫什么都还没定下来的时候用它。它是单会话工具。该用哪个追问技能，取决于你面前是什么：

| 你面前是什么 | 该用哪个 |
| --- | --- |
| 你根本不在任何工作目录里 | [grill-me](/productivity/grill-me) |
| 一个仓库，和一次你能在一个会话里敲定的变更 | `grill-with-docs` |
| 一件大到一个会话装不下的工作（从零新建的项目、一个大功能） | [wayfinder](/engineering/wayfinder) |
| 一个完全没有领域文档的仓库，而且心里没有特定功能 | `grill-with-docs`，对准仓库本身而非某次变更 |
| 一项卡在别人脑子里的知识上的决策 | [to-questionnaire](/productivity/to-questionnaire) |

与 wayfinder 的分野归结为会话数：单会话规划用 `/grill-with-docs`，多会话规划用 `/wayfinder`。

## 前置条件

这个技能会写你的仓库，所以你得待在一个可以放心写入的地方。敲定的术语进入根目录的 `CONTEXT.md` 词汇表；若根目录的 `CONTEXT-MAP.md` 把仓库标记为多上下文，则进入相应上下文的 `CONTEXT.md`。决策进入 `docs/adr/`。两者都惰性创建：第一个术语或第一项决策结晶之前什么都不存在，所以也没有什么需要预先搭骨架。

它还需要另外两个技能在场，因为它自己的 `SKILL.md` 只有一行、全靠委托：[grilling](/productivity/grilling) 提供访谈，[domain-modeling](/engineering/domain-modeling) 提供书写。只安装 `grill-with-docs`，得到的是一个用不了的技能。

## 留下的书面记录（paper trail）

一场会话产出三样东西，它们并不平等。

| 敲定的是什么 | 落在哪里 |
| --- | --- |
| 一个术语：项目对某样东西的自有叫法 | `CONTEXT.md`，就地写入，敲定即落 |
| 一项难以逆转、脱离上下文会令人意外、且构成真实取舍的决策 | `docs/adr/` 下的一份 ADR |
| 你敲定的其余一切 | 对话里，别无他处 |

绊住人的是第三行。`CONTEXT.md` 是一份词汇表，而且被刻意保持为一份词汇表：没有实现细节，没有[规格（spec）](https://www.aihero.dev/ai-coding-dictionary/spec)，没有草稿笔记。ADR 同时以三道闸门把关，所以多数决策不够格，多数会话一份也产不出。一场把词汇表磨得更利、ADR 为零的会话是在按设计运行，但这意味着你们谈定的东西，大部分只存在于谈定它的那个[上下文窗口（context window）](https://www.aihero.dev/ai-coding-dictionary/context-window)里。把同一场对话交给 [to-spec](/engineering/to-spec)，而不是[清空（clearing）](https://www.aihero.dev/ai-coding-dictionary/clearing)它。

词汇表才是重点。领域语言才是这个技能真正在构建的东西：项目自己的词，谈定一次，让你、智能体和同事不必再反复花力气重新推导。值得说明的是，并非人人都认同这能换来智能体性能：最尖锐的公开反对意见认为，一个术语和它的平实英文展开，从[模型](https://www.aihero.dev/ai-coding-dictionary/model)那里得到的结果一样，这套词汇真正压缩的，是共享它的人与人之间的沟通。按这种读法，词汇表依然有价值；只是价值挪了地方。

## 常见问题

**该用这个还是 `/wayfinder`？**

由范围决定。凡是能在一个会话里敲定的，用这个；工作大到一个会话装不下时用 [wayfinder](/engineering/wayfinder)，它会先把工作绘成一张[决策工单（Decision ticket）](https://www.aihero.dev/ai-coding-dictionary/ticket)地图。wayfinder 更慢也更重，在范围已经收拢的功能上动用它，是最常见的错误。它不取代这个技能：对地图里适合追问的那些部分，它可以降下来交给一场追问会话。

**它跑完了，却没出现 `CONTEXT.md`，也没有 ADR。**

已知原因有两个。平凡的一个：没有什么够格。ADR 需要三道闸门全过，而一场不涉及新词汇的变更会话，确实无物可写。真正的 bug：当这个技能运行在另一层编排之内（规格驱动开发的包装器、多智能体框架、一条把它当作别人流水线中一步来调用的规则），据报写文件的那一半会无声无息地不发生，访谈却照常进行。已提交，未修复。如果你身处那种环境，先检查工作目录，再相信会话的产出。

**它一口气问完了所有问题，不给推荐，也从不提 `CONTEXT.md`。**

那是技能没能加载它的两个依赖。因为 `SKILL.md` 是一行委托，没接住 [grilling](/productivity/grilling) 和 [domain-modeling](/engineering/domain-modeling) 的智能体，只能靠猜 "追问" 是什么意思，你得到的就是一坨不分青红皂白的问题倾倒。部分加载是更让人迷惑的情形：`grilling` 加载了，`domain-modeling` 没有，于是访谈像样，书面记录全无。它与模型和用力度（effort）档位相关，也是这个技能被报告最多的问题。若起疑，直接问智能体它加载了哪些技能。

**我其余的决策都去哪了？**

只进了对话。这是对这个技能最实质的未决抱怨：词汇表不是规格，多数答案挣不到一份 ADR，也没有一本台账，把每个敲定的答案一路串到规格、工单和测试。精确的答案（顺序性保证、否定式需求、数值默认值）在下游被软化成更弱的行文，结果可能看起来完整，却缺了你真正敲定的那件事。今天可用的缓解办法，是保住会话、直接喂给 [to-spec](/engineering/to-spec)，并且拿着你自己的答案重读产出的规格，而不是默认它都捕捉到了。

**我能把它对准一个完全没有文档的现存仓库吗？**

能。对一个没有 ADR、没有领域语言、没有设计原则的代码库，这正是合适的技能：调用它，说一句 "帮我给仓库写文档"。社区里的惯用法是把它与 [improve-codebase-architecture](/engineering/improve-codebase-architecture) 搭配，用来新建或修复 `CONTEXT.md`。做好掌舵的准备：它会读代码、就所见发问，而代码库里已有的那些词哪些是对的，由你说了算。

**会话结束时我该做什么？**

技能的收尾消息往往没有明确去向，这是一处已知的毛边。在主流程里，答案是 [to-spec](/engineering/to-spec)，就在同一场对话里接着做。如果变更小到可以立刻动手构建，那就直接去 [implement](/engineering/implement)。

**为什么叫这个名字？**

没人满意这个名字。有一个开放的更名建议：改成 `grill-domain-model`，更诚实地描述行为。目前毫无动静。一旦更名落地，文档页会跟着搬，URL 也会变。

## 正常工作的标志

- `CONTEXT.md` 在会话*进行中*逐个术语地变化，而不是最后一次性冒出来。
- 词汇表读起来是纯词汇（你项目的词，配紧凑的定义），不含任何实现细节或规格式的行文。
- 代码库能回答的问题，靠读代码库来回答，而不是拿来问你。
- 你拿到很少的 ADR 甚至一个没有，而拿到的那几份，都是若被迫重新翻案会让你恼火的决策。
- 它会挑战你用过的某个词，因为你已有的词汇表对那个词的定义不一样。

## 它在全局中的位置

`grill-with-docs` 是主构建链的链头：

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

它先于任何被写成规格的东西出现：它产出共享的理解与敲定的词汇，[to-spec](/engineering/to-spec) 随后无需再访谈你一次，就能把它们合成规格。它的近邻是 [grill-me](/productivity/grill-me)——同一场访谈，没有仓库也没有文件——以及 [domain-modeling](/engineering/domain-modeling)——它所驱动的那套词汇表加 ADR 的纪律；两者都坐在 [grilling](/productivity/grilling) 这个原语上。在它上游，[wayfinder](/engineering/wayfinder) 为大到一个会话装不下的工作绘图，并能把地图的若干部分交还给它。拿不准哪个技能或流程（flow）合适时，[ask-matt](/engineering/ask-matt) 为你路由。
