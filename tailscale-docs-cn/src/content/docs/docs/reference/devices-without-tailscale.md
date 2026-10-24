---
title: "Connecting without installing Tailscale"
description: "Securely connect to devices that without installing Tailscale."
---

Last validated Aug 1, 2025

In most cases, we recommend [installing Tailscale][co-download] directly on devices you want to connect to. It just works, and requires no configuration as devices move between networks.

However, sometimes you don't want to, or can't install Tailscale directly:

* Incrementally migrating to Tailscale from a large number of existing networks
* Incrementally migrating to Tailscale from a cloud provider's own virtual private cloud (VPC) offering
* Connecting to appliances you can't install software on (for example, gaming consoles, smart appliances, IoT devices)
* Connect to devices running unsupported operating system

In these cases, you can run a device called a [subnet router][docs-subnets] and relay traffic between your Tailscale network and these devices.

**For more information, read our topic about [subnet routers →][docs-subnets]**

[co-download]: https://tailscale.com/download

[docs-subnets]: /docs/features/subnet-routers
