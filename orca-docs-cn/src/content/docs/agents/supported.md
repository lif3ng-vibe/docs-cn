---
title: "受支持的智能体"
description: "Orca 开箱即用的全部智能体。"
source: "https://www.onorca.dev/docs/agents/supported"
---

Orca 可以配合**任意 CLI 智能体**使用——智能体下拉框本质上只是在终端里启动一个进程。以下智能体已预先配置在内置智能体选择器中，一键即可启动/完成设置；支持更深度集成（钩子、状态、用量追踪、账号切换）的会在表中注明。

## 权限默认值

对新启动的会话，Orca 会为每个受支持的 CLI 预填跳过权限确认的标志——Claude 用 `--dangerously-skip-permissions`，Codex 用 `--dangerously-bypass-approvals-and-sandbox`，Gemini / Cursor / Crush / Kimi / Rovo Dev / Hermes / GitHub Copilot / Command Code 用 `--yolo`，其他暴露了等效标志的智能体同样处理。理由是 worktree（工作树）是一次性的：在自己的检出中运行的智能体可以放开手脚实验，不必让你逐条确认每个 shell 命令；合并前你仍可以 cherry-pick 或丢弃 diff。

想把所有未自定义的智能体在 **Yolo**（放开权限）与 **Manual**（手动确认）两种启动方式之间统一切换时，使用 **Settings → Agents → Agent Permissions**（设置 → 智能体 → 智能体权限）。如果你已经覆写了某个智能体的启动参数或环境变量，Orca 不会碰它，全局切换也就不会抹掉你的自定义命令。

想只为某一个智能体恢复权限确认，在 Settings 中编辑该智能体的默认参数或环境变量即可。Orca 会把非空的自定义值视为显式覆写，并让该智能体退出此后的权限模式迁移。

| 智能体 | 说明 | 文档 |
| --- | --- | --- |
| Claude Code | 深度集成：用量、热切换、钩子 | [Anthropic](https://docs.anthropic.com/claude/docs/claude-code) |
| Claude Agent Teams | 默认禁用——在 Settings → Agents 下启用后，可通过 `orca claude-teams` 启动，并为每位队友分配原生窗格 | [Anthropic](https://code.claude.com/docs/agent-teams) |
| Codex | 深度集成：用量、热切换 | [OpenAI](https://github.com/openai/codex) |
| Grok | 自动配置 | [xAI](https://x.ai/cli) |
| GitHub Copilot CLI | 自动配置 | [GitHub](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) |
| OpenCode | 自动配置、状态 | [OpenCode](https://opencode.ai/docs/cli/) |
| Pi | 自动配置、钩子、状态 | [Pi](https://pi.dev) |
| OMP | 自动配置、钩子、状态 | [OMP](https://omp.sh) |
| Prime Agent | 自动配置、钩子、状态、会话历史 | [Prime Intellect](https://github.com/PrimeIntellect-ai/prime-agent) |
| Gemini | 自动配置 | [Google](https://github.com/google-gemini/gemini-cli) |
| Antigravity | 自动配置、钩子、状态 | [Google](https://antigravity.google/docs/cli-overview) |
| Ante | 自动配置、状态 | [Ante](https://github.com/AntigmaLabs/ante-preview) |
| Aider | 自动配置 | [Aider](https://aider.chat/docs/) |
| Goose | 自动配置 | [Block](https://block.github.io/goose/docs/quickstart/) |
| Amp | 自动配置 | [Amp](https://ampcode.com/manual#install) |
| Kilocode | 自动配置 | [Kilo](https://kilo.ai/docs/cli) |
| Kiro | 自动配置 | [Kiro](https://kiro.dev/docs/cli/) |
| Charm Crush | 自动配置 | [Charm](https://github.com/charmbracelet/crush) |
| Auggie | 自动配置 | [Augment](https://docs.augmentcode.com/cli/overview) |
| Autohand | 自动配置 | [Autohand](https://github.com/autohandai/code-cli) |
| Cline | 自动配置 | [Cline](https://docs.cline.bot/cline-cli/overview) |
