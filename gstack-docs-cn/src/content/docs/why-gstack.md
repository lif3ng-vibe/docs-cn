---
title: "为什么是 gstack，以及我怎么用它"
---


gstack 背后的故事、生产力数字及其注意事项、这些技能如何对应 Karpathy 的失败
模式，以及同时跑十个冲刺时会发生什么变化。本页从 README 里拆了出来，好让
README 保持简短；这里的内容对于安装或使用 gstack 都不是必需的。

> "I don't think I've typed like a line of code probably since December, basically, which is an extremely large change."（我想从去年 12 月起我大概一行代码都没敲过了，这是个极大的变化。）——[Andrej Karpathy](https://fortune.com/2026/03/21/andrej-karpathy-openai-cofounder-ai-agents-coding-state-of-psychosis-openclaw/)，No Priors 播客，2026 年 3 月

听到 Karpathy 这么说时，我想弄明白他是怎么做到的。一个人怎么能像二十人的团队那样发布产品？Peter Steinberger 基本上靠 AI agent 单枪匹马做出了 [OpenClaw](https://github.com/openclaw/openclaw)——247K GitHub star。革命已经来了。一个配上趁手工具的独立建造者，能比传统团队跑得更快。

我是 [Garry Tan](https://x.com/garrytan)，[Y Combinator](https://www.ycombinator.com/) 的总裁兼 CEO。我陪伴过数千家创业公司——Coinbase、Instacart、Rippling——那时它们还是车库里的一两个人。加入 YC 之前，我是 Palantir 最早的工程/产品/设计之一，联合创办了 Posterous（卖给了 Twitter），还造了 YC 的内部社交网络 Bookface。

**gstack 就是我的答案**。我做了二十年产品，而此刻我发布的产品比以往任何时候都多。过去 60 天里：3 个生产服务、40 多个已发布的功能——兼职做的，同时我还在全职运营 YC。按逻辑代码变更算——不是会被 AI 灌水的原始 LOC——我 2026 年的节奏是**约 2013 年的 810 倍**（每天 11,417 对 14 行逻辑变更）。年初至今（截至 4 月 18 日），2026 年已经产出**整个 2013 年的 240 倍**。统计口径是包含 Bookface 在内的 40 个公开 + 私有 `garrytan/*` 仓库，剔除一个演示仓库后的结果。大部分代码是 AI 写的。关键不在于谁敲的，而在于发布了什么。

> 那些 LOC 批评者说原始行数会随 AI 灌水，这没错。但要说剔除灌水因素后我的产出反而变少，那就错了。我的产出多得多，而且多很多。完整的方法论、注意事项和复现脚本：**[On the LOC Controversy](https://github.com/garrytan/gstack/blob/main/docs/ON_THE_LOC_CONTROVERSY.md)**。

**2026 年——1,237 次贡献，还在增加**：

![GitHub contributions 2026 — 1,237 contributions, massive acceleration in Jan-Mar](/images/github-2026.png)

**2013 年——我在 YC 造 Bookface 的时候**（772 次贡献）：

![GitHub contributions 2013 — 772 contributions building Bookface at YC](/images/github-2013.png)

同一个人。不同的时代。差别就在工具。

**gstack 就是我的做法**。它把 Claude Code 变成一支虚拟工程团队——一位重新审视产品的 CEO、一位锁定架构的工程经理、一位揪出 AI slop（AI 垃圾风格代码）的设计师、一位找出生产环境 bug 的评审者、一位打开真实浏览器的 QA 负责人、一位跑 OWASP + STRIDE 审计的首席安全官，还有一位把 PR 发布出去的发布工程师。二十三位专家加八件强力工具，全部是 slash command，全部是 Markdown，全部免费，MIT 许可证。

这就是我的开源软件工厂。我每天都在用。我把它分享出来，是因为这些工具理应人手一份。

## Karpathy 的四种失败模式？早已覆盖。

Andrej Karpathy 的 [AI 编码规则](https://github.com/forrestchang/andrej-karpathy-skills)（17K star）点中了四种失败模式：错误假设、过度复杂、无关改动、命令式压过声明式。gstack 的工作流技能把四条全部落实。`/office-hours` 在写代码之前把假设逼到明面上。Confusion Protocol 不让 Claude 在架构决策上瞎猜。`/review` 抓不必要的复杂度和顺手乱改。`/ship` 把任务变成可验证的目标，测试先行。如果你已经在用 Karpathy 式的 CLAUDE.md 规则，gstack 就是让这些规则贯穿整个冲刺而不只是单条提示的工作流强制层。

## 并行冲刺

gstack 跑一个冲刺很好用。跑十个才真正有意思。

**设计是核心**。`/design-consultation` 从零构建你的设计系统，调研业界现状，提出有创意的冒险，写出 `DESIGN.md`。但真正的魔法是 shotgun-to-HTML 管线。

**`/design-shotgun` 负责探索**。你描述想要什么。它用 GPT Image 生成 4-6 个 AI 视觉稿变体。然后在你的浏览器里打开对比板，所有变体并排展示。你挑出喜欢的，留下反馈（"留白多一些""标题更粗""去掉渐变"），它再生成新的一轮。重复到你爱上某一个。品味记忆在几轮之后介入，开始向你真正喜欢的方向偏置。再也不用用文字描述愿景然后祈祷 AI 领会了。你直接看选项，挑好的，视觉化地迭代。

**与 impeccable 协作**。如果你也在用 [impeccable](https://impeccable.style)，gstack 不会跟它打架。装了 impeccable 时，gstack 会在 `/design-review`、`/review`、`/ship` 和 `/design-html` 里先跑一遍 impeccable 的确定性引擎（gstack 绝不运行 impeccable 的安装器或启动器；设计技能第一次找不到引擎时，会问一次是否把引擎二进制——校验和锁定并记录日志——下载进 `~/.impeccable`，然后记住你的回答），用自己的口吻说同样的 61 个规则 id，读 `PRODUCT.md`，以两个工具都认的开放 DESIGN.md 格式写 `DESIGN.md`，并把搁置的发现交给 `/impeccable <command>`。说不要，一切照旧：不烦你，也不缺步骤。`gstack-config set design_detector off` 可以关掉这个前置处理。gstack 派生自 impeccable 与 DESIGN.md 规范的素材的归属说明在 `NOTICE.md`。

**`/design-html` 把它变成真的**。拿那份批准的视觉稿（来自 `/design-shotgun`、CEO 计划、设计评审，或者只是一段描述），把它变成生产级 HTML/CSS。不是那种只在一个视口宽度下好看、别处全崩的 AI HTML。这里用 Pretext 做计算文本布局：窗口缩放时文字真的会重排，高度随内容调整，布局是动态的。30KB 开销，零依赖。它检测你的框架（React、Svelte、Vue）并输出正确的格式。智能 API 路由按落地页、仪表盘、表单或卡片布局选用不同的 Pretext 模式。产出的是你真的会发布的东西，不是演示品。

**`/qa` 是一次巨大的解锁**。它让我从 6 个并行 worker 走到 12 个。Claude Code 说一句*"I SEE THE ISSUE"*然后真的修掉它、生成一条回归测试、验证修复——这改变了我的工作方式。agent 有眼睛了。

**智能评审路由**。就像一家运营良好的创业公司：CEO 不必看基础设施的 bug 修复，后端改动不需要设计评审。gstack 记录哪些评审跑过了，判断什么合适，然后直接做聪明的事。评审就绪仪表盘在发布前告诉你自己站在哪里。

**测试一切**。项目没有测试框架时，`/ship` 会从零引导一个。每次 `/ship` 都产出覆盖率审计。基础设施可用时 `/qa` 会创建原生回归测试，并明确报告缺失的测试覆盖；纯 CSS 修复可以用浏览器证据代替。100% 测试覆盖是目标——测试让凭感觉写代码变得安全，而不是蛮干。

**`/document-release` 是你从未拥有过的那位工程师**。它在最终验证之前，把相关的既成文档对照发布 diff 审计一遍，修正事实漂移。有风险的变更会退回请求批准。`/ship` 每次运行都会调用它，并掌管 TODOS、发布元数据、生成与发布；子流程报告文档是已更新、最新还是受阻。

**Aside 是 gstack 优先驱动的浏览器**。在浏览器场景里，Mac 上开着 [Aside](https://aside.com) AI 浏览器时，`/qa`、`/qa-only`、`/design-review`、`/canary`、`/benchmark`、`/scrape` 和 `/browse` 全都在那里跑——你真实的浏览器、你真实登录的会话，agent 为自己开的标签页，用完就关。不用导入 cookie，没有"打开浏览器"这一步，也没有验证码交接舞：撞上登录墙，就在 Aside 里登录，说一句"好了"，agent 继续干活。页面返回的任何东西都被当作不可信内容——agent 只从中取语法，绝不取指令。`/make-pdf`、`/diagram` 和设计预览也通过 Aside 打印和截图（从你的机器经回环地址提供，每个脚本渲染一次），规划类技能做网络调研时也先走 Aside 自己的 agent，然后才轮到搜索工具。

**Aside 不在时，gstack 自带的浏览器自动接手**。Linux、Windows，或者 Aside 关着的 Mac：同样的技能用 `./setup` 构建的内置无头 Chromium，产出同样的证据，并点亮下面这些只有浏览器属于 gstack 而不是你时才有意义的功能。

**真实浏览器模式**。`/open-gstack-browser` 启动 GStack Browser——一个 AI 操控的 Chromium，带反爬隐身、自定义品牌和内建的侧边栏扩展。Google、NYTimes 这类站点不再弹验证码。菜单栏写的是 "GStack Browser" 而不是 "Chrome for Testing"。你日常的 Chrome 不受任何影响。所有既有的 browse 命令原样可用。`$B disconnect` 回到无头模式。只要窗口开着，浏览器就一直活着……不会在你干活时被空闲超时杀掉。

**侧边栏 agent——你的 AI 浏览器助手**。在 Chrome 侧面板里打自然语言，一个子 Claude 实例去执行。"导航到设置页并截图。""用测试数据填这张表。""把这个列表逐条过一遍，提取价格。"侧边栏自动路由到合适的模型：快动作（点击、导航、截图）用 Sonnet，阅读和分析用 Opus。每个任务最多 5 分钟。侧边栏 agent 跑在隔离会话里，不会干扰你的主 Claude Code 窗口。侧边栏底栏就能一键导入 cookie。

**个人自动化**。侧边栏 agent 不只服务于开发流程。举个例子："浏览我孩子学校的家长门户，把其他所有家长的名字、电话和照片加进我的 Google 通讯录。"认证有两条路：（1）在有头浏览器里登录一次，会话一直保留；或（2）点侧边栏底栏的 "cookies" 按钮，从你真实的 Chrome 导入 cookie。认证完成后，Claude 就去翻目录、提取数据、创建联系人。

**提示注入防御**。恶意网页会试图劫持你的侧边栏 agent。gstack 自带分层防御：每次读页面都过内容过滤器（数据标记、隐藏元素剥离、ARIA 清洗、URL 黑名单），外加一个 22MB 的 ML 分类器，在本地 sidecar 子进程里于 agent 看到内容之前扫描页面衍生内容，还有一个裁决合并器，要求分类器意见一致才拦截（防止单个模型在 Stack Overflow 式指令页面上误报）。一切都在你的机器上跑，零网络调用。紧急开关：`GSTACK_SECURITY_OFF=1`。完整防御栈见 [ARCHITECTURE.md](/architecture/#提示注入防御侧边栏-agent)。

**AI 卡住时的浏览器交接**。撞上验证码、登录墙或 MFA 提示？`$B handoff` 在完全相同的页面上打开一个可见的 Chrome，cookie 和标签页原封不动。你解决问题，告诉 Claude 好了，`$B resume` 从断点继续。连续失败 3 次后 agent 甚至会主动提议这么干。

**`/pair-agent` 是跨 agent 协作**。你在 Claude Code 里。你还开着 OpenClaw。或者 Hermes，或者 Codex。你想让它们同时看同一个网站。输入 `/pair-agent`，选好 agent，一个 GStack Browser 窗口打开，供你围观。技能打印一段指令块。把那段贴进另一个 agent 的聊天框。它用一次性设置密钥换一个会话 token，开自己的标签页，开始浏览。你看着两个 agent 在同一个浏览器里干活，各自一个标签页，谁也干扰不了谁。装了 ngrok 的话，隧道自动启动，另一个 agent 可以在完全不同的机器上。同机 agent 走零摩擦捷径，直接写入凭据。这是第一次，不同厂商的 AI agent 能通过共享浏览器以真正的安全机制协作：作用域 token、标签页隔离、限速、域名限制和活动归属。

**多 AI 第二意见**。在 Codex 里，gstack 通过 `/claude-code` 把外部评审发给 Claude Code。在 Claude Code 里，`/codex` 把它们发给 OpenAI Codex。其他宿主同时暴露两个技能，在支持自动外部评审的地方用 Codex。两个技能都支持代码评审、对抗性质询和带会话连续性的咨询。路由跟随宿主，所以改你配置的模型不会改外部评审者。报告会注明实际完成每份评审的提供方；不可用的外部覆盖保持可见。

**按需启用的安全护栏**。说一句 "be careful"，`/careful` 就会在任何破坏性命令前告警——rm -rf、DROP TABLE、force-push、git reset --hard。`/freeze` 在调试时把编辑锁在一个目录里，Claude 就不会顺手"修"到无关代码。`/guard` 同时启用两者。`/investigate` 自动冻结到正在调查的模块。

**主动技能建议**。gstack 注意到你处于哪个阶段，默认只建议四个核心技能：新想法用 `/office-hours`，diff 用 `/review`，"这能用吗"用 `/qa`，落地用 `/ship`。`gstack-config set proactive all` 建议所有匹配的技能，`off` 什么都不建议，会话里说"别再建议了"会关掉它并跨会话记住（见 [docs/proactive.md](https://github.com/garrytan/gstack/blob/main/docs/proactive.md)）。

## 10-15 个并行冲刺

gstack 跑一个冲刺很强。跑十个，是质变。

[Conductor](https://conductor.build) 并行运行多个 Claude Code 会话——每个在自己的隔离工作区里。一个会话在新想法上跑 `/office-hours`，另一个对 PR 跑 `/review`，第三个在实现功能，第四个在 staging 上跑 `/qa`，还有六个在其他分支上。全部同时进行。我经常跑 10-15 个并行冲刺——这就是当前的实际上限。

让并行成立的正是冲刺结构。没有流程，十个 agent 就是十份混乱。有了流程——思考、规划、构建、评审、测试、发布——每个 agent 都确切知道该做什么、何时停。你像 CEO 管理团队那样管它们：过问要紧的决策，其余放行。
