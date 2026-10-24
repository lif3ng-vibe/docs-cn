---
title: "Viewing the list of endpoints on your network"
description: "Find out how to monitor and easily connect to the endpoints running on machines in your Tailscale network."
---

Last validated Jan 5, 2026

Tailscale's endpoint collection feature lets you monitor and easily connect to the endpoints running
on machines in your Tailscale network.

> **Note:** The endpoint collection view is currently in alpha.

## What are endpoints?

Endpoints are the network-exposed ports running on each of your Tailscale machines, defined
by their `port` and `protocol`. If your network has enabled endpoint collection, each of your
machines will share its live list of endpoints with your Tailscale network.

## Enabling endpoint collection

This feature is disabled by default, meaning that endpoint data is never collected or shared
between your devices unless you choose to enable endpoint collection. You can change this
setting on the [Services](https://console.tailscale.com/admin/services) page of the admin console, after selecting
the **Discovered** tab.

*（图：The 'Enable endpoint collection to start' prompt with a 'Enable endpoint collection' button.）*

> **Note:**
>
> Although endpoint collection is a global setting for your Tailscale network, endpoints
> will not be sent from any machines that are [blocking incoming connections][docs-client-preferences].

## Monitoring your endpoints

With endpoint collection enabled, your admin console will display the list of endpoints
on your network. We don't currently store endpoints in our database, so the page acts as a
monitoring tool for *live* endpoints. As you start and stop endpoints, you'll find the page
reflects those changes.

Below is a preview of the **Discovered** tab on the [Services](https://console.tailscale.com/admin/services) page.

*（图：The Discovered tab of the Services page of the admin console listing example endpoints filtered by 'type:HTTP'.）*

An endpoints table is also visible on each machine's details page with just the endpoints exposed by that machine.

*（图：The Machine details page of the admin console with information about the machine's network and a list of endpoints exposed in the tailnet.）*

> **Note:**
>
> The endpoints tables includes a `type` column. We categorize endpoints into types to help
> you better identify them. Our categorization rules are basic and will be tuned over time,
> so note that if you use an uncommon port, we may fallback to "Other" type.

## Launching endpoints

From the endpoints tables, you can directly launch certain applications.

* For SSH, we provide a copyable `ssh 100.x.y.z` command.
* For VNC and [RDP][docs-secure-rdp-windows], we provide a **Launch** button to start a remote session.
* For HTTP and HTTPS, we provide an **Open** button to open the web server.

## Access controls

You can configure the access for each of your endpoints using [Tailscale access control policies][docs-access-control]. If you're interested
in knowing who can access each endpoint, hover over the info icon in the **Access Controls** column of the
**Endpoints** table.

*（图：The endpoints preview with a tooltip stating 'Who can access this endpoint?'. In this example, 'group:all' and 'group:coop' are listed.）*

> **Note:**
>
> If someone shares a machine from another network with you using [link-based node sharing][docs-sharing], their machine's shared ports are visible in your endpoints list. Note that for shared machines, you will only view the endpoints that the sharer has given you access to via their network's access control policies.

[docs-access-control]: /docs/features/access-control

[docs-client-preferences]: /docs/features/client/manage-preferences

[docs-secure-rdp-windows]: /docs/solutions/access-remote-desktops-using-windows-rdp

[docs-sharing]: /docs/features/sharing
