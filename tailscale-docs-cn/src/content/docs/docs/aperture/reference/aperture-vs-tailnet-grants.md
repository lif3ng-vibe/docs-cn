---
title: "Aperture grants vs. tailnet policy file grants"
description: "You can define Aperture grants in two places: the [configuration][docs-aperture-configuration] of an Aperture gateway or in the [tailnet policy file][docs-tailnet-policy-file] of the tailnet the Apert"
---

Last validated Jun 8, 2026

You can define Aperture grants in two places: the [configuration][docs-aperture-configuration] of an Aperture gateway or in the [tailnet policy file][docs-tailnet-policy-file] of the tailnet the Aperture gateway belongs to. The two locations use the same `tailscale.com/cap/aperture` capability but are **not interchangeable as written**. The key difference is that Aperture configuration grants omit the `dst` field because the destination is implicitly the Aperture gateway. Tailnet policy file grants require an explicit `dst`.

Choosing which location to use depends on how you plan to manage Aperture grants across your tailnet. For example, if you have a single Aperture gateway and prefer to manage its grants separately from the rest of your tailnet access control, defining grants in the Aperture configuration may be simpler. On the other hand, if you have multiple Aperture gateways that use a shared selector like a tag or a group or you use GitOps to manage your tailnet policy file, defining grants in the policy file is more efficient.

| Aperture configuration                           | Tailnet policy file                                                                                                                                  |
| :----------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| When you have a single Aperture gateway          | When you have multiple Aperture gateways managed together                                                                                            |
| When you manage all Aperture gateways separately | When you manage Aperture grants alongside the rest of your tailnet access control using [GitOps][docs-gitops] or another infrastructure-as-code tool |

> **Note:**
>
> Define each grant in one location. Defining the same grant in both does not increase access and makes the effective policy more difficult to reason about.

## Syntax comparison

The following table shows how a grant appears in each location.

| Field                                | Aperture configuration                   | Tailnet policy file                                    |
| :----------------------------------- | :--------------------------------------- | :----------------------------------------------------- |
| `src`                                | Required                                 | Required                                               |
| `dst`                                | Omitted (implicitly the Aperture device) | Required (must target the Aperture device)             |
| `ip`                                 | Not used                                 | Optional; add when the grant also opens network access |
| `app` → `tailscale.com/cap/aperture` | Required                                 | Required                                               |

The `src` and `app` fields are identical in both forms. Conversion is a matter of adding `dst` (and, when relevant, `ip`).

## Examples

The following examples compare grants in an Aperture configuration and a tailnet policy file. The grant gives users in the `ai-users` group access to Anthropic models through Aperture. The `ai-users` group definition would be elsewhere in the tailnet policy file and is not shown here.

> **Note:**
>
> The examples here use a tag to identify the Aperture device, but you can also use the Aperture gateway's hostname or IP address. If you use hostname, confirm it resolves to the correct device in the policy file's `hosts` section. If you use IP address, be aware that if the Aperture device's IP changes, the grant will break until you update the IP. The tag approach lets you apply this grant to multiple Aperture gateways (identified by the tag) and is more resilient to IP changes, so it is generally recommended.

**Before**: a grant as it appears in the Aperture configuration. The destination is implicit:

```json
{
  "grants": [
    {
      "src": ["group:ai-users"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" }
        ]
      }
    }
  ]
}
```

**After**: the same grant in the tailnet policy file. The `dst` field is added so the grant targets the Aperture device:

```json {5}
{
  "grants": [
    {
      "src": ["group:ai-users"],
      "dst": ["tag:aperture"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" }
        ]
      }
    }
  ]
}
```

To grant network connectivity in the same rule, add an `ip` field:

```json {6}
{
  "grants": [
    {
      "src": ["group:ai-users"],
      "dst": ["tag:aperture"],
      "ip": ["tcp:443"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" }
        ]
      }
    }
  ]
}
```

## Convert an Aperture grant to a tailnet policy file grant

To convert a grant from the Aperture configuration to the tailnet policy file, follow these steps:

1. Identify the Aperture device:

   Choose how `dst` will reference the Aperture device. For example, you can use a [tag][docs-tags] applied to the device (for example, `tag:aperture`) or a host alias defined in the policy file's `hosts` section. Tags are the recommended approach because they survive IP changes and apply to replacement devices automatically.

2. Copy the `src` and `app` fields unchanged:

   The source match and the `tailscale.com/cap/aperture` capability array carry over exactly. Do not modify the `role` or `models` entries.

3. Add the `dst` field:

   Insert a `dst` field that targets the Aperture device. The value should target the Aperture gateways the grant should apply to. If you have a single gateway, you can target it directly (for example, `dst: ["tag:aperture"]` or `dst: ["host:aperture-device"]`). If you have multiple gateways that should share this grant, use a common tag (for example, `dst: ["tag:aperture"]` where all relevant devices have the `aperture` tag).

4. Add `ip` if the grant also grants network access:

   If you are consolidating network access and model access into a single grant, add an `ip` field with the ports Aperture listens on (for example, `["tcp:443"]`). If a separate grant already permits network access to the Aperture device, the model-access grant needs only `dst`.

5. Save and verify:

   Save the policy file, then send a test request from a device the grant covers. A successful response confirms the capability reached Aperture. If the request returns HTTP 403, the grant did not apply. Refer to [Troubleshooting][ar-troubleshooting] below.

> **Warning:**
>
> Copying an Aperture configuration grant directly into the tailnet policy file without adding a `dst` field **silently causes the grant to have no effect**. The policy file accepts the grant, but it matches no destination, so Aperture never receives the capability. Tailscale does not currently surface a warning or error for this case.
>
> Likewise, if you copy a tailnet policy file grant into the Aperture configuration without removing the `dst` field, it will trigger a validation error because `dst` is not a valid field in the Aperture configuration.

## Troubleshooting

If a grant in the tailnet policy file produces no effect and the policy file reports no error, the most likely cause is a missing `dst` field. A grant copied from the Aperture configuration omits `dst`, so in the policy file it matches no destination and the `tailscale.com/cap/aperture` capability never reaches Aperture. The result is an HTTP 403 from Aperture or no model access at all, with no warning from the policy file.

To resolve this, confirm the grant includes a `dst` field that targets the Aperture device (for example, `"dst": ["tag:aperture"]`). Use the [Preview rules](https://console.tailscale.com/admin/acls/preview) tab to confirm the rule resolves to the Aperture device.

A grant written for the Aperture configuration is incomplete in the policy file. The reverse is also true: a policy file grant with `dst` and `ip` fields does not belong in the Aperture configuration, where those fields are unused. Confirm you are using the form that matches the location.

## Related

* [Control model access][docs-grant-model-access]: configure grants in the Aperture configuration.
* [Aperture configuration reference][docs-aperture-configuration]: the full grant schema.
* [Tailnet policy file syntax][docs-tailnet-policy-file]: grant structure in the policy file.
* [Troubleshooting Aperture][docs-troubleshooting]: diagnose access errors.

[ar-troubleshooting]: #troubleshooting

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-gitops]: /docs/gitops

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/reference/syntax/policy-file

[docs-troubleshooting]: /docs/aperture/troubleshooting
