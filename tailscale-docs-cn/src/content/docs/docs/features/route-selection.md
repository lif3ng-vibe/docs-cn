---
title: "Route selection"
description: "Compare and configure route selection for subnet routers, app connectors, and Tailscale Service hosts, including MagicRoute exit node recommendations."
---

Last validated Oct 7, 2026

Route selection controls how Tailscale chooses among overlapping connectors in your tailnet:

* [Subnet routers][docs-subnets] advertising the same route prefixes.
* [App connectors][docs-app-connectors] configured for the same apps.
* [Exit nodes][docs-recommended-exit-nodes] available to a client.
* Hosts for the same [Tailscale Service][docs-tailscale-services].

The setting applies to the whole tailnet. Connectors must meet your access control and approval requirements to be visible to clients.

## Compare route selection options

| Option                                       | When to use it                                                                      | Availability                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **active-passive failover**                  | Use one primary connector and keep others as standbys.                              | Default on all plans.                                                   |
| **regional routing**                         | Distribute clients across connectors in their selected DERP region.                 | Premium and Enterprise.                                                 |
| **regional routing with in-region failover** | Use one primary connector in each DERP region and keep others as standbys.          | Premium and Enterprise, with support enablement.                        |
| **[MagicRoute][docs-magicroute]**            | Select a connector or Service host by priority score. Supports custom DERP servers. | Beta for Premium and Enterprise tailnets eligible for regional routing. |

### Active-passive failover

Active-passive failover selects the eligible connector that joined the tailnet first. If that connector goes offline, Tailscale selects the next eligible connector in oldest-first order.

When you use [`tailscale down`][docs-tailscale-cli-down] on the primary connector, failover can take about 15 seconds. Failover can take longer after a network partition or if you disable a network interface another way. For setup instructions, refer to [Set up high availability][docs-ha].

### Regional routing

Regional routing groups connectors by Tailscale [DERP region][docs-derp]. Tailscale selects a region using client-reported latency measurements to DERP servers. Clients periodically re-evaluate the region. If a region has no available connectors, Tailscale uses another region.

Each client has a stable pseudorandom order of preference for connectors in the region. If its preferred connector becomes unavailable, it uses the next one. Distribution is best effort.

This option is incompatible with [custom DERP servers][docs-custom-derp].

### Regional routing with in-region failover

This option selects a region using regional routing, then uses oldest-first failover among connectors in that region. Contact [Tailscale Support][co-support] or your account team to enable it.

This option is incompatible with [custom DERP servers][docs-custom-derp].

### MagicRoute beta

> **Note:** MagicRoute is currently in beta.

MagicRoute selects a connector or Service host for each client using a priority score. It supports custom DERP servers and does not group candidates by DERP region. Existing regional routing customers must opt in. For compatibility, exit node recommendations, and limitations, refer to [MagicRoute][docs-magicroute].

## Route selection use cases

Regional routing and MagicRoute can select among overlapping connectors in these deployments.

### Connect remote employees to transit backbones

If you use a cloud provider's transit backbone, deploy subnet routers at multiple points of presence. Regional routing or MagicRoute selects a router for each client to access the backbone.

### Connect to a globally replicated application or VPC

For an application in two cloud regions, deploy a subnet router in each region advertising the same route prefix. Regional routing or MagicRoute selects a router for each client. Both options can also select among eligible [Tailscale Service hosts][docs-tailscale-services].

### Connect a global workforce to a SaaS app

If your apps return location-dependent DNS results, deploy app connectors in different geographic locations. Regional routing or MagicRoute selects among eligible app connectors. For setup guidance, refer to [Best practices for using app connectors][docs-app-connectors-best-practices].

## Prerequisites

Set up the connectors you want to use:

* **Subnet routers**: Deploy multiple subnet routers that advertise the same approved route prefixes.
* **App connectors**: [Configure multiple connectors][docs-app-connector-ha] for the same apps.

### Route eligibility and prefix matching

Subnet routers must advertise identical route prefixes to provide failover. Tailscale uses longest-prefix matching when routes overlap. If every subnet router for a more-specific prefix goes offline, Tailscale does not fall back to a broader prefix. Refer to [Troubleshoot overlapping subnet route failover][docs-overlapping-routes] for examples.

If you use [`via` in grants][docs-via], route selection chooses only among subnet routers eligible for the user and traffic.

## Change the route selection option

You can change the route selection option in the admin console or with the API. The setting applies to the whole tailnet.

### Use the admin console

You must be an [Owner, Admin, or IT admin](/docs/reference/user-roles) to change this setting.

The admin console offers **active-passive failover**, **regional routing**, and **MagicRoute**, depending on your plan. After support enablement, **regional routing with in-region failover** is also available in the admin console.

1. Open the [General](https://console.tailscale.com/admin/settings/general) page of the admin console.
2. In **Route selection**, select an available option, such as **MagicRoute**.
3. Select the save button.
4. After the success notification, reload the page to confirm your selection. Then [check routing from your clients][ar-verify].

### Use the API

Use the [tailnet settings API][co-api-tailnet-settings] to read or change `routeSelection`. With scoped credentials, use `feature_settings:read` to read the setting or `feature_settings` to change it. The write scope includes read access. Refer to [API authentication][docs-api-authentication] and [credential scopes][docs-credential-scopes].

The examples use `ACCESS_TOKEN` for a credential with the required scope and `TAILNET_ID` for your [tailnet ID][docs-tailnet-id]. Read the current setting:

```shell
curl --fail-with-body \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  "https://api.tailscale.com/api/v2/tailnet/$TAILNET_ID/settings"
```

Set `routeSelection` to one of these values:

| Option                                   | API value                   |
| ---------------------------------------- | --------------------------- |
| active-passive failover                  | `active-passive-failover`   |
| regional routing                         | `regional-routing`          |
| regional routing with in-region failover | `regional-routing-failover` |
| MagicRoute                               | `magicroute`                |

The API has the same plan and support requirements. To select MagicRoute:

```shell
curl --fail-with-body \
  --request PATCH \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"routeSelection":"magicroute"}' \
  "https://api.tailscale.com/api/v2/tailnet/$TAILNET_ID/settings"
```

Repeat the GET request and confirm that `routeSelection` is `magicroute`. Then [check routing from your clients][ar-verify].

The API rejects PATCH requests containing both `regionalRoutingOn` and `routeSelection`. Send only one of these fields.

The legacy `regionalRoutingOn` field is `true` only for regional routing and `false` for all other options. Writing `true` selects regional routing. Writing `false` selects active-passive failover. Automation that writes this field can overwrite your selection. Use `routeSelection` to distinguish and configure all four options.

## Verify route selection

After confirming the saved setting, test new requests from clients in different locations:

* **Subnet routers**: Send network traffic from a client that accepts subnet routes to a destination in the advertised subnet.
* **App connectors**: Resolve the app's configured domain and request the app from a client that accepts its routes.
* **Recommended exit nodes**: [Choose a recommendation][docs-recommended-exit-nodes], then check the client's active exit node and test internet access. To test MagicRoute recommendations, use a client running Tailscale v1.86.0 or later.

For subnet routers and app connectors, run [`tailscale status`][docs-tailscale-cli-status] on the client while making requests:

```shell
tailscale status
```

Compare the candidate connectors' `active` status and `tx` and `rx` byte counts between requests. These show peer activity, which can include unrelated traffic. They do not by themselves identify which connector routes a particular destination.

To inspect the client's route assignments, run:

```shell
tailscale status --json
```

In the `Peer` entries, find the longest prefix in `PrimaryRoutes` that contains the destination IP address. That peer is the client's primary router for that prefix. For an app connector, use the destination IP address returned by DNS.

If requests fail, check route approvals, client route acceptance, and access controls. Refer to [Route injection][docs-route-injection] or [app connector setup][docs-app-connector-setup] for troubleshooting.

[ar-verify]: #verify-route-selection

[co-api-tailnet-settings]: https://tailscale.com/api#tag/tailnetsettings

[co-support]: https://tailscale.com/contact/support

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-app-connector-ha]: /docs/how-to/set-up-high-availability#app-connector-high-availability

[docs-app-connector-setup]: /docs/features/app-connectors/how-to/setup

[docs-app-connectors]: /docs/features/app-connectors

[docs-app-connectors-best-practices]: /docs/reference/best-practices/app-connectors

[docs-credential-scopes]: /docs/reference/trust-credentials#scopes

[docs-custom-derp]: /docs/reference/derp-servers/custom-derp-servers

[docs-derp]: /docs/reference/derp-servers

[docs-ha]: /docs/how-to/set-up-high-availability

[docs-magicroute]: /docs/features/magicroute

[docs-overlapping-routes]: /docs/reference/troubleshooting/network-configuration/overlapping-subnet-route-failover

[docs-recommended-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-route-injection]: /docs/reference/route-injection

[docs-subnets]: /docs/features/subnet-routers

[docs-tailnet-id]: /docs/concepts/tailnet-name#tailnet-id

[docs-tailscale-cli-down]: /docs/reference/tailscale-cli#down

[docs-tailscale-cli-status]: /docs/reference/tailscale-cli#status

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-via]: /docs/features/access-control/grants/grants-via
