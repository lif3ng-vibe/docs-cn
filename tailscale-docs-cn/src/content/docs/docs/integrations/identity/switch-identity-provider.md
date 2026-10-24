---
title: "Switch identity provider"
description: "You can use the Tailscale admin console to switch the identity provider (IdP) for the following IdPs:"
---

Last validated Oct 14, 2026

You can use the Tailscale admin console to switch the identity provider (IdP) for the following IdPs:

* [Google Workspace (G Suite)][docs-sso-google]
* [Microsoft][docs-sso-microsoft], including Microsoft Accounts, Office 365, Active Directory, and Microsoft Entra ID when a custom domain is used.
* [Okta][docs-sso-okta]
* [OneLogin][docs-sso-onelogin]
* [OpenID Connect][docs-custom-oidc] (OIDC)

For other identity providers, contact [Tailscale Support][co-contact-support-sso] when you need to switch to a different IdP.

## Switch to a different identity provider

You need to be an [Owner](/docs/reference/user-roles) to switch the identity provider for your tailnet.

To switch to another IdP:

1. Open the [User management](https://console.tailscale.com/admin/settings/user-management) page of the Tailscale admin console.

2. Under the **Identity Provider** section, select the  menu and then select **Switch identity provider**.

3. Select the IdP that you want to use for your tailnet.

4. Authenticate to the new IdP. This step varies depending on which IdP you selected.

   #### Google

   1. Under the **Authenticate** section, select **Sign in to Google**.
   2. Log in with the email you use for Tailscale.

   #### Microsoft

   1. Under the **Authenticate** section, select **Sign in to Microsoft**.
   2. Log in with the email you use for Tailscale.

   > **Note:**
   >
   > If you are using a Microsoft 365 Government Community Cloud (GCC) High account, contact [Tailscale Support][co-contact-support-sso] to change your identity provider.

   #### Okta or OneLogin

   1. Under the **Authenticate** section, enter values for the following:

      * SSO issuer
      * Client ID
      * Client secret

      You can retrieve this information from your identity provider.

   2. Select **Authenticate**.

   #### OIDC

   1. Under the **Authenticate** section, enter values for the following:

      * Client ID
      * Client secret

      The [WebFinger][docs-webfinger] URL is pre-filled and must be available at the displayed URL. You can retrieve the Client ID and Client secret information from your identity provider.

   2. (Optional) Configure custom OIDC prompts for this provider.

   3. Select **Authenticate**.

5. Select **Switch identity provider**.

Your chosen identity provider is now ready to use.

## Limitations

* You cannot change the tailnet's primary domain name while changing the IdP unless you contact [Tailscale Support][co-contact-support-sso]. For example, you cannot change your IdP from Entra ID, using `example.com` as the primary domain, to Okta using `example.org` as the primary domain.
* If you are using a shared domain tailnet, such as those created with a Gmail addresses, you cannot switch your IdP unless you contact [Tailscale Support][co-contact-support-sso].

[co-contact-support-sso]: https://tailscale.com/contact/support/?type=sso

[docs-custom-oidc]: /docs/integrations/identity/custom-oidc

[docs-sso-google]: /docs/integrations/identity/google-sso

[docs-sso-microsoft]: /docs/integrations/identity/entra

[docs-sso-okta]: /docs/integrations/identity/okta

[docs-sso-onelogin]: /docs/integrations/identity/onelogin

[docs-webfinger]: /docs/integrations/identity/custom-oidc#webfinger-setup
