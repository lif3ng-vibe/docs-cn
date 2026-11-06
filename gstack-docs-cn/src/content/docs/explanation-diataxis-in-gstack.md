---
title: "gstack 为什么用 Diataxis 组织文档"
---


gstack 的两个文档技能——`/document-release` 和 `/document-generate`——都说 Diataxis 这门"语言"。新实体会按四个象限打分，覆盖缺口会带着象限标签出现在 PR 描述里。本文解释这套词汇为什么是承重墙，以及为什么更简单的"随便写写 markdown"思路在 gstack 的运作规模下行不通。

## 问题

文档腐烂（documentation rot）是最容易被忽视的一种腐烂。代码编译不过，你立刻就会察觉；测试挂了，CI 会大叫。文档却在无声中变得陈旧——README 依然解析正常，安装命令依然能复制粘贴——唯一的信号是几周后一个困惑的用户提了 issue，或者默默走开。

gstack 有超过 45 个技能。每一个都是一份 SKILL.md 加一个 `.tmpl` 模板，理想情况下还要有一篇入门教程和一篇解释它为何如此设计的说明文档。把它乘上众多 gstack 用户在自己项目里的类似接口面，维护负担是实打实的。

天真的失败模式是"每个团队用自己的格式写文档"。一个项目用 Wiki，一个用嵌套的 README，一个只有参考类 API 文档而没有教程，还有一个的教程已经跑不起来了。你没法写工具去审计这些五花八门的格式，因为"好的覆盖"没有共同词汇。

第二种失败模式更隐蔽：即使团队很自律，大家也倾向于写符合当下心境的那类文档。处于构建模式的工程师写参考，处于发布模式的工程师写教程，处于维护模式的工程师写故障排查操作指南。没有人一觉醒来会说"今天我要写解释文档，讲讲我们为什么选了这个架构"——所以解释类的腐烂积攒得最快。

## 方案

Diataxis（文档框架，由 Daniele Procida 创立，最初在 Divio，现已被 CPython、Django、NumPy、FastAPI、GitHub 文档等广泛采用）按**读者意图**（reader intent）把文档分成四个象限：

```
                    THEORETICAL                        PRACTICAL
                    (understanding)                    (doing)

  STUDY            +-----------------------------+----------------------------+
  (learning)       |                             |                            |
                   |   EXPLANATION               |   TUTORIAL                 |
                   |   "Why does X exist?"       |   "Walk me through X       |
                   |                             |    for the first time"     |
                   |   discusses code            |   teaches code             |
                   |                             |                            |
                   +-----------------------------+----------------------------+

  WORK             +-----------------------------+----------------------------+
  (using)          |                             |                            |
                   |   REFERENCE                 |   HOW-TO                   |
                   |   "What is the exact        |   "How do I accomplish Y   |
                   |    signature of Y?"         |    using X?"               |
                   |                             |                            |
                   |   describes code            |   uses code                |
                   |                             |                            |
                   +-----------------------------+----------------------------+
```

处于教程模式的读者在边做边学，他们要一条保证成功的引导路径。处于操作指南模式的读者已经懂基础，只想要某个具体任务的做法。处于参考模式的读者想要准确、完整、像事实表一样穷尽的 API 覆盖。处于解释模式的读者想理解某个设计决策。

同一个人会在不同时间以这几种模式阅读同一个项目。同一段文字无法同时服务四种模式——教程需要手把手，这会拖慢参考模式的读者；参考需要穷尽，这会淹没教程模式的读者。

## 作为覆盖视角为何重要

用 Diataxis 术语写成的覆盖图，能给"文档更新了吗"一个确定性回答——不是"有没有 README"，而是"这个新技能有没有教程、常见任务有没有操作指南、API 有没有参考、不那么显然的设计选择有没有解释"。

`/document-release` 的第 1.5 步遍历 diff，提取新增公开接口面（技能、CLI 标志、配置项、API 端点），并按四个象限为每个实体打分。覆盖为零的条目成为**关键缺口**（critical gaps）；仅有参考覆盖的条目（gstack 自身历史上最常见的失败模式）成为**常见缺口**（common gaps）。两者都会落到 PR 描述里，评审者看得见。

`/document-generate` 有意按四个象限写文档，并拒绝混搭：教程不会出现 "Configuration" 小节，参考文档不会有 "What you'll build" 段落。该技能的 9 个步骤按参考 → 解释 → 操作指南 → 教程的顺序进行，因为这个顺序匹配依赖关系：参考固定词汇，解释论证设计，操作指南建立在两者之上，教程是最后也是最难的一环。

## 权衡

**Diataxis 增加了读者必须学习的词汇**。没听说过"参考 vs 解释"的用户起初可能觉得这些标签奇怪。缓解在于：Diataxis 标签见过一次就能自明，而且这些标签从不出现在文档本身里——它们出现在覆盖图和 PR 描述里，看到它们的是评审者，不是最终用户。

**四个文件取代一个**。一个小技能也许只有一份混合四种模式的 `docs/SKILL.md` 文件，Diataxis 把它拆成四份。缓解在于：AI 生成让四文件结构的成本低廉，象限之间的交叉链接是机械性的（每份参考文档链向它的操作指南，每份操作指南链向它的参考，依此类推），而可审计性的收益可观——`/document-release` 能自动为覆盖打分。

**Diataxis 不是唯一的好框架**。"每一页都是第一页"（Mark Baker）、*Write the Docs* 社区的四类文档、Google 开发者文档风格指南——各有各的切法。gstack 选择 Diataxis，是因为它的外部采纳最广（CPython、Django、NumPy、FastAPI 等），这意味着下游用户最有可能早已见过这套词汇，而且象限标签能干净地映射成覆盖图信号。

## 考虑过的替代方案

**"就在 README 里写几节"**。gstack 历史上隐式尝试过。失败模式：教程在 README 里越积越多，直到 README 超过 800 行、没人读到第 50 行以后。Diataxis 把它们拆成专门文件，每个都能从 README 的目录里找到。

**自造内部分类法**。诱人之处在于可以量身定制。否决理由是每个团队都会发明自己的词汇，`/document-release` 会失去跨项目审计的能力。Diataxis 是通用语。

**只做自动生成的参考**。许多项目用 JSDoc / TypeDoc / Sphinx 之类工具试过。没有解释的参考文档对新人如天书；没有教程，API 很难上手。参考是必要条件，但不充分。

**完全不要文档框架，全凭感觉**。这是大多数项目的现状。它无声地失败——用户直接走开而不是提 issue，反馈回路是断的。Diataxis 在用户抱怨之前就给出结构化信号。

## 相关页面

- **实现这一方案的技能参考文档**：[`document-generate/SKILL.md`](https://github.com/garrytan/gstack/blob/main/document-generate/SKILL.md)
- **使用这套分类法的审计技能参考文档**：[`document-release/SKILL.md`](https://github.com/garrytan/gstack/blob/main/document-release/SKILL.md)
- **使用 `/document-generate` 的教程**：[`tutorial-document-generate.md`](/tutorial-document-generate/)
- **操作指南：在功能发布前写文档**：[`howto-document-a-shipped-feature.md`](/howto-document-a-shipped-feature/)
- **Diataxis 主页**：https://diataxis.fr/ ——Procida 关于该框架的权威参考
