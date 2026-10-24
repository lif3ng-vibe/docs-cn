---
title: "CGNAT interoperability"
description: "Disable the CGNAT drop rule to use Tailscale alongside networks that consume CGNAT address space."
---

Last validated Jul 1, 2026

Tailscale assigns addresses in the [CGNAT range][docs-ip-addresses] (`100.64.0.0/10`). To protect this range, the Linux client installs a firewall rule that drops any traffic in it that is not valid Tailscale traffic.

> **Note:**
>
> CGNAT interoperability applies only to Linux clients. Windows and macOS do not implement the drop rule.

That default assumes Tailscale is the only thing using the range. But `100.64.0.0/10` is the general carrier-grade NAT range, and some organizations already run their own infrastructure there, including:

* Existing VPNs or private networking systems.
* Kubernetes clusters (for example, API servers in CGNAT address space).
* Subnet-routed internal services.

The drop rule cannot tell legitimate internal traffic apart from spoofed Tailscale traffic, so it blocks both. As a result, devices cannot reach local CGNAT-addressed services while Tailscale is running. Disabling the drop rule lets those devices use Tailscale and reach internal CGNAT-addressed services at the same time.

Only disable the drop rule if you have non-Tailscale services in `100.64.0.0/10`. If you do not, keep it enabled.

## Least privilege model behavior change

> **Danger:**
>
> If you disable the CGNAT drop rule and RPF is not enabled, your system is more vulnerable to spoofed traffic.

Disabling the CGNAT drop rule removes a built-in protection against IP spoofing from local networks.

Without the drop rule, a device on the local network could send packets that appear to come from a Tailscale IP. This weakens Tailscale's default [least-privilege model][ln-least-privilege].

To mitigate this, make sure Reverse Path Filtering (RPF) is enabled:

* RPF verifies packets arrive on the correct interface.
* Prevent spoofed traffic from being accepted.
* Enabled by default on modern Linux distributions.

### Verify RPF status

On many distributions, you can check the RPF status with:

```shell
sysctl net.ipv4.conf.all.rp_filter
```

* `0`: disabled (not recommended)
* `1`: strict
* `2`: loose

> **Note:**
>
> Some distributions such as Fedora, disable RPF globally and enable it on a per-interface basis. You can replace `all` with your particular interface name. For example, using `sysctl net.ipv4.conf.wlp2s0.rp_filter` will check the `wlp2s0` interface.

### Troubleshoot RPF warnings

You may receive warnings indicating:

* CGNAT drop rule is disabled.

  This means:

  * The system may accept spoofed CGNAT traffic.

* RPF is not enabled.

  This means:

  * You should enable RPF or apply firewall controls.

## Disable the CGNAT drop rule

Modify your [tailnet policy file][docs-tailnet-policy-file] to enable client-side netmap caching with [`disable-linux-cgnat-drop-rule` node attribute][docs-policy-file-attr].

This example targets all devices tagged `internal-subnet-routers`.

```json
{
  "nodeAttrs": [
    {
      "target": ["tag:internal-subnet-routers"],
      "attr": ["disable-linux-cgnat-drop-rule"]
    }
  ]
}
```

Removing the attribute restores the drop rule automatically.

## Verify the CGNAT drop rule is disabled

Use the `iptables` command with the `-L` flag (list):

```shell
iptables -L
```

Check the `ts-input` chain has a `RETURN` rule instead of a `DROP` rule for `100.64.0.0/10`.

## Limitations

* Linux only by design. Other platforms do not implement a CGNAT drop rule.
* No partial range control.
* Does not address [`via`][docs-access-controls-via] route restrictions for CGNAT rules.

### Interaction with `nodivert`

Before `disable-linux-cgnat-drop-rule` being available, [`--netfilter-mode=nodivert`][docs-netfilter-modes-nodivert] was a recommended solution for letting devices to continue using Tailscale and reach internal CGNAT-addressed services simultaneously.

If both `disable-linux-cgnat-drop-rule` and `nodivert` are configured, `nodivert` takes precedence. You are expected to manage firewall behavior manually in this mode.

[docs-access-controls-via]: /docs/features/access-control/grants/grants-via

[docs-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-netfilter-modes-nodivert]: /docs/reference/netfilter-modes#nodivert

[docs-policy-file-attr]: /docs/reference/syntax/policy-file#attr

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[ln-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege
