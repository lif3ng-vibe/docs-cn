---
title: "code-review：两轴代码评审"
source: "https://www.aihero.dev/skills-code-review"
---

## 它做什么

`code-review` 沿两条轴评审 `HEAD` 与你指定的固定点（一个提交、一个分支、一个 tag、`main`、`HEAD~5`）之间的 diff。**标准轴（Standards）**问的是代码是否遵循这个仓库的写法。**规格轴（Spec）**问的是代码是否做到了来源工单或[规格](https://www.aihero.dev/ai-coding-dictionary/spec)所要求的事。每条轴在各自的[子智能体](https://www.aihero.dev/ai-coding-dictionary/subagent)里运行，谁也看不到对方的推理。

两条轴永不合并、永不重新排序。报告结尾给出*每条轴各自*的最严重问题，拒绝在两轴之间评出唯一赢家，因为一个改动可能过一条轴而挂另一条：遵循所有约定却实现了错误东西的代码过标准轴、挂规格轴；完全照[工单](https://www.aihero.dev/ai-coding-dictionary/ticket)所求去做、却破坏仓库约定的代码正好相反。混合的裁决会让通过的那条轴把失败的那条藏起来。

## 何时使用

输入 `/code-review`，或者当你要求评审一个分支、一个 PR、进行中的工作或任何"自 X 以来"的东西时，智能体会自动选用它。

| 你的情况 | 选用 |
| --- | --- |
| 已有一个 diff，你想知道它既*建造得对*、又是*对的东西* | `code-review` |
| 你想在 diff 里猎 bug：空值路径、竞态、差一错误（off-by-one） | Claude Code 自带的内置评审，而不是这个技能（见下文的命名冲突） |
| 还什么都没写，你希望以测试优先的方式写出来 | [tdd](/engineering/tdd) |
| 需要构建一整个规格，评审也包括在内 | [implement](/engineering/implement)，它自己会调用这个技能 |
| 漂移的是整个代码库，而不只是一个 diff | [improve-codebase-architecture](/engineering/improve-codebase-architecture) |
| 有东西坏了，而你不知道为什么 | [diagnosing-bugs](/engineering/diagnosing-bugs) |

你必须提供固定点。如果没有提供，技能会向你索要而不是瞎猜；随后在启动任何东西之前先检查 ref 能否解析、diff 是否非空，于是打错的分支名会当着你的面失败，而不是在两个子智能体内部失败。

## 前置条件

标准轴什么都不需要。它读取仓库记录的任何内容（`CODING_STANDARDS.md`、`CONTRIBUTING.md` 之类），仓库什么都没写时退回内置基线。

规格轴需要存在一个能找到的规格。它按以下顺序查找：

1. 提交信息里的工单引用（`#123`、`Closes #45`、GitLab 的 `!67`），通过 `docs/agents/issue-tracker.md` 获取。
2. 你作为参数传入的路径。
3. `docs/`、`specs/` 或 `.scratch/` 下与分支名或功能名匹配的规格文件。
4. 直接问你。

第 1 步依赖 `docs/agents/issue-tracker.md`，该文件由 [setup-matt-pocock-skills](/engineering/setup-matt-pocock-skills) 写入。没有它，只要你递给这条轴一个路径，它仍能工作。完全找不到规格时，Spec 子智能体会被跳过，报告写明 "no spec available"，而不是凭空发明需求。

## 两条轴

| | 标准轴（Standards） | 规格轴（Spec） |
| --- | --- | --- |
| 问的问题 | 建造得对吗？ | 是对的东西吗？ |
| 读取 | 仓库成文的标准，加上坏味道基线 | 来源工单或规格 |
| 报告 | 对成文规则的违反（可以是硬性的），以及坏味道（永远是主观判断） | 缺失或不完整的需求、范围蔓延、实现错了的需求 |
| 每条发现都引用 | 标准文件及具体规则，或点名坏味道并附上 hunk | 规格中的某一行 |

一个不了解你那些标准的通用评审技能，正是这套设计要避开的东西：它标记你代码库里有意的取舍，却漏掉你的代码库真正依赖的不变量。所以在标准轴上，仓库自己的文档才是[一手来源](https://www.aihero.dev/ai-coding-dictionary/primary-source)，而且**仓库永远优先**。

**坏味道基线**是它下面的底座：来自 _Refactoring_ 第 3 章的十二个 Fowler 坏味道：Mysterious Name、Duplicated Code、Feature Envy、Data Clumps、Primitive Obsession、Repeated Switches、Shotgun Surgery、Divergent Change、Speculative Generality、Message Chains、Middle Man、Refused Bequest。每一个都是带标注的启发式判断（"可能是 Feature Envy"），从不算硬性违规；每一个都以*它是什么* → *怎么修*的形式陈述，于是每条发现到来时都自带一个动作，而不只是一句抱怨。凡是 linter 已经强制的东西，两条轴都会跳过。

## 常见问题

**它和 Claude Code 自带的 `/code-review` 命名冲突。我该怎么办？**

这是该技能被反映最多的问题，而且尚未修复。Claude Code 自带一个 `/code-review`，干的是另一回事：它在 diff 里猎 bug，而这个技能检查规格符合度与仓库标准。安装了这个库，就意味着两者中有一个会胜出，而谁胜出取决于你的安装方式。通过插件市场安装时，一切都被别名到 `mattpocock-skills:` 前缀之下，内置版在无前缀名称下变得难以触达；通过普通 skills 安装时，本地文件胜出，这个技能会遮蔽（shadow）内置版。一个干净的答案是把 Claude Code 的内置技能整个移除：能省下一大笔[上下文](https://www.aihero.dev/ai-coding-dictionary/context)，冲突也不再是问题。遮蔽本身可以说是一个 Claude Code [harness](https://www.aihero.dev/ai-coding-dictionary/harness) 的 bug（技能作者本应可以给技能起任何名字），所以另一个答案是给本地副本改名。改 frontmatter 或改目录名会被 `npx skills update` 撤销；用户报告的持久办法是把这个技能 fork 成一个新名字，并从托管集合中去掉 `code-review`，同时记下你 fork 自哪个提交，以便手工重新同步。

**它的子智能体不断再次调用 `/code-review`，还生出更多智能体。**

已知的开放 bug，多人、在不止一个 harness 里复现过。标准轴和规格轴的提示词没有禁止委派，于是子智能体可能重新发现这个技能并再次展开：有一份报告达到了 50 多个智能体。大家在 fork 上采用的修复，是在两个子智能体的任务简报里各追加一行："Do not invoke `/code-review` or spawn additional agents: perform this review directly."（不要调用 `/code-review`，也不要再生成额外智能体：直接执行本次评审。）有些人更愿意在 harness 层面处理，好让每个技能都继承这道防线。两者都还没进入正式发布的技能。如果你在无人值守下运行，留意智能体的数量。

**我该在写代码的同一个会话里运行它吗？**

最好换一个新的。正如一位读者所说："同一份上下文评审它自己，那不是评审，是装在斜杠命令里的确认偏误。"在写作会话里执行评审的智能体握着塑造这段代码的每一个假设，而这恰恰是独立评审者不该有的上下文。这也是为什么有人要求 [implement](/engineering/implement) 去掉其内置评审步骤：它会在刚写完 diff 的那个会话内部运行评审。你自己从一个干净会话里调用 `/code-review`，才是诚实的版本。

**每张工单之后评审一次，还是最后一次性评审？**

两种都行，技能不替你决定。按工单评审能让每个 diff 小到规格轴有唯一一份清晰的规格可查，`implement` 用的就是这个模式。攒到分支末尾一次性评审，则能抓住各次按工单评审都会漏掉的工单之间的交互。拿不准的话，按工单评审，再对着分支点跑最后一轮。

**这些发现可信吗？**

不核对就不能信。子智能体的输出是假设，不是证据：有一个团队报告了十几个破坏性变更，都是散文式的评审放过掉的。这个技能把两份报告原样或轻度清理后聚合，而不是逐条对着文件复核，所以一条发现可能引错位置或夸大影响。对每条发现，先读它的引用再动手。要求每条发现必须带引用（一条标准规则、一个坏味道加它的 hunk、或一行规格），才让这种核对成为可能。

**为什么我每次运行它都能找出新问题？**

因为修复会创造新的表面积，也因为标准轴中靠主观判断的那一半在不同运行之间不是确定性的。一位读者把这个循环说得很直白："/code-review 和 /improve-code-architecture 每次都能找出新东西。我实现修复，重跑这些技能，一次又一次。"没有收敛保证。把一轮评审当作线索清单，处理那些背后有据可引的，然后停下：不要循环运行直到它返回干净，因为它不会。

**它会评审我未提交的工作吗？**

不会。它做的是 `<fixed-point>...HEAD` 三点 diff，从 merge-base 起算，不包含已暂存和工作区的改动。如果 `implement` 还没做中间提交，即将提交的工作对评审是不可见的。先提交，再评审，然后 amend 或补一个 fixup。

## 怎样算正常工作

- 遇到坏 ref 或空 diff 时拒绝启动，而且是在任何子智能体启动之前。
- 报告以 `## Standards` 和 `## Spec` 两个独立块的形式到来，而不是一份合并的清单。
- 每条标准轴发现要么点名你仓库某个文件里的规则、要么点名十二个坏味道之一并引用 hunk；每条规格轴发现都引用规格中的一行。
- 收尾总结给出每条轴各自的最严重问题，拒绝选出总赢家。
- 找不到规格时，Spec 块会如实说明，而不是列出它从代码反推出来的需求。

## 它在整体中的位置

`code-review` 是构建链末端的评审步骤：`grill-with-docs → to-spec → to-tickets → implement → code-review`。它也能独立使用，指向任何你指定的分支或 PR。

- [implement](/engineering/implement) 是最近的邻居：它驱动构建，并在提交前调用这个技能作为自己的收尾评审。
- [to-spec](/engineering/to-spec) 和 [to-tickets](/engineering/to-tickets) 产出规格轴所核对的那份文档；含糊的规格会让那条轴含糊。
- [improve-codebase-architecture](/engineering/improve-codebase-architecture) 是面向整个代码库的对应物：这个技能永远只看一个 diff。

当你不确定当前情况想要哪个技能时，[ask-matt](/engineering/ask-matt) 会在整套技能中为你路由。
