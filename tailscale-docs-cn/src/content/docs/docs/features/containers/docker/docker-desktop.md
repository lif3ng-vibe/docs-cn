---
title: "Setting up Docker Desktop to work with Tailscale"
description: "The Tailscale extension for [Docker Desktop][xt-docker-desktop] lets you share exposed container ports from your local machine with others on your private Tailscale network (known as a [tailnet][docs-"
---

Last validated Mar 23, 2026

> **Deprecation:**
>
> Tailscale's Docker Desktop extension is no longer supported as of v1.78.0.

The Tailscale extension for [Docker Desktop][xt-docker-desktop] lets you share exposed container ports from your local machine with others on your private Tailscale network (known as a [tailnet][docs-tailnet]). Use the Tailscale extension to collaborate on services with your team, SSH into containers, and more.

When using the Tailscale extension, any of your tailnet's [access control rules][docs-access-control] and [shared nodes][docs-sharing] settings still exist and are enabled. If you use [MagicDNS][docs-magicdns], it also remains enabled in Docker Desktop.

## Installing the Tailscale extension

1. In Docker Desktop, select **Add Extension**, find **Tailscale**, and then select **Install**.

2. You will be prompted to either create a Tailscale account, or log in to a Tailscale account. *Note that logging in to Tailscale exposes your containers' public ports to your tailnet.* Select **Log in with browser** if you want to log in through a web browser, or select **Log in with another device** to get a QR code you can use to log in with another device.

Once installed, the Tailscale extension appears in the Docker Desktop sidebar.

If your host device is not running Tailscale, you will not be able to access your containers locally using Tailscale, for example, in your browser. Install Tailscale on your device to access your containers using Tailscale.

## Using the Tailscale extension

Select the Tailscale extension in the Docker Desktop sidebar to display your open containers and their Tailscale IP addresses and URLs. Select a URL to copy it. You could send the URL to other users in your tailnet so they can access your containers. You can also select **Open** to open the URL in your browser.

## Activities that remove your container ports from your tailnet

Any of the following actions on your machine running Docker Desktop will stop sharing your container ports *in Docker Desktop* in your tailnet:

* Logging out of Tailscale
* Uninstalling the Tailscale extension

## Uninstalling the Tailscale extension

1. In the list of extensions, find **Tailscale**, and then select **Uninstall**.

Once you uninstall the Tailscale extension, your containers' public ports will no longer be available through Docker Desktop to other users in your tailnet.

[docs-access-control]: /docs/features/access-control

[docs-magicdns]: /docs/features/magicdns

[docs-sharing]: /docs/features/sharing

[docs-tailnet]: /docs/concepts/tailnet

[xt-docker-desktop]: https://www.docker.com/products/docker-desktop
