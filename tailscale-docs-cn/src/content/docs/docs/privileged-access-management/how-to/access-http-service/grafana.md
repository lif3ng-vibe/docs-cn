---
title: "在 Grafana HTTP 服务中使用 Tailscale 身份"
description: "Grafana 是能够使用 [Tailscale PAM][docs-pam] [身份头][docs-pam-identity-headers]的应用示例之一。它内置的 `auth.proxy` 身份提供方可让 Grafana 信任身份信息"
---

最后验证于 Aug 18, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

Grafana 是能够使用 [Tailscale PAM][docs-pam] [身份头][docs-pam-identity-headers]的应用示例之一。它内置的 `auth.proxy` 身份提供方可让 Grafana 信任由认证反向代理提供的身份信息。

例如，你可以配置 Grafana 使用 `X-Auth-Email` 作为用户身份：

```ini
[session]
cookie_secure = true

[users]
allow_sign_up = false
auto_assign_org = true
auto_assign_org_role = Viewer

[auth]
disable_login_form = true
disable_signout_menu = true

[auth.anonymous]
enabled = false

[auth.basic]
enabled = false

[auth.proxy]
enabled = true
header_name = X-Auth-Email
header_property = username
auto_sign_up = true
headers = Email:X-Auth-Email
```

此配置告诉 Grafana 接受 Tailscale PAM 传递过来的已认证电子邮件地址，并自动让用户登录。

该示例为新创建的用户分配 `Viewer` 角色。请根据你的环境中用户应拥有的访问权限，调整 Grafana 的角色和授权设置。

关于以密码学方式验证 Tailscale PAM 身份头的信息，参见[验证身份头][docs-pam-verify-identity-headers]。

## 用 Docker 试一试

如果你想亲自尝试，把上面的配置保存为当前目录下的 `grafana.ini`。

然后用 Docker 启动 Grafana：

```shell
docker run -i \
  -v "$(pwd)/grafana.ini:/etc/grafana/grafana.ini" \
  -p 3000:3000 \
  grafana/grafana
```

现在 Grafana 将在端口 `3000` 上可用。

接下来，创建一个 [HTTP PAM 服务][docs-pam-access-http-service]，并把它指向该 Grafana 实例。如果 Grafana 与你的 PAM 连接器运行在同一台机器上，使用：

```shell
http://localhost:3000
```

如果 Grafana 运行在其他地方，请使用 PAM 连接器能访问到的主机名或 IP 地址。

用户打开该 PAM 服务时，会使用其 [Tailscale 身份信息][docs-tailscale-identity]认证。Tailscale PAM 通过 `X-Auth-*` 头把已认证的身份传给 Grafana，Grafana 使用 `X-Auth-Email` 自动让用户登录。

[docs-pam-access-http-service]: /docs/privileged-access-management/how-to/access-http-service

[docs-pam-identity-headers]: /docs/privileged-access-management/how-to/access-http-service#pass-tailscale-identity-to-your-web-application

[docs-pam-verify-identity-headers]: /docs/privileged-access-management/how-to/access-http-service#verify-identity-headers

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
