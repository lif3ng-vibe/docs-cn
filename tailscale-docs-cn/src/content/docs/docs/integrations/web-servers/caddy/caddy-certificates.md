---
title: "Caddy certificates on Tailscale"
description: "[Caddy][xt-caddyserve] is a web server that makes HTTPS easy. Starting with the beta release of [Caddy 2.5][xt-gh-caddyserver-beta], Caddy supports Tailscale. When Caddy gets an HTTPS request for a `*"
---

Last validated Jan 5, 2026

[Caddy][xt-caddyserve] is a web server that makes HTTPS easy. Starting with the beta release of
[Caddy 2.5][xt-gh-caddyserver-beta], Caddy supports Tailscale. When Caddy gets an HTTPS request for a `*.ts.net`
site, it gets the HTTPS certificate from the machine's local Tailscale daemon. There's no
configuration required for the certificate. For example, you can use a [Caddyfile][xt-caddyserve-caddyfile-patterns] for a
static file server, and it automatically enables HTTPS:

```
machine-name.domain-alias.ts.net

root * /var/www
file_server
```

## Provide non-root users with access to fetch certificate

If Caddy is running as a non-root user, such as when it runs on Debian as `caddy`, you need to
modify `/etc/default/tailscaled` to grant the user access to fetch the certificate.
In `/etc/default/tailscaled`, set the `TS_PERMIT_CERT_UID` environment variable to the name or ID
of the non-root user:

```
TS_PERMIT_CERT_UID=caddy
```

For more information about Caddy, refer to [Get started with Caddy][xt-caddyserve-get-started].

[xt-caddyserve-caddyfile-patterns]: https://caddyserver.com/docs/caddyfile/patterns

[xt-caddyserve-get-started]: https://caddyserver.com/docs/getting-started

[xt-caddyserve]: https://caddyserver.com

[xt-gh-caddyserver-beta]: https://github.com/caddyserver/caddy/releases/tag/v2.5.0-beta.1
