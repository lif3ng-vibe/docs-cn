---
title: "Restrict device access with SentinelOne"
description: "Use signals reported by SentinelOne agents as device posture attributes for use in access rules."
---

Last validated Jan 28, 2026

> **Note:** This integration is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

SentinelOne collects a series of signals from its agents that can be used to determine the security posture of a device. Tailscale can fetch these signals from SentinelOne and use them as device posture attributes in access rules, which can allow organizations to grant access to sensitive resources only to devices that have a high enough level of trust.

You can achieve this Tailscale's [device posture management][docs-device-posture] features:

* SentinelOne posture integration, which synchronizes signals from SentinelOne to device posture attributes in Tailscale.
* [Device Identity Collection][docs-device-identity-collection], which collects identifiers (for example, serial numbers), used to match devices in Tailscale to devices in SentinelOne.
* [Posture conditions in access rules][docs-device-posture-postures-and-conditions], which lets you configure access restrictions based on device attributes.

This guide explains how to enable Device Identity collection for your Tailscale network (tailnet) and configure SentinelOne posture integration.

## What is SentinelOne posture integration?

The SentinelOne integration syncs data between SentinelOne and Tailscale on a recurring schedule.
During each sync, Tailscale performs the following actions:

1. Fetches a list of agents and their reported data from your SentinelOne account.
2. Matches SentinelOne agents to devices in your tailnet based on serial numbers.
3. Writes the SentinelOne data to device posture attributes on each matched device.

The integration writes the following device posture attributes to matched devices:

\[Missing snippet: attributes-sentinel-one.mdx]

## Prerequisites

Before you can set up the SentinelOne integration, make sure you have:

* [Device Identity Collection][docs-device-identity-collection] enabled, and devices in your tailnet are reporting identifiers.
* A SentinelOne account for which you have permission to create an API token.

## Create SentinelOne Service User and API Token

To authenticate your SentinelOne account with Tailscale, you'll need to create a SentinelOne User and API token.
The SentinelOne integration uses these to fetch a list of agents and their data from SentinelOne.

To create a SentinelOne User and API token:

1. In SentinelOne, in the left-hand panel, select **Settings**.

2. From the top menu, select **Users** and then in the left-hand panel, select **Service Users**.

3. Select **Actions** and then select **Create New Service User**.

4. Add a name and expiration date for the Service User and select **Next**.

   *（图：The SentinelOne Create New Service User dialog）*

5. Choose the site or account that the Service User will have access to and select **Create**.

6. The **API Token** will be shown once, make sure to copy it for use later.

Also make a note of the **Base URL** (for example, `https://example.sentinelone.net/`).

## Configure SentinelOne posture integration

To configure Tailscale to fetch data about agents from SentinelOne:

1. Open the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the Tailscale admin console.

2. Under the **Device Posture Integrations** section, locate the SentinelOne integration, then select **Connect**.

3. Enter your **SentinelOne URL**, the URL you use to access the SentinelOne console.

4. Enter your **API Token**.

   *（图：The configuration screen for connecting to SentinelOne from the Tailscale admin console.）*

5. Select **Connect to SentinelOne**.

## Review the integration status

Next, check to ensure the SentinelOne integration has run successfully.

1. Go to the **Device Posture Integrations** section of the [Device management](https://console.tailscale.com/admin/settings/device-management) page.
2. Locate the SentinelOne integration under the **Integrations** section.

After the SentinelOne integration runs successfully, it shows the time of the most recent sync, the number of synced devices, and any errors that occurred while synchronizing.

*（图：Integrations: SentinelOne: Last sync 4 minutes ago, 1 match between 2 Tailscale devices with identifies and 3 SentinelOne agents.）*

## Check device attributes

After you set up the SentinelOne integration, you can confirm that Tailscale is writing the new device attributes for your SentinelOne devices from the Tailscale admin console.

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the Tailscale admin console.
2. Select a device to inspect.
3. The device attributes for the device are in the **Machine Details** section. This should include the set of `sentinelOne:` attributes listed previously.

*（图：View of the machine attributes in the Machines page.）*

> **Tip:**
>
> You can also check device attributes using the [Tailscale API][co-device-posture-get-via-api].

## Adjust Tailscale access rules

After you set up the SentinelOne posture integration, and your devices have device posture attributes that reflect their signals as reported by SentinelOne, you can use those device posture attributes as part of your posture rules.

For example, to only permit access to `tag:production` from devices that have an active SentinelOne agent, a good operational state, and have zero active threats, you can create a new posture and use it as part of a corresponding access rule:

```json
"postures": {
  "posture:trusted": [
    "sentinelOne:operationalState == 'na'",
    "sentinelOne:activeThreats == 0",
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

## Limitations

* We have observed that SentinelOne does not report serial numbers for some machines running Linux. Without serial number details, Tailscale will not be able to populate device posture attributes for such machines.

\[Missing snippet: auditlogs-integrations.mdx]

[co-device-posture-get-via-api]: https://tailscale.com/api#tag/devices/GET/device/{deviceId}/attributes

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture-postures-and-conditions]: /docs/features/device-posture/postures-in-access-rules

[docs-device-posture]: /docs/features/device-posture
