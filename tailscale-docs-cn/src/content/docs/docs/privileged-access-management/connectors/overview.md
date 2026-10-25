---
title: "Tailscale PAM 连接器概览"
description: "Tailscale PAM 连接器让你能在网络客户端与你的[服务][docs-pam-services]（如 SSH、数据库和 Kubernetes）之间建立会话。要使用连接器，你需要在一台设备上设置并运行"
---

最后验证于 Aug 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

Tailscale PAM 连接器让你能在网络客户端与你的[服务][docs-pam-services]（如 SSH、数据库和 Kubernetes）之间建立会话。要使用连接器，你需要在即将充当连接器的设备上设置并运行 Tailscale 连接器服务。该服务既包含 Tailscale 连接组件，也包含 Tailscale PAM 连接器功能。Tailscale 连接组件使用 WireGuard 创建具备身份感知的[加密][docs-encryption]通信通道；Tailscale PAM 连接器则为你的服务提供应用感知的特权访问。关于设置连接器的信息，参见[安装 Tailscale PAM 连接器][docs-pam-connectors-install]。

在哪里运行连接器，取决于你如何能够以及希望连接到想通过 Tailscale 暴露的目标服务。连接器必须能够通过网络访问你的目标资源，或借助外部工具访问，AWS Session Manager 目标就是后一种情况。

运行多少个连接器，取决于你有多少个互不相通、且包含想通过 Tailscale 暴露的资源的网络。假设你有 *N* 个网络，每个网络中的资源只能被同一网络中的其他机器访问，那么你需要 *N* 个连接器——每个网络一个。如果你有大量网络，但这些网络中的所有资源都可以通过互联网访问，那么可能只需要一个连接器。

对于需要高可用的服务，你可以在每个网络中运行多个连接器，指向相同的目标服务。

为了把单个连接器设备被攻陷造成的损害降到最低，你可以把目标分散到多个连接器上。

## 连接器令牌

连接器令牌是用于向 Tailscale 控制平面认证连接器的凭证。每个令牌始终只与一个连接器关联。

虽然可以同时有多个处于活动状态的连接器令牌，但一个连接器一次只能有一条活动连接。尝试连接已经连接的连接器时，第二条连接会被拒绝，并返回一条说明该连接器已连接的错误消息。

为同一连接器准备多个活动令牌，可以实现更安全的令牌轮换，且停机时间最短。

## 服务

[服务][docs-pam-services]代表 tailnet 中已与某个连接器关联的资源，例如 SSH、数据库、Kubernetes 等。

## 连接器日志

**连接器日志**是本地发生的连接器事件的日志。以下事件会产生日志条目：

* 错误和运行故障。
* 收到的服务更新，例如配置变更以及新增或移除的服务。

> **注意：**
>
> 如果连接器向 Tailscale 认证失败，在 Tailscale PAM 日志中将找不到该日志。原因在于，成功认证是连接器把日志上传到 Tailscale PAM 的前提。

[docs-pam-connectors-install]: /docs/privileged-access-management/connectors/install

[docs-pam-services]: /docs/privileged-access-management/services

[docs-encryption]: /docs/concepts/tailscale-encryption
