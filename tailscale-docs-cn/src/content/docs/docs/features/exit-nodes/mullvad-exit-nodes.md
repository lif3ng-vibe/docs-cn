---
title: "Mullvad 出口节点"
description: "Mullvad VPN 附加服务让你可以在 Tailscale 网络（即 tailnet）中把 [Mullvad][xt-mullvad-why] VPN 服务器用作[出口节点][docs-exit-nodes]。Mullvad 出口节点的运作方式与常规出口节点类似"
---

最后验证于 Jan 9, 2026

> **注意：**此功能目前处于 beta 阶段。

Mullvad VPN 附加服务让你可以在 Tailscale 网络（即 tailnet）中把 [Mullvad][xt-mullvad-why] VPN 服务器用作[出口节点][docs-exit-nodes]。Mullvad 出口节点的运作方式与常规出口节点类似，但它使用的是 [Mullvad 现有的 VPN 基础设施][xt-mullvad-server-list]，而不是你自己的设备。

Mullvad 出口节点支持与其他出口节点相同的大部分功能，例如[建议出口节点][docs-suggested-exit-nodes]和[强制出口节点][docs-auto-exit-nodes]，但存在一些限制。

## 要求与限制

使用 Mullvad 附加服务前，请了解以下要求与限制：

* 你必须先购买 Mullvad VPN 附加服务，才能访问 Mullvad 出口节点。
* Mullvad 出口节点不兼容[自定义 DERP 服务器][docs-custom-derp-servers]。
* Mullvad 出口节点的访问控制策略不兼容 [Google 同步的群组][docs-google-sso]。
* 如果你将 [Tailnet Lock][docs-tailnet-lock] 与 Mullvad VPN 附加服务配合使用，你必须为每个 Mullvad 出口节点[签名][ar-sign-mullvad-exit-nodes]。
* 如果你使用 [GitOps][docs-gitops-acls] 管理[策略文件][docs-tailnet-policy-file]，Mullvad VPN 附加服务的结账流程可能被锁定。要购买更多许可，前往管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面，然后选择 **Manage add-ons**。
* Windows 版 Tailscale 客户端不支持显示 Mullvad 出口节点的完整列表。你可以使用 [Tailscale CLI][docs-cli] 获取 Mullvad 出口节点的完整列表。
* 你不能同时使用管理控制台和策略文件来[管理 Mullvad 访问][ar-manage-mullvad-access]。如果你用策略文件管理 Mullvad 访问，就必须全部通过策略文件管理。

### 重要的 DNS 注意事项

> **注意：**
>
> Tailscale v1.48.3 及更高版本无需额外配置。

Tailscale v1.48.1 和 v1.48.2 上的 Mullvad 出口节点会使用设备本地的 DNS 配置。因此，除非你配置以下选项之一，否则你可能失去 DNS 访问能力（等同于断网）：

* 为出口节点[允许本地网络访问][docs-exit-node-local-network-access]。
* 添加[全局名称服务器][docs-global-nameserver]并[覆盖 DNS 服务器设置][docs-override-dns-servers]。

配置这两项设置时请注意：

* 覆盖本地 DNS 会让 Tailscale 把所有客户端配置为在 Tailscale 连接期间对所有 DNS 查询使用所选 DNS 服务器，即使你没有在使用出口节点。配合 Mullvad 公共 DNS 名称服务器使用时，这能确保所有 DNS 都经由 Mullvad 路由，并让 [`mullvad.net/check`][xt-mullvad-dns-leaks] 上的 DNS 泄漏检测显示绿色对勾。
* 允许出口节点访问本地网络可能导致 DNS 泄漏，但也能确保本地 DNS 名称（例如本地打印机名或本地 NAS 服务器名）继续可用。

## 数据隐私与匿名性

将 Mullvad 与 Tailscale 配合使用时，你授权 Tailscale 代表你生成、管理、续期和移除 Mullvad 账户。因此，有几点重要的隐私与匿名性考量：

* Tailscale 代表用户生成和管理账户信息。
* Tailscale 是身份感知的（Tailscale 不支持匿名 tailnet）。所有 Tailscale 用户都关联一个邮箱地址或 GitHub 账户。
* Tailscale 知道哪些 Mullvad 账户属于哪些 Tailscale 用户。
* 用户与 Mullvad 服务器建立[加密][docs-encryption]的 [WireGuard][docs-wireguard] 连接。Tailscale 可以通过日志识别哪些用户在连接哪些 Mullvad 服务器。如果设备[选择退出客户端日志][docs-opt-out-logging]，Tailscale 无法得知该设备使用的是哪个 Mullvad 出口节点。与 tailnet 中的任何流量一样，Tailscale 无法访问发送到 Mullvad 服务器的任何用户流量——所有用户流量都在 WireGuard 隧道中加密，Tailscale 无法解密这些信息。
* Mullvad 不会从 Tailscale 接收用户身份信息。

## 可用的 Mullvad 区域

你可以在大多数国家/地区为 tailnet 购买并使用 Mullvad 附加服务，但部分国家和地区除外。如果你的所在区域未被列出，可以订阅[该 GitHub 跟踪 issue][xt-gh-mullvad-issue]获取更新并提出请求。购买 Mullvad 附加服务后，你即可使用所有可用的 Mullvad 服务器。

要查看按国家和城市划分、当前可用作出口节点的 Mullvad 服务器列表，参见 Mullvad 的 [Servers][xt-mullvad-servers] 页面。这些区域也会作为出口节点选项显示在 Tailscale 客户端中。

## Mullvad 许可

你必须先通过管理控制台购买 Mullvad VPN 附加服务，才能访问 Mullvad 出口节点。基础附加服务包含五个许可，但你可以在初次结账流程中购买更多许可，也可以之后通过管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面购买。

[Personal 或 GitHub Community 套餐][docs-free-plans]的用户可以按月或按年购买 Mullvad 附加服务。[Standard 和 Premium 套餐][co-pricing]的用户只能按月购买。Enterprise 套餐的用户必须联系其客户团队购买 Mullvad 附加服务。

## 操作指南

### 启用 Mullvad 出口节点

你可以通过购买 Mullvad VPN 附加服务并配置设备访问权限来启用 Mullvad 出口节点。

1. 在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 设置页面向下滚动到 **Mullvad VPN**。
2. 选择 **Configure**。
3. 按结账流程继续，购买 Mullvad 许可。

如果你使用 [GitOps][docs-gitops-acls] 管理策略文件，Mullvad VPN 附加服务的结账流程可能被锁定。要购买更多许可，前往管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面，然后选择 **Manage add-ons**。

### 管理 Mullvad 访问

你可以使用管理控制台界面或策略文件来配置 Mullvad 访问。使用策略文件管理 Mullvad 出口节点访问更灵活。例如，它允许你把 Mullvad 访问权限分配给超过许可数量的设备。

> **警告：**
>
> 你不能同时使用管理控制台和策略文件来管理 Mullvad 访问。如果你用策略文件管理 Mullvad 访问，就必须全部通过策略文件管理。

#### 通过管理控制台

你可以通过管理控制台管理 Mullvad 访问。如果采用这种方式，你必须为每台设备逐一显式配置。

向设备授予 Mullvad 访问权限的步骤：

1. 在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 设置页面向下滚动到 **Mullvad VPN**。
2. 选择 **Configure**。
3. 选择 **Add devices**。
4. 选择要把 Mullvad 基础设施用作出口节点的设备。
5. 然后保存更改。

每台设备占用一个 Mullvad 许可名额。每个 Mullvad 许可最多允许五台设备。你的月度账单会随设备的增减自动更新。

选择 **Remove** 即可撤销设备对 Mullvad 的访问。

#### 通过 tailnet 策略文件

你也可以使用[策略文件][docs-tailnet-policy-file]中的[节点属性][docs-policy-syntax-nodeattrs]（node attributes）来管理 Mullvad 出口节点的访问。

1. 进入管理控制台的 **Access controls** 页面。
2. 在策略文件中添加 [`nodeAttrs`][docs-policy-syntax-nodeattrs] 部分，把 `mullvad` 属性分配给你计划配合 Mullvad 出口节点使用的设备。

下面的示例向 `joe@example.com` 拥有的所有设备授予权限：

```json
"nodeAttrs": [
  {
    "target": ["joe@example.com"],
    "attr": [
      "mullvad",
    ],
  },
],
```

\[缺少代码片段：visual\_policy\_editor.mdx]

> **警告：**
>
> 使用策略文件管理 Mullvad 访问时，使用 Mullvad 许可的设备不会出现在管理控制台的 [Configure Mullvad VPN](https://console.tailscale.com/admin/settings/general/mullvad) 页面中。你必须通过策略文件管理 Mullvad 访问。

##### 共享许可池

这种方法允许你把 Mullvad 访问权限分配给超出当前套餐许可数量的设备。例如，下面的配置让 `mullvad` 群组中的所有设备都能使用 Mullvad 出口节点：

```json
"nodeAttrs": [
  {
    "target": ["group:mullvad"],
    "attr": [
      "mullvad"
    ],
  },
],
```

\[缺少代码片段：visual\_policy\_editor.mdx]

以这种方式共享许可池时，设备按先到先得的原则，在连接到 tailnet 时使用可用的 Mullvad 许可。**Tailscale 在设备连接到 tailnet 时分配 Mullvad 许可，而不是在连接 Mullvad 服务器时分配**。如果所有付费名额都被占用，配额之外的设备将无法选择 Mullvad 出口节点。

> **警告：**
>
> 虽然共享 Mullvad 许可池切实可行，但请务必确保你购买了足够的 Mullvad 许可来满足环境需求。
>
> 考虑以下示例：
>
> *Society of Pangolin Enthusiasts* 组织有一个包含 100 台设备的 tailnet，他们购买了带 50 个许可的 Mullvad 附加服务。
>
> 管理员使用策略文件设置了一条 `nodeAttrs` 策略，允许全部 100 台设备使用 Mullvad 出口节点（如果有空余名额）。这 100 台设备就能有效共享 Mullvad 出口节点池，即使每个设备没有专属的 Mullvad 出口节点。
>
> 如果有 50 台设备连接到 tailnet，Tailscale 会为每台分配一个 Mullvad 许可。下一台设备（第 51 台）将不会被分配 Mullvad 许可。结果，如果它尝试使用 Mullvad 出口节点，在这 50 台设备中的某一台释放 Mullvad 许可之前，它**将无法访问任何 Mullvad 出口节点**。
>
> 你可以[释放设备的 Mullvad 许可][ar-release-a-license]，方法是把该设备从策略文件中移除，或在管理控制台的 Mullvad VPN 配置中移除该设备。

### 使用 Mullvad 出口节点

启用 Mullvad 出口节点并配置好设备访问权限后，你就可以在 tailnet 中的设备上使用这些出口节点了。每台设备都必须单独启用出口节点。Mullvad 出口节点出现在你的 Tailscale 客户端中之前可能稍有延迟。

> **提示：**
>
> 你也可以[获取建议的 Mullvad 出口节点][docs-suggested-exit-nodes]。

具体步骤因客户端操作系统而异：

#### Android

1. 从菜单中选择 **Use exit node**。
2. 选择要使用的 Mullvad 出口节点。
3. （可选）如果你希望在流量经由出口节点路由时允许直接访问本地网络，选择 **Allow LAN access**。

> **注意：**
>
> 如果你不选择 **Allow LAN access**，可能需要配置 [DNS][ar-important-dns-considerations]。你也可以选择 **None** 来停用出口节点。

#### iOS

1. 轻点 **Exit Nodes**，然后选择 **Location Based**。
2. 选择你想使用的 Mullvad 出口节点。

> **注意：**
>
> 你可能需要按照 [DNS][ar-important-dns-considerations] 一节所述配置 **Override DNS servers**。

#### Linux

你可以使用 [`tailscale set`][docs-cli-set] 或 [`tailscale up`][docs-cli-up] 命令选择出口节点。

无论用哪个命令，都传入带 Mullvad 出口节点 IP 地址的 `--exit-node=` 标志。如果启用了 [MagicDNS][docs-magicdns]，也可以传入 Mullvad 出口节点的名称。

```shell
sudo tailscale set --exit-node=<exit-node-name-or-ip>
```

你可以运行 [`tailscale exit-node list`][docs-cli-exit-node] 查看出口节点的 IP 地址（启用 MagicDNS 时还有名称）。

将 `--exit-node-allow-lan-access` 设为 `true`，以便在流量经由出口节点路由时允许直接访问本地网络。如果不配置此选项，可能需要配置 [DNS][ar-important-dns-considerations]。

```shell
sudo tailscale set --exit-node=<exit-node-name-or-ip> --exit-node-allow-lan-access=true
```

#### macOS

1. 打开 Tailscale 菜单，依次选择 **Exit Nodes** > **Location Based Exit Nodes** > **Countries**。（如果你运行的 Tailscale 客户端版本低于 v1.60.0，Mullvad 选项在 **Use exit node** 下选择。）
2. 选择你想使用的 Mullvad 出口节点。

如果 **Countries** 菜单中没有出现选项，请确认你正在使用的 Mac 已[启用][ar-configure-devices-for-mullvad-access] Mullvad 附加服务。

如果你希望在流量经由出口节点路由时允许直接访问本地网络，选择 **Allow Local Network Access**。如果不选择 **Allow Local Network Access**，可能需要配置 [DNS][ar-important-dns-considerations]。

#### tvOS

> **注意：**
>
> 只有当你已为 tailnet 购买 Mullvad 出口节点后，tvOS 上的 Tailscale 应用才提供此选项。

你可以将 Apple TV 配置为使用 Mullvad 出口节点（基于位置），而不是使用 tailnet 中的另一台设备作为出口节点。有关设置方法的更多信息，参见 [Apple TV][docs-appletv-use-mullvad-exit-node]。

#### Windows

1. 打开 Tailscale 菜单，依次选择 **Exit Nodes** > **Location Based Exit Nodes** > **Location Based**。
2. 选择你想使用的 Mullvad 出口节点。

如果你希望在流量经由出口节点路由时允许直接访问本地网络，选择 **Allow local network access**。

### 在设备上停用 Mullvad

> **注意：**
>
> 你必须是 tailnet 的 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 才能在设备上停用 Mullvad 出口节点。

你可以通过管理控制台或策略文件撤销设备对 Mullvad 出口节点的访问。请使用你当初授予权限时的同一方法。

从管理控制台撤销设备对 Mullvad 出口节点的访问：

1. 打开管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 设置页面。
2. 进入 **Mullvad VPN** 区域并选择 **Configure**。
3. 在要移除的设备旁选择 **Remove**，然后选择 **Save**。

从策略文件撤销设备对 Mullvad 出口节点的访问：

1. 进入管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。
2. 更新策略文件中的 `nodeAttrs` 部分，把 `mullvad` 属性从该设备上排除。

> **警告：**
>
> 排除设备访问的具体做法取决于你当初如何配置其访问。例如，如果你用邮箱地址向某用户显式授予了访问权限，可以删除将该用户的 `mullvad` 属性分配出去的那一行。但如果你是通过[群组][docs-targets-groups]、[标签][docs-targets-groups]或其他方式授予的访问权限，流程可能涉及更多步骤（例如把设备从群组中移除）。

### 移除 Mullvad 附加服务

> **注意：**
>
> 你必须是 tailnet 的 [Owner、Admin 或 Billing admin](/docs/reference/user-roles) 才能移除 Mullvad 附加服务。

你可以在管理控制台中移除 Mullvad VPN 附加服务。

1. 进入管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面。
2. 选择 **Manage add-ons**。
3. 选择 **Mullvad VPN** > **Remove add-on**。

### 从 Mullvad 迁移到 Tailscale

如果你从使用 Mullvad VPN 迁移到 Tailscale 的 Mullvad 附加服务，可能需要禁用 Mullvad 中阻止无 VPN 连接的设置。

从 Mullvad 迁移到 Tailscale 的 Mullvad 附加服务之前：

1. 打开 Mullvad VPN 应用。
2. 停用 Mullvad VPN。
3. 关闭 **Block connections without VPN** 设置。

首次向 Mullvad 注册的设备在与所有 Mullvad 出口节点同步时可能出现延迟。首次在特定设备上使用 Mullvad 或连续数周未使用时，同步过程可能长达两分钟。正常使用情况下，Mullvad 的激活是即时的。

### 签署 Mullvad 出口节点

如果你将 [Tailnet Lock][docs-tailnet-lock] 与 Mullvad VPN 附加服务配合使用，你必须为每个 Mullvad 出口节点签名。此外，用于签名的设备必须能访问这些 Mullvad 出口节点（即必须持有有效的 Mullvad 许可）。否则，Mullvad 出口节点不会包含在签名设备的 netmap 中，它运行 [`tailscale lock`][docs-cli-tailscale-lock] 时，列表里也不会包含未签名的 Mullvad 出口节点。

以下是为单个 Mullvad 出口节点签名的示例：

> **注意：**
>
> 以下命令依赖 `jq`。你可能需要在设备上安装 `jq`。

1. 获取你选定的 Mullvad 出口节点的 `NodeKey`。

   ```shell
   tailscale lock status --json | jq '[.FilteredPeers[] | select(.DNSName | contains("mullvad.ts.net")) | {DNSName, NodeKey: .NodeKey}] | sort_by(.DNSName)'
   ```

2. 使用 `tailscale lock` 对出口节点执行 `sign`。

   ```shell
   tailscale lock sign nodekey <nodekey-of-exit-node>
   ```

这个 `mullvad-script` 可以在 Linux、macOS 和 Windows 设备上用来自动为特定国家代码的多个 Mullvad 出口节点签名：

[`https://github.com/tailscale-support/mullvad-script`][xt-gh-tailscale-support-mullvad-script]

你可以提供特定的两位字母国家代码，或提供 `..`（两个句点）来为所有 Mullvad 出口节点签名。支持的国家列表参见 Mullvad 的 [Servers][xt-mullvad-servers] 页面。

[ar-configure-devices-for-mullvad-access]: #启用-mullvad-出口节点

[ar-important-dns-considerations]: #重要的-dns-注意事项

[ar-manage-mullvad-access]: #管理-mullvad-访问

[ar-release-a-license]: #在设备上停用-mullvad

[ar-sign-mullvad-exit-nodes]: #签署-mullvad-出口节点

[co-pricing]: https://tailscale.com/pricing

[docs-appletv-use-mullvad-exit-node]: /docs/install/appletv#use-a-mullvad-exit-node

[docs-auto-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-cli-exit-node]: /docs/reference/tailscale-cli#exit-node

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-cli-tailscale-lock]: /docs/reference/tailscale-cli/lock

[docs-cli-up]: /docs/reference/tailscale-cli#up

[docs-cli]: /docs/reference/tailscale-cli

[docs-custom-derp-servers]: /docs/reference/derp-servers/custom-derp-servers

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-node-local-network-access]: /docs/features/exit-nodes#local-network-access

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-free-plans]: /docs/account/manage-plans/free-plans-discounts

[docs-gitops-acls]: /docs/gitops

[docs-global-nameserver]: /docs/reference/dns-in-tailscale#global-nameservers

[docs-google-sso]: /docs/integrations/identity/google-sso

[docs-magicdns]: /docs/features/magicdns

[docs-opt-out-logging]: /docs/features/logging#opt-out-of-client-logging

[docs-override-dns-servers]: /docs/reference/dns-in-tailscale#override-dns-servers

[docs-policy-syntax-nodeattrs]: /docs/reference/syntax/policy-file#nodeattrs

[docs-suggested-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes#use-a-suggested-exit-node

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-targets-groups]: /docs/reference/targets-and-selectors#groups

[docs-wireguard]: /docs/concepts/wireguard

[xt-gh-mullvad-issue]: https://github.com/tailscale/tailscale/issues/9314

[xt-gh-tailscale-support-mullvad-script]: https://github.com/tailscale-support/mullvad-script

[xt-mullvad-dns-leaks]: https://mullvad.net/en/help/dns-leaks

[xt-mullvad-server-list]: https://mullvad.net/en/help/server-list

[xt-mullvad-servers]: https://mullvad.net/en/servers

[xt-mullvad-why]: https://mullvad.net/en/why-mullvad-vpn
