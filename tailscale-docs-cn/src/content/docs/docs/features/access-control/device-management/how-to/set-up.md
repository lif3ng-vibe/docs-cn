---
title: "Add a device"
description: "Devices that you want to make available in your Tailscale network (known as a tailnet) such as personal computers, mobile devices, and servers must be added to the tailnet. Tailscale network administr"
---

Last validated Jan 5, 2026

Devices that you want to make available in your Tailscale network (known as a tailnet) such as personal computers, mobile devices, and servers must be added to the tailnet. Tailscale network administrators can control and monitor the status of devices from the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.

## Prerequisites

* An existing tailnet to add the device to.
* A user account that can authenticate to the tailnet.

## Install Tailscale on a device

1. From your browser, go to the [Download Tailscale][co-download] page.
2. Download the Tailscale client for the OS version on your device.
3. Follow the installation steps for your OS version, in the [Install Tailscale][docs-installation] topic.

Alternatively, you can go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select the **Add device** button, select your OS, then select the **Download Tailscale** button. This will redirect you to the download page for your chosen OS.

*（图：Add a device in the admin console.）*

## Add a device to a tailnet

Open the Tailscale client on the device and log in to your tailnet. When you authenticate from a new device, it is automatically added to the tailnet, unless [device approval][docs-device-approval] is enabled. If device approval is enabled, the device will display in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console with a status of [Needs approval](https://console.tailscale.com/admin/machines?q=disabled%3Aneeds-approval).

If you are adding a server to a tailnet, it is recommended that you use a [tag][docs-tags] as the identity of the server, and provision the server using an [auth key][docs-auth-keys]. For more information, refer to [Setting up a server on your Tailscale network][docs-set-up-servers].

## Add a device using a QR code

You can add devices to your Tailscale network (known as a tailnet) using a QR code instead of logging in with your [identity provider][docs-sso-providers] credentials. For details, refer to [Add a device using a QR code][docs-device-add-qr-code].

## Permissions

* If [device approval][docs-device-approval] is not enabled, any user that has login access to the tailnet can add devices.
* If device approval is enabled, users with the [Owner, Admin, or IT admin](/docs/reference/user-roles) role can approve devices from the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
* To review existing [tags][docs-tags] in the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console, users must have admin console access.
* To add new tags in the **Access Controls** page of the admin console, users must be assigned the [Owner, Admin, or IT admin](/docs/reference/user-roles) role.
* To generate [auth keys][docs-auth-keys], users must be assigned the [Owner, Admin, Network admin, or IT admin](/docs/reference/user-roles) role.

[co-download]: https://tailscale.com/download

[docs-tags]: /docs/features/tags

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-add-qr-code]: /docs/features/access-control/device-management/how-to/set-up-qr-code

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-installation]: /docs/install

[docs-set-up-servers]: /docs/how-to/set-up-servers

[docs-sso-providers]: /docs/integrations/identity
