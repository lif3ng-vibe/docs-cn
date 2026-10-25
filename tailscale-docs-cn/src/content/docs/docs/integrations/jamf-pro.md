---
title: "使用 Jamf Pro 限制设备访问"
description: "将 Jamf Pro 上报的信号用作设备态势属性，以用于访问规则。"
---

最后验证于 Jan 28, 2026

> **注意：** 此集成适用于[标准版、高级版和企业版套餐](https://tailscale.com/pricing)。

[Jamf Pro][xt-jamfpro] 从设备上安装的 MDM 描述文件中采集一系列信号，这些信号可用于判定设备的安全态势。Tailscale 可以从 Jamf Pro 获取这些信号，并将其用作访问规则中的设备态势属性，从而让组织只向信任级别足够高的设备授予对敏感资源的访问权限。

你可以借助 Tailscale 的[设备态势管理][docs-device-posture]功能实现这一点：

* [设备身份收集（Device Identity Collection）][docs-device-identity-collection]，采集标识符（例如序列号），用于将 Tailscale 中的设备与 Jamf Pro 中的设备进行匹配。
* Jamf Pro 态势集成，将 Jamf Pro 的信号同步到 Tailscale 中的设备态势属性。
* [访问规则中的态势条件][docs-device-posture-postures-and-conditions]，让你可以基于设备属性配置访问限制。

本指南介绍如何为你的 Tailscale 网络（tailnet）启用设备身份收集，以及如何配置 Jamf Pro 态势集成。

## 什么是 Jamf Pro 态势集成？

Jamf Pro 集成按周期性计划在 Jamf Pro 与 Tailscale 之间同步数据。
每次同步期间，Tailscale 会执行以下操作：

1. 从你的 Jamf Pro 账户获取主机列表及其上报的数据。
2. 根据序列号将 Jamf Pro 设备与你 tailnet 中的设备进行匹配。
3. 将 Jamf Pro 数据写入每台匹配设备的设备态势属性。

该集成会向匹配的设备写入以下设备态势属性：

\[Missing snippet: attributes-jamfpro.mdx]

## 前提条件

在设置 Jamf Pro 集成之前，请确保你已具备：

* 已启用[设备身份收集][docs-device-identity-collection]，并且 tailnet 中的设备正在上报标识符。
* 一个你有权创建 API 令牌的 Jamf Pro 账户。

## 创建 Jamf Pro API 令牌

要将你的 Jamf Pro 账户与 Tailscale 进行认证，你需要创建一个 Jamf Pro API 令牌。
Jamf Pro 集成会使用它从 Jamf Pro 获取设备列表及其数据。

创建 Jamf Pro API 令牌的方法：

1. 在 Jamf Pro 中，在左侧面板选择 **Settings**。

2. 选择 **API roles and clients**。

3. 在右上角选择 **+ New**。

4. 为 API 角色添加 Display Name，并向 **Privileges** 中添加 "Read Computers"，然后选择 **Save**。

5. 返回 **API roles and clients** 界面，选择 **API Clients**，然后在右上角选择 **+ New**。

6. 为 API 客户端添加 Display Name，选择上一步创建的 API 角色，打开 **Enable API client** 开关，然后选择 **Save**。

   *（图：Jamf Pro 的 Add an API client 对话框）*

7. 选择 **Generate client secret**，并在弹出的对话框中选择 **Create secret**。务必复制 **Client ID** 和 **Client Secret**，下一节会用到。

## 配置 Jamf Pro 态势集成

要让 Tailscale 从 Jamf Pro 获取设备数据：

1. 打开 Tailscale 管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面。

2. 在 **Device Posture Integrations** 区域，找到 Jamf Pro 集成，然后选择 **Connect**。

3. 输入你的 **Jamf API URL**，即你用于访问 Jamf Pro 控制台的 URL。

4. 输入你的 **Client ID**。

5. 输入你的 **Client Secret**。

   *（图：在 Tailscale 管理控制台中连接 Jamf Pro 的配置界面。）*

6. 选择 **Connect to Jamf**。

## 检查集成状态

接下来，确认 Jamf Pro 集成已成功运行。

1. 前往 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面的 **Device Posture Integrations** 区域。
2. 在 **Integrations** 区域下找到 Jamf Pro 集成。

Jamf Pro 集成成功运行后，会显示最近一次同步的时间、已同步的设备数量，以及同步过程中发生的任何错误。

*（图：Integrations: Jamf Pro：Last sync 为 4 分钟前，2 台带标识符的 Tailscale 设备与 3 台 Jamf 设备之间匹配到 1 台）*

## 检查设备属性

设置好 Jamf Pro 集成后，你可以在 Tailscale 管理控制台中确认 Tailscale 正在为你的 Jamf Pro 设备写入新的设备属性。

1. 打开 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 选择要检查的设备。
3. 该设备的设备属性位于 **Machine Details** 区域。其中应包含前面列出的 `jamfPro:` 属性集合。

*（图：Machines 页面中机器属性的视图。）*

> **提示：**
>
> 你也可以使用 [Tailscale API][co-device-posture-get-via-api] 检查设备属性。

## 调整 Tailscale 访问规则

设置好 Jamf Pro 态势集成、且你的设备已拥有反映 Jamf Pro 所上报信号的设备态势属性后，你就可以将这些设备态势属性用于你的态势规则。

例如，要只允许受 Jamf Pro 积极管理并被监管（supervised）的设备访问 `tag:production`，你可以创建一个新的态势（posture），并将其用在相应的访问规则中：

```json
"postures": {
  "posture:trusted": [
    "jamfPro:remoteManaged == true",
    "jamfPro:supervised == true",
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

[co-device-posture-get-via-api]: https://tailscale.com/api#tag/devices/GET/device/{deviceId}/attributes

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture-postures-and-conditions]: /docs/features/device-posture/postures-in-access-rules

[docs-device-posture]: /docs/features/device-posture

[xt-jamfpro]: https://www.jamf.com/products/jamf-pro/
