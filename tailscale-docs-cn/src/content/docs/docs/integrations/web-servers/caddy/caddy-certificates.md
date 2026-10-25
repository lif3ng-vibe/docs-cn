---
title: "Tailscale 上的 Caddy 证书"
description: "[Caddy][xt-caddyserve] 是一个让 HTTPS 变得简单的 Web 服务器。从 [Caddy 2.5][xt-gh-caddyserver-beta] beta 版开始，Caddy 支持 Tailscale。当 Caddy 收到针对 `* 的 HTTPS 请求时"
---

最后验证于 Jan 5, 2026

[Caddy][xt-caddyserve] 是一个让 HTTPS 变得简单的 Web 服务器。从 [Caddy 2.5][xt-gh-caddyserver-beta] beta 版开始，Caddy 支持 Tailscale。当 Caddy 收到针对 `*.ts.net`
站点的 HTTPS 请求时，它会从机器本地的 Tailscale 守护进程获取 HTTPS 证书。证书
无需任何配置。例如，你可以用一个 [Caddyfile][xt-caddyserve-caddyfile-patterns] 运行
静态文件服务器，HTTPS 会自动启用：

```
machine-name.domain-alias.ts.net

root * /var/www
file_server
```

## 允许非 root 用户获取证书

如果 Caddy 以非 root 用户身份运行（例如在 Debian 上以 `caddy` 用户运行），你需要
修改 `/etc/default/tailscaled`，授予该用户获取证书的权限。
在 `/etc/default/tailscaled` 中，将 `TS_PERMIT_CERT_UID` 环境变量设置为该非 root 用户的名称或 ID：

```
TS_PERMIT_CERT_UID=caddy
```

有关 Caddy 的更多信息，请参阅 [Get started with Caddy][xt-caddyserve-get-started]。

[xt-caddyserve-caddyfile-patterns]: https://caddyserver.com/docs/caddyfile/patterns

[xt-caddyserve-get-started]: https://caddyserver.com/docs/getting-started

[xt-caddyserve]: https://caddyserver.com

[xt-gh-caddyserver-beta]: https://github.com/caddyserver/caddy/releases/tag/v2.5.0-beta.1
