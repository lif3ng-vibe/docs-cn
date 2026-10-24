---
title: "Grant examples"
description: "[Grants][docs-grants] are the modern way to define access control rules in the [tailnet policy file][docs-tailnet-policy-file]. They replace the [legacy ACL format][docs-acls] with a more flexible and"
---

Last validated Jan 5, 2026

[Grants][docs-grants] are the modern way to define access control rules in the [tailnet policy file][docs-tailnet-policy-file]. They replace the [legacy ACL format][docs-acls] with a more flexible and feature-rich syntax.

This topic provides a comprehensive collection of grant examples for Tailscale tailnet policies, organized from simplest to most complex scenarios. Each example includes context, the complete configuration (as notes or a complete tailnet policy file), and implementation notes to help you understand how to apply similar patterns in your environment.

| Example                                                                                                                       | Description                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Allow all][ar-allow-all]                                                                                                     | Provides the default policy that lets all connections between devices in your tailnet. Devices shared from another network can only respond to incoming connections.          |
| [Allow users access to their own devices][ar-allow-users-access-to-their-own-devices]                                         | Enables members of your tailnet to access their own devices. This is a basic access control setup focusing on self-device management.                                         |
| [Allow using exit nodes][ar-allow-using-exit-nodes]                                                                           | Permits all members of your tailnet to route internet traffic through any available exit nodes.                                                                               |
| [Allow based on purpose using tags][ar-allow-based-on-purpose-using-tags]                                                     | Enforces communication boundaries between application components, allowing traffic only between adjacent tiers for secure multi-tier applications.                            |
| [Allow access to different environments by group][ar-allow-access-to-different-environments-by-group]                         | Implements group-based access control with port restrictions for shared resources, giving different teams varying privilege levels.                                           |
| [Route traffic through exit nodes based on location][ar-route-traffic-through-exit-nodes-based-on-location]                   | Segments exit node usage based on user geographical location, directing users to use exit nodes closest to them for optimal performance.                                      |
| [Allow access to resources based on device posture][ar-allow-access-to-resources-based-on-device-posture]                     | Controls access to resources through different subnet routers based on device compliance, ensuring only compliant devices can access sensitive resources.                     |
| [Route group traffic through app connectors][ar-route-group-traffic-through-app-connectors]                                   | Segments application access through specific app connectors for different user groups, providing secure access to applications without direct exposure.                       |
| [Customize `autogroup:internet`][ar-customize-autogroup-internet]                                                             | Creates custom internet access rules using IP sets and routes traffic through specific subnet routers, allowing more granular control over external resource access.          |
| [Allow access to different environments using device posture][ar-allow-access-to-different-environments-using-device-posture] | Controls access to different infrastructure environments based on device security posture, enforcing stricter security for more sensitive environments.                       |
| [Allow access to Kubernetes Operator with privileges][ar-allow-access-to-kubernetes-operator-with-privileges]                 | Manages Kubernetes Operator access with different privilege levels, granting administrative or read-only access to different users through Tailscale's Kubernetes capability. |
| [Application peering][ar-application-peering]                                                                                 | Enables connections between applications across cloud providers and SaaS applications, allowing secure service-to-service communication across environments.                  |
| [CI/CD development pipeline][ar-ci-cd-development-pipeline]                                                                   | Restricts access to deployment pipeline components based on team roles, securing the deployment pipeline while enabling automated deployments.                                |
| [Monitor application access][ar-monitor-application-access]                                                                   | Enables monitoring server access to services on specific ports across the tailnet, balancing observability needs with security.                                               |
| [Network microsegmentation][ar-network-microsegmentation]                                                                     | Implements logical tailnet segmentation with support team access across segments, limiting the blast radius of potential security incidents.                                  |
| [VPC access][ar-vpc-access]                                                                                                   | Enables developer access to VPC resources with subnet peering capabilities, providing secure access to cloud resources without public exposure.                               |
| [Use Tailscale Peer Relays][ar-use-tailscale-peer-relays]                                                                     | Enables devices in your tailnet to act as high-throughput relay servers.                                                                                                      |

## Allow all

| Availability            | Related concepts      |
| ----------------------- | --------------------- |
| [All plans][co-pricing] | [grants][docs-grants] |

This example represents the most permissive default policy for a Tailscale tailnet (known as a [tailnet][docs-tailnet]). Use this when you want minimal restrictions for a trusted environment, such as for small teams or personal tailnets where all devices should freely communicate with each other. This example is often used as a starting point before implementing more restrictive policies.

```json
{
  "grants": [
    {
      "src": ["*"],
      "dst": ["*"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example uses wildcards for all three key parameters. The source (`src`) wildcard lets any device or user start connections. The destination (`dst`) wildcard permits connections to any device in the tailnet. The IP protocol (`ip`) wildcard lets all types of traffic, including TCP, UDP, and ICMP on any port.

> **Note:**
>
> Even with this permissive policy, devices [shared][docs-sharing] with you from another tailnet cannot access devices in your tailnet. Shared devices can only respond to incoming connections from your tailnet, not start them.

## Allow users access to their own devices

| Availability            | Related concepts                                             |
| ----------------------- | ------------------------------------------------------------ |
| [All plans][co-pricing] | [autogroups][docs-targets-autogroups], [grants][docs-grants] |

This example implements a basic form of user isolation while maintaining self-access using [autogroups][docs-targets-autogroups]. It's an excellent starting point for implementing the [principle of least privilege][ln-principle-of-least-privilege] while ensuring users can still access their remote workstations, servers, or other personal resources. This approach is suitable for organizations where data separation between users is important.

```json
{
  "grants": [
    {
      "src": ["autogroup:member"],
      "dst": ["autogroup:self"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

The `autogroup:member` source represents all authenticated users in your tailnet, while `autogroup:self` dynamically refers to devices owned by the connecting user. This creates natural isolation between users while maintaining full self-access. You don't need to create [custom groups][docs-targets-groups] because these autogroups are built into Tailscale.

This example prevents lateral movement between user devices but does not establish rules for shared resources. To allow access to common resources like file servers, you would need to add additional grants with appropriate [tags][docs-tags] or [groups][docs-targets-groups]. This example also doesn't prevent a user from accessing another user's device if they are explicitly invited through Tailscale [sharing][docs-sharing].

## Allow using exit nodes

| Availability            | Related concepts                                             |
| ----------------------- | ------------------------------------------------------------ |
| [All plans][co-pricing] | [autogroups][docs-targets-autogroups], [grants][docs-grants] |

This example uses [autogroups][docs-targets-autogroups] to enable users to route their internet traffic through [exit nodes][docs-exit-nodes] in your tailnet. This is particularly useful for accessing region-restricted content, protecting traffic on untrusted tailnets, or maintaining a consistent outbound IP address. You can configure exit nodes on dedicated servers, cloud instances, or even personal devices (such as Apple TVs) with sufficient bandwidth.

```json
{
  "grants": [
    {
      "src": ["autogroup:member"],
      "dst": ["autogroup:internet"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

The `autogroup:member` source lets all authenticated users in your tailnet use exit nodes. The `autogroup:internet` destination represents all possible internet destinations outside your tailnet. The wildcard IP protocol lets all types of traffic route through the exit nodes.

> **Warning:**
>
> For this example to be effective, you must have at least one device in your tailnet configured as an [exit node][docs-exit-nodes]. This grant only permits the routing relationship; you still need to configure and approve exit nodes separately in the Tailscale admin console or through device configuration. Users will also need to select the exit node in their Tailscale client settings to use the exit node.

## Allow based on purpose using tags

| Availability            | Related concepts                          |
| ----------------------- | ----------------------------------------- |
| [All plans][co-pricing] | [grants][docs-grants],  [tags][docs-tags] |

This example enforces communication boundaries between application components, ensuring each tier can only communicate with adjacent tiers. It's ideal for implementing [zero-trust architectures][docs-zero-trust] where you want strict control over the flow of traffic between application layers. This approach is commonly used in multi-tier applications like web services with frontend, backend, and database components.

```json
{
  "grants": [
    {
      "src": ["tag:frontend"],
      "dst": ["tag:backend"],
      "ip": ["*"]
    },
    {
      "src": ["tag:backend"],
      "dst": ["tag:logging"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

The first grant lets devices tagged as `frontend` communicate with devices tagged as `backend`. The second grant lets `backend` devices communicate with `logging` services. This creates a directed flow of traffic that matches the intended application architecture, preventing devices from bypassing intermediate layers.

To implement this example, you need to define the [tags][docs-tags] using the `tagOwners` section in your tailnet policy file to control who can assign these tags to devices. You also need to explicitly tag each device with its appropriate role.

## Allow access to different environments by group

| Availability            | Related concepts                                                        |
| ----------------------- | ----------------------------------------------------------------------- |
| [All plans][co-pricing] | [grants][docs-grants], [groups][docs-targets-groups], [tags][docs-tags] |

This example implements [group][docs-targets-groups]-based access control with port restrictions. It's commonly used when you have shared resources (like internal tools) that different teams need to access, but with varying privilege levels. This approach enables precise control over which protocols and ports each group can use, balancing accessibility with security.

```json
{
  "grants": [
    {
      "src": ["group:eng"],
      "dst": ["tag:internal-tools"],
      "ip": ["*"]
    },
    {
      "src": ["group:sales"],
      "dst": ["tag:internal-tools"],
      "ip": ["tcp:443", "tcp:22"]
    },
    {
      "src": ["*"],
      "dst": ["tag:dns"],
      "ip": ["udp:53"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

The first grant gives the engineering team (`group:eng`) unrestricted access to internal tools, allowing all protocols and ports. The second grant provides limited access to the sales team (`group:sales`), restricting them to only HTTPS (port `443`) and SSH (port `22`). The third grant ensures everyone in the tailnet can access DNS services (UDP port `53`).

To implement this example, you need to define the [groups][docs-targets-groups] and [tags][docs-tags] referenced in your tailnet policy file. The groups would list the email addresses of team members, while the tags would be applied to the relevant devices. This approach requires ongoing maintenance as team memberships change. Consider implementing automation for group management if your organization has frequent personnel changes or a large number of users.

## Route traffic through exit nodes based on location

| Availability            | Related concepts                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [All plans][co-pricing] | [`autogroups`][docs-targets-autogroups], [`grants`][docs-grants], [`groups`][docs-targets-groups], [`tags`][docs-tags], [`via`][docs-via] |

This example segments exit node usage based on user geographical location. When you have exit nodes in different locations, you might want to direct users to use the exit node closest to them for optimal performance. This approach helps ensure users connect through exit nodes in appropriate jurisdictions for compliance purposes or to optimize tailnet latency.

```json
{
  "grants": [
    {
      "src": ["group:nyc"],
      "dst": ["autogroup:internet"],
      "via": ["tag:exit-node-nyc"],
      "ip": ["*"]
    },
    {
      "src": ["group:sea"],
      "dst": ["autogroup:internet"],
      "via": ["tag:exit-node-sea"],
      "ip": ["*"]
    },
    {
      "src": ["group:eng"],
      "dst": ["autogroup:internet"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example uses the `via` field to force traffic through specific devices (this is known as [route filtering][docs-via]). Users in the Toronto office (`group:tor`) and Seattle office (`group:sea`) must use exit nodes in their respective locations, while the engineering team (`group:eng`) can use any exit node or connect directly. This example enforces the routing path without requiring users to manually select the appropriate exit node.

For this example to work, you need to define the referenced groups in your policy and tag the appropriate exit nodes. Each exit node must also be properly configured in the Tailscale admin console. Without the `via` field, users could choose any available exit node, potentially leading to suboptimal routing or compliance issues.

> **Warning:**
>
> If a specified exit node becomes unavailable, users in that group will not be able to access the internet through Tailscale until the exit node becomes available, or you update the policy.

## Allow access to resources based on device posture

| Availability            | Related concepts                                                                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [All plans][co-pricing] | [`autogroups`][docs-targets-autogroups], [`grants`][docs-grants], [`groups`][docs-targets-groups], [`postures`][docs-device-posture], [`srcPosture`][docs-device-posture], [`tags`][docs-tags], [`via`][docs-via] |

This example controls access to resources through different [subnet routers][docs-subnets] based on device compliance. [Device posture][docs-device-posture] checks ensure that only compliant devices can access sensitive resources. This approach demonstrates controlling subnet access based on device security status, allowing direct access for compliant devices while routing others through controlled gateways.

```json
{
  "postures": {
    "posture:latestMac": [
      "node:os == 'macos'",
      "node:osVersion == '13.4.0'",
      "node:tsReleaseTrack == 'stable'"
    ]
  },
  "grants": [
    {
      "src": ["group:eng"],
      "srcPosture": ["posture:latestMac"],
      "dst": ["192.0.2.0/24"],
      "ip": ["*"]
    },
    {
      "src": ["autogroup:member"],
      "dst": ["192.0.2.0/24"],
      "via": ["tag:office-router"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

The example defines a posture check called `posture:latestMac` that verifies the device is running macOS Ventura 13.4.0 with a stable [Tailscale client version][docs-versions]. The first grant lets engineering team members with compliant devices access the subnet directly. The second grant routes all other users through the office router, adding an additional security layer for non-compliant devices.

To implement this example, you need to define the posture check parameters, create the referenced [group][docs-targets-groups], and [tag][docs-tags] at least one device as the office subnet router. The posture checks evaluate in real-time, allowing automatic privilege adjustment as device status changes.

> **Warning:**
>
> This example requires careful maintenance of the posture requirements as OS and Tailscale versions evolve. Setting version requirements too restrictively could accidentally block legitimate users who haven't yet updated their systems.

## Route group traffic through app connectors

| Availability            | Related concepts                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [All plans][co-pricing] | [`autogroups`][docs-targets-autogroups], [`grants`][docs-grants], [`groups`][docs-targets-groups], [`tags`][docs-tags], [`via`][docs-via] |

This example segments application access through specific [app connectors][docs-app-connectors] for different user groups. App connectors provide secure access to specific applications without exposing them directly to users. This approach ensures that users can only access certain applications through designated secure channels, adding authentication and monitoring points in the connection path.

```json
{
  "grants": [
    {
      "src": ["group:github-users"],
      "dst": ["autogroup:internet"],
      "ip": ["*"],
      "via": ["tag:github-appconnector"]
    },
    {
      "src": ["group:salesforce-users"],
      "dst": ["autogroup:internet"],
      "ip": ["*"],
      "via": ["tag:salesforce-appconnector"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example directs different user groups through different app connectors based on their service needs. Users in the `github-users` group must go through the GitHub app connector, while `salesforce-users` must go through the Salesforce app connector. The `via` field enforces these routing paths, ensuring traffic uses the secure connection method.

For this example to work, you need to define the user groups and set up the app connectors with appropriate tags. You must also configure each app connector for its specific application.

> **Warning:**
>
> This example requires maintaining separate connectors for each application, which can increase operational overhead but provides strong security isolation. If an app connector fails, users will lose access to that application until the connector becomes available, or you update the policy.

## Customize autogroup internet

| Availability            | Related concepts                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [All plans][co-pricing] | [`grants`][docs-grants], [`groups`][docs-targets-groups], [`ipsets`][docs-ipsets], [`tags`][docs-tags], [`via`][docs-via] |

This example creates custom internet access rules using [IP sets][docs-ipsets] and routes traffic through specific [subnet routers][docs-subnets]. Sometimes you need more granular control over which external resources users can access. This approach lets you define custom subsets of internet addresses and apply different routing rules to each subset, useful for excluding specific services from general internet access rules.

```json
{
  "ipsets": {
    "ipset:internet": [
      "add autogroup:internet",
      "remove ipset:cdn-edge",
      "remove ipset:partner-net"
    ],
    "ipset:cdn-edge": ["198.51.100.6", "198.51.100.7", "198.51.100.13", "198.51.100.14"],
    "ipset:partner-net": ["203.0.113.0/24"]
  },
  "grants": [
    {
      "src": ["group:sea"],
      "dst": ["ipset:internet"],
      "ip": ["*"],
      "via": ["tag:officerouter-sea"]
    },
    {
      "src": ["group:lon"],
      "dst": ["ipset:internet"],
      "ip": ["*"],
      "via": ["tag:officerouter-lon"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example creates a custom `ipset:internet` that includes all internet addresses except specific CDN edge nodes and partner networks. The IP set definitions use `add` and `remove` operations to compose the final set. Users in Seattle (`group:sea`) and London (`group:lon`) are routed through their respective office routers to access this customized internet definition.

To implement this example, you need to define the IP sets with the appropriate network addresses, create user groups for different locations, and tag the office routers accordingly. This example requires careful management of IP address lists, especially if the excluded networks change frequently. Consider using automation to keep these IP sets updated if they reference dynamic cloud resources or frequently changing partner networks.

## Allow access to different environments using device posture

| Availability            | Related concepts                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [All plans][co-pricing] | [`grants`][docs-grants], [`groups`][docs-targets-groups], [`ipsets`][docs-ipsets], [`postures`][docs-device-posture], [`srcPosture`][docs-device-posture], [`tags`][docs-tags], [`via`][docs-via] |

This example controls access to different infrastructure environments based on device security posture. In environments with multiple stages (development, staging, production), you often want stricter security requirements for accessing more sensitive environments. This approach enforces progressive security postures based on environment sensitivity.

```json
{
  "grants": [
    {
      "src": ["group:devs"],
      "dst": ["ipset:prod-infra"],
      "ip": ["*"],
      "via": ["tag:prod-connector"],
      "srcPosture": ["posture:strict-mac"]
    },
    {
      "src": ["group:devs"],
      "dst": ["ipset:stg-infra"],
      "ip": ["*"],
      "via": ["tag:stg-connector"],
      "srcPosture": ["posture:semi-strict-mac"]
    },
    {
      "src": ["group:devs"],
      "dst": ["ipset:dev-infra"],
      "ip": ["*"],
      "via": ["tag:dev-connector"],
      "srcPosture": ["posture:any-mac"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example routes developer traffic through different app connectors based on the destination environment and the device's security [posture][docs-device-posture]. Production infrastructure requires the strictest device security policy, staging has moderate requirements, and development has minimal requirements. Users access each environment through a dedicated connector that can implement additional security controls.

To implement this example, you need to define the posture checks, IP sets for each environment, and tag the appropriate connector devices. The referenced postures, IP sets, groups, and tags that you need to define elsewhere in your tailnet policy file. This example provides defense in depth by combining device security validation with network path control. Maintaining separate security posture definitions requires careful coordination when updating requirements to avoid accidentally blocking access to critical environments.

## Allow access to the Kubernetes Operator with privileges

| Availability            | Related concepts                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------- |
| [All plans][co-pricing] | app, [`grants`][docs-grants], [`groups`][docs-targets-groups], [`tags`][docs-tags] |

This example manages [Kubernetes Operator][docs-kubernetes-operator] access with different privilege levels. When running Kubernetes clusters in your tailnet, you might want to grant different users different levels of access. This example shows how to grant administrative privileges to the production team and read-only access to other users through Tailscale's Kubernetes capability.

```json
{
  "grants": [
    {
      "src": [
        "group:prod"
      ],
      "dst": [
        "tag:k8s-operator"
      ],
      "app": {
        "tailscale.com/cap/kubernetes": [
          {
            "impersonate": {
              "groups": [
                "system:masters"
              ]
            }
          }
        ]
      }
    },
    {
      "src": [
        "group:k8s-readers"
      ],
      "dst": [
        "tag:k8s-operator"
      ],
      "app": {
        "tailscale.com/cap/kubernetes": [
          {
            "impersonate": {
              "groups": [
                "tailnet-readers"
              ]
            }
          }
        ]
      }
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example uses the `app` field to grant specific Kubernetes capabilities. The production team (`group:prod`) can impersonate the `system:masters` group with admin privileges, while the readers group (`group:k8s-readers`) can only impersonate the `tailnet-readers` group with read-only access. You must tag the Kubernetes Operator device with `tag:k8s-operator`.

To implement this example, you need to define the user [groups][docs-targets-groups] and [tag][docs-tags] the Kubernetes Operator device. You also need to configure the Kubernetes cluster to recognize the impersonated groups and grant them appropriate permissions. This example lets you manage Kubernetes access through Tailscale without modifying the underlying Kubernetes configuration. The `tailnet-readers` group must exist in your Kubernetes configuration with appropriate read-only permissions for this to work properly.

## Application peering

| Availability            | Related concepts                                                               |
| ----------------------- | ------------------------------------------------------------------------------ |
| [All plans][co-pricing] | [`grants`][docs-grants], [`groups`][docs-targets-groups],  [`tags`][docs-tags] |

> **Tip:**
>
> Application peering refers to establishing a bidirectional peer-to-peer connection between two applications or application environments.

This example enables connections between applications across cloud providers and SaaS applications. This approach is useful for connecting applications or services across multiple cloud environments. For example, you might want to stream data between databases in different cloud providers or enable secure service-to-service communication across environments without exposing services publicly.

```json
{
  "groups": {
    "group:infra": ["carl@example.com"]
  },
  "grants": [
    {
      "src": ["tag:database", "tag:gcp", "tag:aws"],
      "dst": ["tag:database"],
      "ip": ["*"]
    }
  ],
  "tagOwners": {
    "tag:database": ["group:infra"],
    "tag:gcp": ["group:infra"],
    "tag:aws": ["group:infra"]
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example enables bidirectional communication between databases and lets devices tagged with cloud provider tags access the databases. The infrastructure team (`group:infra`) can manage which devices get which [tags][docs-tags], giving them control over which services can communicate. This example uses a combination of tags to identify both the function of a device (`database`) and its environment (`gcp`, `aws`).

To implement this example, you need to define the infrastructure team group and apply appropriate tags to your cloud resources. Each cloud resource needs a running Tailscale client to join the tailnet. This example creates a secure overlay tailnet across cloud providers without requiring complex VPN configurations or public IP exposure.

> **Warning:**
>
> Be aware that this example lets any device with the `database` tag to communicate with any other database, which might be too permissive for environments with strict data isolation requirements.

## CI/CD development pipeline

| Availability            | Related concepts                                                               |
| ----------------------- | ------------------------------------------------------------------------------ |
| [All plans][co-pricing] | [`grants`][docs-grants], [`groups`][docs-targets-groups],  [`tags`][docs-tags] |

This example restricts access to deployment pipeline components based on team roles. DevOps and SRE (site reliability engineering) teams often need to secure deployment pipelines, ensuring that developers can access development tools while restricting production access to the DevOps team. This setup creates appropriate boundaries in your software delivery process while enabling automated deployments.

```json
{
  "groups": {
    "group:dev": ["alice@example.com", "bob@example.com"],
    "group:devops": ["carl@example.com"]
  },
  "grants": [
    {
      "src": ["group:dev"],
      "dst": ["tag:dev"],
      "ip": ["*"]
    },
    {
      "src": ["group:devops"],
      "dst": ["tag:ci", "tag:prod"],
      "ip": ["*"]
    }
  ],
  "tagOwners": {
    "tag:ci": ["group:devops"],
    "tag:dev": ["group:devops", "tag:ci"],
    "tag:prod": ["group:devops", "tag:ci"]
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example separates access to development, CI/CD, and production environments. Developers can access development resources, while the DevOps team can access build tools and production. The interesting part is that devices [tagged][docs-tags] with `tag:ci` can also manage device tags, enabling automated deployment processes to tag resources appropriately as they progress through environments.

To implement this example, you need to define the developer and DevOps groups and tag the appropriate resources in each environment. This example provides a balance between security separation and automation capabilities. The CI/CD system can manage tags, allowing it to handle the entire deployment pipeline without direct human intervention. This approach does require careful security around the CI/CD system itself, as it has elevated privileges in the tailnet.

## Monitor application access

| Availability            | Related concepts                                                              |
| ----------------------- | ----------------------------------------------------------------------------- |
| [All plans][co-pricing] | [`grants`][docs-grants], [`groups`][docs-targets-groups], [`tags`][docs-tags] |

This example enables monitoring server access to services on specific ports across the tailnet. DevOps or SRE teams often need monitoring tools to query logs and metrics from services in the tailnet. This approach lets monitoring servers to access specific application ports without granting full tailnet access, balancing observability needs with security.

```json
{
  "groups": {
    "group:devops": ["carl@example.com"]
  },
  "grants": [
    {
      "src": ["tag:monitoring"],
      "dst": ["tag:logging"],
      "ip": ["80", "443", "9100"]
    },
    {
      "src": ["group:devops"],
      "dst": ["tag:monitoring", "tag:logging"],
      "ip": ["*"]
    }
  ],
  "tagOwners": {
    "tag:monitoring": ["group:devops"],
    "tag:logging": ["group:devops"]
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example lets monitoring servers access specific ports (HTTP, HTTPS, and Prometheus node exporter) on logging devices. The DevOps team has full access to both monitoring and logging infrastructure and can manage which devices have [tags][docs-tags] for these roles. This creates a clean separation between the monitoring infrastructure and the monitored services.

To implement this example, you need to define the DevOps group and tag the appropriate devices for monitoring and logging roles. This example restricts monitoring access to only the necessary ports, reducing the attack surface while maintaining observability. You should tailor the port restrictions to your specific monitoring tools and protocols.

**Note:** This approach might require updates as monitoring requirements change or new monitoring ports are introduced.

## Network microsegmentation

| Availability            | Related concepts                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [All plans][co-pricing] | [`grants`][docs-grants], [`groups`][docs-targets-groups],  [`tags`][docs-tags], [autogroups][docs-targets-autogroups] |

> **Tip:**
>
> [Network microsegmentation][ln-network-microsegmentation] involves dividing a tailnet into small, isolated segments to enhance security and limit the spread of potential attacks.

This example implements logical tailnet segmentation with support team access across segments. Network microsegmentation divides your tailnet into logical units for security purposes, limiting the blast radius of potential security incidents. Each segment exists in isolation, but support teams might need controlled access across segments.

```json
{
  "grants": [
    {
      "src": ["group:support"],
      "dst": ["tag:segment-abc", "tag:segment-xyz"],
      "ip": ["443"]
    },
    {
      "src": ["tag:support"],
      "dst": ["tag:segment-abc", "tag:segment-xyz"],
      "ip": ["443"]
    }
  ],
  "groups": {
    "group:support": ["alice@example.com", "bob@example.com"]
  },
  "tagOwners": {
    "tag:support": ["autogroup:admin"]
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example creates isolated tailnet segments with controlled cross-segment access. Support team members and devices tagged for support can access both segments, but only on port `443` (HTTPS). This lets the support team access web interfaces and APIs in each segment without granting broader access to all protocols.

To implement this example, you need to define the support team [group][docs-targets-groups], [tag][docs-tags] devices in each segment, and tag support tools. [Admin](/docs/reference/user-roles)s can assign the support tag to devices as needed. This example does not define communication within each segment; you would need additional grants to let devices within a segment to communicate with each other. This approach provides strong isolation with controlled exceptions for support access, reducing the risk of lateral movement during security incidents.

## VPC access

| Availability            | Related concepts                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [All plans][co-pricing] | [`grants`][docs-grants], [`groups`][docs-targets-groups], [`tags`][docs-tags], [`autogroups`][docs-targets-autogroups], [`autoApprovers`][docs-policy-syntax-autoapprovers] |

This example enables developer access to VPC resources with [subnet][docs-subnets] peering capabilities. When your organization uses VPCs in cloud providers, you might want to let developers access these resources while maintaining proper subnet isolation and routing. This approach is particularly useful for secure access to cloud resources without public exposure.

```json
{
  "groups": {
    "group:dev": ["alice@example.com", "bob@example.com"]
  },
  "grants": [
    {
      "src": ["autogroup:admin"],
      "dst": ["tag:vpc-peering:*"],
      "ip": ["*"]
    },
    {
      "src": ["group:dev", "192.0.2.0/24", "198.51.100.0/24"],
      "dst": ["192.0.2.0/24:*", "198.51.100.0/24:*"],
      "ip": ["*"]
    }
  ],
  "tagOwners": {
    "tag:vpc-peering": ["autogroup:admin"]
  },
  "autoApprovers": {
    "routes": {
      "192.0.2.0/24": ["tag:vpc-peering", "autogroup:admin"],
      "198.51.100.0/24": ["tag:vpc-peering", "autogroup:admin"]
    }
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example enables bidirectional communication between two VPC subnets and grants developers access to both. [Admin](/docs/reference/user-roles)s can access and manage the VPC peering devices. The `autoApprovers` section automatically approves subnet routes for the VPCs, eliminating the need for manual approval in the Tailscale admin console.

To implement this example, you need to define the developer [group][docs-targets-groups], [tag][docs-tags] the VPC peering devices, and configure [subnet routing][docs-subnets]. For this to work properly with subnet routing, you might need to disable subnet route masquerading to allow direct communication between subnets. This example lets both human users and devices within the subnets communicate with each other, enabling complex hybrid cloud architectures. This example requires careful management of subnet addressing to avoid conflicts and proper configuration of cloud tailnet settings.

You can also use [auto approvers][docs-policy-syntax-autoapprovers] to automatically approve routes.

## Use Tailscale Peer Relays

| Availability            | Related concepts                                   |
| ----------------------- | -------------------------------------------------- |
| [All plans][co-pricing] | [peer relays][docs-peer-relays], [tags][docs-tags] |

The following example lets all devices with the tag `tag:us-east-vpc` use [Tailscale Peer Relays][docs-peer-relays] tagged with `tag:us-east-relays` as underlay network relays when communicating with other devices in the tailnet. That means that other devices in the tailnet can use a device tagged with `tag:us-east-relays` as an underlay network relay when communicating with devices tagged with `tag:us-east-vpc`. It uses the `tailscale.com/cap/relay` [application capability][docs-grant-app-capabilities] to enable peer relay functionality.

```json
{
  "grants": [
    {
      "src": ["tag:us-east-vpc"],
      "dst": ["tag:us-east-relays"],
      "app": {
        "tailscale.com/cap/relay": []
      }
    }
  ]
}
```

For this to work, you must also [configure the peer relay devices][docs-peer-relays-configure] using the `tailscale set` command and create a basic grant policy that permits overlay network access to devices with the `tag:us-east-vpc` tag. For example, this grant policy lets all members of the tailnet access devices with the `tag:us-east-vpc` tag on TCP ports 80 and 443.

```json
{
  "grants": [
    {
      "src": ["autogroup:member"],
      "dst": ["tag:us-east-vpc"],
      "ip": ["tcp:80","tcp:443"]
    }
  ]
}
```

## Conclusion

Remember that grants operate on a default-deny basis, so you must explicitly allow any connections you want to permit (unless you keep the default allow all policy). The flexibility of the grant system lets you implement granular access controls that follow security best practices while still enabling the connectivity your organization needs.

[ar-allow-access-to-different-environments-by-group]: #allow-access-to-different-environments-by-group

[ar-allow-access-to-different-environments-using-device-posture]: #allow-access-to-different-environments-using-device-posture

[ar-allow-access-to-kubernetes-operator-with-privileges]: #allow-access-to-the-kubernetes-operator-with-privileges

[ar-allow-access-to-resources-based-on-device-posture]: #allow-access-to-resources-based-on-device-posture

[ar-allow-all]: #allow-all

[ar-allow-based-on-purpose-using-tags]: #allow-based-on-purpose-using-tags

[ar-allow-users-access-to-their-own-devices]: #allow-users-access-to-their-own-devices

[ar-allow-using-exit-nodes]: #allow-using-exit-nodes

[ar-application-peering]: #application-peering

[ar-ci-cd-development-pipeline]: #cicd-development-pipeline

[ar-customize-autogroup-internet]: #customize-autogroup-internet

[ar-monitor-application-access]: #monitor-application-access

[ar-network-microsegmentation]: #network-microsegmentation

[ar-route-group-traffic-through-app-connectors]: #route-group-traffic-through-app-connectors

[ar-route-traffic-through-exit-nodes-based-on-location]: #route-traffic-through-exit-nodes-based-on-location

[ar-vpc-access]: #vpc-access

[ar-use-tailscale-peer-relays]: #use-tailscale-peer-relays

[co-pricing]: https://tailscale.com/pricing

[docs-acls]: /docs/features/access-control/acls

[docs-app-connectors]: /docs/features/app-connectors

[docs-device-posture]: /docs/features/device-posture

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grant-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants]: /docs/features/access-control/grants

[docs-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-peer-relays]: /docs/features/peer-relay

[docs-peer-relays-configure]: /docs/features/peer-relay#step-1

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-targets-autogroups]: /docs/reference/targets-and-selectors#autogroups

[docs-targets-groups]: /docs/reference/targets-and-selectors#groups

[docs-versions]: /docs/reference/tailscale-client-versions

[docs-via]: /docs/features/access-control/grants/grants-via

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-network-microsegmentation]: https://tailscale.com/learn/network-microsegmentation

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege
