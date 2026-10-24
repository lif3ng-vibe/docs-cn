---
title: "Set up servers"
description: "Securely set up servers using tags, pre-authorization keys, ephemeral nodes, and more."
---

Last validated Mar 3, 2025

A server in Tailscale is a device that provides resources or services to other devices in your Tailscale network (known as a tailnet). Unlike user devices which authenticate through your identity provider, servers are typically non-human devices that require different authentication methods, such as tags and auth keys. Servers can be physical machines, virtual machines, or cloud instances that run services like web applications, databases, or file shares.

## Authenticate devices and verify identity

Unlike user devices, which authenticate through identity providers, servers need a different approach. Tailscale provides tags for server identity management and auth keys for automated authentication.

[**Setting up a server on your Tailscale network**](/docs/how-to/set-up-servers) — Set up a server in your tailnet, and use Tailscale SSH to manage authentication for those servers.

[**Group devices with tags**](/docs/features/tags) — Use Tailscale tags to authenticate and identify non-user devices, such as a server.

[**Auth keys**](/docs/features/access-control/auth-keys) — Use Tailscale auth keys to authenticate devices, automate device provisioning, and enhance security. Create and manage auth keys for streamlined network access and control.

[**Ephemeral nodes**](/docs/features/ephemeral-nodes) — Use ephemeral nodes in Tailscale for managing short-lived devices like containers and CI/CD systems.

## Secure remote access and enable TLS connections

After you authenticate your servers, you need secure ways to access and manage them. Tailscale provides built-in support for both SSH and HTTPS access.

Tailscale SSH eliminates the complexity of traditional SSH key management. It automatically handles key distribution and user authentication based on your existing identity provider permissions.

[**Tailscale SSH**](/docs/features/tailscale-ssh) — Use Tailscale SSH to manage the authentication and authorization of SSH connections in your tailnet.

Tailscale secures connections between tailnet devices with end-to-end encryption. However, some applications are not aware of that and might warn users or disable features based on the fact that HTTP URLs to your tailnet services look unencrypted because they're not using TLS certificates. You can prevent these problems by configuring your tailnet to use HTTPS.

[**Enabling HTTPS**](/docs/how-to/set-up-https-certificates) — Configure HTTPS for devices in your Tailscale network.
