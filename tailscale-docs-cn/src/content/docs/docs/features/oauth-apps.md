---
title: "OAuth 应用"
description: "通过标准 OAuth 2.0 授权码流程构建能代表单个用户执行操作的内网工具，让每个操作都携带授权用户的身份。"
---

最后验证于 Jun 30, 2026

> **注意：** OAuth 应用目前处于 alpha 阶段。

OAuth 应用让内网工具通过标准 OAuth 2.0 授权码流程（[RFC 6749 section 4.1][xt-rfc-6749]）代表单个用户对 tailnet 执行操作。用户在 Tailscale 托管的授权确认页上完成确认，产生的授权会携带该用户的身份。访问控制规则、审计日志条目与配额都作用于授出确认的用户，而不是某个共享的服务身份。

每次 OAuth 授权流程都遵循相同的模式，因此下文各主题共用一套结构。[Owner（所有者）](/docs/reference/user-roles)或[管理员（Admin）](/docs/reference/user-roles)通过 [Tailscale API][docs-api] 创建 OAuth 应用，开发者则在其工具中实现授权码流程。

> **注意：**
>
> OAuth 应用与 [OAuth 客户端][docs-oauth-clients]是两种不同的机制。OAuth 客户端使用客户端凭证（client credentials）流程创建绑定到服务身份的、归属于标签的资源；OAuth 应用则使用授权码流程代表单个用户执行操作。如需所有 OAuth 相关文档的总览，请参阅 [OAuth 中心][docs-oauth-hub]。

## 要求

在创建 OAuth 应用之前，请确认你满足以下条件。

* 在 tailnet 中拥有 [Owner（所有者）](/docs/reference/user-roles)或[管理员（Admin）](/docs/reference/user-roles)角色。
* 拥有带 admin 作用域的 API 访问令牌，用于通过 API 创建 OAuth 应用。
* OAuth 应用与每个通过它授权的用户必须属于同一个 tailnet。此流程不支持来自其他 tailnet 的用户。
* 对实现该流程的开发者而言：需要具备 OAuth 2.0 授权码授予的工作知识，并能够处理 HTTP 重定向与令牌交换。

## 指南

以下指南介绍使用 OAuth 应用可以完成的具体任务。

[**使用 OAuth 应用进行设备预配**](/docs/features/oauth-apps/device-provisioning) —— 通过标准 OAuth 授权码流程构建代表单个用户预配 tailnet 设备的内网工具，让每台设备都携带授权用户的身份。

## 限制

* 授权仅限于单个 tailnet。只有与 OAuth 应用位于同一 tailnet 的用户才能通过它授权。
* Tailscale 托管的授权确认页无法自定义。

[docs-api]: /docs/reference/tailscale-api

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-oauth-hub]: /docs/oauth

[xt-rfc-6749]: https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1
