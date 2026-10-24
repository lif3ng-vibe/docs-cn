---
title: "Connect to network attached storage (NAS)"
description: "Install the Tailscale client on supported network-attached storage (NAS) devices."
---

Last validated Oct 29, 2025

Tailscale helps you securely connect to your [Network-Attached Storage (NAS)][xt-wikipedia-nas] devices over WireGuard®. There are different levels of official or community support depending on the platform.

Tailscale is completely free for most personal uses, including accessing your NAS. In general, [install Tailscale][docs-install-linux] on the NAS and follow the steps to authorize it. More specific instructions are available for some vendors as described below.

## Synology

Tailscale is available officially as an app in the Synology Package Center, including a user-friendly web UI for configuration. Refer to our [Tailscale on Synology][docs-synology] topic for details.

## QNAP

Tailscale is available officially as an app in the QNAP App Center, including a user-friendly web UI for configuration. Refer to our [Tailscale on QNAP][docs-qnap] topic for details.

## TrueNAS SCALE

Tailscale is available officially as an app in the TrueNAS SCALE software. Refer to our [Tailscale on TrueNAS SCALE][docs-truenas-scale] topic for details.

## Unraid

Tailscale is available officially as an app in the Unraid software. Refer to our [Tailscale on Unraid][docs-unraid] topic for details.

## FreeNAS

FreeBSD support for Tailscale is community-maintained, and the client is available in [FreshPorts][xt-freshports-tailscale].

[docs-install-linux]: /docs/install/linux

[docs-qnap]: /docs/integrations/qnap

[docs-synology]: /docs/integrations/synology

[docs-truenas-scale]: /docs/integrations/truenas

[docs-unraid]: /docs/integrations/unraid

[xt-freshports-tailscale]: https://www.freshports.org/security/tailscale

[xt-wikipedia-nas]: https://en.wikipedia.org/wiki/Network-attached_storage
