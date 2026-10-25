---
title: "连接到设备"
description: "连接到 tailnet 中的设备。"
---

最后验证于 Jan 5, 2026

Tailscale 会为网络上的每台设备自动分配唯一的 [Tailscale IP 地址][docs-tailscale-ip-addresses] 和 [MagicDNS][docs-magicdns] 名称，让你无论身处世界何处、设备是否位于防火墙之后或刚刚更换网络，都能在设备之间建立稳定连接。本指南介绍在两台及以上设备安装 Tailscale 之后，如何连接 tailnet 中的设备。

> **注意：**
>
> 在了解连接流程之前，必须先明白一点：Tailscale 负责在设备之间提供网络连通性，但目标设备上必须运行特定的[服务][docs-services]（如 SSH 或 Web 服务器）。Tailscale 不会自动提供这些服务。

## 前提条件

* 至少两台设备上已安装 Tailscale。
* [访问控制策略][docs-acls]允许设备之间连接。如果你使用[默认访问控制策略][docs-default-acl]，tailnet 中任意设备之间的所有连接都会被放行。
* 至少一台设备上正在运行某个[服务][docs-services]。

## 连接到 tailnet 中的设备

要连接 tailnet 中的另一台设备：

1. [确定要连接的设备][ar-identify-devices]。
2. [确认设备上正在运行可访问的服务][ar-ensure-services-are-running]。
3. [连接到该服务][ar-connect-to-service]。

### 识别你的设备

打开管理控制台的 [机器](https://console.tailscale.com/admin/machines) 页面。你会看到 tailnet 中所有设备的列表，以及它们的主机名（[设备名称][docs-machine-name]）和 [Tailscale IP 地址][docs-tailscale-ip-addresses]。

### 确保服务正在运行

请记住，你只能连接设备上正在运行的服务。常见服务包括：

* SSH（通常在端口 `22`）
  也可以使用 [Tailscale SSH][docs-tailscale-ssh]。
* Web 服务器（通常在端口 `80` 或 `443`）
* 文件共享服务（如 SFTP）
* 远程访问工具（如 RDP）

确保你要访问的[服务][docs-services]正在目标设备上运行。可以通过管理控制台的 [服务](https://console.tailscale.com/admin/services) 页面确认，也可以直接在目标设备上确认服务正在运行。

### 连接到服务

> **注意：**
>
> Tailscale 提供一项名为 [MagicDNS][docs-magicdns] 的功能，让你可以用 [设备名称][docs-machine-name] 代替 Tailscale IP 地址。该功能默认启用，可以直接使用。

要连接 tailnet 中某台设备上的服务：

* 使用目标设备的 [设备名称][docs-machine-name] 或 [Tailscale IP 地址][docs-tailscale-ip-addresses]。
* 指明要访问的服务所在的端口。

例如，要通过 SSH 连接一台 [MagicDNS][docs-magicdns] [名称][docs-machine-name] 为 `dev-build-server` 的设备，可以在终端模拟器中使用以下命令：

```shell
ssh username@dev-build-server
```

访问以下主题，了解更多连接不同类型服务的方法：

* [连接数据库][docs-database]。
* [使用 RDP 连接 Windows 服务器][docs-secure-rdp-windows]。
* [连接云服务器][docs-cloud-server]。
* [连接远程开发环境][docs-remote-code]。
* [连接网络附加存储（NAS）][docs-nas]。

## 故障排查

如果无法连接到某个服务：

* 检查能否通过 [`tailscale ping`][docs-tailscale-ping] 访问该设备。
* 确认你使用的连接信息正确无误。
* 确认服务正在目标设备上按预期端口运行。
* 检查是否有[防火墙][docs-firewalls]（包括目标设备上的内置防火墙）阻止了连接。
* 确认 [tailnet 策略文件][docs-edit-policies] 中没有阻止两台设备之间连接的 [授权][docs-grants] 或 [ACL][docs-acls]。
* 参阅[设备连接故障排查][docs-device-connectivity]。

## 进阶主题

以下小节介绍管理 tailnet 内设备连接的其他方式。

### 访问控制

创建 tailnet 时，Tailscale 会自动应用[默认访问控制策略][docs-default-acl]，允许你连接自己拥有的所有设备。你可以在 [tailnet 策略文件][docs-edit-policies] 中自定义 [访问控制策略][docs-access-control]（如 [ACL][docs-acls] 或 [授权][docs-grants]），控制 tailnet 内设备之间以及与互联网上其他设备之间的连接方式。

### Tailscale SSH

Tailscale 提供内置的 SSH 功能，扩展并简化设备之间的 SSH 连接。启用后，[Tailscale SSH][docs-tailscale-ssh] 会接管 tailnet 内 SSH 连接的身份认证与授权，让你可以增加额外的安全检查，还提供网页控制台界面。

### 共享设备

你可以与其他 Tailscale 用户[共享设备][docs-sharing]或[特定服务][docs-tailscale-serve]，在保持安全的同时开展协作。

### 路由

你可以把一台设备配置为[出口节点][docs-exit-nodes]来路由出站流量，或配置为[子网路由器][docs-subnets]来路由入站流量。将设备用作子网路由器后，无需安装 Tailscale 客户端就能访问其背后的设备。

[ar-connect-to-service]: #连接到服务

[ar-ensure-services-are-running]: #确保服务正在运行

[ar-identify-devices]: #识别你的设备

[docs-access-control]: /docs/features/access-control

[docs-edit-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-acls]: /docs/features/access-control/acls

[docs-cloud-server]: /docs/cloud-server

[docs-database]: /docs/database

[docs-default-acl]: /docs/reference/examples/acls#allow-all-default-acl

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-firewalls]: /docs/integrations/firewalls

[docs-grants]: /docs/features/access-control/grants

[docs-machine-name]: /docs/concepts/machine-names

[docs-magicdns]: /docs/features/magicdns

[docs-nas]: /docs/integrations/nas

[docs-remote-code]: /docs/remote-code

[docs-secure-rdp-windows]: /docs/solutions/access-remote-desktops-using-windows-rdp

[docs-services]: /docs/features/services

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-tailscale-ping]: /docs/reference/tailscale-cli#ping

[docs-tailscale-serve]: /docs/features/tailscale-serve

[docs-tailscale-ssh]: /docs/features/tailscale-ssh
