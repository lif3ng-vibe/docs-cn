---
title: "gstack"
---


gstack 把 Claude Code（以及其他编码 agent）变成一支虚拟工程团队：一位重新审视产品的 CEO、一位锁定架构的工程经理、一位揪出 AI slop（AI 垃圾风格代码）的设计师、一位找出生产环境 bug 的评审者、一位打开真实浏览器的 QA 负责人、一位跑 OWASP + STRIDE 审计的首席安全官，还有一位把 PR 发布出去的发布工程师。全部是 slash command，全部是 Markdown，全部免费，MIT 许可证。

我是 [Garry Tan](https://x.com/garrytan)，[Y Combinator](https://www.ycombinator.com/) 的总裁兼 CEO。这是我每天都在用的开源软件工厂，我把它分享出来，是因为这些工具理应人手一份。背后的故事、生产力数字，以及我如何同时跑十个冲刺（sprint），见 [为什么是 gstack](/why-gstack/)。

Fork 它，改进它，把它变成你自己的。要是你想吐槽免费开源软件——随你，但我更建议你先试了再说。

**这份工具适合谁**：
- **创始人和 CEO**——尤其是还想亲自下场发布产品的技术型创始人
- **Claude Code 首次使用者**——用结构化的角色取代一张白纸式的提示框
- **技术负责人和资深工程师**——让每个 PR 都有严格的评审、QA 和发布自动化

## 快速开始

1. 安装 gstack（两次粘贴，约 30 秒完成配置；见下文）。
2. 运行 `/office-hours`，描述你在做什么。它会质疑你的问题框定（framing），并写出一份供其他技能读取的设计文档。
3. 在任何一个有改动的分支上运行 `/review`。它会找出那些能通过 CI 却会在生产环境出事的 bug，并顺手修掉显而易见的那些。
4. 在你的 staging URL 上运行 `/qa`，或者在隔离的本地 API、CLI、定时任务或 webhook 上运行。它会打开真实浏览器，复现 bug 并修复它们。

到这里就可以停下了。你会知道这适不适合你。等你需要完整冲刺时，`/autoplan` 会端到端评审一份计划，`/ship` 会跑测试、评审并提 PR。

## 安装——约 30 秒

**要求**：[Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[Git](https://git-scm.com/)、[Bun](https://bun.sh/) v1.4.2+（经测试的版本；安装器拒绝低于 1.3.3 的 Bun——那会让编译出的工具读到项目的 `.env`），以及 Windows 上的 [Node.js](https://nodejs.org/)。**macOS 推荐**：[Aside](https://aside.com) 浏览器（macOS 15+），浏览器类技能、`/make-pdf` 和 `/diagram` 会优先驱动它并使用你真实登录的会话；没有它，`./setup` 会构建 gstack 自带的内置浏览器（bundled browser）。`/cso` 还需要原生工具链；缺失时安装器会说明情况并让它保持不可用。安装耗时、`/cso` 的前置条件以及 setup 注册的 hooks：[docs/install.md](/install/)。

### 步骤 1：在本机安装

打开 Claude Code，粘贴下面这段。剩下的 Claude 会完成。

> Install gstack: run **`git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`** then add a "gstack" section to CLAUDE.md that says to use the /browse skill from gstack for all web browsing and never use mcp\_\_claude-in-chrome\_\_\* tools. Claude Code lists the installed skills itself, so the section needs no skill list. Then ask the user if they also want to add gstack to the current project so teammates get it.

### 步骤 2：团队模式——共享仓库自动更新（推荐）

在你的仓库里粘贴这段。它会把你切换到团队模式，引导仓库让队友自动获得 gstack，并提交这一变更：

```bash
(cd ~/.claude/skills/gstack && ./setup --team) && ~/.claude/skills/gstack/bin/gstack-team-init required && git add .claude/ CLAUDE.md && git commit -m "require gstack for AI-assisted work"
```

你的仓库里没有内嵌（vendored）文件，没有版本漂移，没有手动升级。每个 Claude Code 会话开始时都会做一次快速的自动更新检查（限频为每小时一次，网络故障安全，完全静默）。团队模式跟随 `stable` 渠道：每周两次的打标发布（周一和周四，间隔至少 72 小时，外加经过验证的安全与回归修复），而不是每次合并到 main。`gstack-config set update_channel main` 则改为跟随每次合并；见 [docs/releases.md](/releases/)。

如果你更想提醒队友而不是拦住他们，把 `required` 换成 `optional`。

团队模式的 `required` hook 跑在 Node.js 上，所以每位队友的 PATH 里都需要有 Node.js（[详情](/install/#团队模式)）。之后想移除 gstack：[docs/uninstall.md](/uninstall/)。

### 其他 AI Agent

gstack 能跑在 Claude 之外的更多 agent 上。裸 `./setup` 只为 Claude Code
安装（在 OpenClaw、Hermes 或某个 Dot 里运行时，它还会把 gstack 的技能注册到
该宿主：[docs/hosts.md](/hosts/#agent-宿主)）。用 `--host <name>` 指定
其他 agent，或用 `--host auto` 为 setup 在本机检测到的每一个 agent 安装：

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup --host auto      # 或：./setup --host codex
./setup --status                         # 每个安装一行：宿主、层级、范围、版本、路径
```

显式的 `--host X` 只为 X 安装，绝不会改动其他 agent 的安装。`/gstack-upgrade`
会刷新它注册过的每一个安装，每个宿主一行，并指出哪些失败了。

层级说明：**完整**（full）由一次真实工作流运行认证（见
[为你的宿主做认证](/adding-a-host/#认证你的宿主)）；**实验性**（experimental）
能安装并通过一致性测试，但还没有认证运行；**仅指令**（instruction-only）
不安装任何东西：setup 会打印该复制什么。

| Agent | 层级 | 安装 | 首次调用 | 安全技能 | 外部评审需要 | 修复 |
|-------|------|---------|------------------|---------------|----------------------|--------|
| Claude Code | 完整 | `--host claude`（默认） | `/office-hours` | 强制（hooks 拦截） | Codex CLI，已登录 | `./setup --host claude` |
| OpenAI Codex CLI | 实验性 | `--host codex` → `${CODEX_HOME:-~/.codex}/skills/gstack-*/` | 让用户请求 `gstack-office-hours` | 仅提示，不拦截 | Claude Code CLI，已登录 | `./setup --host codex` |
| OpenCode | 实验性 | `--host opencode` → `~/.config/opencode/skills/gstack-*/` + `/gstack-*` 命令 | `/gstack-office-hours` | 仅提示，不拦截 | Codex CLI，已登录 | `./setup --host opencode` |
| Cursor | 实验性 | `--host cursor` → `~/.cursor/skills/gstack-*/` | 让用户请求 `gstack-office-hours` | 仅提示，不拦截 | Codex CLI，已登录 | `./setup --host cursor` |
| Factory Droid | 实验性 | `--host factory` → `~/.factory/skills/gstack-*/` | 让用户请求 `gstack-office-hours` | 仅提示，不拦截 | Codex CLI，已登录 | `./setup --host factory` |
| Kiro | 实验性 | `--host kiro` → `~/.kiro/skills/gstack-*/` | 让用户请求 `gstack-office-hours` | 仅提示，不拦截 | Codex CLI，已登录 | `./setup --host kiro` |
| GitHub Copilot CLI | 实验性 | `--host copilot` → `~/.copilot/skills/gstack-*/` | `/gstack-office-hours` | 仅提示，不拦截 | Codex CLI，已登录 | `./setup --host copilot` |
| Antigravity CLI | 实验性 | `--host agy`（或 `--host antigravity`）→ `~/.gemini/antigravity-cli/skills/gstack-*/` | `/gstack-office-hours` | 仅提示，不拦截 | Codex CLI，已登录 | `./setup --host agy` |
| Gemini CLI | 实验性 | `--host gemini`（或 `--host gemini-cli`）→ `~/.gemini/skills/gstack-*/` | 让用户请求 `gstack-office-hours` | 仅提示，不拦截 | Codex CLI，已登录 | `./setup --host gemini` |
| Slate | 仅指令 | `--host slate`（指向 Claude 安装；Slate 读取 `.claude/skills`） | 经 Claude 安装使用 `/office-hours` | 仅提示，不拦截 | — | `./setup --host claude` |
| OpenClaw | 实验性 | `--host openclaw`（五个任务技能加一个 `gstack` 路由技能装进 OpenClaw 的技能目录；在 OpenClaw 里运行 setup 时自动完成；ACP 路线见 [docs/OPENCLAW.md](/openclaw/)） | 直接说任务；agent 会打开匹配的任务技能或 `gstack` 路由技能 | 仅提示，不拦截 | — | `./setup --host openclaw` |
| Hermes | 实验性 | `--host hermes`（全部技能装入 `$HERMES_HOME/skills/gstack`；在 Hermes 里运行 setup 时自动完成） | 直接说任务，或 `/gstack-review` | 仅提示，不拦截 | — | `./setup --host hermes` |
| GBrain（mod） | 仅指令 | `--host gbrain`（brain-aware 变体随 GBrain 仓库分发） | — | 仅提示，不拦截 | — | — |

各宿主细节（agent 宿主、Copilot、Antigravity、Gemini CLI、OpenClaw 与 ClawHub、Codex 行为配置与模型层级、外部评审提供方、design 二进制的模型）见 [docs/hosts.md](/hosts/)。任何会读规则文件的 agent（Zed、Amp、Jules）都能免安装使用 2KB 的 [agents 摘要](https://github.com/garrytan/gstack/blob/main/agents-digest/gstack-AGENTS.md)。新增宿主：[docs/ADDING_A_HOST.md](/adding-a-host/)。

## 看它实跑

```
You:    I want to build a daily briefing app for my calendar.
You:    /office-hours
Claude: [asks about the pain — specific examples, not hypotheticals]

You:    Multiple Google calendars, events with stale info, wrong locations.
        Prep takes forever and the results aren't good enough...

Claude: I'm going to push back on the framing. You said "daily briefing
        app." But what you actually described is a personal chief of
        staff AI.
        [extracts 5 capabilities you didn't realize you were describing]
        [challenges 4 premises — you agree, disagree, or adjust]
        [generates 3 implementation approaches with effort estimates]
        RECOMMENDATION: Ship the narrowest wedge tomorrow, learn from
        real usage. The full vision is a 3-month project — start with
        the daily briefing that actually works.
        [writes design doc → feeds into downstream skills automatically]

You:    /plan-ceo-review
        [reads the design doc, challenges scope, runs 10-section review]

You:    /plan-eng-review
        [ASCII diagrams for data flow, state machines, error paths]
        [test matrix, failure modes, security concerns]

You:    Approve plan. Exit plan mode.
        [writes 2,400 lines across 11 files. ~8 minutes.]

You:    /review
        [AUTO-FIXED] 2 issues. [ASK] Race condition → you approve fix.

You:    /qa https://staging.myapp.com
        [opens real browser, clicks through flows, finds and fixes a bug]

You:    /ship
        Tests: 42 → 51 (+9 new). PR: github.com/you/app/pull/42
```

你说的是"每日简报应用"。agent 说的是"你在造一个参谋长 AI"——因为它听的是你的痛点，而不是你的功能需求。八条命令，从头到尾。这不是副驾驶（copilot），这是一支团队。

## 冲刺

gstack 是一套流程，不是一堆工具的集合。技能按冲刺的顺序运行：

**思考 → 规划 → 构建 → 评审 → 测试 → 发布 → 复盘**

每个技能的产出都喂给下一个。`/office-hours` 写出的设计文档会被 `/plan-ceo-review` 读取。`/plan-eng-review` 写出的测试计划由 `/qa` 接手。`/review` 揪出的 bug 由 `/ship` 验证已修复。没有事情会掉进缝里，因为每一步都知道前面发生了什么。

| 技能 | 你的专家 | 他们做什么 |
|-------|----------------|--------------|
| `/office-hours` | **YC 办公时间** | 从这里开始。六个逼问式问题（forcing questions），在你写代码之前重新框定你的产品。质疑你的问题框定，挑战前提，生成实现备选方案。设计文档喂给下游每一个技能。 |
| `/plan-ceo-review` | **CEO / 创始人** | 重新思考问题。找出藏在需求里的十星（10-star）产品。四种模式：扩张、选择性扩张、维持范围、收缩。 |
| `/plan-eng-review` | **工程经理** | 锁定架构、数据流、图表、边界情况和测试。把隐藏假设逼到明面上。 |
| `/plan-design-review` | **资深设计师** | 给每个设计维度打 0-10 分，解释 10 分长什么样，然后直接改计划朝那个方向走。AI slop 检测。交互式——每个设计选择一个 AskUserQuestion。 |
| `/plan-devex-review` | **开发者体验负责人** | 交互式 DX 评审：探索开发者画像，与竞品的 TTHW 对标，设计你的魔法时刻，逐步追踪摩擦点。为读报错的 agent 给错误消息打分（[agent-ready errors](/agent-ready-errors/)）。三种模式：DX EXPANSION、DX POLISH、DX TRIAGE。20-45 个逼问式问题。 |
| `/design-consultation` | **设计伙伴** | 从零构建完整的设计系统。调研业界格局，提出有创意的冒险，生成真实感的产品视觉稿。以开放的 DESIGN.md 格式写 `DESIGN.md`，让 impeccable、Google Stitch 以及任何读这个格式的工具共享同一份文件。 |
| `/review` | **资深工程师** | 找出能通过 CI 却在生产环境爆炸的 bug。自动修复显而易见的那些。标记完整性缺口与门禁完整性（gate integrity）：每一处被削弱的测试、超时、快照或抑制都会指名道姓地送达到人。建议性的简化镜头标记过度构建的代码——从不拦截，从不自动应用。 |
| `/deslop-shared-libs` | **共享代码评审** | 在近期工作中寻找值得做的共享代码抽取。比较多达五个机会并推荐最好的三个，附源码证据、可靠性收益和总代码节省量。只出建议。 |
| `/write-skill` | **技能编辑器** | 写一个新 agent 技能，或在不膨胀的前提下改进现有技能。五步编辑阶梯（先修工具；模型本来就会的不加；改行而非追加；触达 agent 的最低层级；规则而非故事），按层级统计体积和上次瘦身以来增长的 `gstack-skill-bill`，漂移检查（技能点名的每个 gstack 命令和 flag 是否仍然存在），以及用前/后/无技能对照测试证明的完整瘦身。 |
| `/test-audit` | **测试审计员** | 扫描现有测试，找出维护成本高于保护价值的那些：源码 grep、重复测试、无断言探针、仅测试用的导出。每个候选带一张证据卡；只出报告，除非你批准一批。 |
| `/investigate` | **调试手** | 系统化的根因调试。铁律（Iron Law）：没有调查就没有修复。追踪数据流，验证假设，3 次修复失败后停下。 |
| `/verify` | **构建循环** | 跑仓库自己的检查（类型检查、lint、构建）和 `/ship` 的预门禁会为你的改动挑的测试，修掉坏的，重复到全绿，然后交接给 `/ship`。运行仓库命令前询问一次；没有测试覆盖时绝不把改动称为绿。 |
| `/design-review` | **会写代码的设计师** | 与 /plan-design-review 相同的审计，然后修掉发现的问题。原子提交，前后截图。装了 impeccable 的话，它的引擎先跑，每条机械性发现都带着规则 id 标签到来。 |
| `/devex-review` | **DX 测试员** | 实测开发者体验审计。真的去测你的上手流程：翻文档，走 getting started 流程，掐 TTHW，以 agent 遇到错误的方式触发 CLI 错误（`gstack-error-capture`：无终端、受控、脱敏）。与 `/plan-devex-review` 的分数对比——那记回旋镖告诉你计划是否匹配现实。 |
| `/design-shotgun` | **设计探索者** | "给我看选项。"生成 4-6 个 AI 视觉稿变体，在浏览器里打开对比板，收集你的反馈，然后迭代。品味记忆会学习你喜欢什么。重复到你爱上某一个为止，然后交给 `/design-html`。 |
| `/design-html` | **设计工程师** | 把视觉稿变成真正能用的生产级 HTML。Pretext 计算布局：文字真的会重排，高度随内容调整，布局是动态的。30KB，零依赖。检测 React/Svelte/Vue。按设计类型智能选择 API 路由（落地页、仪表盘、表单各不相同）。装了 impeccable 引擎时过一遍 slop 门禁。产出可直接发布，不是演示品。 |
| `/design-motion` | **动效设计师** | 把批准的视觉稿、定稿页面或 URL 变成展示循环。重建精确的那一帧，从空白开始加载，给每个视觉一个故事，在假时钟上录制确定性帧，接缝、空拍、静止和溢出检查通过后，导出发 X 的 MP4、网站 GIF 和 800×500 GIF。需要 ffmpeg。 |
| `/qa` | **QA 负责人** | 探索浏览器、API、CLI、定时任务和 webhook 行为。复现 bug，写失败的回归测试，修根因并在提交前重新验证。 |
| `/qa-only` | **QA 报告员** | 探索并报告，附可回放的证据。建议回归用例，不改产品代码和测试。 |
| `/pair-agent` | **多 Agent 协调器** | 让任何 AI agent 共享 gstack 自己的浏览器。一条命令，一次粘贴，连上即用。兼容 OpenClaw、Hermes、Codex、Cursor，或任何能 curl 的东西。每个 agent 有自己的标签页。自动以有头模式（headed mode）启动，全程可视。为远程 agent 自动启动 ngrok 隧道。作用域 token、标签页隔离、限速、活动归属。（跑在内置浏览器——即回退引擎——上；驱动 Aside 的 agent 直接开自己的标签页。） |
| `/cso` | **首席安全官** | 带应用模型、有据可查的发现、独立质询和明确覆盖面的安全审计。没有目录画像时静态评估仍然可用。有匹配的合格画像时，综合模式额外包含受控的运行时/扫描器执行，以及 Node/Bun、Python 和 Rails 的可审阅修复候选。合格的运行时与扫描器镜像发布于 linux/amd64 和 linux/arm64。没有 Docker 时，审计只跑静态评估。运行时测试过的 bundle 对独立的外部断言做认证。项目测试的完成状态保持 `self_reported`，因为目标代码控制着测试过程；`tested` 留给未来独立于目标的完成见证。 |
| `/ship` | **发布工程师** | 同步 main，跑测试，探索变更行为，审计覆盖率、门禁完整性和文档，然后验证、推送并开 PR。 |
| `/land-and-deploy` | **发布工程师** | 合并 PR，等 CI 和部署，验证生产健康。一条命令从"已批准"到"已在生产验证"。 |
| `/modernize` | **陈旧 PR 维护者** | 把一个老去的 PR 搬到当前基线上，并判断它是否还该存在：MODERNIZE（rebase、`git range-diff` 证据、带着钉在观察到的 head 上的 lease 推送）、REWORK（问题成立，diff 不成立）或 CLOSE（建议如此，未经许可绝不执行）。读基线移动的范围，找的是意义上的冲突，不只是文本上的。 |
| `/canary` | **SRE** | 部署后监控循环。盯控制台错误、性能回归和页面故障。 |
| `/benchmark` | **性能工程师** | 页面加载时间、Core Web Vitals 和资源体积的基线。在每个 PR 上做前后对比。 |
| `/ubicloud` | **远程执行器** | 在一台用完即弃的 16 vCPU Ubicloud 虚拟机上跑重型套件、构建或评测：按负责人和 TTL 命名的 VM 带回收器，配额预检，卡死看门狗，每个仓库一次已提交的验证。 |
| `/runaway-stopper` | **支出守门员** | 在 Capy 上找出失控（runaway）的 agent 线程和子代理（自有上下文超 500M token、活跃超 3 天、子代理超 100M、空唤醒、无限评审轮次），在干净的点停下它们，通过交接轮换线程，并设置防止它们回来的默认值。`gstack-runaway scan` 只读宿主自己的线程数据，绝不行动。 |
| `/eval-plan` | **评测规划器** | 在第一次计费调用之前预注册一次付费评测（eval）：门槛、实验臂、诱饵和停止规则，一次对真实输入的 $0 桩模型演练，以及一个三项计费试点，其外推和支出表决定审批。 |
| `/document-release` | **技术写作者** | 每次发布时、在最终验证和发布文档之前，对照项目文档审计变更行为。也可独立运行。显示已更新、已评审/最新或受阻的文档，以及剩余缺口。 |
| `/document-generate` | **文档作者** | 用 Diataxis 框架从零生成缺失的文档。先调研代码库，再写真正与代码相符的参考 / 操作指南 / 教程 / 解释文档。可独立调用，或在覆盖图发现缺口时从 `/document-release` 链式调用。了解更多：[教程](/tutorial-document-generate/) • [操作指南](/howto-document-a-shipped-feature/) • [为什么选 Diataxis](/explanation-diataxis-in-gstack/)。 |
| `/retro` | **工程经理** | 团队感知的每周复盘。按人拆解、发布连胜、测试健康趋势、成长机会。`/retro global` 跨你所有的项目和 AI 工具运行（Claude Code、Codex、Gemini、Kimi Code、OMP、Antigravity）。 |
| `/browse` | **QA 工程师** | 给 agent 一双眼睛。通过确定性的 `aside repl` 脚本优先驱动你的 [Aside](https://aside.com) 浏览器——真实会话、真实点击、真实截图。没有 Aside？回退到 gstack 自带的 Chromium：真实点击，每条命令约 100ms，`/open-gstack-browser` 会有头地展示它，带侧边栏、反爬隐身和自动模型路由。其他所有浏览器技能都建立在它之上。 |
| `/scrape` | **数据提取器** | 在你的 Aside 浏览器里、带着页面真实登录态，抓取网页上的结构化数据——表格、列表、价格。在回退浏览器上，`/skillify` 能把流程变成永久的浏览器技能，下次约 200ms 跑完。 |
| `/setup-browser-cookies` | **会话管理器** | 把选定的 cookie 从 Chrome、Chromium、Brave、Edge、仅 Windows 的 Opera 和 Opera GX，或仅 macOS 的 Comet 和 Arc 复制进 gstack 的内置浏览器。选你的画像和域名；复制与登录验证是分开的两步。只在回退路径上需要——Aside 本来就有你的会话。 |
| `/autoplan` | **评审流水线** | 一条命令，一份完整评审过的计划。自动跑 CEO → 设计 → DX → 工程评审（工程永远最后，让发布门禁评审最终修订版计划），内置决策原则。只把品味类决策呈给你批准。 |
| `/spec` | **规格作者** | 五个阶段（为什么、范围、带强制读码的技术方案、草稿、文件）把模糊意图变成精确可执行的规格。归档前过外部评审质量门禁（Codex 上用 Claude Code；其他宿主用 Codex；低于 7/10 拦截），失败即关闭的密钥脱敏，与现有 issue 去重，归档到 `$GSTACK_STATE_ROOT/projects/$SLUG/specs/` 供团队语料库召回。`--execute` 在全新 worktree 里拉起 `claude -p`；合并时 `/ship` 自动关闭源 issue。感知计划模式。 |
| `/learn` | **记忆** | 管理 gstack 跨会话学到的东西。评审、搜索、修剪并导出项目特有的模式、坑和偏好。学习跨会话复利，gstack 在你的代码库上越来越聪明。 |
| `/make-pdf` | **出版器** | Markdown 进，出版级文档出。Mermaid 和 excalidraw 代码块渲染成矢量图，完全离线。图片缩放到页面内，绝不截断；宽图独占一页横排。`--to html` 产出一个自包含文件，`--to docx` 产出一个 Word 文档。 |
| `/diagram` | **图表绘制器** | 英文进，可编辑的图出。产出一组三件套：mermaid 源码、可在 excalidraw.com 打开编辑的 `.excalidraw`（手绘风格），以及渲染好的 SVG/PNG。零网络。把源码嵌进 markdown，`/make-pdf` 就能渲染。 |

同样的 `/qa` 和 `/qa-only` 命令可以在无浏览器的情况下测试 CLI、API、定时任务、worker 和 webhook：[无网页 QA](/qa-without-a-webpage/)。

### 该用哪个评审？

| 你在做给谁用 | 计划阶段（写代码前） | 实测审计（发布后） |
|-----------------|--------------------------|----------------------------|
| **终端用户**（UI、Web 应用、移动端） | `/plan-design-review` | `/design-review` |
| **开发者**（API、CLI、SDK、文档） | `/plan-devex-review` | `/devex-review` |
| **架构**（数据流、性能、测试） | `/plan-eng-review` | `/review` |
| **以上全部** | `/autoplan`（跑 CEO → 设计 → DX → 工程，自动检测哪些适用；工程永远最后） | — |

### 强力工具

| 技能 | 它做什么 |
|-------|-------------|
| `/codex` | **第二意见**——来自 OpenAI Codex CLI 的独立代码评审。评审、质询、咨询三种模式。除 Codex 外所有宿主可用。 |
| `/claude-code` | **第二意见**——来自 Claude Code 的独立代码评审。评审、质询、咨询三种模式，咨询带会话连续性。除 Claude Code 外所有宿主可用。 |
| `/careful` | **安全护栏**——在破坏性命令（rm -rf、DROP TABLE、force-push）前告警。说 "be careful" 即可激活。可覆盖任何 MEDIUM 告警；root/home 递归删除和默认分支 force-push 一律硬拒。 |
| `/freeze` | **编辑锁**——把文件编辑限制在一个目录里。调试时防止误改范围之外的代码。 |
| `/guard` | **全面防护**——一条命令等于 `/careful` + `/freeze`。生产工作的最大安全。 |
| `/unfreeze` | **解锁**——移除 `/freeze` 边界。 |
| `/open-gstack-browser` | **GStack 浏览器**——有头启动 gstack 自带的浏览器，带侧边栏、反爬隐身、自动模型路由（动作用 Sonnet，分析用 Opus）、一键 cookie 导入和 Claude Code 集成。清理页面、智能截图、改 CSS、把信息传回终端。回退引擎的可见面孔；开着 Aside 时，你在那里看 agent 的标签页。 |
| `/setup-deploy` | **部署配置器**——`/land-and-deploy` 的一次性配置。检测你的平台、生产 URL 和部署命令。 |
| `/setup-gbrain` | **GBrain 上手**——从零到跑起 gbrain 不超过 5 分钟。PGLite 本地、Supabase 现有 URL，或经 Management API 自动开通新 Supabase 项目。Claude Code 的 MCP 注册加每仓库信任三元组（读写/只读/拒绝）。[完整指南](/gbrain-with-gstack/)。 |
| `/sync-gbrain` | **保持大脑最新**——通过 `gbrain sources add` + `gbrain sync --strategy code` 把本仓库代码重新索引进 gbrain，刷新 CLAUDE.md 里的 `## GBrain Search Guidance` 块，并在能力检查失败时自动移除指引。`--incremental`（默认）、`--full`、`--dry-run`。幂等；可安全重跑。 |
| `/gstack-upgrade` | **自更新器**——把 gstack 升级到最新。检测全局还是内嵌安装，两者同步，展示变更内容。 |
| `/captain` | **编队控制器**——从一个控制器指挥多个编码 agent：车道发 READY block 且绝不合并，控制器经列车合并（按需打戳、验证、以期望的 head 合并），维护摘要，按固定格式中继审批，每天跑一轮不稳定修复。也响应 `/crew`。[团队指南](/captain/)。 |
| `/ios-qa` | **iOS 真机 QA**（v1.43.0.0+）——通过 app 内嵌的 `StateServer` 经 USB CoreDevice 驱动真实 iPhone 或 iPad。读 Swift 源码，生成带类型的 `@Observable` 访问器，跑 agent 循环。可选 `--tailnet` flag 把设备暴露给 OpenClaw 或你 Tailscale tailnet 上任何能说 HTTP 的 agent，远程 agent 无需碰硬件即可跑 iOS QA。能力层级白名单（观察/交互/变更/恢复）、每设备会话锁、审计日志。 |
| `/ios-fix`、`/ios-design-review`、`/ios-clean`、`/ios-sync` | iOS bug 修复循环、设计师视角的 HIG 审计、调试桥清理和访问器重同步。见 `docs/skills.md`。端到端演练：[docs/howto-ios-testing-with-gstack.md](/howto-ios-testing-with-gstack/)。 |

slash command 之外，gstack 还自带独立 CLI（`gstack-egress`、`gstack-context-bill`、`gstack-model-benchmark`、`gstack-pr-wait`、评审与证据台账、iOS QA 守护进程）：[docs/standalone-binaries.md](/standalone-binaries/)。回退浏览器的按站点 [domain skills](/domain-skills/) 与原生 CDP 逃生通道，以及许多技能自带的[语音输入别名](/voice-input/)，各有专门页面。

**[每个技能的深度解析、示例与哲学 →](/skills/)**

## GBrain——给你的编码 agent 的持久知识

[GBrain](https://github.com/garrytan/gbrain) 是给 AI agent 的持久知识库——把它当作你的 agent 在会话之间真正留得住的记忆。GStack 给你一条从零到"跑起来了，我的 agent 能调它"的单命令路径。

```bash
/setup-gbrain
```

四条配置路径、每仓库信任策略与记忆同步，简版见 [docs/gbrain-quick-tour.md](/gbrain-quick-tour/)。**全家桶——每个场景、每个 flag、每个 bin 助手、每一步排障**：[USING_GBRAIN_WITH_GSTACK.md](/gbrain-with-gstack/)

其他参考：[docs/gbrain-sync.md](/gbrain-sync/)（同步专题指南）• [docs/gbrain-sync-errors.md](/gbrain-sync-errors/)（错误索引）

## 平台说明

macOS 和 Linux 获得完整支持。Windows 和 Gemini 模型获得最低限度支持：能安装、核心技能能跑，仅此而已，不多承诺。见[支持层级](/support-tiers/)。

**macOS**：一切都能跑。开着 [Aside](https://aside.com) 浏览器（macOS 15+）并登录后，浏览器类技能、`/make-pdf` 和 `/diagram` 用它和你的真实会话；否则用 `./setup` 构建的内置浏览器。gstack 绝不安装 Aside。

**Linux**：一切都跑在内置浏览器上；Aside 仅限 macOS，所以就绪探测会打印一次 `NEEDS_ASIDE: Linux`，然后技能用 gstack 自带的 Chromium。如果 Chromium 装上了却起不来，原因是宿主系统禁用了非特权用户命名空间（Ubuntu 24.04+ 的 AppArmor 默认值），请设置 `GSTACK_CHROMIUM_NO_SANDBOX=1`。

**Windows 用户**：gstack 在 Windows 11 上通过 Git Bash 或 WSL 工作。Aside 仅限 macOS，所以在 Windows（和 Linux）上浏览器类技能、`/make-pdf` 和 `/diagram` 永远用 gstack 的内置浏览器。除 Bun 外还需要 Node.js——Bun 在 Windows 上有一个 Playwright pipe 传输的已知 bug（[bun#4253](https://github.com/oven-sh/bun/issues/4253)）。browse 服务端会自动回退到 Node.js。确保 `bun` 和 `node` 都在你的 PATH 上。原生 `/cso` 额外需要 PowerShell（首选 PowerShell 7 `pwsh`；回退是 Windows PowerShell 5.1）和带"使用 C++ 的桌面开发"工作负载的 Visual Studio 2022 Build Tools；缺失时安装器会让该技能明确不可用。/cso 是可选的：如果它的原生助手构建或发布失败，安装器仍会完成，说明失败在哪一步并给出日志路径和重试命令，已有旧助手时保留旧的（`GSTACK_STRICT_BUILD=1` 让该失败变为致命，如 CI 所为）。

**已知问题：Windows Smart App Control**（[#2595](https://github.com/garrytan/gstack/issues/2595)）。gstack 的编译产物（`browse`、`find-browse`、`design`、`pdf`、`gstack-global-discover`）在本机构建且未签名，所以开着 Smart App Control 的 Windows 11 拒绝启动它们；Git Bash 显示 `Permission denied`。setup 会检测到这一点，点名被拦的二进制和需要它们的技能，`gstack-doctor` 会把它们报成 `blocked`。目前的解决办法是在 WSL 里跑 gstack，或关掉 Smart App Control。详情：[故障排查](/troubleshooting/#windows-smart-app-control)。侧边栏终端在 Windows 上使用 Consolas，文字不再渲染得稀稀拉拉。

在 PowerShell 里，`.\setup.ps1`（参数与 `./setup` 相同）检查 Git for Windows、Bun 和 Node.js 是否在 PATH 上，为缺失的打印 `winget` 命令，然后在 Git Bash 里运行 `./setup`。

在没有开发者模式的 Windows 上（MSYS2 / Git Bash），`setup` 回退为文件复制而不是符号链接，因为 `ln -snf` 产出的是冻结副本，`git pull` 后不会刷新。**每次 `git pull` 之后请重跑 `cd ~/.claude/skills/gstack && ./setup`**，让技能文件与仓库一致。`setup` 会打印一行提示。Unix 和 WSL 保留符号链接，不需要重跑。

## 文档

| 文档 | 覆盖内容 |
|-----|---------------|
| [技能深度解析](/skills/) | 每个技能的哲学、示例与工作流（含 Greptile、CodeRabbit 等评审机器人的分诊） |
| [推荐的宿主组合](/recommended-harness/) | gstack + Capy 从零到第一列合并列车：安装、Captain 与它的 Drive、列车、每日不稳定修复、每周两次的发布、工厂记分卡、哪些是 Capy 特有的、已知的 Capy 限制 |
| [gstack + Capy：软件工厂](/capy/) | 我们用 Capy Captain 和 gstack 建了什么、各部分如何咬合、实测前后对比、技巧，以及 Garry 怎么用它 |
| [为什么是 gstack](/why-gstack/) | 背后的故事、生产力数字及其注意事项、Karpathy 的失败模式、并行冲刺 |
| [安装细节](/install/) | setup 耗时、详细要求、团队模式、setup 注册的 hooks、agent 宿主注册 |
| [其他 agent](/hosts/) | agent 宿主（OpenClaw、Hermes、dots、QM、Muse Code、Grok 及其他）、OpenClaw 与 ClawHub、各宿主说明、Codex 行为配置与模型层级、外部评审提供方、design 二进制的模型 |
| [无网页 QA](/qa-without-a-webpage/) | 在 CLI、API、定时任务、worker 和 webhook 上的 `/qa` 和 `/qa-only` |
| [独立二进制](/standalone-binaries/) | 独立的 `gstack-*` CLI（出站审计、上下文账单、模型基准、评审与证据台账、iOS QA 守护进程）以及 CSO 评测生产者契约 |
| [隐私与遥测](/privacy/) | 什么会被发送、什么绝不发送、更新检查、外部评审、出站回执 |
| [卸载](/uninstall/) | 卸载脚本与手动移除 |
| [图表与文档格式](/howto-diagrams-and-formats/) | PDF 中的 mermaid/excalidraw 代码块、图片缩放与安全默认值、`--to html\|docx`、`/diagram` 三件套 |
| [第一次生产部署](/howto-bring-up-a-first-deploy/) | `/setup-deploy` 说还没有任何部署时该做什么：主机、环境与密钥、DNS、验证可用，然后回到 `/setup-deploy` |
| [建造者信条](/ethos/) | 建造者哲学：沸腾大海、先搜索再建造、三层知识 |
| [GBrain 快速导览](/gbrain-quick-tour/) | 四条配置路径、MCP 注册、每仓库信任策略、记忆同步、Conductor 环境变量 |
| [在 GStack 中使用 GBrain](/gbrain-with-gstack/) | `/setup-gbrain` 的每条路径、每个 flag、每个 bin 助手和每一步排障 |
| [GBrain 同步](/gbrain-sync/) | 跨机器记忆配置、隐私模式、排障 |
| [架构](/architecture/) | 设计决策与系统内部 |
| [浏览器](/browser/) | gstack 如何优先驱动 Aside（契约、操作手册、渲染、调研）、回退引擎何时介入、回退的完整 `$B` 命令参考 |
| [参与贡献](/contributing/) | 开发配置、测试、贡献者模式与开发模式 |
| [Memorable 记忆桥接](/memorable-workflow-memory/) | 经 gstack 接入的第三方工作流记忆（需主动开启）：两次同意、gstack 交出什么并能证明什么、移除、排障 |
| [故障排查](/troubleshooting/) | 每条 `not run` / `unavailable` 消息的含义与修法 |
| [指挥一支 Captain 编队](/captain/) | Capy 上的一个控制器、多条车道：Drive 布局、CREW.md、READY 契约、合并列车、审批、摘要与每日不稳定修复，附模板 |
| [更新日志](https://github.com/garrytan/gstack/blob/main/CHANGELOG.md) | 每个版本的新变化 |

## 隐私与遥测

除非你主动开启，gstack 不会发送任何关于你如何使用它的信息。遥测默认关闭且只问一次；更新检查（两三次 GitHub 请求：一次 `git ls-remote`、一次拉取 `VERSION`，当该版本与你的一致而 `main` 已前进时再加一次 compare-API 调用；遥测开启时还会上报你的 gstack 版本和操作系统；默认开启）可用 `gstack-config set update_check false` 关闭；外部评审（默认开启；第一次会打印提示）在你自己的登录态下把代码发给 Codex 或 Claude Code，可用 `gstack-config set codex_reviews disabled` 关闭。每一次离开本机的发送都会写一张回执，可用 `gstack-egress list` 审计。完整说明——包括遥测携带的确切字段以及不属于遥测的本地状态：[docs/privacy.md](/privacy/)。

## 故障排查

**不知道哪里坏了**？跑诊断器：`~/.claude/skills/gstack/bin/gstack-doctor`
（其他宿主上，你的 gstack 检出目录里的 `./setup --status` 结尾会给出诊断器的
绝对路径）。不启动任何技能、不花一分钱，它逐项打印一行（安装、状态根目录、
Bun、hooks、Codex 及其缓存的模型探测、产物同步、browse 包、其他编译产物、
/cso 原生助手、Claude Code、你最大的会话日志和近期的 /autoplan 守卫码），
每项 `ok`、`warn`、`not configured` 或 `fail`，并附上能修复它的命令。
只有 `fail` 才以非零退出。`--live` 还会跑付费的 Codex 模型检查（一次短调用）。
报 bug 时把输出贴上。

**某条消息说 `not run`、`unavailable` 或点名了修法**？去
[docs/troubleshooting.md](/troubleshooting/) 查：gstack 打印的每条门禁消息、
含义、保留了什么，以及修复命令。

**Claude 说它看不到技能**？确认技能已安装（`ls ~/.claude/skills`）并重启
Claude Code；它会列出每个已安装技能及其描述，所以 CLAUDE.md 不需要逐一枚举
（粘贴的清单每次发布都会过时）。你项目的 `CLAUDE.md` 只需要浏览规则：

```
## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
```

如果旧版安装提示在你的 CLAUDE.md 里留下了一行 "Available skills:"，删掉它。

技能不出现、安装过时、Codex 技能描述、前缀模式、禁用技能、Chromium 安装问题：[快速答案](/troubleshooting/#快速答案)。

---

免费，MIT 许可，开源。没有付费层级，没有候补名单。

我把我构建软件的方式开源了。你可以 fork 它，变成你自己的。

> **我们在招人**。想以 AI 编码的速度发布真实产品、帮忙加固 gstack 吗？
> 来 YC 工作——[ycombinator.com/software](https://ycombinator.com/software)
> 极具竞争力的薪酬与期权。旧金山，Dogpatch 区。

## 许可证

MIT。永远免费。去做点东西吧。
