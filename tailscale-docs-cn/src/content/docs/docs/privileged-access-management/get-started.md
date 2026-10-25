---
title: "开始使用 Tailscale PAM"
description: "注册 Tailscale PAM，并使用它为 Tailscale 网络中的资源提供特权访问。"
---

最后验证于 Jun 2, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

本指南带你启用 Tailscale PAM，开始为你的 Tailscale 网络（即 tailnet）提供特权访问。如果想在开始前进一步了解 Tailscale PAM 的功能，参见[什么是 Tailscale PAM？][docs-pam-what-is-tailscale-pam]。

> **注意：**
>
> 以下相关视频提供了更多背景信息和示例。

[入门 | Tailscale PAM（视频）](https://www.youtube.com/watch?v=rvYO9VgXlk4)

启用 Tailscale PAM 后会发生什么

当你在 Tailscale 管理控制台的 [PAM](https://console.tailscale.com/admin/settings/pam) 页面启用 Tailscale PAM 时，Tailscale 会自动为你的 tailnet 配置好开始使用 PAM 所需的一切。你无需手动配置标签、服务审批、凭证或初始访问规则即可上手。

Tailscale 会自动：

* **创建 `tag:border0-managed` 标签**。由 PAM 管理的资源（包括连接器和服务）都使用这个标签。该标签由 `autogroup:admin` 所有。
* **添加一条 `autoApprovers` 规则**。带有 `tag:border0-managed` 标签的连接器可以自动批准使用同一标签的 PAM 服务。这意味着你无需手动批准每一条 PAM 服务通告。
* **添加初始 PAM 应用授权（grant）**。`autogroup:admin` 的成员会获得对带有 `tag:border0-managed` 标签的 PAM 服务的访问权限，让管理员能够初步访问受支持的 PAM 服务，例如 SSH、数据库、Kubernetes、RDP 和 HTTP。
* **为 Tailscale PAM 创建信任凭证（trust credentials）**。这条 OpenID Connect（OIDC）信任凭证用于你的 tailnet 与 Tailscale PAM API 服务之间的集成。你可以在 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面查看它。自动创建的凭证带有 `tag:border0-managed` 标签。

这些设置会自动创建，以便 PAM 开箱即用。除非你打算替换相应配置，否则不要删除或修改自动创建的标签、`autoApprovers` 规则或信任凭证，否则可能导致 PAM 集成的部分功能无法正常工作。

你可以按需自定义自动创建的 PAM 授权，以控制哪些用户可以访问你的 PAM 服务以及他们能做什么。

## 前提条件

开始之前，确认你具备以下条件：

* 一个 tailnet。如果没有，请[注册](https://login.tailscale.com/start)。

* 你的 tailnet 已启用 Tailscale PAM 集成。想免费试用 Tailscale PAM，请[加入等候名单][co-pam-waitlist]；想为你的组织进一步了解 Tailscale PAM，请联系 [Tailscale 销售][co-contact-sales-border0]。

* 一个拥有 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 权限的 Tailscale 账户，以便你使用 Tailscale 管理控制台为 tailnet 启用 Tailscale PAM。

* 一台用作 Tailscale PAM 连接器的设备。本主题会介绍如何把该设备配置为 Tailscale PAM 连接器。设备必须满足以下选项之一：

  * Linux
  * AWS EC2
  * Docker
  * Kubernetes

* 一台带浏览器的设备，或一台安装了 [Tailscale 客户端][co-download]的设备。它将用于访问 PAM 服务。

## 步骤 1：为你的 tailnet 启用 Tailscale PAM 集成

打开 Tailscale 管理控制台的 [PAM](https://console.tailscale.com/admin/settings/pam) 设置页面，选择 **Enable**。

## 步骤 2：创建 Tailscale PAM 连接器

1. 打开管理控制台的 [Connectors](https://console.tailscale.com/admin/connectors) 页面。
2. 选择 **Add connector**。
3. 选择你要用于连接器的平台。
4. 在 **Launch new connector** 部分，按照说明操作，并将其应用到你要用作连接器的设备上。

PAM 连接器内置 Tailscale 能力，会自动加入你的 tailnet。关于 Tailscale PAM 连接器安装的更多信息，参见[安装 Tailscale PAM 连接器][docs-pam-connectors-install]。

## 步骤 3：定义 PAM 服务

现在你可以使用 Tailscale PAM 为网络中的资源创建安全访问。你加以保护的资源称为 PAM 服务。Tailscale PAM 使用 PAM 连接器把会话安全地代理到 PAM 服务。

以 Tailscale 的沙箱服务器为例。本例中使用安全外壳协议（SSH）：

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。
2. 选择 **Add service**。
3. 选择 **PAM service**。
4. 选择 **Secure Shell - Standard Shell**。
5. 在右侧，选择 **Use Tailscale sandbox server**。
6. 选择你创建的 PAM 连接器。
7. 选择 **Continue**。
8. 选择 **Save**，用户名和密码已经填好。

## 步骤 4：访问服务

创建服务后，tailnet 成员有两种方式访问该服务：

* [下载 Tailscale 客户端][co-download]，把他们的设备加入你的 tailnet。
* 使用浏览器访问 <https://my.tailscale.com>。这是基于 Web 的 PAM 服务访问客户端，无需任何下载。收到提示时，tailnet 成员可以用他们登录 Tailscale 的同一账户登录。

登录 Tailscale 桌面客户端或浏览器客户端后，tailnet 成员即可访问你为他们配置的服务。

## 后续步骤

探索 Tailscale PAM 站点上的以下资源。

配置你自己的 PAM 服务：

* [访问数据库][docs-pam-access-database]
* [访问 HTTP 服务][docs-pam-access-http-service]
* [访问 SSH 服务器（或 shell）][docs-pam-access-ssh]

进一步了解 Tailscale PAM：

* [了解 Tailscale PAM 的架构与核心概念][docs-pam-architecture-and-concepts]，充分利用 Tailscale PAM。
* [全面掌握][docs-pam-sessions] Tailscale PAM 连接的情况。不只是 IP 地址和端口，还有谁在何时做了什么背后的完整上下文。
* 配置服务时，[使用密钥存储（secret store）][docs-pam-manage-secrets]安全保存你的上游凭证。
* [配置策略][docs-pam-policies]，定义细粒度的访问规则。

[co-contact-sales-border0]: https://tailscale.com/contact/sales-border0

[co-download]: https://tailscale.com/download

[co-pam-waitlist]: https://tailscale.com/pam-selfserve-waitlist

[docs-pam-access-database]: /docs/privileged-access-management/how-to/access-database

[docs-pam-access-http-service]: /docs/privileged-access-management/how-to/access-http-service

[docs-pam-access-ssh]: /docs/privileged-access-management/how-to/access-ssh

[docs-pam-architecture-and-concepts]: /docs/privileged-access-management/architecture-and-concepts

[docs-pam-connectors-install]: /docs/privileged-access-management/connectors/install

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam-policies]: /docs/privileged-access-management/how-to/control-access

[docs-pam-sessions]: /docs/privileged-access-management/session-logs

[docs-pam-what-is-tailscale-pam]: /docs/privileged-access-management/what-is-tailscale-pam
