---
title: "Tailscale 快速开始"
description: "几分钟内安装 Tailscale。创建你的私有网络，随时随地管理任何设备。"
---

最后验证于 Jan 5, 2026

欢迎！按照本主题中的步骤创建你自己的 Tailscale 私有网络（即 tailnet），或者观看以下视频快速上手 Tailscale 并设置一些实用功能。

> **注意：**
>
> 以下相关视频提供了更多背景介绍和示例。

[10 分钟内上手 Tailscale（视频）](https://www.youtube.com/watch?v=sPdvyR7bLqI)

## 创建 tailnet

1. 前往 [`tailscale.com`][co-home]，选择 **开始使用**（Get Started）。你也可以在设备上[下载并安装][docs-installation] Tailscale 客户端，然后[注册](https://login.tailscale.com/start)。

2. 在 **使用你的身份提供方注册**（Sign up with your identity provider）页面，使用[单一登录（SSO）身份提供方][docs-sso-providers]账户登录。

   > **注意：**
   >
   > 如果你使用自有的自定义域名注册，会自动加入 [Enterprise][co-pricing] 套餐的 14 天试用。如果你使用 `@gmail.com` 这类公共域名邮箱账户注册，会自动加入 [Personal][co-pricing] 套餐，可免费使用 6 个用户以及 Enterprise 套餐中的许多功能。你随时可以更改套餐。更多信息参阅[管理你的套餐][docs-manage-plans]。

3. 在 **欢迎使用 Tailscale**（Welcome to Tailscale）页面，选择 **商业用途** 或 **个人用途**。

4. 在 **让我们添加你的第一台设备**（Let's add your first device）页面，选择与你当前所用设备对应的操作系统，下载并安装客户端。使用第 2 步中创建 tailnet 时相同的凭据对客户端进行认证。

   认证完成后，设备会出现在浏览器窗口中。

5. 在 **接下来，添加第二台设备**（Next, add a second device）页面，选择要添加到 tailnet 的另一台机器的操作系统。复制链接并发送到第二台设备。第二台设备完成认证后，两台设备都会显示出来。

6. 选择 **前往主页**（Take me home）。你会被重定向到 Tailscale [管理控制台](https://console.tailscale.com/admin)。通过这个界面可以控制 tailnet 的大多数方面，包括用户、设备、DNS、权限、认证密钥等。

## 重命名设备

添加到 tailnet 的每台设备（包括服务器、节点、手机和个人电脑）都会获得一个由设备操作系统主机名生成的唯一名称。这个名称显示在管理控制台的 [机器](https://console.tailscale.com/admin/machines) 页面。你还可以[重命名设备][docs-machine-names-rename]，方便在 **机器** 页面列表中查找和整理设备。

## 使用 MagicDNS

[MagicDNS][docs-magicdns] 让你不必使用 IP 地址，而是使用管理控制台 **机器** 页面中列出的名称与 tailnet 内的设备通信，从而简化设备间通信。它既可以使用自动分配的操作系统主机名，也可以使用重命名后的设备名称。MagicDNS 默认启用，建议保持启用。

## 邀请用户

tailnet 用户邀请分为两种类型。

团队成员邀请面向将使用与创建 tailnet 时相同的身份提供方进行认证的用户。

外部邀请面向不属于你自定义域名的用户，例如承包商、朋友和家人。

### 团队成员

如果你的 tailnet 使用自定义域名（`example.com`），拥有相同域名邮箱地址的用户无需邀请即可登录。你也可以发送[团队成员邀请][docs-invite-team-members]，通知他们加入。

### 外部用户

要邀请外部用户加入 tailnet，打开管理控制台的 [用户](https://console.tailscale.com/admin/users) 页面，选择 **邀请外部用户**（Invite external users），然后选择以下选项之一：

* **通过电子邮件邀请**（Invite via email）：发送一个或多个邀请。
* **复制邀请链接**（Copy invite link）：与他人分享邀请链接。

用户选择链接后，会被引导至 Tailscale 登录页面，使用[受支持的单一登录（SSO）身份提供方][docs-sso-providers]账户进行认证。认证完成后，用户会被添加到管理控制台的 **用户** 页面。

更多信息参阅[邀请任意用户加入你的 tailnet][docs-invite-any-user]。

## 添加设备

你可以使用以下任一方法向 tailnet 添加更多设备：

* 在其他设备上使用现有用户账户[登录](https://login.tailscale.com/login)到 tailnet。
* 使用[标签][docs-tags]作为服务器的身份将服务器添加到 tailnet，并使用[认证密钥][docs-auth-keys]预配服务器。更多信息参阅[在 Tailscale 网络上设置服务器][docs-set-up-servers]。
* 整合你现有的系统策略（例如移动设备管理，即 MDM）来控制设备管理。更多信息参阅[与 MDM 解决方案集成][docs-mdm]。

Tailscale 会为网络上的每台设备自动分配一个[唯一的 100.x.y.z IP 地址][docs-ip-and-dns-addresses]，让机器之间无论身处世界何处都能建立稳定连接，即使它们切换网络或位于[防火墙之后][bl-how-nat-traversal-works]。

关于添加设备的更多信息，参阅[添加设备][docs-device-add]。

## 使用出口节点保护流量

在不安全的网络上保持上网活动的私密性：将 tailnet 中的设备指定为出口节点，然后配置 tailnet 设备使用这些出口节点。

* 有关如何快速配置和使用出口节点的详细信息，参阅[使用出口节点][docs-quick-guide-exit-nodes]。
* 有关出口节点的更深入信息，参阅主主题[出口节点][docs-exit-nodes]。

## 使用子网路由流量

你可以使用子网路由器让 tailnet 访问网络中的现有资源。如果需要访问无法安装 Tailscale 客户端的设备（例如打印机），这会很有用。

* 有关如何快速配置和使用子网路由器的详细信息，参阅[配置子网路由器][docs-quick-guide-subnets]。
* 有关子网路由器的更深入信息，参阅主主题[子网路由器][docs-subnets]。

## 使用访问控制策略管理权限

你可以使用[访问控制策略][docs-access-control]（如 [ACL][docs-acls] 或 [授权][docs-grants]）为 tailnet 中的用户和设备定义自定义权限。这些权限在 tailnet 策略文件中配置，该文件位于管理控制台的 [访问控制](https://console.tailscale.com/admin/acls) 页面。

## 监控并记录流量

你可以监控并记录 tailnet 活动，例如网络流量、客户端活动、tailnet 配置变更以及 SSH 会话录制。

更多信息参阅[日志、审计与流式传输][docs-log-mesh-traffic]。

## 使用场景

需要一些灵感？Tailscale 适用于各种各样的用户和环境。本小节为一些常见场景提供指导，你可以在自己的 tailnet 中使用这些场景。

### 开发者

* 使用我们的 [Visual Studio Code 扩展][docs-vscode-extension]与 tailnet 资源交互。
* 部署、扩展和管理容器化应用，例如 [Kubernetes][docs-kubernetes]、[Docker][docs-docker] 和 [Proxmox][docs-proxmox]。
* [连接无服务器应用][docs-serverless]，例如 AWS App Runner、AWS Lambda、Google Cloud Run 和 Heroku。
* [连接云服务][docs-cloud-server]，例如 AWS、Azure、Google Compute Engine、Hetzner 和 Oracle Cloud。
* 使用 [Tailscale Serve][docs-serve] 在你的机器上共享本地服务（如 Web 应用），仅限从你的 tailnet 访问；或使用 [Tailscale Funnel][docs-funnel] 通过互联网公开共享。
* 与其他同事[共享原型服务器][docs-local-team-server]，无需修改防火墙设置。

### IT 管理员

* 使用 [Tailscale SSH][docs-tailscale-ssh] 管理 tailnet 内 SSH 连接的认证与授权。
* 整合 [AWS][docs-aws-reference-architecture] 和 [Azure][docs-azure-reference-architecture] 上的 Tailscale 部署。
* 使用[应用连接器][docs-app-connectors]控制设备和用户对第三方应用的访问，无需任何终端用户配置。
* 使用[系统策略][docs-mdm-keys]控制用户在其 Tailscale 客户端中可以访问的内容。
* 使用 [Tailscale SSH 会话录制][docs-tailscale-ssh-session-recording]，将 Tailscale SSH 会话的录制内容从目标节点流式传输到 tailnet 中的录制节点。
* 使用 [Tailscale API][docs-api] 自动化 Tailscale 网络的各个方面。
* 使用[节点共享][docs-sharing]与域外用户或受信任的 tailnet 共享资源。
* 远程管理计算机，并[锁定与 Microsoft 远程桌面协议（RDP）服务器的连接][docs-secure-rdp-windows]。

### 个人用户

* 将 [Apple TV][docs-appletv] 连接到你的 tailnet，观看媒体服务器上的文件；在外出时将 Apple TV 用作[出口节点][docs-exit-nodes]，让流量经由家庭互联网连接路由；或选择一个出口节点来路由 Apple TV 的流量。
* 使用 FTP 从[网络附加存储][docs-nas]（NAS）服务器接收文件，并从 VLC、Plex 和 JellyFin 等播放器访问媒体文件。
* 使用 [Control D][docs-control-d]、[NextDNS][docs-nextdns] 或 [Pi-hole][docs-pi-hole] 服务器为 tailnet 实现基于 DNS 的广告拦截。
* 使用 [Taildrop][docs-taildrop] 在自己的设备之间共享文件，即使跨操作系统也没问题。
* 为你和伙伴搭建私有服务器，一起玩 [Minecraft][docs-minecraft] 或在 IRC 上聊天。

## 故障排查与支持

访问我们的[支持][co-support]页面，阅读常见问答、提交缺陷报告、请求新功能、查看 Tailscale 运行状态，或直接与我们的支持团队沟通。

以下链接为常见问题提供帮助：

* [故障排查指南][docs-troubleshooting]
* [生产环境最佳实践][docs-production-best-practices]
* [安全最佳实践][docs-security-hardening]
* [将 Tailscale 与你的防火墙配合使用][docs-firewalls]

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[co-home]: https://tailscale.com/

[co-pricing]: https://tailscale.com/pricing

[co-support]: https://tailscale.com/contact/support

[docs-access-control]: /docs/features/access-control

[docs-acls]: /docs/features/access-control/acls

[docs-api]: /docs/reference/tailscale-api

[docs-app-connectors]: /docs/features/app-connectors

[docs-appletv]: /docs/install/appletv

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-aws-reference-architecture]: /docs/reference/reference-architectures/aws

[docs-azure-reference-architecture]: /docs/reference/reference-architectures/azure

[docs-cloud-server]: /docs/cloud-server

[docs-control-d]: /docs/integrations/control-d

[docs-device-add]: /docs/features/access-control/device-management/how-to/set-up

[docs-docker]: /docs/features/containers/docker

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-firewalls]: /docs/integrations/firewalls

[docs-funnel]: /docs/features/tailscale-funnel

[docs-grants]: /docs/features/access-control/grants

[docs-installation]: /docs/install

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-invite-team-members]: /docs/features/sharing/how-to/invite-team-members

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-kubernetes]: /docs/kubernetes

[docs-local-team-server]: /docs/concepts/local-team-server

[docs-log-mesh-traffic]: /docs/features/logging

[docs-machine-names-rename]: /docs/concepts/machine-names#renaming-a-machine

[docs-magicdns]: /docs/features/magicdns

[docs-manage-plans]: /docs/account/manage-plans

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm]: /docs/mdm

[docs-minecraft]: /docs/solutions/set-up-minecraft

[docs-nas]: /docs/integrations/nas

[docs-nextdns]: /docs/integrations/nextdns

[docs-pi-hole]: /docs/solutions/block-ads-all-devices-anywhere-using-raspberry-pi

[docs-production-best-practices]: /docs/reference/best-practices/production

[docs-proxmox]: /docs/integrations/proxmox

[docs-quick-guide-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-quick-guide-subnets]: /docs/features/subnet-routers/how-to/setup

[docs-secure-rdp-windows]: /docs/solutions/access-remote-desktops-using-windows-rdp

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-serve]: /docs/features/tailscale-serve

[docs-serverless]: /docs/integration-serverless-apps

[docs-set-up-servers]: /docs/how-to/set-up-servers

[docs-sharing]: /docs/features/sharing

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-taildrop]: /docs/features/taildrop

[docs-tailscale-ssh-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-troubleshooting]: /docs/reference/troubleshooting

[docs-vscode-extension]: /docs/integrations/vscode-extension
