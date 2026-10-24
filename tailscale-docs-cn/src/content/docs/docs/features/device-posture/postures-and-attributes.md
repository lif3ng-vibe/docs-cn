---
title: "Understand device postures and attributes"
description: "A posture is a set of security rules that devices must meet to access your tailnet. You configure a posture to include assertions relating to specific device attributes, such as its operating system o"
---

Last validated Oct 6, 2026

A posture is a set of security rules that devices must meet to access your tailnet. You configure a posture to include assertions relating to specific device attributes, such as its operating system or the Tailscale version it runs. For example, a posture might include the assertion that a device's operating system (the attribute) is either macOS or Windows (the condition). You can also include specifications for how to alert users when a device fails to meet the posture.

## Device posture attributes

A device posture attribute is the device characteristic you want to check for. Attributes can include pre-populated host information such as the operating system version, custom attributes set with the postures API, or attributes synced from integrated endpoint detection and response (EDR) and mobile device management (MDM) tools. Note that attribute availability [varies by plan][docs-posture-plans].

> **Note:**
>
> You can check a machine's attributes and respective values in the **Machine Details** page under **Attributes** for each device in your tailnet.

Attributes are represented as key-value pairs of data attached to devices, can be strings, numbers, Boolean values, or IP addresses, and exist in namespaces. For example, the attribute key `node:os` is in the `node` namespace, and the key `custom:myAttribute` is in the `custom` namespace.

Posture attributes bring together data from several different sources all in one place:

* Host information reported by devices, such as OS version and Tailscale version in the `node` namespace.
* Information about client devices that is collected by Tailscale control plane, such as geolocation data for the public IP of a device in the `ip` namespace.
* Custom posture attributes set by you, or software you have integrated with the Tailscale API, in the `custom` namespace. Custom attributes can also be assigned automatically when a device is provisioned through [device provisioning with OAuth apps][docs-device-provisioning].
* Attributes set by device posture integrations like [CrowdStrike Falcon][docs-crowdstrike] and [others][docs-posture-integrations].

> **Note:**
>
> Posture attributes are distinct from [`nodeAttrs`][docs-syntax-nodeattrs]. The existing `nodeAttrs` are set as flags only, not as key-value pairs.

### Default attributes

The following posture attributes are currently available by default for use in access rule postures and for using with the device attribute API.

\[Missing snippet: attributes-tailscale.mdx]

> **Note:**
>
> The `node:tsAutoUpdate` attribute is only set to `true` when Tailscale's built-in [auto-update][docs-update-auto-updates] is enabled. It is set to `false` when Tailscale is updated using an external mechanism, such as the Apple App Store or Google Play Store.

### Geolocation attributes

The Tailscale control plane also provides device posture attributes with geolocation data. These attributes are available with the Standard, Premium, and Enterprise plans.

\[Missing snippet: attributes-ip.mdx]

> **Note:** The \`ip:publicAddress\` device posture attribute is currently in beta.

> **Note:**
>
> The `ip:publicAddress` device posture attribute can be used with the `IN`, `NOT IN`, `==`, and `!=` operators. Allowed values for comparison are a single IPv4 or IPv6 address, IP subnets (CIDRs), or an [IP set][docs-ip-set].

## Device postures

A posture is a set of security rules that devices must meet. In a posture, you assert which attributes should meet what conditions. Each posture assertion must include an attribute, an operator, and a value. Every assertion in the posture must be met for a device to match the posture. You can also include failure behavior specifications for how to alert users when a device fails to meet the posture.

Postures are defined in your policy file, and can be added to the policy file by using the visual policy editor. You can create multiple postures in a policy file.

If an attribute defined in the posture is unset for a particular device, the posture will not match that device, irrespective of the operator used. For example, a device that does not have the `custom:tier` attribute assigned to it will not match a posture that includes an attribute `custom:tier`, even if that condition is negative (for example, `custom:tier != 'prod'`).

> **Tip:**
>
> For information on checking a device's posture status and setting up alerts for devices that fail postures, refer to [Monitoring and alerts for device postures][docs-posture-failure].

### Example posture definitions

The following posture definition shows the example posture, `latestApple`, with assertions and failure behavior.

```json
"postures": {
  "posture:latestApple": {
    "assertions": [
      "node:os IN ['macos', 'ios']",
      "node:tsVersion >= '1.98'",
],
    "onFailure": {
      "showAlerts": [
      "badge-in-console",
      "notify-in-client",
      ], //options: "badge-in-console", "warn-in-client", "notify-in-client"
      "endUserMessage": "Reach out to #helpdesk on Slack for help",
    }
  }
}
```

This example posture includes the following assertions:

* The operating system must be either macOS or iOS.
* The Tailscale version running on the device must be 1.98 or later.

The `onFailure` section in this example specifies that users of failing devices are notified in the following three ways:

* Badges are added to the admin console.
* A notification is sent to end-user's device.
* The message `"Reach out to #helpdesk on Slack for help"` is sent to the end-user's client.

For more information on failure behavior and user notifications, refer to [Monitoring and alerts for device postures][docs-posture-failure].

### Posture operators

You can use the following operators in postures.

* `==`
* `!=`
* `IN`
* `NOT IN`
* `IS SET`
* `NOT SET`
* `<`, `<=`, `>=`, `>` (only for numbers and version attributes: `node:osVersion` and `node:tsVersion`)

Versions are compared using a [compare function][xt-gh-tailscale-cmpver] which takes into account versions with both numeric and non-numeric fields.

### Adding postures to access rules

Postures are a feature of access rules. Once a posture is created you must add it as a condition to an existing access rule so it can apply as an access requirement. An access rule that includes a posture is conditional on that posture in addition to its source, destination and protocol.

For more information on adding postures to access rules, refer to [Postures and access rules][docs-posture-access-rules].

## Default source posture

You can set a default posture that applies to all of your access rules that do not otherwise have a posture condition specified. It is not additive, meaning if an access rule specifies a posture condition, only that condition will apply, and the default source posture condition will not apply.

In the default posture, you specify other postures that you have already created. If multiple postures are included, a device only has to meet one of them to fulfill the default posture.

```json
"defaultSrcPosture": [
  "posture:basicWindows",
  "posture:basicMac",
  "posture:basicLinux",
],
```

For more information on default source postures and how they apply to access rules, refer to [Default postures and access rules][docs-device-posture-default-access].

> **Warning:**
>
> `defaultSrcPosture` conditions only apply to traffic originating from Tailscale nodes within the same network, since only those devices have attribute values that can be evaluated against a defined posture. Shared nodes and devices behind [subnet routers][docs-subnets] will not have their traffic restricted based on postures, and will be permitted access if they match IP-based conditions (`src`, `dst`, `proto`).

## Tailscale SSH and postures

Connections created with the [Tailscale SSH Console][docs-tailscale-ssh-console] are also subject to posture condition restrictions. To allow these connections, you can allow the posture condition `node:os == 'js'`.

## Shared nodes and postures

Posture conditions specified with `srcPosture` and `defaultSrcPosture` are only applied to `src` devices within your tailnet. If you use Tailscale's [node sharing][docs-sharing] to grant access to a device to a user outside of your tailnet, that user's device can connect regardless of their posture.

If you want your posture conditions to apply to external users, consider [inviting them to your tailnet][docs-invite-any-user].

## Posture attributes API

Information about device posture attributes API is available in our [API documentation][co-api-get-device-posture-attrs].

## Audit log events

The following [audit log events][docs-audit-logging-events] are added for device posture.

| **Target**   | **Action**              | **Description**                                   |
| ------------ | ----------------------- | ------------------------------------------------- |
| Node changed | Update device attribute | Device posture attributes for a node were changed |

> **Note:**
>
> Changes to built-in attributes (those in `node` and `ip` namespaces) are only logged if an attribute is referenced by any of the postures used in the policy file. Changes to custom attributes and third-party attributes from device posture integrations are always logged.

[docs-posture-access-rules]: /docs/features/device-posture/postures-in-access-rules

[docs-device-posture-default-access]: /docs/features/device-posture/postures-in-access-rules#default-postures-and-access-rules

[docs-posture-failure]: /docs/features/device-posture/monitoring-postures

[docs-posture-plans]: /docs/features/device-posture#usage-by-plan

[docs-posture-integrations]: /docs/features/device-posture/integrations

[co-api-get-device-posture-attrs]: https://tailscale.com/api#tag/devices/GET/device/%7BdeviceId%7D/attributes

[docs-access-control]: /docs/features/access-control

[docs-audit-logging-events]: /docs/features/logging/audit-logging#events

[docs-crowdstrike]: /docs/integrations/crowdstrike-zta

[docs-device-provisioning]: /docs/features/oauth-apps/device-provisioning

[docs-filter-devices-search-bar]: /docs/features/access-control/device-management/how-to/filter#filter-with-the-search-bar

[docs-filter-devices]: /docs/features/access-control/device-management/how-to/filter

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-ip-set]: /docs/features/tailnet-policy-file/ip-sets

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acls

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-syntax-nodeattrs]: /docs/reference/syntax/policy-file#nodeattrs

[docs-tailscale-ssh-console]: /docs/features/tailscale-ssh/tailscale-ssh-console

[docs-update-auto-updates]: /docs/features/client/update#auto-updates

[docs-zero-trust]: /docs/concepts/zero-trust

[xt-gh-tailscale-cmpver]: https://github.com/tailscale/tailscale/blob/main/util/cmpver/version.go
