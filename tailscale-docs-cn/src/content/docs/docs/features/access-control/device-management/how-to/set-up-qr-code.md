---
title: "Add a device using a QR code"
description: "You can add devices to your Tailscale network (known as a tailnet) using a QR code instead of logging in with your [identity provider][docs-sso-providers] credentials. This can be useful if you do not"
---

Last validated Sep 30, 2025

You can add devices to your Tailscale network (known as a tailnet) using a QR code instead of logging in with your [identity provider][docs-sso-providers] credentials. This can be useful if you do not want to enter your user name and password on a device. An example is adding an [Apple TV][docs-appletv] to your tailnet by scanning a QR code from an iPhone.

## Prerequisites

* A device that is capable of scanning QR codes, such as a phone or a tablet
* A device to add to your tailnet that is capable of generating and displaying QR codes

## Installation steps

1. Install the Tailscale client on the device that you want to authenticate.

2. On the same device, the Tailscale login page should display. Select the **QR code** link and a QR code will display. If you are adding an Apple TV to your tailnet, a QR code will automatically display the first time you attempt to connect.

   *（图：Log in to Tailscale using a QR code.）*

3. Scan the QR code using a device such as a phone or tablet, that you trust for entering your tailnet user name and password. This should open the Tailscale [Login](https://login.tailscale.com/login) page in your web browser.

4. Select your identity provider and log in with your user name and password. If your account is connected to multiple tailnets, select the one where you want to add the new device. Once you are authenticated, the new device should be automatically logged in to the tailnet.

> **Note:**
>
> If [device approval][docs-device-approval] is enabled in your tailnet, the newly added device will display a message that it needs approval. Upon approval, the device will display the Tailscale client interface.

[docs-appletv]: /docs/install/appletv

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-sso-providers]: /docs/integrations/identity
