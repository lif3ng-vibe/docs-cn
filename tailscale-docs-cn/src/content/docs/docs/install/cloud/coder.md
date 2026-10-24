---
title: "Access your tailnet from Coder"
description: "[Coder][xt-coder] is a developer workspace platform which lets you develop code in a remote environment like a VM running in a cloud provider. In Coder, you define your developer workspace as a Docker"
---

Last validated Mar 3, 2025

[Coder][xt-coder] is a developer workspace platform which lets you develop code in a remote environment like a VM running in a cloud provider. In Coder, you define your developer workspace as a Dockerfile.

Tailscale can be installed within a Coder workspace to be able to access private
resources securely, such as package registries, or to share an environment with
your colleagues for code review or pair programming.

## Integration

Follow [Coder's instructions for getting Tailscale working in a Coder workspace][xt-coder-tailscale-customize]. You'll need to:

1. Add `tailscaled` in your [workspace's Dockerfile][xt-coder-custom-images]. You'll also need to ensure that Tailscale's persistent state is stored in the workspace's persistent home volume, so that Tailscale can persist connections across workspace rebuilds
2. Enable [userspace networking][docs-userspace-networking], and if you want to be able to have outbound connections, configure Tailscale as either a SOCKS5 or HTTP proxy

## Authorization

To allow the Coder workspace to join your tailnet, authenticate to Tailscale from your workspace using `sudo tailscale up`.

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-coder-custom-images]: https://coder.com/docs/coder/latest/images/writing

[xt-coder-tailscale-customize]: https://coder.com/docs/coder/latest/guides/customization/tailscale

[xt-coder]: https://coder.com
