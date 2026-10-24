---
title: "Restrict device access with Jamf Pro"
description: "Use signals reported by Jamf Pro as device posture attributes for use in access rules."
---

Last validated Jan 28, 2026

> **Note:** This integration is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

[Jamf Pro][xt-jamfpro] collects a series of signals from the MDM profile installed on devices and these signals can be used to determine the security posture of a device. Tailscale can fetch these signals from Jamf Pro and use them as device posture attributes in access rules, which can allow organizations to grant access to sensitive resources only to devices that have a high enough level of trust.

You can achieve this Tailscale's [device posture management][docs-device-posture] features:

* [Device Identity Collection][docs-device-identity-collection], which collects identifiers (for example, serial numbers), used to match devices in Tailscale to devices in Jamf Pro.
* Jamf Pro posture integration, which synchronizes signals from Jamf Pro to device posture attributes in Tailscale.
* [Posture conditions in access rules][docs-device-posture-postures-and-conditions], which lets you configure access restrictions based on device attributes.

This guide explains how to enable Device Identity collection for your Tailscale network (tailnet) and configure Jamf Pro posture integration.

## What is Jamf Pro posture integration?

The Jamf Pro integration syncs data between Jamf Pro and Tailscale on a recurring schedule.
During each sync, Tailscale performs the following actions:

1. Fetches a list of hosts and their reported data from your Jamf Pro account.
2. Matches Jamf Pro devices to devices in your tailnet based on serial numbers.
3. Writes the Jamf Pro data to device posture attributes on each matched device.

The integration writes the following device posture attributes to matched devices:

\[Missing snippet: attributes-jamfpro.mdx]

## Prerequisites

Before you can set up the Jamf Pro integration, make sure you have:

* [Device Identity Collection][docs-device-identity-collection] enabled, and devices in your tailnet are reporting identifiers.
* A Jamf Pro account for which you have permission to create an API token.

## Create Jamf Pro API Token

To authenticate your Jamf Pro account with Tailscale, you'll need to create a Jamf Pro API Token.
The Jamf Pro integration uses these to fetch a list of devices and their data from Jamf Pro.

To create a Jamf Pro API Token:

1. In Jamf Pro, in the left-hand panel, select **Settings**.

2. Select **API roles and clients**.

3. Select **+ New** in the upper right corner.

4. Add a Display Name for the API role and add "Read Computers" to **Privileges**  and then select **Save**.

5. Go back to the **API roles and clients** screen and select **API Clients** and select **+ New** in the upper right corner.

6. Add a Display Name for the API Client and select the API Role created in the previous step, toggle **Enable API client**, and then select **Save**.

   *（图：The Jamf Pro Add an API client dialog）*

7. Select **Generate client secret** and select **Create secret** in the pop-up dialog. Make sure to copy the **Client ID** and **Client Secret** for use in the next section.

## Configure Jamf Pro posture integration

To configure Tailscale to fetch data about devices from Jamf Pro:

1. Open the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the Tailscale admin console.

2. Under the **Device Posture Integrations** section, locate the Jamf Pro integration, then select **Connect**.

3. Enter your **Jamf API URL**, the URL you use to access the Jamf Pro console.

4. Enter your **Client ID**.

5. Enter your **Client Secret**.

   *（图：The configuration screen for connecting to Jamf Pro from the Tailscale admin console.）*

6. Select **Connect to Jamf**.

## Review the integration status

Next, check to ensure the Jamf Pro integration has run successfully.

1. Go to the **Device Posture Integrations** section of the [Device management](https://console.tailscale.com/admin/settings/device-management) page.
2. Locate the Jamf Pro integration under the **Integrations** section.

After the Jamf Pro integration runs successfully, it shows the time of the most recent sync, the number of synced devices, and any errors that occurred while synchronizing.

*（图：Integrations: Jamf Pro: Last sync 4 minutes ago, 1 match between 2 Tailscale devices with identifies and 3 Jamf devices）*

## Check device attributes

After you set up the Jamf Pro integration, you can confirm that Tailscale is writing the new device attributes for your Jamf Pro devices from the Tailscale admin console.

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the Tailscale admin console.
2. Select a device to inspect.
3. The device attributes for the device are in the **Machine Details** section. This should include the set of `jamfPro:` attributes listed previously.

*（图：View of the machine attributes in the Machines page.）*

> **Tip:**
>
> You can also check device attributes using the [Tailscale API][co-device-posture-get-via-api].

## Adjust Tailscale access rules

After you set up the Jamf Pro posture integration, and your devices have device posture attributes that reflect their signals as reported by Jamf Pro, you can use those device posture attributes as part of your posture rules.

For example, to only permit access to `tag:production` from devices that are actively managed and supervised by Jamf Pro, you can create a new posture and use it as part of a corresponding access rule:

```json
"postures": {
  "posture:trusted": [
    "jamfPro:remoteManaged == true",
    "jamfPro:supervised == true",
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

[xt-jamfpro]: https://www.jamf.com/products/jamf-pro/
