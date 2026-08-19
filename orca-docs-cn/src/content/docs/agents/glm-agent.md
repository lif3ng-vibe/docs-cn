---
title: "在 Orca 中使用 GLM-5.2"
description: "配置 Claude Code 及其他 CLI 智能体外壳，在 Orca worktree 中运行 GLM-5.2。"
source: "https://www.onorca.dev/docs/agents/glm-agent"
---

# 在 Orca 中使用 GLM-5.2

配置 Claude Code 及其他 CLI 智能体外壳，在 Orca worktree 中运行 GLM-5.2。

GLM-5.2 通过你既有的智能体外壳（agent harness）在 Orca 中运行。在 Claude Code、OpenCode、Cline、Kilo Code、Roo Code、Droid、OpenClaw 或其他 CLI 智能体中配置好 GLM-5.2，然后从 Orca 的选择器启动该智能体即可。

Orca 提供隔离的 worktree、终端窗格、浏览器标签页、审查流程和会话管理；[Z.ai CodePlan 订阅](https://z.ai/subscribe)与智能体配置提供模型访问。

> **前置条件**：在智能体外壳中配置 GLM-5.2 之前，你需要一份有效的 [Z.ai CodePlan 订阅](https://z.ai/subscribe)（含 GLM Coding Plan 权限）。OpenAI 兼容的外壳还需要 Z.ai API 密钥。Orca 不附带也不转售 GLM 访问。

> **来源**：这些设置遵循 [Z.ai 最新模型指南](https://docs.z.ai/devpack/latest-model)。当前提供方侧的细节请以该页面为准。

## Claude Code

Claude Code 从 `~/.claude/settings.json` 读取模型覆写。要在 Orca 中使用 GLM-5.2：

1. 打开 `~/.claude/settings.json`。
2. 添加或更新下面的 `env` 块。
3. 在 Orca 中重启 Claude Code 会话，让新环境变量生效。
4. 在 Claude Code 内运行 `/status` 确认当前模型。

```
{
  "env": {
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "1000000",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5.2[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.2[1m]"
  }
}
```

想用 GLM-5.2 的 1M 上下文版本时，加上 `[1m]` 后缀，并让 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 保持为 `1000000`，使 Claude Code 的压缩窗口与该上下文大小匹配。如果 Claude Code 提示 `[1m]` 模型不存在，请更新 Claude Code 后重试。

对于编码任务，Z.ai 建议用 `/effort` 把 Claude Code 的投入档位设为 `max`。Claude Code 较低的投入档位对应 GLM-5.2 的 high 档，而 `xhigh`、`max` 和 `ultracode` 对应 GLM-5.2 的 max 档。

## OpenCode、Cline、Kilo Code、Roo Code 与 Droid

对于暴露 OpenAI 兼容提供方的外壳：

1. 在 Orca 内外打开外壳设置。
2. 选择 OpenAI 兼容提供方选项；若外壳内置 Z.ai 提供方选项，则选它。
3. 将 base URL 设为 `https://api.z.ai/api/coding/paas/v4`。
4. 填入你的 Z.ai API 密钥。
5. 将自定义模型名设为 `glm-5.2`。
6. 若外壳暴露上下文窗口大小字段，设为 `1000000`。
7. 除非外壳明确在文档中说明该提供方路径支持图片，否则关闭图片支持。

保存后，从 Orca 的智能体选择器启动该外壳。Orca 会在选中的 worktree 中运行同一份配置好的 CLI。

## OpenClaw

如果 OpenClaw 无法从其提供方模型列表中直接选择 GLM-5.2，可在 `~/.openclaw/openclaw.json` 中手动添加该模型。

把 `glm-5.2` 加入 `models.providers.zai.models`：

```
{
  "id": "glm-5.2",
  "name": "GLM-5.2",
  "reasoning": true,
  "input": ["text"],
  "cost": {
    "input": 0,
    "output": 0,
    "cacheRead": 0,
    "cacheWrite": 0
  },
  "contextWindow": 1000000,
  "maxTokens": 131072
}
```

然后设置默认主模型：

```
{
  "model": {
    "primary": "zai/glm-5.2",
    "fallbacks": ["zai/glm-4.7"]
  }
}
```

再在 `agents.defaults.models` 下添加该模型：

```
{
  "models": {
    "zai/glm-5.2": { "alias": "GLM" },
    "zai/glm-4.7": {}
  }
}
```

重启 OpenClaw 网关：

```
openclaw gateway restart
```

然后从 Orca 启动 OpenClaw，或在 Orca 终端中运行 `openclaw tui`，确认 GLM-5.2 已生效。

关键规则很简单：在外壳存放提供方/模型设置的地方配置好 GLM-5.2，剩下的交给 Orca 在正确的 worktree 中启动它。
