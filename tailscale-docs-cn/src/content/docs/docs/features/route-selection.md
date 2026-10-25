---
title: "路由选择"
description: "比较并配置子网路由器、应用连接器和 Tailscale Service 主机的路由选择，包括 MagicRoute 出口节点建议。"
---

最后验证于 Oct 7, 2026

路由选择（route selection）控制 Tailscale 如何在 tailnet 中相互重叠的连接器之间做出选择：

* 通告相同路由前缀的[子网路由器][docs-subnets]。
* 为相同应用配置的[应用连接器][docs-app-connectors]。
* 客户端可用的[出口节点][docs-recommended-exit-nodes]。
* 同一 [Tailscale Service][docs-tailscale-services] 的主机。

该设置作用于整个 tailnet。连接器必须满足你的访问控制和审批要求，才能对客户端可见。

## 比较路由选择选项

| 选项                                         | 适用场景                                                                             | 可用性                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| **主备故障转移**（active-passive failover）  | 使用一个主连接器，其余作为备用。                                                     | 所有套餐默认提供。                                                      |
| **区域路由**（regional routing）             | 将客户端分布到其所选 DERP 区域内的各连接器上。                                       | Premium 和 Enterprise。                                                 |
| **带区域内故障转移的区域路由**               | 在每个 DERP 区域使用一个主连接器，其余作为备用。                                     | Premium 和 Enterprise，需支持团队启用。                                 |
| **[MagicRoute][docs-magicroute]**            | 按优先级得分选择连接器或 Service 主机。支持自定义 DERP 服务器。                      | 面向符合区域路由条件的 Premium 和 Enterprise tailnet 的 beta 功能。     |

### 主备故障转移

主备故障转移会选择最先加入 tailnet 的合格连接器。如果该连接器下线，Tailscale 会按最早优先的顺序选择下一个合格连接器。

当你对主连接器执行 [`tailscale down`][docs-tailscale-cli-down] 时，故障转移大约需要 15 秒。发生网络分区或以其他方式禁用网络接口后，故障转移可能耗时更长。设置说明请参阅[设置高可用][docs-ha]。

### 区域路由

区域路由按 Tailscale [DERP 区域][docs-derp]对连接器分组。Tailscale 依据客户端上报的到 DERP 服务器的延迟测量来选择区域。客户端会定期重新评估所在区域。如果某个区域没有可用连接器，Tailscale 会改用其他区域。

每个客户端对该区域内连接器都有一个稳定的伪随机偏好顺序。当其偏好的连接器不可用时，就改用下一个。流量分布为尽力而为。

此选项与[自定义 DERP 服务器][docs-custom-derp]不兼容。

### 带区域内故障转移的区域路由

此选项先用区域路由选择区域，再在该区域的连接器之间按最早优先进行故障转移。如需启用，请联系 [Tailscale 支持][co-support]或你的客户团队。

此选项与[自定义 DERP 服务器][docs-custom-derp]不兼容。

### MagicRoute 公测版

> **注意：** MagicRoute 目前处于 beta 阶段。

MagicRoute 使用优先级得分为每个客户端选择连接器或 Service 主机。它支持自定义 DERP 服务器，且不会按 DERP 区域对候选者分组。现有区域路由客户需主动选择加入。兼容性、出口节点建议与限制请参阅 [MagicRoute][docs-magicroute]。

## 路由选择使用场景

区域路由和 MagicRoute 可在以下部署中于相互重叠的连接器之间做出选择。

### 将远程员工连接到转接骨干网

如果你使用云服务商的转接骨干网（transit backbone），可在多个接入点部署子网路由器。区域路由或 MagicRoute 会为每个客户端选择一台路由器来访问骨干网。

### 连接到全球复制的应用或 VPC

对于分布在两个云区域的应用，可在每个区域部署一台通告相同路由前缀的子网路由器。区域路由或 MagicRoute 会为每个客户端选择一台路由器。这两种选项也可以在合格的 [Tailscale Service 主机][docs-tailscale-services]之间做出选择。

### 让全球员工连接 SaaS 应用

如果你的应用会返回随位置变化的 DNS 结果，可在不同地理位置部署应用连接器。区域路由或 MagicRoute 会在合格的应用连接器之间做出选择。设置指引请参阅[使用应用连接器的最佳实践][docs-app-connectors-best-practices]。

## 前提条件

先设置好你要使用的连接器：

* **子网路由器**：部署多台通告相同已批准路由前缀的子网路由器。
* **应用连接器**：为相同应用[配置多个连接器][docs-app-connector-ha]。

### 路由资格与前缀匹配

子网路由器必须通告完全相同的路由前缀才能提供故障转移。当路由重叠时，Tailscale 使用最长前缀匹配。如果某个更精确前缀的所有子网路由器都下线，Tailscale 不会回退到更宽的前缀。示例请参阅[排查重叠子网路由故障转移问题][docs-overlapping-routes]。

如果你在授权中使用 [`via`][docs-via]，路由选择只会在对该用户和该流量合格的子网路由器之间做出选择。

## 更改路由选择选项

你可以在管理控制台或通过 API 更改路由选择选项。该设置作用于整个 tailnet。

### 使用管理控制台

更改此设置需要你是 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)。

管理控制台根据你的套餐提供 **主备故障转移**（active-passive failover）、**区域路由**（regional routing）和 **MagicRoute**。在支持团队启用后，**带区域内故障转移的区域路由**（regional routing with in-region failover）也会出现在管理控制台中。

1. 打开管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面。
2. 在 **Route selection** 中选择一个可用选项，例如 **MagicRoute**。
3. 选择保存按钮。
4. 看到成功通知后，重新加载页面确认你的选择。然后[从客户端检查路由][ar-verify]。

### 使用 API

使用 [tailnet 设置 API][co-api-tailnet-settings] 读取或更改 `routeSelection`。使用带作用域的凭证时，读取该设置需要 `feature_settings:read`，更改它需要 `feature_settings`。写入作用域包含读取权限。请参阅 [API 认证][docs-api-authentication]与[凭证作用域][docs-credential-scopes]。

下面的示例用 `ACCESS_TOKEN` 表示具备所需作用域的凭证，用 `TAILNET_ID` 表示你的 [tailnet ID][docs-tailnet-id]。读取当前设置：

```shell
curl --fail-with-body \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  "https://api.tailscale.com/api/v2/tailnet/$TAILNET_ID/settings"
```

把 `routeSelection` 设置为以下取值之一：

| 选项                                     | API 取值                    |
| ---------------------------------------- | --------------------------- |
| 主备故障转移                             | `active-passive-failover`   |
| 区域路由                                 | `regional-routing`          |
| 带区域内故障转移的区域路由               | `regional-routing-failover` |
| MagicRoute                               | `magicroute`                |

API 有相同的套餐与支持团队要求。选择 MagicRoute 的示例：

```shell
curl --fail-with-body \
  --request PATCH \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"routeSelection":"magicroute"}' \
  "https://api.tailscale.com/api/v2/tailnet/$TAILNET_ID/settings"
```

重复上述 GET 请求，确认 `routeSelection` 已变为 `magicroute`。然后[从客户端检查路由][ar-verify]。

API 会拒绝同时包含 `regionalRoutingOn` 和 `routeSelection` 的 PATCH 请求。这两个字段一次只能发送其中一个。

旧版字段 `regionalRoutingOn` 仅在选择区域路由时为 `true`，选择其他所有选项时均为 `false`。写入 `true` 会选择区域路由；写入 `false` 会选择主备故障转移。写入该字段的自动化操作可能覆盖你的选择。请使用 `routeSelection` 来区分并配置全部四个选项。

## 验证路由选择

确认设置已保存后，从不同位置的客户端发起新请求进行测试：

* **子网路由器**：从一台接受子网路由的客户端，向所通告子网内的目标发送网络流量。
* **应用连接器**：解析该应用配置的域名，并从一台接受其路由的客户端请求该应用。
* **推荐出口节点**：[选择一项建议][docs-recommended-exit-nodes]，然后检查客户端当前生效的出口节点并测试互联网访问。要测试 MagicRoute 建议，请使用运行 Tailscale v1.86.0 或更高版本的客户端。

对于子网路由器和应用连接器，在发请求的同时在客户端上运行 [`tailscale status`][docs-tailscale-cli-status]：

```shell
tailscale status
```

对比多次请求之间候选连接器的 `active` 状态以及 `tx` 和 `rx` 字节数。它们反映的是对等端活动，其中可能包含无关流量，单凭这些并不能确定哪个连接器在为特定目标路由。

要查看客户端的路由分配，运行：

```shell
tailscale status --json
```

在 `Peer` 条目中，找到 `PrimaryRoutes` 里包含目标 IP 地址的最长前缀。该对等端就是客户端在此前缀上的主路由器。对于应用连接器，使用 DNS 返回的目标 IP 地址。

如果请求失败，请检查路由审批、客户端路由接受情况以及访问控制。故障排除请参阅[路由注入][docs-route-injection]或[应用连接器设置][docs-app-connector-setup]。

[ar-verify]: #验证路由选择

[co-api-tailnet-settings]: https://tailscale.com/api#tag/tailnetsettings

[co-support]: https://tailscale.com/contact/support

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-app-connector-ha]: /docs/how-to/set-up-high-availability#app-connector-high-availability

[docs-app-connector-setup]: /docs/features/app-connectors/how-to/setup

[docs-app-connectors]: /docs/features/app-connectors

[docs-app-connectors-best-practices]: /docs/reference/best-practices/app-connectors

[docs-credential-scopes]: /docs/reference/trust-credentials#scopes

[docs-custom-derp]: /docs/reference/derp-servers/custom-derp-servers

[docs-derp]: /docs/reference/derp-servers

[docs-ha]: /docs/how-to/set-up-high-availability

[docs-magicroute]: /docs/features/magicroute

[docs-overlapping-routes]: /docs/reference/troubleshooting/network-configuration/overlapping-subnet-route-failover

[docs-recommended-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-route-injection]: /docs/reference/route-injection

[docs-subnets]: /docs/features/subnet-routers

[docs-tailnet-id]: /docs/concepts/tailnet-name#tailnet-id

[docs-tailscale-cli-down]: /docs/reference/tailscale-cli#down

[docs-tailscale-cli-status]: /docs/reference/tailscale-cli#status

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-via]: /docs/features/access-control/grants/grants-via
