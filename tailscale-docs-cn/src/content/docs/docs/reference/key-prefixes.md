---
title: "密钥前缀"
description: "了解 Tailscale 密钥的前缀，例如 API 访问令牌。"
---

最后验证于 Aug 1, 2025

Tailscale 在密钥的 ID 中使用前缀。前缀以 `tskey-` 开头，后接密钥类型。例如，当你创建 Tailscale API 访问令牌时，前缀是 `tskey-api`，得到的密钥 ID 形如：

`tskey-api-abcDEF1CNTRL-091234567890ABCDEF`

密钥前缀的类型如下：

| 密钥前缀        | 说明                                                                                    |
| --------------- | --------------------------------------------------------------------------------------- |
| `tskey-api`     | 该密钥是 [Tailscale API][docs-api] 访问令牌。                                            |
| `tskey-auth`    | 该密钥是[预认证密钥][docs-auth-keys]。                                                   |
| `tskey-client`  | 该密钥是 Tailscale [OAuth 客户端][docs-oauth-clients]密钥。                              |
| `tskey-scim`    | 该密钥是[跨域身份管理系统][ln-what-is-scim]（SCIM）密钥。                                |
| `tskey-webhook` | 该密钥是 [webhook][docs-webhooks] 密钥。                                                 |

注意，所有 Tailscale 生成的密钥和机密都区分大小写。有关密钥与机密的更多信息，参阅[密钥与机密管理][docs-key-secret-management]。

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-key-secret-management]: /docs/reference/key-secret-management

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-webhooks]: /docs/features/webhooks

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim
