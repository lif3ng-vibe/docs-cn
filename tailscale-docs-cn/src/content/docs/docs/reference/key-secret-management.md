---
title: "Key and secret management"
description: "Manage the various types of keys and secrets for your tailnet."
---

Last validated Jan 5, 2026

You can set up various types of keys and secrets for securely connecting to resources in your Tailscale network (known as a tailnet). This topic explains the fundamentals of managing each kind of key and secret that we provide.

For more in-depth information on tailnet security, refer to [Best practices to secure your tailnet][docs-security-hardening].

## Keys and secrets best practices

Ensure you keep your keys and secrets secure. Make sure to copy your keys and secrets into a password manager as soon as they are generated and displayed. The secrets will only be displayed once in their entirety. If you don't copy it down, you will need to generate a new key or secret.

Make sure you are aware of the key expiry for each key type, and manage them accordingly. [System for Cross-domain Identity Management (SCIM)][ln-what-is-scim] API keys and webhook endpoint secrets do not expire.

We strongly recommend that you use a secrets manager or consult with your cloud provider for directions for securely storing your keys and secrets. **Do not store sensitive information such as an OAuth client or API access token in source control.**

## Key prefixes

Each type of Tailscale-generated key contains a [key prefix][docs-key-prefixes] to help you distinguish the prefix type, such as `tskey-api` for API access tokens (sometimes called API keys) and `tskey-auth` for auth keys.

## Key and secret types

All Tailscale-generated keys and secrets are case-sensitive.

### API access tokens

[API access tokens][docs-api] let you grant access to applications in your tailnet using the Tailscale API. You can generate and revoke your API access tokens (keys) in the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.

To create an API access token, open the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console, go to the **API access tokens** section, then select **Generate access token**.

To revoke an API access token, open the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console, go to the **API access tokens** section, then select **Revoke** next to the token that you want to delete.

### Auth keys

[Auth keys][docs-auth-keys] let you authenticate a tagged device in your tailnet as an alternative to an interactive [single sign-on (SSO)][docs-sso-providers] session. You can generate and revoke auth keys in the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.

To create an auth key, refer to [Generating a key][docs-auth-keys-generating-a-key].

To revoke an auth key, refer to [Revoking a key][docs-auth-keys-revoke].

### OAuth clients

[OAuth clients][docs-oauth-clients] let you delegate and scope access for your Tailscale APIs. You can generate and revoke OAuth clients in the [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) page of the admin console.

To create an OAuth key, refer to [Setting up an OAuth client][docs-oauth-clients-setup].

To revoke an OAuth key, refer to [Revoke a trust credential][docs-trust-credentials-revoke].

### SCIM API keys

A SCIM API key lets you authenticate an identity provider, such as [Microsoft Entra ID][docs-sso-entra-ai-scim-enable] and [Okta][docs-sso-okta-scim-enable-provisioning], and your tailnet for [user & group provisioning][docs-user-group-provisioning]. A single SCIM API key is used for an entire tailnet and is administered in the [User management](https://console.tailscale.com/admin/settings/user-management) page of the admin console. User & group provisioning must be enabled to generate the SCIM API key. If you do not have user & group provisioning enabled in your tailnet, the **User & Group Provisioning** section will not display in the admin console.

To create a SCIM API key, open the [User management](https://console.tailscale.com/admin/settings/user-management) page of the admin console and select **Enable Provisioning**. Copy the generated key to the clipboard, then add the key in your Microsoft Entra ID or Okta provisioning settings.

A SCIM API key should be revoked or regenerated when it is lost, the Microsoft Entra ID or Okta environment is compromised, or you've stopped using Microsoft Entra ID or Okta.

To revoke a SCIM API key, open the [User management](https://console.tailscale.com/admin/settings/user-management) page of the admin console, and select **Manage keys**. In the **Provisioning keys** dialog, select **Revoke**.

To generate a new SCIM API key, open the [User management](https://console.tailscale.com/admin/settings/user-management) page of the admin console, and select **Manage keys**. In the **Provisioning keys** dialog, select **Generate new key**.

### Webhook secrets

[Webhooks][docs-webhooks] let you subscribe to tailnet [events][docs-webhooks-events] that can automatically be sent to services such as Slack, Discord, and Mattermost. A webhook secret ensures webhook requests are coming from authorized users in the tailnet. You can generate, rotate, or delete webhook secrets for your endpoints in the [Webhooks](https://console.tailscale.com/admin/settings/webhooks) page of the admin console.

To create a webhook endpoint and secret, refer to [Setting up a webhook endpoint][docs-webhooks-webhook-secret].

To delete a webhook endpoint, refer to [Deleting an endpoint][docs-webhooks-deleting-an-endpoint]. When an endpoint is deleted, the secret is also deleted.

To generate a new secret for an existing webhook, refer to [Rotating a webhook secret][docs-webhooks-rotating-a-webhook-secret].

## Using logs and events

You can monitor your key and secret activity in the [Logs](https://console.tailscale.com/admin/logs) page of the admin consoles. For example, the "Create API key" event is generated when a new API access token or auth key is generated. You can also use [webhooks][docs-webhooks] for automatic notifications when a key status changes.

For more about logged events in general, refer to [Configuration audit logging][docs-audit-logging].

For more about the types of events related to keys that are logged, refer to [Audit logging events][docs-audit-logging-events].

For more about the types of available webhook events for key activity notifications, refer to [Webhook events][docs-webhooks-events].

## Key expiry

API access tokens, auth keys, and OAuth keys are generated with an expiry that you can adjust at the time they are generated. SCIM API keys and webhook endpoint secrets do not expire. As key expiry can vary across your different keys and types, make sure you are aware of the expiry day and provision accordingly for each key. For more information, refer to [Key expiry][docs-key-expiry].

## Secret scanning

To help mitigate accidental disclosure and prevent fraudulent use, Tailscale partners with several companies to provide secret scanning of source code repositories and other data sources to find leaked Tailscale keys. For more information, refer to [Secret scanning][docs-secret-scanning].

## Offboarding users

While key and secret management are an important aspect of security, there are other things that you should take into account when removing users and devices from your tailnet. For more information, refer to [Offboarding users][docs-offboarding-users].

[docs-api]: /docs/reference/tailscale-api

[docs-audit-logging-events]: /docs/features/logging/audit-logging#events

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-auth-keys-generating-a-key]: /docs/features/access-control/auth-keys#generate-an-auth-key

[docs-auth-keys-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-key-prefixes]: /docs/reference/key-prefixes

[docs-oauth-clients-setup]: /docs/features/oauth-clients#setting-up-an-oauth-client

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-offboarding-users]: /docs/features/sharing/how-to/offboard

[docs-secret-scanning]: /docs/integrations/secret-scanning

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-sso-entra-ai-scim-enable]: /docs/integrations/identity/entra/entra-id-scim#enable-provisioning

[docs-sso-okta-scim-enable-provisioning]: /docs/integrations/identity/okta/okta-scim#enable-provisioning

[docs-sso-providers]: /docs/integrations/identity

[docs-trust-credentials-revoke]: /docs/reference/trust-credentials#revoke-a-trust-credential

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[docs-webhooks-deleting-an-endpoint]: /docs/features/webhooks#deleting-an-endpoint

[docs-webhooks-events]: /docs/features/webhooks#events

[docs-webhooks-rotating-a-webhook-secret]: /docs/features/webhooks#rotating-a-webhook-secret

[docs-webhooks-webhook-secret]: /docs/features/webhooks#webhook-secret

[docs-webhooks]: /docs/features/webhooks

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim
