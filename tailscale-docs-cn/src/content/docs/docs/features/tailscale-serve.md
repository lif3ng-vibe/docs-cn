---
title: "Tailscale Serve"
description: "探索 Tailscale Serve 服务。"
---

最后验证于 Jan 20, 2026

> **注意：**
>
> [Tailscale Funnel][docs-tailscale-funnel] 和 [Tailscale Serve][docs-tailscale-serve] 的 CLI 命令在 1.52 版本的 Tailscale 客户端中发生了变化。如果你在之前的版本中使用过 Funnel 或 Serve，建议查阅 CLI 文档。

Tailscale Serve 让你可以将来自 Tailscale 网络（即 tailnet）中其他设备的流量路由到你设备上运行的本地服务。你可以把它理解为将某个服务（例如一个网站）共享给 tailnet 中的其他成员。本页介绍 Serve 的工作方式，以及如何在你的 tailnet 中开始使用它。更多具体用例请参阅 [Tailscale Serve 示例][docs-serve-examples]。

> **提示：**
>
> 如果你想通过互联网公开共享本地服务，请改用 [Tailscale Funnel][docs-funnel]。

> **注意：**
>
> 以下相关视频提供了更多背景信息和示例。

[Serve and Funnel | Tailscale Explained (video)](https://www.youtube.com/watch?v=MpxmfpCl20c)

## 开始使用 Serve

> **警告：**
>
> Tailscale Serve 要求你在 tailnet 中启用 HTTPS 证书。
>
> 此外，请注意[访问控制规则][docs-access-control]对 Serve 的适用方式与其他服务相同。如果你有限制某些设备或用户访问的访问控制规则，这些规则同样会作用于你通过 Serve 共享的服务。

如果你的 tailnet 尚未启用 HTTPS，Tailscale CLI 命令 [`tailscale serve`][docs-cli] 会提供一个交互式网页界面，提示你允许 Tailscale 代你启用 HTTPS。

`serve` 命令会按需提示你，并引导你前往一个网页许可页面，以启用尚未满足的要求。

*（图："Start using serve" 网页许可页面）*

**Tailscale Funnel** 默认处于启用状态。如果你不打算在该设备上使用 [Tailscale Funnel][docs-funnel]，可以将其关闭。

## 运行 Tailscale Serve

如果你运行 [`tailscale serve`][docs-cli] 命令而你的 tailnet 尚未正确配置为使用 Tailscale Serve，命令会给出一个登录服务器 URL，你可以按照它来启用该功能。

Tailscale Serve 让你可以向 tailnet 中的其他设备提供本地目录、文件、纯文本或本地端口。例如，你可以使用以下命令将请求代理到运行在 `http://127.0.0.1:3000` 的 Web 服务器：

```shell
tailscale serve 3000
```

运行 `tailscale serve --help` 查看更多示例。

CLI 会打开一个前台会话，显示正在提供的服务状态以及用于访问服务器的 URL：

```shell
tailscale serve 3000
Available within your tailnet:
https://amelie-workstation.pango-lin.ts.net

|-- / proxy http://127.0.0.1:3000

Press Ctrl+C to exit.
```

## 身份标头

> **注意：**
>
> 通过 Tailscale Serve 提供 tailnet 流量时，流量中会包含身份标头。而公开可用的 Funnel 流量则不包含身份标头。

当你使用 Serve 将流量代理到你设备上运行的本地服务时，它会在发送到后端的请求中添加几个 [Tailscale 身份][docs-tailscale-identity]标头。目标服务器可以使用这些标头识别与请求关联的 Tailscale 用户。如果 Serve 在传入请求中发现以下标头，会出于安全考虑将其移除，以避免标头伪造。

* `Tailscale-User-Login`：填入请求者的登录名（例如 `alice@example.com`）。
* `Tailscale-User-Name`：填入请求者的显示名称（例如 `Alice Architect`）。
* `Tailscale-User-Profile-Pic`：如果请求者的身份提供方提供了头像，则填入其头像 URL（例如 `https://example.com/photo.jpg`）。

如果值中包含非 ASCII 字符，Tailscale 可能会使用 [RFC2047][xt-rfc-2047] "Q" 编码（例如 `=?utf-8?q?Ferris_B=C3=BCller?=`）。

> **注意：**
>
> 对于来自[带标签设备][docs-tags]的流量，不会填充这些身份标头。

你可以将身份标头与自定义后端或提供认证代理身份验证的第三方服务配合使用，例如 [Grafana][xt-grafana-config-auth-proxy]。

虽然身份标头只为 tailnet 流量填充，但这也包括已接受你设备共享的外部用户产生的流量。例如，如果你与朋友共享了一台设备并为其配置了 Serve 代理，那么当你的朋友访问该 Serve URL 时，Tailscale 也会填充身份标头。

> **提示：**
>
> 当你使用身份标头向后端服务进行身份验证时，最佳实践是让该服务只监听 localhost。否则，任何能够直接调用你的服务（而不是通过 Serve URL）的用户都可以轻而易举地伪造这些 HTTP 标头的值。只监听 localhost 可以将篡改范围限制在 Serve 设备上运行的其他服务，而不是局域网或 tailnet 中的任何人。

## 应用能力标头

> **注意：**
>
> 可以配置 Serve 流量，使其转发一个标头，其中包含连接用户或带标签设备的选定应用能力。与身份标头类似，此功能不适用于公开可用的 Funnel 流量。
>
> 此功能在 Tailscale v1.92 或更高版本中可用。

当你使用 Serve 将流量代理到你设备上运行的本地服务时，可以使用 `--accept-app-caps` 命令行标志指定 Serve 应转发用户或带标签节点的哪些[应用能力][docs-app-capabilities]。
如果发起请求的用户或带标签节点已被授予所指定的任何应用能力，Serve 会将它们转换为序列化的 JSON，并通过名为 `Tailscale-App-Capabilities` 的标头转发。
有关实际效果的示例，请参阅 [Tailscale Serve 示例][docs-serve-examples-app-caps]。

对于包含非 ASCII 字符的值，Tailscale 使用 [RFC2047][xt-rfc-2047] "Q" 编码（例如 `=?utf-8?q?{"example.com/cap/monitoring":[{"role":"=F0=9F=90=BF=EF=B8=8F"}]}?=`）。

如果 Serve 在传入请求中发现 `Tailscale-App-Capabilities` 标头，会像对待任何 Tailscale 身份标头一样，出于安全考虑将其移除，以避免标头伪造。

> **提示：**
>
> 当你使用能力标头在后端服务中为用户或带标签节点授权时，最佳实践是让该服务只监听 localhost。否则，任何能够直接调用你的服务（而不是通过 Serve URL）的用户都可以轻而易举地伪造这些 HTTP 标头的值。只监听 localhost 可以将篡改范围限制在 Serve 机器上运行的其他服务，而不是局域网或 tailnet 中的任何人。

## 资源

* 浏览 [Serve 用例示例集][docs-serve-examples]，获取灵感和思路。
* [使用 PROXY 协议][docs-tailscale-serve-proxy-protocol]。
* [使用 TCP 转发器][docs-tailscale-serve-tcp-forwarder]。
* [重置 Serve 配置][docs-tailscale-serve-reset-serve]。
* [禁用 Serve][docs-tailscale-serve-disable-serve]。

## 局限性

* DNS 名称仅限于你 tailnet 的域名（`device-name.tailnet-name.ts.net`）。
* 由于 macOS 应用沙箱的限制，共享文件和目录仅限于 [macOS 版 Tailscale 客户端的开源变体][docs-macos-variants]。
* 同一个端口号不能同时用于 Serve（仅在 tailnet 内可用）和 Funnel（在 tailnet 内和公共互联网均可用）。
  * 如果最近一次配置该端口的命令是 `serve`，则该端口将完全私有。
  * 如果最近一次配置该端口的命令是 `funnel`，则该端口将完全公开。

## 排查问题

Tailscale Serve 要求你在 tailnet 中[启用 HTTPS][docs-enabling-https]，以便为你唯一的 [tailnet DNS 名称][docs-tailnet-name]自动预配 TLS 证书。如果按照[开始使用 Serve][ar-get-started-with-serve] 一节所述使用交互式 CLI 流程，当 HTTPS 尚未启用时，Tailscale 会自动启用它。

[ar-get-started-with-serve]: #开始使用-serve

[docs-access-control]: /docs/features/access-control

[docs-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-cli]: /docs/reference/tailscale-cli

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-funnel]: /docs/features/tailscale-funnel

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-serve-examples]: /docs/reference/examples/serve

[docs-serve-examples-app-caps]: /docs/reference/examples/serve#forward-app-capabilities-to-a-local-service

[docs-tags]: /docs/features/tags

[docs-tailnet-name]: /docs/concepts/tailnet-name

[docs-tailscale-funnel]: /docs/reference/tailscale-cli/funnel

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-tailscale-serve-disable-serve]: /docs/reference/tailscale-cli/serve#disable-tailscale-serve

[docs-tailscale-serve-proxy-protocol]: /docs/reference/tailscale-cli/serve#use-the-proxy-protocol

[docs-tailscale-serve-reset-serve]: /docs/reference/tailscale-cli/serve#reset-tailscale-serve

[docs-tailscale-serve-tcp-forwarder]: /docs/reference/tailscale-cli/serve#use-a-tcp-forwarder

[docs-tailscale-serve]: /docs/reference/tailscale-cli/serve

[xt-grafana-config-auth-proxy]: https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/auth-proxy/#configure-auth-proxy-authentication

[xt-rfc-2047]: https://www.rfc-editor.org/rfc/rfc2047.html
