---
title: "tsnet"
description: "使用 tsnet 包在 Go 程序中内嵌 Tailscale。"
---

最后验证于 Jul 24, 2026

`tsnet` 是一个库，让你可以在 Go 程序中内嵌 Tailscale。借助 `tsnet`，你可以以编程方式与 Tailscale 网络（即 tailnet）上的设备建立直连，就像 tailnet 中的其他设备一样。与其他 Tailscale 功能结合使用时，你可以创造出使用 tailnet 的各种新颖方式。

## 概述

通常，tailnet 中的每个 IP 地址都必须与单台设备强绑定。这使得在单台设备上运行多个服务变得困难，尤其当这些服务的[访问控制][docs-access-control]规则各不相同时。`tsnet` 让你可以在同一台设备上运行多个服务，它们可以使用不同的 IP 地址、访问控制规则，甚至不同的用户身份。

`tsnet` 使用[用户态][docs-userspace-networking] TCP/IP 网络栈。

在 Tailscale 内部，我们基于 `tsnet` 构建并持续使用着各种工具。`tsnet` 支撑着我们的内部 URL 缩短服务 [golink][xt-gh-tailscale-golink]，也支撑着支持团队每天用来帮你解决问题的支持工具。没有 `tsnet`，这些启用 Tailscale 的工具创建和维护起来会困难得多。

在外部，人们用 `tsnet` 来提供指标、交付管理端点以及创建其他功能。示例请访问 Go [`tsnet` known importers][xt-go-tailscale-tsnet-importedby] 页面。

## 在程序中引入 `tsnet`

运行以下命令，把 `tsnet` 添加到你的依赖中，使其可以在 Go 程序中使用：

```shell
go get tailscale.com/tsnet
```

在你的 Go 程序中，把 `tailscale.com/tsnet` 包加入导入列表：

```go
package main

import (
    "flag"
    "fmt"
    "html"
    "log"
    "net/http"
    "strings"

    "tailscale.com/tsnet"
)
```

## 使用 `tsnet.Server` 进行调用

[`tsnet.Server`][docs-tsnet-server] 对象是你的程序与 tailnet 中其他设备建立连接的入口。用将要创建的设备的主机名初始化 `tsnet.Server`，然后监听某个地址以接受来自 tailnet 的连接。

```go
var (
	addr     = flag.String("addr", ":80", "address to listen on")
	hostname = flag.String("hostname", "tshello", "hostname to use in the tailnet")
)

func main() {
	flag.Parse()
	srv := new(tsnet.Server)
	srv.Hostname = *hostname
	if err := srv.Start(); err != nil {
		log.Fatalf("can't start tsnet server: %v", err)
	}
	defer srv.Close()

	ln, err := srv.Listen("tcp", *addr)
	if err != nil {
		log.Fatalf("can't listen: %v", err)
	}
	defer ln.Close()

	// Use ln to serve requests to your tailnet
    ...
}
```

## 设备创建与认证

如果你没有使用[认证密钥（auth key）][docs-auth-keys]或[信任凭证（trust credentials）][docs-trust-credentials]，调用 [`Server.Start`][docs-tsnet-server-serverstart] 函数将会创建并显示一个 Tailscale 认证 URL。使用该 URL 登录 Tailscale，操作与 tailnet 中的其他设备相同。如果 tailnet 启用了[设备审批][docs-device-approval]，则需要由 tailnet 管理员[批准该设备][docs-device-approval-approve]。

除了通过 Tailscale 认证 URL 登录之外，你还可以在初始化 `tsnet.Server` 时使用认证密钥。这样你可以[预先批准设备][docs-device-approval-pre-approve]。

即使你的代码中没有直接调用 `Server.Start`，认证过程也可能发生，因为某些 `Server` 函数会在 `Server.Start` 尚未被调用时隐式调用它。

## 更多信息

* 有关 `tsnet.Server` 各函数的更多信息，请参阅 [`tsnet.Server`][docs-tsnet-server]。
* 有关使用 `tsnet` 的完整示例，请参阅 [Hello tsnet][docs-hello-tsnet]。
* 有关结合 Tailscale Services 使用 `Server.ListenService` 与 `ServiceModeHTTP` 的完整示例，请参阅 [`tsnet` 与 Tailscale Services][docs-tsnet-services]。

\[Missing snippet: tailscale\_skill.mdx]

[docs-access-control]: /docs/features/access-control

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval-approve]: /docs/features/access-control/device-management/device-approval#approve-devices-from-the-admin-console

[docs-device-approval-pre-approve]: /docs/features/access-control/device-management/device-approval#pre-approve-devices-with-an-auth-key

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-hello-tsnet]: /docs/features/tsnet/how-to/create-basic-tsnet-app

[docs-trust-credentials]: /docs/reference/trust-credentials

[docs-tsnet-server-serverstart]: /docs/reference/tsnet-server-api#serverstart

[docs-tsnet-server]: /docs/reference/tsnet-server-api

[docs-tsnet-services]: /docs/features/tsnet/how-to/register-service

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-gh-tailscale-golink]: https://github.com/tailscale/golink

[xt-go-tailscale-tsnet-importedby]: https://pkg.go.dev/tailscale.com/tsnet?tab=importedby
