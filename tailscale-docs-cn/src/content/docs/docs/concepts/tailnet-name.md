---
title: "Tailnet 名称与类型"
description: "tailnet 使用多种名称类型来标识设备并管理访问，包括 Tailnet DNS 名称、机器名称、Tailnet ID 和 Legacy ID，各自承担不同用途。"
---

最后验证于 Jan 5, 2026

Tailscale 网络（称为 [tailnet][docs-tailnet]）包含多种类型的名称，用于标识和连接其中的所有内容。主要有三种名称类型：

* **Tailnet DNS 名称**：在整个 tailnet 内用于名称解析的完全限定域名（FQDN）。
* **机器名称**：tailnet 中设备或节点的名称。
* **Tailnet ID**：与 [Tailscale API][docs-api] 一起使用的字符串。

## Tailnet DNS 名称

创建新 tailnet 时，Tailscale 会为其分配一个格式为 `tail<ID>.ts.net` 的 DNS 名称，其中 `<ID>` 是随机生成的十六进制字符串，例如 `tailnet-fe8c.ts.net`。

这一名称有多个重要用途，包括让 [MagicDNS][docs-magicdns] 为 tailnet 设备注册 DNS 名称，以及作为 [HTTPS][docs-enabling-https] 证书的完全限定域名。共享（sharing）功能也用它来唯一标识被共享的 tailnet 设备。你可以在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面找到你的 tailnet DNS 名称。

### 生成新的 tailnet DNS 名称

你必须具有[所有者（Owner）、管理员（Admin）或网络管理员（Network admin）](/docs/reference/user-roles)身份，才能生成并选择新的 tailnet DNS 名称。

如果你想要一个比生成的十六进制字符串（`tail<ID>.ts.net`）更好记的 tailnet DNS 名称，可以生成并从一组随机名称选项中挑选。这样在使用 [MagicDNS][docs-magicdns] 等功能时，更容易记住或输入你的 tailnet DNS 名称。例如 `cat-crocodile.ts.net`。这些选项是随机生成的，你随时可以把名称改回最初分配的十六进制字符串名称。

> **警告：**
>
> 对 HTTPS 证书使用随机名称后，就无法再重新生成它。不过，你仍可以在随机名称与默认名称之间切换。

要生成新名称：

1. 打开管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。
2. 选择 **Rename tailnet**。
3. 确认你要使用随机名称。
4. 从随机生成的 tailnet 名称中选择一个。如果对给出的名称都不满意，可以选择 **Re-roll options** 生成更多选项。
5. 选择 **Rename tailnet**。

选择随机 tailnet DNS 名称后，它就会成为你当前生效的 tailnet 名称。如果你此前在 [MagicDNS][docs-magicdns]、[HTTPS 证书][docs-enabling-https]或[共享][docs-sharing]中使用的是默认 tailnet DNS 名称，tailnet 中设备的既有链接可能会失效。改回最初分配的 tailnet DNS 名称时同样如此。

### 恢复原 tailnet DNS 名称

要改回默认的 tailnet DNS 名称：

1. 打开管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。
2. 选择 **Rename tailnet**。
3. 确认你要切换 tailnet 名称。
4. 选择你要使用的名称。
5. 选择 **Rename tailnet**。

由于 [MagicDNS][docs-magicdns]、[HTTPS 证书][docs-enabling-https]和[共享][docs-sharing]都依赖 tailnet DNS 名称，切换 tailnet DNS 名称可能导致 tailnet 中设备的既有链接失效。

## 机器名称

[机器名称][docs-machine-names]在 tailnet 内对每台设备唯一。设备加入 tailnet 时，会根据设备的主机名（来自操作系统）生成机器名称，你可以在管理控制台或 Tailscale CLI 中更改设备的机器名称。tailnet 中的机器列表位于管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。

## Tailnet ID

**Tailnet ID** 是分配给 tailnet 的字符串，供 [Tailscale API][docs-api] 使用。它位于管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面。

## 显示名称

创建 tailnet 时，Tailscale 会在身份验证页面、管理控制台页头、客户端 UI 和客户端 CLI 中显示私有域名或公共电子邮件地址，例如 `example.com`、`example@gmail.com` 或 `user.github`。设置自定义显示名称可以让你的 tailnet 有一个易于辨认的名字，便于团队成员分辨自己正在向哪个环境进行身份验证、加入或使用。

> **注意：**
>
> 显示名称始终可以在管理控制台中设置和查看；要在 Tailscale 客户端中查看，需要 1.88 或更高版本。

你必须具有[所有者（Owner）或管理员（Admin）](/docs/reference/user-roles)身份，才能设置或编辑 tailnet 显示名称。

1. 打开管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面。
2. 输入显示名称。只能使用字母、数字、空格、撇号和连字符。
3. 选择 **Save**。

凡是通常显示 tailnet 域名或电子邮件地址的地方，都会改而显示显示名称。显示名称最长 65 个字符，可包含字母、数字、空格、撇号和连字符，不能使用句点或下划线。

## Legacy ID

> **注意：**
>
> 2025 年 10 月，此字段由 **Organization** 更名为 **Legacy ID**，且仅对此前已存在的 tailnet 可见。2025 年 10 月之后创建的 tailnet 不会在管理控制台中显示 **Legacy ID** 字段。

> **注意：**
>
> 如果你此前在 [Tailscale API][docs-api] 中使用的是 **Organization** 字段，请更新设置，改用 **Tailnet ID** 字段。

**Legacy ID** 字段在创建新 tailnet 时自动分配，显示在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面。如果你使用自定义域名，它会显示为域名，例如 `example.com`；如果使用公共/共享域名的邮箱，则显示电子邮件地址，例如 `user@gmail.com`。该名称显示在管理控制台页头、tailnet 登录页以及 Tailscale 客户端中，用于指示你正在使用的 tailnet。一经创建，便无法更改。

[docs-api]: /docs/reference/tailscale-api

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-machine-names]: /docs/concepts/machine-names

[docs-magicdns]: /docs/features/magicdns

[docs-sharing]: /docs/features/sharing

[docs-tailnet]: /docs/concepts/tailnet
