---
title: "自定义 OIDC 提供方"
description: "Tailscale 可以与支持 OpenID Connect（OIDC）的身份提供方集成。本主题提供的步骤仅在首次创建 tailnet 时需要。注册流程完成后，Tailscale 的工作方式将与其他受支持的身份提供方相同。"
---

最后验证于 Dec 10, 2025

Tailscale 可以与支持 OpenID Connect（OIDC）的身份提供方集成。本主题提供的步骤仅在首次创建 tailnet 时需要。注册流程完成后，Tailscale 的工作方式将与其他受支持的身份提供方相同。关于 OIDC 的更多信息，参见 [Welcome to OpenID Connect][xt-openid-connect]。

## 要求

* 使用 WebFinger 证明域名所有权并进行 OIDC 发现。
* 一个基于 OIDC、具有 SSO 能力的身份提供方，使用 `openid`、`profile` 和 `email` 作用域，并提供回调 URL。
* OIDC 提供方必须使用 ES256 或 RSA 签名；RSA 密钥最小长度为 2048 位。

## WebFinger 设置

要在 Tailscale 中使用自定义 OIDC 提供方，你必须在自己的域名上设置一个 WebFinger 端点。WebFinger 用于验证你对某个域名拥有管理控制权，并用于发现 issuer URL。关于将 WebFinger 用于 OIDC issuer 发现的更详细信息，参见 [RFC 7033][xt-rfc-7033-3.1]。

WebFinger 端点必须部署在 `https://${domain}/.well-known/webfinger`，并且必须在响应的 JRD 中包含 issuer URL。例如：

```json
{
  "subject": "acct:${email}",
  "links": [
    {
      "rel": "http://openid.net/specs/connect/1.0/issuer",
      "href": "${issuer URL}"
    }
  ]
}
```

WebFinger 端点必须托管在设置时所提供电子邮件地址的域名下。你在 JRD 中指定的 issuer URL 必须与 `/.well-known/openid-configuration` 中的 issuer URL 完全一致。更多信息参见 RFC 7033：WebFinger 规范中的 [Identity Provider Discovery for OpenID Connect][xt-rfc-7033-3.1] 一节。

验证你的 WebFinger 端点的方法：

1. 在浏览器中打开 [WebFinger Lookup 工具][xt-webfinger-lookup]。
2. 在 **Lookup WebFinger** 搜索框中，输入用户的电子邮件地址。
3. 选择搜索图标。
4. 检查结果，判断你的端点是否有效。

> **注意：**
>
> Tailscale *只*在初始设置期间使用你 WebFinger 端点中的 issuer 值。开始使用自定义 OIDC 提供方后，若要改用新的 issuer，请更新 WebFinger 端点中的 issuer，然后[更换你的身份提供方][docs-switch-idp]。

## 身份提供方设置

用于自定义 OIDC 配置的身份提供方必须符合 OIDC 规范以及 Tailscale 的要求。

**Tailscale** 要求你提供以下内容：

* 从 WebFinger 端点获取的 issuer URL，见[上一节][ar-webfinger-setup]的说明。
* Client ID。
* 来自你的身份提供方的 client secret。

**作用域**（scope）指定认证请求中需要包含的信息。必需的作用域是 `openid`、`profile` 和 `email`。Tailscale 只请求运行所需的最小权限范围，关于我们如何使用你的数据，详见我们的[隐私政策][co-privacy-policy]。

**Prompts** 指定认证页面对用户的要求与行为。Prompts 是可选的，Tailscale 设置界面支持的值为 `none`、`consent`（默认值）、`login` 和 `select_account`。请注意，个别身份提供方或身份提供方配置可能不支持其中某个或全部值。更多信息参见 OIDC [Authentication Request][xt-openid-connect-authrequest] 规范。

**回调 URL** 必须在你的身份提供方设置中配置为以下 URL：

`https://login.tailscale.com/a/oauth_response`

### 其他提供方配置

特定身份提供方可能需要额外的配置：

| 身份提供方          | 所需的其他配置                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth0               | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Authelia            | 参见 Authelia 文档中 [Tailscale][xt-authelia-tailscale] 主题的说明。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Authentik           | 参见 Authentik 文档中[与 Tailscale 集成][xt-authentik-tailscale]主题的说明。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| AWS Cognito         | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Codeberg            | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Dex                 | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Duo                 | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| FoxIDs              | 参见 FoxIDs 文档中[使用 OpenID Connect 连接 Tailscale][xt-foxids-tailscale]主题的说明。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Gitea               | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| GitLab              | 注册或登录时，浏览器中必须存在有效的 GitLab 会话。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| GitLab 自托管        | 注册或登录时，浏览器中必须存在有效的 GitLab 会话。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| JumpCloud           | 将 `email` 和 `name` 的 Service Provider Attribute Name 映射到作为 JumpCloud Attribute Name 的 `email` 和 `fullname`，并将 Client Authentication Type 设置为 Client Secret Basic。                                                                                                                                                                                                                                                                                                                                                                                          |
| Keycloak            | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Ory Network         | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Ory 自托管           | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Ping Identity       | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Pocket ID           | 无。详情参见我们的 YouTube 视频 [Use a custom OIDC and passkeys to log in to Tailscale with Pocket ID][xt-yt-custom-oidc-pocketid]。                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ZITADEL Cloud       | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ZITADEL 开源版       | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Zoho                | 你必须设置 Server-based Applications 客户端类型。应用程序的 Issuer URL 必须与创建该应用程序时所在的数据中心区域匹配。例如，美国区应用程序必须使用 `https://accounts.zoho.com`，而加拿大区应用程序必须使用 `https://accounts.zohocloud.ca`。你的 Zoho 区域就是你访问 Zoho Dashboard 所用的域名。如果你有位于不同 Zoho 区域的用户，必须在应用程序的 **Settings** 标签页下勾选 **Use the same OAuth credentials for all data centers** 复选框。 |

## Tailscale 设置

1. 前往管理控制台的 [Sign up with OIDC](https://login.tailscale.com/start/oidc) 页面。

   或者，在[注册 Tailscale 账户](https://login.tailscale.com/start)时，选择 **Sign up with OIDC**。

   *（图：注册 Tailscale 时选择 OIDC）*

2. 在 **Email address** 字段中，输入管理员的完整电子邮件地址。该电子邮件地址的域名必须与部署 WebFinger 端点的域名一致，也必须与你在 Tailscale 中要使用的域名一致。

3. 选择 **Get OIDC Issuer**。如果 Tailscale 能够从你的 WebFinger 端点获取到 issuer，它会显示在 **Issuer** 字段中。

4. 在 **Client ID** 字段中，输入你的 OIDC 提供方为 Tailscale 生成的 ID。

5. 在 **Client secret** 字段中，输入你的 OIDC 提供方为 Tailscale 生成的 client secret。

6. （可选）在 **Prompts** 字段中，选择一个或多个用于用户认证流程的 prompt。注意你并非必须选择值。这些值定义在 OIDC [Authentication Request][xt-openid-connect-authrequest] 规范中。如果你选择了 `none`，就不能再选择任何其他 prompt。

7. 选择 **Sign up with OIDC**。你将被重定向到你的提供方进行认证。

8. 使用你在第 2 步输入的电子邮件登录你的提供方。认证通过后，你将被重定向回 Tailscale 管理控制台。

为 Tailscale 配置 OIDC 的用户会成为 [tailnet][docs-terminology-and-concepts-tailnet] 中的第一个用户，也是该 tailnet 的[所有者（Owner）](/docs/reference/user-roles)。

## 添加更多 tailnet 用户

来自同一域名的其他用户登录 Tailscale 时，只需输入自己的电子邮件，就会被重定向到已识别的身份提供方完成认证。

## 迁移现有 tailnet

如果你已有 tailnet，可以[更换你的身份提供方][docs-switch-idp]为自定义 OIDC 提供方。你必须已在自己的域名上正确配置 WebFinger 端点。

> **注意：**
>
> 我们只能将使用自定义域名的 Tailscale 账户迁移到自定义 OIDC 提供方。例如，`@yourcustomdomain.com` 可以迁移，而 `@gmail.com` 这类非自定义域名无法迁移。

## 注意事项

* 自托管的身份提供方必须能在互联网上公开访问。IP 封禁列表可能会影响注册或向你的 tailnet 进行认证。
* 自定义 OIDC 提供方配置不支持用户和群组的预配置（provisioning）。
* 从同一域名连接到 tailnet 的所有用户必须使用同一身份提供方。
* 用户登出 Tailscale 时，不会自动从其身份提供方登出。如果用户没有从身份提供方登出，那么重新连接 Tailscale 时将无需重新认证。
* `id_tokens` 不支持 JSON Web Encryption（JWE）访问令牌。

[ar-webfinger-setup]: #webfinger-设置

[co-privacy-policy]: https://tailscale.com/privacy-policy

[docs-switch-idp]: /docs/integrations/identity/switch-identity-provider

[docs-terminology-and-concepts-tailnet]: /docs/reference/glossary#tailnet

[xt-authelia-tailscale]: https://www.authelia.com/integration/openid-connect/tailscale/

[xt-authentik-tailscale]: https://integrations.goauthentik.io/networking/tailscale/

[xt-foxids-tailscale]: https://www.foxids.com/docs/app-reg-howto-oidc-tailscale

[xt-openid-connect-authrequest]: https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest

[xt-openid-connect]: https://openid.net/connect

[xt-rfc-7033-3.1]: https://www.rfc-editor.org/rfc/rfc7033.html#section-3.1

[xt-webfinger-lookup]: https://webfinger.net/lookup

[xt-yt-custom-oidc-pocketid]: https://youtu.be/sPUkAm7yDlU
