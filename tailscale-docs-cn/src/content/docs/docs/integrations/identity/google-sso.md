---
title: "Setting up Google to work with Tailscale"
description: "**You should be able to use your Google identity to log into Tailscale without additional configuration.**"
---

Last validated Nov 12, 2025

**You should be able to use your Google identity to log into Tailscale without additional configuration.**

To use Google as your identity provider with Tailscale, select **Sign up with Google** when [signing up for your Tailscale account](https://login.tailscale.com/start).

*（图：Select Google when signing up to Tailscale）*

## Allowlist Tailscale as a third-party app

In some cases, your domain administrator may have [restricted third-party apps from being added to your domain without approval][xt-google-restrict-apps]. If you try to log in to Tailscale with Google, and you get the error message `Error 400: admin_policy_enforced`, Tailscale is blocked in your domain.

If you are the Google Workspace admin for your domain, allowlist Tailscale following [Google's instructions to manage access to apps][xt-google-manage-apps]:

1. Log in to the [Google Admin console][xt-google-login].
2. From the Home page, go to **Security > API controls**.
3. Under **App access control**, select **Manage third-party app access**.
4. Search to find the Tailscale app in the list. Select **Add a filter** and enter "Tailscale" in the **App name** field, and select **Apply**.
   * The Tailscale app's `client_id` is `674241127656-lmq9su4p8ni1tcpuh6eqidoornqtvmvi.apps.googleusercontent.com`
   * The Tailscale app's `client_id` for Google group syncing is `923467998409-avhhsu3j9043drh8s798htd48jo27ki8.apps.googleusercontent.com`. This is only needed if you use System for Cross-domain Identity Management (SCIM) to sync Google Groups with Tailscale.
   * The Tailscale Android authenticator's `client_id` is `744055068597-ppu003h5o04mln2dlou55msf9t4mup3c.apps.googleusercontent.com`
5. Check the box for Tailscale and select **Change access**.
6. Choose the **Limited** or **Trusted** option to allow access.
7. Select **Change**.

[xt-google-login]: https://admin.google.com

[xt-google-manage-apps]: https://knowledge.workspace.google.com/admin/apps/control-which-apps-access-google-workspace-data#trustorlimit

[xt-google-restrict-apps]: https://support.google.com/a/answer/7281227
