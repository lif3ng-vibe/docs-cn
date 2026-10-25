---
title: "在 Aperture 中使用 Claude Code"
description: "配置 [Claude Code][xt-claude-code]，让请求经由 [Aperture by Tailscale][docs-aperture] 发送，为你的组织带来集中的 API key 管理、用量跟踪和会话日志。"
---

最后验证于 Sep 28, 2026

配置 [Claude Code][xt-claude-code]，让请求经由 [Aperture by Tailscale][docs-aperture] 发送，为你的组织带来集中的 API key 管理、用量跟踪和会话日志。

> **注意：**
>
> [Aperture CLI][docs-aperture-cli] 可以自动为你建立这一连接。它会设置 Claude Code 所需的环境变量并启动 Claude Code，因此你可以跳过下面的手动步骤。

## 前提条件

开始之前，你需要：

* 一台 Aperture 网关，至少配置了一个 AI 提供商（如 Anthropic），并且你的设备可以访问。尚未设置时参阅[开始使用 Aperture][docs-get-started]。
* 你的设备可以访问的 Aperture 网关 URL。使用 `http://`，不要用 `https://`。
* 设备上已安装 [Claude Code][xt-claude-code]。

\[Missing snippet: aperture\_tls\_warning.mdx]

\[Missing snippet: aperture\_any\_provider.mdx]

## 配置 Claude Code

要配置 Claude Code 使用 Aperture，请创建或编辑全局 Claude Code 设置文件（`~/.claude/settings.json`），并把 `ANTHROPIC_BASE_URL` 设为你的 Aperture URL：

```json
{
  "apiKeyHelper": "echo '-'",
  "env": {
    "ANTHROPIC_BASE_URL": "http://<aperture-hostname>"
  }
}
```

`apiKeyHelper` 设置返回一个占位值，因为 Aperture 会自动注入凭证。你无需在客户端配置 API key。

> **注意：**
>
> 要把 Claude Pro 或 Max 这类 Claude 订阅账户的流量经由 Aperture 转发，上游 Anthropic 提供商必须使用 passthrough 模式，这样 Aperture 才会把 Claude Code 自己的 OAuth 令牌转发给 Anthropic。此时只设置 `ANTHROPIC_BASE_URL`，不要设置 `ANTHROPIC_API_KEY` 或 `ANTHROPIC_AUTH_TOKEN`。设置了其中任何一个，Claude Code 都会发送该值而不是自己的 OAuth 令牌，从而压制了你想透传的凭证。更多信息参阅[设置 passthrough 模式][docs-use-passthrough-mode]。

> **提示：**
>
> 也可以不用设置文件，而是用环境变量配置 Claude Code。设置如下环境变量：
>
> ```shell
> export ANTHROPIC_BASE_URL="http://<aperture-hostname>"
> ```

> **警告：**
>
> Claude Code v1.x 需要额外的配置，因为早期版本没有 `apiKeyHelper` 设置。你必须提供一个占位认证令牌，并显式指定模型。
>
> ```json
> {
>   "model": "claude-sonnet-5-5",
>   "env": {
>     "ANTHROPIC_AUTH_TOKEN": "bearer-managed",
>     "ANTHROPIC_BASE_URL": "http://<aperture-hostname>"
>   }
> }
> ```

### Claude Code 搭配 Amazon Bedrock

如果你的 Aperture 网关经由 Amazon Bedrock 路由，请使用下面的 `settings.json` 配置，而不是上文展示的默认 Anthropic 配置：

```json
{
  "env": {
    "ANTHROPIC_MODEL": "us.anthropic.claude-sonnet-4-6",
    "ANTHROPIC_BEDROCK_BASE_URL": "http://<aperture-hostname>/bedrock",
    "CLAUDE_CODE_USE_BEDROCK": "1",
    "CLAUDE_CODE_SKIP_BEDROCK_AUTH": "1"
  }
}
```

如果你在 VS Code 中搭配 Bedrock 使用 Claude Code，还要在 VS Code 用户设置 JSON 中添加 `"claudeCode.disableLoginPrompt": true`（打开 **Command Palette** 并选择 **Preferences: Open User Settings (JSON)**）。

### Claude Code 搭配 Gemini Enterprise Agent Platform

如果你的 Aperture 网关经由 Gemini Enterprise Agent Platform 路由，请使用下面的 `settings.json` 配置，而不是默认的 Anthropic 配置。把 `<project-id>` 替换为你的 Google Cloud 项目 ID。Claude Code 仍按该平台早先的名称 Vertex AI 来命名这些环境变量。

```json
{
  "env": {
    "ANTHROPIC_MODEL": "claude-sonnet-4-6",
    "CLOUD_ML_REGION": "global",
    "ANTHROPIC_VERTEX_PROJECT_ID": "<project-id>",
    "CLAUDE_CODE_USE_VERTEX": "1",
    "CLAUDE_CODE_SKIP_VERTEX_AUTH": "1",
    "ANTHROPIC_VERTEX_BASE_URL": "http://<aperture-hostname>/v1"
  }
}
```

如果你在 VS Code 中搭配 Gemini Enterprise Agent Platform 使用 Claude Code，还要在 VS Code 用户设置 JSON 中添加 `"claudeCode.disableLoginPrompt": true`（打开 **Command Palette** 并选择 **Preferences: Open User Settings (JSON)**）。

## 验证连接

要验证 Claude Code 是否经由 Aperture 路由请求：

1. 在 Claude Code 中发送一条测试消息。
2. 在你的 Aperture 网关上打开 Chat，在侧边栏选择 **Sessions**。确认测试请求已出现。如果你的账户没有门户访问权，请让管理员检查 **Security** > **Logs**。

如果请求没有出现，参阅 [Aperture 故障排查主题][docs-aperture-troubleshooting]。

\[Missing snippet: aperture\_connect\_next\_steps.mdx]

[docs-aperture-cli]: /docs/aperture/cli

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-aperture]: /docs/aperture

[docs-get-started]: /docs/aperture/get-started

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[xt-claude-code]: https://docs.anthropic.com/en/docs/claude-code
