---
title: "Aperture 授权的工作原理"
description: "了解 Aperture 授权模型，包括默认拒绝的访问、只允许的叠加规则、能力匹配，以及多条授权同时适用时 Aperture 如何解析优先级。"
---

最后验证于 Sep 29, 2026

Aperture 使用*授权*（grant）控制对模型和 MCP 能力的访问。设置步骤请参阅[后续步骤][ar-next-steps]。

## 授权模型

Aperture 授权构建在 [Tailscale 授权框架][docs-tailscale-grants]之上，并共享两个特性：

* **默认拒绝。** 能通过网络访问 Aperture 网关，并不意味着能访问模型或 MCP 能力。每种能力都需要一条匹配的授权。
* **叠加且只允许。** 每条授权只会*增加*访问权限，没有拒绝规则。用户的有效访问权限是所有 `src` 匹配其身份的授权的并集。要收回访问权限，就收窄或删除提供它的授权；你无法用另一条规则做减法。

如果你熟悉 tailnet 策略文件，这就是关键区别：授权中没有 `deny`。策略完全通过你所允许的内容来表达。

## 授权的结构

一条授权将一组身份与一组能力配对：

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

* **`src`** 列出授权适用于哪些人。条目可以是单个用户（`"alice@example.com"`）、按电子邮件匹配的 SCIM 组、Tailscale 组（`"group:ai-users"`）或标签（`"tag:ci"`）。对于连接到 Aperture 的非用户设备（例如 CI 运行器或服务），用标签授予权限。匹配 `group:` 条目需要启用[可见组][ar-groups-in-grants]。
* **`app["tailscale.com/cap/aperture"]`** 是一组能力对象，描述匹配到的身份可以做什么。常见能力包括表示用户权限级别的 `role`、对 `provider/model` 名称做 glob 匹配的 `models`，以及 MCP 字段 `mcp_tools`、`mcp_resources` 和 `mcp_templates`。自定义头部、配额、钩子和 CORS 设置等运维类字段也放在这里。

能力字段的完整列表及其语法请参阅[授权配置参考][docs-aperture-grants]。

## Aperture 授权字段

Aperture 配置中的授权使用两个字段：

* **`src`** 的含义与网络授权中相同，接受用户、SCIM 组、Tailscale 组和标签。匹配是精确匹配，因此 `tag:prod-*` 这类 glob 不会生效。
* **`app["tailscale.com/cap/aperture"]`** 存放一组固定的 Aperture 定义字段，而不是自由格式的应用能力。资源字段 `models`、`connectors` 和各 `mcp_*` 字段接受针对斜杠分隔名称的 glob 模式：其中 `*` 匹配一个片段，`**` 匹配零个或多个片段。`role` 取精确字符串 `"user"` 或 `"admin"`。该字段控制访问，因此 Aperture 授权的大部分内容都在这里。

`connectors` 字段还接受 `label:<name>`，匹配带有该[标签][docs-aperture-connectors-labels]的所有连接器。与 `src` 中的 `tag:` 和 `group:` 一样，标签匹配是精确匹配，不会展开通配符。

匹配的标签会授予对整个连接器的访问。由于授权是叠加的，标签模式只会扩大访问而绝不会限制访问。因此 `restricted` 这类敏感性标签只是记录意图，并不能限制访问。请参阅[按标签授予连接器访问权限][docs-grant-by-label]。

新部署的 Aperture 网关依赖这种形式。出厂配置授予所有用户访问所有模型的权限，并为内置的 `aperture` 系统连接器授予 `label:system`。对不匹配这些或其他授权的请求，Aperture 一律拒绝。要限制访问，请收窄或删除出厂授权。

`dst` 和 `ip` 字段被省略，因为目标始终是 Aperture 设备。只有当你在 tailnet 策略文件中定义同一条授权时它们才适用。相关对比与转换步骤请参阅 [Aperture 授权与 tailnet 策略文件授权的对比][docs-aperture-vs-tailnet-grants]。

## Aperture 如何评估请求

Aperture 在请求时根据连接用户的 Tailscale 身份解析访问权限：

1. **识别用户。** Aperture 通过 [Tailscale 身份][docs-tailscale-identity]认证每条连接，因此没有单独的登录步骤。
2. **收集匹配的授权。** Aperture 收集所有 `src` 匹配该用户登录名、电子邮件或组成员关系的授权。
3. **合并能力。** 所有匹配授权的能力合并为该用户的有效访问权限。
4. **检查请求的动作。** Aperture 将模型与合并后的 `models` 模式匹配，将 MCP 项与 `mcp_*` 模式匹配。对[模型别名][docs-model-aliases]，匹配的是解析后的目标，而不是别名名称。随后应用下文的优先级规则。
5. **允许或拒绝。** 如果某项能力授予了所请求的访问权限，请求继续；如果没有任何匹配，Aperture 拒绝请求，与默认拒绝保持一致。

## 优先级与冲突

由于授权是叠加的，同一用户通常会被多条授权覆盖。当它们重叠时，由两条解析规则决定结果：

* **角色：最高权限获胜。** 如果匹配的授权同时赋予 admin 和 user 角色，用户将获得 admin 级权限。
* **模型模式：最具体的 glob 获胜。** 当多个 `models` 模式都匹配目标模型时，Aperture 采用最具体的那个。对别名，Aperture 检查解析后的目标。例如，`"anthropic/claude-opus-5-5"` 优先于 `"anthropic/**"`，后者又优先于 `"**"`。当两个模式同样具体时，配置中出现较早的条目获胜。

这些规则决定在合并后的访问权限中哪个匹配条目生效，它们不会削减访问权限。

## 授权中的组

要在授权的 `src` 中使用 `group:` 标识符，Aperture 网关需要组成员关系信息。Tailscale 默认不发送该信息。在你的 tailnet 策略文件中为 Aperture 设备添加 `tailscale.com/visible-groups` 节点属性，即可启用[可见组][docs-visible-groups]。此后 Aperture 会在用户发起请求时检查组成员关系。

## 后续步骤

* [授予模型访问权限][docs-grant-model-access]：配置授权，控制每个用户或组可以使用哪些模型。
* [授予 MCP 工具访问权限][docs-grant-mcp-tool-access]：把授权扩展到 MCP 工具、资源和模板。
* [按标签授予连接器访问权限][docs-grant-by-label]：用标签给连接器分组，用一个模式授予整组访问权限。
* [设置管理员访问权限][docs-set-up-admin-access]：授予管理仪表盘和配置的访问权限。
* [Aperture 的工作原理][docs-how-aperture-works]：了解身份、路由和遥测如何协同工作。

[ar-groups-in-grants]: #授权中的组

[ar-next-steps]: #后续步骤

[docs-aperture-connectors-labels]: /docs/aperture/connectors/reference#connector-labels

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-aperture-vs-tailnet-grants]: /docs/aperture/reference/aperture-vs-tailnet-grants

[docs-grant-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-how-aperture-works]: /docs/aperture/how-aperture-works

[docs-model-aliases]: /docs/aperture/model-aliases

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-tailscale-grants]: /docs/features/access-control/grants/grants-app-capabilities

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-visible-groups]: /docs/aperture/visible-groups
