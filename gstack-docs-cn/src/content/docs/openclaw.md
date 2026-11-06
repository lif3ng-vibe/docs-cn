---
title: "gstack 与 OpenClaw 的集成"
---


gstack 以方法论源的方式与 OpenClaw 集成，而不是一套移植过来的代码库。
OpenClaw 的 ACP 运行时原生生成（spawn）Claude Code 会话，gstack 提供的
规划纪律与方法论让这些会话变得更好。

这是一套编码为提示词文本的轻量协议。没有守护进程，没有 JSON-RPC，
没有兼容性矩阵。提示词就是桥梁。

## 架构

```
  OpenClaw                               gstack repo
  ─────────────────────                    ──────────────
  Orchestrator: messaging,                 Source of truth for
  calendar, memory, EA                     methodology + planning
       │                                        │
       ├── Native skills (conversational)       ├── Generates native skills
       │   office-hours, ceo-review,            │   via gen-skill-docs pipeline
       │   investigate, retro                   │
       │                                        ├── Generates gstack-lite
       ├── sessions_spawn(runtime: "acp")       │   (planning discipline)
       │       │                                │
       │       └── Claude Code                  ├── Generates gstack-full
       │           └── gstack installed at      │   (complete pipeline)
       │               ~/.claude/skills/gstack  │
       │                                        └── docs/OPENCLAW.md (this file)
       └── Dispatch routing (AGENTS.md)
```

## 分发路由

OpenClaw 在生成会话时决定使用哪一层级的 gstack 支持：

| 层级 | 何时使用 | 提示词前缀 |
|------|------|---------------|
| **简单（Simple）** | 单文件修改、笔误、配置变更 | 不注入 gstack 上下文 |
| **中等（Medium）** | 多文件功能、重构 | 追加 gstack-lite CLAUDE.md |
| **重度（Heavy）** | 需要某个特定 gstack 技能 | "Load gstack. Run /X" |
| **完整（Full）** | 完整功能、目标、项目 | 追加 gstack-full 管线 |
| **规划（Plan）** | "帮我规划一个 Claude Code 项目" | 追加 gstack-plan 管线 |

### 决策启发式

- 能否用不到 10 行代码完成？ -> **简单**
- 涉及多个文件但做法显而易见？ -> **中等**
- 用户点名的具体技能（/cso、/review、/qa）？ -> **重度**
- 是功能、项目或目标（而不是任务）？ -> **完整**
- 用户想先为 Claude Code 做规划、暂不实现？ -> **规划**

### 分发路由指南（用于 AGENTS.md）

完整的可直接粘贴段落位于 `openclaw/agents-gstack-section.md`，
把它复制进你的 OpenClaw AGENTS.md。

关键行为规则（放在分发层级之上）：

1. **永远生成会话，绝不改道。** 当用户要求使用任何 gstack 技能时，
   永远生成一个 Claude Code 会话，绝不叫用户自己去打开 Claude Code。
2. **解析仓库。** 用户点名了仓库就设为工作目录；不知道就问是哪个仓库。
3. **Autoplan 端到端运行。** 生成会话，让它跑完整条管线，在聊天里汇报。
   用户永远不必离开 Telegram。

### CLAUDE.md 冲突处理

在已有 CLAUDE.md 的仓库里生成 Claude Code 会话时，把 gstack-lite/full
作为新章节追加进去，不要替换仓库现有的指令。

## gstack 为 OpenClaw 生成什么

所有产物都在 `openclaw/` 目录下，由
`bun run gen:skill-docs --host openclaw` 生成：

### gstack-lite（中等层级）
`openclaw/gstack-lite-CLAUDE.md` —— 约 15 行规划纪律：
1. 修改前读完每个文件
2. 写一份 5 行计划：做什么、为什么、哪些文件、测试用例、风险
3. 用决策原则化解歧义
4. 汇报完成前先自审
5. 完成报告：发布了什么、做了哪些决定、哪些还不确定

经 A/B 测试：耗时翻倍，输出显著更好。

### gstack-full（完整层级）
`openclaw/gstack-full-CLAUDE.md` —— 串联既有 gstack 技能：
1. 读 CLAUDE.md，理解项目
2. 运行 /autoplan（CEO + 工程 + 设计评审）
3. 实现获批的计划
4. 运行 /ship 创建 PR
5. 带 PR URL 和决定汇报回来

### gstack-plan（规划层级）
`openclaw/gstack-plan-CLAUDE.md` —— 完整评审连闯，不做实现：
1. 运行 /office-hours 产出设计文档
2. 运行 /autoplan（CEO + 工程 + 设计 + DX 评审 + codex 对抗评审）
3. 把评审过的计划存到 `plans/<project-slug>-plan-<date>.md`
4. 汇报回来：计划路径、摘要、关键决定、建议的下一步

编排器会把计划链接持久化到它自己的记忆存储（brain 仓库、知识库，
或 AGENTS.md 里配置的任何东西）。等用户准备好动工时，生成一个
引用已存计划的完整层级会话。

### 原生方法论技能
发布到 ClawHub，用 `clawhub install` 安装：
- `gstack-openclaw-office-hours` —— 产品拷问（6 个逼问式问题）
- `gstack-openclaw-ceo-review` —— 战略挑战（10 节评审、4 种模式）
- `gstack-openclaw-investigate` —— 运维排障（4 阶段方法论）
- `gstack-openclaw-retro` —— 运维复盘（每周回顾）

源码在 gstack 仓库的 `openclaw/skills/`。这些是为 OpenClaw 对话场景
手工打磨的 gstack 方法论改写版，不带任何 gstack 基础设施（没有浏览器、
没有遥测、没有 Preamble）。

## 被生成会话的检测

当 Claude Code 运行在 OpenClaw 生成的会话里时，应当设置 `OPENCLAW_SESSION`
环境变量。gstack 检测到它会做如下调整：
- 跳过交互式提问（自动选择推荐项；破坏性或不可逆选项绝不自动选——
  保守的那个选项胜出，并记录进完成报告）
- 在发射时抑制交互式上手流程指令块（更新检查、遥测提示、功能发现、
  路由注入、小贴士），让一次性提示为下一个人类会话完整保留
- 抑制 Conductor 的散文信号（`CONDUCTOR_SESSION: true`）——Conductor
  工作区里被生成的会话会自动选择，而不是对着空气渲染散文
- 聚焦任务完成与文字汇报

`sessions_spawn` 没有逐次生成的环境变量参数
（[openclaw/openclaw#51654](https://github.com/openclaw/openclaw/issues/51654)
在没有添加一个的情况下被关闭），所以工具调用里的 `env` 字段会被忽略。
请改为在 Claude ACP 宿主或 Gateway 服务的环境里设置 `OPENCLAW_SESSION=1`，
让凭据远离那个包装器，并从被生成的进程内部确认变量（例如
`echo $OPENCLAW_SESSION`），而不是信任会话的最后一条消息。

### 显式覆盖：GSTACK_SESSION_KIND

`GSTACK_SESSION_KIND=spawned` 是同一分类的显式逐命令标记，优先级高于
环境中的一切 env 标记（包括 `OPENCLAW_SESSION` 和 `GSTACK_HEADLESS`）。
它存在是因为 Claude Code 子代理会逐字节继承父会话的 env（#2733）——
派发技能在同一个命令行上给 Preamble 调用加前缀，以此标记它的子代理：

```bash
GSTACK_SESSION_KIND=spawned "$_SS" --skill "document-release" ...
```

gstack 自己也这么用：`/ship` 第 14.5 步在最终提交、验证与发布之前，
以此前缀派发 `/document-release` 子代理。它的发布专属作用域会覆盖通用的
被生成自动选择：有风险或不确定的文档变更作为阻塞项返回给父会话，
不提问也不自动批准。范围刻意收窄：只认 `spawned` 和 `unattended`
（`unattended` 是另一个显式选择的契约，面向会读取运行产物的父会话；
见 [unattended.md](https://github.com/garrytan/gstack/blob/main/docs/unattended.md)）——
`headless` 已有 `GSTACK_HEADLESS`，让一个 env 变量把 `interactive`
强加在 CI 标记之上会是个误分类的坑。空值或其他值保留并忽略（落回
环境检测）。注意 hook 进程继承宿主 env，所以逐命令前缀永远到不了
PreToolUse/PostToolUse hook——hook 文本里为这种拓扑带了一句被生成会话的
逃生指令（`hosts/claude/hooks/spawned-directive.ts`）。

**篡改可见性。** 任何能注入会话级 env 的机制（克隆仓库的
`.claude/settings.json` env 块、direnv、CI 包装器）都可以给真人的会话
设置 `GSTACK_SESSION_KIND=spawned`，悄悄把它的确认门禁翻成自动选择。
当 env 覆盖驱动分类时，Preamble 会发出一行响亮的
`SPAWNED_OVERRIDE: env` 状态行，让会话记录显示这个会话为什么算被
生成——审计不可信仓库里的 `.claude/settings.json` env 块（/cso 覆盖
这一点）。

## 安装

OpenClaw 用户：对你的 OpenClaw agent 说 "install gstack for openclaw."

agent 应该：
1. 把 gstack-lite CLAUDE.md 装进它的编码会话模板
2. 安装 4 个原生方法论技能
3. 在 AGENTS.md 里加分发路由
4. 用一次测试生成来验证

**原生技能或 ACP。** `./setup --host openclaw`（或在 OpenClaw 会话里
运行的 `./setup`）把 gstack 的技能给 OpenClaw 自己的 agent：五个任务
技能（review、investigate、qa、ship、plan-eng-review）直接列出，其余
技能归入一个 `gstack` 路由技能，位于 `$OPENCLAW_STATE_DIR/skills`，
以 OpenClaw 的工具名渲染并指向已安装的 gstack，由 agent 自己运行
gstack 的工作流与辅助工具。工作应该发生在带完整安装（hooks、Claude
工具名）的 Claude Code 会话里时，用 ACP；该由 OpenClaw agent 亲自做时，
用原生技能。两者可以同时安装。OpenClaw 要么完整提供已注册技能的
`SKILL.md`，要么拒绝；在不知道模型上下文窗口时上限 32,768 字节
（有 100K-200K-token 窗口时为 32,000 字符），所以超过 32,000 字节的
技能（五个中的 review、investigate、ship 和 plan-eng-review）注册为一个
短条目，告诉 agent 去读该技能在 `gstack/skills/` 里的完整 `SKILL.md`——
那里是每个技能的普通副本，OpenClaw 分页读取（`--skills all` 下在
`.gstack-skills/`）。
安装、验证与移除：[hosts.md](/hosts/#agent-宿主)。
OpenClaw 里的 agent 会读 gstack 的技能，却几乎从不运行它们的启动命令，
所以有一个可选的[启动钩子](/hosts/#start-hook)：`gstack-harness register
openclaw --start-hook` 会添加一个 `gstack-start` 插件，在每个用户回合
放一行提示，并通过 `openclaw config set` 授予它 OpenClaw 的
`before_prompt_build` 所要求的会话访问权。

`openclaw/` 里的 ACP 产物由 `bun run gen:skill-docs --host openclaw` 生成。

## 我们不做的事

- 没有分发守护进程（会话生成由 ACP 处理）
- 没有 Clawvisor 中继（不需要安全层）
- 没有双向学习桥（brain 仓库就是知识存储）
- 没有 JSON schema 或协议版本化
- gstack 不提供 SOUL.md（OpenClaw 有自己的）
- 没有手工移植的编码技能（原生注册复制的是生成的 OpenClaw 渲染版）
