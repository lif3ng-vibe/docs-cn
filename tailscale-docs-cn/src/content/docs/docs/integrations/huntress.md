---
title: "Restrict device access with Huntress"
description: "Use signals reported by Huntress as device posture attributes for use in access rules."
---

Last validated Feb 2, 2026

> **Note:** This integration is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

[Huntress Managed EDR][xt-huntress] is a cybersecurity solution that collects signals from enrolled devices (from its agent installed on each device).

Tailscale can fetch these signals from Huntress and use them as device posture attributes in access rules, which you can then use to only grant access to sensitive resources based on each device's level of trust.

You can achieve this Tailscale's [device posture management][docs-device-posture] features:

* [Device Identity Collection][docs-device-identity-collection], which collects identifiers (for example, serial numbers), used to match devices in Tailscale to devices in Huntress.
* Huntress posture integration, which synchronizes signals from Huntress to device posture attributes in Tailscale.
* [Posture conditions in access rules][docs-device-posture-postures-and-conditions], which lets you configure access restrictions based on device attributes.

This guide explains how to enable Device Identity collection for your tailnet and configure Huntress posture integration.

## What is Huntress posture integration?

The integration syncs data between Huntress and Tailscale on a recurring schedule.
During each sync, Tailscale performs the following actions:

1. Fetches a list of agents and their reported data from your Huntress account.
2. Matches Huntress devices to devices in your tailnet based on serial numbers.
3. Writes the Huntress data to device posture attributes on each matched device.

The integration writes the following device posture attributes to matched devices:

| **Attribute key**               | **Description**                        | **Allowed values**                                                        |
| ------------------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| `huntress:defenderStatus`       | Status of Microsoft Defender AV        | `Incompatible`, `Unhealthy`, `Protected`, `Unmanaged`                     |
| `huntress:defenderPolicyStatus` | Policy status of Microsoft Defender AV | `Unknown`, `Non Compliant`, `Compliant`, `Pending`, `Gpo Conflict`        |
| `huntress:firewallStatus`       | Whether the firewall is enabled        | `Disabled`, `Enabled`, `Pending Isolation`, `Isolated`, `Pending Release` |

## Prerequisites

Before you can set up the Huntress integration, make sure you have:

* [Device Identity Collection][docs-device-identity-collection] is enabled, and devices in your tailnet are reporting identifiers
* A Huntress account for which you have permission to create an API key and secret.

## Create Huntress API key and API secret

To authenticate your Huntress account with Tailscale, you'll need to create a Huntress API key and secret. The Huntress integration uses these to fetch a list of agents and their data from Huntress.

To create a Huntress API key and secret:

1. Go to the Huntress website and log in to your account.

2. In the top right-hand menu, select **API Credentials**.

3. Under **User API Credentials**, select **+ Add**.

4. Under **User**, select a user who has permission to access all your Huntress agents, and select **Create**. Tailscale recommends using a dedicated read-only user for your Tailscale API key.

5. Make sure to copy the **API Key** and **API Secret**. You need these to configure the Huntress integration in the Tailscale admin console.

## Find your Huntress Organization ID

You can specify a Huntress Organization ID to limit the integration to a specific organization associated with your Huntress account.You might consider doing this if you have multiple organizations within Huntress, but only need to connect one of them to Tailscale.

To find your Huntress organization ID:

1. Go to the Huntress website and log in to your account.
2. In the top right-hand menu, select **Organizations**.
3. In the list of organizations, select the organization you plan to use with Tailscale.
4. In the URL, look for the number after `/org/`. For example, if the URL is `https://example.huntress.io/org/123456`, the Organization ID is `123456`.
5. Save this ID so you can use it when you configure the Huntress integration in Tailscale.

## Configure Huntress posture integration

To configure Tailscale to fetch data about devices from Huntress:

1. Open the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the Tailscale admin console.
2. Under the **Device Posture Integrations** section, locate the Huntress integration, then select **Connect**.
3. Enter your **API Key** and **API Secret**.
4. (Optional) Enter your [**Organization ID**][ar-find-your-huntress-organization-id] to limit the integration to a specific organization associated with your Huntress account.
5. Select **Connect to Huntress**.

## Check the integration status

Next, check to ensure the Huntress integration has run successfully.

1. Go to the **Device Posture Integrations** section of the [Device management](https://console.tailscale.com/admin/settings/device-management) page.
2. Locate the Huntress integration under the **Integrations** section.

After the Huntress integration runs successfully, it shows the time of the most recent sync, the number of synced devices, and any errors that occurred while synchronizing.

*（图：Integrations: Huntress: Last sync 4 minutes ago, 1 match between 2 Tailscale devices with identities and 3 Huntress agents.）*

## Check device attributes

After you set up the Huntress integration, you can confirm that Tailscale is writing the new device attributes for your Huntress devices from the Tailscale admin console.

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the Tailscale admin console.
2. Select a device to inspect.
3. The device attributes for the device are in the **Machine Details** section. This should include the set of `huntress:` attributes listed previously.

*（图：View of the machine attributes in the Machines page.）*

> **Tip:**
>
> You can also check device attributes using the [Tailscale API][co-device-posture-get-via-api].

## Adjust Tailscale access rules

After you configure Huntress posture integration, and your devices have device posture attributes that reflect their signals as reported by Huntress, you can use those device posture attributes as part of your posture rules.

For example, to only permit access to `tag:production` from devices that have antivirus (AV) scanning and firewall enabled, you can create a new posture and use it as part of a corresponding access rule:

```json
"postures": {
  "posture:trusted": [
    "huntress:defenderStatus == 'Healthy'",
    "huntress:firewallStatus == 'Enabled'",
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

[ar-find-your-huntress-organization-id]: #find-your-huntress-organization-id

[co-device-posture-get-via-api]: https://tailscale.com/api#tag/devices/GET/device/{deviceId}/attributes

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture]: /docs/features/device-posture

[docs-device-posture-postures-and-conditions]: /docs/features/device-posture/postures-in-access-rules

[xt-huntress]: https://www.huntress.com/platform/managed-edr
