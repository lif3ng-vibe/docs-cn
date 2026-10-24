---
title: "Setting up Microsoft Entra ID to work with Tailscale"
description: "**You should be able to use your Microsoft Entra ID identity to log into Tailscale without additional configuration.**"
---

Last validated Jan 5, 2026

**You should be able to use your Microsoft Entra ID identity to log into Tailscale without additional configuration.**

To use Microsoft Entra ID (previously known as Azure AD) as your identity provider with Tailscale, select **Sign up with Microsoft** when [signing up for your Tailscale account](https://login.tailscale.com/start).

*（图：Select Microsoft when signing up to Tailscale）*

If you cannot authenticate to Tailscale using a Microsoft Entra ID, it is likely because your administrator has disabled Microsoft Entra user consent for applications. To change to this setting, contact your administrator. For details about this setting, refer to [Configure how users consent to applications][xt-entra-configure-consent].

[xt-entra-configure-consent]: https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-user-consent
