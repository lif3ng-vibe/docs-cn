---
title: "Docker configuration parameters"
description: "Configuration parameters are passed as environment variables in your container definition. These parameters control how a Tailscale container authenticates to your tailnet, manages networking, and exp"
---

Last validated Mar 23, 2026

Configuration parameters are passed as environment variables in your container definition. These parameters control how a Tailscale container authenticates to your tailnet, manages networking, and exposes services.

You can use parameters to configure authentication methods, enable features like DNS, metrics, and health checks, advertise routes, or forward traffic to other services. Set these variables in your Docker configuration (such as Docker run, Compose, or Kubernetes manifests) to customize how the container joins and operates within your tailnet.

## TS\_ACCEPT\_DNS

Accept [DNS configuration][docs-dns] from the Tailscale admin console. Defaults to not accepted. Enable this if you want your container to use [MagicDNS][docs-magicdns] and custom DNS settings from your tailnet. Without this, the container uses Docker's default DNS configuration.

## TS\_AUDIENCE

The audience to use when requesting an ID token from a well-known identity provider for workload identity federation. Use this parameter in environments that support automatic ID token generation, such as GitHub Actions, Google Cloud, or AWS. You must use this with `TS_CLIENT_ID`.
You cannot use this parameter with `TS_CLIENT_SECRET` or `TS_ID_TOKEN`.

## TS\_AUTH\_ONCE

Controls login behavior. Set to false by default, which forces login every time the container starts. Set `TS_AUTH_ONCE=true` to log in only if the container isn't already authenticated. Use this when you're persisting state and don't want unnecessary re-authentication.

## TS\_AUTHKEY

Authenticates a container to your tailnet. Create an [authentication key][docs-auth-keys] in the Tailscale admin console, then paste it here. This is equivalent to what you would pass to [`tailscale login --auth-key=`][docs-cli-login]. You can also use an [OAuth client][docs-oauth-clients-register-new-nodes] secret here, but you must provide the associated tag using `TS_EXTRA_ARGS=--advertise-tags=tag:ci`.

An [ephemeral node][docs-ephemeral-nodes] is automatically removed from your tailnet shortly after it disconnects, which is useful for temporary containers or CI/CD environments.

To make a node ephemeral depends on the credential you use.

* If you use an [OAuth client secret][docs-oauth-clients-setup], the node is ephemeral by default. To register a non-ephemeral node, append `?ephemeral=false` to the secret.
* If you use an [auth key][docs-auth-key-generate], set the key's ephemeral property when you create the key in the admin console.

You cannot use this parameter with `TS_CLIENT_ID`, `TS_CLIENT_SECRET`, `TS_ID_TOKEN`, or `TS_AUDIENCE`.

## TS\_CLIENT\_ID

The OAuth client ID for authentication. You can use it alone (for example, when an ID token auto-generates in well-known environments like GitHub Actions), with `TS_CLIENT_SECRET` for OAuth authentication, with `TS_ID_TOKEN` for [workload identity federation][docs-workload-identity-federation], or with `TS_AUDIENCE` for automatic ID token generation in supported environments.

If the value begins with `file:`, Tailscale treats it as a path to a file containing the client ID.

## TS\_CLIENT\_SECRET

The OAuth client secret for generating auth keys. You must use this with `TS_CLIENT_ID` for OAuth authentication. If the value begins with `file:`, Tailscale treats it as a path to a file containing the secret. This is more secure than embedding secrets directly in your setup. You cannot use this parameter with `TS_ID_TOKEN` or `TS_AUDIENCE`.

## TS\_DEST\_IP

Proxies all incoming Tailscale traffic to the specified destination IP.
Use this when you want all traffic that reaches your Tailscale container to forward to a specific service. For example, `TS_DEST_IP=100.0.0.5` sends all traffic to that IP address.

## TS\_ENABLE\_HEALTH\_CHECK

> **Note:**
>
> This functionality is available in Tailscale 1.78 and later.

Set to true to enable an unauthenticated `/healthz` endpoint at the address you specify with `TS_LOCAL_ADDR_PORT`. The health check returns `200 OK` if the node has at least one tailnet IP address. Otherwise it returns `503`. Use this for container orchestration health checks.

## TS\_ENABLE\_METRICS

> **Note:**
>
> This functionality is available in Tailscale 1.78 and later.

Set to true to enable an unauthenticated `/metrics` endpoint at the address you specify with `TS_LOCAL_ADDR_PORT`. Refer to [client metrics][docs-client-metrics] for more information about the available metrics. This is useful for monitoring your Tailscale container's performance and connection status.

## TS\_HEALTHCHECK\_ADDR\_PORT

> **Note:**
>
> This functionality is deprecated in Tailscale 1.78 and later. Use `TS_ENABLE_HEALTH_CHECK` instead.

## TS\_HOSTNAME

Sets a custom hostname for your container in the tailnet. Without this, Docker generates a random hostname. This is equivalent to [`tailscale set --hostname=`][docs-cli-set]. For example, `TS_HOSTNAME=my-dev-database` makes your container accessible at my-dev-database in your tailnet.

## TS\_ID\_TOKEN

The ID token from the identity provider for [workload identity federation][docs-workload-identity-federation]. You must use this with `TS_CLIENT_ID`. If the value begins with `file:`, Tailscale treats it as a path to a file containing the token.

You cannot use this parameter with `TS_CLIENT_SECRET` or `TS_AUDIENCE`.

## TS\_KUBE\_SECRET

If you're running in Kubernetes, this is the Kubernetes name where Tailscale stores state. Defaults to `tailscale`. If you don't set `TS_AUTHKEY`, and `TS_KUBE_SECRET` contains a secret with an auth key field, Tailscale uses that key as the auth key.

## TS\_LOCAL\_ADDR\_PORT

> **Note:**
>
> This functionality is available in Tailscale 1.78 and later.

Specifies the `[<addr>]:<port>` where Tailscale serves local metrics and health check HTTP endpoints if you enable them through `TS_ENABLE_METRICS` or `TS_ENABLE_HEALTH_CHECK`. Defaults to `[::]:9002` on all available interfaces.

## TS\_OUTBOUND\_HTTP\_PROXY\_LISTEN

Sets an address and port for the [HTTP proxy][docs-userspace-networking-socks5-vs-http]. Tailscale passes this to `tailscaled --outbound-http-proxy-listen=`. For example, `TS_OUTBOUND_HTTP_PROXY_LISTEN=:8080` creates an HTTP proxy on port `8080`, which is equivalent to `tailscaled --outbound-http-proxy-listen=:8080`.

## TS\_ROUTES

Advertises [subnet routes][docs-subnets] so other devices in your tailnet can reach networks accessible from this container. This is equivalent to [`tailscale set --advertise-routes=`][docs-cli-set]. For example, `TS_ROUTES=192.168.1.0/24` lets other tailnet devices access your local network through this container.

To accept routes advertised by other nodes, use `TS_EXTRA_ARGS` to pass in `--accept-routes`.

## TS\_SERVE\_CONFIG

Accepts a JSON file to programmatically configure [Tailscale Serve][docs-tailscale-serve] and [Tailscale Funnel][docs-tailscale-funnel] functionality. Use [`tailscale serve status --json`][docs-tailscale-serve] to export your current configuration in the correct format. If you bind mount this file using a Docker volume, you must mount it as a directory (not an individual file) for Tailscale to correctly detect configuration updates.

## TS\_SOCKET

The Unix socket path where the tailscaled LocalAPI socket lives. Defaults to `/var/run/tailscale/tailscaled.sock`. This is equivalent to `tailscaled tailscale --socket=`. You typically don't need to change this unless you have specific socket path requirements.

## TS\_SOCKS5\_SERVER

Sets an address and port for the [SOCKS5 proxy][docs-userspace-networking-socks5-vs-http]. Tailscale passes this to `tailscaled --socks5-server=`. For example, `TS_SOCKS5_SERVER=:1055` creates a SOCKS5 proxy on port `1055`, which is equivalent to `tailscaled --socks5-server=:1055`.

## TS\_STATE\_DIR

Specifies where `tailscaled` stores its state. The `TS_STATE_DIR` volume ensures the container keeps its identity across restarts. Without it, each restart creates a new node in the admin console. This directory must persist across container restarts or your container will appear as a new node each time. Tailscale passes this to `tailscaled --statedir=`. For example, `TS_STATE_DIR=/var/lib/tailscale` stores state in that directory, which you should mount as a volume.

When running on Kubernetes, Tailscale stores state by default in the Kubernetes secret with `name:tailscale`. To store state on local disk instead, set `TS_KUBE_SECRET=""` and `TS_STATE_DIR=/path/to/storage/dir`.

## TS\_TAILNET\_TARGET\_FQDN

Proxies all incoming non-Tailscale traffic to the specified tailnet FQDN. Functions like `TS_TAILNET_TARGET_IP` but resolves a MagicDNS name instead of using a static IP. Not compatible with `TS_USERSPACE` mode. Cannot be used together with `TS_TAILNET_TARGET_IP`.

## TS\_TAILNET\_TARGET\_IP

Proxies all incoming non-Tailscale traffic to the specified destination IP within the tailnet. This sets up the container as an egress proxy, forwarding traffic from outside the tailnet to a Tailscale IP. Not compatible with `TS_USERSPACE` mode. Cannot be used together with `TS_TAILNET_TARGET_FQDN`.

## TS\_USERSPACE

Controls whether to use [userspace networking][docs-userspace-networking-socks5-vs-http] instead of kernel networking. Enabled by default. This is equivalent to `tailscaled --tun=userspace-networking`.

Userspace networking works everywhere but has lower performance. Set `TS_USERSPACE=false` to use kernel networking for better speed, but you'll also need to add devices and `cap_add` sections to setup. Kernel networking provides better performance but requires `/dev/net/tun` and additional capabilities.

## Extra arguments

The parameters above cover common Tailscale configurations, but Tailscale supports many additional CLI flags. Use the extra arguments parameters below to pass any flags that don't have dedicated parameters. For example, if you want to advertise your container as an exit node or enable SSH, you can pass those flags through `TS_EXTRA_ARGS` since they don't have specific `TS_` parameters.

## TS\_EXTRA\_ARGS

Pass other Tailscale CLI flags you want to use with the [`tailscale up`][docs-cli-up] command. For example, `TS_EXTRA_ARGS=--advertise-exit-node --ssh`.

## TS\_TAILSCALED\_EXTRA\_ARGS

Pass other Tailscale CLI flags you want to use with the [`tailscaled`][docs-tailscaled-flags-to-tailscaled] command. For example, `TS_TAILSCALED_EXTRA_ARGS=--verbose=2`.

## Experimental parameters

> **Warning:**
>
> `TS_EXPERIMENTAL` parameters are subject to change and should not be considered as permanently supported.

## TS\_EXPERIMENTAL\_SERVICE\_AUTO\_ADVERTISEMENT

> **Note:**
>
> This functionality is available in Tailscale v1.96 and later.

For `containerboot` instances not running in Kubernetes, this parameter handles the automatic advertisement of any [Tailscale Services][docs-tailscale-services] defined in the Serve configuration on startup and un-advertises on shutdown.

Defaults to `true` but can be disabled to allow user-specific advertisement configuration.

> **Note:**
>
> This addresses a change in default behavior. Previously, service advertisement had to be enabled manually for each container and did not persist across restarts. This parameter can be used to restore previous behavior for scenarios that require it.
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

[docs-oauth-clients-register-new-nodes]: /docs/features/oauth-clients#register-new-nodes-using-oauth-credentials

[docs-oauth-clients-setup]: /docs/features/oauth-clients#setting-up-an-oauth-client

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-funnel]: /docs/reference/tailscale-cli/funnel

[docs-tailscale-serve]: /docs/reference/tailscale-cli/serve

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-tailscaled-flags-to-tailscaled]: /docs/reference/tailscaled#flags-to-tailscaled

[docs-userspace-networking-socks5-vs-http]: /docs/concepts/userspace-networking#socks5-vs-http

[docs-workload-identity-federation]: /docs/features/workload-identity-federation
