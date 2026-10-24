---
title: "Authorizing the Tailscale system extension on macOS"
description: "Authorize Tailscale system extensions on macOS."
---

Last validated Jan 5, 2026

When launching Tailscale for the first time on your Mac, you may be presented with one or more of the following warnings.

* *（图：The warning for 'System Extension Blocked' in macOS. There are two prompts for 'OK' and 'Open System Settings'.）*
* *（图：The warning for 'System Extension Approval Required' in the Tailscale app. There are two prompts of 'Ignore' and 'Open Settings'.）*
* *（图：The warning for 'System Extension Approval Required...' in the Tailscale menu. This warning has an icon in the shape of an exclamation point in a triangle.）*

The above messages indicate that Tailscale launched successfully. However, granting permission to install the Tailscale system extension is necessary before Tailscale can connect your Mac to the network.

System extensions are a macOS technology used by Tailscale to extend the networking features of your Mac. For further information on system extensions, refer to [below][ar-what-is-a-system-extension].

## Configuration steps

The steps for granting permission to install the Tailscale extension will vary depending on the version of macOS you are using.

### macOS Sequoia 15 and later

1. Go to **System Settings** and open the **General** tab.
2. In the **Login Items & Extensions** section, scroll down to **Network Extensions**, and select the information ⓘ icon.
3. Toggle **Tailscale Network Extension** to on, then authorize the operation using Touch ID, or by providing an administrator password.
4. Select **Done**. If a window appears asking to install a VPN configuration, choose **Allow**.

Tailscale will begin connecting. If you have never logged into Tailscale before, you'll have to log in by using the Tailscale menu bar item at the top right of your screen.

### macOS Sonoma 14 and earlier

1. Go to **System Settings** and open the **Privacy & Security** tab.
2. Scroll down the list of options until you reveal the message **System software from application "Tailscale.app" was blocked from loading.**, and select **Allow**.
3. Authorize the operation using Touch ID, or by providing an administrator password. If a window appears asking to install a VPN configuration, choose **Allow**.

Tailscale will begin connecting. If you have never logged into Tailscale before, you'll have to log in by using the Tailscale menu bar item at the top right of your screen.

## Manage using the CLI

You can manage system extensions for a device using the CLI command [`tailscale configure sysext`][docs-cli-configure].

## What is a system extension?

You might wonder why this is necessary. Behind the scenes, the Standalone variant of Tailscale for macOS uses a technology introduced in macOS Catalina 10.15 called [System Extensions][xt-apple-docs-system-extensions].

System extensions represent a safer replacement for the legacy Kernel Extensions technology used by many security and networking tools in previous versions of macOS. They run within a sandbox, meaning that Tailscale runs isolated from the operating system kernel in your Mac. This can provide additional security guarantees. Additionally, system extensions can be distributed outside the Mac App Store. This lets us provide a variant of Tailscale which doesn't depend on Apple for distribution.

Because system extensions are shared with other users of your Mac, explicit consent is required before they can be installed.

## Automate this process for your users

If you are a system administrator managing a fleet of Macs, you can use a mobile device management (MDM) solution to automatically pre-approve the Tailscale system extension. Refer to the [MDM documentation][docs-macos-mdm-approve-system-extension] for further details.

[ar-what-is-a-system-extension]: #what-is-a-system-extension

[docs-cli-configure]: /docs/reference/tailscale-cli#configure

[docs-macos-mdm-approve-system-extension]: /docs/integrations/mdm/mac#approve-the-tailscale-system-extension-automatically

[xt-apple-docs-system-extensions]: https://support.apple.com/HT210999
