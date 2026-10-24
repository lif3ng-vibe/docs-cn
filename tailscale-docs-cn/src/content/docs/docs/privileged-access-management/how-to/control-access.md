---
title: "Control access to Tailscale PAM services"
description: "Tailscale PAM uses grants to control who can connect to a PAM service and what they can do after connecting."
---

Last validated Aug 12, 2026

> **Note:** Tailscale PAM is currently in beta.

Tailscale PAM uses grants to control who can connect to a PAM service and what they can do after connecting.

A PAM grant combines:

* A **source**, such as a user, group, device, or tag.
* A **destination**, such as a database, SSH server, or Kubernetes service.
* Application-level permissions that are specific to the destination service.

This lets you grant access according to the operation a user needs to do. For example, you can give a support team read-only database access, allow an operator to run a limited set of SSH commands, or let a developer list Kubernetes resources in a specific namespace.

Tailscale grants use a deny-by-default model. A connection is permitted only when a matching grant provides the required network access and PAM application permissions.

## Prerequisites

Before creating a PAM grant to control access, confirm you have done the following:

1. Install and configure a Tailscale PAM [connector][docs-pam-connectors].
2. Create the Tailscale PAM [service][docs-pam-services] or services you want users to access.
3. Decide which users, groups, or devices need access.
4. Decide what each source should be allowed to do within each service.

After you create a PAM service, you can select it as a destination in an [access rule][docs-visual-editor-general-access-rules]. In the [tailnet policy file][docs-tailnet-policy-file], a service destination uses a selector such as `svc:production-database`. Tailscale grants let you use a service as a destination alongside users, devices, groups, tags, and other selectors.

You need to be an [Owner, Admin, or Network admin](/docs/reference/user-roles) of a tailnet to edit the tailnet policy file.

## How Tailscale PAM grants work

A Tailscale PAM grant is a Tailscale [grant][docs-grants] with the `tailscale.com/cap/pam` [application capability][docs-grants-app-capabilities].

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

### Grants are additive

When multiple grants match a connection, Tailscale combines the capabilities provided by all of them. A more specific grant does not override a broader grant.

As a result, restricting a capability in one grant does not revoke the same capability if another matching grant provides it. Review all grants that can match a source and destination when applying least-privileged access.

## Create a grant of the admin console

To create a grant using the [visual policy editor][docs-visual-editor]:

1. Go to the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console.
2. Select **Add rule** from **General access rules** tab.
3. For **Source**, select the users, groups, devices, or tags that need access.
4. For **Destination**, select one or more Tailscale PAM services.
5. (Optional) Use the **Note** field to document your rationale for the rule.
6. Expand **Application-level options**. When the destination includes a Tailscale PAM service, the editor automatically selects the `tailscale.com/cap/pam` application.
7. Configure the permissions for each destination protocol.
8. Review the generated grant in **JSON preview**.
9. Select **Save grant**.

The visual policy editor translates general access rules into grants in the tailnet policy file.

## Control database access

Database permissions let you control which databases a user can access and which kinds of queries they can execute.

Without database-specific rules, the database capability permits access to all databases and query types supported by the service. To limit access, select **Allow only specific database rules** and add one or more rules.

Each rule contains:

* **Database:** The database name as understood by the upstream database server, or `*` to match all databases. For MySQL, this is a database returned by `SHOW DATABASES` (MySQL also refers to databases as schemas). For PostgreSQL, this is the database you connect to, such as the database specified with `psql -d`; it does not refer to a PostgreSQL schema within that database.
* **Allowed query types:** The query types the source can execute. You can use broader categories such as `ReadOnly` and `ReadWrite`, or allow individual query types such as `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and more. Query-type restrictions are currently supported and enforced for MySQL and PostgreSQL services.

For example, the following permission gives users read-only access to every database and additionally lets them run `DELETE` queries against the `books` database:

```json
"database": {
  "allowed_databases": [
    {
      "database": "*",
      "allowed_query_types": ["ReadOnly"]
    },
    {
      "database": "books",
      "allowed_query_types": ["ReadOnly", "DELETE"]
    }
  ]
}
```

The matching database rules are cumulative. In this example, the `books` database receives both the wildcard read-only permission and its database-specific permissions.

To prevent this grant from providing database access, select **Disable all Database access**.

### **Database access examples**

The following shows example permissions for databases.

#### Read-only access to all databases

```json
"database": {
  "allowed_databases": [
    {
      "database": "*",
      "allowed_query_types": ["ReadOnly"]
    }
  ]
}
```

#### Read-only access to one database

```json
"database": {
  "allowed_databases": [
    {
      "database": "inventory",
      "allowed_query_types": ["ReadOnly"]
    }
  ]
}
```

Use the query types displayed in the visual editor when creating more granular rules.

## Control SSH access

SSH permissions let you control several parts of an SSH session independently, including interactive shell access, command execution, SFTP, and TCP forwarding.

By default, SSH access includes shell, exec, and SFTP access. You can disable SSH entirely or disable individual capabilities.

### Disable SSH capabilities

You can configure the following options:

* **Disable all SSH access:** Prevents this grant from providing SSH access.
* **Disable shell access:** Prevents interactive shell sessions.
* **Disable SFTP access:** Prevents file transfers using SFTP.
* **Disable exec access:** Prevents commands from being run using SSH exec requests.

These capabilities are independent. For example, disabling shell access does not disable exec or SFTP access.

### Control exec access

SSH exec lets a user run a command without starting an interactive shell. For example, by running `ssh user@server uptime`.

You can disable exec access entirely or select **Allow only specific exec commands (regex)** to restrict which commands can be run using SSH exec.

Exec command restrictions do not apply to commands entered in an interactive shell. If a user has shell access, they can run commands from that shell independently of the exec command allowlist.

Commands are evaluated as regular expressions. Anchor an expression when you need to match an exact command. For example, `^ls$` matches only `ls`, while `ls` can also match commands containing that sequence, such as `lsof`.

```json
"exec": {
  "commands": [
    "^systemctl status nginx$",
    "^journalctl -u nginx --since today$"
  ]
}
```

Keep interactive shell access disabled when users only need to run the allowed commands. Otherwise, an interactive shell can provide access beyond the exec command allowlist.

### Restrict SSH usernames

Select **Allow only specific usernames** to control which upstream usernames a user can request.

The following permits a support group to connect as `support` without permitting access as `root`.

```json
"allowed_usernames": [
  "support",
  "readonly"
]
```

### Control TCP forwarding

TCP forwarding is disabled by default. Select **Allow TCP Forwarding** to permit users to create SSH TCP forwarding connections.

To restrict forwarding to specific destinations, select **Allow only specific connections** and specify the permitted destination addresses and ports.

```json
"tcp_forwarding": {
  "allowed_connections": [
    {
      "destination_address": "10.10.10.10",
      "destination_port": "443"
    }
  ]
}
```

The destination address must match the address requested by the SSH client. A wildcard can be used to permit any address or port, but use wildcards carefully.

> **Warning:**
>
> Wildcards (`*`) allow access to any IP address or port. Use them only when broad access is intended.

### SSH grant example

The following permissions allow SFTP, permit two non-interactive exec commands, and allow TCP forwarding to one destination. Interactive shell access is not granted.

```json
"ssh": {
  "exec": {
    "commands": [
      "^systemctl status nginx$",
      "^journalctl -u nginx --since today$"
    ]
  },
  "sftp": {},
  "tcp_forwarding": {
    "allowed_connections": [
      {
        "destination_address": "10.10.10.10",
        "destination_port": "443"
      }
    ]
  }
}
```

## Control Kubernetes access

Kubernetes permissions let you define which operations a user can do against a Kubernetes API service.

An unrestricted Kubernetes permission grants access to all operations supported by the service. Select **Allow only specific Kubernetes rules** to change the grant to an allowlist. When Kubernetes rules are enabled, only operations matching at least one rule are permitted.

A Kubernetes rule can match:

* **Verbs**, such as `get`, `list`, `create`, or `delete`.
* **Namespaces**.
* **Resource types**, such as pods, deployments, or services.
* **Resource names**.
* **API groups**.

The following example permits listing resources across all namespaces:

```json
"kubernetes": {
  "rules": [
    {
      "namespaces": ["*"],
      "verbs": ["list"],
      "resources": ["*"]
    }
  ]
}
```

Use multiple rules when different resources require different permissions. For example, one rule could grant listing pods in every namespace, while another grants creating `pods/exec` resources only in a development namespace.

The connector's Kubernetes identity must also have permission to do the requested operation. Tailscale PAM permissions can restrict the connector's available privileges, but cannot expand the permissions provided by upstream Kubernetes role-based access control (RBAC).

To prevent this grant from providing Kubernetes access, select **Disable all Kubernetes access**.

## Control Amazon S3 access

Amazon S3 permissions let you restrict access by S3 action, bucket, and path.

Without S3-specific rules, users receive the S3 access available through the service and its AWS credentials. Select **Allow only specific S3 rules** to create an allowlist of permitted bucket, path, and action combinations.

When S3 rules are enabled, an operation must match at least one rule. Rules can use `*` wildcards to match multiple buckets or paths.

For example, the rules below show the following permissions:

* Allow `list` and `read` access to all buckets and paths.
* Allow `list`, `read`, `write`, and `delete` access to buckets whose names start with `api-`.
* Allow `list`, `read`, `write`, and `delete` access to the `images/` path in the `ui-assets` bucket.

```json
{
  "aws_s3": {
    "rules": [
      {
        "buckets": ["*"],
        "paths": ["*"],
        "actions": ["list", "read"]
      },
      {
        "buckets": ["api-*"],
        "paths": ["*"],
        "actions": ["list", "read", "write", "delete"]
      },
      {
        "buckets": ["ui-assets"],
        "paths": ["images/*"],
        "actions": ["list", "read", "write", "delete"]
      }
    ]
  }
}
```

The rules are cumulative. In this example, all buckets receive the wildcard `list` and `read` permissions, while the more specific rules add `write` and `delete` access for matching buckets and paths.

The effective access is also limited by the AWS IAM permissions assigned to the Tailscale PAM connector. A grant cannot provide access to an S3 operation that the connector's AWS identity does not have permission to execute.

To prevent this grant from providing S3 access, select **Disable all AWS S3 access**.

## Control HTTP, RDP, VNC, and TCP access

HTTP, RDP, VNC, and TCP services support protocol-level application access.

For each protocol, you can either leave the default capability enabled or select its disable option:

* **Disable all HTTP access**
* **Disable all RDP access**
* **Disable all VNC access**
* **Disable all TCP access**

Tailscale grants use a deny-by-default model. Access is permitted only when a matching grant permits the source to access the destination with the required PAM permissions.

## Configure multiple service types in one grant

A single grant can contain permissions for multiple Tailscale PAM service types. The relevant permission is applied according to the destination service. The following shows a grant for multiple service types.

```json
{
  "grants": [
    {
      "src": ["group:platform"],
      "dst": [
        "svc:production-mysql",
        "svc:production-ssh",
        "svc:production-kubernetes"
      ],
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
              },
              "ssh": {
                "exec": {
                  "commands": [
                    "^systemctl status nginx$"
                  ]
                },
                "allowed_usernames": ["support"]
              },
              "kubernetes": {
                "rules": [
                  {
                    "namespaces": ["*"],
                    "verbs": ["list"],
                    "resources": ["*"]
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

Consider using separate grants when different teams own the services, different source groups need access, or each permission set has a separate operational purpose. Smaller grants can be easier to review and audit.

## Complete PAM grant example

As mentioned, a single grant can provide access to multiple service types. The permissions that apply depend on the destination service.

The following example:

* Gives the `group:platform` group read-only access to all databases, with additional `DELETE` access to the `books` database.
* Permits SSH exec for two commands, SFTP, and TCP forwarding to one destination.
* Permits users to list Kubernetes resources across all namespaces.
* Grants `list` and `read` access to all S3 buckets, with additional `write` and `delete` access to `api-*` buckets and the `images/` path in the `ui-assets` bucket.
* Grants access to HTTP, RDP, VNC, and TCP services.

```json
{
  "src": ["group:platform"],
  "dst": [
    "svc:production-database",
    "svc:production-ssh",
    "svc:production-kubernetes",
    "svc:production-s3",
    "svc:internal-http",
    "svc:admin-rdp",
    "svc:admin-vnc",
    "svc:internal-tcp"
  ],
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
              },
              {
                "database": "books",
                "allowed_query_types": ["ReadOnly", "DELETE"]
              }
            ]
          },
          "ssh": {
            "exec": {
              "commands": [
                "^systemctl status nginx$",
                "^journalctl -u nginx --since today$"
              ]
            },
            "sftp": {},
            "tcp_forwarding": {
              "allowed_connections": [
                {
                  "destination_address": "10.10.10.10",
                  "destination_port": "443"
                }
              ]
            }
          },
          "kubernetes": {
            "rules": [
              {
                "namespaces": ["*"],
                "verbs": ["list"],
                "resources": ["*"]
              }
            ]
          },
          "aws_s3": {
            "rules": [
              {
                "buckets": ["*"],
                "paths": ["*"],
                "actions": ["list", "read"]
              },
              {
                "buckets": ["api-*"],
                "paths": ["*"],
                "actions": ["list", "read", "write", "delete"]
              },
              {
                "buckets": ["ui-assets"],
                "paths": ["images/*"],
                "actions": ["list", "read", "write", "delete"]
              }
            ]
          },
          "http": {},
          "rdp": {},
          "vnc": {},
          "tcp": {}
        }
      }
    ]
  }
}
```

Tailscale PAM applies the relevant permissions according to the destination service. For example, the database rules apply when accessing `svc:production-database`, while the S3 rules apply when accessing `svc:production-s3`.

When rules overlap, their permissions are cumulative. For example, the wildcard S3 rule provides `list` and `read` access to all buckets, while the more specific rules add `write` and `delete` access to matching buckets and paths.

Consider using separate grants when different groups need access to different services or when the services have separate administrative purposes. Smaller grants can be easier to review and audit.

## Troubleshoot PAM access

When a user cannot access a Tailscale PAM service, check the following:

* Confirm that the service exists and has an available connector.
* Confirm that the user or device matches the grant's `src`.
* Confirm that the service matches the grant's `dst`.
* Confirm that the `tailscale.com/cap/pam` application capability is present.
* Confirm that the relevant protocol has not been disabled.
* For database, Kubernetes, or S3 allowlists, confirm that the requested operation matches a rule.
* Review other matching grants, since their capabilities are combined.
* Confirm that the upstream service credentials or role permit the operation.
* Review the generated policy in the [JSON editor](https://console.tailscale.com/admin/acls/file) for unexpected selectors or permissions.

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants]: /docs/features/access-control/grants

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-services]: /docs/privileged-access-management/services

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-visual-editor-general-access-rules]: /docs/reference/visual-editor#general-access-rules

[docs-visual-editor]: /docs/reference/visual-editor
