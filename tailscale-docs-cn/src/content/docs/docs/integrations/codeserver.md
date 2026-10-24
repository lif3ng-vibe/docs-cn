---
title: "Access your tailnet from code-server"
description: "Write code remotely by installing Tailscale on code-server."
---

Last validated Sep 18, 2025

[code-server][xt-gh-code-server] is a way to run Visual Studio Code anywhere and access it in through a browser.

Tailscale can be installed within a code-server VM to be able to access private resources securely,
such as databases or continuous integration nodes or servers in the dev/test environment.

## Integration

code-server is installed within a VM with [instructions for a number of hosting providers][xt-gh-code-server-install].

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

[xt-gh-code-server-install]: https://github.com/cdr/code-server/blob/main/docs/install.md

[xt-gh-code-server]: https://github.com/cdr/code-server
