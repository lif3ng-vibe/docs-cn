---
title: "Device provisioning with OAuth apps"
description: "Device provisioning with OAuth apps lets internal tools provision tailnet devices on behalf of individual users. Unlike approaches that create tag-owned devices, it uses a standard OAuth 2.0 authoriza"
---

Last validated Jun 24, 2026

> **Note:** Device provisioning with OAuth apps is currently in alpha.

Device provisioning with OAuth apps lets internal tools provision tailnet devices on behalf of individual users. Unlike approaches that create tag-owned devices, it uses a standard OAuth 2.0 authorization code flow to create devices that carry the full identity of the consenting user. Access control rules, audit log entries, and device quotas all apply to the user who authorized the device, not to a shared service identity.

This flow works only within a single tailnet. The OAuth app and every user who completes the authorization flow must belong to the same tailnet. A user from a different tailnet cannot authorize a device through your app.

This page covers two roles: admins who create and configure the OAuth app, and developers who implement the authorization code flow in their tooling. The flow follows [RFC 6749 section 4.1][xt-rfc-6749] (authorization code grant), so standard OAuth libraries work with minimal customization.

## Use cases

Device provisioning with OAuth apps supports the following use cases.

* **Internal developer tooling**: Platform teams build tools that create tailnet devices for individual developers. Each device carries the developer's identity, so access control rules apply correctly without shared credentials.
* **Automated device provisioning with user attribution**: Provisioning workflows where each device requires association with a specific user for audit logging and quota accounting.
* **Replacing shared auth key patterns**: Migrating from shared or tag-based auth keys to per-user authorization. Each device traces back to the user who authorized it, improving security posture and traceability.

## Prerequisites

Before you begin, confirm you meet the following requirements.

* [Owner](/docs/reference/user-roles) or [Admin](/docs/reference/user-roles) role in the tailnet.
* The OAuth app and all users who authorize devices through it must be in the same tailnet. This flow does not support users from other tailnets.
* An API access token with admin scope for creating OAuth apps through the API.
* For developers implementing the flow: working knowledge of OAuth 2.0 authorization code grants and the ability to handle HTTP redirects and token exchanges.

## Get started

Setting up device provisioning with OAuth apps has two phases. An admin creates an OAuth app through the [Tailscale API][docs-api] (steps 1-2), then a developer implements the authorization code flow in their tool (steps 3-6).

### Step 1: Create an OAuth app

Create the OAuth app with a `POST` request to the Tailscale API. The request defines where users are redirected after consent and what scope the app requests. Only include the `allowedNodeAttributes` field if you intend to set `node_attributes`.

```shell
curl -X POST "https://api.tailscale.com/api/v2/tailnet/-/oauth-apps" \
  -u "<api-access-token>:" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "device-provisioner",
    "redirectUris": ["https://your-tool.internal.example.com/callback"],
    "scopes": ["auth_keys:create:once"],
    "allowedNodeAttributes": ["custom:provisioned"]
  }'
```

The request body accepts the following fields.

| Field                   | Type             | Description                                                                                                                                                                                                                |
| :---------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                  | string           | A display name for the OAuth app.                                                                                                                                                                                          |
| `redirectUris`          | array of strings | URIs where the user is sent after granting or denying consent.                                                                                                                                                             |
| `scopes`                | array of strings | The scopes the app requests. Use `auth_keys:create:once`.                                                                                                                                                                  |
| `allowedNodeAttributes` | array of strings | (Optional) Custom node attributes that may be assigned to devices provisioned through this OAuth app. Values must use the `custom:` prefix (for example, `custom:provisioned`). Only custom attributes can be allowlisted. |

A successful response includes the app credentials:

```json
{
  "id": "app-123456",
  "name": "device-provisioner",
  "clientSecret": "tskey-app-abc123-secretvalue",
  "redirectURIs": ["https://your-tool.internal.example.com/callback"],
  "scopes": ["auth_keys:create:once"]
}
```

The `clientSecret` has the format `tskey-app-<clientID>-<secret>`. The client ID segment maps to the `id` field in the API response. Store the secret securely. The API returns it only at creation time and cannot retrieve it later.

The custom node attributes you explicitly allowlist with `allowedNodeAttributes` can be assigned to devices provisioned through this OAuth app. You can then reference those attributes in [device posture][docs-device-posture] conditions and [grants][docs-node-attributes] to gate access based on how a device was provisioned. For more about how node attributes attach to devices, refer to the [node attributes reference][docs-node-attributes].

### Step 2: Verify the OAuth app

After creating the OAuth app, verify it exists by querying the API with the app ID from the creation response:

```shell
curl -X GET "https://api.tailscale.com/api/v2/tailnet/-/oauth-apps/app-123456" \
  -u "<api-access-token>:"
```

Confirm the response includes the correct scopes and redirect URIs.

### Step 3: Build the authorization URL

With the OAuth app created, the developer integrates the authorization flow into their tool. The first step is constructing an authorization URL that redirects users to the Tailscale consent screen. When a user visits this URL, Tailscale displays a consent prompt asking them to approve the app.

The authorization URL uses the following format:

```
https://login.tailscale.com/a/oauth_authorize?client_id=<client-id>&redirect_uri=<redirect-uri>&scope=auth_keys:create:once&state=<random-state>&response_type=code
```

The URL accepts the following query parameters.

| Parameter       | Description                                                                                                                                        |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client_id`     | The client ID from the OAuth app. This is the segment between `tskey-app-` and the second `-` in the client secret.                                |
| `redirect_uri`  | One of the redirect URIs registered when creating the app. Must match exactly.                                                                     |
| `scope`         | The scope to request. Use `auth_keys:create:once`.                                                                                                 |
| `state`         | A unique, unguessable value your tool generates for CSRF protection. Your callback handler validates that the returned `state` matches this value. |
| `response_type` | Must be `code`.                                                                                                                                    |

### Step 4: Handle user consent and the authorization code

After the user visits the authorization URL, Tailscale displays a consent screen. What happens next depends on the user's response:

* **User grants consent**: Tailscale redirects to your `redirect_uri` with an authorization `code` and your `state` parameter as query parameters:

  ```
  https://your-tool.internal.example.com/callback?code=<authorization-code>&state=<random-state>
  ```

* **User denies consent**: Tailscale redirects to your `redirect_uri` with an error parameter:

  ```
  https://your-tool.internal.example.com/callback?error=access_denied
  ```

In your callback handler, validate that the returned `state` matches the value you sent in step 3 before proceeding. This prevents cross-site request forgery attacks.

### Step 5: Exchange the authorization code for an access token

Exchange the authorization code for an access token by making a `POST` request to the token endpoint. The `redirect_uri` must match the value used in step 3.

```shell
curl -X POST "https://api.tailscale.com/api/v2/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=<authorization-code>" \
  -d "client_id=<client-id>" \
  -d "client_secret=tskey-app-<client-id>-<secret>" \
  -d "redirect_uri=https://your-tool.internal.example.com/callback"
```

If you opted to include `allowedNodeAttributes` when creating your OAuth app in step 1, be sure to specify which attributes should be set on this device by passing the respective `node_attributes` values in your `POST` request, separated by commas. So, your payload would be as follows:

```shell
curl -X POST "https://api.tailscale.com/api/v2/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=<authorization-code>" \
  -d "client_id=<client-id>" \
  -d "client_secret=tskey-app-<client-id>-<secret>" \
  -d "node_attributes=<node_attributes>" \
  -d "redirect_uri=https://your-tool.internal.example.com/callback"
```

A successful response returns an access token:

```json
{
  "access_token": "<access-token>",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

The response does not include a refresh token. The access token expires after 1 hour (3600 seconds), and the lifetime is not configurable. The token is also single-use: the backend rejects it after its first successful use, even if it has not expired.

### Step 6: Use the access token as an auth key

The access token from step 5 is already a valid auth key. You do not need to make a separate API call to create one. Pass the access token directly to register a device in the tailnet:

```shell
tailscale up --auth-key=<access-token>
```

The device inherits the full identity of the user who authorized the OAuth app:

* Access control rules that reference the user apply to this device.
* Audit log entries for the device are attributed to the user.
* The device counts against the user's device quota.

This is the key difference from the [OAuth client credentials flow][docs-oauth-clients], which creates tag-owned devices with a separate auth key step. Here, the access token itself carries the user's identity and serves as the auth key in a single step.

## One-time authorization scope

Device provisioning with OAuth apps uses one-time authorization, requested with the `auth_keys:create:once` scope. Each consent grants a single-use auth key, and the token exchange does not return a refresh token. The authorization is consumed on first use, so the user goes through the consent screen again for each new device.

This scope is appropriate for tools where each device provisioning event is a deliberate, user-initiated action.

## Identity model

This flow creates user-owned devices, where each device carries the full identity of the user who authorized it through the consent screen. This is the fundamental difference from the [OAuth client credentials flow][docs-oauth-clients], which creates tag-owned devices.

| Behavior                       | Authorization code flow                   | OAuth client credentials flow            |
| :----------------------------- | :---------------------------------------- | :--------------------------------------- |
| **Device ownership**           | User-owned                                | Tag-owned                                |
| **Identity**                   | Individual user who consented             | Service identity (tag)                   |
| **Access control enforcement** | User-based rules apply                    | Tag-based rules apply                    |
| **Audit logging**              | Actions attributed to the individual user | Actions attributed to the tag or service |
| **Device quotas**              | Count against the authorizing user        | Count against the tag                    |

Devices provisioned this way appear in the admin console under the authorizing user's devices. Access control rules that reference the user (by email, group membership, or autogroup) apply to the device, and audit log entries identify the user by name.

Choose this flow over the client credentials flow when you require devices traceable to individual users for security, compliance, or operational accountability.

## Scopes reference

Device provisioning with OAuth apps uses the following scope.

| Scope                   | Description                                                                                                                 |
| :---------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `auth_keys:create:once` | Lets the app create a single auth key. No refresh token is returned, and the user re-authorizes for each additional device. |

## Limitations

* Authorization is restricted to a single tailnet. Only users in the same tailnet as the OAuth app can authorize devices through it. Users from other tailnets cannot complete the flow.
* The Tailscale-hosted consent screen cannot be customized.
* One-time authorization issues a single-use access token. The user re-authorizes through the consent screen for each new device.

[docs-api]: /docs/reference/tailscale-api

[docs-device-posture]: /docs/features/device-posture

[docs-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-oauth-clients]: /docs/features/oauth-clients

[xt-rfc-6749]: https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1
