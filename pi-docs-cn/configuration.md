---
title: "配置"
---

Pi 支持用户级与项目级配置。用户级配置存放于智能体目录（agent directory），默认为 `~/.pi/agent`。项目配置存放于工作目录下的 `.pi`，并在授予[项目信任](security#%E4%BA%86%E8%A7%A3%E9%A1%B9%E7%9B%AE%E4%BF%A1%E4%BB%BB)后加载。唯一的例外是 `sessionDir`，Pi 会在判定信任之前读取它，以便定位会话。

在交互模式下，可用 `/settings` 修改常用偏好设置。其他选项可以让 Pi 更新配置，或直接编辑相关文件。手动更改设置、按键绑定（keybinding）、指令或资源后，请运行 `/reload`。

## 智能体目录

下文以 `<agent-dir>` 表示智能体目录。可通过 `PI_CODING_AGENT_DIR` 环境变量或 SDK 的 [`agentDir`](sdk) 选项设置其位置。

| 路径 | 职责 |
|---|---|
| `<agent-dir>/settings.json` | 用户级[设置](settings)，包括偏好设置、默认值、资源路径与 Pi 包声明。 |
| `<agent-dir>/keybindings.json` | 自定义终端 UI 与应用级[按键绑定](keybindings)。 |
| `<agent-dir>/mcp.json` | 所有项目均可用的 [MCP 服务器](mcp)。 |
| `<agent-dir>/models.json` | [兼容端点、模型与模型覆盖项](models#%E9%85%8D%E7%BD%AE%E5%85%BC%E5%AE%B9%E7%AB%AF%E7%82%B9)。 |
| `<agent-dir>/auth.json` | 已保存的 API 密钥与 OAuth 凭据。 |
| `<agent-dir>/AGENTS.override.md`、`AGENTS.md`、`AGENTS.MD`、`CLAUDE.md` 或 `CLAUDE.MD` | 跨工作目录生效的用户指令。 |
| `<agent-dir>/SYSTEM.md` | 替换 Pi 的默认系统提示词（system prompt）。 |
| `<agent-dir>/APPEND_SYSTEM.md` | 向 Pi 的系统提示词追加指令。 |
| `<agent-dir>/extensions/` | 用户级[扩展（extension）](extensions)。 |
| `<agent-dir>/skills/` | 用户级[技能（skill）](skills)及配套文件。 |
| `<agent-dir>/prompts/` | 用户级[提示词模板（prompt template）](prompt-templates)，以斜杠命令（slash command）形式提供。 |
| `<agent-dir>/themes/` | 用户级[主题（theme）](themes)文件。 |

## 项目 `.pi` 目录

| 路径 | 职责 |
|---|---|
| `.pi/settings.json` | 项目级[设置](settings)、资源路径与 Pi 包声明。 |
| `.pi/mcp.json` | 项目级 [MCP 服务器](mcp)。 |
| `.pi/SYSTEM.md` | 替换该项目的系统提示词。 |
| `.pi/APPEND_SYSTEM.md` | 向系统提示词追加项目专属指令。 |
| `.pi/extensions/` | 项目扩展。 |
| `.pi/skills/` | 项目技能及配套文件。 |
| `.pi/prompts/` | 项目提示词模板，以斜杠命令形式提供。 |
| `.pi/themes/` | 项目主题文件。 |

对于 `SYSTEM.md` 与 `APPEND_SYSTEM.md`，受信任的项目文件优先于智能体目录中对应的文件。同名文件不会被合并。

## 上下文文件

上下文文件（context file）独立于项目 `.pi` 配置。Pi 会从智能体目录、工作目录及其父目录中加载它们。只要 Pi 在某上下文文件所在目录或其下任意位置运行，该文件即会生效。

`AGENTS.override.md` 只会在同一目录下替换 `AGENTS.md` 或 `CLAUDE.md`，不会屏蔽来自智能体目录或其他目录的上下文文件。

上下文文件的发现不依赖项目信任。
