---
title: "在其他 agent 上运行 gstack"
---


README 里有宿主矩阵：每个 agent 一行，含其层级、安装命令和首次调用。本页讲
其余内容：各 agent 宿主（OpenClaw、Hermes、dots、QM、Muse Code、Grok 及其他）、
一份检出如何决定为哪些 agent 渲染、各宿主备注、外部评审提供方、Codex 行为
配置、模型层级，以及设计二进制程序的模型。

## agent 宿主

在 agent 宿主（agent harness）里安装 gstack，会在同一次 `./setup` 中以该
宿主自己的方式注册技能。`bin/gstack-harness` 干活，`lib/harness-register.ts`
里每个宿主一个目标。

**何时自动注册**。不带 `--host` 的 `./setup`（或 `--host auto`）会向它运行
所在的宿主注册：OpenClaw（其 exec 工具会设置 `OPENCLAW_SHELL=exec`）、
Hermes（`HERMES_AGENT=true`）或 Dot（Dot 计算机上 `HOME=/home/dot`），或
setup 父进程中发现的宿主。它会打印写入的每个路径和删除它们的命令。显式
`--host claude`（或其他任何宿主）绝不写宿主目录，`./setup --local` 同样
不写。`./setup --no-harness-auto` 或 `GSTACK_HARNESS_AUTO=0` 可关闭这个
自动步骤。

**它写什么**。只往宿主自己的 skills 目录里复制文件，绝不编辑 `openclaw.json`、
Hermes 的 `config.yaml` 或任何你没有指名的上下文文件。唯一例外是
[启动钩子](#start-hook)，由你自己开启：它会添加一个插件，并通过宿主自己
的命令启用它。上下文块按需选择加入：`gstack-harness register
openclaw|hermes|generic --context <file>` 只在打印出该文件及其作用域（宿主
自家主目录内为 `profile`，否则为 `project`）之后，把带标记的块写进那个
文件。安装、升级和刷新从不主动添加；你删掉的块保持删除状态；第二个
`--context` 文件不会挤掉第一个（台账按文件给块记键）；卸载时逐字节还原
每个文件。它会拒绝 `SOUL.md`；对 Hermes 还会拒绝一个会压过 Hermes 现行
加载规则的新文件（`.hermes.md`/`HERMES.md` 先于 `AGENTS.md` 加载）：
`HARNESS_CONTEXT_REFUSED`。每个文件都进台账
`$GSTACK_STATE_ROOT/harness/<id>.ledger`，带其 sha256。再次注册只改动有
变化的部分；出现 gstack 没写过的目录或技能名即停止
（`HARNESS_UNOWNED_ENTRY`）；`gstack-uninstall` 和 `gstack-harness
unregister` 只删除台账里的文件，绝不穿过符号链接，并把你编辑过的文件
改名为它旁边的 `<file>.edited-<time>`，卸载动不了它。上下文块只在该块
确为 gstack 所写时才裁掉；编辑过的块留给你处理。`./setup
--refresh-registered`（`/gstack-upgrade` 运行的就是它）刷新每一份注册。
`gstack-harness status` 会列出它们，并在宿主有自家技能清单时运行之
（`visible to harness: yes`）。报错见
[故障排查](/troubleshooting/#agent-宿主gstack-harness)。

**已注册、已列出、被使用**。这是三件独立的事，本页只主张前两件。
*已注册*：gstack 的文件在宿主的 skills 目录和它的台账里
（`gstack-harness status`）。*已列出*：宿主把技能放进模型提示词的
skills 区（`visible to harness: yes`，来自宿主自己的技能清单）。*被使用*：
在契合的任务里，模型打开匹配的技能并执行其第一步。使用率要等 HARN-5
的固定面板（OpenClaw 与 Hermes 的聊天模式，每格五次试验）。数据落地后
是在评测适配器的 `GSTACK_SESSION_KIND=spawned` 标记下测的，该标记会自动
决定 gstack 的提问，所以它们目前对交互式会话不说明任何问题。有两个杠杆
指向"被使用"：每条路由行以技能自己的触发句开头（"Use when asked to
..."），每条 Hermes 描述以至多 57 个字符的触发清单开头——那是 Hermes
技能索引展示的描述部分。

| 宿主 | gstack 注册什么 | 安装 | 验证 | 移除 |
|---|---|---|---|---|
| OpenClaw | 默认 `--skills hybrid`：`gstack-review`、`gstack-investigate`、`gstack-qa`、`gstack-ship` 和 `gstack-plan-eng-review` 作为顶层技能，外加一个 `gstack` 路由技能，其正文列出其他所有技能及其路径，位于 `${OPENCLAW_STATE_DIR:-~/.openclaw}/skills`。以 OpenClaw 2026.10.6 的 19 个合格内置技能计，hybrid 的 skills 区为 10,290 字符（完整格式），低于其 18,000 字符预算；`--skills all`（17,971，紧凑格式，描述截断）把每个技能列为自己的目录，`--skills router`（6,701）只有路由。OpenClaw 要么完整提供已注册技能的 `SKILL.md`，要么拒绝（"Skill instructions cannot be partially served"）：模型目录没有该模型的上下文窗口时上限 32,768 字节，有 100K-200K-token 窗口时为 32,000 字符。因此任何超过 32,000 字节的已注册技能（hybrid 五个中的四个，今天 `all` 63 个中的 26 个）都是一个同名同描述的短入口 `SKILL.md`，把 agent 指向所有技能普通副本中的完整 `SKILL.md`（路由的 `gstack/skills/`，或 `--skills all` 下的 `.gstack-skills/`，一个 OpenClaw 技能扫描会跳过的目录），OpenClaw 分页读取。上下文窗口低于 100K token 时，该预算降到 16,000 字符，这一限制不涵盖此情形 | `./setup --host openclaw`, or `./setup` inside OpenClaw | `openclaw skills list --json` 显示 `gstack` 和五个任务技能（来源 `openclaw-managed`，合格） | `gstack-harness unregister openclaw` |
| Hermes | 全部技能，以 `gstack-<skill>` 之名归入单一 `gstack` 分类，位于 `${HERMES_HOME:-~/.hermes}/skills/gstack`。Hermes 的技能索引只列出以目录注册的技能，若用路由，其余技能就进不了清单（`skill_view` 仍能按名加载未列出的技能，但没有任何东西告诉模型它存在） | `./setup --host hermes`, or `./setup` inside Hermes | `hermes skills list` 显示 `gstack` 分类下的 `gstack-*` 技能 | `gstack-harness unregister hermes` |
| dots (feder-cr) | `gstack` 路由，位于 `/home/dot/skills/gstack`，Dot 每轮都会列出它 | `./setup` on the Dot's computer, or `gstack-harness register dots` | Dot 的 Skills 页面，或 `GET /skills` | `gstack-harness unregister dots` |
| QM | 三个技能（`gstack-investigate`、`gstack-review`、`gstack-plan`），采用 QM 自己的技能格式，来自 `qm/sandbox/skills/`（[qm/README.md](https://github.com/garrytan/gstack/blob/main/qm/README.md)）。`gstack-harness register qm --yes` 仍会在发送任何东西之前停下：QM 导入技能包要克隆整个仓库，且上限 32 MiB、5,000 个文件，而 gstack 仓库约 73 MiB（[原因](/troubleshooting/#harness-qm-pack-too-large)） | 把 `qm/sandbox/skills/gstack-*` 复制进 `<deploy dir>/sandbox/skills/` 并运行 `qm up` | 让它调用一个 gstack 技能 | 删除目录后再次运行 `qm up` |
| Muse Code, Grok Build | 不注册：两者都读 `~/.claude/skills`，所以 Claude 安装（`./setup`）就是它们看到的东西，带 Claude 工具名 | `./setup` | `gstack-harness status` 运行 `muse skills list` / `grok inspect` 并报告*已发现（Claude 渲染，未验证）* | `gstack-uninstall` |
| Grok Bot, any chat-only skill library | 磁盘上不写任何东西 | `gstack-harness register generic --print`，然后把路由和块粘贴进应用 | 让它调用一个 gstack 技能 | 删除粘贴的文本 |
| any other harness | 路由放进你指名的 Agent Skills 目录，和/或在你指名的上下文文件里 `<!-- gstack:begin harness-routing -->` 标记之间放一个 600 字节的路由块 | `gstack-harness register generic --skills-dir <dir>` 和/或 `--context <file>`；`gstack-harness manifest generic` 把每个技能打印为 JSON | 宿主自己的技能清单 | `gstack-harness unregister generic` |

<a id="start-hook"></a>
### 启动钩子（OpenClaw 与 Hermes，可选）

每个 gstack 技能的开头 Preamble 里都有一条命令（`gstack-skill-start`）负责
设置会话：是否无人值守、提问、同意、更新检查。在 OpenClaw 和 Hermes 里，
agent 会读 gstack 的技能却几乎从不运行那条命令（29 次机会中 1 次启动，
HARN-18）。启动钩子（start hook）是一个小小的 `gstack-start` 插件，在每个
用户回合放一条约 210 字符的提示，告诉 agent 先按原文一字不差地运行那条
命令，不加管道。

默认关闭，需要你自己开启，因为开启它会改动宿主自己的设置：

| | OpenClaw | Hermes |
|---|---|---|
| 插件目录 | `${OPENCLAW_STATE_DIR:-~/.openclaw}/extensions/gstack-start` (index.js, openclaw.plugin.json, package.json, note.txt) | `${HERMES_HOME:-~/.hermes}/plugins/gstack-start` (plugin.yaml, __init__.py, note.txt) |
| 钩子 | `before_prompt_build`，以 `prependContext` 返回该提示 | `pre_llm_call`，以 `context` 返回该提示 |
| 经宿主自家 CLI 改动的设置 | `openclaw.json` 中的 `openclaw config set plugins.entries.gstack-start.hooks.allowConversationAccess true` 和 `...enabled true`。OpenClaw 只有在该授权下才运行非自带插件的 `before_prompt_build`，这也让该插件的钩子能看到会话内容（插件只读自己的 note.txt） | `hermes plugins enable gstack-start` 把它加进 `config.yaml` 的 `plugins.enabled` |
| 检查 | `openclaw plugins inspect gstack-start --runtime --json` 在 `typedHooks` 下列出 `before_prompt_build` | `hermes plugins list` 显示 `gstack-start` 已启用 |

**开启**。`gstack-harness register openclaw --start-hook`（或 `hermes`），或
`gstack-config set harness_start_hook on` 后跟 `./setup`，或
`GSTACK_HARNESS_START_HOOK=1 ./setup --host openclaw`。先被设置的那个说了
算：`--start-hook`/`--no-start-hook` 标志，其次 `GSTACK_HARNESS_START_HOOK`
（`1`/`on` 或 `0`/`off`），再次 `harness_start_hook`，最后是注册台账里保存
的选择。无论谁拍板，选择都会被保存，刷新和升级会保留它。钩子只进宿主
profile 自己的插件目录；带自定义 `--skills-dir` 的注册，或
`OPENCLAW_CONFIG_PATH` 指向另一份 config 运行的 OpenClaw，拿不到钩子
（`--start-hook` 时报 `HARNESS_HOOK_UNSUPPORTED`；
`GSTACK_HARNESS_START_HOOK` 或 `harness_start_hook` 时，`register` 和
`./setup --host` 说明原因并以退出码 4 退出）。`OPENCLAW_CONFIG_PATH` 无论
经哪条路径解析到 profile 自己的 `openclaw.json`，都没问题。已开启的钩子在
之后某次运行恰逢 `OPENCLAW_CONFIG_PATH` 被设置时保持开启。

**先跑宿主自己的初始化**。gstack 只在宿主已有自己的配置（`openclaw
onboard` 产出的 `openclaw.json`、`hermes setup` 产出的 `config.yaml`）时
才开启钩子。没有配置的话，宿主 CLI 会创建一份只装着 gstack 插件设置的
配置，没有模型、提供商或终端设置，所以 gstack 不运行任何宿主命令：
插件的文件会写入，钩子报告 `written` 并附上要运行的初始化命令，
`register` 和 `./setup --host` 以退出码 4 退出。宿主就绪后，下一次
`./setup` 或 `gstack-harness refresh` 会开启钩子，只改动 `gstack-start`
插件条目。

**检查**。回执和 `gstack-harness status` 会显示 `start hook: active`
（已为新会话配置；运行中的 OpenClaw 或 Hermes 网关会在重载或重启时接上）、
`written`（文件就位但未激活，附原因和修复命令）、`disabled`（你在宿主里
关掉了它）、`unknown`（宿主 CLI 不在 `PATH` 上，比如在 OpenClaw 或
Hermes 自己的终端工具里，且配置文件定不了论；此时 gstack 改从 Hermes 的
`config.yaml` 读 `plugins.enabled` 和 `plugins.disabled`，从 `openclaw.json`
读插件条目）、`unchecked`（某次运行放过了已开启的钩子，或
`status --no-check`；`gstack-harness status` 会检查它）或 `off`。当开启
钩子的那次运行（或 `--start-hook`）结束时钩子仍未激活，`gstack-harness
register` 和 `./setup --host` 在注册技能之后以退出码 4 退出
（`HARNESS_HOOK_INACTIVE`）。之后的每次刷新和升级都会再试一次且不因此
失败，直到钩子激活或你在宿主里禁用该插件。

**关闭**。`gstack-harness register openclaw --no-start-hook`（或
`hermes`），或 `gstack-config set harness_start_hook off` 后跟 `./setup`。
两者都会经宿主 CLI 关掉插件并删除其目录。你也可以直接在宿主里关
（`openclaw config set plugins.entries.gstack-start.enabled false`、
`hermes plugins disable gstack-start`）；此后 gstack 随它去，绝不会再打开，
除非你再次传 `--start-hook`。`gstack-harness unregister` 和
`gstack-uninstall` 会随其余内容一并移除它（仅当 Hermes 侧目录里有被编辑
的文件或保留的 `.edited-*` 副本时改为禁用，这样你的编辑得以幸存），并在
宿主 CLI 不在 `PATH` 上时打印要运行的宿主命令。在没有宿主配置的 profile
里（没有 `openclaw.json` 或 `config.yaml`），钩子从未开启过，所以关闭或
注销不会运行任何宿主命令，也不碰配置。

**代价**。这条提示约 50 个 token，落在每个用户回合上，且每份副本都留在
会话历史里，所以长会话付得更多（主要是缓存读取）。HARN-18 的面板会测量
每次试验的附加成本。OpenClaw 还会记录它无法核实插件来路，因为这个插件是
gstack 直接写入的，而不是从 npm 或 ClawHub 安装的。

**唯一属主**。出现本注册没写过的 `gstack-start` 目录会拦下钩子
（`HARNESS_HOOK_OWNED_ELSEWHERE`）：从写下它的那个 gstack 安装去关闭，
或把它挪开。

下文 OpenClaw 的 ACP 路线不变：原生注册给 OpenClaw 自家 agent 的是
gstack 技能；ACP 则以完整安装拉起 Claude Code。

## OpenClaw

OpenClaw 通过 ACP 拉起 Claude Code 会话，所以只要 Claude Code 装了
gstack，每个 gstack 技能都能直接用。把下面这段话粘贴给你的 OpenClaw
agent：

> Install gstack: run `git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup` to install gstack for Claude Code. Then add a "Coding Tasks" section to AGENTS.md that says: when spawning Claude Code sessions for coding work, tell the session to use gstack skills. Include these examples — security audit: "Load gstack. Run /cso", code review: "Load gstack. Run /review", QA test a URL: "Load gstack. Run /qa https://...", build a feature end-to-end: "Load gstack. Run /autoplan, implement the plan, then run /ship", plan before building: "Load gstack. Run /office-hours then /autoplan. Save the plan, don't implement."

**装好之后，直接用自然语言跟你的 OpenClaw agent 交流即可：**

| 你说 | 会发生什么 |
|---------|-------------|
| "Fix the typo in README" | 简单任务——Claude Code 会话，无需 gstack |
| "Run a security audit on this repo" | 拉起 Claude Code 执行 `Run /cso` |
| "Build me a notifications feature" | 拉起 Claude Code 执行 /autoplan → 实现 → /ship |
| "Help me plan the v2 API redesign" | 拉起 Claude Code 执行 /office-hours → /autoplan，保存计划 |

高级分发路由与 gstack-lite/gstack-full 提示词模板见
[docs/OPENCLAW.md](/openclaw/)。

## OpenClaw 原生技能（经 ClawHub）

四个方法论技能，直接在你的 OpenClaw agent 里工作，无需 Claude Code 会话。
从 ClawHub 安装：

```
clawhub install gstack-openclaw-office-hours gstack-openclaw-ceo-review gstack-openclaw-investigate gstack-openclaw-retro
```

| 技能 | 作用 |
|-------|-------------|
| `gstack-openclaw-office-hours` | 用 6 个逼问式问题做产品拷问 |
| `gstack-openclaw-ceo-review` | 以 4 种范围模式做战略挑战 |
| `gstack-openclaw-investigate` | 根因调试方法论 |
| `gstack-openclaw-retro` | 每周工程复盘 |

这些是对话式技能。你的 OpenClaw agent 直接在聊天中运行它们。

## 一份检出为哪些 agent 渲染

显式 `--host X` 只为 X 安装，绝不改动其他 agent 的安装。`/gstack-upgrade`
刷新它注册过的每一份安装，每个宿主一行，并说明哪些失败了。

一份检出只为从它安装过的 agent 保留技能。setup 把它们记进
`.gstack-installed-hosts` 且绝不删掉任何一个，所以之后加一个 agent 只需
`./setup --host <name>`。为其他 agent 渲染的副本会被修剪：生成的文件移到
`~/.gstack/backups/host-renders/`，gstack 无法证明是自己生成的文件原地
不动。全局 Claude 安装从 632 个 `SKILL.md` 文件（34.7 MB）减到它自己的
63 个（2.5 MB），这让 Cursor-agent 不再在技能树上卡死（#1694）。在开发
检出中，`bun run build` 仍渲染所有 agent；在安装内部只渲染记录过的那些，
`GSTACK_RENDER_HOSTS=all bun run build` 则全部渲染。

## 各宿主备注

Copilot 通过带前缀的名字（`/gstack-review`）调用 gstack 技能，因为
`/review` 是 Copilot 内置命令。Copilot 忽略技能钩子，所以 `/careful` 和
`/freeze` 在那里只起劝告作用；`COPILOT_HOME` 为 `~/.copilot` 以外的值
暂不支持（setup 拒绝且不做任何改动）。

Antigravity CLI 同样按带前缀的名字调用技能（`/gstack-review`）。setup 只写
`~/.gemini/antigravity-cli/skills/gstack*`：Gemini CLI 的 `~/.gemini/skills`
和设置绝不被碰；`--host auto` 仅在 `agy` 在 `PATH` 上或
`~/.gemini/antigravity-cli` 存在时才选中 Antigravity，对只有 Gemini CLI 的
`~/.gemini` 绝不如此。Antigravity 2.0 应用和 IDE 读的是
`~/.gemini/config/skills`，本宿主不安装到那里。

Gemini CLI 会在任务匹配时自行加载 gstack 技能（`activate_skill`，需你
批准）；点名要 `gstack-office-hours`，或用 `/skills list` 列出它们。setup
只写 `~/.gemini/skills/gstack*`，绝不写 `~/.agents/skills`；`--host auto`
仅在 `gemini` 在 `PATH` 上时才选中 Gemini CLI。在带有项目级 Codex 安装的
仓库里，Gemini CLI 使用 `.agents/skills` 中的 Codex 技能（工作区层级
优先），且工作区技能只在受信任目录中加载（`/trust`）。

外部评审（outside review）要求所选 CLI 已安装并通过认证：在 Codex 里用
gstack 时是 Claude Code，在其他宿主上则是 Codex。外部宿主以
`/gstack-claude-code` 和 `/gstack-codex` 之名发现这些命令；每个宿主省掉
自己的那个包装。显式指定提供方时就用该提供方。既有的 `codex_reviews`
设置在受支持处控制自动外部评审，与所选提供方无关。

`/claude` 已更名为 `/claude-code`。重新运行 `./setup --host <name>` 即可
迁移受管安装，包括共享该检出的其他宿主。若替换生成或安装失败，setup
保留先前的安装并打印修复指引。

## 仅指令型 agent

**仅指令层级**（instruction-only，适用于任何读规则但不加载技能的
agent——Zed、Amp、Jules、各种副业项目）：把
[`agents-digest/gstack-AGENTS.md`](https://github.com/garrytan/gstack/blob/main/agents-digest/gstack-AGENTS.md)
这份 2KB 摘要复制到你 agent 会读的位置（例如追加到项目的 `AGENTS.md`）。
它承载 gstack 的精神内核、复用阶梯和行文规则——无需安装。摘要第一行标着
它的 gstack 版本；升级后请重新复制。

## Codex：行为配置与模型选择

对 Codex，setup 读取 `${CODEX_HOME:-~/.codex}/config.toml` 的顶层 `model`
并生成匹配的行为配置（behavioral profile），未配置可用模型时回退到
`gpt-6-astra`。当前 OpenAI 层级为 `gpt-6-astra`（frontier 层）、
`gpt-6.1-sol`（smart 层，默认评测层级）和 `gpt-6-luna`（最低成本）；
`gpt-6.1-sol` 和 `gpt-6-luna` 用通用 GPT 配置。只有 `gpt-5.6-sol` 会收到
限定范围的指令——完成所请求的 lake 而不扩张到相邻清理或投机性加固——
因为那个补丁是在 5.6 Sol 上测的；推广到 `gpt-6.1-sol` 要等它自己的范围
评测。Sol 配置只精确匹配：带日期的快照和其他 5.6 变体都用通用 GPT 配置，
且 setup 会对 `gpt-5.6-sol-2026-08-01` 这类近似名发出警告。用
`./setup --host codex --model <id>` 覆盖检测——该覆盖仅对当次运行生效；
要让它在升级后保持，请在 Codex 的 `config.toml` 里设置 `model`。更改
Codex 模型后，重新运行 `./setup --host codex` 再生成技能。

**方案评审与实现层级**。方案工作流使用独立的 `frontier` 评审者：Codex 侧
的 Fable 5.1，或 Claude Code 侧的 GPT-6 Astra。实现交接推荐 `smart`
层级：Opus 5.5 或 GPT-6.1 Sol。也可以选别的层级、钉住任一提供方的模型，
或用 `host` 模式保留原生模型设置。只读的 `gstack-models` 命令解释生效的
选择；改这些设置不需要再生成技能，也不会切换你正在运行的会话。每周维护
检查会标记官方推荐的变更和退役通知，但不会自动改模型。见
[模型策略：安装、覆盖与时效](https://github.com/garrytan/gstack/blob/main/docs/model-policy.md)。

**其他 Codex 调用保持既有选择**。没有显式 `plan-review` 角色时（包括普通
评审和 /ship 的对抗性审查轮），gstack 按以下顺序选模型：你在该请求中点名
的模型，然后是 `GSTACK_CODEX_MODEL`，再是 Codex `config.toml` 里的
`model`（原生 `codex review` 则先看 `review_model`；自定义 `CODEX_HOME`
也受尊重），最后才轮到 gstack 的默认值 `gpt-6-astra`。花钱之前它会打印
选择及其来源，例如
`CODEX_MODEL: gpt-5.6-terra (exec; source: ~/.codex/config.toml model)`。
如果你的选择无效或你的账号用不了，gstack 会带着修复信息停下，并把该
外部评审报告为不可用。它绝不悄悄换回默认值。嵌套 Codex 评审还在隐藏已
安装技能的状态下运行（`-c skills.include_instructions=false`），因此一次
评审不会变成一整场嵌套技能运行。运行时模型选择与上面安装时的行为配置是
两回事。无 plan-review 角色时，`/claude-code`（Codex 上为
`gstack-claude-code`）保留 Claude 已配置的模型。设置
`GSTACK_CLAUDE_MODEL=<model>` 或在请求中点名模型即可为该次调用覆盖它，
包括续开的咨询。抓取、评审模型与基准测试的模型选择见
[评测默认值与覆盖](/contributing/#测试与评测)。

## 设计二进制程序的模型

设计二进制程序（`$D`）默认使用 OpenAI 的 `gpt-5.5`，图像生成走
`gpt-image-2`。设置 `GSTACK_DESIGN_MODEL=<model>` 可为图像生成和截图分析
改用另一个 gpt-5 级模型；若 OpenAI 拒绝它，报错会点名
`GSTACK_DESIGN_MODEL`。设置 `GSTACK_DESIGN_IMAGE_MODEL=<gpt-image model>`
可改图像工具模型；不是 gpt-image 模型名的值会在发出任何请求前被拒。用
`bun run design/scripts/live-model-check.ts` 对照默认值检查密钥——它始终
测试默认模型并忽略两个覆盖变量；每周的定期普查跑同一检查。设置
`OPENAI_BASE_URL` 可把每次 `$D` 调用发给 OpenAI 兼容网关而非
`api.openai.com`；出站回执（egress receipt）会记录网关主机。在 Codex 上，
`/design-shotgun` 改用 Codex 内置的 `$imagegen` 技能生成视觉稿，因此
不需要 `OPENAI_API_KEY`；`$D` 仍会构建并提供对比看板。

### 没有 OpenAI key 时的 Gemini

没有 OpenAI key 时，`$D` 改用 Google 的 Gemini，这样没有 OpenAI key（或
所属 OpenAI 组织未通过身份验证）的人也能拿到真正的视觉稿而非线框图。从
[Google AI Studio](https://aistudio.google.com/apikey) 创建 Gemini key 免费：
`export GEMINI_API_KEY=...` 或 `$D setup --provider gemini`。

| | OpenAI | Gemini |
|---|---|---|
| 何时选用 | 设置了 OpenAI key（永远优先） | 没有 OpenAI key，或 `GSTACK_DESIGN_PROVIDER=gemini` |
| 密钥 | 先 `~/.gstack/openai.json`，后 `OPENAI_API_KEY` | 先 `~/.gstack/gemini.json`，后 `GEMINI_API_KEY` |
| 图像 | `gpt-5.5` 驱动 `gpt-image-2` | `gemini-nano-banana-2.1`（`GSTACK_DESIGN_IMAGE_MODEL`） |
| 截图解读 | `gpt-5.5` | `gemini-3.8-flash`（`GSTACK_DESIGN_MODEL`） |
| 出站台账汇聚端 | `design-openai` | `design-gemini` |

`GSTACK_DESIGN_PROVIDER=openai|gemini` 显式二选一；当同时设置了 OpenAI
key 时，`$D setup --provider gemini` 会保存该密钥并把上面那条 export 作为
最后一行打印出来，因为否则 OpenAI 仍然优先。所选提供方上的失败绝不在另
一方重试；OpenAI 组织验证错误的末尾是那条切换到 Gemini 的提示。在 Gemini
上，模型覆盖必须是 `gemini-…` 名字，`--size` 必须是 1536x1024、1024x1024
或 1024x1536（以宽高比发送），`--quality` 被忽略，`OPENAI_BASE_URL` 不
适用。Google 免费档下，Gemini API 的提示词和图像可能被用于改进 Google
产品；`$D` 每次运行都会说明这一点。
`bun run design/scripts/live-gemini-check.ts` 对照默认值检查 Gemini 密钥
（免费的模型查询，然后一次图像调用和一次视觉调用）。

## 新增一个宿主

**想为另一个 agent 添加支持**？见 [docs/ADDING_A_HOST.md](/adding-a-host/)。
渲染一个新 agent 只需一个 TypeScript 配置文件；要能安装还需要一支安装
分支（setup arm）和一致性测试套件（conformance kit），且起步为实验性
（experimental）。
