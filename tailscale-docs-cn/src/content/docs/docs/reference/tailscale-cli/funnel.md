---
title: "tailscale funnel 命令"
description: "`tailscale funnel` 让你把本地服务分享到互联网。你也可以选择使用 [Tailscale Serve][docs-serve]（通过 [`tailscale serve`][docs-tailscale-serve] 命令）把分享范围限制在 tailnet 内。"
---

最后验证于 Jan 26, 2026

> **注意：**
>
> 在 1.52 版本的 Tailscale 客户端中，Tailscale Funnel 和 Tailscale Serve 的 CLI 命令都发生了变化。如果你在之前的版本中使用过 Funnel 或 Serve，我们建议你查阅 CLI 文档。

`tailscale funnel` 让你把本地服务分享到互联网。你也可以选择使用 [Tailscale Serve][docs-serve]（通过 [`tailscale serve`][docs-tailscale-serve] 命令）把分享范围限制在 tailnet 内。

```shell
tailscale funnel [flags] <target>
```

子命令：

* [`status`][ar-get-the-status] 获取状态
* [`reset`][ar-reset-tailscale-funnel] 重置配置

要了解各种使用场景和示例，请参阅 [Tailscale Funnel 示例][docs-funnel-examples]。

## Funnel 命令标志

可用标志：

* `--bg` 决定命令是否作为后台进程运行。
* `--https=<port>` 在指定端口上暴露一个 HTTPS 服务器（默认）。
* `--proxy-protocol=<version>` TCP 转发使用的 PROXY protocol 版本（1 或 2）。
* `--set-path=<path>` 把指定路径附加到访问底层服务的基础 URL 之后。
* `--tcp=<port>` 暴露一个 TCP 转发器，在指定端口转发 TCP 数据包。
* `--tls-terminated-tcp=<port>` 暴露一个 TCP 转发器，在指定端口转发已终结 TLS 的 TCP 数据包。
* `--yes` 更新时不进行交互式提示。

`tailscale funnel` 命令接受一个 target（目标），可以是一个文件、目录、文本，或最常见的情况——本地机器上运行的服务的位置。本地服务的位置可以表示为端口号（例如 `3000`）、部分 URL（例如 `localhost:3000`）或包含路径的完整 URL（例如 `tls-terminated-tcp://localhost:3000/foo`）。

## 使用 HTTPS 和 HTTP 服务器

```shell
tailscale funnel --https=<port> <target> [off]
```

`funnel` 提供一个 HTTPS 服务器，有几种模式：反向代理、文件服务器和静态文本服务器。HTTPS 流量使用自动配置的 TLS 证书来保护。默认情况下，TLS 终结由你节点的 Tailscale 守护进程自己完成。

* `--https=<port>` 指定监听端口。对于 Funnel，必须使用允许的端口之一：`443`、`8443` 或 `10000`。

* `--set-path` 是以斜杠分隔的 URL 路径。根级挂载点是 `/`，例如向 `https://my-node.example.ts.net/` 发起请求即可匹配。关于这些路径模式的匹配方式，请参阅 Go 的 [ServeMux][xt-go-servemux] 文档。我们的挂载点行为与之类似。

* `<target>` Funnel 提供 4 种内容提供方式：HTTP 反向代理、文件、目录和静态文本。反向代理让你把请求转发到本地 HTTP web 服务器。提供本地文件路径可以提供单个文件或文件目录的服务。提供静态文本主要用于调试，会返回一个静态响应。

  * **反向代理**

    要作为本地后端的反向代理，请在 `<target>` 参数中提供位置。本地服务的位置可以表示为端口号（例如 `3000`）、部分 URL（例如 `localhost:3000`）或包含路径的完整 URL（例如 `tls-terminated-tcp://localhost:3000/foo`）。注意，代理目前只支持 `http://127.0.0.1`。

    示例：`tailscale funnel localhost:3000`

  * **文件服务器**

    提供你想提供服务的文件或文件目录的完整绝对路径。如果指定的是目录，将渲染一个目录列表，其中包含指向文件和子目录的链接。

    示例：`tailscale funnel /home/alice/blog/index.html`

    由于 macOS 应用沙盒的限制，此选项仅在使用 Tailscale 的[开源变体][docs-macos-variants]时可用。如果你通过 Mac App Store 或 Standalone 变体系统扩展在 macOS 上安装了 Tailscale，可以使用 Funnel 共享端口，但不能共享文件或目录。

  * **静态文本服务器**

    把 `text:<value>` 指定为 `<target>` 即可配置一个静态纯文本服务器。

    示例：`tailscale funnel text:"Hello, world!"`

## 使用 PROXY protocol

```shell
tailscale funnel --proxy-protocol=<version> <target>
```

> **注意：**
>
> 在大多数情况下，用户很可能会使用版本 `2`。

[PROXY protocol][xt-haproxy-proxy-protocol] 是一个极简的网络协议，它可以在经过代理或负载均衡器时保留被代理连接的信息（通常是源 IP 地址），并传递给后端目标。这让你用 Funnel 暴露的服务能够确定连接客户端的原始 IP 地址和端口。

例如：

```shell
tailscale funnel --proxy-protocol=2 --tls-terminated-tcp=443 tcp://127.0.0.1:9899
```

此命令会返回类似如下的信息：

```shell
Available on the internet:

|-- tcp://funnel-test.example.ts.net:443 (TLS terminated, PROXY protocol v2)
|-- tcp://100.101.102.103:443
|-- tcp://[fd7a:115c:a1e0::1111:2222]:443
|--> tcp://127.0.0.1:9899

Press Ctrl+C to exit.
```

后端（运行在 `localhost:9899`）随后通过 PROXY protocol 获得原始源 IP 和端口。

## 使用 TCP 转发器

```shell
tailscale funnel --tcp=<port> tcp://localhost:<local-port> [off]
tailscale funnel --tls-terminated-tcp=<port> tcp://localhost:<local-port> [off]
```

`funnel` 命令提供 TCP 转发器，可以把已终结 TLS 的 TCP 数据包转发到本地 TCP 服务器（如 Caddy），或其他基于 TCP 的协议（如 SSH 或 RDP）。默认情况下，TCP 转发器转发原始数据包。

* `--tcp=<port>` 设置一个监听指定端口的原始 TCP 转发器。对于 Funnel，必须使用允许的端口之一：`443`、`8443` 或 `10000`。

* `--tls-terminated-tcp=<port>` 设置一个监听指定端口的 TLS 终结型 TCP 转发器。对于 Funnel，必须使用允许的端口之一：`443`、`8443` 或 `10000`。

## 使用有效证书

```shell
tailscale funnel <https:target>
```

如果你有有效证书，请在 `<target>` 参数中使用 `https`。

示例：`tailscale funnel https://localhost:8443`

## 忽略无效和自签名证书检查

```shell
tailscale funnel <https+insecure:target>
```

如果你运行的本地 web 服务器使用 HTTPS 且证书是自签名或其他无效证书，可以在 `tailscale funnel` 命令中把 `https+insecure` 指定为一种特殊的伪协议。

示例：`tailscale funnel https+insecure://localhost:8443`

## 获取状态

```shell
tailscale funnel status [--json]
```

要获取服务器的状态，可以使用 `status` 子命令。它会列出当前在你的节点上运行的所有服务器。

* `--json` 如果你想以 JSON 格式获取状态，可以提供 `--json` 参数。

示例：`tailscale funnel status --json`

## 重置 Tailscale Funnel

```shell
tailscale funnel reset
```

要清除当前的 `tailscale funnel` 配置，请使用 `reset` 子命令。

## 关闭 Tailscale Funnel

* `[off]` 要关闭某条 `tailscale funnel` 命令，可以在你当初开启它的命令末尾加上 `off`。这会把该服务器从活跃服务器列表中移除。在 `off` 命令中，`<target>` 参数是可选的，但所有原有标志都必须保留。

如果这条命令开启了一个服务器：

```shell
tailscale funnel --https=443 /home/alice/blog/index.html
```

你可以这样关闭它：

```shell
tailscale funnel --https=443 /home/alice/blog/index.html off
```

你可以省略 `<target>` 参数，因此以下两条命令等价：

```shell
tailscale funnel --https=443 --set-path=/foo /home/alice/blog/index.html off
tailscale funnel --https=443 --set-path=/foo off
```

## 重启与重新启动的影响

如果你使用 [`-bg`][ar-funnel-command-flags] 标志运行 `tailscale funnel` 命令，它会持续在后台运行，直到你[关闭它][ar-turn-funnel-off]。当你重启设备，或在命令行中使用 [`tailscale down`][docs-cli-down]和[`tailscale up`][docs-cli-up]重启 Tailscale 时，Funnel 会自动恢复分享。

如果你使用不带 `-bg` 标志的 `tailscale funnel` 命令，之后又重启设备或从命令行重启了 Tailscale，则必须手动重启 Funnel 才能恢复分享。

[ar-funnel-command-flags]: #funnel-命令标志

[ar-get-the-status]: #获取状态

[ar-reset-tailscale-funnel]: #重置-tailscale-funnel

[ar-turn-funnel-off]: #关闭-tailscale-funnel

[docs-cli-down]: /docs/reference/tailscale-cli#down

[docs-cli-up]: /docs/reference/tailscale-cli#up

[docs-funnel-examples]: /docs/reference/examples/funnel

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-serve]: /docs/features/tailscale-serve

[docs-tailscale-serve]: /docs/reference/tailscale-cli/serve

[xt-go-servemux]: https://pkg.go.dev/net/http#ServeMux

[xt-haproxy-proxy-protocol]: https://www.haproxy.com/blog/use-the-proxy-protocol-to-preserve-a-clients-ip-address
