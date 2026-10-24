---
title: "Tailscale API"
description: "Explore the Tailscale application programming interface (API)."
---

Last validated Jun 24, 2026

> **Note:** The Tailscale API is available for [all plans](https://tailscale.com/pricing).

Tailscale offers an application programming interface (API) to let you automate various aspects of your network.

[Visit our interactive API documentation →][co-api]

## Authentication

You need to be an [Owner, Admin, IT admin, or Network admin](/docs/reference/user-roles) of a tailnet to generate an access token.

Requests to the API are authenticated by using an access token (sometimes called an API key), which can be generated
from the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console. You can choose the number of days, between 1 and 90 inclusive, for the key expiry. Also note that Tailscale-generated API access tokens are case-sensitive.

This access token will automatically expire after the chosen number of days. If you want to continue using an access token after this access token expires, you need to generate a new access tokens. Access tokens can also be
revoked before their expiration. Recently expired and revoked access token are shown on
the [Keys](https://console.tailscale.com/admin/settings/keys) page.

As an alternative to an access token that has full permission to the Tailscale API, use
[trust credentials][docs-trust-credentials] to provide delegated fine-grained control to the Tailscale API.

More details about authenticating with the API can be [found in our interactive API docs][co-api].

## Node attributes for provisioned devices

When you create an OAuth app for [device provisioning with OAuth apps][docs-device-provisioning], the request body accepts an optional `allowedNodeAttributes` field. It takes an array of custom node attributes to automatically assign to every device provisioned through that OAuth app. Each value must use the `custom:` prefix (for example, `custom:provisioned`). Only custom attributes can be allowlisted.

Because these attributes are assigned at provision time, you can reference them in [device posture][docs-device-posture] conditions (`srcPosture`) and in grants to gate access based on how a device was provisioned. For the distinction between attributes that attach to a device and capabilities that attach to a connection, refer to [node attributes versus grant app capabilities][docs-node-attributes-vs-app-capabilities].

[co-api]: https://tailscale.com/api

[docs-device-posture]: /docs/features/device-posture

[docs-device-provisioning]: /docs/features/oauth-apps/device-provisioning

[docs-node-attributes-vs-app-capabilities]: /docs/reference/node-attributes-vs-app-capabilities

[docs-trust-credentials]: /docs/reference/trust-credentials
