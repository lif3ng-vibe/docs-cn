---
title: "triage：工单分诊"
source: "https://www.aihero.dev/skills-triage"
---

## 它做什么

`triage` 逐条处理你项目追踪器上的工单，让每条工单走过一台由**分诊角色（triage role）**组成的小状态机（一个类别角色，加一个状态角色），留下的要么是一份智能体可直接上手的简报（brief），要么一个抛给报告人的具体问题，要么一条带记录原因的已关闭工单。

它只用于**不是你创建的**工单。原始的 bug 报告、涌进来的功能请求、不请自来的外部 pull request：这些从外部落进追踪器的工作，报告人留下什么形状就是什么形状。[to-tickets](/engineering/to-tickets) 产出的[工单](https://www.aihero.dev/ai-coding-dictionary/ticket)天生就是智能体可上手的，对它们跑 `triage` 充其量是浪费。规则很干脆：`/triage` 只面向外来的工单，不面向你自己创建的工单。

它和手工打标签的第二处不同：它先建议、然后等。它会带着理由告诉你它对类别和状态的判断，外加它在代码库里发现的东西，在你下达指令之前不动手应用任何改动。

## 什么时候用它

你输入 `/triage`，然后用平实的语言描述你想要什么，以此调用它；[智能体](https://www.aihero.dev/ai-coding-dictionary/agent)不会自己主动启用。“给我看所有需要我关注的东西”、“我们看看 #42”、“把 #42 移到 ready-for-agent”。

| 你手头是什么 | 该去哪儿 |
| --- | --- |
| 一个塞满他人原始报告的追踪器 | `/triage` |
| 你自己一个粗糙的点子，什么都还没写下 | [grill-with-docs](/engineering/grill-with-docs) |
| 一段已敲定的对话，要变成[规格（spec）](https://www.aihero.dev/ai-coding-dictionary/spec) | [to-spec](/engineering/to-spec) |
| 一份要切成智能体可上手工单的规格 | [to-tickets](/engineering/to-tickets) |
| 一个已确认的 bug，需要的是根因而不是标签 | [diagnosing-bugs](/engineering/diagnosing-bugs) |

## 前置条件

`triage` 读写你的工单追踪器，所以 [setup-matt-pocock-skills](/engineering/setup-matt-pocock-skills) 必须先配置好该追踪器及其标签词汇表。下文的角色名是**规范名（canonical）**；你追踪器里的标签字符串可能不同，而这层映射正是 setup 所提供的。如果你的追踪器已经在精确使用规范名，那就没什么可映射，也没什么可配置。

追踪器配置还决定外部 pull request 是否算一种请求面（request surface），以及谁算外部。这个开关默认关闭，也不再是 setup 的提问项，所以想让 PR 进入范围的话，去 `docs/agents/issue-tracker.md` 里把它打开。

## 状态机

每个分诊过的条目最终都恰好带一个类别角色和一个状态角色。两个类别：`bug`（有东西坏了）和 `enhancement`（新功能或改进）。五个状态：

| 状态 | 含义 |
| --- | --- |
| `needs-triage` | 需要你来评估。未打标签的工单通常先落在这里。 |
| `needs-info` | 等报告人补充。对方回复后回到 `needs-triage`。 |
| `ready-for-agent` | 已完全指明，附带一份智能体简报。[AFK](https://www.aihero.dev/ai-coding-dictionary/afk) 智能体可以接手。 |
| `ready-for-human` | 同样的简报，外加为什么这件事不能委派：判断、外部权限、手工测试。 |
| `wontfix` | 关闭，并记录原因。 |

这就是全部词汇，而“恰好一个状态角色”这条不变量正是让查询保持简单的原因。它也是这个[技能（skill）](https://www.aihero.dev/ai-coding-dictionary/skill)被请求最多的区域：用户们要求过第六个状态，用于已指明但被另一条工单卡住的工作；要求过 `deferred`，用于由未来触发条件把门的推迟工作；还要求过一个终态 `implemented`。这些一个都没发布。见下面的问题。

`wontfix` 分三种走法，区别很要紧，因为其中只有一种会写入知识库：

| 为什么关闭 | 会发生什么 |
| --- | --- |
| 早已实现 | 一条指向它所在之处的评论。不向 `.out-of-scope/` 写任何东西，因为它是已建成的功能而不是被拒绝的功能，归档到那里会污染去重检查。 |
| 被拒绝的 bug | 礼貌地解释，然后关闭。 |
| 被拒绝的功能增强 | 在 `.out-of-scope/` 里留一个文件，从关闭评论链接过去，然后关闭。 |

`.out-of-scope/` 是每个被拒绝的**概念（concept）**一个 markdown 文件，而不是每条工单一个，写法是简短的设计文档而不是一行数据库记录：拒绝了什么、为什么、以及每一条曾提出过这个需求的工单。`triage` 在评估任何东西之前会先读完整个目录，并按概念而不是关键词匹配，所以“夜间主题”能匹配上 `dark-mode.md`。命中时它会翻出旧决定，问你现在的想法是否依旧，而不是把这个请求从头重新吵一遍。

## 先验证，再写简报

在任何[追问（grilling）](https://www.aihero.dev/ai-coding-dictionary/grilling)之前，`triage` 会先核查这个说法是否真的成立。对 bug，它按报告人的步骤复现；对 PR，它检出分支并运行相关测试。然后它报告三种结果中的哪一种：已确认（附代码路径）；复现失败；或者细节不足以尝试——这本身就是最强烈的 `needs-info` 信号。

同一趟里它还对代码库多跑两项检查：**重复（redundancy）**（这是不是早已实现？按领域概念而不是报告人的措辞去搜）和**先前拒绝（prior rejection）**（`.out-of-scope/` 是不是已经说过不了？）。两项都便宜，而且命中时都会产出一个 `wontfix`。

这一切都是为了一件产物的质量：**智能体简报（agent brief）**，即工单进入 `ready-for-agent` 时发布的结构化评论。一旦发布，简报就是契约，原始报告只是背景。简报的写法追求**耐久（durable）**而非精确，因为一条工单可能在 `ready-for-agent` 里一躺几周，底下的代码一直在动。所以它们只点名类型、签名和行为契约，绝不提文件路径或行号。一次确认过的复现，远比一个猜测撑得起更强的简报。

## PR 就是带代码的工单

在追踪器把外部 pull request 视为请求面的地方，PR 走的是同一台机器：同样的类别、同样的状态、同样的迁移。只是这些状态要对着 diff 来读：`ready-for-agent` 表示已附简报、应由智能体在代码上走下一步，`ready-for-human` 表示已准备好由人来合并。PR 上的简报描述的是对现有 diff 还剩什么要做，而不是如何从零构建这东西。

发现（discovery）只浮出*外部* PR，因为协作者进行中的分支不是分诊工作。这个过滤器仅用于发现环节；显式点名一条 PR，无论谁写的都会被分诊。一个毛边：GitHub 模板的外部 PR 列出命令向 `gh pr list` 请求一个 `gh` 并不暴露的 `authorAssociation` 字段，所以这条命令照原样会直接失败（[#468](https://github.com/mattpocock/skills/issues/468)）。

## 常见问题

**我跑了 `/to-spec` 和 `/to-tickets`，现在那些工单挂在那儿没分诊。我要对它们跑 `/triage` 吗？**
不用。它们已经是智能体可上手的了，因为 `to-tickets` 在发布时就会打上 `ready-for-agent` 标签，正是为了让 AFK 运行器不必再过一遍就能接走。遇到这个问题的用户跑了规格流程，看到产出上标着 `needs-triage`，然后发现 AFK 运行器对一切视而不见。`triage` 是外部抵达工作的上匝道；规格流程是你自创工作的车道。两者在 `ready-for-agent` 汇合，不会更早。

**既然有了 `to-spec` → `to-tickets` → `implement` 流程，`triage` 还有意义吗？**
只在你有外来工作时。`triage` 比那条主干更早出现，干的是另一份活：它是别人提交的报告所在的车道。如果你追踪器里的一切都出自你自己的规划，你几乎不会打开它。只要你维护任何公开的东西，或者你的团队朝你提 bug，它就是正门。主要用例是接收外部贡献者工单的开源仓库。

**智能体想打 `ready-for-agent`，`gh` 却说标签不存在。**
已知的未修复 bug（[#616](https://github.com/mattpocock/skills/issues/616)）。`setup-matt-pocock-skills` 把标签词汇表写进 `docs/agents/triage-labels.md`，但不会在你的追踪器里创建这些标签。自己用 `gh label create` 或追踪器的 UI 把五个状态标签和两个类别标签一次性建好，问题就消失。该工单上链接着一个尚未合并的社区修复分支。

**五个状态不够用：blocked、deferred、implemented 呢？**
这是该技能被提交最多的缺口，有三种形态。一条已完全指明、只是在等另一条工单关闭的工单（[#139](https://github.com/mattpocock/skills/issues/139)），提交者的抱怨是 `ready-for-agent` 在这里“技术上成立”却有误导性，于是智能体接手后撞墙。由触发条件把门的未来工作，有意做但还不可行动（[#297](https://github.com/mattpocock/skills/issues/297)）。还有一个“已实现、待验证”的终态——没有它，AFK 运行器可能把已完成的工单重新排队。Matt 已承认 blocked 这种情况是真实存在的，但名字未定（`blocked` 还是 `paused`）。这些都未发布。人们用的变通办法是在类别之外加一个仓库本地的额外标签，让规范状态槽位被一个诚实的东西占着，代价是技能并不知情。一个社区衍生版走得更远，加了 `needs-slicing`、`tracking` 和用力度标签。那能用，但那是他们的，不是技能的。

**它和 `/diagnosing-bugs` 有什么不同？**
这里的验证步骤刻意保持浅层（够回答“这是真的吗、大概住在哪”即可），不是为了找根因。当一个 bug 按报告人的步骤几分钟内复现不出来时，诚实的做法是 `needs-info`；想现在就追，就用 [diagnosing-bugs](/engineering/diagnosing-bugs)。两个技能的文本目前都没提到对方；一位用户发现了这条接缝（seam），至今仍然开着。

**我能把它指向我整个 backlog，让它自己跑吗？**
可以这么要求，但要盯着它读的是什么。“给我看需要关注的”这一趟是廉价的列表，本意是供*挑选*：你挑出一条，它再为挑中的那条收集完整[上下文](https://www.aihero.dev/ai-coding-dictionary/context)。一次对二十条工单跑过去，智能体可能悄悄退回到那份廉价列表当作证据基础，而列表只返回工单正文，不含评论。有用户恰好踩中这个：三条工单已带着“已修复，建议关闭”的评论，结果三条全都拿到了崭新的智能体简报。想要批量过一遍的话，明确说每条工单都必须读评论。

**它支持 Linear 或 GitHub Issues 之外的追踪器吗？**
支持。追踪器是配置项，不是写死的假设，有人在 Linear（通过 `linear` CLI）、GitLab 和 `.scratch/` 下的纯 markdown 文件上运行它。常见拆分是 Linear 管工单和规划、GitHub 管代码和 PR：说“工单追踪器”的技能映射到 Linear，说“PR”的技能映射到 GitHub。本地 markdown 追踪器上有一个未修复的模板 bug：生成的文件可能把验收标准带两遍，一遍在顶层、一遍在智能体简报里（[#200](https://github.com/mattpocock/skills/issues/200)）。

## 正常工作的标志

- 它碰过的每个条目最终都恰好带一个类别角色和一个状态角色，从不为零，也从无两个互相冲突的状态。
- 它给出带理由的建议然后停下，而不是改完标签继续走。
- 在任何东西进入 `ready-for-agent` 之前，bug 已被复现，或 PR 已被检出并运行。
- 它写的简报只点名类型和行为，不含文件路径、不含行号。
- 六个月前被拒绝的请求再次出现时，它会点明此事并引用旧理由，而不是从头分诊一遍。
- 它发布的每条评论都以 `> *This was generated by AI during triage.*` 开头。

## 它在整个流程中的位置

`triage` 是一条**上匝道（on-ramp）**，不是主链上的一环。主流程从你自己的点子出发（追问、规格、工单、实现、评审），而 `triage` 是为不请自来的工作准备的平行车道。它在同一个地方汇入：一条标着 `ready-for-agent`、带简报的工单，[implement](/engineering/implement) 接起它的方式和接 [to-tickets](/engineering/to-tickets) 的工单一模一样。当一个请求需要先磨尖才能写简报时，`triage` 把 [grilling](/productivity/grilling) 和 [domain-modeling](/engineering/domain-modeling) 一起跑，一次一轮问题，好让决定在做出的同时落进 `CONTEXT.md` 和 ADR。不确定自己在哪条车道时，[ask-matt](/engineering/ask-matt) 为你导航。
