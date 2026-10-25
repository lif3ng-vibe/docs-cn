---
title: "工作负载身份联合"
description: "使用来自第三方提供商的联合 OIDC 工作负载身份，对发往 Tailscale API 的请求进行认证。"
---

最后验证于 Jan 30, 2026

工作负载身份联合（workload identity federation）让托管在 Microsoft Azure、Google Cloud Platform、Amazon Web Services 或 GitHub Actions 等提供商上的云基础设施，能够使用提供商原生的身份令牌（而非 Tailscale 认证密钥或 OAuth client）向 tailnet 或 Tailscale API 进行认证。借助提供商的联合 OpenID Connect（OIDC）身份，tailnet 管理员可以简化凭证管理和基础设施自动化。

## 工作原理

*（图：标准工作负载身份联合流程图，展示云工作负载如何用提供商签发的 JWT 与 Tailscale 交换，从而向 Tailscale API 认证自己。）*

当一个云工作负载（例如 CI 作业、无服务器函数或虚拟机）想要加入你的 tailnet 或调用 Tailscale API 时，它首先向自己的平台请求一个 OIDC 令牌。

OIDC 令牌是一个经过签名的 JSON Web Token（JWT），它传达来自云平台的三重保证：

* 它为工作负载的身份作担保。
* 它准确指明该 JWT 代表哪个工作负载。
* 它声明谁有权消费该令牌。

由于平台使用其公开发布的密钥对令牌签名，任何人都可以验证签名并相信这些 claims 是真实的。

在任何交换发生之前，tailnet 管理员需要先建立信任：指定要信任的 OIDC issuer，并定义 claim 匹配规则，把特定的工作负载（例如某个 GitHub 仓库、Google Cloud 服务账号或 Azure 工作负载）映射到它们应获得的标签和 API 作用域。不匹配这些规则的令牌会被自动拒绝。

然后，工作负载把该 OIDC 令牌发送到 Tailscale 的令牌交换端点。在幕后，Tailscale 会获取 issuer 的公钥，验证签名、标准 claims（issuer、audience、过期时间）和 claim 匹配规则，然后返回一个短期 API 令牌，其作用域为你在 Tailscale 管理控制台中配置身份联合时所设置的 scopes。

有了这个 API 令牌，工作负载就可以使用 Tailscale API 加入或管理 tailnet。

## 设置联合身份

在云工作负载能够使用其签名 OIDC 令牌向 Tailscale 认证之前，你必须先在 Tailscale 中设置联合身份，并分配所有必要的[作用域（scope）][docs-trust-credentials-scopes]。

联合身份可以通过以下方式配置：

* [管理控制台][ar-configure-admin-console]
* [Tailscale Terraform provider][ar-configure-terraform-provider]
* [`tailscale-client-go-v2`][ar-configure-tailscale-client-go-v2]
* [Tailscale API][ar-configure-api]

### 在管理控制台中配置联合身份

要在 Tailscale 管理控制台中配置联合身份：

1. 打开管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面。
2. 选择 **Credential** 按钮。
3. 选择 **OpenID Connect**。
4. 从下拉框中选择一个 **Issuer**。下拉框中包含常见的云服务商；如果选择 **Custom issuer**，也可以使用任何支持 OIDC 工作负载身份联合的基础设施提供商。
   1. 如果使用 **Custom issuer**，请输入云服务商 OIDC issuer 的 **Issuer URL**。
5. 输入 **Subject**。该值决定工作负载必须匹配哪些属性才能成功获得 Tailscale API 令牌。常见云服务商的 subject（`sub`）claim 语法请参阅[常见云服务商的令牌格式][ar-common-cloud-provider-token-formats]一节。
6. （可选）添加额外的 **Custom claims** 来进一步收紧访问。常见云服务商的令牌 claims 请在[常见云服务商的令牌格式][ar-common-cloud-provider-token-formats]一节中查看。
7. 从列表中选择相关的读写作用域，然后选择 **Generate credential**。
8. 复制 **Client ID** 和 **Audience (aud claim)**。这些不是机密信息，在管理控制台中始终可见。

#### 在管理控制台中检索 Client ID

如果之后需要复制 **Client ID**，可以访问管理控制台。

1. 打开管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面。

2. 使用 **Search** 和（可选的）**Filters** 功能找到你关注的联合身份。

   * 按 `tag` 搜索可能有用。
   * 把 **Filters** 值设为 **Client type** 并选择 **OIDC** 也可能有帮助。

3. 选择箭头开关展开该行，或选择  菜单并选择 **View** 或 **Edit**。

4. 选择剪贴板图标复制 **Client ID**。

### 使用 Tailscale Terraform provider 配置联合身份

要使用 Tailscale Terraform provider 和 `tailscale_federated_identity` 资源配置联合身份：

```hcl
resource "tailscale_federated_identity" "example_federated_identity" {
  description = "Example federated identity"
  scopes      = ["auth_keys", "devices:core"]
  tags        = ["tag:test"]
  issuer      = "https://example.com"
  subject     = "example-sub-*"
  custom_claim_rules = {
    repo_name = "example-repo-name"
  }
}
```

更多信息请参阅 [Tailscale Terraform provider 文档][xt-terraform-tailscale-federated-identity-resource]。

### 使用 tailscale-client-go-v2 配置联合身份

要使用 `tailscale-client-go-v2` 配置联合身份：

```go
package main

import (
	"context"
	"os"

	"tailscale.com/client/tailscale/v2"
)

func main() {
	client := &tailscale.Client{
		// Client configuration
	}

	req := tailscale.CreateFederatedIdentityRequest {
		Description: "Example federated identity",
		Scopes:  []string{"auth_keys", "devices:core"},
		Tags:    []string{"tag:test"},
		Subject: "example-sub-*",
		CustomClaimRules: map[string]string{
			"repo_name": "example-repo-name",
		},
	}

	federatedIdentity, err := client.Keys().CreateFederatedIdentity(context.Background(), req)
}
```

更多信息请参阅 [`tailscale-client-go-v2`][xt-tailscale-client-go-v2]。

### 使用 Tailscale API 配置联合身份

要使用 Tailscale API 和 `https://api.tailscale.com/api/v2/tailnet/-/keys` 端点配置联合身份：

```shell
curl -X POST https://api.tailscale.com/api/v2/tailnet/-/keys \
  -H "Content-Type: application/json" \
  -d   '{
  "keyType": "federated",
  "description": "Example federated identity",
  "scopes": [
    "auth_keys",
    "devices:core"
  ],
  "tags": [
    "tag:test"
  ],
  "issuer": "https://example.com",
  "subject": "example-sub-*",
  "customClaimRules": {
    "repo_name": "example-repo-name",
  }'
```

更多信息请参阅[端点 API][co-api-post-keys]。

## 与 Tailscale 交换工作负载身份令牌

工作负载身份令牌必须与 Tailscale 交换，才能完成认证并获得 Tailscale 访问令牌。

以下客户端原生支持使用工作负载身份令牌交换进行认证：

* [Tailscale GitHub Action][ar-exchange-github-action]
* [Tailscale Terraform provider][ar-exchange-terraform-provider]
* [`tailscale-client-go-v2`][ar-exchange-tailscale-client-go-v2]
* [Tailscale API][ar-exchange-api]

工作负载身份还可用于在 tailnet 中[注册新节点][ar-register-new-nodes-using-workload-identity]。

### Tailscale GitHub Action

工作负载身份可用于认证 Tailscale GitHub action，方法是使用 `oauth-client-id`、`audience` 和 `tags` 参数：

```yaml
- name: Tailscale
  uses: tailscale/github-action@v4
  with:
    oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
    audience: ${{ secrets.TS_AUDIENCE }}
    tags: tag:ci
```

工作负载身份联合要求工作流具有 `id-token: write` [权限设置][xt-gh-permission-setting]：

```yaml
permissions:
  id-token: write # tailscale action 需要此项才能向 GitHub 请求 JWT
  # 你的工作流所需的其他权限
```

更多信息请参阅 [GitHub action][xt-github-action]。

### Tailscale Terraform provider

工作负载身份可用于认证 Tailscale Terraform provider，方法是使用 `oauth_client_id` 和 `id_token` provider 参数：

```hcl
provider "tailscale" {
  oauth_client_id = "my_client_id"
  identity_token  = "my_identity_token"
  tailnet         = "example.com"
}
```

更多信息请参阅 [Tailscale Terraform provider][xt-terraform-tailscale]。

### tailscale-client-go-v2

工作负载身份可用于认证 `tailscale-client-go-v2`，方法是向 `tailscale.Client` 提供 `ClientID` 和 `IDTokenFunc`：

```go
package main

import (
	"context"
	"os"

	"tailscale.com/client/tailscale/v2"
)

func main() {
	client := &tailscale.Client{
		Tailnet: os.Getenv("TAILSCALE_TAILNET"),
		Auth: &tailscale.IdentityFederation{
			ClientID: os.Getenv("TAILSCALE_OAUTH_CLIENT_ID"),
			IDTokenFunc: func() (string, error) {
				return os.Getenv("IDENTITY_TOKEN"), nil
            },
		},
	}

	// Example API call
	devices, err := client.Devices().List(context.Background())
}
```

更多信息请参阅 [`tailscale-client-go-v2`][xt-tailscale-client-go-v2]。

### 令牌交换 API

Tailscale 令牌交换端点是 `https://api.tailscale.com/api/v2/oauth/token-exchange`。

当你需要一个短期的 Tailscale 访问令牌时，向 Tailscale 令牌交换端点发起请求：

```shell
curl -X POST https://api.tailscale.com/api/v2/oauth/token-exchange \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=<CLIENT_ID>" \
  -d "jwt=<JWT>"
```

* `<CLIENT_ID>`：你在 Tailscale 管理控制台中配置联合身份时生成的 client ID。
* `<JWT>`：云提供商提供给工作负载的签名 OIDC JWT。

如果 client ID 和 JWT 有效，并且与配置的 audience、subject 和自定义 claim 规则匹配，Tailscale 会返回一个短期 API 令牌，用于向 Tailscale API 认证该工作负载。

如果短期 API 令牌过期，你可以重复此步骤以获取新令牌。

### 调试令牌交换错误

联合身份的最新令牌交换错误详情可以在管理控制台中查看。

1. 打开管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面。

2. 使用 **Search** 和（可选的）**Filters** 功能找到你关注的联合身份。

   * 按 `tag` 搜索可能有用。
   * 把 **Filters** 值设为 **Client type** 并选择 **OIDC** 也可能有帮助。

3. 选择  菜单并选择 **View** 或 **Edit**。

错误信息会显示在此页面上，具体指引视错误类型而定。

只有当该联合身份的令牌交换成功后，错误才会被清除。

#### API 错误响应

从令牌交换 API 端点返回的错误不会在错误消息中直接包含具体的调试信息。

这是为了防止信息泄露给潜在的恶意行为者——否则，如果他们知道你联合身份的 client ID，就可能尝试从错误消息中逆向推导出你的联合身份配置。

错误消息会改为包含一个直达管理控制台中该联合身份的链接，消息格式如下：

```json
{ "message": "Unauthorized. Visit [link to admin console] for details" }
```

错误信息会显示在此页面上，具体指引视错误类型而定。

只有当该联合身份的令牌交换成功后，错误才会被清除。

## 使用工作负载身份注册新节点

> **注意：**
>
> 设备必须运行 Tailscale v1.90.1 或更高版本才支持 `--client-id` 和 `--id-token` 标志。

你可以在 [`tailscale up`][docs-tailscale-up] 中直接使用 client ID 和 OIDC 令牌来注册新节点：

```shell
tailscale up --client-id=${CLIENT_ID} --id-token=${IDENTITY_TOKEN} --advertise-tags=tag:ci
```

`tailscale up` 命令要求 `client-id` 是用于工作负载身份联合生成认证密钥的 Client ID。访问管理控制台以[检索 **Client ID**][ar-retrieve-the-client-id-in-the-admin-console]。

该命令还要求 `id-token` 是来自身份提供方、用于与控制服务器（control server）交换工作负载联合的 ID 令牌。这个值是签名后的 OIDC JWT，而不是短期 API 令牌。

工作负载身份凭证必须具有 `auth_keys` 作用域，并且传给 `--advertise-tags` 的[标签（tag）][docs-tags]必须与你在[配置联合身份][ar-set-up]时选择的标签一致。

`--client-id` 标志还可以接受额外的 URL 风格参数：

```shell
tailscale up --client-id='${CLIENT_ID}?ephemeral=false&preauthorized=true' --id-token=${IDENTITY_TOKEN} --advertise-tags=tag:ci
```

可用参数有：

* `ephemeral`：注册为[临时节点（ephemeral node）][docs-ephemeral-nodes]（默认为 `true`）
* `preauthorized`：跳过手动[设备审批][docs-device-approval]（默认为 `false`）

### 自动发现并交换云端令牌

> **注意：**
>
> 设备必须运行 Tailscale v1.94.0 或更高版本才支持 `--audience` 标志。

Tailscale 能够自动检测某些云环境和 CI 环境，并从其运行的平台获取原生身份令牌。启用后，客户端会使用该令牌，通过**工作负载身份联合**把节点认证到你的 tailnet，无需你手动预配或管理凭证。

此功能面向**非交互式工作负载**，例如云虚拟机、容器化服务和 CI/CD 流水线——在这些场景中，身份应从执行环境本身派生。

不会在磁盘上存储任何长期凭证、访问密钥或机密，也不会在运行时注入。

要启用此行为，向 [`tailscale up`][docs-tailscale-up] 传入 client ID 和 audience：

```shell
tailscale up --client-id=${CLIENT_ID} --audience=${AUDIENCE} --advertise-tags=tag:ci
```

该命令要求 `audience` 是 `client-id` 所指联合身份的信任配置中指定的 audience。

#### 支持的环境

自动令牌发现要求平台上存在原生工作负载身份，并且 Tailscale 中存在匹配的[信任配置][ar-set-up]。配置完成后，Tailscale 客户端将在下述平台上代你获取提供商令牌。

**AWS**

**工作负载环境**

* 工作负载运行在支持 IAM 角色的 AWS 服务上，例如 Elastic Cloud Compute（EC2）、Elastic Container Service（ECS）或 Elastic Kubernetes Service（EKS）。
* 实例、任务或 Pod 上附加了一个 IAM 角色。

**IAM 配置**

* IAM 角色必须允许从 AWS Security Token Service（STS）签发 web 身份令牌。
* 角色的信任策略必须允许所配置的 web 身份提供商。

```json
{
"Version": "2012-10-17",
  "Statement": [
  {
    "Sid": "AllowGetWebIdentityTokenForTailscale",
    "Effect": "Allow",
    "Action": "sts:GetWebIdentityToken",
    "Resource": "*",
    "Condition": {
      "ForAnyValue:StringEquals": {
        "sts:IdentityTokenAudience": "{YOUR_TAILSCALE_AUDIENCE}"
      },
      "NumericLessThanEquals": {
        "sts:DurationSeconds": "300"
      }
    }
  }
  ]
}
```

**Tailscale 配置**

* Tailscale 中存在一个工作负载身份联合配置，它：
  * 信任 AWS 令牌 issuer。
  * 期望正确的 audience（`aud`）。
  * 匹配任何所需的角色或环境特定的 claims。

**Google Cloud**

**工作负载环境**

* 工作负载运行在暴露元数据服务器的 Google Cloud Platform（GCP）服务上，例如 Google Compute Engine（GCE）或 Google Kubernetes Engine（GKE）。
* 虚拟机或工作负载附加了一个**服务账号**。

**IAM 配置**

* 必须允许服务账号签发身份令牌。
* 必须允许工作负载为所配置的 audience 请求身份令牌。

**Tailscale 配置**

* Tailscale 中存在一个工作负载身份联合配置，它：
  * 信任 GCP 令牌 issuer。
  * 期望所配置的 audience。
  * 可选地匹配服务账号特定的 claims。

**GitHub Actions**

**工作流配置**

* 工作流运行在支持 OIDC 的 GitHub 托管或自托管 runner 上。
* 工作流显式启用了 OIDC 令牌签发：

```yaml
permissions:
  id-token: write
```

**仓库或组织配置**

* 仓库或组织已启用 OIDC 令牌签发。
* 任何分支、环境或仓库限制都与预期的令牌 claims 一致。

**Tailscale 配置**

* Tailscale 中存在一个工作负载身份联合配置，它：
  * 信任 GitHub Actions OIDC issuer。
  * 匹配预期的 audience、仓库和工作流 claims。

**不支持的环境**

如果客户端未检测到受支持的平台，将跳过自动令牌发现，并回退到手动工作负载身份联合配置。

## 参考

以下小节提供有关 claims 的技术细节。

### 常见云服务商的令牌格式

各云服务商签发的 OIDC 令牌在 `sub` claim 和自定义 claims 上有各自独特的格式。以下列出一些常见云服务商及其 OIDC 令牌的格式。

#### AWS

##### 主题格式

请求该令牌的 IAM 主体的 ARN。请参阅 [AWS token claims][xt-aws-token-claims]。

##### 令牌 claims

请参阅 [AWS token claims][xt-aws-token-claims]。

#### GitHub Actions

##### 主题格式

请参阅 [GitHub subject format][xt-gh-subject-format]。

##### 令牌 claims

请参阅 [GitHub token claims][xt-gh-token-claims]。

#### Google Cloud

##### 主题格式

与你实例关联的服务账号的唯一 ID。请参阅 [Google Cloud token claims][xt-gcp-token-claims]。

##### 令牌 claims

请参阅 [Google Cloud token claims][xt-gcp-token-claims]。

#### Microsoft Azure

##### 主题格式

请参阅 [Microsoft Azure token claims][xt-azure-token-claims]。

##### 令牌 claims

请参阅 [Microsoft Azure token claims][xt-azure-token-claims]。

### claim 值的格式

为 **subject** 和**自定义 claims** 指定的值会与 OIDC JWT 中的 claim 值进行匹配。

值中可以包含 `*` 来匹配任意字符。指定的其他字符必须与 claim 值直接匹配。

例如，为 subject 指定 `my-example-sub/*` 将成功匹配以 `my-example-sub/` 开头的 `sub` claim。

### 自定义 claim 键的格式

**自定义 claims** 的键指定 OIDC JWT 中要匹配的 claim。

例如，给定如下形式的令牌：

```json
{
	"sub": "123456-example",
	"iss": "https://example.com",
	"aud": "api.tailscale.com/12345-67890",
	"user": "example"
}
```

可以通过把键指定为 `user` 来引用 `user` claim。

#### 嵌套 claim

键可以通过用句点分隔嵌套键名来引用 JWT 中的嵌套 claim。

例如，给定如下形式的令牌：

```json
{
	"sub": "123456-example",
	"iss": "https://example.com",
	"aud": "api.tailscale.com/12345-67890",
	"user": "example",
	"user": {
		"name": "foobar"
	}
}
```

可以通过把键指定为 `user.name` 来引用嵌套的 `name` claim。

#### 转义 claim 名称

名称中含句点的键可以用双引号包裹来转义。

例如，给定如下形式的令牌：

```json
{
	"sub": "123456-example",
	"iss": "https://example.com",
	"aud": "api.tailscale.com/12345-67890",
	"user": "example",
	"open.id": {
		"username": "foobar"
	}
}
```

`open.id` 键可以写成 `"open.id"`，嵌套的 `username` 键可以写成 `"open.id".username`。

### 生成的 audience 格式

Tailscale 生成的 audience 值格式为：`api.tailscale.com/<client ID>`。

例如，client ID 为 `Tz8TefihCR11EXAMPLE-kZDRvszg8621EXAMPLE` 的联合身份，其生成的 audience 为 `api.tailscale.com/Tz8TefihCR11EXAMPLE-kZDRvszg8621EXAMPLE`

## 限制

* 为你的工作负载提供签名 JWT 的 issuer 必须可公开访问。

[ar-common-cloud-provider-token-formats]: #常见云服务商的令牌格式

[ar-configure-admin-console]: #在管理控制台中配置联合身份

[ar-configure-api]: #使用-tailscale-api-配置联合身份

[ar-configure-terraform-provider]: #使用-tailscale-terraform-provider-配置联合身份

[ar-configure-tailscale-client-go-v2]: #使用-tailscale-client-go-v2-配置联合身份

[ar-exchange-api]: #令牌交换-api

[ar-exchange-github-action]: #tailscale-github-action

[ar-exchange-tailscale-client-go-v2]: #tailscale-client-go-v2

[ar-exchange-terraform-provider]: #tailscale-terraform-provider

[ar-retrieve-the-client-id-in-the-admin-console]: #在管理控制台中检索-client-id

[ar-register-new-nodes-using-workload-identity]: #使用工作负载身份注册新节点

[ar-set-up]: #设置联合身份

[co-api-post-keys]: https://tailscale.com/api#tag/keys/POST/tailnet/{tailnet}/keys

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-tags]: /docs/features/tags

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[docs-trust-credentials-scopes]: /docs/reference/trust-credentials#scopes

[xt-aws-token-claims]: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_outbound_token_claims.html

[xt-gh-subject-format]: https://docs.github.com/en/actions/reference/security/oidc#example-subject-claims

[xt-gh-token-claims]: https://docs.github.com/en/actions/reference/security/oidc#oidc-token-claims

[xt-gcp-token-claims]: https://cloud.google.com/compute/docs/instances/verifying-instance-identity#token_format

[xt-azure-token-claims]: https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference#payload-claims

[xt-terraform-tailscale]: https://registry.terraform.io/providers/tailscale/tailscale/latest

[xt-terraform-tailscale-federated-identity-resource]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/federated_identity

[xt-tailscale-client-go-v2]: https://github.com/tailscale/tailscale-client-go-v2

[xt-github-action]: https://github.com/tailscale/github-action

[xt-gh-permission-setting]: https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-cloud-providers#adding-permissions-settings
