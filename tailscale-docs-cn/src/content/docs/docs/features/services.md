---
title: "查看你网络上的端点列表"
description: "了解如何监控并轻松连接到 Tailscale 网络中机器上运行的端点。"
---

最后验证于 Jan 5, 2026

Tailscale 的端点收集功能让你可以监控并轻松连接到 Tailscale 网络中机器上运行的端点。

> **注意：** 端点收集视图目前处于 alpha 阶段。

## 什么是端点？

端点（endpoint）是你的每台 Tailscale 机器上运行的网络暴露端口，由其 `port` 和 `protocol` 定义。如果你的网络启用了端点收集，每台机器都会与你的 Tailscale 网络共享其实时端点列表。

## 启用端点收集

该功能默认关闭，也就是说，除非你选择启用端点收集，否则端点数据绝不会被收集或在设备之间共享。你可以在管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面、选择 **Discovered** 标签页后更改此设置。

*（图："Enable endpoint collection to start" 提示与 "Enable endpoint collection" 按钮。）*

> **注意：**
>
> 尽管端点收集是 Tailscale 网络的全局设置，但任何[阻止入站连接][docs-client-preferences]的机器都不会发送其端点。

## 监控你的端点

启用端点收集后，管理控制台会显示你网络上的端点列表。我们目前不把端点存入数据库，因此该页面充当*实时*端点的监控工具。当你启动或停止端点时，页面会相应地反映这些变化。

下面是 [Services](https://console.tailscale.com/admin/services) 页面 **Discovered** 标签页的预览。

*（图：管理控制台 Services 页面的 Discovered 标签页，列出按"type:HTTP"筛选的示例端点。）*

每台机器的详情页上也会显示一个端点表，其中只包含该机器暴露的端点。

*（图：管理控制台的 Machine details 页面，包含机器网络信息以及 tailnet 中暴露的端点列表。）*

> **注意：**
>
> 端点表包含一个 `type` 列。我们对端点进行类型归类，方便你更好地识别它们。归类规则目前比较基础，会随时间不断调整——请注意，如果你使用非常见端口，我们可能回退为"Other"类型。

## 启动端点

从端点表中，你可以直接启动某些应用。

* 对于 SSH，我们提供可复制的 `ssh 100.x.y.z` 命令。
* 对于 VNC 和 [RDP][docs-secure-rdp-windows]，我们提供 **Launch** 按钮来启动远程会话。
* 对于 HTTP 和 HTTPS，我们提供 **Open** 按钮来打开该 Web 服务器。

## 访问控制

你可以使用 [Tailscale 访问控制策略][docs-access-control]为每个端点配置访问权限。如果你想知道谁能访问每个端点，请将鼠标悬停在 **Endpoints** 表 **Access Controls** 列的信息图标上。

*（图：端点预览与提示"Who can access this endpoint?"的悬浮框。此示例中列出了"group:all"和"group:coop"。）*

> **注意：**
>
> 如果有人通过[基于链接的节点共享][docs-sharing]把另一个网络中的机器共享给你，该机器的共享端口会出现在你的端点列表中。注意，对于共享来的机器，你只能看到共享者通过其网络的访问控制策略授权给你访问的那些端点。

[docs-access-control]: /docs/features/access-control

[docs-client-preferences]: /docs/features/client/manage-preferences

[docs-secure-rdp-windows]: /docs/solutions/access-remote-desktops-using-windows-rdp

[docs-sharing]: /docs/features/sharing
