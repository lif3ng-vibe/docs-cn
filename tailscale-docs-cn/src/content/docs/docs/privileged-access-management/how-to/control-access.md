---
title: "控制对 Tailscale PAM 服务的访问"
description: "Tailscale PAM 使用授权（grant）来控制谁能连接到 PAM 服务，以及连接后能做什么。"
---

最后验证于 Aug 12, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

Tailscale PAM 使用授权（grant）来控制谁能连接到 PAM 服务，以及连接后能做什么。

一条 PAM 授权由以下部分组合而成：

* 一个**来源**，例如用户、用户组、设备或标签。
* 一个**目的地**，例如数据库、SSH 服务器或 Kubernetes 服务。
* 特定于目的地服务的应用级权限。

这让你可以按照用户需要执行的操作来授予访问权限。例如，你可以给支持团队只读的数据库访问，允许运维人员运行有限的几条 SSH 命令，或者让开发者在特定命名空间中列出 Kubernetes 资源。

Tailscale 授权采用默认拒绝（deny-by-default）模型。只有当一条匹配的授权同时提供所需的网络访问和 PAM 应用权限时，连接才会被允许。

## 前提条件

在创建用于控制访问的 PAM 授权之前，请确认你已完成以下操作：

1. 安装并配置 Tailscale PAM [连接器][docs-pam-connectors]。
2. 创建你想让用户访问的一个或多个 Tailscale PAM [服务][docs-pam-services]。
3. 确定哪些用户、用户组或设备需要访问权限。
4. 确定每个来源在每个服务内应被允许做什么。

创建 PAM 服务后，你可以把它选作[访问规则][docs-visual-editor-general-access-rules]中的目的地。在 [tailnet 策略文件][docs-tailnet-policy-file]中，服务目的地使用 `svc:production-database` 这样的选择器。Tailscale 授权允许你把服务与用户、设备、用户组、标签及其他选择器一样作为目的地使用。

你需要是 tailnet 的[所有者、管理员或网络管理员](/docs/reference/user-roles)才能编辑 tailnet 策略文件。

## Tailscale PAM 授权的工作原理

Tailscale PAM 授权是带有 `tailscale.com/cap/pam` [应用能力（application capability）][docs-grants-app-capabilities]的 Tailscale [授权][docs-grants]。

一条 Tailscale PAM 授权主要定义三件事：

* 谁可以访问某个服务。
* 他们可以访问哪个 Tailscale PAM 服务。
* 他们可以在该服务内做什么。

来源可以是身份、用户组、设备或标签。目的地是一个 Tailscale PAM 服务。例如，考虑下面的 `grants` 定义。

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

各字段的作用如下：

* `src` 标识谁在请求访问。本例中是 `group:platform` 用户组。
* `dst` 标识 PAM 服务，即 `svc:production-database`。
* `app` 包含应用级的 PAM 权限，此处是对所有数据库的只读访问。

`app` 字段包含当来源访问目的地服务时生效的 PAM 权限。可用权限取决于 PAM 服务的类型，例如数据库、SSH、Kubernetes 或 Amazon S3。

### 授权是累加的

当多条授权匹配同一连接时，Tailscale 会合并它们提供的全部能力。更具体的授权不会覆盖更宽泛的授权。

因此，在某条授权里收紧某个能力，并不能撤销另一条匹配授权提供的同一能力。在实施最小权限访问时，请审查所有可能匹配该来源和目的地的授权。

## 在管理控制台中创建授权

要使用[可视化策略编辑器][docs-visual-editor]创建授权：

1. 进入管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。
2. 在**通用访问规则**标签页中选择**添加规则**。
3. 在**来源**中，选择需要访问权限的用户、用户组、设备或标签。
4. 在**目的地**中，选择一个或多个 Tailscale PAM 服务。
5. （可选）使用**备注**字段记录你制定这条规则的理由。
6. 展开**应用级选项**。当目的地包含 Tailscale PAM 服务时，编辑器会自动选中 `tailscale.com/cap/pam` 应用。
7. 为每个目的地协议配置权限。
8. 在 **JSON 预览**中检查生成的授权。
9. 选择**保存授权**。

可视化策略编辑器会把通用访问规则转换成 tailnet 策略文件中的授权。

## 控制数据库访问

数据库权限让你可以控制用户能访问哪些数据库，以及能执行哪些类型的查询。

如果没有数据库专属规则，数据库能力会开放该服务所支持的所有数据库和查询类型。要限制访问，请选择**仅允许特定数据库规则**并添加一条或多条规则。

每条规则包含：

* **数据库：** 上游数据库服务器所识别的数据库名称，或匹配所有数据库的 `*`。对于 MySQL，这是 `SHOW DATABASES` 返回的数据库（MySQL 也将数据库称为 schema）。对于 PostgreSQL，这是你连接的数据库，例如用 `psql -d` 指定的数据库，它不指该数据库内的 PostgreSQL schema。
* **允许的查询类型：** 来源可以执行的查询类型。你可以使用 `ReadOnly`、`ReadWrite` 这类较宽的类别，也可以允许 `SELECT`、`INSERT`、`UPDATE`、`DELETE` 等单个查询类型。查询类型限制目前仅对 MySQL 和 PostgreSQL 服务提供支持并强制执行。

例如，下面的权限让用户对所有数据库拥有只读访问，另外还允许他们对 `books` 数据库运行 `DELETE` 查询：

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

匹配到的数据库规则是累加的。在这个例子中，`books` 数据库同时获得通配符只读权限和它专属的数据库权限。

要阻止这条授权提供数据库访问，请选择**停用所有数据库访问**。

### **数据库访问示例**

下面展示数据库权限的示例。

#### 对所有数据库的只读访问

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

#### 对单个数据库的只读访问

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

创建更细粒度的规则时，请使用可视化编辑器中显示的查询类型。

## 控制 SSH 访问

SSH 权限让你可以分别控制 SSH 会话的多个部分，包括交互式 shell 访问、命令执行、SFTP 和 TCP 转发。

默认情况下，SSH 访问包含 shell、exec 和 SFTP 访问。你可以完全停用 SSH，也可以停用单个能力。

### 停用 SSH 能力

你可以配置以下选项：

* **停用所有 SSH 访问：** 阻止这条授权提供 SSH 访问。
* **停用 shell 访问：** 阻止交互式 shell 会话。
* **停用 SFTP 访问：** 阻止使用 SFTP 的文件传输。
* **停用 exec 访问：** 阻止通过 SSH exec 请求运行命令。

这些能力相互独立。例如，停用 shell 访问并不会停用 exec 或 SFTP 访问。

### 控制 exec 访问

SSH exec 让用户无需启动交互式 shell 即可运行命令，例如运行 `ssh user@server uptime`。

你可以完全停用 exec 访问，或者选择**仅允许特定 exec 命令**（正则表达式）来限制可以通过 SSH exec 运行哪些命令。

exec 命令限制不适用于在交互式 shell 中输入的命令。如果用户拥有 shell 访问权限，他们可以在该 shell 中运行命令，不受 exec 命令允许列表的约束。

命令按正则表达式求值。需要精确匹配某个命令时，请对表达式加锚定。例如，`^ls$` 只匹配 `ls`，而不加锚定的 `ls` 还能匹配包含该序列的命令，比如 `lsof`。

```json
"exec": {
  "commands": [
    "^systemctl status nginx$",
    "^journalctl -u nginx --since today$"
  ]
}
```

当用户只需要运行被允许的命令时，请保持交互式 shell 访问处于停用状态。否则，交互式 shell 可以提供超出 exec 命令允许列表的访问能力。

### 限制 SSH 用户名

选择**仅允许特定用户名**来控制用户可以请求哪些上游用户名。

下面的配置允许支持组以 `support` 身份连接，但不允许以 `root` 身份访问。

```json
"allowed_usernames": [
  "support",
  "readonly"
]
```

### 控制 TCP 转发

TCP 转发默认停用。选择**允许 TCP 转发**来允许用户创建 SSH TCP 转发连接。

要把转发限制到特定目的地，请选择**仅允许特定连接**，并指定允许的目的地地址和端口。

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

目的地地址必须与 SSH 客户端请求的地址一致。可以使用通配符来允许任意地址或端口，但请谨慎使用通配符。

> **警告：**
>
> 通配符（`*`）会允许访问任何 IP 地址或端口。只有在确实打算开放宽泛访问时才使用它们。

### SSH 授权示例

下面的权限允许 SFTP、允许两条非交互式 exec 命令，并允许向一个目的地进行 TCP 转发。未授予交互式 shell 访问。

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

## 控制 Kubernetes 访问

Kubernetes 权限让你可以定义用户能对 Kubernetes API 服务执行哪些操作。

不加限制的 Kubernetes 权限会开放该服务所支持的所有操作。选择**仅允许特定 Kubernetes 规则**可把授权改为允许列表。启用 Kubernetes 规则后，只有至少匹配一条规则的操作才被允许。

一条 Kubernetes 规则可以匹配：

* **动词**（verb），例如 `get`、`list`、`create` 或 `delete`。
* **命名空间**。
* **资源类型**，例如 pods、deployments 或 services。
* **资源名称**。
* **API 组**。

下面的示例允许在所有命名空间中列出资源：

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

当不同资源需要不同权限时，请使用多条规则。例如，一条规则可以允许在每个命名空间中列出 pods，而另一条规则只允许在开发命名空间中创建 `pods/exec` 资源。

连接器的 Kubernetes 身份也必须拥有执行所请求操作的权限。Tailscale PAM 权限可以收窄连接器的可用特权，但不能扩大上游 Kubernetes 基于角色的访问控制（RBAC）所提供的权限。

要阻止这条授权提供 Kubernetes 访问，请选择**停用所有 Kubernetes 访问**。

## 控制 Amazon S3 访问

Amazon S3 权限让你可以按 S3 操作、存储桶和路径来限制访问。

如果没有 S3 专属规则，用户将获得通过该服务及其 AWS 凭证可用的 S3 访问。选择**仅允许特定 S3 规则**来创建允许的存储桶、路径和操作组合的允许列表。

启用 S3 规则后，一个操作必须至少匹配一条规则。规则可以使用 `*` 通配符匹配多个存储桶或路径。

例如，下面的规则展示以下权限：

* 允许对所有存储桶和路径进行 `list` 和 `read` 访问。
* 允许对名称以 `api-` 开头的存储桶进行 `list`、`read`、`write` 和 `delete` 访问。
* 允许对 `ui-assets` 存储桶中的 `images/` 路径进行 `list`、`read`、`write` 和 `delete` 访问。

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

这些规则是累加的。在这个例子中，所有存储桶都获得通配符的 `list` 和 `read` 权限，而更具体的规则则为匹配的存储桶和路径追加 `write` 和 `delete` 访问。

实际生效的访问还会受到分配给 Tailscale PAM 连接器的 AWS IAM 权限的限制。授权无法提供连接器的 AWS 身份无权执行的 S3 操作。

要阻止这条授权提供 S3 访问，请选择**停用所有 AWS S3 访问**。

## 控制 HTTP、RDP、VNC 和 TCP 访问

HTTP、RDP、VNC 和 TCP 服务支持协议级的应用访问。

对于每种协议，你可以保持默认能力启用，也可以选择它的停用选项：

* **停用所有 HTTP 访问**
* **停用所有 RDP 访问**
* **停用所有 VNC 访问**
* **停用所有 TCP 访问**

Tailscale 授权采用默认拒绝模型。只有当一条匹配的授权允许来源以所需的 PAM 权限访问目的地时，访问才会被允许。

## 在一条授权中配置多种服务类型

一条授权可以包含多种 Tailscale PAM 服务类型的权限。相关权限会根据目的地服务生效。下面展示一条针对多种服务类型的授权。

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

当不同团队拥有这些服务、不同来源组需要访问，或者每组权限有各自独立的运维目的时，可以考虑拆分成多条授权。更小的授权更容易审查和审计。

## 完整的 PAM 授权示例

如前所述，一条授权可以提供对多种服务类型的访问。生效的权限取决于目的地服务。

下面的示例：

* 让 `group:platform` 用户组对所有数据库拥有只读访问，并对 `books` 数据库额外拥有 `DELETE` 访问。
* 允许两条命令的 SSH exec、SFTP，以及到一个目的地的 TCP 转发。
* 允许用户在所有命名空间中列出 Kubernetes 资源。
* 授予对所有 S3 存储桶的 `list` 和 `read` 访问，并对 `api-*` 存储桶以及 `ui-assets` 存储桶中的 `images/` 路径额外授予 `write` 和 `delete` 访问。
* 授予对 HTTP、RDP、VNC 和 TCP 服务的访问。

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

Tailscale PAM 会根据目的地服务应用相关权限。例如，访问 `svc:production-database` 时应用数据库规则，访问 `svc:production-s3` 时应用 S3 规则。

当规则重叠时，其权限是累加的。例如，通配符 S3 规则为所有存储桶提供 `list` 和 `read` 访问，而更具体的规则则为匹配的存储桶和路径追加 `write` 和 `delete` 访问。

当不同用户组需要访问不同服务，或这些服务有各自独立的管理目的时，可以考虑拆分成多条授权。更小的授权更容易审查和审计。

## 排查 PAM 访问问题

当用户无法访问某个 Tailscale PAM 服务时，请检查以下各项：

* 确认该服务存在，并且有可用的连接器。
* 确认该用户或设备匹配授权的 `src`。
* 确认该服务匹配授权的 `dst`。
* 确认存在 `tailscale.com/cap/pam` 应用能力。
* 确认相关协议未被停用。
* 对于数据库、Kubernetes 或 S3 允许列表，确认所请求的操作匹配某条规则。
* 审查其他可能匹配的授权，因为它们的能力会被合并。
* 确认上游服务的凭证或角色允许该操作。
* 在 [JSON 编辑器](https://console.tailscale.com/admin/acls/file)中审查生成的策略，检查是否有意外的选择器或权限。

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants]: /docs/features/access-control/grants

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-services]: /docs/privileged-access-management/services

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-visual-editor-general-access-rules]: /docs/reference/visual-editor#通用访问规则

[docs-visual-editor]: /docs/reference/visual-editor
