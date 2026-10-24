---
title: "Setting up OneLogin to work with Tailscale"
description: "To enable your domain for OneLogin authentication, follow the steps below."
---

Last validated Jul 8, 2024

To enable your domain for OneLogin authentication, follow the steps below.

1. In the OneLogin dashboard, go to *Applications*.

   * Select **Add App**

2. Search for "OIDC" and select **OpenID Connect (OIDC).**

3. Set the *Display Name* to "Tailscale."

   * Select **Save.**

4. Under *Configuration*:

   * Add to *Redirect URIs*: `https://login.tailscale.com/a/oauth_response`
   * Select **Save**

5. Under *SSO*:

   * Set *Refresh Token Minutes* to **40320** (4 weeks)
   * Select **Save**

6. Switch your Tailscale identity provider to OneLogin. For information on how to do that, refer to [Switch identity provider][docs-switch-idp].

7. Make sure all users you want to be able to log in are enabled for the Tailscale application in OneLogin.

[docs-switch-idp]: /docs/integrations/identity/switch-identity-provider
