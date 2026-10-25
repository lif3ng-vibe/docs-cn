---
title: "从 OpenVPN 迁移到 Tailscale"
description: "把你的 OpenVPN 网络迁移到 Tailscale。安全连接多台设备、按用户角色和用途限制访问，并探索更多 Tailscale 功能。"
---

最后验证于 Jan 5, 2026

## 简介

OpenVPN 是搭建虚拟专用网络（VPN）的热门选择，但相比 Tailscale 需要更多的搭建、管理和维护工作。Tailscale 是一款专为保护现代与传统网络而设计的网状 VPN 服务。Tailscale 基于 WireGuard® 协议构建，默认即提供性能、隐私与安全。

要开始迁移，你将先在两台设备上安装并配置 Tailscale，搭建一个小型网络。与传统 VPN 不同，你不需要中央网关服务器。接下来，你将探索访问控制来定制网络内的访问权限，并了解如何配置域名系统（DNS）设置来处理 DNS 查询。完成本指南的步骤后，你将拥有一个端到端加密连接的网状网络。你可以在此基础上继续扩展，完成从 OpenVPN 到 Tailscale 的全面迁移。

本指南适用于在整个网络上运行 Tailscale 的场景。相比只替换一台 OpenVPN 集中器，运行 Tailscale 网络的好处包括：

* 使用 WireGuard 实现端到端加密。
* 所需的重复认证更少。
* 连接更可靠。
* 无需专用硬件。
* 自动管理加密密钥。
* 更好的网络性能。
* 访问控制更易维护。
* 日志更全面。
* 为网络中的设备自动注册 DNS 名称（通过 [MagicDNS][docs-magicdns]）。

## Tailscale 与 OpenVPN 的区别

OpenVPN 使用一台由用户自行维护的中央服务器来创建和管理加密密钥与客户端配置，并在设备之间隧道传输所有网络流量。

Tailscale 使用 WireGuard 创建加密密钥，由控制平面负责密钥管理。Tailscale 提供客户端下载和脚本来简化安装。Tailscale 尽可能在设备之间建立直连。无法直连时，则由一组遍布全球的中继服务器转发网络流量，但这些中继绝不会解密设备间的 WireGuard 隧道。

## 前提条件

要跟着本指南操作，你需要：

* 一个电子邮箱账户。Tailscale 原生支持以下身份提供方：

  * Apple
  * Google，包括 Gmail 和 Google Workspace（G Suite）
  * GitHub
  * Microsoft，包括 Microsoft 账户、Microsoft 365、Active Directory 和 Microsoft Entra ID

  如果你使用其他身份提供方，需要额外的步骤。请根据你使用的身份提供方，参阅[设置 Okta][docs-sso-okta]、[设置 OneLogin][docs-sso-onelogin] 或[自定义 OIDC 提供方][docs-sso-custom-oidc]。

* 两台用于安装 Tailscale 客户端的设备。例如，笔记本电脑、台式机、服务器和手机都可以。Tailscale 可运行于大多数操作系统，包括 Linux、Windows、macOS、iOS 和 Android。

## 创建你的第一个 tailnet

开始迁移到 Tailscale 网络（称为 tailnet）：在一台设备上安装 Tailscale 客户端，并使用你已在使用的身份提供方登录。这一过程会自动为你创建 tailnet。

1. 前往管理控制台的 [Sign up](https://login.tailscale.com/start) 页面，使用[单点登录（SSO）身份提供方][docs-sso-providers]账户登录。
2. 在 **Welcome to Tailscale** 页面上，选择 **Business use**（商用）或 **Personal use**（个人使用）。如果你计划与工作团队一起使用这个网络，选择 **Business use**。如果你计划在家中或与亲友使用，选择 **Personal use**。

   *（图：选择创建 tailnet 的使用场景。）*

   做出选择后，选择 **Next**（下一步）。
3. 在 **Let's add your first device**（添加你的第一台设备）页面上，选择与你正在使用的设备相对应的操作系统（OS）。

   *（图：为客户端安装选择操作系统。）*

   根据你的操作系统，你可以下载 Tailscale 客户端或复制一段命令脚本。按你设备的需要，使用下载或脚本安装客户端。
4. 提示认证客户端时，使用与第 1 步创建 tailnet 时相同的凭据登录。认证完成后，你的设备会显示在浏览器窗口中。

   *（图：浏览器窗口中显示的第一台设备。）*

tailnet 创建完成、第一台设备添加完毕后，你再连接另一台设备，以便在两台设备之间建立网络连接。

## 向你的 tailnet 添加第二台设备

要观察 tailnet 内的连通性，请再添加一台设备。

1. 在另一台设备上，前往 [`https://tailscale.com/download`][co-download]。按你设备的需要，使用下载或脚本安装 Tailscale 客户端，然后在 Tailscale 的 [Login](https://login.tailscale.com/login) 页面使用与第一台设备相同的凭据登录。

2. 打开 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。你在 **Machines**（机器）页面管理 tailnet 设备。你的两台设备都在列表中，并带有设备名称、IP 地址、管理者等信息。

   *（图：tailnet 机器视图。）*

3. 打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。你在这个页面管理 tailnet 用户。你的电子邮箱账户就在列表中。

   *（图：tailnet 用户视图。）*

   由于 tailnet 是你创建的，你的[用户角色][docs-user-roles]是 Owner，拥有对 tailnet 的完整管理权限。当其他用户加入你的 tailnet 时，你或其他管理员可以设定他们的角色。用户的角色有助于决定其对 tailnet 中资源的访问权限。例如，[Admin][docs-user-roles-admin] 角色对资源的访问权限比 [Member][docs-user-roles-member] 角色更多，详见[权限矩阵][docs-user-roles-permission-matrix]。

> **注意：**
>
> 与 OpenVPN 需要你自行维护专用服务器来管理网络不同，Tailscale 管理控制台运行在 Tailscale 的平台上。

tailnet 中有了两台设备后，你现在可以验证设备之间的连通性了。

## 验证两台设备之间的连通性

与许多在连接之间使用中央网关服务器的 VPN 不同，Tailscale 设备之间建立的是直接的对等连接。

1. 要证明你的两台设备可以互相通信，请运行一条 [Tailscale CLI][docs-cli] 命令。Tailscale CLI 可运行于 Linux、Windows 和 macOS。（如果你使用 macOS，需要先在设备上[设置 Tailscale CLI][docs-cli-macos]。）

   在 tailnet 中某台设备的命令提示符下，运行以下命令 ping 另一台设备：

   ```shell
   tailscale ping <other-device-name-or-ip>
   ```

   你可以前往 [Machines](https://console.tailscale.com/admin/machines) 页面并复制另一台设备的名称，来确定 `<other-device-name-or-ip>` 的取值。你也可以复制该设备的 IP 地址。

   `tailscale ping` 命令通常会用一条 `pong` 消息响应，标明你的 `ping` 命令收到响应花了多长时间。这说明你的设备能够互相连接并通信。

2. 要再熟悉一条 Tailscale 命令，运行：

   ```shell
   tailscale netcheck --verbose
   ```

   `tailscale netcheck` 命令会显示一份关于你当前物理网络状况的报告。报告末尾列出了 Tailscale 运营的 DERP（Designated Encrypted Relay for Packets）服务器，以及你的设备到达每台服务器所需的时间。DERP 服务器负责在设备之间建立初始连接，以促成直连。在无法直连的情况下，DERP 服务器会为设备处理 [NAT 穿透][bl-how-nat-traversal-works]。

   如果你使用 Android 或 iOS，则无法运行 Tailscale CLI。你仍然可以使用 Tailscale 客户端 ping 其他设备。

   1. 在 Android 上，打开 Tailscale 应用。应用会显示 tailnet 中的设备列表。长按另一台设备，然后选择倒计时器图标。应用会显示从你的设备到另一台设备共十次 ping 的结果（除非另一台设备未连接）。
   2. 在 iOS 上，打开 Tailscale 应用。应用会显示 tailnet 中的设备列表。长按另一台设备，然后选择 **Ping**。应用会显示从你的设备到另一台设备共十次 ping 的结果（除非另一台设备未连接）。

tailnet 就绪后，接下来可以开始限制对某台设备的访问。

## 配置对设备的访问控制

在 tailnet 中，你可以基于用户、群组、autogroup、标签、Tailscale IP 地址和子网范围来限制访问。

要读取或更新为你的 tailnet 配置的访问控制，打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。该页面显示 tailnet 策略，即允许哪些设备和用户连接到你的网络。策略以 [tailnet 策略文件][docs-tailnet-policy-file]的形式存储。

Tailscale 已用一个[默认允许所有访问的策略][docs-acl-samples-default-allow-all]初始化了你的 tailnet 策略文件。这让你可以在不限制网络中任何流量的情况下连接并使用 Tailscale，并授予 tailnet 中所有设备访问 tailnet 内所有其他设备的权限。

要使用一条比默认策略更严格的策略，请编辑你的 tailnet 策略文件。例如，下面这条策略授予所有用户访问自己设备的权限。

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。

2. 在 **View file** 标签页中，将内容替换为以下 JSON：

   ```json
   {
     // All users can access their own devices.
     "grants": [
       {
         "src": ["autogroup:member"],
         "dst": ["autogroup:self"],
         "ip":  ["*"]
       }
     ]
   }
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

3. 选择 **Save**（保存）。

对于许多你希望允许用户访问自己设备、但不能访问 tailnet 中其他设备的使用场景，这条策略都很合适。

这条策略的语法包含以下内容：

* `grants`：该策略基于授权（grants），而不是旧式（但仍受支持）的访问控制列表（`acls`）。
* `src`：定义授权来源的选择器数组。此例中的数组包含 `autogroup:member` [autogroup][docs-policy-syntax-autogroups]，它为作为你 tailnet 直接成员的任何用户授予访问权。
* `dst`：定义授权目标的选择器数组。此例中的数组包含 `autogroup:self` autogroup，它为与来源认证为同一用户的任何用户授予访问权。
* `ip`：定义所授予网络层能力的字符串数组。此例中的数组包含 `*`，即授予对目标所有端口的访问权。

关于这条策略所示语法的更多信息，请参阅[授权（Grants）][docs-grants]。

你现在已经把 tailnet 策略文件从默认值修改过了。接下来再次定制它，实现更细粒度的访问控制。

## 按用户角色和用途限制访问

要让用户访问适合其角色和用途的设备，请更新你的 tailnet 策略文件，加入更多控制。例如，将你的策略配置为支持以下场景：

* 所有员工都可以访问供内部使用的设备，例如列出公司假期的 web 服务器。
* 工程团队的成员可以访问仅供工程使用的设备。
* 财务团队的成员可以访问仅供财务使用的设备。
* 法务团队的成员可以访问仅供法务使用的设备。
* 你的 tailnet 管理员（例如 IT 团队）可以管理哪些设备被归为内部、工程、财务或法务用途。

要为设备指定用途，Tailscale 提供了[标签][docs-tags]，让你可以管理对该设备的访问控制。

你直接在 tailnet 策略文件中定义群组和标签。

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面，并将 **View file** 标签页设为当前标签页。

2. 添加一个 `groups` 数组，并为每个团队及其成员添加一条定义。

   ```json {2-9}
   {
     "groups": {
       // Alice and Frank are in group:engineering
       "group:engineering": ["alice@example.com", "frank@example.com"],
       // Bob and Dana are in group:finance
       "group:finance": ["bob@example.com", "dana@example.com"],
       // Carl is in group:legal
       "group:legal": ["carl@example.com"]
     },

     // All users can access their own devices.
     "grants": [
       {
         "src": ["autogroup:member"],
         "dst": ["autogroup:self"],
         "ip":  ["*"]
       },
     ]
   }
   ```

   [`groups`][docs-policy-syntax-groups] 部分让你可以创建用户群组，并在访问规则中使用它们，而不必逐一列出用户。这条策略创建了 `group:engineering`、`group:finance` 和 `group:legal` 群组，并为每个群组添加了一个用户数组。例如，`group:engineering` 包含成员 `alice@example.com` 和 `frank@example.com`。

3. 在 `grants` 数组中，为 `engineering`（工程）团队添加授权：

   ```json {9-14}
     // All users can access their own devices.
     "grants": [
       {
         "src": ["autogroup:member"],
         "dst": ["autogroup:self"],
         "ip":  ["*"]
       },

       // Users in group:engineering can access devices tagged with tag:engineering
       {
         "src": ["group:engineering"],
         "dst": ["tag:engineering"],
         "ip":  ["*"]
       },
     ]
   ```

   `src` 是先前创建的 `group:engineering` 群组。`dst` 是 `tag:engineering` 标签，其结果是工程团队的任何成员都能访问带有 `tag:engineering` 标签的设备。

4. 同样为 `finance`（财务）和 `legal`（法务）团队添加授权：

   ```json {16-28}
     // All users can access their own devices.
     "grants": [
       {
         "src": ["autogroup:member"],
         "dst": ["autogroup:self"],
         "ip":  ["*"]
       },

       // Users in group:engineering can access devices tagged with tag:engineering
       {
         "src": ["group:engineering"],
         "dst": ["tag:engineering"],
         "ip":  ["*"]
       },

       // Users in group:finance can access devices tagged with tag:finance
       {
         "src": ["group:finance"],
         "dst": ["tag:finance"],
         "ip":  ["*"]
       },

       // Users in group:legal can access devices tagged with tag:legal
       {
         "src": ["group:legal"],
         "dst": ["tag:legal"],
         "ip":  ["*"]
       },
    ]
   ```

5. 添加一条授权条目，授予所有 tailnet 成员访问打有 `tag:internal` 标签的设备的权限。

   ```json {30-35}
     // All users can access their own devices.
     "grants": [
       {
         "src": ["autogroup:member"],
         "dst": ["autogroup:self"],
         "ip":  ["*"]
       },

       // Users in group:engineering can access devices tagged with tag:engineering
       {
         "src": ["group:engineering"],
         "dst": ["tag:engineering"],
         "ip":  ["*"]
       },

       // Users in group:finance can access devices tagged with tag:finance
       {
         "src": ["group:finance"],
         "dst": ["tag:finance"],
         "ip":  ["*"]
       },

       // Users in group:legal can access devices tagged with tag:legal
       {
         "src": ["group:legal"],
         "dst": ["tag:legal"],
         "ip":  ["*"]
       },

       // All employees can access devices tagged with tag:internal
       {
         "src": ["autogroup:member"],
         "dst": ["tag:internal"],
         "ip":  ["*"]
       }
    ],
   ```

6. 在 `grants` 数组之后、tailnet 策略文件的右括号之前，定义一个 `tagOwners` 部分。在 `tagOwners` 部分中，为每个标签添加一条定义，指明 tailnet 中哪些成员可以把该标签应用到设备。为简洁起见，本例将 `autogroup:admin` [autogroup][docs-policy-syntax-autogroups] 设为标签所有者。

   ```json {10-19}
     // All employees can access devices tagged with tag:internal
     {
       "src": ["autogroup:member"],
       "dst": ["tag:internal"],
       "ip":  ["*"]
     }

   ],

     "tagOwners": {
       // Users who are Tailscale admins can apply the tag tag:engineering
       "tag:engineering": ["autogroup:admin"],
       // Users who are Tailscale admins can apply the tag tag:finance
       "tag:finance": ["autogroup:admin"],
       // Users who are Tailscale admins can apply the tag tag:legal
       "tag:legal": ["autogroup:admin"],
       // Users who are Tailscale admins can apply the tag tag:internal
       "tag:internal": ["autogroup:admin"]
     }

   }
   ```

   现在，tailnet 中的任何 [Admin][docs-user-roles-admin] 都可以把这些标签应用到设备上。

7. 下面展示完整的 tailnet 策略文件：

   ```json
   {
     "groups": {
       // Alice and Frank are in group:engineering
       "group:engineering": ["alice@example.com", "frank@example.com"],
       // Bob and Dana are in group:finance
       "group:finance": ["bob@example.com", "dana@example.com"],
       // Carl is in group:legal
       "group:legal": ["carl@example.com"]
     },

     // All users can access their own devices.
     "grants": [
       {
         "src": ["autogroup:member"],
         "dst": ["autogroup:self"],
         "ip":  ["*"]
       },

       // Users in group:engineering can access devices tagged with tag:engineering
       {
         "src": ["group:engineering"],
         "dst": ["tag:engineering"],
         "ip":  ["*"]
       },

       // Users in group:finance can access devices tagged with tag:finance
       {
         "src": ["group:finance"],
         "dst": ["tag:finance"],
         "ip":  ["*"]
       },

       // Users in group:legal can access devices tagged with tag:legal
       {
         "src": ["group:legal"],
         "dst": ["tag:legal"],
         "ip":  ["*"]
       },

       // All employees can access devices tagged with tag:internal
       {
         "src": ["autogroup:member"],
         "dst": ["tag:internal"],
         "ip":  ["*"]
       }
     ],

     "tagOwners": {
       // Users who are Tailscale admins can apply the tag tag:engineering
       "tag:engineering": ["autogroup:admin"],
       // Users who are Tailscale admins can apply the tag tag:finance
       "tag:finance": ["autogroup:admin"],
       // Users who are Tailscale admins can apply the tag tag:legal
       "tag:legal": ["autogroup:admin"],
       // Users who are Tailscale admins can apply the tag tag:internal
       "tag:internal": ["autogroup:admin"]
     }
   }
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

8. 选择 **Save**。

你已经为 tailnet 定义了标签，现在给一台设备打上名为 `tag:engineering` 的标签。

1. 向 tailnet 添加一台新设备，做法与[向你的 tailnet 添加第二台设备][ar-add-second-device]一节相同。

2. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。

3. 选择你添加到 tailnet 的那台机器。

4. 选择菜单（图标）。

5. 选择 **Edit ACL tags**（编辑 ACL 标签）。

6. 选择 **Add tags**（添加标签）。

7. 选择 `tag:engineering` 标签。

   *（图：为设备添加标签。）*

8. 选择 **Save**（保存）。

你已经为 tailnet 建立了基于用途的身份优先组网。例如，`group:engineering` 群组中的任何成员都可以访问这台设备，因为策略允许；而 `group:engineering` 之外的任何人都无法访问它。

除了通过管理控制台为设备打标签，你还可以使用 Tailscale CLI 和 Tailscale API 为设备打标签。

关于 Tailscale 内访问控制的更多信息，请参阅[管理访问][docs-manage]。

探索完访问控制后，接下来是 DNS 配置。

## 配置 DNS 设置

如果你的 OpenVPN 配置要求客户端使用特定的 DNS 服务器，请将 tailnet 配置为同样如此。默认情况下，你的 tailnet 已启用 [MagicDNS][docs-magicdns]，也就是说 tailnet 会自动为网络中的设备注册 DNS 名称。只有当你想使用全局名称服务器或受限名称服务器（即拆分 DNS）时，才需要添加其他 DNS 服务器。

1. 打开 Tailscale 管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。
2. 在 **Nameservers**（名称服务器）部分，选择 **Add nameserver**（添加名称服务器），然后添加你想使用的任何公共 DNS 服务器以及自定义 DNS 服务器。
3. 同样在 Tailscale 管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面中，添加搜索域。搜索域为用户提供了一种便捷方式：访问本地网络资源时，无需在每次连接资源时都指定完整域名路径。你可以指定一组域名后缀，它们会自动追加到任何不是完全限定域名（FQDN）的域名后面。

这样，当 tailnet 中的用户浏览互联网或进行其他网络通信时，他们的 DNS 查询会按照你的 DNS 设置解析到相应主机。

## 结语

你创建了一个 Tailscale 网络，并在两台设备上安装了 Tailscale 客户端。你确认了两台设备可以互相连接。你还使用 Tailscale 管理控制台管理了用户、设备和访问控制（以及其他尚未展示的任务）。如果你的 OpenVPN 配置使用了特定的 DNS 服务器，你也已将 Tailscale 配置为使用相同的 DNS 服务器。

继续阅读，进一步了解 Tailscale 的组网功能以及如何在 tailnet 中配置它们。

## 进一步探索

探索让你定制网络流量路由、使用 SSH 安全连接设备、管理用户和设备的 Tailscale 功能。还可以了解为设备启用 HTTPS 的功能，以及监控 tailnet 配置和网络流的功能。

### 访问无法安装 Tailscale 客户端的设备

在组织的每台设备上都安装 Tailscale 客户端时，Tailscale 的效果最好。这能不加额外配置即强制实现端到端流量加密。

然而，有些情况下你无法或不想在每台设备上安装 Tailscale 客户端。例如，打印机等某些设备可能不允许安装 Tailscale 客户端。此外，在每台设备上都安装 Tailscale 客户端可能并不合理。当要连接大量设备（例如整个虚拟私有云（VPC））或逐步将 Tailscale 部署到传统网络时就是如此。在这些情况下，你可以设置[子网路由器][docs-subnets]，从 tailnet 中访问这些设备。子网路由器充当网关，把来自 tailnet 的流量中继到物理子网。关于设置和使用子网路由器的各操作系统说明，请参阅[设置子网路由器][docs-subnets-setup]。

设置子网路由器时，请使用与 OpenVPN 中相同的无类别域间路由（CIDR）值。

当你[为已宣告的子网路由添加访问规则][docs-subnets-linux-access-rules]时，在 Tailscale 中你授予的是对路由本身的访问权（例如 `192.0.2.0/24`）。这与 OpenVPN 不同——OpenVPN 把路由访问权授予设备，而不是设备提供的路由。

设置一台设备充当子网路由器后，你需要[在管理控制台中启用这些子网路由][docs-subnets-enable-admin-console]，除非你配置了[自动审批器][docs-policy-syntax-autoapprovers]。使用自动审批器后，当设备由对指定路由有访问权限的用户认证时（如 tailnet 策略文件的 [`autoApprovers`][docs-policy-syntax-autoapprovers] 部分所配置），该设备会自动获得子网路由审批。

### 将公共互联网流量经由单台设备路由

有时你可能希望 Tailscale 路由你的公共互联网流量。例如，在以下情况下你可能希望路由全部公共互联网流量：

* 你在一家 Wi-Fi 不受信任的咖啡馆。
* 你在海外旅行，需要访问仅在你所在国家可用的在线服务（例如网上银行）。

你可以把网络中的一台设备设置为[出口节点][docs-exit-nodes]来路由全部公共互联网流量。当你把所有流量都经由出口节点路由时，实际上就是在使用默认路由（`0.0.0.0/0, ::/0`），与使用典型虚拟专用网络（VPN）时类似。关于设置和使用出口节点的各操作系统说明，请参阅[使用出口节点][docs-quick-guide-exit-nodes]。

设置一台设备充当出口节点后，你需要[在管理控制台中允许该出口节点][docs-exit-nodes-allow-admin-console]，除非你配置了[自动审批器][docs-policy-syntax-autoapprovers]。使用自动审批器后，当设备由对指定路由有访问权限的用户认证时（如 tailnet 策略文件的 [`autoApprovers`][docs-policy-syntax-autoapprovers] 部分所配置），该设备会自动获得出口节点审批。

### 控制对第三方和 SaaS 应用的访问

[应用连接器][docs-app-connectors]让你可以用与自托管应用相同的方式，控制对 tailnet 上可用的第三方和软件即服务（SaaS）应用的访问。关于使用应用连接器的信息，请参阅[应用连接器][docs-app-connectors]。

### 建立并记录 SSH 会话

[Tailscale SSH][docs-tailscale-ssh] 让 Tailscale 管理 tailnet 中 SSH 连接的认证与授权。使用 Tailscale SSH，你可以照常 SSH 到设备，并可选择通过[检查模式][docs-tailscale-ssh-check-mode]验证高风险连接。

[Tailscale SSH 会话录制][docs-ssh-session-recording]让你把 Tailscale SSH 会话的日志流式传输到 tailnet 中的另一台设备。这些录制与其他所有 Tailscale 流量一样，使用端到端加密。

### 添加并批准用户和设备

向 tailnet 添加用户有多种方式。详情请参阅[邀请用户][docs-invite-users]。

用户审批是一项让 Tailscale 网络管理员在新用户加入 tailnet 之前对其进行审查和批准的功能。启用用户审批后，新用户第一次登录 tailnet 时，其状态为待审批。在未获批准的状态下，用户可以把设备连接到 Tailscale 协调服务器（coordination server），但无法连接 tailnet 中的其他设备。tailnet 的 Owner、Admin 或 IT 管理员可以审查用户信息，将用户状态设为已批准，或移除该用户。关于启用用户审批的信息，请参阅[为你的网络启用用户审批][docs-user-approval-enable]。

设备审批是一项让 Tailscale 网络管理员在新设备加入 tailnet 之前对其进行审查和批准的功能。使用设备审批可以确保只有受信任的设备（例如由单位管理的笔记本电脑和手机）才能访问网络。关于启用设备审批的信息，请参阅[为你的网络启用设备审批][docs-device-approval-enable]。

### 使用认证密钥添加新设备

你可以使用预认证密钥（"认证密钥（auth key）"）来注册新设备，而无需通过网页浏览器登录。无论是否启用设备审批都适用。详情请参阅[用认证密钥注册设备][docs-auth-keys-register]。

### 启用 HTTPS

Tailscale 节点之间的连接使用端到端加密。但浏览器、web API 和 VS Code 等产品感知不到这一点，可能会因为指向你 tailnet 服务的 HTTP URL 看起来未加密（未使用传输层安全（TLS）证书）而向用户发出警告或禁用功能。要为 tailnet 中的设备供应 TLS 证书，请参阅[启用 HTTPS][docs-enabling-https]。

### 监控 tailnet 配置与网络流

[配置审计日志][docs-audit-logging]让你可以查明在你的 tailnet 中*谁*在*何时*做了*什么*。配置审计日志记录修改 tailnet 配置的操作，包括操作类型、操作者、目标资源和时间。Tailscale 为所有 tailnet 启用配置审计日志，且无法关闭。你可以在管理控制台的 [Logs](https://console.tailscale.com/admin/logs) 页面监控配置审计日志。

网络流日志让你了解 tailnet 中的节点如何以及何时互相连接。网络日志中捕获的数据是网络流量的流向，而不是网络流量的内容。Tailscale 不会也无法检查你的流量。关于启用网络流日志的信息，请参阅[启用网络流日志][docs-network-flow-logs-enable]。

[ar-add-second-device]: #向你的-tailnet-添加第二台设备

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[co-download]: https://tailscale.com/download

[docs-acl-samples-default-allow-all]: /docs/reference/examples/acls#允许所有默认-acl

[docs-app-connectors]: /docs/features/app-connectors

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-auth-keys-register]: /docs/features/access-control/auth-keys#register-a-node-with-the-auth-key

[docs-cli-macos]: /docs/reference/tailscale-cli?tab=macos#using-the-tailscale-cli

[docs-cli]: /docs/reference/tailscale-cli

[docs-device-approval-enable]: /docs/features/access-control/device-management/device-approval#enable-device-approval-for-your-network

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-exit-nodes-allow-admin-console]: /docs/features/exit-nodes#在管理控制台中允许出口节点

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-invite-users]: /docs/features/sharing/how-to/invite-users

[docs-magicdns]: /docs/features/magicdns

[docs-manage]: /docs/manage

[docs-network-flow-logs-enable]: /docs/features/logging/network-flow-logs#启用网络流日志

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#自动批准autoapprovers

[docs-policy-syntax-autogroups]: /docs/reference/syntax/policy-file#autogroup

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#群组groups

[docs-quick-guide-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-ssh-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-sso-custom-oidc]: /docs/integrations/identity/custom-oidc

[docs-sso-okta]: /docs/integrations/identity/okta

[docs-sso-onelogin]: /docs/integrations/identity/onelogin

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets-enable-admin-console]: /docs/features/subnet-routers#从管理控制台启用子网路由

[docs-subnets-linux-access-rules]: /docs/features/subnet-routers?tab=linux#add-access-rules-for-the-advertised-subnet-routes

[docs-subnets-setup]: /docs/features/subnet-routers#设置子网路由器

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-ssh-check-mode]: /docs/features/tailscale-ssh#检查模式

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-user-approval-enable]: /docs/features/access-control/user-approval#enable-user-approval-for-your-network

[docs-user-roles-admin]: /docs/reference/user-roles#admin管理员管理员

[docs-user-roles-member]: /docs/reference/user-roles#member成员

[docs-user-roles-permission-matrix]: /docs/reference/user-roles#权限矩阵

[docs-user-roles]: /docs/reference/user-roles
