---
title: "智能体启动指南"
---

版本：0.2.0
最后验证：2026-04-11
适用于：OpenRig 0.1.x

本指南教你如何思考智能体的启动体验里应当放什么——要写哪些文件、放在哪里、分层模型如何交付它们。它是一份编写指南，不是 schema 参考。字段级的细节见 `rig-spec.md` 与 `agent-spec.md`。

---

## 启动的两个类别

智能体在启动时收到的一切，都属于以下两个类别之一：

### 类别 1：上下文加载

智能体把 markdown 文件读入上下文窗口。这是 OpenRig 当前的**主要机制**，也是你最值得投入编写精力的地方。

上下文加载塑造了智能体知道什么、相信什么、能做什么：
- 它是谁（角色、身份、所属工作舱（pod））
- 团队如何运作（文化、沟通规范、协调协议）
- 项目是什么（代码库上下文、架构、领域知识）
- 它能做什么（技能、SOP、操作规程）
- 它的环境是什么样的（服务、访问凭据、工具）

### 类别 2：确定性配置

rig spec 以声明方式把以下内容安装进智能体的运行时环境：
- 钩子（git 钩子、pre-commit 脚本）
- 权限（`.claude/settings.json` 允许列表、审批模式）
- MCP（Model Context Protocol 服务器）
- 系统依赖（工具、软件包）

如今哪些可靠、哪些仍属实验性，见本指南末尾的**当前支持矩阵**一节。

**v0.2.0 的建议**：把尽可能多的设置逻辑放进类别 1（通过 markdown 文件做上下文加载）。在启动文件中描述期望的最终状态，让智能体自行处理配置。确定性路径在规格中确实存在，并且会随时间推移变得更可靠，但目前能在各运行时之间一致工作的，是上下文加载这条路径。

---

## 上下文加载：什么放在哪里

### 技能与启动文件——关键区别

**技能**（skill）是可复用的 SOP。它们教智能体如何去做某件事——如何使用 OpenRig、如何做 TDD、如何运行代码评审、如何操作 Vault。技能可以跨 rig 使用。你写一次的技能，任何 rig 中的任何智能体都能用。

**启动/指引文件**则与特定的 rig、特定的角色绑定。它们告诉智能体它是谁、正在做什么、以及这个特定团队如何运转。它们按 rig 编写，通常还按工作舱或按成员编写。

| 什么情况放进技能 | 什么情况放进启动/指引文件 |
|---|---|
| 这份知识可跨 rig 复用 | 这份知识只属于这个 rig 或项目 |
| 它教的是流程或方法论 | 它教的是身份、角色或团队上下文 |
| 这类智能体的任何实例都可能用得上 | 它只对这个特定拓扑中的智能体有用 |
| 示例：`openrig-user`、`test-driven-development`、`vault-user` | 示例：`role.md`、`CULTURE.md`、`startup/context.md` |

### 技能的双保险模式

技能通过两条并行路径交付给智能体：

1. **规格声明**：agent spec 的 `resources.skills` 加上 profile 的 `uses.skills`，确保技能文件被投影（projection）到智能体的工作区（在运行框架（harness）启动前安装）
2. **启动指令**：指引/启动文件告诉智能体实际去读取并加载这些技能

两条路径都重要。规格投影确保文件物理存在；启动指令确保智能体知道要去读它们。这种冗余是有意的——它应对的是其中一条路径失效的情况。

例如：某个实现者智能体的启动指引写着"加载以下技能：openrig-user、test-driven-development、systematic-debugging"，同时 agent spec 的 profile 也使用同样的技能 ID。智能体通过投影拿到文件，通过指引得到读取它们的指令。

### 文件类型

**角色指引**（`guidance/role.md`）

告诉智能体它是谁、职责是什么：
- 头衔与主要职能
- 具体职责（列表）
- 工作节奏（智能体日常如何运转）
- 原则（行为准则）
- 与其他团队成员的关系

这是智能体的身份文档。每个智能体都该有一份。

**rig 文化**（`CULTURE.md`）

rig 级的文化（culture）章程，应用于 rig 中的所有智能体：
- 沟通规范（用 `rig send`/聊天室，而不是直接用 tmux）
- 协调协议（工作如何在各工作舱之间流转）
- 质量标准（"完成"意味着什么）
- 提交/合并策略
- 上报规则

把它当作每个团队成员第一天就要读的团队操作手册。

**启动上下文**（`startup/context.md`）

针对该智能体运行环境的启动锚定（grounding）信息：
- 身份恢复指令（`rig whoami --json`）
- 环境细节（服务 URL、访问凭据、端口）
- 系统检查指令（什么应当在运行、如何验证）
- 角色专属的委派信息（该找谁、谁会把工作委派给你）

这对托管应用的专家智能体尤其重要（例如 Vault 专家需要知道 Vault 地址和开发令牌）。

**项目文档**

教智能体了解项目的 rig 级启动文件：
- 架构概览
- 关键约定
- 领域词汇
- 近期上下文（最近发生了什么、有什么正在进行）

它们放在 rig 级或工作舱级启动块中，交付给相关智能体。

---

## 分层模型

启动内容由各层叠加合并。每一层都在前几层提供的内容之上增补。后面的层并不会替换前面的层——它们只是追加。

### 各层（按交付顺序）

```
1. Agent layer     — from the AgentSpec's top-level startup block
2. Profile layer   — from the active profile's startup block
3. Rig layer       — from the RigSpec's top-level startup block
4. Culture layer   — from the RigSpec's culture_file
5. Pod layer       — from the pod's startup block
6. Member layer    — from the member's startup block in the RigSpec
7. Operator layer  — injected at runtime (openrig-start overlay, context collector, etc.)
```

### 每一层的用途

| 层 | 编写者 | 用途 | 内容示例 |
|---|---|---|---|
| Agent | agent spec 作者 | 随该智能体类型一同携带的核心身份与能力 | 角色指引、默认技能 |
| Profile | agent spec 作者 | profile 特有的差异变体 | "default" 与 "minimal" profile 的不同技能组合 |
| Rig | rig spec 作者 | 面向所有智能体的 rig 级上下文 | 团队规范、项目文档 |
| Culture | rig spec 作者 | rig 章程 | `CULTURE.md`——沟通、质量、运营哲学 |
| Pod | rig spec 作者 | 工作舱级协调上下文 | 工作舱 SOP、舱内工作流 |
| Member | rig spec 作者 | 单个成员的覆盖内容 | 成员专属指令、特定 cwd 的上下文 |
| Operator | OpenRig 系统 | 系统注入的运行时内容 | `openrig-start.md`、上下文收集器 |

### 实践建议

**大多数 rig 只需要三层**：agent（role.md）、rig（culture）与 operator（openrig-start）。从简单开始。只有当同一工作舱内的智能体需要不同的启动内容时，才增加工作舱层和成员层。

**文化层价值很高，却常被跳过**。没有 `CULTURE.md` 的 rig，只能靠智能体去猜团队如何沟通、如何协调。写一个吧。哪怕很短的文化文件，也能显著提升团队的协同一致性。

**成员级启动用于例外，而非常态**。如果每个成员都有自己的启动块，分层模型就沦为配置倾倒场。应把共享内容上收到工作舱层或 rig 层。

---

## 交付机制

### 文件如何到达智能体

| 交付提示 | 时机 | 方式 | 用途 |
|---|---|---|---|
| `auto` | 运行框架启动前 | 由系统选择 | 默认值——交给 OpenRig 决定 |
| `guidance_merge` | 运行框架启动前 | 以托管块形式合并进 `CLAUDE.md` / `AGENTS.md` | 角色指引、文化、项目上下文 |
| `skill_install` | 运行框架启动前 | 复制到运行时的技能目录 | 技能 |
| `send_text` | 运行框架就绪后 | 通过 tmux 以文本形式发送到智能体的终端 | 启动锚定、身份提示、阅读技能的指令 |

### 交付时机很重要

通过 `guidance_merge` 与 `skill_install` 交付的文件，发生在智能体的运行框架启动**之前**。智能体一开始就能看到它们——它们是初始上下文的一部分。

通过 `send_text` 交付的文件，发生在运行框架就绪**之后**。智能体以终端消息的形式收到它们。适用于：
- 身份锚定（智能体读取并处理这些指令）
- 加载技能的指令（文件已投影到位，消息告诉智能体去读它们）
- 那些应当像操作员简报、而非预加载内容的上下文

### `applies_on` 字段

每个启动文件和启动动作都指定了自己的生效时机：
- `fresh_start`——仅在首次启动时交付
- `restore`——从快照恢复时交付
- 默认：`[fresh_start, restore]`（两者皆有）

用它来避免重发智能体在恢复的会话中已经拥有的上下文。例如，一次性的项目简报可以只在 `fresh_start` 时生效，而身份锚定则应两者都适用。

---

## 确定性配置

AgentSpec 与 RigSpec 允许声明确定性的环境配置：

### 规格支持的内容

**钩子**（位于 `resources.hooks`）：
```yaml
resources:
  hooks:
    - id: pre-commit
      path: hooks/pre-commit.sh
      runtimes: [claude-code]
```
钩子是被复制到智能体工作区的脚本，可以是 git 钩子、自动化脚本或环境设置。

**运行时资源**（位于 `resources.runtime_resources`）：
```yaml
resources:
  runtime_resources:
    - id: claude-settings
      path: runtime/claude-settings.fragment.json
      runtime: claude-code
      type: claude_settings_fragment
```
投影到智能体运行时环境中的运行时专属配置文件。

**启动动作**（位于 `startup.actions`）：
```yaml
startup:
  actions:
    - type: send_text
      value: "/install-mcp my-server"
      phase: after_ready
      idempotent: true
```
在智能体就绪后发送到其终端的命令，可用于安装 MCP、运行设置命令等。

### 当前支持矩阵（OpenRig 0.1.x）

| 能力 | 状态 | 说明 |
|---|---|---|
| 指引文件投影（`guidance_merge`） | **支持** | 可靠。主要交付机制。 |
| 技能投影（`skill_install`） | **支持** | 可靠。技能会复制到工作区。 |
| 就绪后的 `send_text` 交付 | **支持** | 可靠。要求运行框架已就绪。 |
| 钩子投影 | **实验性** | 文件会复制，但执行/集成情况因运行时而异。 |
| 运行时资源投影 | **支持已识别的 fragment** | `claude_settings_fragment`、`claude_mcp_fragment` 与 `codex_config_fragment` 会应用到提供商配置；未知类型则复制到运行时扩展目录。 |
| 权限配置 | **原生设置加托管启动旗标** | OpenRig 启动 Claude 时带 `acceptEdits`、启动 Codex 时带 `workspace-write`，除非受支持的显式选择改变了它们。它不会添加全局的 Claude `Bash(rig:*)` 许可规则。如何选择加入与自定义，见[首位用户权限指南](/reference/getting-started/#选择性加入的宽松运行)。 |
| MCP 安装 | **实验性** | Claude Code：使用 `/mcp` 交互命令或命令行的 `claude mcp add`。也可以在启动文件中描述，让智能体自行配置。可靠性取决于运行时的 TUI 状态。 |
| 系统依赖安装 | **非确定性** | 在启动文件中描述；由智能体通过 shell 命令处理。 |
| 周期任务/唤醒计时器 | **取决于运行时** | Claude Code 通过 `/loop` 命令支持周期任务；Codex 尚无经确认的等价物。编排智能体应在 Claude Code 智能体的启动内容中包含 `/loop` 指令。 |

### v0.2.0 的做法：先描述，再让智能体自行处理

对于 `guidance_merge`、`skill_install` 与 `send_text` 之外的任何事情，推荐做法是：

1. **在启动文件中描述期望的最终状态**（例如："你需要配置好这些 MCP 服务器、设置好这些权限、安装好这些钩子"）
2. **在启动指令中包含系统检查**（"验证你的环境：检查 X 是否已安装、Y 是否已配置、Z 是否可访问"）
3. **让智能体有能力自行配置**（"如果其中有缺失，就安装/配置它们"）
4. **可选：同时在规格中声明**，以待确定性支持改进——规格充当蓝图，启动文件充当后备指令

这样一来，当确定性支持完全可靠时，智能体启动后会看到一切已经由确定性路径设置就绪，接着运行系统检查、确认一切正常，然后继续工作。在那之前，智能体会读取指令并自行完成设置。

### 运行时配置披露

OpenRig 会为托管会话执行尽力而为的确定性运行时配置。核心引导保持最小化；用户/自定义策略应放进规格选定的运行时资源。这些写入是有意的侵入式操作，应当坦率披露：

- Claude 全局配置：`~/.claude/settings.json`
  OpenRig 不再在这里写入核心的 `Bash(rig:*)` 权限许可规则。较旧的安装可能仍残留一条；已有的用户设置不会被移除。
- Claude 全局状态：`~/.claude.json`
  用途：预信任托管工作区，并为全新托管会话把引导流程（onboarding）标记为已完成。
- Claude 项目级配置：`.claude/settings.local.json`
  用途：在项目内应用上下文收集器/活动钩子以及选定的 `claude_settings_fragment` 资源，且不把它们提交进 git。
- Claude 项目级 MCP 配置：`.mcp.json`
  用途：在该项目中为 Claude 应用选定的 `claude_mcp_fragment` 资源。
- Codex 全局配置：`~/.codex/config.toml`
  用途：预信任托管工作区，并应用选定的 `codex_config_fragment` 资源。Codex 目前没有与全局 profile 设置对应的等价项目级 MCP 配置路径。

两条重要注意事项：
- 这些写入是尽力而为的，仍应配合启动指引，让本地智能体可以在需要时验证并修复它们
- 已在运行的被接管（adopted）会话可能需要重启，才能读到新写入的配置

权限模式与运行时资源投影是彼此独立的。选定的 fragment 可以影响原生配置，但 OpenRig 的启动旗标可以覆盖这些值。在配置呈现面上记录了 `permission_policy`，并不证明其规则已被转换或应用。参见[权限优先级与限制](/reference/getting-started/#自定义设置与优先级)。

### 运行时差异

**Claude Code**：
- 从 `CLAUDE.md` 与 `.claude/` 目录读取
- 周期任务通过 `/loop` 命令实现（例如 `/loop 5m "check rig health"`）——这不是钩子；钩子是事件驱动的
- MCP 服务器管理通过 `/mcp` 交互命令或命令行的 `claude mcp add` 完成
- `.claude/settings.json` 中的事件驱动钩子系统——对 `PreToolUse`、`PostToolUse`、`SessionStart` 等事件做出反应（不基于时间）
- 通过 `.claude/settings.json` 做权限允许列表（`permissions.allow`、`permissions.deny`、`permissions.defaultMode`）
- 可以根据启动指令自行配置 MCP 服务器、权限与钩子

**Codex**：
- 从 `AGENTS.md` 与 `.agents/` 目录读取
- 周期任务支持有限——没有经确认的、与 Claude Code `/loop` 命令等价的机制
- MCP 配置机制与 Claude Code 不同
- 审批策略与沙箱访问是相互独立的控制项。OpenRig 默认的 `-s workspace-write` 选定的是沙箱，并不强制 `-a`。成员的 `codex_config_profile` 选择原生 `-p`，与 AgentSpec 的 `profile` 不同。
- 可以根据指令自行安装依赖，但计时器/周期行为并不可靠可用

编写启动内容时，要注明哪些指令是运行时专属的。例如，需要监控循环的编排智能体应包含这样的指令："如果运行的是 Claude Code，用 `/loop 3m` 周期性地检查 rig 健康状况；如果运行的是 Codex，则改为在每个任务周期开始时检查 rig 健康状况。"

---

## 模式与反模式

### 良好模式

**从角色 + 文化 + 一个技能开始**
```
agent.yaml → guidance/role.md
rig.yaml → culture_file: CULTURE.md
profile → uses.skills: [openrig-user]
```
这是最小有效启动。智能体知道它是谁、团队如何运作、如何使用 rig。

**把项目上下文与角色分开**

不要把项目文档塞进角色指引。角色关乎智能体的职能，项目上下文关乎智能体正在做什么。项目上下文应放进 rig 级或工作舱级启动文件。

**明确告知智能体它拥有哪些技能**

在启动文件或指引中写上一句类似的话：
```
You have the following skills loaded: openrig-user, test-driven-development, systematic-debugging. Use them.
```
这会促使智能体真正调用这些技能，而不是仅把它们当作被动的上下文。

**在启动上下文中包含系统检查**

```
## System Check

After identity recovery, verify:
1. `rig ps --nodes` shows your rig running (scoped to your session's rig by default; outside a managed session name it explicitly: `rig ps --nodes --rig <name>`)
2. `rig env status` shows services healthy (if applicable)
3. Your working directory is correct
4. Required tools are available (node, npm, git, etc.)

If anything is missing, fix it before starting work.
```

### 反模式

**把所有东西都塞进一个巨大的 CLAUDE.md**

不要这样做。用分层模型。角色放进 agent spec，文化放进 rig spec，项目上下文放进 rig/工作舱启动文件。如果所有内容都挤在一个文件里，任何一部分都无法复用。

**在指引文件中复制技能内容**

如果你发现自己在把某个技能里的文字复制进指引文件，停下来。改为引用那个技能。技能会被投影；指引应当指向它们，而不是复制它们。

**把应预加载的内容交给 send_text**

如果智能体在开始推理之前就需要知道某件事，用 `guidance_merge`（启动前交付），而不要用 `send_text`（启动后交付）。`send_text` 适合让智能体作为第一项任务去处理的指令，不适合基础性上下文。

**成员级启动过度指定**

如果每个成员都有一大段启动块，rig spec 就会变成配置倾倒场。把共享内容上收到工作舱层。成员级启动应当是少量覆盖，而不是完整的智能体简报。

**把关键设置押在确定性钩子上**

如果你的 rig 的运转必须依赖某个钩子，而钩子安装静默失败，智能体不会知道出了问题。确定性配置一定要搭配能验证结果的启动指令或系统检查。

---

## 编写清单

为新智能体创建启动体验时：

- [ ] 编写 `guidance/role.md`——这个智能体是谁？
- [ ] 在 agent spec 的 `resources.guidance` 与 `startup.files` 中都引用它
- [ ] 如果 rig 还没有 `CULTURE.md`，写一个
- [ ] 通过 profile 的 `uses` 从共享池中挑选技能
- [ ] 如果智能体需要环境锚定，编写 `startup/context.md`
- [ ] 在启动上下文中包含系统检查
- [ ] 验证 agent spec 能通过校验：`rig agent validate agent.yaml`
- [ ] 验证 rig spec 能通过校验：`rig spec validate rig.yaml`
- [ ] 运行建议性的编写检查：`rig spec audit rig.yaml`
- [ ] 实际启动 rig，检查智能体收到了预期的内容
