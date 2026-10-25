---
title: "在 Aperture 中使用 OpenCode"
description: "配置 [OpenCode][xt-opencode]，让请求经由 [Aperture by Tailscale][docs-aperture] 发送，为你的组织带来集中的 API key 管理、用量跟踪和会话日志。"
---

最后验证于 Sep 28, 2026

配置 [OpenCode][xt-opencode]，让请求经由 [Aperture by Tailscale][docs-aperture] 发送，为你的组织带来集中的 API key 管理、用量跟踪和会话日志。

> **注意：**
>
> [Aperture CLI][docs-aperture-cli] 可以自动为你建立这一连接。它会写入 OpenCode 配置并启动 OpenCode，因此你可以跳过下面的手动步骤。

## 前提条件

开始之前，你需要：

* 一台 Aperture 网关，至少配置了一个 AI 提供商（如 Anthropic 或 OpenAI），并且你的设备可以访问。尚未设置时参阅[开始使用 Aperture][docs-get-started]。
* 你的设备可以访问的 Aperture 网关 URL。使用 `http://`，不要用 `https://`。
* 设备上已安装 [OpenCode][xt-opencode]。

\[Missing snippet: aperture\_tls\_warning.mdx]

\[Missing snippet: aperture\_any\_provider.mdx]

## 配置 OpenCode

OpenCode 需要两处配置更改：把 base URL 指向 Aperture，并为每个提供商提供一个占位 API key。

### 设置 base URL

在 OpenCode 配置文件中为每个提供商设置 base URL，把 OpenCode 指向你的 Aperture 网关。

1. 打开或创建 OpenCode 配置文件。该文件通常名为 `opencode.json`，位于你的主目录或运行 OpenCode 的目录中。详情参阅 [OpenCode 配置文档][xt-opencode-config]。

2. 添加以下配置，把 Aperture 设为你的提供商的 base URL：

   ```json
   {
     "$schema": "https://opencode.ai/config.json",
     "provider": {
       "anthropic": {
         "options": {
           "baseURL": "http://<aperture-hostname>/v1"
         }
       },
       "openai": {
         "options": {
           "baseURL": "http://<aperture-hostname>/v1"
         }
       }
     }
   }
   ```

   把 `<aperture-hostname>` 替换为你的 Aperture 网关主机名。如果你[从 tailnet 外部连接][docs-connect-outside-tailnet]，请改用 `http://localhost:<port-number>`。

   只包含你在 Aperture 中配置过的提供商。例如，如果只配置了 Anthropic，就省略 `openai` 块。

3. 保存文件。

### 配置认证

OpenCode 要求每个提供商都有一个认证条目。为你配置的每个提供商设置一个占位值。

> **注意：**
>
> Aperture 通过 Tailscale 身份识别用户，并在转发请求时注入真实的 API 凭证。占位值绝不会发送给提供商。

1. 打开或创建 OpenCode 认证文件。

2. 添加以下占位密钥：

   ```json
   {
     "anthropic": {
       "type": "api",
       "key": "-"
     },
     "openai": {
       "type": "api",
       "key": "-"
     }
   }
   ```

   连字符（`-`）可以满足 OpenCode 的认证检查。

3. 保存文件。

也可以交互式输入占位密钥：在 OpenCode 中运行 `/connect`，并为每个提供商选择 **Manually enter an API Key**。

## 验证连接

1. 在 OpenCode 中发送一条测试消息。
2. 在你的 Aperture 网关上打开 Chat，在侧边栏选择 **Sessions**。确认测试请求已出现。如果你的账户没有门户访问权，请让管理员检查 **Security** > **Logs**。

如果请求没有出现，参阅 [Aperture 故障排查指南][docs-aperture-troubleshooting]。

\[Missing snippet: aperture\_connect\_next\_steps.mdx]

[docs-aperture-cli]: /docs/aperture/cli

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-aperture]: /docs/aperture

[docs-connect-outside-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-get-started]: /docs/aperture/get-started

[xt-opencode-config]: https://opencode.ai/docs/config/

[xt-opencode]: https://opencode.ai
