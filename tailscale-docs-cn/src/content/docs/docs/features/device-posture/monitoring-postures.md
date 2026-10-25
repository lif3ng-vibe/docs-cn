---
title: "设备态势的监控与警报"
description: "Tailnet 管理员可以使用管理控制台或 Tailscale API 查看网络中设备的设备态势状态，并配置警报，帮助管理员和最终用户排查因未通过态势检查而导致的连接问题"
---

最后验证于 Oct 1, 2026

Tailnet 管理员可以使用管理控制台或 Tailscale API 查看网络中设备的设备态势状态，并配置警报，帮助管理员和最终用户排查因未通过态势检查而导致的连接问题。

## 查看设备态势状态

使用管理控制台或 Tailscale API 查看机器的设备态势状态。

### 在管理控制台中查看

在 Tailscale 管理控制台中，你可以查看网络中任意机器的设备态势状态。

查看设备态势状态的步骤：

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 找到你想查看设备态势的机器。你可以使用[搜索栏][docs-filter-devices-search-bar]或[筛选器][docs-filter-devices]来查找机器。
3. 选中该机器。
4. 在机器页面的 **Device Postures** 区域查看设备态势状态。

你可以查看全部态势，也可以在已通过的态势、未通过的态势以及未通过且会阻断访问的态势之间进行筛选。

选中某个态势即可查看其详情。详情包括该态势要求的断言（assertion）、该机器上对应的设备属性值，以及适用于该机器且要求此态势的策略文件规则数量。

选择该图标可查看态势定义、搜索要求该态势的授权（grant），并查看其他未通过该态势的机器。

### 使用 Tailscale API 查看

使用 Tailscale API，你可以查看网络中任意机器的设备态势状态。

要查看网络中所有设备的设备态势状态，使用 devices API 并传入 `fields=postureStatus` 作为 URL 查询参数。例如：

```shell
curl 'https://api.tailscale.com/api/v2/tailnet/-/devices?fields=id,postureStatus' \
  --header 'Authorization: Bearer <api-access-token>
```

要查看网络中单台设备的设备态势状态，使用 device API 并传入 `fields=postureStatus` 作为 URL 查询参数。例如：

```shell
curl 'https://api.tailscale.com/api/v2/device/{deviceId}?fields=id,postureStatus' \
  --header 'Authorization: Bearer <api-access-token>
```

## 查找未通过态势的设备

使用管理控制台或 Tailscale API 查找未通过某个态势的设备。

### 在管理控制台中查找设备

在 Tailscale 管理控制台中，你可以查找未通过特定态势的设备。

查找未通过特定态势的设备的步骤：

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 选择 **Filters**。
3. 选择 **Failing posture**。
4. 选择一个或多个态势。

机器列表会自动筛选，仅显示未通过所有所选态势的设备。

### 使用 Tailscale API 查找设备

使用 Tailscale API，你可以查找未通过特定态势的设备。使用 devices API 并传入 `failingPostures={postureName}` 作为 URL 查询参数。
下面的示例查找未通过 `anyMac` 态势的设备。

```shell
curl 'https://api.tailscale.com/api/v2/tailnet/-/devices?failingPostures=posture:anyMac' \
  --header 'Authorization: Bearer <api-access-token>
```

要查找未通过多个态势的设备，多次传入该 URL 查询参数，每个态势传一次。例如：

```shell
curl 'https://api.tailscale.com/api/v2/tailnet/-/devices?failingPostures=posture:anyMac&failingPostures=posture:autoUpdateMac' \
  --header 'Authorization: Bearer <api-access-token>
```

## 为设备启用控制台徽标

> **注意**：设备态势未通过的控制台徽标功能目前处于 beta 阶段。

你可以启用在 Tailscale 管理控制台中显示的徽标，用于标记未通过特定态势的设备。这能让你快速确定哪些设备未通过重要态势。

你可以在策略文件（tailnet policy file）中配置这些徽标。

### 控制台徽标的策略文件语法

要在 JSON 中配置徽标，在态势的 `onFailure` 配置的 `showAlerts` 列表中添加 `badge-in-console`：

```json
"posture:anyMac": {
  "assertions": [
    "node:os == 'macos'",
    "node:tsReleaseTrack == 'stable'",
  ],
  "onFailure": {
    "showAlerts": ["badge-in-console"],
  },
},
```

> **注意：**
>
> 如果你之前以断言列表的形式存储态势，必须转换为对象语法才能在控制台中获得徽标。

### 在可视化策略编辑器中启用徽标

在可视化策略编辑器中配置徽标的步骤：

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。
2. 选择 **Definitions**。
3. 选择 **Device posture**。
4. 找到你想编辑的态势，选择其菜单，然后选择 **Edit**。
5. 找到 **Failure behavior** 区域，选择 **Display badge in Machines view**。
6. 选择 **Save device posture**。

## 发送警告或通知

> **注意**：设备态势未通过的警告或通知功能目前处于 beta 阶段。

你可以配置态势，在设备未通过态势时向最终用户客户端发送带自定义消息的警告或通知。
你可以在策略文件中按态势逐个配置这些消息。

只有当未通过的态势会影响客户端的连接时，消息才会发送到客户端。如果某台设备未通过某个态势，但没有任何要求该态势的授权作用于这台设备，则该设备不会收到消息。

如果设备未通过某个态势，Tailscale 客户端图标上会显示警告。设备用户可以打开应用查看自定义消息。

你还可以将消息配置为推送通知，这样即使用户不打开 Tailscale 应用也能看到消息。

> **注意：**
>
> Windows 版 Tailscale 客户端不支持显示关于未通过态势的警告或通知。

### 警告与通知的策略文件语法

你可以在态势的 `onFailure` 部分配置消息与通知。

要指定设备未通过态势时发送给用户的消息，添加 `endUserMessage` 键并填入你的自定义消息。

要在设备未通过态势时在 Tailscale 客户端图标上显示警告，向 `showAlerts` 键添加 `warn-in-client` 值。

要在设备未通过态势时向用户发送推送通知，向 `showAlerts` 键添加 `notify-in-client` 值。

下面的示例在设备未通过 `upToDateMac` 态势时，在 Tailscale 客户端图标上显示警告，并向用户发送自定义消息。

```json
"posture:upToDateMac": {
  "assertions": [
    "node:os == 'macos'",
    "node:osVersion >= '26.7.0'",,
  ],
  "onFailure": {
    "showAlerts": ["warn-in-client"],
    "endUserMessage": "You need to update your Mac. Contact IT helpdesk for detailed instructions."
  },
},
```

> **注意：**
>
> 如果你之前以断言列表的形式存储态势，必须转换为对象语法才能配置消息与通知。

### 使用可视化策略编辑器配置消息

在可视化策略编辑器中配置最终用户消息的步骤：

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。
2. 选择 **Definitions**。
3. 选择 **Device posture**。
4. 找到你想编辑的态势，选择其菜单，然后选择 **Edit**。
5. 找到 **Failure behavior** 区域，选择 **Display message**。
6. 输入当用户设备未通过态势时向其展示的消息
7. （可选）选择 **Push notification**，以发送通知而不是警告

[docs-filter-devices-search-bar]: /docs/features/access-control/device-management/how-to/filter#filter-with-the-search-bar

[docs-filter-devices]: /docs/features/access-control/device-management/how-to/filter
