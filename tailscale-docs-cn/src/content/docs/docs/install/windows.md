---
title: "Install Tailscale on Windows"
description: "Install the Tailscale client on Windows."
---

Last validated Nov 21, 2025

> **Note:**
>
> The current version of the Tailscale client available for [download](https://tailscale.com/download/windows) requires Windows 10 or later or Windows Server 2016 or later.

This topic shows how to install with the Tailscale `.exe` installer. If you want to use the
Tailscale `.msi` installer, refer to [Install Tailscale on Windows with MSI][docs-install-windows-msi].

1. [Download][co-download-windows] the latest `.exe` installer. You can use the same `.exe` installer on both 32- and 64-bit Windows; it will install the right version for your system automatically.

2. Run the installer. After installation, a new Tailscale icon will appear in your system tray. If it is not visible, select the up arrow to find it in the system tray overflow area.

   *（图：The Tailscale application menu opened from the Windows system tray.）*

3. Right-click the Tailscale icon to expose configuration options and status messages.

4. Under your account, select **Log in** to launch a browser window, and authenticate using [your SSO identity provider][docs-sso-providers].

## MDM deployments

You can use [Windows registry values][docs-windows-mdm] to apply system policies to Tailscale for Windows. Policies are typically distributed using MDM.

## Troubleshooting

For more information about common Windows issues and suggestions to help resolve them, refer to our [Troubleshooting guide][docs-troubleshooting-windows].

[co-download-windows]: https://tailscale.com/download/windows

[docs-install-windows-msi]: /docs/install/windows/msi

[docs-sso-providers]: /docs/integrations/identity

[docs-troubleshooting-windows]: /docs/reference/troubleshooting/windows

[docs-windows-mdm]: /docs/integrations/mdm/windows-mdm
