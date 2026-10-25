---
title: "哪些设备能连接或感知我的设备？"
description: "了解 Tailscale 如何判定哪些设备可以连接或感知你的设备。"
---

最后验证于 Jan 5, 2026

本主题介绍 Tailscale 如何管理你 Tailscale 网络（即 [tailnet][docs-tailnet]）中的设备可见性以及设备间的连接。理解这些概念有助于你控制哪些设备可以互相连接，以及它们能访问哪些资源。

## Tailscale 中的设备可见性

Tailscale 创建连接你设备的私密安全网络（称为 tailnet）。默认情况下，Tailscale 根据[身份提供方][docs-sso-providers]（IdP）的域名将设备组织进各个 tailnet。这在不同组织之间形成了天然边界：

* 默认情况下，不同 tailnet 中的设备无法感知彼此，也无法互相连接。
* 每个 tailnet 拥有自己的 [tailnet 策略文件][docs-tailnet-policy-file]和[访问控制][docs-access-control]。
* 跨 tailnet 访问需要显式[共享设备][docs-sharing]。

这些边界确保你组织的设备保持私密，其他组织的用户无法访问，即使他们也使用 Tailscale。

> **注意：**
>
> 当你使用自己拥有域名的[身份提供方][docs-sso-providers]创建 Tailscale 账户，或通过 GitHub 组织创建时，Tailscale 会将这些用户识别为同一组织，并将他们加入同一个 tailnet。

tailnet 内设备的可见性由 tailnet 策略文件决定，其中定义的访问控制规定了哪些设备可以互相通信。这遵循"默认拒绝"的安全模型，也就是说，只有访问规则明确允许时，两台设备才能连接。

> **警告：**
>
> 虽然 Tailscale 的访问控制策略遵循"默认拒绝"的安全模型，但默认访问控制策略是[允许 tailnet 内所有设备互相连接][docs-grants-allow-all]。

### 默认设备可见性

创建新 tailnet 时，默认访问控制策略允许所有设备与其他所有设备通信。该默认策略也让任何设备都能感知 tailnet 中的所有其他设备。例如，运行 `tailscale status` 或在任意 Tailscale 客户端中查看设备时，会看到所有其他设备。

你可以通过实施更明确的访问控制策略来限制哪些设备能*访问*或与哪些设备*通信*，从而约束设备之间的相互感知。

如果你想限制哪些设备可被访问，实施更明确的访问控制策略即可限定哪些设备能*访问*或与哪些设备*通信*。

### 设备可见性原则

Tailscale 实现了一种称为 *netmap trimming*（网络图裁剪）的机制，用于决定哪些设备会出现在你的 Tailscale 客户端中。它只向你展示与你的工作相关的设备，有助于让较大规模的 tailnet 保持可管理，并增强隐私性。你设备上可见的网络图包括：

* 根据 tailnet 策略文件，你的设备可以连接的设备。既包括你 tailnet 内的设备，也包括从其他 tailnet 共享给你的设备。
* 根据 tailnet 策略文件，你的设备可以使用的[出口节点][docs-exit-nodes]。
* 与你当前设备使用同一用户身份认证的所有设备，即使 tailnet 策略文件不允许你连接它们。这样，如果 tailnet 中启用了 [Taildrop][docs-taildrop]，你就能使用它。
* 可以连接到你设备的所有设备，即使你不被允许连接它们。这种可见性使 Tailscale 能在尽可能多的环境中建立直连。

## 管理设备访问

默认情况下，Tailscale 根据身份提供方的域名将设备组织进各个 tailnet。当你使用自己拥有域名的身份提供方创建 Tailscale 账户，或通过 GitHub 组织创建时，Tailscale 会将这些用户识别为同一组织，并把它们加入同一个 tailnet。

### 设备间的访问控制

tailnet 策略文件通过[授权][docs-grants]（grant，推荐方式）或旧式访问控制列表（[访问控制策略][docs-access-control]，ACL）来控制设备间的访问。这两种机制都遵循"默认拒绝"原则，即：

* 设备间的连接默认被拒绝。
* 只有 tailnet 策略文件中的规则明确允许时，才允许连接。
* 访问控制策略定义哪些[用户、群组或标签][docs-targets]可以访问特定资源。

### 跨组织可见性

如果你在工作设备上使用 Tailscale，你的个人设备不会对同事可见，除非你显式共享了它们。设备可见性遵循以下原则：

* 使用与你不同 tailnet 的同事无法连接你的设备，也无法感知它们。
* 同一 tailnet 中的同事可以感知并连接你的设备，*前提是 tailnet 策略文件允许*。
* 独立 tailnet 中的个人设备保持私密，除非被显式[共享][docs-share]。

## 限制对你设备的访问

在 tailnet 中限制哪些设备可以连接你的设备主要有两种方法：通过 tailnet 策略文件设置访问控制策略，以及通过 [Tailscale 客户端偏好设置][docs-client-preferences]进行单台设备限制。

### 访问控制策略

Tailnet [管理员](/docs/reference/user-roles)可以在 tailnet 策略文件中定义合适的访问控制策略（如[授权][docs-grants]），以限制哪些设备可以互相连接。这是控制设备间访问的主要方法，也应是你管理设备可见性的首选手段。

例如，如果一条授权策略允许 `device-a` 连接 `device-b`，则意味着：

* `device-a` 能感知 `device-b`。
* `device-b` 能感知 `device-a`。

同样，如果没有允许 `device-a` 连接 `device-b` 的授权规则，则意味着：

* `device-a` 无法感知 `device-b`。
* `device-b` 无法感知 `device-a`。

### 单台设备限制

你还可以通过 [Tailscale 客户端偏好设置][docs-client-preferences]限制 Tailscale 对你这台特定设备的入站连接。当你需要比 tailnet 策略文件更细粒度的限制时，这提供了额外一层控制。

[docs-access-control]: /docs/features/access-control

[docs-client-preferences]: /docs/features/client/manage-preferences

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants-allow-all]: /docs/reference/examples/grants#全部允许

[docs-grants]: /docs/features/access-control/grants

[docs-share]: /docs/share

[docs-sharing]: /docs/features/sharing

[docs-sso-providers]: /docs/integrations/identity

[docs-taildrop]: /docs/features/taildrop

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-targets]: /docs/reference/targets-and-selectors
