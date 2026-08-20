---
title: "setup-matt-pocock-skills：初始化配置"
source: "https://www.aihero.dev/skills-setup-matt-pocock-skills"
---

## 它做什么

`setup-matt-pocock-skills` 回答关于一个仓库的三个问题：工单（issue）放在哪里、分诊（triage）标签叫什么、领域文档放在哪里。它把答案以 markdown 文件的形式记录在 `docs/agents/` 之下。

这些文件是各个仓库之间唯一不同的东西。技能（skill）本身在任何地方都一模一样：它们在运行时读取 `docs/agents/issue-tracker.md`，照着上面说的做。正因如此，这套技能不绑定 GitHub，也不需要修改任何技能文件来把它指向别处。用 "link the skills to a custom issue tracker"（把技能接到自定义工单追踪器）这样的说法来调用它，对任何你能以编程方式连接的系统都有效，技能本身零改动。

它是一个由提示驱动的技能，而不是一个确定性脚本。它会读取你的 `git remote`、已有的 `CLAUDE.md`、已有的 `CONTEXT.md`，提出它探查到的方案，然后等你确认——确认之前一个字都不写。

## 何时该用它

通过输入 `/setup-matt-pocock-skills` 调用；[智能体](https://www.aihero.dev/ai-coding-dictionary/agent)不会自己动用它。它被刻意标记为不可自动调用，因此也没有任何其他技能能替你触发它。

每个仓库用一次，而且要在首次使用其他任何工程技能之前。如果 [triage](/engineering/triage)、[to-spec](/engineering/to-spec)、[to-tickets](/engineering/to-tickets) 或 [wayfinder](/engineering/wayfinder) 开始猜测你的工单该发到哪里，或者打上你的追踪器里根本没有的标签，说明它们还没在这里完成设置。项目已经做到一半的仓库同样是运行它的好地方：技能会读取现状，之前的工作一点不浪费。

## 前置条件

它会写入你运行它的那个仓库：

| 它写入什么 | 写到哪里 |
| --- | --- |
| `issue-tracker.md` | `docs/agents/` |
| `domain.md` | `docs/agents/` |
| `triage-labels.md` | `docs/agents/`，仅当安装了 `triage` 技能时 |
| 一个 `## Agent skills` 块 | `CLAUDE.md` / `AGENTS.md` 中已存在的那一个 |

以上全部都是要提交进仓库的 markdown。它没有用户级或全局模式：配置就住在仓库里，所以每个仓库各有一份。

## 三个决策

它在每个环节开头先给出推荐答案，探查阶段已经定下的部分直接跳过。多数时候确认两次就完事。

| 决策 | 它推荐什么 | 什么时候真正发问 |
| --- | --- | --- |
| **工单追踪器（issue tracker）** | 与你的 `git remote` 相匹配的那一个 | 总会问：这是唯一真正的选择 |
| **分诊标签** | 沿用五个规范名称（`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`） | 仅当安装了 `triage` 技能时 |
| **领域文档** | 单上下文：根目录一个 `CONTEXT.md` 加一个 `docs/adr/` | 仅当它发现 monorepo 迹象时，此时它会提供多上下文的 `CONTEXT-MAP.md` |

追踪器选项：

| 选项 | 工单放在哪里 | 需要什么 |
| --- | --- | --- |
| **GitHub** | 该仓库的 GitHub Issues | `gh` CLI |
| **GitLab** | 该仓库的 GitLab Issues | `glab` CLI |
| **本地 markdown** | 本仓库 `.scratch/<feature>/` 下的文件 | 什么都不需要：完全没有远程仓库 |
| **其他** | 你指定的任何地方 | 你写一段话描述这个工作流 |

前三个选项以模板形式内置于技能中，开箱即用。本地 markdown 是一等公民选项，不是退而求其次的备胎：没有远程仓库的个人项目同样得到完整支持。有一个注意事项值得再啰嗦一遍：如果你在用 GitHub，就不要用本地 markdown。两者是二选一的替代关系，不是层层叠加的关系。

"其他"也不是摆设。Jira、Linear、Azure DevOps 和 Beads 全都能用，靠的就是它：你描述工作流，技能把你的文字记录进 `docs/agents/issue-tracker.md`，下游技能照着这段文字行事。社区已经这么做过：基于 [MCP](https://www.aihero.dev/ai-coding-dictionary/mcp) 的 Jira 变体、仿 `gh` 形状的 Gitea CLI、手工搭的本地看板。

## 常见问题

**我必须用 GitHub 吗？**

不必。GitHub、GitLab 和 `.scratch/` 下的本地 markdown 都是现成模板，其他任何系统走 "其他" 这条路。这是记录里被问得最多的问题，措辞大同小异：*"hard locked to github"*、*"can I use GitLab / Jira"*、*"what about Azure DevOps"*。而每一次的答案都一样：追踪器是设置阶段的答案，不是技能的属性。

**更新技能之后需要重新运行它吗？**

v1.1 之后被直接问到时，Matt 的回答是 "要"。技能自己的收尾消息则更宽松：它告诉你只有换追踪器或推倒重来时才需要重新运行。两种说法都站得住，而且分歧的缘由真实存在：种子模板会随版本变化，旧版本写下的 `docs/agents/issue-tracker.md`，对照现在读它的技能可能已经过时。如果某个下游技能开始做出与文档描述不一致的事，重新运行一遍是最省事的修复。

**它写进了 `CLAUDE.md`，但我在用 Codex。**

已知缺口，至今未修。文件选择规则是 "`CLAUDE.md` 存在就改它，否则改 `AGENTS.md`"：它检查的是哪个文件存在，而不是哪个[框架](https://www.aihero.dev/ai-coding-dictionary/harness)在运行。一个残留着 Claude Code 时期 `CLAUDE.md` 的仓库，它的 `## Agent skills` 块会落在一个 Codex 永远不读的地方。流传着两种规避办法：手动把这一块挪到 `AGENTS.md`；或者以 `AGENTS.md` 为准，让 `CLAUDE.md` 只留一行指向它的指针。两个文件都不存在时，技能会问你要创建哪一个，而不是替你拍板——这让期待它直接决定的人感到过困惑。

**它没有创建我的分诊标签。**

它本来就不创建。`docs/agents/triage-labels.md` 是一份*映射*：它告诉 `/triage`，你的追踪器里哪些字符串对应那五个规范角色。它不会运行 `gh label create`。在全新的 GitHub 仓库上，这些标签确实还不存在，这一点被当作 bug 提交过不止一次。两条补充：

- 如果你的追踪器本来就用规范名称，这份映射就是一张恒等表，没有任何要配置的东西。这是有意设计的常规情形，不是漏掉的一步。
- [wayfinder](/engineering/wayfinder) 的 `wayfinder:map` 和 `wayfinder:<type>` 标签同样不在这里创建，而 `gh issue create --label <missing>` 会直接失败，并不会顺手把标签建出来。在 GitHub 仓库上第一次跑 wayfinder 之前，请手动创建它们。

**我能在这里配置其他技能的行为吗（[追问（grilling）](https://www.aihero.dev/ai-coding-dictionary/grilling)的节奏、提问格式、语气）？**

不能。它配置三样东西：追踪器、标签、文档布局。曾有人直接提议把它做成按用户存放偏好的地方，而一贯的答复是技能保持自己的主见："Config is death."（配置即死。）偏好应该以普通指令的形式写进你的 `CLAUDE.md`，每个技能本来就会读它。

**我能把配置放在 `~/.claude` 里，而不是提交到每个仓库吗？**

目前不行。正好有一个开放请求，要的就是这个功能：提请求的人在许多仓库上跑这套技能。用户级模式并不存在，每个仓库都自带一份 `docs/agents/`。

**有一个专门配置其他技能的技能，不奇怪吗？**

一条由来已久的抱怨觉得奇怪，原话是：*"having a skill to set up the other skill does not feel right to me: that means the LLM is configuring its own skills."*（"让一个技能去设置其他技能，我感觉不对劲：这意味着 LLM 在配置它自己的技能。"）这笔取舍真实存在，也被公开承认：不设初始化步骤的替代方案，是把追踪器指令复制进每一个碰工单的技能。它的产出是可检查、可编辑的 markdown，这就是缓解办法：它写的每个文件你都能读、都能手改，日常微调就该这么干，而不是再跑一遍。

## 正常工作的标志

- `docs/agents/issue-tracker.md` 和 `docs/agents/domain.md` 存在；若安装了 `triage`，`triage-labels.md` 也在。
- 你的框架真正会读的那个指令文件里出现了 `## Agent skills` 小节，每个文件各有一行摘要指向它。
- 它提议的追踪器与你实际使用的远程仓库相符，标签字符串与追踪器里真实存在的标签相符。
- 此后 `/to-tickets` 直接发布，不再问你工单放在哪里；`/triage` 打的是既有标签，而不是自己发明。
- 技能文件本身没有任何改动。如果设置过程改了某个 `SKILL.md`，说明出了问题。

## 它在全局中的位置

`setup-matt-pocock-skills` 是工程流程（flow）的**一次性初始化**，是其他一切默认已经就绪的前提，而不是链条上的一环。它的邻居就是它的读者：[triage](/engineering/triage) 使用在这里写下的标签词汇表；[to-spec](/engineering/to-spec) 和 [to-tickets](/engineering/to-tickets) 向在这里登记的追踪器发布；[wayfinder](/engineering/wayfinder) 读取同一份追踪器文件的 "Wayfinding operations" 小节，以了解地图和[子工单](https://www.aihero.dev/ai-coding-dictionary/ticket)如何存放。它记录的领域文档布局，由 [domain-modeling](/engineering/domain-modeling) 在之后填充：它会惰性地创建 `CONTEXT.md` 和架构决策记录（ADR），等一个术语或一项决策真正敲定时才创建，所以设置刚跑完的空仓库就是预期状态。下一步该请出哪个技能，[ask-matt](/engineering/ask-matt) 为整套技能路由。
