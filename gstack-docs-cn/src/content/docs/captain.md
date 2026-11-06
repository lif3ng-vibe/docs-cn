---
title: "在 Capy 上用 gstack 运行 Captain 编队"
---


本页面向想让一个协调 agent（Capy Captain，或任何控制器 agent）带许多工作线程跑同一个仓库、以 gstack 为工程工作流的团队。它覆盖 Drive 布局、编队规则文件、READY 契约、合并列车、审批、摘要与每日不稳定修复。在运行时把同一套模型教给控制器的技能是 [`/captain`](/skills/#captain)（也叫 `/crew`）；Captain 之下某条线程的车道侧规则在 [`capy/skill/gstack/captain.md`](https://github.com/garrytan/gstack/blob/main/capy/skill/gstack/captain.md) 与 [capy-install.md](https://github.com/garrytan/gstack/blob/main/docs/capy-install.md#working-under-a-captain)。下文点名的每个文件在 [`captain/templates/`](https://github.com/garrytan/gstack/tree/main/captain/templates/) 有可拷贝模板。一个所有者的编队如何日复一日运行它、带实测数字的故事，读 [capy/README.md](/capy/)。每个 Capy 会话还会读 [`capy/skill/gstack/factory.md`](https://github.com/garrytan/gstack/blob/main/capy/skill/gstack/factory.md)——这些实践的一页摘要，带指向规则的指针。

## 一段话的模型

车道在各自的分支与机器上构建。车道的职责止于一个**不打戳的 READY**：`gstack-ship-queue ready` 打印的块，加上完整 head SHA、筛查选择与不稳定用例。控制器校验该块，把 READY 钉定攒成**合并列车**，在列车 head 上读一次完整门禁，然后逐槽合并：叫号槽位、车道在叫号时打版本戳、控制器核验树、以期望 head 合并、再核验。红车按红用例二分，至多重build 一次。所有者的每个决定经控制器以固定形态传递，并以所有者原话记录。不稳定记入台账、由每日修复处理；任何东西不重试到变绿。

## 角色

- **所有者**决定只有所有者能决定的：产品与行为、超上限的支出、仓库之外发布的任何东西、阈值与预算、关闭一个贡献、任何破坏性操作。每个回答以所有者原话记录。
- **控制器**（Captain）运营编队：在不相交的文件上开车道、保管规则文件、摘要与笔记、校验 READY、构建并合并列车、叫号槽位、以三种形态向所有者中继请示、跑不稳定修复、并决定一切不需要权限、凭据、超上限支出或引用审批的事。它只归档自己编队的线程、每个都等到它为该线程写的计划说工作完成；它知道每条线程的下一步，所以没有别人归档它们。不属于任何编队的线程归所有者、保持原样：没有 Captain 归档它、标记它或把它列入待归档，除非所有者要求——哪怕创建它的是 Captain 自己的自动化。
- **车道**（编队线程）拥有点名的文件、在自己的分支与机器上构建、跑 /ship、发一个 READY 块、在叫号时打戳（只作为那次打戳提交的一部分、或当控制器点名真实代码冲突时才把基础分支合进钉定）、写一份报告、绝不合并 PR。
- **控制器绝不向车道的分支提交**，车道绝不推送到别的车道。每棵共享树一个提交者。

## Drive 布局

Captain 的 drive 以读写挂载到每条编队线程，所以它是交接面。保持小而可预期：

| 路径 | 谁写 | 放什么 |
|---|---|---|
| `AGENTS.md` | 控制器 | 常设规则与所有者的决定，各带日期与原话（[模板](https://github.com/garrytan/gstack/blob/main/captain/templates/AGENTS.md)） |
| `CREW.md` | 控制器 | 车道契约（[模板](https://github.com/garrytan/gstack/blob/main/captain/templates/CREW.md)） |
| `DIGEST.md` | 控制器 | Needs you / New / In progress，每轮重写（[模板](https://github.com/garrytan/gstack/blob/main/captain/templates/DIGEST.md)） |
| `NOTES.md` | 控制器 | 摘要推导自的、只追加的时间戳日志（[模板](https://github.com/garrytan/gstack/blob/main/captain/templates/NOTES.md)） |
| `skills/<name>/SKILL.md` | 控制器 | 车道加载的编队流程（runbook） |
| `reports/<code>.md` | 每条车道一次 | Outcome 及其 Unverified 行、PR、Needs、Cost、Lesson、Approvals（[模板](https://github.com/garrytan/gstack/blob/main/captain/templates/report.md)） |
| `reports/postmortem-<n>.md` | 控制器，或它点名的车道 | 一个被回退或 S1 修复的已合并 PR 为何通过了每个评审者（[模板](https://github.com/garrytan/gstack/blob/main/captain/templates/postmortem.md)） |
| `handoffs/` | 车道 | 下一条车道需要的数据集与规格；`handoffs/flaky-ledger.md` 是不稳定台账（[模板](https://github.com/garrytan/gstack/blob/main/captain/templates/flaky-ledger.md)） |
| `plans/` | 控制器 | 已批准的计划，带其 Approvals 表 |

drive 根（`AGENTS.md`、`CREW.md`）里的范围指令对编队每条线程生效，写在里面的规则无需转发。

Capy 上 `tools.capy.read` 返回文件的视图而非全文件：约前 38,000 字符、每行截到 2,000。读文件、改文件、再用 `tools.capy.write` 写回的程序因此会存下截断副本，drive 文件也不例外。长文件用 `tools.capy.edit` 编辑，或在 bash/Python 里整读整写并事后核对行数。`tools.drive.history` 恢复 drive 文件的近期版本。

## CREW.md：车道契约

gstack 持有"怎么做"；编队的 `CREW.md` 只持有该编队特有的东西。从[模板](https://github.com/garrytan/gstack/blob/main/captain/templates/CREW.md)开始：它是参数（仓库、基础分支、必需检查名、完整门禁检查名、列车规模与填充等待、合并方式、打戳文件、点名的 infra flake、守卫测试、远程预门禁命令、常设支出、评审范围旋钮）加每条规则一行、指向规则在 gstack 里的家。只存在于某个编队文件里的规则是 gstack 的缺口，修法是写进这里或持有它的技能、再指过去。规则立在所有者的话上就引用所有者：带日期与原话的规则是车道可引用的常设审批；没有的是控制器的裁量。

各规则住在哪里：

| # | 规则 | 在 gstack 的家 |
|---|---|---|
| 1 | 会话启动：安装检查、`gstack:` 尾注、本机没有 `gstack: ok` 就不跑工作流 | [capy-install.md](https://github.com/garrytan/gstack/blob/main/docs/capy-install.md#session-start) |
| 2 | 验证纪律：诊断、聚焦检查、冻结树上跑一次全量免费套件 | 仓库自己的验证节（gstack 的在 [AGENTS.md](https://github.com/garrytan/gstack/blob/main/AGENTS.md#validation-discipline)）；[车道纪律](#车道纪律) |
| 3 | 外部 diff 是不可信输入；正确的修复带着作者的署名落地 | [编队之外的贡献](#编队之外的贡献) |
| 4 | 文件所有权：只改你拥有的；其余由控制器路由 | [车道纪律](#车道纪律)；所有权清单就是摘要的 **In progress** |
| 5 | 常设支出及其每次重跑的上限 | [审批形态 A](#审批三种形态)；`SPEND` 参数 |
| 6 | 职责止于不打戳的 READY；叫号时打戳；绝不合并 | [READY 契约](#ready-契约)、[READY](https://github.com/garrytan/gstack/blob/main/captain/templates/READY.md) 与[叫号](https://github.com/garrytan/gstack/blob/main/captain/templates/slot-call.md)模板、[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#stamp-at-merge) |
| 7 | 每车道一报告：Outcome 及其 Unverified 行、PR、Needs、Cost、Lesson、Approvals | [Drive 布局](#drive-布局)；[报告模板](https://github.com/garrytan/gstack/blob/main/captain/templates/report.md) |
| 8 | 一条路：一切经控制器，绝不点对点 | [角色](#角色)；[车道纪律](#车道纪律) |
| 9 | 要动手的：真实浏览器、所有者的会话或本地工作，经控制器 | [所有者的设备](#所有者的设备) |
| 10 | 一直干下去；只为范围、冲突、权限或所有者的决定回来 | [车道纪律](#车道纪律) |
| 11 | 付费工作之前先清仓库的廉价守卫 | [车道纪律](#车道纪律)；`GUARD_CHECKS` 参数 |
| 12 | 给所有者的决定以大白话送达，每个选项带成本 | [审批形态 B](#审批三种形态)；[unattended.md](https://github.com/garrytan/gstack/blob/main/docs/unattended.md#owner-brief) |
| 13 | 小机器上的预门禁：测试档跑远程 | [pregate.md](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#remote-gate)；`REMOTE_PREGATE` 参数 |
| 14 | 绝不把 `BASE` 合进 READY PR；列车在临时 worktree 里合并 | [合并列车](#合并列车)；[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#run-a-merge-train) |
| 15 | READY 之前在 `## [Unreleased]` 下写 CHANGELOG 条目；打戳只碰 `STAMP_FILES` | [ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#stamp-at-merge)；[READY 契约](#ready-契约) |
| 16 | 不稳定重跑：一次、同树、记录；两次是真的 | [TESTING_INTERNALS.md](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#flaky-reruns)（门禁侧）；[每日不稳定修复](#每日不稳定修复)（车道侧与台账） |
| 17 | 新文件遵循仓库对入口、隔离与布局的惯例 | 仓库自己的 `AGENTS.md`（`REPO_CONVENTIONS` 参数点名该节） |
| 18 | 移植贡献者 PR：先评审并测试移植 head；保留其提交 | [编队之外的贡献](#编队之外的贡献) |
| 19 | 仅 CHANGELOG 的冲突由列车解决，不归车道 | 并入 14：[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#ship-before-ready)（"打戳保留钉定的回执"） |
| 20 | 契约变更之前的 READY 需要新回执 | [READY 契约](#ready-契约) |
| 21 | 审批、规划请示与合并请示，三种形态 | [审批](#审批三种形态)；[capy/skill/gstack/captain.md](https://github.com/garrytan/gstack/blob/main/capy/skill/gstack/captain.md) |
| 22 | 每个 READY 前先 /ship；块带 `SHIP_RECEIPT`；打戳提交只含工具输出 | [ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#ship-before-ready)；[车道的 /ship 序列](#车道的-ship-序列ready-之前) |
| 23 | 评审循环收敛：第 1 轮后范围冻结、后轮只评增量、有轮数上限、有阻断底线 | `/ship` 与 `/review` 技能自身的收敛策略（[skills.md](/skills/#ship)）；编队一行点名、只设范围旋钮（`REVIEW_SCOPE`） |
| 24 | 先规划再建造：按规模跑 `/autoplan` 是建造车道的第一个动作；规划请示向上走，所有者的话进入运行并报告 `APPROVED` 后才开工 | [先规划再建造](#先规划再建造)；[简报模板](https://github.com/garrytan/gstack/blob/main/captain/templates/brief.md) |

## 车道纪律

车道遵循仓库自己的验证纪律（gstack 的在其 AGENTS.md 的 [Validation discipline](https://github.com/garrytan/gstack/blob/main/AGENTS.md#validation-discipline) 节）：先诊断再修复、修复期间用聚焦检查、最后在冻结树上跑一次全量免费套件——机器小时跑远程运行器（[pregate.md](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#remote-gate)）。任何付费运行之前，先清仓库的廉价守卫（生成内容新鲜度、体积与 prompt 预算、凭据扫描；编队用 `GUARD_CHECKS` 点名），因为倒在免费检查上的付费门禁是白花的钱。

车道只改分给它的文件。控制器把所有权清单放在摘要的 **In progress**；需要别的在役车道文件的车道告诉控制器、由它路由，自己绝不改。一切经控制器穿越编队（跨线程问题、所有权冲突、新范围、交接），绝不点对点，所以一个地方持有全部状态。

车道绝不停下来问要不要继续。它为新范围、与另一所有者的冲突、缺失权限、或属于所有者的决定回来，且每个决定都带每个选项的大白话解释：是什么、为什么要紧、每个回答做什么、花多少。光一个门禁码或工具结果行不是请示。

## 新线程加入编队

编队线程绝不自己创建线程。它请求自己的 Captain，由 Captain 创建线程——线程从一开始就在编队里：Captain 给它简报、读它的报告、在它工作完成时归档它。编队线程已经创建了线程时，在同一轮把新线程代号报给自己的 Captain，Captain 把它加进编队（Capy 上 `crew.add`）。

另一个项目的线程走 Captain 对 Captain，因为 `crew.add` 拒绝别的项目的线程、Captain 只在自己的项目里创建线程。编队线程请求自己的 Captain，Captain 请求那个项目的 Captain 创建并持有线程，结果原路返回。对接手的 Captain，那个请求就是工作：它在自己的编队里创建线程、简报、返回结果。只有别的项目没有 Captain 时，编队线程才自己创建，且把新线程代号记到工作的 issue 上以便还能找到。编队线程已在别的项目创建的线程走同一条路：把代号报给自己的 Captain，Captain 请那个项目的 Captain 收养线程，代号记到工作的 issue。

为什么：一条编队线程曾直接在别的项目创建了线程。那条线程在所有编队之外运行，没有 Captain 简报它、追踪它或能归档它。

## 保持 issue 整洁

issue 展示编队真正在做什么，所以保持它们真实：

- 归档线程之前，关闭或移入 Backlog 每个分给它的 issue。
- 每次醒来，让你碰过的每个 issue 保持准确：状态、负责人与链接。
- 没人会开工的未分派 Todo 进 Backlog。
- 每日清扫关闭、改派或 Backlog 化任何 Backlog 之外满足以下条件的开放 issue：2 天没人碰、且负责人已归档或闲置无开放 PR。
- 清扫跳过分派给真人的 issue（比如等所有者的请示）与点名了自己在等什么的 Waiting issue（以 blocked-by 链接或带日期的评论），只要那还在开放。

目标：Overview 的 In progress 数约等于在干活的线程数加等待合并的 PR 数。

## 先规划再建造

要造东西的车道先规划。它在会话启动安装检查后的第一个动作、任何产品代码之前，是按其简报、按工作规模跑一次 `/autoplan`。完整运行的阶段按序进行——CEO、设计、DX、工程，设计与 DX 只在范围涉及时。bug 修复不评审规划，功能走精简运行（两者见下）。Capy 上无人值守循环是 gstack 检出里的 `autoplan/DRIVER.md`。车道中途接下的新功能、简报没点名的范围，先有自己的规划与请示再动工。规则文件里这是[模板](https://github.com/garrytan/gstack/blob/main/captain/templates/CREW.md)的第 24 条；自己的规则先占了 24 的编队，按名引用本节。

**车道发什么**。规划与门禁，以项目外的人也能懂的大白话：改什么、为什么是现在、这个变更做什么、花多少、车道的选择、以及字母请示行的选项（[请示格式](#请示格式)）。`gstack-owner-brief render --captain --out <run dir>` 从计划的 `## ELI5`、`## Before → after`、`## Why it matters`、`## What caused this work`、`## Big decisions` 小节打印它（也存作 `gate.json` 的 `eli5`，`gstack-gate render` 因此以它们开场），带成本行（`GATE_SPEND:`、`GATE_REC_COST:`）与给控制器的最后一行；缺小节的计划以 `CAPTAIN_BRIEF_INCOMPLETE` 退出，车道补上小节再渲染（[capy/skill/gstack/captain.md](https://github.com/garrytan/gstack/blob/main/capy/skill/gstack/captain.md) § 3 列出它们）。车道把它整个作为 needs-you 报告发出，先什么都不建。

**控制器中继什么**。按下方形态 B 给所有者一次请示，选项用[请示格式](#请示格式)："do it"（每条推荐、含计划变更、全范围、含后续）是默认，点名的选项如 "A2" 改选那一项。初次写就的计划绝不做默认。

**建造门禁**。车道只在所有者的话经控制器返回并回答进运行（`gstack-autoplan answer --out <run dir> --gate-rev <n> --reply <tokens> --by agent:<thread> --owner-reply "<原话>"`）、每条被接受的计划变更已并入（`revise`）、每个重开阶段已完结、且运行报告 `APPROVED`（`export` 之后 `status=complete`）之后开工。仍打印 `PLAN_AMEND_PENDING` 或 `REOPENED:` 的已答门禁不是完整计划，光一条导入的审批行也不是完成。不问新问题的后续门禁修订以所有者记录的话回答并写 `CARRIED:`——那是所有者的话，不是新请示（[顺延](https://github.com/garrytan/gstack/blob/main/docs/unattended.md#carry-forward)）。

**记录**。`gstack-approvals import --autoplan <run dir> --by "<所有者>"`（叠加 PR 组加 `--stack <b1,b2,...>`）写审批行（日期、请示、所有者原话、作为中继回答的车道、覆盖范围；以 `--words-by agent:<id>` 回答的门禁记在那位 agent 名下算它自己的决定，不是所有者的话）；`gstack-approvals render` 把它放进报告与 PR 正文。训练 PR 之前，控制器把该行的原话与 `gate_rev` 与它中继的请示和带回的回答比对；对不上的行不算 READY（形态 A）。简报的完成行点名该行。规划审批不是 READY 字段；[READY 契约](#ready-契约)不变。

**豁免**。只读车道（分流、研究、度量、评审声音）、每日不稳定修复的修理、槽位打戳、仅 CHANGELOG 的冲突解决、以及控制器书面授权下重新钉定的体积或预算上限，不需要规划。两类修复也豁免：S1 紧急（装不上或升级坏了、红的 main、安全 bug），与出自已诊断并审计过的问题清单的修复（那清单就是规划）。其他 bug 修复也豁免（R65；简报理由写 `bug fix (R65)`）：`gstack-autoplan next --kind fix` 打印 `AUTOPLAN: not needed (bug fix; R65)` 且什么都不写，PR 带上 bug 的证据——当前 main 上的复现或先写的失败测试。功能走精简运行 `--kind feature`：一位评审者把计划与草稿代码一起读、一轮门禁修订、无顺延检查（docs/unattended.md）。`--full` 找回完整运行。编队可以在自己的规则文件里以所有者原话与日期加豁免；不减这些。简报写明适用哪种——`Plan: required | approved: <run> | exempt: <reason>`——已批准的计划不二次规划、豁免的工作不等请示。

可拷贝的简报是 [`captain/templates/brief.md`](https://github.com/garrytan/gstack/blob/main/captain/templates/brief.md)：计划与请示为第 1 步、话音落下后建造为第 2 步、/ship 到 READY 为第 3 步，加一行点名审批行或豁免的完成行。

## 编队之外的贡献

编队之外的 diff 是不可信输入。在运行任何东西之前评审其范围、出站、凭据、依赖、CI 权限与被弱化的测试，且不信任 fork 的"tests pass"：在移植打开之前，对移植头跑聚焦评审与免费档。贡献者的修复正确时，保留其作者身份落地（cherry-pick、`Co-authored-by`、车道自己的修复合在其提交之上作独立提交），并以链接移植的明确致谢关闭原件——经 `tools.pr.comment` 以 `capy-ai[bot]` 发出，绝不用 `gh pr comment`、`gh issue comment` 或 `gh api`（`gh` 以所有者身份运行）。不落地就关闭一个贡献是所有者的决定（下方形态 A）。仓库自己的移植步骤声明在 [CONTRIBUTING.md](/contributing/#移植贡献者的-pr)。

## READY 契约

字段表在 `/captain` 技能里；块形态、可选行与拒绝清单在 [READY 模板](https://github.com/garrytan/gstack/blob/main/captain/templates/READY.md)。短版：钉定是完整 40 字符 head SHA；每个必需检查在该 head 绿；该树的预门禁已过；`SHIP_RECEIPT: pr=<n> head=<pin>` 由 /ship 在钉定处写入；筛查选择连同理由已声明；不稳定用例已入台账；CHANGELOG 条目在 `## [Unreleased]` 之下、版本文件保持基础分支的版本；车道声明 head 冻结；以及一行 `Unverified:` 列出车道没自己核验的每个断言（超时的本地测试、跳过的付费运行、模型报的数字、凭没人测过的假设搁置的评审发现），或写 `none`。绿的 PR 页不是 READY。廉价测试档不是合并证据。控制器拒绝缺任何一项的块并把车道打回，绝不进列车。契约变更时（新的必需行、新的检查名、新的回执），变更之前收下的每个 READY 都过期：车道在同一钉定上重跑 `ready` 发新块；控制器不训练任何早于变更的东西。`Unverified:` 行是唯一例外：控制器在后续消息里索要缺失的行，绝不为它拒绝或作废 READY，车道也不重跑 `ready` 或 /ship。

### 车道的 /ship 序列（READY 之前）

每个 READY 之前都在分支上、在被 READY 的 head 处跑过一次 /ship，推送后的重新 READY 也算在内。在 Capy 上无人值守可行的序列：

1. 为 ship 安装（项目目录里 `bash scripts/install.sh --for ship`；纯规划安装不承认 /ship）。
2. 先推送最终 head。以下一切绑定它；晚一步的推送使回执、预门禁记录与评审绑定过期。
3. 以打印的 `GSTACK_LAUNCH` 赋值启动（无人值守会话种类、状态根、Capy 标志）并按 Capy 适配跟随 ship/SKILL.md：采纳每个推荐选项、把同意与门禁留成 pending、绝不在运行里推送或合并。
4. 在静止的树上跑预门禁：preflight，然后小机器时把测试档跑在远程运行器上；用本 head 自己的绿色 CI 运行 URL 清 macOS 与 Windows 车道。之后绝不裸跑预门禁（它会重置 regen 检查）。
5. 评审：铸造令牌，两轮只读跑完并收尾，评审日志绑定当前树。
6. 文档审计：只读快照文档候选并记录审定的小节。
7. 正文与回执：组 PR 正文（Capy 上 Approvals 放最前的 What changed、Why、Blast radius），把 ship 回执写进去，发正文与标题。
8. 终端行：`gstack-ship-receipt result --pr <n>` 打印 `GSTACK_RESULT: skill=ship status=complete`。`SHIP_PAUSED: base-red …` 配 `status=incomplete` 表示第 5 步证明了失败属于基础分支（[base_red](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#base-red)）：车道在等待，不是失败。它把 `gstack-base-red wait --pause <file>` 注册为后台操作、告诉控制器哪些用例拖住它，`BASE_GREEN` 时跑 `/ship --resume <record>`；条件回执上不发 READY，除非在带 `gates` 的列车上（[面向其他仓库的合并列车](#面向其他仓库的合并列车)）。
9. READY：`gstack-ship-queue ready --pr <n> --pregate <pregate.json> --screen|--no-screen`；把打印的块发出。
10. 叫号之后，打戳提交保留钉定的回执；以同一回执重新 READY，不跑第二次 /ship。

/ship 跑在子 agent 里时，父会话在子 agent 一开 PR 就订阅它的检查与评审通知，并只在订阅就位且 READY 到达后停掉 /ship 子 agent。从此父会话拥有该 PR：红检查、人工评审、第 10 步的槽位打戳与重新 READY、以及任何回执携带。它自己做这些，或以显式指令发给子 agent。Capy 上的机制在 [gstack 技能](https://github.com/garrytan/gstack/blob/main/capy/skill/gstack/SKILL.md#plan-approve-ship)里。

被评审的分支下基础分支动了，就合进来；绝不 rebase。产品 diff 不变的合并经 `gstack-ship-receipt carry` 携带回执（HEAD 上预门禁、不重跑评审），决议改了产品代码的合并需要全新 /ship。rebase 只在回执已覆盖且产品 diff 相同的树上携带；其他任何 rebase 是完整 /ship（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#receipt-carry)）。控制器绝不要求车道 rebase 已评审的分支。

## 直接落地（`merge: direct`）

基础策略设 `"merge": "direct"` 时，没有列车、叫号或打戳提交。每个 PR 在自己绿色的 head 合并，版本在发布时设定（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#land-direct)）：

1. 车道：/ship，然后在钉定 head 上 `gstack-ship-queue ready --pr <n> --no-screen`，再带该钉定向 Captain 发 READY。PR 带 `changelog.d` 片段，不碰 VERSION、`package.json` 版本与 CHANGELOG.md。
2. Captain：`gstack-ship-queue land --pr <n> --pin <sha>`（基础策略列了 `land.merged_checks` 时加 `--allow-repo-commands`，让陈旧基础能跑它们）。它以 `--match-head-commit` 合并、检查 main 的树、写落地记录。
3. 发布：每次稳定切版前（周一与周四 14:00 UTC），Captain 跑 `gstack-release-stamp open`、等发布 PR 的检查、然后 `gstack-ship-queue land --pr <n> --pin <head>` 落地它（`release/<version>` head 不需要 /ship 回执或 READY 说明）。切版随后给新版本打标（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#release-stamp)）。

各拒绝的处理（除非代码另有说明，什么都没合并）：

| 码 | 谁行动 | 动作 |
|---|---|---|
| `QUEUE_LAND_STAMPED` | 车道 | 跑打印的 `git checkout $(git merge-base origin/main HEAD) -- …`，保留片段，提交，再 /ship 与 `ready` |
| `QUEUE_LAND_PIN_MOVED` | 车道 | 在新 head 上 /ship 与 `ready`，新 READY |
| `QUEUE_RECEIPT_MISSING` / `QUEUE_RECEIPT_STALE` | 车道 | 在钉定上 /ship |
| `QUEUE_NOT_READY` | 车道或 Captain | 无 READY 说明：在钉定上 `ready --pr <n> --no-screen`；`merge: train`：走列车；已关闭或改目标的 PR：照点名办 |
| `QUEUE_LAND_CHECKS` | Captain 后车道 | pending：`gstack-pr-wait <n> --until green` 后重跑；红：打回车道（不稳定用例按规则 16 重跑）；缺：在分支上分发该工作流 |
| `QUEUE_LAND_MERGED_CHECKS` | 车道 | 某条 `land.merged_checks` 命令在钉定合到 main 上失败：车道合 main（规则 19）、修好、/ship、`ready`、新 READY |
| `QUEUE_LAND_NOT_CLEAN` | 车道或 Captain | `CONFLICTING`、或陈旧基础上钉定与 main 尖端冲突：车道合 main（规则 19）、/ship、`ready`；`UNKNOWN`：一分钟后重跑 |
| `QUEUE_TRAIN_FROZEN` / `QUEUE_LAND_LOCKED` | Captain | 先完成修复或持有者 |
| `QUEUE_TRAIN_UNTRUSTED` | Captain | fork head；在编队分支上重写 |
| `QUEUE_LAND_UNVERIFIED` | Captain | 已合并，但 main 不是其父上的钉定、或落地后 main 移动且 `land.merged_checks` 在落地树上失败或缺席：回退杂散变更或前向修复，并上报 |
| `RELEASE_STAMP_INVALID` | Captain | `release/<version>` head 超出其打戳：关掉它，再 `gstack-release-stamp open` |
| `RELEASE_STAMP_EMPTY` | Captain | 上次发布以来没有片段落地：无可发布 |

## 合并列车

仓库 `.gstack/ship-policy.json` 带 `train` 块时，gstack 的队列工具驾驶列车（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#run-a-merge-train)）。控制器的循环，每列：

1. `train build --prs <pins> --dry-run`，然后去掉 `--dry-run`：记录、列车分支、免费测试、一次完整门禁。
2. `train verdict`：GREEN（运行内重跑让用例转绿时带 `FLAKY N`）、RED（失败两次的用例）、或 INCOMPLETE（绝不算绿）。
3. 逐槽按序：向车道发[叫号](https://github.com/garrytan/gstack/blob/main/captain/templates/slot-call.md)；车道只打戳并推送基础合并与打戳文件；`verify --train`；`gh pr merge --match-head-commit`；再 `verify --train`。
4. 每槽合并后 `train prune`。

`changelog_fragments` 之下（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#train-land)）车道带片段（`changelog.d/<slug>.md`）而非 `[Unreleased]` 小节 READY，没有叫号也没有车道打戳，第 3 步每槽一条命令：`train land --train <nonce> --pr <n>` 在 [pin, main] 上提交打戳前缀 S_i、推送、等检查、合并并确认 main 恰为 S_i。列车之外，`gstack-ship-queue land --pr <n>` 是单 PR 的同一步（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#land)）。

红车：`train bisect` 在每个前缀上对红用例二分。被归因的 PR 离车回车道；基础分支自身红则经一次单 PR 紧急列车前向修复（或队列冻结时 `train build --repair`，它拒绝 `--urgent`）；全前缀绿换来恰好一次不变的重建；其余进修复车道。纯 INFRA 清点补一次分发。基础分支的每次推送都有后盾门禁，发现无绿车覆盖的树即冻结队列；以其确切 head 的一个修复 PR 清冻结。带 `release_gate` 块的策略把逐推送后盾换成每 8 小时 main 上一次完整门禁，其红裁决扣住稳定发布而不是冻结队列（[ship-policy.md#release-gate](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#release-gate)）。

**队列长时用波次 PR**。每个槽位各自付打戳、各自一轮必需检查、各自一个版本，一个接一个。READY 超过 6 个 PR 时，`gstack-ship-queue wave plan` 打印 `WAVE_ADVISED` 与 3–6 个的建议分区组（`train build` 收到超过 6 个钉定时也打印同一行）。控制器请每组最大 PR 的所有者整合：`wave build` 以全部成员原样合并造出波次分支，整合者跑一次 /ship 并 READY 波次 PR——它占一个槽、拿一个版本。成员 head 一旦入组即冻结；修复经整合者，必须改动的成员被剔除（`wave build --wave <nonce> --drop <pr>`）并打回其所有者。波次落地后，`wave settle` 带链接逐个关闭成员。队列持续长时，新工作以分区波次开始。完整流程在 [ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#wave-prs)。

**槽 2 及以后**。基础分支已带前面槽位的打戳，裸钉定上打戳会让 PR 在 CHANGELOG 上冲突。车道先把基础分支合进钉定（预期仅 CHANGELOG 冲突；用 `lib/changelog-check.ts` 的 `mergeChangelogs`、即 [ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#run-a-merge-train) 里的 `bun -e` 单行解决，绝不手工，打戳前 grep 冲突标记），再重打戳（重打戳会暂存它写的打戳文件，所以 `--no-commit` 合并后一个普通 `git commit` 就保留它们），再只提交合并与打戳文件。实践中钉定取下之后基础分支动过的话，槽 1 也要同样的合并。多一个字节的打戳提交为它身后每条车道冻结队列。

槽位打戳是基础分支合并、`mergeChangelogs`、加叫号点名的打戳文件（CREW.md 的 `STAMP_FILES`；gstack 的是 `CHANGELOG.md`、`VERSION`、`package.json` 与 `agents-digest/gstack-AGENTS.md`，外加 PR 引入的带 `*_KEY_VERSION` 的文件——叫号点名时重打戳把它挪到 PR 自己的行上），绝无第五个：重打戳列出而叫号没点名的文件不是打戳，车道把它留着不提交并在 READY 里说明。重打戳自身绝不挪动钉定分叉点之后基础分支新增的行，无论基础合并已提交还是暂存。叠在某个已 squash 合并 PR 上的钉定，在父 squash 碰过钉定行数的地方冲突超出 CHANGELOG，所以车道对那些文件取钉定的字节（`verify` 对照 T<i> 核树，它已带父级），`mergeChangelogs` 把钉定对父级现已发布条目的编辑作为门禁完整性修正带进钉定自己的条目。合并后的 `verify` 以合并前同一规则判 CHANGELOG，所以被接受的 head 绝不在其合并之后冻结队列（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#run-a-merge-train)）。

控制器写进 CREW.md 而不是继承的选项：squash 对合并提交；车道打戳对控制器打戳；gate-ahead（槽 i+1 在 i 合并时于 i 的 head 上过门禁）；严重竞速（多条严重车道同时被告知下一次紧急列车归先完成 READY 的；已建列车内的槽位绝不竞速）；READY 是否也带门禁运行 id 与树哈希。

### 面向其他仓库的合并列车

没有 gstack 评测工作流的仓库在其列车块里声明 `gates`（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#train-gates)）：自己的 CI 工作流、Ubicloud VM 上的测试命令，或两者。每个前缀都被门禁，所以红车点名元凶无需二分、无需重建。要开启：在检出里跑 `train init`、经 PR 把打印的块（与工作流片段）提交到基础分支，然后跑 `train doctor` 直到零发现。

控制器的循环缩短为 `train build --prs <pins>`，然后 `train watch --train <nonce> --land`——它等每个前缀运行、读裁决、按序落地每个可落地槽位。车道以 `ready --pr <n> --no-screen` READY；没有筛查也没有叫号。/ship 在红基础上暂停的车道带 `--base-red --fixer <pr>` READY，其修复者带 `--fixes-base-red <cases>`，列车把修复者安排在槽 1。`train land` 推到 PR 分支的 `update` 提交（[pin, main] 上的被门禁树）是 CREW 规则 14"绝不把基础分支合进 PR"的唯一例外：它是工具制造、推送前已记录、在钉定租约下推送——与打戳列车的打戳提交一样。采纳这套的兄弟编队从 [captain/templates/merge-train-peer.md](https://github.com/garrytan/gstack/blob/main/captain/templates/merge-train-peer.md) 开始。

## 审批：三种形态

**A. 记录**。每条车道在报告与 PR 正文里保留 `## Approvals` 表，由 `gstack-approvals render` 渲染：日期、问了什么、所有者原话、谁中继、答案覆盖什么、什么在等。常设审批引用其规则；产品或行为决定、超上限支出、仓库之外发布、阈值/预算/试验次数/用例类别变更、不落地就关闭贡献、以及任何破坏性操作，永远要新请示。常设支出是最常见的常设审批：CREW.md 的 `SPEND` 以所有者日期与原话点名预批准了什么（列车门禁、筛查、二分、后盾、聚焦付费用例）及每次重跑上限；超上限即新请示。

**B. 规划请示**（[模板](https://github.com/garrytan/gstack/blob/main/captain/templates/plan-ask.md)）：前后对比、为什么要紧、什么引出了这项工作、大决定、以及下方请示格式的"需要你做什么"，以 "do it" 收口——全范围采纳每条推荐。`gstack-owner-brief render --captain --captain-name "<Captain 名>"` 从 autoplan 运行打印它。

**C. 合并请示**（[模板](https://github.com/garrytan/gstack/blob/main/captain/templates/merge-ask.md)）：带配图的前后对比、为什么、爆炸半径、Approvals 表与证据。Capy 上 /ship 以此形态写 PR 正文；控制器的合并报告内嵌关键配图。

## 请示格式

给所有者的每个请示——从规划门禁到合并问题到摘要——都写成五岁孩子也能懂：Captain 名，然后每个决定一行带字母，字母全表唯一。

```text
<Captain name>
- A: <code> hit problem <p>, which happens when <h>. We could fix it in these ways: 1) <x>; 2) <y>; 3) <z>. Recommendation: <x> because <why>. A1 to take recommendation.
- B: …
```

推荐永远是选项 1。"do it" 采纳最近清单的全部推荐；点名选项（"A2"）改选那一项。`<code>` 是决定所关的 issue、PR 或线程。放不成这个样子的请示还没到能发的时候。

**所有者必须动手时**（建令牌、批部署、接受邀请、改设置），该行带事件发生页面的确切链接——完整 URL，绝不是"Settings → Tokens"这类菜单路径——然后用最简单的词编号步骤：点什么、填什么、起什么名、完成后回哪一个词。Capy 应用内的页面是唯一例外，因为它没有稳定链接：点名确切路径与字段（"Settings → Integrations → Slack 的 Channel 字段"）。

```text
<Captain name>
- A: <code> needs you to <action>, because <why>. Open <exact URL>, then:
  1. Click <button>.
  2. Type <value> in <field> and name it <name>.
  3. Reply **done**.
```

## 摘要

`DIGEST.md` 每个控制器轮次重写：**Needs you**（只有所有者能做的决定，用[请示格式](#请示格式)；空是目标）、**New**（什么落地或变了，新者在先）、**In progress**（每条车道、它拥有什么、其状态、上次报告的时长）。时长把停滞变成控制器的下一个动作。控制器归档线程时，同一轮把它从 **In progress** 里去掉。

## 每日不稳定修复

一个计划自动化每天以[不稳定修复提示词](https://github.com/garrytan/gstack/blob/main/captain/templates/automation-flaky-pass.md)启动一条车道。它读门禁运行的 flake-records 工件与免费套件的重试用例、每事件写一行台账、按用例分组、先修最严重的惯犯——PR 先红后绿地展示失败。它绝不重跑门禁、绝不碰阈值、试验次数或用例类别。仓库跑 `gstack-flaky` 时，车道还读 `gstack-flaky quarantine report --ledger <下载的台账>` 并最先修到期隔离条目（[flaky.md](https://github.com/garrytan/gstack/blob/main/docs/flaky.md#the-daily-flaky-pass)）。Capy 上用自动化工具创建、按所有者时区计划、作为编队里的线程运行以便报告落进 `reports/`。

同一规则的车道侧：CI 里门禁对按自身裁决失败的用例在同场运行重跑一次（[TESTING_INTERNALS.md](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#flaky-reruns)）；通过是带 `FLAKY N` 的绿，失败两次的用例是没人手工重跑的真红。车道自己聚焦的付费运行里，只重跑失败的用例、一次、同树：通过进台账（用例、PR、head、两次运行、一行症状）并在 READY 里点名；第二次失败是真的。harness、infra 或 incomplete 的红绝不是 flake。`KNOWN_INFRA_FLAKES` 点名的一个失败可每 PR 重跑一次并在 READY 里声明。红车归控制器（二分、重建一次），每次重跑报告其花费。

## 所有者的设备

有些动作只存在于所有者登录的浏览器或所有者的机器上：批准部署评审、切换运行所用的 GitHub 账号、本地专属构建。需要的车道请求控制器；控制器经所有者的设备完成（Capy 上：配对设备与所有者浏览器）并记录它做了什么。批准部署之前，查该运行的待部署清单；只批准车道点名的那个运行。

## 教训闭环

每份报告以一条 Lesson 结尾。控制器在闲聊之前先读教训，每条变成 CREW.md 的规则、AGENTS.md 的一行、或作为 issue 提交的工具修复；没有教训会长期只是教训。规则携带产生它的线程，新车道因此能读到规则背后的事故。

已合并编队 PR 的回退或 S1 修复，除了教训还有复盘。控制器在修复的简报发出时启动它，用[复盘模板](https://github.com/garrytan/gstack/blob/main/captain/templates/postmortem.md)，存为 `reports/postmortem-<n>.md` 并从修复 PR 链接。其根因节追问车道与每个评审者当时为何相信变更是对的，答案出自评审输出、回执、决策轨迹与审批，而不是 diff。它点名的每条规则变更以 gstack PR 落地，因为 gstack 持有"怎么做"；只留在编队文件里的规则是缺口。

所有者说出面向每个 Captain 的规则时，同一轮转发给持有账户共享规则的线程，让每个编队都得到。

## 在 Capy 上搭建

1. 创建 Captain 并给它上述 drive 布局；粘贴填好的 `CREW.md` 与空 `DIGEST.md`。
2. 把 `train` 块加进仓库的 `.gstack/ship-policy.json`，并在 `CREW.md` 里点名同样的检查名。
3. 把 gstack Capy 技能装进所有者的用户范围，让每条线程跑会话启动检查（[capy-install.md](https://github.com/garrytan/gstack/blob/main/docs/capy-install.md)）。
4. 创建每日不稳定修复自动化。
5. 用[简报](https://github.com/garrytan/gstack/blob/main/captain/templates/brief.md)开车道：它们拥有的文件、规则文件、是否需要规划、READY 契约。读它们的报告先于读它们的闲聊。
