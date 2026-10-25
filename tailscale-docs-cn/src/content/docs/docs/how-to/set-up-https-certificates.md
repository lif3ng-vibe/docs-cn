---
title: "启用 HTTPS"
description: "为 Tailscale 网络中的设备配置 HTTPS。"
---

最后验证于 Dec 10, 2025

Tailscale 节点之间的连接已通过端到端[加密][docs-encryption]保护。但浏览器、Web API 以及 Visual Studio Code 这类产品并不知道这一点，当指向你 tailnet 服务的 HTTP URL 看起来未加密（因为没有使用它们所期望的 TLS 证书）时，它们可能会向用户发出警告或禁用某些功能。

要使用 HTTPS URL 保护网站，你需要一份由公共证书颁发机构（CA）签发的 TLS 证书。

此功能使用你 tailnet 当前的 [tailnet 名称][docs-tailnet-name]。

## 配置 HTTPS

要能够为 tailnet 中的设备预配 TLS 证书，你需要：

1. 打开管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。
2. 如果你的 tailnet 尚未启用 [MagicDNS][docs-magicdns-enabling-magicdns]，请启用它。
3. 在 **HTTPS 证书**（HTTPS Certificates）下，选择 **启用 HTTPS**（Enable HTTPS）。
4. 确认你的机器名称和 tailnet DNS 名称将被发布到公共账本（public ledger）上。
5. 对每台要预配 TLS 证书的机器，在该机器上运行 `tailscale cert` 获取证书。

### 公共账本中的机器名称

网络上的所有 TLS 证书都会记录在[证书透明度][xt-wikipedia-cert-transparency]（Certificate Transparency，CT）只追加公共账本中，任何人都可以访问它来验证公共证书的有效性。值得注意的是，其中包括你设备的完全限定域名。为避免公开你的组织名称（例如公司域名、电子邮件地址或 GitHub 用户名），Tailscale 为你提供了一个 [tailnet 名称][docs-tailnet-name]。每个 tailnet 都有一个形如 **`tail*NNNN*.ts.net`** 或 **`tailnet-*NNNN*.ts.net`** 的 [tailnet DNS 名称][docs-tailnet-name-tailnet-dns-name]，你也可以[生成并选用由 Tailscale 随机生成的 tailnet DNS 名称][docs-tailnet-name-generate-a-new-tailnet-dns-name]，例如 **`yak-bebop.ts.net`**。

TLS 证书基于你的 tailnet 名称签发。目前，我们不允许更改 tailnet 名称（在默认 tailnet DNS 名称与随机生成的 tailnet 名称之间切换除外）。

> **注意：**
>
> 虽然证书域名掩盖了 tailnet 拥有者的身份，但机器名称仍会发布在公共账本中。**如果你的任何机器名称包含敏感信息，请不要启用 HTTPS 功能**。你可以在获取证书前[编辑机器名称][docs-machine-names-renaming-a-machine]。

公共账本只提供 TLS 证书名称相关的信息；对设备的访问仍由 Tailscale 像往常一样加以限制。
此外，只有你在其上运行过 `tailscale cert` 的设备才会把证书放入公共账本。

概括来说，发布到公共账本的域名按如下方式组成：

*（图：monitoring.yak-bebop.ts.net，其中 "monitoring" 是机器名称，"yak-bebop.ts.net" 是 tailnet 名称）*

[MagicDNS][docs-magicdns] 使用机器名称自动为网络中的设备注册 DNS 名称。如果机器名称变化，MagicDNS 条目也会随之变化。你可以[编辑机器名称][docs-machine-names-renaming-a-machine]，把它设为特定名称。

> **注意：**
>
> 你无法获取指向裸主机名的 HTTPS URL，例如 `https://machine-name`。如果你使用 MagicDNS 为某个节点获取 TLS 证书，它将同时可以通过 `https://machine-name.tailNNNN.ts.net`（HTTPS）访问，以及通过 `http://machine-name`（无 HTTPS，但使用 MagicDNS 作为 DNS 名称服务器）访问。

### 为你的设备预配 TLS 证书

使用 [`tailscale cert`][docs-cli-cert]（必要时加 `sudo`），Tailscale 会通过 [Let's Encrypt][xt-letsencrypt] 自动为该机器在该域名上请求证书。
Tailscale 会为你的节点创建 `*.ts.net` DNS TXT 记录，以完成 [DNS-01 质询][xt-letsencrypt-dns-challenge]。
如果你使用 Go，[`tailscale.com/client/local.Client.GetCertificate`][xt-go-tailscale-get-cert] 方法实现了 [`tls.Config.GetCertificate`][xt-go-tls-cert] 回调，可以[全自动完成这一切][xt-gh-tailscale-servetls]。
证书的私钥和你的 Let's Encrypt（ACME）账户私钥都会在你的机器上本地生成并存储，Tailscale 永远不会看到它们。

> **警告：**
>
> 频繁请求新证书可能超出 Let's Encrypt 的速率限制。结果可能是你需要等待 34 个小时才能重试。更多信息参阅 Let's Encrypt 的[速率限制文档][xt-letsencrypt-rate-limits]。

Let's Encrypt 签发的证书有效期为 90 天，需要定期续期。当证书以磁盘文件的形式交付、再由你移动到安装位置时（例如使用 `tailscale cert` 时），[`tailscaled` 守护进程][docs-tailscaled]既不知道把续期后的证书放在哪里，也不知道如何安装。因此，凡是用 `tailscale cert` 创建的证书，续期由你自行负责。

如果证书的处理过程不涉及用户发起的基于文件的证书安装，例如使用 [Tailscale 的 Caddy 集成][xt-gh-tailscale-caddy-tailscale]时，证书将自动续期，用户无需做任何事。

### 使用其他 TLS 证书

除 Let's Encrypt 外，[Caddy][xt-caddyserve] 也提供为 tailnet 机器使用证书的途径。详细信息参阅 [Tailscale 上的 Caddy 证书][docs-caddy-certificates]。

如果你要手动安装来自其他证书提供商的证书，请查阅其文档了解如何配置机器以及如何续期证书。

## 禁用 HTTPS

你可以为 tailnet 禁用 HTTPS，但这会破坏所有依赖 HTTPS 的链接和连接。

要为 tailnet 禁用 HTTPS：

1. 打开管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。
2. 在 **HTTPS 证书**（HTTPS Certificates）下，选择 **禁用 HTTPS**（Disable HTTPS）。

禁用 HTTPS 后，你机器的证书不会被撤销。这样，需要时你可以为 tailnet 重新启用该功能。你也无法单独使某一台机器的证书失效。

如果你想重新启用 HTTPS，它将使用你 tailnet 当前的 [tailnet DNS 名称][docs-tailnet-name-tailnet-dns-name]启用。

## 检查证书状态

在 Tailscale 管理控制台中，你可以查看网络中任何机器的 TLS 证书状态，前提是该机器：

* 对你的 tailnet 处于在线状态
* 运行 Tailscale v1.56 或更高版本

要检查证书状态：

1. 打开管理控制台的 [机器](https://console.tailscale.com/admin/machines) 页面。
2. 找到要检查证书状态的机器。可以使用[搜索栏][docs-filter-devices-search-bar]或[筛选器][docs-filter-devices]查找机器。
3. 选择该机器。
4. 在机器页面的 **TLS 证书**（TLS certificate）部分查看证书状态。

> **注意：**
>
> 如果机器离线，Tailscale 将无法报告其证书状态。

机器的证书可以报告以下状态：

* 有效（Valid）
* 无效（Invalid）
* 证书已过期（Certificate expired）
* 未找到证书（No certificate found）
* 升级客户端以检查状态（Upgrade client to check status）

[docs-caddy-certificates]: /docs/integrations/web-servers/caddy/caddy-certificates

[docs-cli-cert]: /docs/reference/tailscale-cli#cert

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-filter-devices-search-bar]: /docs/features/access-control/device-management/how-to/filter#filter-with-the-search-bar

[docs-filter-devices]: /docs/features/access-control/device-management/how-to/filter

[docs-machine-names-renaming-a-machine]: /docs/concepts/machine-names#renaming-a-machine

[docs-magicdns-enabling-magicdns]: /docs/features/magicdns#enabling-magicdns

[docs-magicdns]: /docs/features/magicdns

[docs-tailnet-name-tailnet-dns-name]: /docs/concepts/tailnet-name#tailnet-dns-name

[docs-tailnet-name-generate-a-new-tailnet-dns-name]: /docs/concepts/tailnet-name#generate-a-new-tailnet-dns-name

[docs-tailnet-name]: /docs/concepts/tailnet-name

[docs-tailscaled]: /docs/reference/tailscaled

[xt-caddyserve]: https://caddyserver.com

[xt-gh-tailscale-caddy-tailscale]: https://github.com/tailscale/caddy-tailscale

[xt-gh-tailscale-servetls]: https://github.com/tailscale/tailscale/blob/main/client/tailscale/example/servetls/servetls.go

[xt-go-tailscale-get-cert]: https://pkg.go.dev/tailscale.com/client/local#Client.GetCertificate

[xt-go-tls-cert]: https://pkg.go.dev/crypto/tls#Config.GetCertificate

[xt-letsencrypt-dns-challenge]: https://letsencrypt.org/docs/challenge-types/#dns-01-challenge

[xt-letsencrypt-rate-limits]: https://letsencrypt.org/docs/rate-limits/

[xt-letsencrypt]: https://letsencrypt.org

[xt-wikipedia-cert-transparency]: https://en.wikipedia.org/wiki/Certificate_Transparency
