---
title: "这套技能集是什么？"
description: "Matt Pocock 每天用来做真正工程的智能体技能集——不是氛围编程（vibe coding）。"
source: "https://www.aihero.dev/skills"
---

这是 Matt Pocock 的智能体技能集——他每天用来做**真正的工程**的技能，而不是氛围编程（vibe coding）。

开发真实的应用很难。GSD、BMAD、Spec-Kit 这类方案试图通过接管整个流程来帮你，但代价是拿走你的控制权，让流程中的 bug 变得难以排查。

这套技能的设计目标是**小、易改、可组合**。它们可以配合任何模型使用，背后是数十年的工程经验。拿去魔改，把它们变成你自己的。

> 想跟进这些技能的变化和新技能，可以订阅 Matt 的 newsletter（约 6 万开发者已订阅）：[Sign Up To The Newsletter](https://www.aihero.dev/s/skills-newsletter)。

## 安装（30 秒）

两条路进来，两种哲学。**[Claude Code 插件](https://code.claude.com/docs/en/plugins)** 把整套技能作为受管理的只读包安装，Matt 发布时自动更新——你是订阅者，不是 fork 者。**[skills.sh](https://skills.sh/mattpocock/skills)** 把可编辑的技能文件复制进你的项目——你可以随意魔改。二选一：两个都装会得到双份技能。

### 1. 获取技能

**Claude Code：**

```bash
claude plugins install mattpocock-skills
```

或者在会话里：

```
/plugin install mattpocock-skills
```

它在 Claude Code 官方 marketplace 里，不用先添加什么，更新会自动到达。

**Codex 和其他智能体（也适合爱折腾的人）：**

```bash
npx skills@latest add mattpocock/skills
```

选你想要的技能和要安装到哪些编码智能体上。**安装器允许你挑选要拿哪些技能，务必让 `setup-matt-pocock-skills` 是其中之一。** 它把技能作为普通文件写进你的仓库，你拥有它们、可以编辑它们；不会在你背后偷偷更新，想同步时用 `npx skills update` 拉取最新变更。

原生 Codex 插件在路线图上（见 [ADR 0002](https://github.com/mattpocock/skills/blob/main/.agents/adr/0002-ship-as-a-claude-code-plugin.md)）。

### 2. 运行 `/setup-matt-pocock-skills`

在你的智能体里，每个仓库运行一次。它会：

- 问你想用哪个工单追踪器（issue tracker）（GitHub、Linear 或本地文件）
- 问你分诊（triage）工单时打什么标签（`/triage` 会用到标签）
- 问你想把我们创建的文档存在哪里

### 3. 完成——可以开工了

## 这些技能为什么存在

Matt 建造这套技能，是为了修复他在 Claude Code、Codex 和其他编码智能体上反复看到的常见失败模式。

### #1：智能体没做我想要的

> "没有人确切知道自己想要什么。"
>
> —— David Thomas & Andrew Hunt，《程序员修炼之道》

**问题**：软件开发中最常见的失败模式是错位（misalignment）。你以为开发者懂你，看到产出才意识到它完全没理解你。AI 时代一模一样——你和智能体之间隔着沟通鸿沟。

**修复**是**追问会话（grilling session）**：让智能体就你要构建的东西向你提详细的问题。用这两个技能：

- [`/grill-me`](/productivity/grill-me)——非代码场景
- [`/grill-with-docs`](/engineering/grill-with-docs)——同上，但加了更多好东西（见下）

这是最受欢迎的技能。每次要做变更之前都用它们，帮你在开工前与智能体对齐，并深入思考这个变更。

### #2：智能体太啰嗦

> "有了统一语言，开发者之间的对话和代码的表达都源自同一个领域模型。"
>
> —— Eric Evans，《领域驱动设计》

**问题**：项目之初，开发者和领域专家通常说着不同的语言。Matt 在智能体上感到了同样的张力——智能体被空投进项目，边干边猜行话，于是 1 个词能说清的事用了 20 个词。

**修复**是共享语言（shared language）：一份帮智能体解码项目行话的文档。举他 `course-video-manager` 仓库里的 [CONTEXT.md](https://github.com/mattpocock/course-video-manager/blob/076a5a7a182db0fe1e62971dd7a68bcadf010f1c/CONTEXT.md) 例子：

- **之前**："课程某个小节里的课时被'落实'（即在文件系统里占位）时会出问题"
- **之后**："物化级联（materialization cascade）出了问题"

这份简洁一个会话接一个会话地兑现价值。

这内建在 [`/grill-with-docs`](/engineering/grill-with-docs) 里：一场追问会话，同时帮你和 AI 建立共享语言，并把难以解释的决策记进 ADR。

> [!TIP]
> 共享语言的好处远不止减少啰嗦：
>
> - **变量、函数、文件用共享语言一致命名**
> - 于是**代码库对智能体更易导航**
> - 智能体**思考消耗的 token 更少**，因为它手里有更精炼的语言

### #3：代码跑不起来

> "永远走小的、审慎的步子。反馈的速率就是你的速度上限。永远别接太大的任务。"
>
> —— David Thomas & Andrew Hunt，《程序员修炼之道》

**问题**：就算你和智能体对齐了要构建什么，智能体产出的还是垃圾怎么办？该看你的反馈回路了。没有"代码实际怎么跑"的反馈，智能体就是在盲飞。

**修复**：常见的反馈回路一整套——静态类型、浏览器访问、自动化测试。对自动化测试来说，红-绿-重构循环至关重要：智能体先写失败的测试，再让测试通过。这给智能体稳定水平的反馈，产出的代码好得多。

他建了 **[`/tdd`](/engineering/tdd)** 技能，可以插进任何项目：它推行红-绿-重构，并就什么是好测试、坏测试给出充分指导。

调试方面，**[`/diagnosing-bugs`](/engineering/diagnosing-bugs)** 把最佳调试实践包进一个有纪律的、逐阶段把门的循环。

### #4：我们堆出了一个泥球

> "每一天都投资于系统的设计。"
>
> —— Kent Beck，《解析极限编程》
>
> "最好的模块是深的：大量功能藏在简单接口之后。"
>
> —— John Ousterhout，《软件设计哲学》

**问题**：智能体构建的大多数应用复杂难改。智能体能激进地加速编码，也就加速了软件熵增——代码库以前所未有的速率变复杂。

**修复**是一种对 AI 辅助开发来说很激进的新姿态：**在乎代码的设计**。这内建在技能集的每一层：

- [`/to-spec`](/engineering/to-spec) 在创建规格前会考你正在碰哪些模块

关键是 [`/improve-codebase-architecture`](/engineering/improve-codebase-architecture)：它扫描代码库找"加深"机会，把候选者交给你。建议每隔几天跑一次。它是勘察，不是救援——真正老旧的代码库上它会找到真候选，但不会替你解开泥球。

### 小结

软件工程的基本功比以往任何时候都更重要。这套技能是 Matt 把这些基本功凝结成可复用实践的最佳努力，帮你交出职业生涯里最好的应用。

## 参考：技能怎么分类

技能沿一条轴分类：**谁能调用**。**用户调用**技能只有你敲出来才可达（如 `/grill-me`），职责是编排；**模型调用**技能既可以由你调用，也可以在任务合适时由智能体自动够到，承载可复用的纪律。用户调用技能可以调用模型调用技能，但绝不调用另一个用户调用技能。

完整清单与逐篇详解见侧边栏，按"工程 / 生产力 × 用户调用 / 模型调用"分组。
