---
title: "授予 MCP 工具访问权限"
description: "\\[Missing snippet: aperture\\_mcp\\_grant\\_deprecation\\_note.mdx]"
---

最后验证于 Sep 28, 2026

\[Missing snippet: aperture\_mcp\_grant\_deprecation\_note.mdx]

[连接器][docs-aperture-connectors]让用户可以通过 Aperture 网关访问 MCP 工具、资源、模板和 HTTP 端点。访问默认拒绝。请为每个用户或组所需的能力配置授权。

连接器授权与[模型访问授权][docs-grant-model-access]结构相同，只是用 `connectors` 字段承载连接器能力。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个至少配置了一个[连接器][docs-aperture-connectors-config]的 [Aperture 网关][docs-get-started]。
* Aperture 管理仪表盘的[管理员访问权限][docs-set-up-admin-access]。
* 已拥有 `role` 授权并能通过网络访问 Aperture 网关的用户。如果没有，请先完成[授予模型访问权限][docs-grant-model-access]。

## 配置连接器访问授权

在授权中添加 `connectors` 字段，控制用户可以访问哪些连接器能力。`connectors` 字段接受完全限定名（FQN）glob 模式的数组，格式为 `"connectorID/category/resource"`。

\[Missing snippet: aperture\_admin\_nav.mdx] 在 `tailscale.com/cap/aperture` 能力数组中添加 `connectors` 条目。

下面的示例授予 `group:ai-users` 中的用户访问内置 Aperture 连接器的所有能力、GitHub 连接器的所有能力，以及 `local`（你在 [`connectors.servers`][docs-aperture-connectors-config] 配置中定义的示例 MCP 连接器）的所有工具：

```json
{
  "grants": [
    {
      "src": ["group:ai-users"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" },
          { "connectors": ["aperture/**", "github/**", "local/tools/*"] }
        ]
      }
    }
  ]
}
```

匹配 `group:` 来源（如上例中的 `group:ai-users`）需要在 Aperture 网关上启用[可见组][docs-visible-groups]。

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

### 连接器能力字段

`tailscale.com/cap/aperture` 下的每个能力条目都可以包含 `connectors` 字段：

| 字段         | 格式            | 说明                                                                               |
| :----------- | :-------------- | :--------------------------------------------------------------------------------- |
| `connectors` | FQN glob 数组   | 按 `"connectorID/category/resource"` 模式授予连接器能力的访问权限。                |

可用的授权类别如下：

| 类别        | 适用对象        | 说明                                   | 示例                   |
| :---------- | :-------------- | :------------------------------------- | :--------------------- |
| `tools`     | MCP 连接器      | MCP 工具                               | `"local/tools/search"` |
| `resources` | MCP 连接器      | MCP 资源                               | `"local/resources/*"`  |
| `templates` | MCP 连接器      | MCP 资源模板                           | `"local/templates/*"`  |
| `proxy`     | HTTP 连接器     | 对 `/v1/connectors/<id>/` 的代理访问   | `"github/proxy"`       |

`proxy` 授权会放行连接器的整个 `/v1/connectors/<id>/` 路径，没有按路径的粒度。

模式使用与模型授权相同的 glob 语法：`*` 匹配单个路径段，也匹配段内的任意字符（例如 `get_*` 匹配以 `get_` 开头的工具名）；`**` 匹配零个或多个段。

格式错误的模式（例如包含两个以上斜杠，或类别段无法识别）会被静默丢弃，而不是报错。授权模式里的一个拼写错误意味着什么也授不了，因此请确认每个模式都能匹配某个已存在的连接器能力。

> **注意：**
>
> 已弃用的 `mcp_tools`、`mcp_resources` 和 `mcp_templates` 授权字段仍然可用。新配置应改用 `connectors` 字段。

### 模式示例

下面的示例展示如何用 FQN 模式授予特定连接器能力的访问权限：

| 模式               | 匹配                                                                                   |
| :----------------- | :-------------------------------------------------------------------------------------- |
| `"local/tools/*"`  | `local` 连接器的所有 MCP 工具                                                          |
| `"local/**"`       | `local` 的所有能力                                                                     |
| `"github/proxy"`   | 对 `github` HTTP 连接器的代理访问                                                      |
| `"github/**"`      | 对 `github` 连接器的所有访问                                                           |
| `"aperture/**"`    | 内置 Aperture 系统连接器（按 ID）                                                      |
| `"*/tools/search"` | 任意连接器上的 `search` 工具                                                           |
| `"**"`             | 所有连接器的所有能力                                                                   |
| `"label:system"`   | 每个带 `system` 标签的连接器，默认即内置的 `aperture` 连接器                            |

FQN 模式至少要包含连接器 ID。要授予连接器暴露的一切能力，使用 `"connectorID/**"`。

### 按标签授予访问权限

除 FQN 模式外，`connectors` 字段还接受 `label:<name>` 模式。标签是设置在连接器上的扁平字符串，因此一个模式就能覆盖一组随时间变化的连接器，无需修改策略：

```json
{ "connectors": ["label:sales"] }
```

标签模式在两个方面与 FQN 模式不同。其一是匹配是精确匹配而非 glob 匹配，与 Tailscale 授权中其他位置的 `tag:` 和 `group:` 一致，因此 `label:team.*` 匹配不到任何东西。其二是匹配的标签会在所有类别和资源上授予整个连接器，包括 `proxy`，因此标签无法表达工具级别的访问。单个工具或只读子集请用 FQN 模式，连接器级别的策略才用标签。

由于授权是叠加的，标签只会增加访问。给连接器打上 `restricted` 标签并不能限制它，持有 `"**"` 的用户仍然可以访问。标签语法、保留的 `system` 标签和完整任务，请参阅[按标签授予连接器访问权限][docs-grant-connector-access-by-label]。

### 被拒绝时是什么样的

当用户缺少匹配的授权时，Aperture 会隐藏该能力而不是暴露它。用户无法访问的工具和资源不会出现在工具或资源列表中；直接调用未授权的工具会返回"unknown tool"错误（资源则返回"unknown resource"）。请求未授权的 HTTP 连接器代理路径会返回 `403 access denied`。

如果某个能力缺失或请求被意外拒绝，请检查是否缺少授权模式或模式拼写有误。

## 内置连接器

Aperture 内置一个 `aperture` 系统连接器。它暴露一个 `list_connectors` 工具（对模型显示为 `aperture_list_connectors`），用于发现通过 Aperture 可用的 HTTP API 连接器。只有配置了至少一个 HTTP 连接器时，该工具才会注册。

新建的 Aperture 网关已经授予了这个连接器。默认配置包含以下授权，它匹配内置 `aperture` 连接器上的 `system` 标签：

```json
{ "connectors": ["label:system"] }
```

系统连接器在授权路径中并没有被特殊对待，因此删除该授权会让 `aperture` 工具变得不可访问。你也可以按 ID 指定该连接器，这是触达单个系统工具的唯一方式：

```json
{ "connectors": ["aperture/**"] }
{ "connectors": ["aperture/tools/list_connectors"] }
```

`aperture` 连接器 ID 是保留的，不能用于自定义连接器；`system` 标签同样如此。

Aperture 还为 `Tailnet` 和 `TailnetSSH` 连接器提供工具。它们是 `connectors.servers` 条目而不是系统连接器，因此 `system` 标签永远不会匹配它们，你需要按 ID 授予，例如 `{"connectors": ["TailnetSSH/tools/list_machines"]}`。参阅[内置连接器][docs-connectors-built-in]。

> **注意：**
>
> 连接器访问遵循三层授权模型：
>
> 1. **配置**：连接器必须在你的 [`connectors.servers`][docs-aperture-connectors-config] 配置中声明。
> 2. **授权**：用户需要一条匹配的 `connectors` 授权模式。授权决定了用户可访问的上限。
> 3. **凭证**：对使用按用户 OAuth 的连接器，用户必须先完成 OAuth 授权流程才能访问该连接器。

## 后续步骤

* [按标签授予连接器访问权限][docs-grant-connector-access-by-label]：给连接器分组，用一个模式授予整组访问权限。
* 了解[连接器][docs-aperture-connectors]及其配置方式。
* [授予模型访问权限][docs-grant-model-access]：管理用户可以访问哪些 LLM 模型。
* 完整授权语法请参阅[授权配置参考][docs-aperture-grants]。
* [设置按用户的支出限额][docs-set-per-user-spending-limits]：管理跨模型与工具的成本。

[docs-aperture-connectors-config]: /docs/aperture/configuration#connectors

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-connectors-built-in]: /docs/aperture/connectors/built-in-connectors

[docs-get-started]: /docs/aperture/get-started

[docs-grant-connector-access-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-visible-groups]: /docs/aperture/visible-groups
