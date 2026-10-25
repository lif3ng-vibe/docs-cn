---
title: "使用 Iru 限制设备访问"
description: "将 Iru（前称 Kandji）上报的信号用作设备态势属性，以用于访问规则。"
---

最后验证于 Jan 28, 2026

> **注意：** 此集成适用于[标准版、高级版和企业版套餐](https://tailscale.com/pricing)。

> **注意：**
>
> Iru 的前称是 Kandji。在说明文档、代码示例和用户界面中，你可能仍会看到多处 Kandji 的提法。

[Iru][xt-iru] 通过安装在每个设备上的代理采集一系列信号，可用于判定设备的安全态势。Tailscale 可以从 Iru 获取这些信号，并将其用作访问规则中的设备态势属性，从而让组织只向具有高信任级别的设备授予对敏感资源的访问权限。

你可以借助 Tailscale 的[设备态势管理][docs-device-posture]功能实现这一点：

* Kandji 态势集成，将 Kandji 的信号同步到 Tailscale 中的设备态势属性。
* [设备身份收集（Device Identity Collection）][docs-device-identity-collection]，采集标识符（例如序列号），用于将 Tailscale 中的设备与 Kandji 中的设备进行匹配。
* [访问规则中的态势条件][docs-device-posture-postures-and-conditions]，支持基于设备属性配置访问限制。

本指南介绍如何为你的 Tailscale 网络（tailnet）启用设备身份收集，以及如何配置 Kandji 态势集成。

## 什么是 Kandji 态势集成？

Kandji 态势集成让你可以将 Tailscale 网络连接到 Kandji。该集成会周期性运行，并将 Kandji 的信号复制到设备态势属性。

配置完成后，它会周期性地：

* 获取你的 Kandji 账户中记录的设备列表及其详情。
* 根据设备关联的序列号，将 Kandji 设备与你 tailnet 中的对应设备进行匹配。
* 将每台设备的数据写入以下 Tailscale 设备态势属性：

\[Missing snippet: attributes-kandji.mdx]

## 前提条件

在设置 Kandji 集成之前，请确保你已具备：

* 已启用[设备身份收集][docs-device-identity-collection]，并且 tailnet 中的设备正在上报标识符。
* 一个你有权创建 API 令牌的 Kandji 账户。

## 创建 Kandji API 令牌

要将你的 Kandji 账户与 Tailscale 进行认证，你需要创建一个 Kandji API 令牌。
Kandji 集成会使用它从 Kandji 获取设备列表及其数据。

创建 Kandji API 令牌的方法：

1. 在 Kandji 中，在左侧面板选择 **Settings**。

2. 在顶部菜单中选择 **Access**，然后选择 **Add Token**。

3. 为 API 令牌添加名称，然后选择 **Create**。

   *（图：Kandji 的 Add an API token 对话框）*

4. **API Token** 只会显示一次，务必复制保存以备后用，然后选择 **Next**。

5. 在新对话框中，选择 **Configure** 来配置该 API 令牌的权限。

6. 在 **Prism** 下，选择 **Device Information**（`/api/v1/prism/device_information`），然后在右上角选择 **Save**。

7. 在 **Access** 下，记下你组织的 API URL，例如 `https://your-organization.api.kandji.io`。

## 配置 Kandji 态势集成

要让 Tailscale 从 Kandji 获取设备数据：

1. 打开 Tailscale 管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面。

2. 在 **Device Posture Integrations** 区域，找到 Kandji 集成，然后选择 **Connect**。

3. 输入你的 **Kandji API URL**，即你用于访问 Kandji 控制台的 URL。

4. 输入你的 **API Token**。

   *（图：在 Tailscale 管理控制台中连接 Kandji 的配置界面。）*

5. 选择 **Connect to Kandji**。

## 检查集成状态

接下来，确认 Kandji 集成已成功运行。

1. 前往 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面的 **Device Posture Integrations** 区域。
2. 在 **Integrations** 区域下找到 Kandji 集成。

Kandji 集成成功运行后，会显示最近一次同步的时间、已同步的设备数量，以及同步过程中发生的任何错误。

*（图：Integrations: Kandji：Last sync 为 4 分钟前，2 台带标识符的 Tailscale 设备与 3 台 Kandji 设备之间匹配到 1 台）*

## 检查设备属性

设置好 Kandji 集成后，你可以在 Tailscale 管理控制台中确认 Tailscale 正在为你的 Kandji 设备写入新的设备属性。

1. 打开 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 选择要检查的设备。
3. 该设备的设备属性位于 **Machine Details** 区域。其中应包含前面列出的 `kandji:` 属性集合。

*（图：Machines 页面中机器属性的视图。）*

> **提示：**
>
> 你也可以使用 [Tailscale API][co-device-posture-get-via-api] 检查设备属性。

## 调整 Tailscale 访问规则

设置好 Kandji 态势集成、且你的设备已拥有反映 Kandji 所上报信号的设备态势属性后，你就可以将这些设备态势属性用于你的态势规则。

例如，要只允许拥有活跃 Kandji 代理的设备访问 `tag:production`，你可以创建一个新的态势（posture），并将其用在相应的访问规则中：

```json
"postures": {
  "posture:trusted": [
    "kandji:agentInstalled == true",
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

[xt-iru]: https://www.iru.com/
