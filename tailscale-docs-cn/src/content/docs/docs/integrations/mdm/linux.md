---
title: "Deploy Tailscale on Linux using MDM"
description: "This page contains technical information useful to system administrators deploying Tailscale on Linux in a corporate environment."
---

Last validated Aug 11, 2026

This page contains technical information useful to system administrators deploying Tailscale on Linux in a corporate environment.

Unlike other platforms, Linux does not have a single vendor-provided mobile device management (MDM) framework. Instead, administrators typically manage fleets of Linux devices using configuration management tools such as Ansible, Puppet, or Chef, or by baking configuration into a golden image used for provisioning. Tailscale supports this workflow on Linux with a JSON policy file that you can deploy using whichever configuration management tool you already use.

> **Note:**
>
> System policies on Linux require Tailscale v1.102.0 or later. The feature is not available on earlier versions.

## Installing Tailscale on Linux

Refer to our [Linux installation instructions][docs-install-linux] for the recommended way to install Tailscale on your distribution.

## Using Tailscale system policies on Linux

The `tailscaled` daemon reads system policies from a JSON file on disk. By default, this file is located at `/etc/tailscale/syspolicy.json`. You can deploy this file to your managed Linux devices using your preferred configuration management tool.

> **Note:**
>
> You can change the location of the policy file, or disable this feature entirely, using the [`--syspolicy-file`][docs-tailscaled-flags] flag when starting `tailscaled`. Passing an empty string disables the policy file loader.

Refer to our [system policies][docs-mdm-keys] page for the full list of configurable settings.

### File format

The policy file uses JSON or [HuJSON][xt-hujson] format. Each policy key expects a specific value type:

* **String** settings take a JSON string, for example `"ControlURL": "https://controlplane.example.com"`.
* **Boolean** settings take a JSON boolean, for example `"AlwaysOn": true`.
* **Integer** settings take a JSON number, for example `"KeyExpirationNotice": 86400`.
* **String array** settings take a JSON array of strings, for example `"AllowedSuggestedExitNodes": ["node-a", "node-b"]`.
* **Duration** settings take a string in the format accepted by [Go's `time.ParseDuration`][xt-go-parse-duration], for example `"ReconnectAfter": "24h"`.
* Some settings only accept specific enumerated string values, such as `always`, `never`, or `user-decides` for preference settings, or `show` or `hide` for visibility settings.

#### Example

For example, the following policy file enforces an auth key, restricts the device to a specific tailnet, restricts suggested exit nodes, and requires the device to accept subnet routes and DNS settings from the tailnet:

```json
{
  "AuthKey": "tskey-auth-xxx",
  "Tailnet": "example.com",
  "AllowedSuggestedExitNodes": ["node-a", "node-b"],
  "UseTailscaleSubnets": "always",
  "UseTailscaleDNSSettings": "always"
}
```

[docs-install-linux]: /docs/install/linux

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-tailscaled-flags]: /docs/reference/tailscaled#flags-to-tailscaled

[xt-go-parse-duration]: https://pkg.go.dev/time#ParseDuration

[xt-hujson]: https://github.com/tailscale/hujson
