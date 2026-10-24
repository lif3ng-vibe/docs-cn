---
title: "Manage least-privilege access and just-in-time access to production environments"
description: "Tailscale follows a deny-by-default model where no two devices can communicate unless the [tailnet policy file][docs-policy-file] explicitly permits it. Building on this foundation, you can enforce le"
---

Last validated May 18, 2026

> **Note:**
>
> Featured reference:
>
> [**Just-in-time access**](/docs/features/access-control/just-in-time-access) — Provide just-in-time access, also known as on-demand access, to your Tailscale network users.

Tailscale follows a deny-by-default model where no two devices can communicate unless the [tailnet policy file][docs-policy-file] explicitly permits it. Building on this foundation, you can enforce least-privilege access by using [tags][docs-tags] to group resources, [grants][docs-grants] to define precise per-role permissions, and [ephemeral nodes][docs-ephemeral] or [just-in-time access workflows][docs-jit] to give engineers time-limited access only when a task requires it.

## Tag production resources

[Tags][docs-tags] let you label devices by role so that access policies apply to a group rather than to individual machines.

1. Assign a tag like `tag:prod-server` to each production host at authentication time.

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up --advertise-tags=tag:prod-server
   ```

2. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console to confirm the tag appears on each device. You must define the tag in your policy file before referencing it in grants.

## Define access with grants

[Grants][docs-grants] let you specify which sources can reach which destinations and on which ports. This replaces broad rules that permit entire groups onto entire networks with narrow rules that permit only what is needed.

The following grant enables members of the `engineering` group to reach production servers on port `22`.

```json
"grants": [
  {
    "src": ["group:engineering"],
    "dst": ["tag:prod-server"],
    "ip": ["tcp:22"]
  }
]
```

Add grants to the tailnet policy file through the [Access controls](https://console.tailscale.com/admin/acls/file) page of the admin console. To narrow access further, scope the source to a specific user or a sub-group rather than an entire group.

## Enforce device posture requirements

[Device posture][docs-device-posture] lets you condition access on the state of the connecting device. You can block connections from devices that are out of compliance with your security policy, such as those missing a required security agent or running an unsupported OS version.

Posture requirements attach to grants using the `srcPosture` field, so connections are denied automatically when a device falls out of compliance. The [device posture documentation][docs-device-posture] covers how to configure posture providers and reference named posture checks in your grants.

## Provide just-in-time access

For access that should last only as long as a task requires it, Tailscale offers two approaches.

[Ephemeral nodes][docs-ephemeral] use short-lived auth keys to join the tailnet for the duration of a session and are removed automatically after the device disconnects. An engineer authenticates, performs the required work, and then logs out. No manual node cleanup is needed.

For approval-based workflows, [Tailscale Accessbot][docs-jit] lets users request access through a Slack-based approval flow. An approver grants access for a defined time window and the grant expires automatically when that window closes. You can also sync groups from your identity provider to control access based on group membership.

[docs-device-posture]: /docs/features/device-posture

[docs-ephemeral]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-jit]: /docs/features/access-control/just-in-time-access

[docs-policy-file]: /docs/features/tailnet-policy-file

[docs-tags]: /docs/features/tags
