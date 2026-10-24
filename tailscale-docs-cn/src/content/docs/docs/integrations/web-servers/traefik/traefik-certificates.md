---
title: "Traefik certificates on Tailscale"
description: "[Traefik][xt-traefik] simplifies networking complexity while designing, deploying, and operating applications. Starting with the release of [Traefik Proxy 3.0 Beta 1][xt-gh-traefik-changelog], Traefik"
---

Last validated Jan 5, 2026

[Traefik][xt-traefik] simplifies networking complexity while designing, deploying, and operating applications. Starting with
the release of [Traefik Proxy 3.0 Beta 1][xt-gh-traefik-changelog], Traefik Proxy supports Tailscale. When Traefik gets
an HTTPS request for a `*.ts.net` site, it gets the HTTPS certificate from the machine's local Tailscale daemon.

No configuration is required for the certificate.

For example, you can define a certificate resolver in the [install configuration][xt-traefik-static-config] (formerly known as the static configuration), and it automatically enables HTTPS:

#### YAML

```yaml
certificatesResolvers:
    myresolver:
        tailscale: {}
```

#### TOML

```toml
[certificatesResolvers.myresolver.tailscale]
```

#### CLI

```shell
--certificatesresolvers.myresolver.tailscale=true
```

Then, for each router or entrypoint where you want to use it, explicitly reference the
resolver in the [routing configuration][xt-traefik-dynamic-config] (formerly known as the dynamic configuration):

#### YAML

```yaml
http:
  routers:
    routertailscale:
      service: "myservice"
      rule: "Host(`example.foo.ts.net`) && Path(`/tailscale`)"
      tls:
        certResolver: myresolver

  services:
    myservice:
      loadBalancer:
        servers:
         - url: "http://localhost:6060"
```

#### TOML

```toml
[http]
  [http.routers]
    [http.routers.routertailscale]
      service = "myservice"
      rule = "Host(`example.foo.ts.net`) && Path(`/tailscale`)"
      [http.routers.routertailscale.tls]
        certResolver = "myresolver"

  [http.services]
    [http.services.myservice.loadBalancer]
      [[http.services.myservice.loadBalancer.servers]]
         url = "http://localhost:6060"
```

For complete details, refer to the [Traefik Tailscale documentation][xt-traefik-tailscale] at Traefik's web site.

For more information about Traefik, refer to [What is Traefik?][xt-traefik-quick-start].

[xt-gh-traefik-changelog]: https://github.com/traefik/traefik/blob/master/CHANGELOG.md#v300-beta1-2022-12-05

[xt-traefik-dynamic-config]: https://doc.traefik.io/traefik/getting-started/configuration-overview/#the-routing-configuration

[xt-traefik-quick-start]: https://doc.traefik.io/traefik/

[xt-traefik-static-config]: https://doc.traefik.io/traefik/getting-started/configuration-overview/#the-install-configuration

[xt-traefik-tailscale]: https://doc.traefik.io/traefik/master/reference/install-configuration/tls/certificate-resolvers/tailscale/

[xt-traefik]: https://doc.traefik.io
