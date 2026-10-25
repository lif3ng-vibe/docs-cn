---
title: "tsidp 配置"
description: "自定义 tsidp 的配置，以安全地隔离和授权任何支持 OIDC/OAuth 的服务。"
---

最后验证于 Mar 10, 2026

以下内容介绍了 [`tsidp`][docs-tsidp] 的各项配置设置。

## tsidp 配置标志

你可以向 `tsidp` 传入以下配置标志：

* `-dir <path>` (string)：保存 [`tsnet`][docs-tsnet] 与 `tsidp` 状态的目录路径。建议将 `-dir` 设置为一个具体路径。默认为 `""`（空字符串）。
* `-hostname <hostname>` (string)：`tsidp` 实例在你的 tailnet 中使用的主机名。它决定 `tsidp` 实例完整 DNS 名称 `<hostname>.<your-tailnet>.ts.net` 中的 `<hostname>` 部分。默认为 `idp`。
* `-port <port>` (number)：监听端口。默认为 `443`。
* `-local-port <port>`：本地监听端口，即 `localhost:<port>`。便于测试。默认为 `disabled`。
* `-use-local-tailscaled` (boolean)：是否使用本地 [`tailscaled`][docs-tailscaled] 而非 `tsnet`。默认为 `false`。
* `-funnel`：是否使用 [Tailscale Funnel][docs-tailscale-funnel] 将 `tsidp` 发布到公共互联网上，以便与软件即服务（SaaS）产品配合使用。默认为 `disabled`。
* `-enable-sts`：是否启用采用 [RFC 8693][xt-rfc-8693] OAuth 2.0 Token Exchange 协议的 OAuth 令牌交换。默认为 `disabled`。
* `-log <level>` (string)：日志级别。可选值：`debug`、`info`、`warn`、`error`。默认为 `info`。
* `-debug-all-requests` (boolean)：打印所有请求与响应。便于开发调试。默认为 `disabled`。
* `-debug-tsnet` (string)：为 `tsnet` 连接启用 debug 级别日志。便于开发调试。默认为 `disabled`。

## tsidp CLI 环境变量

`tsidp` 二进制文件通过 [tsidp 配置标志][ar-tsidp-configuration-flags]进行配置。不过，还有若干环境变量用于配置 `tsidp` 连接 tailnet 时所依赖的库。

### 必需

#### TAILSCALE\_USE\_WIP\_CODE

是否使用开发中（WIP）代码。在 `tsidp` 处于开发阶段期间（即 1.0.0 版本发布之前）必须设置。必须设为 `1`。

```shell
TAILSCALE_USE_WIP_CODE=1
```

### 可选

当 `tsidp` 没有通过 `-dir <path>` 标志设置任何状态信息时，会使用以下环境变量。

> **警告：**
>
> 在生产环境中，`tsidp` 需要持久化状态存储才能正常运行。如果未通过 `-dir` 标志指定持久化路径，`tsidp` 实例会在每次重启时重新向 Tailscale 注册、丢失动态 OIDC 客户端注册，并使用户会话失效。不建议在生产中使用没有持久化存储的无服务器（serverless）环境。

#### TS\_AUTHKEY

用于将 `tsidp` 实例作为新设备注册到你的 tailnet 的密钥。可以是[认证密钥（auth key）][docs-auth-keys]或 [OAuth 客户端][docs-oauth-clients]密钥。如果省略，将打印 Tailscale 登录 URL 供手动登录。

```shell
TS_AUTHKEY=<key>
```

#### TS\_ADVERTISE\_TAGS

为 `tsidp` 实例通告的一组以逗号分隔的[标签][docs-tags]。例如：`"tag:tsidp,tag:server"`。可选，但使用 OAuth 客户端密钥时必填。

```shell
TS_ADVERTISE_TAGS=<tags>
```

#### TSNET\_FORCE\_LOGIN

是否强制 `tsidp` 节点重新登录。便于开发调试。

```shell
TSNET_FORCE_LOGIN=1
```

## Docker 环境变量

`tsidp` 的 Docker 镜像通过环境变量暴露这些 CLI 标志。如果省略某个环境变量，`tsidp` 会使用 [tsidp 配置标志][ar-tsidp-configuration-flags]设定的默认值。

> **注意：**
>
> `TS_STATE_DIR` 和 `TS_HOSTNAME` 是旧的环境变量名，将来会被 `TSIDP_STATE_DIR` 和 `TSIDP_HOSTNAME` 取代。

### TS\_STATE\_DIR

保存 `tsnet` 与 `tsidp` 状态的目录路径。

如果未设置，`tsidp` 会使用 `-dir` CLI 标志。

```shell
TS_STATE_DIR=<path>
```

将来，`TSIDP_STATE_DIR` 将取代 `TS_STATE_DIR`。

### TS\_HOSTNAME

`tsidp` 实例在你的 tailnet 中使用的主机名。它决定 `tsidp` 实例完整 DNS 名称 `<hostname>.<your-tailnet>.ts.net` 中的 `<hostname>` 部分。

如果未设置，`tsidp` 会使用 `-hostname` CLI 标志。

```shell
TS_HOSTNAME=<hostname>
```

将来，`TSIDP_HOSTNAME` 将取代 `TS_HOSTNAME`。

### TSIDP\_PORT

监听端口。

如果未设置，`tsidp` 会使用 `-port` CLI 标志。

```shell
TSIDP_PORT=<port>
```

### TSIDP\_LOCAL\_PORT

本地监听端口，即 `localhost:<port>`。便于开发和测试。

如果未设置，`tsidp` 会使用 `-local-port` CLI 标志。

```shell
TSIDP_LOCAL_PORT=<port>
```

### TSIDP\_USE\_FUNNEL

是否使用 [Tailscale Funnel][docs-tailscale-funnel] 将 `tsidp` 发布到公共互联网上，以便与软件即服务（SaaS）产品配合使用。

如果未设置，`tsidp` 会使用 `-funnel` CLI 标志。

```shell
TSIDP_USE_FUNNEL=1
```

### TSIDP\_ENABLE\_STS

是否启用采用 [RFC 8693][xt-rfc-8693] OAuth 2.0 Token Exchange 协议的 OAuth 令牌交换。

如果未设置，`tsidp` 会使用 `-enable-sts` CLI 标志。

```shell
TSIDP_ENABLE_STS=1
```

### TSIDP\_LOG

日志级别。可选值：`debug`、`info`、`warn`、`error`。

如果未设置，`tsidp` 会使用 `-log` CLI 标志。

```shell
TSIDP_LOG=<level>
```

### TSIDP\_DEBUG\_TSNET

为 `tsnet` 连接启用 debug 级别日志。便于开发调试。

如果未设置，`tsidp` 会使用 `-debug-tsnet` CLI 标志。

```shell
TSIDP_DEBUG_TSNET=1
```

### TSIDP\_DEBUG\_ALL\_REQUESTS

打印所有请求与响应。便于开发调试。

如果未设置，`tsidp` 会使用 `-debug-all-requests` CLI 标志。

```shell
TSIDP_DEBUG_ALL_REQUESTS=1
```

### TS\_AUTHKEY

用于将 `tsidp` 实例作为新设备注册到你的 tailnet 的密钥。可以是[认证密钥（auth key）][docs-auth-keys]或 [OAuth 客户端][docs-oauth-clients]密钥。如果省略，将打印 Tailscale 登录 URL 供手动登录。

没有对应的 `tsidp` CLI 标志。

```shell
TS_AUTHKEY=<auth-key>
```

### TS\_ADVERTISE\_TAGS

为 `tsidp` 实例通告的一组以逗号分隔的[标签][docs-tags]。例如：`"tag:tsidp,tag:server"`。可选，但使用 OAuth 客户端密钥时必填。

没有对应的 `tsidp` CLI 标志。

```shell
TS_ADVERTISE_TAGS=<tags>
```

[ar-tsidp-configuration-flags]: #tsidp-配置标志

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-tags]: /docs/features/tags

[docs-tailscale-funnel]: /docs/features/tailscale-funnel

[docs-tailscaled]: /docs/reference/tailscaled

[docs-tsidp]: /docs/features/tsidp

[docs-tsnet]: /docs/features/tsnet

[xt-rfc-8693]: https://www.rfc-editor.org/rfc/rfc8693.html
