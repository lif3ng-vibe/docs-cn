---
title: "IP 集"
description: "IP 集是一种管理 IP 地址组的方式。它可以封装一组[目标][docs-targets]，例如 IP 地址、CIDR、主机、[autogroup][docs-targets-autogroups] 以及其他 IP 集。"
---

最后验证于 Oct 29, 2025

IP 集是一种管理 IP 地址组的方式。它可以封装一组[目标][docs-targets]，例如 IP 地址、CIDR、主机、[autogroup][docs-targets-autogroups] 以及其他 IP 集。Tailscale 会将 IP 集中的所有内容转换为 IP 地址范围列表。你可以使用 [`ipset` 语法][ar-syntax]在 [tailnet 策略文件][docs-tailnet-policy-file]中创建 IP 集，并在 [ACL][docs-access-control-policies] 和[授权][docs-grants]等[访问控制][docs-access-control]策略中[引用][ar-references]它们。

IP 集的主要好处在于，它让你能把网络的多个部分归入一个集合，从而可以对整个集合（而不是逐个 IP 地址、主机或子网）应用访问控制策略。

你可以通过多种方式使用 IP 集。例如：

* 独立于[子网][docs-subnets]、[标签][docs-tags]和[组][docs-acl-groups]等其他分组，定位并管理 tailnet 的逻辑切面。
* 在访问控制策略中定位某个子网，同时排除少数特定主机。
* [自定义 autogroup][ar-customize-autogroup-Internet]，将一些私有或公共子网排除在全局[出口节点][docs-exit-node]访问之外。
* 让你的 [tailnet 策略文件][docs-tailnet-policy-file]组织得更加模块化。

## 局限性

IP 集有以下限制：

* IP 集中不能包含[标签][docs-tags]、[用户][docs-user-roles]或[组][docs-acl-groups]。
* 不能对 IP 集使用循环引用。
* 唯一支持的 [autogroup][docs-autogroups] 是 `autogroup:internet`。这是因为 `autogroup:internet` 是唯一引用 IP 地址范围的 autogroup，其他 autogroup 引用的都是不受支持的目标，例如标签、用户和动态设备集合。

## 语法

`ipset` 是 tailnet 策略文件中的一个对象，用于定义一个或多个命名的 `ipset`。每个命名的 `ipset` 包含一个或多个[操作][ar-operations]，每个操作用于添加或移除一个[目标][ar-targets]。

以下示例演示了在 tailnet 策略文件中创建 `ipset` 的基本语法，其中 `<name>` 是 IP 集的名称，`<target>` 可以是 CIDR、IP 地址、主机、autogroup 或 IP 集。

```json
"ipsets": {
  "ipset:<name>": [
    "add <target>",
    "remove <target>"
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### 操作

`ipset` 语法支持两种操作：`add` 和 `remove`。每个命名的 IP 集可以包含一个或多个操作，这些操作按顺序处理。

除非命名的 [IP 集只使用 `add` 操作][ar-create-ipsets-with-only-add-operations]，否则你必须将操作类型写在[目标][ar-targets]之前。

| **操作**      | **说明**                              |
| ------------- | ------------------------------------- |
| `add`         | 将一个目标添加到命名的 IP 集。        |
| `remove`      | 从命名的 IP 集中移除一个目标。        |

### 目标

目标是你添加到命名 IP 集或从中移除的 [CIDR][xt-rfc-4632-cidrs]、IP 地址、[主机][docs-acl-hosts]、autogroup 或 IP 集。每个目标前必须有一个[操作][ar-operations]（`add` 或 `remove`），除非该命名 IP 集只添加目标（不移除任何 IP 地址）。

| **目标**         | **语法**                          | **示例**                                             |
| ---------------- | --------------------------------- | ---------------------------------------------------- |
| CIDR             | `<cidr>`                          | `192.0.2.0/24`、`2001:db8::/32`                      |
| IP 地址          | `<ip-address>`                    | `192.0.2.33`、`2001:db8::`                           |
| IP 地址范围      | `<ip-range-start>-<ip-range-end>` | `192.0.2.50-192.0.2.100`、`2001:db8::5-2001:db8::9`  |
| 主机             | `host:<name>`                     | `host:sql-server-1`                                  |
| autogroup        | `autogroup:internet`              | `autogroup:internet`                                 |
| IP 集            | `ipset:<name>`                    | `ipset:prod`                                         |

> **注意：**
>
> 此处的 Hosts 指 tailnet 策略文件的 [hosts][docs-acl-hosts] 分区，而非 MagicDNS 名称。

### 引用

你可以在 tailnet 策略文件的特定部分使用 `ipset:<name>` 格式引用命名的 IP 集，其中 `<name>` 是 IP 集的名称。

tailnet 策略文件中支持引用 IP 集的分区包括：

* [ACL][docs-access-control-policies]（源和目标）
* [授权][docs-grants]（源和目标）
* IP 集

## 示例

以下示例展示了如何使用 IP 集。

* [创建仅含 add 操作的 IP 集][ar-create-ipsets-with-only-add-operations]。
* [创建包含多个子网并排除单个 IP 地址的 IP 集][ar-create-an-ipset-that-adds-several-subnets-and-excludes-a-single-ip-address]。
* [创建排除另一个 IP 集的 IP 集][ar-create-an-ipset-that-excludes-another-ipset]。
* [在授权中引用 IP 集][ar-reference-ipsets-in-grants]。
* [在 ACL 中引用 IP 集][ar-reference-ipsets-in-acls]。
* [自定义 `autogroup:internet`][ar-customize-autogroup-internet]。

### 创建仅含 add 操作的 IP 集

以下 IP 集不移除任何[目标][ar-targets]，因此可以使用省略[操作类型][ar-operations]的简化语法（因为默认为 `add`）。

```json
"ipsets": {
  "ipset:prod": ["192.0.2.0/24"],
  "ipset:dev": [
    "198.51.100.0/24",
    "203.0.113.0/24",
    "host:sql-server-1",
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### 创建包含多个子网并排除单个 IP 地址的 IP 集

以下示例展示如何创建一个包含多个子网并排除单个 IP 地址的 IP 集。

```json
"ipsets": {
  "ipset:prod": [
    "add 192.0.2.0/24",
    "add 2001:db8::/32",
    "add 198.51.100.0/24",
    "add 203.0.113.0/24",
    "remove 192.0.2.33",
  ],
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### 创建排除另一个 IP 集的 IP 集

以下示例创建一个 `dev` IP 集和一个 `prod` IP 集。`prod` IP 集排除了 `dev` IP 集中的所有内容。

```json
"ipsets": {
  "ipset:dev": ["host:sql-server-1"],
  "ipset:prod": [
    "add 192.0.2.0/24",
    "add 198.51.100.0/24",
    "remove ipset:dev",
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### 在授权中引用 IP 集

以下示例展示如何创建[引用][ar-references] `dev` IP 集的[授权][docs-grants]。

```json
"grants": [
  {
    "src": ["group:devops"],
    "dst": ["ipset:dev"],
    "ip": ["80","443","22"]
  },
  {
    "src": ["group:dev"],
    "dst": ["ipset:dev"],
    "ip": ["80","443"],
    "via": ["tag:office-routers"],
  },
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

### 在 ACL 中引用 IP 集

以下示例展示如何创建[引用][ar-references] `prod` IP 集的 [ACL][docs-access-control-policies]。

```json
"acls": [
  {
    "src":    ["group:devops"],
    "dst":    ["ipset:prod:*"],
    "action": "accept",
  },
],
```

\[Missing snippet: visual\_policy\_editor.mdx]

### 自定义 `autogroup:internet`

你可以使用 IP 集配合 [`autogroup:internet`][docs-autogroups]，自定义（启用后）流经 tailnet 中出口节点的流量。

以下示例创建一个名为 `internet` 的 IP 集，通过以下方式自定义 `autogroup:internet`：

* 添加 `autogroup:internet`。
* 移除生产应用网关（`ipset:cdn-edge`）。
* 移除公开可访问的合作伙伴网络（`ipset:partner-net`）。
* [授权][docs-grants] `internet` IP 集（前往互联网的流量的一个子集）访问西雅图和伦敦办公室的[出口节点][docs-exit-node]。

```json
"ipsets": {
  "ipset:internet": [
    "add autogroup:internet",
    "remove ipset:cdn-edge",
    "remove ipset:partner-net"
  ],
  "ipset:cdn-edge": ["8.21.9.6", "8.21.9.7", "8.21.9.13", "8.21.9.14"],
  "ipset:partner-net": ["52.23.40.0/24"]
},
"grants": [
  {
    "src": ["group:sea"],
    "dst": ["ipset:internet"],
    "ip":  ["*"],
    "via": ["tag:officerouter-sea"],
  },
  {
    "src": ["group:lhr"],
    "dst": ["ipset:internet"],
    "ip":  ["*"],
    "via": ["tag:officerouter-lhr"],
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

[ar-create-an-ipset-that-adds-several-subnets-and-excludes-a-single-ip-address]: #创建包含多个子网并排除单个-ip-地址的-ip-集

[ar-create-an-ipset-that-excludes-another-ipset]: #创建排除另一个-ip-集的-ip-集

[ar-create-ipsets-with-only-add-operations]: #创建仅含-add-操作的-ip-集

[ar-customize-autogroup-internet]: #自定义-autogroupinternet

[ar-operations]: #操作

[ar-reference-ipsets-in-acls]: #在-acl-中引用-ip-集

[ar-reference-ipsets-in-grants]: #在授权中引用-ip-集

[ar-references]: #引用

[ar-syntax]: #语法

[ar-targets]: #目标

[docs-access-control-policies]: /docs/features/access-control/acls

[docs-access-control]: /docs/features/access-control

[docs-acl-groups]: /docs/reference/syntax/policy-file#群组groups

[docs-acl-hosts]: /docs/reference/syntax/policy-file#主机

[docs-autogroups]: /docs/reference/syntax/policy-file#autogroup

[docs-exit-node]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-targets-autogroups]: /docs/reference/targets-and-selectors#autogroup

[docs-targets]: /docs/reference/targets-and-selectors

[docs-user-roles]: /docs/reference/user-roles

[xt-rfc-4632-cidrs]: https://www.rfc-editor.org/rfc/rfc4632.html
