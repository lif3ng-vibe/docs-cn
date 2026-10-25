---
title: "启用双因素与多因素认证"
description: "从你的身份提供方启用 MFA。"
---

最后验证于 Jun 18, 2024

Tailscale 依靠你现有的[身份提供方（IdP）][docs-sso-providers]来认证用户。身份提供方中的任何认证设置（包括 MFA）都会被 Tailscale *自动采用*。

要为你的域名启用 MFA，请直接在身份提供方中进行设置。

## Apple

Apple 提供了为 Apple ID 启用多因素认证的文档。更多信息请参考 Apple 支持主题 [Two-factor authentication for Apple ID][xt-apple-docs-appleid-mfa]。

## Google

Google 提供了为 Gmail 和 Google Workspace（G Suite）启用多因素认证的文档。更多信息请参考 Google 帮助中心主题 [Deploy 2-Step Verification][xt-google-2-step-verification]。

## Microsoft

Microsoft 提供的文档介绍了如何为 Office365、Active Directory 和 Azure Active Directory 的整个域或单个用户启用 MFA。更多信息请参考 Microsoft 文档主题 [Multifactor authentication for Microsoft 365][xt-microsoft-mfa]。

## Okta

Okta 提供的文档介绍了管理员如何通过设置多因素策略，为整个组织或仅为 Tailscale 配置 MFA。更多信息请参考 Okta 文档主题 [Multifactor Authentication][xt-okta-docs-mfa]。

## OneLogin

OneLogin 提供的文档介绍了用户如何通过创建新的认证因素、将其分配给安全策略、再将该策略分配给用户，来为域启用 MFA。更多信息请参考 OneLogin 文档主题 [Use MFA for extra security][xt-onelogin-add-mfa]。

[docs-sso-providers]: /docs/integrations/identity

[xt-apple-docs-appleid-mfa]: https://support.apple.com/HT204915

[xt-google-2-step-verification]: https://support.google.com/a/answer/9176657

[xt-microsoft-mfa]: https://docs.microsoft.com/en-us/microsoft-365/admin/security-and-compliance/multi-factor-authentication-microsoft-365

[xt-okta-docs-mfa]: https://help.okta.com/en-us/Content/Topics/Security/mfa/mfa-home.htm

[xt-onelogin-add-mfa]: https://www.onelogin.com/getting-started/free-trial-plan/add-mfa
