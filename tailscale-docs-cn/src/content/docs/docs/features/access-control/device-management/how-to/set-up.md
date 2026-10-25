---
title: "添加设备"
description: "要在 Tailscale 网络（即 tailnet）中使用的设备（如个人电脑、移动设备和服务器）必须添加到 tailnet。Tailscale 网络管理员可以"
---

最后验证于 Jan 5, 2026

要在 Tailscale 网络（即 tailnet）中使用的设备（如个人电脑、移动设备和服务器）必须添加到 tailnet。Tailscale 网络管理员可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面控制和监控设备状态。

## 前提条件

* 一个已有的 tailnet，用于添加设备。
* 一个能够向该 tailnet 完成认证的用户账号。

## 在设备上安装 Tailscale

1. 在浏览器中前往 [Download Tailscale][co-download] 页面。
2. 下载与设备上操作系统版本对应的 Tailscale 客户端。
3. 按照 [Install Tailscale][docs-installation] 主题中针对你的操作系统版本的安装步骤操作。

你也可以前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择 **Add device** 按钮，选择你的操作系统，然后选择 **Download Tailscale** 按钮。这会跳转到你所选操作系统的下载页面。

*（图：在管理控制台中添加设备。）*

## 将设备添加到 tailnet

在设备上打开 Tailscale 客户端并登录你的 tailnet。从新设备认证时，它会自动加入 tailnet，除非启用了[设备审批][docs-device-approval]。如果启用了设备审批，该设备会以 [Needs approval](https://console.tailscale.com/admin/machines?q=disabled%3Aneeds-approval) 状态显示在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。

如果要向 tailnet 添加服务器，建议使用[标签][docs-tags]作为服务器的身份，并通过[认证密钥][docs-auth-keys]预配置服务器。更多信息参见[在 Tailscale 网络上设置服务器][docs-set-up-servers]。

## 使用二维码添加设备

你可以使用二维码将设备添加到 Tailscale 网络（即 tailnet），而无需使用[身份提供方][docs-sso-providers]凭证登录。详情参见[使用二维码添加设备][docs-device-add-qr-code]。

## 权限

* 如果未启用[设备审批][docs-device-approval]，任何拥有 tailnet 登录权限的用户都可以添加设备。
* 如果启用了设备审批，拥有 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 角色的用户可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面批准设备。
* 要在管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面查看现有[标签][docs-tags]，用户必须拥有管理控制台访问权限。
* 要在管理控制台的 **Access Controls** 页面添加新标签，用户必须被分配 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 角色。
* 要生成[认证密钥][docs-auth-keys]，用户必须被分配 [Owner、Admin、Network admin 或 IT admin](/docs/reference/user-roles) 角色。

[co-download]: https://tailscale.com/download

[docs-tags]: /docs/features/tags

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-add-qr-code]: /docs/features/access-control/device-management/how-to/set-up-qr-code

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-installation]: /docs/install

[docs-set-up-servers]: /docs/how-to/set-up-servers

[docs-sso-providers]: /docs/integrations/identity
