---
title: "OAuth 客户端"
description: "使用 OAuth 客户端为 Tailscale API 提供持续访问能力。"
---

最后验证于 Jun 30, 2026

OAuth 客户端使用 [OAuth 2.0 协议][xt-rfc-6749]的[客户端凭证流程][xt-rfc-6749-4.4]，为 [Tailscale API][docs-api] 提供持续访问能力。

## 工作原理

你创建一个 OAuth 客户端，在其中定义客户端应用使用 Tailscale API 时允许的[作用域][docs-trust-credentials-scopes]。例如作用域 `dns:read` 授予对 tailnet DNS 设置的只读访问；又如 `devices:core` 作用域，授予读取和写入 tailnet 设备列表、授权或移除机器、以及操作设备上标签的权限。

Tailscale 会把作用域限制为一次操作所需的必要 Tailscale API 端点。例如，持有 `dns:read` 作用域的令牌只能访问以下 Tailscale API 端点：

* `GET /api/v2/tailnet/:tailnet/dns/nameservers`
* `GET /api/v2/tailnet/:tailnet/dns/preferences`
* `GET /api/v2/tailnet/:tailnet/dns/searchpaths`
* `GET /api/v2/tailnet/:tailnet/keys/:keyID`（仅限其自身）

一个 OAuth 客户端由客户端 ID 和客户端密钥组成。创建 OAuth 客户端时，Tailscale 会为你生成这两者。在客户端应用中，使用客户端 ID 和客户端密钥向 [Tailscale OAuth 令牌端点][ar-tailscale-oauth-token-endpoint]请求 API 访问令牌，再用该访问令牌调用 Tailscale API。访问令牌只授予你创建 OAuth 客户端时定义的作用域内的权限。

API 访问令牌会在一小时后过期。要持续访问，请在令牌即将过期前，向 Tailscale OAuth 令牌端点请求一个新的 API 访问令牌。

主流编程语言的 OAuth 客户端库都能处理 API 访问令牌的生成与续期。

Tailscale 的 OAuth 实现遵循 [OAuth 2.0 协议][xt-rfc-6749]。

## 前提条件

你需要是 tailnet 的 [Owner（所有者）、Admin（管理员）、Network admin（网络管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能创建、撤销或删除 OAuth 客户端。

Owner 和 Admin 可以用 tailnet 中任意作用域和任意[标签][docs-tags]创建 OAuth 客户端。其他用户只能使用自己有权限的作用域和标签创建 OAuth 客户端。例如，Network admin 无法授予 `devices:core` 作用域，而 IT admin 可以。

## 设置 OAuth 客户端

1. 打开管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面。

2. 选择 **Credential** 按钮。

3. 选择 **OAuth**。

4. 选择新 OAuth 客户端创建的令牌可执行的一组操作。对每个操作，选择 **Read** 或 **Write**。各操作的说明参见 [Scopes][docs-trust-credentials-scopes]。

5. 选择 **Generate credential**。

6. 在 **Credential created** 页面上，你可以查看新 OAuth 客户端的 ID 和密钥。请把客户端 ID 和密钥都复制下来，客户端代码会用到它们。注意：关闭 **Credential created** 页面后，你将无法再次复制该密钥。

   > **注意：**
   >
   > 请妥善保管客户端密钥。

   *（图：管理控制台中的"Generate OAuth client"页面）*

7. 选择 **Done**。

   你的 OAuth 客户端现已配置完成。配置你的 OAuth 客户端应用时使用该客户端 ID 和密钥。注意，Tailscale 生成的 OAuth 客户端密钥区分大小写。

如果某个用户创建了 OAuth 客户端，即使该用户此后不再拥有该 tailnet 的访问权，OAuth 客户端仍会继续工作并生成 API 访问令牌。管理员可以在管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面访问所有已配置的 OAuth 客户端。

## Tailscale OAuth 令牌端点

Tailscale OAuth 令牌端点为 `https://api.tailscale.com/api/v2/oauth/token`。

需要 API 访问令牌时，向 Tailscale OAuth 令牌端点发起请求。该端点接受符合 OAuth 2.0 客户端凭证授予[请求格式][xt-rfc-6749-4.4.2]的请求，并返回符合 OAuth 2.0 客户端凭证授予[响应格式][xt-rfc-6749-4.4.3]的响应。

对 OAuth 令牌端点的请求可以包含 `scope` 和 `tags` 请求参数，分别指定以空格分隔的所请求作用域与[标签][docs-tags]列表。OAuth 客户端必须有权授予所请求的作用域和标签。例如，拥有 `all` 作用域（同时授予所有其他作用域及所有设备标签）的 OAuth 客户端，可以请求带有 `devices:core` 作用域和 `tag:server` 标签的访问令牌。

标签只对带有 `devices:core`、`auth_keys` 或 `all` 作用域的令牌有意义。若这些作用域都不存在，OAuth 客户端会忽略标签。`tags` 参数不属于 OAuth 2.0 规范，并非所有客户端都支持它。

## OAuth 客户端库

主流编程语言都提供了配合 OAuth 客户端使用的 OAuth 客户端库，例如：

* Go：`clientcredentials` [访问页面 →][xt-go-oauth2-credentials]
* Node：`OAuth2` [访问页面 →][xt-gh-node-oauth]
* PHP：`ClientCredentials.php` [访问页面 →][xt-gh-oauth2-client-clientcredentials]
* Ruby：`client_credentials.rb` [访问页面 →][xt-gitlab-oauth2]
* Rust：`Client Credentials Grant` [访问页面 →][xt-rust-auth]

例如，下面的 Go 代码展示如何创建一个 OAuth 客户端对象，用你的客户端 ID 和客户端密钥生成 API 访问令牌，用于调用 Tailscale API：

```go
package main

import (
        "context"
        "fmt"
        "io/ioutil"
        "log"
        "os"

        "golang.org/x/oauth2/clientcredentials"
)

func main() {
        var oauthConfig = &clientcredentials.Config{
                ClientID:     os.Getenv("OAUTH_CLIENT_ID"),
                ClientSecret: os.Getenv("OAUTH_CLIENT_SECRET"),
                TokenURL:     "https://api.tailscale.com/api/v2/oauth/token",
        }

        client := oauthConfig.Client(context.Background())
        // Replace example.com with your tailnet ID.
        resp, err := client.Get("https://api.tailscale.com/api/v2/tailnet/example.com/devices")
        if err != nil {
                log.Fatalf("error getting keys: %v", err)
        }

        body, err := ioutil.ReadAll(resp.Body)
        if err != nil {
                log.Fatalf("error reading response body: %v", err)
        }

        fmt.Printf("response: %s", string(body))
}
```

该示例要求你定义环境变量 `OAUTH_CLIENT_ID` 和 `OAUTH_CLIENT_SECRET`，取值分别设置为[设置 OAuth 客户端][ar-setting-up-an-oauth-client]时创建的 **Client ID** 与 **Client secret**。

## 验证你能否生成 API 访问令牌

[设置 OAuth 客户端][ar-setting-up-an-oauth-client]之后，你可以向 [Tailscale OAuth 令牌端点][ar-tailscale-oauth-token-endpoint]发起一次 `curl` 请求，确认自己能够生成 API 访问令牌。

```shell
 curl -d "client_id=${OAUTH_CLIENT_ID}" -d "client_secret=${OAUTH_CLIENT_SECRET}" \
     "https://api.tailscale.com/api/v2/oauth/token"
```

该示例要求你定义环境变量 `OAUTH_CLIENT_ID` 和 `OAUTH_CLIENT_SECRET`，取值分别设置为你的 **Client ID** 与 **Client secret**。

下面是一个展示 API 访问令牌的示例响应：

```json
{"access_token":"tskey-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ","token_type":"Bearer","expires_in":3600,"scope":"devices"}
```

## 生成长期认证密钥

你无法生成长期的[认证密钥][docs-auth-keys]（auth key），因为密钥会在 90 天后过期；一次性密钥则在首次使用时立即失效。

作为长期认证密钥的替代方案，你可以创建一个带 `auth_keys` 作用域的 OAuth 客户端，并按需用它调用 [`/api/v2/tailnet/:tailnet/keys`][co-api-update-device-key] API 方法（`POST` 请求）生成新的认证密钥。创建带 `auth_keys` 作用域的 OAuth 客户端时，你必须选择一个或多个[标签][docs-tags]，可以是 tailnet 中任意标签或标签组合。你也必须在 API 调用中指定这些标签。

例如，要给设备打上 `tag:server` 这样的特定标签，就创建一个带 `tag:server` 的 OAuth 客户端，并在创建认证密钥时把 `tag:server` 指定为该密钥的标签。

或者，如果你需要一个支持多个标签的 OAuth 客户端，请设置[标签所有权][docs-tags-ownership]。例如，要给一部分设备打 `tag:server`、另一部分打 `tag:database`：

1. 为 `tag:server` 和 `tag:database` 都设置一个标签所有者 `tag:terraform-tag-owner`：

   ```json
   {
     "tagOwners": {
       "tag:terraform-tag-owner": ["<your-email-address>"],
       "tag:server": ["tag:terraform-tag-owner"],
       "tag:database": ["tag:terraform-tag-owner"],
     },
   }
   ```

2. 创建一个带标签 `tag:terraform-tag-owner` 的 OAuth 客户端。

3. 用该 OAuth 客户端生成认证密钥，并把 `tag:server` 或 `tag:database` 指定为密钥的标签。

## tailnet ID 的简写

使用访问令牌发起 API 调用时，可以选择用值 `-` 作为 [tailnet ID][docs-tailnet-name-tailnet-id]。你可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面找到自己的 tailnet ID。你不指定 tailnet ID 也可以。

例如，这条命令：

```shell
curl -u $ACCESS_TOKEN: "https://api.tailscale.com/api/v2/tailnet/example.com/devices"
```

等价于：

```shell
curl -u $ACCESS_TOKEN: "https://api.tailscale.com/api/v2/tailnet/-/devices"
```

前提是访问令牌归属于 `example.com` 这个 tailnet。

你也可以用 `-H` 选项把访问令牌放进请求头：

```shell
curl -H "Authorization: Bearer $ACCESS_TOKEN" "https://api.tailscale.com/api/v2/tailnet/-/devices"
```

## 使用 OAuth 凭证注册新节点

你可以在 [`tailscale up`][docs-tailscale-up] 中直接使用 OAuth 密钥来注册新节点：

```shell
tailscale up --auth-key=${OAUTH_CLIENT_SECRET} --advertise-tags=tag:ci
```

OAuth 客户端必须带有 `auth_keys` 作用域。[创建客户端][ar-setting-up-an-oauth-client]时，你要为该作用域指定一个或多个[标签][docs-tags]，并且必须把其中至少一个标签传给 `--advertise-tags` 旗标。

> **注意：**
>
> 用 OAuth 客户端凭证注册的设备归属标签。若要预配携带单个用户身份的设备，请参阅[使用 OAuth 应用进行设备预配][docs-device-provisioning]。

`--auth-key` 旗标配合 OAuth 密钥使用时，还可以接受额外的 URL 风格参数：

```shell
tailscale up --auth-key='${OAUTH_CLIENT_SECRET}?ephemeral=false&preauthorized=true' --advertise-tags=tag:ci
```

可用参数如下：

* `ephemeral`：注册为[临时节点][docs-ephemeral-nodes]（默认为 `true`）
* `preauthorized`：跳过手动[设备审批][docs-device-approval]（默认为 `false`）
* `baseURL`：Tailscale API 的基础 URL（默认为 `https://api.tailscale.com`）

## get-authkey 工具

`get-authkey` 工具基于包含 OAuth 客户端 ID 和密钥取值的环境变量，向 `stdout` 返回一个新的认证密钥。可以用 `get-authkey` 为脚本或其他自动化流程生成认证密钥。

从 OAuth 客户端创建的所有认证密钥都必须使用[标签][docs-tags]。你可以选择向 `get-authkey` 传入参数，指定[密钥类型][docs-auth-keys-types]为临时、可复用和/或预授权。

> **警告：**
>
> `get-authkey` 需要 Go 1.23 或更高版本。

直接构建并运行 `get-authkey`：

1. 设置以下环境变量：

   * `TS_API_CLIENT_ID`：你的 tailnet 的 OAuth 客户端 ID。
   * `TS_API_CLIENT_SECRET`：你的 tailnet 的 OAuth 客户端密钥。

   ```shell
   export TS_API_CLIENT_ID=<clientID> TS_API_CLIENT_SECRET=<secret>
   ```

2. 运行：

   ```shell
   go run tailscale.com/cmd/get-authkey@latest -tags tag:development
   ```

你可以传入以下参数：

* `-tags`：必需。把以逗号分隔的标签列表应用到认证密钥。
* `-reusable`（可选）：分配可复用的认证密钥。未设置时默认为 false。
* `-ephemeral`（可选）：分配临时认证密钥。未设置时默认为 false。
* `-preauth`（可选）：将认证密钥分配为预授权密钥。未设置时默认为 true。

例如：

```shell
go run tailscale.com/cmd/get-authkey@latest -reusable -tags tag:development
```

另一种方式是下载 `get-authkey` 源码，从本地仓库运行：

1. 克隆 [`tailscale/tailscale`][xt-gh-tailscale-repo] 仓库。
2. 打开命令提示符，切换到本地 `tailscale/` 目录的根目录。
3. 运行 `get-authkey`：

   ```shell
   go run ./cmd/get-authkey/main.go -tags tag:development
   ```

## 作用域

有关作用域的信息已迁移至 [trust credentials][docs-trust-credentials-scopes] 主题。

## 旧版作用域

有关旧版作用域的信息已迁移至 [trust credentials][docs-trust-credentials-legacy-scopes] 主题。

## 限制

* OAuth 客户端必须由 tailnet 持有，而不能由单个用户持有。
* OAuth 访问令牌在 1 小时后过期，该时长不可修改。

[ar-setting-up-an-oauth-client]: #设置-oauth-客户端

[ar-tailscale-oauth-token-endpoint]: #tailscale-oauth-令牌端点

[co-api-update-device-key]: https://tailscale.com/api#tag/devices/POST/device/%7BdeviceId%7D/key

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys-types]: /docs/features/access-control/auth-keys#types-of-auth-keys

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-device-provisioning]: /docs/features/oauth-apps/device-provisioning

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-tags-ownership]: /docs/features/tags#ownership

[docs-tags]: /docs/features/tags

[docs-tailnet-name-tailnet-id]: /docs/concepts/tailnet-name#tailnet-id

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[docs-trust-credentials-legacy-scopes]: /docs/reference/trust-credentials#legacy-scopes

[docs-trust-credentials-scopes]: /docs/reference/trust-credentials#scopes

[xt-gh-node-oauth]: https://github.com/ciaranj/node-oauth#oauth20

[xt-gh-oauth2-client-clientcredentials]: https://github.com/thephpleague/oauth2-client/blob/master/src/Grant/ClientCredentials.php

[xt-gh-tailscale-repo]: https://github.com/tailscale/tailscale

[xt-gitlab-oauth2]: https://gitlab.com/oauth-xx/oauth2/blob/main/lib/oauth2/strategy/client_credentials.rb

[xt-go-oauth2-credentials]: https://pkg.go.dev/golang.org/x/oauth2/clientcredentials

[xt-rfc-6749-4.4.2]: https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4.2

[xt-rfc-6749-4.4.3]: https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4.3

[xt-rfc-6749-4.4]: https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4

[xt-rfc-6749]: https://www.rfc-editor.org/rfc/rfc6749.html

[xt-rust-auth]: https://docs.rs/oauth2/latest/oauth2/#client-credentials-grant
