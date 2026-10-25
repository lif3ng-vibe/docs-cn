---
title: "tailscale serve 命令"
description: "`tailscale serve` 让你在 Tailscale 网络（即 tailnet）内安全地分享本地服务。"
---

最后验证于 Jan 26, 2026

> **注意：**
>
> 在 1.52 版本的 Tailscale 客户端中，Tailscale Funnel 和 Tailscale Serve 的 CLI 命令都发生了变化。如果你在之前的版本中使用过 Funnel 或 Serve，我们建议你查阅 CLI 文档。

`tailscale serve` 让你在 Tailscale 网络（即 tailnet）内安全地分享本地服务。

```shell
tailscale serve [flags] <target>
```

你也可以选择使用 [Tailscale Funnel][docs-funnel]（通过 [`tailscale funnel`][docs-tailscale-funnel] 命令）把服务公开暴露，向整个互联网开放。

子命令：

* [`status`][ar-get-the-status] 获取状态
* [`reset`][ar-reset-tailscale-serve] 重置配置
* [`drain`][ar-drain] 排空一个[服务][docs-tailscale-services]
* [`advertise`][ar-advertise] 通告一个[服务][docs-tailscale-services]
* [`get-config`][ar-get-config] 获取[服务][docs-tailscale-services]配置
* [`set-config`][ar-set-config] 设置[服务][docs-tailscale-services]配置

关于各种使用场景和示例，请参阅 [Tailscale Serve 示例][docs-serve-examples]。

## Serve 命令标志

可用标志：

* `--accept-app-caps=<capability-1,capability-2,...>` 要转发给服务器的[应用能力][docs-grants-app-capabilities]（以逗号分隔的列表指定多个能力）。
* `--bg` 决定命令是否作为后台进程运行。
* `--http=<port>` 在指定端口上暴露一个 HTTP 服务器。
* `--https=<port>` 在指定端口上暴露一个 HTTPS 服务器（默认）。
* `--proxy-protocol=<version>` TCP 转发使用的 PROXY protocol 版本（1 或 2）。
* `--service=<virtual-ip>` 为一个拥有独立虚拟 IP 的 [Tailscale Service][docs-tailscale-services] 提供服务，而不是使用设备的 IP 地址。
* `--set-path=<path>` 把指定路径附加到访问底层服务的基础 URL 之后。
* `--tcp=<port>` 暴露一个 TCP 转发器，在指定端口转发 TCP 数据包。
* `--tls-terminated-tcp=<port>` 暴露一个 TCP 转发器，在指定端口转发已终结 TLS 的 TCP 数据包。
* `--tun` 配置一个[第 3 层服务][docs-l3-services]，把所有流量转发到本地机器（默认为 false）；仅对服务（Services）支持。
* `--yes` 更新时不进行交互式提示。

`tailscale serve` 命令接受一个 target（目标），可以是一个文件、目录、文本，或最常见的情况——本地设备上运行的服务的位置。本地服务的位置可以写成端口号（例如 `3000`）、部分 URL（例如 `localhost:3000`）或包含路径的完整 URL（例如 `tcp://localhost:3000/foo`、`https+insecure://localhost:3000/foo`）。

## 使用 HTTPS 和 HTTP 服务器

```shell
tailscale serve --https=<port> <target> [off]
tailscale serve --http=<port> <target> [off]
```

`serve` 提供 HTTPS 和 HTTP 服务器，有几种模式：反向代理、文件服务器和静态文本服务器。HTTPS 流量使用自动配置的 TLS 证书。默认情况下，HTTPS 连接由设备的 Tailscale 守护进程终结。

* `--https=<port>` 或 `http=<port>` 指定监听端口

* `--set-path` 是以斜杠分隔的 URL 路径。根级挂载点是 `/`，例如向 `https://my-node.example.ts.net/` 发起请求即可匹配。关于这些路径模式的匹配方式，请参阅 Go 的 [ServeMux][xt-go-servemux] 文档。我们的挂载点行为与之类似。

* `<target>` Serve 提供 4 种内容提供方式：HTTP 反向代理、文件、目录和静态文本。反向代理让你把请求转发到本地 HTTP web 服务器。提供本地文件路径可以提供单个文件或文件目录的服务。提供静态文本主要用于调试，会返回一个静态响应。

  * **反向代理**

    要作为本地后端的反向代理，请在 `<target>` 参数中提供位置。本地服务的位置可以写成端口号（例如 `3000`）、部分 URL（例如 `localhost:3000`）或包含路径的完整 URL（例如 `tcp://localhost:3000/foo`、`https+insecure://localhost:3000/foo`）。注意，代理只支持 `http://127.0.0.1`。

    示例：`tailscale serve localhost:3000`

    或者，通过 HTTP 提供服务：

    示例：`tailscale serve --http=80 localhost:3000`

    HTTP 服务器可以通过短 MagicDNS 名称访问，例如 `http://my-node`

  * **文件服务器**

    提供你想提供服务的文件或文件目录的完整绝对路径。如果指定的是目录，将渲染一个目录列表，其中包含指向文件和子目录的链接。

    示例：`tailscale serve /home/alice/blog/index.html`

    由于 macOS 应用沙盒的限制，此选项仅在使用 Tailscale 的[开源变体][docs-macos-variants]时有效。如果你通过 Mac App Store 或 Standalone 变体系统扩展在 macOS 上安装了 Tailscale，可以使用 Serve 共享端口，但不能共享文件或目录。

  * **静态文本服务器**

    把 `text:<value>` 指定为 `<target>` 即可配置一个静态纯文本服务器。

    示例：`tailscale serve text:"Hello, world!"`

## 使用 PROXY protocol

```shell
tailscale serve --proxy-protocol=<version> <target>
```

> **注意：**
>
> 在大多数情况下，用户很可能会使用版本 `2`。

[PROXY protocol][xt-haproxy-proxy-protocol] 是一个极简的网络协议，它可以在经过代理或负载均衡器时保留被代理连接的信息（通常是源 IP 地址），并传递给后端目标。这让你用 Serve 暴露的服务能够确定连接客户端的原始 IP 地址和端口。

例如：

```shell
tailscale serve --proxy-protocol=2 --tls-terminated-tcp=443 tcp://127.0.0.1:9899
```

此命令会返回类似如下的信息：

```shell
Available within your tailnet:

|-- tcp://serve-test.example.ts.net:443 (TLS terminated, PROXY protocol v2)
|-- tcp://100.101.102.103:443
|-- tcp://[fd7a:115c:a1e0::1111:2222]:443
|--> tcp://127.0.0.1:9899

Press Ctrl+C to exit.
```

后端（运行在 `localhost:9899`）随后通过 PROXY protocol 获得原始源 IP 和端口。

## 使用 TCP 转发器

```shell
tailscale serve --tcp=<port> tcp://localhost:<local-port> [off]
tailscale serve --tls-terminated-tcp=<port> tcp://localhost:<local-port> [off]
```

`serve` 命令提供 TCP 转发器，可以把原始 TCP 数据包和已终结 TLS 的 TCP 数据包转发到本地 TCP 服务器（如 Caddy），或其他基于 TCP 的协议（如 SSH 或 RDP）。默认情况下，TCP 转发器转发原始数据包。

* `--tcp=<port>` 设置一个监听指定端口的原始 TCP 转发器。可以使用任何有效端口号。

* `--tls-terminated-tcp=<port>` 设置一个监听指定端口的 TLS 终结型 TCP 转发器。可以使用任何有效端口号。

* `tcp://localhost:<local-port>` 指定数据包要转发到的本地端口。

## 使用有效证书

```shell
tailscale serve <https:target>
```

如果你有有效证书，请在 `<target>` 参数中使用 `https`。

示例：`tailscale serve https://localhost:8443`

## 忽略无效和自签名证书检查

```shell
tailscale serve <https+insecure:target>
```

如果你运行的本地 web 服务器使用 HTTPS 且证书是自签名或其他无效证书，可以在 `tailscale serve` 命令中把 `https+insecure` 指定为一种特殊的伪协议。

示例：`tailscale serve https+insecure://localhost:8443`

## 获取状态

```shell
tailscale serve status [--json]
```

要获取服务器的状态，可以使用 `status` 子命令。它会列出当前在你的设备上运行的所有服务器。

* `--json` 如果你想以 JSON 格式获取状态，可以提供 `--json` 参数。

  示例：`tailscale serve status --json`

> **注意：**
>
> 目前，`tailscale serve status` 与 `tailscale serve status --json` 返回的信息不同。如果你想要服务（Services）列表，可以使用以下命令：
>
> ```shell
> tailscale serve get-config --all
> ```
>
> 更多信息请参阅我们的 [GitHub issue][xt-gh-tailscale-issue-18289]。

## 重置 Tailscale Serve

```shell
tailscale serve reset
```

要清除当前的 `tailscale serve` 配置，请使用 `reset` 子命令。

## 停用 Tailscale Serve

* `[off]` 要关闭某条 `tailscale serve` 命令，可以在你当初开启它的命令末尾加上 `off`。这会把该服务器从活跃服务器列表中移除。在 `off` 命令中，`<target>` 参数是可选的，但所有原有标志都必须保留。

如果这条命令开启了一个服务器：

```shell
tailscale serve --https=443 /home/alice/blog/index.html
```

你可以这样关闭它：

```shell
tailscale serve --https=443 /home/alice/blog/index.html off
```

你可以省略 `<target>` 参数，因此以下两条命令等价：

```shell
tailscale serve --https=443 --set-path=/foo /home/alice/blog/index.html off
tailscale serve --https=443 --set-path=/foo off
```

## 获取服务配置

```shell
tailscale serve get-config <file> [flags]
```

获取此节点当前托管的[服务][docs-tailscale-services]的配置，输出格式之后可直接提供给 `set-config`。这可用于声明服务主机的配置。

可用标志：

* `--all` 读取所有服务的配置。
* `--service=<name>` 读取特定服务的配置。

## 设置服务配置

```shell
tailscale serve set-config <file> [flags]
```

读取提供的[配置文件][docs-tailscale-services-configuration-file]，并用它声明单个[服务][docs-tailscale-services]或此节点托管的全部服务的配置。

* `--all` 把配置应用到所有服务。
* `--service=<name>` 把配置应用到特定服务。

## 排空服务（Drain）

```shell
tailscale serve drain <service>
```

把一个[服务][docs-tailscale-services]从当前节点排空。

使用此命令可以优雅地把服务从当前节点移除，而不影响现有连接。不会再接受新连接，但现有连接会继续工作，直到它们关闭。

`<service>` 应为服务名。例如：`svc:my-service`。

## 通告（Advertise）

```shell
tailscale serve advertise <service>
```

把此节点通告为 tailnet 的[服务][docs-tailscale-services]主机。

此命令适用于把一个已被[排空][ar-drain]的服务主机重新上线。如果你是用 `tailscale serve` 初始化服务的，则不需要它。

`<service>` 应为服务名。例如：`svc:my-service`。

可用标志：

* `--service=<name>` 把配置应用到特定服务。

## 重启与重新启动的影响

如果你使用 [`-bg`][ar-serve-command-flags] 标志运行 `tailscale serve` 命令，它会持续在后台运行，直到你[停用][ar-disable-tailscale-serve]它。当你重启设备，或在命令行中使用 [`tailscale down`][docs-cli-down]和[`tailscale up`][docs-cli-up]重启 Tailscale 时，Serve 会自动恢复分享。

如果你使用不带 `-bg` 标志的 `tailscale serve` 命令，之后又重启设备或从命令行重启了 Tailscale，则必须手动重启 Serve 才能恢复分享。

> **注意：**
>
> 把 `tailscale serve` 命令与 [Tailscale Services][docs-tailscale-services] 一起使用时，它默认在后台运行。

[ar-advertise]: #通告advertise

[ar-disable-tailscale-serve]: #停用-tailscale-serve

[ar-drain]: #排空服务drain

[ar-get-config]: #获取服务配置

[ar-get-the-status]: #获取状态

[ar-reset-tailscale-serve]: #重置-tailscale-serve

[ar-set-config]: #设置服务配置

[ar-serve-command-flags]: #serve-命令标志

[docs-cli-down]: /docs/reference/tailscale-cli#down

[docs-cli-up]: /docs/reference/tailscale-cli#up

[docs-funnel]: /docs/features/tailscale-funnel

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-l3-services]: /docs/features/tailscale-services#layer-3-endpoints-network-layer

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-serve-examples]: /docs/reference/examples/serve

[docs-tailscale-funnel]: /docs/reference/tailscale-cli/funnel

[docs-tailscale-services-configuration-file]: /docs/reference/tailscale-services-configuration-file

[docs-tailscale-services]: /docs/features/tailscale-services

[xt-gh-tailscale-issue-18289]: https://github.com/tailscale/tailscale/issues/18289

[xt-go-servemux]: https://pkg.go.dev/net/http#ServeMux

[xt-haproxy-proxy-protocol]: https://www.haproxy.com/blog/use-the-proxy-protocol-to-preserve-a-clients-ip-address
