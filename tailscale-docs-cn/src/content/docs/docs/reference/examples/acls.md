---
title: "ACL 策略示例"
description: "本主题提供常见场景的 [access controls (ACLs)][docs-acls] 示例。语法相关信息请参阅 [tailnet policy syntax][docs-policy-syntax]。"
---

最后验证于 Feb 2, 2026

\[缺失片段：acls\_legacy\_note.mdx]

\[缺失片段：visual\_policy\_editor.mdx]

本主题提供常见场景的[访问控制（ACL）][docs-acls]示例。语法相关信息请参阅 [tailnet 策略语法][docs-policy-syntax]。

| **示例** | **描述** | **用途** |
| --- | --- | --- |
| [允许所有][ar-allow-all-default-acl] | 默认的 tailnet 策略，允许 tailnet 内的所有设备访问 tailnet 中的其他设备。 | [ACL][docs-acls]，[SSH][docs-policy-syntax-ssh] |
| [拒绝所有][ar-deny-all] | 拒绝所有连接。 | [ACL][docs-acls] |
| [用户可以访问自己的设备][ar-users-can-access-their-own-devices] | 所有 tailnet 用户都可以访问自己拥有的设备，除非其他策略阻止。 | [ACL][docs-acls]，[SSH][docs-policy-syntax-ssh] |
| [资源级访问策略][ar-resource-level-access-policies] | 允许特定设备访问 tailnet 内的特定资源。 | [ACL][docs-acls]，[hosts][docs-policy-syntax-hosts] |
| [按用途限制（标签）][ar-restrict-based-on-purpose-tags] | 使用标签允许特定设备访问 tailnet 内的特定资源。 | [ACL][docs-acls] |
| [按组限制][ar-restrict-based-on-group] | 使用 autogroup、自定义组和预配组管理对资源的访问。 | [ACL][docs-acls]，[组][docs-policy-syntax-groups] |
| [按单个用户限制][ar-restrict-based-on-individual-user] | 管理特定用户对资源的访问。 | [ACL][docs-acls] |
| [Standard 套餐 ACL][ar-standard-plan-acl] | 使用基础的 Standard 套餐策略：员工可以访问自己的设备及带 `corp` 标签的设备，管理员可以访问带 `corp` 或 `prod` 标签的设备。 | [ACL][docs-acls]，[标签所有者][docs-policy-syntax-tagowners] |
| [访问内部应用（VPN）][ar-access-to-an-internal-application-vpn] | 按职务角色管理用户对应用的访问。 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签所有者][docs-policy-syntax-tagowners] |
| [使用同步组访问内部应用（VPN）][ar-access-to-an-internal-application-vpn-with-synced-groups] | 使用从身份提供方同步的组管理对内部资源的访问。 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签所有者][docs-policy-syntax-tagowners] |
| [远程访问生产环境][ar-remote-access-to-production-environment] | 按职务角色管理用户对生产环境的访问。 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签所有者][docs-policy-syntax-tagowners]，[测试][docs-policy-syntax-tests] |
| [VPC 访问（VPC 对等连接）][ar-vpc-access-vpc-peering] | 使用访问控制列表管理对虚拟私有云的访问。 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签所有者][docs-policy-syntax-tagowners]，[自动批准者][docs-policy-syntax-autoapprovers] |
| [与承包商共享访问权限][ar-share-access-with-a-contractor] | 允许第三方承包商访问开发环境中的共享资源。 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签所有者][docs-policy-syntax-tagowners] |
| [远程开发][ar-remote-development] | 管理对远程开发环境的访问。 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签所有者][docs-policy-syntax-tagowners] |
| [结对编程][ar-pair-programming] | 创建多个工程师可以通过 SSH 连接的结对编程环境。 | [ACL][docs-acls]，[标签所有者][docs-policy-syntax-tagowners] |
| [CI/CD 部署流水线][ar-ci-cd-deployment-pipeline] | 按职务角色管理对资源的访问。 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签所有者][docs-policy-syntax-tagowners] |
| [监控对应用的访问][ar-monitoring-access-to-applications] | 允许监控服务器访问常用端口上的所有应用。 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签所有者][docs-policy-syntax-tagowners] |
| [应用对等连接][ar-application-peering] | 允许多个云提供商或应用相互访问。 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签所有者][docs-policy-syntax-tagowners] |
| [网络微分段][ar-network-microsegmentation] | 允许访问网络微分段，但拒绝微分段之间的访问。 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签所有者][docs-policy-syntax-tagowners]，[测试][docs-policy-syntax-tests] |

## 允许所有（默认 ACL）

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-policy-syntax]，[SSH][docs-policy-syntax-ssh]，[autogroup][docs-policy-syntax-autogroups] |

首次创建 Tailscale 网络（即 tailnet）时，Tailscale 会用默认的*允许所有（allow all）*访问策略初始化它，让你无需限制网络中的任何流量即可连接并使用 Tailscale。

删除现有策略文件内容并选择 **Reset to default**，即可将 ACL 策略文件重置为最初的默认值。策略文件的变更也可以在管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面[回退][docs-edit-policies-reverted]。

默认策略的具体作用如下：

* 允许 tailnet 中的所有设备访问 tailnet 中的所有其他设备。
* 允许所有用户以 root 或非 root 身份，通过[检查模式][docs-tailscale-ssh-check-mode]对自己的设备建立 [Tailscale SSH][docs-tailscale-ssh] 会话。
* 如果你有一台[以 `--snat-subnet-routes=false` 初始化的子网路由器][docs-troubleshooting-disable-route-masquerading]（仅限 Linux），与该子网路由器处于同一本地网络的设备也能访问 tailnet 中的所有设备。
* 如果你的 tailnet 中有一台[从其他网络共享而来的设备][docs-sharing-acl]，该设备无法访问 tailnet 中的任何设备，只能[响应来自 tailnet 的入站连接][docs-sharing-quarantine]。

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

> **注意：**
>
> 在 tailnet 策略文件中省略 `acls` 字段，等同于默认的允许所有策略。要拒绝所有连接，请在策略文件中为 `acls` 字段[使用空对象][ar-deny-all]。
>
> ```json
> {} // Tailscale applies the default allow all policy if the acls section is empty.
> ```

在默认 ACL 中，`ssh` 规则的 `dst` 字段使用 `autogroup:self`，`users` 字段使用 `autogroup:nonroot`。如果你把 `dst` 字段从 `autogroup:self` 改为其他目标（例如某个 [ACL 标签](/docs/features/tags)），也应考虑替换 `users` 字段中的 `autogroup:nonroot`。如果不从 `users` 字段中移除 `autogroup:nonroot`，那么 `src` 设置所允许的任何人都将能以 `dst` 设备上的任意非 root 用户身份通过 SSH 登录。

## 拒绝所有

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-policy-syntax] |

在策略文件中为 `acls` 字段使用空值，即可拒绝 tailnet 中的所有连接。这种配置会阻止所有设备相互通信。由于 tailnet 中将没有任何东西能正常工作，不建议在一般场景中使用这种配置。

```json
{
  "acls": []
}
```

> **警告：**
>
> 在 tailnet 策略文件中省略 `acls` 字段并不等同于"拒绝所有"策略。相反，Tailscale 会应用[默认的允许所有策略][ar-allow-all-default-acl]，允许 tailnet 内的所有设备访问 tailnet 中的其他设备。

## 用户可以访问自己的设备

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners] |

本示例允许所有用户访问自己的设备。适用于许多希望允许用户访问自己的设备、但不允许访问 tailnet 中其他设备的场景。

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

## 资源级访问策略

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[hosts][docs-policy-syntax-hosts] |

你可以使用 IP 地址启用一台设备或网络到另一台设备或网络的连接。此外，[`hosts`][docs-policy-syntax-hosts] 部分让你可以为 IP 地址或 CIDR 段定义易读的名称，使访问规则更具可读性。

本示例的作用：

* IP 地址为 `100.100.123.124` 的设备可以访问 IP 地址为 `100.100.123.123` 的设备。
* IP 地址为 `100.100.123.124` 的设备可以通过[子网路由器][docs-subnets]访问子网 `192.0.2.0/24` 中的设备。
* 主机名为 `frontend-server-01` 的设备可以访问子网 `192.0.2.0/24` 中的设备。
* 主机名为 `frontend-server-01` 的设备可以访问主机名为 `dev-network-01` 的设备。

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

> **注意：**
>
> 编写针对 [4via6 子网][docs-4via6-subnets]路由器背后资源的访问控制规则时，请使用 IPv6 CIDR 或地址作为目标，而不是 IPv4 地址。
>
> 使用 `tailscale debug via` 获取 IPv6 CIDR。

## 按用途限制（标签）

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[标签][docs-tags] |

[标签][docs-tags]让你为设备分配一个独立于人类用户的身份，并在 ACL 中使用该身份来限制访问。向 Tailscale 网络添加服务器时应使用标签，使其访问基于用途，而不是基于哪位运维团队成员注册了它。

本示例的作用：

* 带 `tag:frontend` 标签的设备可以访问带 `tag:backend` 标签的设备。
* 带 `tag:backend` 标签的设备可以访问带 `tag:logging` 标签的设备。

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

## 按组限制

\[缺失片段：prefer\_grant\_examples.mdx]

你可以借助 [autogroup][ar-autogroups]、[自定义组][ar-custom-groups]或[从受支持身份提供方预配的组][ar-provisioned-groups]来启用对 tailnet 中资源的访问。

### 使用 autogroup

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[autogroup][docs-policy-syntax-autogroups]，[标签][docs-tags] |

[Autogroup][docs-policy-syntax-autogroups] 是内置的组，会自动纳入具有相同属性的用户、目标或用户名。

本示例的作用：

* 所有 tailnet 成员 `autogroup:member` 可以访问带 `tag:frontend` 标签的设备。
* 所有 Tailscale [管理员（Admin）](/docs/reference/user-roles)（`autogroup:admin`）可以访问带 `tag:backend` 或 `tag:logging` 标签的设备。

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

### 使用自定义组

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[autogroup][docs-policy-syntax-autogroups]，[标签][docs-tags] |

[自定义组][docs-policy-syntax-groups]让你为一组用户定义简称，随后即可在访问规则中使用该简称，而无需逐一列出用户。

本示例的作用：

* 工程团队 `group:engineering` 由 `alice@example.com` 和 `bob@example.com` 组成。
* DevOps 团队 `group:engineering` 由 `amelie@example.com` 和 `carl@example.com` 组成。
* 工程团队 `group:engineering` 可以访问带 `tag:frontend` 或 `tag:backend` 标签的设备。
* DevOps 团队 `group:devops` 可以访问带 `tag:frontend`、`tag:backend` 或 `tag:logging` 标签的设备。

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

### 使用预配组

\[缺失片段：prefer\_grant\_examples.mdx]

你可以使用[来自受支持身份提供方的组预配][docs-user-group-provisioning]，避免在 ACL 中维护自定义组。

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

## 按单个用户限制

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[标签][docs-tags] |

你可以按单个用户启用对资源的访问。

本示例的作用：

* 用户 Alice 可以访问带 `tag:frontend` 标签的设备。
* 用户 Bob 可以访问带 `tag:backend` 标签的设备。

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

## Standard 套餐 ACL

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[autogroup][docs-policy-syntax-autogroups]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners] |

本示例提供对企业（corp）和生产（prod）设备的远程访问。适用于许多 Standard 套餐的使用场景。

你的团队可以使用 Tailscale 访问远程设备。在这一场景中，所有用户都可以访问自己的远程设备，以及任何带标签的公共公司设备（如服务器）。只有 Tailscale [管理员（Admin）](/docs/reference/user-roles)可以访问生产设备。管理员可以配置哪些设备被打上标签。公司设备和生产设备之间不能互相访问，共享用户也不能访问设备。

本示例的作用：

* 所有员工都可以访问自己的设备。
* 所有员工都可以访问带 `tag:corp` 标签的公司设备。
* 所有 Tailscale [管理员（Admin）](/docs/reference/user-roles)（`autogroup:admin`）可以访问带 `tag:prod` 标签的设备。
* 所有 Tailscale [管理员（Admin）](/docs/reference/user-roles)可以管理哪些设备带 `tag:corp` 和 `tag:prod` 标签。

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

## 访问内部应用（VPN）

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners] |

你可以使用 Tailscale 允许用户访问内部应用，既包括自定义的内部应用，也包括托管在内部的三方应用。在这一场景中，tailnet 中的用户可以按其职务角色访问应用。内部应用可以由 IT 团队搭建。

本示例的作用：

* 工程团队成员 `group:engineering` 可以访问带 `tag:engineering` 标签的设备。
* 财务团队成员 `group:finance` 可以访问带 `tag:finance` 标签的设备。
* 法务团队成员 `group:legal` 可以访问带 `tag:legal` 标签的设备。
* 所有员工都可以访问带 `tag:internal` 标签的设备。
* 所有 Tailscale [管理员（Admin）](/docs/reference/user-roles)（`autogroup:admin`）（如 IT 团队）可以管理哪些设备带 `tag:engineering`、`tag:finance`、`tag:legal` 和 `tag:internal` 标签。

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

### 使用同步组访问内部应用（VPN）

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| Enterprise | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[autogroup][docs-policy-syntax-autogroups]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners] |

你可以使用[用户与组预配][docs-user-group-provisioning]，把从身份提供方同步而来的组纳入访问规则。Tailscale 将同步的组名视为小写。组名可以包含空格，但不能包含 `@` 符号。

本示例的作用：

* 同步组 `group:engineering@example.com` 中的工程团队成员可以访问带 `tag:engineering` 标签的设备。
* 同步组 `group:finance team@example.com` 中的财务团队成员可以访问带 `tag:finance` 标签的设备。
* 同步组 `group:Legal@example.com` 中的法务团队成员可以访问带 `tag:legal` 标签的设备。
* 所有员工都可以访问带 `tag:internal` 标签的设备。
* 所有 Tailscale [管理员（Admin）](/docs/reference/user-roles)（`autogroup:admin`）（如 IT 团队）可以管理哪些设备带 `tag:engineering`、`tag:finance`、`tag:legal` 和 `tag:internal` 标签。

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

## 远程访问生产环境

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[autogroup][docs-policy-syntax-autogroups]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners]，[测试][docs-policy-syntax-tests] |

你的 DevOps、基础设施或 SRE 团队可以使用 Tailscale 访问敏感且受高度保护的生产环境。在这一场景中，DevOps 团队或许可以访问生产环境，而其他开发者可能只能访问开发环境中的资源。所有开发者都能访问监控工具，例如 [Grafana][bl-grafana-auth]。

本示例的作用：

* 所有员工都可以访问自己的设备（如远程工作站）。
* 开发团队成员 `group:dev` 可以访问带 `tag:dev` 标签的设备（如许可证服务器）。
* 所有 Tailscale [管理员（Admin）](/docs/reference/user-roles)（`autogroup:admin`）（如 DevOps 团队成员）可以访问带 `tag:prod` 标签的设备（如生产环境）。
* 所有员工都可以通过端口 `80` 和 `443` 访问带 `tag:monitoring` 标签的设备（如监控仪表盘）。
* 所有 Tailscale [管理员（Admin）](/docs/reference/user-roles)（`autogroup:admin`）可以管理哪些设备带 `tag:dev`、`tag:prod` 和 `tag:monitoring` 标签。
* [测试][docs-policy-syntax-tests]确保在 ACL 变更时：
  * Carl 仍能通过端口 `80` 访问带 `tag:prod` 标签的设备。
  * Alice 仍能通过端口 `80` 访问带 `tag:dev` 标签的设备（但不能访问带 `tag:prod` 标签的设备）。

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

## VPC 访问（VPC 对等连接）

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[autogroup][docs-policy-syntax-autogroups]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners]，[自动批准者][docs-policy-syntax-autoapprovers] |

你的 DevOps 团队可以使用 Tailscale，允许开发者访问运行在私有云或托管云提供商的虚拟私有云（VPC）中的现有内部应用。在这一场景中，开发者可以访问 VPC 中的资源，而 DevOps 团队能够管理对 VPC 的访问。如果多个 VPC 的 [IP 网段不重叠][docs-4via6-subnets]，它们可以互相建立对等连接。要在不逐台安装 Tailscale 的情况下把现有子网接入你的 Tailscale 网络，可以使用[子网路由器][docs-subnets]：在该子网中运行一台子网路由器并通告路由，Tailscale 就能把发往该子网的流量路由到该设备进行转发。要让子网上的设备连接到你 tailnet 中的设备，请[禁用子网路由伪装][docs-troubleshooting-disable-route-masquerading]。你还可以使用[自动批准者][docs-policy-syntax-autoapprovers]自动批准路由。

本示例的作用：

* 所有 Tailscale [管理员（Admin）](/docs/reference/user-roles)（`autogroup:admin`）（如 IT 团队）可以访问带 `tag:vpc-peering` 标签的设备（用于维护）。
* 开发团队成员 `group:dev` 可以访问子网 `192.0.2.0/24` 和 `198.51.100.0/24` 中的设备。
* 子网 `192.0.2.0/24` 可以访问子网 `198.51.100.0/24`，反之亦然（如果[子网路由伪装已禁用][docs-troubleshooting-disable-route-masquerading]）。
* 所有 Tailscale [管理员（Admin）](/docs/reference/user-roles)（`autogroup:admin`）（如 IT 团队）可以管理哪些设备带 `tag:vpc-peering` 标签。
* 所有 Tailscale [管理员（Admin）](/docs/reference/user-roles)（`autogroup:admin`）和带 `tag:vpc-peering` 标签的设备可以自动批准 `192.0.2.0/24` 和 `198.51.100.0/24` 的路由。

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

## 与承包商共享访问权限

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[autogroup][docs-policy-syntax-autogroups]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners] |

你的开发团队可以使用 Tailscale 与承包商共享对特定资源（如数据库或托管代码仓库）的访问。在这一场景中，开发者可以访问内部开发资源。作为其工作的一部分，特定设备可以[共享][docs-sharing]给承包商。

本示例的作用：

* 所有员工都可以访问自己的设备。
* 开发团队成员 `group:dev` 可以访问带 `tag:dev` 标签的设备（如软件包仓库和数据库）
* 已接受共享邀请的承包商可以访问带 `tag:dev` 标签的设备（已与其共享的设备）。

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

## 远程开发

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[autogroup][docs-policy-syntax-autogroups]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners] |

你的开发团队可以把 Tailscale 纳入其远程开发环境。在这一场景中，开发者可能有一台本地设备（如笔记本电脑），并用它访问托管在云端或网络中另一台设备上的远程工作站。当你需要访问算力更强的工作站（例如用于机器学习或构建）时，这非常有用。你也可以使用 [GitHub Codespaces][docs-github-codespaces]、[Gitpod][docs-gitpod] 或 [Coder][docs-coder] 等远程代码环境。在开发环境中，你可能需要访问许可证服务器、软件包仓库、生产数据库或其他开发或构建资源，也可能需要访问自托管或私有的代码仓库。

本示例的作用：

* 所有员工都可以访问自己的设备。
* 开发团队成员 `group:dev` 可以访问带 `tag:dev` 标签的设备（如软件包仓库和数据库）。
* 开发团队 `group:dev` 可以管理哪些设备带 `tag:dev` 标签。

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

## 结对编程

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners] |

你的开发团队可以使用 Tailscale 远程在同一台设备上结对编程。在这一场景中，两名或更多开发者可以通过 SSH 连接到一台公司设备（如虚拟机（VM）），并共享一个终端（如 `tmux` 会话）。

本示例的作用：

* 用户 Alice 和 Bob 可以通过端口 `22`（SSH）访问带 `tag:pair-programming` 标签的公司设备。
* Bob 可以管理哪些设备带 `tag:pair-programming` 标签。

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

## CI/CD 部署流水线

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners] |

你的 DevOps 或基础设施团队可以使用 Tailscale 限制对部署流水线的访问。在这一场景中，开发者可以访问你的开发工具（如代码仓库），随后由自动化的 CI/CD 流水线构建并部署代码。DevOps 团队可以访问部署流水线和生产环境。

本示例的作用：

* 开发团队成员 `group:dev` 可以访问带 `tag:dev` 标签的设备（如代码仓库和许可证服务器）。
* DevOps 团队成员 `group:devops` 可以访问带 `tag:ci` 标签（如构建工具）和 `tag:prod` 标签（如生产环境）的设备。
* DevOps 团队 `group:devops` 可以管理哪些设备带 `tag:dev`、`tag:ci` 和 `tag:prod` 标签。
* 标签 `tag:ci` 可以管理哪些设备带 `tag:prod` 和 `tag:dev` 标签（以便在部署流水线中应用标签）。

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

## 监控对应用的访问

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners] |

你的 DevOps 团队可以使用 Tailscale 查询网络中服务的日志，并把它们作为监控工具的一部分进行上报。在这一场景中，你的监控服务器（如 Prometheus）可以通过常用端口访问网络中的所有应用。

本示例的作用：

* 带 `tag:monitoring` 标签的设备可以访问端口 `80`、`443`、`9100` 上的服务。
* 带 `tag:monitoring` 标签的设备可以访问带 `tag:logging` 标签的服务。
* DevOps 团队 `group:devops` 可以访问带 `tag:monitoring` 和 `tag:logging` 标签的设备。
* DevOps 团队 `group:devops` 可以管理哪些设备带 `tag:monitoring` 和 `tag:logging` 标签。

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

## 应用对等连接

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners] |

你的基础设施团队可以使用 Tailscale 把运行在多个云提供商或 SaaS 应用中的应用或服务连接起来。在这一场景中，一个应用可以连接你网络中的另一个应用，例如把数据从一个数据库流式传输到另一个，如
[Materialize][xt-materialize-tailscale]。

本示例的作用：

* 带 `tag:database` 标签的设备可以访问其他带 `tag:database` 标签的设备。
* 带 `tag:gcp` 和 `tag:aws` 标签的设备可以访问带 `tag:database` 标签的设备，反之则不行。
* 基础设施团队 `group:infra` 可以管理哪些设备带 `tag:database`、`tag:gcp` 和 `tag:aws` 标签。

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

## 网络微分段

\[缺失片段：prefer\_grant\_examples.mdx]

| [套餐可用性][co-pricing] | 功能 |
| --- | --- |
| 所有套餐 | [ACL][docs-acls]，[组][docs-policy-syntax-groups]，[标签][docs-tags]，[标签所有者][docs-policy-syntax-tagowners]，[测试][docs-policy-syntax-tests] |

[网络微分段][ln-network-microsegmentation]是一种安全技术，将网络设备、访问和通信划分为独立的逻辑单元。它有很多用例——划分数据中心、虚拟网络、客户部署等等。每个微分段都是一个无法访问其他微分段（microsegment）的逻辑单元。在某些情况下，你可能仍然需要一支支持团队或一些带标签的设备能够访问所有分段。

本示例的作用：

* 支持团队成员 `group:support` 可以通过端口 `443` 访问带 `tag:segment-abc` 和 `tag:segment-xyz` 标签的设备。
* 带 `tag:support` 标签的设备可以通过端口 `443` 访问带 `tag:segment-abc` 和 `tag:segment-xyz` 标签的设备。
* [测试][docs-policy-syntax-tests]确保在 ACL 变更时：
  * 支持团队 `group:support` 的成员仍能通过端口 `443` 访问带 `tag:segment-abc` 和 `tag:segment-xyz` 标签的设备。
  * 带 `tag:support` 标签的设备仍能通过端口 `443` 访问带 `tag:segment-abc` 和 `tag:segment-xyz` 标签的设备。
  * 带 `tag:segment-abc` 标签的设备被拒绝通过端口 `443` 访问带 `tag:segment-xyz` 标签的设备。
  * 带 `tag:segment-xyz` 标签的设备被拒绝通过端口 `443` 访问带 `tag:segment-abc` 标签的设备。

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

[ar-access-to-an-internal-application-vpn-with-synced-groups]: #使用同步组访问内部应用vpn

[ar-access-to-an-internal-application-vpn]: #访问内部应用vpn

[ar-allow-all-default-acl]: #允许所有默认-acl

[ar-application-peering]: #应用对等连接

[ar-autogroups]: #使用-autogroup

[ar-ci-cd-deployment-pipeline]: #cicd-部署流水线

[ar-custom-groups]: #使用自定义组

[ar-deny-all]: #拒绝所有

[ar-monitoring-access-to-applications]: #监控对应用的访问

[ar-network-microsegmentation]: #网络微分段

[ar-pair-programming]: #结对编程

[ar-provisioned-groups]: #使用预配组

[ar-remote-access-to-production-environment]: #远程访问生产环境

[ar-remote-development]: #远程开发

[ar-resource-level-access-policies]: #资源级访问策略

[ar-restrict-based-on-group]: #按组限制

[ar-restrict-based-on-individual-user]: #按单个用户限制

[ar-restrict-based-on-purpose-tags]: #按用途限制标签

[ar-share-access-with-a-contractor]: #与承包商共享访问权限

[ar-standard-plan-acl]: #standard-套餐-acl

[ar-users-can-access-their-own-devices]: #用户可以访问自己的设备

[ar-vpc-access-vpc-peering]: #vpc-访问vpc-对等连接

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
