---
title: "ai-memory 是什么？"
description: "给 AI 编码智能体的长期记忆——跨 CLI 共享、git 版本化的 markdown wiki。"
source: "https://github.com/akitaonrails/ai-memory"
---

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/logo-dark.png">
    <img alt="ai-memory" src="/logo-light.png" width="480">
  </picture>
</p>

> 给 AI 编码智能体的长期记忆。任务中途退出 Claude Code，
> 在同一目录启动 OpenAI Codex，无需重新解释架构、失败的尝试或悬而未决的问题，直接继续。

[![Release](https://img.shields.io/github/v/release/akitaonrails/ai-memory)](https://github.com/akitaonrails/ai-memory/releases/latest)
[![Rust](https://img.shields.io/badge/rust-1.95+-blue)](https://github.com/akitaonrails/ai-memory/blob/main/rust-toolchain.toml)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/akitaonrails/ai-memory/blob/main/LICENSE)

## 支持矩阵

| 领域 | 状态 | 说明 |
|---|---|---|
| Linux | 支持 | 主要的 Docker/服务器目标与 CI 平台。发布的 Docker 镜像支持 `linux/amd64` 与 `linux/arm64`。原生 Arch/AUR 包附带系统级与用户级 systemd 单元。 |
| macOS | 支持 | CI 运行 workspace 测试；带标签的发布提供原生 `ai-memory-macos-aarch64.tar.gz` 与 `ai-memory-macos-x86_64.tar.gz` 二进制。Apple Silicon 上推荐原生二进制路径。见 [macOS 支持](/macos/)。 |
| Windows（WSL2） | 支持 | 智能体 CLI 运行在 WSL2 内时，使用 WSL2 里的 Linux 安装路径。 |
| 原生 Windows | 实验性 | 带标签的发布提供 `ai-memory-windows-x86_64.zip`（含 `ai-memory.exe`）；也可用 Docker Desktop 包装器或源码构建。本地受支持的配置默认使用宿主原生钩子命令；Claude Code 可用其 Windows exec 形式，其他智能体用符合各自钩子 schema 的原生单命令字符串。PowerShell/Git Bash 脚本是兼容性回退。见 [Windows 支持](/windows/)。 |
| Claude Code | 支持 | MCP 配置 + 生命周期钩子；原生命令强制执行捕获排除。`install-mcp --session-aware` 可选地通过本地 stdio 桥启用按会话的 auto-scope 隔离。安装时加 `--capture-assistant` 且服务器启用 `capture_assistant` 时（双重选择启用，默认关闭），可选捕获助手最后一轮。 |
| Codex | 支持 | MCP 配置 + 生命周期钩子；原生命令强制执行捕获排除。没有自动的真会话结束钩子，需要最终摘要/交接时运行 `ai-memory finalize-session`。 |
| Command Code | 支持 | MCP 配置（`~/.commandcode/mcp.json`）+ 其四个稳定生命周期钩子事件（`~/.commandcode/settings.json`）；原生命令强制执行捕获排除，`SessionStart` 注入交接。`Stop` 只是回合边界，最后一轮之后用 `ai-memory finalize-session --agent command-code`。`ai-memory run command-code` 增加精确的 v3 原生会话恢复与可见事件导入；实验性的非沙箱 Mods 仍然排除。 |
| Devin CLI | 支持 | MCP 配置 + 生命周期钩子。钩子使用 Devin 的 `PostCompaction` 事件，通过 `hookSpecificOutput.additionalContext` 注入交接，且省略子智能体事件（Devin 不暴露它们）。 |
| OpenCode | 支持 | 远程 MCP 配置 + 生成的 TypeScript 插件；生成的插件强制执行捕获排除。 |
| Cursor | 支持 | MCP 配置 + 生命周期钩子。 |
| Gemini CLI | 支持 | MCP 配置 + 生命周期钩子。 |
| Oh My Pi / OMP | 支持 | 用 `--client omp` / `--agent omp`（或 `oh-my-pi`）生成原生 `.omp` MCP 配置 + TypeScript 扩展；生成的扩展强制执行捕获排除。 |
| Pi | 支持 | 生成的 `~/.pi/agent/extensions/ai-memory-pi.ts` 扩展提供生命周期捕获与 HTTP MCP 桥；生成的扩展强制执行捕获排除。 |
| Crush | 仅托管 | `ai-memory run crush` 恢复其项目本地会话数据库，并通过临时的受支持全局上下文文件提供可移植上下文；不提供生命周期钩子安装器。 |
| 托管工作流 | 选择启用 | `ai-memory run` 为 Claude Code、Codex、OpenCode、Pi、Crush、Kimi Code、Command Code、两个互不兼容的 Kiro CLI 引擎、OMP、Grok Build CLI 与 Antigravity CLI 提供透明的跨外壳连续性。直接启动不受影响。见 [托管跨外壳工作流](/managed-workstreams/)。 |
| Claude Desktop | 仅 MCP | 使用 `mcp-remote`；无生命周期钩子。 |
| OpenClaw | 支持 | MCP 配置 + 原生插件生命周期钩子；生成的插件强制执行捕获排除。 |
| Antigravity CLI | 支持 | MCP 配置（`serverUrl`）+ 生命周期钩子（`agy` 别名）。仅 `invocationNum = 0` 的 `PreInvocation` 映射到 SessionStart；后续模型调用无法消费下一个会话的交接。没有自动的真会话结束钩子，最后一轮之后需要摘要、交接与选择启用的 SessionEnd 整编时运行 `ai-memory finalize-session --agent antigravity-cli`。`ai-memory run antigravity`（别名 `antigravity-cli`、`agy`）增加经 `--conversation` 的托管工作流恢复；对话文本不解码，此外壳的台账来自钩子捕获。 |
| Grok Build CLI | 支持 | MCP 配置（`install-mcp --client grok` → `$GROK_HOME/config.toml`，默认 `~/.grok/config.toml`）+ 生命周期钩子（`install-hooks --agent grok` → `$GROK_HOME/hooks/ai-memory.json`，默认 `~/.grok/hooks/ai-memory.json`，Grok 专用钩子包）。捕获可用；无钩子交接注入——Grok 忽略 `SessionStart` stdout，所以通过 MCP `memory_handoff_accept` 恢复交接。`ai-memory run grok` 增加托管工作流恢复，上下文包经 `--rules` 原生投递。技能根目录：`.grok/skills` / `$GROK_HOME/skills`（默认 `~/.grok/skills`）。 |
| Swival CLI | 仅 MCP | `install-mcp --client swival --apply` 把原生 HTTP 条目合并进项目根的 `.swival/mcp.json`，保留同级服务器。不声称支持生命周期与托管工作流，因为 Swival 的回调契约不暴露稳定的会话标识符。 |
| Zero | 支持 | `install-mcp --client zero`（原生 HTTP + bearer，写入 `~/.config/zero/config.json`）+ 生命周期钩子（`install-hooks --agent zero --apply`，exec 形式原生命令写入 `~/.config/zero/hooks.json`，stdin 收 JSON payload，无 shell）。捕获可用，含 specialist（子智能体）事件；无交接注入——Zero 丢弃 `sessionStart` stdout，所以通过 MCP `memory_handoff_accept` 恢复交接。 |
| Kimi Code | 支持 | MCP 配置（`~/.kimi-code/mcp.json` 的 `url` 条目）+ 生命周期钩子（`~/.kimi-code/config.toml` 的 `[[hooks]]`，10 个事件，含子智能体 start/stop 与捕获工具失败的 `PostToolUseFailure`）；两条路径都尊重 `$KIMI_CODE_HOME`。交接经 `UserPromptSubmit` stdout 注入（Kimi Code 丢弃 `SessionStart` 钩子 stdout）；`ai-memory run kimi` 增加托管工作流恢复。 |
| Kiro CLI | 支持 | MCP 配置用 `install-mcp --client kiro-cli`（别名 `kiro`）与 Kiro 的 Bedrock 兼容 schema 变体。`install-hooks --agent kiro-cli` 把 v2 钩子合并进既有智能体配置；显式 `--agent kiro-cli-v3` 目标写入互不兼容的独立 v3 注册。两者都保留无关条目、尊重 `$KIRO_HOME`、强制执行捕获排除，并在会话开始注入待处理交接。Kiro 没有真正的 SessionEnd 钩子；用 `ai-memory finalize-session --agent kiro-cli`，并发会话加 `--session-id <uuid>`。`ai-memory run kiro` 管理 v2；加 `--v3`、`--mode` 或 `--agent-engine v3` 做版本安全的 v3 恢复。 |
| VS Code Copilot | 仅 MCP | Copilot agent 模式用 `.vscode/mcp.json`；无生命周期钩子（Copilot 尚未暴露）。 |
| Zed | 仅 MCP | 在 Zed 用户 `settings.json` 的 `context_servers` 下配置原生远程 MCP；无生命周期钩子或托管工作流支持。 |
| Hermes Agent | 社区 | 核心钩子摄取识别 `agent=hermes` 与 Hermes 文档记载的 shell-hook `tool_name` / `tool_input` payload，用于具体会话归因、工具族标题与捕获排除。有社区维护的 [`ai-memory-hermes-plugin`](https://github.com/MrLuciano/ai-memory-hermes-plugin)，但官方不提供第一方安装器；使用前自查其兼容性矩阵、安装/卸载脚本与密钥处理。Hermes 忽略 session-start 钩子 stdout，所以通过 MCP 恢复交接。 |
| LLM/认证提供方 | 支持 | Anthropic、OpenAI、OpenAI OAuth/Codex、GitHub Copilot、Gemini、OpenCode Zen/Go、OpenAI 兼容端点，以及原生钩子用的通用 OIDC 设备认证。 |
| 嵌入提供方 | 支持 | OpenAI、Voyage、Google Gemini，以及 Ollama、LM Studio、vLLM 等免密钥 OpenAI 兼容端点。 |

## 它是什么

LLM 编码智能体在会话结束时会丢失上下文。ai-memory 给它们一个共享、持久的 wiki——由净化后的生命周期观察编译而成。会话结束时，相关观察变成一段连贯的摘要；下一个智能体收到一份有界的交接（handoff）。可选的 `ai-memory run` 启动方式额外提供可移植的可见事件台账（visible-event ledger）与逐外壳的原生会话恢复，实现更高保真的跨外壳连续性。

这个 wiki 是 git 仓库里的纯 markdown——可以 `grep`、可以用 Obsidian 打开、可以用 `rsync` 备份。没有要照看的向量数据库，没有 `write_note` 仪式，没有手动的上下文加载。完整设计见[架构](/architecture/)；影响与先前技术在[文末](#影响与先前技术)。

## 核心特性

- **零摩擦生命周期捕获。** 钩子即发即忘地上送有界的、净化后的提示词、工具生命周期与会话边界观察。直接启动保持这条轻量路径；它不是完整的原生转录。用户提示词与压缩后摘要保留至多 16 KiB；通知与工具摘录保留至多 2 KB，每条观察体另有 16 KiB 的持久兜底。
- **选择启用的托管工作流。** `ai-memory run claude`，然后 `ai-memory run codex --yolo`，然后 `ai-memory run command-code`，透明地恢复同一个逻辑工作流（workstream），带逐外壳的原生会话、可移植的可见事件台账与全台账检索。投递的包带来源标记；Claude 转录导入会拒绝 Claude 已持久化并经工具读回的包。不带外壳名的 `ai-memory run` 会继续此检出目录下最新可用的 Claude Code、Codex、OpenCode、Pi、Crush、Kimi Code、Command Code 或 Kiro CLI v2/v3 会话。首次显式使用时，交互式启动器可以认领同一检出目录的旧会话；后续切换不能选择无关的原生历史。原生参数原样透传，只有包装器持有的 `--yolo` 与 `--fresh` 例外；直接命令不受影响。`kimi-code` 与 `kimi-cli` 是已安装 `kimi` 命令的接受别名；`commandcode`、`cmdc`、`cmd` 选择跨平台的 `command-code` 可执行文件（原生 Windows 上是 `cmdc`）；`kiro-cli` 选择已安装的 `kiro-cli` 命令。Kiro 默认 v2；`ai-memory run kiro --v3` 选择 v3，而已关联的 v3 工作流回来时会透明选择其引擎。
- **按仓库的捕获排除。** 就近标记的 `[capture]` `ignore_paths` 策略在匹配的已识别文件工具事件到达本地暂存（spool）或服务器之前丢弃它们。见[捕获排除策略参考](/marker-file/#捕获排除capture-exclusions)。
- **可选的按操作者记忆槽位。** 共享服务器上，`[slots] per_user = true` 把引擎写入的 `_slots/` 上下文保存在由已认证操作者派生的有界命名空间里。会话简报与整编提示词收到共享槽位加上调用者自己的；精确的 wiki 读取与检索仍是全项目范围，所以这是上下文注入隔离而非 RBAC。见[多用户运行](/users/#按操作者的记忆槽位)。
- **跨智能体交接。** 任务中途退出 Claude Code，几小时后同一目录启动 Codex——下一个智能体在第一条提示词之前看到一块「你上次做到哪了」。
- **构造上的按项目隔离。** 每个项目位于 `<wiki_root>/<workspace_id>/<project_id>/…`，以稳定 UUID 为键。workspace 默认 `"default"`。project 从 `$cwd` 派生：CLI 子命令（`bootstrap`、`write-page`、`lint` 等）向上走到主 git 仓库根，使同一仓库的所有 worktree 共享一个项目身份；钩子路由默认 `basename($cwd)`，可选择启用仓库根规则。在任何祖先目录放一个[`.ai-memory.toml` 标记文件（marker file）](/marker-file/)即可显式覆盖任一字段——适合多客户咨询、工作/个人分离、mono 仓库或关联 git worktree。同一路径的页面可以在两个项目并存而不冲突；改名是一列更新；清除是一次 `rm -rf`。
- **全局偏好作用域。** 常驻的用户/团队上下文——技术选型、代码风格、持久的个人规则——保存在保留的 `_global` 作用域（`memory_write_page` 加 `scope: "global"`）。默认 `memory_query` 读取时把它以 `global_scope_hits` 并入每个项目，所以偏好随你进入新项目，不必念魔法项目名，也不必付全项目 `global=true` 扇出的代价。事件捕获从不写那里。
- **实体辅助回忆。** 整编（consolidation）在每页的规范 `entities:` frontmatter 里存至多 10 个具体名词。精确、前缀与复合词匹配构成项目内 RRF 流，所以即使页面正文用词不同，查询也能召回它。这条流是词法的，不增加查询时的 LLM 调用。
- **权重感知的回忆。** FTS5、实体匹配 RRF、图邻居 RRF 与可选的向量 RRF 按相关度生成候选。截断之前，一次有界调整让受维护的 `_rules/`、`decisions/`、`procedures/`、`gotchas/` 页面优先于接近匹配的情节性会话证据。层级、`pinned` 与显式 `canonical` / `active` / `source-of-truth` 或 `superseded` / `historical` / `test-fixture` / `do-not-answer-from` 标签参与调整但不是绝对过滤，所以定向的历史检索仍能找到会话页。这些信号只影响检索出处；检索到的文本仍是不受信任的历史证据，从不因其命名空间、层级、标签、置顶或排名获得指令权威。
- **与代码智能工具清晰分工。** ai-memory 与结构性 MCP 服务器、LSP 或其他实时代码工具并行运行，无需同步它们的存储。记忆用于过往决策、理由、失败尝试、流程与交接；当前检出与结构性提供方用于符号、调用方、依赖与影响分析。行动前对照检出验证历史代码论断，把源码、构建、测试与观察到的运行时行为当作操作真相。见[历史记忆与实时代码智能](/usage/#历史记忆与实时代码智能)。
- **Karpathy 式 LLM wiki。** 页面在会话结束时（或 PreCompact 时；没有真正会话结束事件的客户端可用 `ai-memory finalize-session --agent <agent>` 手动收尾）从观察编译，而不是在原始日志上检索。取代链（supersession）+ git 版本化的 markdown 意味着你可以用 `ai-memory checkpoints`、`restore-page` 或裸 `git log` 时间旅行。
- **内置 `/web` 浏览器。** wiki 的只读 HTML UI——项目列表、目录树、FTS5 检索、markdown 渲染、暗色模式。与 MCP 挂在同一个 axum 服务器上。
- **服务器级 MCP 客户端活动。** `GET /admin/activity/by-client?since_days=7` 展示哪些 MCP 客户端在调用记忆工具，读写分列。计数用有界的 UTC 日桶，任意客户端名不能随请求量撑大数据库；共享部署保持该端点仅 root 可用。见 [MCP 客户端活动](/users/#mcp-客户端活动)。
- **多智能体 + 多机就绪。** 受支持的客户端：Claude Code、Codex、Command Code、Devin CLI、OpenCode、Cursor、Claude Desktop（经 `mcp-remote`）、Gemini CLI、Antigravity CLI、Grok Build CLI、Kimi Code、OpenClaw、Oh My Pi / OMP（`omp` / `oh-my-pi`）、Pi（经生成的桥扩展）、VS Code GitHub Copilot agent 模式（仅 MCP，工作区 `.vscode/mcp.json`）、Kiro CLI（MCP + v2 生命周期钩子）与 Zed（仅 MCP，用户 `settings.json`）。服务器可本地运行（环回）或跑在家庭实验室机器上（LAN/VPN/云），配 bearer token 认证。共享服务器可选择启用 [`[auto_scope]` 模式](/auto-scope/)做按用户或按会话的当前项目路由；Claude Code 有经 `install-mcp --session-aware` 的内置选择启用桥。
- **瘦客户端 CLI。** `ai-memory status`、`bootstrap`、`checkpoints`、`restore-page`、`purge-project`、`rename-project`、`move-project`、`move-session`、`audit-contamination`、`lint`、`curator`、`auto-improve`、`auto-improve-report`、`pending-writes`、`embed`、`forget-sweep`、`backup`、`finalize-session` 都是运行中服务器的 HTTP 客户端——从不直接碰 SQLite 或 wiki 文件。`status` 还从最近一次真实提供方调用报告被动 LLM/嵌入提供方健康度。服务器是唯一事实源。`finalize-session` 经 `GET /admin/open-sessions` 列出匹配的开放会话，再向服务器投递合成 `session-end` 钩子。共享部署中默认作用于调用者自己的加未归因会话；root 可传 `--all-owners` 做显式跨操作者恢复。并发会话共享同一智能体与作用域时，传 `--session-id <uuid>` 精确定位一个开放会话；不能与 `--all` 组合。
- **LLM 是选择启用的。** 零 LLM 模式仍给你 FTS5、手动声明的实体与图邻居检索，加基于规则的摘要。想要整编页面、lint 矛盾或分阶段自动改写提案时再加提供方。

## 使用场景

- **「退出 Claude Code，在 Codex 里继续同一件工作。」** 想要原生会话恢复加可移植可见历史、而不只是摘要交接时，用可选的托管启动器：

  ```bash
  cd /path/to/project
  ai-memory run claude

  # 退出 Claude Code，然后在 Codex 里继续同一工作流。
  ai-memory run codex --yolo

  # 之后在 Command Code 里继续，保留它自己精确的原生会话。
  ai-memory run command-code

  # 稍后省略名字，在此恢复最新可用的托管会话。
  ai-memory run

  # 在同一工作流里新开一个 Codex 会话，保留可移植历史。
  ai-memory run --fresh codex

  # Kiro 默认 v2；显式选择一次它互不兼容的 v3 引擎。
  ai-memory run kiro --v3
  ```

- **「直接选项目，不用记住它放在哪。」** 从包含各检出的目录出发，先选检出再选托管外壳：

  ```bash
  ai-memory show

  # 不启动任何东西的机器可读发现。
  ai-memory show --json
  ```

  每次成功的 `ai-memory run` 都保存一条客户端本地的检出链接，以配置的服务器加 workspace/project 为键。`show` 把这些链接与服务器的公开活动及页数元数据联结。对当前目录的一次快速有界深度 1 扫描也会发现带项目标记（`.git`、`Cargo.toml`、`package.json`、`go.mod`、`pyproject.toml` 等）的新检出，同时跳过依赖与构建目录。服务器从不暴露检出路径，所以两台客户机可以安全地在远程家用服务器上为同一项目使用不同的本地路径。

  列表永远以 **`+ New project`** 打头：输入名字，ai-memory 校验一个可移植的目录名，私下暂存新检出，把它的 workspace 与 project 钉进 `.ai-memory.toml`，并为所选智能体安装路由块与托管智能体技能（Agent Skills）。每一步设置都成功之后，最终目录才出现，然后 `show` 从它启动。

  外壳菜单只提供宿主上实际安装的智能体，用 `run` 启动时强制的同一 `PATH` 查找。

  `--no-scan` 只用已保存的链接；`--workspace` 过滤两个来源；`--yolo`、`--fresh` 与尾部原生参数原样转发。非终端使用必须传 `--json`；JSON 模式仅做发现，从不启动外壳。

  首次显式运行可以提供来自这一确切检出的既有会话或新起一个。切换外壳会启动或恢复关联到共享工作流的原生会话，所以过期的本地会话不能顶替更新的跨外壳历史。正常退出后，若上一个启动器还在收尾，下一次启动会短暂等待；已处理的失败立即释放工作流。若关联的原生转录被删除，ai-memory 在启动前检测到孤儿并全新开始；`--fresh` 对单个外壳强制这种恢复。托管模式目前覆盖 Claude Code、Codex、OpenCode、Pi、Crush、Kimi Code、Command Code、Kiro CLI v2/v3、OMP、Grok Build CLI 与 Antigravity CLI；直接启动外壳不受影响。见[托管跨外壳工作流](/managed-workstreams/)。
- **「把我放回刚才的地方。」** 在任意目录，不用敲名字也不用读列表：

  ```bash
  ai-memory continue
  ```

  它挑选托管启动最近的那次检出，重新校验路径及其解析出的作用域，然后像裸 `ai-memory run` 那样在那里继续。目录被移动、被替换、现在解析到别的项目或排序时间戳损坏的链接会报告到 stderr 并跳过，所以恢复绝不会悄悄落到错误的项目。`--workspace` 收窄搜索；`--yolo` 与 `--fresh` 原样转发。
- **「下午 4 点收工，早上 9 点换个智能体接着干。」** 经典场景。下一个受支持钩子客户端的 SessionStart 钩子前置一段带类型的交接，含悬而未决的问题、下一步与会话摘要。Grok 捕获生命周期事件但忽略 SessionStart stdout，所以恢复交接时让它调 `memory_handoff_accept`。Zero 有同样的无 stdout 行为，也必须调 `memory_handoff_accept`。
- **「六周前我们对 X 拍了什么板？」** 从智能体里用 `memory_query X`，FTS5 融合实体匹配与链接页扩展（配置嵌入器时加向量相似度）。终端里快速只做 FTS5 查找，用 `ai-memory search X`；该管理命令不跑混合流。页面经 LLM 整编，所以命中是一页连贯的决策页，不是原始聊天记录。传 `explain: true` 可看项目或显式作用域检索里每个命中的排名理由。跨项目 `global: true` 检索用单独的 FTS-only 排序器，并报告该活跃流而不给逐命中 RRF 细节。
- **「永久记住这条。」** 当某件事值得留到自动捕获的会话日志之外——一个决策、一条约定、一个坑点（gotcha）——告诉智能体「save a permanent note that we standardised on Postgres for X」或「annotate this as a project rule」，它会调 `memory_write_page` 写一页持久的、git 版本化的 wiki 页面。终端里是 `ai-memory write-page --path decisions/0007-db.md --body $'# Standardised on Postgres\n\n...' --pinned`。`--pinned` 使它豁免于衰减清扫；`--body` 第一行的 H1 成为页面标题（省略 `--title`——它仍被接受，但 LLM 调用者会在 JSON 转义上栽跟头，见 issue #67）。交接（一次性）或自动合成的会话页（整编时重写）都不一样，write-page 的笔记是你的：它出现在 `memory_query` 里、在 `/web` 中渲染、并保留到你修改为止。
- **「你找到的那页过时了。」** 智能体以页面路径调用 `memory_feedback` 并带一个信号：`helpful` / `not_helpful` 调节留存机制对清扫候选情节页的保留强度（它们移动其显著度 salience，后者缩放衰减公式的时间项），而 `stale` / `wrong` 给显著度兜底，*并*让任何当前页在下一份 `memory_lint` 报告里作为 `feedback_flagged` 发现出现。反馈从不删除任何东西——它降低置信度并标记待评审——且附着在反馈记录时的当前版本上，之后的重写会清除标记。检索到的页面文本不受信任，仅凭它绝不能授权反馈。
- **「记住这个，但只到冲刺结束。」** 给 `memory_write_page` 传 `expires_at`（RFC3339 或 `YYYY-MM-DD` = 当日结束，UTC）——或手工在页面 frontmatter 里放 `expires_at:`。过了 TTL，页面从检索/最近/简报消失（给 `memory_query` 传 `include_expired: true` 仍可看到），下一次遗忘清扫硬删除文件及其行。TTL 优先于置顶；`memory_lint` 会警告置顶+过期的组合。
- **「这个新项目在 ai-memory 之前已有几个月历史。」** `cd /path/to/my-project && ai-memory bootstrap` 收集 `git log`、README、`docs/`、模块头、项目规则，一次性摘要成种子 wiki 页面。后续会话在其上累积。
- **「那个会话留下了什么持久教训？」** 配置 LLM 提供方后，ai-memory 为每个项目新完成的会话运行后台自动改进调度器。它把提议的 wiki 编辑记入待写入审计轨迹（pending-writes audit trail），默认随即经正常 wiki 写入路径批准。调度器节拍不重叠：评审所有项目若超过间隔，下一拍推迟到当前这拍完成。调度与批准分离：设 `[auto_improve.scheduler] enabled = false` 停止自动评审，或设 `[auto_improve] require_approval = true` 让计划与手动提案都挂着等人审。`ai-memory auto-improve --session-id <uuid>` 与 MCP `memory_auto_improve` 仍可用于手动补跑或定向重跑。省略 `session_id` 时，MCP 工具选择尚无已持久化自动改进运行的最新完成会话，所以重复调用会跳过短小的预检跳过会话；显式 ID 重跑那一会话。`ai-memory auto-improve-report --workspace <w> --project <p>` 返回近期自动改进结果的只读遥测报告，不做暂存也不创建提案；加 `--stage` 为审计/批准创建一页待处理报告。区分操作者的部署上，待处理学习提案按限定操作者身份隔离，一人对某页的提案不会阻塞另一人的；未归因与单用户部署保留共享待处理队列。示例可执行评分器见[自动改进评审门（Eval Gates）](/auto-improve-eval-gates/)。

  既有安装不需要逐项目迁移。调度器初始化逐项目首跑水位线（watermark），升级时历史会话不会被自动评审，然后记录逐会话认领，失败的计划评审不会永远重试；想补跑旧会话或失败的计划会话就用手动 auto-improve。旧配置可能仍有 `[auto_improve] mode = ...` 行；当前 ai-memory 忽略该遗留键，方便时可以删掉。
- **「该考虑哪些内务？」** `ai-memory curator` 对冷情节页、过期槽位、归一化后完全重复的标题与悬空的跨项目链接跑一份无 LLM、基于规则的维护报告。默认仅报告；传 `--stage` 把一页报告排队待批，且本身仍不执行任何维护动作。共享服务器可选择启用 `[decay] breadth_weight`，给被多个已识别操作者强化的页面一个留存加成；默认 `0.0` 保持既有留存分数不变。
- **「全家共用一个 ai-memory。」** 在家庭实验室机器上以 `0.0.0.0:49374` 加 bearer token 起服务器；每台笔记本/台式机都连它。按 cwd 路由让每个项目的页面干净分离；`/web` UI 从局域网任何浏览器的可达。
- **「分享给同事前先审计落了什么。」** 浏览 `http://<server>:49374/web`——开了认证则弹 HTTP Basic 对话框，token 作密码粘贴。按项目的树视图、渲染后的 markdown、逐页可见的取代链。
- **「撤销一页坏编辑，不回滚整个服务器。」** `ai-memory checkpoints` 列出最近的 wiki 提交，然后 `ai-memory restore-page --path notes/foo.md --from <rev>` 恢复那一个 markdown 文件并重新索引进 SQLite。会话、观察、交接、用户、审计行、嵌入这类只在 DB 里的状态，仍用完整 `backup` / `restore`。
- **「扔掉一个实验，保留其余。」** `ai-memory purge-project --project experimental --confirm`。原子性：该项目的 DB 行级联消失，它的 wiki 子目录被 `rm -rf`，所有兄弟项目构造上不受影响。

## 快速开始

### Arch Linux（AUR）

原生 Arch 安装用 AUR 包。它们安装 `/usr/bin/ai-memory`、打包的钩子源码，以及系统级与用户级 systemd 单元。

```bash
yay -S ai-memory-bin    # 预构建的 Linux x86_64/aarch64 二进制
yay -S ai-memory        # 从源码构建
```

单用户工作站：

```bash
mkdir -p ~/.config/ai-memory ~/.local/share/ai-memory
ai-memory --data-dir ~/.local/share/ai-memory \
  --config ~/.config/ai-memory/config.toml init
systemctl --user enable --now ai-memory.service
ai-memory install-mcp --client claude-code --apply
ai-memory install-hooks --agent claude-code --apply
```

系统服务安装经打包单元使用 `/var/lib/ai-memory` 与 `/etc/ai-memory/`。完整的用户服务、系统服务、认证与提供方设置见[安装指南的 Arch Linux 一节](/install/#arch-linux-原生包aur)。

### Docker

你需要：Docker + [支持矩阵](#支持矩阵)里的任一智能体 CLI，或任何其他会说 MCP 的东西。

发布的 Docker 镜像含 `linux/amd64` 与 `linux/arm64` 变体，所以 Apple Silicon Mac 与 ARM64 Linux 宿主可以直接拉 `akitaonrails/ai-memory`，无需 `--platform linux/amd64` 模拟。

默认快速开始**不带认证**——服务器只绑环回，单用户笔记本上别的进程够不到它。准备好把服务器暴露到局域网时，加 bearer token 是一行改动；见下文[安全](#安全)。

```bash
# 1. 安装 ai-memory CLI 包装器（一个小的 shell 脚本，在 docker 里
#    运行二进制并挂载你的 $HOME）。宿主文件系统上只需要它。
mkdir -p ~/.local/bin
wrapper_tmp="$(mktemp -d)"
trap 'rm -rf "$wrapper_tmp"' EXIT
wrapper_base=https://github.com/akitaonrails/ai-memory/releases/latest/download/ai-memory-wrapper
curl -fsSL "$wrapper_base" -o "$wrapper_tmp/ai-memory-wrapper"
curl -fsSL "$wrapper_base.sha256" -o "$wrapper_tmp/ai-memory-wrapper.sha256"
expected="$(awk 'NR == 1 { print $1 }' "$wrapper_tmp/ai-memory-wrapper.sha256")"
if command -v sha256sum >/dev/null 2>&1; then
    actual="$(sha256sum "$wrapper_tmp/ai-memory-wrapper" | awk '{ print $1 }')"
else
    actual="$(shasum -a 256 "$wrapper_tmp/ai-memory-wrapper" | awk '{ print $1 }')"
fi
[ -n "$expected" ] && [ "$actual" = "$expected" ] || { echo "wrapper checksum mismatch" >&2; exit 1; }
install -m 0755 "$wrapper_tmp/ai-memory-wrapper" ~/.local/bin/ai-memory
rm -rf "$wrapper_tmp"
trap - EXIT
# 多数发行版自动把 ~/.local/bin 放进 PATH。若 `which
# ai-memory` 为空，把这句加进 ~/.bashrc / ~/.zshrc：
#     export PATH="$HOME/.local/bin:$PATH"

# 2. 起服务器。`--restart unless-stopped` 让它在 docker 守护进程
#    重启与开机时回来（前提是 docker 服务开机自启——多数发行版
#    是 `sudo systemctl enable docker`）。只绑环回
#    （`127.0.0.1:49374`），本机之外够不到。零 LLM 模式省略
#    LLM / EMBEDDING 两行——FTS5 检索无需任何 key 仍可用。
docker run -d --name ai-memory \
    --restart unless-stopped \
    -p 127.0.0.1:49374:49374 \
    -v ai-memory-data:/data \
    -e AI_MEMORY_LLM_PROVIDER=anthropic \
    -e ANTHROPIC_API_KEY=sk-ant-... \
    -e AI_MEMORY_EMBEDDING_PROVIDER=openai \
    -e OPENAI_API_KEY=sk-... \
    akitaonrails/ai-memory:latest

# 3. 两条命令接好你的智能体 CLI。包装器负责挂载与各客户端
#    配置路径探测。要加智能体就用 `--agent codex`、
#    `--agent command-code`、`--agent devin`、`--agent opencode`、`--agent gemini-cli`、
#    `--agent grok`、`--agent kimi-code`、`--agent kiro-cli`、`--agent omp`、
#    `--agent oh-my-pi`、`--client cursor`、
#    `--client gemini-cli`、`--client grok`、`--client kiro-cli` 等重跑；
#    完整清单在安装指南。
ai-memory install-mcp   --client claude-code --apply
ai-memory install-hooks --agent  claude-code --apply
# Grok Build CLI 示例：
# ai-memory install-mcp   --client grok --apply
# ai-memory install-hooks --agent  grok --apply
# Kiro CLI v2 示例（要求已有 Kiro 智能体配置）：
# ai-memory install-mcp   --client kiro-cli --apply
# ai-memory install-hooks --agent  kiro-cli --apply
# Kiro CLI v3 示例（独立钩子注册）：
# ai-memory install-hooks --agent  kiro-cli-v3 --apply
# Command Code 稳定 MCP + 生命周期示例：
# ai-memory install-mcp   --client command-code --apply
# ai-memory install-hooks --agent  command-code --apply
```

Linux/macOS 上就这些。照常开一个 Claude Code 会话——每条提示词与每次工具调用现在都落进 ai-memory，你在这个项目里开的下一个会话将看到一份「你上次做到哪了」的交接。macOS 上不需要 Docker 时，原生发布二进制同样受支持且被推荐；见 [macOS 支持](/macos/)。

若两个 Claude Code 会话并发使用同一服务器，在服务器上启用按会话路由，并只用可选桥替换 `ai-memory` MCP 条目：

```toml
# <ai-memory data dir>/config.toml
[auto_scope]
mode = "per_session"
```

```bash
ai-memory install-mcp --client claude-code --session-aware --apply
```

桥仍然连接配置的本地或远程 HTTP 服务器并转发其 bearer token，但额外把 Claude 的生命周期会话 id 附到每个 MCP 请求上。既有静态 HTTP 安装仍是默认。Claude 的 `/clear` 与隐式恢复限制见 [auto-scope](/auto-scope/)。

`install-mcp` / `install-hooks` 在设置了 `AI_MEMORY_SERVER_URL` / `AI_MEMORY_AUTH_TOKEN` 时使用之；否则默认 `http://127.0.0.1:49374`（与上面的服务器一致）且不带 bearer token。若钩子安装时 ai-memory 的 MCP 条目已存在，`install-hooks` 复用那个端点，所以远程 MCP 设置不会悄悄重新生成只绑环回的钩子。两条命令幂等——重跑替换 ai-memory 的条目，保留你配置的其他所有服务器/钩子，并在每次修改性写入前在文件旁写一份带时间戳的 `.bak-<ts>`。钩子脚本自动暂存进 `~/.local/share/ai-memory/hooks/<agent>/`；重跑会覆盖，让未来的镜像更新带来更新的钩子。去掉 `--apply` 则只打印片段不做修改。对 Claude Code，`CLAUDE_CONFIG_DIR` 把 MCP 注册挪到 `$CLAUDE_CONFIG_DIR/.claude.json`、钩子挪到 `$CLAUDE_CONFIG_DIR/settings.json`、全局托管技能挪到 `$CLAUDE_CONFIG_DIR/skills`。Docker 包装器在该目录位于其既有 `$HOME` 绑定挂载之下时转发此变量。Claude 配置根在 `$HOME` 之外时用原生二进制。卸载同时检查活跃的迁移路径与 Claude 的家默认值，所以启用该变量不会留下旧默认路径的 ai-memory 安装。若你的智能体常在仓库子目录或关联 worktree 里启动，给 `install-hooks` 加 `--project-strategy repo-root`，让捕获收敛到主 git 仓库名；详见[安装指南](/install/)与[标记文件](/marker-file/)。之后的裸 `--apply` 刷新（含 `ai-memory upgrade`）保留该选择；显式传 `--project-strategy basename` 可移除。

Docker 包装器也把 `ai-memory status`、`ai-memory bootstrap` 这类瘦客户端命令桥接回宿主的环回服务器。用上面的本地 Docker 快速开始时，不需要 `AI_MEMORY_SERVER_URL` 覆盖。

托管工作流是可选的。它们在宿主上执行外壳，而服务器可以留在本地或远程：

```bash
ai-memory run claude
# 稍后在另一个外壳里继续同一工作流
ai-memory run codex --yolo
# 省略名字以继续最新的可用本地外壳会话
ai-memory run
# 或不先换目录，直接恢复最新的托管检出
ai-memory continue
```

日后要移除 ai-memory，在同一宿主环境运行 `ai-memory uninstall --apply`。它只在对上 ai-memory 签名之后，移除 ai-memory 拥有的配置条目、指令块、默认根的托管技能文件与生成的插件文件；用 `--target-dir` 安装的自定义技能根需手工清理。MCP 装在自定义端点时用 `--mcp-url`；只需把移除收窄到一条匹配条目时才用 `--mcp-name`。

### 安装注意事项

- **SELinux：** 在 enforcing 的 Linux 宿主上，包装器只对触碰绑定挂载的宿主文件的短命辅助命令自动加 `--security-opt label=disable`。它不改长驻服务器容器，也不给 `$HOME` 重打标签；不要给整个家目录绑定加 `:z`/`:Z`。Rootless 引擎的这些命令还会加 `-u 0:0`。Docker 与 podman 在不同的 `info` 键下报告 rootless 模式与 SELinux 支持；两者都读。`AI_MEMORY_DATA_DIR` 选宿主目录或显式 `--config` 读宿主文件时同样处理。见[安装指南的 SELinux 一节](/install/#selinux-enforcing-宿主)。
- **Windows：** WSL2 里用 Linux 路径，或 PowerShell/cmd 用原生 Windows 包装器。本地受支持的配置默认宿主原生命令：Claude Code 可用其受支持的 `ai-memory.exe` exec 形式，其他智能体用符合各自钩子 schema 的原生单命令字符串。Docker 包装器用 `-EncodedCommand` 保护 `.ps1` 回退命令不被嵌套 PowerShell 展开破坏；升级后重跑 `install-hooks --agent <agent> --apply` 让既有钩子条目拿到当前形式。PowerShell/Git Bash 脚本包是兼容性回退，不强制执行 capture-policy v1。不要混用路径世界。见 [Windows 支持](/windows/)。
- **Docker compose：** 支持 `docker compose -f docker/docker-compose.yml up -d`；智能体设置同上面第 3 步。
- **远程服务器：** 客户端安装 MCP/钩子前设置 `AI_MEMORY_SERVER_URL=http://<server-ip>:49374` 与 `AI_MEMORY_AUTH_TOKEN=<token>`。显式 `--server-url` 标志仍可用，但设置了环境变量后不再必需。任何非环回服务器都应使用 bearer 认证。
- **托管启动包装器：** `ai-memory run`、`ai-memory show` 与 `ai-memory continue` 必须被当前宿主包装器拦截，本地检出、原生外壳与会话存储才可达。旧包装器可能把这些命令传进 Docker 而找不到检出或宿主可执行文件。在智能体机器上运行 `ai-memory upgrade` 刷新。宿主原生 runner 继承 `AI_MEMORY_SERVER_URL`、`AI_MEMORY_AUTH_TOKEN` 与宿主 `PATH`。
- **升级：** Docker 包装器安装在每台智能体机器上运行 `ai-memory upgrade`。它刷新本地包装器、拉最新镜像、并重暂存 `~/.local/share/ai-memory/hooks/<agent>/` 下的钩子脚本。原生包/源码安装在升级二进制后重跑 `ai-memory install-hooks --agent <agent> --apply`。远程/家庭实验室服务器仍须单独重新部署；本地包装器升级只更新客户机。既有的项目提示词文件继续可用。想要新的工具指引时，刷新托管 ai-memory 路由包（`ai-memory install-instructions`，或基于 AGENTS 的项目用 `--target AGENTS.md`）。刷新写入轻量的带标记片段与来自同一二进制自有资产的托管智能体技能。

[支持矩阵](#支持矩阵)里的每个客户端、基于 curl 的钩子安装、源码构建、CLI 环境变量与完整子命令参考，见[安装指南](/install/)。

CLI 的 Tab 补全覆盖 bash、zsh、fish、PowerShell 与 elvish：

```bash
ai-memory completions fish > ~/.config/fish/completions/ai-memory.fish
```

其他 shell 的安装路径见 [Shell 补全](/shell-completions/)。

## 安全

默认只绑环回（`127.0.0.1:49374`）且无认证，因为这对单用户笔记本是安全的：机器之外的进程够不到服务器。

无认证的非环回 HTTP 现在直接失败关闭。设置 `AI_MEMORY_AUTH_TOKEN` 或绑环回；`--allow-insecure-no-auth` 是有意为之的、危险的明文 HTTP 例外。认证不加密 bearer token：局域网或远程访问请用现成的 [Caddy](https://github.com/akitaonrails/ai-memory/blob/main/docker/compose.tls.caddy.yml) 或 [Cloudflare Tunnel](https://github.com/akitaonrails/ai-memory/blob/main/docker/compose.tls.cloudflared.yml) 模板，见 [HTTPS 反向代理指南](/https-via-proxy/)。

以下情况启用 bearer 认证：服务器暴露到环回之外、机器上有不受信任的本地进程、或数据目录存有敏感项目历史：

```bash
TOKEN=$(ai-memory generate-auth-token)

docker run -d --name ai-memory \
    --restart unless-stopped \
    -p 0.0.0.0:49374:49374 \
    -v ai-memory-data:/data \
    -e AI_MEMORY_AUTH_TOKEN="$TOKEN" \
    -e AI_MEMORY_ALLOWED_HOSTS="<server-ip>,localhost,127.0.0.1" \
    akitaonrails/ai-memory:latest

ai-memory install-mcp   --client claude-code --apply \
    --server-url "http://<server-ip>:49374/mcp" --auth-token "$TOKEN"
ai-memory install-hooks --agent  claude-code --apply \
    --server-url "http://<server-ip>:49374" --auth-token "$TOKEN"
```

Bearer 认证保护 `/mcp`、`/hook`、`/handoff`、`/admin/*` 与 `/web/*`。浏览器访问 `/web` 用 HTTP Basic 认证，token 作密码。`/web` 经 HTTPS 反向代理暴露时，设 `AI_MEMORY_AUTH__SECURE_COOKIE=true`；它让浏览器 cookie 仅限 HTTPS。关闭或重定向到该主机名的直接 HTTP 访问。非环回绑定还应设置 `AI_MEMORY_ALLOWED_HOSTS` 防御 DNS rebinding。

繁忙的共享钩子服务器还可设 `AI_MEMORY_HOOK_RATE_PER_SEC`（按行为者/会话来源每秒令牌数），以及可选的 `AI_MEMORY_HOOK_RATE_BURST`，在不妨碍无关钩子来源的情况下限住失控的单个会话。未设或 `0` 表示限流器保持关闭。

在每位开发者应各自认证钩子写入的共享服务器上，原生 Claude Code 钩子可用存储的 OIDC 设备令牌，而非内嵌共享静态令牌：

```bash
ai-memory auth login oidc-device \
    --issuer "https://issuer.example.com/realms/team" \
    --client-id "ai-memory-cli"

ai-memory install-hooks --agent claude-code --apply \
    --server-url "http://<server-ip>:49374"
```

OIDC 钩子认证要求原生 `ai-memory hook ...` 命令路径。Docker 包装器默认保留 shell 脚本钩子；从原生发布二进制或源码安装来设置 OIDC。`ai-memory status`、`ai-memory search` 这类瘦客户端 HTTP 命令在未配置静态 `AI_MEMORY_AUTH_TOKEN` / `[auth].bearer_token` 时也用存储的 OIDC access token；存在静态 bearer 时它优先。这面向 OIDC 感知的网关/桥；原生 ai-memory 服务器认证仍接受静态 root bearer / DB 用户令牌，且除非网关把接受的 OIDC 认证翻译成 ai-memory 接受的上游认证，`/admin/*` 仍仅 root 可用。

OIDC/Keycloak 会话 id 是登录提供方会话，不是 ai-memory 智能体会话。依赖 `[auto_scope]` 会话隔离的共享服务器，仍需显式 `workspace` + `project` / `scopes`，或在 MCP 请求上转发真实生命周期钩子会话 id 的桥。

**想要 HTTPS？** ai-memory 刻意不自己做 TLS 终结——正确答案是一个久经考验的反向代理挡在前面。[HTTPS 反向代理指南](/https-via-proxy/)是部署指南，附可直接复制的 docker compose 模板：[Caddy + Let's Encrypt 或内部 CA](https://github.com/akitaonrails/ai-memory/blob/main/docker/compose.tls.caddy.yml)、[Cloudflare Tunnel（无开放端口）](https://github.com/akitaonrails/ai-memory/blob/main/docker/compose.tls.cloudflared.yml)。开启多用户或绑到环回之外后两者都被推荐。单用户环回的快速开始不需要 TLS——指南里明确点名了这种情形，免得你在不值得的地方加仪式。

**多用户归因（v0.8，可选）。** 多人共享一台服务器时，ai-memory 可把每次写入归因到具名用户。bearer token 继续在协议层认证；经 `ai-memory user add` 创建的用户拿到自己的令牌，在审计日志、页面 frontmatter、`/api/v1` 响应与页面查看 UI 中解析到其身份。数据仍是单租户——没有逐页 RBAC。DB 用户认证要求 `[auth].token_pepper`，但创建第一行用户记录这个动作本身就会立即把每个 `/admin/*` 端点切成仅 root，含 status/search/read-page 与用户管理路由。`ai-memory init` 为新安装生成 pepper，在添加用户之前不改变单用户行为。SSO 网关也可改用专用 `[auth].actor_proxy_bearer_token` 加受信任的 `X-Memory-Actor-*` 头；其凭据刻意与 root bearer 分离，缺失的身份不会变成 root。完整流程与四级认证阶梯见[多用户归因](/users/)。

带 bearer 认证、主机允许列表与 TLS/反向代理选项的完整家庭实验室模式，见[部署到家庭实验室](/deploy/)。

## 使用记忆

日常你几乎不用惦记 ai-memory。生命周期钩子捕获提示词、工具调用、压缩检查点与会话边界。SessionStart 钩子在你于下一个智能体里发出第一条提示词之前取回待处理交接。

有用的入口：

- 问「where did we leave off?」从待处理交接继续。
- 问「have we discussed X?」或「search memory for Y」检索 wiki。
- 问「catch me up」得到近期项目活动的散文摘要。
- 在有几个月历史的既有项目里采用 ai-memory 时，跑一次 `ai-memory bootstrap`。
- 以 `--enable-web` 起服务器并访问 `/web`，获得 markdown wiki 的只读浏览器视图。`--enable-web` 还在同源挂载只读 JSON 前端 API `/api/v1`（workspaces、projects、pages、recent、briefing、search），自定义 Web UI 无需打开 SQLite 或 wiki 文件即可读记忆：

  ```text
  GET  /api/v1/workspaces
  GET  /api/v1/projects?workspace=...
  GET  /api/v1/workspaces/{workspace}/projects/{project}/pages
  GET  /api/v1/workspaces/{workspace}/projects/{project}/pages/{path}
  GET  /api/v1/workspaces/{workspace}/projects/{project}/recent?limit=...
  GET  /api/v1/workspaces/{workspace}/projects/{project}/briefing?limit=...
  GET  /api/v1/workspaces/{workspace}/overview?limit=...
  GET  /api/v1/workspaces/{workspace}/projects/{project}/overview?limit=...
  GET  /api/v1/workspaces/{workspace}/projects/{project}/handoffs?state=...&limit=...
  GET  /api/v1/search?q=...&workspace=...&project=...&limit=...
  POST /api/v1/search   { "q": "...", "scopes": [{ "workspace": "...", "project": "..." }] }
  ```

  `overview` 一次调用捆起 workspace 或项目的开放交接 + 简报 + 记忆健康度（项目总览屏需要的数据）。交接历史默认是调用者自己的加共享行；root 可用 `all_owners=true` 跨操作者恢复。

  **完整集成指南：** 认证设置、响应 schema、错误模型、限额/分页、自定义 UI 托管、完整的 `fetch`/`curl` 示例与权威事实源文件见[前端集成](/frontend-api/)。做前端先读它。

  想托管自己的静态前端替代内置 UI，把 `--web-ui-dir` 指向前端的构建产物（与 `/api/v1`、`/mcp`、`/admin/*` 同源，既有认证直接适用）：

  ```bash
  ai-memory serve --transport http --bind 127.0.0.1:49374 \
    --enable-web --web-ui-dir ../ai-memory-ui/dist
  ```

  参考实现——带截图与 e2e 测试的 SolidJS 知识浏览器——在 [djalmajr/ai-memory-ui](https://github.com/djalmajr/ai-memory-ui)。

  导入/迁移管线、可写的浏览器聊天/编辑器这类更重的产品，应作为可选伴随 crate 或项目存在，调用 ai-memory 的公共 HTTP/MCP 面。第一个实现的伴随项目是独立 OMC wiki 导入器 [`companions/ai-memory-importer`](https://github.com/akitaonrails/ai-memory/tree/main/companions/ai-memory-importer)，它刻意不是根 workspace 成员、不进根 `cargo test --workspace`。边界见[可选伴随 crate 与项目](/companion-crates/)。

  反向代理把 ai-memory 挂在 URL 子路径下时，设 `--base-path`（或 `AI_MEMORY_BASE_PATH`），所有 HTTP 面一起挪。例：`--base-path /wiki` 把 MCP 挂在 `/wiki/mcp`、钩子在 `/wiki/hook`、API 在 `/wiki/api/v1`、默认浏览器在 `/wiki/web`。想让浏览器或自定义 SPA 直接在 `/wiki` 上，设 `--web-slug /`。

装一次托管路由包，让智能体为这些提示词主动调用正确的 MCP 工具：

```bash
ai-memory install-instructions
```

该命令写入或更新轻量的 `<!-- ai-memory:start -->` 块，以及承载详细路由指引的托管 ai-memory 智能体技能。交接示例、主动查询路由、bootstrap 细节、Web UI 截图与裸 wiki 检查命令见[日常使用](/usage/)。CLI URL/认证配置在[安装指南](/install/#配置-cli-url-与认证)。

### 实体检索

整编把具体技术、组件、服务、文件与领域名词提取进每页的规范 frontmatter。手编的 wiki 页面可以显式声明同一个有界索引：

```yaml
---
title: Queue choice
entities:
  - nats jetstream
  - delivery guarantees
---
```

名称做小写化、空白归一化、去重、每页至多 10 个、每个至多 64 字符，并在干净存储的 `ai-memory reindex` 时从 Markdown 重建。实体查找按项目限定，默认忽略过期页面，并在 `memory_query(..., explain: true)` 下报告 `entity_rank`、其原始逆频率 `entity_weight`、`matched_entities` 与其 RRF 贡献。

## LLM 提供方

ai-memory 无 LLM 也能跑：钩子照常捕获会话，检索用 FTS5 + 声明实体 + 图邻居，摘要回退到基于规则的输出。想要 LLM 整编（PreCompact 时、经 `memory_consolidate` 按需、或设 `AI_MEMORY_CONSOLIDATE_ON_SESSION_END` 在会话结束时选择启用）、更丰富的 lint 与 bootstrap 时再加 LLM 提供方。有实质内容的会话结束无论如何都写规则摘要页 + 交接。只含 `SessionStart` / `SessionEnd` 边界的会话直接关闭，不写页面、交接或提供方任务。这种空会话若曾接受启动上下文，其会话绑定的交接会还给开放池等下一位接收者，而不是丢失。启用会话结束选择启用后，提供方任务在那些确定性写入之后持久排队，由一个有界的服务器 worker 处理，钩子排放延迟不会取消它。失败任务带退避重试并在服务器重启后幸存。恢复的原生会话只在其观察代际前进后才再次结束；持久化的代际水位线让重复的 SessionEnd 投递与系统时钟偏移收敛，不重复做提供方工作。结束水位线与自动交接原子提交，被中断的带键重放会完成 wiki 提交、队列插入与键完成，而不重复那个交接。下一个 SessionStart 上，最新的 cwd 合格自动交接获胜；接受它会让较旧的合格自动交接过期，而不消费手工或兄弟目录的交接。新的自动交接也会让其确切 cwd 下先前的开放自动交接过期，所以反复的 SessionEnd 不会在接收者启动前在那里堆积。

要保持整编风格按项目定制，在该项目 wiki 里写 `_prompts/consolidation.md`。正文可表达诸如「prefer Portuguese titles」或「omit routine CI noise」的偏好。自动、单页与多页整编都会用该页；手动 `memory_consolidate` 调用可传 `instructions` 一次性覆盖。ai-memory 净化并截断该值至 2,000 字符，JSON 编码进用户消息，并视为不受信任的参考性数据。它不能提供事实、请求工具使用或披露、或覆盖整编 schema 与忠实性规则。TTL 过期的偏好页被忽略。没有活跃页面或参数时不附加偏好块。

推荐默认：

| 提供方 | 默认 | 适用场景 |
|---|---|---|
| `anthropic` | `claude-haiku-4-5` | 整编质量与规则分类的最佳默认。 |
| `anthropic-oauth` | `claude-sonnet-4-6` | 经 `claude setup-token` 用 Claude Pro/Max 订阅，无需 API key。 |
| `openai` | `gpt-5.4-mini` | 更便宜更快的托管选项。 |
| `openai-oauth` | `gpt-5.5` | 经 `ai-memory auth login openai-oauth` 用 ChatGPT Pro/Plus/Codex 后端；无需 Platform API key。 |
| `copilot` | `gpt-5.5` | 经 `ai-memory auth login copilot` 或 `COPILOT_GITHUB_TOKEN` 用 GitHub Copilot Chat 后端；需 Copilot 订阅。 |
| `gemini` | `gemini-3.5-flash` | Google 托管选项，免费额度大方。 |
| `openai-compat` | 无默认 | OpenRouter、Atlas Cloud、OrcaRouter、Ollama、vLLM、LM Studio 及其他兼容端点。 |

`openai-oauth` 把 refresh token 存进 `<data_dir>/auth.json` 并对接 ChatGPT/Codex Responses 后端，不是 `api.openai.com`。Docker 快速开始下，用包装器跑 `ai-memory auth login openai-oauth`，让 token 落进服务器同一个 `ai-memory-data` 卷。

`anthropic-oauth` 打与 `anthropic` 相同的 `/v1/messages` 端点，但用 OAuth bearer token 而非 API key 认证。跑一次 `claude setup-token`，然后设 `AI_MEMORY_LLM_PROVIDER=anthropic-oauth` 与 `ANTHROPIC_OAUTH_TOKEN=<token>`（或 `claude setup-token` 自动写入的 `CLAUDE_CODE_OAUTH_TOKEN`）。不需要 `ANTHROPIC_API_KEY`。Docker 包装器按名字把任一 token 转发给 `llm-test` 这类短命辅助命令；长驻服务器容器按安装指南单独配置。

对两个 Anthropic 提供方，ai-memory 对 Claude 4.7 及之后的模型与 Claude Mythos Preview 省略 `temperature`，因为这些模型拒绝非默认采样参数。`llm-test` 在提供方应用该兼容规则之前，发送与正常管线相同的代表性 0.2 值。

**⚠️ 非官方且违背 Anthropic 使用政策——风险自负；可能导致账号被限流或封禁。见[安装指南中的警告](/install/#经-claude-订阅-oauth-接入-anthropic)。**

`copilot` 把 GitHub 用户令牌存在同一 auth 文件里，经 GitHub 的 `/copilot_internal/v2/token` 换取短期 Copilot API 令牌，并带 `vscode-chat` 集成头使用 Copilot Chat 端点。也可以在服务器上设 `COPILOT_GITHUB_TOKEN`、`GH_TOKEN` 或 `GITHUB_TOKEN`。

> [!TIP]
> **对 OAuth/订阅后端（`anthropic-oauth`、`openai-oauth`、`copilot`），经 `AI_MEMORY_LLM_MODEL` 选小而快的模型**——如 `claude-haiku-4-5` 或 `gpt-5-mini`。ai-memory 的 LLM 工作（整编、lint、explore）是摘要而非硬推理，Haiku/mini 级模型绰绰有余，且对订阅限速友好得多。把高投入的思考模型留给你的编码智能体。

> [!TIP]
> **OpenAI 兼容结构化输出默认受 schema 约束。** ai-memory 经 `response_format=json_schema` 发送每个操作的 JSON Schema，近期的 Ollama、vLLM、LM Studio 与 llama.cpp 版本都尊重它。端点显式拒绝该字段或返回畸形结构时回退到宽容解析器。只有不兼容的端点才设 `AI_MEMORY_LLM_COMPAT_STRICT=false`。

小上下文本地模型要同时配置两个整编限额。输入目标计入完整渲染提示词——含槽位与当前页上下文及结构化输出 schema；输出限额发给提供方。两者之和必须塞进模型上下文窗口并留余量，因为各家的分词器不同：

```toml
[consolidation]
max_input_tokens = 6500
max_output_tokens = 1000
```

等价环境变量是 `AI_MEMORY_CONSOLIDATION__MAX_INPUT_TOKENS` 与 `AI_MEMORY_CONSOLIDATION__MAX_OUTPUT_TOKENS`。自动 PreCompact/PostCompaction 检查点期间提供方失败回退到确定性规则页；准入、存储与作用域错误仍失败关闭。经验证的最小值是 6,000 输入与 1,000 输出 token。

每个聊天提供方把单次补全请求限制在 300 秒（`AI_MEMORY_LLM_TIMEOUT_SECS` 覆盖，或 config.toml 里 `llm_timeout_secs = 900`；openai-oauth 的快速 token 刷新保持默认上限）。默认值容忍本地引擎冷加载大模型；慢的托管网关若长补全超上限，每个请求都会以 `http: error sending request` 失败，此时应调大值而不是眼看整编耗尽重试。

重排（rerank）可选且默认关闭。配置了 LLM 提供方时，`AI_MEMORY_RERANKER=llm` 让项目与显式作用域的 `memory_query` 调用从混合阶段超取、融合作用域、并至多做一次 LLM 调用重排最佳候选。这可以把 RRF 排在截断线之下的相关页面提上来，代价是 LLM 延迟与用量。请求把查询加至多 30 个有界页面标题与检索片段发给配置的提供方；所有值 JSON 编码并视为不受信任数据。超时、提供方错误或不完整/无效的分数集都保持正常顺序。`global=true` 与补充的全局偏好命中保持既有非 RRF 排序。并发提供方调用上限四；饱和的查询保持本地排序不等待。

嵌入可选且独立于 LLM 提供方。想要 FTS5 + 实体 + 图邻居之外的向量检索时，设 `AI_MEMORY_EMBEDDING_PROVIDER=openai`、`voyage`、`google`/`gemini` 或 `openai-compat`。`openai-compat` 面向自托管引擎（Ollama、LM Studio、vLLM）：无需 API key，但要求显式 `AI_MEMORY_EMBEDDING_BASE_URL`、`AI_MEMORY_EMBEDDING_MODEL` 与 `AI_MEMORY_EMBEDDING_DIM`。FTS-only 与混合两条路径都在候选生成之后施加同一个有界的页面权威度调整；嵌入改善相关召回，但不裁决哪个来源是权威版本。

环境变量与 Ollama/OpenRouter/Atlas Cloud/OrcaRouter 示例见[安装指南的 LLM 提供方一节](/install/#llm-提供方层级)，实测模型对比见 [LLM 提供方对比](/llm-provider-comparison/)。

## 架构

一个 Rust 二进制跑一个 MCP/HTTP 服务器并拥有一个数据目录：

```text
<data_dir>/
├── wiki/    # markdown 事实源，git 版本化
├── raw/     # 不可变的净化后托管工作流转录片段
├── db/      # SQLite 索引，含 FTS5、实体与嵌入
├── models/  # 预留给本地嵌入模型
└── logs/    # 滚动 tracing 输出
```

钩子把观察 POST 给服务器。服务器经单一 SQLite 写入器串行化写入，把会话观察编译成 markdown 页面，并经 FTS5、实体匹配与图邻居 RRF、可选向量 RRF、有界的来源权威度调整，以及非全局检索的有界裸观察回退来服务检索。

数据流图、crate 拆解、schema 说明与不变量见[架构](/architecture/)。

## 文档

| 文件 | 是什么 |
|---|---|
| [安装指南](/install/) | **安装指南。** 每个智能体 CLI、每种替代方式（curl、源码构建、无 docker、无认证），以及服务器在另一台机器（家庭实验室/局域网）的完整走查。快速开始不合身时在 Quick start 之后读它。 |
| [日常使用](/usage/) | 交接、主动记忆查询、轻量路由片段 + 托管智能体技能、从其他记忆工具迁移、Web UI、裸 wiki 检查、规则 vs 事实工作流。 |
| [托管跨外壳工作流](/managed-workstreams/) | 可选的 `ai-memory run` 跨 Claude Code、Codex、OpenCode、Pi、Crush、Kimi Code、Command Code、Kiro CLI v2/v3、OMP、Grok Build CLI 与 Antigravity CLI 的连续性：自动外壳选择、原生恢复、参数转发、台账检索、隐私与恢复。 |
| [新增托管外壳](/managed-harness-contributions/) | 给贡献者增加托管恢复、只读转录导入与启动上下文投递到另一外壳的协议与验收标准。 |
| [标记文件](/marker-file/) | `.ai-memory.toml` 的 workspace/project 路由：多客户目录树、mono 仓库、worktree、工作/个人分离。 |
| [auto-scope](/auto-scope/) | 共享服务器的 `[auto_scope]` 模式：默认单槽路由、按会话隔离、多用户 `per_actor` 行为。 |
| [macOS 支持](/macos/) | macOS 安装路径：原生发布二进制（推荐）、源码构建、Docker 包装器、钩子平台说明与当前 macOS 限制。 |
| [Windows 支持](/windows/) | Windows 安装模式：完整 WSL2、带 Docker Desktop 的原生 Windows、预构建原生发布 zip、原生源码构建，以及当前钩子/MCP 外壳注意事项。 |
| [MCP 安装](/mcp-install/) | 各客户端的 MCP 与生命周期说明、交接注入限制、社区桥指引。 |
| [部署到家庭实验室](/deploy/) | 家庭实验室部署：bin/deploy、bearer token 认证、TLS 指南指引。 |
| [多用户归因](/users/) | **多用户归因（v0.8）。** 四级认证阶梯、`ai-memory user add/list/expire/revive/rotate-token` 走查、v0.8 之前安装的向后兼容迁移、令牌存储的理由。 |
| [通过反向代理上 HTTPS](/https-via-proxy/) | **经反向代理上 HTTPS。** 何时需要 TLS（多用户、非环回）何时不（环回/stdio）。Caddy + Let's Encrypt、Caddy + 内部 CA（仅局域网）、Cloudflare Tunnel（无开放端口）、外部证书文件的可复制 docker compose 模板；加原生 Caddy + nginx 配方。明确点名「自以为安全其实不」的失败模式。 |
| [生命周期操作](/lifecycle-ops/) | **跑 purge / rename / backup / restore / reset / reindex / restore-page 之前先读。** 触碰状态命令的安全矩阵、逐项目磁盘布局（隔离到底怎么实现的）、基于检查点的页面恢复，以及「全新开始」「高风险操作前快照」「扔掉一个项目」「从 wiki 文件重建 SQLite」的操作者工作流。 |
| [自动改进循环调研](/auto-improvement-loop/) | 自动改进设计笔记：Hermes 启发的计划评审、默认自动批准、手动评审选择启用、待处理提案存储与 curator 工作。 |
| [可选伴随 crate 与项目](/companion-crates/) | 可选伴随项目的边界与实施计划，含独立导入器 `companions/ai-memory-importer`，不拓宽核心 ai-memory。 |
| [LLM 提供方对比](/llm-provider-comparison/) | 推荐 LLM 默认值背后的实测笔记。 |
| [架构](/architecture/) | 操作性摘要：数据流、crate 布局、横切不变量、schema。 |
| [设计决策](/design-decisions/) | 完整的 v1 规格。 |
| `docs/` 下的调研文档 | Karpathy LLM wiki 笔记、Hermes Agent、agentmemory / basic-memory / cognee 深潜、上游 issue 的经验教训。 |

## 影响与先前技术

- **[Karpathy LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)**——编译而非检索的模式。
- **[agentmemory](https://github.com/rohitg00/agentmemory)**——大部分正确的想法；本项目是其 Rust 后继。
- **[basic-memory](https://github.com/basicmachines-co/basic-memory)**——markdown 落盘的事实源模型。
- **[cognee](https://github.com/topoteretes/cognee)**——管线组合与三元组嵌入。
- **[Hermes Agent](https://github.com/NousResearch/hermes-agent)**——自我改进循环：回合后评审、批准门与 curator 边界。
- **[A-MEM](https://arxiv.org/abs/2502.12110)**——卡片盒（Zettelkasten）式原子笔记与链接演化。

## 许可

MIT——见 [LICENSE](https://github.com/akitaonrails/ai-memory/blob/main/LICENSE)。

## 致谢

本代码库与 Claude Code（Anthropic Claude Opus 4.7）协作构建，遵循 `docs/design-decisions.md` 记录的计划。
