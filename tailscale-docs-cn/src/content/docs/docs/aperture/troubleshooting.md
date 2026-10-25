---
title: "Aperture 故障排查"
description: "Tailscale Aperture 常见错误情况、成因与解决步骤。"
---

最后验证于 Sep 29, 2026

使用以下小节来诊断并解决 [Aperture by Tailscale][docs-aperture] 的常见问题。

| 现象 | 可能原因 |
| --- | --- |
| [无法通过主机名连接][ar-cannot-connect-hostname] | MagicDNS 已禁用、URL 错误 |
| [HTTP 403 错误][ar-http-403] | 缺少角色授权 |
| [设备变得不可达][ar-device-unreachable] | 密钥过期 |
| [HTTP 429 错误][ar-http-429] | 配额配置错误 |
| [Mullvad 出口节点][ar-mullvad-collision] | Mullvad IP 冲突 |
| [所有会话来自同一用户][ar-same-user-sessions] | 基于标签的身份 |
| [HTTPS 连接问题][ar-https-issues] | URL 协议方案或主机名不符合客户端要求 |
| [客户端连接问题][ar-client-connection] | 基础 URL 错误或缺少认证 |
| [HTTP 405 错误][ar-http-405] | 基础 URL 中出现重复的 `/v1` |
| [`/v1/responses` 或 `/v1/messages` 上的 HTTP 404][ar-http-404-compat] | 缺少兼容性标志 |
| [Web 门户访问问题][ar-portal-access] | 门户访问已禁用，或没有兼容聊天的模型 |
| [连接器验证错误][ar-connector-validation] | ID 无效、缺少 protocol，或认证配置有误 |
| [OAuth 2.0 授权失败][ar-oauth-auth-fails] | `auth_url` 错误、回调不匹配，或授权流程已过期 |
| [HTTP 连接器返回意外错误][ar-http-connector-errors] | 上游返回 502，不支持的方法返回 405 |
| [HTTP 连接器返回 403 Forbidden][ar-http-connector-403] | 缺少用于代理访问的 `connectors` 授权 |
| [每用户 OAuth 连接器的工具不显示][ar-oauth-tools-missing] | 延迟填充：用户必须先完成授权 |
| [刷新令牌失败][ar-refresh-token-failure] | 存储的凭证已过期，用户必须重新授权 |

## 客户端连接问题

如果你的客户端无法连接，或者在 Aperture 中找不到它发出的请求：

* 确认客户端配置中的基础 URL 与你的 Aperture 主机名一致。对大多数工具来说，URL 为 `http://<aperture-hostname>` 或 `http://<aperture-hostname>/v1`。
* 确认你的客户端有一条有效的认证条目。即使真实凭证由 Aperture 注入，大多数工具也要求填写一个占位 API 密钥（例如 `-`）。
* 在浏览器中打开 Aperture 的主机名，验证你的设备能否访问它。如果你的账户被禁用了门户访问，请让管理员验证连通性。
* 如果你[从 tailnet 之外连接][docs-connect-outside-tailnet]，请确认 Aperture CLI 桥接或 `ts-unplug` 代理正在运行，并使用 `http://localhost:<port-number>` 而不是 `http://<aperture-hostname>`。

重试该请求，并在你的 [**Sessions** 页面][docs-chat-sessions]中查找。管理员还可以查看 [**Logs** 页面][docs-admin-logs]。如果请求出现在那里，说明连接正常。

关于各客户端的具体设置，参见[设置 LLM 客户端][docs-use-your-tools]。[Aperture CLI][docs-cli] 会自动处理基础 URL 和认证。

## 所有会话似乎来自同一用户

如果你使用基于标签的身份来认证用户设备，来自这些设备的所有 LLM 会话都会显示为来自同一用户。Tailscale 标签不提供逐用户身份。它面向的是服务账户或服务器设备的认证，而不是个人用户认证。例如，你可以为一组 PostgreSQL 数据库服务器使用标签身份。更多信息参见[标签主题][docs-tags]。

要解决此问题，确保用户从与其个人 Tailscale 账户关联的设备连接 Aperture。切换到个人账户后，在管理控制台的 **Logs** 页面上验证新会话显示的是不同的用户名。关于 Aperture 如何为带标签的节点解析身份的详细信息，参见[带标签设备身份主题][docs-aperture-tagged-identity]。

## HTTPS 连接问题

使用你的客户端所要求的 URL 协议方案。大多数 Aperture 客户端在 Tailscale 加密网络上使用 `http://<aperture-hostname>`。Claude Desktop 要求使用网关的 `https://` URL 并拒绝 HTTP。请查阅对应客户端的设置说明，而不是把所有客户端都改成 HTTP。[Aperture CLI][docs-cli] 会为受支持的客户端配置合适的 URL。

如果主机名无法解析，可能是 MagicDNS 被禁用了。参见[无法通过主机名连接 Aperture][ar-cannot-connect-hostname]。

## 无法通过主机名连接 Aperture

如果你无法通过 Aperture 的短主机名连接（例如 `http://<aperture-hostname>`），可能是你的 tailnet 中禁用了 [MagicDNS][docs-magicdns]。Aperture 依靠 MagicDNS 来解析自己的主机名。MagicDNS 关闭时，主机名无法解析，连接尝试会失败。

不要用 `tailscale ping` 来诊断此问题。即使 MagicDNS 被禁用，`tailscale ping` 也会成功，因为它直接使用 Tailscale IP 地址并经由 DERP 中继转发流量。请改用 `tailscale dns status` 验证 MagicDNS 是否启用，或在 Tailscale 管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 设置页中检查。

你也可以运行 `nslookup <hostname>.<tailnet>.ts.net` 直接测试解析。把 `<hostname>` 替换为你的 Aperture 主机名。默认值是 `ai`，但你也可能用了自定义名称。如果生成的客户端配置显示的是 `http://your-aperture-host` 这样的占位 URL，说明 MagicDNS 很可能没有启用。

要解决此问题，在 Tailscale 管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 设置中启用 MagicDNS。设置步骤参见 [MagicDNS 主题][docs-magicdns]。或者，直接使用 Tailscale IP 地址绕过主机名解析（例如用 `http://<tailscale-ip>/` 代替 `http://<aperture-hostname>/`）。你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面找到 Aperture 设备的 IP 地址。

## HTTP 403 拒绝访问错误

带有 `access denied: no role granted` 消息的 HTTP 403 错误表示授权（grant）缺失或配置有误。Aperture 使用两个相互独立的访问控制层，两者都必须配置：

1. **tailnet 访问控制规则**：tailnet 策略文件中允许网络连接到 Aperture 设备的规则。没有这条规则，连接会在到达 Aperture 之前失败。
2. **Aperture 授权**：[Aperture 配置][docs-aperture-configuration]中为用户或组分配角色的授权。没有角色授权，Aperture 会返回 HTTP 403。

如果用户有角色但无权访问所请求的模型，Aperture 会返回 HTTP 404。对于[模型别名（model alias）][docs-model-aliases]，要检查对其目标模型的访问权限，而不是别名名称。

此 403 错误的常见原因是缺少角色授权，或 `src` 模式不正确。`src` 字段要求精确匹配。对于带标签的设备，它必须与 Aperture 生成的以逗号连接的完整标签字符串精确匹配。详细信息参见[带标签设备身份主题][docs-aperture-tagged-identity]。

授权配置步骤参见[为模型授予访问权限][docs-grant-model-access]和[设置管理员访问][docs-set-up-admin-access]。

使用 Tailscale 管理控制台中的 [Preview rules](https://console.tailscale.com/admin/acls/preview) 检查用户设备能否访问 Aperture 网关。然后检查 Aperture 配置中是否包含 `src` 模式与连接用户或标签相匹配的授权。如果 403 错误是间歇性的且与 VPN 的使用相关，参见[使用 Mullvad 出口节点时的间歇性失败][ar-mullvad-collision]了解相关原因。

## Web 门户访问问题

门户访问要与模型访问分开检查：

* **无法打开 Web 门户**：Web 门户默认可用，因此常见原因是某条授权把 `enable_portal` 设为 `false`（或旧配置使用 `enable_chat_ui: false`）。确认没有授权为该用户禁用它。
* **聊天选择器为空**：用户能打开 Web 门户，但没有任何兼容聊天的模型。确认该用户的 `models` 授权至少覆盖一个其提供商声明了聊天兼容 `compatibility` 标志（`anthropic_messages`、`openai_chat`、`openai_responses`、`gemini_generate_content` 或 `google_generate_content`）的模型。
* **已授权且兼容聊天的模型缺失**：该模型的提供商很可能配置为[透传模式（passthrough mode）][docs-use-passthrough-mode]且没有后备 `apikey`。仅透传的提供商只服务携带客户端凭证的请求，因此即使这些模型仍出现在 `/v1/models` 端点中，Aperture 也会在门户聊天界面中隐藏它们。要让该模型可用于聊天，请为该提供商配置后备 `apikey`。
* **预期的模型缺失**：如果你用 `chat_models` 策展选择器，只有匹配非 `hidden` 条目的模型才会显示。确认该模型匹配某一条目。

设置步骤参见[设置聊天 UI][docs-set-up-chat-ui]。

## Aperture 设备变得不可达

如果你的 Aperture 网关变得不可达，请在 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面检查其设备是否已过期或缺失。

当节点密钥（node key）距过期不足 7 天时，Aperture 会在管理控制台中显示警告横幅。该横幅仅管理员可见。

如果设备已过期或被删除，请联系 [Tailscale 支持][co-contact-support]恢复网关访问。要防止密钥过期，请在 [Machines](https://console.tailscale.com/admin/machines) 页面为 Aperture 设备禁用密钥过期。更多信息参见[密钥过期文档][docs-key-expiry]。

## HTTP 429 速率限制错误

如果你认为自己有访问权限却收到 HTTP 429 速率限制错误，可能是 Aperture 配置中的配额（quota）配置有误。如果 Aperture 无法解析某个配额配置，它会以 429 错误拒绝所有匹配该配额的请求。常见原因包括配额桶名称有拼写错误、配额值无效，或配额上限被设为零。

检查 Aperture 配置中是否有拼写错误的配额桶名称和无效值，然后改正。预期语法参见[配额配置主题][docs-aperture-quotas]。如果不需要自定义配额，可以整体删除 quota 字段以使用默认设置。检查和补充预算的步骤参见[检查并补充预算][docs-monitor-quota-balances]。

## 使用 Mullvad 出口节点时的间歇性失败

如果在 Mullvad 出口节点处于活动状态时访问 Aperture 出现间歇性 403 错误或连接失败，原因是 IP 地址段冲突。Tailscale 从 CGNAT 段 `100.64.0.0/10` 分配设备地址，而 Mullvad 也使用该段中的地址。当 Mullvad 出口节点处于活动状态时，目的地为 Tailscale 地址的流量可能被错误地路由到 Mullvad，导致授权评估失败，其表现与[授权权限问题][ar-http-403]无法区分。

要确认这就是原因，请断开 Mullvad 出口节点并重试连接。如果错误消失，请改用 [Tailscale 出口节点][docs-exit-nodes]，或者在 Mullvad 客户端支持分流（split tunneling）的情况下，把 Tailscale 接口排除出 Mullvad 的路由配置。

## 来自上游提供商的 HTTP 405 错误

如果每个请求都从上游提供商返回 HTTP 405 Method Not Allowed，很可能是该提供商的 `baseurl` 包含了与请求路径重复的路径段（通常是 `/v1`）。Aperture 会把完整的入站请求路径追加到 `baseurl` 之后，因此 `https://ai-gateway.vercel.sh/v1` 这样的 `baseurl` 会生成 `https://ai-gateway.vercel.sh/v1/v1/chat/completions` 这样的上游 URL。

要解决此问题，请从 `baseurl` 中去掉路径段。对云端提供商来说，`baseurl` 应为不带 `/v1` 的 API 根地址。例如使用 `https://api.openai.com` 而不是 `https://api.openai.com/v1`。每个提供商的正确 `baseurl` 参见[提供商矩阵][docs-provider-compatibility]。关于 Aperture 如何构造上游 URL 的详细信息，参见 [Aperture 如何构建上游 URL][docs-aperture-url-construction]。

## /v1/responses 或 /v1/messages 上的 HTTP 404

如果对 `/v1/responses` 或 `/v1/messages` 的请求返回 HTTP 404，而 `/v1/chat/completions` 正常工作，说明该提供商的 `compatibility` 块没有包含对应的标志。当 `compatibility` 完全省略时，默认只启用 `openai_chat`。`openai_responses` 和 `anthropic_messages` 标志必须显式设置。

要解决此问题，请把相应的标志添加到该提供商的 `compatibility` 块：

```json
{
  "compatibility": {
    "openai_chat": true,
    "openai_responses": true,
    "anthropic_messages": true
  }
}
```

把 `openai_responses` 设为 `true` 可启用 `/v1/responses` 端点，把 `anthropic_messages` 设为 `true` 可启用 `/v1/messages`。完整的标志列表参见[兼容性标志主题][docs-provider-compatibility-flags]。

## 连接器验证错误

如果 Aperture 在保存配置时因连接器相关错误而拒绝，请检查连接器定义。下表列出了常见的验证错误及其原因。

| 错误 | 原因 |
| --- | --- |
| 连接器 ID 无效 | `id` 字段必须匹配 `[a-zA-Z][a-zA-Z0-9]*` 模式。ID 必须以字母开头，且只能包含字母和数字。 |
| 缺少 protocol | 每个连接器必须指定 `"protocol": "mcp"` 或 `"protocol": "http"`。 |
| 保留 ID | `tailscale` 和 `internal` 是保留 ID，Aperture 内置系统连接器的 ID（当前为 `aperture`）也是。你不能在用户自定义连接器中使用这些 ID。 |
| ID 重复 | 连接器 ID 在 `mcp.servers` 和 `connectors.servers` 中必须唯一。同一名 ID 同时出现在两个部分时，验证会失败。 |
| 缺少认证字段 | `bearer_token` 认证块需要 `secret` 字段。`oauth2_authorization_code` 认证块需要 `client_id`、`auth_url` 和 `token_url`。`client_secret` 字段是可选的（仅使用 PKCE 的公共客户端不需要）。 |

要解决这些错误，请在配置中改正连接器定义并重新保存。完整的 schema 参见[连接器配置参考][docs-aperture-connectors-config]。

## OAuth 2.0 授权失败

如果 OAuth 2.0 授权流程在同意页面、回调或令牌交换阶段失败，说明连接器的 `oauth2_authorization_code` 配置不正确，或流程已过期。以下现象对应具体的失败原因：

| 现象 | 原因 |
| --- | --- |
| 同意页面打开时间过长后授权失败 | 授权流程未在 15 分钟内完成。用户必须重新发起流程。 |
| 授权因不是由当前用户发起而被拒绝 | 完成回调的用户不是发起该流程的用户。 |
| 授权因应用身份不匹配而被拒绝 | 回调中返回的 `client_id` 与连接器配置的 `client_id` 不一致。 |
| 授权在最后的令牌交换步骤失败 | 与 OAuth 2.0 提供商的令牌交换失败。检查 `client_id`、`client_secret` 和 `token_url` 是否正确。 |
| 回调因缺少必需参数而被拒绝 | 回调 URL 缺少必需参数。这通常表明 OAuth 2.0 提供商处的重定向 URI 配置有误。 |

常见原因包括：

* `auth_url` 不正确，指向了错误的提供商端点。
* 回调 URL 与 OAuth 2.0 提供商注册的重定向 URI 不匹配。
* 缺少提供商要求的 `auth_params`。例如，Google 需要 `"access_type": "offline"` 才会签发刷新令牌。

## HTTP 连接器返回意外错误

如果 HTTP 连接器返回的错误与应用逻辑无关，问题很可能出在 Aperture 代理请求的方式上。下表列出了常见的错误响应及其原因。

| 响应 | 原因 |
| --- | --- |
| 502 Bad Gateway | 上游服务器返回了错误或不可达。验证连接器的 `url` 是否正确、上游服务器是否在运行。 |
| 502 Bad Gateway（请求格式错误） | 无法构造发往上游服务器的请求。检查连接器的 `url` 是否为有效 URL。 |
| 405 Method Not Allowed | 不支持该 HTTP 方法。Aperture 会阻止 `TRACE` 请求，并且根据连接器配置也可能阻止其他方法。 |
| 404 Not Found | 请求路径中的连接器 ID 与任何已配置的连接器都不匹配。 |

出于安全考虑，Aperture 会从经代理的 HTTP 连接器请求和响应中剥离 `Authorization`、`Cookie` 和 `Set-Cookie` 头。如果上游服务器需要认证，请通过连接器的 `auth` 块进行配置，而不是直接传递请求头。

Aperture 对 HTTP 连接器响应强制执行 50 MB 的响应体上限。超过该上限的响应会被截断。

## HTTP 连接器返回 403 Forbidden

如果 HTTP 连接器返回 403 Forbidden，说明连接用户没有允许访问该连接器代理端点的 `connectors` 授权。Aperture 要求授权的模式匹配 `<connector-id>/proxy`，或匹配 `<connector-id>/**` 这类更宽泛的模式。

要解决此问题，请向该用户的 Aperture 授权配置中添加一条 `connectors` 授权：

```json
{
  "grants": [
    {
      "src": ["autogroup:members"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"connectors": ["github/proxy"]}
        ]
      }
    }
  ]
}
```

把 `github` 替换为连接器 ID，并调整 `src` 模式以匹配合适的用户或组。授权模式的详细信息参见[连接器功能指南][docs-aperture-connectors]。

## 每用户 OAuth 连接器的工具不显示

如果连接器使用 `oauth2_authorization_code` 或 `oauth2_dcr` 认证，而某个用户看不到它的工具，让用户在 Aperture Chat 的 **Connectors** 页面上查看该连接器：

* **Connect**：该用户尚未授权此连接器。每个用户都必须单独授权连接器，因为凭证是按用户的，不共享。用户选择 **Connect** 并完成同意流程。
* **Ready**：该用户已授权此连接器，但工具发现未完成。Aperture 会在同意后尝试发现工具，如果上游缓慢或不可达，发现可能失败。用户打开连接器的详情页并选择 **Refresh tools**。如果刷新失败，检查 Aperture 能否访问上游服务器。

用户侧的操作步骤参见[使用连接器][docs-connectors-use]。

## 刷新令牌失败

如果之前正常的每用户 OAuth 连接器显示 **Needs reconnect**，说明其存储的授权已无法使用。这发生在两种情况下：

* 访问令牌已过期，且 OAuth 2.0 提供商没有签发刷新令牌。
* 提供商拒绝了令牌刷新，要求重新进行同意授权。

常见原因包括：OAuth 2.0 提供商因不活跃而撤销了刷新令牌、用户在提供商的账户设置中撤销了访问，或提供商的刷新令牌有效期已到。临时性的刷新失败（例如超时）不会改变连接器的状态。

对于 Google OAuth 2.0 连接器，确保 `auth_params` 包含 `"access_type": "offline"`，以便在授权时请求刷新令牌。没有该参数时，Google 只会签发短期的访问令牌。

要解决此问题，用户在 Aperture Chat 中选择 **Reconnect** 并重新完成同意流程。参见[工具失效时重新连接][docs-connectors-use-reconnect]。

## 相关内容

以下参考文档详细介绍了故障排查中用到的接口和设置：

* [Aperture by Tailscale 文档][docs-aperture]
* [Aperture 配置参考][docs-aperture-configuration]
* [受支持的提供商与客户端][docs-provider-compatibility]
* [连接器功能指南][docs-aperture-connectors]
* [连接器配置参考][docs-aperture-connectors-config]
* [聊天界面参考][docs-chat]
* [管理控制台参考][docs-admin-console]

## 获取帮助

如果按照故障排查步骤操作后问题仍然存在，请联系 [Tailscale 支持][co-contact-support]。请附上隐去密钥后的相关配置、错误消息，以及你已经尝试过的步骤。

[ar-cannot-connect-hostname]: #无法通过主机名连接-aperture

[ar-client-connection]: #客户端连接问题

[ar-connector-validation]: #连接器验证错误

[ar-device-unreachable]: #aperture-设备变得不可达

[ar-http-403]: #http-403-拒绝访问错误

[ar-http-404-compat]: #v1responses-或-v1messages-上的-http-404

[ar-http-405]: #来自上游提供商的-http-405-错误

[ar-http-429]: #http-429-速率限制错误

[ar-http-connector-403]: #http-连接器返回-403-forbidden

[ar-http-connector-errors]: #http-连接器返回意外错误

[ar-https-issues]: #https-连接问题

[ar-mullvad-collision]: #使用-mullvad-出口节点时的间歇性失败

[ar-oauth-auth-fails]: #oauth-20-授权失败

[ar-oauth-tools-missing]: #每用户-oauth-连接器的工具不显示

[ar-portal-access]: #web-门户访问问题

[ar-refresh-token-failure]: #刷新令牌失败

[ar-same-user-sessions]: #所有会话似乎来自同一用户

[co-contact-support]: https://tailscale.com/contact/support

[docs-admin-console]: /docs/aperture/reference/dashboard-admin

[docs-admin-logs]: /docs/aperture/reference/dashboard-admin#logs

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-connectors-config]: /docs/aperture/configuration#connectors

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-quotas]: /docs/aperture/configuration#quotas

[docs-aperture-tagged-identity]: /docs/aperture/how-aperture-works#tagged-device-identity

[docs-aperture-url-construction]: /docs/aperture/configuration#how-aperture-builds-upstream-urls

[docs-aperture]: /docs/aperture

[docs-chat-sessions]: /docs/aperture/reference/chat#sessions

[docs-chat]: /docs/aperture/reference/chat

[docs-cli]: /docs/aperture/cli

[docs-connect-outside-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-connectors-use-reconnect]: /docs/aperture/connectors/use-a-connector#reconnect-when-tools-stop-working

[docs-connectors-use]: /docs/aperture/connectors/use-a-connector

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-magicdns]: /docs/features/magicdns

[docs-model-aliases]: /docs/aperture/model-aliases

[docs-monitor-quota-balances]: /docs/aperture/how-to/check-and-refill-budgets

[docs-provider-compatibility-flags]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients#provider-matrix

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-set-up-chat-ui]: /docs/aperture/how-to/set-up-chat-ui

[docs-tags]: /docs/features/tags

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-your-tools]: /docs/aperture/use-your-tools
