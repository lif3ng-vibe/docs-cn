---
title: "Use Tailscale identity in your Grafana HTTP service"
description: "Grafana is one example of an application that can use [Tailscale PAM][docs-pam] [identity headers][docs-pam-identity-headers]. Its built-in `auth.proxy` identity provider lets Grafana trust identity i"
---

Last validated Aug 18, 2026

> **Note:** Tailscale PAM is currently in beta.

Grafana is one example of an application that can use [Tailscale PAM][docs-pam] [identity headers][docs-pam-identity-headers]. Its built-in `auth.proxy` identity provider lets Grafana trust identity information supplied by an authenticating reverse proxy.

For example, you can configure Grafana to use `X-Auth-Email` as the user's identity:

```ini
[session]
cookie_secure = true

[users]
allow_sign_up = false
auto_assign_org = true
auto_assign_org_role = Viewer

[auth]
disable_login_form = true
disable_signout_menu = true

[auth.anonymous]
enabled = false

[auth.basic]
enabled = false

[auth.proxy]
enabled = true
header_name = X-Auth-Email
header_property = username
auto_sign_up = true
headers = Email:X-Auth-Email
```

This configuration tells Grafana to accept the authenticated email address passed by Tailscale PAM and automatically sign the user in.

The example assigns newly created users the `Viewer` role. Adjust the Grafana role and authorization settings to match the access users should have in your environment.

For information about cryptographically verifying Tailscale PAM identity headers, refer to [Verify identity headers][docs-pam-verify-identity-headers].

## Try it with Docker

If you want to try this yourself, save the configuration above as `grafana.ini` in your current directory.

Then start Grafana with Docker:

```shell
docker run -i \
  -v "$(pwd)/grafana.ini:/etc/grafana/grafana.ini" \
  -p 3000:3000 \
  grafana/grafana
```

Grafana will now be available on port `3000`.

Next, create an [HTTP PAM service][docs-pam-access-http-service] and point it at the Grafana instance. If Grafana is running on the same machine as your PAM connector, use:

```shell
http://localhost:3000
```

If Grafana is running somewhere else, use the hostname or IP address that the PAM connector can reach.

When a user opens the PAM service, they authenticate with their [Tailscale identity information][docs-tailscale-identity]. Tailscale PAM passes the authenticated identity to Grafana in the `X-Auth-*` headers, and Grafana uses `X-Auth-Email` to sign the user in automatically.

[docs-pam-access-http-service]: /docs/privileged-access-management/how-to/access-http-service

[docs-pam-identity-headers]: /docs/privileged-access-management/how-to/access-http-service#pass-tailscale-identity-to-your-web-application

[docs-pam-verify-identity-headers]: /docs/privileged-access-management/how-to/access-http-service#verify-identity-headers

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
