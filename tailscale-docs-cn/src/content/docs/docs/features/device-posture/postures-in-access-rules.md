---
title: "Postures in access rules"
description: "A device posture is a [set of security rules][docs-device-postures-attributes] that devices must meet to access your tailnet. Postures are a feature of access rules, and once a posture is created you "
---

Last validated Oct 6, 2026

A device posture is a [set of security rules][docs-device-postures-attributes] that devices must meet to access your tailnet. Postures are a feature of access rules, and once a posture is created you must add it as a condition to an existing access rule.

> **Note:**
>
> Creating a device posture does not enforce any requirements. It must be added to an access rule for its restrictions to apply.

## Postures as conditions in access rules

An access rule that includes a device posture condition is conditional on posture fulfillment in addition to its source, destination, and protocol requirements. Postures in a condition are not additive; if multiple postures are included in the condition, only one of them must be met to fulfill the posture requirement.

## Examples

The following examples show grants with a posture condition. Posture conditions are added with the `srcPosture` key to an access rule in your policy file.

```json
"grants": [
  {
    // To fulfill the posture condition, devices must meet the `anyMac` posture
    "src": ["autogroup:member"],
    "dst": ["tag:development"],
    "ip": ["*"],
    "srcPosture": ["posture:anyMac"]
  },
  {
    // Only devs can access production
    // To fulfill the posture condition, devices must meet the `latestMac` posture
    "src": ["group:dev"],
    "dst": ["tag:production"],
    "ip": ["*"],
    "srcPosture": ["posture:latestMac"]
  }
]
```

You can add multiple postures to the same access rule. In the following example, the posture condition is fulfilled and access is permitted to production if the connecting device meets any of the three specified postures.

```json
"grants": [
  {
    "src": ["group:dev"],
    "dst": ["tag:production"],
    "ip": ["*"],
    "srcPosture": ["posture:approvedMacs", "posture:approvedWindows", "posture:approvedLinux"]
  }
]
```

## Default postures and access rules

You can set a default posture condition that applies to all of your access rules that do not otherwise have a posture condition specified. It is not additive, meaning if an access rule specifies a posture condition, only that condition will apply and the default source posture condition will not apply.

A default posture is made up of one or more postures. As with the `srcPosture` condition in access rules, the default posture condition is fulfilled if any of the supplied postures are met. The example default posture below is fulfilled if a device meets any of the three listed postures.

```json
"defaultSrcPosture": [
  "posture:basicWindows",
  "posture:basicMac",
  "posture:basicLinux",
],
```

The grant examples below show when a default posture condition is and isn't enforced by an access rule.

```json
"grants": [
  {
    // defaultSrcPosture applies to this rule, no other posture condition is included
    "src": ["autogroup:member"],
    "dst": ["tag:intranet"],
    "ip": ["*"]
  },
  {
    "src": ["group:dev", "group:sre"],
    "dst": ["tag:production"],
    "ip": ["*"],
    // A posture condition is included; this posture condition is instead of, not in addition to, the default source posture
    "srcPosture": ["posture:prodWin", "posture:prodMac"]
  }
]
```

> **Warning:**
>
> `defaultSrcPosture` conditions only apply to traffic originating from Tailscale nodes within the same network, since only those devices have attribute values that can be evaluated against a defined posture. Shared nodes and devices behind [subnet routers][docs-subnets] will not have their traffic restricted based on postures, and will be permitted access if they match IP-based conditions (`src`, `dst`, `proto`).

[docs-device-postures-attributes]: /docs/features/device-posture/postures-and-attributes

[docs-subnets]: /docs/features/subnet-routers

## Check device posture status

For steps to check a device's posture status and to configure notifications related to failing postures, refer to [Monitoring and alerts for device postures][docs-posture-failure].

[docs-filter-devices]: /docs/features/access-control/device-management/how-to/filter

[docs-posture-failure]: /docs/features/device-posture/monitoring-postures
