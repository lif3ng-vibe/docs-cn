---
title: "Auth keys"
description: "Pre-authentication keys (called auth keys) let you register new nodes without needing to sign in using a web browser. This is most useful when spinning up containers, IoT devices, using infrastructure"
---

Last validated Jun 30, 2026

> **Note:** Auth keys are available for [all plans](https://tailscale.com/pricing).

Pre-authentication keys (called auth keys) let you register new nodes without needing to sign in using a web browser. This is most useful when spinning up containers, IoT devices, using infrastructure-as-code systems like Terraform, or authenticating mobile devices including iOS and Android.

An auth key authenticates a device as the user who generated the key. That is, if Alice generates an auth key, and uses it to add a server to her tailnet, then that device is authenticated with Alice's identity. Think of it as logging into a device.

However, if you use [tags][docs-tags-auth-key-tag] with an auth key, after a device logs in as the user who generated the auth key, the device assumes the identity of the auth key's tags.

> **Note:**
>
> As an alternative to directly creating auth keys, consider using an [OAuth client][docs-oauth-clients]. You can use an OAuth client and the [Tailscale API][docs-api] to programmatically create auth keys. To provision devices that carry an individual user's identity rather than a tag's, refer to [device provisioning with OAuth apps][docs-device-provisioning].

## Types of auth keys

Auth keys can either be:

* **One-off**, for one-time use. They can only be used to connect a device or server one time. This is meant for situations where you can't authenticate on the device yourself, so using a key is more practical. For example, a cloud server might use a one-off key to connect.
* **Reusable**, for multiple uses. They can be used to connect multiple devices. For example, multiple instances of an on-premises database might use a reusable key to connect.

> **Warning:**
>
> **Be very careful with reusable keys!** These can be very dangerous if stolen. They're best kept in a key vault product specially designed for the purpose.

## Key expiry

An auth key automatically expires after the number of days you specified when you generated the key. You can choose the number of days, between 1 and 90 inclusive, for the key expiry. If you don't specify an expiry time, the auth key will expire after the maximum of 90 days. If you want to continue using an auth key after it expires, you need to generate a new key.

You can enable or disable key expiry on a device by using the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and by using the [Update device key][co-api-update-device-key] method in the [Tailscale API][docs-api].

If an auth key expires, any device authorized by it remains authorized until its [node key][docs-key-expiry] expires. Each device generates a node key when you log in to Tailscale and uses it to identify itself to the tailnet. By default, node keys automatically expire every 180 days. You can change the default node key expiry from the **Key Expiry** section of the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the admin console.

[Review key management][bl-tailscale-key-management-node-keys].

### Key expiry for tagged devices

Key expiry for [tagged][docs-tags-auth-key-tag] devices is disabled by default. If you change the tags on the device through the admin console, [Tailscale CLI][docs-cli], or [Tailscale API][docs-api], the device's key expiry will not change unless you re-authenticate. That is, if it is enabled, it stays enabled; and if it is disabled, it stays disabled. After you re-authenticate, the device's key expiry will be disabled.

> **Note:**
>
> You can find recently revoked or expired keys on the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.

## Generate an auth key

You must be an [Owner, Admin, IT admin, or Network admin](/docs/reference/user-roles) of a tailnet to generate a key.

To generate an auth key:

1. Open the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.

2. Select **Generate auth key**.

3. Fill out the form fields to specify characteristics about the auth key, such as the description, [whether its reusable][ar-types-of-auth-keys], when it expires, and device settings.

   The device settings section lets you set special characteristic for the auth key:

   * Enable **Ephemeral** to automatically remove the auth key after the device goes offline.
   * Enable **Pre-approved** to automatically authorize a device if you have [device approval][docs-device-approval] enabled for your tailnet.
   * Enable **Tags** to automatically [tag][docs-tags-auth-key-tag] devices that use the auth key.

4. Select **Generate key**.

## Register a node with the auth key

When you register a node using the CLI, use the `--auth-key` option in the [`tailscale up`][docs-tailscale-up] command to supply the key and bypass interactive login:

```shell
sudo tailscale up --auth-key=tskey-abcdef1432341818
```

> **Note:**
>
> Tailscale-generated auth keys are case-sensitive.

## Register a mobile device with the auth key

To register a mobile device using an auth key:

1. Open the Tailscale app on your iOS or Android device.
2. On the sign-in screen, select the  menu in the top right corner.
3. Select **Use an auth key**.
4. Paste the auth key, then confirm.

> **Note:**
>
> Tailscale-generated auth keys are case-sensitive.

> **Note:**
>
> To deploy auth keys across managed mobile devices, you can configure the `AuthKey` policy setting using your MDM solution. For more information, refer to [Customize Tailscale using system policies][docs-system-policies].

## Revoke an auth key

You must be an [Owner, Admin, IT admin, or Network admin](/docs/reference/user-roles) of a tailnet to revoke a key. And you can revoke only your own keys. Tailscale automatically revokes [one-off keys][ar-authkey-one-off] after they are used.

To revoke a key:

1. Open the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.
2. Locate the key in the table at the bottom, and select **Revoke**.

> **Note:**
>
> Revoking a key does not deauthorize nodes using the key. To deauthorize a node, delete it from the [Machines](https://console.tailscale.com/admin/machines) page.

## Best practices

Depending on what devices you're authenticating, consider using an auth key that is:

* **Ephemeral**, for authenticating [ephemeral nodes][docs-ephemeral-nodes] as part of short-lived workloads. Because node keys do not persist when a workload restarts, they reconnect as a different node. Tailscale automatically removes inactive nodes. For example, containers or Lambda functions should use an ephemeral key to connect.
* **Pre-approved**, for servers. If your tailnet has [device approval][docs-device-approval] enabled, this lets you add a device to your tailnet without further authorization. For example, shared devices, such as servers, should use a pre-approved auth key to connect in a network with device approval.
* **Pre-signed**, for nodes whose auth keys are signed locally on a [signing node][docs-tailnet-lock-add], which applies to tailnets with [Tailnet Lock][docs-tailnet-lock] enabled. You can make an auth key (created by any means) pre-signed only by using the [`tailscale lock sign`][docs-tailscale-lock-lock-sign] CLI command.
* **Tagged**, for servers. You can automatically apply a tag to a device by including the [tag][docs-tags-auth-key-tag] in the auth key. Access control policies restricting the device's permissions based on the tag apply after provisioning the device. For example, shared devices, such as servers, should use a tagged auth key to connect.

[ar-authkey-one-off]: #authkey-one-off

[ar-types-of-auth-keys]: #types-of-auth-keys

[bl-tailscale-key-management-node-keys]: https://tailscale.com/blog/tailscale-key-management#node-keys

[co-api-update-device-key]: https://tailscale.com/api#tag/devices/POST/device/%7BdeviceId%7D/key

[docs-api]: /docs/reference/tailscale-api

[docs-cli]: /docs/reference/tailscale-cli

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-device-provisioning]: /docs/features/oauth-apps/device-provisioning

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-system-policies]: /docs/features/tailscale-system-policies

[docs-tags-auth-key-tag]: /docs/features/tags#best-practices

[docs-tailnet-lock-add]: /docs/features/tailnet-lock#add-a-node-to-a-locked-tailnet

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailscale-lock-lock-sign]: /docs/reference/tailscale-cli/lock#lock-sign

[docs-tailscale-up]: /docs/reference/tailscale-cli/up
