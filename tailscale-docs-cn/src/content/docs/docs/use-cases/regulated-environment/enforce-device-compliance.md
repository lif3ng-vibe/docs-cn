---
title: "Enforce device compliance before granting access"
description: "In regulated environments, verifying that a device meets security standards before it can reach sensitive resources is a core requirement. Traditional approaches rely on VPN concentrators paired with "
---

Last validated May 18, 2026

> **Note:**
>
> Featured solution guide:
>
> [**Protect production PostgreSQL databases from unencrypted MacBooks**](/docs/solutions/protect-postgresql-unencrypted-macbooks) — Use grants to automatically route PostgreSQL traffic based on MacBook encryption status, providing direct access for encrypted devices while monitoring unencrypted device connections.

In regulated environments, verifying that a device meets security standards before it can reach sensitive resources is a core requirement. Traditional approaches rely on VPN concentrators paired with Network Access Control (NAC) appliances, adding complexity and single points of failure.

Tailscale's [device posture][docs-device-posture] feature lets you collect security attributes from every device in your tailnet, such as OS version, disk encryption status, or EDR health scores, and enforce those attributes directly in your access rules. Devices that fall out of compliance automatically lose access, with no manual intervention required.

## Enable device identity collection

Device identity collection gathers serial numbers and other identifiers from devices in your tailnet. These identifiers are used to match devices against third-party security tools such as [EDR and MDM][docs-device-posture-mdm] platforms.

1. Open the Tailscale admin console and select **Device Management** > **Device Posture Integrations**.

2. Toggle **Device Identity Collection** to on. This requires [Admin](/docs/reference/user-roles) privileges.

3. Opt in each device to identity reporting. Run the following command on each device:

#### Linux

```bash
sudo tailscale set --posture-checking=true
```

#### macOS

```bash
tailscale set --posture-checking=true
```

#### Windows

```powershell
tailscale set --posture-checking=true
```

> **Tip:**
>
> For managed fleets, deploy the `PostureChecking` system policy via your MDM solution instead of running the CLI command on each device individually.

## Define posture conditions in the policy file

Posture conditions are named sets of assertions about device attributes. Define them in the `postures` section of your [tailnet policy file][docs-tailnet-policy-file]. This requires an understanding of [tailnet policy file syntax][docs-tailnet-policy-syntax], particularly the `postures` and `grants` sections.

### Example: Built-in attributes only

This posture requires devices to run a recent, stable version of Tailscale:

```json
"postures": {
  "posture:upToDate": [
    "node:tsReleaseTrack == 'stable'",
    "node:tsVersion >= '1.60'"
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### (Optional) Add third-party integration attributes

Built-in posture attributes like `node:os` and `node:tsVersion` are available on every plan. For richer compliance signals, such as EDR health scores, MDM enrollment status, or disk encryption state, connect a [third-party integration][docs-device-posture-mdm] in the admin console under **Device Management** > **Device Posture Integrations**.

> **Note:** Third-party posture integrations are available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

The following examples show posture conditions that use integration attributes from [CrowdStrike Falcon][docs-crowdstrike] and [Microsoft Intune][docs-intune].

#### CrowdStrike Zero Trust Assessment score

```json
"postures": {
  "posture:trustedEndpoint": [
    "falcon:ztaScore >= 70"
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

#### Intune compliance and encryption

```json
"postures": {
  "posture:intuneManagedDevice": [
    "intune:complianceState == 'compliant'",
    "intune:isEncrypted == true"
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

#### Per-OS requirements with integrations

When your fleet includes multiple operating systems, define a separate posture for each and combine them in your access rules:

```json
"postures": {
  "posture:compliantMac": [
    "node:os == 'macos'",
    "node:osVersion >= '14.0.0'",
    "intune:complianceState == 'compliant'",
    "intune:isEncrypted == true"
  ],
  "posture:compliantWindows": [
    "node:os == 'windows'",
    "intune:complianceState == 'compliant'",
    "intune:isEncrypted == true"
  ],
  "posture:compliantLinux": [
    "node:os == 'linux'",
    "node:tsReleaseTrack == 'stable'",
    "node:tsVersion >= '1.60'"
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

> **Note:**
>
> All conditions within a single posture must be met for it to match (AND logic). If an attribute is unset on a device, the posture will not match that device, even with negative operators like `!=`.

## Apply posture conditions to access rules

Use `srcPosture` in your [grant][docs-grants] rules to restrict access to resources based on device compliance. Only devices that satisfy the posture conditions can reach the destination.

```json
"grants": [
  {
    "src": ["autogroup:member"],
    "dst": ["tag:production"],
    "ip": ["*"],
    "srcPosture": ["posture:compliantMac", "posture:compliantWindows", "posture:compliantLinux"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

When you list multiple postures in `srcPosture`, a device only needs to match **any one** of them (OR logic). In the example above, a macOS device only needs to satisfy `posture:compliantMac`.

### Set a default posture for all rules

To enforce a baseline across your entire tailnet without adding `srcPosture` to every rule, use `defaultSrcPosture`:

```json
"defaultSrcPosture": [
  "posture:compliantMac",
  "posture:compliantWindows",
  "posture:compliantLinux"
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

Any grant rule that does not specify its own `srcPosture` inherits the default. Rules that do specify `srcPosture` override it entirely. The default is not additive.

> **Tip:**
>
> To intentionally allow less-restricted access for a specific rule, set `srcPosture` to an empty list `[]` on that rule to override the default.

## Verify compliance status

After configuring posture conditions, confirm that devices are reporting the expected attributes.

1. In the admin console, open the [Machines](https://console.tailscale.com/admin/machines) page.
2. Select a device to view its details.
3. Check the **Posture attributes** section to find the attributes currently reported by the device.

You can also inspect a device's attributes from the command line:

```bash
tailscale status --json | jq '.Self.CapMap'
```

Or query attributes via the Tailscale API:

```bash
curl -s -H "Authorization: Bearer $TS_API_KEY" \
  "https://api.tailscale.com/api/v2/device/{deviceId}/attributes"
```

If a device is missing expected attributes, verify that:

* Device identity collection is enabled and the device has opted in.
* The relevant integration is connected and syncing successfully.
* The device's Tailscale client is version 1.52 or later.

> **Note:**
>
> Posture conditions only apply to traffic from native Tailscale nodes within the same tailnet. Shared nodes and devices accessing resources through a subnet router bypass posture checks and are evaluated using IP-based rules only.

[docs-crowdstrike]: /docs/integrations/crowdstrike-zta

[docs-device-posture]: /docs/features/device-posture

[docs-device-posture-mdm]: /docs/features/device-posture/integrations

[docs-grants]: /docs/features/access-control/grants

[docs-intune]: /docs/integrations/mdm/intune

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet-policy-syntax]: /docs/reference/syntax/policy-file
