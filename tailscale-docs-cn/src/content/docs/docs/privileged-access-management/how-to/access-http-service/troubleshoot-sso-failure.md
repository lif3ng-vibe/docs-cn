---
title: "排查 HTTP 服务的 SSO 登录失败"
description: "当你通过 Tailscale PAM 的 [HTTP 服务][docs-pam-http-service]访问应用时，服务的公开主机名可能与你直接访问应用所用的主机名不同。这可能导致单点登录（SSO）失败。"
---

最后验证于 Sep 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

当你通过 Tailscale PAM 的 [HTTP 服务][docs-pam-http-service]访问应用时，该服务的公开主机名可能与你直接访问应用所用的主机名不同。这可能导致单点登录（SSO）失败。

应用在把你引导到其身份提供方时会使用 Tailscale PAM 服务的主机名。这是预期行为。你登录之后，浏览器需要经由 Tailscale PAM 返回到应用，而不是直接连接源站。

身份提供方只会把用户送回已被批准用于该应用的 URL。在 OpenID Connect（OIDC）中，这个 URL 称为重定向 URI（redirect URI）；在安全断言标记语言（SAML）中，这个 URL 称为断言消费服务（ACS）URL。

例如，一个应用通常可能使用：

`https://app.example.com/oauth/callback`

而通过 Tailscale PAM 访问时，可能改用：

`https://my-app.border0.io/oauth/callback`

如果使用 Tailscale PAM 服务主机名的 URL 没有被添加到应用的身份提供方配置中，登录可能失败。

要解决这个问题，请把使用 Tailscale PAM HTTP 服务主机名的确切 URL 添加到身份提供方中该应用的配置里：

* 对于 OIDC，把它添加为允许的登录重定向 URI。
* 对于 SAML，把它添加为 ACS URL。

如果用户仍会直接访问该应用，请同时保留原始 URL。

* 对于 OIDC，你可以打开浏览器的开发者工具，找到发往身份提供方的请求，确认这是否就是问题所在。查看 `redirect\_uri` 参数，并与为该应用配置的允许重定向 URI 进行比较。
* 对于 SAML，把应用的 ACS URL 与身份提供方中配置的 ACS URL 进行比较。

确保完整 URL 匹配，包括协议、主机名、端口（如果使用）和路径。

[docs-pam-http-service]: /docs/privileged-access-management/how-to/access-http-service
