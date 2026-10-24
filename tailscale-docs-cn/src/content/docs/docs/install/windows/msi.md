---
title: "Install Tailscale on Windows with MSI"
description: "This topic shows how to install Tailscale with the Windows Installer (MSI) package. If you want to use the Tailscale `.exe` installer, refer to [Install Tailscale on Windows][docs-install-windows]."
---

Last validated Jan 5, 2026

> **Note:**
>
> The current version of the Tailscale client available for [download](https://tailscale.com/download/windows) requires Windows 10 or later or Windows Server 2016 or later.

This topic shows how to install Tailscale with the Windows Installer (MSI) package. If you want to use the Tailscale
`.exe` installer, refer to [Install Tailscale on Windows][docs-install-windows].

## To install

1. Download the latest `.msi` file from the [Tailscale Packages][pk-stable-windows] page. You need to choose the version for your
   CPU architecture. If your architecture is based on `ARM64`, use the `x86` version.

2. Run the installer. You can double select the download, or you can use the [`msiexec`][xt-microsoft-msiexec] command:

   `msiexec /i <path_to_tailscale_msi.msi>`

   Optionally, write logging information from `msiexec` to a file. The folder used for the log file must already exist.

   `msiexec /L <path_to_log.log> /i <path_to_tailscale_msi.msi>`

3. Note the new Tailscale icon in your system tray once installation is complete. If it is not
   visible, select the up arrow to find it in the system tray overflow area.

4. Select the Tailscale icon to expose configuration options and status messages.

5. Under your account, select **Log in** to launch a browser window, and authenticate
   using [your SSO identity provider][docs-sso-providers].

## To uninstall

Users can [uninstall Tailscale][docs-uninstall] through the Windows control panel.

For system administration or debugging purposes, you can also uninstall with `msiexec`. If you uninstall with
`msiexec`, you must use the same `.msi` file that you used to install the client.

```
msiexec /x <path_to_tailscale_msi.msi>
```

You can also use the `/L` option to write logging information from `msiexec` to a file.

```
msiexec /L <path_to_log.log> /x <path_to_tailscale_msi.msi>
```

## Properties

If you use the `msiexec` command-line tool, you can set several MSI properties that control the user's experience with
the Tailscale client. For example, this installation command hides the **Network Devices** menu item in the Tailscale client:

```
msiexec TS_NETWORKDEVICES="hide" /i tailscale-setup-1.22.0-amd64.msi
```

Tailscale MSI properties, if set, are stored in the `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Tailscale` registry key.
The [registry value type][xt-ms-windows-registry-values] for all Tailscale MSI properties is `REG_SZ`.

The following properties can be used with MSI.

### INSTALLDIR

Specifies the path of the installation directory on disk. The installation path
defaults to `C:\Program Files\Tailscale`.

### TS\_ADMINCONSOLE

Controls visibility of the **Admin Console** menu

* Registry name: `AdminConsole`
* Possible values: "show", "hide"

### TS\_ADVERTISEEXITNODE

Controls how the [Run As Exit Nodes][docs-exit-nodes] option is configured

* Registry name: `AdvertiseExitNode`
* Possible values: "always", "never", "user-decides"

### TS\_ALLOWINCOMINGCONNECTIONS

Controls the **Preferences** > **Allow Incoming Connections** menu item

* Registry name: `AllowIncomingConnections`
* Possible values: "always", "never", "user-decides"

### TS\_CHECKUPDATES

This policy does not currently change Windows behavior. It corresponds to `tailscale set --update-check` but the Windows client does not currently look at this because it always checks for updates.

* Registry name: `CheckUpdates`
* Possible values: "always", "never", "user-decides"

### TS\_ENABLEDNS

Controls whether to apply its DNS configuration when the tunnel is connected

* Registry name: `UseTailscaleDNSSettings`
* Possible values: "always", "never", "user-decides"

### TS\_ENABLESUBNETS

Controls whether to accept subnets advertised by other nodes in your tailnet

* Registry name: `UseTailscaleSubnets`
* Possible values: "always", "never", "user-decides"

### TS\_EXITNODEMENU

Controls the visibility of the **Exit Nodes** menu

* Registry name: `ExitNodesPicker`
* Possible values: "show", "hide"

### TS\_FLUSHDNSONSESSIONUNLOCK

Enables additional DNS cache flushing for debugging purposes. This should only be enabled if recommended by Tailscale Support.

* Registry name: `FlushDNSOnSessionUnlock`
* Possible values: "1", "0"

### TS\_INSTALLUPDATES

Controls how **Automatically Install Updates** is configured

* Registry name: `InstallUpdates`
* Possible values: "always", "never", "user-decides"

### TS\_KEYEXPIRATIONNOTICE

Enables a warning message that will be displayed up to time prior to the login's
actual expiry. The default is 24 hours.

* Registry name: `KeyExpirationNotice`
* Possible values: String value that can be parsed by Go's [`time.ParseDuration` function][xt-go-time-parseduration]. For example, "12h".

### TS\_LOGINURL

Controls the required use of a particular Tailscale coordination server. For more information, refer to [Set a custom control server URL][docs-mdm-keys-custom-control-server].

* Registry name: `LoginURL`
* Possible values: URL for the coordination server

### TS\_NETWORKDEVICES

Controls the visibility of the **Network Devices** menu

* Registry name: `NetworkDevices`
* Possible values: "show", "hide"

### TS\_NOLAUNCH

Controls whether the Tailscale client is launched as part of the installation. This property is applicable only during silent installation.

* Registry name: Not applicable—no value is saved to the registry.
* Possible values: Any string. Set this to a non-empty string to prevent the Tailscale GUI client from launching as part of installation.

### TS\_ONBOARDING\_FLOW

Controls visibility of the onboarding flow

* Registry name: `OnboardingFlow`
* Possible values: "show", "hide"

### TS\_PREFERENCESMENU

Controls the visibility of the **Preferences** menu

* Registry name: `PreferencesMenu`
* Possible values: "show", "hide"

### TS\_TESTMENU

Controls whether it is possible for users to bring up the debug menu by holding either `CTRL` or `SHIFT` when opening the Tailscale menu.

* Registry name: `TestMenu`
* Possible values: "show", "hide"

### TS\_UNATTENDEDMODE

Controls the **Preferences** > **Run Unattended** menu item

* Registry name: `UnattendedMode`
* Possible values: "always", "never", "user-decides"

### TS\_UPDATEMENU

Controls the visibility of the **Update Tailscale** menu item.

* Registry name: `UpdateMenu`
* Possible values: "show", "hide"

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-install-windows]: /docs/install/windows

[docs-mdm-keys-custom-control-server]: /docs/features/tailscale-system-policies#set-a-custom-control-server-url

[docs-sso-providers]: /docs/integrations/identity

[docs-uninstall]: /docs/features/client/uninstall

[pk-stable-windows]: https://pkgs.tailscale.com/stable/#windows

[xt-go-time-parseduration]: https://pkg.go.dev/time#ParseDuration

[xt-microsoft-msiexec]: https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/msiexec

[xt-ms-windows-registry-values]: https://learn.microsoft.com/en-us/windows/win32/sysinfo/registry-value-types
