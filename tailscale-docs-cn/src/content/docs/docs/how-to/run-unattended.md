---
title: "Keep Tailscale running when I'm not logged in to my computer"
description: "Configure your device to run Tailscale even when no users are logged in."
---

Last validated Sep 25, 2026

Keeping Tailscale running when no user is logged in lets you continue reaching a device remotely after a sign-out or restart. Whether the device stays connected to your tailnet by default depends on the operating system and how the Tailscale client runs.

> **Note:**
>
> Unattended mode is only available on Windows.

* **Linux**: The Tailscale client runs as the system daemon [`tailscaled`][docs-tailscaled] by default, so it remains available even when no users are logged in.
* **macOS**: The Tailscale client runs within the user login session. Running it as a standalone system daemon is not currently supported. You can track progress on [GitHub issue #987][xt-gh-tailscale-issue-987].
* **Windows**: The Tailscale client runs within the user login session by default. When the user signs out or the device restarts, Tailscale disconnects until a user logs in again.

To keep a Windows device accessible when no user is signed in, such as for [Windows Remote Desktop (RDP)][docs-secure-rdp-windows] access after a reboot or on multi-user Windows Server instances, enable unattended mode, also referred to as Server mode.

## Prerequisites

Before enabling unattended mode on Windows, make sure you have:

* Tailscale installed on Windows 10 or later, or Windows Server 2016 or later.
* The device authenticated and connected to your tailnet.

## Enable unattended mode

You can configure unattended mode using the Tailscale client UI, the CLI, or the [`UnattendedMode`][docs-mdm-keys-unattended] system policy.

#### Tailscale UI

1. Right-click the **Tailscale** icon in the Windows system tray.
2. Hover over **Preferences**.
3. Select **Run unattended**.
4. When prompted by the app, select **Yes** to enable unattended mode.

A check mark appears next to **Run unattended** in the **Preferences** menu when active.

#### Tailscale CLI

Open PowerShell or Command Prompt and run:

```powershell
tailscale set --unattended=true
```

If you are provisioning a new device headlessly during initial setup with an [auth key][docs-auth-keys]:

```powershell
tailscale up --unattended=true --authkey=tskey-auth-xxxxx
```

#### System policy

For centrally managed enterprise deployments, configure the `UnattendedMode` policy in the Tailscale ADMX template or Registry:

* **Registry Key**: `HKLM\Software\Policies\Tailscale`
* **Value Name**: `UnattendedMode`
* **Value Type**: `REG_SZ` (`always`, `never`, or `user-decides`)

For more information, refer to [Tailscale system policies][docs-mdm-keys-unattended].

> **Note:**
>
> When unattended mode is enabled, the Windows account that activated it owns the Tailscale configuration on that device. The Tailscale client continues to run with the configured profile even after the Windows user logs out or the device restarts.

## Verify unattended mode

To verify that unattended mode is functioning:

1. Sign out of Windows or restart the device without logging back in.
2. From another device in your tailnet, ping the device's Tailscale IP address or MagicDNS name:

   ```shell
   tailscale ping <hostname-or-ip>
   ```

If the device is unreachable, open **Services** (`services.msc`) on the Windows device and make sure the **Tailscale** service is set to **Automatic** and is currently **Running**.

## Disable unattended mode

To return Tailscale to user-session mode:

#### Tailscale UI

1. Right-click the **Tailscale** icon in the Windows system tray.
2. Hover over **Preferences**.
3. Select **Run unattended** to deselect the check mark.

#### Tailscale CLI

Open PowerShell or Command Prompt and run:

```powershell
tailscale set --unattended=false
```

## Manage key expiry

By default, node keys expire after 180 days and require interactive re-authentication. For unattended devices, servers, and remote desktop hosts that need to stay online continuously, disable key expiry to prevent unexpected disconnections.

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
2. Locate the device and select the  icon.
3. Select **Disable key expiry**.

> **Warning:**
>
> Disabling key expiry leaves the device connected indefinitely until manually revoked. Only disable key expiry for trusted devices. For more information, refer to [Key expiry][docs-key-expiry].

## Troubleshooting

If other users cannot switch profiles or change the Tailscale configuration, unattended mode might be enabled by another user. Unattended mode gives the user who enabled it exclusive control of the Tailscale configuration on the device. Other users cannot switch profiles or make configuration changes until unattended mode is disabled.

If unattended mode cannot be disabled because the Windows user who enabled it has been deactivated or can no longer access the device, disable it using the `UnattendedMode` policy or by running the Tailscale CLI as `Local System` with [Sysinternals PsExec][xt-ms-psexec]:

```powershell
psexec -s -i "C:\Program Files\Tailscale\tailscale.exe" set --unattended=false
```

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-mdm-keys-unattended]: /docs/features/tailscale-system-policies#set-unattended-mode

[docs-secure-rdp-windows]: /docs/solutions/access-remote-desktops-using-windows-rdp

[docs-tailscaled]: /docs/reference/tailscaled

[xt-gh-tailscale-issue-987]: https://github.com/tailscale/tailscale/issues/987

[xt-ms-psexec]: https://learn.microsoft.com/en-us/sysinternals/downloads/psexec
