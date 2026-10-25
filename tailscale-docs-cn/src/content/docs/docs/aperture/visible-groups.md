---
title: "Aperture 的可见组"
description: "使用 Tailscale 组和 SCIM 组控制对 Aperture 模型和管理员角色的访问。"
---

最后验证于 Sep 28, 2026

可见组（visible groups）让 Aperture 能够解析 Tailscale 组成员身份，使你可以在[授权的 `src` 字段][docs-aperture-grants]中使用 `group:` 标识符。没有可见组时，Aperture 只能匹配单个登录名（`alice@example.com`）和带标签的设备（`tag:ci-runner`）。启用可见组后，你可以为整个团队授予模型访问权限或管理员角色。

Aperture 支持两类组：

* **Tailscale 组**：定义在你的 [tailnet 策略文件][docs-tailnet-policy-file]中（例如 `group:engineering`）。
* **SCIM 组**：[从你的身份提供方（IdP）同步][docs-user-group-provisioning]（例如 `group:sales@example.com`，或通过电子邮件匹配如 `engineering@example.com`）。

## 工作原理

默认情况下，Tailscale 控制平面不会向设备发送组成员身份信息。要让组对 Aperture 可用，你需要把 `tailscale.com/visible-groups` [节点属性（node attribute）][docs-node-attributes]添加到 tailnet 策略文件中，并以 Aperture 设备为目标。配置之后，Aperture 设备会收到连接用户的组成员身份数据，Aperture 便能评估授权 `src` 字段中的 `group:` 条目。

关于可见组在 Tailscale 平台层面如何工作的详细说明，参见 [Tailscale 客户端上的组可见性][docs-group-visibility-clients]。

## 前提条件

开始之前，确保你具备以下条件：

* 一台 [Aperture 网关][docs-get-started]，且至少配置了一个提供商。
* 编辑 [tailnet 策略文件][docs-tailnet-policy-file]的权限。你需要是 [Owner、Admin 或 Network admin](/docs/reference/user-roles)。
* （可选）如果你想匹配身份提供方的组，需已配置 [SCIM 组][docs-user-group-provisioning]。

## 配置节点属性

把 `tailscale.com/visible-groups` [节点属性][docs-node-attributes]添加到你的 tailnet 策略文件中。这会告诉控制平面哪些组对 Aperture 设备可见。

1. 前往管理控制台的 [Access controls](https://console.tailscale.com/admin/acls/file) 页面。
2. 添加一条 `nodeAttrs` 条目，以你的 Aperture 设备为目标，并指定要暴露哪些组。

```json
"nodeAttrs": [
  {
    "target": ["tag:aperture"],
    "app": {
      "tailscale.com/visible-groups": [
        {
          "groups": ["*"]
        }
      ]
    }
  }
]
```

`"groups": ["*"]` 通配符让所有组对 Aperture 设备可见。要把可见性限制到特定组，请显式列出它们：

```json
"groups": [
  "group:engineering",
  "group:ai-users",
  "group:sales@example.com"
]
```

> **注意：**
>
> tailnet 策略文件校验不会检查你列出的组是否存在于你的 tailnet 中。

## 在 Aperture 授权中使用组

配置节点属性之后，你可以在授权 `src` 字段中使用 `group:` 标识符。Aperture 会在请求时使用连接用户的身份评估组成员身份。

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

### 为组授予模型访问权限

以下示例向 `group:ai-users` 的成员授予所有 Anthropic 模型的访问权限：

```json
{
  "grants": [
    {
      "src": ["group:ai-users"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" }
        ]
      }
    }
  ]
}
```

### 为组授予管理员权限

以下示例向 `group:aperture-admins` 的成员授予管理员访问权限，并向 `group:ai-users` 的成员授予标准用户权限：

```json
{
  "grants": [
    {
      "src": ["group:aperture-admins"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "admin" }
        ]
      }
    },
    {
      "src": ["group:ai-users"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" }
        ]
      }
    }
  ]
}
```

如果用户同时匹配两条授权，管理员角色优先。

### 匹配 SCIM 组

你可以使用 `group:` 前缀或直接使用组电子邮件来匹配 SCIM 组：

* `"group:sales@example.com"`：匹配具有该电子邮件的 SCIM 组的成员。
* `"sales@example.com"`：同样按电子邮件匹配 SCIM 组成员。

两种格式都可用于授权 `src` 字段。

## 验证组可见性

打开管理控制台的 [**Quota Usage** 页面][docs-admin-quota-usage]。确认组成员拥有其组被授予的配额。

## 后续步骤

* [为模型授予访问权限][docs-grant-model-access]：配置用户和组可以访问哪些模型。
* [设置管理员访问][docs-set-up-admin-access]：使用组分配管理员角色。
* [Aperture 配置参考][docs-aperture-configuration]：授权的完整语法，包括 `src` 匹配模式。
* [Tailscale 客户端上的组可见性][docs-group-visibility-clients]：可见组工作方式的平台级细节。

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-group-visibility-clients]: /docs/features/group-visibility-clients

[docs-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[docs-admin-quota-usage]: /docs/aperture/reference/dashboard-admin#quota-usage
