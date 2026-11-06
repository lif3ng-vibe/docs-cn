---
title: "如何在功能发布前为其撰写文档"
---


这是合并前的文档工作流：功能已经实现，你要审计文档覆盖情况并补齐缺口。`/ship` 在发布前本来就会运行相应的文档审计；可在已提交的功能分支上单独运行 `/document-release` 重新审视，再用 `/document-generate` 补齐缺失的页面。

## 前置条件

- 已安装 gstack（`./setup` 已完成；用 `which gstack` 验证，或在 Claude Code 中输入 `/` 并看到技能列表）
- 已检出已提交的功能分支，尚未合并
- 可选：已有 GitHub 或 GitLab PR 时，单独运行的 `/document-release` 可把覆盖图（coverage map）写入 PR 描述

审计不需要 PR。`/ship` 会在创建或更新 PR 之前运行审计；没有 PR 时单独调用则跳过 PR 描述的更新。

## 步骤

### 1. 审计当前覆盖情况

运行：

```
/document-release
```

该技能会对照基线分支遍历你的 diff，提取新增的公开接口面（public surface，含技能、CLI 标志、配置项、API 端点、新模块），并按 Diataxis（文档框架）的四个象限为每个实体打分。你会看到类似这样的覆盖图：

```
Coverage map:
  [entity]         [reference?] [how-to?] [tutorial?] [explanation?]
  /new-skill       ✅ AGENTS.md  ❌        ❌          ❌
  --new-flag       ✅ README     ✅ README  ❌          ❌
  FooProcessor     ❌            ❌        ❌          ❌
```

覆盖为零的条目是**关键缺口**（critical gaps）。仅有参考类覆盖的条目是**常见缺口**（common gaps）。审计会同时报告这两类；存在 PR 时，还会为评审者追加一个 `### Documentation Debt` 小节。

如果 `/document-release` 报告全部覆盖，那就完成了，跳过本操作指南的余下内容。

### 2. 阅读报告出的文档缺口

查看审计的覆盖图和缺口摘要。如果存在 PR，打开 PR 描述中的 `## Documentation` → `### Documentation Debt`。每一项都标有能补齐它的 Diataxis 象限：

```
### Documentation Debt

- ⚠️ /new-skill — has reference in AGENTS.md but no how-to example in README. Diataxis quadrant: how-to.
- ⚠️ FooProcessor — zero coverage. Diataxis quadrants: reference, explanation.
```

这就是下一步的输入。每一行都告诉你缺什么、哪个象限能补上。

### 3. 用 /document-generate 填补缺口

运行：

```
/document-generate
```

当该技能询问范围时，把文档债小节中标出的具体实体告诉它。技能会阅读代码库（它的第 1 步考古（archaeology）阶段是必经环节），按 Diataxis 象限划分，并撰写缺失的文档。

也可以让技能自动发现：如果 `/document-release` 已把缺口明确传给你（链式调用时它会这样做），`/document-generate` 就已经知道该写什么。

### 4. 验证缺口已闭合

重新运行 `/document-release`：

```
/document-release
```

此时覆盖图上，先前被标记的实体应在原本为空的象限里显示绿色对勾。报告的文档债（包括存在时的 PR 描述小节）应为空，或只剩你有意延后处理的条目。

## 验证

阅读审计输出，以及存在时的 PR 描述。确认：

1. 审计总结了评审过和改动过的文档；已有 PR 的描述中有带文档 diff 预览的 `## Documentation` 小节。
2. 报告的文档债中关键缺口为零（或只剩你知情延后的条目）。
3. `docs/` 下每个生成的文档文件都能正常打开，并与同级页面互链（参考 → 操作指南 → 教程 → 解释）。
4. 运行 `grep -rE '\]\([^)]*\.md\)' docs/`，确认没有链接指向不存在的文件。

这些检查完成文档这一环节，所有延后的缺口都有记录。它们不能替代 `/ship` 的代码评审、测试或最终验证。

## 故障排查

**`/document-release` 报告 "No public surface changes detected."**
可能确实没有新的公开接口面，但仍要检查受影响的安装配置、测试、架构与工作流说明。一次完成的审计能够报告当前文档状况；仅有一张空的公开接口面图并不算完成审计。

**缺口的 Diataxis 象限标签与你的预期不符。**
该技能按一套实体分类法决定哪些象限重要（CLI 标志需要参考 + 操作指南；内部模块需要参考 + 解释；面向用户的功能需要全部四类）。如果你不认同，可以在生成之后手工编辑文档加以覆盖。审计是指引，不是约束。

**`/document-generate` 写出的教程要 8 步才能得到可运行的结果。**
教程应在 3 步以内到达可运行的结果。重新运行该技能并要求压缩，或者手工编辑。第 8 步的质量自查能抓住其中一部分，但不是全部。

**想为功能写文档，但还没有 PR。**
在已提交的功能分支上单独运行 `/document-release`；它可以在没有 PR 的情况下审计，并跳过 PR 描述的更新。或者运行 `/ship`，它会在发布前纳入这次审计。

**生成的参考文档里出现了凭空捏造的 API 签名。**
请提一个 bug。该技能的第 1 步考古本应通读实现文件而不只看签名，正是为了防止这种情况。请附上生成的文本和实际代码，以便我们追溯考古环节为何漏掉了它。

## 相关页面

- **教程：首次使用 `/document-generate`**：[tutorial-document-generate.md](/tutorial-document-generate/)
- **gstack 为什么采用 Diataxis 框架**：[explanation-diataxis-in-gstack.md](/explanation-diataxis-in-gstack/)
- **审计技能的参考文档**：[`document-release/SKILL.md`](https://github.com/garrytan/gstack/blob/main/document-release/SKILL.md)
- **生成技能的参考文档**：[`document-generate/SKILL.md`](https://github.com/garrytan/gstack/blob/main/document-generate/SKILL.md)
