---
title: "Install Tailscale with cloud-init"
description: "Install Tailscale automatically on the first boot of a machine with cloud-init."
---

Last validated Jan 5, 2026

Cloud-init is a standard mechanism for initializing new server images, typically with a cloud provider. The project was started by Canonical, and is now supported by [multiple operating systems and most major Linux distributions][xt-cloudinit-distros] and is available on [nearly all public cloud providers][xt-cloudinit-datasources-supported].

> **Note:**
>
> The following related video provides additional context and examples.

[How to use cloud-init and Tailscale part 1 | Automate your cloud infrastructure as code! (video)](https://www.youtube.com/watch?v=e-X5FJwrkaA)

This document only touches on a subset of cloud-init's capabilities. In particular, it provides a template to direct a new machine to automatically join a tailnet on first boot with a "cloud-config" file. This kind of file is used in the user data portion of the cloud-init process. The specifics of how to provide this file vary between cloud providers; we've provided some links in the [vendor-specific documentation][ar-vendor-specific-cloud-init-documentation] section.

Because of cloud-init's connection to providers of major cloud infrastructure, it's typically associated with use cases involving the automated instantiation of many machines. Indeed, this document may be of assistance to users who are spinning up many nodes and want them each to join a tailnet without manual configuration.

This cloud-init configuration may also be helpful for users who are only creating a small number of nodes, and want to be able to interact with those machines over Tailscale as soon as they are available. For example, a user may be creating a machine on a public VPS to provide an exit node or a service available over the tailnet. Using cloud-init can make the machine accessible over Tailscale immediately, without having to first set up SSH and log in to do initial configuration.

> **Note:**
>
> We've developed a [utility called Tailgraft][xt-gh-tailscale-tailgraft] to automate the use of cloud configuration files on Raspberry Pi machines. Read more in the
> [blog post announcing the tool][xt-tailgraft].

All the Tailscale installation and configuration occurs in a block called `runcmd` that specifies commands to run toward the end of the first boot process. If you've already got a cloud-config file, you can add this block to the end of it, or it can serve as the entire file.

As indicated in the template, this usage requires an [auth key][docs-auth-keys]. You can generate an auth key from the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console, or through an authenticated instance of the [get-authkey utility][docs-oauth-clients-get-authkey-utility].

## A cloud-config sample template

```
#cloud-config
# The above header must generally appear on the first line of a cloud config
# file, but all other lines that begin with a # are optional comments.

runcmd:
  # One-command install, from https://tailscale.com/download/
  - ['sh', '-c', 'curl -fsSL https://tailscale.com/install.sh | sh']
  # Set sysctl settings for IP forwarding (useful when configuring an exit node)
  - ['sh', '-c', "echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf && echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf && sudo sysctl -p /etc/sysctl.d/99-tailscale.conf" ]
  # Generate an auth key from your Admin console
  # https://console.tailscale.com/admin/settings/keys
  # and replace the placeholder below
  - ['tailscale', 'up', '--auth-key=tskey-abcdef1432341818']
  # (Optional) Include this line to make this node available over Tailscale SSH
  - ['tailscale', 'set', '--ssh']
  # (Optional) Include this line to configure this machine as an exit node
  - ['tailscale', 'set', '--advertise-exit-node']
```

## Vendor-specific cloud-init documentation

This list of vendors is not exhaustive; if you don't find your preferred cloud provider here, try searching its documentation for "cloud-init" to find how to enter your cloud-config data. The summaries here are provided as a starting point, but more information is available at each of the links below.

* [Amazon EC2][xt-aws-ec2-pass-user-data]\
  Add the cloud-config info in the **User data** field under **Advanced details** when launching a new instance from the web dashboard, or provide a file path with the `--user-data` flag of the `aws` command line tool.
* [Google Cloud][xt-google-create-instance]\
  Specify a cloud-config file path with the `--metadata-from-file` flag and the `user-data` field of the `gcloud` command line tool.
* [Microsoft Azure][xt-entra-cloud-init]\
  Specify a cloud-config file path as a parameter to the `--custom-data` flag of the `az` command line tool.
* [Digital Ocean][xt-digital-ocean-provide-user-data]\
  Open **Advanced Options** from the Droplet creation web dashboard and provide cloud-config info after selecting **Add Initialization scripts**, or specify a path to the `--user-data` or `--user-data-file` flags of the `doctl` command line tool.
* [Vultr][xt-vultr-deploy-cloudinit-userdata]\
  Add cloud-config data by checking the **Enable Cloud-Init User-Data** box in the **Additional Features** section of the deployment page, or provide the data itself as an argument to the `--userdata` field of the `vultr-cli` command line tool.
* [Linode][xt-linode-add-user-data]\
  Provide cloud-config data in the **Add User Data** section of the **Create Linode** tool, or provide the base64-encoded cloud-config data as an argument to the `--metadata.user_data` flag of the `linode-cli` command line tool.
* [Oracle Cloud][xt-oracle-custom-scripts]\
  Provide cloud-config data or a cloud-config file from the web console by selecting **Initialization Script** in the **Advanced Options** section of the **Custom Create** workflow, or provide the base64-encoded cloud-config data as a value with the `user-data` key to the `--node-metadata` flag of the `oci` command line tool

- [Hetzner][xt-hetzner-cloud-config]\
  Provide cloud-config data in the **Cloud config** text box in the **Cloud Console** creation flow.

[ar-vendor-specific-cloud-init-documentation]: #vendor-specific-cloud-init-documentation

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-oauth-clients-get-authkey-utility]: /docs/features/oauth-clients#get-authkey-utility

[xt-aws-ec2-pass-user-data]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html

[xt-cloudinit-datasources-supported]: https://docs.cloud-init.io/en/latest/reference/datasources.html#datasources-supported

[xt-cloudinit-distros]: https://docs.cloud-init.io/en/latest/reference/availability.html

[xt-digital-ocean-provide-user-data]: https://docs.digitalocean.com/products/droplets/how-to/provide-user-data/#providing-user-data

[xt-entra-cloud-init]: https://learn.microsoft.com/en-us/azure/virtual-machines/linux/using-cloud-init

[xt-gh-tailscale-tailgraft]: https://github.com/tailscale-dev/tailgraft

[xt-google-create-instance]: https://cloud.google.com/container-optimized-os/docs/how-to/create-configure-instance

[xt-hetzner-cloud-config]: https://community.hetzner.com/tutorials/basic-cloud-config

[xt-linode-add-user-data]: https://techdocs.akamai.com/cloud-computing/docs/add-user-data-when-deploying-a-compute-instance

[xt-oracle-custom-scripts]: https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengusingcustomcloudinitscripts.htm

[xt-tailgraft]: https://tailscale.dev/blog/tailgraft

[xt-vultr-deploy-cloudinit-userdata]: https://www.vultr.com/docs/how-to-deploy-a-vultr-server-with-cloudinit-userdata
