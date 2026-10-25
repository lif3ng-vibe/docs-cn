---
title: "把 Claude 订阅经由 Aperture 路由"
description: "在 [passthrough 模式][docs-use-passthrough-mode]下，Aperture 把每个客户端自己的凭证转发给上游提供商，而不是注入共享 API key。本指南使用 passthrough 来路由 Claude Pro 或 Max 订阅。"
---

最后验证于 Sep 28, 2026

在 [passthrough 模式][docs-use-passthrough-mode]下，Aperture 把每个客户端自己的凭证转发给上游提供商，而不是注入共享 API key。本指南使用 passthrough 来路由 Claude Pro 或 Max 订阅：Claude Code 登录订阅并持有 OAuth 令牌，Aperture 把该令牌原样转发给 Anthropic。每个用户都以自己的身份向 Anthropic 认证，而你能得到 Aperture 的身份识别、日志和策略执行，无需重新签发密钥。

本指南介绍端到端设置：Aperture 侧的 Anthropic 提供商和客户端侧的 Claude Code。passthrough 的完整机制与 `auth_mode` 参考参阅[设置 passthrough 模式][docs-use-passthrough-mode]。

\[Missing snippet: aperture\_any\_provider.mdx]

## 前提条件

开始之前，你需要：

* 一台你的设备可以访问的 [Aperture 网关][docs-get-started]，以及编辑其配置的管理员权限。
* 一条授权，允许将使用这些模型的 Tailscale 身份访问 Anthropic 模型。Aperture 只列出并路由已获授权的模型。
* 每个用户一个 Claude Pro 或 Max 订阅，并已安装 [Claude Code][xt-claude-code] 且能登录该订阅。

## 配置 Anthropic 提供商

定义一个 `auth_mode` 设为 `passthrough` 的 Anthropic 提供商，让 Aperture 转发客户端的 OAuth 令牌。

1. \[Missing snippet: aperture\_admin\_nav.mdx]

2. 在 `providers` 映射下添加一个提供商，把占位符替换为你的值：

   ```json
   "providers": {
     "anthropic-passthrough": {
       "baseurl": "https://api.anthropic.com",
       "authorization": "x-api-key",
       "auth_mode": "passthrough",
       "models": ["claude-opus-5-5"],
       "compatibility": {
         "anthropic_messages": true
       }
     }
   }
   ```

   * Anthropic 的 `authorization` 为 `x-api-key`。Aperture 会转发客户端发送的任何凭证，包括 `Bearer` OAuth 令牌。
   * 未配置 `apikey`，因此该提供商是纯 passthrough 型：只依靠每个客户端的订阅令牌工作。如果你还想让这些模型在 chat UI 中可用（chat UI 发送的服务端请求不携带客户端凭证），请添加回退用的 `apikey`。

   \[Missing snippet: aperture\_model\_wildcards\_note.mdx]

3. 保存配置。Aperture 会热加载配置，无需重启。保存成功即说明该块通过了校验。

## 在 Claude Code 中登录订阅

把 Claude Code 指向 Aperture 并选择已配置的模型。让 Claude Code 发送其订阅 OAuth 令牌，不要覆盖它的凭证。

\[Missing snippet: aperture\_tls\_warning.mdx]

1. 在 Claude Code 中登录你的 Claude 订阅：运行 `claude` 后执行 `/login`，或使用 IDE 登录流程。
2. 创建或编辑 `~/.claude/settings.json`，设置 Aperture URL 和模型：

   ```json
   {
     "model": "claude-opus-5-5",
     "env": {
       "ANTHROPIC_BASE_URL": "http://<aperture-hostname>"
     }
   }
   ```

   不要设置 `ANTHROPIC_API_KEY` 或 `ANTHROPIC_AUTH_TOKEN`。设置了其中任何一个，Claude Code 都会发送该值而不是自己的 OAuth 令牌，从而压制了你想透传的凭证。

> **提示：**
>
> 也可以不用设置文件，而是用环境变量设置 base URL 和模型：
>
> ```shell
> export ANTHROPIC_BASE_URL="http://<aperture-hostname>"
> export ANTHROPIC_MODEL="claude-opus-5-5"
> # Do not set ANTHROPIC_API_KEY so the OAuth token passes through.
> ```

## 验证连接

1. 在 Claude Code 中发送一条测试消息。
2. 在你的 Aperture 网关上打开 Chat，在侧边栏选择 **Sessions**。确认测试请求已出现。如果你的账户没有门户访问权，请让管理员检查 **Security** > **Logs**。

如果请求失败并报 `401` 错误，请确认 Claude Code 已登录订阅，且客户端上没有设置任何 API key 或认证令牌。如果请求根本没到达 Aperture，请确认 `ANTHROPIC_BASE_URL` 指向 Aperture 网关。更多检查项参阅 [passthrough 故障排查步骤][docs-use-passthrough-mode]。

## 哪些流量经由 Aperture 路由

只有推理请求（`/v1/messages`）经由 Aperture 路由。Claude Code 把 OAuth 登录和令牌刷新请求直接发送到 `api.anthropic.com`，绕过 `ANTHROPIC_BASE_URL`。Aperture 从不处理认证或令牌刷新，只在把推理请求转发给 Anthropic 之前按 Tailscale 身份进行认证。

## 后续步骤

配置并检查提供商之后，完成适用的任务：

* [授予模型访问权][docs-grant-model-access]，控制哪些用户可以访问 passthrough 提供商。
* [设置 LLM 客户端][docs-use-your-tools]，接入其他能发送自己的 Anthropic 凭证的客户端。
* [设置 chat 界面][docs-set-up-chat-ui]——仅在你添加了回退 `apikey` 时才需要。纯 passthrough 型提供商无法服务来自 Aperture chat 的请求。

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-set-up-chat-ui]: /docs/aperture/how-to/set-up-chat-ui

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-your-tools]: /docs/aperture/use-your-tools

[xt-claude-code]: https://docs.anthropic.com/en/docs/claude-code
