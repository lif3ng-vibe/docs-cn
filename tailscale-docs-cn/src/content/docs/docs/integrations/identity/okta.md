---
title: "Setting up Okta to work with Tailscale"
description: "To activate Okta for your domain, follow the instructions below."
---

Last validated Jan 5, 2026

To activate Okta for your domain, follow the instructions below.

## Contents

* [Supported Features][ar-features]
* [Requirements][ar-requirements]
* [Configuration Steps][ar-steps]
* [Notes][ar-notes]
* [Okta Initiated Login][ar-workaround]

## Supported Features

* Single Sign-On (OpenID Connect) initiated by Okta

## Requirements

* Install the Tailscale app from the [Okta Integration Network][xt-okta-integrations].

## Configuration Steps

1. On the Okta admin page, select the Tailscale application and select the **Sign On** tab.
   1. Copy the values of Client ID and Client secret.
   2. Copy the issuer published in the OpenID Provider Metadata. Typically, this is the Okta URL. To find this URL, select **OpenID Provider Metadata**, look for a line that contains `"issuer:"`, and then copy the URL listed on that line (without the quotes). For example, it will look like `https://dev-123456.okta.com` or similar.
2. Switch your Tailscale identity provider to Okta. For information on how to do that, refer to [Switch identity provider][docs-switch-idp]. Note that the domain name used to log into Tailscale should match the email addresses of users assigned to this app.
3. Give users and/or groups access to the Tailscale app:

   *（图：Assign access to users and/or groups.）*

Note that if you make changes to a domain already activated for Okta, or when you migrate an existing tailnet from another identity provider to Okta, no custom link is sent—your activation finishes without requiring this step.

If your organization has defined [custom access policies][xt-okta-create-access-policies], verify that the Tailscale app is authorized for the `openid`, `email`, and `profile` [scopes][xt-okta-create-scopes].

## Notes

After activation, check out our [getting started guide][docs-install].

For information about provisioning users and groups in Okta, refer to [User & group provisioning in Okta][docs-sso-okta-scim].

## Okta initiated login

Tailscale is currently not compatible with Identity Provider initiated login, and only provides service provider initiated login. This means users must start authentication from Tailscale's login page, rather than from inside their Okta instance. As a workaround, users who are interested in initializing login from the Okta instance can create a Tailscale Login bookmark chiclet using these steps:

1. Open the Tailscale App in Okta, select the **General** tab, then select **Edit**.
2. Check **Do not display application icon to users** and save.
3. Open the [Okta Integration Network][xt-okta-integrations], search for **Bookmark App**, and select it. Choose **Add integration**.
4. Fill out the application label name as **Tailscale Login**, and set `https://login.tailscale.com` as the URL.
5. Leave the **Application Visibility** setting unchecked, and choose **Done**.
6. Choose **Applications**, and assign the new bookmark app to Tailscale users.

[ar-features]: #features

[ar-notes]: #notes

[ar-requirements]: #requirements

[ar-steps]: #steps

[ar-workaround]: #workaround

[docs-install]: /docs/how-to/quickstart

[docs-sso-okta-scim]: /docs/integrations/identity/okta/okta-scim

[docs-switch-idp]: /docs/integrations/identity/switch-identity-provider

[xt-okta-create-access-policies]: https://developer.okta.com/docs/guides/customize-authz-server/create-access-policies

[xt-okta-create-scopes]: https://developer.okta.com/docs/guides/customize-authz-server/create-scopes

[xt-okta-integrations]: https://www.okta.com/integrations
