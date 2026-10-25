---
title: "应用能力"
description: "应用能力（app capabilities，常称 “app capabilities”）将 Tailscale 的访问控制系统扩展到传统网络流量规则之外。标准授权控制哪些设备可以在"
---

最后验证于 Dec 1, 2025

应用能力（app capabilities，常称 "app capabilities"）将 Tailscale 的访问控制系统扩展到传统网络流量规则之外。标准授权控制哪些设备可以通过特定端口和协议相互通信，而应用能力则为运行在更高应用层的特定特性和功能提供细粒度权限。这使得你可以精确控制设备能执行哪些操作，而不只是能建立哪些网络连接。

应用能力通过 `app` 字段写在 [tailnet 策略文件][docs-tailnet-policy-file]的 grants 部分。每个能力代表一项你可以为 [tailnet][docs-tailnet] 内设备之间启用的具体权限或特性。本文档说明应用能力的工作原理、要求与限制，并详细介绍所有 Tailscale 内置能力及其实用示例。

\[Missing snippet: node\_attrs\_vs\_app\_caps\_note.mdx]

## 应用能力的工作原理

本节介绍应用能力背后的核心机制，包括格式与处理流程。

你在授权规则的 `app` 映射中定义应用能力。授权本身定义哪些来源设备（`src`）可以访问哪些目标设备（`dst`），而 app 映射定义要为该连接授予的具体能力。每个能力遵循域名命名约定，通常格式为 `domain.com/cap/feature`。与每个能力关联的值是一个 JSON 对象数组，每个对象包含该能力特有的配置选项。

授权中的基本结构：

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

要在目标上运行的应用中使用所授予的能力，可以通过 CLI 的 `tailscale whois` 命令、[LocalAPI][xt-tailscale-localapi]、`tailscale serve` 的[应用能力请求头][docs-serve-app-capabilities]，或将 Tailscale 嵌入 Go 应用的 [`tsnet` Go 库][docs-tsnet]，从来源设备读取这些能力。

## 要求与限制

Tailscale 授权中的应用能力必须满足若干技术要求，并受到特定限制。本节列出适用于 tailnet 策略中应用能力的校验规则、来源与目标限制以及命名要求。

* 每条授权规则必须指定 `ip` 或 `app` 字段（或两者兼有）。这两个字段至少要存在一个。
* 能力名称不能为空。

在应用能力中可用的来源和目标存在某些限制。

* 使用 `autogroup:self` 作为目标时，来源必须是单个用户、组或基于角色的 autogroup（如 `autogroup:member`、`autogroup:admin`、`autogroup:owner` 等），以确保权限映射正确。
* 目标限制不允许将 `autogroup:shared` 或 `autogroup:danger-all` 作为能力的目标。
* 应用授权不能以 `autogroup:internet` 为目标，也不能使用 `autogroup:admin` 等管理类 autogroup 作为目标。

能力名称必须遵循特定格式，以保证组织有序并避免冲突。

* 格式必须遵循 `{domain}/{path}` 模式，例如 `example.com/cap/custom-app`。
* `tailscale.com` 和 `tailscale.io` 域名下的能力保留给 Tailscale 使用，用于开发你可以随产品使用的应用能力。
* 为自己的应用创建自定义能力时，应使用你控制的域名，以避免与内置能力或第三方集成发生潜在冲突。

## Tailscale 内置能力

Tailscale 提供一系列内置能力，用于在 Tailscale 产品或[社区项目][co-community-projects]中启用特定特性与功能。本节记录 Tailscale 提供的所有标准能力，说明其用途和配置选项，并给出在策略文件中使用它们的实用示例。

### Taildrive

[Taildrive][docs-taildrive] 扩展了 Tailscale 的文件共享能力，允许设备与其他设备共享和访问整个目录。它的能力（`tailscale.com/cap/drive`、`tailscale.com/cap/drive-sharer`）可以精确控制谁能在共享目录中读写。

`shares` 参数接受一个共享名称数组，或用 `"*"` 表示所有共享。`access` 参数决定访问是只读（`"ro"`）还是读写（`"rw"`）。`drive-sharer` 能力会自动添加到来源设备上，简化策略管理。管理员可以为不同共享指定不同访问级别，使用 `"*"` 则授予访问目标设备上所有共享的权限。

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

### Tailscale Kubernetes Operator

Tailscale 的 [Kubernetes 能力][docs-kubernetes]（`tailscale.com/cap/kubernetes`）通过细粒度权限控制和可选的会话录制，为 Kubernetes 集群提供安全访问。Operator 简化了集群管理，同时通过你的 tailnet 策略保持强安全性。借助该应用能力，你可以精确定义谁能访问哪些集群、拥有什么权限，还可以选择强制会话录制以满足审计与合规需求。

Kubernetes 能力的配置选项包括：

* `recorders`：由标签组成的数组，指定用于录制会话的设备。
* `enforceRecorder`：布尔值，决定在录制器不可用时连接是否失败。
* `impersonate`：定义 Kubernetes 模拟（impersonation）配置的对象。

该能力有两个重要的实现细节：

* 每条规则只允许一个录制器标签。
* 录制器标签必须在策略中定义。

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

[Tailscale PAM][docs-tailscale-pam] 是新一代特权访问管理（PAM）解决方案，为 tailnet 中的关键资源提供应用感知的访问。它的能力（`tailscale.com/cap/pam`）为 Linux 服务器、数据库、Kubernetes 集群等提供安全访问。它在访问发生的那一刻管控特权会话，并提供完整的会话审计和（在适用的地方）会话录制。

一条 Tailscale PAM 授权主要定义三件事：

* 谁可以访问某项服务。
* 他们可以访问哪个 Tailscale PAM 服务。
* 他们可以在该服务中做什么。

来源可以是身份、组、设备或标签。目标是某个 Tailscale PAM 服务。例如，考虑下面这个 `grants` 定义。

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

各字段的用途如下：

* `src` 标识请求访问的主体。在本例中是 `group:platform` 组。
* `dst` 标识 PAM 服务，即 `svc:production-database`。
* `app` 包含应用层的 PAM 权限，此处是对所有数据库的只读访问。

`app` 字段包含来源访问目标服务时生效的 PAM 权限。可用权限取决于 PAM 服务的类型，例如数据库、SSH、Kubernetes 或 Amazon S3。

有关 Tailscale PAM 授权的更多信息，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

\[Missing snippet: visual\_policy\_editor.mdx]

### `setec`

[`setec`][xt-gh-setec] 是一个由 Tailscale 维护并用于其生产环境的开源密钥管理工具。你可以用它为所有 tailnet 用户和应用提供对敏感凭证的安全访问。

密钥能力（`tailscale.com/cap/secrets`）精确定义哪些设备或用户可以对特定密钥或密钥路径执行哪些操作。这提供了一种集中、安全的方式来管理整个组织中的敏感信息，例如 API 密钥、凭证和证书。

密钥能力的配置围绕两个关键参数：

* `action`：允许的操作数组（`"get"`、`"put"`、`"info"`、`"activate"`、`"delete"`）。
* `secret`：支持通配符的密钥路径模式数组（例如 `"dev/*"`、`"prod/db/creds"`）。

路径模式支持灵活的通配符，让你可以按逻辑组织密钥，并在合适的粒度级别分配权限。不同组可以拥有不同权限级别，从而以最小权限方式管理密钥。

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

[TailSQL][xt-gh-tailsql] 是一个可以在你的 tailnet 中托管的 SQL 试验场。

TailSQL 需要一个应用能力（`tailscale.com/cap/tailsql`），其中定义一个 `src`，形式为允许的数据源数组，如 `"main"` 或 `"self"`。这决定了被授权的设备可以查询哪些数据存储，从而控制对 tailnet 配置与状态等潜在敏感信息的访问。

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

[Golink][xt-gh-golink] 是 tailnet 内部的链接缩短与管理服务，让团队为经常访问的 URL 创建易记的快捷方式。

Golink 应用能力（`tailscale.com/cap/golink`）要求对需要在服务中拥有提升管理权限的用户或设备，将 `admin` 参数设为 `true`。若只是为用户提供 Golink 的基础访问，无需指定应用能力。

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

## 自定义能力

你可以通过 [tsnet][docs-tsnet]、[`tailscale whois`][docs-cli-whois] CLI 命令、`tailscale serve` 的[应用能力请求头][docs-serve-app-capabilities]或 [LocalAPI][xt-tailscale-localapi] 与 Tailscale 集成，为自己的应用创建自定义应用能力。自定义能力让你能为自己的应用定义超越网络级访问控制的权限，指定用户在获得网络访问之后能在你的应用中执行哪些操作。

Tailscale 提供四种将应用能力与应用集成的方式：

* [**`tsnet`**][docs-tsnet] 是一个 Go 库，让你把 Tailscale 嵌入 Go 应用。你的应用会获得一个 Tailscale IP 地址和主机名，并内置 HTTPS 证书管理。整套方案以单个二进制文件部署，非常适合需要专用网络身份的微服务和内部工具。你可以用 `tsnet` 读取 tailnet 内向你的应用发起请求的设备所获得的那些能力。
* [**LocalAPI**][xt-tailscale-localapi] 适用于任何编程语言的应用。你的应用可以使用所在主机的 Tailscale 客户端查询应用能力，只需很少的架构改动即可加入 Tailscale 功能。
* [**`tailscale whois`**][docs-cli-whois] 为 tailnet 中的任意设备提供应用能力数据。`tailscale whois` CLI 命令最适合调试。在编写理解应用能力的代码时，查询 LocalAPI 通常是获取应用能力数据更好的选择。
* [**`tailscale serve`**][docs-serve-app-capabilities] 让你把运行在 tailnet 内某台设备上的应用（例如一个网站）共享给 tailnet 中的其他设备。当其他设备连接到该应用时，Serve 可以在请求头中把它们的能力转发给应用。

## 包含多种能力的完整示例

为了展示多种能力如何在一套完整策略中协同工作，本节给出一个完整的 tailnet 策略文件示例，其中为不同用户组和资源配置了多种能力。

下面的示例展示了一套更全面的 tailnet 策略，它组合多种能力构建出一个完整的访问控制系统，演示了如何将不同能力结合使用，以实现针对特定组织需求的精细权限模型。

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

这个示例展示了如何根据角色和职责为不同组分配不同能力。工程师可以在彼此之间共享文件并访问开发环境的密钥。DevOps 人员拥有更广的访问范围，包括强制会话录制的 Kubernetes 集群管理和完整的密钥管理。分析人员以查看者角色对 Grafana 面板只有有限访问，可以查看监控数据但无法做出更改。这种分层权限方式体现了 Tailscale 应用能力的灵活与强大。

[co-community-projects]: https://tailscale.com/community/community-projects

[docs-cli-whois]: /docs/reference/tailscale-cli#whois

[docs-kubernetes]: /docs/kubernetes

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-serve-app-capabilities]: /docs/features/tailscale-serve#应用能力标头

[docs-taildrive]: /docs/features/taildrive

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-pam]: /docs/privileged-access-management

[docs-tsnet]: /docs/features/tsnet

[xt-gh-golink]: https://github.com/tailscale/golink

[xt-gh-setec]: https://github.com/tailscale/setec

[xt-gh-tailsql]: https://github.com/tailscale/tailsql

[xt-tailscale-localapi]: https://pkg.go.dev/tailscale.com/ipn/localapi
