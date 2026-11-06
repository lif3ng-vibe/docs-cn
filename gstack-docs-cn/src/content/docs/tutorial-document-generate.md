---
title: "教程：90 秒内为一个功能生成文档"
---


你将在自己已有的项目上运行 `/document-generate`，看它把教程 / 操作指南 / 参考 / 解释文档写进正确的位置，最终得到一张可以直接放进 PR 的覆盖图（coverage map）。走完这个教程，你会掌握四个动作：定范围（scope）、考古（archaeology）、划分（partition）、撰写（write）。

## 你需要准备什么

- 已安装 gstack（`git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`）
- Claude Code 运行在任意至少有一处公开接口面（public surface）的项目里（一个 CLI 命令、一个导出函数、一个配置项、一个技能、一个 API 端点都算）
- 大约 90 秒时间

不需要提前备好 `docs/` 目录——缺失时技能会自行创建。也不需要了解 Diataxis 术语——技能会替你给产出打好标签。

## 第 1 步：在任意项目中调用该技能

在想写文档的项目中打开 Claude Code。输入：

```
/document-generate
```

你会看到该技能问一个关于输出目标的问题：

```
A) Write documentation inline in existing files (README, ARCHITECTURE, etc.)
B) Create standalone documentation files (e.g., docs/ directory)
C) Both — inline summaries in existing files + deep docs in standalone files

RECOMMENDATION: Choose C because it maximizes both discoverability and depth.
```

选 C。你会得到 README 中的指引入口，外加一整套独立文档。

## 第 2 步：观察考古环节的运行

该技能会静默约 30 秒来阅读代码库。这是有意为之——第 1 步的"代码库考古（Codebase Archaeology）"阶段是整个工作流中最重要的一步。技能正在阅读：

- 完整的仓库结构
- README、ARCHITECTURE、CONTRIBUTING、CLAUDE.md（各入口文件）
- 待写文档目标的实现文件（通读整个文件，而不只看签名）
- 测试（它们揭示边界情况和预期行为）
- 带有 `// NOTE:`、`// DESIGN:`、`// WHY:` 标记的行内注释

完成后你会看到类似这样一行：

```
Researched 47 files, identified 12 public surface items, 8 concepts, and 4 design decisions.
```

这组数字说明技能确实读了代码，而不是靠文件名瞎猜。

## 第 3 步：查看 Diataxis 划分计划

技能会打印一份划分计划（partition plan），展示为每个实体写哪些象限：

```
Documentation plan:
  [entity]              [tutorial] [how-to] [reference] [explanation]
  WidgetService         ✅ new     ✅ new   ✅ new      ✅ new
  --verbose flag        ❌        ✅ new   ✅ inline   ❌
  Bayesian scheduler    ❌        ❌       ✅ new      ✅ new
```

并非每个实体都需要全部四个象限。CLI 标志配参考 + 操作指南；内部模块配参考 + 解释；面向用户的功能配全部四类。技能按实体类型来选。

如果计划中的文档超过 5 篇，技能会先请你确认再继续；否则直接开工。

## 第 4 步：阅读第一个落地的文档

参考文档最先落地，因为它们负责固定词汇。你会看到类似这样的行：

```
GENERATED: docs/reference-widget-service.md
```

打开那个文件。它有严格的结构：一段引言、带类型与默认值的完整 API 清单、2-3 个可运行的示例，以及一个 Related 小节，链向接下来将落地的操作指南和教程。

这就是 Diataxis 中参考文档的样子：只讲事实、力求穷尽、不带叙事。如果你发现自己想解释某个选项*为什么*存在，那属于技能接下来要写的解释文档。

## 第 5 步：看解释、操作指南和教程相继出现

紧接着（每篇约 5-10 秒），技能写出其余象限：

```
GENERATED: docs/explanation-widget-architecture.md
GENERATED: docs/howto-create-a-custom-widget.md
GENERATED: docs/tutorial-build-your-first-widget.md
```

逐一打开。注意它们互不重复：

- **解释**先讲问题，再讲方案，最后讲权衡与考虑过的替代方案
- **操作指南**有前置条件、带精确命令的编号步骤、一个验证小节和一个故障排查小节
- **教程**让你在 3 步以内得到可运行的结果，以 "What you built"（你构建了什么）收尾

技能会强制执行这些结构。如果某篇操作指南缺了验证小节，第 8 步的质量自查会在提交前抓住它。

## 第 6 步：检查交叉链接

每篇文档都链向其他文档。参考文档的 Related 小节：链向操作指南和教程。操作指南的 Related 小节：链向参考文档。教程的 "What you built"（你构建了什么）小节：链向参考文档以便深入探索。

运行一次 grep 验证没有断链：

```bash
grep -rE '\]\([^)]*\.md\)' docs/ | head -10
```

每个被链接的文件都应存在。技能的第 7 步 "Cross-Document Linking & Discoverability"（跨文档链接与可发现性）会在提交前做这项检查。

## 第 7 步：在 PR 描述中查看覆盖摘要

如果你在一个带有开放 PR 的功能分支上，技能会用一张 `## Documentation Generated` 表格更新 PR 描述：

```
## Documentation Generated

| File | Quadrant | Description |
|------|----------|-------------|
| docs/tutorial-build-your-first-widget.md | Tutorial | Walk-through from install to first working widget |
| docs/reference-widget-service.md | Reference | Complete widget API with types, defaults, examples |
| docs/explanation-widget-architecture.md | Explanation | Why widgets are isolated services |
| docs/howto-create-a-custom-widget.md | How-to | Creating and registering custom widgets |
```

评审者打开 PR 就能看到这张表，立刻知道随本次发布带来了哪类覆盖。

## 你构建了什么

你现在有了服务四类不同读者的四篇文档：

- 项目新人可以读 `tutorial-*.md`，跑通一个能用的东西
- 有经验的用户可以读 `howto-*.md`，完成一项具体任务
- API 调用者可以读 `reference-*.md`，查精确的签名
- 代码评审者可以读 `explanation-*.md`，理解设计意图

每一篇都短到便于维护，每一篇只干一件事。PR 描述展示了覆盖了哪些象限。如果之后运行 `/document-release`，Diataxis 覆盖图会将该实体报告为完全覆盖（4/4 个象限）。

## 接下来做什么

- **如果还有 `/document-release` 标出但未填的缺口**：再次运行 `/document-generate`，把范围限定在那几个实体上。
- **如果你想理解这四个象限为何存在**：读 [explanation-diataxis-in-gstack.md](/explanation-diataxis-in-gstack/)。
- **如果你只想在发布前为一个具体功能写文档**（而不是整个项目）：读 [howto-document-a-shipped-feature.md](/howto-document-a-shipped-feature/)。
- **技能本身的参考文档**：[`document-generate/SKILL.md`](https://github.com/garrytan/gstack/blob/main/document-generate/SKILL.md)。
