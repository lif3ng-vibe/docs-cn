---
title: "使用 ACL 管理权限"
description: "Tailscale 的[访问控制][docs-access-control]方法论遵循[最小权限][ln-least-privilege]与[零信任][docs-zero-trust]原则。有两种方式可以为 tailnet 定义访问控制"
---

最后验证于 Jan 5, 2026

\[Missing snippet: acls\_legacy\_note.mdx]

> **注意：**
>
> ACL 在所有套餐上均可用，但某些功能在部分套餐上可能受限。

Tailscale 的[访问控制][docs-access-control]方法论遵循[最小权限][ln-least-privilege]与[零信任][docs-zero-trust]原则。为 tailnet 定义访问控制有两种方式：访问控制列表（ACL）和授权（grant）。两种方式都遵循默认拒绝原则，并使用[声明式 huJSON 语法][docs-policy-syntax]定义在 [tailnet 策略文件][docs-tailnet-policy-file]中。

> **注意：**
>
> 下面的相关视频提供了更多背景与示例。

[Tailscale ACL 详解（视频）](https://www.youtube.com/watch?v=Jn8_Sh4r8d4)

ACL 是在 tailnet 内管理访问的传统[网络层][xt-wiki-network-layer]方式：你定义[一组设备或用户][docs-targets]，指定他们可以访问其他设备上的哪些端口。你创建的每条 ACL 都必须定义一个来源和一个目标。借助 ACL，你可以为 Tailscale 网络（即 tailnet）上的用户和设备精确设定访问控制。

```json
{
  "acls": [
    {
      "action": "accept",
      "src": [ <list-of-sources> ], // These sources (devices or users)
      "dst": [ <destination>:<port> ], // can access these destination devices on their defined ports
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

初次创建 tailnet 时，[默认 tailnet 策略文件][docs-acl-samples-allow-all]会允许 tailnet 内所有设备互相通信。你可以按需修改策略文件（包括[编辑 ACL][ar-edit-acls]）。

ACL 具有默认拒绝、有向、本地执行的特性，并且不影响本地网络流量。

* **默认拒绝**。采用默认拒绝策略，未经明确授权的设备之间无法通信。不过，如果 tailnet 策略文件中没有 `acls` 部分，Tailscale 会应用[默认全部允许策略][docs-acl-samples-allow-all]。
* **有向**。允许来源连接到目标，不代表目标可以连接到来源（除非有策略明确允许）。
* **本地执行**。设备依据分发给 tailnet 内所有设备的访问规则对入站连接进行控制。规则在每个设备上直接执行，无需 Tailscale 协调服务器（coordination server）进一步参与。
* ACL 不影响设备能访问其本地网络上的哪些资源。

如需了解 Tailscale 访问控制方案的更多背景，参见 [RBAC like it was meant to be][bl-rbac-meant-to-be]。

> **警告：**
>
> 如果你不定义任何访问控制策略，Tailscale 会应用[默认全部允许的 ACL 策略][docs-acl-samples-allow-all]。要拒绝所有流量，请在 tailnet 策略文件中为 `acls` 部分使用[空对象][docs-acl-samples-deny-all]。

## 编辑 ACL

你可以通过管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面、[GitOps for Tailscale ACLs][docs-gitops-acls] 或 [Tailscale API][docs-api] 编辑 tailnet 的访问规则。更多信息参见[编辑 ACL][docs-edit-policies]。

要创建访问控制策略，请参考 [tailnet 策略文件语法][docs-policy-syntax]；常见策略示例见 [ACL 示例][docs-acl-samples]。

## 各套餐的可用性

ACL 在所有套餐上均可用，但某些功能在部分套餐上可能受限。

可用性

所有套餐

Premium 与 Enterprise 套餐

访问规则可针对……

任意目标
Tailscale IP
子网 CIDR 范围
Autogroups
组
用户
标签
主机
IP 集

访问规则可指定……

端口
协议

ACL 可包含的部分……

acl

groups

hosts

tests

tagOwners

autoApprovers

nodeAttrs

postures，仅限默认设备态势（device posture）属性

ipsets

acl

groups

hosts

tests

tagOwners

autoApprovers

postures，支持默认、自定义与第三方属性

ipsets

[ar-edit-acls]: #编辑-acl

[bl-rbac-meant-to-be]: https://tailscale.com/blog/rbac-like-it-was-meant-to-be

[docs-access-control]: /docs/features/access-control

[docs-edit-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-acl-samples]: /docs/reference/examples/acls

[docs-acl-samples-allow-all]: /docs/reference/examples/acls#allow-all-default-acl

[docs-acl-samples-deny-all]: /docs/reference/examples/acls#deny-all

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-api]: /docs/reference/tailscale-api

[docs-gitops-acls]: /docs/gitops

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-targets]: /docs/reference/targets-and-selectors

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege

[xt-wiki-network-layer]: https://en.wikipedia.org/wiki/Network_layer
