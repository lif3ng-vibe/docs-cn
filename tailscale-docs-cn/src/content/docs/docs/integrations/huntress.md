---
title: "使用 Huntress 限制设备访问"
description: "将 Huntress 报告的信号用作设备态势属性，以便在访问规则中使用。"
---

最后验证于 Feb 2, 2026

> **注意：** 此集成适用于 [Standard、Premium 与 Enterprise 套餐](https://tailscale.com/pricing)。

[Huntress Managed EDR][xt-huntress] 是一套网络安全解决方案，会从已注册的设备（通过安装在各设备上的代理）收集信号。

Tailscale 可以从 Huntress 获取这些信号，并将它们用作访问规则中的设备态势属性，你随后可以借此仅依据每台设备的信任级别授予对敏感资源的访问权限。

你可以借助 Tailscale 的[设备态势管理][docs-device-posture]功能实现这一点：

* [设备身份收集（Device Identity Collection）][docs-device-identity-collection]：收集标识符（例如序列号），用于将 Tailscale 中的设备与 Huntress 中的设备相匹配。
* Huntress 态势集成：将来自 Huntress 的信号同步到 Tailscale 中的设备态势属性。
* [访问规则中的态势条件][docs-device-posture-postures-and-conditions]：让你能够基于设备属性配置访问限制。

本指南介绍如何为你的 tailnet 启用设备身份收集，以及如何配置 Huntress 态势集成。

## 什么是 Huntress 态势集成？

该集成会按周期性计划在 Huntress 与 Tailscale 之间同步数据。
在每次同步期间，Tailscale 会执行以下操作：

1. 从你的 Huntress 账户获取代理列表及其上报的数据。
2. 根据序列号将 Huntress 设备与 tailnet 中的设备相匹配。
3. 将 Huntress 数据写入每台匹配设备的设备态势属性。

该集成会向匹配的设备写入以下设备态势属性：

| **属性键**                      | **说明**                               | **允许的值**                                                              |
| ------------------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| `huntress:defenderStatus`       | Microsoft Defender 杀毒软件的状态      | `Incompatible`, `Unhealthy`, `Protected`, `Unmanaged`                     |
| `huntress:defenderPolicyStatus` | Microsoft Defender 杀毒软件的策略状态  | `Unknown`, `Non Compliant`, `Compliant`, `Pending`, `Gpo Conflict`        |
| `huntress:firewallStatus`       | 防火墙是否已启用                       | `Disabled`, `Enabled`, `Pending Isolation`, `Isolated`, `Pending Release` |

## 前提条件

在设置 Huntress 集成之前，请确保：

* 已启用[设备身份收集][docs-device-identity-collection]，并且 tailnet 中的设备正在上报标识符。
* 你拥有一个 Huntress 账户，并且有创建 API key 与 secret 的权限。

## 创建 Huntress API key 与 API secret

要将你的 Huntress 账户向 Tailscale 完成身份验证，你需要创建一个 Huntress API key 与 secret。Huntress 集成使用它们从 Huntress 获取代理列表及其数据。

要创建 Huntress API key 与 secret：

1. 访问 Huntress 网站并登录你的账户。

2. 在右上角菜单中，选择 **API Credentials**。

3. 在 **User API Credentials** 下，选择 **+ Add**。

4. 在 **User** 下，选择一个有权访问你所有 Huntress 代理的用户，然后选择 **Create**。Tailscale 建议为你的 Tailscale API key 使用一个专用的只读用户。

5. 务必复制 **API Key** 与 **API Secret**。在 Tailscale 管理控制台中配置 Huntress 集成时需要用到它们。

## 查找你的 Huntress Organization ID

你可以指定一个 Huntress Organization ID，将集成限制为与你的 Huntress 账户关联的特定组织。如果你在 Huntress 中有多个组织，但只需要将其中一个连接到 Tailscale，可以考虑这样做。

要查找你的 Huntress 组织 ID：

1. 访问 Huntress 网站并登录你的账户。
2. 在右上角菜单中，选择 **Organizations**。
3. 在组织列表中，选择你打算与 Tailscale 一起使用的组织。
4. 在 URL 中查找 `/org/` 后面的数字。例如，如果 URL 为 `https://example.huntress.io/org/123456`，则 Organization ID 为 `123456`。
5. 保存该 ID，以便在 Tailscale 中配置 Huntress 集成时使用。

## 配置 Huntress 态势集成

要让 Tailscale 从 Huntress 获取设备数据：

1. 打开 Tailscale 管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面。
2. 在 **Device Posture Integrations** 部分下找到 Huntress 集成，然后选择 **Connect**。
3. 输入你的 **API Key** 与 **API Secret**。
4. （可选）输入你的 [**Organization ID**][ar-find-your-huntress-organization-id]，将集成限制为与你的 Huntress 账户关联的特定组织。
5. 选择 **Connect to Huntress**。

## 检查集成状态

接下来，确认 Huntress 集成是否已成功运行。

1. 前往 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面的 **Device Posture Integrations** 部分。
2. 在 **Integrations** 部分下找到 Huntress 集成。

Huntress 集成成功运行后，会显示最近一次同步的时间、已同步的设备数量，以及同步期间发生的任何错误。

*（图：Integrations: Huntress：Last sync 为 4 分钟前，2 台带有标识符的 Tailscale 设备与 3 个 Huntress 代理之间匹配到 1 台。）*

## 检查设备属性

设置好 Huntress 集成后，你可以在 Tailscale 管理控制台中确认 Tailscale 正在为你的 Huntress 设备写入新的设备属性。

1. 打开 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 选择一台要检查的设备。
3. 该设备的设备属性位于 **Machine Details** 部分。其中应包含前文列出的 `huntress:` 属性集合。

*（图：Machines 页面中机器属性的视图。）*

> **提示：**
>
> 你也可以使用 [Tailscale API][co-device-posture-get-via-api] 检查设备属性。

## 调整 Tailscale 访问规则

配置好 Huntress 态势集成，并且你的设备拥有了反映 Huntress 所上报信号的设备态势属性之后，你就可以将这些设备态势属性用作态势规则的一部分。

例如，要只允许开启了杀毒（AV）扫描与防火墙的设备访问 `tag:production`，你可以创建一个新的态势（posture），并将其用作相应访问规则的一部分：

```json
"postures": {
  "posture:trusted": [
    "huntress:defenderStatus == 'Healthy'",
    "huntress:firewallStatus == 'Enabled'",
  ],
},
"grants": [
  {
    "src": ["autogroup:member"],
    "dst": ["tag:production"],
    "ip": ["*"],
    "srcPosture": ["posture:trusted"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

\[Missing snippet: sync-schedule.mdx]

\[Missing snippet: auditlogs-integrations.mdx]

[ar-find-your-huntress-organization-id]: #查找你的-huntress-organization-id

[co-device-posture-get-via-api]: https://tailscale.com/api#tag/devices/GET/device/{deviceId}/attributes

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture]: /docs/features/device-posture

[docs-device-posture-postures-and-conditions]: /docs/features/device-posture/postures-in-access-rules

[xt-huntress]: https://www.huntress.com/platform/managed-edr
