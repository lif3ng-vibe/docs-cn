---
title: "设置管理员访问权限"
description: "新建的 Aperture 网关默认授予所有人管理员权限。在团队开始使用 Aperture 之前，请把管理员权限限制给特定用户，让只有指定的管理员可以编辑设"
---

最后验证于 Sep 28, 2026

新建的 Aperture 网关默认授予所有人管理员权限。在团队开始使用 Aperture 之前，请把管理员权限限制给特定用户，让只有指定的管理员可以编辑设置并查看所有用户的数据。

管理员可以：

* 通过 Aperture 管理仪表盘的 **Administration** 页面编辑 [Aperture 配置][docs-aperture-configuration]。
* 查看所有用户的会话日志和组织范围的使用数据。
* 访问所有配额桶并通过 API 补充额度。
* 访问 `/metrics` Prometheus 端点（在被授予 `read_metrics` 时）。

经过认证的 tailnet 用户默认可以使用聊天门户，并在 `/sessions`、`/usage` 和 `/quotas` 查看自己的会话、用量和配额。他们无法打开管理仪表盘或查看组织范围的数据。匹配的授权可以用 `enable_portal: false` 让非管理员用户退出门户，而显式的 `enable_portal: true` 会覆盖更宽泛的退出设置。管理员始终保留门户访问。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个至少配置了一个提供商的 [Aperture 网关][docs-get-started]。
* `/admin/` 处 Aperture 管理仪表盘的访问权限。
* 你的 Tailscale 登录名（例如 `alice@example.com`）。

## 限制管理员权限

[默认配置][docs-default-config]通过 `"src": ["*"]` 把 admin 角色授予所有人。请把它替换为针对特定用户的显式管理员授权。

> **警告：**
>
> 在为自己添加显式管理员授权之前，不要删除通配符管理员授权。对于会移除保存者本人管理员权限的保存操作，Aperture 会通过管理仪表盘和配置 API 加以阻止。

1. \[Missing snippet: aperture\_admin\_nav.mdx]
2. 找到带 `{ "role": "admin" }` 和 `"src": ["*"]` 的授权。
3. 把 `"*"` 替换为你管理员的 Tailscale 登录名。

下面的示例把管理员权限授予两个特定用户：

```json
{
  "grants": [
    {
      "src": ["alice@example.com", "bob@example.com"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "admin" }
        ]
      }
    },
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" }
        ]
      }
    }
  ]
}
```

这份配置让 `alice@example.com` 和 `bob@example.com` 拥有管理员权限，其他用户获得标准用户权限。当用户同时匹配两条授权时，管理员权限优先，因此 Alice 和 Bob 获得的是 admin 级权限。

### 使用 Tailscale 组

对于通过 Tailscale 组管理访问的组织，可以在 Aperture 配置中用组来分配 admin 角色。这样你就能通过 Tailscale 组定义集中管理管理员成员。组匹配需要为 Aperture 网关启用[可见组][docs-visible-groups]。

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

如果多条授权同时匹配一个用户，admin 角色优先。完整语法请参阅[授权配置参考][docs-aperture-grants]。

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## 验证管理员权限

限制管理员权限后，验证配置是否正确：

1. 打开 `/admin/settings/config`（**Administration** > **Configuration** 页面）。如果你能查看并编辑配置，说明你的管理员权限已生效。
2. 以非管理员身份登录，确认在门户访问启用时打开 `/admin/` 会重定向到 `/chat`。如果有匹配的授权设置了 `enable_portal: false`，且没有匹配的授权显式设置 `enable_portal: true`，请求则会返回拒绝访问页面。

## 后续步骤

* [授予模型访问权限][docs-grant-model-access]：定义每个用户或组可以使用哪些模型。
* [设置聊天界面][docs-set-up-chat-ui]：让用户直接在浏览器中与模型对话。
* [设置按用户的支出限额][docs-set-per-user-spending-limits]：管理成本。
* 各个管理员可见页面的细节请参阅 [Aperture 管理仪表盘参考][docs-web-dashboard]。

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-default-config]: /docs/aperture/configuration#default-configuration

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-set-up-chat-ui]: /docs/aperture/how-to/set-up-chat-ui

[docs-visible-groups]: /docs/aperture/visible-groups

[docs-web-dashboard]: /docs/aperture/reference/dashboard-admin
