---
title: "Userspace networking mode (for containers)"
description: "Find out about userspace networking mode and when it is useful."
---

Last validated Nov 12, 2025

Userspace networking mode lets you run Tailscale where you don't have access to create a VPN tunnel device. This often happens in container environments.

Tailscale works on Linux systems using a device driver called `/dev/net/tun`, which lets you start the VPN tunnel as though it were any other network interface like Ethernet or Wi-Fi. This lets any Linux application—from a web browser to the `ping` CLI command—send its traffic through the Tailscale interface.

However, not all Linux systems support `/dev/net/tun`. For example, some container-based app platforms like [Heroku][docs-serverless-heroku] and [Google Cloud Run][docs-serverless-cloudrun] do not. For those environments, userspace networking mode offers a different way of running, where `tailscaled` functions as a SOCKS5 or HTTP proxy which other processes in the container can connect through.

*（图：A diagram of userspace networking in Tailscale.）*

> **Note:**
>
> Userspace networking mode with SOCKS5 is available in Tailscale v1.8 or later. The HTTP proxy is available in Tailscale v1.16 or later. [Update Tailscale][docs-update] to use these features.

## SOCKS5 vs. HTTP

The functionality and purpose of the SOCKS5 and HTTP proxies varies. The SOCKS5 proxy is a more general and flexible proxy that can work with any traffic. The HTTP proxy is only for that protocol, so it only proxies HTTP and HTTPS traffic, for example, to web pages.

## Start Tailscale in userspace networking mode

You can enable userspace networking from the [Tailscale CLI][docs-cli] by passing the `--tun=userspace-networking` flag to `tailscaled` before running `tailscale up`. You can also use a SOCKS5 proxy and an HTTP proxy on the same port (as shown in the following code block),

```shell
tailscaled --tun=userspace-networking --socks5-server=localhost:1055 --outbound-http-proxy-listen=localhost:1055 &
tailscale up --auth-key=<your-auth-key>
```

Userspace networking mode is primarily for [serverless environments][docs-serverless]. We recommend using it with [ephemeral nodes and auth keys][docs-ephemeral-nodes] (as shown above).

> **Note:**
>
> You can enable userspace networking mode on Ubuntu, RHEL, or any derivative by adding the flag `--tun=userspace-networking` to the `FLAGS` variable in `/etc/default/tailscaled`:
>
> ```
> FLAGS="--tun=userspace-networking"
> ```

> **Note:**
>
> The Tailscale Docker image supports a [`TS_USERSPACE`][docs-docker-ts-userspace] parameter that is equivalent to `tailscaled --tun=userspace-networking`.

## Configure your application to use SOCKS5 or HTTP

After Tailscale is authenticated, your application can connect using a SOCKS5 or HTTP proxy or both. Many widely used networking packages support these proxies already, generally by setting the `ALL_PROXY` and `HTTP_PROXY`environment variables. For many applications, you'll need a command like this:

```shell
ALL_PROXY=socks5://localhost:1055/ HTTP_PROXY=http://localhost:1055/ http_proxy=http://localhost:1055/ ./my-app
```

Some libraries use `http_proxy` instead of `HTTP_PROXY`. You might need to experiment to find the right setting for your application. For instructions on how to use Tailscale on specific serverless platforms, refer to the topics below:

* [Tailscale on Heroku][docs-serverless-heroku]
* [Tailscale on Google Cloud Run][docs-serverless-cloudrun]
* [Tailscale on GitHub Actions][bl-gh-actions-and-tailscale]

[bl-gh-actions-and-tailscale]: https://tailscale.com/blog/2021-05-github-actions-and-tailscale

[docs-cli]: /docs/reference/tailscale-cli

[docs-docker-ts-userspace]: /docs/features/containers/docker/docker-params#ts_userspace

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-serverless-cloudrun]: /docs/install/cloud/cloudrun

[docs-serverless-heroku]: /docs/install/cloud/heroku

[docs-serverless]: /docs/integration-serverless-apps

[docs-update]: /docs/features/client/update
