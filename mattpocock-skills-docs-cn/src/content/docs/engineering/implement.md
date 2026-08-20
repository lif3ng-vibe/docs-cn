---
title: "implement：按规格实现"
source: "https://www.aihero.dev/skills-implement"
---

## 它做什么

`implement` 构建已经定好的工作。你把它指向一张[工单（ticket）](https://www.aihero.dev/ai-coding-dictionary/ticket)、一份[规格（spec）](https://www.aihero.dev/ai-coding-dictionary/spec)，或你刚在对话里谈定的计划，它就写代码、在接缝（seam）处驱动 [tdd](/engineering/tdd)、边做边跑类型检查、最后跑 [code-review](/engineering/code-review)，并提交到当前分支。

它从不重开计划。没有访谈，没有澄清轮次，也不会提议另一种方案。上游敲定的一切就是输入，这个技能的全部工作就是把它变成一个 commit。这也是它与对着一个全新[智能体（agent）](https://www.aihero.dev/ai-coding-dictionary/agent)敲一句 “build this” 的区别——后者会一边施工一边兴致勃勃地把方案重新设计一遍。

## 什么时候该用它

你要自己输入 `/implement` 来调用：智能体不会主动用它。它自带 `disable-model-invocation: true`，所以其他技能也无法调用它。凡是 [ask-matt](/engineering/ask-matt) 或 [to-tickets](/engineering/to-tickets) 说“然后每张工单 `/implement`”的地方，那都是给你的指令，不是智能体会自觉去做的事。

工作现在待在哪，决定这是不是对的技能：

| 工作是…… | 该用什么 |
| --- | --- |
| 追踪器上的一张工单 | `/implement #42`，一张工单一个[会话（session）](https://www.aihero.dev/ai-coding-dictionary/session)，工单之间[清空（clearing）](https://www.aihero.dev/ai-coding-dictionary/clearing)上下文 |
| 一份规格，还没拆，且构建跨会话 | 先 [to-tickets](/engineering/to-tickets)，然后每张工单 `/implement` |
| 一份规格，且构建很小 | 直接对着规格 `/implement` |
| 只在你刚进行的对话里，且规模还小 | 就地 `/implement`，同一个窗口里 |
| 还哪儿都没写下来 | [grill-with-docs](/engineering/grill-with-docs)，没有代码库则用 [grill-me](/productivity/grill-me) |
| 一个想测试先行、没有规格的具体行为 | 直接 [tdd](/engineering/tdd) |
| 已经建好了，你想检查它 | 直接 [code-review](/engineering/code-review) |

“同会话”这种情况值得一提，因为技能自己的第一行没覆盖它。`SKILL.md` 说的是 “the spec or tickets”，这会引着[模型（model）](https://www.aihero.dev/ai-coding-dictionary/model)去猎取一个并不存在的文件。如果计划只存在于线程里，调用时就直说。

## 前置条件

`implement` 提交到你当前所在的分支。它不建分支，也不问。开工前确认自己就在想让这份工作落上去的那个分支上。

如果工单来自 [to-tickets](/engineering/to-tickets)，它们所在的追踪器就是由 [setup-matt-pocock-skills](/engineering/setup-matt-pocock-skills) 配置的。`code-review` 收尾时读同一份配置，找到最初那份规格。

## 一次运行做什么

一次运行是五个节拍，依序：

1. 读工单或规格，理出接缝。
2. 在事先约定的接缝上驱动 [tdd](/engineering/tdd)，一次一个红-绿（red-green）切片。
3. 频繁类型检查，边做边跑单个测试文件。
4. 完整测试套件只在最后跑一次。
5. 跑 [code-review](/engineering/code-review)，然后提交到当前分支。

一次运行覆盖一张工单。[to-tickets](/engineering/to-tickets) 产出的工单是曳光弹（tracer bullet）式的垂直切片（vertical slice），体量按单个全新[上下文窗口（context window）](https://www.aihero.dev/ai-coding-dictionary/context-window)裁剪，所以预期的节奏是：清空上下文，实现一张工单，提交，再清空。每张工单自包含，正因如此，上一张工单的上下文才是可丢弃的。

## 事先约定的接缝

这个技能赖以运转的概念是**接缝（seam）**：你在其上观察行为的公共边界，而不伸进内部。测试住在接缝上。在写任何代码之前就约定好的接缝上工作，正是让测试耐久的原因，因为底下的实现可以整个重写而测试不动。

“事先约定”这四个字承担着实际功能，也是这个技能最薄弱的关节。`implement` 内部没有任何东西去约定接缝。发问的是 `tdd`，它拒绝在未经确认的接缝上写测试。所以实践中，约定要么发生在上游的规格里，要么发生在运行的头几个来回里。如果哪儿都没发生，前置条件永不触发，运行就悄悄变成“直接写代码吧”。在规格里点名接缝，正是为了拦住这一点。

## 常见问题

**它跑完了，可我的工单还开着，验收标准也还没勾。**

对，而且符合预期。`implement` 没有收尾步骤。它止于 commit，从不碰工作项——GitHub Issues 和本地 markdown 追踪器上都已确认，所以这不是追踪器集成的问题。它也不处置 `code-review` 产出的发现，不去勾最初那张工单上的 `- [ ]` 框。关工单、对账验收标准，都由你自己来。这在依赖链上咬得最狠，因为 `to-tickets` 把前线（frontier）定义为阻塞项全部关闭的那些工单。什么都不关，就永远没有任何东西看起来被解锁了。

**我能把它对准全部工单一次跑，或者并行跑好几个吗？**

不能。一次调用，一张工单。跨工单队列的批量派发和[子智能体（subagent）](https://www.aihero.dev/ai-coding-dictionary/subagent)扇出都有人反复要，两者都不存在。在同一个检出里并排跑多个 `/implement` 会话，比“不支持”更糟：一份实地报告描述过，一个会话里的 `git commit --amend` 落到了另一个会话的 commit 上，一个 stash 从 `refs/stash` 里消失，commit 落上了错误的分支——这一切发生在同一个下午、横跨三张工单。这些会话共享同一个工作目录、同一个 index、同一个 HEAD。Git worktree 是社区的变通办法，但注意 `refs/stash` 也是跨 worktree 共享的，所以光靠 worktree 解决不了 stash 那种情况。今天想要并行，就得自己动手拼。

**它能不开 commit、改开 pull request 吗？**

没有内置。它直接提交到当前分支，好几个人觉得这太急了：代码还没等他们验证能不能用就落了地。没有配置开关，也没有 PR 模式。大家的变通是在调用时改口（“提交到一个分支并开一个 PR”），或者改自己本地那份技能。

**`code-review` 说看不到我的改动。**

`code-review` 评审的是 `git diff <fixed-point>...HEAD`，不含已暂存和工作区的改动。`implement` 在提交前运行它，所以除非已经存在一个中间 commit，那个 diff 里没什么可评审的。多人报告过，双方都没修。先提交，再对照你切分支的那个点做评审。

另一层：有人刻意根本不想要评审发生在运行内部，因为智能体评审自己刚写的代码时，会偏向自己的解法。在一个全新会话里对照某个固定点跑 [code-review](/engineering/code-review) 是正当的替代方案——那个技能把自己的两条轴放进分开的子智能体里跑，也是同一个原因。

**一张工单烧掉 150k token。是我用错了吗？**

多半是工单太大，而不是技能被误用。一次运行要做代码库勘察、每个接缝一轮红-绿循环、完整套件、外加一次评审，所以一张不小的工单超过 100k [token](https://www.aihero.dev/ai-coding-dictionary/token) 属于正常，不是出了故障的信号。杠杆在上游：在 [to-tickets](/engineering/to-tickets) 里把工单裁到合适体量，让每张都装进一个全新窗口。单张工单老是爆，就拆它，而不是调高[用力度（effort）](https://www.aihero.dev/ai-coding-dictionary/effort)。

**全新会话里 `/implement #2` 做了一件完全不相关的事。**

`#2` 是对着智能体当时看得见的随便哪张编号清单解析的，在全新会话里，那可能是一个 todo 文件、一张核对清单，或别的什么工作清单，而不是配置好的追踪器。这个解析自信满满，而不是失败即停，所以错误在它开工之前并不明显。传入完整引用——工单 URL 或 `owner/repo#2`——并让它开工前先把标题复述给你确认。

## 怎么算正常工作

- 会话开场先读工单或规格、复述它要构建什么，而不是反过来问你构建什么。
- 你能在轨迹里看到货真价实的 `/tdd` 调用，而不只是 diff 里凭空冒出的测试。
- 运行期间类型检查和单个测试文件反复执行，完整套件在临近结尾跑一次。
- 不用你催它继续，运行自己走到当前分支上的一个 commit。
- diff 恰是一张工单的体量：一条纵贯各层的垂直切片，而不是几张工单扫在一起。

## 它在整体中的位置

`implement` 是主链路的构建步骤，倒数第二：

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

它的邻居是 [to-tickets](/engineering/to-tickets)，产出它消费的工单、声明决定先后顺序的阻塞边；[tdd](/engineering/tdd)，它在每条接缝上内部驱动；以及 [code-review](/engineering/code-review)，提交前运行。它位于规划类技能的下游，并且信任它们。它不会重新校验交到手里的东西的形状，所以一张结构糟糕的地图或按层横切的工单会照着写的样子被建出来。

正是这份信任，[wayfinder](/engineering/wayfinder) 才在 [to-spec](/engineering/to-spec) 处汇入链路，而不是把自己的地图直接绕进 `implement`。只有当工作量事后证明确实很小，才从地图直接进 `implement`。

拿不准自己身处哪条流程时，[ask-matt](/engineering/ask-matt) 是整个技能集的路由器。
