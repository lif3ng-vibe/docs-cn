---
title: "Secure remote access to internal corporate applications and data"
description: "Employees need access to internal dashboards, file shares, SaaS tools, and infrastructure, but that access needs to be controlled so only the right people can reach the right resources. Tailscale uses"
---

Last validated May 18, 2026

> **Note:**
>
> Featured solution guide:
>
> [**Create a secure connection to MongoDB Atlas**](/docs/solutions/create-a-secure-connection-to-mongodb-atlas) — Securely connect to a MongoDB Atlas database and permit access only to your Tailscale network.

Employees need access to internal dashboards, file shares, SaaS tools, and infrastructure, but that access needs to be controlled so only the right people can reach the right resources. Tailscale uses access control policies to define exactly who can connect to which internal applications, based on identity rather than network location.

## Control access to internal applications

Access control policies give you fine-grained control over which employees can reach which internal resources. Use groups, hosts, tags, and grants to express these policies, such as [allowing access based on purpose using tags][docs-grants-tags], [restricting access by group][docs-grants-groups], or [gating access based on device posture][docs-grants-device-posture].

The following example grants engineering and sales teams access to separate internal hosts.

1. Open the [Access controls](https://console.tailscale.com/admin/acls/file) page of the admin console to manage your tailnet policy file.

2. Define [groups][docs-visual-editor-groups] and associate them with users.

   ```json
   {
     "groups": {
       "group:eng": ["alice@example.com"],
       "group:sales": ["bob@example.com"]
     }
   }
   ```

   In this example, an "Engineering" (`eng`) group and a "Sales" (`sales`) group are created.

3. Define [hosts][docs-visual-editor-hosts].

   ```json
   {
     "hosts": {
       "internal-bugreports": "100.100.123.123",
       "internal-dashboard": "100.100.124.124"
     }
   }
   ```

   In this example, the "Internal Bug Reports" (`internal-bugreports`) and "Internal Dashboard" (`internal-dashboard`) hosts are created.

4. Define a grant and associate groups with hosts.

   ```json
   {
     "grants": [
       {
         "src": ["group:eng"],
         "dst": ["host:internal-bugreports"],
         "ip": ["tcp:443", "tcp:22"]
       },
       {
         "src": ["group:sales"],
         "dst": ["host:internal-dashboard"],
         "ip": ["tcp:443", "tcp:22"]
       }
     ]
   }
   ```

> **Tip:**
>
> Use a [subnet router][docs-subnet-routers] to reach internal resources that can't have Tailscale installed directly, such as printers or legacy servers.

## Access servers securely with SSH

For teams that need access to internal servers, [Tailscale SSH][docs-tailscale-ssh] replaces traditional SSH key management with identity-based authentication. SSH connections are authenticated using Tailscale identity and governed by the same access control policies as the rest of your tailnet, eliminating the need to distribute and rotate SSH keys.

## Limit access with just-in-time approvals

For sensitive resources, consider just-in-time access to ensure connections are temporary and intentional rather than always-on. Tailscale supports [just-in-time access][docs-jit] through [device posture][docs-device-posture] attributes and the [Tailscale Accessbot][docs-tailscale-accessbot-jit], which lets employees request time-limited access through a Slack workflow.

## Monitor and audit access

For compliance and incident response, Tailscale provides [configuration audit logging][docs-audit-logging] to track changes to your tailnet configuration, and [network flow logs][docs-network-flow-logs] to monitor which devices are communicating with which resources. Together, these give you visibility into both who changed what and who accessed what.

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-network-flow-logs]: /docs/features/logging/network-flow-logs

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-device-posture]: /docs/features/device-posture

[docs-grants-device-posture]: /docs/reference/examples/grants#allow-access-to-resources-based-on-device-posture

[docs-grants-groups]: /docs/reference/examples/grants#allow-access-to-different-environments-by-group

[docs-grants-tags]: /docs/reference/examples/grants#allow-based-on-purpose-using-tags

[docs-jit]: /docs/features/access-control/just-in-time-access

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tailscale-accessbot-jit]: /docs/features/tailscale-accessbot-jit

[docs-visual-editor-groups]: /docs/reference/visual-editor#groups

[docs-visual-editor-hosts]: /docs/reference/visual-editor#hosts
