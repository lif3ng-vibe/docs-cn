---
title: "Connect to devices"
description: "Connect to devices in your tailnet."
---

Last validated Jan 5, 2026

Tailscale automatically assigns each device on your network a unique [Tailscale IP address][docs-tailscale-ip-addresses] and [MagicDNS][docs-magicdns] name so that you can establish stable connections between devices anywhere in the world, even if they're behind a firewall or change networks. This guide covers connecting to devices in your tailnet after you've installed Tailscale on two or more devices.

> **Note:**
>
> Before you explore the connection process, it's crucial to understand that Tailscale provides network connectivity between devices, but you must run a specific [service][docs-services] (like SSH or a web server) on the destination device. Tailscale does not provide these services automatically.

## Prerequisites

* Tailscale installed on at least two devices.
* [Access control policies][docs-acls] that allow the devices to connect. If you're using the [default access control policies][docs-default-acl], all connections will be allowed between any device in your tailnet.
* At least one [service][docs-services] running on one of the devices.

## Connect to devices in your tailnet

To connect to another device in your tailnet:

1. [Identify the device to connect to][ar-identify-devices].
2. [Make sure the device is running a service you can access][ar-ensure-services-are-running].
3. [Connect to the service][ar-connect-to-service].

### Identify your devices

Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console. You'll find a list of all devices in your tailnet, along with their hostnames ([device names][docs-machine-name]) and [Tailscale IP addresses][docs-tailscale-ip-addresses].

### Ensure services are running

Remember, you can only connect to services running on your devices. Common services include:

* SSH (usually on port `22`)
  You can also use [Tailscale SSH][docs-tailscale-ssh].
* Web servers (often on port `80` or `443`)
* File sharing services (such as SFTP)
* Remote access tools (such as RDP)

Ensure the [service][docs-services] you want to access runs on the target device. You can do so by checking the [Services](https://console.tailscale.com/admin/services) page of the admin console, or by confirming the service is running on the destination device.

### Connect to a service

> **Note:**
>
> Tailscale offers a feature called [MagicDNS][docs-magicdns], which lets you use [device names][docs-machine-name] instead of Tailscale IP addresses. It's enabled by default, so you can use it right away.

To connect to a service on a device in your tailnet:

* Use the [device name][docs-machine-name] or [Tailscale IP address][docs-tailscale-ip-addresses] of the target device.
* Specify the port of the service you're trying to access.

For example, if you want to SSH into a device with the [MagicDNS][docs-magicdns] [name][docs-machine-name] `dev-build-server`, you can use the following command in a terminal emulator:

```shell
ssh username@dev-build-server
```

Visit the following topics to find more information more about connecting to different types of services:

* [Connect to a database][docs-database].
* [Connect to a Windows server using RDP][docs-secure-rdp-windows].
* [Connect to a cloud server][docs-cloud-server].
* [Connect to a remote development environment][docs-remote-code].
* [Connect to a network attached storage (NAS)][docs-nas].

## Troubleshooting

If you can't connect to a service:

* Check if you can reach the device using [`tailscale ping`][docs-tailscale-ping].
* Verify that you're using the correct connection information.
* Ensure the service is running on the target device at the expected port number.
* Check if any [firewalls][docs-firewalls] (including the built-in firewall on the target device) are blocking the connection.
* Ensure that your [tailnet policy file][docs-edit-policies] doesn't contain any [grants][docs-grants] or [ACLs][docs-acls] that prevent a connection between the two devices.
* Visit [troubleshooting device connectivity][docs-device-connectivity].

## Advanced topics

The following sections cover other ways you can manage connections to devices in your tailnet.

### Access control

When you create a tailnet, Tailscale automatically applies a [default access control policy][docs-default-acl] that lets you connect to all devices you own. You can customize [access control policies][docs-access-control] (such as [ACLs][docs-acls] or [grants][docs-grants]) in the [tailnet policy file][docs-edit-policies] to create policies that control how devices in your tailnet connect to each other and other devices on the internet.

### Tailscale SSH

Tailscale offers a built-in SSH feature that extends and simplifies SSH connections between your devices. When enabled, [Tailscale SSH][docs-tailscale-ssh] manages the authentication and authorization of SSH connections in your tailnet, letting you add additional security checks and providing a web console interface.

### Sharing devices

You can [share devices][docs-sharing] or [specific services][docs-tailscale-serve] with other Tailscale users, allowing collaboration while maintaining security.

### Routing

You can configure a device to route outbound traffic by running it as an [exit node][docs-exit-nodes] or inbound traffic by running it as a [subnet router][docs-subnets]. Using a device as a subnet router lets you access devices without installing the Tailscale client.

[ar-connect-to-service]: #connect-to-a-service

[ar-ensure-services-are-running]: #ensure-services-are-running

[ar-identify-devices]: #identify-your-devices

[docs-access-control]: /docs/features/access-control

[docs-edit-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-acls]: /docs/features/access-control/acls

[docs-cloud-server]: /docs/cloud-server

[docs-database]: /docs/database

[docs-default-acl]: /docs/reference/examples/acls#allow-all-default-acl

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-firewalls]: /docs/integrations/firewalls

[docs-grants]: /docs/features/access-control/grants

[docs-machine-name]: /docs/concepts/machine-names

[docs-magicdns]: /docs/features/magicdns

[docs-nas]: /docs/integrations/nas

[docs-remote-code]: /docs/remote-code

[docs-secure-rdp-windows]: /docs/solutions/access-remote-desktops-using-windows-rdp

[docs-services]: /docs/features/services

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-tailscale-ping]: /docs/reference/tailscale-cli#ping

[docs-tailscale-serve]: /docs/features/tailscale-serve

[docs-tailscale-ssh]: /docs/features/tailscale-ssh
