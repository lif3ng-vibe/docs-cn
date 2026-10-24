---
title: "Use Device Identity Collection"
description: "Device Identity Collection collects identifiers such as serial numbers and MAC addresses from devices in your Tailscale network (known as a tailnet). It is required for device posture integrations lik"
---

Last validated Jan 5, 2026

> **Note:** Device Identity Collection is available for [all plans](https://tailscale.com/pricing).

Device Identity Collection collects identifiers such as serial numbers and MAC addresses from devices in your Tailscale network (known as a tailnet). It is required for device posture integrations like [CrowdStrike Falcon][docs-crowdstrike-zta], and can be useful for correlating your devices between Tailscale and other systems.

This document provides instructions on:

* How to enable Device Identity Collection for your tailnet.
* How to enable Device Identity Collection on machines in your tailnet.

## Prerequisites

To configure the machines in your tailnet you will need either:

* access to the machine to run the `tailscale` CLI; or
* a Mobile Device Management (MDM) system.

## Enabling Device Identity Collection for your tailnet

1. Open the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the Tailscale admin console.
2. Under the **Device Posture Integrations** section, select the toggle under **Device Identity Collection**.

*（图：Device Identity Collection: toggle 'disabled'）*

## Enabling Device Identity Collection for devices in your tailnet

Devices in your tailnet need to be individually opted-in to reporting their identity.

> **Note:**
>
> Device identity collection was added in Tailscale 1.52.

There are two ways to opt-in a device to reporting its identity: by setting a system policy (for example, by using an MDM), or by using the CLI.

### Enabling Device Identity Collection by using system policies

You can opt a device in to identity reporting by [setting the policy key][docs-mdm-keys] `PostureChecking` to `always`. This lets you opt-in devices using an MDM or configuration management system. Note that the Tailscale client needs to be restarted for this change to take effect. For more information on setting system policies, refer to [Customize Tailscale using system policies][docs-mdm-keys].

Using system policies is the recommended way to enable device identity collection on macOS and Windows. It takes priority over configuration set by using the CLI.

### Enabling Device Identity Collection by using the CLI

You can also opt-in a device by running the [`tailscale set`][docs-cli-set] CLI command on it and then reconnecting the client:

#### Linux

```shell
sudo tailscale set --posture-checking=true
sudo tailscale down
sudo tailscale up
```

#### macOS

```shell
tailscale set --posture-checking=true
tailscale down
tailscale up
```

or

```shell
/Applications/Tailscale.app/Contents/MacOS/Tailscale set --posture-checking=true
/Applications/Tailscale.app/Contents/MacOS/Tailscale down
/Applications/Tailscale.app/Contents/MacOS/Tailscale up
```

To access the `tailscale` CLI on macOS, refer to the [CLI guide][docs-cli].

#### Windows

```powershell
tailscale set --posture-checking=true
tailscale down
tailscale up
```

Using the CLI command is the only way to opt-in a Linux device to identity collection.

## Check collection progress

In the **Device Posture** section of the [Device management](https://console.tailscale.com/admin/settings/device-management) page, you will find a summary of serial number collection.

You can select **Inspect** to review which machines have a particular status, for example, to find machines that have not been opted in yet.

*（图：Device Identity Collection: toggle 'enabled'. 22 of 582 devices opted-in. 21 returned serial numbers (inspect link). 1 returned only invalid serial numbers (inspect link). 196 did not have posture collection enabled (inspect link). 364 are yet to be checked (inspect link). Monitor changes to device identities in the audit logs.）*

## Check device identifiers

You can review identifiers for your devices on the **Machine page** of the admin console.

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
2. Select a machine you want to inspect.
3. Review the device identity and collection status in the **Machine Details** section.

*（图：Machine details: Serial number: IB2HQE3XWO）*

Device identity is also available from the [device API][co-api-get-device].

By default, Device Identity Collection fetches device serial numbers. Some posture integrations, like [CrowdStrike Falcon][docs-crowdstrike-zta], can also use MAC addresses for device matching, which will be collected if required by such an integration.

## Limitations

* On iOS, tvOS, and Android, third-party apps like Tailscale cannot access the device serial number. On iOS or tvOS, an MDM solution can provide a serial number to the Tailscale client by using the `DeviceSerialNumber` [MDM key][docs-mdm-keys-sn].

[co-api-get-device]: https://tailscale.com/api#tag/devices/GET/device/%7BdeviceId%7D

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-cli]: /docs/reference/tailscale-cli

[docs-crowdstrike-zta]: /docs/integrations/crowdstrike-zta

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm-keys-sn]: /docs/features/tailscale-system-policies#specify-the-device-serial-number
