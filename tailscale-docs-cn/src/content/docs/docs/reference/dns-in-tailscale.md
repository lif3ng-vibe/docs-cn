---
title: "Tailscale 中的 DNS"
description: "针对 DNS 管理（包括自定义 DNS 服务器）优化你的 Tailscale 网络，实现无缝访问与更好的控制。"
---

最后验证于 Dec 22, 2025

> **注意：** [所有套餐](https://tailscale.com/pricing)均可管理 DNS。

Tailscale 为你的 Tailscale 网络（即 tailnet）中的每台设备提供一个[唯一的 IP 地址][docs-ip-and-dns-addresses]，无论设备在哪里，这个地址都保持不变。不过，IP 地址不好记，用起来也不方便。你可以使用 DNS 把 [Tailscale IP 地址][docs-tailscale-ip-addresses]映射为易读的名称。

## 在 Tailscale 中管理 DNS

> **注意：**
>
> 客户端必须配置为[使用 Tailscale DNS 设置][docs-client-preferences-use-tailscale-dns-settings]，本页的设置才能生效。

你可以使用 [MagicDNS][ar-magicdns]、[tailnet DNS 设置][ar-tailscale-dns-settings]或[公共 DNS 记录][ar-use-public-dns-records]来管理 tailnet 的 DNS。你也可以使用 [`tailscale dns`][docs-cli-dns] 命令。

### MagicDNS

你可以利用 Tailscale 默认启用的 **MagicDNS** 功能，为 tailnet 中的设备自动分配 DNS 名称。

MagicDNS 设置决定你的 tailnet 是否使用 [MagicDNS][docs-magicdns] 为 tailnet 中的设备自动分配 DNS 名称。MagicDNS 是可选的，使用其他 DNS 设置并不需要它。

> **警告：**
>
> 无法向 MagicDNS 添加任意记录。如需了解进展，请订阅或在[这个 GitHub issue][xt-gh-tailscale-issue-1543] 下评论。

[进一步了解 MagicDNS →][docs-magicdns]

### Tailscale DNS 设置

你可以在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面管理 tailnet 的 DNS 设置，其中包括 [MagicDNS][ar-magicdns]、域名服务器（nameserver）和搜索域名的设置。

*（图：管理控制台的 DNS 页面，含 MagicDNS 和域名服务器部分。）*

#### 域名服务器

域名服务器是你希望设备在连接到 tailnet 时使用的 DNS 服务器的 IPv4 或 IPv6 地址。你可以使用公共域名服务器，也可以使用包含你私有网络中设备映射的私有域名服务器。

域名服务器分为两类：[受限域名服务器][ar-the-order-of-dns-resolvers]和[全局域名服务器][ar-global-nameservers]。

##### 受限域名服务器

受限域名服务器只对匹配特定搜索域名的 DNS 查询生效。使用受限域名服务器也称为分割 DNS（split DNS）。

分割 DNS 场景的一个例子是：你把 `1.1.1.1` 配置为域名 `example.com` 的域名服务器。这会告诉 tailnet 中的设备，只有匹配 `*.example.com` 的 DNS 查询（例如 `foo.example.com` 和 `bar.example.com`）才使用 `1.1.1.1` 这台域名服务器来解析。

##### 全局域名服务器

全局域名服务器处理任意域名的 DNS 查询。你可以使用公共 DNS 域名服务器，也可以运行自己的服务器并加入额外的 DNS 映射。

当你使用 Cloudflare 或 Google 等公共全局域名服务器时，Tailscale 会自动使用 DNS-over-HTTPS（DoH），确保你的 DNS 查询在穿越互联网之前已被加密。

一些[公共全局 DNS 域名服务器][xt-wikipedia-public-recursive-name-server]包括：

* [Quad9][xt-quad9-access-using-ssh]：`9.9.9.9`、`149.112.112.112`、`2620:fe::fe` 和 `2620:fe::9`。
* [Google][xt-google-public-dns]：`8.8.8.8`、`8.8.4.4`、`2001:4860:4860::8888` 和 `2001:4860:4860::8844`。
* [Cloudflare][xt-cloudflare-what-is-1.1.1.1]：`1.1.1.1`、`1.0.0.1`、`2606:4700:4700::1111` 和 `2606:4700:4700::1001`。

你也可以把个性化的 DNS 域名服务器（如 [NextDNS][docs-nextdns] 或 [Control D][docs-control-d]）设为你的全局域名服务器。当你通过管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面添加域名服务器时，可以选择这些域名服务器。

Tailscale 把每个全局 DNS 域名服务器的地址列表视为一个整体。例如，如果你添加了 Google 的其中一台域名服务器，Tailscale 会自动纳入 Google 的所有域名服务器地址。无论你是手动添加地址，还是通过管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面添加，都是如此。

*（图：管理控制台的 DNS 页面中的域名服务器部分。"Add nameservers" 下拉框列出公共全局 DNS 选项。）*

最佳实践是使用不止一台全局域名服务器（可以来自同一提供商）以确保冗余。但请注意，如果各域名服务器上的内容限制不一致，使用多台全局域名服务器可能会绕过显式的内容限制。

默认情况下，tailnet 中的设备对所有查询都使用其本地 DNS 设置。要强制客户端始终使用你定义的域名服务器，可以启用 **Override DNS servers** 开关。

> **注意：**
>
> 除非你的域名服务器是公共的，或使用 [Tailscale IP 地址][docs-ip-and-dns-addresses]，否则你可能需要配置[子网路由][docs-subnets]，让设备能够访问这些私有 DNS 服务器。

##### 域名服务器与出口节点

默认情况下，当你把一台设备配置为使用出口节点时，无论全局和受限（分割 DNS）域名服务器如何配置，该设备都会把出口节点用作所有域名的 DNS 解析器。

你可以在管理控制台中按域名服务器覆盖这一行为，把域名服务器配置为在设备使用出口节点时也参与解析。

要让某台域名服务器参与使用出口节点的设备的 DNS 解析：

1. 前往管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。
2. 找到 **Nameservers** 部分，选择要启用的域名服务器旁边的三个点。这会打开 **Edit nameserver** 选项。
3. 启用 **Use with exit node** 设置。
4. 选择 **Save**。

你也可以在通过 **Add nameserver** 对话框添加域名服务器时启用该设置。

#### 搜索域名

> **警告：**
>
> 只有运行 Tailscale v1.34 或更高版本的设备才能使用搜索域名。

搜索域名让用户无需在每次连接资源时都指定完整的域名路径，即可便捷地访问本地网络资源。用户可以指定一列域名后缀，自动附加到任何不是完全限定域名（FQDN）的域名之后。

例如，如果某个 tailnet 将 `example.com` 和 `test.com` 配置为搜索域名，而用户输入 `server`，Tailscale 会用这个词在 tailnet 配置的域名服务器（如 `8.8.8.8` 或 `1.1.1.1`）上查询 `server.example.com`。如果没有返回匹配结果，再在 tailnet 配置的域名服务器上查询 `server.test.com`。

*（图：管理控制台的 DNS 页面中的 Search Domains 部分，列出若干示例域名。）*

* 启用 [MagicDNS][ar-magicdns] 时，它始终是 **Search Domains** 列表中的第一个域名。这一项用户不可配置。
* 你可以添加、重新排序、修改和移除你的搜索域名。

### 公共 DNS 记录

如果你不想通过管理控制台管理 DNS 设置，可以在你的对外 DNS 服务器（如果有的话）上发布记录。这些 DNS 名称可以被互联网上的任何人查询（解析为私有 IP 地址），但由于 [Tailscale IP 地址][docs-tailscale-ip-addresses]只有你网络中的用户才能访问，这样做基本无害。

几乎每个组织都已经有用于收发邮件和发布网站的公共 DNS 服务器，因此这比搭建内部私有 DNS 服务器更简单。

Tailscale 不提供 DNS 服务器，因此你需要使用自己运行的服务器，或云服务商、域名托管商、DNS 提供商提供的服务器。

> **注意：**
>
> 公共 DNS 名称添加后可能需要一段时间才能传播完成。

## 测试 DNS 配置

传统上，网络管理员使用 `nslookup` 等工具查看各域名的 DNS 响应。但在某些平台上，`nslookup` 不使用操作系统提供的 DNS 信息，会返回不正确的结果。在使用依赖高级 DNS 特性的分割 DNS 或 MagicDNS 时，你很可能注意到这个问题。

要在不同平台上测试 DNS 设置，Tailscale 推荐以下方法：

#### macOS

使用原生的 `dscacheutil` 命令：

```shell
dscacheutil -q host -a name <domain-or-magic-dns-hostname>
```

例如，查询某个 MagicDNS 主机名的 IP 地址：

```shell
dscacheutil -q host -a name my-server
```

该命令会返回类似以下的信息：

```shell
name: my-server.example.ts.net
ip_address: 100.15.193.72
```

#### Windows

使用 Windows PowerShell 的 `Resolve-DnsName` 命令：

```powershell
Resolve-DnsName -Name <domain-or-magic-dns-hostname>
```

> **警告：**
>
> 在 Windows 上，请避免使用 `nslookup` 测试分割 DNS 或 MagicDNS。`nslookup` 命令直接查询单个 DNS 服务器，不会遵循名称解析策略表（NRPT）规则，也不遵循 Tailscale 用于分割 DNS 的其他 DNS 策略。这可能导致 `nslookup` 显示错误结果，而你的实际应用（浏览器、curl、ping）却能正确解析 DNS。
>
> PowerShell 的 `Resolve-DnsName` cmdlet 能正确遵循 NRPT 规则，为分割 DNS 测试提供准确结果。

例如，查询某个 MagicDNS 主机名会返回：

```powershell
PS C:\> Resolve-DnsName -Name my-server

Name                       Type   TTL   Section   IPAddress
----                       ----   ---   -------   ---------
my-server.example.ts.net   AAAA   600   Answer    fd7a:115c:a1e0:ab12:4843:cd96:6251:c348
my-server.example.ts.net   A      600   Answer    100.15.193.72
```

#### Linux

Linux 通过监听在 `127.0.0.x` 上的 DNS 服务器实现其 DNS 支持，因此尽管 `nslookup` 的做法简单直接，仍能返回正确结果。在 Linux 上可以用 `nslookup` 调试 DNS 响应。

## 覆盖 DNS 服务器

默认情况下，tailnet 中的设备优先使用本地 DNS 设置，只在需要时才使用 tailnet 的 DNS 服务器。不过，你可能希望阻止 tailnet 中的设备使用其本地 DNS 设置。例如，你可能想要：

* 确保设备能够访问私有 DNS 记录。
* 防止设备使用不受信任的域名服务器。
* 要求所有流量都经过一台能过滤流量的特定 DNS 服务器。

Tailscale 允许你强制 tailnet 中的任何设备使用 tailnet DNS 设置而不是其本地 DNS 设置。要强制 tailnet 设备使用 tailnet 定义的 DNS 设置，请启用 **Override DNS servers**。启用后，连接到你 tailnet 的设备会忽略其本地 DNS 设置，始终使用为 tailnet 定义的全局域名服务器。

要覆盖 DNS 服务器设置：

1. 前往管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。
2. 在 **Global nameservers** 下，启用 **Override DNS servers**。

> **注意：**
>
> 在强制设备使用 tailnet DNS 设置之前，请确保 tailnet 中的所有设备都能访问你的全局域名服务器。如果 [ACL][docs-acls] 或[授权（grant）][docs-grants]阻止设备访问 tailnet 的全局域名服务器，该设备将无法解析 DNS 查询。

## DNS 解析器的顺序

你可能以为，只要按顺序给操作系统一列 DNS 域名服务器，操作系统就会依次尝试这些域名服务器来查找给定域名。

然而，随着越来越多的系统和软件应用需要联网才能工作，DNS 查询中哪怕很小的延迟或偶发的卡顿都会导致用户体验下降。为此，许多现代操作系统制定了更复杂的规则，来优化存在多台 DNS 域名服务器时的响应时间。

例如，操作系统可能会：

* 按顺序查询域名服务器，每次尝试之间稍有延迟。
* 并行查询所有域名服务器。
* 根据过往表现调整域名服务器的顺序。
* 根据已知的地理邻近度调整域名服务器的顺序。
* 在域名服务器之间对查询做负载均衡。

由于每个操作系统处理解析器顺序的方式都略有不同，Tailscale 无法保证你添加到管理控制台 [DNS](https://console.tailscale.com/admin/dns) 页面的 DNS 解析器会严格按照你指定的顺序被查询。视你的 DNS 设置和操作系统而定，Tailscale 要么代理所有 DNS 请求（此时 Tailscale 并行查询所有域名服务器并采用最快的响应），要么交由操作系统处理。

如果你需要域名服务器保持特定顺序，因为你期望其中某台（例如你自己运行的私有 DNS 服务）给出与其他服务器不同的响应，那么更好的选择通常是使用[分割 DNS 功能][ar-split-dns]，或在你的私有 DNS 服务上设置条件转发，并只在设置中使用那台解析器。

[ar-global-nameservers]: #全局域名服务器

[ar-magicdns]: #magicdns

[ar-split-dns]: #受限域名服务器

[ar-tailscale-dns-settings]: #tailscale-dns-设置

[ar-the-order-of-dns-resolvers]: #dns-解析器的顺序

[ar-use-public-dns-records]: #公共-dns-记录

[docs-acls]: /docs/features/access-control/acls

[docs-cli-dns]: /docs/reference/tailscale-cli#dns

[docs-client-preferences-use-tailscale-dns-settings]: /docs/features/client/manage-preferences#使用-tailscale-dns-设置

[docs-control-d]: /docs/integrations/control-d

[docs-grants]: /docs/features/access-control/grants

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-magicdns]: /docs/features/magicdns

[docs-nextdns]: /docs/integrations/nextdns

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[xt-cloudflare-what-is-1.1.1.1]: https://www.cloudflare.com/learning/dns/what-is-1.1.1.1

[xt-gh-tailscale-issue-1543]: https://github.com/tailscale/tailscale/issues/1543

[xt-google-public-dns]: https://developers.google.com/speed/public-dns/docs/using

[xt-quad9-access-using-ssh]: https://www.quad9.net/service/service-addresses-and-features

[xt-wikipedia-public-recursive-name-server]: https://en.wikipedia.org/wiki/Public_recursive_name_server
