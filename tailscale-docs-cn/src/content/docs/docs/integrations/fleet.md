---
title: "Restrict device access with Fleet"
description: "Use signals reported by Fleet as a device posture attribute for use in access rules."
---

Last validated Jan 29, 2026

> **Note:** This integration is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

[Fleet Device Management][xt-fleet] collects a series of signals from its agent installed on each device that can be used to determine the security posture of a device.

Tailscale can fetch these signals from Fleet and use them as device posture attributes in access rules, which can then be used by organizations to grant access to sensitive resources only to devices that have a high level of trust.

You can achieve this with Tailscale's [device posture management][docs-device-posture] features:

* [Device Identity Collection][docs-device-identity-collection], which collects identifiers (for example, serial numbers), used to match devices in Tailscale to devices in Fleet.
* Fleet posture integration, which synchronizes signals from Fleet to device posture attributes in Tailscale.
* [Posture conditions in access rules][docs-device-posture-postures-and-conditions], which lets you configure access restrictions based on device attributes.

This guide explains how to enable Device Identity collection for your Tailscale network (tailnet) and configure Fleet posture integration.

## What is Fleet posture integration?

The Fleet integration syncs data between Fleet and Tailscale on a recurring schedule.
During each sync, Tailscale performs the following actions:

1. Fetches a list of hosts and their reported data from your Fleet account.
2. Matches Fleet devices to devices in your tailnet based on serial numbers.
3. Writes the Fleet data to device posture attributes on each matched device.

The integration writes the following device posture attributes to matched devices:

\[Missing snippet: attributes-fleet.mdx]

## Prerequisites

Before you set up the Fleet integration, make sure you have:

* [Device Identity Collection][docs-device-identity-collection] enabled, with devices in your tailnet reporting identifiers.
* A Fleet user account with the [Admin role][xt-fleet-roles] to create an API-only user for the integration.
* A Tailscale user account with the [Admin role][docs-user-roles-admin] in the tailnet where you want to configure the integration.

## Configure the Fleet integration

Tailscale uses a Fleet API token to authenticate with Fleet and fetch a list of devices and their data.

To connect Fleet to Tailscale, first create an API-only user and generate its API token in Fleet. Then enter the token and your Fleet URL in the Tailscale admin console. Tailscale uses these details to fetch device data from Fleet.

In Fleet:

1. Create an API-only user for the Tailscale integration.
2. Assign the Admin role to that API-only user in Fleet.
3. Generate an API token for that API-only user in Fleet.

In Tailscale:

1. Open the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the admin console.
2. Under **Device Posture Integrations**, locate the Fleet integration and select **Connect**.
3. Enter your **Fleet URL** and the **API Token** generated in Fleet.
4. Select **Connect to Fleet**.

Refer to the [Fleet documentation][xt-fleet-api-only-user] for instructions on creating an API-only user and generating an API token.

## Create Fleet policies

[Fleet policies][xt-fleet-policies] let you monitor whether your devices meet specific security and compliance criteria.
These policies are specific to your Fleet account.

The Fleet integration can add [device attributes][docs-node-attributes] to devices that are passing Fleet policies.

To enable adding these device attributes, add the string `Tailscale: fleetPolicy:{attributeName}` to your Fleet policy description.

* For each Fleet policy a device passes, the Fleet integration will add a `fleetPolicy:{attributeName} = true` device attribute to that device.
* For each Fleet policy a device fails, the Fleet integration will add a `fleetPolicy:{attributeName} = false` device attribute to that device.
* If multiple Fleet policies have the same `Tailscale: fleetPolicy:{attributeName}` string in their policy description, the device attribute will be `true` if any of the matching policies are passing, otherwise false.

You can check for the presence of a given Fleet policy in a device's attributes in access rules, then adjust its access accordingly.

*（图：The Fleet configuration panel showing a policy which includes \`Tailscale: fleetPolicy:builtinAntivirus\` to set a \`fleetPolicy:builtinAntivirus\` device attribute on passing devices.）*

## Configure Fleet posture integration

To configure Tailscale to fetch data about devices from Fleet:

1. Open the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the Tailscale admin console.

2. Under the **Device Posture Integrations** section, locate the Fleet integration, then select **Connect**.

3. Enter your **Fleet URL** and **API Token**.

   *（图：The configuration screen for connecting to Fleet from the Tailscale admin console.）*

4. Select **Connect to Fleet**.

## Review the integration status

Next, check to make sure the Fleet integration has run successfully.

1. Go to the **Device Posture Integrations** section of the [Device management](https://console.tailscale.com/admin/settings/device-management) page.
2. Locate the Fleet integration under the **Integrations** section.

After the Fleet integration runs successfully, it shows the time of the most recent sync, the number of synced devices, and any errors that occurred while synchronizing.

*（图：Integrations: Fleet: Last sync 4 minutes ago, 1 match between 2 Tailscale devices with identifies and 4 Fleet hosts）*

## Check device attributes

After you set up the Fleet integration, you can confirm that Tailscale is writing the new device attributes for your Fleet devices from the Tailscale admin console.

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the Tailscale admin console.
2. Select a device to inspect.
3. Check the device attributes for the device in the **Machine Details** section. This section should include the set of `fleet:` and `fleetPolicy:` attributes listed previously.

*（图：View of the machine attributes in the Machines page.）*

> **Tip:**
>
> You can also check device attributes using the [Tailscale API][co-device-posture-get-via-api].

## Adjust Tailscale access rules

After you set up the Fleet posture integration, and your devices have device posture attributes that reflect their signals as reported by Fleet, you can use those device posture attributes as part of your posture rules.

For example, to only permit access to `tag:production` from devices that are managed by Fleet, you can create a new posture and use it as part of a corresponding access rule:

```json
"postures": {
  "posture:managed": [
    "fleet:present",
  ],
},
"grants": [
  {
    "src": ["autogroup:member"],
    "dst": ["tag:production"],
    "ip": ["*"],
    "srcPosture": ["posture:managed"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

\[Missing snippet: sync-schedule.mdx]

\[Missing snippet: auditlogs-integrations.mdx]

[co-device-posture-get-via-api]: https://tailscale.com/api#tag/devices/GET/device/{deviceId}/attributes

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture]: /docs/features/device-posture

[docs-device-posture-postures-and-conditions]: /docs/features/device-posture/postures-in-access-rules

[docs-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-user-roles-admin]: /docs/reference/user-roles#admin

[xt-fleet]: https://fleetdm.com/

[xt-fleet-api-only-user]: https://fleetdm.com/guides/fleetctl#using-fleetctl-with-an-api-only-user

[xt-fleet-policies]: https://fleetdm.com/securing/what-are-fleet-policies

[xt-fleet-roles]: https://fleetdm.com/guides/role-based-access
