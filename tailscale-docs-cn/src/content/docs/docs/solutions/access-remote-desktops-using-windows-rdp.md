---
title: "Access remote desktops using Windows RDP"
description: "Access a Windows PC securely from anywhere using Remote Desktop and Tailscale. Connect devices on your private tailnet without port forwarding or public IPs."
---

Last validated Dec 15, 2025

Sometimes you need to access a remote Windows PC from another location. You might be working remotely and need to reach your office computer, or you may need to help someone troubleshoot their PC without being there in person.

[Windows Remote Desktop Protocol (RDP)][xt-ms-rdp-explained] lets you connect to a remote Windows PC and use it as if you were sitting in front of it. Typically, setting up Windows RDP requires exposing ports on your network and configuring firewall rules to connect securely across the internet. These steps can be complex and introduce potential security risks.

With Tailscale, your devices automatically join a secure, encrypted network where they can reach each other directly, without manual port forwarding or public IPs. Once connected through your Tailscale network (known as a tailnet), you can access a remote Windows PC as if the devices were on the same local network.

## Prerequisites

To follow this guide, you need:

* A computer running a Windows Professional, Enterprise, Education edition, or Windows Server edition. This is the Windows PC that you'll connect to remotely.
* Another computer for connecting to tailnet and the remote Windows PC. This does not need to be running Windows but must be capable of using a compatible remote desktop application for connecting to the remote Windows PC.
* An email account that uses a [single sign-on (SSO) identity provider][docs-sso-providers], such as Apple, Google, or Microsoft.

## Step 1: Install Tailscale and create your tailnet

> **Tip:**
>
> Installing Tailscale on your first device and authenticating automatically creates your tailnet.

To connect to a remote Windows PC with RDP, you need the Tailscale client installed on at least two devices. You need the remote Windows PC you want to access and the device you'll connect from.

[Download][co-download] the Tailscale client for your device and install it. When you launch the app, log in using an existing identity provider such as Apple, Google, or Microsoft. Choose the Personal option and follow the remaining instructions to complete the process. Your tailnet is now configured and ready to use.

*（图：Select a type of tailnet.）*

Go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and confirm your device connects to your tailnet. The admin console lets you manage the users, devices, and permissions for your tailnet.

*（图：Machines page of the admin console.）*

Now download and install the Tailscale client on your other devices. For each device you add to your tailnet, log in using your identity provider from a web browser. After the confirmation screen displays, verify the device appears in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.

## Step 2: (Optional) Manage key expiry

Devices in a tailnet periodically re-authenticate to stay secure through device key expiry, which requires re-authentication after a set period. For devices that should remain continuously connected, such as servers, Raspberry Pis, media centers, smart home hubs, Docker hosts, and NAS devices, you can disable key expiry to avoid any unnecessary disruptions.

To disable key expiry for a device, go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select the  icon next to the device, then select **Disable key expiry**.

> **Warning:**
>
> Disabling key expiry reduces security and can expose your network if the device or key is compromised. Only do this for trusted devices and revoke the key immediately if the device is lost or replaced. For more information, refer to [Key expiry][docs-key-expiry].

Next, you'll configure Windows RDP on the remote Windows PC.

## Step 3: Configure Windows RDP

The instructions for configuring Windows RDP vary between Windows distributions. For the purposes of this topic, we'll describe the setup for Windows RDP on Windows 11 Pro. To configure Windows RDP on non-Windows 11 Pro PCs, refer to [Enable Remote Desktop on your PC][xt-ms-rdp-setup].

To enable Windows RDP, go to **Settings**, **System**, then select **Remote Desktop**. Then toggle **Remote Desktop** to **On**, and select **Confirm**.

If there are multiple accounts that you want to access on the remote Windows PC, select **Remote Desktop users** in the main **Remote Desktop** page. Select **Add**, **Advanced**, **Find Now**, select the users you want to add, then select **OK**. Then in the main **Remote Desktop users** dialog, select **OK** to confirm.

If you want to make the remote Windows PC reachable after a reboot, you can enable [Unattended mode][docs-run-unattended]. Otherwise, a user will need to log in to the device after each reboot, either in person or through other means.

#### Tailscale UI

Select the Tailscale icon in the Windows system tray, then **Preferences**, and **Run Unattended**. Then select **Yes** to confirm.

#### Tailscale CLI

Open the Command Prompt or PowerShell tool on Windows and run:

```shell
tailscale up --unattended
```

#### System policy

If your organization uses system policies like mobile device management (MDM), you can configure the `UnattendedMode` policy. For more information, refer to [Set unattended mode][docs-mdm-keys-unattended].

Next, you'll install software on the device you'll use to connect to the remote Windows PC.

## Step 4: Install an RDP app on other devices

To connect to the remote Windows PC from another device in your tailnet, you need to install an application on the device you want to connect from. The following is a list of known supported platforms and suggested apps for each one:

| Platform | Recommended apps                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------- |
| macOS    | [Windows App][xt-app-macos]                                                                               |
| Windows  | Use the built-in Desktop Connection app                                                                   |
| Linux    | [FreeRDP][xt-app-linux-freerdp], [Remmina][xt-app-linux-remmina], [GNOME Connections][xt-app-linux-gnome] |
| iOS      | [Windows App Mobile][xt-app-ios]                                                                          |
| Android  | [Windows App][xt-app-android]                                                                             |

For more information about the supported platforms, installation and configuration instructions, refer to [Get started with Windows App to connect to devices and apps][xt-ms-rdp-apps].

Next, you'll connect to the remote Windows PC.

## Step 5: Configure and connect to Windows RDP

To connect to a remote Windows PC over your tailnet, first find its Tailscale IP address. To do this, go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, locate the device, and copy the `100.x.x.x` address. Alternatively, you can use the PC's tailnet hostname or [MagicDNS][docs-magic-dns] name. Now you can configure the app and connect to the remote Windows PC using one of the following methods:

#### macOS

To add a remote Windows PC on macOS, open Windows App and select the **+** icon. In the **PC name** field, enter either the Tailscale IP or the MagicDNS name for the remote Windows PC, set the **Credentials** field to **Ask when required**, then select **Add**. In the Windows App, the newly created connection displays.

To connect to the remote Windows PC, right-click on the connection you created and select **Connect**. Enter the credentials for the remote Windows PC if necessary, then select **Continue**.

#### Windows

Go to the **Remote Desktop Connection** app. This comes built-in to Windows so you do not need to download a third-party app. In the **Computer** field, enter either the Tailscale IP or the MagicDNS name for the remote Windows PC. Enter the credentials for the remote Windows PC if necessary, then select **OK**.

#### Linux (FreeRDP)

To connect to a remote Windows PC using FreeRDP, run the command substituting the placeholders for the details for the remote Windows PC.

```shell
xfreerdp /u:<username> /p:<password> /v:<hostaddress>
```

#### Linux (Remmina)

To connect to a remote Windows PC using Remmina, create a new connection using the RDP protocol. Enter the remote Windows PC's Tailscale IP or MagicDNS name, along with your Windows username and password. Enable options like clipboard sharing or fullscreen if needed, then select **Connect**.

#### Linux (GNOME)

To connect to a remote Windows PC with GNOME Connections, open the app and select the **+** icon, then **Connect to a remote desktop**. In the address field, enter the remote Windows PC's Tailscale IP or MagicDNS name, then choose **RDP** as the connection type. When prompted, enter the remote Windows PC username and password, and select **Connect**.

#### iOS

To add a remote Windows PC on iOS, open Windows App and select the **+** icon. In the **PC name** field, enter either the Tailscale IP or the MagicDNS name for the remote Windows PC, set the **Credentials** field to **Ask when required**, then select **Add**. In the Windows App, the newly created connection displays.

To connect to the remote Windows PC, tap the connection you created and select **Connect**. Enter the credentials for the remote Windows PC if necessary, then select **Continue**.

#### Android

To add a remote Windows PC on Android, open the Windows App and select **PC connection**. In the **PC Name** field, enter either the Tailscale IP or the MagicDNS name for the remote Windows PC, then select **Save**.

To connect to the remote Windows PC from Android, tap on the connection you created. Enter the credentials for the remote Windows PC if necessary, then select **Continue**.

> **Tip:**
>
> When using any of the apps above, a warning message may display indicating that the computer you are connecting to might not be trusted. If this is a computer you own and trust, you can safely ignore this message. If you're unsure, check with your IT administrator.

> **Tip:**
>
> If you are trying to connecting to the remote Windows PC from a Windows domain and encounter issues, refer to the [Windows][docs-troubleshooting-windows] section of our troubleshooting content.

Now you can remotely and securely access a remote Windows PC over your tailnet, as if you were physically in front of it.

## Conclusion

In this guide, you configured Windows RDP with Tailscale to create a secure and private connection between devices. Using your tailnet, you can connect to a remote Windows PC without exposing ports or managing network configurations. This setup keeps your remote sessions encrypted and reliable, providing direct access to your desktop environment wherever you are.

## Further exploration

* [Invite other users][docs-invite-any-user] to your tailnet to let them route their device traffic.
* Configure ad blocking for your tailnet using [Raspberry Pi][docs-pi-hole], [Control D][docs-control-d], or [NextDNS][docs-nextdns].
* Configure a device in your tailnet to [route your tailnet traffic][docs-exit-nodes] for secure browsing wherever you are.
* Configure a device in your tailnet as a [subnet router][docs-subnets] to remotely access home network devices that don't have Tailscale installed, such as printers or smart home devices.

[co-download]: https://tailscale.com/download

[docs-control-d]: /docs/integrations/control-d

[docs-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-magic-dns]: /docs/features/magicdns

[docs-mdm-keys-unattended]: /docs/features/tailscale-system-policies#set-unattended-mode

[docs-nextdns]: /docs/integrations/nextdns

[docs-pi-hole]: /docs/solutions/block-ads-all-devices-anywhere-using-raspberry-pi

[docs-run-unattended]: /docs/how-to/run-unattended

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers/how-to/setup

[docs-troubleshooting-windows]: /docs/reference/troubleshooting/windows

[xt-app-android]: https://play.google.com/store/apps/details?id=com.microsoft.rdc.androidx

[xt-app-ios]: https://apps.apple.com/app/windows-app-mobile/id714464092

[xt-app-linux-freerdp]: https://www.freerdp.com/

[xt-app-linux-gnome]: https://apps.gnome.org/Connections/

[xt-app-linux-remmina]: https://remmina.org/

[xt-app-macos]: https://apps.apple.com/app/windows-app/id1295203466

[xt-ms-rdp-apps]: https://learn.microsoft.com/en-us/windows-app/get-started-connect-devices-desktops-apps

[xt-ms-rdp-explained]: https://learn.microsoft.com/en-us/troubleshoot/windows-server/remote/understanding-remote-desktop-protocol

[xt-ms-rdp-setup]: https://learn.microsoft.com/en-us/windows-server/remote/remote-desktop-services/remotepc/remote-desktop-allow-access
