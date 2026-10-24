---
title: "Set up high availability"
description: "Set up high availability (HA) for subnet routers and app connectors."
---

Last validated Oct 7, 2026

Deploy multiple [subnet routers][docs-subnets] or [app connectors][docs-app-connectors] to keep resources accessible if one goes offline. The tailnet's [route selection option][docs-route-selection] determines how Tailscale selects among eligible connectors.
Multiple hosts for a [Tailscale Service][docs-tailscale-services] can also provide redundant access. Configure Service hosts separately from the subnet router and app connector procedures in this guide.

## Choose a route selection option

Compare selection behavior, availability, limitations, and failover timing in [Route selection][docs-route-selection]. Then [choose the route selection option][docs-route-selection-configure] for your tailnet and complete the setup steps for app connectors or subnet routers below.

## App connector high availability

To make app connectors highly available, run two or more app connectors with the same tag and assign your apps to that tag.

### Step 1: Set up multiple app connectors

Follow [Set up an app connector in your tailnet][docs-app-connectors-setup]. Assign the same [tag][docs-tags] to all app connectors. For example, run this command on two or more devices:

```shell
sudo tailscale up --advertise-connector --advertise-tags="tag:connector"
```

### Step 2: Assign an app to the app connectors

Assign the app to the same `tag:connector` [tag][docs-tags]. Follow the steps in [Set up an app connector in your tailnet][docs-app-connectors-setup].

### Step 3: Done

Your app connectors now provide redundant access to the configured apps. [Check routing from your clients][docs-route-selection-verify] to confirm that they can reach the apps.

## Subnet router high availability

To make subnet routers highly available, run two or more subnet routers that advertise the same routes, then approve the routes in the admin console.

### Step 1: Set up multiple subnet routers

Follow [Set up a subnet router][docs-subnets] on two or more devices in the same network. Advertise the same routes on each device. For example:

```shell
sudo tailscale set --advertise-routes=10.0.0.0/24,10.1.0.0/24
```

You can configure as many subnet routers as you need for failover.

> **Warning:**
>
> Advertise the exact same route prefixes on each subnet router. Review the [prefix matching requirements][docs-route-selection-prefix-matching] before configuring overlapping routes.

\[Missing snippet: WarningAcceptRoutesHA.mdx]

### Step 2: Activate the subnet routers in the admin console

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
2. Find your subnet router and open its  menu.
3. Select **Review subnet routes** to open the subnet settings.
4. Select **Enable** for the routes you want to use. Tailscale distributes these routes to the other devices in your tailnet.

> **Note:**
>
> You may want to disable key expiry on your server to avoid having to periodically reauthenticate. Refer to [key expiry][docs-key-expiry] for more information about machine keys and how to disable their expiry.

### Step 3: Done

Your subnet routers now provide redundant access to the approved routes. [Check routing from your clients][docs-route-selection-verify] to confirm that they can reach the destinations.

## Further reading

For examples that use regional routing or MagicRoute with subnet routers, app connectors, and Tailscale Service hosts, refer to [Route selection use cases][docs-route-selection-use-cases].

[docs-app-connectors-setup]: /docs/features/app-connectors/how-to/setup

[docs-app-connectors]: /docs/features/app-connectors

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-route-selection-configure]: /docs/features/route-selection#change-the-route-selection-option

[docs-route-selection-prefix-matching]: /docs/features/route-selection#route-eligibility-and-prefix-matching

[docs-route-selection-use-cases]: /docs/features/route-selection#route-selection-use-cases

[docs-route-selection-verify]: /docs/features/route-selection#verify-route-selection

[docs-route-selection]: /docs/features/route-selection

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags
