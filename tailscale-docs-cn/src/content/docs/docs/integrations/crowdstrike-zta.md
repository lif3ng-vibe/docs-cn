---
title: "使用 CrowdStrike ZTA 分数限制设备访问"
description: "将 CrowdStrike Falcon 报告的零信任评估（ZTA）分数用作设备态势属性，以便在访问规则中使用。"
---

最后验证于 Jan 28, 2026

> **注意：** 此集成适用于 [Standard、Premium 与 Enterprise 套餐](https://tailscale.com/pricing)。

CrowdStrike Falcon [Zero Trust Assessment][xt-crowdstrike-zero-trust]（零信任评估）会为每台运行 Falcon 代理的设备计算一个数字信任分数（0 到 100）。将该分数用作 Tailscale 访问规则的一部分，组织可以只向信任度足够高的设备授予对敏感资源的访问权限。

你可以借助 Tailscale 的[设备态势（device posture）][docs-device-posture]功能实现这一点：

* CrowdStrike Falcon 态势集成：将零信任评估分数从 CrowdStrike 同步到 Tailscale 中的设备态势属性。
* [设备身份收集（Device Identity Collection）][docs-device-identity-collection]：收集序列号与 MAC 地址等标识符，用于将 Tailscale 中的设备与 CrowdStrike 中的设备相匹配。
* [访问规则中的态势条件][docs-device-posture-postures-and-conditions]：让你能够基于设备属性配置访问限制。

本指南介绍如何为你的 Tailscale 网络（tailnet）启用设备身份收集，以及如何配置 CrowdStrike Falcon 态势集成。

## 什么是 CrowdStrike Falcon 态势集成？

CrowdStrike Falcon 集成会按周期性计划在 Falcon 与 Tailscale 之间同步数据。
在每次同步期间，Tailscale 会执行以下操作：

1. 从你的 Falcon 账户获取主机列表及其 ZTA 分数。
2. 根据序列号将 Falcon 主机与 tailnet 中的设备相匹配。
3. 将 Falcon 数据写入每台匹配设备的设备态势属性。

该集成会向匹配的设备写入以下设备态势属性：

\[Missing snippet: attributes-falcon.mdx]

## 前提条件

在设置 CrowdStrike Falcon 集成之前，请确保：

* 已启用[设备身份收集][docs-device-identity-collection]，并且 tailnet 中的设备正在上报标识符。
* 你拥有一个 CrowdStrike Falcon 账户，并且有创建 API 客户端的权限。

## 创建 CrowdStrike Falcon API 凭证

要将你的 CrowdStrike Falcon 账户向 Tailscale 完成身份验证，你需要创建一个 CrowdStrike Falcon API 客户端。
Falcon 集成使用它从 Falcon 获取主机列表及其 ZTA 分数。

要创建 CrowdStrike Falcon API 客户端：

1. 在 Falcon 中，打开 **Support and resources**，然后打开 **API clients and keys**。

2. 选择 **Create API client**。

3. 添加一个名称。为 **Hosts** 作用域添加 **Read**，为 **Zero Trust** 作用域添加 **Read**。

   *（图：Create API client：Client name 为 Tailscale integration，已启用 'Zero Trust Assessment - Read' 作用域。）*

4. 选择 **Create**，然后务必复制显示的 **Client ID** 与 **Client Secret**。它们只会显示一次。

另请记下 **Base URL**（例如 `https://api.us-2.crowdstrike.com`）。

## 配置 CrowdStrike Falcon 态势集成

要让 Tailscale 从 CrowdStrike Falcon 获取主机的 ZTA 分数：

1. 打开 Tailscale 管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面。

2. 在 **Device Posture Integrations** 部分下找到 CrowdStrike Falcon 集成，然后选择 **Connect**。

3. 选择你的 **CrowdStrike Cloud Region**（即 API 客户端的 **Base URL**）。

4. 输入你的 **Client ID** 与 **Client Secret**。

   *（图：1. Configure a CrowdStrike OAuth client：CrowdStrike Cloud Region 为 US-2，已填入 Client ID 与 Client Secret。3. Enable device identity collection：Tailscale 使用序列号等设备标识符将 Falcon 主机与 Tailscale 机器关联。你已启用设备身份收集。按钮：Connect to CrowdStrike Falcon。）*

5. 选择 **Connect to CrowdStrike Falcon**。

## 检查集成状态

接下来，确认 CrowdStrike Falcon 集成是否已成功运行。

1. 前往 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面的 **Device Posture Integrations** 部分。
2. 在 **Integrations** 部分下找到 CrowdStrike Falcon 集成。

CrowdStrike Falcon 集成成功运行后，会显示最近一次同步的时间、已同步的设备数量，以及同步期间发生的任何错误。

*（图：Integrations: CrowdStrike Falcon：Last sync 为 4 分钟前，2 台带有标识符的 Tailscale 设备与 3 台 CrowdStrike Falcon 主机之间匹配到 1 台。）*

## 检查设备属性

设置好 CrowdStrike Falcon 集成后，你可以在 Tailscale 管理控制台中确认 Tailscale 正在为你的 CrowdStrike Falcon 设备写入新的设备属性。

1. 打开 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 选择一台要检查的设备。
3. 该设备的设备属性位于 **Machine Details** 部分。其中应包含 `falcon:ztaScore` 属性。

*（图：Attributes（属性）。falcon:ztaScore: 64. node:os: linux. node:osVersion: 5.19.0-46-generic. node:tsReleaseTrack: stable. node:tsVersion: 1.53.20.）*

> **提示：**
>
> 你也可以使用 [Tailscale API][co-device-posture-get-via-api] 检查设备属性。

## 调整 Tailscale 访问规则

设置好 CrowdStrike Falcon 态势集成，并且你的设备拥有了反映 CrowdStrike Falcon 所上报信号的设备态势属性之后，你就可以将这些设备态势属性用作态势规则的一部分。

例如，要只允许 ZTA 分数不低于 70 的设备访问 `tag:production`，你可以创建一个新的态势（posture），并将其用作相应访问规则的一部分：

```json
"postures": {
  "posture:trusted": ["falcon:ztaScore >= 70"],
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

[co-device-posture-get-via-api]: https://tailscale.com/api#tag/devices/GET/device/{deviceId}/attributes

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture-postures-and-conditions]: /docs/features/device-posture/postures-in-access-rules

[docs-device-posture]: /docs/features/device-posture

[xt-crowdstrike-zero-trust]: https://www.crowdstrike.com/press-releases/crowdstrike-extends-zero-trust-to-endpoint-devices
