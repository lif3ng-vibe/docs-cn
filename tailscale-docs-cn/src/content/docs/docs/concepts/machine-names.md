---
title: "Machine names"
description: "Understand how Tailscale determines machine names, and how you can rename a machine."
---

Last validated Jan 5, 2026

On Tailscale, machines are distinguishable by a [100.x.y.z][docs-100.x-addresses]
IP address, and by a **machine name**.

The machine name, shown throughout the admin console and the native Tailscale
apps, is the canonical name for your machine on your Tailscale network. If you
use [MagicDNS][docs-magicdns], the machine name also determines the URL your machine
is accessible at.

## How machine names are determined

When a new machine is added to a Tailscale network, we automatically generate
its machine name from its OS hostname. The OS hostname is the machine's operating
system name for the device. This field gets reported to Tailscale on startup.

Often, the name ends up being exactly the hostname. But sometimes if a device
already on the network has the same name, the new machine will get a name like
`<hostname>-1`. If the conflicting machine's name is later changed, this machine
will still maintain the `<hostname>-1` machine name.

OS hostnames can also have characters that we don't allow in machine names, so
we derive the names following a number of rules that aim to produce sensible
results.

For example:

OS Hostname
Machine Name

monitoring
monitoring

John's-iPhone-6S.local
johns-iphone-6s

🎊 free form 🎊
free-form

As corner cases in these rules are found, they will change, so they are not
listed here. We enforce unique machine names across a Tailscale network so they
may be used as part of the [MagicDNS][docs-magicdns] domain name for a machine.

## Renaming a machine

Sometimes the default machine name for a device can be pretty messy and unclear,
such as `laptop-a4og4947`. Because of this, we've added the ability to edit the machine
name for a device from the admin console.

You can edit the machine name through the UI in the admin console, or through the Tailscale CLI.

> **Note:**
>
> If [MagicDNS][docs-magicdns] is enabled for your network, editing the machine name also edits
> the MagicDNS domain name. Once renamed, your machine will be accessible over MagicDNS using its new name.

### Renaming a machine in the admin console

In either the [Machines](https://console.tailscale.com/admin/machines)
page of the admin console or the **Machine Details** page, select the&#x20;
menu to the right of the page and select **Edit machine name**. This will open
up the machine name editor.

*（图：Machine name editing view）*

> **Note:**
>
> When the **Auto-generate from OS hostname** box is checked, as it is by default,
> the machine name is generated from the OS hostname as described above. If the
> OS updates the hostname, the machine name will also get updated the next time
> Tailscale is started up. To avoid these automatic name changes, uncheck this box.

*（图：Machine name editing view）*

Once you've made your update, you'll find the new name across the admin console and the
Tailscale apps.

*（图：Updated machine page）*

### Renaming a machine in the CLI

In the Tailscale CLI, set the machine name as part of `tailscale set`:

```shell
tailscale set --hostname=<name>
```

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-magicdns]: /docs/features/magicdns
