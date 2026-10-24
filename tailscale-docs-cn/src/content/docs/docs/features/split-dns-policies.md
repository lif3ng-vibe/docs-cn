---
title: "Split DNS policies"
description: "Split DNS policies let you override your Tailscale network's (known as a [tailnet][docs-tailnet]) global split DNS configuration for specific [devices or groups][docs-targets]. You define these overri"
---

Last validated Dec 10, 2025

> **Note:** Split DNS policies are currently in alpha.

Split DNS policies let you override your Tailscale network's (known as a [tailnet][docs-tailnet]) global split DNS configuration for specific [devices or groups][docs-targets]. You define these overrides in the `nodeAttrs` section of your tailnet policy file using the `tailscale.com/split-dns` application type. Tailscale applies your policies to matching devices, customizing their [DNS configuration][docs-dns] without requiring client changes.

This feature addresses situations where different parts of your organization require different DNS resolvers for the same domains. For example, you can prevent users from resolving internal domain names when they lack access to the underlying resources or configure different DNS servers based on device [tags][docs-tags] such as cloud environment or department.

> **Warning:**
>
> Split DNS policies are in alpha and require authorization from your Tailscale account manager to access.

## Use cases

Split DNS policies address the following use cases:

* Test proposed split DNS changes with your IT team or volunteer testers before applying them to your entire tailnet.
* Apply split DNS policies to [subsets of users][docs-targets], such as employees but not contractors, particularly when [app connectors][docs-app-connectors] serve SaaS applications that only certain users should access through the connector.
* Configure different DNS servers depending on a device's tag, allowing DNS resolution to vary based on cloud environment or other device characteristics.
* Remove visibility of internal domain names from users who lack access to the underlying resources behind access control ([grant][docs-grants])-restricted [subnet routers][docs-subnets] or DNS servers.
* Prevent users without app connector access from being directed to those connectors, allowing them to access SaaS applications over the internet instead.

## Prerequisites

Before you use split DNS policies, you need the following:

* An existing tailnet.
* A user account with the [Owner, Admin, or Network admin](/docs/reference/user-roles) role to edit the [tailnet policy file][docs-policy-syntax] in the admin console.
* Authorization from your Tailscale account manager to access this alpha feature.
* Understanding of your tailnet's current split DNS configuration and which domains require targeted overrides.
* Familiarity with the tailnet policy file structure and [node attribute][docs-policy-syntax-node-attributes] targeting syntax.

## Get started

This section provides instructions for creating your first split DNS policy. You add a policy to your tailnet policy file that overrides DNS resolution for a specific domain on all devices in your tailnet.

### Identify the domains and resolvers

Before you configure split DNS policies, identify which domains require custom DNS resolution and which DNS servers should resolve those domains. Determine which devices should receive the custom configuration using tags, groups, or the wildcard `*` for all devices.

Document the DNS server addresses you use. These can be IPv4 or IPv6 addresses, addresses with ports, or [DNS over HTTPS (DoH)][docs-dns-over-https] URLs. If you use DoH URLs, identify whether you need bootstrap resolution to avoid circular DNS dependencies.

Consider whether your policy requires a specific priority. Negative priorities apply before your tailnet's global split DNS configuration and app connectors. Zero or positive priorities apply after global configuration and app connectors.

* Negative priorities like `-1` are useful for blocking access to internal domains before global configuration applies.
* Zero or positive priorities like `0` or `2` are useful for providing alternative DNS servers after global configuration applies.

> **Warning:**
>
> Do not use duplicate priority values because it can lead to unpredictable behavior.

### Add the split DNS policy to your tailnet policy file

The following steps show you how to add a split DNS policy to your tailnet policy file.

1. Open the [Access controls](https://console.tailscale.com/admin/acls/file) page of the admin console.
2. Locate the `nodeAttrs` section in your tailnet policy file. If the `nodeAttrs` section does not exist, create it after the `grants` section.
3. Add a new node attribute entry with your target selector and the `tailscale.com/split-dns` application type.

The following example creates a policy that applies to all devices in your tailnet:

```json
"nodeAttrs": [
  {
    "target": ["*"],
    "app": {
      "tailscale.com/split-dns": [
        {
          "comment": "Override DNS for example.com",
          "priority": 0,
          "nameservers": [
            {
              "addr": "198.51.100.1"
            },
            {
              "addr": "198.51.100.2"
            }
          ],
          "domains": [
            "example.com",
            "*.example.com"
          ]
        }
      ]
    }
  }
]
```

This policy configures two nameservers (`198.51.100.1` and `198.51.100.2`) for `example.com` and its subdomains. The priority of `0` means this policy applies after global split DNS configuration and app connectors.

Save your tailnet policy file changes. Tailscale processes your policies and includes the customized DNS configuration it sends to matching devices.

### Verify the configuration

After you save your tailnet policy file, verify that devices receive the correct DNS configuration. You can do this by connecting to a device that matches your target selector and checking its DNS settings. You can also query a domain from your domains list to confirm resolution uses your specified nameservers.

If the DNS resolution does not behave as expected, review your target selector and priority settings. Check that your nameserver addresses are correct and reachable from the devices.

## Common scenarios

The following sections provide instructions for common split DNS policy configurations.

### Create a policy for a specific tag

To apply a split DNS policy only to devices with a specific [tag][docs-tags], use that tag in the target selector. The following example creates a policy that applies only to devices tagged with `tag:production`:

```json
"nodeAttrs": [
  {
    "target": ["tag:production"],
    "app": {
      "tailscale.com/split-dns": [
        {
          "comment": "Production DNS resolvers",
          "nameservers": [
            {
              "addr": "10.0.2.53"
            }
          ],
          "domains": [
            "internal.example.com"
          ]
        }
      ]
    }
  }
]
```

Devices without the `tag:production` tag continue using the global split DNS configuration for `internal.example.com`.

### Reference app connector domains

You can reference [app connector][docs-app-connectors] domains in your split DNS policies instead of listing all domains explicitly. This approach keeps your DNS configuration synchronized with your app connector definitions.

The following example references an app connector named `saas-apps`:

```json
"nodeAttrs": [
  {
    "target": ["group:employees"],
    "app": {
      "tailscale.com/split-dns": [
        {
          "comment": "Employee access to SaaS apps",
          "nameservers": [
            {
              "addr": "10.0.2.100"
            }
          ],
          "domains": [
            "appc:saas-apps"
          ]
        }
      ]
    }
  }
]
```

When Tailscale processes this policy, it expands to include all domains from the `saas-apps` app connector definition. If the app connector's domain list changes, your split DNS policy automatically reflects those changes.

### Remove split DNS for specific devices

You can remove split DNS configuration for specific domains by providing an empty nameservers list. The following example removes split DNS configuration for `internal.example.com` on devices tagged with `tag:external`:

```json
"nodeAttrs": [
  {
    "target": ["tag:external"],
    "app": {
      "tailscale.com/split-dns": [
        {
          "comment": "Remove internal DNS for external devices",
          "nameservers": [],
          "domains": [
            "internal.example.com"
          ]
        }
      ]
    }
  }
]
```

Devices matching this policy receive no split DNS configuration for `internal.example.com`, even if the global split DNS configuration or lower-priority policies specify nameservers for that domain.

### Use DNS over HTTPS

You can configure nameservers using [DNS over HTTPS (DoH)][docs-dns-over-https] URLs. The following example uses a DoH resolver for all devices:

```json
"nodeAttrs": [
  {
    "target": ["*"],
    "app": {
      "tailscale.com/split-dns": [
        {
          "comment": "Use DoH for example.com",
          "nameservers": [
            {
              "addr": "https://resolver.example.com/dns-query"
            }
          ],
          "domains": [
            "example.com"
          ]
        }
      ]
    }
  }
]
```

For DoH URLs that require bootstrap resolution (`bootstrapResolution`) to avoid circular DNS dependencies, specify pre-resolved IP addresses:

```json
"nameservers": [
  {
    "addr": "https://resolver.example.com/dns-query",
    "bootstrapResolution": ["192.0.2.1", "192.0.2.2"]
  }
]
```

Tailscale uses the provided IP addresses to connect to the DoH server without resolving its hostname through DNS.

### Configure DNS for exit node usage

You can control whether a device uses a nameserver when the device's traffic routes through an [exit node][docs-exit-nodes]. The `useWithExitNode` field specifies whether the nameserver should resolve queries when exit node routing is active.

The following example configures two nameservers with different exit node behavior:

```json
"nameservers": [
  {
    "addr": "198.51.100.1"
  },
  {
    "addr": "198.51.100.2",
    "useWithExitNode": true
  }
]
```

When the device uses an exit node, Tailscale performs DNS resolution using only `198.51.100.2` for the specified domains, then routes the resulting traffic through the exit node. When the device does not use an exit node, both nameservers are available. The `useWithExitNode` field defaults to `false` if not specified.

## Reference

This section provides detailed information about the split DNS policies configuration structure and available options.

### Tailnet policy file structure

You define split DNS policies in the `nodeAttrs` section of your tailnet policy file. Each entry consists of a target selector that determines which devices receive the policy and one or more split DNS policies under the `tailscale.com/split-dns` application type.

The complete structure is:

```json
"nodeAttrs": [
  {
    "target": ["<target-selector>"], // The devices to which this policy applies
    "app": {
      "tailscale.com/split-dns": [ // The split DNS application capability
        {
          "comment": "<description>", // Optional comment
          "priority": 0, // Positive or negative integer
          "nameservers": [
            {
              "addr": "<dns-server-address>", // IPv4, IPv6, address:port, or DoH URL
              "bootstrapResolution": ["<ip-address>"], // Optional list of IPs for DoH bootstrap
              "useWithExitNode": false // Use even when using an exit node
            }
          ],
          "domains": [
            "<domain-name>" // Domains to which this policy applies
          ]
        }
      ]
    }
  }
]
```

You can define multiple `nodeAttrs` entries with different target selectors. Each entry can contain multiple split DNS policies in the `tailscale.com/split-dns` array.

### Field definitions

**`comment`** (Optional): A free-form text field for documentation purposes. This field does not affect the policy's behavior. Using descriptive comments makes your tailnet policy file easier to maintain.

**`priority`** (Optional): An integer that determines the order to process policies. The default value is `0` if not specified. Tailscale processes policies in increasing order of priority. Do not use duplicate priority values because it can lead to unpredictable behavior.

**`nameservers`** (Required): A list of nameserver entries that define which DNS servers resolve the specified domains. You can specify an empty list to remove existing policies for the listed domains. Each nameserver entry requires an `addr` field and supports optional `bootstrapResolution` and `useWithExitNode` fields.

**`domains`** (Required): A list of domains to which the nameservers apply. You can specify domains directly using standard DNS notation such as `example.com` or `*.example.com` for wildcards. You can reference app connector configurations using the format `appc:name`, where name matches an app connector definition in your tailnet policy file. When you reference an app connector, Tailscale expands it to include all domains from that connector's domain list. You must specify at least one domain for the policy to be valid.

### Nameserver configuration

Each nameserver entry in the `nameservers` list supports the following fields:

**`addr`** (Required): The address of the DNS resolver. This can be a plain IPv4 or IPv6 address for a standard User Datagram Protocol (UDP) and Transmission Control Protocol (TCP) DNS resolver, an IP address with a port in the format `address:port` (for IPv6 addresses with ports, use `[IPv6-address]:port`), or an HTTPS URL for DNS over HTTPS (DoH).

**`bootstrapResolution`** (Optional): A list of pre-resolved IP addresses for the hostname in a DoH URL. This field applies only when `addr` specifies a DoH URL. Bootstrap resolution lets Tailscale to connect to the DoH server without resolving its hostname through DNS, avoiding circular dependencies. For example, if your DoH URL is `https://resolver.example.com/dns-query`, you can specify `["192.0.2.1", "192.0.2.2"]` to provide static IP addresses for `resolver.example.com`. For well-known public DNS resolvers, Tailscale may already know the IP addresses and does not require bootstrap resolution.

**`useWithExitNode`** (Optional): A Boolean that indicates whether to use the nameserver when routing the device's traffic through an exit node. This field defaults to false if not specified. When set to true, Tailscale performs DNS resolution using your specified resolver, then routes the resulting traffic through the exit node.

### Priority system

The priority system determines the order in which Tailscale applies split DNS policies. When multiple policies affect the same domains, understanding priority is essential for predictable behavior.

Tailscale applies policies in the following order:

1. Policies with negative priority values (such as `-2`, `-1`) are processed first.
2. Your tailnet's global split DNS configuration is applied.
3. App connector DNS configurations are applied.
4. Policies with zero or positive priority values (such as `0`, `1`, `2`) are processed last.

When multiple policies define nameservers for the same domain, the policy with the highest priority takes precedence. An empty `nameservers` list explicitly removes any existing split DNS configuration for the specified domains, including configuration from lower-priority policies.

### Target selectors

The `target` field in each `nodeAttrs` entry determines which devices receive the split DNS policy. You can use any selection criteria supported by node attributes:

* **Wildcard**: `*` targets all devices in the tailnet.
* **Tags**: `tag:production` targets devices with the production tag.
* **Groups**: `group:employees` targets devices in the employees group.
* **Multiple targets**: `["tag:production", "tag:staging"]` targets devices matching any listed criteria.

A single device can match multiple `nodeAttrs` entries. When this occurs, the control plane collects all matching policies and sorts them by priority before applying them. This targeting capability lets you create DNS configurations that adapt to your organization's structure.

For more information, refer to the [targets and selectors][docs-targets] documentation.

## Limitations

Split DNS policies have the following limitations:

* **Alpha release**: This feature is in alpha. Contact your Tailscale account manager to request access.
* **No visual editor support**: You must edit the tailnet policy file directly in the admin console to configure split DNS policies. The visual editor does not support this feature.
* **Tailnet policy file configuration only**: Configuration is available only through the tailnet policy file. There is no application programming interface (API) or command-line interface (CLI) support for managing these policies.
* **Interim solution**: This feature represents an interim solution while more comprehensive DNS configuration functionality is under development. The implementation and configuration method may change when the long-term solution is complete.
* **Cannot control MagicDNS per device**: You cannot use split DNS policies to enable or disable MagicDNS for specific devices, override local DNS settings, vary global DNS servers between devices, or customize search domains per device.
* **Control plane processes policies**: The [control plane][docs-control-data-planes] processes policies and sends pre-configured DNS settings to clients. Clients cannot override these settings locally.

## Future direction and feedback

Split DNS policies are intentionally constrained to meet immediate customer needs without requiring significant development resources. This feature is not the long-term direction for DNS configuration in Tailscale. A more comprehensive solution is under development that moves all split DNS configuration into the tailnet policy file and provides more flexible DNS management.

When the comprehensive DNS solution is complete, Tailscale evaluates whether to promote split DNS policies to beta, maintain them as specialized tools for specific situations, or deprecate them in favor of the new system. This approach serves current customer needs while maintaining flexibility for future improvements.

As an alpha feature, split DNS policies benefits from your feedback. If you encounter issues, have suggestions for improvements, or need additional functionality, contact your Tailscale account manager or support team. Your input helps shape both this feature and the longer-term DNS configuration solution.

[docs-app-connectors]: /docs/features/app-connectors

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-dns-over-https]: /docs/reference/faq/magicdns

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-policy-syntax-node-attributes]: /docs/reference/syntax/policy-file#node-attributes

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet]: /docs/concepts/tailnet

[docs-targets]: /docs/reference/targets-and-selectors
