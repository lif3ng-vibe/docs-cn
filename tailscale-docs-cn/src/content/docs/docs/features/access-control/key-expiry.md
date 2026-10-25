---
title: "密钥过期"
description: "作为一项安全特性，用户需要定期在其每台设备上重新认证。默认过期时长取决于你的域名设置。默认情况下，新域名的过期时长为"
---

最后验证于 Jan 5, 2026

作为一项安全特性，用户需要定期在其每台设备上重新认证。默认过期时长取决于你的域名设置。默认情况下，新域名的过期时长为 180 天。

如果未进行重新认证，密钥会过期，与该端点之间的连接将停止工作。

## 禁用密钥过期

> **注意：** 禁用密钥过期适用于[所有套餐](https://tailscale.com/pricing)。

你可能希望在某些设备上禁用密钥过期，例如受信任的服务器、[子网路由器][docs-subnets]或难以触及的远程物联网设备。

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 找到目标设备对应的行。
3. 选择最右侧的菜单，选择 **Disable Key Expiry** 选项：

   *（图：管理控制台菜单，"Disable Key Expiry" 选项以红色轮廓标出。）*
4. 完成。该设备的密钥将不再过期。

## 启用密钥过期

> **注意：** 启用密钥过期适用于[所有套餐](https://tailscale.com/pricing)。

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 找到目标设备对应的行。
3. 选择最右侧的菜单，选择 **Enable Key Expiry** 选项。
4. 完成。该设备的密钥现在会按有效期过期。

## 为密钥已过期的设备续期

如果一台设备的密钥过期，与该端点之间的连接将停止工作。对于装有 [Tailscale CLI][docs-cli] 的设备，运行 [`tailscale up --force-reauth`][docs-tailscale-up]（必要时使用 `sudo`）即可为密钥续期。

> **警告：**
>
> 请注意，`tailscale up --force-reauth` 可能会断开 tailnet 连接，因此在没有备用登录手段的情况下，不要通过 SSH 或 RDP 远程执行该命令，以免连接断开后无法登录。

不过，对于那些你已[限制为仅走 Tailscale 流量][docs-secure-server-ubuntu]的远程设备，在没有 Tailscale 访问的情况下重新登录可能很困难，甚至不可能。在这些情况下，我们允许网络管理员临时延长密钥的有效期，帮助设备所有者恢复访问并重新认证。

要重新获得对密钥已过期设备的访问：

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 找到目标设备对应的行。
3. 选择最右侧的菜单，选择 **Temporarily extend key** 选项。该选项只对密钥已过期的设备显示：

   *（图：管理控制台菜单，"Temporarily Extend Key" 选项以红色轮廓标出。）*
4. 密钥将延长 30 分钟。请指示该机器的所有者在此延长的时间窗口内登录并重新认证，或在此窗口内为该设备禁用密钥过期。
5. 机器完成重新认证后，密钥会按你的标准有效期重新计算（默认 6 个月）。

如果你要续期的机器属于你自己，并且它已经生成了新的认证 URL，我们会提供 **Reauthenticate** 选项来替代 **Temporarily extend key**。不过，延长密钥有效期是更常用的恢复访问方式。

## 对已打标签设备使用密钥过期

首次为设备应用标签并进行认证时，已打标签设备的密钥过期默认处于禁用状态。更多信息参见[已打标签设备的密钥过期][docs-tags-key-expiry]。

## 设置自定义认证有效期

> **注意：** 设置自定义认证有效期适用于[所有套餐](https://tailscale.com/pricing)。

1. 打开管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面。
2. 在 **Key Expiry** 区域，选择 1 到 180 天作为自定义认证有效期。
3. 选择 **Save**。

> **注意：**
>
> **Key Expiry** 值的更改会作用于更改之后登录的所有设备。已登录设备的密钥过期设置保持不变，直到该设备下次登录。

## 管理控制台会话过期

访问 Tailscale [管理控制台](https://console.tailscale.com/admin)的浏览器会话有效期为 30 天。此有效期与任何密钥过期无关。更多信息参见主题[管理控制台会话会过期吗？][docs-admin-console-session-expiry]

[docs-admin-console-session-expiry]: /docs/reference/admin-console-session-expiry

[docs-cli]: /docs/reference/tailscale-cli

[docs-secure-server-ubuntu]: /docs/how-to/secure-ubuntu-server-with-ufw

[docs-subnets]: /docs/features/subnet-routers

[docs-tags-key-expiry]: /docs/features/tags#密钥过期

[docs-tailscale-up]: /docs/reference/tailscale-cli/up
