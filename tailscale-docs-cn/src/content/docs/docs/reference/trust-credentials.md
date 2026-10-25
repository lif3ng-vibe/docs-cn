---
title: "信任凭证"
description: "使用信任凭证为 Tailscale API 提供持续的细粒度访问。"
---

最后验证于 Jan 30, 2026

信任凭证（trust credentials）为 [Tailscale API][docs-api] 提供了一种委托式、限定范围的访问框架。信任凭证会为限定范围的 API 访问创建访问令牌，而不是使用一种拥有全部权限、90 天后过期（如果该全权限访问令牌设置了更短有效期则更早过期）的访问令牌。

信任凭证支持[最小权限原则][ln-principle-of-least-privilege]：它允许你通过 scope 对授予凭证的访问进行细粒度控制，而全权限访问令牌则会对整个 Tailscale API 授予完整访问权限。

信任凭证有两种形式：[OAuth 客户端][docs-oauth-clients]与[联合 OIDC 工作负载身份][docs-workload-identity]（简称联合身份）。

## OAuth 客户端与联合身份的区别

OAuth 客户端与联合身份在使用方式以及外部系统中所需的额外配置方面存在诸多差异。
下表列出了这些差异，有助于你判断哪种方案更适合你的用例。

OAuth 客户端
联合身份

安全使用

OAuth 客户端需要使用一个长期有效的客户端密钥（client secret）来生成 Tailscale 访问令牌。
该长期密钥必须妥善保管，因为在被吊销之前，它可以无限次地用于生成访问令牌。

联合身份不需要存储长期有效的机密信息。
它们改而要求与第三方系统建立信任关系，并使用该系统生成的短期身份令牌来创建 Tailscale 访问令牌。

所需配置

OAuth 客户端无需任何额外配置或外部集成即可生成凭证。
生成 Tailscale 访问令牌只需要创建 OAuth 客户端时生成的客户端 ID（client ID）和客户端密钥（client secret）。

联合身份需要在 Tailscale 与能够生成符合 OIDC 标准的 JWT 身份令牌的第三方系统之间建立信任关系，用这些令牌换取 Tailscale 访问令牌。
并非所有希望以细粒度范围访问令牌访问 Tailscale API 的场景，都支持为工作负载身份联合生成这类 JWT 身份令牌。

两种形式的信任凭证共有的信息如下。

## 权限范围（scopes）

> **注意：**
>
> 我们的 scope 已经更新，每个 scope 现在关联了更细粒度的权限。原先的一组 scope 见[旧版 scope 一节][ar-legacy-scopes]。

scope 定义了由你的信任凭证创建的 API 访问令牌可以执行哪些操作。

除下面列出的端点外，所有 scope 都允许访问 `GET /api/v2/tailnet/:tailnet/keys/:keyID`（针对使用中的密钥本身）。

你可以在 Tailscale 信任凭证中使用以下 scope：

Scope ID
说明
允许的端点

all:read
该凭证对 tailnet 拥有只读访问权限。此 scope 并不局限于凭证初次授权时已存在的 API 的只读访问——all:read scope 同样授予对未来新建 API 的读取权限。all 与 all:read 是仅有的两个能列出 tailnet 中全部访问令牌的 scope。

所有 `*:read` 端点，包括凭证初次授权时尚不存在的端点。
GET /api/v2/tailnet/:tailnet/keys/:keyID (for any key, not just itself)

all
该凭证对 tailnet 拥有完全访问权限。此 scope 并不局限于凭证初次授权时已存在的 API——all scope 同样授予对未来新建 API 的访问权限。all 与 all:read 是仅有的两个能列出 tailnet 中全部访问令牌的 scope。

所有端点，包括凭证初次授权时尚不存在的端点。
GET, DELETE /api/v2/tailnet/:tailnet/keys/:keyID (for any key, not just itself)

dns:read

该凭证可以读取 DNS 设置。

GET /api/v2/tailnet/:tailnet/dns/nameservers

GET /api/v2/tailnet/:tailnet/dns/preferences

GET /api/v2/tailnet/:tailnet/dns/searchpaths

GET /api/v2/tailnet/:tailnet/dns/split-dns

dns

该凭证可以读取和操作 DNS 设置。

dns:read 中的端点

POST /api/v2/tailnet/:tailnet/dns/nameservers

POST /api/v2/tailnet/:tailnet/dns/preferences

POST /api/v2/tailnet/:tailnet/dns/searchpaths

PATCH, PUT /api/v2/tailnet/:tailnet/dns/split-dns

policy\_file:read

该凭证可以读取和校验 tailnet 策略文件。
使用此 scope 时需要 devices:posture\_attributes:read 与 devices:core:read。

GET /api/v2/tailnet/:tailnet/acl

POST /api/v2/tailnet/:tailnet/acl/preview

POST /api/v2/tailnet/:tailnet/acl/validate

policy\_file

该凭证可以读取、校验和修改 tailnet 策略文件。
使用此 scope 时需要 devices:posture\_attributes 与 devices:core:read。

policy\_file:read 中的端点

POST /api/v2/tailnet/:tailnet/acl

users:read

该凭证可以读取用户信息。

GET /api/v2/tailnet/:tailnet/users

GET /api/v2/user/:userID

users

该凭证可以读取用户信息、修改用户角色，以及处理用户的批准、停用、删除和恢复。

user:read 中的端点

POST /api/v2/user/:userID/role

POST /api/v2/user/:userID/approve

POST /api/v2/user/:userID/suspend

POST /api/v2/user/:userID/restore

POST /api/v2/user/:userID/delete

devices:core:read

该凭证可以读取 tailnet 中的设备。

GET /api/v2/tailnet/:tailnet/devices

GET /api/v2/device/:deviceID

devices:core

该凭证可以读取 tailnet 中所有设备的列表、批准或移除机器，以及操作设备上的标签。使用 devices:core scope 创建凭证时，你必须选择一个或多个标签。用该凭证创建的认证密钥（auth key）必须带有完全相同的标签，或带有属于该凭证标签的标签

devices:core:read 中的端点

DELETE /api/v2/device/:deviceID

POST /api/v2/device/:deviceID/authorized

POST /api/v2/device/:deviceID/expire

POST /api/v2/device/:deviceID/ip

POST /api/v2/device/:deviceID/name

POST /api/v2/device/:deviceID/key

POST /api/v2/device/:deviceID/tags

devices:posture\_attributes:read

该凭证可以读取设备态势（device posture）属性。

GET /api/v2/device/:deviceID/attributes

GET /api/v2/device/:deviceID/attributes/:attributeKey

devices:posture\_attributes

该凭证可以读取和操作设备态势属性。

devices:posture\_attributes:read 中的端点

POST, DELETE /api/v2/device/:deviceID/attributes

POST, DELETE /api/v2/device/:deviceID/attributes/:attributeKey

devices:routes:read

该凭证可以读取子网路由器设置和出口节点设置。

GET /api/v2/device/:deviceID/routes

devices:routes

该凭证可以读取或修改子网路由器设置、批准和撤销子网路由，以及批准和撤销出口节点。

devices:routes:read 中的端点

POST /api/v2/device/:deviceID/routes

devices\_invites:read

该凭证可以读取设备邀请。

GET /api/v2/device/:deviceID/device-invites

GET /api/v2/device-invites/:deviceInviteID

devices\_invites

该凭证可以读取或修改设备邀请。

device\_invites:read 中的端点

GET /api/v2/device/:deviceID/device-invites

GET, DELETE /api/v2/device-invites/:deviceInviteID

api\_access\_tokens:read

该凭证可以读取 API 访问令牌。

GET /api/v2/tailnet/:tailnet/keys (for API access tokens)

GET /api/v2/tailnet/:tailnet/keys/:keyID (for API access tokens)

api\_access\_tokens

该凭证可以读取或修改 API 访问令牌。

api\_access\_tokens:read 中的端点

DELETE /api/v2/tailnet/:tailnet/keys/:keyID (for API access tokens)

auth\_keys:read

该凭证可以读取认证密钥（auth key）。

GET /api/v2/tailnet/:tailnet/keys (for auth keys)

GET /api/v2/tailnet/:tailnet/keys/:keyID (for auth keys)

auth\_keys

该凭证可以读取或修改认证密钥。

auth\_keys:read 中的端点

POST /api/v2/tailnet/:tailnet/keys (for auth keys)

DELETE /api/v2/tailnet/:tailnet/keys/:keyID (for auth keys)

oauth\_keys:read

该凭证可以读取 OAuth 凭证和密钥。

GET /api/v2/tailnet/:tailnet/keys/:keyID (only OAuth credentials and OAuth keys)

oauth\_keys

该凭证可以读取或修改 OAuth 凭证和密钥。

oauth\_keys:read 中的端点

DELETE /api/v2/tailnet/:tailnet/keys/:keyID (for OAuth credentials and OAuth keys)

federated\_keys:read

该凭证可以读取联合身份以及由联合身份生成的密钥。

GET /api/v2/tailnet/:tailnet/keys/:keyID (only federated identities and keys generated by federated identities)

federated\_keys

该凭证可以读取或修改联合身份以及由联合身份生成的密钥。

federated\_keys:read 中的端点

DELETE /api/v2/tailnet/:tailnet/keys/:keyID (only federated identities and keys generated by federated identities)

webhooks:read

该凭证可以读取 webhook。

GET /api/v2/tailnet/:tailnet/webhooks

GET /api/v2/webhooks/:endpointID

webhooks

该凭证可以读取、修改和测试 webhook，以及轮换 webhook 密钥。

webhooks:read 中的端点

POST /api/v2/tailnet/:tailnet/webhooks

PATCH, DELETE /api/v2/webhooks/:endpointID

POST /api/v2/webhooks/:endpointID/test

POST /api/v2/webhooks/:endpointID/rotate

log\_streaming:read

该凭证可以读取日志流式传输配置及其状态。

GET /api/v2/tailnet/:tailnet/logging/:logType/stream

GET /api/v2/tailnet/:tailnet/logging/:logType/status

log\_streaming

该凭证可以读取或修改日志流式传输配置并检查其状态。
配置向私有端点的日志流式传输时需要 device\_invites 与 policy\_file。

logstreaming:read 中的端点

PUT, DELETE /api/v2/tailnet/:tailnet/logging/:logType/stream

logs:configuration:read

该凭证可以读取配置审计日志。

GET /api/v2/tailnet/:tailnet/logging/configuration

logs:network:read

该凭证可以读取网络流量日志。

GET /api/v2/tailnet/:tailnet/logging/network

GET /api/v2/tailnet/:tailnet/settings

logs:network

该凭证可以读取网络流量日志并修改其设置。

logs:network:read 中的端点

PATCH /api/v2/tailnet/:tailnet/settings (for network logging only)

account\_settings:read

该凭证可以读取 tailnet 联系人。

GET /api/v2/tailnet/:tailnet/contacts

account\_settings

该凭证可以读取或修改 tailnet 联系人，以及重发验证邮件。

account\_settings:read 中的端点

PATCH /api/v2/tailnet/:tailnet/contacts/:contactType

POST /api/v2/tailnet/:tailnet/contacts/:contactType/resend-verification-email

feature\_settings:read

该凭证可以读取设备态势集成和 tailnet 功能设置。

GET /api/v2/tailnet/:tailnet/posture/integrations

GET /api/v2/posture/integrations/:integrationID

GET /api/v2/tailnet/:tailnet/settings

feature\_settings

该凭证可以读取或修改设备态势集成和 tailnet 功能设置。

feature\_settings:read 中的端点

POST /api/v2/tailnet/:tailnet/posture/integrations

PATCH, DELETE /api/v2/posture/integrations/:integrationID

PATCH /api/v2/tailnet/:tailnet/settings

当 Tailscale 推出新功能时，我们会酌情将其纳入现有 scope。也就是说，scope 并不局限于凭证初次授权时已存在的 API——只要对新功能或更新后的功能有意义，scope 就会包含额外的访问权限。

你可以在我们的网站上查阅 [Tailscale API 文档][co-api]

## 吊销信任凭证

1. 打开管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面。

2. 找到要删除的凭证，选择 **Revoke**。

3. 选择 **Revoke** 以确认吊销该凭证。

吊销信任凭证时，由该凭证创建的所有有效 API 访问令牌也会一并被吊销。

## API 访问令牌创建的审计日志

在[配置审计日志][docs-audit-logging]中，创建访问令牌的操作会记录到你的审计日志里。日志条目以信任凭证的 Client ID 作为操作者，并包含该 API 访问令牌的创建时间。

如果你怀疑信任凭证已经泄露，请[吊销该信任凭证][ar-revoke-a-trust-credential]（准备好后再配置新凭证）。查看配置审计日志，确认凭证与 API 访问令牌在泄露期间是否被使用过以及如何被使用。

## 旧版 scope

> **注意：**
>
> 自 2024 年 11 月 14 日起，新建的信任凭证将使用[权限范围（scopes）一节][ar-scopes]中列出的 scope。仍在使用下列 scope 的现有信任凭证，以及用这些凭证生成的密钥，依然有效。

scope 定义了授予你的凭证应用所创建 API 访问令牌的权限。

你可以在 Tailscale 信任凭证中使用以下 scope：

Scope ID
说明
允许的端点

all
该凭证对 tailnet 拥有完全访问权限。此 scope 并不局限于凭证初次授权时已存在的 API——all scope 同样授予对未来新建 API 的访问权限。all 与 all:read 是仅有的两个能列出 tailnet 中全部访问令牌的 scope。

所有端点，包括凭证初次授权时尚不存在的端点。
/api/v2/tailnet/:tailnet/keys/:keyID (for any key, not just itself)

all:read
该凭证对 tailnet 拥有只读访问权限。此 scope 并不局限于凭证初次授权时已存在的 API 的只读访问——all:read scope 同样授予对未来新建 API 的读取权限。all 与 all:read 是仅有的两个能列出 tailnet 中全部访问令牌的 scope。

所有端点，包括凭证初次授权时尚不存在的端点。
/api/v2/tailnet/:tailnet/keys/:keyID (for any key, not just itself)

acl

该凭证可以读取和修改 tailnet 策略文件。

/api/v2/tailnet/:tailnet/devices

/api/v2/tailnet/:tailnet/acl

/api/v2/tailnet/:tailnet/acl/preview

/api/v2/tailnet/:tailnet/acl/validate

/api/v2/tailnet/:tailnet/keys/:keyID (for itself only)

/api/v2/device/:deviceID/attributes

/api/v2/device/:deviceID/attributes/:attributeKey

acl:read

该凭证可以读取和校验 tailnet 策略文件。

/api/v2/tailnet/:tailnet/devices

/api/v2/tailnet/:tailnet/acl

/api/v2/tailnet/:tailnet/acl/preview

/api/v2/tailnet/:tailnet/acl/validate

/api/v2/tailnet/:tailnet/keys/:keyID (for itself only)

/api/v2/device/:deviceID/attributes

devices

该凭证可以读取 tailnet 中的设备列表、批准或移除机器、创建认证密钥（auth key），以及操作设备上的标签和属性。使用 devices scope 创建凭证时，你必须选择一个或多个标签。用该凭证创建的认证密钥必须带有完全相同的标签，或带有属于该凭证标签的标签

/api/v2/tailnet/:tailnet/devices

/api/v2/device/:deviceID

/api/v2/device/:deviceID/attributes

/api/v2/device/:deviceID/attributes/:attributeKey

/api/v2/device/:deviceID/authorized

/api/v2/device/:deviceID/key

/api/v2/device/:deviceID/tags

/api/v2/tailnet/:tailnet/keys (only auth keys, not access tokens)

/api/v2/tailnet/:tailnet/keys/\* (only auth keys, not access tokens)

/api/v2/tailnet/:tailnet/keys/:keyID (for itself only)

devices:read

该凭证可以读取 tailnet 中的设备列表、认证密钥、属性和标签。

/api/v2/tailnet/:tailnet/devices

/api/v2/device/:deviceID

/api/v2/device/:deviceID/attributes

/api/v2/device/:deviceID/key

/api/v2/device/:deviceID/tags

/api/v2/tailnet/:tailnet/keys (only auth keys, not access tokens)

/api/v2/tailnet/:tailnet/keys/\* (only auth keys, not access tokens)

/api/v2/tailnet/:tailnet/keys/:keyID (for itself only)

dns

该凭证可以读取和操作 DNS 设置。

/api/v2/tailnet/:tailnet/dns/\*

/api/v2/tailnet/:tailnet/keys/:keyID (for itself only)

dns:read

该凭证可以读取 DNS 设置。

/api/v2/tailnet/:tailnet/dns/\*

/api/v2/tailnet/:tailnet/keys/:keyID (for itself only)

routes

该凭证可以读取或修改子网路由器设置、批准和撤销子网路由，以及批准和撤销出口节点。

/api/v2/tailnet/:tailnet/devices

/api/v2/device/:deviceID/routes

/api/v2/tailnet/:tailnet/keys/:keyID (for itself only)

routes:read

该凭证可以读取子网路由器设置和出口节点设置。

/api/v2/tailnet/:tailnet/devices

/api/v2/device/:deviceID/routes

/api/v2/tailnet/:tailnet/keys/:keyID (for itself only)

logs:read

该凭证可以读取配置审计日志。

/api/v2/tailnet/:tailnet/logs

/api/v2/tailnet/:tailnet/keys/:keyID (for itself only)

network-logs:read
该凭证可以读取网络流量日志。

/api/v2/tailnet/:tailnet/network-logs
/api/v2/tailnet/:tailnet/keys/:keyID (for itself only)

### 旧版 scope 对应关系

下表将旧版 scope ID 映射到对应的新版 scope。

| 旧版 scope ID                                             | 新版 scope ID                |
| -------------------------------------------------------- | ---------------------------- |
| `devices`（用于创建认证密钥）                             | `auth_keys`                  |
| `devices`（用于设备态势属性）                             | `devices:posture_attributes` |
| `devices`（用于管理设备生命周期和属性）                   | `devices:core`               |
| `routes`                                                  | `devices:routes`             |
| `acl`                                                     | `policy_file`                |
| `logs`                                                    | `logs:configuration`         |
| `network-logs`                                            | `logs:network`               |

[ar-revoke-a-trust-credential]: #吊销信任凭证

[ar-scopes]: #权限范围scopes

[ar-legacy-scopes]: #旧版-scope

[co-api]: https://tailscale.com/api

[docs-api]: /docs/reference/tailscale-api

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-workload-identity]: /docs/features/workload-identity-federation

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege
