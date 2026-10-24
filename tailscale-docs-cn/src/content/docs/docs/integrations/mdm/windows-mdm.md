---
title: "Deploy Tailscale on Windows using MDM"
description: "This topic contains technical information which you might find useful if you are a system administrator deploying Tailscale for Windows in a corporate environment using mobile device management (MDM)."
---

Last validated Jan 5, 2026

This topic contains technical information which you might find useful if you are a system administrator deploying Tailscale for Windows in a corporate environment using mobile device management (MDM).

> **Note:**
>
> Tailscale v1.78 enables certain policy settings, such as UI customizations, to target users and devices. Tailscale v1.76 supports device system policies only.

> **Tip:**
>
> The most recent Tailscale ADMX and ADML files that can be used with both Group Policy and MDM solutions, such as Microsoft Intune, are available from the [Tailscale repository][xt-gh-tailscale-repo].

We are always working on providing more options for system administrators to programmatically manage their Tailscale deployments. If you are deploying Tailscale and feel the need for a specific configuration option that is currently missing in this topic, contact our support team.

## Registry Values

You can set registry values manually or with MDM solutions such as [Microsoft Intune][docs-mdm-microsoft-intune], allowing you to alter the behavior of the Tailscale client.

Store Registry values in the `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Tailscale` registry key.

> **Note:**
>
> Earlier versions of Tailscale used the `HKEY_LOCAL_MACHINE\Software\Tailscale IPN` key, and more recent versions now use the `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Tailscale` key.
>
> If you have the `HKEY_LOCAL_MACHINE\Software\Tailscale IPN` key, we recommend keeping this intact and moving all of your custom policy settings into the `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Tailscale` key to avoid disruption. Do not delete the `HKEY_LOCAL_MACHINE\Software\Tailscale IPN` key.

*（图：Windows registry key for Tailscale policies.）*

Within the `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Tailscale` registry key:

* The `(Default)` value is not used.

Optionally, several values can be created, all of which are of String type:

* The `LoginURL` value contains the URL of the login server. The default value is `https://controlplane.tailscale.com`.
* The `LogTarget` value contains the URL of the log server. The default value is `https://log.tailscale.com`.

Preference policies can be set to `always`, `never` and `user-decides`. If set to `always` or `never`, the options are
set by the administrator and not visible in the system tray menu. If unset or set to `user-decides` then the option is
visible in the system tray menu.

* `AllowIncomingConnections` controls the **Allow Incoming Connections** menu option
* `UnattendedMode` controls the **Unattended Mode** menu option

Visibility policies can be set to "hide" or "show". If set to "hide" then the menu item is not visible. If set to "show"
or unset, then the menu item is visible.

* `AdminConsole` controls the **Admin Console** menu item
* `NetworkDevices` controls the **Network Devices** submenu
* `TestMenu` controls if the test/debug menu items are visible when opening the tray menu while pressing the `SHIFT` or `CTRL` keys.
* `UpdateMenu` controls the **Update Tailscale** menu item

Duration policies control a duration or timeout. The time can be set using units of hours and minutes. Examples:

* `168h`: 1 week
* `24h`: 1 day
* `1h5m`: 1 hour, 5 minutes
* `30m`: half hour
* Smaller time units are available but unlikely to be useful. Non-negative values accepted by the
  [Go time.ParseDuration][xt-go-parse-duration] function are supported.

Current duration policies:

* `KeyExpirationNotice` controls how long before key expiry should a notice be displayed. The default is 24 hours.

> **Warning:**
>
> For Windows, use `REG_DWORD` (Integer) values (`0` and `1`) for boolean MDM keys.

For a full list of the registry values you can configure, check out our [MDM configuration keys list][docs-mdm-keys].

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm-microsoft-intune]: /docs/integrations/mdm/microsoft-intune

[xt-gh-tailscale-repo]: https://github.com/tailscale/tailscale/tree/main/docs/windows/policy

[xt-go-parse-duration]: https://golang.org/pkg/time/?m=all#ParseDuration
