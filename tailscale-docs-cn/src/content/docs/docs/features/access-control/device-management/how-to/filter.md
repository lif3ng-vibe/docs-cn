---
title: "在管理控制台中筛选设备"
description: "管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中的设备支持筛选，便于更轻松地找到符合特定条件的设备。"
---

最后验证于 Jan 5, 2026

管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中的设备支持筛选，便于更轻松地找到符合特定条件的设备。

*（图：管理控制台示例，设置了 "Attribute: Tailscale SSH"、"Managed by: tag:server" 和 "Version: Older than 1.26.2" 筛选条件。）*

支持按以下条件筛选：

* **Property**：设备是否为[临时节点][docs-ephemeral-nodes]、[出口节点][docs-exit-nodes]、[子网路由器][docs-subnets]，是否启用了 [Tailscale SSH][docs-tailscale-ssh]，或是否[禁用了密钥过期][docs-key-expiry]。

* **Last seen**：设备当前是否连接、未连接、最后出现早于指定单位数，或在最近指定单位数内出现过。对于"早于"和"最近"两种条件，单位可以是分钟、小时、天、周或年。

* **Managed by**：设备是否由指定用户管理，或具有指定[标签][docs-tags]。

* **Shared**：设备是否[共享][docs-sharing]到你的 tailnet、由你的 tailnet 共享出去，或完全未共享。

* **Disabled**：设备是否[密钥已过期][docs-key-expiry]、需要[审批][docs-device-approval]，或由[被停用用户][docs-remove-team-members-suspending-users]管理。

* **Version**：设备的 Tailscale 客户端是否为指定[版本][docs-versions]、晚于指定版本、早于指定版本，或有常规或安全[更新][docs-update]可用。

* **OS**：设备是否运行特定操作系统（Windows、macOS、Linux、iOS、Android、tvOS、FreeBSD、Illumos、OpenBSD、NetBSD、Solaris、AIX、JS）。

* **OS Version**：设备的操作系统版本是否为指定版本、晚于指定版本或早于指定版本。

* **Auto-update**：设备的 Tailscale 客户端是否启用了自动更新。

* **Posture Identity**：是否已收集[设备身份][docs-manage-identity]。

此外，[Machines](https://console.tailscale.com/admin/machines) 页面的搜索栏支持对机器名称、主机名、Tailscale IP 地址、管理与创建者用户、操作系统和 Tailscale 客户端版本进行自由文本搜索，也支持上述筛选条件的文本等价形式。

## 筛选与 URL 查询

使用筛选器时，[Machines](https://console.tailscale.com/admin/machines) 页面的当前 URL 会包含一个查询字符串，代表筛选参数。

例如，在不应用任何筛选器的情况下打开 **Machines** 页面，当前 URL 为：

* `https://console.tailscale.com/admin/machines`

添加一个 Managed by 筛选器来查找由 Alice 或 Bob 管理的机器后，当前 URL 会追加查询字符串：

* `https://console.tailscale.com/admin/machines?q=managedby%3Aalice%40example.com%2Cbob%40example.com`

你可以通过复制当前 URL 来保存筛选条件。

有关筛选 URL 中可出现的文本字符串列表，参见[文本筛选][ar-text-filters]。

## 筛选的 AND 逻辑与 OR 逻辑

多个筛选器之间按交集处理。例如，同时应用"查找临时节点"和"查找最近 5 天内出现过的机器"两个筛选器，将返回既是临时节点、又是在最近 5 天内最后出现的机器集合（`property:ephemeral-node lastseen:<5d`）。

支持多值的筛选器按并集处理。例如，应用 Managed by 筛选器查找由 Alice、Bob 或标签 `builder` 管理的机器，将返回由 Alice 或 Bob 或标签 `builder` 管理的机器集合（`managedby:alice@example.com,bob@example.com,tag:builder`）。

再举一例，以下筛选组合返回由 Alice 或 Bob 管理、且在最近 5 天内出现过的机器集合：

* `managedby:alice@example.com,bob@example.com lastseen:<5d`

## 使用筛选器

在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中，通过 UI 筛选器、搜索栏或两者结合创建查询来筛选设备。同一次查询中也可以使用多个筛选器。

### 按 Property 筛选

1. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择 **Filters**，再选择 **Property**。
2. 为筛选器选择一个或多个属性：

   * **Ephemeral node**：匹配属于[临时节点][docs-ephemeral-nodes]的设备。
   * **Exit node**：匹配属于[出口节点][docs-exit-nodes]的设备。
   * **Subnet**：匹配属于[子网路由器][docs-subnets]的设备。
   * **Peer Relay**：匹配属于[对等中继（peer relay）][docs-peer-relay]的设备。
   * **Tailscale SSH**：匹配已启用 [Tailscale SSH][docs-tailscale-ssh] 的设备。
   * **Tailscale Funnel**：匹配正在运行 [Tailscale Funnel][docs-funnel] 服务器的设备。
   * **Expiry disabled**：匹配已[禁用密钥过期][docs-key-expiry]的设备。
   * **Signing node**：匹配能够[为新节点签名][docs-tailnet-lock-add-signing-node]以批准其访问 tailnet 的设备。

在 **Property** 筛选器中不能多选条件。

### 按 Last seen 筛选

1. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择 **Filters**，再选择 **Last seen**。
2. 为筛选器选择一个连接状态或最后出现条件：

   * **Currently connected**：匹配当前已连接到你的 tailnet 的设备。
   * **Not currently connected**：匹配当前未连接到你的 tailnet 的设备。
   * **In the last**：匹配在最近指定单位数内出现过的设备。可用单位为 **m**、**h**、**d**、**w** 或 **y**，分别表示分钟、小时、天、周或年。例如 **3h**。
   * **Before the last**：匹配最后出现时间早于指定单位数的设备。可用单位为 **m**、**h**、**d**、**w** 或 **y**，分别表示分钟、小时、天、周或年。例如 **5d**。

在 **Last seen** 筛选器中不能多选条件。

### 按 Managed by 筛选

1. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择 **Filters**，再选择 **Managed by**。
2. 为筛选器选择用户和/或标签。该筛选器匹配由任一所选用户或标签管理的设备。

在 **Managed by** 筛选器中可以多选条件。

### 按 Shared 筛选

1. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择 **Filters**，再选择 **Shared**。
2. 为筛选器选择一个共享状态：

   * **Not shared**：匹配你的 tailnet 中未[共享][docs-sharing]的设备。
   * **Shared with me**：匹配由他人共享到你的 tailnet 的设备。
   * **Shared by me**：匹配你的 tailnet 中共享给其他 tailnet 用户的设备。注意，如果你发出了共享设备的邀请但无人接受，该设备尚不算已共享。

在 **Shared** 筛选器中不能多选条件。

### 按 Disabled 筛选

1. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择 **Filters**，再选择 **Disabled**。
2. 为筛选器选择禁用状态：

   * **Expired**：匹配[密钥已过期][docs-key-expiry]的设备。
   * **Needs approval**：匹配需要[审批][docs-device-approval]的设备。
   * **User suspended**：匹配由[被停用用户][docs-remove-team-members-suspending-users]管理的设备。
   * **User needs approval**：匹配由[待批准用户][docs-user-approval]管理的设备。
   * **Locked out**：匹配在启用了 [Tailnet Lock][docs-tailnet-lock] 的 tailnet 中需要被[签名][docs-tailnet-lock-add]的设备。

在 **Disabled** 筛选器中不能多选条件。

### 按 Version 筛选

1. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择 **Filters**，再选择 **Version**。
2. 为筛选器选择 Tailscale 客户端[版本][docs-versions]条件：

   * **Is**：匹配具有指定版本的设备（含各补丁版本）。例如，值 `1.32` 可匹配 `1.32` 和 `1.32.2`。
   * **Newer than**：匹配版本晚于指定版本的设备。
   * **Older than**：匹配版本早于指定版本的设备。
   * **Update available**：匹配有可用[更新][docs-update]的设备。
   * **Security update available**：匹配有可用安全[更新][docs-update]的设备。

在 **Version** 筛选器中不能多选条件。

### 按 OS 筛选

1. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择 **Filters**，再选择 **OS**。
2. 为筛选器选择操作系统条件。该筛选器匹配预定义的操作系统列表。

在 **OS** 筛选器中可以多选条件。

### 按 OS Version 筛选

1. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择 **Filters**，再选择 **OS Version**。
2. 为筛选器选择操作系统版本条件：

   * **Is**：匹配具有指定版本的设备。
   * **Newer than**：匹配版本晚于指定版本的设备。
   * **Older than**：匹配版本早于指定版本的设备。

在 **OS Version** 筛选器中不能多选条件。

## 按 Auto-update 筛选

1. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择 **Filters**，再选择 **Auto-update**。
2. 为筛选器选择一个自动更新状态：

   * **Enabled**：匹配已启用自动更新的设备。
   * **Disabled**：匹配已禁用自动更新的设备。

在 **Auto-update** 筛选器中不能多选条件。

## 按 Posture Identity 筛选

1. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择 **Filters**，再选择 **Posture Identity**。
2. 为筛选器选择条件：

   * **Needs upgrade**：Tailscale 客户端需要升级。序列号收集功能在 Tailscale v1.52 中加入。
   * **Not collected**：尚未收集态势身份。如果你刚启用态势检查，可能需要重启 Tailscale 才能收集序列号。
   * **Not enabled on machine**：态势检查已禁用。
   * **Has posture identity**：态势检查返回了有效序列号。
   * **Empty posture identity**：态势检查返回了无效序列号（例如 "default"）。

在 **Posture Identity** 筛选器中不能多选条件。

## 使用搜索栏筛选

1. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在搜索栏内点击。
2. 输入文本字符串并按 Enter。搜索文本不区分大小写。

   搜索会返回在以下至少一个字段中包含搜索文本的设备列表：

   * 机器名称
   * 主机名
   * Tailscale IP 地址
   * 创建者（将该机器加入 tailnet 并管理该机器的用户）
   * 操作系统
   * Tailscale 客户端版本

搜索文本并非精确字符串匹配——只要设备在上述一个或多个字段中包含搜索文本，就会进入搜索结果。例如，在搜索栏中使用 `1.10` 会匹配版本号中包含 `1.10` 的机器（如 `1.10.2`），也会匹配上述其他字段中包含 `1.10` 的设备。同样，在搜索栏中使用 `Bob` 会匹配上述任意字段中包含 `bob`（不区分大小写）的设备。

不能同时组合多个自由文本搜索筛选器。例如，即使你有运行 Tailscale v1.32.2 且由 Alice 管理的机器，用自由文本 `1.32.2 alice` 搜索也不会返回任何结果。不过，你可以应用文本筛选器，构造 `version:=1.32.2 managedby:alice` 这样的搜索字符串来找到这些机器。

## 使用文本筛选

下表列出了在管理控制台 [Machines](https://console.tailscale.com/admin/machines) 页面使用各筛选器后生成的 URL 查询字符串。你也可以把这些文本字符串直接输入搜索栏。

| 筛选条件 | 说明 |
| --- | --- |
| `auto-update:enabled` | 匹配客户端已设置为自动更新的设备。 |
| `auto-update:disabled` | 匹配客户端已设置为不自动更新的设备。 |
| `property:ephemeral-node` | 匹配属于[临时节点][docs-ephemeral-nodes]的设备。 |
| `property:exit-node` | 匹配属于[出口节点][docs-exit-nodes]的设备。 |
| `property:expiry-disabled` | 匹配已[禁用密钥过期][docs-key-expiry]的设备。 |
| `property:signing-node` | 匹配能够[为新节点签名][docs-tailnet-lock-add-signing-node]以批准其访问 tailnet 的设备。 |
| `property:subnet` | 匹配属于[子网路由器][docs-subnets]的设备。 |
| `property:tailscale-funnel` | 匹配正在运行 [Tailscale Funnel][docs-funnel] 服务器的设备。 |
| `property:tailscale-ssh` | 匹配已启用 [Tailscale SSH][docs-tailscale-ssh] 的设备。 |
| `disabled:expired` | 匹配[密钥已过期][docs-key-expiry]的设备。 |
| `disabled:needs-approval` | 匹配需要[审批][docs-device-approval]的设备。 |
| `disabled:user-suspended` | 匹配由[被停用用户][docs-remove-team-members-suspending-users]管理的设备。 |
| `lastseen:<value` | 匹配最后出现时间早于指定单位数的设备。可用单位为 **m**、**h**、**d**、**w** 或 **y**，分别表示分钟、小时、天、周或年。例如 **5d**。 |
| `lastseen:>value` | 匹配在最近指定单位数内出现过的设备。可用单位为 **m**、**h**、**d**、**w** 或 **y**，分别表示分钟、小时、天、周或年。例如 **3h**。 |
| `lastseen:connected` | 匹配当前已连接到你的 tailnet 的设备。 |
| `lastseen:not-connected` | 匹配当前未连接到你的 tailnet 的设备。 |
| `managedby:value[,]` | 匹配由指定用户管理或具有指定[标签][docs-tags]的设备。多个值以逗号分隔列出。 |
| `os:value[,]` | 匹配具有指定操作系统的设备。 |
| `osversion:<value` | 匹配操作系统版本早于指定版本的设备。 |
| `osversion:=value` | 匹配具有指定操作系统版本的设备。 |
| `osversion:>value` | 匹配操作系统版本晚于指定版本的设备。 |
| `postureidentity:needs-upgrade` | 匹配需要升级客户端才能支持收集的设备。 |
| `postureidentity:not-collected` | 匹配尚未提供有效序列号的设备。 |
| `postureidentity:not-enabled` | 匹配已禁用态势检查的设备。 |
| `postureidentity:has-posture-identity` | 匹配具有有效序列号的设备。 |
| `postureidentity:empty-posture-identity` | 匹配序列号无效的设备。 |
| `shared:in` | 匹配由他人共享、已共享到你的 tailnet 的设备。 |
| `shared:not-shared` | 匹配你的 tailnet 中未共享的设备。 |
| `shared:out` | 匹配你的 tailnet 中共享给其他 tailnet 用户的设备。注意，如果你发出了共享设备的邀请但无人接受，该设备尚不算已共享。 |
| `version:<value` | 匹配版本早于指定版本的设备。 |
| `version:=value` | 匹配具有指定版本的设备（含各补丁版本）。例如，值 `1.32` 可匹配 `1.32` 和 `1.32.2`。 |
| `version:>value` | 匹配版本晚于指定版本的设备。 |
| `version:update-available` | 匹配有可用[更新][docs-update]的设备。 |
| `version:security-update-available` | 匹配有可用安全[更新][docs-update]的设备。 |

## 移除筛选器

要移除单个筛选器，请在搜索栏下方选择要移除的筛选器对应的 **x**。

要移除全部筛选器，请在搜索栏内选择 **x**。

[ar-text-filters]: #使用文本筛选

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-funnel]: /docs/features/tailscale-funnel

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-manage-identity]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-peer-relay]: /docs/features/peer-relay

[docs-remove-team-members-suspending-users]: /docs/features/sharing/how-to/remove-team-members#suspending-users

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-lock-add-signing-node]: /docs/features/tailnet-lock#add-a-signing-node

[docs-tailnet-lock-add]: /docs/features/tailnet-lock#add-a-node-to-a-locked-tailnet

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-update]: /docs/features/client/update

[docs-user-approval]: /docs/features/access-control/user-approval

[docs-versions]: /docs/reference/tailscale-client-versions
