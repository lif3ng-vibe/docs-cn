---
title: "tdd：测试驱动开发"
source: "https://www.aihero.dev/skills-tdd"
---

## 它做什么

`tdd` 以测试优先（test-first）的方式构建功能或修复 bug：先写一个失败的测试，再写刚好够让它通过的代码，然后是下一个行为。它承载着让这个循环产出值得保留的测试所需的各项标准：什么是好测试、测试该放在哪里、mock 是干什么的，以及会悄悄毁掉整套测试的三个反模式（anti-pattern）。

它绝不在你尚未事先认可的接缝（seam）上写测试。在任何测试存在之前，它会点名自己打算在哪些公共边界上做测试，然后停下来等你确认，因为测试的精力是有限的，正是这一步让你把精力花在关键路径上，而不是摊到每个边界情况上。还有一点要知道：`tdd` 是一份**参考**，不是驱动者。它掌握循环的规则，而由别的东西（你，或 [implement](/engineering/implement)）来运行应用这些规则的[会话](https://www.aihero.dev/ai-coding-dictionary/session)。

## 何时使用

输入 `/tdd`，或者当任务对口时，[智能体](https://www.aihero.dev/ai-coding-dictionary/agent) 会自动选用它：以测试优先的方式构建功能或修复 bug，或者当你说出 "red-green-refactor" 的时候。

当要构建的是一个具体行为——有输入、有可观察的输出——而且你希望测试能在重构之后依然存活时，就选用它。

| 你的情况 | 去哪里 |
| --- | --- |
| 有明确输入和输出的行为（业务逻辑、请求/响应契约、一次数据转换、校验） | `tdd` |
| 行为还没有敲定 | [to-spec](/engineering/to-spec)，它同样会在写任何代码之前先敲定测试接缝 |
| 真正的问题是接口的形状，而不是测试 | [codebase-design](/engineering/codebase-design) |
| 你已有[规格](https://www.aihero.dev/ai-coding-dictionary/spec)或[工单](https://www.aihero.dev/ai-coding-dictionary/ticket)，想让整个构建替你跑完 | [implement](/engineering/implement)，它按工单驱动 `tdd` |
| 配置、接线、胶水代码、类型标注、单纯的 CRUD 委托 | 这里的选项都不合适；见下文的空缺 |

最后一行是一个真实存在的空缺，不是风格偏好。这个技能决定接缝*放在哪里*；其中没有任何内容决定一个改动*是否*值得走这个循环。对一个没有独立事实来源可供断言的改动运行它，你会得到一个复述实现的测试：正是技能自己警告过的同义反复（tautological）反模式，只不过是从另一个方向得出的。这是 [issue #746](https://github.com/mattpocock/skills/issues/746)，目前仍然开放。在它关闭之前，这个判断归你，或归你的 `CLAUDE.md`。

## 前置条件

需要安装 [codebase-design](/engineering/codebase-design)。`tdd` 过去自带深模块（deep module）和接口设计的笔记；v1.0 里这些内容被删除，让位给共享技能，如今 `tdd` 的接口设计词汇要靠它。除此之外没有别的：这个技能是[无状态](https://www.aihero.dev/ai-coding-dictionary/stateless)的，自己不写任何文件。

## 循环，以及它所在的接缝

三个词撑起了这个技能。

**红绿（red-green）。** 先写失败的测试，然后只写刚好让它通过的代码。不预想下下个测试。没有重构阶段：它在 2026 年 6 月被移除，因为智能体基本上从不执行它，也因为评审和实现拆成两个会话效果更好。重构归 [code-review](/engineering/code-review)。

**垂直切片（vertical slice）。** 一条接缝、一个测试、一个最小实现，然后重复；第一轮是一发**曳光弹（tracer bullet）**，端到端地证明一条路径走得通。反面是水平切分（horizontal slicing）：先写完所有测试，再写所有代码。成批的测试验证的是*想象出来的*行为，它们检查的是事物的形状而不是用户实际做的事，还会在你理解实现之前就把你绑死在一种测试结构上。

**预先约定的接缝。** 接缝是你在不伸手进内部的情况下观察行为的公共边界。规则是绝对的：不在未确认的接缝上写测试。在完整链路里，接缝在更早的 [to-spec](/engineering/to-spec) 阶段就约定好了："`/tdd` 被告知只在预先约定的测试接缝上工作，`/code-review` 检查是否只用了约定过的测试接缝。"单独调用时，`tdd` 会直接问你。

它要预防的三个反模式：

| 反模式 | 识别特征 |
| --- | --- |
| 实现耦合（implementation-coupled） | 重命名一个内部函数测试就挂，尽管行为并没有变。mock 了内部协作者、断言调用次数、用数据库查询代替接口来做验证。 |
| 同义反复（tautological） | 期望值是用代码自己的算法算出来的，于是测试天然通过。期望值必须来自别处：一个已知正确的字面量、一个算好的例子、规格。 |
| 水平切分（horizontal slicing） | 一批测试先于任何实现落地。 |

mock 只用于系统边界：外部 API、时间、随机性，有时是文件系统或数据库。不用在你自己的模块上。

## 常见问题

**为什么它不做重构？描述里写的是 "red-green-refactor"。**

因为重构步骤被移除了，而描述没有跟着改。移除是有意为之：智能体基本上从不做这一步，而且把实现和评审留在分开的会话里效果更好。结果是否还算教科书意义上的 TDD，不如这个循环是否产出更好的代码重要。触发短语与正文之间的不一致已登记为 [issue #589](https://github.com/mattpocock/skills/issues/589)，目前仍然开放，所以 "red-green-refactor" 作为触发这个技能的短语仍然有效。你实际得到的是红 → 绿，外加在 [code-review](/engineering/code-review) 里做重构。

**它让我选一条测试接缝，我完全不知道选哪个。**

这是该技能被反馈最多的摩擦点（[issue #607](https://github.com/mattpocock/skills/issues/607)）。提示里只按名字列出候选接缝，完全不说每条能覆盖什么、漏掉什么，于是你其实是在几个标签之间挑。目前还没有发布修复。实用的绕行办法是在回答之前先向智能体要各方案的取舍：组件级接缝会漏掉什么而集成接缝抓得住，以及它慢多少。这也正是链路选择在 `to-spec` 里预先约定接缝的原因——那时你看到的是整个功能，而不只是一个提示。

**它先写了实现再写测试，尽管技能里说先红。**

这种事会发生。一位用户就此逼问过[模型](https://www.aihero.dev/ai-coding-dictionary/model)，得到了一个罕见地坦诚的回答："我知道技能里写了'一次一个测试，看着它因为正确的原因失败'。我读了。我还是落回了平常的习惯。"这个技能就是带着这种现实写的。没有任何指令能让智能体 100% 服从，而更用力地强压这一点只会限制智能体的创造力，收益甚微；即便没有被严格遵守，这个循环也值得运行，因为总体结果仍然更好。如果某个切片必须严格遵守，盯着这次运行本身，而不是指望技能来强制它。

**它该先写浏览器测试或端到端测试吗？**

通常不该，而技能也不会拦它。有用户报告智能体先写了一个 Playwright 测试，然后烧掉漫长的循环反复重跑，最后断定是*测试*坏了——而那个功能当时还不存在。把这一点配置进你的 `CLAUDE.md`。浏览器测试慢到红绿反馈回路（feedback loop）收不回成本；在你的仓库 `CLAUDE.md` 里声明：浏览器测试在行为跑通之后再写。

**`/tdd` 会取代 `/implement`，或者课程里的 `/do-work` 吗？**

不会。`/tdd` 记录的是方法论；`/implement` 是一个非常简单的"工作→反馈→提交"循环，是 `/do-work` 的直接替身。课程里单一的 `/do-work` 步骤如今拆分成了 `/implement`、`/tdd` 和 `/code-review`。如果你问的是对着一张工单该运行哪个，答案几乎总是 `/implement`。

**深模块和接口设计的指引去哪了？**

v1.0 时并入了 [codebase-design](/engineering/codebase-design)，做了泛化，让几个技能共享同一套词汇。`refactoring.md` 同时离场；重构现在是 [code-review](/engineering/code-review) 的职责，Fowler 的坏味道基线也由那个技能承载。

**它知道我的其他工单吗？**

不知道。对着一张工单运行时，它会乐于提出本属于兄弟工单的工作，因为它看不到工单图的其余部分（[issue #129](https://github.com/mattpocock/skills/issues/129)）。Matt 的立场是：这不是 `tdd` 的职责。把规格随工单一起传入会有帮助；一开始就把工单切得大小合适，帮助更大。

## 怎样算正常工作

- 在任何测试文件存在之前，它会停下来，点名自己打算测试的接缝，然后等待。
- 一个测试出现，变红，拿到刚好让它通过的代码，然后才出现下一个测试——而不是一批测试后面跟一批代码。
- 测试名读起来是能力（"user can checkout with valid cart"），而不是内部细节（"checkout calls paymentService.process"）。
- 断言里的期望值是可以追溯到规格的字面量，而不是按代码自己的算法重新算出来的值。
- 重命名一个内部函数不会弄坏测试套件里的任何东西。
- mock 只出现在外部边界（支付 API、时钟），从不出现在你自己的模块周围。

## 它在整体中的位置

`tdd` 是主链构建步骤内部的引擎，而不是一个独立步骤：

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

[to-spec](/engineering/to-spec) 预先约定测试接缝，[implement](/engineering/implement) 按工单驱动 `tdd`，[code-review](/engineering/code-review) 事后检查是否只用了约定过的接缝，并接管 `tdd` 不再负责的重构。它的另一个邻居是 [codebase-design](/engineering/codebase-design)，也就是 `tdd` 所说的接缝与深模块词汇的共享来源。你也可以单独使用它，只要有一个具体行为要构建、且没有完整规格在流程中。当你不确定当前情况适合哪个技能时，[ask-matt](/engineering/ask-matt) 会为你路由。
