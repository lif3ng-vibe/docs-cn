---
title: "设置 passthrough 模式"
description: "把提供商配置为 passthrough 模式，让 Aperture 把每个客户端自己的凭证转发给上游提供商，而不是注入一个共享 API key。客户端继续使用现有的 API key 或订阅 OAuth 令牌（如 Claude Pro 或 Max 账户），让你无需重新签发密钥就能把现有工具经由 Aperture 路由。"
---

最后验证于 Sep 28, 2026

把提供商配置为 passthrough 模式，让 Aperture 把每个客户端自己的凭证转发给上游提供商，而不是注入一个共享 API key。客户端继续使用现有的 API key 或订阅 OAuth 令牌（如 Claude Pro 或 Max 账户），让你无需重新签发密钥就能把现有工具经由 Aperture 路由。

\[Missing snippet: aperture\_any\_provider.mdx]

特定订阅账户的分步设置参阅：

* [把 Claude 订阅经由 Aperture 路由][docs-claude-subscriptions]，在 Claude Code 中使用 Claude Pro 或 Max 账户。
* [把 ChatGPT 订阅经由 Aperture 路由][docs-codex-subscriptions]，在 Codex CLI 中使用 ChatGPT Plus、Pro 或 Team 账户。

## 前提条件

开始之前，你需要：

* 一台你的设备可以访问的 [Aperture 网关][docs-get-started]，以及编辑其配置的管理员权限。
* 一条允许你的 Tailscale 身份使用该提供商模型的授权。Aperture 只列出并路由你已获授权的模型。
* 上游提供商的账户。例如 [Anthropic][xt-anthropic-api-keys]，以及一个有效凭证——可以是你自己的，也可以由每个客户端提供。

## passthrough 模式的工作原理

提供商的 `auth_mode` 字段只控制 Aperture 如何对发往上游提供商的出站请求进行认证，不影响路由或模型选择。它取以下四个值之一：

* `"passthrough"`：把客户端自己的 `Authorization` 或 `x-api-key` 头原样转发给上游，仅在客户端未发送任何凭证时才回退到配置的 `apikey`。
* 留空或省略（默认），或 `"override"`：在每个请求中注入提供商配置的 `apikey`。`"override"` 是显式写法，要求必须提供密钥。
* `"none"`：剥掉所有上游凭证，用于不需要凭证的提供商。

没有配置 `apikey` 的 passthrough 提供商是纯 passthrough 型，只依靠客户端提供的凭证工作。Aperture 的 chat UI 会隐藏纯 passthrough 型提供商的模型，因为 chat 请求由服务端发起，不携带客户端凭证。如果希望模型出现在 chat UI 中，请配置一个回退用的 `apikey`。

## 配置提供商

在你的 Aperture 配置中定义该提供商，把 `auth_mode` 设为 `passthrough`。

1. \[Missing snippet: aperture\_admin\_nav.mdx]

2. 在 `providers` 映射下添加一个提供商，把占位符替换为你的值。本示例服务一个 Anthropic 兼容的提供商：

   ```json
   "providers": {
     "anthropic-passthrough": {
       "baseurl": "https://api.anthropic.com",
       "authorization": "x-api-key",
       "auth_mode": "passthrough",
       "apikey": "<fallback-api-key>",
       "models": ["claude-opus-5-5"],
       "compatibility": {
         "anthropic_messages": true
       }
     }
   }
   ```

   * 把 `authorization` 设为上游期望的头。Anthropic 用 `x-api-key`，OpenAI 风格的提供商用 `bearer`。完整列表参阅[授权类型参考][docs-provider-compatibility]。
   * 保留 `apikey`，为没有携带凭证的请求提供回退凭证，并让该提供商的模型出现在 chat UI 中。删掉它则该提供商变成纯 passthrough 型。请在 Configuration 编辑器中设置这个密钥，因为一旦选择 passthrough 模式，提供商表单会隐藏 API Key 字段。

   \[Missing snippet: aperture\_model\_wildcards\_note.mdx]

3. 保存配置。Aperture 会热加载配置，无需重启。无效的提供商定义（如缺少 `baseurl` 或无法识别的 `auth_mode`）会被 Aperture 拒绝，因此保存成功即说明该块通过了校验。`models` 列表为空的提供商可以保存，但不提供任何模型。

## 验证提供商

从一台已连接 tailnet 的机器上查询 models 端点：

```shell
curl -s http://<aperture-hostname>/v1/models
```

输出中会包含一个条目，其 `id` 是裸模型名（例如 `claude-opus-5-5`），提供商显示在 `metadata.provider.id` 中。要在请求中路由到这个特定提供商，请在模型名前加上提供商 ID：`anthropic-passthrough/claude-opus-5-5`。

纯 passthrough 型提供商的模型仍会出现在这里，即使它们在 chat UI 中被隐藏。如果某个模型缺失，最常见的原因是你的 Tailscale 身份没有对应的授权，而不是提供商注册失败。

## 以客户端身份发送请求

把客户端的 base URL 指向 Aperture，让它发送自己的凭证。示例使用 Claude Code，但任何允许覆盖 base URL 的 SDK 都可以用同样的方式工作。客户端设置参阅[设置 LLM 客户端][docs-use-your-tools]。

* 如果客户端用 OAuth 订阅令牌认证（例如登录了 Claude 订阅的 Claude Code），只需设置 base URL。设置 `ANTHROPIC_API_KEY` 会让客户端发送该密钥而不是它的 OAuth 令牌。

  ```shell
  export ANTHROPIC_BASE_URL="http://<aperture-hostname>"
  # Do not set ANTHROPIC_API_KEY so the OAuth token passes through.
  ```

* 如果客户端使用个人 API key，则同时设置 base URL 和密钥。

  ```shell
  export ANTHROPIC_BASE_URL="http://<aperture-hostname>"
  export ANTHROPIC_API_KEY="<client-api-key>"
  ```

发送请求时，使用带提供商前缀的模型名来路由到该提供商。用裸 API 调用时，请求如下：

```shell
curl -s http://<aperture-hostname>/v1/messages \
  -H "x-api-key: <client-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "anthropic-passthrough/claude-opus-5-5",
    "max_tokens": 64,
    "messages": [{"role": "user", "content": "Say hello."}]
  }'
```

Aperture 原样转发 `x-api-key` 头，从模型名中去掉提供商前缀，并返回提供商的响应。正常完成即说明 passthrough 生效。要确认使用的是客户端凭证而不是回退密钥，可以故意带一个无效的 `x-api-key` 发送请求。上游会拒绝它，这就证明 Aperture 转发的是客户端密钥，而不是替换成了回退密钥。

## 故障排查

如果请求行为不符合预期，请逐项完成下面的检查。

### 模型没有出现在 chat UI 中

对纯 passthrough 型提供商来说这是正常现象。在 **Models** 标签页上，该提供商的测试按钮被禁用，工具提示说明未配置 API key。要让模型在 chat UI 中可用，请添加回退用的 `apikey` 并再次保存配置。自带凭证的外部客户端仍然可以访问该模型。可通过 models 端点确认。

### 模型没有出现在 models 端点中

models 端点只列出你的 Tailscale 身份已获授权的模型。如果新添加提供商的模型缺失，请确认有授权覆盖该模型，然后再次查询。同时确认该提供商没有处于 `disabled` 状态。

### 请求失败并报 401 或认证错误

先从客户端入手。确认它发送了 `Authorization` 或 `x-api-key` 头，并且该凭证直接对提供商有效——因为 passthrough 会原样转发客户端发送的内容。然后，确认提供商的 `authorization` 字段与上游期望的头风格一致。如果客户端没有发送凭证，请确认已配置回退用的 `apikey`。

### 请求到达了错误的提供商或找不到模型

使用带提供商前缀的模型名 `anthropic-passthrough/claude-opus-5-5` 来确定性地指定该提供商。不带前缀时，Aperture 会在所有服务该裸模型名的提供商之间做选择。确认提供商的 `compatibility` 块启用了你的客户端使用的 API 协议，例如 `/v1/messages` 对应 `anthropic_messages`。

## 安全注意事项

在 passthrough 模式下，每个客户端用自己的凭证向上游认证，因此提供商看到的是按用户的身份，Aperture 也不会替每个客户端持有共享密钥。这缩小了密钥泄露的影响范围，并让用户的 OAuth 令牌和个人密钥保持在用户自己的控制之下。转发任何内容之前，Aperture 仍会通过 Tailscale 身份认证每个客户端。

请注意以下限制：

* 已配置的回退 `apikey` 是存储在配置中的共享密钥。任何未发送凭证的客户端都会使用它，因此请相应地收窄其权限范围，或者干脆省略它。
* Aperture 会把客户端凭证转发到你配置的 `baseurl`。请把它设为真正的提供商端点，不要设为其他任何地址。
* 只有推理流量经由 Aperture 路由。客户端 SDK 直接发给提供商的请求（如 OAuth 登录、令牌刷新和账单端点）不经过 Aperture。
* 当你需要单一可审计、集中轮换的凭证而不是按用户密钥时，请使用 `auth_mode: "override"` 配合托管密钥，而不是 passthrough。

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-claude-subscriptions]: /docs/aperture/how-to/use-passthrough-mode/claude-subscriptions

[docs-codex-subscriptions]: /docs/aperture/how-to/use-passthrough-mode/codex-subscriptions

[docs-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#认证类型

[docs-use-your-tools]: /docs/aperture/use-your-tools

[xt-anthropic-api-keys]: https://console.anthropic.com/settings/keys
