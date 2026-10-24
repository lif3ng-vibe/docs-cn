---
title: "Manage client preferences"
description: "[Admins][docs-user-roles] can manage devices on a network, and restrict which devices can connect using access control policies."
---

Last validated Jan 5, 2026

[Admins][docs-user-roles] can manage devices on a network, and restrict which devices can connect using access control policies.

Individual users still have control over their own devices, to block incoming connections from Tailscale or to ignore Tailscale's DNS settings and advertised routes.

## Default configuration

By default, a Tailscale client will:

* Allow incoming connections
* Use Tailscale DNS settings

macOS, Windows, and other non-Linux devices use Tailscale subnets by default. Linux devices do not use Tailscale by default.

## Allow incoming connections

If other devices in your tailnet are allowed to connect to your device based on access control policies, then the connection will be created. Access control policies are directional, so that an access rule allowing your laptop to connect to a web server does not allow the web server to establish connections to your laptop.

If you want to block all incoming connections, you can do so. This is also known as "shields up". In the menu bar of your device,
uncheck **Allow incoming connections**. When unchecked, your device will still
be visible and allowed to *send* traffic, but won't *accept* any connections
over Tailscale, including pings.

### Toggling incoming connections

This can be configured in the client menu bar or the CLI.

### In the client menu bar

#### macOS

If you are running Tailscale v1.60.0 or later, from the menu bar, select Tailscale, select **Settings**, and then check/uncheck **Allow incoming connections**.

*（图：Tailscale Settings window with the 'Settings' tab selected. The 'Allow incoming connections' checkbox is checked.）*

If you are running a version of Tailscale earlier than v1.60.0, from the menu bar, select Tailscale and check/uncheck **Allow incoming connections**.

*（图：The Tailscale application menu opened from the macOS menu bar with the 'Allow incoming connections' option checked.）*

#### iOS

iOS does not support blocking incoming connections.

#### Android

Android does not support blocking incoming connections.

#### Windows

From the system tray, right-click on the Tailscale icon and check/uncheck **Allow incoming connections**.

*（图：The Tailscale application menu opened from the Windows system tray with 'Allow Incoming Connections' checked.）*

#### Linux

Linux can only be configured via the CLI.

### In the CLI

To block incoming connections:

```shell
tailscale set --shields-up
```

To allow incoming connections (default):

```shell
tailscale set --shields-up=false
```

## Use Tailscale DNS settings

If an Admin has configured [DNS settings for your tailnet, including MagicDNS or split DNS][docs-dns], then DNS queries for devices in your Tailscale network will respect those settings.

> **Note:**
>
> If you are using an [exit node][docs-exit-nodes], your local DNS is the DNS for the exit node, not your device.

This can be configured in the client menu bar or the CLI.

### In the client menu bar

If you want to only use local DNS, in the menu bar of your device, uncheck **Use Tailscale DNS settings**.

### In the CLI

To use Tailscale DNS settings (default):

```shell
tailscale set --accept-dns=true
```

To not use Tailscale DNS settings:

```shell
tailscale set --accept-dns=false
```

## Use Tailscale subnets

If an Admin has created [subnet routes][docs-subnets] for your tailnet, then Tailscale will route your device's traffic for the advertised subnets to the appropriate subnet router.

This can be configured in the client menu bar or the CLI.

### In the client menu bar

If you want to ignore the advertised routes, in the menu bar of your device, uncheck **Use Tailscale subnets**.

### In the CLI

To use Tailscale subnets (default, except for Linux):

```shell
tailscale set --accept-routes=true
```

To not use Tailscale subnets (default on Linux):

```shell
tailscale set --accept-routes=false
```

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-subnets]: /docs/features/subnet-routers

[docs-user-roles]: /docs/reference/user-roles
