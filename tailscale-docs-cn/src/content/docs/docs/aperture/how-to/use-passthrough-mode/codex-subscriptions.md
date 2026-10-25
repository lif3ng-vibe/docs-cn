---
title: "把 ChatGPT 订阅经由 Aperture 路由"
description: "在 [passthrough 模式][docs-use-passthrough-mode]下，Aperture 把每个客户端自己的凭证转发给上游提供商，而不是注入共享 API key。本指南使用 passthrough 来路由 ChatGPT 订阅。"
---

最后验证于 Sep 28, 2026

在 [passthrough 模式][docs-use-passthrough-mode]下，Aperture 把每个客户端自己的凭证转发给上游提供商，而不是注入共享 API key。本指南使用 passthrough 来路由 ChatGPT 订阅：Codex CLI 登录订阅并持有 OAuth 令牌，Aperture 把该令牌原样转发给 ChatGPT 后端。

ChatGPT 订阅和 OpenAI 平台 API key 是两套独立系统，使用不同的端点和凭证：

| 端点 | 凭证 | 计费 |
| ---- | ---- | ---- |
| `chatgpt.com/backend-api/codex` | ChatGPT OAuth 令牌 | ChatGPT 订阅（Plus、Pro、Team、Enterprise） |
| `api.openai.com/v1` | 带 `api.responses.write` scope 的 API key | 平台 API 额度 |

ChatGPT 后端不接受 API key，平台 API 也不接受 ChatGPT OAuth 令牌。本指南介绍订阅（OAuth）路径。要路由平台 API key，参阅[在 Aperture 中使用 Codex][docs-use-codex]。如果两类用户都有，请为每类分别配置一个提供商。

\[Missing snippet: aperture\_any\_provider.mdx]

## 前提条件

开始之前，你需要：

* 一台你的设备可以访问的 [Aperture 网关][docs-get-started]，以及编辑其配置的管理员权限。
* 一条授权，允许将使用这些模型的 Tailscale 身份访问 Codex 模型。Aperture 只列出并路由已获授权的模型。
* 每个用户一个 ChatGPT 订阅，并已安装 [Codex CLI][xt-codex] 且能登录该订阅。

## 配置 Codex 提供商

定义一个 `baseurl` 指向 ChatGPT 后端、`auth_mode` 设为 `passthrough` 的提供商。

1. \[Missing snippet: aperture\_admin\_nav.mdx]

2. 在 `providers` 映射下添加一个提供商，把占位符替换为你的值：

   ```json
   "providers": {
     "codex-oauth": {
       "baseurl": "https://chatgpt.com/backend-api/codex",
       "authorization": "bearer",
       "auth_mode": "passthrough",
       "models": ["gpt-6.1-sol"],
       "compatibility": {
         "openai_chat": true,
         "openai_responses": true
       }
     }
   }
   ```

   * `authorization` 为 `bearer`：ChatGPT 后端期望 OAuth 令牌放在 `Authorization` 头中。
   * `baseurl` 是 ChatGPT 后端，而不是 `api.openai.com`。这两个端点接受的凭证不同。
   * 未配置 `apikey`，因此该提供商是纯 passthrough 型，只依靠每个客户端的订阅令牌工作。

   \[Missing snippet: aperture\_model\_wildcards\_note.mdx]

3. 保存配置。Aperture 会热加载配置，无需重启。保存成功即说明该块通过了校验。

## 配置 Codex CLI

用自定义模型提供商把 Codex 指向 Aperture，并让它发送自己的订阅 OAuth 令牌。

\[Missing snippet: aperture\_tls\_warning.mdx]

1. 在 Codex 中登录你的 ChatGPT 订阅。
2. 创建或编辑 `~/.codex/config.toml`：

   ```toml
   model = "gpt-6.1-sol"
   model_provider = "aperture"

   [model_providers.aperture]
   name = "Aperture"
   base_url = "http://<aperture-hostname>/codex"
   wire_api = "responses"
   requires_openai_auth = true
   ```

   * `requires_openai_auth = true` 告诉 Codex 发送它的 ChatGPT OAuth 令牌以进行订阅访问。只有走平台 API key 路径时才省略它并提供 `env_key`。
   * Codex 会在 `base_url` 后追加 `/responses`，因此请求以 `/codex/responses` 的形式到达 Aperture。Aperture 在代理到 `chatgpt.com/backend-api/codex/responses` 之前会去掉 `/codex` 前缀。

> **警告：**
>
> `requires_openai_auth = true` 配上指向平台 API 的 `base_url` 是行不通的。ChatGPT OAuth 令牌缺少平台 API 所要求的 `api.responses.write` scope。OAuth 令牌请走订阅端点，API key 请走平台端点。

## 验证连接

1. 在 Codex 中发送一条测试消息。
2. 在你的 Aperture 网关上打开 Chat，在侧边栏选择 **Sessions**。确认测试请求已出现。如果你的账户没有门户访问权，请让管理员检查 **Security** > **Logs**。

如果请求失败并返回 401，请确认 Codex 已登录订阅，且已设置 `requires_openai_auth = true`。如果请求根本没到达 Aperture，请确认 `base_url` 包含 `/codex` 路径段。更多检查项参阅 [passthrough 故障排查步骤][docs-use-passthrough-mode]。

## 哪些流量经由 Aperture 路由

只有推理流量（`/responses`）经由 Aperture 路由。Codex 把 OAuth 登录和令牌刷新直接发送给提供商，绕过 Aperture 的 `base_url`。Aperture 从不接触订阅的登录或刷新，只看到它按 Tailscale 身份认证并转发的推理请求。

## 后续步骤

配置并检查提供商之后，完成适用的任务：

* [授予模型访问权][docs-grant-model-access]，控制哪些用户可以访问 passthrough 提供商。
* [设置 LLM 客户端][docs-use-your-tools]，接入其他能发送自己的 ChatGPT 凭证的客户端。

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-use-codex]: /docs/aperture/how-to/use-codex

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-your-tools]: /docs/aperture/use-your-tools

[xt-codex]: https://github.com/openai/codex
