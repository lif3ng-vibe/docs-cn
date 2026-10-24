---
title: "What is 100.100.100.100?"
description: "Find out what 100.100.100.100 (also known as Quad100) is."
---

Last validated Jan 12, 2026

`100.100.100.100` or Quad100 is a special [Tailscale IP address][docs-100.x-addresses] in your Tailscale network (known as a tailnet) that provides essential local services. It operates similarly to the localhost address (`127.0.0.1`) but serves only Tailscale-specific services and has network-aware functionality. These services include a [DNS resolver][ar-dns-resolver] and a [device management interface][ar-device-management-interface].

Quad100 operates as a device-local service, meaning local traffic connecting to `100.100.100.100` doesn't leave your device unless it's necessary to provide a service, such as when forwarding DNS requests. Other devices cannot access your device using `100.100.100.100`, and Tailscale has no visibility over its contents.

> **Note:**
>
> Quad100 also has the IPv6 address `fd7a:115c:a1e0::53`. Quad100 is one of Tailscale's [reserved IP addresses][docs-reserved-ip-addresses].

## DNS resolver

One of the services provided by Quad100 is a DNS resolver running on port `53` (`100.100.100.100:53`). A DNS resolver is a service that translates IP addresses to hostnames like `google.com` or `macbook.tailnetname.ts.net`. Quad100 is a [stub resolver][xt-rfc-1123-stub-resolver], similar to [`systemd-resolved`][xt-systemd-resolved], except with extra features.

The Quad100 DNS resolver resolves hostnames in your tailnet locally using [MagicDNS][docs-magicdns] and forwards DNS requests to exit nodes (when configured). It also provides [DNS-over-HTTPS (DoH)][xt-doh] encryption when available and implements settings like [overriding DNS servers][docs-override-dns-servers] and [split DNS (for Android)][docs-android-split-dns].

> **Note:**
>
> While Quad100's DNS resolver operates locally without logging, forwarded requests might be logged by configured [nameservers][docs-nameservers].

## Device management interface

Quad100 provides a [device management interface][docs-device-web-interface] on port `80`. The interface lets you configure settings for the local device from a web browser. These include device-specific settings, [exit node][docs-exit-nodes] settings, [Tailscale SSH][docs-tailscale-ssh] settings, and [subnet routes][docs-subnets].

You can access the interface at `http://100.100.100.100` locally, even if your device doesn't have a [native Tailscale client][docs-installation].

> **Note:**
>
> For Tailscale v1.64.0 and later, the device management interface is enabled by default. For earlier versions, you can [enable it manually][docs-device-web-interface-start].

[ar-device-management-interface]: #device-management-interface

[ar-dns-resolver]: #dns-resolver

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-android-split-dns]: /docs/features/client/android-app-split-tunneling

[docs-device-web-interface-start]: /docs/features/client/device-web-interface#expose-the-web-interface-on-a-device

[docs-device-web-interface]: /docs/features/client/device-web-interface

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-installation]: /docs/install

[docs-magicdns]: /docs/features/magicdns

[docs-nameservers]: /docs/reference/dns-in-tailscale#nameservers

[docs-override-dns-servers]: /docs/reference/dns-in-tailscale#override-dns-servers

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[xt-doh]: https://en.wikipedia.org/wiki/DNS_over_HTTPS

[xt-rfc-1123-stub-resolver]: https://www.rfc-editor.org/rfc/rfc1123.html#page-74

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses

[xt-systemd-resolved]: https://wiki.archlinux.org/title/Systemd-resolved
