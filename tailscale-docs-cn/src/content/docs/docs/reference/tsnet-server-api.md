---
title: "tsnet.Server"
description: "在 Go 程序中使用 tsnet.Server 访问 tailnet 服务。"
---

最后验证于 Jul 7, 2026

[`tsnet` 包][xt-go-tailscale-tsnet]让 Go 程序能够以编程方式访问 Tailscale 网络（即 tailnet）。使用 `tsnet` 的 Go 程序可以像一台独立的计算机一样接入你的 tailnet。你还可以用 `tsnet` 在同一台机器上运行多个保密级别不同的服务。例如，你可以把一个支持工具与一个数据分析工具分开运行，而不必把它们部署在多台服务器或多台虚拟机上。这些工具只能通过 Tailscale 访问，因此从 tailnet 外部无法进入。

[`tsnet.Server`][xt-go-tailscale-tsnet-server] 是与 tailnet 交互的主要途径，包含你的程序与 Tailscale 连接的全部状态。通过 `tsnet.Server`，你的 Go 程序可以拥有自己的 IP 地址、DNS 名称，并能自动获取自己的 HTTPS 证书。这样你就可以监听 HTTP、HTTPS 等特权端口，而不必以 `root` 身份运行服务。`tsnet.Server` 构建在 Go 标准库的 HTTP 功能之上，让你能够在 tailnet 环境中发起 HTTP 请求，并运行处理 HTTP 请求的 HTTP 服务器。

如果在使用 `tsnet.Server` 时未传入任何参数，它会沿用默认设置，直到你在后续的 `Server` 调用中修改某项设置。

```go
srv := new(tsnet.Server)
if err := srv.Start(); err != nil {
    log.Fatalf("can't start tsnet server: %v", err)
}
defer s.Close()
```

在调用该 `tsnet.Server` 实例的任何方法之前，你都可以修改它的设置。以下各节介绍可以修改哪些设置。

## `Server.Hostname`

此设置用于控制你的程序在 tailnet 中的主机名。默认情况下，它是你的程序名，例如存储在 `/usr/local/bin/foo` 的程序对应 `foo`。你也可以通过设置 `Hostname` 字段来覆盖它：

```go
srv := new(tsnet.Server)
srv.Hostname = "kirito"
```

## `Server.Dir`

此设置用于控制 `tsnet.Server` 持久化存储数据的目录。默认情况下，`tsnet` 会以二进制文件名为依据，把数据存储在你的[用户配置目录][xt-go-user-config-dir]中。注意：该目录必须已经存在，否则 `tsnet` 调用会失败。

下面演示如何覆盖此设置，把数据存储到 `/data/tsnet`：

```go
dir := filepath.Join("/data", "tsnet")

if err := os.MkdirAll(dir, 0700); err != nil {
    log.Fatal(err)
}

srv := new(tsnet.Server)
srv.Dir = dir
```

每个 OS 进程中你可以按需创建任意多个 `tsnet.Server` 实例，但此时需要为它们更换状态目录：

```go
baseDir := "/data"
var servers []*tsnet.Server
for _, hostname := range []string{"ichika", "nino", "miku", "yotsuba", "itsuki"} {
    os.MkdirAll(filepath.Join(baseDir, hostname), 0700)
    srv := &tsnet.Server{
        Hostname: hostname,
        AuthKey: os.Getenv("TS_AUTHKEY"),
        Ephemeral: true,
        Dir: filepath.Join(baseDir, hostname),
    }
    if err := srv.Start(); err != nil {
        log.Fatalf("can't start tsnet server: %v", err)
    }
    servers = append(servers, srv)
}
```

## `Server.Ephemeral`

此设置用于控制该节点是否注册为[临时节点][docs-ephemeral-nodes]（ephemeral node）。临时节点在断开与控制平面的连接后会被自动清理。在无服务器（serverless）环境中使用 `tsnet`，或由于实际情况无法使用持久化状态时，这一设置很有用。

```go
srv := new(tsnet.Server)
srv.Ephemeral = true
```

## `Server.AuthKey`

此设置用于指定[认证密钥（auth key）][docs-auth-keys]，让你的程序自动向 Tailscale 控制平面完成认证。默认情况下，它从环境变量 `TS_AUTHKEY` 读取，但你也可以像这样编写自己的逻辑：

```go
tsAuthKey := flag.String("ts-authkey", "", "Tailscale authkey")

flag.Parse()

srv := new(tsnet.Server)
srv.AuthKey = *tsAuthKey
```

这会把认证密钥设置为标志 `--ts-authkey` 的值。

## `Server.ClientSecret`

如果你在 `ClientSecret` 中传入 [OAuth 客户端][docs-oauth-client]密钥（client secret），tsnet 会用它从控制平面获取一个认证密钥。你也可以通过 `TS_CLIENT_SECRET` 环境变量传入客户端密钥。为此，OAuth 客户端需要具备 `auth_keys` 写权限的 scope。

要使用 OAuth 客户端认证，你必须在 `AdvertiseTags` 中为该 tsnet 服务器传入至少一个标签。

```go
tsClientSecret := flag.String("ts-client-secret", "", "Tailscale OAuth client secret")
tsAdvertiseTags := flag.String("ts-advertise-tags", "", "Comma-separated list of tags to advertise")

flag.Parse()

srv := new(tsnet.Server)
srv.ClientSecret = *tsClientSecret
srv.AdvertiseTags = strings.Split(*tsAdvertiseTags, ",")
```

## `Server.ClientID` and `Server.IDToken`

借助[工作负载身份联合][docs-workload-identity-federation]（workload identity federation），tsnet 可以使用来自 Microsoft Azure、Google Cloud Platform、GitHub Actions 等云端基础设施提供方的 OpenID Connect（OIDC）令牌向控制平面完成认证，并为该服务器请求认证密钥。

你需要设置一个[联合身份][docs-workload-identity-federation-get-started]，在 OIDC 签发方与 Tailscale 之间建立信任关系，并授予它 `auth_keys` 写权限的 scope。随后启动 tsnet 服务器时，在 `ClientID` 中传入联合身份的客户端 ID，在 `IDToken` 中传入来自云提供方的 OIDC 令牌即可。你也可以改用环境变量 `TS_CLIENT_ID` 和 `TS_ID_TOKEN` 来设置。这样 tsnet 就会用它们换取认证密钥。

你也可以不自己提供 `IDToken`，而是设置 `Audience`（或 `TS_AUDIENCE` 环境变量）。此时 tsnet 会代你向云提供方请求 ID 令牌，然后再用它换取认证密钥。详情参阅[自动发现并交换云端令牌][docs-workload-identity-federation-auto]。

默认情况下，工作负载身份联合不会链接进 tsnet，以免不使用它的程序引入云提供方依赖。要启用它，请在你的程序中添加对 `tailscale.com/feature/identityfederation` 包的空白导入：

```go
import _ "tailscale.com/feature/identityfederation"
```

没有这个导入时，tsnet 会忽略 `ClientID`、`IDToken` 和 `Audience`，转而尝试下一种认证方式。

要使用工作负载身份认证，你必须在 `AdvertiseTags` 中为该 tsnet 服务器传入至少一个标签。

```go
tsClientID := flag.String("ts-client-id", "", "Tailscale federated identity client ID")
tsIDToken := flag.String("ts-id-token", "", "ID token issued by OIDC provider")
tsAdvertiseTags := flag.String("ts-advertise-tags", "", "Comma-separated list of tags to advertise")

flag.Parse()

srv := new(tsnet.Server)
srv.ClientID = *tsClientID
srv.IDToken = *tsIDToken
srv.AdvertiseTags = strings.Split(*tsAdvertiseTags, ",")
```

## `Server.AdvertiseTags`

`AdvertiseTags` 指定应应用到该节点的 tailnet ACL 策略中的标签。

```go
tsAdvertiseTags := flag.String("ts-advertise-tags", "", "Comma-separated list of tags to advertise")

flag.Parse()

srv := new(tsnet.Server)
srv.AdvertiseTags = strings.Split(*tsAdvertiseTags, ",")
```

## `Server.ControlURL`

默认情况下，tsnet 连接 Tailscale 的协调服务器（coordination server）。将 `ControlURL` 设置为指向另一个协调服务器，例如自托管的协调服务器。如果 `ControlURL` 为空，tsnet 会使用 `TS_CONTROL_URL` 环境变量；若该变量也为空，则回退到 Tailscale 默认值。

```go
srv := new(tsnet.Server)
srv.ControlURL = "https://control.example.com"
```

## `Server.Logf`

此设置用于覆盖每个 `tsnet` 实例的日志逻辑。默认情况下，所有输出都会进入 [`log.Printf`][xt-go-log-printf] 函数，日志可能非常冗杂。要禁用全部 `tsnet` 日志，可以使用如下取值：

```go
srv := &tsnet.Server{
    Logf: func(string, ...any) { },
}
```

当你需要日志时（例如调试时），通过一个[命令行标志][xt-go-flag-bool]来启用日志：

```go
tsnetVerbose := flag.Bool("tsnet-verbose", false, "if set, verbosely log tsnet information")
hostname := flag.String("tsnet-hostname", "hikari", "hostname to use in the tailnet")

srv := &tsnet.Server{
    Hostname: *hostname,
    Logf: func(string, ...any) { },
}

if *tsnetVerbose {
    srv.Logf = log.New(os.Stderr, fmt.Sprintf("[tsnet:%s] ", *hostname), log.LstdFlags).Printf
}
```

这会给所有 `tsnet` 日志行加上 `[tsnet:<hostname>]` 前缀，在排查问题时很有用。

## `Server.Start`

设置修改完毕后，使用 `Start` 方法启动与 tailnet 的连接：

```go
srv := new(tsnet.Server)

if err := srv.Start(); err != nil {
    log.Fatal(err)
}
defer srv.Close()
```

> **注意：**
>
> 其他大多数 `tsnet` 调用在 `Start` 尚未被调用时会隐式调用它。

请务必在某个时机关闭服务器实例。它会一直保持打开，直到 OS 进程结束或服务器被显式关闭：

```go
defer srv.Close()
```

## `Server.Up`

`Up` 与 `Start` 一样会启动服务器，但还会阻塞，直到节点接入 tailnet 并开始运行。成功时它会返回节点的[状态][xt-go-ipnstate-status]，其中包括 Tailscale IP 地址。当你的程序需要节点先变为可达再继续执行时，可以使用它。

```go
srv := new(tsnet.Server)
srv.Hostname = "noa"

status, err := srv.Up(context.Background())
if err != nil {
    log.Fatal(err)
}
log.Printf("running at %v", status.TailscaleIPs)
```

## `Server.Close`

此调用会释放与该 `tsnet` 服务器关联的所有资源。此后对该服务器的任何调用都会失败。所有套接字连接会被关闭，所有监听器会被关闭，节点也不再响应 ping 消息。效果等同于在 tailnet 中的一台机器上关闭 Tailscale。

在 `main` 函数中创建 `tsnet` 实例，然后用 `defer` 清理：

```go
srv := new(tsnet.Server)

if err := srv.Start(); err != nil {
    log.Fatal(err)
}
defer srv.Close()
```

## `Server.Listen`

此调用在你的 tailnet 中创建网络监听器，返回一个会接收来自 tailnet 连接的 [`net.Listener`][xt-go-net-listener]。

```go
srv := new(tsnet.Server)
srv.Hostname = "tadaima"

ln, err := srv.Listen("tcp", ":80")
if err != nil {
    log.Fatal(err)
}

log.Fatal(http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "Hi there! Welcome to the tailnet!")
})))
```

> **注意：**
>
> 此方法在 `Start` 尚未被调用时会隐式调用它。

## `Server.ListenTLS`

此调用在你的 tailnet 中创建一个 TLS 包装的网络监听器。它返回一个 [`net.Listener`][xt-go-net-listener]，会利用 Tailscale 提供的 [Let's Encrypt][docs-enabling-https] 支持为每个传入连接套上 TLS。你可以用它创建 HTTPS 服务：

```go
srv := new(tsnet.Server)
srv.Hostname = "aegis"

ln, err := srv.ListenTLS("tcp", ":443")
if err != nil {
    log.Fatal(err)
}

log.Fatal(http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "Hi there! Welcome to the tailnet!")
})))
```

> **注意：**
>
> 此方法在 `Start` 尚未被调用时会隐式调用它。

## `Server.ListenFunnel`

此调用创建一个 TLS 包装的网络监听器，通过 [Funnel][docs-funnel] 同时接受来自 tailnet 和公共互联网的连接。你可以用它把服务对外发布到公共互联网。

```go
srv := new(tsnet.Server)
srv.Hostname = "ophion"

ln, err := srv.ListenFunnel("tcp", ":443")
if err != nil {
    log.Fatal(err)
}

log.Fatal(http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "Hi there! Welcome to the tailnet!")
})))
```

你可以使用 `tsnet.FunnelOnly()` 创建仅限 Funnel 的监听器：

```go
publicLn, err := srv.ListenFunnel("tcp", ":443", tsnet.FunnelOnly())
if err != nil {
    log.Fatal(err)
}

privateLn, err := srv.ListenTLS("tcp", ":443")
if err != nil {
    log.Fatal(err)
}
```

这样你就可以在 tailnet 内部和面向公众分别暴露不同的逻辑或端点。

> **注意：**
>
> 此方法在 `Start` 尚未被调用时会隐式调用它。

## `Server.ListenService`

`ListenService` 为 [Tailscale Services][docs-tailscale-services] 主机创建网络监听器。这会通告该节点为承载此 Service 的节点。

必须满足以下[前提条件][docs-tailscale-services-prerequisites]：

* 必须由[自动审批规则][docs-policy-syntax-auto-approvers]或 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 批准。
* Service 主机必须是[打标签的节点][docs-tags]。
* 有效的 Service 主机必须通告该 Service 定义的全部端口。

```go
srv := new(tsnet.Server)
srv.Hostname = "atum"

ln, err := srv.ListenService("svc:my-service", tsnet.ServiceModeHTTP{
    HTTPS: true,
    Port:  443,
})
if err != nil {
    log.Fatal(err)
}

log.Printf("Listening on https://%v\n", ln.FQDN)
log.Fatal(http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "Hi there! Welcome to the tailnet!")
})))
```

要通告一个多端口的 Service，请多次运行 `ListenService`。

也可以通告一个指向反向代理的 Service。当后端服务器位于 `tsnet` 应用之外时，这很有用。

```go
import (
    "net/http/httputil"
    "net/url"
)

// targetAddress represents the address of the backing server.
const targetAddress = "1.2.3.4:80"

srv := new(tsnet.Server)
srv.Hostname = "tefnut"

ln, err := srv.ListenService("svc:my-service", tsnet.ServiceModeHTTP{
    HTTPS: true,
    Port:  443,
})
if err != nil {
    log.Fatal(err)
}

log.Printf("Listening on https://%v\n", ln.FQDN)
log.Fatal(http.Serve(ln, httputil.NewSingleHostReverseProxy(&url.URL{
    Scheme: "http",
    Host:   targetAddress,
})))
```

> **注意：**
>
> 此方法在 `Start` 尚未被调用时会隐式调用它。

## `Server.ListenSSH`

`ListenSSH` 创建一个监听器，在指定地址上接受来自 tailnet 的 [Tailscale SSH][docs-tailscale-ssh] 连接。返回的 [`net.Listener`][xt-go-net-listener] 产生的连接会携带连接对端的 Tailscale 身份。

默认情况下，SSH 支持不会链接进 tsnet。要启用它，请在你的程序中添加对 `tailscale.com/feature/ssh` 包的空白导入。没有这个导入时，`ListenSSH` 会返回错误。

```go
import _ "tailscale.com/feature/ssh"
```

简单的应用可以把返回的连接当作普通的 [`net.Conn`][xt-go-net-conn] 使用。需要更丰富 SSH 语义（例如 PTY 信息或信号）的应用，可以将每个连接类型断言为 `*tailssh.Session`。

```go
srv := new(tsnet.Server)
srv.Hostname = "shion"

ln, err := srv.ListenSSH(":22")
if err != nil {
    log.Fatal(err)
}
defer ln.Close()
```

监听器返回的连接是 [`net.Conn`][xt-go-net-conn] 类型的值。需要 SSH 专属信息的应用，可以将每个接受的连接类型断言为 `*tailssh.Session`（来自 `tailscale.com/ssh/tailssh`），它暴露了 `User()` 和 `Pty()` 等方法：

```go
import "tailscale.com/ssh/tailssh"

for {
    conn, err := ln.Accept()
    if err != nil {
        log.Fatal(err)
    }
    if s, ok := conn.(*tailssh.Session); ok {
        // SSH-specific data is now available, for example:
        log.Printf("SSH connection from user %s", s.User())
    }
}
```

> **注意：**
>
> 此方法在 `Start` 尚未被调用时会隐式调用它。

## `Server.ListenPacket`

`ListenPacket` 在你的 tailnet 中创建 UDP 监听器，返回一个 [`net.PacketConn`][xt-go-net-packetconn]。网络参数必须是 `udp`、`udp4` 或 `udp6`，地址必须是显式指定 IP 的 `ip:port` 形式。要监听节点自身的地址，请在服务器启动后从 `TailscaleIPs` 获取。

```go
import "net"

srv := new(tsnet.Server)
srv.Hostname = "rei"
if err := srv.Start(); err != nil {
    log.Fatal(err)
}

ip4, _ := srv.TailscaleIPs()
pc, err := srv.ListenPacket("udp", net.JoinHostPort(ip4.String(), "9000"))
if err != nil {
    log.Fatal(err)
}
defer pc.Close()
```

## `Server.Dial`

此调用让你可以创建到 tailnet 中其他节点的出站连接。你可以像对待 Go 中任何其他[网络连接][xt-go-net-conn]一样处理这些连接。

```go
srv := new(tsnet.Server)
srv.Hostname = "gaga"

conn, err := srv.Dial(r.Context(), "tcp", "yourmachine:80")
if err != nil {
    log.Fatal(err)
}
```

如果启用了 [MagicDNS][docs-magicdns]，你可以使用 MagicDNS 名称代替完整的 DNS 名称，例如 `yourmachine.tail-scale.ts.net`。

> **注意：**
>
> 此方法在 `Start` 尚未被调用时会隐式调用它。

## `Server.HTTPClient`

这是一个便捷封装，让你可以创建一个预先配置好、能在 tailnet 内发起出站连接的 [HTTP 客户端][xt-go-client]。

```go
srv := new(tsnet.Server)
srv.Hostname = "looker"

cli := srv.HTTPClient()

resp, err := cli.Get("http://yourmachine/hello")
if err != nil {
    log.Fatal(err)
}
```

> **注意：**
>
> 此方法不会隐式调用尚未被调用的 `Start` 方法，但当你用该客户端发起任何 HTTP 请求时，`Start` 会在使用时被调用。在上面的示例中，`Start` 方法会在调用 `cli.Get("http://yourmachine/hello")` 时被调用。

## `Server.LocalClient`

正常情况下在计算机上安装 Tailscale 后，你可以使用 `tailscale` 命令行工具修改其配置。`tsnet` 不支持用 `tailscale` 命令行工具修改配置，但你可以使用 [`local.Client`][xt-go-tailscale-local-client] 进行完全相同的修改。`tailscale` 命令行工具正是构建在 `local.Client` 类型之上的。

一个常见用法是在 HTTP 服务器中查询传入连接的身份信息：

```go
s := new(tsnet.Server)
s.Hostname = "aran"
defer s.Close()

ln, err := s.Listen("tcp", ":80")
if err != nil {
    log.Fatal(err)
}
defer ln.Close()

lc, err := s.LocalClient()
if err != nil {
    log.Fatal(err)
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
```

`who` 值的类型是 [`apitype.WhoIsResponse`][xt-go-tailscale-whois]。根据你所在司法辖区对个人身份信息的定义，其中可能包含个人身份信息。

> **注意：**
>
> 此方法在 `Start` 尚未被调用时会隐式调用它。

## `Server.TailscaleIPs`

`TailscaleIPs` 返回节点的 IPv4 和 IPv6 Tailscale IP 地址。如果节点尚未加入 tailnet，返回的地址无效，你可以用 [`netip.Addr.IsValid`][xt-go-netip-isvalid] 检查。

```go
ip4, ip6 := srv.TailscaleIPs()
log.Printf("IPv4: %v, IPv6: %v", ip4, ip6)
```

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-funnel]: /docs/features/tailscale-funnel

[docs-magicdns]: /docs/features/magicdns

[docs-oauth-client]: /docs/features/oauth-clients

[docs-policy-syntax-auto-approvers]: /docs/reference/syntax/policy-file#自动批准autoapprovers

[docs-tags]: /docs/features/tags

[docs-tailscale-services-prerequisites]: /docs/features/tailscale-services#前提条件

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-workload-identity-federation-auto]: /docs/features/workload-identity-federation#自动发现并交换云端令牌

[docs-workload-identity-federation-get-started]: /docs/features/workload-identity-federation#设置联合身份

[docs-workload-identity-federation]: /docs/features/workload-identity-federation

[xt-go-client]: https://pkg.go.dev/net/http#Client

[xt-go-flag-bool]: https://pkg.go.dev/flag#Bool

[xt-go-ipnstate-status]: https://pkg.go.dev/tailscale.com/ipn/ipnstate#Status

[xt-go-log-printf]: https://pkg.go.dev/log#Printf

[xt-go-net-conn]: https://pkg.go.dev/net#Conn

[xt-go-net-listener]: https://pkg.go.dev/net#Listener

[xt-go-net-packetconn]: https://pkg.go.dev/net#PacketConn

[xt-go-netip-isvalid]: https://pkg.go.dev/net/netip#Addr.IsValid

[xt-go-tailscale-local-client]: https://pkg.go.dev/tailscale.com/client/local#Client

[xt-go-tailscale-tsnet-server]: https://pkg.go.dev/tailscale.com/tsnet#Server

[xt-go-tailscale-tsnet]: https://pkg.go.dev/tailscale.com/tsnet

[xt-go-tailscale-whois]: https://pkg.go.dev/tailscale.com/client/tailscale/apitype#WhoIsResponse

[xt-go-user-config-dir]: https://golang.org/pkg/os/#UserConfigDir
