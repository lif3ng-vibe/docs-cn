---
title: "使用 1Password Extended Access Management（XAM）限制设备访问"
description: "将 1Password Extended Access Management（XAM）上报的信号用作设备态势属性，以用于访问规则。"
---

最后验证于 Jan 28, 2026

> **注意：** 此集成适用于[标准版、高级版和企业版套餐](https://tailscale.com/pricing)。

[1Password Extended Access Management][xt-1p-xam]（前称 [Kolide][xt-kolide]）通过安装在每个设备上的代理采集一系列信号，可用于判定设备的安全态势。Tailscale 可以从 XAM 获取这些信号，并将其用作访问规则中的设备态势属性，从而让组织只向具有高信任级别的设备授予对敏感资源的访问权限。

你可以借助 Tailscale 的[设备态势管理][docs-device-posture]功能实现这一点：

* [设备身份收集（Device Identity Collection）][docs-device-identity-collection]，采集标识符（例如序列号），用于将 Tailscale 中的设备与 XAM 中的设备进行匹配。
* XAM 态势集成，将 XAM 的信号同步到 Tailscale 中的设备态势属性。
* [访问规则中的态势条件][docs-device-posture-postures-and-conditions]，让你可以基于设备属性配置访问限制。

本指南介绍如何为你的 Tailscale 网络（tailnet）启用设备身份收集，以及如何配置 XAM 态势集成。

## 什么是 1Password XAM（Kolide）态势集成？

1Password XAM（Kolide）集成按周期性计划在 XAM 与 Tailscale 之间同步数据。
每次同步期间，Tailscale 会执行以下操作：

1. 从你的 XAM 账户获取主机列表及其上报的数据。
2. 根据序列号将 XAM 设备与你 tailnet 中的设备进行匹配。
3. 将 XAM 数据写入每台匹配设备的设备态势属性。

该集成会向匹配的设备写入以下设备态势属性：

\[Missing snippet: attributes-kolide.mdx]

## 前提条件

在设置 1Password XAM（Kolide）集成之前，请确保你已具备：

* 已启用[设备身份收集][docs-device-identity-collection]，并且 tailnet 中的设备正在上报标识符。
* 一个你有权创建 API 密钥的 1Password XAM（Kolide）账户。

## 创建 1Password XAM（Kolide）API 密钥

要将你的 1Password XAM（Kolide）账户与 Tailscale 进行认证，你需要创建一个 1Password XAM（Kolide）API 密钥。
1Password XAM（Kolide）集成会使用它从 1Password XAM（Kolide）获取设备列表及其数据。

创建 1Password XAM（Kolide）API 密钥的方法：

1. 在 [1Password XAM（Kolide）界面][xt-kolide-app]的右上角选择你的用户头像。

2. 在下拉菜单中，选择 **Settings**。

3. 在左侧菜单中，选择 **Developers**。

4. 在出现的子菜单中，选择 **API Keys**。

5. 在下一个界面中，选择 **Create New Key**。

6. 在弹出的模态框中，为密钥提供一个名称，并填写负责该 API 密钥使用情况的 XAM 管理员姓名，然后选择 **Save**。

7. 保存后，秘密令牌会显示在表格中。选择复制按钮，将令牌复制到剪贴板。

## 配置 1Password XAM（Kolide）态势集成

要让 Tailscale 从 1Password XAM（Kolide）获取设备数据：

1. 打开 Tailscale 管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面。

2. 在 **Device Posture Integrations** 区域，找到 1Password XAM（Kolide）集成，然后选择 **Connect**。

3. 输入你的 **API Key**。

   *（图：在 Tailscale 管理控制台中连接 1Password XAM (Kolide) 的配置界面。）*

4. 选择 **Connect to 1Password XAM (Kolide)**。

## 检查集成状态

接下来，确认 1Password XAM（Kolide）集成已成功运行。

1. 前往 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面的 **Device Posture Integrations** 区域。
2. 在 **Integrations** 区域下找到 1Password XAM（Kolide）集成。

1Password XAM（Kolide）集成成功运行后，会显示最近一次同步的时间、已同步的设备数量，以及同步过程中发生的任何错误。

*（图：Integrations: 1Password XAM (Kolide)：Last sync 为 4 分钟前，2 台带标识符的 Tailscale 设备与 3 台 1Password XAM (Kolide) 设备之间匹配到 1 台）*

## 检查设备属性

设置好 1Password XAM（Kolide）集成后，你可以在 Tailscale 管理控制台中确认 Tailscale 正在为你的 1Password XAM（Kolide）设备写入新的设备属性。

1. 打开 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 选择要检查的设备。
3. 该设备的设备属性位于 **Machine Details** 区域。其中应包含前面列出的 `kolide:` 属性集合。

*（图：Machines 页面中机器属性的视图。）*

> **提示：**
>
> 你也可以使用 [Tailscale API][co-device-posture-get-via-api] 检查设备属性。

## 调整 Tailscale 访问规则

设置好 1Password XAM（Kolide）态势集成、且你的设备已拥有反映 1Password XAM（Kolide）所上报信号的设备态势属性后，你就可以将这些设备态势属性用于你的态势规则。

例如，要只允许被 1Password XAM（Kolide）代理评定为状态良好的设备访问 `tag:production`，你可以创建一个新的态势（posture），并将其用在相应的访问规则中：

```json
"postures": {
  "posture:trusted": [
    "kolide:authState != 'Blocked'",
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

[xt-1p-xam]: https://1password.com/xam

[xt-kolide-app]: https://app.kolide.com/

[xt-kolide]: https://kolide.com/
