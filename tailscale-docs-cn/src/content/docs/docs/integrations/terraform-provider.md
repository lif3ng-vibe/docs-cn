---
title: "使用 Terraform 管理 Tailscale 资源"
description: "使用 Terraform Tailscale provider 与 Tailscale API 交互。"
---

最后验证于 Jan 30, 2026

[Terraform][xt-terraform] 是一种基础设施即代码（IaC）工具，让你能够以编程方式部署基础设施。Terraform registry 中的 [Tailscale Terraform provider][xt-terraform-tailscale] 由 Tailscale 维护。我们建议使用最新版本的 provider。

你可以使用 Tailscale Terraform provider 来：

* 使用 [`tailscale_acl` 资源][xt-terraform-tailscale-acls]定义你的[策略文件][docs-policy-file]。
* 设置 [DNS 设置][docs-dns]，包括：
  * 使用 [`tailscale_dns_nameservers` 资源][xt-terraform-tailscale-dns-nameservers]设置全局 nameserver。
  * 使用 [`tailscale_dns_search_paths` 资源][xt-terraform-tailscale-dns-search-paths]设置 split DNS 所用的受限 nameserver。
  * 使用 [`tailscale_dns_preferences` 资源][xt-terraform-tailscale-dns-preferences]设置 [MagicDNS][docs-magicdns]。
* 使用 [`tailscale_key` 资源][xt-terraform-tailscale-tailnet-key]生成[认证密钥（auth key）][docs-auth-keys]（包括设置它是否可重复使用、是否为临时节点密钥、是否预授权，以及是否带标签）
* 管理设备的各项属性，包括：
  * 使用 [`tailscale_device_authorization` 资源][xt-terraform-tailscale-device-auth]进行[设备审批][docs-device-approval]。
  * 使用 [`tailscale_device_key` 资源][xt-terraform-tailscale-device-key]设置[密钥过期][docs-key-expiry]。
  * 使用 [`tailscale_device_tags` 资源][xt-terraform-tailscale-device-tags]设置[标签][docs-tags]。
  * 使用 [`tailscale_device_subnet_routes` 资源][xt-terraform-tailscale-device-subnets]设置[子网路由][docs-subnets]。

受支持资源的完整列表请参阅 [Terraform Provider 文档][xt-terraform-tailscale-docs]。

## 凭证与 tailnet 配置

要将 Terraform 与 Tailscale 搭配使用，需要用你的 Tailscale 凭证配置 [Tailscale Terraform provider][xt-terraform-tailscale]，凭证可以是[信任凭证（trust credential）](https://console.tailscale.com/admin/settings/trust-credentials)或 [API 访问令牌](https://console.tailscale.com/admin/settings/keys)。

> **注意：**
>
> Tailscale 建议你使用信任凭证（OAuth client 或联合身份），因为信任凭证关联的是 tailnet 而非个人用户、不会过期，并且支持 [scopes][docs-trust-credentials-scopes]。详情请参阅[信任凭证][docs-trust-credentials]。

你还必须在 Tailscale Terraform provider 配置中指定你的 tailnet。你可以传入一个连字符（`-`）来引用所用[信任凭证][docs-trust-credentials]（或 API 访问令牌）的默认 tailnet。对大多数用户来说，直接使用凭证信息中的默认 tailnet 是最佳选择。你也可以指定自己的 [tailnet ID][docs-tailnet-name-tailnet-id]。tailnet ID 可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面中找到。

> **注意：**
>
> 不建议将 OAuth client 或 API 访问令牌等敏感信息存入版本控制。请改用环境变量或密钥管理器（secrets manager）。

使用默认变量 `TAILSCALE_OAUTH_CLIENT_ID`、`TAILSCALE_OAUTH_CLIENT_SECRET` 和 `TAILSCALE_TAILNET` 向 Tailscale Terraform provider 提供你的凭证与 tailnet 组织名称。也可以参阅 Terraform 文档了解[用变量设置值][xt-hashicorp-values-with-variables]的方法。

如果你使用的是联合身份而非 OAuth client，请使用默认的 `TAILSCALE_IDENTITY_TOKEN` 变量替代 `TAILSCALE_OAUTH_CLIENT_SECRET`。

如果你使用的是 API 访问令牌而非 OAuth client，请使用默认的 `TAILSCALE_API_KEY` 变量替代 `TAILSCALE_OAUTH_CLIENT_ID` 和 `TAILSCALE_OAUTH_CLIENT_SECRET`。

### 环境变量

在 Terraform 中，你可以把大部分信息存为环境变量。Tailscale 的以下配置项会用到环境变量：

| **配置项**                                          | **说明**                                                                                                                                                                                                                                                                | **环境变量**                    |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `api_key` (String, Sensitive)                       | 用于对 API 请求进行身份认证的 API 密钥。与 '`TAILSCALE_OAUTH_CLIENT_ID`' 和 '`TAILSCALE_OAUTH_CLIENT_SECRET`' 冲突。                                                                                                                                                      | `TAILSCALE_API_KEY`             |
| `base_url` (String)                                 | Tailscale API 的 base URL。默认为 `https://api.tailscale.com`。                                                                                                                                                                                                          | `TAILSCALE_BASE_URL`            |
| `TAILSCALE_OAUTH_CLIENT_ID` (String)                | 使用 OAuth client 凭证或工作负载身份联合（workload identity federation）时，OAuth 应用或联合身份的 ID。若设置此项，则必须同时设置 '`TAILSCALE_OAUTH_CLIENT_SECRET`' 或 '`TAILSCALE_IDENTITY_TOKEN`' 之一，但不能两者都设。与 '`api_key`' 冲突。                              | `TAILSCALE_OAUTH_CLIENT_ID`     |
| `TAILSCALE_OAUTH_CLIENT_SECRET` (String, Sensitive) | 使用 OAuth client 凭证时，OAuth 应用的密钥。若设置此项，则必须同时设置 '`TAILSCALE_OAUTH_CLIENT_ID`'。与 '`api_key`' 和 '`identity_token`' 冲突。                                                                                                                          | `TAILSCALE_OAUTH_CLIENT_SECRET` |
| `TAILSCALE_IDENTITY_TOKEN` (String, Sensitive)      | 使用联合身份时，用于换取 Tailscale API 令牌的 JWT 身份令牌。与 '`api_key`' 和 '`client_secret`' 冲突。                                                                                                                                                                     | `TAILSCALE_OAUTH_CLIENT_SECRET` |
| `tailnet` (String)                                  | 执行操作的目标 [tailnet ID][docs-tailnet-name-tailnet-id]。                                                                                                                                                                                                              | `TAILSCALE_TAILNET`             |

### 从社区贡献的 Terraform provider 迁移

如果你之前使用的是社区贡献的 Terraform provider，现在想改用由 Tailscale 管理和发布的 provider，请更新 Terraform 配置中的 `source` 参数，即把 `source = "davidsbond/tailscale"` 改为 `source = "tailscale/tailscale"`。

## 特别致谢

特别感谢 [David Bond][xt-gh-david-bond]，他贡献并维护了最初的社区版 Tailscale Terraform provider。如今该 provider 由 Tailscale 维护和发布。

## 支持

Tailscale Terraform provider 由 Tailscale 在 Terraform registry 中维护并发布。如果你遇到问题或有功能需求，请[联系支持团队][co-contact-support]或[提交 GitHub issue][xt-gh-tailscale-terraform-issues]。

[co-contact-support]: https://tailscale.com/contact/support

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-magicdns]: /docs/features/magicdns

[docs-policy-file]: /docs/features/tailnet-policy-file

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-name-tailnet-id]: /docs/concepts/tailnet-name#tailnet-id

[docs-trust-credentials]: /docs/reference/trust-credentials

[docs-trust-credentials-scopes]: /docs/reference/trust-credentials#权限范围scopes

[xt-gh-david-bond]: https://github.com/davidsbond

[xt-gh-tailscale-terraform-issues]: https://github.com/tailscale/terraform-provider-tailscale/issues

[xt-hashicorp-values-with-variables]: https://developer.hashicorp.com/terraform/tutorials/configuration-language/sensitive-variables#set-values-with-variables

[xt-terraform-tailscale-acls]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/acl

[xt-terraform-tailscale-device-auth]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/device_authorization

[xt-terraform-tailscale-device-key]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/device_key

[xt-terraform-tailscale-device-subnets]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/device_subnet_routes

[xt-terraform-tailscale-device-tags]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/device_tags

[xt-terraform-tailscale-dns-nameservers]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/dns_nameservers

[xt-terraform-tailscale-dns-preferences]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/dns_preferences

[xt-terraform-tailscale-dns-search-paths]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/dns_search_paths

[xt-terraform-tailscale-tailnet-key]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/tailnet_key

[xt-terraform-tailscale]: https://registry.terraform.io/providers/tailscale/tailscale/latest

[xt-terraform-tailscale-docs]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs

[xt-terraform]: https://www.terraform.io
