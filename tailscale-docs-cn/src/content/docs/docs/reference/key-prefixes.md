---
title: "Key prefixes"
description: "Learn about the Tailscale prefixes for keys, such as an API access token."
---

Last validated Aug 1, 2025

Tailscale uses prefixes as part of the ID for keys. The prefix starts with `tskey-` and is followed by the key type. For example, when you create a Tailscale API access token, the prefix is `tskey-api`, resulting in a key ID in the form of:

`tskey-api-abcDEF1CNTRL-091234567890ABCDEF`

The type of key prefixes are:

| Key prefix      | Description                                                                             |
| --------------- | --------------------------------------------------------------------------------------- |
| `tskey-api`     | The key is a [Tailscale API][docs-api] access token.                                    |
| `tskey-auth`    | The key is a [pre-authentication key][docs-auth-keys].                                  |
| `tskey-client`  | The key is a Tailscale [OAuth client][docs-oauth-clients] key.                          |
| `tskey-scim`    | The key is a [System for Cross-domain Identity Management][ln-what-is-scim] (SCIM) key. |
| `tskey-webhook` | The key is a [webhook][docs-webhooks] key.                                              |

Note that all Tailscale-generated keys and secrets are case-sensitive. For more information about keys and secrets in general, refer to [Key and secret management][docs-key-secret-management].

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-key-secret-management]: /docs/reference/key-secret-management

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-webhooks]: /docs/features/webhooks

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim
