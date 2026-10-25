---
title: "Tailnets API"
description: "使用 Tailscale Tailnets API 以编程方式创建和管理你组织中的 tailnet。"
---

最后验证于 Oct 20, 2026

> **注意：** Tailnets API 目前处于 alpha 阶段。

> **注意：** Tailnet API 适用于[所有套餐](https://tailscale.com/pricing)。

> **注意：**
>
> 你在组织中最多可以创建十个 tailnet（包括你最初的 tailnet）。需要超过十个 tailnet 的使用场景需要签订销售合同。详情请联系 [Tailscale Sales](https://tailscale.com/contact/sales)。

Tailscale 提供 API 端点，可用于创建、列出和删除你组织中的多个 Tailscale 网络（即 tailnet）。这些 tailnet 属于仅限 API 的（API-only）tailnet，即它们不包含真人用户，也不会出现在管理控制台中。通过这些 API 创建的 tailnet 只支持带有标签的设备。它们非常适合直接构建到你的应用、自动化流程和基础设施中，但不适用于需要真人直接加入 tailnet 的场景。

## 创建仅限 API 的 tailnet

仅限 API 的 tailnet 可用于：

* 在 CI/CD 流水线中创建临时（ephemeral）tailnet
* 为你的应用构建私有连接
* 为 AI 代理部署沙箱 tailnet

如果你想创建的是会出现在管理控制台中、支持真人用户的额外 tailnet，请参阅[管理多个 tailnet][docs-multiple-tailnets]。

### 向 API 进行身份验证

你可以使用 [OAuth client][docs-oauth-client] 或[联合身份][docs-workload-identity-federation]对这些 API 进行身份验证。在一个现有 tailnet 中创建信任凭证（trust credential），并为其分配 `tailnets` 作用域。

使用 OAuth client 的步骤：

1. 生成一个具有 `tailnets` 作用域的 OAuth client。
2. [将 OAuth client 密钥换取 API 访问令牌][docs-exchange-token]，供 API 端点使用。

使用联合身份的步骤：

1. 创建一个具有 `tailnets` 作用域的联合身份。
2. [将工作负载身份令牌换取 API 访问令牌][docs-workload-identity-federation-token-exchange]，供 API 端点使用。

### 对仅限 API 的 tailnet 进行身份验证

当你[创建][co-api-create-tailnet]一个新的仅限 API 的 tailnet 时，响应中会包含一个 OAuth client 的详细信息，该 client 拥有访问该 tailnet API 的权限。

此外，创建方 tailnet 中的 OAuth client 也可以获取新的 OAuth 访问令牌来访问该仅限 API 的 tailnet：在发送到 `/token` 端点的请求体中，通过 `tailnet` 参数指定目标 tailnet 的 ID 即可。该 OAuth client 必须具有 `all` 作用域。如果你丢失了最初创建响应中返回的 OAuth client 凭证，可以使用此方法重新获取仅限 API 的 tailnet 的新凭证。

`tailnet` 参数仅适用于 OAuth client 凭证交换。联合身份令牌交换无法请求访问另一个 tailnet。要将联合身份与仅限 API 的 tailnet 配合使用，请先使用返回的 OAuth client 在该仅限 API 的 tailnet 中创建联合身份。

例如：

```shell
curl -d "client_id=${OAUTH_CLIENT_ID}" -d "client_secret=${OAUTH_CLIENT_SECRET}" \
  -d "tailnet=T123456CNTRL" "https://api.tailscale.com/api/v2/oauth/token"
```

### 端点

有关端点路径、请求模式、响应模式、状态码和所需 OAuth 作用域，请参阅 Tailscale API 参考：

* [创建 tailnet][co-api-create-tailnet]
* [列出 tailnet][co-api-list-tailnets]
* [删除 tailnet][co-api-delete-tailnet]

如果你丢失了创建仅限 API 的 tailnet 时返回的 OAuth client 凭证，或者想为该 tailnet 创建更多凭证，可以使用创建方 tailnet 中的 OAuth client [对仅限 API 的 tailnet 进行身份验证][ar-authenticate-api-only]，然后用它在仅限 API 的 tailnet 中[创建新的 OAuth client][co-api-create-key]。

### 配置仅限 API 的 tailnet

创建仅限 API 的 tailnet 之后，你就可以使用标准的[公共 API 端点][co-api]来编写访问策略、自定义设置，以及向该 tailnet 认证新的带标签设备。

### 局限性

* Alpha 阶段的 API 端点不被视为稳定接口。Tailscale 在做出破坏性更改之前会与用户沟通。
* 这些 alpha 端点在 API 的 Go 客户端、Terraform provider 或 Pulumi provider 中不可用。
* 通过这些 API 端点创建的 tailnet 没有真人的所有者或用户。你必须使用公共 API 与该 tailnet 交互。此功能的未来版本将移除此限制。
* 通过这些 API 端点创建的 tailnet 不会出现在你组织的管理控制台中。此功能的未来版本将允许你选择这些 tailnet 是否出现在管理控制台中。

[ar-authenticate-api-only]: #对仅限-api-的-tailnet-进行身份验证

[co-api]: https://tailscale.com/api

[co-api-create-tailnet]: https://tailscale.com/api#tag/organizations/POST/organizations/{organization}/tailnets

[co-api-create-key]: https://tailscale.com/api#tag/keys/POST/tailnet/{tailnet}/keys

[co-api-delete-tailnet]: https://tailscale.com/api#tag/organizations/DELETE/tailnet/{tailnet}

[co-api-list-tailnets]: https://tailscale.com/api#tag/organizations/GET/organizations/{organization}/tailnets

[docs-exchange-token]: /docs/features/oauth-clients#verifying-you-can-generate-api-access-tokens

[docs-multiple-tailnets]: /docs/features/multiple-tailnets

[docs-oauth-client]: /docs/features/oauth-clients

[docs-workload-identity-federation]: /docs/features/workload-identity-federation

[docs-workload-identity-federation-token-exchange]: /docs/features/workload-identity-federation#token-exchange-api
