---
title: "Secure remote access for work from home or remote employees"
description: "Remote and work-from-home employees need access to on-premises and in-office resources without being physically on-site. Tailscale connects them using subnet routers to expose corporate networks, exit"
---

Last validated May 18, 2026

> **Note:**
>
> Featured solution guide:
>
> [**Create a secure connection to MongoDB Atlas**](/docs/solutions/create-a-secure-connection-to-mongodb-atlas) — Securely connect to a MongoDB Atlas database and permit access only to your Tailscale network.

Remote and work-from-home employees need access to on-premises and in-office resources without being physically on-site. Tailscale connects them using subnet routers to expose corporate networks, exit nodes to tunnel all traffic through a corporate gateway, and [access control][docs-access-control] policies to define who can reach what.

## Route all traffic through a corporate gateway

Employees working from untrusted networks, or subject to compliance policies that require all traffic to route through the corporate network, need more than just access to specific resources. [Exit nodes][docs-exit-nodes] route all of a device's internet traffic through a designated node on your network, acting as a complete VPN replacement. Unlike subnet routers, which expose specific network ranges, an exit node captures all outbound traffic.

1. [Configure a device][docs-exit-node-configure] on your corporate network to advertise itself as an exit node.
2. [Allow the exit node][docs-exit-node-allow] from the admin console.
3. [Configure remote employee devices][docs-exit-node-use] to use the exit node through their Tailscale client.
4. (Optional) Use [system policies][docs-system-policies] to require Tailscale users to always run on employee devices and prevent employees from disabling it.

Once configured, all internet traffic from those devices routes through the exit node, securing their connection regardless of what network they're on.

## Connect to your corporate network

Some resources like file servers, internal apps, and databases can't have Tailscale installed directly. A [subnet router][docs-subnet-routers] runs Tailscale on a device within your corporate network and advertises routes to the surrounding subnet, giving remote employees access to those resources without requiring Tailscale on each one.

1. [Install Tailscale][docs-subnet-router-install] on a device within your corporate network that will act as the gateway.
2. [Advertise the subnet routes][docs-subnet-router-advertise] from that device.
3. [Enable the advertised routes][docs-subnet-router-enable] from the admin console.
4. [Add access rules][docs-subnet-router-acl] for the subnet.
5. (Optional) Set up [high availability][docs-set-up-high-availability] so that your subnet router is not a single point of failure for connectivity.

Remote employees can then reach any resource on that subnet through the tailnet without any additional configuration on those devices.

## Limit access by group and role

Access control policies ensure remote employees can only reach the resources relevant to their role, preventing lateral movement across your network. Use groups, tags, and grants to define these boundaries, such as [allowing access to different environments by group][docs-grants-groups] or [routing traffic through exit nodes based on location][docs-grants-location].

1. Open the [Access controls](https://console.tailscale.com/admin/acls/file) page of the admin console to manage your tailnet policy file.

2. Define a [group][docs-visual-editor-groups] and associate it with users.

   ```json
   {
     "groups": {
       "group:remote": ["alice@example.com"]
     }
   }
   ```

   In this example, a "Remote" (`remote`) group is created.

3. Define a [tag][docs-visual-editor-tags] and [associate it with devices][docs-tags-working-with-tags].

   ```json
   {
     "tagOwners": {
       "tag:internal-tools": ["autogroup:admin"]
     }
   }
   ```

   In this example, an "Internal Tools" (`internal-tools`) tag is created.

4. Define a grant and associate groups with tags.

   ```json
   {
     "grants": [
       {
         "src": ["group:remote"],
         "dst": ["tag:internal-tools"],
         "ip": ["*"]
       }
     ]
   }
   ```

> **Tip:**
>
> `autogroup:shared` can be a useful selector for contractors joining your tailnet.

[docs-access-control]: /docs/features/access-control

[docs-exit-node-allow]: /docs/features/exit-nodes#allow-the-exit-node-from-the-admin-console

[docs-exit-node-configure]: /docs/features/exit-nodes#configure-an-exit-node

[docs-exit-node-use]: /docs/features/exit-nodes#use-the-exit-node

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-set-up-high-availability]: /docs/how-to/set-up-high-availability

[docs-subnet-router-acl]: /docs/features/subnet-routers#add-access-rules-for-the-advertised-subnet-routes

[docs-subnet-router-advertise]: /docs/features/subnet-routers#connect-to-tailscale-as-a-subnet-router

[docs-subnet-router-enable]: /docs/features/subnet-routers#enable-subnet-routes-from-the-admin-console

[docs-subnet-router-install]: /docs/features/subnet-routers#install-the-tailscale-client

[docs-grants-groups]: /docs/reference/examples/grants#allow-access-to-different-environments-by-group

[docs-grants-location]: /docs/reference/examples/grants#route-traffic-through-exit-nodes-based-on-location

[docs-system-policies]: /docs/features/tailscale-system-policies

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tags-working-with-tags]: /docs/features/tags#working-with-tags

[docs-visual-editor-groups]: /docs/reference/visual-editor#groups

[docs-visual-editor-tags]: /docs/reference/visual-editor#tags
