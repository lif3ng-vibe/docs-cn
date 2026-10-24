---
title: "Restrict device access with CrowdStrike ZTA scores"
description: "Use Zero Trust Assessment (ZTA) scores reported by CrowdStrike Falcon as a device posture attribute for use in access rules."
---

Last validated Jan 28, 2026

> **Note:** This integration is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

CrowdStrike Falcon [Zero Trust Assessment][xt-crowdstrike-zero-trust] calculates a numeric trust score (from 0 to 100) for each device that runs a Falcon agent. Using that score as part of access rules in Tailscale can allow organizations to grant access to sensitive resources only to devices that have a high enough level of trust.

You can achieve this with Tailscale's [device posture][docs-device-posture] features:

* CrowdStrike Falcon posture integration, which synchronizes Zero Trust Assessment scores from CrowdStrike to device posture attributes in Tailscale.
* [Device Identity Collection][docs-device-identity-collection], which collects identifiers such as serial numbers and MAC addresses, used to match devices in Tailscale to devices in CrowdStrike.
* [Posture conditions in access rules][docs-device-posture-postures-and-conditions], which lets you configure access restrictions based on device attributes.

This guide explains how to enable Device Identity collection for your Tailscale network (tailnet) and configure CrowdStrike Falcon posture integration.

## What is CrowdStrike Falcon posture integration?

The CrowdStrike Falcon integration syncs data between Falcon and Tailscale on a recurring schedule.
During each sync, Tailscale performs the following actions:

1. Fetches a list of hosts and their ZTA score from your Falcon account.
2. Matches Falcon hosts to devices in your tailnet based on serial numbers.
3. Writes the Falcon data to a device posture attribute on each matched device.

The integration writes the following device posture attribute to matched devices:

\[Missing snippet: attributes-falcon.mdx]

## Prerequisites

Before you can set up the CrowdStrike Falcon integration, make sure you have:

* [Device Identity Collection][docs-device-identity-collection] enabled, and devices in your tailnet are reporting identifiers.
* A CrowdStrike Falcon account for which you have permission to create an API client.

## Create CrowdStrike Falcon API credentials

To authenticate your CrowdStrike Falcon account with Tailscale, you'll need to create a CrowdStrike Falcon API client.
The Falcon integration uses these to fetch a list of hosts and their ZTA score from Falcon.

To create a CrowdStrike Falcon API client:

1. In Falcon, open **Support and resources** and then **API clients and keys**.

2. Select **Create API client**.

3. Add a name. For the **Hosts** scope add **Read**, and for the **Zero Trust** scope add **Read**.

   *（图：Create API client: Client name: Tailscale integration. Scope 'Zero Trust Assessment - Read' is enabled.）*

4. Select **Create**, then make sure to copy the displayed **Client ID** and **Client Secret**. These will be only displayed once.

Also make a note of the **Base URL** (for example, `https://api.us-2.crowdstrike.com`).

## Configure CrowdStrike Falcon posture integration

To configure Tailscale to fetch the ZTA score for hosts from CrowdStrike Falcon:

1. Open the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the Tailscale admin console.

2. Under the **Device Posture Integrations** section, locate the CrowdStrike Falcon integration, then select **Connect**.

3. Select your **CrowdStrike Cloud Region** (the **Base URL** from the API client).

4. Enter your **Client ID** and **Client Secret**.

   *（图：1. Configure a CrowdStrike OAuth client: CrowdStrike Cloud Region: US-2. Client ID and Client Secret are entered. 3. Enable device identity collection: Tailscale uses device identifiers such as serial number to link Falcon Hosts to Tailscale Machines. You already have Device Identity Collection enabled. Button: Connect to CrowdStrike Falcon.）*

5. Select **Connect to CrowdStrike Falcon**.

## Review the integration status

Next, check to ensure the CrowdStrike Falcon integration has run successfully.

1. Go to the **Device Posture Integrations** section of the [Device management](https://console.tailscale.com/admin/settings/device-management) page.
2. Locate the CrowdStrike Falcon integration under the **Integrations** section.

After the CrowdStrike Falcon integration runs successfully, it shows the time of the most recent sync, the number of synced devices, and any errors that occurred while synchronizing.

*（图：Integrations: CrowdStrike Falcon: Last sync 4 minutes ago, 1 match between 2 Tailscale devices with identifies and 3 CrowdStrike Falcon hosts.）*

## Check device attributes

After you set up the CrowdStrike Falcon integration, you can confirm that Tailscale is writing the new device attribute for your CrowdStrike Falcon devices from the Tailscale admin console.

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the Tailscale admin console.
2. Select a device to inspect.
3. The device attributes for the device are in the **Machine Details** section. This should include the `falcon:ztaScore` attribute.

*（图：Attributes. falcon:ztaScore: 64. node:os: linux. node:osVersion: 5.19.0-46-generic. node:tsReleaseTrack: stable. node:tsVersion: 1.53.20.）*

> **Tip:**
>
> You can also check device attributes using the [Tailscale API][co-device-posture-get-via-api].

## Adjust Tailscale access rules

After you set up the CrowdStrike Falcon posture integration, and your devices have device posture attributes that reflect their signals as reported by CrowdStrike Falcon, you can use those device posture attributes as part of your posture rules.

For example, to only permit access to `tag:production` from devices that have a CrowdStrike ZTA score of 70 or higher, you can create a new posture and use it as part of a corresponding access rule:

```json
"postures": {
  "posture:trusted": ["falcon:ztaScore >= 70"],
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

[xt-crowdstrike-zero-trust]: https://www.crowdstrike.com/press-releases/crowdstrike-extends-zero-trust-to-endpoint-devices
