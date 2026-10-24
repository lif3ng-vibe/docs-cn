---
title: "Manage Tailscale resources using Pulumi"
description: "Use the Pulumi Tailscale provider to interact with the Tailscale API."
---

Last validated Mar 3, 2025

[Pulumi][xt-pulumi] is an infrastructure as code (IaC) tool that lets you deploy infrastructure programmatically. Pulumi maintains the [Tailscale Pulumi provider][xt-pulumi-tailscale] in the Pulumi registry.

You can use the Tailscale Pulumi provider to:

* Define your [ACLs][docs-acls] using the [`Acl` resource][xt-pulumi-tailscale-api-acl].
* Set [DNS settings][docs-dns], including:
  * Global nameservers using the [`DnsNameservers` resource][xt-pulumi-tailscale-api-dnsnameservers].
  * Restricted nameservers for split DNS using the [`DnsSearchPaths` resource][xt-pulumi-tailscale-api-dnssearchpaths].
  * [MagicDNS][docs-magicdns] using the [`DnsPreferences` resource][xt-pulumi-tailscale-api-dnspreferences].
* Generate an [auth key][docs-auth-keys] (including setting whether it's reusable, ephemeral, pre-authorized, and tagged) using the [`TailnetKey` resource][xt-pulumi-tailscale-api-tailnetkey].
* Manage properties of a device, including:
  * [Device approval][docs-device-approval] using the [`DeviceAuthorization` resource][xt-pulumi-tailscale-api-deviceauthorization].
  * [Key expiry][docs-key-expiry] using the [`DeviceKey` resource][xt-pulumi-tailscale-api-devicekeys].
  * [Tags][docs-tags] using the [`DeviceTags` resource][xt-pulumi-tailscale-api-devicetags].
  * [Subnet routes][docs-subnets] using the [`DeviceSubnetRoutes` resource][xt-pulumi-tailscale-api-devicesubnetroutes].

## Installation steps

To use Pulumi with Tailscale:

1. Install the package for the Tailscale Pulumi provider in [Node.js, Python, Go, or .NET][xt-gh-pulumi-install].
2. Set the Tailscale configuration for Pulumi with an [API access token][docs-api] for Tailscale and with the name of your tailnet. You can either [set these as environment variables or as part of your Pulumi configuration][xt-pulumi-tailscale-configure]. To set these in your Pulumi configuration:

   ```shell
   pulumi config set tailscale:apiKey tskey-1234567CNTRL-abcdefghijklmnopqrstu --secret
   pulumi config set tailscale:tailnet example.com
   ```

## Support

If you have an issue or feature request, [file a GitHub issue][xt-gh-pulumi-tailscale-issues].

[docs-acls]: /docs/features/access-control/acls

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-magicdns]: /docs/features/magicdns

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[xt-gh-pulumi-install]: https://github.com/pulumi/pulumi-tailscale/blob/master/README.md#installing

[xt-gh-pulumi-tailscale-issues]: https://github.com/pulumi/pulumi-tailscale/issues

[xt-pulumi-tailscale-api-acl]: https://www.pulumi.com/registry/packages/tailscale/api-docs/acl

[xt-pulumi-tailscale-api-deviceauthorization]: https://www.pulumi.com/registry/packages/tailscale/api-docs/deviceauthorization

[xt-pulumi-tailscale-api-devicekeys]: https://www.pulumi.com/registry/packages/tailscale/api-docs/devicekey

[xt-pulumi-tailscale-api-devicesubnetroutes]: https://www.pulumi.com/registry/packages/tailscale/api-docs/devicesubnetroutes

[xt-pulumi-tailscale-api-devicetags]: https://www.pulumi.com/registry/packages/tailscale/api-docs/devicetags

[xt-pulumi-tailscale-api-dnsnameservers]: https://www.pulumi.com/registry/packages/tailscale/api-docs/dnsnameservers

[xt-pulumi-tailscale-api-dnspreferences]: https://www.pulumi.com/registry/packages/tailscale/api-docs/dnspreferences

[xt-pulumi-tailscale-api-dnssearchpaths]: https://www.pulumi.com/registry/packages/tailscale/api-docs/dnssearchpaths

[xt-pulumi-tailscale-api-tailnetkey]: https://www.pulumi.com/registry/packages/tailscale/api-docs/tailnetkey

[xt-pulumi-tailscale-configure]: https://www.pulumi.com/registry/packages/tailscale/installation-configuration/#configuring-the-provider

[xt-pulumi-tailscale]: https://www.pulumi.com/registry/packages/tailscale

[xt-pulumi]: https://www.pulumi.com
