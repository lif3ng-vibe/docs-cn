---
title: "Debug menu and options"
description: "Enable debug mode of the Tailscale client menu to help troubleshoot issues."
---

Last validated Mar 23, 2026

The macOS and Windows versions of the Tailscale client contain a debug mode of the menu that provides advanced settings for monitoring and troubleshooting.

#### macOS

To access the debug options on macOS, hold down Option and select the Tailscale icon in the menu bar. Available options include:

* Sent and received traffic information.
* Device key expiry information.
* The **Debug** menu provides the following options:
  * **Bug report**: [Generates a bug report ID and a configuration report][docs-bug-report] that you can send to us to help you troubleshoot issues more effectively.
  * **Reauthenticate**: Logs the user out of the tailnet, requiring them to re-authenticate from the Tailscale [Login](https://login.tailscale.com/login) page.
  * **Reset All Settings**: Sets the client settings back to default while keeping the user logged in.
  * **Show Onboarding**: Displays the walk-through onboarding screens that a user typically sees when they first install the client.
  * **Flush DNS Cache**: Clears the macOS DNS cache. This requires administrative credentials.
  * **Add Account**: Displays a dialog for adding the client to a custom coordination server.
  * **System Extension**: Displays the health of the Tailscale system extension. You can also use the [`tailscale configure sysext status`][docs-cli-configure] CLI command.
  * **Reset**: Deletes and reinstalls the macOS VPN configuration. Using this option may be helpful if Tailscale refuses to start even after rebooting your Mac. This option won't work if your organization is deploying a VPN configuration profile on your Mac using an MDM solution.
* **Quit (Leave VPN Active)**: Terminates the Tailscale GUI app, but leaves the VPN network extension running in the background. If you use this option, you may then separately toggle the network extension in the macOS System Settings app.

#### Windows

To access the debug options on Windows, hold down `CTRL` and select the Tailscale icon in the system tray. Available options include:

* The URL for the control plane server that the client is connected to for the tailnet.
* **Debug report**: [Generates a bug report ID][docs-bug-report] that you can send to us to help you troubleshoot issues more effectively.
* **Use Notepad for URLs**: Controls the client's behavior when the Tailscale [control plane][docs-control-data-planes] sends a URL that the user must visit to complete authentication. By default (when unchecked), the client opens the login URL in the default browser. When checked, the client instead displays the login URL and an ASCII QR code in Notepad rather than opening it in the default browser.
* **Start Onboarding Test**: Displays the walk-through onboarding screens that a user typically sees when they install the client for the first time.

> **Tip:**
>
> If you use [Group Policy][xt-microsoft-group-policy] or an [MDM solution][docs-mdm] to manage your fleet of devices, you can [control the visibility of the Debug menu][docs-mdm-keys-debug].

[docs-bug-report]: /docs/account/bug-report

[docs-cli-configure]: /docs/reference/tailscale-cli#configure

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-mdm-keys-debug]: /docs/features/tailscale-system-policies#hide-the-debug-menu

[docs-mdm]: /docs/mdm

[xt-microsoft-group-policy]: https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-overview
