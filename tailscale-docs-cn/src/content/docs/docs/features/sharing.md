---
title: "与他人共享你的机器"
description: "让另一个 tailnet 上的 Tailscale 用户访问你 tailnet 内的私有机器，而不将机器暴露给公众。"
---

最后验证于 Jan 5, 2026

> **注意：** 基于链接的共享目前处于 beta 阶段。

> **注意：** 共享功能[对所有套餐](https://tailscale.com/pricing)可用。

你可以与 Tailscale 网络（即 tailnet）之外的人共享对特定机器的访问，而无需把机器暴露到公共互联网。共享只会让接收方访问你 tailnet 中被共享的那台机器，此外什么都访问不到。

tailnet 中的用户可以按照[访问控制策略][docs-access-control]访问所有机器；只有要让外部用户访问某台机器时，才需要使用共享。

共享会同时遵循你的 tailnet 和接收方 tailnet 的访问控制策略与 [MagicDNS][ar-sharing-magic-dns] 设置。共享会剥除接收方 tailnet 的[标签][docs-tags]、[组][docs-policy-syntax-groups]和[子网][ar-sharing-subnets]信息。被共享的机器只对接收方单个用户可见——对接收方所在的整个 tailnet 不可见。

## 共享资源的方式

Tailscale 支持两种向 tailnet 之外共享资源的方式：

* **基于链接的节点共享**：把单台机器共享给另一个 tailnet 上的特定 Tailscale 用户，由该用户接受邀请来访问被共享的机器。本主题余下部分介绍如何使用基于链接的节点共享。
* **[声明式节点共享][docs-declarative-node-sharing]**：通过策略而非逐条共享邀请，在互信的 tailnet 之间共享资源。声明式节点共享目前处于 alpha 阶段。

## 与其他用户共享机器

你需要是 tailnet 的 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)才能共享机器。

共享机器的步骤：

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，找到你想共享的机器。
2. [通过电子邮件][ar-share-by-email]或[手动使用链接][ar-share-by-link]发送邀请。
3. [等待接收方接受][ar-wait-for-receipt]。

接收方接受邀请后，就能从他们的 Tailscale 客户端和管理控制台访问被共享的机器，就像它在自己的 tailnet 上一样。例如，macOS 应用会把它显示在菜单栏里，Linux 应用可以在 `tailscale status` 中找到它。

关于被共享机器的几点说明：

* Tailscale 默认对被共享的机器进行[隔离][ar-quarantine]。被共享的机器可以接收入站连接（来自对方用户的 tailnet），但不能主动发起连接。这意味着用户接受共享时不会让自己的 tailnet 暴露于风险。
* 自 Tailscale v1.4 起，被共享的机器在另一个 tailnet 中显示为共享者，而不是机器的所有者。如果 Ross 把同事 Dave 的机器共享给另一个 tailnet，那么在新 tailnet 中它会显示为由 Ross 所有。
* 被共享机器在接收方 tailnet 中的 IPv4 地址通常与它在共享者 tailnet 中的 IPv4 地址相同。但如果接受共享时该地址在接收方 tailnet 中已被占用（因为接收方 tailnet 中的另一个资源正在使用该地址），则会为被共享机器在接收方 tailnet 中分配一个不同的地址。
* 未使用的邀请链接 30 天后过期。

> **警告：**
>
> 机器不能与标签共享，也不能被另一个 tailnet 上带标签的机器访问，因为只有用户才能接受机器共享。

### 通过电子邮件共享

通过电子邮件发送邀请时，每个指定的接收方都会收到一个访问你机器的一次性邀请链接。接收方不必拥有相同邮箱地址的 Tailscale 账户，他们可以用任意 Tailscale 账户登录并接受共享。

1. 选择该菜单，然后选择 **Share** 打开 **Share** 对话框。
2. 选择 **Share by email** 标签页。
3. 为每个你想发送邀请链接的用户添加其邮箱地址。
4. 选择 **Share**，向列出的每个邮箱地址发送电子邮件邀请。

### 通过链接共享

对于打算手动分享的邀请链接，你可以选择创建一次性链接或可复用链接。一次性邀请链接只能使用一次；可复用邀请链接最多可使用 1,000 次。无论一次性还是可复用邀请链接，未使用的链接都会在 30 天后过期。

1. 选择该菜单，然后选择 **Share** 打开 **Share** 对话框。
2. 选择 **Copy invite link** 标签页。
3. （可选）：打开 **Reusable link** 开关，生成可被多次接受的链接。
4. 选择 **Copy share link** 创建链接并复制到剪贴板。
5. 把复制好的邀请链接分享给目标接收方。请像对待密码一样对待邀请链接——它能连接你 tailnet 内的一台机器。

### 等待接收方接受

接收方需要是某个 tailnet 的 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能接受被共享机器的邀请。

接收方可以访问邀请链接查看你的邀请。接受之后，你可以在 **Share** 对话框中看到对方的头像和邮箱地址。管理控制台的 **Machines** 列表中也会出现一个标识，显示哪些机器已被共享给外部用户。

> **注意：**
>
> 未使用的邀请链接 30 天后过期。

## 撤销邀请

你需要是 tailnet 的 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能撤销共享或共享邀请。

你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面撤销共享或共享邀请。撤销邀请后，接收方用户将无法再访问被共享的机器。要恢复访问，你必须创建一个新邀请，且接收方必须接受这个新邀请。

撤销邀请的步骤：

1. 前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 选择该机器的 **Share** 选项。
3. 选择该菜单 > **Revoke invite**。

## 共享的工作原理

共享一台机器会把该机器暴露给另一个 tailnet 上的某个用户。只有该用户能访问你的机器，该 tailnet 上的其他用户都看不到它。

*（图：此示例中，只有 tailnet A 中被共享的机器与 tailnet B 中共享接收方的机器能够跨 tailnet 边界通信。）*

在此示例中，只有 tailnet A 中被共享的机器与 tailnet B 中共享接收方的机器能够跨 tailnet 边界通信。

当你接受邀请时，Tailscale 只向那台机器暴露关于你 tailnet 的最少信息。接受邀请会暴露：

* 接收方的邮箱和头像（用于帮助确认邀请）
* 你 tailnet 中机器的物理机器 IP（建立连接所需）

### 隔离

被共享的机器默认被隔离。它们可以响应来自被共享目标 tailnet 的入站连接，但不能自行发起连接。隔离让共享做到"默认安全"——你可以在不暴露自己 tailnet 的风险下接受共享。

### 共享与 MagicDNS

[MagicDNS][docs-magicdns] 是按 tailnet 生效的设置。如果你的 tailnet 启用了 MagicDNS，无论对方 tailnet 的设置如何，你都可以通过 MagicDNS 访问机器。

被共享的机器自 Tailscale v1.4 起支持 MagicDNS。只能通过完全限定域名访问被共享的机器，其形如 `<hostname>.<tailnet-name>.ts.net`。

* `<hostname>` 是机器的名称。
* `<tailnet-name>` 是 tailnet 的 [tailnet 名称][docs-tailnet-name]。

例如，如果你的朋友把 `yak-bebop` tailnet 上一台名为 `minecraft-server` 的机器共享给你的 tailnet，你可以通过 `minecraft-server.yak-bebop.ts.net` 访问它。但在你的 tailnet 中，你不能只用 `minecraft-server` 访问它。

> **注意：**
>
> 以前你可能用过以 `.beta.tailscale.net` 结尾的 tailnet DNS 名称。如果是这样，请迁移到以 `.ts.net` 结尾的新 tailnet DNS 名称。对 `beta.tailscale.net` 名称的支持已于 **2024 年 9 月 13 日**终止。

这些限制是必要的，以防止 MagicDNS 名称意外变化，并支撑未来构建在共享之上的功能。

### 共享与访问控制策略

用户接受共享后，即可向被共享的机器发起出站请求，这些请求会遵循拥有该被共享机器的 tailnet 中定义的[访问控制策略][docs-access-control]。

默认情况下，被共享的机器处于隔离状态，不能向该用户的机器发起出站请求。不过，机器之间可以"互相共享"，从而允许彼此发起出站连接。

例如，如果你有 `workstation-1`（属于 `example-company-tailnet`）和 `workstation-2`（属于 `sam@example.com`），想让二者互相访问，你需要：

1. 把 workstation-1 共享给 `alice@example.com`。
2. 把 workstation-2 共享给 `alice@example-company.com`。

如果你[连接被共享的机器时遇到问题][ar-troubleshooting]，请检查 tailnet 策略文件中是否有阻止访问的规则。

要编写作用于被共享机器的[访问规则][docs-policy-syntax-access-rules]，可以使用接收方的邮箱地址。例如，如果你邀请 `alice@example.com` 共享位于 `100.74.78.2` 的机器，就可以让 Alice 访问特定主机。

```json
"grants": [
  {
    "src": ["group:admins"],
    "dst": ["*"],
    "ip": ["*"]
  },
  {
    "src": ["alice@example.com"],
    "dst": ["100.74.78.2"],
    "ip": ["*"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

> **警告：**
>
> 当心 `"src": ["*"]` 这类规则——它作用于所有能访问你 tailnet 的对象，包括受邀用户。考虑创建一个包含你全部 tailnet 用户的组来代替 `*`。

你还可以使用特殊的 `autogroup:shared` 组来编写访问规则。该组自动包含受邀进入你 tailnet 的所有用户，让你无需预知邮箱地址就能编写规则。

例如，要把受邀用户限制为只能访问 Web 服务器的 `80` 和 `443` 端口，可以编写如下规则：

```json
"grants": [
  // Admins can access everything in the tailnet.
  {
    "src": ["group:admins"],
    "dst": ["*"],
    "ip": ["*"]
  },
  // Shared users can only access port 80 and 443 of machines they are invited to.
  {
    "src": ["autogroup:shared"],
    "dst": ["*"],
    "ip": ["80", "443"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

记住：受邀用户只能访问你邀请他们共享的机器，访问规则会进一步限制他们的访问范围。尽管 `*:80,443` 这条规则看起来像允许用户访问所有机器，但它只是在进一步把他们的访问限制到我们指定的端口上。

共享不会把[标签][docs-tags]暴露给另一个 tailnet。所有标签信息都会被剥除，不能在另一个 tailnet 的 tailnet 策略文件中使用。

### 共享与子网（子网路由器）

被共享的机器不会向被共享进入的 tailnet 通告[子网][docs-subnets]，而[邀请][docs-invite-any-user]外部用户进入你的 tailnet 则会让他们能访问子网路由器。

### 共享与出口节点

共享[出口节点][docs-exit-nodes]会把它暴露给另一个 tailnet。

共享出口节点请按以下顺序操作：

1. [把机器通告为出口节点][docs-exit-nodes-advertise-exit-node]。

2. 如果你没有使用 [`autoApprovers`][docs-policy-syntax-autoapprovers]，请[在管理控制台中允许该出口节点][docs-exit-nodes-allow-exit-node]。

3. 按上文说明共享该机器，让接收方能把它用作出口节点。确保勾选 **Allow use as an exit node** 选项。

如果某个[用户被删除][docs-remove-team-members]，其管理的被共享机器也会被删除。如果某个用户被停用，其管理的被共享机器将无法连接其他机器。

### 共享与被停用或删除的用户

当你[删除用户][docs-remove-team-members]时，也会删除其管理的被共享机器。如果你停用某个用户，Tailscale 会阻止其管理的被共享机器连接其他机器。

### 共享与 Tailnet Lock

共享进入启用了 [Tailnet Lock][docs-tailnet-lock] 的 tailnet 的节点，需要先签名才能被访问。

要从启用了 Tailnet Lock 的 tailnet 向外共享节点，接受共享邀请的用户需要先让自己的节点在加锁的 tailnet 中完成签名，之后才能访问被共享的节点。

### 故障排除

如果你能找到一台共享给你的机器，但无法连接它：

* 如果你在尝试通过[机器名称][docs-machine-names]（而不是 [100.x.y.z][docs-100.x-addresses] 地址）访问该机器，请确保已[启用 MagicDNS][docs-magicdns]。你可以在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面启用 MagicDNS。
* 检查你 tailnet 的[访问控制策略][docs-access-control]，看是否有规则禁止访问。如果没有，可能是共享方 tailnet 在限制该流量。请对方也检查一下他们的访问控制策略。

[ar-quarantine]: #隔离

[ar-share-by-email]: #通过电子邮件共享

[ar-share-by-link]: #通过链接共享

[ar-sharing-magic-dns]: #共享与-magicdns

[ar-sharing-subnets]: #共享与子网子网路由器

[ar-troubleshooting]: #故障排除

[ar-wait-for-receipt]: #等待接收方接受

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-access-control]: /docs/features/access-control

[docs-declarative-node-sharing]: /docs/features/declarative-node-sharing

[docs-policy-syntax-access-rules]: /docs/reference/syntax/policy-file#acl

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#自动批准autoapprovers

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#群组groups

[docs-exit-nodes-advertise-exit-node]: /docs/features/exit-nodes#将设备宣告为出口节点

[docs-exit-nodes-allow-exit-node]: /docs/features/exit-nodes#在管理控制台中允许出口节点

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-machine-names]: /docs/concepts/machine-names

[docs-magicdns]: /docs/features/magicdns

[docs-remove-team-members]: /docs/features/sharing/how-to/remove-team-members

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailnet-name]: /docs/concepts/tailnet-name
