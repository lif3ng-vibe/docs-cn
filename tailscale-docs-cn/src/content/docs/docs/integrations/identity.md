---
title: "Supported SSO identity providers"
description: "Tailscale works on top of the IdP or SSO provider you already use. Leverage the capabilities of these providers for secure access, including passkeys, 2FA, and MFA."
---

Last validated Jan 5, 2026

Tailscale works on top of the identity provider (IdP) or single sign-on (SSO) provider that you already use.

## Set up an identity provider

When you activate your domain name with Tailscale for the first time, you must choose which identity provider you want to use.

You need to be an [Owner](/docs/reference/user-roles) of a tailnet to set up an identity provider.

### Supported native identity providers

Tailscale natively supports the following identity providers:

* [Apple][docs-sso-apple]
* [Google][docs-sso-google], including Gmail and Google Workspace (G Suite)
* [GitHub][docs-sso-github]
* [Microsoft][docs-sso-microsoft], including Microsoft Accounts, Office365, Active Directory, and Microsoft Entra ID
* [Okta][docs-sso-okta]
* [OneLogin][docs-sso-onelogin]

### Supported custom identity providers

In addition to the natively supported identity providers, Tailscale also lets you authenticate with [custom OpenID Connect (OIDC) providers][docs-sso-custom-oidc]. For the list of custom identity providers that Tailscale has successfully tested, refer to [Additional provider configurations][docs-sso-custom-oidc-additional-config].

### Support for passkeys

Tailscale supports the use of [passkey][docs-passkeys] authentication for any tailnet that you are authorized to join.

### Signing up with an email address

Tailscale does not support sign-up with email addresses. By design, Tailscale is not an identity provider—there are no Tailscale passwords.

Identity providers build robust infrastructure to handle identity and authentication, which are core and complex aspects of security. Tailscale delegates user authentication to identity providers because of their expertise, which lets Tailscale focus on areas like secure networking.

Using an identity provider is not only more secure than email and password, but it lets us automatically [rotate connection encryption keys][bl-rotate-ssh-keys], [follow security policies][docs-acls] set by your team such as multifactor authentication (MFA), and more.

For more information about why Tailscale is not an identity provider, refer to the [Tailscale doesn't want your password][bl-passkeys] and [SSO tax, cut][bl-sso-tax-cut] blog posts.

### Support for MFA

Tailscale supports two-factor and multifactor authentication.

Tailscale does not handle authentication itself. Instead, you can [enable MFA features][docs-multifactor-auth] in your single sign-on identity provider, and they will apply to all your apps, including Tailscale.

## Changing identity providers

For information about changing identity providers, refer to [Switch identity provider][docs-switch-idp].

> **Note:**
>
> Unfortunately, you cannot migrate your tailnet from/to GitHub or Apple as an identity provider.

## What Tailscale accesses from identity providers

Tailscale uses OpenID Connect (OIDC) for authentication.

Tailscale requests the minimum access needed to function. When authenticating to Tailscale, you must share information about users' emails and their name. Some providers also share a user photo; in this case, Tailscale stores the photo URL but not the photo itself.

Tailscale only uses your organization's team membership to ensure users can join the tailnet for their organization. With the GitHub identity provider, Tailscale requests the minimum set of permissions needed to get team membership, which includes access to your repositories and project boards. Tailscale does not use any content in your repositories or project boards.

Tailscale requests the minimum number scopes required to operate, and the information on how we use your data can be found in our [privacy policy][co-privacy-policy].

[bl-passkeys]: https://tailscale.com/blog/passkeys

[bl-rotate-ssh-keys]: https://tailscale.com/blog/rotate-ssh-keys

[bl-sso-tax-cut]: https://tailscale.com/blog/sso-tax-cut

[co-privacy-policy]: https://tailscale.com/privacy-policy

[docs-acls]: /docs/features/access-control/acls

[docs-multifactor-auth]: /docs/multifactor-auth

[docs-passkeys]: /docs/integrations/identity/passkeys

[docs-sso-apple]: /docs/integrations/identity/apple-sso

[docs-sso-custom-oidc-additional-config]: /docs/integrations/identity/custom-oidc#additional-provider-configurations

[docs-sso-custom-oidc]: /docs/integrations/identity/custom-oidc

[docs-sso-github]: /docs/integrations/identity/github

[docs-sso-google]: /docs/integrations/identity/google-sso

[docs-sso-microsoft]: /docs/integrations/identity/entra

[docs-sso-okta]: /docs/integrations/identity/okta

[docs-sso-onelogin]: /docs/integrations/identity/onelogin

[docs-switch-idp]: /docs/integrations/identity/switch-identity-provider
