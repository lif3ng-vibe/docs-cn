---
title: "Tailnets API"
description: "Create and manage tailnets in your organization programmatically with the Tailscale Tailnets API."
---

Last validated Oct 20, 2026

> **Note:** Tailnets API are currently in alpha.

> **Note:** Tailnet API are available for [all plans](https://tailscale.com/pricing).

> **Note:**
>
> You can create up to ten total tailnets in your organization, including your original tailnet. Use cases that need more than ten tailnets requires a sales contract. Contact [Tailscale Sales](https://tailscale.com/contact/sales) for details.

Tailscale provides API endpoints that you can use to create, list, and delete multiple Tailscale networks (known as tailnets) in your organization. These tailnets are considered API-only, meaning that they do not contain human users or appear in the admin console. Tailnets created with these APIs support only tagged devices. They're great for building directly into your applications, automations, and infrastructure, but they aren't appropriate for use cases that require a human to join the tailnet directly.

## Create API-only tailnets

You can use API-only tailnets to:

* Create an ephemeral tailnet as part of a CI/CD pipeline
* Build private connectivity into your applications
* Deploy sandbox tailnets for AI agents

If you're trying to create additional tailnets that appear in the admin console and support human users, refer to [Manage multiple tailnets][docs-multiple-tailnets].

### Authenticate to the API

You can authenticate to these APIs with an [OAuth client][docs-oauth-client] or [federated identity][docs-workload-identity-federation]. Create the trust credential in an existing tailnet and assign it the `tailnets` scope.

To use an OAuth client:

1. Generate an OAuth client with the `tailnets` scope.
2. [Exchange the OAuth client secret for an API access token][docs-exchange-token] that can be provided to the API endpoints.

To use a federated identity:

1. Create a federated identity with the `tailnets` scope.
2. [Exchange the workload identity token for an API access token][docs-workload-identity-federation-token-exchange] that can be provided to the API endpoints.

### Authenticate against API-only tailnets

When you [create][co-api-create-tailnet] a new API-only tailnet, the response contains details for an OAuth client that permits access to the API for that tailnet.

Additionally, an OAuth client in the creating tailnet can get a new OAuth access token with access to the API-only tailnet by specifying the target tailnet's ID in the `tailnet` parameter of the request body sent to the `/token` endpoint. The OAuth client must have the `all` scope. You can use this method to retrieve new credentials for an API-only tailnet if you lose the OAuth client credentials that were returned in the original creation response.

The `tailnet` parameter is available only for OAuth client credential exchange. Federated identity token exchange cannot request access to another tailnet. To use a federated identity with an API-only tailnet, first use the returned OAuth client to create the federated identity in the API-only tailnet.

For example:

```shell
curl -d "client_id=${OAUTH_CLIENT_ID}" -d "client_secret=${OAUTH_CLIENT_SECRET}" \
  -d "tailnet=T123456CNTRL" "https://api.tailscale.com/api/v2/oauth/token"
```

### Endpoints

For endpoint paths, request schemas, response schemas, status codes, and required OAuth scopes, refer to the Tailscale API reference:

* [Create a tailnet][co-api-create-tailnet]
* [List tailnets][co-api-list-tailnets]
* [Delete a tailnet][co-api-delete-tailnet]

If you lose the OAuth client credentials returned when creating an API-only tailnet, or want to create additional credentials for that tailnet, [authenticate against the API-only tailnet][ar-authenticate-api-only] using an OAuth client from the creating tailnet, then use it to [create a new OAuth client][co-api-create-key] in the API-only tailnet.

### Configure API-only tailnets

Once you've created an API-only tailnet, you can use the standard [public API endpoints][co-api] to write access policies, customize settings, and authenticate new tagged devices to the tailnet.

### Limitations

* Alpha API endpoints are not considered stable interfaces. Tailscale will communicate with users before making breaking changes.
* These alpha endpoints are not available in the API's Go client, Terraform provider, or Pulumi provider.
* Tailnets created with these API endpoints have no human owner or users. You must use the public API to interact with the tailnet. Future iterations of this feature will remove this limitation.
* Tailnets created with these API endpoints do not appear in the admin console for your organization. Future iterations of this feature will let you choose if these tailnets should appear in the admin console.

[ar-authenticate-api-only]: #authenticate-against-api-only-tailnets

[co-api]: https://tailscale.com/api

[co-api-create-tailnet]: https://tailscale.com/api#tag/organizations/POST/organizations/{organization}/tailnets

[co-api-create-key]: https://tailscale.com/api#tag/keys/POST/tailnet/{tailnet}/keys

[co-api-delete-tailnet]: https://tailscale.com/api#tag/organizations/DELETE/tailnet/{tailnet}

[co-api-list-tailnets]: https://tailscale.com/api#tag/organizations/GET/organizations/{organization}/tailnets

[docs-exchange-token]: /docs/features/oauth-clients#verifying-you-can-generate-api-access-tokens

[docs-multiple-tailnets]: /docs/features/multiple-tailnets

[docs-oauth-client]: /docs/features/oauth-clients

[docs-workload-identity-federation]: /docs/features/workload-identity-federation

[docs-workload-identity-federation-token-exchange]: /docs/features/workload-identity-federation#token-exchange-api
