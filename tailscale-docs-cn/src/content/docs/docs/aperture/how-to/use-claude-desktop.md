---
title: "在 Aperture 中使用 Claude Desktop"
description: "配置 [Claude Desktop][xt-claude-desktop] 应用，让模型请求经由 [Aperture by Tailscale][docs-aperture] 发送，为你的组织带来集中的 API key 管理、用量跟踪和会话日志。"
---

最后验证于 Sep 29, 2026

配置 [Claude Desktop][xt-claude-desktop] 应用，让模型请求经由 [Aperture by Tailscale][docs-aperture] 发送，为你的组织带来集中的 API key 管理、用量跟踪和会话日志。

Claude Desktop 的网关连接使用 Anthropic Messages API。请把它配置为向你的 Aperture 网关发送请求。

> **注意：**
>
> 要跳过下面的手动步骤，可以使用 [Aperture CLI][docs-aperture-cli]。它会以 **Claude Cowork** 的名称列出 Claude Desktop，写入网关配置，并把 HTTP URL 改为 HTTPS。该连接使用 Anthropic Messages。Bedrock 的限制参阅[使用 Amazon Bedrock 模型][ar-use-amazon-bedrock-models]。

本指南的手动配置步骤以 macOS 版 Claude Desktop 应用及其菜单路径为准。要部署到 Windows 设备，参阅[使用 MDM 部署到多台设备][ar-deploy-across-a-fleet-with-mdm]。

## 前提条件

开始之前，你需要：

* 一台 Aperture 网关，配有支持 Anthropic Messages 的提供商（如 Anthropic），以及一个你有权使用的模型。网关必须能从你的设备访问。尚未设置时参阅[开始使用 Aperture][docs-get-started]。
* 你的设备可以通过 `https://` 访问的 Aperture 网关 URL，且具有对该主机名有效的受信任 TLS 证书。
* macOS 上已安装 [Claude Desktop][xt-claude-desktop] 应用。

> **警告：**
>
> Claude Desktop 要求网关 URL 使用 `https://`，会拒绝 `http://`。请使用网关 TLS 证书覆盖的完整 tailnet 主机名，例如 `https://<aperture-hostname>.<tailnet-name>.ts.net`。使用 Aperture CLI 的 Claude Cowork 设置之前，先在 [Aperture CLI][docs-aperture-cli] 中配置好该端点。CLI 会把 URL 方案改成 HTTPS，但不会把短主机名展开为完整的 tailnet 名称。

\[Missing snippet: aperture\_any\_provider.mdx]

Claude Desktop 的网关连接是按用户设置。每个使用 Aperture 的人在自己设备上配置，或者由管理员用 MDM 批量部署。

## 启用开发者模式

网关连接藏在开发者模式（Developer Mode）后面：

1. 在菜单栏中选择 **Help** > **Troubleshooting** > **Enable Developer Mode**。
2. Claude Desktop 可能会重启。开发者模式启用后，菜单栏中会出现 **Developer**。

## 配置网关连接

打开第三方推理配置，把它指向你的 Aperture 网关：

1. 选择 **Developer** > **Configure Third-Party Inference**。

2. 把连接类型设为 **Gateway**。

3. 把 **Credential kind** 设为 **Static API key**。

4. 把 **Gateway base URL** 设为你的 Aperture 网关的完整 HTTPS 主机名：

   ```text
   https://<aperture-hostname>.<tailnet-name>.ts.net
   ```

5. 把 **Gateway API key** 设为任意非空占位值，例如 `aperture`。该字段不能为空，但 Aperture 不需要 API key，会忽略该值。Aperture 依据 tailnet 身份认证请求，并自动注入提供商凭证。

6. **Custom inference headers** 段留空。Aperture 不要求授权头。

7. 在 **Models** 段中，至少添加一个管理员在 Aperture 中配置的模型。Aperture 不提供可发现的模型列表，因此请手动输入模型，不要依赖模型发现功能。例如：

   | 字段 | 值 |
   | ---- | -- |
   | Model ID | `claude-sonnet-5-5` |
   | Display name | Claude Sonnet |
   | Tier alias | `sonnet` |

8. 选择 **Save Changes**，然后 **Apply Changes**。

9. 完全退出并重新打开 Claude Desktop，以加载新配置。

> **注意：**
>
> Aperture 路由到原生 Anthropic Messages API（`/v1/messages`）。连接类型保持 **Gateway**，不要选择 OpenAI 兼容选项。

## 使用 Amazon Bedrock 模型

只改模型 ID 并不能让这条 Anthropic Messages 连接使用 Amazon Bedrock Runtime。Aperture 将 Anthropic Messages 与原生 Bedrock API 分开路由。

要使用配置了 `bedrock_model_invoke` 或 `bedrock_converse` 的提供商，请按照[设置 Amazon Bedrock][docs-use-amazon-bedrock]操作，并使用带相应 Bedrock 后端的客户端。例如，[Claude Code CLI 配置][docs-cli-claude-code]走的是原生 Bedrock InvokeModel 路径。选择客户端和提供商之前，请参阅[支持的提供商与客户端][docs-compatibility]。

## 验证连接

要验证 Claude Desktop 是否经由 Aperture 路由请求：

1. 在 Claude Desktop 中开始对话并发送一条测试消息。
2. 在你的 Aperture 网关上打开 Chat，在侧边栏选择 **Sessions**。确认测试请求已出现。如果你的账户没有门户访问权，请让管理员检查 **Security** > **Logs**。

如果请求没有出现，参阅 [Aperture 故障排查主题][docs-aperture-troubleshooting]。

## 使用 MDM 部署到多台设备

由于网关连接是按用户设置，管理员可以把它推送到每台受管设备，而不必让每个人手动配置。Claude Desktop 的 **Export** 功能可以把可用的配置转换为面向你的设备管理平台的部署文件。

生成并部署配置：

1. 按上面的步骤在一台设备上配置网关连接，并确认它能正常工作。

2. 在 **Configure Third-Party Inference** 窗口中，打开顶部的 **Export** 下拉菜单。

3. 选择与管理平台匹配的格式：

   | 格式 | 文件 | 配合使用 |
   | ---- | ---- | -------- |
   | macOS 配置描述文件 | `.mobileconfig` | Jamf、Kandji、Intune 及其他 MDM 平台 |
   | Windows 注册表文件 | `.reg` | Windows 部署工具 |
   | 组策略模板（ADMX） | `.zip` | Intune 或组策略管理的控制台 |

4. 用你的管理平台部署导出的文件。例如在 macOS 上，通过 MDM 推送 `.mobileconfig` 描述文件，在 `com.anthropic.claudefordesktop` 域下设置受管偏好，从而为每台受管设备锁定网关连接。

> **注意：**
>
> 导出会把占位 API key 以明文写入文件。由于 Aperture 不需要 API key，这个值不是机密，导出的文件不包含任何真实凭证。

\[Missing snippet: aperture\_connect\_next\_steps.mdx]

[ar-deploy-across-a-fleet-with-mdm]: #使用-mdm-部署到多台设备

[ar-use-amazon-bedrock-models]: #使用-amazon-bedrock-模型

[docs-aperture-cli]: /docs/aperture/cli

[docs-cli-claude-code]: /docs/aperture/cli#claude-code

[docs-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-aperture]: /docs/aperture

[docs-get-started]: /docs/aperture/get-started

[docs-use-amazon-bedrock]: /docs/aperture/how-to/use-amazon-bedrock

[xt-claude-desktop]: https://claude.ai/download
