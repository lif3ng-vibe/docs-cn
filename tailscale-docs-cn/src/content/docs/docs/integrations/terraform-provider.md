---
title: "Manage Tailscale resources using Terraform"
description: "Use the Terraform Tailscale provider to interact with the Tailscale API."
---

Last validated Jan 30, 2026

[Terraform][xt-terraform] is an infrastructure as code (IaC) tool that lets you deploy infrastructure programmatically. Tailscale maintains the [Tailscale Terraform provider][xt-terraform-tailscale] in the Terraform registry by Tailscale. We recommend using the latest version of the provider.

You can use the Tailscale Terraform provider to:

* Define your [policy file][docs-policy-file] using the [`tailscale_acl` resource][xt-terraform-tailscale-acls].
* Set [DNS settings][docs-dns], including:
  * Global nameservers using the [`tailscale_dns_nameservers` resource][xt-terraform-tailscale-dns-nameservers].
  * Restricted nameservers for split DNS, using the [`tailscale_dns_search_paths` resource][xt-terraform-tailscale-dns-search-paths].
  * [MagicDNS][docs-magicdns] using the [`tailscale_dns_preferences` resource][xt-terraform-tailscale-dns-preferences].
* Generate an [auth key][docs-auth-keys] (including setting whether it's reusable, ephemeral, pre-authorized, and tagged)
  using the [`tailscale_key` resource][xt-terraform-tailscale-tailnet-key].
* Manage properties of a device, including:
  * [Device approval][docs-device-approval] using the [`tailscale_device_authorization` resource][xt-terraform-tailscale-device-auth].
  * [Key expiry][docs-key-expiry] using the [`tailscale_device_key` resource][xt-terraform-tailscale-device-key].
  * [Tags][docs-tags] using the [`tailscale_device_tags` resource][xt-terraform-tailscale-device-tags].
  * [Subnet routes][docs-subnets] using the [`tailscale_device_subnet_routes` resource][xt-terraform-tailscale-device-subnets].

Refer to the [Terraform Provider documentation][xt-terraform-tailscale-docs] for the full list of supported resources.

## Credentials and tailnet configuration

To use Terraform with Tailscale, configure the [Tailscale Terraform provider][xt-terraform-tailscale] with your
Tailscale credentials, which can be a [trust credential](https://console.tailscale.com/admin/settings/trust-credentials) or an [API access token](https://console.tailscale.com/admin/settings/keys).

> **Note:**
>
> Tailscale recommend that you use a trust credential (an OAuth client or federated identity) because trust credentials are associated with the tailnet, not an individual user, do not expire, and support [scopes][docs-trust-credentials-scopes]. For details, refer to [trust credentials][docs-trust-credentials].

You must also specify your tailnet in the Tailscale Terraform provider configuration. You can provide a dash (`-`) to reference the default tailnet of the [trust credential][docs-trust-credentials] (or API access token) used as credentials. Using the default tailnet from the credential information is the best option for most users. Alternatively, you can specify your [tailnet ID][docs-tailnet-name-tailnet-id]. You can find your tailnet ID in the [General](https://console.tailscale.com/admin/settings/general) page of the admin console.

> **Note:**
>
> It is not recommended to store sensitive information, such as an OAuth client or API access token, in source control. Instead, use an environment variable or a secrets manager.

Use the default variables `TAILSCALE_OAUTH_CLIENT_ID`, `TAILSCALE_OAUTH_CLIENT_SECRET`, and `TAILSCALE_TAILNET` to provide your credentials and tailnet organization name to the Tailscale Terraform provider. Alternatively, refer to the Terraform documentation for [setting values with variables][xt-hashicorp-values-with-variables].

If you are using a federated identity instead of an OAuth client, use the default `TAILSCALE_IDENTITY_TOKEN` variable instead of `TAILSCALE_OAUTH_CLIENT_SECRET`.

If you are using an API access token instead of an OAuth client, use the default `TAILSCALE_API_KEY` variable instead of `TAILSCALE_OAUTH_CLIENT_ID` and `TAILSCALE_OAUTH_CLIENT_SECRET`.

### Environment variables

You can store most information as environment variables in Terraform. Tailscale uses environment variables for the following configuration settings:

| **Setting**                                         | **Description**                                                                                                                                                                                                                                                         | **Environment variable**        |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `api_key` (String, Sensitive)                       | The API key to use for authenticating requests to the API. Conflicts with '`TAILSCALE_OAUTH_CLIENT_ID`' and '`TAILSCALE_OAUTH_CLIENT_SECRET`'.                                                                                                                          | `TAILSCALE_API_KEY`             |
| `base_url` (String)                                 | The base URL of the Tailscale API. Defaults to `https://api.tailscale.com`.                                                                                                                                                                                             | `TAILSCALE_BASE_URL`            |
| `TAILSCALE_OAUTH_CLIENT_ID` (String)                | The OAuth application or federated identity's ID when using OAuth client credentials or workload identity federation. If set, then either '`TAILSCALE_OAUTH_CLIENT_SECRET`' or '`TAILSCALE_IDENTITY_TOKEN`' must also be set, but not both. Conflicts with '`api_key`'. | `TAILSCALE_OAUTH_CLIENT_ID`     |
| `TAILSCALE_OAUTH_CLIENT_SECRET` (String, Sensitive) | The OAuth application's secret when using OAuth client credentials. If set, '`TAILSCALE_OAUTH_CLIENT_ID`' must also be set. Conflicts with '`api_key`' and '`identity_token`'.                                                                                          | `TAILSCALE_OAUTH_CLIENT_SECRET` |
| `TAILSCALE_IDENTITY_TOKEN` (String, Sensitive)      | The JWT identity token to exchange for a Tailscale API token when using a federated identity. Conflicts with '`api_key`' and '`client_secret`'.                                                                                                                         | `TAILSCALE_OAUTH_CLIENT_SECRET` |
| `tailnet` (String)                                  | The [tailnet ID][docs-tailnet-name-tailnet-id] to perform actions in.                                                                                                                                                                                                   | `TAILSCALE_TAILNET`             |

### Migrate from the community-contributed Terraform provider

If you previously used the community-contributed Terraform provider, and now want to use the provider managed and published by Tailscale, update the `source` argument in your Terraform configuration. That is, update `source = "davidsbond/tailscale"` to `source = "tailscale/tailscale"`.

## Special thanks

Special thanks to [David Bond][xt-gh-david-bond], who contributed and maintained the original community-contributed Tailscale Terraform provider. Tailscale now maintains and publishes this provider.

## Support

The Tailscale Terraform provider is maintained and published in the Terraform registry by Tailscale. If you have an issue or feature request, [contact support][co-contact-support] or [file a GitHub issue][xt-gh-tailscale-terraform-issues].

[co-contact-support]: https://tailscale.com/contact/support

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-magicdns]: /docs/features/magicdns

[docs-policy-file]: /docs/features/tailnet-policy-file

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-name-tailnet-id]: /docs/concepts/tailnet-name#tailnet-id

[docs-trust-credentials]: /docs/reference/trust-credentials

[docs-trust-credentials-scopes]: /docs/reference/trust-credentials#scopes

[xt-gh-david-bond]: https://github.com/davidsbond

[xt-gh-tailscale-terraform-issues]: https://github.com/tailscale/terraform-provider-tailscale/issues

[xt-hashicorp-values-with-variables]: https://developer.hashicorp.com/terraform/tutorials/configuration-language/sensitive-variables#set-values-with-variables

[xt-terraform-tailscale-acls]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/acl

[xt-terraform-tailscale-device-auth]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/device_authorization

[xt-terraform-tailscale-device-key]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/device_key

[xt-terraform-tailscale-device-subnets]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/device_subnet_routes

[xt-terraform-tailscale-device-tags]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/device_tags

[xt-terraform-tailscale-dns-nameservers]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/dns_nameservers

[xt-terraform-tailscale-dns-preferences]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/dns_preferences

[xt-terraform-tailscale-dns-search-paths]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/dns_search_paths

[xt-terraform-tailscale-tailnet-key]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs/resources/tailnet_key

[xt-terraform-tailscale]: https://registry.terraform.io/providers/tailscale/tailscale/latest

[xt-terraform-tailscale-docs]: https://registry.terraform.io/providers/tailscale/tailscale/latest/docs

[xt-terraform]: https://www.terraform.io
