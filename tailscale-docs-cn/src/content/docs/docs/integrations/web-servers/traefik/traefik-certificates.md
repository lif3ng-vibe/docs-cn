---
title: "Tailscale 上的 Traefik 证书"
description: "[Traefik][xt-traefik] 在设计、部署和运维应用的过程中简化了网络的复杂性。自 [Traefik Proxy 3.0 Beta 1][xt-gh-traefik-changelog] 发布起，Traefik"
---

最后验证于 Jan 5, 2026

[Traefik][xt-traefik] 在设计、部署和运维应用的过程中简化了网络的复杂性。自
[Traefik Proxy 3.0 Beta 1][xt-gh-traefik-changelog] 发布起，Traefik Proxy 开始支持 Tailscale。当 Traefik 收到
针对 `*.ts.net` 站点的 HTTPS 请求时，它会从机器本地的 Tailscale 守护进程获取 HTTPS 证书。

证书无需任何配置。

例如，你可以在[安装配置][xt-traefik-static-config]（旧称静态配置）中定义一个证书解析器（certificate resolver），HTTPS 便会自动启用：

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

然后，在你想使用它的每个 router 或 entrypoint 上，在[路由配置][xt-traefik-dynamic-config]（旧称动态配置）中显式引用该解析器：

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

完整详情请参阅 Traefik 官网上的 [Traefik Tailscale 文档][xt-traefik-tailscale]。

有关 Traefik 的更多信息，请参阅[什么是 Traefik？][xt-traefik-quick-start]。

[xt-gh-traefik-changelog]: https://github.com/traefik/traefik/blob/master/CHANGELOG.md#v300-beta1-2022-12-05

[xt-traefik-dynamic-config]: https://doc.traefik.io/traefik/getting-started/configuration-overview/#the-routing-configuration

[xt-traefik-quick-start]: https://doc.traefik.io/traefik/

[xt-traefik-static-config]: https://doc.traefik.io/traefik/getting-started/configuration-overview/#the-install-configuration

[xt-traefik-tailscale]: https://doc.traefik.io/traefik/master/reference/install-configuration/tls/certificate-resolvers/tailscale/

[xt-traefik]: https://doc.traefik.io
