---
title: "Restrict device access with Iru"
description: "Use signals reported by Iru (formerly Kandji) as device posture attributes for use in access rules."
---

Last validated Jan 28, 2026

> **Note:** This integration is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

> **Note:**
>
> Iru is formerly known as Kandji. Several references to Kandji may still be found in instructions, code examples, and user interfaces.

[Iru][xt-iru] collects a series of signals from its agent installed on each device that can be used to determine the security posture of a device. Tailscale can fetch these signals from Iru and use them as device posture attributes in access rules, which can then be used by organizations to grant access to sensitive resources only to devices that have a high level of trust.

You can achieve this Tailscale's [device posture management][docs-device-posture] features:

* Kandji posture integration, which synchronizes signals from Kandji to device posture attributes in Tailscale.
* [Device Identity Collection][docs-device-identity-collection], which collects identifiers (for example, serial numbers), used to match devices in Tailscale to devices in Kandji.
* [Posture conditions in access rules][docs-device-posture-postures-and-conditions], which enables configuration of access restrictions based on device attributes.

This guide explains how to enable Device Identity collection for your Tailscale network (tailnet) and configure Kandji posture integration.

## What is Kandji posture integration?

Kandji posture integration lets you connect your Tailscale network to Kandji. The integration runs periodically and copies signals from Kandji to device posture attributes.

When configured, it will periodically:

* Fetch a list of devices recorded in your Kandji account, and their details.
* Match Kandji devices with corresponding devices in your tailnet, based on the serial number associated with a device.
* Write the data from each device into the following Tailscale device posture attributes:

\[Missing snippet: attributes-kandji.mdx]

## Prerequisites

Before you can set up the Kandji integration, make sure you have:

* [Device Identity Collection][docs-device-identity-collection] enabled, and devices in your tailnet are reporting identifiers.
* A Kandji account for which you have permission to create an API token.

## Create Kandji API Token

To authenticate your Kandji account with Tailscale, you'll need to create a Kandji API Token.
The Kandji integration uses these to fetch a list of devices and their data from Kandji.

To create a Kandji API Token:

1. In Kandji, in the left-hand panel, select **Settings**.

2. From the top menu, select **Access** and select **Add Token**.

3. Add a name for the API token and select **Create**.

   *（图：The Kandji Add an API token dialog）*

4. The **API Token** will be shown once, make sure to copy it for use later and select **Next**.

5. In the new dialog, select **Configure** to configure the permissions for the API token.

6. Under **Prism**, select **Device Information** (`/api/v1/prism/device_information`) and select **Save** in the right corner.

7. Under **Access**, make note of your organization's API URL, for example `https://your-organization.api.kandji.io`.

## Configure Kandji posture integration

To configure Tailscale to fetch data about devices from Kandji:

1. Open the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the Tailscale admin console.

2. Under the **Device Posture Integrations** section, locate the Kandji integration, then select **Connect**.

3. Enter your **Kandji API URL**, the URL you use to access the Kandji console.

4. Enter your **API Token**.

   *（图：The configuration screen for connecting to Kandji from the Tailscale admin console.）*

5. Select **Connect to Kandji**.

## Review the integration status

Next, check to ensure the Kandji integration has run successfully.

1. Go to the **Device Posture Integrations** section of the [Device management](https://console.tailscale.com/admin/settings/device-management) page.
2. Locate the Kandji integration under the **Integrations** section.

After the Kandji integration runs successfully, it shows the time of the most recent sync, the number of synced devices, and any errors that occurred while synchronizing.

*（图：Integrations: Kandji: Last sync 4 minutes ago, 1 match between 2 Tailscale devices with identifies and 3 Kandji devices）*

## Check device attributes

After you set up the Kandji integration, you can confirm that Tailscale is writing the new device attributes for your Kandji devices from the Tailscale admin console.

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the Tailscale admin console.
2. Select a device to inspect.
3. The device attributes for the device are in the **Machine Details** section. This should include the set of `kandji:` attributes listed previously.

*（图：View of the machine attributes in the Machines page.）*

> **Tip:**
>
> You can also check device attributes using the [Tailscale API][co-device-posture-get-via-api].

## Adjust Tailscale access rules

After you set up the Kandji posture integration, and your devices have device posture attributes that reflect their signals as reported by Kandji, you can use those device posture attributes as part of your posture rules.

For example, to only permit access to `tag:production` from devices that have an active Kandji agent, you can create a new posture and use it as part of a corresponding access rule:

```json
"postures": {
  "posture:trusted": [
    "kandji:agentInstalled == true",
  ],
},
"grants": [
  {
    "src": ["autogroup:member"],
    "dst": ["tag:production"],
    "ip": ["*"],
    "srcPosture": ["posture:trusted"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

\[Missing snippet: sync-schedule.mdx]

\[Missing snippet: auditlogs-integrations.mdx]

[co-device-posture-get-via-api]: https://tailscale.com/api#tag/devices/GET/device/{deviceId}/attributes

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture-postures-and-conditions]: /docs/features/device-posture/postures-in-access-rules

[docs-device-posture]: /docs/features/device-posture

[xt-iru]: https://www.iru.com/
