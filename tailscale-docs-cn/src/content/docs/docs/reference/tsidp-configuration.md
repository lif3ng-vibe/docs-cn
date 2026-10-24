---
title: "tsidp configuration"
description: "Customize the configuration of tsidp to securely isolate and authorize any service that supports OIDC/OAuth."
---

Last validated Mar 10, 2026

The following content describes the various configuration settings for [`tsidp`][docs-tsidp].

## tsidp configuration flags

You can pass in the following configuration flags to `tsidp`:

* `-dir <path>` (string): Directory path to save [`tsnet`][docs-tsnet] and `tsidp` state. We recommend you set `-dir` to a specific path. Defaults to `""` (an empty string).
* `-hostname <hostname>` (string): Hostname to use for the `tsidp` instance in your tailnet. This defines the `<hostname>` portion of the `tsidp` instance's full DNS name, `<hostname>.<your-tailnet>.ts.net`. Defaults to `idp`.
* `-port <port>` (number): Port to listen on. Defaults to `443`.
* `-local-port <port>`: Local port to listen on, `localhost:<port>`. Useful for testing. Defaults to `disabled`.
* `-use-local-tailscaled` (boolean): Whether to use local [`tailscaled`][docs-tailscaled] instead of `tsnet`. Defaults to `false`.
* `-funnel`: Whether to use [Tailscale Funnel][docs-tailscale-funnel] to make `tsidp` available on the public internet so it works with Software as a Service (SaaS) products. Defaults to `disabled`.
* `-enable-sts`: Whether to enable OAuth token exchange using the [RFC 8693][xt-rfc-8693] OAuth 2.0 Token Exchange protocol. Defaults to `disabled`.
* `-log <level>` (string): The logging level. Can be one of: `debug`, `info`, `warn`, `error`. Defaults to `info`.
* `-debug-all-requests` (boolean): Print all requests and responses. Useful during development. Defaults to `disabled`.
* `-debug-tsnet` (string): Enable debug level logging with `tsnet` connections. Useful during development. Defaults to `disabled`.

## tsidp CLI environment variables

The `tsidp` binary is configured through the [`tsidp` configuration flags][ar-tsidp-configuration-flags]. However, there are several environment variables that configure the libraries that `tsidp` uses to connect to the tailnet.

### Required

#### TAILSCALE\_USE\_WIP\_CODE

Whether to use work in progress (WIP) code. Required while `tsidp` is in development, that is, until version 1.0.0 is released. Must be set to `1`.

```shell
TAILSCALE_USE_WIP_CODE=1
```

### Optional

The following environment variables are used when `tsidp` does not have any state information set by the `-dir <path>` flag.

> **Warning:**
>
> `tsidp` requires persistent state storage to function properly in production. Without a persistent path specified by the `-dir` flag, the `tsidp` instance will re-register with Tailscale on every restart, lose dynamic OIDC client registrations, and invalidate user sessions. Serverless environments without persistent storage are not recommended for production use.

#### TS\_AUTHKEY

Key for registering a `tsidp` instance as a new device in your tailnet. This can be an [auth key][docs-auth-keys] or an [OAuth client][docs-oauth-clients] secret. If omitted, a Tailscale login URL will be printed for manual login.

```shell
TS_AUTHKEY=<key>
```

#### TS\_ADVERTISE\_TAGS

Comma-separated set of [tags][docs-tags] to advertise for the `tsidp` instance. For example: `"tag:tsidp,tag:server"`. Optional, but required when using OAuth client secrets.

```shell
TS_ADVERTISE_TAGS=<tags>
```

#### TSNET\_FORCE\_LOGIN

Whether to force re-login of the `tsidp` node. Useful during development.

```shell
TSNET_FORCE_LOGIN=1
```

## Docker environment variables

The `tsidp` Docker image exposes the CLI flags through environment variables. If an environment variable is omitted, `tsidp` uses the default values set by the [`tsidp` configuration flags][ar-tsidp-configuration-flags].

> **Note:**
>
> `TS_STATE_DIR` and `TS_HOSTNAME` are legacy environment variable names. These will be replaced by `TSIDP_STATE_DIR` and `TSIDP_HOSTNAME` in the future.

### TS\_STATE\_DIR

Directory path to save `tsnet` and `tsidp` state.

If not set, `tsidp` uses the `-dir` CLI flag.

```shell
TS_STATE_DIR=<path>
```

In the future, `TSIDP_STATE_DIR` will replace `TS_STATE_DIR`.

### TS\_HOSTNAME

Hostname to use for the `tsidp` instance in your tailnet. This defines the `<hostname>` portion of the `tsidp` instance's full DNS name, `<hostname>.<your-tailnet>.ts.net`.

If not set, `tsidp` uses the `-hostname` CLI flag.

```shell
TS_HOSTNAME=<hostname>
```

In the future, `TSIDP_HOSTNAME` will replace `TS_HOSTNAME`.

### TSIDP\_PORT

Port to listen on.

If not set, `tsidp` uses the `-port` CLI flag.

```shell
TSIDP_PORT=<port>
```

### TSIDP\_LOCAL\_PORT

Local port, `localhost:<port>`, to listen on. Useful for development and testing.

If not set, `tsidp` uses the `-local-port` CLI flag.

```shell
TSIDP_LOCAL_PORT=<port>
```

### TSIDP\_USE\_FUNNEL

Whether to use [Tailscale Funnel][docs-tailscale-funnel] to make `tsidp` available on the public internet so it works with Software as a Service (SaaS) products.

If not set, `tsidp` uses the `-funnel` CLI flag.

```shell
TSIDP_USE_FUNNEL=1
```

### TSIDP\_ENABLE\_STS

Whether to enable OAuth token exchange using the [RFC 8693][xt-rfc-8693] OAuth 2.0 Token Exchange protocol.

If not set, `tsidp` uses the `-enable-sts` CLI flag.

```shell
TSIDP_ENABLE_STS=1
```

### TSIDP\_LOG

The logging level. Can be one of: `debug`, `info`, `warn`, `error`.

If not set, `tsidp` uses the `-log` CLI flag.

```shell
TSIDP_LOG=<level>
```

### TSIDP\_DEBUG\_TSNET

Enable debug level logging with `tsnet` connection. Useful during development.

If not set, `tsidp` uses the `-debug-tsnet` CLI flag.

```shell
TSIDP_DEBUG_TSNET=1
```

### TSIDP\_DEBUG\_ALL\_REQUESTS

Print all requests and responses. Useful during development.

If not set, `tsidp` uses the `-debug-all-requests` CLI flag.

```shell
TSIDP_DEBUG_ALL_REQUESTS=1
```

### TS\_AUTHKEY

Key for registering a `tsidp` instance as a new device in your tailnet. This can be an [auth key][docs-auth-keys] or an [OAuth client][docs-oauth-clients] secret. If omitted, a Tailscale login URL will be printed for manual login.

There is no corresponding `tsidp` CLI flag.

```shell
TS_AUTHKEY=<auth-key>
```

### TS\_ADVERTISE\_TAGS

Comma-separated set of [tags][docs-tags] to advertise for the `tsidp` instance. For example: `"tag:tsidp,tag:server"`. Optional, but required when using OAuth client secrets.

There is no corresponding `tsidp` CLI flag.

```shell
TS_ADVERTISE_TAGS=<tags>
```

[ar-tsidp-configuration-flags]: #tsidp-configuration-flags

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-tags]: /docs/features/tags

[docs-tailscale-funnel]: /docs/features/tailscale-funnel

[docs-tailscaled]: /docs/reference/tailscaled

[docs-tsidp]: /docs/features/tsidp

[docs-tsnet]: /docs/features/tsnet

[xt-rfc-8693]: https://www.rfc-editor.org/rfc/rfc8693.html
