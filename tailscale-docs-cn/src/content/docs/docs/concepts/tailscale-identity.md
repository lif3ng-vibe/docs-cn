---
title: "Tailscale 身份"
description: "了解身份在 Tailscale 中如何建立和使用。"
---

最后验证于 Feb 11, 2026

## 简介

身份是 Tailscale 平台的核心，为你的 Tailscale 网络（称为 tailnet）提供身份感知的连接能力。身份将用户、设备和流量绑定在一起，让你可以基于*谁*在连接、*什么*在连接来实施访问控制。

*用户身份*是实体（例如用户或进程）的数字身份。身份提供方（IdP）对实体进行身份验证并确立用户身份。Tailscale 本身不提供用户身份，而是把用户身份验证委托给[原生][docs-sso-providers-native]或[自定义 OpenID Connect（OIDC）][docs-sso-custom-oidc]身份提供方。Tailscale 信任身份提供方对用户身份的验证。

不过，Tailscale 会建立*节点身份*。节点身份将用户身份绑定到特定设备。因此在 Tailscale 中，用户有身份，节点同样有身份。举例来说，邮箱为 `Amelie@example.com` 的用户 Amelie 拥有一个用户身份，由为其邮箱配置的身份提供方提供。当 Amelie 用该邮箱在名为 `Amelie-laptop` 的笔记本电脑上登录 Tailscale 时，Tailscale 依靠 IdP 验证用户身份，随后创建一个节点身份，把用户身份绑定到 `Amelie-laptop` 设备（是设备本身，而不是设备的名称）。节点身份基于一对密码学密钥。Tailscale 在两个节点之间创建隧道时会使用节点身份，确保双方确切知道自己正在连接谁。

tailnet 是获准连接的节点及其所拥有访问权限的集合。Tailscale 在决定授予何种网络访问权限时，会同时考虑用户身份和节点身份。

传统网络安全通常基于 IP 地址，其假设是每个 IP 地址代表一台设备。但在现代互联网上，IP 地址转瞬即变。因此，Tailscale 的安全模型基于用户身份、标签和节点身份。（当然，Tailscale 也提供[稳定的 IP 地址][docs-ip-and-dns-addresses]。）

以下各节介绍 Tailscale 身份的使用方式。

### 定义访问控制

每个 Tailscale 连接都基于身份。你可以基于这一 Tailscale 身份，使用[授权][docs-grants]（grant）在网络层和应用层定义[访问控制][docs-access-control]策略。授权存放在 [tailnet 策略文件][docs-tailnet policy file]中，这是一个集中式的人类可读 JSON（HuJSON）配置文件，存储着你 tailnet 的参数、策略和设置。

一条授权依赖来源（`src`）和目标（`dst`）来定义谁能访问 tailnet 中的什么。这两个字段都接受多种选择器，用于标识用户、设备、组或 IP 地址范围。

你可以使用如下选择器指定来源：

* 特定电子邮件地址（`Amelie@example.com`），用于单个用户。
* [组][docs-targets-groups]（`group:engineering`），用于用户组。
* [标签][docs-tags]（`tag:database`），用于设备组。
* 角色（[`autogroup:admin`][docs-targets-autogrouprole]），用于管理类用户。

同样，你可以使用相同类型的[选择器][docs-targets]来定义目标，外加 [`autogroup:internet`][docs-targets-autogroups] 等特殊选择器。

更多信息请参阅[授权][docs-grants]。

### 使用 Tailscale 身份对应用进行身份验证

[`tsidp`][docs-tsidp] 是一个符合 OIDC 和 OAuth 规范、可与你的 tailnet 集成的身份提供方服务器。`tsidp` 让你可以使用 Tailscale 身份，对支持 OpenID Connect 的应用以及经过身份验证的模型上下文协议（MCP）客户端/服务器连接进行身份验证。

再举一例，[Tailscale Serve][docs-serve] 等功能会将身份信息以 [HTTP 头][docs-serve-identity-headers]的形式呈现，因此 tailnet 中的后端可以识别请求来自哪位 Tailscale 用户。

### 将 Tailscale 嵌入 Go 程序

[`tsnet`][docs-tsnet] 是一个让你把 Tailscale 嵌入 Go 程序的库。借助 `tsnet`，你可以用编程方式与 tailnet 中的设备建立直连，就像 tailnet 中的其他设备一样。`tsnet` 的一大优势是允许多个应用各自注册为独立节点，在同一台设备上同时运行。每个 `tsnet` 应用都是自己的 Tailscale 节点，拥有自己的 IP 地址、访问控制规则，甚至自己的用户身份。

## 设备所有权与身份验证

用户设备与非用户设备在所有权和身份验证上有所不同。

### 用户设备

当 Tailscale 用户在一台新设备（即此前未加入过 tailnet 的设备）上登录时，身份提供方会对用户进行身份验证，包括使用 IdP 配置的任何多因素认证（MFA）设置。Tailscale 本身不是身份提供方，而是与任何符合 OIDC 规范的 IdP 集成。

登录后，经身份验证的身份将伴随该用户的所有 Tailscale 连接。从 tailnet 的角度看，该用户“拥有”这台设备。如果用户从 tailnet 中被移除，其拥有的所有设备也会一并移除。

### 已打标签的设备

对于不应归属于某个用户的设备（例如服务器、物联网设备、Docker 容器中运行的进程等），Tailscale 提供了[标签][docs-tags]。标签让你可以把身份附加到非用户设备上，还能按用途管理访问控制策略。例如，你可以给一台充当 Web 服务器的服务器打上 `tag:webserver` 标签，如果它只用于内部访问，还可以给它打上 `tag:internal-access` 标签。

[认证密钥][docs-auth-keys]（auth key）让 Tailscale 无需交互式登录即可验证非用户设备（以及用户设备）。个人用户或 [OAuth 客户端][docs-oauth-client]都可以创建认证密钥。认证密钥将设备验证到生成该密钥的特定 tailnet。

经认证密钥验证的设备，其所有者要么是创建该密钥的用户，要么是用户创建密钥时指定的一个或多个标签。给设备打标签后，原先与该设备关联的用户不再拥有该设备。已打标签设备发起任何 Tailscale 连接时所用的身份，就是分配给该设备的那组标签。

经身份验证的用户或已打标签的设备是节点不可或缺的组成部分。

## 节点的创建过程

节点的基础是一对密码学密钥，由 Tailscale 使用 [WireGuard®][xt-wireguard] 协议创建。节点一旦创建，就为经身份验证的实体、其绑定的设备以及其所属的 tailnet 提供身份。

在设备上安装 Tailscale 客户端时，Tailscale 会创建机器（machine）公钥/私钥对。当 Tailscale 的[控制平面][bl-how-tailscale-works-control]需要与设备交互时，会使用机器密钥以密码学方式验证设备身份。机器私钥永远不会离开其所在设备。Tailscale 自动处理机器密钥，用户无需与之打交道。

节点是经身份验证的实体（例如用户或进程）与特定设备的绑定，其依据是对设备机器私钥的掌握。实体首次使用 Tailscale 客户端在设备上进行身份验证时，Tailscale 会代表该经身份验证的实体创建节点公钥/私钥对。Tailscale 通过机器密钥验证设备身份，并依靠实体的身份验证来构成节点。

节点私钥永远不会离开其所在设备。Tailscale 控制平面只收集和分发节点公钥。

控制平面把某个节点的公钥分发给所有获准与之通信的其他节点。当 tailnet 中两个节点相互通信时，WireGuard 使用它们的节点密钥验证节点真实性，并建立端到端加密。

与机器密钥一样，Tailscale 自动处理节点密钥，因此用户在使用 Tailscale 或管理 tailnet 时通常无需与节点密钥打交道。

tailnet 的节点显示在 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中。

## 身份在安全连接中的作用

当一个节点（来源）向另一个节点（目标）发起连接请求时，目标节点上运行的 [`tailscaled` 守护进程][docs-tailscaled]可以查找来源的 [Tailscale IP 地址][docs-ip-and-dns-addresses]，从而确定来源节点属于哪个用户或哪组标签。具体来说，`tailscaled` 会在网络地图（netmap）中查找该 IP 地址——每个节点都会从控制平面收到一份网络地图，其中除了别的信息，还包含按照 tailnet 策略文件中的授权、该节点可连接的节点集合。

`tailscaled` 能确定来源节点属于哪个用户或哪组标签，因此可以基于针对该来源允许的授权和端口创建规则。随后 `tailscaled` 指示 WireGuard 在节点之间建立安全连接，详见[连接如何确保安全][ar-how-connections-are-secured]。

响应来源的目标应用可以使用 [LocalAPI][xt-go-tailscale-ipn-localapi] 与 `tailscaled` 通信，获取关于来源的更多信息。通过 LocalAPI 可以获得诸如具体是哪个节点发起的请求、其 Tailscale IP 地址，以及来源属于哪个用户或哪组标签等信息。LocalAPI 还可以查询 tailnet 策略文件为该来源允许了哪些授权。

如果你在使用 [Tailscale Serve][docs-serve]（可将流量代理到本地服务），可以使用[身份头][docs-serve-identity-headers]获取与来源关联的 Tailscale 用户。身份头只对用户填充，对已打标签的设备不填充。

同样在 Tailscale Serve 中，你可以使用[应用能力头][docs-serve-app-capabilities-headers]获取来源被允许的[应用能力][docs-grants-app-capabilities]（对用户设备和已打标签设备都适用）。应用能力为在更高应用层运行的具体特性和功能提供细粒度权限。这样可以精确控制节点能执行哪些操作，而不仅仅是能建立哪些网络连接。

Tailscale 身份完整地贯穿这一流程，供应用程序使用。

## 连接如何确保安全

两个节点之间的安全连接依赖 WireGuard 公钥/私钥对。每个节点都知道自己可访问的那些节点的公钥，因为这些公钥由 Tailscale 控制平面分发。当两个节点尝试连接时，WireGuard 使用节点密钥以密码学方式验证节点。节点身份验证通过后，WireGuard 会创建一个对称密钥，且只分发给这两个节点。节点使用该对称密钥加密和解密连接期间交换的数据包。

关于建立安全连接的密码学基础，更多信息请参阅 [Key management characteristics of the Tailscale Control Protocol][bl-tailscale-key-management] 与 WireGuard 的 [Protocol][xt-wireguard-protocol] 文档。

## Tailscale 自动管理密钥

脱离 Tailscale 单独使用 WireGuard，用户必须手动生成并分发实现端到端加密所需的密钥。构建在 WireGuard 之上的 Tailscale 自动处理密钥的生成与分发，用户因此无需执行这些手动步骤。

## 设备、节点与用户账户的关系

一台设备可以注册到多个 tailnet。Tailscale 客户端允许你选择使用哪个 tailnet。例如，你可以在个人 tailnet 和公司 tailnet 之间切换。二者是各自独立的逻辑节点，因为它们各有自己的节点密钥，并且绑定到不同的身份——例如你的个人邮箱与工作邮箱。

但一个节点只属于一个 tailnet。例如，用户笔记本电脑的操作系统同一时间只能作为一个 tailnet 中的活动节点。不过，如果该用户的笔记本在 Docker 容器中或以用户态网络模式运行的 `tsnet` 应用中运行 Tailscale，那么一台笔记本上可以同时运行多个 Tailscale 客户端，各自作为独立节点运行。这些客户端各自作为独立服务运行，拥有不同的 IP 地址、访问控制规则和用户身份。

用户可能有多个邮箱账户，例如一个个人邮箱账户和一个工作邮箱账户。从 Tailscale 的角度看，这些账户彼此独立、互不相关，即使用户在同一台设备上登录这些账户。

## tailnet 示例

### 在新设备上加入 tailnet

在本例中，Amelie 获准加入 `yak-bebop` tailnet。Amelie 在名为 `Amelie-laptop` 的笔记本电脑上安装 Tailscale 客户端。安装期间，Tailscale 为这台笔记本创建机器密钥，此后 Tailscale 就通过机器密钥来识别这台笔记本（机器叫什么名字并不重要）。接下来，Tailscale 提示 Amelie 登录。具体而言，Tailscale 客户端在笔记本首选的网页浏览器中向 Amelie 展示一个由 Tailscale 控制平面提供的 URL，并通过 TLS 完成 OAuth 2.0 流程。Amelie 以 `Amelie@example.com` 登录，由为其邮箱地址设置的身份提供方完成身份验证。由于这是 `Amelie@example.com` 在 `Amelie-laptop` 上的首次身份验证，Tailscale 会基于经身份验证的 `Amelie@example.com` 实体、绑定刚创建的机器密钥，创建一个 tailnet 节点。作为创建节点的一部分，Tailscale 创建节点公钥/私钥对。Tailscale 控制平面将该节点公钥发送给这个新节点有权访问的节点，并把新节点有权访问的节点的公钥发送给新节点。这样，新节点就能连接 tailnet `yak-bebop` 中的其他节点。

如果 tailnet `yak-bebop` 要求[设备审批][docs-device-approval]，那么在 `yak-bebop` 的网络管理员为 `Amelie-laptop` 设备[完成审批][docs-device-approval-approve]之前，Tailscale 不会分发该节点公钥，也不会把其他设备的公钥共享给 `Amelie-laptop`。

### 在 tailnet 之间切换

在本例中，Amelie 获准同时加入 `yak-bebop` 和 `cat-crocodile` 两个 tailnet。Amelie 已在名为 `Amelie-workstation` 的设备上安装了 Tailscale 客户端，但尚未进行身份验证。由于 Tailscale 通过机器密钥识别这台设备，设备叫什么名字并不重要。当 Amelie 以 `Amelie@example.com` 登录时，系统会提示其在 tailnet `yak-bebop` 和 tailnet `cat-crocodile` 之间做出选择。如果 Amelie 选择 tailnet `yak-bebop` 并成功通过身份验证，设备就会接入 `yak-bebop` tailnet。同样，如果选择 tailnet `cat-crocodile`，设备就会接入 `cat-crocodile` tailnet。这台设备此时已完成 `Amelie@example.com` 的身份验证并绑定到 `Amelie-workstation` 上的机器密钥，可以连接所选 tailnet 中的其他设备。

如果 Amelie 选择的 tailnet 要求[设备审批][docs-device-approval]，那么在 `yak-bebop` 的网络管理员为新节点[完成审批][docs-device-approval-approve]之前，Tailscale 不会分发新节点的公钥，也不会把其他设备的公钥共享给新节点。

Amelie 可以继续在 `Amelie-workstation` 上选择要使用的 tailnet。Tailscale 客户端知道节点位于哪个 tailnet，且任一时刻节点只能连接一个 tailnet。在 tailnet 之间切换时，Tailscale 会使用所选 tailnet 对应的节点密钥。

节点初次创建后，Tailscale 客户端会重复使用关联的节点密钥进行连接，直到用户重新进行身份验证。重新身份验证会生成一对新的节点公钥/私钥。

### 使用不同的用户账户

在本例中，Amelie 有个人邮箱账户和工作邮箱账户，并使用同一台笔记本登录 Tailscale。注意，Tailscale 只允许同一时间在笔记本上登录一个用户账户。

当 Amelie 使用个人邮箱账户登录 Tailscale 时，产生的节点位于与个人邮箱账户关联的 tailnet 中，对与工作邮箱账户关联的 tailnet 一无所知。同样，当 Amelie 使用工作邮箱账户登录 Tailscale 时，产生的节点位于与工作邮箱账户关联的 tailnet 中，对与个人邮箱账户关联的 tailnet 一无所知。

[ar-how-connections-are-secured]: #连接如何确保安全

[bl-how-tailscale-works-control]: https://tailscale.com/blog/how-tailscale-works#the-control-plane-key-exchange-and-coordination

[bl-tailscale-key-management]: https://tailscale.com/blog/tailscale-key-management

[docs-access-control]: /docs/features/access-control

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval-approve]: /docs/features/access-control/device-management/device-approval#approve-devices-from-the-admin-console

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants]: /docs/features/access-control/grants

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-oauth-client]: /docs/features/oauth-clients

[docs-serve-app-capabilities-headers]: /docs/features/tailscale-serve#app-capabilities-header

[docs-serve-identity-headers]: /docs/features/tailscale-serve#identity-headers

[docs-serve]: /docs/features/tailscale-serve

[docs-sso-custom-oidc]: /docs/integrations/identity/custom-oidc

[docs-sso-providers-native]: /docs/integrations/identity#supported-native-identity-providers

[docs-tags]: /docs/features/tags

[docs-tailnet policy file]: /docs/features/tailnet-policy-file

[docs-tailscaled]: /docs/reference/tailscaled

[docs-targets-autogrouprole]: /docs/reference/targets-and-selectors#autogrouprole

[docs-targets-autogroups]: /docs/reference/targets-and-selectors#autogroups

[docs-targets-groups]: /docs/reference/targets-and-selectors#groups

[docs-targets]: /docs/reference/targets-and-selectors

[docs-tsidp]: /docs/features/tsidp

[docs-tsnet]: /docs/features/tsnet

[xt-go-tailscale-ipn-localapi]: https://pkg.go.dev/tailscale.com/ipn/localapi

[xt-wireguard-protocol]: https://www.wireguard.com/protocol/

[xt-wireguard]: https://www.wireguard.com
