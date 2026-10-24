---
title: "Set up a dog camera with Tailscale, Raspberry Pi, and Motion"
description: "Set up a dog camera that you can securely access from anywhere."
---

Last validated Jan 5, 2026

Tailscale makes it easy to set up a dog camera that you can securely access from anywhere.

Unlike an off-the-shelf dog camera, with Tailscale you don't need to trust a third-party service, or risk exposing a camera inside your home to the public internet. Every connection on Tailscale is encrypted and entirely private to your network.

## Prerequisites

Before you begin this guide, you'll need two things:

1. A Raspberry Pi with Wi-Fi/Ethernet capabilities (for example, [Raspberry Pi 3 B+][xt-rpi-docs-configure])
2. A USB webcam (for example, [Logitech C615][xt-amazon-webcam-c615])

This guide assumes your Raspberry Pi is already [set up with an internet connection][xt-rpi-wireless-cli], whether Wi-Fi or Ethernet.

You'll also need [a Tailscale account](https://login.tailscale.com/start). You don't need to pay for Tailscale—this is possible on the [Personal plan][co-pricing]!

## Step 1: Install Tailscale on your Raspberry Pi

SSH into the Raspberry Pi, and install Tailscale with a single command:

```shell
curl -fsSL https://tailscale.com/install.sh | sh
```

Alternatively, we provide [manual installation instructions for Raspberry Pi][co-download-linux-rpi].

Once it is installed, and you've run `tailscale up` on your Raspberry Pi, continue to the next step.

## Step 2: Install motion

Next, install [motion][xt-motion-project] using apt with this command

```shell
sudo apt install motion
```

## Step 3: Configure motion

First, we'll enable motion to run as a background service. Edit `/etc/default/motion` using `nano` or your favorite editor:

```shell
sudo nano /etc/default/motion
```

We'll change the `start_motion_daemon` setting to "yes":

```shell
start_motion_daemon=yes
```

Save and close the file.

Next, we'll configure motion to expose a web page, and modify a few video capture settings too.

Open up `/etc/motion/motion.conf` with your editor

```shell
sudo nano /etc/motion/motion.conf
```

Search for the following settings, updating their values to ones listed below.

*Enable viewing video streams over the web.* You can also change the port from the default value (8081) if you'd like.

```shell
stream_port 8081
stream_localhost off
```

*Disable saving images or video to the SD card.* Since this is a dog camera, we only care about looking at live footage.

```shell
output_pictures off
ffmpeg_output_movies off
```

Save and close the file.

## Step 4: Restart motion

Once all your configuration settings have been updated, restart motion

```shell
sudo service motion restart
```

## Step 5: Access your dog camera

From any device in your Tailscale network, you can now access the live webcam stream from `<raspberry pi tailscale ip>:8081`. [Find your Raspberry Pi's IP][docs-ip-and-dns-addresses] and type it into your browser.

*（图：On macOS, you can select the device name to copy the IP address.）*

On macOS, you can select the device name to copy the IP address.

A feed from your webcam will look like this.

*（图：Theo and Casey are looking at something that's totally not a Tailscale employee running around in a backyard.）*

Theo and Casey are looking at something that's totally not a Tailscale employee running around in a backyard.

You now have a functioning dog camera, secured with Tailscale. This can only be accessed by devices on your personal Tailscale network, and no one else.

> **Note:**
>
> Your browser may show an "insecure" warning, since your connection isn't over HTTPS. Tailscale secures your connection at a lower level, so rest easy knowing you are securely connected to any website at 100.x.y.z IP address.

## Next steps

Install Tailscale onto your [Android][co-download-android] or [iOS][co-download-ios] device to check in on your dogs (or other pets) wherever you may be.

You may also want to experiment with other settings such as `width`, `height`, or `framerate`. If you make other changes, be sure to restart motion with `sudo service motion restart` afterwards.

[co-download-android]: https://tailscale.com/download/android

[co-download-ios]: https://tailscale.com/download/ios

[co-download-linux-rpi]: https://tailscale.com/download/linux/rpi

[co-pricing]: https://tailscale.com/pricing

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[xt-amazon-webcam-c615]: https://www.amazon.com/dp/B0058LKJIO

[xt-motion-project]: https://motion-project.github.io

[xt-rpi-docs-configure]: https://www.raspberrypi.com/products/

[xt-rpi-wireless-cli]: https://www.raspberrypi.com/documentation/computers/configuration.html#networking
