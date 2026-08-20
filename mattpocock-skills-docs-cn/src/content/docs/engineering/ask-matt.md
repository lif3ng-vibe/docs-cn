---
title: "ask-matt：问路"
source: "https://www.aihero.dev/skills-ask-matt"
---

## 它做什么

`ask-matt` 是本仓库这套技能的路由器（router）。你描述自己眼下的处境（一个不知从何下手的想法、一堆涌进来的 bug 报告、一场拖得很久的[会话](https://www.aihero.dev/ai-coding-dictionary/session)），它便点出适合的技能或技能序列，外加这条序列里哪些地方要由人来拍板。

它推荐完就停。它不追问、不写[规格（spec）](https://www.aihero.dev/ai-coding-dictionary/spec)、不打开文件，也不触发它刚点名的技能；你拿回来的是下一条该输入的命令，由你自己输入。它还是一张手工维护的本仓库技能地图，而不是对你已安装内容的扫描，所以它不会把你路由到你自己的技能或另一位作者的技能上。

## 何时该用它

通过输入 `/ask-matt` 调用；智能体不会自己动用它。

| 你的处境 | 路由器给你什么 |
| --- | --- |
| 有想法，却不知从何下手 | 主流程的起点，以及这个构建是否小到可以跳过规格 |
| 别人报来的 bug 和需求 | [triage](/engineering/triage) 的上匝道（on-ramp），以及为什么你自己生成的[工单](https://www.aihero.dev/ai-coding-dictionary/ticket)不该走这条道 |
| 两个技能看着可以互换 | 两者的分界线，而且它通常是一条具体的判据，而不是口味问题。[grill-me](/productivity/grill-me) 还是 [grill-with-docs](/engineering/grill-with-docs)，取决于你是否在一个工作目录里；[grill-with-docs](/engineering/grill-with-docs) 还是 [wayfinder](/engineering/wayfinder)，取决于这份用力度（effort）能否装进一个会话 |
| 一场长会话，和一个关于[上下文](https://www.aihero.dev/ai-coding-dictionary/context)的决定 | 阶段边界处五个选项的有序决策树 |
| 你已经选定的技能 | 没什么有用的。直接调用那个技能。 |

## 前置条件

路由器只点名技能，不安装技能。它指向的每一样都必须已经安装，推荐才可执行，而且它只认识本仓库正式推介的这些技能。

依赖追踪器的路线（triage、`to-spec`、`to-tickets`、`implement`）默认 [setup-matt-pocock-skills](/engineering/setup-matt-pocock-skills) 已经在仓库里配置好工单追踪器。在那之前，路由器照样会欣然推荐它们。

## 流程，而非技能

这个技能交给你思考的词是**流程（flow）**：一条*穿行于*诸技能之间的路径，而不是某一个技能。说出你的处境，等于把你放到某条流程的某一步上，这与 "这是匹配你关键词的技能" 是两种不同的答案。路线共四类，技能自身把它们完整带在身上：

- **主流程**，从想法到上线。追问、规格、工单、实现、评审，其中含两条支线：一条是原型（prototype）绕道，用于某个问题非得靠可运行的代码才能定夺的情况；另一条是规格与工单的拆分，只有当构建跨越不止一个会话时才值回成本。
- **上匝道**，面向先产生工作、再汇入主流程的处境：涌进来的 bug 报告、坏掉的东西，或一件太朦胧也太大、一个会话装不下的工作。
- **独立技能**，不在任何流程上，各有各的动用时机：原型、问卷（questionnaire）、你正身处其中的合并冲突。
- **底下的词汇层**，两份参考资料，供其他技能在问题出在词汇而非流程时调入。

## 阶段边界

它交给你的另一个概念是**阶段边界（phase boundary）**。阶段（phase）是会话内的一块工作（追问、实现、QA），两个阶段之间的边界，是 "这段上下文怎么处理？" 这个问题唯一该出现的地方。阶段进行中没有决定可做：要么继续，要么把剩下的拆给[子智能体](https://www.aihero.dev/ai-coding-dictionary/subagent)。

| 选项 | 什么时候选它 |
| --- | --- |
| **继续** | 下一阶段要原封不动地沿用这一阶段，或者你的[聪明区（smart zone）](https://www.aihero.dev/ai-coding-dictionary/smart-zone)还有余量。它是唯一能让会话保住[一手来源（primary source）](https://www.aihero.dev/ai-coding-dictionary/primary-source)地位的动作，所以先从它排除起 |
| **`/clear`** | 身后的一切都可丢弃。棋盘上最便宜的一步，但判断错了就回不了头 |
| **[handoff](/productivity/handoff)** | 有东西需要跨出去：一个新的[框架（harness）](https://www.aihero.dev/ai-coding-dictionary/harness)、一个新目录、一位同事、一项阶段中途分叉出去的支线任务 |
| **子智能体** | 任务范围收得足够紧，可以在你[离开键盘（AFK）](https://www.aihero.dev/ai-coding-dictionary/afk)时自行运转 |
| **`/compact`** | 以上皆非。默认选项，而且经常落到这一步 |

其中两项常被用错，所以路由器给出的是先后次序，而不只是一份清单。`/handoff` 读起来像窗口之间的万能桥，其实不是：可移植性就是它买到的全部。`/compact` 位于决策树的最底层而不是第一选择，因为它上面的四个问题，每一个都更便宜或更精准。

## 常见问题

**就不能给一份按正确顺序排好的技能清单吗？**

一直有人在 README 里索要这份清单。这个技能就是那份清单：它为此而存在。一张静态表会写 `wayfinder → to-spec → to-tickets → implement → code-review`，然后对多数处境给出错误答案，因为有意思的部分在支线：有没有代码库、构建是否跨会话、这个问题能否靠谈来解决。诚实的代价是路由器靠手工维护，落后于仓库。`/grilling` 和 `/resolving-merge-conflicts` 都早在路由器点名它们之前就已发布。

**它告诉我一半的技能没安装。**

已知 bug，未修。路由器带你走的技能大多设置了 `disable-model-invocation: true`，意思是框架把它们排除在注入智能体上下文的那份技能清单之外。智能体把那份清单当作全集，于是报告它们缺失。有一次被报告的会话里，它宣布整个 "规格加工单" 流程不存在，改路只走光秃秃的 `/grilling` 和 `/tdd`。插件的二十二个技能里有十三个带着这个标志，所以这是常态而非边角情况。它们是装了的。照常输入斜杠命令即可，或者查 `.claude-plugin/plugin.json`——什么在场，它说了算。

**它描述了某个技能的行为，而那个技能并不那样做。**

同样真实，同样未修。路由器凭自己对每个技能的一行摘要作答，而不是凭技能本身。一份详细报告在单次会话里追到了三例，其中一例是仅凭 "turn the thread into a spec"（把对话串变成规格）这条一句话注释，就建议跳过 [to-spec](/engineering/to-spec)：`to-spec/SKILL.md` 从头到尾没被打开过。每一例都是用户反驳之后才去核实，没有一次主动核实。在那里跳过 `to-spec` 付出了一次真实的接缝（seam）检查，产出的工单也低估了工作量。当路由器对另一个技能作出承重性的断言时，先让它打开那个 `SKILL.md`。地图完全没覆盖的问题同理，比如要不要用[计划模式](https://www.aihero.dev/ai-coding-dictionary/agent-mode)：那个答案是[模型](https://www.aihero.dev/ai-coding-dictionary/model)的推断，不是这里写下来的东西。

**为什么写成散文，而不是带编号的清单？**

一条合理的抱怨，已作为开放 issue 提出：大部分路由是确定性的，叙述体让人难以扫读。没什么拦着你要压缩版：说一句 "直接给我序列"，序列就来了。散文承载的是条件的那一半：支线在哪、哪里期待人做决定、步骤之间在哪里清空（clear）或压缩（compact）。一张扁平的清单丢掉的恰恰是这些。

**它能路由我自己的技能，或者另一位作者的吗？**

不能。有三个彼此独立的提案，要的都是一个能读你本地 `skills/` 目录、按已安装内容做推荐的路由器。`ask-matt` 不是那个东西。它是一套技能的手工地图，对你自己写的或从别处安装的技能一无所知。

**它让我去改某个 SKILL.md。**

这个建议常常是对的，但很少能活得长久。有人问它怎么让 [implement](/engineering/implement) 关闭工单，得到的答复是往技能里加一行，此人马上看出了问题：`npx skills update` 会覆盖该文件，而且插件安装目录是只读的。把长期行为放进你自己的 `CLAUDE.md` 或 `AGENTS.md`，或者在调用指令里说明。提示层面的适配能在更新后幸存：把流程指向 Linear 而不是 GitHub，或者问它哪些未关工单可以并行，都是人们用这种方式做成的事。

**它点了一个我没有的技能，或者漏了一个我有的。**

先查更新日志里有没有改名，再断定技能没了。`writing-great-skills` 改成了 [writing-for-agents](/productivity/writing-for-agents)，没有留别名；`to-prd` 改成了 [to-spec](/engineering/to-spec)；`pathfinder` 改成了 [wayfinder](/engineering/wayfinder)。另有四个技能被直接退役、并入吸收它们的技能：`ubiquitous-language`、`design-an-interface`、`qa` 和 `request-refactor-plan`。反方向的情况，就是上文路由器自身的滞后。

## 正常工作的标志

- 它以点出你该输入什么收尾，并到此为止，而不是自己开工。
- 它给出的路线会提到在哪里清空或压缩上下文、哪里需要你复核，而不只是一串技能名。
- 两个技能相近时，它说选哪个，以及另一个为什么不适合你。
- 它对另一个技能行为的任何断言，都会在执行轨迹里留下它读那份 `SKILL.md` 的记录。
- 你能在它交回的东西里认出自己的处境，而不是最接近的通用场景。

## 它在全局中的位置

`ask-matt` 是覆盖整套技能的**独立路由器**。它从来不是链条上的一环；它指向每一条链，也是其他文档页回链的节点，这样谁都不必重画这张图。从这里出发，你多半会落到 [grill-with-docs](/engineering/grill-with-docs)——主流程的起点，或者 [triage](/engineering/triage)——为找上门来的工作（而不是你发起的工作）准备的上匝道。

在它所描述的技能之上，它是一份[二手来源（secondary source）](https://www.aihero.dev/ai-coding-dictionary/secondary-source)。路由器与 `SKILL.md` 说法不一致时，以 `SKILL.md` 为准。
