---
title: "设置高可用性"
description: "为子网路由器和应用连接器设置高可用性（HA）。"
---

最后验证于 Oct 7, 2026

部署多个[子网路由器][docs-subnets]或[应用连接器][docs-app-connectors]，即使其中一个离线也能保持资源可访问。tailnet 的[路由选择选项][docs-route-selection]决定了 Tailscale 如何在符合条件的连接器之间进行选择。
[Tailscale Service][docs-tailscale-services] 的多主机也能提供冗余访问。Service 主机的配置与本指南中子网路由器、应用连接器的流程相互独立，请单独配置。

## 选择路由选择选项

在[路由选择][docs-route-selection]中比较各选项的选择行为、可用性、限制和故障转移时机。然后为你的 tailnet [选择路由选择选项][docs-route-selection-configure]，并按照下文完成应用连接器或子网路由器的设置步骤。

## 应用连接器高可用性

要让应用连接器高可用，运行两个或更多使用相同标签的应用连接器，并把你的应用分配给该标签。

### 第 1 步：设置多个应用连接器

按照[在 tailnet 中设置应用连接器][docs-app-connectors-setup]操作。为所有应用连接器分配相同的[标签][docs-tags]。例如，在两台或更多设备上运行以下命令：

```shell
sudo tailscale up --advertise-connector --advertise-tags="tag:connector"
```

### 第 2 步：将应用分配给应用连接器

将应用分配给相同的 `tag:connector` [标签][docs-tags]。按照[在 tailnet 中设置应用连接器][docs-app-connectors-setup]中的步骤操作。

### 第 3 步：完成

现在，你的应用连接器为所配置的应用提供了冗余访问。[从客户端检查路由][docs-route-selection-verify]，确认它们可以访问这些应用。

## 子网路由器高可用性

要让子网路由器高可用，运行两个或更多通告相同路由的子网路由器，然后在管理控制台批准这些路由。

### 第 1 步：设置多个子网路由器

在同一网络中的两台或更多设备上按照[设置子网路由器][docs-subnets]操作。在每台设备上通告相同的路由。例如：

```shell
sudo tailscale set --advertise-routes=10.0.0.0/24,10.1.0.0/24
```

你可以根据故障转移需要配置任意数量的子网路由器。

> **警告：**
>
> 在每个子网路由器上通告完全相同的路由前缀。配置重叠路由之前，先查阅[前缀匹配要求][docs-route-selection-prefix-matching]。

\[Missing snippet: WarningAcceptRoutesHA.mdx]

### 第 2 步：在管理控制台激活子网路由器

1. 打开管理控制台的 [机器](https://console.tailscale.com/admin/machines) 页面。
2. 找到你的子网路由器，打开其  菜单。
3. 选择 **审查子网路由**（Review subnet routes），打开子网设置。
4. 对要使用的路由选择 **启用**（Enable）。Tailscale 会把这些路由分发到 tailnet 中的其他设备。

> **注意：**
>
> 你可能希望在这台服务器上禁用密钥过期，以免定期重新认证。有关机器密钥以及如何禁用过期的更多信息，参阅[密钥过期][docs-key-expiry]。

### 第 3 步：完成

现在，你的子网路由器为已批准的路由提供了冗余访问。[从客户端检查路由][docs-route-selection-verify]，确认它们可以访问目标地址。

## 延伸阅读

有关在子网路由器、应用连接器和 Tailscale Service 主机上使用区域路由或 MagicRoute 的示例，参阅[路由选择使用场景][docs-route-selection-use-cases]。

[docs-app-connectors-setup]: /docs/features/app-connectors/how-to/setup

[docs-app-connectors]: /docs/features/app-connectors

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-route-selection-configure]: /docs/features/route-selection#更改路由选择选项

[docs-route-selection-prefix-matching]: /docs/features/route-selection#路由资格与前缀匹配

[docs-route-selection-use-cases]: /docs/features/route-selection#路由选择使用场景

[docs-route-selection-verify]: /docs/features/route-selection#验证路由选择

[docs-route-selection]: /docs/features/route-selection

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags
