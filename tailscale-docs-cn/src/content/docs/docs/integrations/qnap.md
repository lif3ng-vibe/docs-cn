---
title: "Access QNAP NAS from anywhere"
description: "Configure the Tailscale client on a QNAP NAS device."
---

Last validated Jan 5, 2026

With Tailscale, you can securely connect to your QNAP NAS devices over WireGuard®.

Tailscale is free for most personal uses, including accessing your NAS.

## Supported QNAP hardware

* x86-64bit devices
* arm-64bit devices

## Installation steps

1. Open the QNAP App Center.

2. Open the **Communications** section.

   *（图：The QNAP App Center interface）*

3. Locate the Tailscale application and select **Install**.

4. After the Tailscale app installation is completed, select the Tailscale app icon, and select **Open**.

5. Log in to your Tailscale network.

   *（图：Log in to the Tailscale network）*

6. In the **Connect device** page, select **Connect**.

The app can also be downloaded from the [QNAP App Center][xt-qnap-app-center] website.

### Manual installation steps

An alternative to the recommended approach of installing Tailscale from the QNAP App Center is to install Tailscale using a downloadable QNAP package (QPKG). A reason you might want to install from a QPKG is to access new Tailscale features that are not yet released in the Tailscale version that is available from the QNAP App Center.

To manually install Tailscale:

1. Download the QPKG for your QNAP device from the [Tailscale Packages server][pk-server]. QNAP QPKGs are available from both [stable][pk-qnap-stable] and [unstable][pk-qnap-unstable] release tracks.
2. Open the **App Center** on your QNAP device.
3. Select **Install Manually** in the upper right-hand corner, select **Browse**, select the QPKG (`.qpkg`) file that you downloaded, and then select **Install**.
4. Once installation completes, tailscaled should be up and running on your QNAP device, and you should find a new **Tailscale** app in your My Apps section.

## Features

When used with QNAP, Tailscale supports these features:

* Receive [Taildrop][docs-taildrop] files from other tailnet devices automatically, when you create a shared folder named "Taildrop" on your NAS, like your [QNAP device][docs-qnap-setup].
* Web-based login to any [supported identity provider][docs-sso-providers].
* Access your QNAP NAS from anywhere, [without opening firewall ports][bl-how-nat-traversal-works].
* Share your NAS with designated Tailscale users, using [node sharing][docs-sharing].
* Restrict access to your NAS using [access control policies][docs-access-control].
* Use your NAS as a [subnet router][docs-subnets] to provide external access to your LAN. This requires using [`tailscale`][ar-using-the-tailscale-cli] command line steps.
* Use your NAS as an [exit node][docs-exit-nodes] for secure internet access from anywhere.

## Using the Tailscale CLI

Some Tailscale functionality, such as configuring QNAP to be a subnet router, requires using the [`tailscale`][docs-cli] CLI. After you install the Tailscale app, the `tailscale` CLI is available as part of the mounted `qpkg` package. You can access the QNAP terminal and run CLI commands [using SSH][xt-qnap-access-using-ssh].

You can find the mounted package path using this command:

```shell
echo $(getcfg SHARE_DEF defVolMP -f /etc/config/def_share.info)/.qpkg/Tailscale/
```

You can run the `tailscale` CLI using this command:

```shell
$(getcfg SHARE_DEF defVolMP -f /etc/config/def_share.info)/.qpkg/Tailscale/tailscale [...]
```

For convenience, you can add the package path to your `$PATH` environment variable.

```shell
export PATH=$PATH:$(getcfg SHARE_DEF defVolMP -f /etc/config/def_share.info)/.qpkg/Tailscale/
```

This lets you run `tailscale` commands without the full path:

```shell
tailscale [...]
```

## Special thanks

Special thanks to [ivokub][xt-gh-ivokub], who has contributed a community-maintained [Tailscale QPKG package builder][xt-gh-ivokub-tailscale].

[ar-using-the-tailscale-cli]: #using-the-tailscale-cli

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-access-control]: /docs/features/access-control

[docs-cli]: /docs/reference/tailscale-cli

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-qnap-setup]: /docs/features/taildrop/how-to/set-up-taildrop-with-nas#set-up-taildrop-on-qnap

[docs-sharing]: /docs/features/sharing

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers

[docs-taildrop]: /docs/features/taildrop

[pk-server]: https://pkgs.tailscale.com/

[pk-qnap-stable]: https://pkgs.tailscale.com/stable/#qpkgs

[pk-qnap-unstable]: https://pkgs.tailscale.com/unstable/#qpkgs

[xt-gh-ivokub-tailscale]: https://github.com/ivokub/tailscale-qpkg

[xt-gh-ivokub]: https://github.com/ivokub

[xt-qnap-access-using-ssh]: https://www.qnap.com/en/how-to/faq/article/how-do-i-access-my-qnap-nas-using-ssh

[xt-qnap-app-center]: https://www.qnap.com/en/app-center/?os=qts&type=Communications
