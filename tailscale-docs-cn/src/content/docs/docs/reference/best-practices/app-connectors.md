---
title: "Best practices for using app connectors"
description: "To ensure reliable performance of your app connectors, we recommend several best practices. Approaches like preconfiguring settings and using deferred approvals can streamline setup and reduce potenti"
---

Last validated Oct 7, 2026

> **Note:** App connectors are available for [all plans](https://tailscale.com/pricing).

To ensure reliable performance of your app connectors, we recommend several best practices. Approaches like preconfiguring settings and using deferred approvals can streamline setup and reduce potential disruptions. Understanding how traffic routes, especially in complex or multi-tenant environments can also help prevent issues related to performance and unintended access to your applications.

## Configure apps for route discovery

You can optimize route discovery and efficiency for your app connectors using domain names, CNAME records, and wildcards.

### Domains

You can configure app connectors with a list of valid, fully qualified domain names (FQDNs). Tailscale routes DNS records like `A` for IPv4 addresses and `AAAA` for IPv6 addresses through app connectors.

App connectors automatically discover routes when you add a domain to their configuration. Without pre-configured routes, the app connector enters a learning period where it proxies DNS requests for configured domains from end-users. The app connector identifies routing records from these requests and advertises them as routes.

With [auto approval][docs-policy-syntax-autoapprovers] enabled, Tailscale automatically approves newly discovered routes and immediately advertises them to devices. The learning period ends when the app connector discovers all routes. This typically happens quickly for smaller domains. Large domain lists or domains with wildcards can take longer.

If multiple app connectors advertise a route, Tailscale uses the tailnet's [route selection option][docs-route-selection] to choose an eligible app connector for each client.

### DNS lookups

App connectors work by acting as the authoritative nameserver for the domains configured on an app. For example, when you configure an app for a domain (such as `*.example.com`), it creates an invisible [split DNS][docs-dns] entry. Tailscale sends any subsequent DNS lookups for `*.example.com` to the appropriate app connectors. Each app connector performs the DNS lookup. If the lookup succeeds, it introduces a new subnet route for the resolved IP address before returning the response to the device that initiated the DNS lookup.

### Port access for DNS discovery

Client devices require access to the app connector tag for DNS discovery to function. The discovery mechanism uses the PeerAPI, which requires the app connector to be visible as a peer.

Grant minimal access, such as TCP or UDP on port `53` (`tcp:53` or `udp:53`), to enable peer discovery. Without this access, DNS lookups won't reach the app connector, and route discovery won't occur.

### CNAME records

App connectors support (CNAME) records by resolving them to their target addresses and automatically advertising the resulting routes. Since CNAMEs are DNS aliases (not routing records), the connector follows the chain and automatically advertise the resulting routes. A CNAME chain is a sequence of DNS records where each CNAME points to another domain name, until it resolves to an A record that indicates destination's IP address.

Use the [`dig`][xt-wikipedia-dig] command to verify CNAME configuration. The following code block contains an example of the expected output:

```shell
.1. app.acme.com IN CNAME acme.backend.com
.2. acme.backend.com A ...
```

In the above example, the target of the `CNAME` chain, `acme.backend.com`, will route advertisements instead of `app.acme.com`.

If a web service uses geographic DNS load balancing, `CNAME` records might return different results in different locations. We recommend deploying app connectors in locations that match your organization's global footprint. Use regional routing or MagicRoute to select among eligible app connectors for each client. Refer to [Route selection][docs-route-selection] for details.

### Wildcards

Your app connector configuration can include wildcards (`*`). Wildcard behavior is non-inclusive of the parent domain. For example:

* To include all of `acme.com` and its subdomains, use both `acme.com` and `*.acme.com`.
* To only include the top-level domain, include `acme.com` and omit `*.acme.com`.
* To include only subdomains, include `*.acme.com` and omit `acme.com`.

## Access control policy-driven route configuration

You can manually pre-configure routes as [access control policies][docs-access-control] in your [tailnet policy file][docs-tailnet-policy-file] inside the `nodeAttrs` top-level field, including domain configuration. For example:

```json
{
  "target": ["*"],
  "app": {
    "tailscale.com/app-connectors": [
      {
        "name": "example-app",
        "connectors": ["tag:example-connector"],
        "domains": ["example.com"],
        "routes": ["192.0.2.0/24"],
      }
    ],
  },
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

The app connector devices in your tailnet automatically advertise these routes as soon as you apply the [access control policy][docs-access-control] change to the tailnet policy file. App connectors for the application will immediately advertise these routes, and routes added using the access control policy section of the tailnet policy file are implicitly approved and do not require a sibling [`autoApprovers`][docs-policy-syntax-autoapprovers] entry.

This maintains strict routing control as part of the access control and approval process. In many instances, it also removes the need to use large `--advertise-routes` arguments for device configurations to avoid lengthy discovery periods with disruptive routing changes.

## Route coalescing

Routes populated by access control policy-driven route configuration coalesce or replace routes that are a sub-route of the new advertisement. For example, if the app connector previously discovered `192.0.2.5/32` and `192.0.2.67/32`, and you update the [access control policy][docs-access-control] to include `192.0.2.0/24`, the connector replaces both `/32` routes with the single `192.0.2.0/24` entry.

## Reduce reconfiguration during route discovery

App connector route discovery can be disruptive in environments with strict firewall configurations. In these environments, new routes can disrupt route-aware software like Google Chrome.

App connectors immediately advertise all discovered IPs for a single domain resolution as a single route change containing all newly discovered routes for that domain resolution.

To reduce reconfiguration time during discovery, we recommend you choose one of the following strategies:

* Use [preconfigurations][ar-preconfiguration] and access control policy-driven route configurations as extensively as possible.
* Use [deferred approvals][ar-deferred-approvals]. With deferred approvals, you delay enabling app firewalls until you discover the routes in an unapproved state, then approve them all in batches.

## Configure apps with multi-tenant IP space

Some apps use content delivery networks (CDNs) or shared IP space to serve static assets. For example, `*.static.example.com` or `*.assets.acme.com`.

Publishing these routes to your app connectors might force unrelated traffic through the app connector, as CDNs often share IPs and can include traffic to other content on those same public IP addresses. As a side effect, this can cause high bandwidth through those connectors for sites unrelated to the target app. Therefore, we recommend serving CDN and multi-tenant content outside app connectors.

## Connect large SaaS services

New route advertisements trigger client network modifications that might raise errors. For example, Google Chrome might report errors like `ERR_NETWORK_CHANGED`. You can reduce the frequency of these events using [deferred approvals][ar-deferred-approvals] or [preconfigurations][ar-preconfiguration].

### Deferred approvals

The deferred approvals approach builds in a non-disruptive learning period for new app connectors. You can defer approvals by temporarily disabling route approval or using upstream IP firewalls.

*（图：Defer route approval until after a representative business cycle has elapsed.）*

Install app connectors separately to prevent overlapping [autoApprovers][docs-policy-syntax-autoapprovers]. The app connectors receive DNS queries from the client fleet and configure advertised routes. But routes remain unapproved, and traffic maintains its regular pattern. Running in this state for a representative sample of business operations (such as a week) collects the bulk of affected routes. You can then transfer the routes to an `autoApprovers` clause.

Deferred approval blocks users from accessing an application until you approve the routes.

### Preconfiguration

*（图：Configure routes while setting up connectors）*

You can preconfigure apps if you can't run apps in a non-disruptive learning period long enough to collect all the affected routes for the [deferred approvals][ar-deferred-approvals] approach. We recommend you configure routes when setting up app connectors and configure known subdomains when configuring applications.

Even in cases where deferred approval is possible, preconfiguration can reduce the learning phase.

#### Routes

Many services, such as GitHub and Okta, publish IP address lists that you can collect into `--advertise-routes` preferences for the app connectors. Preconfiguring routes optimizes them in the following ways:

* It reduces the routing table size and costs by using address ranges rather than single IP addresses.
* You can enable upstream WAF immediately because most service-used routes are configured at boot.

#### Domains

Many applications have wildcard domains that the app connector cannot pre-flight because it does not know all the subdomains it needs to resolve. If you know all the subdomains, you can explicitly add them alongside the wildcard domains to generate a list of preconfigured routes.

Tip: You can gather subdomains from browser histories, DNS server histories, and DNS logs.

#### Automate preconfiguration

You can automate preconfiguration with a tool Tailscale offers called [connector-gen][xt-gh-tailscale-cmd-connector-gen]. It provides a simple example of parsing some common providers and producing [tailnet policy file][docs-tailnet-policy-file] snippets and [`--advertise-routes`][docs-subnet-router] flags that you can use to manually perform the preconfiguration of routes strategy.

To run the connector-gen tool:

```shell
 ./tool/go run ./cmd/connector-gen github
```

The example above produces snippets of JSON for the access control policy and an `--advertise-routes` flag.

#### Automation with Terraform

> **Warning:**
>
> Using Terraform to manage your tailnet policy file will overwrite any manual changes made in the admin console during the next sync. Ensure that all app connector configurations are managed through Terraform to prevent loss of settings.

Terraform has an HTTP data provider that you can use to consume IP address lists from upstream providers. You can then use the IP address lists to preconfigure routes when you deploy an app connector.

The following example shows preconfigurations for services like Okta, GitHub, and Amazon Web Services (AWS).

```hcl
data "http" "okta_ip_range_json" {
  url = "https://s3.amazonaws.com/okta-ip-ranges/ip_ranges.json"
}

locals {
  okta_ip_range_data = jsondecode(data.http.okta_ip_range_json.response_body)
  okta_cell_ranges   = [for key in keys(local.okta_ip_range_data) : local.okta_ip_range_data["${key}"].ip_ranges if key == "us_cell_1"]
  okta_ip_ranges     = sort(distinct(flatten(local.okta_cell_ranges)))
}

data "http" "github_meta_json" {
  url = "https://api.github.com/meta"
}

locals {
  github_meta    = jsondecode(data.http.github_meta_json.response_body)
  github_ips     = concat(local.github_meta.hooks, local.github_meta.web, local.github_meta.api, local.github_meta.git, local.github_meta.github_enterprise_importer, local.github_meta.packages, local.github_meta.pages, local.github_meta.importer, local.github_meta.actions, local.github_meta.dependabot)
  github_domains = concat(local.github_meta.domains.website, local.github_meta.domains.codespaces, local.github_meta.domains.copilot, local.github_meta.domains.packages, local.github_meta.domains.actions)
}

data "http" "aws_ip_ranges_json" {
  url = "https://ip-ranges.amazonaws.com/ip-ranges.json"
}

locals {
  aws_ip_range_data = jsondecode(data.http.aws_ip_ranges_json.response_body)
  aws_ip_ranges     = sort(distinct(concat([for prefix in local.aws_ip_range_data.prefixes : prefix.ip_prefix], [for prefix in local.aws_ip_range_data.ipv6_prefixes : prefix.ipv6_prefix])))
}

locals {
  all_ip_ranges = concat(local.okta_ip_ranges, local.github_ips, local.aws_ip_ranges)
}
```

[ar-deferred-approvals]: #deferred-approvals

[ar-preconfiguration]: #preconfiguration

[docs-access-control]: /docs/features/access-control

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-route-selection]: /docs/features/route-selection

[docs-subnet-router]: /docs/features/subnet-routers#connect-to-tailscale-as-a-subnet-router

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-gh-tailscale-cmd-connector-gen]: https://github.com/tailscale/tailscale/tree/main/cmd/connector-gen

[xt-wikipedia-dig]: https://en.wikipedia.org/wiki/Dig_\(command\)
