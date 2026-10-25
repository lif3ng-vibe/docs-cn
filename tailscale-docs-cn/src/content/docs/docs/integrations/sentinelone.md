---
title: "使用 SentinelOne 限制设备访问"
description: "将 SentinelOne 代理上报的信号用作设备态势属性，以便在访问规则中使用。"
---

最后验证于 Jan 28, 2026

> **注意：** 此集成适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

SentinelOne 会从其代理（agent）收集一系列信号，可用于判定设备的安全态势。Tailscale 可以从 SentinelOne 获取这些信号，并将它们用作访问规则中的设备态势属性，让组织只向信任级别足够高的设备授予对敏感资源的访问权限。

你可以借助 Tailscale 的[设备态势管理][docs-device-posture]功能来实现这一点：

* SentinelOne 态势集成（posture integration），将信号从 SentinelOne 同步到 Tailscale 中的设备态势属性。
* [Device Identity Collection][docs-device-identity-collection]，收集标识符（例如序列号），用于将 Tailscale 中的设备与 SentinelOne 中的设备进行匹配。
* [访问规则中的态势条件][docs-device-posture-postures-and-conditions]，让你可以基于设备属性配置访问限制。

本指南介绍如何为你的 Tailscale 网络（即 tailnet）启用 Device Identity Collection，以及如何配置 SentinelOne 态势集成。

## 什么是 SentinelOne 态势集成？

SentinelOne 集成会按周期性计划在 SentinelOne 与 Tailscale 之间同步数据。
每次同步时，Tailscale 会执行以下操作：

1. 从你的 SentinelOne 账户获取代理列表及其上报的数据。
2. 根据序列号将 SentinelOne 代理与 tailnet 中的设备进行匹配。
3. 将 SentinelOne 数据写入每台匹配设备上的设备态势属性。

该集成会将以下设备态势属性写入匹配的设备：

\[Missing snippet: attributes-sentinel-one.mdx]

## 前提条件

在设置 SentinelOne 集成之前，请确保你已具备：

* 已启用 [Device Identity Collection][docs-device-identity-collection]，且 tailnet 中的设备正在上报标识符。
* 一个你有权限创建 API 令牌（API token）的 SentinelOne 账户。

## 创建 SentinelOne Service User 和 API 令牌

要让 Tailscale 对你的 SentinelOne 账户进行身份验证，你需要创建一个 SentinelOne 用户和 API 令牌。
SentinelOne 集成会用它们从 SentinelOne 获取代理列表及其数据。

创建 SentinelOne 用户和 API 令牌的步骤如下：

1. 在 SentinelOne 的左侧面板中选择 **Settings**。

2. 在顶部菜单中选择 **Users**，然后在左侧面板中选择 **Service Users**。

3. 选择 **Actions**，然后选择 **Create New Service User**。

4. 为 Service User 添加名称和过期日期，然后选择 **Next**。

   *（图：SentinelOne 的 Create New Service User 对话框）*

5. 选择该 Service User 将有权访问的站点或账户，然后选择 **Create**。

6. **API Token** 只会显示一次，请务必复制以备后用。

同时请记下 **Base URL**（例如 `https://example.sentinelone.net/`）。

## 配置 SentinelOne 态势集成

若要配置 Tailscale 从 SentinelOne 获取代理数据：

1. 打开 Tailscale 管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面。

2. 在 **Device Posture Integrations** 部分找到 SentinelOne 集成，然后选择 **Connect**。

3. 输入你的 **SentinelOne URL**，即你用来访问 SentinelOne 控制台的 URL。

4. 输入你的 **API Token**。

   *（图：从 Tailscale 管理控制台连接 SentinelOne 的配置界面。）*

5. 选择 **Connect to SentinelOne**。

## 查看集成状态

接下来，检查 SentinelOne 集成是否已成功运行。

1. 前往 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面的 **Device Posture Integrations** 部分。
2. 在 **Integrations** 部分下找到 SentinelOne 集成。

SentinelOne 集成成功运行后，会显示最近一次同步的时间、已同步的设备数量，以及同步期间发生的任何错误。

*（图：Integrations: SentinelOne：最近同步于 4 分钟前，2 台有标识符的 Tailscale 设备与 3 个 SentinelOne 代理之间匹配到 1 台。）*

## 检查设备属性

设置 SentinelOne 集成后，你可以在 Tailscale 管理控制台中确认 Tailscale 是否正在为你的 SentinelOne 设备写入新的设备属性。

1. 打开 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 选择一台要查看的设备。
3. 该设备的设备属性位于 **Machine Details** 部分。其中应包含前面列出的那组 `sentinelOne:` 属性。

*（图：Machines 页面中的机器属性视图。）*

> **提示：**
>
> 你也可以使用 [Tailscale API][co-device-posture-get-via-api] 检查设备属性。

## 调整 Tailscale 访问规则

设置好 SentinelOne 态势集成、且你的设备拥有反映 SentinelOne 上报信号的设备态势属性之后，就可以把这些设备态势属性用作态势规则的一部分。

例如，若要只允许来自装有活跃 SentinelOne 代理、运行状态良好且活跃威胁数为零的设备访问 `tag:production`，你可以创建一个新的 posture（态势），并将其用作相应访问规则的一部分：

```json
"postures": {
  "posture:trusted": [
    "sentinelOne:operationalState == 'na'",
    "sentinelOne:activeThreats == 0",
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

## 限制

* 我们观察到，SentinelOne 不会为某些运行 Linux 的机器上报序列号。缺少序列号信息时，Tailscale 将无法为这些机器填充设备态势属性。

\[Missing snippet: auditlogs-integrations.mdx]

[co-device-posture-get-via-api]: https://tailscale.com/api#tag/devices/GET/device/{deviceId}/attributes

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture-postures-and-conditions]: /docs/features/device-posture/postures-in-access-rules

[docs-device-posture]: /docs/features/device-posture
