---
title: '🔌 集成'
---

本目录包含代理公司（The Agency）在各支持的智能体编码工具下的集成与转换格式。

## 支持的工具

- **[Claude Code](#claude-code)**——`.md` 智能体，直接使用本仓库
- **[GitHub Copilot](#github-copilot)**——`.md` 智能体，直接使用本仓库
- **[Antigravity](#antigravity)**——每个智能体一个 `SKILL.md`，在 `antigravity/`
- **[Gemini CLI](#gemini-cli)**——`.md` 智能体文件在 `gemini-cli/agents/`
- **[OpenCode](#opencode)**——`.md` 智能体文件在 `opencode/`
- **[OpenClaw](#openclaw)**——`SOUL.md` + `AGENTS.md` + `IDENTITY.md` 工作区
- **[Cursor](#cursor)**——`.mdc` 规则文件在 `cursor/`
- **[Aider](#aider)**——`CONVENTIONS.md` 名册索引在 `aider/`
- **[Windsurf](#windsurf)**——`.windsurfrules` 在 `windsurf/`
- **[Kimi Code](#kimi-code)**——YAML 智能体规格在 `kimi/`
- **[Qwen Code](#qwen-code)**——项目级 `.md` 子智能体在 `.qwen/agents/`
- **[Mistral Vibe](/integrations/vibe/)**——`.toml` 智能体 + 提示词文件生成在 `vibe/`
- **Osaurus**——`SKILL.md` 技能生成在 `osaurus/`
- **[Hermes](/integrations/hermes/)**——lazy-router 插件生成在 `hermes/`

## 快速安装

```bash
# 自动为检测到的所有工具安装
./scripts/install.sh

# 安装某个用户主目录级工具
./scripts/install.sh --tool antigravity
./scripts/install.sh --tool copilot
./scripts/install.sh --tool openclaw
./scripts/install.sh --tool claude-code
./scripts/install.sh --tool codex
./scripts/install.sh --tool osaurus
./scripts/install.sh --tool hermes

# Gemini CLI 在全新 clone 后需要先生成集成文件
./scripts/convert.sh --tool gemini-cli
./scripts/install.sh --tool gemini-cli

# Qwen Code 在全新 clone 后同样需要先生成 SubAgent 文件
./scripts/convert.sh --tool qwen
./scripts/install.sh --tool qwen
```

如果安装了 OpenClaw 且网关已在运行，安装后请重启它：

```bash
openclaw gateway restart
```

对于 OpenCode、Cursor、Aider、Windsurf、Qwen Code 这类项目级工具，
请按下面各工具章节的说明，从你的目标项目根目录运行安装器。

## 重新生成集成文件

如果你新增或修改了智能体，请重新生成所有集成文件：

```bash
./scripts/convert.sh
```

---

## Claude Code

代理公司最初就是为 Claude Code 设计的。智能体无需转换即可原生工作。

```bash
cp -r <category>/*.md ~/.claude/agents/
# 或一次安装全部：
./scripts/install.sh --tool claude-code
```

详见 [claude-code/README.md](/integrations/claude-code/)。

---

## GitHub Copilot

代理公司同样原生支持 GitHub Copilot。智能体无需转换，可直接复制进
`~/.github/agents/` 和 `~/.copilot/agents/`。

```bash
./scripts/install.sh --tool copilot
```

详见 [github-copilot/README.md](/integrations/github-copilot/)。

---

## Antigravity

技能安装到 `~/.gemini/config/skills/`。每个智能体变成一个以
`agency-` 为前缀的独立技能，以避免命名冲突。

```bash
./scripts/install.sh --tool antigravity
```

详见 [antigravity/README.md](/integrations/antigravity/)。

---

## Gemini CLI

智能体被打包为 Gemini CLI 子智能体。
子智能体安装到 `~/.gemini/agents/`。
由于智能体文件是生成产物，在全新 clone 上安装前，
请先运行 `./scripts/convert.sh --tool gemini-cli`。

```bash
./scripts/convert.sh --tool gemini-cli
./scripts/install.sh --tool gemini-cli
```

详见 [gemini-cli/README.md](/integrations/gemini-cli/)。

---

## OpenCode

每个智能体变成 `.opencode/agents/` 下的一个项目级 `.md` 文件。

```bash
cd /your/project && /path/to/agency-agents/scripts/install.sh --tool opencode
```

详见 [opencode/README.md](/integrations/opencode/)。

---

## OpenClaw

每个智能体变成一个包含 `SOUL.md`、`AGENTS.md`
和 `IDENTITY.md` 的 OpenClaw 工作区。

安装前，先生成 OpenClaw 工作区：

```bash
./scripts/convert.sh --tool openclaw
```

然后安装：

```bash
./scripts/install.sh --tool openclaw
```

详见 [openclaw/README.md](/integrations/openclaw/)。

---

## Cursor

每个智能体变成一个 `.mdc` 规则文件。规则是项目级的——请从你的
项目根目录运行安装器。

```bash
cd /your/project && /path/to/agency-agents/scripts/install.sh --tool cursor
```

详见 [cursor/README.md](/integrations/cursor/)。

---

## Aider

`CONVENTIONS.md` 是名册（roster）索引——每个智能体的名字、用途、
所属部门，以及指向其完整说明的路径。Aider 会在整个会话期间把约定
文件保持在上下文里，所以这个文件只列出各智能体，而不是把上百万
token 的正文全部内联进来。

```bash
cd /your/project && /path/to/agency-agents/scripts/install.sh --tool aider
```

详见 [aider/README.md](/integrations/aider/)。

---

## Windsurf

所有智能体被合并成单个 `.windsurfrules` 文件，放到你的
项目根目录。

```bash
cd /your/project && /path/to/agency-agents/scripts/install.sh --tool windsurf
```

详见 [windsurf/README.md](/integrations/windsurf/)。

---

## Kimi Code

每个智能体被转换为 Kimi Code CLI 智能体规格（YAML 格式，
系统提示词为独立文件）。智能体安装到 `~/.config/kimi/agents/`。

由于 Kimi 智能体文件由源 Markdown 生成，在全新 clone 上安装前，
请先运行 `./scripts/convert.sh --tool kimi`。

```bash
./scripts/convert.sh --tool kimi
./scripts/install.sh --tool kimi
```

### 用法

安装后，使用 `--agent-file` 标志来使用某个智能体：

```bash
kimi --agent-file ~/.config/kimi/agents/frontend-developer/agent.yaml
```

或在特定项目中：

```bash
cd /your/project
kimi --agent-file ~/.config/kimi/agents/frontend-developer/agent.yaml \
     --work-dir /your/project
```

详见 [kimi/README.md](/integrations/kimi/)。

---

## Qwen Code

每个智能体变成 `.qwen/agents/` 下的一个项目级 `.md` 子智能体文件。

在全新 clone 上，请先生成 Qwen 文件：

```bash
./scripts/convert.sh --tool qwen
```

然后从你的项目根目录安装：

```bash
cd /your/project && /path/to/agency-agents/scripts/install.sh --tool qwen
```

详见 [qwen/README.md](/integrations/qwen/)。

---

## Codex

每个智能体被转换为独立的 Codex 自定义智能体 TOML 文件，
安装到 `~/.codex/agents/`。

由于 Codex 使用生成的 TOML 文件而不是直接用源 Markdown，
在全新 clone 上安装前请先运行转换器：

```bash
./scripts/convert.sh --tool codex
./scripts/install.sh --tool codex
```

详见 [codex/README.md](/integrations/codex/)。