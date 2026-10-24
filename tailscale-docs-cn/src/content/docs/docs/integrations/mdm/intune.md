---
title: "Restrict device access with Microsoft Intune"
description: "[Microsoft Intune][xt-intune] collects a series of signals from the MDM profile installed on devices and these signals can be used to determine the security posture of a device. Tailscale can fetch th"
---

Last validated Jan 28, 2026

> **Note:** This integration is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

[Microsoft Intune][xt-intune] collects a series of signals from the MDM profile installed on devices and these signals can be used to determine the security posture of a device. Tailscale can fetch these signals from Intune and use them as device posture attributes in access rules, which can allow organizations to grant access to sensitive resources only to devices that have a high enough level of trust.

You can achieve this Tailscale's [device posture management][docs-device-posture] features:

* [Device Identity Collection][docs-device-identity-collection], which collects identifiers (for example, serial numbers), used to match devices in Tailscale to devices in Intune.
* Intune posture integration, which synchronizes signals from Intune to device posture attributes in Tailscale.
* [Posture conditions in access rules][docs-device-posture-postures-and-conditions], which lets you configure access restrictions based on device attributes.

This guide explains how to enable Device Identity collection for your Tailscale network (tailnet) and configure Microsoft Intune posture integration.

## What is Intune posture integration?

The Intune integration syncs data between Intune and Tailscale on a recurring schedule.
During each sync, Tailscale performs the following actions:

1. Fetches a list of hosts and their reported data from your Intune account.
2. Matches Intune devices to devices in your tailnet based on serial numbers.
3. Writes the Intune data to device posture attributes on each matched device.

The integration writes the following device posture attributes to matched devices:

\[Missing snippet: attributes-intune.mdx]

## Prerequisites

Before you can set up the Microsoft Intune integration, make sure you have:

* [Device Identity Collection][docs-device-identity-collection] enabled, and devices in your tailnet are reporting identifiers.
* An Azure Application credential to connect to Microsoft Intune.

## Create Azure Application credential to connect Intune

To authenticate your Intune account with Tailscale, you'll need to create a set of [Azure Application credentials][xt-microsoft-azure-portal].
The Microsoft Intune integration uses these credentials to connect to the [Microsoft Graph API][xt-microsoft-graph-api] and fetch a list of devices and their data from Intune.

To create an Azure Application and credentials:

1. In [Azure Portal][xt-microsoft-azure-portal], in the **Azure Services** menu, select **App registrations**.

2. Select **New registration**.

3. Enter a name for the application, for example, `Tailscale` and select **Register**. Take note of the **Application (Client) ID** and **Directory (Tenant) ID** for later.

4. Under **Essentials**, select **Add a certificate or secret**.

5. Select **New client secret**.

6. Enter a description for the secret, select an expiration period, and select **Add**. Take note of the **Value** for later.

7. Under **API permissions**, select **Add a permission**.

8. Select **Microsoft Graph**.

9. Select **Application permissions**.

10. Search for and select **DeviceManagementManagedDevices.Read.All** and select **Add permissions**.

11. Select **Grant admin consent for *your-organization*** and select **Yes**.

## Configure Intune posture integration

To configure Tailscale to fetch data about devices from Intune:

1. Open the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the Tailscale admin console.
2. Under the **Device Posture Integrations** section, locate the Intune integration, then select **Connect**.
3. Select your **Microsoft Region**, the region where your Intune account is located.
4. Enter your **Application (Client) ID**, **Directory (Tenant) ID** and **Client Secret**.

   *（图：The configuration screen for connecting to Intune from the Tailscale admin console.）*
5. Select **Connect to Intune**.

## Review the integration status

Next, check to ensure the Intune integration has run successfully.

1. Go to the **Device Posture Integrations** section of the [Device management](https://console.tailscale.com/admin/settings/device-management) page.
2. Locate the Intune integration under the **Integrations** section.

After the Intune integration runs successfully, it shows the time of the most recent sync, the number of synced devices, and any errors that occurred while synchronizing.

*（图：Integrations: Microsoft Intune: Last sync 4 minutes ago, 1 match between 2 Tailscale devices with identifies and 3 Intune devices）*

## Check device attributes

After you set up the Microsoft Intune integration, you can confirm that Tailscale is writing the new device attributes for your Intune devices from the Tailscale admin console.

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the Tailscale admin console.
2. Select a device to inspect.
3. The device attributes for the device are in the **Machine Details** section. This should include the set of `intune:` attributes listed previously.

*（图：View of the machine attributes in the Machines page.）*

> **Tip:**
>
> You can also check device attributes using the [Tailscale API][co-device-posture-get-via-api].

## Adjust Tailscale access rules

After you set up the Intune posture integration, and your devices have device posture attributes that reflect their signals as reported by Intune, you can use those device posture attributes as part of your posture rules.

For example, to only permit access to `tag:production` from devices that Intune reports as compliant and supervised by Intune, you can create a new posture and use it as part of a corresponding access rule:

```json
"postures": {
  "posture:trusted": [
    "intune:complianceState == 'compliant'",
    "intune:isSupervised == true",
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

We have observed that Intune does not report serial numbers for some machines running Linux. Without serial number details, Tailscale will not be able to populate device posture attributes for such machines.

\[Missing snippet: auditlogs-integrations.mdx]

[co-device-posture-get-via-api]: https://tailscale.com/api#tag/devices/GET/device/{deviceId}/attributes

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture-postures-and-conditions]: /docs/features/device-posture/postures-in-access-rules

[docs-device-posture]: /docs/features/device-posture

[xt-intune]: https://www.microsoft.com/en-us/security/business/microsoft-intune

[xt-microsoft-azure-portal]: https://portal.azure.com/

[xt-microsoft-graph-api]: https://learn.microsoft.com/en-us/graph/use-the-api
