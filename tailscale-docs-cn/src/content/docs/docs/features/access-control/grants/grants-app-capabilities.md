---
title: "Application capabilities"
description: "Application capabilities, commonly referred to as \"app capabilities\", extend Tailscale's access control system beyond traditional network traffic rules. While standard grants control which devices can"
---

Last validated Dec 1, 2025

Application capabilities, commonly referred to as "app capabilities", extend Tailscale's access control system beyond traditional network traffic rules. While standard grants control which devices can communicate with each other over specific ports and protocols, app capabilities provide fine-grained permissions for specific features and functionality operating at higher application layers. This enables precise control over what actions devices can perform, rather than only which network connections they can establish.

App capabilities go within the grants section of a [tailnet policy file][docs-tailnet-policy-file] using the `app` field. Each capability represents a specific permission or feature that you can enable between devices in your [tailnet][docs-tailnet]. This document explains how app capabilities work, their requirements and limitations, and provides details on all built-in Tailscale capabilities with practical examples.

\[Missing snippet: node\_attrs\_vs\_app\_caps\_note.mdx]

## How app capabilities work

This section explains the core mechanisms behind app capabilities, including formatting and processing.

You define app capabilities within the `app` map of a grant rule. The grant itself defines which source devices (`src`) can access which destination devices (`dst`), and the app map defines the specific capabilities to grant for that connection. Each capability follows a domain name convention, typically in the format `domain.com/cap/feature`. The value associated with each capability is an array of JSON objects, each containing capability-specific configuration options.

Basic structure within a grant:

```json
"grants": [
  {
    "src": ["user@example.com", "group:engineering"],
    "dst": ["tag:server"],
    "app": {
      "capability.name/string": [
        { /* Configuration object 1 */ },
        { /* Configuration object 2 */ }
      ],
    }
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

To leverage granted capabilities in applications running on the destination, capabilities for a source device can be read from the `tailscale whois` command on the CLI, from [LocalAPI][xt-tailscale-localapi], the `tailscale serve` [application capabilities header][docs-serve-app-capabilities], or with the [`tsnet` Go library][docs-tsnet] for embedding Tailscale in a Go application.

## Requirements and limitations

App capabilities in Tailscale grants must conform to several technical requirements and are subject to specific limitations. This section outlines the validation rules, source and destination restrictions, and naming requirements that apply to app capabilities in your tailnet policy.

* Every grant rule must specify either `ip` or `app` fields (or both). At least one of these fields must exist.
* Capability names must not be empty.

Certain restrictions apply to which sources and destinations you can use with app capabilities.

* When using `autogroup:self` as a destination, the source must be an individual user, group, or role-based autogroup (such as `autogroup:member`, `autogroup:admin`, `autogroup:owner`, and so on) to ensure proper permission mapping.
* Destination restrictions prevent using `autogroup:shared` or `autogroup:danger-all` as destinations for capabilities.
* App grants cannot target `autogroup:internet` destinations, nor can they use administrative autogroups such as `autogroup:admin` as destinations.

Capability names must follow a specific format to ensure proper organization and prevent conflicts.

* The format must follow the `{domain}/{path}` pattern, such as `example.com/cap/custom-app`.
* Capabilities under `tailscale.com` and `tailscale.io` domains are reserved for Tailscale's use when developing application capabilities that you can use with the product.
* When creating custom capabilities for your own applications, you should use a domain you control to avoid potential conflicts with built-in capabilities or third-party integrations.

## Built-in Tailscale capabilities

Tailscale provides a range of built-in capabilities that enable specific features and functions in Tailscale products or [Community Projects][co-community-projects]. This section documents all the standard capabilities that are provided by Tailscale, explaining their purpose, configuration options, and providing practical examples of their use in policy files.

### Taildrive

[Taildrive][docs-taildrive] extends Tailscale's file sharing capabilities by allowing devices to share and access entire directories with other devices. Its capability (`tailscale.com/cap/drive`, `tailscale.com/cap/drive-sharer`) precisely controls who can read and write in shared directories.

The `shares` parameter accepts an array of share names or `"*"` to represent all shares. The `access` parameter determines whether the access is read-only (`"ro"`) or read-write (`"rw"`). The `drive-sharer` capability is automatically added to the source device, simplifying policy management. Administrators can specify different access levels for different shares, and using `"*"` grants access to all shares on the target device.

```json
"grants": [
  {
    "src": ["group:developers"],
    "dst": ["fileserver"],
    "app": {
      "tailscale.com/cap/drive": [
        {"shares": ["projects", "documentation"], "access": "rw"},
        {"shares": ["archives"], "access": "ro"}
      ]
    }
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Tailscale Kubernetes operator

Tailscale's [Kubernetes capability][docs-kubernetes] (`tailscale.com/cap/kubernetes`) provides secure access to Kubernetes clusters through granular permission controls and optional session recording. The operator streamlines cluster management while maintaining strong security through your tailnet policy. The app capability lets you define precisely who can access which clusters and with what permissions, while optionally enforcing session recording for audit and compliance purposes.

Configuration options for the Kubernetes capability include

* `recorders`: an array of tags specifying devices to record sessions.
* `enforceRecorder`: a boolean that determines whether connections fail when recorders are unavailable.
* `impersonate`: an object defining Kubernetes impersonation configuration.

The capability has two important implementation details:

* Only one recorder tag is allowed per rule.
* The recorder tag must be defined in the policy.

```json
"grants": [
  {
    "src": ["group:devops"],
    "dst": ["tag:k8s-cluster"],
    "app": {
      "tailscale.com/cap/kubernetes": [
        {
          "recorders": ["tag:k8s-recorder"],
          "enforceRecorder": true,
          "impersonate": {
            "groups": ["system:masters"]
          }
        }
      ]
    }
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Tailscale PAM

[Tailscale PAM][docs-tailscale-pam] is a next-generation Privileged Access Management (PAM) solution that provides application-aware access to your critical resources in your tailnet. Its capability (`tailscale.com/cap/pam`) provides secure access to Linux servers, databases, Kubernetes clusters, and more. It governs privileged sessions at the moment access happens, with complete session auditing and session recording, where applicable.

A Tailscale PAM grant primarily defines three things:

* Who can access a service.
* Which Tailscale PAM service they can access.
* What they can do within that service.

The source can be an identity, group, device, or tag. The destination is a Tailscale PAM service. For example, consider the following `grants` definition.

```json
{
  "grants": [
    {
      "src": ["group:platform"],
      "dst": ["svc:production-database"],
      "ip": ["*"],
      "app": {
        "tailscale.com/cap/pam": [
          {
            "version": "v1",
            "permissions": {
              "database": {
                "allowed_databases": [
                  {
                    "database": "*",
                    "allowed_query_types": ["ReadOnly"]
                  }
                ]
              }
            }
          }
        ]
      }
    }
  ]
}
```

The fields have the following purposes:

* `src` identifies who is requesting access. In this example, the `group:platform` group.
* `dst` identifies the PAM service, `svc:production-database`.
* `app` contains the application-level PAM permissions, which is read-only access to all databases.

The `app` field contains the PAM permissions that apply when the source accesses the destination service. The available permissions depend on the type of PAM service, such as database, SSH, Kubernetes, or Amazon S3.

For more information about Tailscale PAM grants, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

\[Missing snippet: visual\_policy\_editor.mdx]

### `setec`

[`setec`][xt-gh-setec] is an open source secrets management tool maintained by Tailscale and used in our production environments. You can use it to provide secure access to sensitive credentials across all of your tailnet users and applications.

The secrets capability (`tailscale.com/cap/secrets`) defines precisely which devices or users can perform which actions on specific secrets or secret paths. This provides a centralized and secure approach to managing sensitive information, such as API keys, credentials, and certificates, across your organization.

Configuration for the secrets capability centers on two key parameters:

* `action`: an array of permitted actions (`"get"`, `"put"`, `"info"`, `"activate"`, `"delete"`).
* `secret`: an array of secret path patterns that support wildcards (for example, `"dev/*"`, `"prod/db/creds"`).

Path patterns support flexible wildcards, allowing you to group secrets logically and assign permissions at the appropriate level of granularity. Different groups can have different permission levels, enabling a least-privilege approach to secrets management.

```json
"grants": [
  {
    "src": ["group:developers"],
    "dst": ["tag:app-servers"],
    "app": {
      "tailscale.com/cap/secrets": [
        {"action": ["get", "info"], "secret": ["dev/*"]}
      ]
    }
  },
  {
    "src": ["group:security"],
    "dst": ["tag:app-servers"],
    "app": {
      "tailscale.com/cap/secrets": [
        {"action": ["get", "put", "delete"], "secret": ["prod/api-keys/*"]}
      ]
    }
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

### TailSQL

[TailSQL][xt-gh-tailsql] is a SQL playground you can host in your tailnet.

TailSQL expects an application capability (`tailscale.com/cap/tailsql`) that defines a `src`, in the form of an array of allowed data sources such as `"main"` or `"self"`. This determines which data stores the granted device can query, providing control over access to potentially sensitive information about your tailnet's configuration and state.

```json
"grants": [
  {
    "src": ["group:eng"],
    "dst": ["tag:tailsql"],
    "app": {
      "tailscale.com/cap/tailsql": [
        {"src": ["main", "self"]}
      ]
    }
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Golink

[Golink][xt-gh-golink] is an internal link shortening and management service within your tailnet that lets teams create memorable shortcuts to frequently accessed URLs.

The Golink application capability (`tailscale.com/cap/golink`) expects an `admin` parameter set to `true` for any users or devices that should have elevated admin privileges in the service. You do not need to specify an application capability to provide basic access to Golink to your users.

```json
"grants": [
  {
    "src": ["group:managers"],
    "dst": ["tag:golink-server"],
    "app": {
      "tailscale.com/cap/golink": [{"admin": true}]
    }
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

## Custom capabilities

You can create custom application capabilities for your own applications by integrating with Tailscale using [tsnet][docs-tsnet], the [`tailscale whois`][docs-cli-whois] CLI command, the `tailscale serve` [application capabilities header][docs-serve-app-capabilities] or [LocalAPI][xt-tailscale-localapi]. Custom capabilities let you define permissions for your own applications that go beyond network-level access control, letting you specify exactly what actions users can perform within your apps after they have network access.

Tailscale offers four approaches for integrating app capabilities with your applications:

* [**`tsnet`**][docs-tsnet] is a Go library that lets you embed Tailscale in a Go application. Your application receives a Tailscale IP address and hostname with built-in HTTPS certificate management. The entire solution deploys as a single binary, making it ideal for microservices and internal tools that benefit from dedicated network identities. You can use `tsnet` to read the capabilities that are granted to devices that make requests to your application inside the tailnet.
* [**LocalAPI**][xt-tailscale-localapi] suits applications across any programming language. Your application can use the underlying host's Tailscale client to query application capabilities, requiring minimal architectural changes to add Tailscale functionality.
* [**`tailscale whois`**][docs-cli-whois] provides application capability data for any device in the tailnet. It's best to use the `tailscale whois` CLI command for debugging. When writing code that understands app capabilities, querying LocalAPI is usually a better choice for receiving app capability data.
* [**`tailscale serve`**][docs-serve-app-capabilities] lets you share an application that runs on a device in your tailnet, such as a website, with the rest of your tailnet. When other devices connect to the application, Serve can forward their capabilities to the application in a request header.

## Complete example with multiple capabilities

To demonstrate how multiple capabilities can work together in a comprehensive policy, this section provides a complete example of a tailnet policy file incorporating various capabilities for different user groups and resources.

The following example showcases a more comprehensive tailnet policy that combines multiple capabilities to create a complete access control system. This demonstrates using different capabilities together to implement sophisticated permission models tailored to specific organizational needs.

```json
{
  "groups": {
    "group:engineers": ["alice@example.com", "bob@example.com"],
    "group:devops": ["charlie@example.com", "dave@example.com"],
    "group:analysts": ["eve@example.com"]
  },

  "tagOwners": {
    "tag:server": ["group:devops"],
    "tag:k8s-cluster": ["group:devops"],
    "tag:k8s-recorder": ["group:devops"],
    "tag:grafana": ["group:devops"]
  },

  "grants": [
    // Engineers can share files among themselves
    {
      "src": ["group:engineers"],
      "dst": ["group:engineers"],
      "app": {
        "tailscale.com/cap/drive": [{"shares": ["*"], "access": "rw"}]
      }
    },

    // DevOps can access Kubernetes clusters with recording
    {
      "src": ["group:devops"],
      "dst": ["tag:k8s-cluster"],
      "app": {
        "tailscale.com/cap/kubernetes": [
          {
            "recorders": ["tag:k8s-recorder"],
            "enforceRecorder": true,
            "impersonate": {
              "groups": ["system:masters"]
            }
          }
        ]
      }
    },

    // Engineers can access secrets in development
    {
      "src": ["group:engineers"],
      "dst": ["tag:server"],
      "app": {
        "tailscale.com/cap/secrets": [
          {"action": ["get", "info"], "secret": ["dev/*"]}
        ]
      }
    },

    // DevOps can manage all secrets
    {
      "src": ["group:devops"],
      "dst": ["tag:server"],
      "app": {
        "tailscale.com/cap/secrets": [
          {"action": ["get", "put", "info", "delete"], "secret": ["*"]}
        ]
      }
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example shows how you can assign different capabilities to different groups based on their roles and responsibilities. Engineers can share files among themselves and access development secrets. DevOps personnel have broader access, including Kubernetes cluster management with mandatory session recording and full secrets management. Analysts have limited access to Grafana dashboards in a viewer role, allowing them to access monitoring data without the ability to make changes. This layered approach to permissions demonstrates the flexibility and power of Tailscale's application capabilities.

[co-community-projects]: https://tailscale.com/community/community-projects

[docs-cli-whois]: /docs/reference/tailscale-cli#whois

[docs-kubernetes]: /docs/kubernetes

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-serve-app-capabilities]: /docs/features/tailscale-serve#app-capabilities-header

[docs-taildrive]: /docs/features/taildrive

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-pam]: /docs/privileged-access-management

[docs-tsnet]: /docs/features/tsnet

[xt-gh-golink]: https://github.com/tailscale/golink

[xt-gh-setec]: https://github.com/tailscale/setec

[xt-gh-tailsql]: https://github.com/tailscale/tailsql

[xt-tailscale-localapi]: https://pkg.go.dev/tailscale.com/ipn/localapi
