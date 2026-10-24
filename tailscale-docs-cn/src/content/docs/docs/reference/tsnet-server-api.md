---
title: "tsnet.Server"
description: "Use tsnet.Server in a Go program to access tailnet services."
---

Last validated Jul 7, 2026

The [`tsnet` package][xt-go-tailscale-tsnet] provides the ability for Go programs to programmatically access a Tailscale network (known as a tailnet). A Go program using `tsnet` can connect to your tailnet as though it were a separate computer. You can also use `tsnet` to run multiple services with different confidentiality levels on the same machine. For example, you can create a support tool separate from a data analytics tool, without having to run them on multiple servers or virtual machines. The only way that the tools could be accessed is over Tailscale, so there's no way to get into them from outside your tailnet.

[`tsnet.Server`][xt-go-tailscale-tsnet-server] provides the primary means of interacting with a tailnet, and contains all the state for your program's connection to Tailscale. Use `tsnet.Server` to provide your Go program with its own IP address, DNS name, and the ability to grab its own HTTPS certificate. This lets you listen on privileged ports like the HTTP and HTTPS ports without having to run your service as `root`. `tsnet.Server` builds on the Go standard library HTTP functionality to give you the ability to make HTTP requests and an HTTP server to handle HTTP requests, in the context of your tailnet.

If you use `tsnet.Server` without any arguments, it uses default settings until you modify a setting in a subsequent `Server` call.

```go
srv := new(tsnet.Server)
if err := srv.Start(); err != nil {
    log.Fatalf("can't start tsnet server: %v", err)
}
defer s.Close()
```

You can change settings for a `tsnet.Server` instance up until you run any methods on it. The following sections show which settings you can change.

## `Server.Hostname`

This setting lets you control the host name of your program in your tailnet. By default, this will be the name of your program, such as `foo` for a program stored at `/usr/local/bin/foo`. You can also override this by setting the `Hostname` field:

```go
srv := new(tsnet.Server)
srv.Hostname = "kirito"
```

## `Server.Dir`

This setting lets you control the directory that the `tsnet.Server` stores data in persistently. By default,`tsnet` will store data in your [user configuration directory][xt-go-user-config-dir] based on the name of the binary. Note that this folder must already exist or `tsnet` calls will fail.

Here is how to override this to store data in `/data/tsnet`:

```go
dir := filepath.Join("/data", "tsnet")

if err := os.MkdirAll(dir, 0700); err != nil {
    log.Fatal(err)
}

srv := new(tsnet.Server)
srv.Dir = dir
```

You can have as many `tsnet.Server` instances as you want per OS process, but you will need to change the state directory if this is the case:

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

This setting lets you control whether the node should be registered as an [ephemeral node][docs-ephemeral-nodes]. Ephemeral nodes are automatically cleaned up after they disconnect from the control plane. This is useful when using `tsnet` in serverless environments or when facts and circumstances forbid you from using persistent state.

```go
srv := new(tsnet.Server)
srv.Ephemeral = true
```

## `Server.AuthKey`

This setting lets you set an [auth key][docs-auth-keys] so that your program will automatically authenticate with the Tailscale control plane. By default it pulls from the environment variable `TS_AUTHKEY`, but you can set your own logic like this:

```go
tsAuthKey := flag.String("ts-authkey", "", "Tailscale authkey")

flag.Parse()

srv := new(tsnet.Server)
srv.AuthKey = *tsAuthKey
```

This will set the auth key to the value of the flag `--ts-authkey`.

## `Server.ClientSecret`

If you pass an [OAuth client][docs-oauth-client] secret in `ClientSecret`, tsnet will use it to obtain an auth key from the control plane. You can also pass the client secret in the `TS_CLIENT_SECRET` environment variable. The OAuth client needs to have `auth_keys` write scope in order for this to work.

To use OAuth client authentication, you must pass at least one tag for the tsnet server in `AdvertiseTags`.

```go
tsClientSecret := flag.String("ts-client-secret", "", "Tailscale OAuth client secret")
tsAdvertiseTags := flag.String("ts-advertise-tags", "", "Comma-separated list of tags to advertise")

flag.Parse()

srv := new(tsnet.Server)
srv.ClientSecret = *tsClientSecret
srv.AdvertiseTags = strings.Split(*tsAdvertiseTags, ",")
```

## `Server.ClientID` and `Server.IDToken`

With [workload identity federation][docs-workload-identity-federation], tsnet can use an OpenID Connect (OIDC) token from a cloud-hosted infrastructure provider like Microsoft Azure, Google Cloud Platform, or GitHub Actions to authenticate with the control plane and request an auth key for the server.

You need to set up a [federated identity][docs-workload-identity-federation-get-started] to establish the trust relationship between the OIDC issuer and Tailscale and grant it the `auth_keys` write scope. You can then start your tsnet server with the client ID of the federated identity in `ClientID` and an OIDC token from the cloud provider in `IDToken`. Alternatively, you can set them with the environment variables `TS_CLIENT_ID` and `TS_ID_TOKEN`. This will prompt tsnet to exchange them for an auth key.

Instead of supplying `IDToken` yourself, you can set `Audience` (or the `TS_AUDIENCE` environment variable). tsnet then requests the ID token from the cloud provider on your behalf before exchanging it for an auth key. For details, refer to [automatic cloud token discovery and exchange][docs-workload-identity-federation-auto].

Workload identity federation is not linked into tsnet by default, to keep cloud-provider dependencies out of programs that don't use it. To enable it, add a blank import of the `tailscale.com/feature/identityfederation` package to your program:

```go
import _ "tailscale.com/feature/identityfederation"
```

Without this import, tsnet ignores `ClientID`, `IDToken`, and `Audience`, and continues to the next authentication method.

To use workload identity authentication, you must pass at least one tag for the tsnet server in `AdvertiseTags`.

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

`AdvertiseTags` specifies tags from the tailnet's ACL policy that should be applied to this node.

```go
tsAdvertiseTags := flag.String("ts-advertise-tags", "", "Comma-separated list of tags to advertise")

flag.Parse()

srv := new(tsnet.Server)
srv.AdvertiseTags = strings.Split(*tsAdvertiseTags, ",")
```

## `Server.ControlURL`

By default, tsnet connects to Tailscale's coordination server. Set `ControlURL` to point at a different coordination server, such as a self-hosted one. If `ControlURL` is empty, tsnet uses the `TS_CONTROL_URL` environment variable, and falls back to the Tailscale default if that is also empty.

```go
srv := new(tsnet.Server)
srv.ControlURL = "https://control.example.com"
```

## `Server.Logf`

This setting lets you override the logging logic for each `tsnet` instance. By default this will output everything to the [`log.Printf`][xt-go-log-printf] function, which can get spammy. To disable all `tsnet` logs, you can use a value like this:

```go
srv := &tsnet.Server{
    Logf: func(string, ...any) { },
}
```

When you need the logs, for example when debugging, use a [command line flag][xt-go-flag-bool] to enable logging:

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

This will prefix all `tsnet` log lines with the prefix `[tsnet:<hostname>]`, which can be useful when trying to debug issues.

## `Server.Start`

Once you are done changing your settings, you start the connection to your tailnet using the `Start` method:

```go
srv := new(tsnet.Server)

if err := srv.Start(); err != nil {
    log.Fatal(err)
}
defer srv.Close()
```

> **Note:**
>
> Most of the other `tsnet` calls implicitly call `Start` if it has not been called already.

Be sure to close the server instance at some point. It will stay open until either the OS process ends or the server is explicitly closed:

```go
defer srv.Close()
```

## `Server.Up`

`Up` starts the server, like `Start`, but also blocks until the node is connected and running in your tailnet. On success it returns the node's [status][xt-go-ipnstate-status], including a Tailscale IP address. Use it when your program needs the node to be reachable before it continues.

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

This call releases all resources associated with the `tsnet` server. Any calls to the server after this call will fail. All socket connections will be closed. All listeners will be closed. The node will not respond to ping messages. It is the same as turning off Tailscale on a machine in your tailnet.

Create your `tsnet` instances in your `main` function and then use `defer` to clean them up:

```go
srv := new(tsnet.Server)

if err := srv.Start(); err != nil {
    log.Fatal(err)
}
defer srv.Close()
```

## `Server.Listen`

This call creates a network listener in your tailnet. It returns a [`net.Listener`][xt-go-net-listener] that returns connections from your tailnet.

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

> **Note:**
>
> This method implicitly calls the `Start` method if it has not been called already.

## `Server.ListenTLS`

This call creates a TLS-wrapped network listener in your tailnet. It returns a [`net.Listener`][xt-go-net-listener] that wraps every incoming connection with TLS using the [Let's Encrypt][docs-enabling-https] support Tailscale offers. You can use this to create HTTPS services:

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

> **Note:**
>
> This method implicitly calls the `Start` method if it has not been called already.

## `Server.ListenFunnel`

This call creates a TLS-wrapped network listener that accepts connections from both your tailnet and the public internet using [Funnel][docs-funnel]. You can use this to expose your services to the public internet.

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

You can create a Funnel-only listener using `tsnet.FunnelOnly()`:

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

This lets you have different logic or endpoints exposed within your tailnet and to the general public.

> **Note:**
>
> This method implicitly calls the `Start` method if it has not been called already.

## `Server.ListenService`

`ListenService` creates a network listener for a [Tailscale Services][docs-tailscale-services] host. This will advertise this node as hosting the Service.

The following [prerequisites][docs-tailscale-services-prerequisites] must be met:

* Approval must be granted by [auto-approval rules][docs-policy-syntax-auto-approvers] or by an [Owner, Admin, or Network admin](/docs/reference/user-roles).
* Service hosts must be [tagged nodes][docs-tags].
* A valid Service host must advertise all ports defined for the Service.

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

To advertise a Service with multiple ports, run `ListenService` multiple times.

It is also possible to advertise a Service targeting a reverse proxy. This is useful when the backing server is external to the `tsnet` application.

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

> **Note:**
>
> This method implicitly calls the `Start` method if it has not been called already.

## `Server.ListenSSH`

`ListenSSH` creates a listener that accepts [Tailscale SSH][docs-tailscale-ssh] connections from your tailnet on the given address. The returned [`net.Listener`][xt-go-net-listener] yields connections that carry the connecting peer's Tailscale identity.

SSH support is not linked into tsnet by default. To enable it, add a blank import of the `tailscale.com/feature/ssh` package to your program. Without this import, `ListenSSH` returns an error.

```go
import _ "tailscale.com/feature/ssh"
```

Basic applications can use the returned connections as a plain [`net.Conn`][xt-go-net-conn]. Applications that need richer SSH semantics, such as PTY information or signals, can type-assert each connection to `*tailssh.Session`.

```go
srv := new(tsnet.Server)
srv.Hostname = "shion"

ln, err := srv.ListenSSH(":22")
if err != nil {
    log.Fatal(err)
}
defer ln.Close()
```

Connections returned by the listener are [`net.Conn`][xt-go-net-conn] values. Applications that need SSH-specific information can type-assert each accepted connection to `*tailssh.Session` (from `tailscale.com/ssh/tailssh`), which exposes methods such as `User()` and `Pty()`:

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

> **Note:**
>
> This method implicitly calls the `Start` method if it has not been called already.

## `Server.ListenPacket`

`ListenPacket` creates a UDP listener in your tailnet. It returns a [`net.PacketConn`][xt-go-net-packetconn]. The network must be `udp`, `udp4`, or `udp6`, and the address must be of the form `ip:port` with the IP specified. To listen on the node's own address, get it from `TailscaleIPs` after the server starts.

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

This call lets you create outgoing connections to nodes in your tailnet. You can treat the resulting connections like any other [network connection][xt-go-net-conn] in Go.

```go
srv := new(tsnet.Server)
srv.Hostname = "gaga"

conn, err := srv.Dial(r.Context(), "tcp", "yourmachine:80")
if err != nil {
    log.Fatal(err)
}
```

If [MagicDNS][docs-magicdns] is enabled, you can use MagicDNS names instead of full DNS names. For example, `yourmachine.tail-scale.ts.net`.

> **Note:**
>
> This method implicitly calls the `Start` method if it has not been called already.

## `Server.HTTPClient`

This is a convenience wrapper that lets you create a [HTTP client][xt-go-client] preconfigured to make outgoing connections in your tailnet.

```go
srv := new(tsnet.Server)
srv.Hostname = "looker"

cli := srv.HTTPClient()

resp, err := cli.Get("http://yourmachine/hello")
if err != nil {
    log.Fatal(err)
}
```

> **Note:**
>
> This method does not implicitly call the `Start` method if it has not been called already, but when you make any HTTP requests with that client, it will be called at time of use. In the above example, the `Start` method will be called when `cli.Get("http://yourmachine/hello")` is called.

## `Server.LocalClient`

When you install Tailscale on a computer normally, you can make changes to its configuration using the `tailscale` command line tool. `tsnet` doesn't offer the ability to use the `tailscale` command line tool to change its configuration, but you can use the [`local.Client`][xt-go-tailscale-local-client] to make all the same changes. The `tailscale` command line tool is built on the back of the `local.Client` type.

One common way to use this is to look up identity information for incoming connections in an HTTP server:

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

The `who` value is of type [`apitype.WhoIsResponse`][xt-go-tailscale-whois]. Depending on your jurisdiction's definition of personally-identifying information, this may contain personally-identifying information.

> **Note:**
>
> This method implicitly calls the `Start` method if it has not been called already.

## `Server.TailscaleIPs`

`TailscaleIPs` returns the node's IPv4 and IPv6 Tailscale IP addresses. If the node has not yet joined a tailnet, the returned addresses are not valid, which you can check with [`netip.Addr.IsValid`][xt-go-netip-isvalid].

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

[docs-policy-syntax-auto-approvers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-tags]: /docs/features/tags

[docs-tailscale-services-prerequisites]: /docs/features/tailscale-services#prerequisites

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-workload-identity-federation-auto]: /docs/features/workload-identity-federation#automatic-cloud-token-discovery-and-exchange

[docs-workload-identity-federation-get-started]: /docs/features/workload-identity-federation#set-up-a-federated-identity

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
