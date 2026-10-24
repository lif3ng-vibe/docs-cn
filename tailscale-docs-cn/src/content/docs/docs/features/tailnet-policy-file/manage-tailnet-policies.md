---
title: "Edit access control policies in your tailnet policy file"
description: "You can edit [access control policies][docs-acls] in your [tailnet policy file][docs-tailnet-policy-file] by using the [Access controls](https://console.tailscale.com/admin/acls) page of the admin con"
---

Last validated Mar 13, 2026

You can edit [access control policies][docs-acls] in your [tailnet policy file][docs-tailnet-policy-file] by using the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console, [GitOps for Tailscale][docs-gitops-acls], or the [Tailscale API][docs-api]. Refer to [tailnet policy syntax][docs-policy-syntax].

You must be an [Owner, Admin, or Network admin](/docs/reference/user-roles) to edit the tailnet policy file.

## Convert ACLs to grants

The JSON editor includes a **Convert to grants** button that automatically converts the entire `acls` section in your tailnet policy file to equivalent [grants][docs-grants]. The button is always visible but is disabled when there is no `acls` section present. Refer to [Migrate from ACLs to grants][docs-migrate-acls-grants] for more information.

## Preview changes

You can preview user permissions while editing the access control policies in the tailnet policy file.

1. Go to the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console.
2. Open the **Preview rules** tab.
3. Select a user to access a list of destinations (one per line) accessible to the specified user.

The list also shows the line number that defines that rule and any other users or groups that can access that destination (due to that rule).

You can also define [access control policy tests][docs-policy-syntax-tests] to ensure changes don't accidentally remove access to an important system or unintentionally allow access to resources.

## Debug access control policies

You can use the [`tailscale ping` command][docs-tailscale-cli-ping] to debug access control policies by testing the connections between devices. The `tailscale ping` supports TSMP pings and ICMP pings.

TSMP pings check whether two devices can establish a network connection but stop before the access control policy check. Use `tailscale ping --tsmp` to send a TSMP ping.

```shell
tailscale ping --tsmp
```

ICMP pings check the end-to-end connectivity between devices, including access control policies. Use `tailscale ping --icmp` or regular `ping` to send an ICMP ping.

```shell
tailscale ping
```

If TSMP ping succeeds, but ICMP ping fails, connections between devices are likely blocked by access control policies. If TSMP ping fails, devices cannot establish a network connection, even though access control policies might allow connections. If both TSMP and ICMP pings succeed, but connections still fail, check the port numbers in your access control policies and services you are trying to connect to.

In addition to manual testing, you can create built-in access control policy [tests][docs-policy-syntax-tests] to ensure that specific connections are allowed and prevent access control policy changes from accidentally breaking these connections.

## Revert changes

You can revert your [tailnet policy file][docs-tailnet-policy-file] to a previous date and time from the [Configuration logs](https://console.tailscale.com/admin/logs) page of the admin console. Refer to [Reverting access control policies from audit logs][docs-audit-logging-revert-acls] for instructions.

> **Note:**
>
> You cannot revert the tailnet policy file if you are using [GitOps for Tailscale][docs-gitops-acls].

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-acls]: /docs/features/access-control/acls

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-api]: /docs/reference/tailscale-api

[docs-audit-logging-revert-acls]: /docs/features/logging/audit-logging#reverting-access-control-policies-from-audit-logs

[docs-gitops-acls]: /docs/gitops

[docs-tailscale-cli-ping]: /docs/reference/tailscale-cli#ping

[docs-grants]: /docs/features/access-control/grants

[docs-migrate-acls-grants]: /docs/reference/migrate-acls-grants

[docs-tailnet-policy-file]: /docs/reference/glossary#tailnet-policy-file
