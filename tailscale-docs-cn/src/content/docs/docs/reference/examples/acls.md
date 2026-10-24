---
title: "ACL policy examples"
description: "This topic provides example [access controls (ACLs)][docs-acls] for common scenarios. For information about the syntax, refer to the [tailnet policy syntax][docs-policy-syntax]."
---

Last validated Feb 2, 2026

\[Missing snippet: acls\_legacy\_note.mdx]

\[Missing snippet: visual\_policy\_editor.mdx]

This topic provides example [access controls (ACLs)][docs-acls] for common scenarios. For information about the syntax, refer to the [tailnet policy syntax][docs-policy-syntax].

| **Example**                                                                                                               | **Description**                                                                                                                                                    | **Uses**                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Allow all][ar-allow-all-default-acl]                                                                                     | The default tailnet policy that lets all devices within the tailnet access other devices in the tailnet.                                                           | [ACLs][docs-acls], [SSH][docs-policy-syntax-ssh]                                                                                                       |
| [Deny all][ar-deny-all]                                                                                                   | Deny all connections.                                                                                                                                              | [ACLs][docs-acls]                                                                                                                                      |
| [Users can access their own devices][ar-users-can-access-their-own-devices]                                               | All tailnet users can access devices they own unless another policy prevents it.                                                                                   | [ACLs][docs-acls], [SSH][docs-policy-syntax-ssh]                                                                                                       |
| [Resource-level access policies][ar-resource-level-access-policies]                                                       | Allow specific devices to access specific resources within the tailnet.                                                                                            | [ACLs][docs-acls], [hosts][docs-policy-syntax-hosts]                                                                                                   |
| [Restrict based on purpose (tags)][ar-restrict-based-on-purpose-tags]                                                     | Allow specific devices to access specific resources within the tailnet using tags.                                                                                 | [ACLs][docs-acls]                                                                                                                                      |
| [Restrict based on group][ar-restrict-based-on-group]                                                                     | Manage access to resources using autogroups, custom groups, and provisioned groups.                                                                                | [ACLs][docs-acls], [groups][docs-policy-syntax-groups]                                                                                                 |
| [Restrict based on individual users][ar-restrict-based-on-individual-user]                                                | Manage access to resources for specific users.                                                                                                                     | [ACLs][docs-acls]                                                                                                                                      |
| [Standard plan ACL][ar-standard-plan-acl]                                                                                 | Use a basic standard plan that lets employees access their own devices and devices tagged with `corp` and lets admins access devices tagged with `corp` or `prod`. | [ACLs][docs-acls], [tag owners][docs-policy-syntax-tagowners]                                                                                          |
| [Access to an internal application (VPN)][ar-access-to-an-internal-application-vpn]                                       | Manage user access applications based on their job role.                                                                                                           | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tag owners][docs-policy-syntax-tagowners]                                                     |
| [Access to an internal application (VPN) with synced groups][ar-access-to-an-internal-application-vpn-with-synced-groups] | Manage access to internal resources using groups synced to an identity provider.                                                                                   | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tag owners][docs-policy-syntax-tagowners]                                                     |
| [Remote access to a production environment][ar-remote-access-to-production-environment]                                   | Manage user access to the production environment based on their job role.                                                                                          | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tag owners][docs-policy-syntax-tagowners], [tests][docs-policy-syntax-tests]                  |
| [VPC access (VPC peering)][ar-vpc-access-vpc-peering]                                                                     | Manage access to a virtual private cloud using access control lists.                                                                                               | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tag owners][docs-policy-syntax-tagowners], [auto approvers][docs-policy-syntax-autoapprovers] |
| [Share access with a contractor][ar-share-access-with-a-contractor]                                                       | Allow a third-party contractor to access shared resources in the development environment.                                                                          | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tag owners][docs-policy-syntax-tagowners]                                                     |
| [Remote development][ar-remote-development]                                                                               | Manage access to a remote development environment.                                                                                                                 | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tag owners][docs-policy-syntax-tagowners]                                                     |
| [Pair programming][ar-pair-programming]                                                                                   | Create a paired programming environment multiple engineers can connect to using SSH.                                                                               | [ACLs][docs-acls], [tag owners][docs-policy-syntax-tagowners]                                                                                          |
| [CI/CD deployment pipeline][ar-ci-cd-deployment-pipeline]                                                                 | Manage access to resources based on job roles.                                                                                                                     | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tag owners][docs-policy-syntax-tagowners]                                                     |
| [Monitoring access to applications][ar-monitoring-access-to-applications]                                                 | Allow a monitoring server to access all applications on common ports.                                                                                              | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tag owners][docs-policy-syntax-tagowners]                                                     |
| [Application peering][ar-application-peering]                                                                             | Allow multiple cloud providers or applications to access each other.                                                                                               | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tag owners][docs-policy-syntax-tagowners]                                                     |
| [Network microsegmentation][ar-network-microsegmentation]                                                                 | Allow access to network microsegments, but deny access between them.                                                                                               | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tag owners][docs-policy-syntax-tagowners], [tests][docs-policy-syntax-tests]                  |

## Allow all (default ACL)

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| All plans                       | [ACLs][docs-policy-syntax], [SSH][docs-policy-syntax-ssh], [autogroups][docs-policy-syntax-autogroups] |

When you first create your Tailscale network (known as a tailnet), Tailscale initializes it with a default *allow all* access policy so you can connect to and use Tailscale without restricting any traffic in your network.

You can reset your ACL policy file to the original default by deleting the existing policy file contents and selecting **Reset to default**. Policy file changes can also be [reverted][docs-edit-policies-reverted] from the [Configuration logs](https://console.tailscale.com/admin/logs) page of the admin console.

Here's a breakdown of what the default policy does:

* Lets all devices in the tailnet access all other devices in the tailnet.
* Lets all users establish a [Tailscale SSH][docs-tailscale-ssh] session to their own devices using [check mode][docs-tailscale-ssh-check-mode], as either root or non-root.
* If you have a [subnet router initialized with `--snat-subnet-routes=false`][docs-troubleshooting-disable-route-masquerading] (Linux only), then any devices on the same local network as the subnet router can also access all devices in the tailnet.
* If you have a [device shared from another network][docs-sharing-acl] in your tailnet, that device cannot access any devices in the tailnet. The device [can only respond to incoming connections][docs-sharing-quarantine] from the tailnet.

```json
{
  "acls": [
    {
      "action": "accept",
      "src": [
        "*"
      ],
      "dst": [
        "*:*"
      ]
    }
  ],
  "ssh": [
    {
      "action": "check",
      "src": [
        "autogroup:member"
      ],
      "dst": [
        "autogroup:self"
      ],
      "users": [
        "autogroup:nonroot",
        "root"
      ]
    }
  ],
}
```

> **Note:**
>
> Omitting the `acls` field from the tailnet policy file is equivalent to the default allow all policy. To deny all connections, [use an empty object for the `acls` field][ar-deny-all] in your policy file.
>
> ```json
> {} // Tailscale applies the default allow all policy if the acls section is empty.
> ```

In the default ACL, the `ssh` rule uses `autogroup:self` for the `dst` field and `autogroup:nonroot` in the `users` field. If you change the `dst` field from `autogroup:self` to some other destination, such as an [ACL tag](/docs/features/tags), also consider replacing `autogroup:nonroot` in the `users` field. If you don't remove `autogroup:nonroot` from the `users` field, then anyone permitted by the `src` setting will be able to SSH in as any nonroot user on the `dst` device.

## Deny all

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                   |
| ------------------------------- | -------------------------- |
| All plans                       | [ACLs][docs-policy-syntax] |

You can deny all connections in your tailnet by using an empty option for the `acls` field in your policy file. This configuration prevents all devices from communicating with each other. This configuration is not recommended for general use because nothing in the tailnet will work.

```json
{
  "acls": []
}
```

> **Warning:**
>
> Omitting the `acls` field from the tailnet policy file is not the equivalent of a "deny all" policy. Instead, Tailscale applies the [default allow all policy][ar-allow-all-default-acl], which lets all devices within the tailnet access other devices in the tailnet.

## Users can access their own devices

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners] |

This example lets all users access their own devices. It is suitable for many use cases where you want to allow users to access their own devices, but not other devices in the tailnet.

```json
{
  "acls": [
    {
      "action": "accept",
      "src": [
        "autogroup:member"
      ],
      "dst": [
        "autogroup:self:*"
      ]
    }
  ],
}
```

## Resource-level access policies

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                             |
| ------------------------------- | ---------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [hosts][docs-policy-syntax-hosts] |

You can enable connectivity from one device or network to another using their IP addresses. Additionally, the [`hosts`][docs-policy-syntax-hosts] section lets you define a human-friendly name for an IP address or CIDR range, to make access rules more readable.

What this example does:

* The device with the IP address `100.100.123.124` can access the device with the IP address `100.100.123.123`.
* The device with the IP address `100.100.123.124` can access devices in the subnet `192.0.2.0/24` through a [subnet router][docs-subnets].
* The device with the hostname `frontend-server-01` can access devices in the subnet `192.0.2.0/24`.
* The device with the hostname `frontend-server-01` can access the device with the hostname `dev-network-01`.

```json
{
  "acls": [
    {
      "action": "accept",
      "src": [
        "100.100.123.124"
      ],
      "dst": [
        "100.100.123.123:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "100.100.123.124"
      ],
      "dst": [
        "192.0.2.0/24:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "frontend-server-01"
      ],
      "dst": [
        "192.0.2.0/24:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "frontend-server-01"
      ],
      "dst": [
        "dev-network-01:*"
      ]
    }
  ],
  "hosts": {
    "frontend-server-01": "100.100.123.123",
    "dev-network-01": "203.0.113.0/24"
  }
}
```

> **Note:**
>
> When writing access control rules targeting resources behind a [4via6 subnet][docs-4via6-subnets] router, use the IPv6 CIDR or address as the destination, not the IPv4 address.
>
> Use `tailscale debug via` to get the IPv6 CIDR.

## Restrict based on purpose (tags)

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                             |
| ------------------------------- | ------------------------------------ |
| All plans                       | [ACLs][docs-acls], [tags][docs-tags] |

[Tags][docs-tags] let you assign an identity to a device that is separate from human users, and use that identity as part of an ACL to restrict access. Tags should be used when adding servers to your Tailscale network, so that their access is based on their purpose, not based on which member of your operations team enrolled them.

What this example does:

* Devices tagged with `tag:frontend` can access devices tagged with `tag:backend`.
* Devices tagged with `tag:backend` can access devices tagged with `tag:logging`.

```json
{
  "acls": [
    {
      "action": "accept",
      "src": [
        "tag:frontend"
      ],
      "dst": [
        "tag:backend:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "tag:backend"
      ],
      "dst": [
        "tag:logging:*"
      ]
    }
  ]
}
```

## Restrict based on group

\[Missing snippet: prefer\_grant\_examples.mdx]

You can enable access to resources in your tailnet with [autogroups][ar-autogroups], [custom groups][ar-custom-groups], or [groups provisioned from supported identity providers][ar-provisioned-groups].

### With autogroups

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [autogroups][docs-policy-syntax-autogroups], [tags][docs-tags] |

[Autogroups][docs-policy-syntax-autogroups] are built-in groups that automatically include users, destinations, or usernames with the same properties.

What this example does:

* All tailnet members `autogroup:member` can access devices tagged with `tag:frontend`.
* All Tailscale [Admins](/docs/reference/user-roles) (`autogroup:admin`) can access devices tagged with `tag:backend` or `tag:logging`.

```json
{
  "acls": [
    {
      "action": "accept",
      "src": [
        "autogroup:member"
      ],
      "dst": [
        "tag:frontend:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "autogroup:admin"
      ],
      "dst": [
        "tag:backend:*",
        "tag:logging:*"
      ]
    }
  ]
}
```

### With custom groups

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [autogroups][docs-policy-syntax-autogroups], [tags][docs-tags] |

[Custom groups][docs-policy-syntax-groups] let you define a shorthand for a group of users, which you can then use in access rules instead of listing users out explicitly.

What this example does:

* The Engineering team `group:engineering` consists of `alice@example.com` and `bob@example.com`.
* The DevOps team `group:engineering` consists of `amelie@example.com` and `carl@example.com`.
* The Engineering team `group:engineering` can access devices tagged with `tag:frontend` or `tag:backend`.
* The DevOps team `group:devops` can access devices tagged with `tag:frontend`, `tag:backend`, or `tag:logging`.

```json
{
  "groups": {
    "group:engineering": [
      "alice@example.com",
      "bob@example.com"
    ],
    "group:devops": [
      "amelie@example.com",
      "carl@example.com"
    ]
  },
  "acls": [
    {
      "action": "accept",
      "src": [
        "group:engineering"
      ],
      "dst": [
        "tag:frontend:*",
        "tag:backend:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "group:devops"
      ],
      "dst": [
        "tag:frontend:*",
        "tag:backend:*",
        "tag:logging:*"
      ]
    }
  ]
}
```

### With provisioned groups

\[Missing snippet: prefer\_grant\_examples.mdx]

You can use [group provisioning from supported identity providers][docs-user-group-provisioning] and avoid maintaining custom groups in your ACLs.

```json
{
  "acls": [
    {
      "action": "accept",
      "src": [
        "group:engineering@example.com"
      ],
      "dst": [
        "tag:frontend:*",
        "tag:backend:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "group:devops@example.com"
      ],
      "dst": [
        "tag:frontend:*",
        "tag:backend:*",
        "tag:logging:*"
      ]
    }
  ]
}
```

## Restrict based on individual user

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                             |
| ------------------------------- | ------------------------------------ |
| All plans                       | [ACLs][docs-acls], [tags][docs-tags] |

You can enable access to resources based on individual users.

What this example does:

* User Alice can access devices tagged with `tag:frontend`.
* User Bob can access devices tagged with `tag:backend`.

```json
{
  "acls": [
    {
      "action": "accept",
      "src": [
        "amelie@example.com"
      ],
      "dst": [
        "tag:frontend:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "bob@example.com"
      ],
      "dst": [
        "tag:backend:*"
      ]
    }
  ]
}
```

## Standard plan ACL

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [autogroups][docs-policy-syntax-autogroups], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners] |

This example provides remote access to corp and prod devices. It is suitable for many Standard plan use cases.

Your team can use Tailscale to access remote devices. In this scenario, all users can access their own remote devices, as well as any common corporate devices, such as servers, that are tagged. Only Tailscale [Admins](/docs/reference/user-roles) can access production devices. Admins can configure which devices are tagged. No corporate or production devices can access each other, and no shared users can access devices.

What this example does:

* All employees can access their own devices.
* All employees can access corporate devices tagged with `tag:corp`.
* All Tailscale [Admins](/docs/reference/user-roles) (`autogroup:admin`) can access devices tagged with `tag:prod`.
* All Tailscale [Admins](/docs/reference/user-roles) can manage which devices are tagged with `tag:corp` and `tag:prod`.

```json
{
  "acls": [
    {
      "action": "accept",
      "src": [
        "autogroup:member"
      ],
      "dst": [
        "autogroup:self:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "autogroup:member"
      ],
      "dst": [
        "tag:corp:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "autogroup:admin"
      ],
      "dst": [
        "tag:prod:*"
      ]
    }
  ],
  "tagOwners": {
    "tag:corp": [
      "autogroup:admin"
    ],
    "tag:prod": [
      "autogroup:admin"
    ]
  }
}
```

## Access to an internal application (VPN)

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners] |

You can use Tailscale to allow users to access internal applications, including both custom internal applications and third-party applications hosted internally. In this scenario, users in your tailnet can access applications based on their job role. The IT team can set up internal applications.

What this example does:

* Members of the engineering team `group:engineering` can access the devices tagged with `tag:engineering`.
* Members of the finance team `group:finance` can access the devices tagged with `tag:finance`.
* Members of the legal team `group:legal` can access the devices tagged with `tag:legal`.
* All employees can access the devices tagged with `tag:internal`.
* All Tailscale [Admins](/docs/reference/user-roles) (`autogroup:admin`) (such as the IT team) can manage which devices are tagged with `tag:engineering`, `tag:finance`, `tag:legal`, and `tag:internal`.

```json
{
  "groups": {
    "group:engineering": [
      "alice@example.com"
    ],
    "group:finance": [
      "bob@example.com"
    ],
    "group:legal": [
      "carl@example.com"
    ]
  },
  "acls": [
    {
      "action": "accept",
      "src": [
        "group:engineering"
      ],
      "dst": [
        "tag:engineering:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "group:finance"
      ],
      "dst": [
        "tag:finance:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "group:legal"
      ],
      "dst": [
        "tag:legal:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "autogroup:member"
      ],
      "dst": [
        "tag:internal:*"
      ]
    }
  ],
  "tagOwners": {
    "tag:engineering": [
      "autogroup:admin"
    ],
    "tag:finance": [
      "autogroup:admin"
    ],
    "tag:legal": [
      "autogroup:admin"
    ],
    "tag:internal": [
      "autogroup:admin"
    ]
  }
}
```

### Access to an internal application (VPN) with synced groups

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Enterprise                      | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [autogroups][docs-policy-syntax-autogroups], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners] |

You can use [user and group provisioning][docs-user-group-provisioning] to include groups synced from your identity provider in access rules. Tailscale treats synced group names as lowercase. They can include spaces, but not the `@` symbol.

What this example does:

* Members of the engineering team in the synced group `group:engineering@example.com` can access the devices tagged with `tag:engineering`.
* Members of the finance team in the synced group `group:finance team@example.com` can access the devices tagged with `tag:finance`.
* Members of the legal team in the synced group `group:Legal@example.com` can access the devices tagged with `tag:legal`.
* All employees can access the devices tagged with `tag:internal`.
* All Tailscale [Admins](/docs/reference/user-roles) (`autogroup:admin`) (such as the IT team) can manage which devices are tagged with `tag:engineering`, `tag:finance`, `tag:legal`, and `tag:internal`.

```json
{
  "groups": {},
  "acls": [
    {
      "action": "accept",
      "src": [
        "group:engineering@example.com"
      ],
      "dst": [
        "tag:engineering:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "group:finance team@example.com"
      ],
      "dst": [
        "tag:finance:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "group:legal@example.com"
      ],
      "dst": [
        "tag:legal:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "autogroup:member"
      ],
      "dst": [
        "tag:internal:*"
      ]
    }
  ],
  "tagOwners": {
    "tag:engineering": [
      "autogroup:admin"
    ],
    "tag:finance": [
      "autogroup:admin"
    ],
    "tag:legal": [
      "autogroup:admin"
    ],
    "tag:internal": [
      "autogroup:admin"
    ]
  }
}
```

## Remote access to production environment

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                                                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [autogroups][docs-policy-syntax-autogroups], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners], [tests][docs-policy-syntax-tests] |

Your DevOps, infrastructure, or SRE team can use Tailscale to access their sensitive and highly protected production environment. In this scenario, a DevOps team might be able to access the production environment, whereas other developers might only be able to access resources in a development environment. All developers are able to access monitoring tools, such as [Grafana][bl-grafana-auth].

What this example does:

* All employees can access their own devices (such as remote workstations).
* Members of the development team `group:dev` can access the devices tagged with `tag:dev` (such as license servers).
* All Tailscale [Admins](/docs/reference/user-roles) (`autogroup:admin`) (such as members of the DevOps team) can access the devices tagged with `tag:prod` (such as the production environment).
* All employees can access devices tagged with `tag:monitoring` on ports `80` and `443` (such as monitoring dashboards).
* All Tailscale [Admins](/docs/reference/user-roles) (`autogroup:admin`) can manage which devices are tagged with `tag:dev`, `tag:prod`, and `tag:monitoring`
* [Tests][docs-policy-syntax-tests] ensure that if ACLs change:
  * Carl will still be able to access devices tagged with `tag:prod` on port `80`.
  * Alice will still be able to access devices tagged with `tag:dev` (but not devices tagged with `tag:prod`) on port `80`.

```json
{
  "groups": {
    "group:dev": [
      "alice@example.com",
      "bob@example.com"
    ]
  },
  "acls": [
    {
      "action": "accept",
      "src": [
        "autogroup:member"
      ],
      "dst": [
        "autogroup:self:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "group:dev"
      ],
      "dst": [
        "tag:dev:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "autogroup:admin"
      ],
      "dst": [
        "tag:prod:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "autogroup:member"
      ],
      "dst": [
        "tag:monitoring:80,443"
      ]
    }
  ],
  "tagOwners": {
    "tag:monitoring": [
      "autogroup:admin"
    ],
    "tag:dev": [
      "autogroup:admin"
    ],
    "tag:prod": [
      "autogroup:admin"
    ]
  },
  "tests": [
    {
      "src": "carl@example.com",
      "accept": [
        "tag:prod:80"
      ]
    },
    {
      "src": "alice@example.com",
      "accept": [
        "tag:dev:80"
      ],
      "deny": [
        "tag:prod:80"
      ]
    }
  ]
}
```

## VPC access (VPC peering)

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                                                                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [autogroups][docs-policy-syntax-autogroups], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners], [auto approvers][docs-policy-syntax-autoapprovers] |

Your DevOps team can use Tailscale to allow developers to access existing internal applications running in a Virtual Private Cloud (VPC) on a private or hosted cloud provider. In this scenario, developers can access resources in the VPC, and the DevOps team is able to manage access to the VPC. VPCs can be peered to each other if they don't have [overlapping IP ranges][docs-4via6-subnets]. To connect an existing subnet to your Tailscale network without installing Tailscale on every device, you can use a [subnet router][docs-subnets]. Run a subnet router in the subnet, and advertise the routes so that Tailscale can route traffic for the subnet to the device for forwarding. For devices on a subnet to connect to devices in your tailnet, [disable subnet route masquerading][docs-troubleshooting-disable-route-masquerading]. You can also use [auto approvers][docs-policy-syntax-autoapprovers] to automatically approve routes.

What this example does:

* All Tailscale [Admins](/docs/reference/user-roles) (`autogroup:admin`) (such as the IT team) can access the devices tagged with `tag:vpc-peering` (for maintenance).
* Members of the development team `group:dev` can access devices in the subnets `192.0.2.0/24` and `198.51.100.0/24`.
* The subnet `192.0.2.0/24` can access the subnet `198.51.100.0/24` and vice versa (if [subnet route masquerading is disabled][docs-troubleshooting-disable-route-masquerading]).
* All Tailscale [Admins](/docs/reference/user-roles) (`autogroup:admin`) (such as the IT team) can manage which devices are tagged with `tag:vpc-peering`.
* All Tailscale [Admins](/docs/reference/user-roles) (`autogroup:admin`) and devices tagged with `tag:vpc-peering` can auto-approve routes for `192.0.2.0/24` and `198.51.100.0/24`.

```json
{
  "groups": {
    "group:dev": [
      "alice@example.com",
      "bob@example.com"
    ]
  },
  "acls": [
    {
      "action": "accept",
      "src": [
        "autogroup:admin"
      ],
      "dst": [
        "tag:vpc-peering:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "group:dev",
        "192.0.2.0/24",
        "198.51.100.0/24"
      ],
      "dst": [
        "192.0.2.0/24:*",
        "198.51.100.0/24:*"
      ]
    }
  ],
  "tagOwners": {
    "tag:vpc-peering": [
      "autogroup:admin"
    ]
  },
  "autoApprovers": {
    "routes": {
      "192.0.2.0/24": [
        "tag:vpc-peering",
        "autogroup:admin"
      ],
      "198.51.100.0/24": [
        "tag:vpc-peering",
        "autogroup:admin"
      ]
    }
  }
}
```

## Share access with a contractor

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| All plans                       | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [autogroups][docs-policy-syntax-autogroups], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners] |

Your development team can use Tailscale to share access to specific resources, such as a database or a hosted code repository, with a contractor. In this scenario, developers can access internal development resources. Specific devices can be [shared][docs-sharing] with a contractor as part of their job.

What this example does:

* All employees can access their own devices.
* Members of the development team `group:dev` can access devices tagged with `tag:dev` (such as package registries and databases)
* Contractors who have accepted a share invite can access devices tagged with `tag:dev` (that have been shared with them).

```json
{
  "groups": {
    "group:dev": [
      "alice@example.com",
      "bob@example.com"
    ]
  },
  "acls": [
    {
      "action": "accept",
      "src": [
        "autogroup:member"
      ],
      "dst": [
        "autogroup:self:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "group:dev",
        "autogroup:shared"
      ],
      "dst": [
        "tag:dev:*"
      ]
    }
  ],
  "tagOwners": {
    "tag:dev": [
      "group:dev"
    ]
  }
}
```

## Remote development

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| All plans                       | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [autogroups][docs-policy-syntax-autogroups], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners] |

Your development team can use Tailscale as part of their remote development setup. In this scenario, a developer might have a local device, like a laptop, and use it to access a remote workstation, hosted in the cloud or hosted on another device in their network. This is useful if you're accessing a workstation with more processing power, for example, for machine learning or for building. You might also use a remote code environment like [GitHub Codespaces][docs-github-codespaces], [Gitpod][docs-gitpod], or [Coder][docs-coder]. From your development environment, you might access a license server, a package registry, a production database, or another development or build resource. You might also access a self-hosted or private code repository.

What this example does:

* All employees can access their own devices.
* Members of the development team `group:dev` can access devices tagged with `tag:dev` (such as package registries and databases).
* The development team `group:dev` can manage which devices are tagged with `tag:dev`.

```json
{
  "groups": {
    "group:dev": [
      "alice@example.com",
      "bob@example.com"
    ]
  },
  "acls": [
    {
      "action": "accept",
      "src": [
        "autogroup:member"
      ],
      "dst": [
        "autogroup:self:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "group:dev"
      ],
      "dst": [
        "tag:dev:*"
      ]
    }
  ],
  "tagOwners": {
    "tag:dev": [
      "group:dev"
    ]
  }
}
```

## Pair programming

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners] |

Your development team can use Tailscale to pair program on the same device remotely. In this scenario, two or more developers can use SSH to connect to a corporate device, such as a virtual machine (VM), and share a terminal (such as a `tmux` session).

What this example does:

* Users Alice and Bob can access the corporate device tagged `tag:pair-programming` on port `22` (for SSH).
* Bob can manage which devices are tagged `tag:pair-programming`.

```json
{
  "acls": [
    {
      "action": "accept",
      "src": [
        "alice@example.com",
        "bob@example.com"
      ],
      "dst": [
        "tag:pair-programming:22"
      ]
    }
  ],
  "tagOwners": {
    "tag:pair-programming": [
      "bob@example.com"
    ]
  }
}
```

## CI/CD deployment pipeline

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners] |

Your DevOps or infrastructure team can use Tailscale to restrict access to your deployment pipeline. In this scenario, developers can access your development tools, such as your code repository. Then, an automated CI/CD pipeline builds and deploys code. The DevOps team can access the deployment pipeline and production environment.

What this example does:

* Members of the development team `group:dev` can access the devices tagged with `tag:dev` (such as code repositories and license servers).
* Members of the DevOps team `group:devops` can access the devices tagged with `tag:ci` (such as the build tooling) and `tag:prod` (such as the production environment).
* The DevOps team `group:devops` can manage which devices are tagged with `tag:dev`, `tag:ci`, and `tag:prod`.
* The tag `tag:ci` can manage which device are tagged with `tag:prod` and `tag:dev` (to apply tags as part of the deployment pipeline).

```json
{
  "groups": {
    "group:dev": [
      "alice@example.com",
      "bob@example.com"
    ],
    "group:devops": [
      "carl@example.com"
    ]
  },
  "acls": [
    {
      "action": "accept",
      "src": [
        "group:dev"
      ],
      "dst": [
        "tag:dev:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "group:devops"
      ],
      "dst": [
        "tag:ci:*",
        "tag:prod:*"
      ]
    }
  ],
  "tagOwners": {
    "tag:ci": [
      "group:devops"
    ],
    "tag:dev": [
      "group:devops",
      "tag:ci"
    ],
    "tag:prod": [
      "group:devops",
      "tag:ci"
    ]
  }
}
```

## Monitoring access to applications

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners] |

Your DevOps team can use Tailscale to query logs from services in your network and report these as part of your monitoring tooling. In this scenario, your monitoring server (such as Prometheus) can access all applications in your network on common ports.

What this example does:

* Devices tagged with `tag:monitoring` can access services on ports `80`, `443`, `9100`.
* Devices tagged with `tag:monitoring` can access services tagged `tag:logging`.
* The DevOps team `group:devops` can access devices tagged with `tag:monitoring` and `tag:logging`.
* The DevOps team `group:devops` can manage which devices are tagged with `tag:monitoring` and `tag:logging`.

```json
{
  "groups": {
    "group:devops": [
      "carl@example.com"
    ]
  },
  "acls": [
    {
      "action": "accept",
      "src": [
        "tag:monitoring"
      ],
      "dst": [
        "*:80,443,9100",
        "tag:logging:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "group:devops"
      ],
      "dst": [
        "tag:monitoring:*",
        "tag:logging:*"
      ]
    }
  ],
  "tagOwners": {
    "tag:monitoring": [
      "group:devops"
    ],
    "tag:logging": [
      "group:devops"
    ]
  }
}
```

## Application peering

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners] |

Your infrastructure team can use Tailscale to connect applications or services running in multiple cloud providers or SaaS applications together. In this scenario, one application can connect with another application in your network, for example, to stream from one database to another, such as with
[Materialize][xt-materialize-tailscale].

What this example does:

* Devices tagged with `tag:database` can access other devices tagged with `tag:database`.
* Devices tagged with `tag:gcp` and `tag:aws` can access devices tagged with `tag:database`, but not vice versa.
* The infrastructure team `group:infra` can manage which devices are tagged with `tag:database`, `tag:gcp`, and `tag:aws`.

```json
{
  "groups": {
    "group:infra": [
      "carl@example.com"
    ]
  },
  "acls": [
    {
      "action": "accept",
      "src": [
        "tag:database",
        "tag:gcp",
        "tag:aws"
      ],
      "dst": [
        "tag:database:*"
      ]
    }
  ],
  "tagOwners": {
    "tag:database": [
      "group:infra"
    ],
    "tag:gcp": [
      "group:infra"
    ],
    "tag:aws": [
      "group:infra"
    ]
  }
}
```

## Network microsegmentation

\[Missing snippet: prefer\_grant\_examples.mdx]

| [Plan availability][co-pricing] | Features                                                                                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All plans                       | [ACLs][docs-acls], [groups][docs-policy-syntax-groups], [tags][docs-tags], [tag owners][docs-policy-syntax-tagowners], [tests][docs-policy-syntax-tests] |

[Network microsegmentation][ln-network-microsegmentation] is a security technique that divides network devices, access, and communications into unique logical units. There are many use cases for this—segmenting data centers, virtual networks, customer deployments, and others. Each microsegment is a logical unit that cannot access other microsegments. In some cases, you might still need a support team or tagged devices that can access all segments.

What this example does:

* Members of the support team `group:support` can access devices tagged `tag:segment-abc` and `tag:segment-xyz` on port `443`.
* Devices tagged with `tag:support` can access devices tagged `tag:segment-abc` and `tag:segment-xyz` on port `443`.
* [Tests][docs-policy-syntax-tests] ensure that if ACLs change:
  * Members of the support team `group:support` will still be able to access devices tagged `tag:segment-abc` and `tag:segment-xyz` on port `443`.
  * Devices tagged with `tag:support` will still be able to access devices tagged `tag:segment-abc` and `tag:segment-xyz` on port `443`.
  * Devices tagged with `tag:segment-abc` are denied access to devices tagged `tag:segment-xyz` on port `443`.
  * Devices tagged with `tag:segment-xyz` are denied access to devices tagged `tag:segment-abc` on port `443`.

```json
{
  "acls": [
    {
      "action": "accept",
      "src": [
        "group:support"
      ],
      "dst": [
        "tag:segment-abc:443",
        "tag:segment-xyz:443"
      ]
    },
    {
      "action": "accept",
      "src": [
        "tag:support"
      ],
      "dst": [
        "tag:segment-abc:443",
        "tag:segment-xyz:443"
      ]
    }
  ],
  "tests": [
    {
      "src": "group:support",
      "accept": [
        "tag:segment-abc:443",
        "tag:segment-xyz:443"
      ]
    },
    {
      "src": "tag:support",
      "accept": [
        "tag:segment-abc:443",
        "tag:segment-xyz:443"
      ]
    },
    {
      "src": "tag:segment-abc",
      "deny": [
        "tag:segment-xyz:443"
      ]
    },
    {
      "src": "tag:segment-xyz",
      "deny": [
        "tag:segment-abc:443"
      ]
    }
  ],
  "groups": {
    "group:support": [
      "alice@example.com",
      "bob@example.com"
    ]
  },
  "tagOwners": {
    "tag:support": [
      "autogroup:admin"
    ]
  }
}
```

[ar-access-to-an-internal-application-vpn-with-synced-groups]: #access-to-an-internal-application-vpn-with-synced-groups

[ar-access-to-an-internal-application-vpn]: #access-to-an-internal-application-vpn

[ar-allow-all-default-acl]: #allow-all-default-acl

[ar-application-peering]: #application-peering

[ar-autogroups]: #with-autogroups

[ar-ci-cd-deployment-pipeline]: #cicd-deployment-pipeline

[ar-custom-groups]: #with-custom-groups

[ar-deny-all]: #deny-all

[ar-monitoring-access-to-applications]: #monitoring-access-to-applications

[ar-network-microsegmentation]: #network-microsegmentation

[ar-pair-programming]: #pair-programming

[ar-provisioned-groups]: #with-provisioned-groups

[ar-remote-access-to-production-environment]: #remote-access-to-production-environment

[ar-remote-development]: #remote-development

[ar-resource-level-access-policies]: #resource-level-access-policies

[ar-restrict-based-on-group]: #restrict-based-on-group

[ar-restrict-based-on-individual-user]: #restrict-based-on-individual-user

[ar-restrict-based-on-purpose-tags]: #restrict-based-on-purpose-tags

[ar-share-access-with-a-contractor]: #share-access-with-a-contractor

[ar-standard-plan-acl]: #standard-plan-acl

[ar-users-can-access-their-own-devices]: #users-can-access-their-own-devices

[ar-vpc-access-vpc-peering]: #vpc-access-vpc-peering

[bl-grafana-auth]: https://tailscale.com/blog/grafana-auth

[co-pricing]: https://tailscale.com/pricing

[docs-4via6-subnets]: /docs/features/subnet-routers/4via6-subnets

[docs-edit-policies-reverted]: /docs/features/tailnet-policy-file/manage-tailnet-policies#revert-changes

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-policy-syntax-autogroups]: /docs/reference/syntax/policy-file#autogroups

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#groups

[docs-policy-syntax-hosts]: /docs/reference/syntax/policy-file#hosts

[docs-policy-syntax-ssh]: /docs/reference/syntax/policy-file#ssh

[docs-policy-syntax-tagowners]: /docs/reference/syntax/policy-file#tag-owners

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-acls]: /docs/features/access-control/acls

[docs-coder]: /docs/install/cloud/coder

[docs-github-codespaces]: /docs/integrations/github/github-codespaces

[docs-gitpod]: /docs/install/cloud/gitpod

[docs-sharing-acl]: /docs/features/sharing#sharing-and-access-control-policies

[docs-sharing-quarantine]: /docs/features/sharing#quarantine

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailscale-ssh-check-mode]: /docs/features/tailscale-ssh#configure-tailscale-ssh-with-check-mode

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-troubleshooting-disable-route-masquerading]: /docs/reference/troubleshooting/network-configuration/disable-subnet-route-masquerading

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[ln-network-microsegmentation]: https://tailscale.com/learn/network-microsegmentation

[xt-materialize-tailscale]: https://materialize.com/introducing-tailscale-materialize
