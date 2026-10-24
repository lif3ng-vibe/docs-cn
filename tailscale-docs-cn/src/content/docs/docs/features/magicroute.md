---
title: "MagicRoute"
description: "Select among eligible subnet routers, app connectors, and Tailscale Service hosts with MagicRoute."
---

Last validated Oct 7, 2026

> **Note:** MagicRoute is currently in beta.

> **Note:** MagicRoute is available for [the Premium and Enterprise plans](https://tailscale.com/pricing).

MagicRoute is a tailnet-wide [route selection option][docs-route-selection] that selects among eligible subnet routers, app connectors, and Tailscale Service hosts for each client using a priority score. It also changes the algorithm for [recommended exit nodes][docs-recommended-exit-nodes] on supported clients. Premium and Enterprise tailnets eligible for regional routing can opt in to the beta.

## Use cases

Use MagicRoute when you have multiple eligible resources for the same destination:

* **Subnet routers**: Select among routers advertising the same approved route prefixes, such as routers at different points of presence.
* **App connectors**: Select among connectors configured for the same apps, including apps with location-dependent DNS results.
* **Tailscale Service hosts**: Select among hosts for a Service, including backends for [Kubernetes multi-cluster ingress][docs-multi-cluster-ingress].

For examples that also apply to regional routing, refer to [Route selection use cases][docs-route-selection-use-cases].

## How it works

MagicRoute scores eligible candidates for each client using signals such as geolocation hints. Unlike regional routing, it does not group candidates by DERP region, and it supports [custom DERP servers][docs-custom-derp]. Selection is per client, not per connection.

Switching to MagicRoute changes the selection method for existing Tailscale Service hosts from DERP-region grouping or active-passive failover to priority scoring. You do not need to recreate Services or Kubernetes `Ingress` resources. For host setup, refer to [Tailscale Services][docs-tailscale-services].

MagicRoute also uses priority scoring for exit node recommendations on clients running Tailscale v1.86.0 or later. Earlier clients retain their existing recommendation behavior. It does not change whether recommended exit nodes are available to your tailnet or override an exit node that a user selected manually. Users can [select a recommendation once or track recommendations automatically][docs-recommended-exit-nodes].

## Prerequisites

Before you select MagicRoute, ensure that your tailnet and resources meet these requirements:

* Your tailnet is on a Premium or Enterprise plan, is eligible for regional routing, and has access to the MagicRoute beta. Existing regional routing customers must opt in.
* You must be an [Owner, Admin, or IT admin](/docs/reference/user-roles) to change the route selection option.
* For subnet routers and app connectors, [deploy redundant connectors][docs-ha]. Approve subnet routes and configure apps as needed. For Services, configure and approve the [Service hosts][docs-tailscale-services].
* To use MagicRoute exit node recommendations, run Tailscale v1.86.0 or later on the client. Server-side selection among subnet routers, app connectors, and Service hosts works with all client versions.

## Get started

Use the existing route selection procedure to change the tailnet-wide option. You do not need to reconfigure eligible resources when switching from another option.

1. Set up the subnet routers, app connectors, or Tailscale Service hosts you want MagicRoute to select among. Approve their advertised routes or Service hosts as applicable.
2. [Select MagicRoute in the admin console or with the tailnet settings API][docs-route-selection-configure]. The change saves for the tailnet. Follow the linked procedure to read back the saved option.
3. [Check routing from your clients][docs-route-selection-verify]. A saved setting does not, by itself, establish that a particular request used a particular resource.

## Limitations

MagicRoute does not guarantee equal traffic volume, capacity-based balancing, or selection of the geographically closest or fastest connector or Service host. For route eligibility, longest-prefix matching, and the absence of cross-prefix failover, refer to [Route selection][docs-route-selection-prefix-matching].

To report a problem with the beta, [contact Tailscale Support][co-support].

[co-support]: https://tailscale.com/contact/support

[docs-custom-derp]: /docs/reference/derp-servers/custom-derp-servers

[docs-ha]: /docs/how-to/set-up-high-availability

[docs-multi-cluster-ingress]: /docs/kubernetes-operator/ingress/multi-cluster

[docs-recommended-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-route-selection-configure]: /docs/features/route-selection#change-the-route-selection-option

[docs-route-selection-prefix-matching]: /docs/features/route-selection#route-eligibility-and-prefix-matching

[docs-route-selection-use-cases]: /docs/features/route-selection#route-selection-use-cases

[docs-route-selection-verify]: /docs/features/route-selection#verify-route-selection

[docs-route-selection]: /docs/features/route-selection

[docs-tailscale-services]: /docs/features/tailscale-services
