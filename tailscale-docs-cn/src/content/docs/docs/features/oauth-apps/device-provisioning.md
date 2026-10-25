---
title: "使用 OAuth 应用进行设备预配"
description: "使用 OAuth 应用进行设备预配，让内网工具能够代表单个用户预配 tailnet 设备。与创建标签归属设备的方法不同，它使用标准 OAuth 2.0 授权码流程创建携带授权用户完整身份的设备。"
---

最后验证于 Jun 24, 2026

> **注意：** 使用 OAuth 应用进行设备预配目前处于 alpha 阶段。

使用 OAuth 应用进行设备预配，让内网工具能够代表单个用户预配 tailnet 设备。与创建标签归属设备的方法不同，它使用标准 OAuth 2.0 授权码流程创建携带授权用户完整身份的设备。访问控制规则、审计日志条目与设备配额都作用于授权该设备的用户，而不是某个共享的服务身份。

此流程只在单个 tailnet 内有效。OAuth 应用与每个完成授权流程的用户必须属于同一个 tailnet。来自其他 tailnet 的用户无法通过你的应用授权设备。

本页涉及两种角色：创建并配置 OAuth 应用的管理员，以及在自己的工具中实现授权码流程的开发者。该流程遵循 [RFC 6749 section 4.1][xt-rfc-6749]（授权码授予），因此标准 OAuth 库只需少量定制即可使用。

## 使用场景

使用 OAuth 应用进行设备预配支持以下场景。

* **内网开发者工具**：平台团队构建为单个开发者创建 tailnet 设备的工具。每台设备都携带开发者的身份，因此访问控制规则能正确生效，无需共享凭证。
* **带用户归因的自动化设备预配**：在预配工作流中，每台设备都需要与特定用户关联，用于审计日志与配额核算。
* **取代共享认证密钥模式**：从共享的或基于标签的认证密钥（auth key）迁移到按用户授权。每台设备都能追溯到授权它的用户，提升安全态势与可追溯性。

## 前提条件

开始之前，请确认你满足以下条件。

* 在 tailnet 中拥有 [Owner（所有者）](/docs/reference/user-roles)或[管理员（Admin）](/docs/reference/user-roles)角色。
* OAuth 应用与所有通过它授权设备的用户必须位于同一个 tailnet。此流程不支持来自其他 tailnet 的用户。
* 拥有带 admin 作用域的 API 访问令牌，用于通过 API 创建 OAuth 应用。
* 对实现该流程的开发者而言：需要具备 OAuth 2.0 授权码授予的工作知识，并能够处理 HTTP 重定向与令牌交换。

## 开始使用

设置使用 OAuth 应用的设备预配有若干个阶段。管理员先通过 [Tailscale API][docs-api] 创建 OAuth 应用（第 1-2 步），然后开发者在其工具中实现授权码流程（第 3-6 步）。

### 第 1 步：创建 OAuth 应用

向 Tailscale API 发送 `POST` 请求来创建 OAuth 应用。该请求定义用户完成授权确认后被重定向到哪里，以及应用请求什么作用域。只有当你打算设置 `node_attributes` 时才需要包含 `allowedNodeAttributes` 字段。

```shell
curl -X POST "https://api.tailscale.com/api/v2/tailnet/-/oauth-apps" \
  -u "<api-access-token>:" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "device-provisioner",
    "redirectUris": ["https://your-tool.internal.example.com/callback"],
    "scopes": ["auth_keys:create:once"],
    "allowedNodeAttributes": ["custom:provisioned"]
  }'
```

请求体接受以下字段。

| 字段                    | 类型             | 说明                                                                                                                                                                                                                       |
| :---------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                  | string           | OAuth 应用的显示名称。                                                                                                                                                                                                     |
| `redirectUris`          | array of strings | 用户同意或拒绝授权后被送往的 URI。                                                                                                                                                                                         |
| `scopes`                | array of strings | 应用请求的作用域。使用 `auth_keys:create:once`。                                                                                                                                                                           |
| `allowedNodeAttributes` | array of strings | （可选）可通过此 OAuth 应用分配给所预配设备的自定义节点属性。取值必须使用 `custom:` 前缀（例如 `custom:provisioned`）。只有自定义属性可以加入允许列表。                                                                     |

成功的响应包含应用凭证：

```json
{
  "id": "app-123456",
  "name": "device-provisioner",
  "clientSecret": "tskey-app-abc123-secretvalue",
  "redirectURIs": ["https://your-tool.internal.example.com/callback"],
  "scopes": ["auth_keys:create:once"]
}
```

`clientSecret` 的格式为 `tskey-app-<clientID>-<secret>`。客户端 ID 段对应 API 响应中的 `id` 字段。请妥善保管该密钥：API 只在创建时返回它，之后无法再次获取。

你通过 `allowedNodeAttributes` 显式加入允许列表的自定义节点属性，可以分配给通过此 OAuth 应用预配的设备。随后你可以在[设备态势][docs-device-posture]（device posture）条件与[授权][docs-node-attributes]（grant）中引用这些属性，按设备的预配方式控制访问。有关节点属性如何附加到设备的更多信息，请参阅[节点属性参考][docs-node-attributes]。

### 第 2 步：验证 OAuth 应用

创建 OAuth 应用后，使用创建响应中的应用 ID 查询 API，验证它确实存在：

```shell
curl -X GET "https://api.tailscale.com/api/v2/tailnet/-/oauth-apps/app-123456" \
  -u "<api-access-token>:"
```

确认响应包含正确的作用域与重定向 URI。

### 第 3 步：构建授权 URL

OAuth 应用创建完成后，开发者将授权流程集成到自己的工具中。第一步是构建一个授权 URL，把用户重定向到 Tailscale 的授权确认页。用户访问该 URL 时，Tailscale 会显示授权确认提示，请用户批准该应用。

授权 URL 使用以下格式：

```
https://login.tailscale.com/a/oauth_authorize?client_id=<client-id>&redirect_uri=<redirect-uri>&scope=auth_keys:create:once&state=<random-state>&response_type=code
```

该 URL 接受以下查询参数。

| 参数            | 说明                                                                                                                                                |
| :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client_id`     | OAuth 应用的客户端 ID。即客户端密钥中 `tskey-app-` 与第二个 `-` 之间的部分。                                                                         |
| `redirect_uri`  | 创建应用时注册的重定向 URI 之一。必须完全匹配。                                                                                                     |
| `scope`         | 要请求的作用域。使用 `auth_keys:create:once`。                                                                                                      |
| `state`         | 你的工具生成的唯一且不可猜测的值，用于防范 CSRF。你的回调处理程序需校验返回的 `state` 与该值一致。                                                   |
| `response_type` | 必须为 `code`。                                                                                                                                     |

### 第 4 步：处理用户授权与授权码

用户访问授权 URL 后，Tailscale 会显示授权确认页。接下来发生什么取决于用户的选择：

* **用户同意授权**：Tailscale 重定向到你的 `redirect_uri`，并以查询参数附带授权 `code` 与你的 `state` 参数：

  ```
  https://your-tool.internal.example.com/callback?code=<authorization-code>&state=<random-state>
  ```

* **用户拒绝授权**：Tailscale 重定向到你的 `redirect_uri`，并附带错误参数：

  ```
  https://your-tool.internal.example.com/callback?error=access_denied
  ```

在你的回调处理程序中，继续下一步之前先校验返回的 `state` 与你在第 3 步发送的值一致。这可以防范跨站请求伪造（CSRF）攻击。

### 第 5 步：用授权码换取访问令牌

向令牌端点发送 `POST` 请求，用授权码换取访问令牌。`redirect_uri` 必须与第 3 步使用的值一致。

```shell
curl -X POST "https://api.tailscale.com/api/v2/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=<authorization-code>" \
  -d "client_id=<client-id>" \
  -d "client_secret=tskey-app-<client-id>-<secret>" \
  -d "redirect_uri=https://your-tool.internal.example.com/callback"
```

如果你在第 1 步创建 OAuth 应用时选择包含 `allowedNodeAttributes`，请务必在 `POST` 请求中传入相应的 `node_attributes` 取值（以逗号分隔），指明应在此设备上设置哪些属性。此时你的请求负载如下：

```shell
curl -X POST "https://api.tailscale.com/api/v2/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=<authorization-code>" \
  -d "client_id=<client-id>" \
  -d "client_secret=tskey-app-<client-id>-<secret>" \
  -d "node_attributes=<node_attributes>" \
  -d "redirect_uri=https://your-tool.internal.example.com/callback"
```

成功的响应返回一个访问令牌：

```json
{
  "access_token": "<access-token>",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

响应不包含刷新令牌。访问令牌在 1 小时（3600 秒）后过期，且有效期不可配置。该令牌还是一次性的：在首次成功使用后，后端即拒绝它，即使它尚未过期。

### 第 6 步：将访问令牌用作认证密钥

第 5 步得到的访问令牌本身就是有效的认证密钥，你无需再单独调用 API 创建。直接传递该访问令牌即可在 tailnet 中注册设备：

```shell
tailscale up --auth-key=<access-token>
```

设备会继承授权该 OAuth 应用的用户的完整身份：

* 引用该用户的访问控制规则对此设备生效。
* 该设备的审计日志条目归属于该用户。
* 该设备计入该用户的设备配额。

这正是与 [OAuth 客户端凭证流程][docs-oauth-clients]的关键区别——后者需要单独的认证密钥步骤来创建标签归属的设备。而在这里，访问令牌本身就携带用户身份，一步到位地充当认证密钥。

## 一次性授权作用域

使用 OAuth 应用进行设备预配采用一次性授权，通过 `auth_keys:create:once` 作用域请求。每次授权确认只授予一个一次性的认证密钥，且令牌交换不返回刷新令牌。授权在首次使用时即被消耗，因此用户每预配一台新设备都要重新通过授权确认页。

该作用域适用于每次设备预配都是由用户主动发起的审慎操作的工具。

## 身份模型

此流程创建的是归属用户的设备：每台设备都携带通过授权确认页授权它的用户的完整身份。这是它与 [OAuth 客户端凭证流程][docs-oauth-clients]的根本区别——后者创建的是标签归属的设备。

| 行为                           | 授权码流程                     | OAuth 客户端凭证流程             |
| :----------------------------- | :----------------------------- | :------------------------------- |
| **设备归属**                   | 归属用户                       | 归属标签                         |
| **身份**                       | 完成授权的单个用户             | 服务身份（标签）                 |
| **访问控制执行**               | 应用基于用户的规则             | 应用基于标签的规则               |
| **审计日志**                   | 操作归属于单个用户             | 操作归属于标签或服务             |
| **设备配额**                   | 计入授权用户的配额             | 计入标签的配额                   |

以此方式预配的设备会出现在管理控制台中授权用户的设备列表里。引用该用户的访问控制规则（按邮箱、组成员身份或 autogroup）对此设备生效，审计日志条目会按名称标识该用户。

如果你出于安全、合规或运维问责的需要，要求设备可追溯到具体用户，请选择此流程而非客户端凭证流程。

## 作用域参考

使用 OAuth 应用进行设备预配使用以下作用域。

| 作用域                  | 说明                                                                                                                        |
| :---------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `auth_keys:create:once` | 允许应用创建一个认证密钥。不返回刷新令牌，用户每多预配一台设备都要重新授权。                                                 |

## 限制

* 授权仅限于单个 tailnet。只有与 OAuth 应用位于同一 tailnet 的用户才能通过它授权设备。来自其他 tailnet 的用户无法完成此流程。
* Tailscale 托管的授权确认页无法自定义。
* 一次性授权签发的是一次性访问令牌。用户每预配一台新设备都要通过授权确认页重新授权。

[docs-api]: /docs/reference/tailscale-api

[docs-device-posture]: /docs/features/device-posture

[docs-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-oauth-clients]: /docs/features/oauth-clients

[xt-rfc-6749]: https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1
