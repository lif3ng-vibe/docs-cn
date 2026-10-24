---
title: "Device approval"
description: "Device approval is a feature that lets Tailscale network administrators review and approve new devices before they can join your Tailscale network (known as a tailnet). Use device approval to ensure o"
---

Last validated Jan 5, 2026

Device approval is a feature that lets Tailscale network administrators
review and approve new devices before they can join your Tailscale network (known as a tailnet). Use device approval to ensure only trusted devices, such as workplace-managed laptops and
phones, can access a network.

> **Note:** Device approval is available for [all plans](https://tailscale.com/pricing).

## Enable device approval for your network

You must be an [Owner, Admin, or IT admin](/docs/reference/user-roles) of a tailnet to enable device approval.

Enable device approval from the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the admin console.

*（图：Enable device approval in the admin console.）*

## Approve devices from the admin console

You must be an [Owner, Admin, or IT admin](/docs/reference/user-roles) of a tailnet to approve devices.

Once this setting is enabled, a new device that accesses your network displays a
notification that the device is awaiting approval. A device awaiting approval
cannot send or receive traffic on your Tailscale network until it is approved.

*（图：A notification informs the user that their device is awaiting approval.）*

To approve devices, open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
At the top of the list you will find the device with a **Needs approval**
badge beneath it.

*（图：A device needing approval displays the Needs approval badge.）*

You can review details about the device and user before deciding whether to
approve it. When you're ready to approve the device, select the  menu and
select **Approve** to allow the device to connect to your network.

*（图：Approve the device to connect to your network.）*

After approval, the device will immediately be able to connect.
No restarts or toggling needed.

## Pre-approve devices with an auth key

When you generate a new [auth key][docs-auth-keys], you can specify that the key should automatically approve devices for which the auth key is used.

To do this, you must:

1. Generate an auth key which is pre-approved.
2. Then, specify that auth key when authenticating a device. The device is automatically approved.

### Generate an auth key which is pre-authorized

You must be an [Owner, Admin, IT admin, or Network admin](/docs/reference/user-roles) of a tailnet to generate an auth key.

You can generate an auth key with a tag by using the admin console or by using the API.

In the admin console:

1. Go to the [Keys](https://console.tailscale.com/admin/settings/keys) page in the admin console.
2. In the **Auth keys** section, select **Generate auth key**.
3. Select **Pre-approved**. This option is only available if device approval is enabled for the tailnet.
4. Select **Generate** to generate the auth key.

## Automate device approval

When using device approval, you can create a flow to automatically approve a device if it meets specific criteria, such as being on an internal device registry or passing a third-party posture check.

1. Configure a [webhook][docs-webhooks] for [`nodeNeedsApproval`][docs-webhooks-events].
2. Upon receiving webhook messages, verify the node against the information that you need.
3. Approve the device by sending a POST request to the [device authorization API][co-api-authorize-device]. For example:

```shell
curl "https://api.tailscale.com/api/v2/device/11055/authorized" \
-u "tskey-api-xxxxx:" \
--data-binary '{"authorized": true}'
```

You can also revoke the authorization for a device by calling the same API with `{"authorized": false}` as the payload.

## Limitations

Device approval applies to actual devices (like phones, laptops, or virtual machines) rather than tailnet nodes that appear in the admin console. A node is owned by a particular user or a tag, while a device could be shared between multiple users. For a shared device, approval will only be required once, regardless of how many users share it or the number of tailnet nodes created with it. Use [device postures][docs-device-posture] for more granular node access management.

[co-api-authorize-device]: https://tailscale.com/api#tag/devices/POST/device/%7BdeviceId%7D/authorized

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-posture]: /docs/features/device-posture

[docs-webhooks-events]: /docs/features/webhooks#events

[docs-webhooks]: /docs/features/webhooks
