---
title: "Troubleshooting Tailscale PAM"
description: "Use the following sections to diagnose and resolve common issues you may encounter when setting up or running [Tailscale PAM][docs-pam]. For issues with a connector, or sessions behind a connector, yo"
---

Last validated Jul 6, 2026

> **Note:** Tailscale PAM is currently in beta.

Use the following sections to diagnose and resolve common issues you may encounter when setting up or running [Tailscale PAM][docs-pam]. For issues with a connector, or sessions behind a connector, you can examine logs to get issue details.

To review the logs for a connector:

1. Open the [Connectors](https://console.tailscale.com/admin/connectors) page of the admin console.
2. Select the connector whose logs you want to examine.
3. Select **Logs**.

The following sections show common causes for errors and recommended paths to resolution.

## Error: no Tailscale PAM token in credentials chain

`{"level":"fatal","ts":"2023-08-04T09:50:54-07:00","msg":"failed to get connector (v2) configuration","error":"no Tailscale PAM token in credentials chain"}`

This error indicates that the `tailzero` CLI was unable to find a token to use for authentication.

To resolve this issue, make sure that you provide a valid Tailscale PAM connector token in the environment variable `BORDER0_TOKEN`.

## Error: invalid token

`{"level":"error","ts":"2023-08-04T09:53:55-07:00","msg":"failed to receive message","error":"rpc error: code = Unauthenticated desc = invalid token"}`

This error indicates that the `tailzero` CLI was able to find a token to use for authentication, but the token was invalid. A token may be invalid if:

* It is malformed, such as characters are missing, or additional characters were added.
* It is expired.
* You provided a shell expansion variable as the value of the token and expanding this variable resulted in an invalid token for one of the reasons listed above.

To resolve this issue, make sure that you provide a valid token.

[docs-pam]: /docs/privileged-access-management
