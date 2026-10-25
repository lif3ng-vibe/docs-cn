---
title: "Hello tsnet"
description: "创建一个使用 [`tsnet`][docs-tsnet] 包的 Go 程序，与你的 Tailscale 网络（即 tailnet）中的其他设备建立连接。完成的程序会提供一个基本的 HTTP 服务器，返回“Hello, world!”以及一些 tailnet 数据。"
---

最后验证于 Sep 18, 2025

创建一个使用 [`tsnet`][docs-tsnet] 包的 Go 程序，与你的 Tailscale 网络（即 tailnet）中的其他设备建立连接。完成的程序会提供一个基本的 HTTP 服务器，返回"Hello, world!"以及一些 tailnet 数据。

## 前提条件

* 开发机需要：

  * [Go 编译器工具链][xt-go-download]
  * 一个终端窗口（命令提示符）
* 一个已有的 tailnet
* 有权向你的 tailnet 添加设备。
* 一个浏览器，或使用 `curl` 之类的命令来观察程序运行。你可以使用与开发机相同的设备，也可以使用 tailnet 中的另一台设备。

## 创建 `tsnet` Hello, world! 程序

为程序新建一个文件夹 `tshello`。

```shell
mkdir tshello
```

把当前工作目录切换到该新文件夹。

```shell
cd tshello
```

在命令行初始化一个 Go 程序：

```shell
go mod init tshello
```

运行以下命令，把 `tsnet` 添加到你的依赖中，使其可以在程序中使用：

```shell
go get tailscale.com/tsnet
```

这会把依赖添加到你的程序中，并在终端窗口列出它们。

创建文件 `tshello.go`。

在 `tshello.go` 中定义 `package main`，导入程序将用到的 Go 包，以及 `tailscale.com/tsnet` 包：

```go
// This program demonstrates how to use tsnet as a library.
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

添加一个 `var` 数组，定义可在命令行指定的标志（flag）。把 `addr` 的默认值设为 `:80`。`addr` 将用作 HTTP 服务器监听的端口。

```go
var (
    addr = flag.String("addr", ":80", "address to listen on")
)
```

添加 `main()` 函数的起始代码：

```go
func main() {
	flag.Parse()
	srv := new(tsnet.Server)
	defer srv.Close()
	ln, err := srv.Listen("tcp", *addr)
	if err != nil {
		log.Fatal(err)
	}
	defer ln.Close()
```

上面的代码解析为程序设置的命令行标志，然后创建 [`tsnet.Server`][docs-tsnet-server] 对象的实例。这是与 tailnet 交互所用的主要对象。对象 `ln` 是由 `Server.Listen()` 函数创建的监听器。在本例中，它使用 TCP 协议，监听 `addr` 指定的端口。

继续向 `main()` 添加代码。

```go
lc, err := srv.LocalClient()
if err != nil {
    log.Fatal(err)
}
```

这段代码通过调用 `Server.LocalClient()` 创建 `lc` 对象，让你的 `tsnet` 程序能够与本地设备上的 [`tailscaled` 守护进程][docs-tailscaled]通信。

添加代码：当 `addr` 为 `:443` 时使用 TLS 证书。（初次执行这段代码时你不会用到 `:443` 地址。）

```go
if *addr == ":443" {
    ln = tls.NewListener(ln, &tls.Config{
        GetCertificate: lc.GetCertificate,
    })
}
```

这段代码把监听器对象 `ln` 配置为使用 TLS，以支持建立 HTTPS 连接。Tailscale 会通过 [Let's Encrypt][xt-letsencrypt] 自动为 `tsnet` 程序请求证书。

添加代码，把程序作为 HTTP 服务器运行：

```go
log.Fatal(http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		who, err := lc.WhoIs(r.Context(), r.RemoteAddr)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		fmt.Fprintf(w, "<html><body><h1>Hello, world!</h1>\n")
		fmt.Fprintf(w, "<p>You are <b>%s</b> from <b>%s</b> (%s)</p>",
			html.EscapeString(who.UserProfile.LoginName),
			html.EscapeString(firstLabel(who.Node.ComputedName)),
			r.RemoteAddr)
	})))
}

func firstLabel(s string) string {
	s, _, _ = strings.Cut(s, ".")
	return s
}
```

这段代码依靠 Go 的 [`http.Serve`][xt-go-http-serve] 函数来处理发往运行该程序的 `tsnet` 设备的入站请求。程序处理请求时，会使用 Tailscale 的 `LocalClient.WhoIs()` 函数来定制"Hello"的内容。具体来说，程序返回的响应会显示用户的登录名、客户端设备名称，以及客户端设备的 [Tailscale IP 地址][docs-100.x-addresses]。

`firstLabel()` 函数是一个辅助函数，返回用户的客户端设备名称（不含域名部分）。

完整的示例如下：

```go
// This program demonstrates how to use tsnet as a library.
package main

import (
	"crypto/tls"
	"flag"
	"fmt"
	"html"
	"log"
	"net/http"
	"strings"

	"tailscale.com/tsnet"
)

var (
	addr = flag.String("addr", ":80", "address to listen on")
)

func main() {
	flag.Parse()
	srv := new(tsnet.Server)
	defer srv.Close()
	ln, err := srv.Listen("tcp", *addr)
	if err != nil {
		log.Fatal(err)
	}
	defer ln.Close()

	lc, err := srv.LocalClient()
	if err != nil {
		log.Fatal(err)
	}

	if *addr == ":443" {
		ln = tls.NewListener(ln, &tls.Config{
			GetCertificate: lc.GetCertificate,
		})
	}

	log.Fatal(http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		who, err := lc.WhoIs(r.Context(), r.RemoteAddr)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		fmt.Fprintf(w, "<html><body><h1>Hello, world!</h1>\n")
		fmt.Fprintf(w, "<p>You are <b>%s</b> from <b>%s</b> (%s)</p>",
			html.EscapeString(who.UserProfile.LoginName),
			html.EscapeString(firstLabel(who.Node.ComputedName)),
			r.RemoteAddr)
	})))
}

func firstLabel(s string) string {
	s, _, _ = strings.Cut(s, ".")
	return s
}
```

再次检查你的代码与此示例一致，然后保存文件。现在可以测试程序了。

## 运行程序

1. 启动程序：

   ```shell
   go run .
   ```

   程序会显示一条包含 Tailscale 认证 URL 的消息，类似如下：

   ```text
   2025/01/28 15:46:08 tsnet running state path /Users/amelie/Library/Application Support/tsnet-tshello/tailscaled.state

   2025/01/28 15:46:08 tsnet starting with hostname "tshello", varRoot "/Users/amelie/Library/Application Support/tsnet-tshello"

   2025/01/28 15:46:13 To start this tsnet server, restart with TS_AUTHKEY set, or go to: https://login.tailscale.com/a/1234567890
   ```

2. 要把设备添加到你的 tailnet，请在浏览器中打开该 URL 并登录 Tailscale。如果你的 tailnet 启用了[设备审批][docs-device-approval]，请在管理控制台的 **Machines** 页面[批准该设备][docs-device-approval-approve]。（本文后面会介绍如何自动把设备添加到 tailnet。）

3. 打开另一个终端窗口，尝试 ping 新添加的设备：

   ```shell
   ping tshello -c 2
   ```

4. 成功时，`ping` 结果类似如下：

   ```text
   PING tshello.example.ts.net (100.x.y.z): 56 data bytes
   64  bytes from 100.x.y.z: icmp_seq=0 ttl=64 time=49.404 ms
   64 bytes from 100.x.y.z: icmp_seq=1 ttl=64 time=2.425 ms

   --- tshello.example.ts.net ping statistics ---
   2 packets transmitted, 2 packets received, 0.0% packet loss
   round-trip min/avg/max/stddev = 2.425/25.915/49.404/23.490 ms
   ```

5. 使用 `curl` 连接该设备：

   ```shell
   curl http://tshello
   ```

   输出类似如下：

   ```text
   <html><body><h1>Hello, world!</h1>
   <p>You are <b>amelie@example.com</b> from <b>amelie-workstation</b> (100.x.y.z:49214)</p>
   ```

你已经编写了一个小型 HTTP 服务，它能响应请求并提供关于你的 tailnet 和用户的信息。接下来你将了解如何自动完成认证。

## 使用 auth key

前面示例代码依靠 Tailscale 认证 URL 把新设备登录到 tailnet。另一种登录 Tailscale 的方式是在初始化 `tsnet.Server` 时使用[认证密钥（auth key）][docs-auth-keys]。这样你可以[预先批准设备][docs-device-approval-pre-approve]。此外，如果你的 tailnet 启用了[设备审批][docs-device-approval]，而你只想用它来审批最终用户的设备，那么请给你的 `tsnet` 设备使用认证密钥。

要在 `tsnet` 程序中使用认证密钥，先[创建一个认证密钥][docs-auth-keys-generate]。

然后，你可以把本地环境变量 `TS_AUTHKEY` 设为认证密钥，或者把 [`Server.AuthKey`][docs-tsnet-server-authkey] 设为认证密钥。如果 `TS_AUTHKEY` 和 `Server.AuthKey` 都设置了，`Server.AuthKey` 优先。

要修改 `tsnet` 程序，为认证密钥设置命令行标志并把它赋给 `Server.AuthKey`：

1. 更新 `var` 数组，定义 `tsAuthKey` 标志。

   ```go
   var (
   	addr      = flag.String("addr", ":80", "address to listen on")
   	tsAuthKey = flag.String("ts-authkey", "", "Tailscale auth key")
   )
   ```

2. 创建 [`tsnet.Server`][docs-tsnet-server] 对象实例时，把认证密钥赋给 [`Server.AuthKey`][docs-tsnet-server-authkey]。

   ```go
   flag.Parse()

   srv := new(tsnet.Server)
   srv.AuthKey = *tsAuthKey
   ```

   之后程序会使用赋给命令行标志 `--ts-authkey` 的值。

   > **注意：**
   >
   > 使用环境变量（而非程序标志）设置认证密钥时，推荐的环境变量名是 `TS_AUTHKEY`。不过，如果 `TS_AUTHKEY` 未定义，`tsnet` 会使用旧的环境变量 `TS_AUTH_KEY`（如已定义）。`Server.AuthKey` 的优先级高于这两个环境变量。

## 控制持久化数据的目录

`tsnet.Server` 对象使用一个目录来存储和读取 `tsnet` 所用的持久化数据。`tsnet` 借助这些持久化数据，让程序在重启后能够重新连接到你的 tailnet。如果持久化数据被删除，程序将需要重新认证（除非你在启动程序时使用了认证密钥）。

默认情况下，`tsnet` 会把数据存储在[用户配置目录][xt-go-user-config-dir]下、以 `tsnet-` 与程序名拼接命名的子目录中。对于本文创建的程序，子目录名为 `tsnet-tshello`。你可以设置 [`Server.Dir`][docs-tsnet-server-dir] 来使用其他目录。`Server.Dir` 指定的目录必须已存在，否则 `tsnet` 调用会失败。

## `tsnet` 与 Go HTTP 栈

基于上面的示例，你可以用 Go 标准库的 HTTP 栈做任何想做的事，也可以使用与它兼容的库（例如 Gin/Gonic 或 Gorilla/mux）。如果你想向 tailnet 中的资源发起出站 HTTP 连接，可以使用 `tsnet.Server` 对象暴露的 `HTTPClient` 对象：

```go
httpCli := srv.HTTPClient()
```

它的用法与任何其他 [`net/http#Client`][xt-go-client] 相同：

```go
resp, err := httpCli.Get("http://tshello")
if err != nil {
	log.Fatal(err)
}
defer resp.Body.Close()

_, err = io.Copy(os.Stdout, resp.Body)
if err != nil {
	log.Fatal(err)
}
```

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-auth-keys-generate]: /docs/features/access-control/auth-keys#generate-an-auth-key

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval-approve]: /docs/features/access-control/device-management/device-approval#approve-devices-from-the-admin-console

[docs-device-approval-pre-approve]: /docs/features/access-control/device-management/device-approval#pre-approve-devices-with-an-auth-key

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-tailscaled]: /docs/reference/tailscaled

[docs-tsnet-server-authkey]: /docs/reference/tsnet-server-api#serverauthkey

[docs-tsnet-server-dir]: /docs/reference/tsnet-server-api#serverdir

[docs-tsnet-server]: /docs/reference/tsnet-server-api

[docs-tsnet]: /docs/features/tsnet

[xt-go-client]: https://pkg.go.dev/net/http#Client

[xt-go-download]: https://go.dev/dl

[xt-go-http-serve]: https://pkg.go.dev/net/http#Serve

[xt-go-user-config-dir]: https://golang.org/pkg/os/#UserConfigDir

[xt-letsencrypt]: https://letsencrypt.org
