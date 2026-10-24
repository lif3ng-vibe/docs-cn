---
title: "Troubleshoot SSO login failure for an HTTP service"
description: "When you access an application through a Tailscale PAM [HTTP service][docs-pam-http-service], the service's public hostname may be different from the hostname you use to access the application directl"
---

Last validated Sep 17, 2026

> **Note:** Tailscale PAM is currently in beta.

When you access an application through a Tailscale PAM [HTTP service][docs-pam-http-service], the service's public hostname may be different from the hostname you use to access the application directly. This could cause single sign-on (SSO) login to fail.

The application uses the Tailscale PAM service hostname when sending you to its identity provider. This is expected. After you sign in, the browser needs to return to the application through Tailscale PAM instead of connecting directly to the origin.

Identity providers only send users back to URLs that have been approved for the application. In OpenID Connect (OIDC), this URL is called a redirect URI. In Security Assertion Markup Language (SAML), this URL is called an Assertion Consumer Service (ACS) URL.

For example, an application might normally use:

`https://app.example.com/oauth/callback`

When accessed through Tailscale PAM, it might instead use:

`https://my-app.border0.io/oauth/callback`

If the URL using the Tailscale PAM service hostname has not been added to the application's identity provider configuration, sign-in may fail.

To fix this, add the exact URL that uses the Tailscale PAM HTTP service hostname to the application's configuration in your identity provider:

* For OIDC, add it as an allowed sign-in redirect URI.
* For SAML, add it as the ACS URL.

Keep the original URL as well if users still access the application directly.

* For OIDC, you can confirm whether this is the problem by opening your browser's developer tools and finding the request to your identity provider. Look for the `redirect\_uri` parameter and compare it with the allowed redirect URIs configured for the application.
* For SAML, compare the application's ACS URL with the ACS URL configured in your identity provider.

Make sure the full URL matches, including the protocol, hostname, port (if used), and path.

[docs-pam-http-service]: /docs/privileged-access-management/how-to/access-http-service
