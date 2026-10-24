---
title: "Access your tailnet from OpenVSCode"
description: "Write code remotely by installing Tailscale on OpenVSCode."
---

Last validated Sep 18, 2025

[OpenVSCode][xt-gitpod-openvscode] is a way to run Visual Studio
Code on a remote machine accessed through a modern web browser.

Tailscale can be installed within an OpenVSCode VM to be able to access private resources securely,
such as databases or continuous integration nodes or servers in the dev/test environment.

## Integration

OpenVSCode is installed within a VM with [instructions for a number of hosting providers][xt-gh-open-vs-code].

Tailscale can be [installed in VMs][docs-install-linux]
for many common hosting providers like
[AWS][docs-install-aws],
[Azure][docs-cloud-azure-linux],
[Google Cloud][docs-cloud-gce], and
[Hetzner][docs-cloud-hetzner].

## Authorization

The VM will need to be authorized to join the tailnet using either a browser to log in,
or a [one-time auth key][docs-auth-keys].

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cloud-azure-linux]: /docs/install/cloud/azure/linux

[docs-cloud-gce]: /docs/install/cloud/gce

[docs-cloud-hetzner]: /docs/install/cloud/hetzner

[docs-install-aws]: /docs/install/cloud/aws

[docs-install-linux]: /docs/install/linux

[xt-gh-open-vs-code]: https://github.com/gitpod-io/openvscode-server/tree/docs/guides

[xt-gitpod-openvscode]: https://www.gitpod.io/blog/openvscode-server-launch
