---
title: "MCP 安装指南：更多客户端"
description: "本页记录如何把 ai-memory 注册为 README 快速开始之外的智能体 CLI 的 MCP 服务器。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/mcp-install.md"
---

# MCP 安装指南：更多客户端

> 下面所有片段默认 `http://127.0.0.1:49374`（本地服务器）。远程服务器（家庭实验室、局域网机器）替换相应 URL，并在启用 bearer 认证时给 `headers` 块加 `Authorization: Bearer <token>` 头。MCP 线上协议期望 URL 带 `/mcp` 路径后缀。

> **传输默认无状态。**自 v0.1.2 起 HTTP 传输独立应答每个请求（纯 JSON、无需 `Mcp-Session-Id`），所以任何把远程 URL 指向 `/mcp` 的客户端——包括 OpenCode `type: "remote"` 与裸 `curl`——都无需 `mcp-remote` stdio 垫片即可工作（issue #3）。**Claude Desktop** 仍需要 `mcp-remote` 桥，因为其配置只支持 stdio 服务器——不是因为会话状态。你的客户端若*要求* MCP 会话连续性或服务器发起的 SSE 流，用 `ai-memory serve --transport http --http-stateful` 启动服务器以恢复 rmcp 的会话模式。

本页记录如何把 ai-memory 注册为 README 快速开始之外的智能体 CLI 的 MCP 服务器。

[README 支持矩阵](/#支持矩阵)里带钩子能力的客户端有自动捕获集成（受支持本地配置用宿主原生命令，OpenClaw、OpenCode、OMP、Pi 用生成的 TypeScript 插件/扩展文件）。
Claude Code 可用其受支持的 Windows exec 形式；其他智能体按各自钩子 schema 用原生单命令字符串。PowerShell/Git Bash 脚本包是兼容性回退、不强制 capture-policy v1。Grok 与 Zero 捕获生命周期事件，但都忽略 SessionStart stdout，所以 ai-memory 不为它们自动注入交接。SessionStart 交接注入只对消费启动钩子 stdout（或其等价上下文注入结果）的客户端工作；Grok 与 Zero 恢复时必须调 `memory_handoff_accept`。

捕获排除与 MCP 注册分开。原生钩子命令与生成的 OpenCode/OMP/Pi/OpenClaw 集成强制 `[capture] ignore_paths`；遗留 shell/PowerShell 与纯远程/Docker 脚本包不强制。重装/刷新既有钩子或插件以获得它；见[捕获排除](/marker-file/#捕获排除capture-exclusions)。

Claude Desktop、VS Code Copilot、Zed 在这里**仅 MCP**：它们经 ai-memory 的 MCP 工具（`memory_query`、`memory_recent`、`memory_handoff_accept` 等）向其 LLM 暴露长期记忆，但不自动把会话事件捕获进 ai-memory 的 `/hook` 端点。取舍是：

| | 得到什么 | 得不到什么 |
|---|---|---|
| **仅 MCP** | LLM 可检索 wiki、接受交接、跑 memory_consolidate、跑 `memory_auto_improve` 学习评审 | 无自动会话结束摘要；会话边界无自动交接 |
| **MCP + 钩子** | 上述全部*加*自动捕获的有界净化提示词/工具生命周期观察；**仅当客户端消费启动钩子输出或等价上下文注入结果时**，交接在 SessionStart 无需人工提示即浮现 | 钩子观察不是完整原生转录。Grok 与 Zero 丢弃 SessionStart stdout；恢复时让它们调 `memory_handoff_accept`。 |

仅 MCP 使用时，退出前让 LLM 手工调 `memory_handoff_begin` 仍可覆盖会话边界缺口。

读项目指令的 MCP 客户端要主动使用工具，还请安装[日常使用](/usage/#安装路由片段与智能体技能)里的托管路由包。轻量指令块留在智能体规则文件里，受支持的智能体技能承载详细 ai-memory 工具路由指引。

## 自定义生命周期桥

内建集成应该用 `ai-memory install-hooks` 而非直接调 `/hook`。有自己生命周期词汇表的第三方桥，尽量把核心 `event` 查询参数保持在 ai-memory 的规范事件之一：

### 社区维护的 Hermes Agent 插件

ai-memory 目前不发布第一方 Hermes Agent 安装器，但有社区维护的 [`ai-memory-hermes-plugin`](https://github.com/MrLuciano/ai-memory-hermes-plugin)。把它当第三方桥：在真实 ai-memory 服务器上启用前，核验其文档的 Hermes 与 ai-memory 版本矩阵、安装/更新/卸载行为、平台覆盖与秘密处理。特别地，bearer token 与端点设置应留在环境或本地配置引用里，而不是生成的插件源文件里。

钩子路由器确实把 `agent=hermes` 认作具体会话类别，并接受 Hermes 有文档的 shell-hook `tool_name` / `tool_input` 信封做工具族元数据与捕获排除强制。自定义桥应把 `on_session_start`、`post_tool_call`、`on_session_end` 映射到 ai-memory 规范的 `session-start`、`post-tool-use`、`session-end` 事件名，同时转发原始 JSON 对象。这个协议识别不安装、也不信任第三方插件。Hermes 忽略 session-start 钩子 stdout，所以无法在那里消费自动交接；用 MCP `memory_handoff_accept`。

下面的生命周期指引同样适用于 Hermes 或任何其他外部桥：可能时把已知事件映射到 ai-memory 的规范钩子事件，用扩展元数据承载来源专属事件，而不是为单个客户端扩 ai-memory 的存储事件枚举。

```bash
curl -X POST \
  'http://127.0.0.1:49374/hook?event=user-prompt&agent=other' \
  -H 'content-type: application/json' \
  -d '{"session_id":"sess-123","cwd":"/repo","prompt":"Fix auth"}'
```

源事件无规范等价物时，选择启用扩展元数据，而不是要求 ai-memory 扩其存储事件枚举：

```bash
curl -X POST \
  'http://127.0.0.1:49374/hook?event=lead.contact&agent=other&extension=fstech' \
  -H 'content-type: application/json' \
  -d '{"session_id":"sess-123","title":"Lead contacted","message":"Lead Maria requested a proposal"}'
```

带 `extension=<namespace>` 时，未知事件仍存为规范的 `other` 观察类别，但 ai-memory 同时保留校验过的源事件。可显式传 `source_event=<name>`；否则未知的 `event` 值成为源事件。两个 token 都必须是 ASCII 字母、数字、`.`、`_`、`-`、`:`；命名空间限 64 字节、源事件名限 128 字节。不带 `extension` 的未知事件刻意塌缩为 `other`、不带源元数据。

> **一次性提示：**下面每个片段也都可以从 CLI 走：
> ```bash
> ai-memory install-mcp --client gemini-cli   # 或 cursor / claude-desktop / openclaw / omp / pi / antigravity-cli / grok / kimi-code / kiro-cli / command-code / swival / devin / zero / vscode-copilot / zed
> ```

---

## Claude Code

**状态：**✅ 支持原生 HTTP MCP。✅ 支持可选的会话感知 stdio 桥（并发会话）。

默认注册保持静态 HTTP 条目：

```bash
ai-memory install-mcp --client claude-code --apply
```

静态 HTTP 配置无法附上当前生命周期钩子会话 id，所以 `[auto_scope] mode = "per_session"` 无法经该条目隔离两个并发 Claude Code 会话。改选 ai-memory 的本地 stdio 桥：

```bash
ai-memory install-mcp --client claude-code --session-aware --apply
```

生成的条目跑 `ai-memory mcp-bridge`，连接同一配置的本地或远程 `/mcp` 端点、保留 bearer 认证、并给每个上游请求加 `X-Memory-Actor-Session-Id: <CLAUDE_CODE_SESSION_ID>`。它支持 ai-memory 默认的无状态 HTTP 模式与选择启用的有状态模式。Claude 没给会话 id 时命令失败关闭，而不是静默回退共享单槽位。

桥配这个服务器设置：

```toml
[auto_scope]
mode = "per_session"
```

Claude Code 给 stdio MCP 子进程设 `CLAUDE_CODE_SESSION_ID`，但子进程在 `/clear` 之后保留启动时的 id。另外，不带显式 id 的 `--continue` 或 `--resume` 可能暴露启动 id 而非恢复 id。会话键连续性要紧时 `/clear` 后重启 Claude Code；隐式恢复偏好 `--resume <session-id>`。这些是上游生命周期限制；桥不猜、也不在 Claude Code 背后切换身份。

`--session-aware` 仅限 Claude Code。其他客户端保持其有文档的原生 HTTP 或生成的桥路径。

---

## Cursor

**状态：**✅ 支持 MCP。✅ 经 `ai-memory install-hooks --agent cursor --apply` 支持生命周期钩子。

**配置文件：**
- 逐项目：工作区根的 `.cursor/mcp.json`。
- 全局：`~/.cursor/mcp.json`。

```json
{
  "mcpServers": {
    "ai-memory": {
      "url": "http://127.0.0.1:49374/mcp"
    }
  }
}
```

**注意：**
- Cursor 对 HTTP/SSE 传输用 `url` 键。stdio 改用 `command` + `args`。
- Cursor 钩子住在 `~/.cursor/hooks.json` 或 `.cursor/hooks.json`。
  ai-memory 把 `sessionStart`、`sessionEnd`、`beforeSubmitPrompt`、
  `preToolUse`、`postToolUse`、`postToolUseFailure`、`preCompact`、
  `stop` 映射到共享捕获路径。
- Cursor 保存时监视 `hooks.json`。MCP 配置变更需重启 Cursor 或在 **Settings → MCP** 里把服务器关掉再开。
- 来源：<https://cursor.com/docs/mcp>、<https://cursor.com/docs/hooks.md>

---

## VS Code GitHub Copilot

**状态：**✅ 支持 MCP（workspace 默认）。❌ 无生命周期钩子（Copilot 的 agent 模式尚未暴露 `PreToolUse` / `PostToolUse` / `SessionStart`，所以 ai-memory 的自动捕获在 VS Code 里不活跃——在聊天里调 `memory_query`、`memory_write_page` 等）。

**配置文件：**
- 工作区（推荐）：仓库根的 `.vscode/mcp.json`。匹配 ai-memory 的逐 cwd auto-scope。
- 用户 profile：在 VS Code 里跑 **MCP: Open User Configuration**，用它打开的 `mcp.json` 文件。确切路径随平台与 profile 而异；想让 ai-memory 直接写那个文件就传 `--config-file`。

**schema（对照 VS Code 的 MCP 参考核验过）：**顶层键是 `servers`（不是 `mcpServers`）。HTTP 端点用 `type: "http"` 与 `url` 字段；bearer token 放内联 `headers` 对象。

```json
{
  "servers": {
    "ai-memory": {
      "type": "http",
      "url": "http://127.0.0.1:49374/mcp"
    }
  }
}
```

**带 bearer token**（传 `--auth-token` 时渲染）：

```json
{
  "servers": {
    "ai-memory": {
      "type": "http",
      "url": "http://127.0.0.1:49374/mcp",
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  }
}
```

**安装命令：**

```bash
# 打印片段：
ai-memory install-mcp --client vscode-copilot

# 或直接写当前工作区的 .vscode/mcp.json：
ai-memory install-mcp --client vscode-copilot --apply

# 或直接写 VS Code 打开的用户 profile mcp.json：
ai-memory install-mcp --client vscode-copilot \
  --config-file /path/to/vscode-profile/mcp.json --apply
```

别名：`copilot`、`github-copilot`。

**注意：**
- 顶层键必须是 `servers`。Claude Code / Cursor / Gemini CLI 用的 `mcpServers` 形式被 VS Code 静默忽略。
- 编辑后在扩展侧栏打开 MCP 视图并启动服务器（或用 **MCP: Show installed servers**）。窗口聚焦在别的标签页时 VS Code 不自动重载 `.vscode/mcp.json`。
- Copilot Enterprise 的 MCP 行为与 Copilot 个人版/商业版相同——组织可能限制 Copilot 可调用的 MCP 服务器；服务器显示被封锁时查 **Settings → Copilot → MCP servers**。
- VS Code Copilot 加上智能体钩子面之前不可能有生命周期钩子。在那之前，其他智能体享受的自动交接流（SessionStart 自动取「你上次做到哪了」块）在这里不运行——想要就让智能体手工调 `memory_handoff_accept`。
- 来源：
  <https://code.visualstudio.com/docs/copilot/customization/mcp-servers>、
  <https://code.visualstudio.com/docs/agents/reference/mcp-configuration>

---

## Zed

**状态：**经 Zed 原生远程 context-server 配置支持 MCP。无生命周期钩子或托管工作流适配器。

**配置文件：**Zed 把 MCP 服务器存在用户 `settings.json`：

- macOS：`~/.config/zed/settings.json`
- Linux：`$XDG_CONFIG_HOME/zed/settings.json`，默认
  `~/.config/zed/settings.json`
- Windows：`%APPDATA%\Zed\settings.json`

服务器 map 是顶层 `context_servers` 键。远程服务器用 `url`、可在 `headers` 里带 bearer 认证：

```json
{
  "context_servers": {
    "ai-memory": {
      "url": "http://127.0.0.1:49374/mcp",
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  }
}
```

打印或应用配置：

```bash
ai-memory install-mcp --client zed
ai-memory install-mcp --client zed --apply \
  --server-url "http://homelab:49374/mcp" \
  --auth-token "$TOKEN"
```

`--apply` 保留 JSONC 注释、尾逗号、无关 Zed 设置与其他 context server。Zed 能调 ai-memory 的 MCP 工具，但不暴露兼容的会话或工具生命周期钩子。自动捕获、自动交接注入与 `ai-memory run` 连续性因此不可用；需要手工连续性时，让智能体离开前调 `memory_handoff_begin`、恢复时调 `memory_handoff_accept`。

来源：<https://zed.dev/docs/ai/mcp>、
<https://zed.dev/docs/configuring-zed>。

---

## Claude Desktop

**状态：**✅ 支持 MCP（经 HTTP 的 stdio 垫片）。❌ 无生命周期钩子。

**配置文件：**
- macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows：未打包安装是 `%APPDATA%\Claude\claude_desktop_config.json`，或检测到 MSIX 打包安装时
  `%LOCALAPPDATA%\Packages\Claude_<id>\LocalCache\Roaming\Claude\claude_desktop_config.json`。`install-mcp` 自动检查 `Claude_*` 包目录并偏好已含配置的那个。多个候选仍有歧义时，它停下来要求显式 `--config-file` 而不是猜。
- Linux：Anthropic 未正式分发。改用 Claude Code（终端）。

**重要：**Claude Desktop 的 JSON 配置只支持 stdio MCP 服务器。要对接 ai-memory 的 HTTP 端点，经社区的 [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) stdio 垫片桥接。要求同机装有 Node.js。

```json
{
  "mcpServers": {
    "ai-memory": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://127.0.0.1:49374/mcp"]
    }
  }
}
```

**注意：**
- 改配置后**完全退出并重启** Claude Desktop。「检查更新……」不够。
- Claude Desktop 还有账号级远程自定义连接器与 `.mcpb` 桌面扩展。ai-memory CLI 管理本地 JSON 配置路径，因为它配合 localhost/局域网服务器、且不需要发布 HTTPS 连接器。
- Claude Desktop 暴露 MCP 工具但无生命周期钩子，所以自动提示词/工具捕获与会话边界交接不可能——除非 Anthropic 加桌面钩子/插件面。
- 重启后 MCP 指示器不出现就查日志：`~/Library/Logs/Claude/mcp*.log`（macOS）。Windows 查未打包安装的 `%APPDATA%\Claude\logs\` 或检测到的 `%LOCALAPPDATA%\Packages\Claude_<id>\` 包下对应的 `LocalCache\Roaming\Claude\logs\` 目录。
- **Windows MSIX 打包：**打包的 Claude Desktop 是 AppContainer。Windows 把其 `%APPDATA%` 写入重定向进隔离的 `AppData\Local\Packages\Claude_<id>\LocalCache\Roaming\` 树，本 CLI 这类未打包进程必须直接寻址那里。`install-mcp --client claude-desktop --apply` 检测到并自动写打包位置。旧版 ai-memory 上，把 `--config-file` 直接指向 `LocalCache` 路径。
- 来源：<https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop>、
  <https://support.claude.com/en/articles/11175166-how-to-connect-remote-mcp-integrations-to-claude>、
  <https://learn.microsoft.com/en-us/windows/msix/msix-containerization-overview>

---

## Gemini CLI

**状态：**✅ 支持 MCP。✅ 经 `ai-memory install-hooks --agent gemini-cli --apply` 支持生命周期钩子。

**配置文件：**
- 用户：`~/.gemini/settings.json`
- 项目：`.gemini/settings.json`

Gemini CLI 对 streamable-HTTP MCP 端点用 `httpUrl`（不是 `url`）。`timeout` 单位毫秒。

```json
{
  "mcpServers": {
    "ai-memory": {
      "httpUrl": "http://127.0.0.1:49374/mcp",
      "timeout": 5000
    }
  }
}
```

**钩子：**

```bash
ai-memory install-hooks --agent gemini-cli --apply
```

Gemini CLI 的生命周期事件名与 Claude Code 不同，所以用 `install-hooks --agent gemini-cli` 而非复制别的智能体的设置。ai-memory 把 Gemini 的 `SessionStart`、`SessionEnd`、`BeforeTool`、`AfterTool`、`PreCompress` 事件映射到共享钩子捕获路径；`SessionStart` 也取待处理交接。

**注意：**
- Gemini 也支持 stdio（`command`/`args`）与 SSE（`url`）。
  只有 `httpUrl` 覆盖 streamable HTTP。别在一个条目里混用。
- 改 `~/.gemini/settings.json` 后重启 CLI 会话，MCP 服务器与钩子才都重载。
- 来源：<https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md>

---

## Antigravity CLI（`agy`）

**状态：**✅ 支持 MCP。✅ 经 `ai-memory install-hooks --agent antigravity-cli --apply` 支持生命周期钩子。

**配置文件（MCP）：**`~/.gemini/antigravity-cli/mcp_config.json`

Antigravity CLI 是 Gemini CLI 的后继者，Go 构建、支持并行子智能体。它用单独的 `mcp_config.json`（而非 Gemini CLI 的合并 `settings.json`），且对 streamable-HTTP 端点用 `serverUrl`（不是 `httpUrl`）。

```bash
# 把 MCP 条目合并进 Antigravity 配置：
ai-memory install-mcp --client antigravity-cli --apply
```

渲染的片段写进 `mcp_config.json` 的 `mcpServers` 下：

```json
{
  "mcpServers": {
    "ai-memory": {
      "serverUrl": "http://127.0.0.1:49374/mcp",
      "timeout": 5000
    }
  }
}
```

**配置文件（钩子）：**`~/.gemini/config/hooks.json`

Antigravity CLI 用命名组钩子格式。每个顶层键是钩子组名；里面事件数组映射到处理器。工具事件（`PreToolUse`、`PostToolUse`）用带 matcher 的嵌套形状；生命周期事件（`PreInvocation`、`Stop`）用平铺形状。

```bash
# 经 CLI 一次性：
ai-memory install-hooks --agent antigravity-cli --apply
```

渲染的钩子配置形如：

```json
{
  "ai-memory": {
    "PreInvocation": [
      {
        "type": "command",
        "command": "AI_MEMORY_HOOK_URL=http://127.0.0.1:49374 /path/to/session-start.sh"
      }
    ],
    "PreToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "AI_MEMORY_HOOK_URL=http://127.0.0.1:49374 /path/to/pre-tool-use.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "AI_MEMORY_HOOK_URL=http://127.0.0.1:49374 /path/to/post-tool-use.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "type": "command",
        "command": "AI_MEMORY_HOOK_URL=http://127.0.0.1:49374 /path/to/stop.sh"
      }
    ]
  }
}
```

**注意：**
- Antigravity CLI 对 HTTP MCP 端点用 `serverUrl`、不是 `url` 或
  `httpUrl`。`--apply` 标志写正确的键。
- MCP 与钩子用不同文件：MCP 属于
  `~/.gemini/antigravity-cli/mcp_config.json`，钩子属于
  `~/.gemini/config/hooks.json`。
- 钩子脚本暂存在 `~/.local/share/ai-memory/hooks/antigravity-cli/` 下。
- 原生 Windows Docker 包装器安装把钩子条目渲染为
  `powershell.exe ... -EncodedCommand <payload>`，让 Antigravity 的外层命令运行器无法展开内层 `$env:` 设置。子进程还强制文本输出并禁用进度，让 PowerShell 不把进度记录序列化为 `CLIXML` 钩子 stderr。升级后重跑 `install-hooks --agent antigravity-cli --apply` 刷新既有条目。
- `PreInvocation` 事件在每次模型调用前触发（不只是会话开始）。ai-memory 把它用作 Gemini CLI `SessionStart` 的最接近等价物；存在待处理交接时，钩子经 Antigravity 的 `injectSteps[].ephemeralMessage` 输出注入它。
- Antigravity CLI 不暴露真正的会话结束钩子。`Stop` 只记录停止观察，因为它标记一个执行循环的结束、不是对话。最后一轮之后跑 `ai-memory finalize-session --agent antigravity-cli` 关闭会话，并在其含实质事件时创建最终摘要与自动交接、排队选择启用的 SessionEnd 整编。
- `memory_handoff_begin` 总是创建显式手工交接——无 `from_session_id`、`from_agent = other`；它按 cwd 匹配覆盖全项目、默认属于创建它的操作者。只在要发布给项目里每个操作者时传 `shared=true`。该会话中立的形状对每个 MCP 客户端相同。带 Codex 或 Claude 会话 id 的交接来自规范 SessionEnd 处理、不是手工工具。会话本身必须结束并产出带归因的自动交接时，用显式的 Antigravity 收尾器。
- 内建 `/web` 路由显示编译 wiki 页面、不是裸会话或观察行。验证钩子捕获：比较一条提示词前后 `ai-memory status` 的 `sessions` 与 `observations` 计数。
- 来源：<https://antigravity.google/docs/hooks>

---

## Zero（Gitlawb/zero）

Zero 把 MCP 服务器管理在 `~/.config/zero/config.json`（非默认 XDG 设置下 `$XDG_CONFIG_HOME/zero/config.json`）的 `mcp.servers` map 里，原生 HTTP 传输 + bearer 头：

```bash
ai-memory install-mcp --client zero --apply \
    --server-url "http://homelab:49374/mcp" --auth-token "$TOKEN"
```

合并出：

```json
{
  "mcp": {
    "servers": {
      "ai-memory": {
        "type": "http",
        "url": "http://homelab:49374/mcp",
        "headers": { "Authorization": "Bearer <token>" }
      }
    }
  }
}
```

生命周期捕获独立且无脚本：`ai-memory install-hooks --agent zero --apply` 把 exec 形式条目（原生 `ai-memory hook` 命令 + 参数、stdin 收 JSON payload——无 shell）合并进 `~/.config/zero/hooks.json`，覆盖 `sessionStart`/`sessionEnd`/`beforeTool`/`afterTool` 加 `specialistStart`/`specialistStop`（映射到 ai-memory 的子智能体事件）。Zero 丢弃 `sessionStart` 钩子 stdout，所以捕获与会话结束交接*创建*可用、交接*注入*不可用——恢复会话开始时让 Zero 调 `memory_handoff_accept`。

## Swival CLI

**状态：**支持 MCP。不支持生命周期钩子与托管工作流：Swival 调一个共享的启动/退出回调、不暴露稳定的会话标识符，所以并发会话无法安全关联。

**配置文件：**Swival 默认读项目作用域的 `.swival/mcp.json`（它自己文档的默认查找），所以 `install-mcp --client swival --apply` 在最近的 `.git` 或 `swival.toml` 祖先下合并进该路径，匹配 Swival 自己的项目根发现。只想指向别的 MCP JSON 文件时传 `--config-file`。

```bash
ai-memory install-mcp --client swival --apply \
  --server-url "http://homelab:49374/mcp" \
  --auth-token "$TOKEN"
```

合并进 `.swival/mcp.json`：

```json
{
  "mcpServers": {
    "ai-memory": {
      "type": "http",
      "url": "http://homelab:49374/mcp",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

`uninstall --only mcp --apply --yes` 从该文件移除匹配的 ai-memory 条目、保留所有无关 MCP 服务器。

## Grok Build CLI

**状态：**✅ 支持 MCP。✅ 经 `ai-memory install-hooks --agent grok --apply` 支持生命周期钩子。❌ 无自动交接注入（Grok 忽略 SessionStart stdout——与 Zero 同策略）。

**配置文件：**`install-mcp --client grok --apply` 把用户配置写在 `$GROK_HOME/config.toml`（默认 `~/.grok/config.toml`）。用项目或自定义配置文件时，用 `--config-file` 传其确切路径；CLI 不推断项目配置位置。为该通道显式提供 MCP URL 与 token，卸载时手工移除自定义配置条目。

```bash
ai-memory install-mcp --client grok --apply \
    --server-url "http://homelab:49374/mcp" --auth-token "$TOKEN"
```

合并出：

```toml
[mcp_servers.ai-memory]
url = "http://homelab:49374/mcp"
enabled = true

[mcp_servers.ai-memory.headers]
Authorization = "Bearer <token>"
```

**schema 注记（别与 Codex 混淆）：**
- Grok 用 `[mcp_servers.<name>.headers]`；Codex 用 `http_headers`。
- `enabled = true` 是有文档的逐服务器开关。
- 字符串字段支持 `${VAR}` 展开，所以可写
  `Authorization = "Bearer ${AI_MEMORY_AUTH_TOKEN}"` 而非内嵌 token。
- CLI 替代：`grok mcp add --transport http ai-memory <url>`（bearer 认证加 `--header`）。

生命周期捕获独立：`ai-memory install-hooks --agent grok --apply` 写 `$GROK_HOME/hooks/ai-memory.json`（默认 `~/.grok/hooks/ai-memory.json`；Grok 发现每个 `$GROK_HOME/hooks/*.json`，第三方钩子文件不动）。事件镜像 Claude Code 的词汇表（`SessionStart`、`UserPromptSubmit`、`PreToolUse`、`PostToolUse`、`PreCompact`、`Stop`、`SessionEnd`、`SubagentStart`、`SubagentStop`），配 Grok 专属脚本包 / 原生 `ai-memory hook --event … --agent grok` 命令。会话结束交接*创建*可用；交接*注入*不可用——恢复会话开始时让 Grok 调 `memory_handoff_accept`（或在 `.grok/skills` / `$GROK_HOME/skills`（默认 `~/.grok/skills`）下装托管路由技能）。

启用那些兼容标志时 Grok 也能从 Claude Code / Cursor 兼容源加载 MCP，但卸载隔离与钩子 URL 推断方面，第一方 `install-mcp --client grok` 才是受支持路径。

## Devin CLI

Devin 把 MCP 服务器管理在 `~/.devin/config.json` 的 `mcpServers` 下：

```bash
ai-memory install-mcp --client devin --apply \
    --server-url "http://homelab:49374/mcp" --auth-token "$TOKEN"
```

合并出：

```json
{
  "mcpServers": {
    "ai-memory": {
      "url": "http://homelab:49374/mcp",
      "transport": "http",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

生命周期捕获独立：

```bash
ai-memory install-hooks --agent devin --apply \
    --server-url "http://homelab:49374" --auth-token "$TOKEN"
```

默认写 `~/.devin/hooks.v1.json`，其根对象是事件 map。想让钩子条目进 `~/.devin/config.json` 的话，用 `--config-file` 传该路径；ai-memory 随后把它们合并进 `hooks` 键下。

Devin 受支持的生命周期事件是 `SessionStart`、`UserPromptSubmit`、`PreToolUse`、`PostToolUse`、`PostCompaction`、`Stop`、`SessionEnd`。`PostCompaction` 是带 `summary` 字段的 Devin 压缩后事件；不是 Claude Code 的 `PreCompact`。Devin 目前不暴露子智能体 start/stop 钩子，所以没有 Devin 子智能体捕获面可装。

会话启动交接内建：生成的 Devin SessionStart 钩子在有待处理交接时返回 `hookSpecificOutput.additionalContext`。

真实 Devin 钩子 payload 可能缺 `session_id` 与 `cwd`；安装的钩子补齐两者：

- **cwd**——payload 的 `cwd` 在场时优先，然后是 `DEVIN_PROJECT_DIR` 环境变量（Devin 启动器提供时），然后是钩子进程工作目录。
- **会话 id**——payload 没有时，钩子在 `SessionStart` 铸造一个、存进单一逐宿主槽位（`<data-dir>/hook-state/devin-session-id`）、后续事件复用、`SessionEnd` 清除。想钉住外部管理的运行 id 就在钩子环境设 `AI_MEMORY_SESSION_ID`。因为槽位是逐宿主+智能体的，同机*并发*跑的两个 Devin 会话共享它——最新 `SessionStart` 胜出、早先会话的剩余事件归到它名下（与单槽位 `/handoff` 回退相同的优雅降级姿态）。自带 `session_id` 的 payload 永远优先于两者。

## Kimi Code

**状态：**✅ 支持 MCP。✅ 经 `ai-memory install-hooks --agent kimi-code --apply` 支持生命周期钩子。

**配置文件（MCP）：**`~/.kimi-code/mcp.json`（设了 `KIMI_CODE_HOME` 时 `$KIMI_CODE_HOME/mcp.json`）。

Kimi Code 把任何带 `url` 字段而无 `transport` 字段的 `mcpServers` 条目当 streamable-HTTP 服务器，所以条目不需要 transport 键：

```bash
ai-memory install-mcp --client kimi-code --apply \
    --server-url "http://homelab:49374/mcp" --auth-token "$TOKEN"
```

合并出：

```json
{
  "mcpServers": {
    "ai-memory": {
      "url": "http://homelab:49374/mcp?flavor=moonshot",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

`install-mcp` 自己追加 `?flavor=moonshot` 查询（幂等，重跑不重复）。Moonshot API 按受限方言（「moonshot 风味 json schema」）校验工具参数 schema，拒绝根级 `anyOf`/`oneOf`/`allOf` 组合子——包括 `memory_read_page` 上的 `anyOf`——并在 `tools/list` 以 400 让整个会话失败。ai-memory 服务器对带此风味的请求应答平铺 schema；其他客户端继续原样收到上游 schema。

**配置文件（钩子）：**`~/.kimi-code/config.toml`（同一 `$KIMI_CODE_HOME` 基）。Kimi Code 把钩子存为同一份持有其提供方/模型设置的 TOML 文件里的 `[[hooks]]` 数组条目；`install-hooks` 合并 ai-memory 条目、保留其余一切：

```bash
ai-memory install-hooks --agent kimi-code --apply \
    --server-url "http://homelab:49374" --auth-token "$TOKEN"
```

安装的条目覆盖 10 个事件——`SessionStart`、`SessionEnd`、`UserPromptSubmit`、`PreToolUse`、`PostToolUse`、`PostToolUseFailure`（Kimi Code 只在成功调用上触发 `PostToolUse`）、`Stop`、`SubagentStart`、`SubagentStop`、`PreCompact`——配 Kimi Code 专属脚本包 / 原生 `ai-memory hook --event … --agent kimi-code` 命令（本地安装默认原生；`~/.local/share/ai-memory/hooks/kimi-code/` 下暂存的脚本是兼容性回退）。捕获即发即忘；待处理交接经钩子 stdout 在 `UserPromptSubmit` 注入（Kimi Code 丢弃 `SessionStart` stdout 但把成功的 user-prompt 钩子输出前置于回合）。

**注意：**
- HTTP 服务器别加 `transport` 字段：仅 `url` 即 streamable HTTP；`transport: "sse"` 选遗留 SSE 传输。
- 别从安装的 URL 剥掉 `?flavor=moonshot` 查询：没有它 Moonshot API 拒绝 `memory_read_page` 的根 `anyOf`、每个会话都在 `tools/list` 失败。
- 钩子条目只接受 `event`、`matcher`、`command`、`timeout`（秒，1-600，默认 30）。任何多余字段让 Kimi Code 加载不了整个 `config.toml`，所以偏好 `install-hooks --apply` 而非手编。
- 多条规则匹配同一事件时 Kimi Code 对相同命令只跑一次。`PostToolUse` 与 `PostToolUseFailure` 复用一个处理器命令，但是互斥的事件触发器，所以成功与失败调用都各捕获一次。

## Command Code

**状态：**支持 MCP 与四个稳定 shell-hook 事件。不安装托管工作流与实验性 Mods。

**配置文件：**MCP 用 `~/.commandcode/mcp.json`、生命周期钩子用 `~/.commandcode/settings.json`。

```bash
ai-memory install-mcp --client command-code --apply \
    --server-url "http://homelab:49374/mcp" --auth-token "$TOKEN"
ai-memory install-hooks --agent command-code --apply \
    --server-url "http://homelab:49374" --auth-token "$TOKEN"
```

MCP 安装器写有文档的用户作用域远程形状：

```json
{
  "mcpServers": {
    "ai-memory": {
      "transport": "http",
      "enabled": true,
      "url": "http://homelab:49374/mcp",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

钩子安装器注册 `SessionStart`、`PreToolUse`、`PostToolUse`、`Stop`。它从每个定义省略外层 `matcher`，因为 Command Code 文档把省略解释为匹配每个工具、并说 matcher 会阻止非工具的 `SessionStart` 与 `Stop` 事件触发。原生安装在本地暂存事件、对有文档的工具信封强制捕获排除、并在 `SessionStart` 用 `hookSpecificOutput.additionalContext` 注入待处理交接。

`Stop` 只是回合边界。最后一轮之后跑 `ai-memory finalize-session --agent command-code`（多个会话共享该项目时加 `--session-id <uuid>`）。ai-memory 不生成 Mod：该 API 实验性且非沙箱。Command Code 官方文档化了其项目作用域只追加 JSONL 位置、原生恢复选择器、`--yolo` 与 Windows 别名，但没文档化 JSONL 记录 schema。托管适配器保持推迟，直到一次真实的登录态客户端验收测试提供净化的结构夹具并验证检出所有权、增量可见事件导入、恢复身份、正常退出收尾与原生 Windows 执行。

来源：<https://commandcode.ai/docs/mcp>、
<https://commandcode.ai/docs/hooks>、
<https://commandcode.ai/docs/mods>、
<https://commandcode.ai/docs/reference/cli>，以及
<https://commandcode.ai/docs/sessions> 的原生会话契约。

## Kiro CLI

**状态：**支持 MCP、v2 生命周期钩子与显式 v2 托管工作流。裸自动工作流选择仍不支持，等待一次登录态的当前格式 v2 验收运行。V3 钩子与托管会话需要它们自己的有文档、经夹具测试的 payload 与存储契约。

**配置文件：**`$KIRO_HOME/settings/mcp.json`、默认 `~/.kiro/settings/mcp.json`。刻意想要 Kiro 更低作用域的项目配置时用 `--config-file .kiro/settings/mcp.json`。

```bash
ai-memory install-mcp --client kiro-cli --apply \
    --server-url "https://memory.example/mcp" --auth-token "$TOKEN"
```

`kiro` 别名等价。命令保留无关设置与服务器，幂等合并此条目：

```json
{
  "mcpServers": {
    "ai-memory": {
      "url": "https://memory.example/mcp?flavor=bedrock",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

Kiro 经 Amazon Bedrock 发送 MCP 工具 schema，后者拒绝根级 `anyOf`、`oneOf`、`allOf`。安装器追加 `?flavor=bedrock`；服务器只为该请求剥掉那些根组合子、保留嵌套 schema 与处理器的运行时校验。Kimi Code 既有 `?flavor=moonshot` 行为独立保持受支持。

Kiro 只允许 HTTPS 的远程 MCP URL。明文 HTTP 只对 `localhost`、`127.0.0.1` 或其他环回地址接受；`install-mcp` 在写配置前拒绝非环回 HTTP URL。家庭实验室部署见[HTTPS 反向代理](/https-via-proxy/)。

ai-memory 经显式引擎目标支持两种有文档的 Kiro 钩子注册格式：

```bash
# v2：更新每个既有的全局智能体定义。
ai-memory install-hooks --agent kiro-cli --apply

# v2 项目本地智能体：显式定位活跃定义。
ai-memory install-hooks --agent kiro-cli --apply \
    --config-file .kiro/agents/<agent-name>.json

# v3：独立全局注册。
ai-memory install-hooks --agent kiro-cli-v3 --apply

# v3 项目本地注册。
ai-memory install-hooks --agent kiro-cli-v3 --apply \
    --config-file .kiro/hooks/ai-memory.json
```

独立格式经交互式 Kiro CLI 2.16.2 `--v3` 会话做过验收测试。

v2 安装器拒绝创建合成智能体文件、改任何一个之前先解析全部目标。项目本地 Kiro 智能体覆盖全局智能体，所以活跃定义在 `.kiro/agents/` 下时必须 `--config-file`。集成保持失败开放、经 `agentSpawn` stdout 注入待处理交接、并尊重 `$KIRO_HOME`。v3 安装器写 PascalCase 触发器的独立 `v1` 文件、保留第三方条目、共享同一失败开放净化器与捕获排除边界。`ai-memory run kiro`（别名 `kiro-cli`）管理默认 v2 引擎；加 `--v3`、`--mode`、或 `--agent-engine v3` 选不兼容的 v3 存储。一旦关联，之后裸的 Kiro 启动透明恢复那个引擎，且裸 `ai-memory run` 考虑两个引擎的检出本地会话而不交叉恢复。

来源：<https://kiro.dev/docs/mcp/configuration/>、
<https://kiro.dev/docs/reference/settings/>、
<https://kiro.dev/docs/hooks/>、
<https://kiro.dev/docs/hooks/types/>、
<https://kiro.dev/docs/cli/v3/hooks-migration/>。

## OpenClaw

**状态：**✅ 支持 MCP。✅ 经 `ai-memory install-hooks --agent openclaw --apply` 生成的原生 OpenClaw 插件支持生命周期钩子。

**配置文件：**`~/.openclaw/config.json`（OpenClaw 文档间接提到该路径；用 `openclaw config show` 核验）。

OpenClaw 显式区分传输。ai-memory 的 HTTP 端点用 `"transport": "streamable-http"`。

```json
{
  "mcp": {
    "servers": {
      "ai-memory": {
        "url": "http://127.0.0.1:49374/mcp",
        "transport": "streamable-http"
      }
    }
  }
}
```

**注意：**
- `install-hooks --agent openclaw --apply` 在 ai-memory 数据目录下写一个本地插件包，然后在 `openclaw` CLI 在 `PATH` 上时跑 `openclaw plugins install --link <dir> --force`。CLI 不可用时，它打印确切的安装命令。
- 插件注册 OpenClaw 的 `session_start`、`session_end`、`before_prompt_build`、`before_tool_call`、`after_tool_call`、`before_compaction`、`agent_end` 钩子。`before_prompt_build` 经 OpenClaw 的 `prependContext` 钩子结果注入待处理交接。
- 插件安装或更新需要 Gateway 重启——除非你的托管 OpenClaw Gateway 在插件源变更后自动重启。
- 来源：<https://docs.openclaw.ai/cli/mcp>、
  <https://docs.openclaw.ai/plugins/hooks>、
  <https://docs.openclaw.ai/plugins/manage-plugins>

---

## Oh My Pi / OMP

**状态：**✅ 经 `install-mcp --client omp`（或 `--client oh-my-pi`）支持 MCP。✅ 经 `ai-memory install-hooks --agent omp --apply`（或 `--agent oh-my-pi`）支持生命周期捕获。

**配置文件：**
- 用户：`~/.omp/agent/mcp.json`
- 项目：`.omp/mcp.json`

当前 Oh My Pi 包暴露 `omp` 二进制与原生 `.omp` 配置目录。此集成用 `omp`（或 `oh-my-pi`）；真正的 `pi` 被单独识别、用下面生成的桥扩展。

```json
{
  "mcpServers": {
    "ai-memory": {
      "type": "http",
      "url": "http://127.0.0.1:49374/mcp",
      "enabled": true
    }
  }
}
```

**生命周期扩展：**

```bash
ai-memory install-hooks --agent omp --apply
# 或：ai-memory install-hooks --agent oh-my-pi --apply
```

这写 `~/.omp/agent/extensions/ai-memory-omp.ts`，OMP 启动时把它发现为直接 TypeScript 扩展。安装或更改文件后重启 `omp`。设了 `PI_CODING_AGENT_DIR`（它迁移 OMP 整个 `~/.omp/agent` 家）时，扩展写到 `$PI_CODING_AGENT_DIR/extensions/ai-memory-omp.ts`，且 `--profile <name>`（或 `OMP_PROFILE`）定位 `~/.omp/profiles/<name>/agent/extensions/`——注意 `PI_CODING_AGENT_DIR` 优先于 profile，因为它直接点名智能体目录。

Pi 与 OMP 尊重*同一* `PI_CODING_AGENT_DIR`，且每个智能体加载其扩展目录里的每个直接 `*.ts`。把两者指向同一目录会让各自加载两个扩展、把每个事件捕获两次（各按一个智能体身份）。`install-hooks` 检测到时警告；给两个智能体分开的家，或把 OMP 限定到一个 profile。

**注意：**
- OMP 扩展是 TypeScript 模块、不是 shell 钩子；stdout 不用于上下文注入。
- 扩展用 OMP 生命周期事件做提示词/工具捕获、用 `before_agent_start` 注入待处理 ai-memory 交接。

## Pi

**状态：**✅ 经生成的桥扩展支持 MCP 与生命周期捕获。Pi 无原生 `mcp.json`；用 `install-hooks --agent pi --apply` 写 `~/.pi/agent/extensions/ai-memory-pi.ts`。设了 `PI_CODING_AGENT_DIR`（它迁移 Pi 整个 `~/.pi/agent` 家）时，扩展写到 `$PI_CODING_AGENT_DIR/extensions/ai-memory-pi.ts`。

```bash
ai-memory install-hooks --agent pi --apply
```

生成的扩展把生命周期事件 POST 到 `/hook`、在 `before_agent_start` 取待处理交接、初始化 ai-memory 的 HTTP `/mcp` 端点、列出工具、并把每个用 `pi.registerTool` 注册。`install-mcp --client pi` 刻意打印此桥指引而不是写一个被忽略的 `~/.pi/agent/mcp.json`。

OMP / Oh My Pi 保持独立：`.omp` 路径用 `--client omp` / `--agent omp`（或 `oh-my-pi`）。

---

## 注册 MCP 之后——验证它能用

无论用哪个客户端，第一道健全性检查相同：让模型列出它能调的 MCP 工具，或显式调 `memory_status`。

```
You: List the MCP tools you can call. Use one of them to check
     ai-memory's status.

Model (any client): I can call: memory_query, memory_recent,
     memory_status, memory_briefing, memory_explore,
     memory_handoff_accept, memory_handoff_begin, memory_handoff_cancel,
     memory_consolidate, memory_auto_improve, memory_write_page,
     memory_read_page, memory_read_session_observations,
     memory_delete_page, memory_feedback,
     memory_lint, memory_forget_sweep, memory_install_self_routing.
     memory_status reports: 0 pages, 0 observations, 0 sessions.
```

模型看得到工具但不主动调用时，刷新托管路由包。`memory_install_self_routing` 工具只读：返回轻量带标记指令块、标记字符串、智能体文件名提示、托管技能 payload（`name`、`description`、`relative_path`、`content`）、以及 `.claude/skills`、`.agents/skills`、`.grok/skills`、`$GROK_HOME/skills`（默认 `~/.grok/skills`）的权威项目/全局目标提示、加覆盖指引。智能体应使用自己的文件编辑工具写那些工件、同时保留无关用户内容。

模型看不到任何这些工具，说明 MCP 注册没被拾取。检查：

1. **服务器在跑吗？**`curl http://127.0.0.1:49374/mcp` 应返回 JSON-RPC 错误（不是 connection refused）。被拒就启动 ai-memory：`docker start ai-memory` 或 `ai-memory serve --transport http`。
2. **客户端重载配置了吗？**Claude Desktop 与 OMP 需要重启。Cursor 监视钩子但通常需要 MCP 重载/开关。OpenClaw 插件变更需要 Gateway 重启——除非它自动重启了。
3. **端口对吗？**ai-memory 默认 **49374**（十六进制 `0xC0DE`）。重映射过就更新每个客户端配置里的 URL。

模型看得到工具但全部报错，说明服务器多半跑在意料之外的数据目录。查 `docker logs ai-memory` 或 `ai-memory status --json` 看磁盘上的数据目录。

---

## 自动交接什么时候真的工作？

跨智能体交接（README 的招牌卖点）需要两边——*结束*会话的智能体与*开始*下一个的智能体——都配合 ai-memory：

| 侧 | 需要什么 | 覆盖 |
|---|---|---|
| **结束侧** | 智能体须经真会话结束钩子、手工收尾器、或 `memory_handoff_begin` 创建交接。 | Claude Code、Devin CLI、Cursor、Gemini CLI、Grok Build CLI、Zero、Kimi Code、OpenClaw、OpenCode、OMP 内建自动。Codex、Antigravity CLI、两个 Kiro CLI 引擎、Command Code 无可靠真会话结束事件；最后一轮之后跑带相应 `--agent` 的 `ai-memory finalize-session`。Swival 这类仅 MCP 客户端必须显式调 `memory_handoff_begin`。 |
| **启动侧** | 要么 (a) 会话启动/插件路径经 `/handoff` 注入交接，要么 (b) 模型第一回合主动调 `memory_handoff_accept`。 | (a) 对 Claude Code / Codex / Devin CLI / Cursor / Gemini CLI / Antigravity CLI / Kimi Code / 两个 Kiro CLI 引擎 / Command Code / OpenClaw / OpenCode / OMP 内建。它要求客户端消费启动钩子 stdout 或等价上下文注入结果。Grok 与 Zero 丢弃 SessionStart stdout；Swival 仅 MCP。那些客户端用 (b)。(b) 对任何 MCP 客户端都行——只要轻推模型；见[托管路由包](/usage/#安装路由片段与智能体技能)。 |

OpenCode 用其官方 `session.deleted` 插件事件做真会话结束投递。其生成的插件还在正常插件拆除期间从 `dispose` 为仍活跃的会话发送去重的尽力关闭；突兀的进程退出仍可能丢掉那个回退，所以 `session.deleted` 仍是主要关闭路径。

Codex 与 Antigravity 的 `Stop` 事件不是会话结束。它们的钩子安装刻意省略 `SessionEnd`；`ai-memory finalize-session` 默认 Codex，`--agent antigravity-cli` 选 Antigravity。该命令为当前 workspace/project 找最新匹配的开放会话，并经与真实钩子客户端相同的服务器路径投递合成 `session-end` 事件。只想关闭该作用域内所选智能体的每个匹配开放会话时才用 `--all`。

典型的混合工作流长这样：

- **Claude Code → Cursor。**Claude Code 的 `SessionEnd` 自动创建交接。装了 `install-hooks --agent cursor --apply` 时，Cursor 的 `sessionStart` 钩子取回并前置它。
- **Claude Desktop → Claude Code。**Claude Desktop 不写交接（无钩子）。要在 Claude Code 里恢复，退出前得在 Claude Desktop 里手工调过 `memory_handoff_begin`。无论哪种方式，ai-memory 的 wiki 内容经 `memory_query` 都可用。
