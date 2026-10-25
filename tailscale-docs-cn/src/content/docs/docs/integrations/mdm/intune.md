---
title: "使用 Microsoft Intune 限制设备访问"
description: "[Microsoft Intune][xt-intune] 从设备上安装的 MDM 配置文件中收集一系列信号，这些信号可用于确定设备的安全态势。Tailscale 可以从 Intune 获取这些信号，并将其用作访问规则中的设备态势属性。"
---

最后验证于 Jan 28, 2026

> **注意：** 本集成适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

[Microsoft Intune][xt-intune] 从设备上安装的 MDM 配置文件中收集一系列信号，这些信号可用于确定设备的安全态势（device posture）。Tailscale 可以从 Intune 获取这些信号，并将其用作访问规则中的设备态势属性，从而让组织只向信任级别足够高的设备授予对敏感资源的访问权限。

你可以借助 Tailscale 的[设备态势管理][docs-device-posture]功能来实现这一点：

* [设备身份收集][docs-device-identity-collection]（Device Identity Collection）：收集标识符（例如序列号），用于将 Tailscale 中的设备与 Intune 中的设备进行匹配。
* Intune 态势集成：将来自 Intune 的信号同步到 Tailscale 中的设备态势属性。
* [访问规则中的态势条件][docs-device-posture-postures-and-conditions]：让你可以基于设备属性配置访问限制。

本指南介绍如何为你的 Tailscale 网络（tailnet）启用设备身份收集，以及如何配置 Microsoft Intune 态势集成。

## 什么是 Intune 态势集成？

Intune 集成会按固定周期在 Intune 与 Tailscale 之间同步数据。
每次同步时，Tailscale 会执行以下操作：

1. 从你的 Intune 账户获取主机列表及其上报的数据。
2. 根据序列号将 Intune 设备与 tailnet 中的设备进行匹配。
3. 将 Intune 数据写入每台匹配设备上的设备态势属性。

该集成会向匹配的设备写入以下设备态势属性：

\[Missing snippet: attributes-intune.mdx]

## 前提条件

在设置 Microsoft Intune 集成之前，请确保：

* 已启用[设备身份收集][docs-device-identity-collection]，并且 tailnet 中的设备正在上报标识符。
* 拥有用于连接 Microsoft Intune 的 Azure 应用程序凭据。

## 创建用于连接 Intune 的 Azure 应用程序凭据

要向 Tailscale 验证你的 Intune 账户，你需要创建一组 [Azure 应用程序凭据][xt-microsoft-azure-portal]。Microsoft Intune 集成使用这些凭据连接 [Microsoft Graph API][xt-microsoft-graph-api]，并从 Intune 获取设备列表及其数据。

要创建 Azure 应用程序和凭据：

1. 在 [Azure Portal][xt-microsoft-azure-portal] 的 **Azure Services** 菜单中，选择 **应用注册**（App registrations）。

2. 选择 **新建注册**（New registration）。

3. 为应用程序输入一个名称（例如 `Tailscale`），然后选择 **注册**（Register）。记下 **应用程序（客户端）ID**（Application (Client) ID）和**目录（租户）ID**（Directory (Tenant) ID），稍后会用到。

4. 在 **Essentials** 下方，选择 **添加证书或机密**（Add a certificate or secret）。

5. 选择 **新建客户端机密**（New client secret）。

6. 为该机密输入描述，选择一个有效期，然后选择 **添加**（Add）。记下 **值**（Value），稍后会用到。

7. 在 **API 权限**（API permissions）下方，选择 **添加权限**（Add a permission）。

8. 选择 **Microsoft Graph**。

9. 选择 **应用程序权限**（Application permissions）。

10. 搜索并选择 **DeviceManagementManagedDevices.Read.All**，然后选择 **添加权限**（Add permissions）。

11. 选择 **为你的组织授予管理员同意**（Grant admin consent for *your-organization*），然后选择 **是**（Yes）。

## 配置 Intune 态势集成

若要配置 Tailscale 从 Intune 获取设备数据：

1. 打开 Tailscale 管理控制台的[设备管理](https://console.tailscale.com/admin/settings/device-management)页面。
2. 在 **设备态势集成**（Device Posture Integrations）部分，找到 Intune 集成，然后选择 **连接**（Connect）。
3. 选择你的 **Microsoft 区域**（Microsoft Region），即你的 Intune 账户所在区域。
4. 输入你的 **应用程序（客户端）ID**、**目录（租户）ID** 和 **客户端机密**（Client Secret）。

   *（图：从 Tailscale 管理控制台连接 Intune 的配置界面。）*
5. 选择 **连接到 Intune**（Connect to Intune）。

## 查看集成状态

接下来，确认 Intune 集成已成功运行。

1. 前往[设备管理](https://console.tailscale.com/admin/settings/device-management)页面的 **设备态势集成** 部分。
2. 在 **集成**（Integrations）部分下找到 Intune 集成。

Intune 集成成功运行后，会显示最近一次同步的时间、已同步的设备数量，以及同步过程中发生的任何错误。

*（图：集成：Microsoft Intune：上次同步于 4 分钟前，在 2 台带有标识符的 Tailscale 设备与 3 台 Intune 设备之间匹配到 1 台。）*

## 检查设备属性

设置好 Microsoft Intune 集成后，你可以在 Tailscale 管理控制台中确认 Tailscale 正在为你的 Intune 设备写入新的设备属性。

1. 打开 Tailscale 管理控制台的[机器](https://console.tailscale.com/admin/machines)页面。
2. 选择要检查的设备。
3. 该设备的设备属性位于 **机器详情**（Machine Details）部分。其中应包含前面列出的那组 `intune:` 属性。

*（图：机器页面中设备属性的视图。）*

> **提示：**
>
> 你也可以使用 [Tailscale API][co-device-posture-get-via-api] 检查设备属性。

## 调整 Tailscale 访问规则

设置好 Intune 态势集成、并且你的设备已拥有反映 Intune 所上报信号的设备态势属性之后，你就可以将这些设备态势属性用作态势规则的一部分。

例如，若要只允许 Intune 上报为合规且受 Intune 监管的设备访问 `tag:production`，你可以创建一个新的态势（posture），并将其用作相应访问规则的一部分：

```json
"postures": {
  "posture:trusted": [
    "intune:complianceState == 'compliant'",
    "intune:isSupervised == true",
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

## 局限性

我们观察到，对于某些运行 Linux 的机器，Intune 不会上报其序列号。缺少序列号信息时，Tailscale 将无法为这些机器填充设备态势属性。

\[Missing snippet: auditlogs-integrations.mdx]

[co-device-posture-get-via-api]: https://tailscale.com/api#tag/devices/GET/device/{deviceId}/attributes

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture-postures-and-conditions]: /docs/features/device-posture/postures-in-access-rules

[docs-device-posture]: /docs/features/device-posture

[xt-intune]: https://www.microsoft.com/en-us/security/business/microsoft-intune

[xt-microsoft-azure-portal]: https://portal.azure.com/

[xt-microsoft-graph-api]: https://learn.microsoft.com/en-us/graph/use-the-api
