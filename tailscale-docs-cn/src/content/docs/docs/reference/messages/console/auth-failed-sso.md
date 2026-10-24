---
title: "Authentication failed while retrieving details from your identity provider"
description: "This topic explains a message that may appear in the Tailscale admin console and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and "
---

Last validated Aug 1, 2025

This topic explains a message that may appear in the Tailscale admin console and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the admin console

**HTTP status:** `Error 403`

Authentication failed while retrieving details from your SSO provider

## Why you're seeing this message

This error message appears when a user tries to sign in to Tailscale using an account backed by a third-party identity provider (IdP), but Tailscale is unable to connect to the IdP's authentication service. Common IdPs include Apple, Authelia, GitLab, JumpCloud, Keycloak, and Okta.

Here are some reasons why this message might display:

* An issue with the IdP such as downtime, outage, or configuration issues preventing authentication.
* There is an issue with redirect or integration between Tailscale and the IdP.
* A temporary outage or a recent change in authentication settings that hasn't propagated correctly.

## What to do

Here are some things you can try to resolve this issue:

* Verify that your IdP service is online and correctly configured, including checking that recent changes to authentication settings have been saved and applied.
* Check your server or web application firewall (WAF) logs to make sure Tailscale IP addresses are permitted. The IPv4 range is `192.200.0.0/24` and the IPv6 range is `2606:B740:49::/48`.
* If you are using a custom IdP, ensure the redirect URLs and credentials are correct.

## Additional information

* For more information about using Tailscale with an IdP, refer to [Supported SSO identity providers][docs-sso-providers].
* For information about using Tailscale with firewalls, refer to [What firewall ports should I open to use Tailscale?][docs-firewall-ports].

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-messages]: /docs/reference/messages

[docs-sso-providers]: /docs/integrations/identity
