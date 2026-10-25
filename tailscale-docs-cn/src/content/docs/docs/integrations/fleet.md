---
title: "使用 Fleet 限制设备访问"
description: "将 Fleet 报告的信号用作设备态势属性，以便在访问规则中使用。"
---

最后验证于 Jan 29, 2026

> **注意：** 此集成适用于 [Standard、Premium 与 Enterprise 套餐](https://tailscale.com/pricing)。

[Fleet Device Management][xt-fleet] 会从安装在每台设备上的代理收集一系列信号，可用于判断设备的安全态势。

Tailscale 可以从 Fleet 获取这些信号，并将它们用作访问规则中的设备态势属性，组织随后可以借此只向信任度高的设备授予对敏感资源的访问权限。

你可以借助 Tailscale 的[设备态势管理][docs-device-posture]功能实现这一点：

* [设备身份收集（Device Identity Collection）][docs-device-identity-collection]：收集标识符（例如序列号），用于将 Tailscale 中的设备与 Fleet 中的设备相匹配。
* Fleet 态势集成：将来自 Fleet 的信号同步到 Tailscale 中的设备态势属性。
* [访问规则中的态势条件][docs-device-posture-postures-and-conditions]：让你能够基于设备属性配置访问限制。

本指南介绍如何为你的 Tailscale 网络（tailnet）启用设备身份收集，以及如何配置 Fleet 态势集成。

## 什么是 Fleet 态势集成？

Fleet 集成会按周期性计划在 Fleet 与 Tailscale 之间同步数据。
在每次同步期间，Tailscale 会执行以下操作：

1. 从你的 Fleet 账户获取主机列表及其上报的数据。
2. 根据序列号将 Fleet 设备与 tailnet 中的设备相匹配。
3. 将 Fleet 数据写入每台匹配设备的设备态势属性。

该集成会向匹配的设备写入以下设备态势属性：

\[Missing snippet: attributes-fleet.mdx]

## 前提条件

在设置 Fleet 集成之前，请确保：

* 已启用[设备身份收集][docs-device-identity-collection]，并且 tailnet 中的设备正在上报标识符。
* 你拥有一个具有 [Admin 角色][xt-fleet-roles]的 Fleet 用户账户，用于为该集成创建仅限 API 的用户。
* 在你要配置集成的 tailnet 中，你拥有具有 [Admin 角色][docs-user-roles-admin]的 Tailscale 用户账户。

## 配置 Fleet 集成

Tailscale 使用 Fleet API 令牌向 Fleet 完成身份验证，并获取设备列表及其数据。

要将 Fleet 连接到 Tailscale，请先在 Fleet 中创建一个仅限 API 的用户并生成其 API 令牌。然后在 Tailscale 管理控制台中输入该令牌与你的 Fleet URL。Tailscale 会使用这些信息从 Fleet 获取设备数据。

在 Fleet 中：

1. 为 Tailscale 集成创建一个仅限 API 的用户。
2. 在 Fleet 中为该仅限 API 的用户分配 Admin 角色。
3. 在 Fleet 中为该仅限 API 的用户生成一个 API 令牌。

在 Tailscale 中：

1. 打开管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面。
2. 在 **Device Posture Integrations** 下找到 Fleet 集成，选择 **Connect**。
3. 输入你的 **Fleet URL** 与在 Fleet 中生成的 **API Token**。
4. 选择 **Connect to Fleet**。

有关创建仅限 API 用户与生成 API 令牌的说明，请参阅 [Fleet 文档][xt-fleet-api-only-user]。

## 创建 Fleet 策略

[Fleet 策略][xt-fleet-policies]让你能够监控设备是否满足特定的安全与合规标准。
这些策略专属于你的 Fleet 账户。

Fleet 集成可以为通过了 Fleet 策略的设备添加[设备属性][docs-node-attributes]。

要启用添加这些设备属性，请在你的 Fleet 策略描述中加入字符串 `Tailscale: fleetPolicy:{attributeName}`。

* 对于设备通过的每条 Fleet 策略，Fleet 集成都会为该设备添加一个 `fleetPolicy:{attributeName} = true` 设备属性。
* 对于设备未通过的每条 Fleet 策略，Fleet 集成都会为该设备添加一个 `fleetPolicy:{attributeName} = false` 设备属性。
* 如果多条 Fleet 策略的策略描述中含有相同的 `Tailscale: fleetPolicy:{attributeName}` 字符串，那么只要任一匹配的策略通过，设备属性就为 `true`，否则为 false。

你可以在访问规则中检查设备的属性里是否存在某个特定的 Fleet 策略，然后据此调整其访问权限。

*（图：Fleet 配置面板，显示一条策略，其中包含 \`Tailscale: fleetPolicy:builtinAntivirus\`，用于在通过的设备上设置 \`fleetPolicy:builtinAntivirus\` 设备属性。）*

## 配置 Fleet 态势集成

要让 Tailscale 从 Fleet 获取设备数据：

1. 打开 Tailscale 管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面。

2. 在 **Device Posture Integrations** 部分下找到 Fleet 集成，然后选择 **Connect**。

3. 输入你的 **Fleet URL** 与 **API Token**。

   *（图：在 Tailscale 管理控制台中连接 Fleet 的配置界面。）*

4. 选择 **Connect to Fleet**。

## 检查集成状态

接下来，确认 Fleet 集成是否已成功运行。

1. 前往 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面的 **Device Posture Integrations** 部分。
2. 在 **Integrations** 部分下找到 Fleet 集成。

Fleet 集成成功运行后，会显示最近一次同步的时间、已同步的设备数量，以及同步期间发生的任何错误。

*（图：Integrations: Fleet：Last sync 为 4 分钟前，2 台带有标识符的 Tailscale 设备与 4 台 Fleet 主机之间匹配到 1 台。）*

## 检查设备属性

设置好 Fleet 集成后，你可以在 Tailscale 管理控制台中确认 Tailscale 正在为你的 Fleet 设备写入新的设备属性。

1. 打开 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 选择一台要检查的设备。
3. 在 **Machine Details** 部分查看该设备的设备属性。此部分应包含前文列出的 `fleet:` 与 `fleetPolicy:` 属性集合。

*（图：Machines 页面中机器属性的视图。）*

> **提示：**
>
> 你也可以使用 [Tailscale API][co-device-posture-get-via-api] 检查设备属性。

## 调整 Tailscale 访问规则

设置好 Fleet 态势集成，并且你的设备拥有了反映 Fleet 所上报信号的设备态势属性之后，你就可以将这些设备态势属性用作态势规则的一部分。

例如，要只允许由 Fleet 管理的设备访问 `tag:production`，你可以创建一个新的态势（posture），并将其用作相应访问规则的一部分：

```json
"postures": {
  "posture:managed": [
    "fleet:present",
  ],
},
"grants": [
  {
    "src": ["autogroup:member"],
    "dst": ["tag:production"],
    "ip": ["*"],
    "srcPosture": ["posture:managed"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

\[Missing snippet: sync-schedule.mdx]

\[Missing snippet: auditlogs-integrations.mdx]

[co-device-posture-get-via-api]: https://tailscale.com/api#tag/devices/GET/device/{deviceId}/attributes

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture]: /docs/features/device-posture

[docs-device-posture-postures-and-conditions]: /docs/features/device-posture/postures-in-access-rules

[docs-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-user-roles-admin]: /docs/reference/user-roles#admin

[xt-fleet]: https://fleetdm.com/

[xt-fleet-api-only-user]: https://fleetdm.com/guides/fleetctl#using-fleetctl-with-an-api-only-user

[xt-fleet-policies]: https://fleetdm.com/securing/what-are-fleet-policies

[xt-fleet-roles]: https://fleetdm.com/guides/role-based-access
