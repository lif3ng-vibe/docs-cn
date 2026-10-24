---
title: "Enable two-factor and multifactor authentication"
description: "Enable MFA from your identity provider."
---

Last validated Jun 18, 2024

Tailscale relies on your existing [identity provider][docs-sso-providers] to authenticate users. Any authentication settings from your identity provider are *automatically used* by Tailscale, including MFA.

To enable MFA for your domain, set it up from your identity provider.

## Apple

Apple provides documentation on how to enable multifactor authentication for Apple
ID. Refer to the Apple Support topic [Two-factor authentication for Apple ID][xt-apple-docs-appleid-mfa]
for more information.

## Google

Google provides documentation on how to enable multifactor authentication for Gmail and Google Workspace (G Suite). Refer to the Google Help Center topic [Deploy 2-Step Verification][xt-google-2-step-verification] for more information.

## Microsoft

Microsoft provides documentation that describes how to enable MFA for your whole domain or for individual users for Office365, Active Directory, and Azure Active Directory. Refer to the Microsoft documentation topic [Multifactor authentication for Microsoft 365][xt-microsoft-mfa] for more information.

## Okta

Okta provides documentation that describes how administrators can configure MFA for their entire organization or only for
Tailscale by setting a multifactor policy. Refer to the Okta documentation topic [Multifactor Authentication][xt-okta-docs-mfa] for more information.

## OneLogin

OneLogin provides documentation that describes how users can enable MFA for the domain by creating a new authentication
factor, assigning it to a security policy, and assigning that policy to their users. Refer to the OneLogin documentation topic [Use MFA for extra security][xt-onelogin-add-mfa] for more information.

[docs-sso-providers]: /docs/integrations/identity

[xt-apple-docs-appleid-mfa]: https://support.apple.com/HT204915

[xt-google-2-step-verification]: https://support.google.com/a/answer/9176657

[xt-microsoft-mfa]: https://docs.microsoft.com/en-us/microsoft-365/admin/security-and-compliance/multi-factor-authentication-microsoft-365

[xt-okta-docs-mfa]: https://help.okta.com/en-us/Content/Topics/Security/mfa/mfa-home.htm

[xt-onelogin-add-mfa]: https://www.onelogin.com/getting-started/free-trial-plan/add-mfa
