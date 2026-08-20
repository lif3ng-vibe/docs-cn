---
title: "wayfinder：规划大块工作"
source: "https://www.aihero.dev/skills-wayfinder"
---

## 它做什么

`wayfinder` 处理的是一次智能体[会话](https://www.aihero.dev/ai-coding-dictionary/session)装不下的大工程：一个你能说出**目的地**（destination）、却还看不清路线的想法。它把这个想法绘制成工单追踪器上一张由**决策工单（Decision ticket）**组成的共享**地图**（map），然后逐个解决这些工单，直到道路清晰。

它只规划，不执行。每张工单装的是一个问题，解决它意味着做出一个决定，而不是要执行的一块构建；当有人去动手实现之前已经没有任何事需要决定时，地图才算完成。正是这一条规则把 wayfinder 工单和普通的实现[工单](https://www.aihero.dev/ai-coding-dictionary/ticket)区分开来，也是智能体最常违反的规则。地图清空后，wayfinder 就此交接，不会继续深入代码。

## 什么时候用它

你输入 `/wayfinder` 来调用它；[智能体](https://www.aihero.dev/ai-coding-dictionary/agent)不会自己主动启用。

它是整套技能里最重、最密的流程，所以触发条件很窄：工程量必须真的超出一次智能体会话所能容纳的范围，而且通往目的地的路线必须还笼罩在迷雾里。分工很清晰：`/grill-with-docs` 负责单会话规划，`/wayfinder` 负责多会话规划。

| 你面前是什么 | 该运行什么 |
| --- | --- |
| 一个范围清晰、一次就能敲定的功能 | [grill-me](/productivity/grill-me)；有代码库时用 [grill-with-docs](/engineering/grill-with-docs) |
| 一个全新项目，或横跨多个会话、路线尚不清晰的构建 | `/wayfinder` |
| 一段决定已经全部敲定的对话 | [to-spec](/engineering/to-spec)：直接跳过地图 |
| 一张已清空的 wayfinder 地图 | [to-spec](/engineering/to-spec)，然后 [to-tickets](/engineering/to-tickets) 和 [implement](/engineering/implement) |
| 一个已经长得过大的现有会话 | 说“交接给 `/wayfinder`”（[handoff](/productivity/handoff) 既能把对话接进地图，也能从地图接出来） |

并非只有全新项目才能用。wayfinder 也常用于遗留代码库和半成品代码库，甚至可以说在那里更锋利，因为很多迷雾是“这里已经有什么”，而不是“我们该做什么”。

## 前置条件

地图及其工单存放在仓库的工单追踪器上，所以 wayfinder 需要 [setup-matt-pocock-skills](/engineering/setup-matt-pocock-skills) 铺好的追踪器接线。那一步会写入一个 “Wayfinding operations” 小节，描述地图、子工单、阻塞边（blocking edges）和前沿（frontier）查询在 GitHub、GitLab 或本地 markdown 中如何表达。wayfinder 通过你 `CLAUDE.md` / `AGENTS.md` 里的指针来解析这份文档，而不是走固定路径；完全没配置追踪器时，它会退回到本地 markdown 文件。

追踪器不是摆设。阻塞关系正是让前沿在追踪器自己的 UI 里可视化呈现的东西；没有原生依赖链接的追踪器（比如自建的 Gitea）会让 wayfinder 退化到从地图文本推断阻塞关系——能用，但需要盯得更紧。

## 地图、迷雾与前沿

**地图**是一个带 `wayfinder:map` 标签的工单；它的工单是它的子工单。它是**索引，不是存储**：一个决定只活在一个地方——它的工单里，地图只做摘要并给出链接。会话以低分辨率加载地图，按需放大到单张工单，这正是地图能持续增长、而每个会话不必为它的全部历史买单的原因。

上面住着四样东西：

- **目的地（Destination）**：走完这张地图意味着什么。在任何工单存在之前说出它的名字，是绘图的第一步，因为目的地划定了每张工单据以衡量的范围。
- **已有决定（Decisions so far）**：每张已关闭的工单一行，各自链接到细节真正所在之处。
- **尚未指明（Not yet specified）**：即**战争迷雾（fog of war）**。你能预感会来、却还无法清晰表述的决定。区分迷雾与工单的检验标准是*现在*能否把问题精确陈述出来，而不是能否回答它。解决一张工单会清掉它前方的迷雾，并把如今已可明确表述的东西“毕业”成新的工单。
- **范围之外（Out of scope）**：被判定超出目的地的工单。迷雾只会朝*目的地的方向*聚集，所以范围之外的工作是关闭的，永远不会毕业。

**前沿（frontier）**是开放的、未被阻塞的、未被认领的工单（已知世界的边缘）。会话在做任何工作之前先把工单指派给自己来完成认领，所以指派人*就是*认领标记，并发的会话会跳过它。全文提到工单一律用名字，绝不用光秃秃的 `#42`；一墙的工单编号在叙述里没法读。

## 四种决策工单类型

每张工单都带一个 `wayfinder:<type>` 标签，并且要么是 **[人在回路（HITL）](https://www.aihero.dev/ai-coding-dictionary/human-in-the-loop)**（与一位为自己发声的人一起完成），要么是 **[AFK](https://www.aihero.dev/ai-coding-dictionary/afk)**，由智能体独自驱动。HITL 工单只能通过实时交流解决；智能体如果自己回答了自己的[追问（grilling）](https://www.aihero.dev/ai-coding-dictionary/grilling)问题，就等于把它做砸了。

| 类型 | 模式 | 什么时候用它 | 由谁解决 |
| --- | --- | --- | --- |
| `grilling` | HITL | 默认类型。这个问题谈一谈就能敲定。 | 在全新会话中运行 [grilling](/productivity/grilling) 加 [domain-modeling](/engineering/domain-modeling) |
| `prototype` | HITL | “它该长什么样”或“它该怎么表现”：谈不下来的问题。 | [prototype](/engineering/prototype)，建好的产物作为资产从工单链接过去 |
| `research` | AFK | 工作目录之外的一个事实卡住了某个决定。 | 一个 [research](/engineering/research) [子智能体](https://www.aihero.dev/ai-coding-dictionary/subagent)，绘图时发射，在 `research/<name>` 分支上并行燃尽 |
| `task` | 任一 | 没什么可决定的，但有手工工作卡住了某个决定，比如开通权限、注册某项服务，或搬运数据以便看清它的形状。 | 能由智能体独自做的就独自做，否则给人留一份精确的清单 |

`task` 是唯一*动手做事*而非做决定的类型，它靠解锁某个决定挣得自己的位置，绝不靠交付目的地的一块。这也是实践中最容易出岔子的类型：智能体把它理解成一个实现步骤，开始在地图里写产品代码。

`research` 是“一个会话一张工单”的唯一例外。

## 常见问题

**它和 `/grill-with-docs` 有什么区别？该从哪个开始？**
看会话数，不看项目大小。`/grill-with-docs` 是单会话规划；wayfinder 是多会话规划。如果你能把整件事装进一次对话，追问是更便宜也更好的工具，wayfinder 在这种场景下确实更慢、更重。社区沉淀出的速记法是：只有当工作装不进单次会话时，wayfinder 才说得通。这是 wayfinder 被问得最多的问题，遥遥领先，而且一直有人问，因为各种描述都不会告诉你自己的任务在这条线上的位置。会话数得你自己判断。

**它问“目的地”时，指的是这次会话的终点，还是全部工作的终点？**
整张地图。也就是说，是整张地图的目的地，而不只是最初那次会话的。这个问题读起来有歧义，是因为 wayfinder 按定义就是多会话工具，以会话为范围的回答永远说不通。典型的目的地有：一份用来交接的[规格（spec）](https://www.aihero.dev/ai-coding-dictionary/spec)、一个在规划开始前要锁定的决定、一个概念验证，或一处就地完成的变更（比如数据迁移）。

**地图清空了。wayfinder 不是已经把规格写好、把工单建好了吗？为什么还需要 `/to-spec` 和 `/to-tickets`？**
没有。wayfinder 的工单是决策工单，到地图关闭时它们也全都关闭了。留下的是一张挂满相互链接的决定的地图，这不是构建计划。[to-spec](/engineering/to-spec) 把这些链接起来的决定收拢成一份规格（`/to-spec #<map_issue>`），[to-tickets](/engineering/to-tickets) 再把它切成曳光弹（tracer bullet）式的实现工单。把地图直接套进 [implement](/engineering/implement) 会跳过这个收拢步骤，把链接的细节全扔掉。只有当工程量最终确实很小时才直通实现。确实有人跑精简流水线并报告它可行；多出的两步买到的是一份评审者或同事都能读的显式规格产物——你越不是单打独斗，这一点就越重要。

**我的智能体在 wayfinder 会话中途开始写生产代码了。**
这是该技能被报告最多的失败模式，背后有一个真实的漏洞。wayfinder 的“只规划、不执行”默认可以在地图的 **Notes** 里被覆盖，但 Notes 是智能体写的，于是约束和豁免同住在受约束方自己拥有的那份文件里。有用户亲眼看到智能体在自己的 Notes 里写下“这张地图承载执行”，然后在后续会话里把它读回成自己的许可证，直接在线上服务器上开发。技能内部对“我指的是默认规则”没有硬性刹车。在它出现之前：任何不是你自己绘制的地图都要读一读 Notes，把实现留在它自己的会话里，并把任何看起来像构建切片的 `wayfinder:task` 视为标错了类型。

**我绘了 27 张工单，做到第十三张时，剩下的已经说不通了。**
一个真实且被反复报告的结局，这句是实地报告的原话。wayfinder 的默认本能是全面规划，而一张后面的工单建立在前面工单会推翻的假设之上的地图，恰恰是这个技能被指控的瀑布陷阱。有两样东西可以对抗它。把地图的范围限定在一个有边界的目的地上，而不是整个产品。实践者一致报告，范围限定在一个明确 epic 内的地图比铺开的“实现 V1”表现更好，况且规划一个很大的东西本来就不是目标：发布小的增量才是。还有，激进地做[原型](https://www.aihero.dev/ai-coding-dictionary/prototyping)：路线之所以能保持新鲜，全靠在实现依赖它之前，用便宜的具体产物把不确定性冲掉。wayfinder 是“原型拉满（prototypemaxxing）”，不是“计划拉满（planmaxxing）”。

**我能并行处理几张工单吗？**
前沿的设计就是给你看哪些工单可以拿下，阻塞边的存在也让并行工作在纸面上是安全的。实践中，一次一张仍是更安全的默认。同时处理两张追问工单的用户，会在一个会话里被问到刚在另一个会话里回答过的问题，因为两个会话不共享[上下文](https://www.aihero.dev/ai-coding-dictionary/context)。原型工单上还有一个已知缺口：有报告称智能体做了三个 UI 变体，自己挑了一个，然后把工单关了。选择权在你，而技能目前没把这一点说得足够响亮。如果你确实要并行，先自己过一遍依赖图。

**必须用 GitHub Issues 吗？**
不必。任何工单追踪器都行。GitHub 是支持最好的路径，因为它原生的子工单和阻塞关系让人不打开地图就能看见前沿；GitLab、Linear、Jira 和本地 markdown 也都有人用。两句实话。没有原生阻塞的追踪器意味着依赖图要从文本推断，需要手工修正。而本地 markdown 会把这些产物放进你的仓库，这不被推荐：把这类材料存进仓库容易导致意外持久化。开源维护者遇到的是相反的问题（公开追踪器被智能体生成的规划工单填满），于是往往还是选本地 markdown。

**追问太累人了。每个问题都长达三段。**
这是对 wayfinder 最尖锐的现实抱怨，而且尚未解决。一位用户的拆解是：啰嗦本身就导致决策疲劳，而长度又剥掉了*为什么*要问这个问题，于是随着地图变长，你丢掉了从决定到决定的链条。这种啰嗦看起来是当前这批[模型](https://www.aihero.dev/ai-coding-dictionary/model)的属性，而不是技能的属性，也还没有修复落地。流传中的实践者缓解办法：调低[推理用力度](https://www.aihero.dev/ai-coding-dictionary/effort)，并在你的全局 `CLAUDE.md` 里放一条平实的指令。无论如何都要准备好在这里花真思考，因为 wayfinder 要你付出的思考量不是缺陷，而是它存在的意义的一大半。

**一个我已经关闭的决定后来发现是错的。该改旧工单还是新建一张？**
没有官方指引，而智能体的本能也帮不上忙：它倾向于绕着坏决定设计，而不是质疑它，所以你得手动掌舵。有效的做法是把变化直截了当地告诉 wayfinder；它会更新地图、修订受影响的工单，并在已关闭的工单上留言。地图中途的范围变化是可以恢复的。一张你*设计好就是要变*的地图，才是范围划定出问题的味道。

**`decision-mapping` 去哪儿了？**
它就是这个技能，在 v1.1 中改名为 `wayfinder`，以 `/wayfinder` 调用。“Decision map”（决策地图）是行话，而且不准确，因为四种工单类型里只有一种本身就是真正的决定。这次重新框定给了技能一套连贯的词汇（目的地、战争迷雾、前沿、地图），而不是在上面再叠一个生造的词。不过“决定”这个词在单元层面留了下来：wayfinder 的工单就叫**决策工单（Decision ticket）**，正是为了阻止人们把它读成实现工单。

## 正常工作的标志

- 在任何工单存在之前，目的地已经写下并达成一致。
- 每张开放工单读起来都是一个问题。任何写着“构建 X”的工单，要么标错了类型，要么属于地图的下游。
- 你看一眼追踪器就知道哪些工单可以拿下，不用打开地图，因为那就是前沿通过原生阻塞关系自己呈现出来。
- 一个会话解决一张工单，把答案作为解决评论发出，关闭它，并在地图的*已有决定（Decisions so far）*里留下一行。然后它停下。
- **尚未指明（Not yet specified）**随时间收缩。一块毕业成工单的迷雾会从那一节消失，而不是两个地方都留着。
- 当开场的广度优先追问完全找不到迷雾时，技能会停下来告诉你：工程量小到可以跳过地图。
- 完成地图的那个会话把你交给一份规格，而不是一个 pull request。

## 它在整个流程中的位置

`wayfinder` 是一条**情境化的上匝道（on-ramp）**，不是默认的正门。以追问为前导的“点子 → 上线”链条仍是大多数工作的起点；wayfinder 是当想法大到一次会话装不下时你驶入的那条道，并在 [to-spec](/engineering/to-spec) 处并回那条链，因为清空的地图是交接，而不是构建。

在底下，它大多是别的技能穿着 wayfinder 的调度在干活：[grilling](/productivity/grilling) 和 [domain-modeling](/engineering/domain-modeling) 解决默认的工单类型，[prototype](/engineering/prototype) 解决谈不下来的那些工单，[research](/engineering/research) 以子智能体运行，好让它的阅读内容永远不落进你的会话。[handoff](/productivity/handoff) 是进出两向的桥：对话长得超出自己时接进地图，会话中途冒出支线任务时从地图接出。其他一切，[ask-matt](/engineering/ask-matt) 负责在整个技能集上为你导航。
