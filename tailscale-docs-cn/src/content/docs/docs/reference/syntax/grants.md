---
title: "Grants syntax"
description: "Tailscale [grants][docs-grants] provide a unified access control system that combines network layer and application layer capabilities into a shared syntax. They represent an evolution of Tailscale's "
---

Last validated Jan 5, 2026

Tailscale [grants][docs-grants] provide a unified access control system that combines network layer and application layer capabilities into a shared syntax. They represent an evolution of Tailscale's access control lists ([ACLs][docs-acls]), offering enhanced flexibility and fine-grained control over resource access. The grants system implements the [least privilege][ln-principle-of-least-privilege] and [zero trust][docs-zero-trust] principles through a deny-by-default approach where access must be explicitly granted.

This reference guide explains the syntax and usage of grants as defined in the [tailnet policy file][docs-tailnet-policy-file]. It covers the [basic structure][ar-syntax], [available selectors][ar-source-selectors], and [example implementations][ar-error-handling-and-troubleshooting] for common scenarios. This document assumes you are familiar with basic Tailscale concepts such as Tailscale networks (known as [tailnets][docs-tailnet]), [tags][docs-tags], and [groups][docs-targets-groups].

## Core concepts

Grants follow a declarative model where you specify who can access what resources under which conditions. Each grant requires at minimum a source (`src`), a destination (`dst`), and [network layer capabilities][ar-network-layer-capabilities] (`ip`) and/or [application layer capabilities][ar-application-layer-capabilities] (`app`). [Device posture requirement][ar-device-posture-requirements]s (`srcPosture`) and [routing specifications][ar-routing-specifications] (`via`) are optional.

When you list multiple [selectors][docs-targets] in a single `src` or `dst` array, the Tailscale policy engine uses the union of all entities matching any selector.

Grants follow a deny-by-default principle, meaning access is only permitted if explicitly granted. If multiple grants match a connection, the Tailscale policy engine applies the union of all granted capabilities. More specific grants do not override less specific ones; they add to them. Additionally, [application capabilities][docs-grants-app-capabilities] only apply if the device has the network level access.

## Syntax

Grant definitions go in the `grants` section of the tailnet policy file using a [declarative human-readable JSON syntax][xt-wiki-json]. The basic structure follows this pattern:

```json
{
  "grants": [
    {
      "src": ["<list-of-sources>"],
      "dst": ["<list-of-destinations>"],
      "ip": ["<list-of-ports-or-protocols>"],
      "app": {
        "<capability-identifier>": [
          {
            "<parameter-name>": "<parameter-value>",
            // Additional parameters as required
          }
        ]
      },
      "srcPosture": ["<list-of-posture-conditions>"],
      "via": ["<list-of-routing-devices>"]
    }
    // Additional grants as needed
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

All grant properties exist as arrays (even if there's only one item), except for `app` which is a map of [capability][docs-grants-app-capabilities] identifiers to arrays of parameter objects.

Grants have an implied `accept` action, making them inherently permissive within their specified scope. The policy engine compiles all grants and distributes them to [Tailscale clients][docs-installation], which cache them locally.

## Source selectors

The source (`src`) field defines the network sources that start a connection. These can be devices, users, groups, IP ranges, or other [selectors][docs-targets]. All grant definitions require a `src` field, which accepts an array of selectors. You can use a variety of selector types to target specific entities or groups of entities within your tailnet.

The table below outlines all available source selectors, their meanings, and example usage patterns to help you construct precise access policies.

| Selector            | Description                                                                                                                                                                           | Example                               |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------ |
| `*`                 | Select all sources in your tailnet and from approved subnet routes. This does not include devices outside your tailnet (unless they're on an approved subnet).                        | `*`                                   |
| `group:<groupName>` | Select all members of a specific group.                                                                                                                                               | `group:prod`                          |
| `<email>`           | Select a specific user by their email address. For GitHub users, use `username@github`. For Passkey users, use `username@passkey`.                                                    | `user@example.com`, `username@github` |
| `tag:<tagName>`     | Select all devices with a specific tag.                                                                                                                                               | `tag:server`                          |
| `autogroup:<role>`  | Select all members of a specific role. Possible roles are `admin`, `member`, `owner`, `it-admin`, `network-admin`, `billing-admin`, and `auditor`.                                    | `autogroup:admin`                     |
| `autogroup:tagged`  | Select all devices with a tag (any tag).                                                                                                                                              | `autogroup:tagged`                    |
| `autogroup:shared`  | Select all devices that belong to users who have accepted a sharing invitation to your tailnet.                                                                                       | `autogroup:shared`                    |
| `<cidr>/<ip>`       | Select all devices in a CIDR range.                                                                                                                                                   | `192.0.2.0/24`, `192.0.2.5`           |
| `<hostAlias>`       | Select a host by its user-defined alias. You can use this selector to grant access to a specific device or a CIDR range. You can find `hostAlias` definitions in the `hosts` section. | `example-host-name`                   |
| `ipset:<ipsetName>` | Select an IP set (a named group of IP address ranges).                                                                                                                                | `ipset:prod`                          |

## Destination selectors

The destination (`dst`) field defines the endpoints that the source can access. These can be devices, users, groups, IP ranges, or other [selectors][docs-targets]. All grant definitions require a `dst` field, which accepts an array of selectors. Destination selectors include all the options available for sources, plus additional selectors specific to destinations.

| Selector             | Description                                                                                                                                                                                                                                             | Example                                                   |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------- |
| `*`                  | Select all sources in your tailnet and from approved subnet routes. This does not include devices outside your tailnet (unless they're on an approved subnet).                                                                                          | `*`                                                       |
| `group:<groupName>`  | Select all members of a specific group.                                                                                                                                                                                                                 | `group:analytics`                                         |
| `<email>`            | Select a specific user by their email address. For GitHub users, use `username@github`. For Passkey users, use `username@passkey`.                                                                                                                      | `name@example.com`, `username@github`, `username@passkey` |
| `tag:<tagName>`      | Select all devices with a specific tag.                                                                                                                                                                                                                 | `tag:tailsql`                                             |
| `svc:<serviceName>`  | Select a specific [Tailscale Service][docs-tailscale-services].                                                                                                                                                                                         | `svc:web-server`                                          |
| `autogroup:<role>`   | Select all members of a specific role. Possible roles are `admin`, `member`, `owner`, `it-admin`, `network-admin`, `billing-admin`, and `auditor`.                                                                                                      | `autogroup:admin`                                         |
| `autogroup:tagged`   | Select all devices with a tag (any tag).                                                                                                                                                                                                                | `autogroup:tagged`                                        |
| `autogroup:internet` | `autogroup:internet` is a special autogroup selector that lets you grant access to use an exit node to access the internet.                                                                                                                             | `autogroup:internet`                                      |
| `autogroup:self`     | Select a user's devices. `autogroup:self` is a special autogroup selector that, when combined with a `src` selector of `autogroup:<role>`, `group:<name>`, or an individual user, lets you grant access to a user's own devices from their own devices. | `autogroup:self`                                          |
| `<cidr>/<ip>`        | Select all devices in a CIDR range.                                                                                                                                                                                                                     | `192.0.2.0/24`, `192.0.2.5`.                              |
| `<hostAlias>`        | Select a host by its user-defined alias. You can use this selector to grant access to a specific device or a CIDR range. You can find `hostAlias` definitions in the `hosts` section.                                                                   | `example-host-name`                                       |
| `ipset:<ipsetName>`  | Select an IP set (a named group of IP address ranges).                                                                                                                                                                                                  | `ipset:prod`                                              |

You can use these selectors to define precise destination scopes. For example, you can allow access to databases using `tag:database`, allow access to both production and development environments with `tag:prod` and `tag:dev`, or allow access to the internet through [exit nodes][docs-exit-nodes] with `autogroup:internet`.

> **Note:**
>
> CIDR selectors in grants control which traffic is permitted, not which routes are injected into client routing tables. A grant allowing `192.168.0.0/16` does not inject routes to that range. Routes are injected when a [subnet router][docs-subnets] advertises them and an admin approves them. For more information, refer to the [route injection reference][docs-route-injection].

## Network layer capabilities

The `ip` field defines the network layer [capabilities][docs-grants-app-capabilities], such as ports and protocols. You must include this field, or the `app` field, or both fields together. When omitted, the source has no network layer access unless granted by another rule. When included, it accepts an array of selectors that specify the allowed ports and protocols. Network layer capabilities form the foundation of access control by determining the communication channels you permit between source and destination. The table below shows the available network layer capability selectors and their descriptions, providing options from broad all-protocol access to precisely targeted protocol-port combinations.

| Selector         | Description                                                                                                                                                                                     | Example                 |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| `*`              | Allow access to all ports on the destination (implies TCP, UDP, and ICMP access).                                                                                                               | `*`                     |
| `<port>`         | Allow access to a specific port on the destination (implies TCP, UDP, and ICMP access). You can specify a single port (`443`) or a range of ports (`80-443`).                                   | `443`, `80-443`         |
| `<proto>:*`      | Allow all ports of the specified protocol (`proto`) access to the destination. This is especially useful for protocols that do not have ports, such as ICMP. For example, `icmp:*` or `sctp:*`. | `icmp:*`, `sctp:*`      |
| `<proto>:<port>` | Allow access to a specific protocol and port combination on the destination. You can specify a single port (`tcp:443`) or a range of ports (`tcp:80-443`).                                      | `tcp:443`, `tcp:80-443` |

When specifying protocols, you can use either an [IANA IP protocol number][xt-wiki-iana] (1-255) or one of the named aliases. The table below maps common protocol names to their corresponding IANA numbers, allowing you to use human-readable protocol identifiers instead of numeric codes when defining network capabilities. This makes your grant definitions more readable and maintainable while preserving the technical precision required for proper enforcement.

| Protocol                                    | Named Alias        | IANA Number |
| :------------------------------------------ | :----------------- | :---------- |
| Internet Group Management (IGMP)            | `igmp`             | 2           |
| IPv4 encapsulation                          | `ipv4`, `ip-in-ip` | 4           |
| Transmission Control (TCP)                  | `tcp`              | 6           |
| Exterior Gateway Protocol (EGP)             | `egp`              | 8           |
| Any private interior gateway                | `igp`              | 9           |
| User Datagram (UDP)                         | `udp`              | 17          |
| Generic Routing Encapsulation (GRE)         | `gre`              | 47          |
| Encap Security Payload (ESP)                | `esp`              | 50          |
| Authentication Header (AH)                  | `ah`               | 51          |
| Stream Control Transmission Protocol (SCTP) | `sctp`             | 132         |

## Application layer capabilities

The `app` field is an optional field that maps strings to arrays of objects that define the application layer [capabilities][docs-grants-app-capabilities] to grant. The strings are the app capability strings to grant, and the objects are the parameters for those capabilities.

The specific application (such as [`golink`][xt-gh-golink]) defines the names of capabilities in the format `<domainName>/<capabilityName>`.

* The `domainName` groups capabilities into namespaces to avoid collisions with other applications.
  * `tailscale.com` and `tailscale.io` are domain namespaces that Tailscale reserves for our own products. If you write custom application capabilities, you should use a domain that you control to avoid conflicts with other third-party integrations.
* The `capabilityName` defines the specific capability. For example, the [TailSQL][xt-gh-tailsql] application defines the `tailscale.com/cap/tailsql` capability.

The specific application also defines the parameters for each capability. The Tailscale policy engine treats these parameters as opaque JSON objects. The policy engine compiles the parameters and sends them to the Tailscale clients, but only checks that the field is valid JSON. It does not validate the parameters against any specific schema. The clients can then use these parameters to make authorization decisions locally.

```json
"app": {
  "<domainName>/<capabilityName>": [
    {
      "<parameterName>": "<parameterValue>",
      // Additional parameters as defined by the application
    }
  ]
}
```

Tailscale is not involved in creating, naming, or validating application capabilities or their parameters (unless it's a Tailscale application). It's the application developer's responsibility to document all capabilities and parameters.

Application capabilities provide fine-grained control over the actions you permit within an application. For example, you can grant access to all [TailSQL][xt-gh-tailsql] data sources with:

```json
"app": {
  "tailscale.com/cap/tailsql": [
    {
      "dataSrc": ["*"]
    }
  ]
}
```

You can grant administrative privileges to [`golink`][xt-gh-golink] with:

```json
"app": {
  "tailscale.com/cap/golink": [
    {
      "admin": true
    }
  ]
}
```

Or grant Kubernetes impersonation capabilities with:

```json
"app": {
  "tailscale.com/cap/kubernetes": [
    {
      "impersonate": {
        "groups": ["system:masters"]
      }
    }
  ]
}
```

## Device posture requirements

The `srcPosture` field is an array of [device posture][docs-device-posture] conditions you can use to further restrict the network source (`src`). For example, you can use `srcPosture` to restrict access to only devices running a specific version of the Tailscale client.

Device posture requirements help ensure that only devices meeting specific security or configuration criteria can establish connections. For example, you can require specific macOS versions for access or require multiple device conditions

## Routing specifications

The `via` field introduces routing awareness to grants by letting you specify *how* Tailscale can route the destination (`dst`) from the source (`src`). You can use the `via` syntax to define the [exit nodes][docs-exit-nodes], [subnet routers][docs-subnets], or [app connectors][docs-app-connectors] a source can access when they use a specific destination. For example, you can create a grant that forces traffic through a specific exit node when it goes from the engineering team group to the GitHub app connector.

The `via` field specifies how traffic must route from the source to the destination. This field is optional and accepts an array of tags that identify routing devices such as exit nodes, subnet routers, or app connectors.

Using the `via` field in grants lets you do things like:

* Route traffic to an enterprise application through a specific exit node.
* Route traffic based on device posture criteria.
* Route traffic from specific users through a subnet router.

You can omit the `via` field (or set it to `[]` or `null`) when you create a grant to allow any group of devices to access a resource (through any exit node, subnet router, or app connector).

> **Warning:**
>
> The `via` field has the following limitations:
>
> * You can only use [tags][docs-tags] within the `via` field.
> * For [failover and regional routing reasons][docs-high-availability], you can only use accessible routers as `via` candidates. The routers accessible to users depends on applicable [access policies][docs-acls].

## Error handling and troubleshooting

The Tailscale policy engine compiles grants and distributes them to Tailscale clients, which cache them locally. Errors can occur during policy compilation, distribution, or enforcement.

Common errors include invalid selectors (using non-existent groups, tags, or IP sets), unreachable hosts (granting access to destinations that don't exist), protocol mismatches (specifying non-existent or mis-formatted protocol identifiers), and application capability mismatches (referencing capabilities not supported by the target application). Where possible, the policy engine will provide error messages when it detects an issue.

For more troubleshooting guidance, refer to the [troubleshooting grants topic][docs-grants-troubleshooting].

[ar-application-layer-capabilities]: #application-layer-capabilities

[ar-device-posture-requirements]: #device-posture-requirements

[ar-error-handling-and-troubleshooting]: #error-handling-and-troubleshooting

[ar-network-layer-capabilities]: #network-layer-capabilities

[ar-routing-specifications]: #routing-specifications

[ar-source-selectors]: #source-selectors

[ar-syntax]: #syntax

[docs-acls]: /docs/features/access-control/acls

[docs-app-connectors]: /docs/features/app-connectors

[docs-device-posture]: /docs/features/device-posture

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-troubleshooting]: /docs/reference/troubleshooting/grants

[docs-grants]: /docs/features/access-control/grants

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-installation]: /docs/install

[docs-route-injection]: /docs/reference/route-injection

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-targets-groups]: /docs/reference/targets-and-selectors#groups

[docs-targets]: /docs/reference/targets-and-selectors

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege

[xt-gh-golink]: https://github.com/tailscale/golink

[xt-gh-tailsql]: https://github.com/tailscale/tailsql

[xt-wiki-iana]: https://en.wikipedia.org/wiki/Internet_Assigned_Numbers_Authority

[xt-wiki-json]: https://en.wikipedia.org/wiki/JSON
