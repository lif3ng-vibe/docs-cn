---
title: "Docker 配置参数"
description: "配置参数以环境变量的形式在容器定义中传入。这些参数控制 Tailscale 容器如何认证到你的 tailnet、管理网络以及暴露服务。"
---

最后验证于 Mar 23, 2026

配置参数以环境变量的形式在容器定义中传入。这些参数控制 Tailscale 容器如何认证到你的 tailnet、管理网络以及暴露服务。

你可以使用这些参数配置认证方式、启用 DNS、指标和健康检查等功能、通告路由，或将流量转发到其他服务。在 Docker 配置（如 Docker run、Compose 或 Kubernetes 清单）中设置这些变量，即可自定义容器加入 tailnet 及在其中运行的方式。

## TS\_ACCEPT\_DNS

接受来自 Tailscale 管理控制台的 [DNS 配置][docs-dns]。默认不接受。如果你希望容器使用 [MagicDNS][docs-magicdns] 和 tailnet 中的自定义 DNS 设置，请启用此项。否则，容器将使用 Docker 的默认 DNS 配置。

## TS\_AUDIENCE

在为工作负载身份联合（workload identity federation）从知名身份提供方请求 ID 令牌时使用的 audience。请在支持自动生成 ID 令牌的环境中使用此参数，例如 GitHub Actions、Google Cloud 或 AWS。此参数必须与 `TS_CLIENT_ID` 一起使用。
不能与 `TS_CLIENT_SECRET` 或 `TS_ID_TOKEN` 一起使用。

## TS\_AUTH\_ONCE

控制登录行为。默认为 false，即容器每次启动都强制登录。设置 `TS_AUTH_ONCE=true` 后，只有当容器尚未通过认证时才会登录。当你持久化状态、不希望多余的重认证时可以使用此项。

## TS\_AUTHKEY

将容器认证到你的 tailnet。在 Tailscale 管理控制台中创建[认证密钥（auth key）][docs-auth-keys]，然后粘贴到这里。这等同于传给 [`tailscale login --auth-key=`][docs-cli-login] 的内容。你也可以在这里使用 [OAuth 客户端][docs-oauth-clients-register-new-nodes]的 secret，但必须通过 `TS_EXTRA_ARGS=--advertise-tags=tag:ci` 提供关联的标签。

[临时节点（ephemeral node）][docs-ephemeral-nodes]会在断开连接后很快从你的 tailnet 中自动移除，这对临时容器或 CI/CD 环境很有用。

节点是否为临时节点取决于你使用的凭证。

* 如果使用 [OAuth 客户端 secret][docs-oauth-clients-setup]，节点默认是临时节点。要注册非临时节点，请在 secret 后附加 `?ephemeral=false`。
* 如果使用[认证密钥][docs-auth-key-generate]，请在管理控制台创建密钥时设置其 ephemeral 属性。

此参数不能与 `TS_CLIENT_ID`、`TS_CLIENT_SECRET`、`TS_ID_TOKEN` 或 `TS_AUDIENCE` 一起使用。

## TS\_CLIENT\_ID

用于认证的 OAuth 客户端 ID。你可以单独使用它（例如在 GitHub Actions 等知名环境中自动生成 ID 令牌时）、与 `TS_CLIENT_SECRET` 一起用于 OAuth 认证、与 `TS_ID_TOKEN` 一起用于[工作负载身份联合][docs-workload-identity-federation]，或在受支持的环境中与 `TS_AUDIENCE` 一起用于自动生成 ID 令牌。

如果值以 `file:` 开头，Tailscale 会将其视为包含客户端 ID 的文件路径。

## TS\_CLIENT\_SECRET

用于生成认证密钥的 OAuth 客户端 secret。进行 OAuth 认证时必须与 `TS_CLIENT_ID` 一起使用。如果值以 `file:` 开头，Tailscale 会将其视为包含 secret 的文件路径。这比在配置中直接内嵌 secret 更安全。此参数不能与 `TS_ID_TOKEN` 或 `TS_AUDIENCE` 一起使用。

## TS\_DEST\_IP

把所有进入的 Tailscale 流量代理到指定的目标 IP。
当你希望到达 Tailscale 容器的所有流量都转发到某个特定服务时使用。例如，`TS_DEST_IP=100.0.0.5` 会把所有流量发送到该 IP 地址。

## TS\_ENABLE\_HEALTH\_CHECK

> **注意：**
>
> 此功能在 Tailscale 1.78 及更高版本中可用。

设为 true 时，会在你通过 `TS_LOCAL_ADDR_PORT` 指定的地址上启用一个无需认证的 `/healthz` 端点。如果节点至少拥有一个 tailnet IP 地址，健康检查返回 `200 OK`；否则返回 `503`。可用于容器编排的健康检查。

## TS\_ENABLE\_METRICS

> **注意：**
>
> 此功能在 Tailscale 1.78 及更高版本中可用。

设为 true 时，会在你通过 `TS_LOCAL_ADDR_PORT` 指定的地址上启用一个无需认证的 `/metrics` 端点。可用指标的更多信息请参阅[客户端指标][docs-client-metrics]。这有助于监控 Tailscale 容器的性能和连接状态。

## TS\_HEALTHCHECK\_ADDR\_PORT

> **注意：**
>
> 此功能在 Tailscale 1.78 及更高版本中已弃用。请改用 `TS_ENABLE_HEALTH_CHECK`。

## TS\_HOSTNAME

为容器在 tailnet 中设置自定义主机名。不设置时，Docker 会生成随机主机名。等同于 [`tailscale set --hostname=`][docs-cli-set]。例如，`TS_HOSTNAME=my-dev-database` 使你的容器可以在 tailnet 中通过 my-dev-database 访问。

## TS\_ID\_TOKEN

来自身份提供方、用于[工作负载身份联合][docs-workload-identity-federation]的 ID 令牌。必须与 `TS_CLIENT_ID` 一起使用。如果值以 `file:` 开头，Tailscale 会将其视为包含令牌的文件路径。

此参数不能与 `TS_CLIENT_SECRET` 或 `TS_AUDIENCE` 一起使用。

## TS\_KUBE\_SECRET

如果你在 Kubernetes 中运行，这是 Tailscale 存储状态的 Kubernetes 资源名称。默认为 `tailscale`。如果你没有设置 `TS_AUTHKEY`，而 `TS_KUBE_SECRET` 包含一个带有 auth key 字段的 secret，Tailscale 会使用该密钥作为认证密钥。

## TS\_LOCAL\_ADDR\_PORT

> **注意：**
>
> 此功能在 Tailscale 1.78 及更高版本中可用。

指定 Tailscale 提供本地指标和健康检查 HTTP 端点的 `[<addr>]:<port>`（需通过 `TS_ENABLE_METRICS` 或 `TS_ENABLE_HEALTH_CHECK` 启用）。默认在所有可用接口上为 `[::]:9002`。

## TS\_OUTBOUND\_HTTP\_PROXY\_LISTEN

为 [HTTP 代理][docs-userspace-networking-socks5-vs-http]设置地址和端口。Tailscale 会把它传给 `tailscaled --outbound-http-proxy-listen=`。例如，`TS_OUTBOUND_HTTP_PROXY_LISTEN=:8080` 会在端口 `8080` 上创建 HTTP 代理，等同于 `tailscaled --outbound-http-proxy-listen=:8080`。

## TS\_ROUTES

通告[子网路由][docs-subnets]，让 tailnet 中的其他设备可以访问此容器所能到达的网络。等同于 [`tailscale set --advertise-routes=`][docs-cli-set]。例如，`TS_ROUTES=192.168.1.0/24` 让其他 tailnet 设备能通过此容器访问你的本地网络。

要接受其他节点通告的路由，请通过 `TS_EXTRA_ARGS` 传入 `--accept-routes`。

## TS\_SERVE\_CONFIG

接受一个 JSON 文件，以编程方式配置 [Tailscale Serve][docs-tailscale-serve] 和 [Tailscale Funnel][docs-tailscale-funnel] 功能。使用 [`tailscale serve status --json`][docs-tailscale-serve] 以正确格式导出你当前的配置。如果你通过 Docker 卷以绑定挂载（bind mount）方式挂载此文件，必须将其作为目录挂载（而不是单个文件），Tailscale 才能正确检测配置更新。

## TS\_SOCKET

tailscaled LocalAPI 套接字所在的 Unix 套接字路径。默认为 `/var/run/tailscale/tailscaled.sock`。等同于 `tailscaled tailscale --socket=`。除非你对套接字路径有特殊要求，否则通常无需更改。

## TS\_SOCKS5\_SERVER

为 [SOCKS5 代理][docs-userspace-networking-socks5-vs-http]设置地址和端口。Tailscale 会把它传给 `tailscaled --socks5-server=`。例如，`TS_SOCKS5_SERVER=:1055` 会在端口 `1055` 上创建 SOCKS5 代理，等同于 `tailscaled --socks5-server=:1055`。

## TS\_STATE\_DIR

指定 `tailscaled` 存储状态的位置。`TS_STATE_DIR` 卷可确保容器在重启后保持其身份。否则，每次重启都会在管理控制台中创建一个新节点。该目录必须在容器重启之间持久保存，否则你的容器每次都会显示为新节点。Tailscale 会把它传给 `tailscaled --statedir=`。例如，`TS_STATE_DIR=/var/lib/tailscale` 会把状态存储在该目录中，你应将其挂载为卷。

在 Kubernetes 上运行时，Tailscale 默认把状态存储在 `name:tailscale` 的 Kubernetes secret 中。要改为把状态存储在本地磁盘上，请设置 `TS_KUBE_SECRET=""` 和 `TS_STATE_DIR=/path/to/storage/dir`。

## TS\_TAILNET\_TARGET\_FQDN

把所有进入的非 Tailscale 流量代理到指定的 tailnet FQDN。功能类似于 `TS_TAILNET_TARGET_IP`，但解析的是 MagicDNS 名称而不是使用静态 IP。与 `TS_USERSPACE` 模式不兼容。不能与 `TS_TAILNET_TARGET_IP` 同时使用。

## TS\_TAILNET\_TARGET\_IP

把所有进入的非 Tailscale 流量代理到 tailnet 内指定的目标 IP。这会把容器设置为出站代理（egress proxy），把来自 tailnet 之外的流量转发到某个 Tailscale IP。与 `TS_USERSPACE` 模式不兼容。不能与 `TS_TAILNET_TARGET_FQDN` 同时使用。

## TS\_USERSPACE

控制是否使用[用户态网络模式][docs-userspace-networking-socks5-vs-http]而不是内核网络。默认启用。等同于 `tailscaled --tun=userspace-networking`。

用户态网络在任何环境都能工作，但性能较低。设置 `TS_USERSPACE=false` 可使用内核网络以获得更快速度，但还需要在配置中添加 devices 和 `cap_add` 段。内核网络性能更好，但需要 `/dev/net/tun` 和额外权限（capabilities）。

## 额外参数

上面的参数涵盖了常见的 Tailscale 配置，但 Tailscale 还支持许多其他 CLI 标志。使用下面的额外参数可以传入没有专用参数的任何标志。例如，如果你想把容器通告为出口节点或启用 SSH，可以通过 `TS_EXTRA_ARGS` 传递这些标志，因为它们没有对应的 `TS_` 参数。

## TS\_EXTRA\_ARGS

传入你想在 [`tailscale up`][docs-cli-up] 命令中使用的其他 Tailscale CLI 标志。例如，`TS_EXTRA_ARGS=--advertise-exit-node --ssh`。

## TS\_TAILSCALED\_EXTRA\_ARGS

传入你想在 [`tailscaled`][docs-tailscaled-flags-to-tailscaled] 命令中使用的其他 Tailscale CLI 标志。例如，`TS_TAILSCALED_EXTRA_ARGS=--verbose=2`。

## 实验性参数

> **警告：**
>
> `TS_EXPERIMENTAL` 参数可能随时变更，不应被视为永久受支持。

## TS\_EXPERIMENTAL\_SERVICE\_AUTO\_ADVERTISEMENT

> **注意：**
>
> 此功能在 Tailscale v1.96 及更高版本中可用。

对于不在 Kubernetes 中运行的 `containerboot` 实例，此参数会在启动时自动通告 Serve 配置中定义的所有 [Tailscale Services][docs-tailscale-services]，并在关闭时取消通告。

默认为 `true`，但可以禁用，以便使用用户自定义的通告配置。

> **注意：**
>
> 此参数对应一次默认行为的变更。以前，服务通告必须为每个容器手动启用，且不会在重启后保留。对于需要旧行为的场景，可以使用此参数恢复。
>
> ```shell
> TS_EXPERIMENTAL_SERVICE_AUTO_ADVERTISEMENT=false
> ```

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-auth-key-generate]: /docs/features/access-control/auth-keys#generate-an-auth-key

[docs-cli-login]: /docs/reference/tailscale-cli#login

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-cli-up]: /docs/reference/tailscale-cli#up

[docs-client-metrics]: /docs/reference/tailscale-client-metrics

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-magicdns]: /docs/features/magicdns

[docs-oauth-clients-register-new-nodes]: /docs/features/oauth-clients#使用-oauth-凭证注册新节点

[docs-oauth-clients-setup]: /docs/features/oauth-clients#设置-oauth-客户端

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-funnel]: /docs/reference/tailscale-cli/funnel

[docs-tailscale-serve]: /docs/reference/tailscale-cli/serve

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-tailscaled-flags-to-tailscaled]: /docs/reference/tailscaled#tailscaled-的标志

[docs-userspace-networking-socks5-vs-http]: /docs/concepts/userspace-networking#socks5-与-http-的区别

[docs-workload-identity-federation]: /docs/features/workload-identity-federation
