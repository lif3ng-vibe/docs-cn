---
title: "resolving-merge-conflicts：解决合并冲突"
source: "https://www.aihero.dev/skills-resolving-merge-conflicts"
---

## 它做什么

`resolving-merge-conflicts` 逐块（hunk by hunk）地处理一个进行中的 git merge 或 rebase，然后跑项目自己的检查，并以一个 commit 收尾整个操作。

它拒绝把冲突当作文本问题。碰任何一个块之前，它先把每一侧追回到它的**[一手来源](https://www.aihero.dev/ai-coding-dictionary/primary-source)**（commit message、PR、原始工单），于是它是在两个意图之间做选择，而不是在两块文本之间，并且只要相容就把两边的都保住。真不相容时，它选匹配这次合并既定目标的一侧，并点名为此付出的取舍。它不发明新行为来糊弄一场冲突，而且 `--abort` 不在它的选项里：合并总是被带到完成的一个 commit。

## 什么时候该用它

输入 `/resolving-merge-conflicts`，或任务合适时[智能体](https://www.aihero.dev/ai-coding-dictionary/agent)自动够到。

当 git 已经停在自己解不开的冲突上时用它。它的范围限于眼前这个冲突，不含它两侧的任何东西：

| 你的处境 | 技能 |
| --- | --- |
| merge 或 rebase 进行中，工作树里有冲突标记 | 本技能 |
| 合并已完成，有东西出于你看不见的原因开始出问题 | [diagnosing-bugs](/engineering/diagnosing-bugs) |
| 规划怎么切分工作让分支少相撞 | 都不是：见下面的并行工作问题 |

## 一手来源优先于 `ours` 和 `theirs`

这个技能要消灭的失败模式是靠开关解冲突：`--ours`、`--theirs`，或者手删看着次要的那块，让标记消失、编译通过。那样的解可以句法上完美，却悄悄丢掉某人有意做出的变更。

你没读过的意图，你保不住。所以工作从历史开始（commit、PR、[工单](https://www.aihero.dev/ai-coding-dictionary/ticket)），然后才走到 diff。循环里的另一步出于同一理由存在：技能找到仓库自己的[自动化检查](https://www.aihero.dev/ai-coding-dictionary/automated-check)并在提交前运行，因为 merge 是 git 里最容易产出"满足两个分支、却过不了任何一方测试"的代码的地方。

## 常见问题

**Claude Code 自己解决冲突已经不错了。为什么还需要一个技能？**

增量价值在"找一手来源"和"跑反馈回路"这两步，否则每次都得手动提示。无提示的智能体通常只凭 diff 给出一个说得通的解，然后就停了。这个技能的价值，就是它不许智能体跳过的那两步：读明白每一侧为什么存在，以及事后跑检查。相对一个好[模型](https://www.aihero.dev/ai-coding-dictionary/model)，这是一层薄薄的优势，而且本就打算如此：至少有一位读者预言，随着模型进步，这一整个技能会变成 no-op。

**我该让并行智能体避开同一批文件，从源头避免冲突吗？**

多半不必。给并行任务划文件禁区，代价高于收益，因为智能体处理合并冲突已经够好，这笔交易没有看上去那么亏。值得保留的一条纪律是：大重构先做。一次大重命名在十个分支从它叉出去之后才落地，才是那种一直很贵的情形。

一条来自并行 worktree 用户报告的注意事项：当兄弟[会话](https://www.aihero.dev/ai-coding-dictionary/session)各自在自己的树里做一张工单时，合并回去最好由写下改动的那个会话来做，因为只有它已经知道意图。把所有人的冲突攒到最后倒给一个智能体，丢掉的恰恰是本技能第 2 步不得不回头重建的[上下文](https://www.aihero.dev/ai-coding-dictionary/context)。

**为什么绝不 `--abort`？**

中止会扔掉解到一半的工作，让你下次再试时面对一模一样、分毫未变的同一个冲突。这个技能是为"合并将会发生"的情形写的。如果你已经决定它不该发生，那是在调用之前要做的决定，不是循环里的一个分支。

## 正常工作的标志

- 解冲突时，智能体引给你看的是 commit message、PR 或工单，而不只是 diff 块。
- 每个块最终都保有两侧的行为，或者有一条明确的备注，写清丢了什么、为什么。
- 结果里没有出现在两个分支上都不存在的东西。
- 类型检查、测试和格式化是在 commit *之前*被找到并跑绿的，不是你发现坏了之后。
- 你以一棵干净的工作树、一次完成的操作收场——多 commit 的 rebase 也包括余下的每一个 commit。

## 它在全局中的位置

一个随时可单独够到的独立技能，不依赖任何其他技能：git 卡住时开始，工作树干净且已提交时结束。它唯一真正的邻居是 [diagnosing-bugs](/engineering/diagnosing-bugs)，在合并干净地解完、合并后的代码却出问题的那个点上接手：那是诊断问题，不是冲突问题。它完全坐在"想法到上线"的主流程之外，所以在它之前和之后跑什么，[ask-matt](/engineering/ask-matt) 是地图。
