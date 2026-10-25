---
title: "MagicDNS"
description: "了解如何为 Tailscale 网络中的设备自动注册 DNS 名称。"
---

最后验证于 Jan 5, 2026

MagicDNS 会为网络中的设备自动注册 DNS 名称。

> **注意**：MagicDNS [所有套餐](https://tailscale.com/pricing)均可用。

如果你向网络添加了一个名为 `my-server` 的新 Web 服务器，就不再需要使用它的 Tailscale IP：在浏览器地址栏或命令行中使用名称 `my-server` 即可。

*（图：浏览器窗口示例，地址栏中为"my-server"和一个端口号。）*

> **注意：**
>
> 运行 Tailscale v1.20 或更高版本时，MagicDNS 不需要 [DNS 名称服务器][docs-dns-using-settings]。否则，你的网络必须在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面中设置**至少一个 DNS 名称服务器**。MagicDNS 未处理的 DNS 查询会发送给这些名称服务器。

## 启用 MagicDNS

2022 年 10 月 20 日及之后创建的 tailnet 默认启用 MagicDNS。

如果尚未启用，你可以在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面启用 MagicDNS：

*（图：管理控制台上的"Enable MagicDNS"按钮。）*

## 通过 MagicDNS 访问设备

启用 MagicDNS 后，登录到你的网络的任何设备都可以使用[机器名][docs-machine-names]访问其他设备。例如，如果你有一台名为 "monitoring" 的服务器：

* 要通过 SSH 连接它，运行 `ssh username@monitoring`
* 要 ping 它，运行 `ping monitoring`
* 要在浏览器中打开它，在地址栏输入 `monitoring`。

> **注意：**
>
> macOS 上的一些 CLI 工具（如 `host` 或 `nslookup`）会绕过系统 DNS 解析，因此无法配合 MagicDNS 使用。例如，`host johns-iphone-6s` 在 macOS 上不会生效，即使 `ping johns-iphone-6s` 可以。

> **注意：**
>
> [与你共享的设备][docs-sharing]只能在 Tailscale v1.4 或更高版本上通过 MagicDNS 访问。你还必须使用共享设备的[完整域名][ar-fqnd-vs-machine-name]。例如 `ping webserver.example2.ts.net`。

## 分配和编辑机器名

MagicDNS 自动使用设备的[机器名][docs-machine-names]作为 DNS 条目的一部分。如果你更改设备的名称，MagicDNS 条目会自动更新。

如果你有特定想要的名称来引用你的设备，可以[编辑该设备的机器名][docs-machine-names-renaming-a-machine]。

## 完全限定域名与机器名

在底层，MagicDNS 会为 Tailscale 网络（即 tailnet）中的每台设备生成一个**完全限定域名**。完全限定域名由两部分组成：

1. 一个[**机器名**][docs-machine-names]，你可以更改。
2. 你的 [**tailnet DNS 名称**][docs-tailnet-name-tailnet-dns]。你可以在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面找到你的 tailnet DNS 名称。

*（图：以"monitoring.yak-bebop.ts.net"作为完全限定域名的示例。"monitoring"部分标识为机器名，"yak-bebop.ts.net"部分标识为 tailnet 名称。）*

> **注意：**
>
> 你之前使用的 [tailnet 名称][docs-tailnet-name]可能以 `.beta.tailscale.net` 结尾。如果是这样，请迁移到以 `.ts.net` 结尾的新 tailnet 名称。对现有 `beta.tailscale.net` 名称的支持已于 **2024 年 9 月 13 日**结束。

下表展示了一些示例机器名和域名如何组合成完整域名。

机器名
tailnet 名称
完全限定域名

monitoring
yak-bebop.ts.net

monitoring.yak-bebop.

ts.net

johns-iphone-6s
tailab12.ts.net

johns-iphone-6s.tailab12.

ts.net

free-form
example.ts.net

free-form.example.

ts.net

完整域名输入起来很繁琐，因此当你启用 MagicDNS 时，Tailscale 会自动向你的网络添加[搜索域][docs-dns-using-settings]。有了这些搜索域，你只需输入机器名即可访问设备。

对于 *yak-bebop* 网络，**以下两条命令是等价的**：

```shell
ping monitoring
ping monitoring.yak-bebop.ts.net
```

在大多数情况下，你会想使用机器名。但出于安全原因，访问[与你共享的设备][docs-sharing]需要使用完整域名。

你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面打开任意设备的详情页，找到其完整域名。

## 停用 MagicDNS

在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面切换你用来启用它的同一个按钮，即可为整个网络停用 MagicDNS。

如果你在特定设备上遇到 MagicDNS 问题，希望只在那台设备上停用它，目前的解决办法是让该设备停止接受网络 DNS 设置。

**在 Linux 上**，使用以下命令停止接受 DNS：

```shell
tailscale set --accept-dns=false
```

**在 macOS 上**，点选 Tailscale 菜单栏图标来停止接受 DNS。在这里选择 **Preferences**，然后可以在菜单中取消勾选 **Use Tailscale DNS settings**。

**在 Windows 上**，按住 `SHIFT` 并右键点击 Tailscale 系统托盘图标，然后在菜单中取消选择 **Use Tailscale DNS**。

将来，等我们的 DNS 配置与解析逻辑足够健壮时，就不需要再单独停用 MagicDNS 了。到那时，这个开关会消失。

## 移除 `beta.tailscale.net` 名称服务器

对旧版 `*.beta.tailscale.net` 名称服务器的支持已于 **2024 年 9 月 13 日**结束。如果你还没有迁移，请把你的 tailnet 迁移到 [tailnet DNS 名称][docs-tailnet-name-tailnet-dns]格式的名称服务器。如果你已不再使用 `beta.tailscale.net` 名称服务器，可以将其删除。删除后将无法恢复。

你需要是 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能移除 `beta.tailscale.net` 名称服务器。

1. 打开管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。
2. 在 **Nameservers** 下，找到名称以 `.beta.tailscale.net` 结尾的名称服务器，例如 `yak-bebop.beta.tailscale.net`。（如果没有找到 `.beta.tailscale.net` 名称服务器，就无需删除。）
3. 选择该菜单，然后选择 **Delete**。
4. 确认要删除该 `beta.tailscale.net` 名称服务器，然后选择 **Delete**。

[ar-fqnd-vs-machine-name]: #完全限定域名与机器名

[docs-dns-using-settings]: /docs/reference/dns-in-tailscale#tailscale-dns-设置

[docs-machine-names-renaming-a-machine]: /docs/concepts/machine-names#renaming-a-machine

[docs-machine-names]: /docs/concepts/machine-names

[docs-sharing]: /docs/features/sharing

[docs-tailnet-name-tailnet-dns]: /docs/concepts/tailnet-name#tailnet-dns-名称

[docs-tailnet-name]: /docs/concepts/tailnet-name
