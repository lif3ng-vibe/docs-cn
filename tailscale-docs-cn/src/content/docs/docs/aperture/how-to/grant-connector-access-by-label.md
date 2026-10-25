---
title: "按标签授予连接器访问权限"
description: "\\[Missing snippet: aperture\\_mcp\\_grant\\_deprecation\\_note.mdx]"
---

最后验证于 Sep 28, 2026

\[Missing snippet: aperture\_mcp\_grant\_deprecation\_note.mdx]

标签（label）是附加到[连接器][docs-aperture-connectors]上的一个扁平字符串。授权模式 `label:<name>` 匹配带有该标签的每个连接器，因此一条授权就能覆盖整组连接器，并且在新增连接器时依然有效。标签是对[授予 MCP 工具访问权限][docs-grant-mcp-tool-access]中所述完全限定名（FQN）模式的补充：FQN 模式针对单个连接器，标签针对一组。

每个新建的 Aperture 网关都自带一条标签授权。默认配置授予 `label:system`，内置 Aperture 工具正是借此无需任何设置即可触达用户。这条授权也是你可以直接照搬的现成示例：承载内置工具的模式，与你自己连接器使用的模式相同。

标签不会改变任何现有配置的行为。点名连接器 ID 的授权行为与之前完全一致，没有标签的连接器仍然只能通过其 ID 访问。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个至少配置了一个[连接器][docs-aperture-connectors-config]的 [Aperture 网关][docs-get-started]。
* Aperture 管理仪表盘的[管理员访问权限][docs-set-up-admin-access]。
* 已拥有 `role` 授权并能通过网络访问 Aperture 网关的用户。如果没有，请先完成[授予模型访问权限][docs-grant-model-access]。

## 第 1 步：为连接器打标签

在打标签之前先想清楚标签代表什么，因为一条授权的清晰程度取决于它点名的标签。除 `system` 外，Aperture 不保留任何专用词汇，只校验你使用的字符，因此体系由你自行选择。以下三种体系可以覆盖大多数 Aperture 网关：

| 用途                                   | 示例                                                                        |
| :------------------------------------- | :-------------------------------------------------------------------------- |
| 连接器数据的敏感程度                   | `public`、`private`、`restricted`                                           |
| 哪个团队拥有或需要该连接器             | `eng`、`marketing`、`sales`                                                 |
| 连接器的来源                           | `system`，自动应用于内置的 `aperture` 系统连接器                            |

在仪表盘中为连接器打标签：

\[Missing snippet: aperture\_admin\_nav.mdx]

1. 选择要打标签的连接器，然后进行编辑。
2. 在 **Labels** 字段中输入标签并按 Enter。对每个标签重复此操作。一个连接器可以带任意多个你需要的标签。
3. 保存连接器。

**Labels** 字段会提示其他连接器上已在使用的标签。选择提示项而不是输入近似重复的写法，可以让整个网关保持同一套词汇，这一点很重要，因为授权匹配标签是精确匹配。连接器列表显示 **Labels** 列，你可以一眼浏览全部词汇。

你也可以在配置中直接用 `labels` 字段设置标签：

```json
{
  "connectors": {
    "servers": {
      "salesforce": {
        "protocol": "mcp",
        "url": "https://api.salesforce.com/platform/mcp/v1/platform/sobject-all",
        "labels": ["sales", "restricted"]
      },
      "analytics": {
        "protocol": "mcp",
        "url": "http://mcp-analytics.example.ts.net:8080/v1/mcp",
        "labels": ["eng", "restricted"]
      }
    }
  }
}
```

每个标签必须匹配 `[a-zA-Z0-9][a-zA-Z0-9._-]*`：以字母或数字开头，只包含字母、数字、点、下划线和连字符。斜杠会被拒绝，因为它们会与以斜杠分隔的 FQN 模式产生歧义。点和连字符是合法的，所以当扁平词汇可能冲突时，你可以把标签命名为 `team.eng` 这样的命名空间形式，但并不强制要求命名空间约定。

## 第 2 步：按标签授予访问权限

在授权的 `connectors` 字段中添加 `label:<name>` 模式。下面的示例把所有带 `sales` 标签的连接器授予销售团队，并通过默认的 `label:system` 授权给每个人内置工具：

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user", "models": "**" },
          { "connectors": ["label:system"] }
        ]
      }
    },
    {
      "src": ["group:sales"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "connectors": ["label:sales", "docs/tools/*"] }
        ]
      }
    }
  ]
}
```

匹配 `group:` 来源（如上例中的 `group:sales`）需要在 Aperture 网关上启用[可见组][docs-visible-groups]。

标签模式的两个特性决定了一条授权实际覆盖的范围：

* **标签匹配是精确匹配，不是 glob。** 与 FQN 模式不同，`label:` 模式不接受 `*` 或 `**`。`label:team.*` 匹配不到任何东西，其他通配符写法同样无效。这与 `tag:` 和 `group:` 在 Tailscale 授权中的行为一致。
* **标签匹配覆盖整个连接器。** 一旦标签匹配，用户就能访问该连接器暴露的所有类别和所有资源：工具、资源、模板和 HTTP 代理访问。标签没有按工具的粒度。要授予单个工具或只读子集，请使用点名连接器 ID 的 FQN 模式，例如 `"salesforce/tools/get_*"`。

你可以在同一个 `connectors` 数组中混用两种模式风格，如上面 `group:sales` 授权那样。

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## 第 3 步：验证访问权限

先确认标签，再确认标签产生的访问。

1. 以管理员身份打开 **Administration** > **Connectors**，在 **Labels** 列中核对标签。
2. 以匹配的用户身份登录，在 [Aperture Chat 门户][docs-aperture-chat-connectors]中打开 **Connectors**。授权允许访问时连接器会出现。Aperture 会省略被拒绝的已配置连接器，Chat 不会列出标签，也不会显示 **No access**。
3. 从 tailnet 身份与授权匹配的设备上，通过 MCP 端点列出工具。

   \[Missing snippet: aperture\_mcp\_list\_tools.mdx]

   响应包含带连接器前缀的工具，例如 `salesforce_query`。

如果工具没有出现，说明授权中的标签与连接器上的标签不一致。由于匹配是精确匹配，`label:Sales` 匹配不到带 `sales` 标签的连接器；多一个尾部空格或一个拼写错误不会报错，只是什么也授不了。请逐字符比较这两个字符串。

## 标签只会扩大访问，绝不会限制访问

Aperture 授权是叠加且只允许的，标签授权也不例外。标签授权增加对带该标签连接器的访问。没有任何标签会削减访问，也没有任何标签能充当门槛。

这一点对敏感性词汇体系最重要。给连接器打上 `restricted` 标签记录了意图，但并不强制执行。持有 `{"connectors": ["**"]}` 的用户仍能访问该连接器，因为宽泛模式已经授予了它。要真正限制敏感连接器，请删除能触达它的宽泛通配符授权，改为用标签或连接器 ID 做窄授权。

叠加授权背后的完整模型，以及 Aperture 如何解析重叠授权，请参阅 [Aperture 授权的工作原理][docs-how-grants-work]。

## 保留的 system 标签

Aperture 会自动把 `system` 标签应用于内置的 `aperture` 系统连接器，默认的 `label:system` 授权匹配的正是它。已配置的 `tailnet` 和 `tailnet_ssh` 连接器不会自动获得该标签。该标签只表明来源。Aperture 不附带任何敏感性标签，因为连接器的敏感性取决于你的部署。

由于出厂默认配置向每个用户授予 `label:system`，该标签是保留的，你不能把它用于自己的连接器：

* 在仪表盘的 **Labels** 字段中输入 `system` 时就会被拒绝，API 在保存时也会拒绝。
* 如果已有配置在 `connectors.servers` 下的连接器上带有该标签，配置仍会加载并给出警告，Aperture 会在评估任何授权之前剥离该标签。手工编辑或升级过的网关继续正常工作，该标签也绝不会扩大你无意共享的连接器的访问。

该标签在 `connectors.system_labels` 下仍然有效，该字段的存在就是为了给内置连接器重新打标签：

```json
{
  "connectors": {
    "system_labels": {
      "aperture": ["system", "public"]
    }
  }
}
```

> **警告：**
>
> `system_labels` 会替换而不是追加内置连接器的标签。如果列表中省略 `system`，默认的 `label:system` 授权将不再匹配该连接器，其内置工具会变得不可访问，除非你用其他方式授予。

## 后续步骤

* [授予 MCP 工具访问权限][docs-grant-mcp-tool-access]：按连接器 ID 精确指定单个工具、资源、模板和代理路径。
* `labels` 字段、`system_labels` 字段和完整的授权模式列表，请参阅[连接器参考][docs-connectors-reference]。
* [连接器的工作原理][docs-connectors-how-it-works]解释了标签所参与的访问控制模型。
* [设置管理员访问权限][docs-set-up-admin-access]：控制谁可以编辑连接器及其标签。

[docs-aperture-connectors-config]: /docs/aperture/configuration#connectors

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-connectors-how-it-works]: /docs/aperture/connectors/how-connectors-work

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-get-started]: /docs/aperture/get-started

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-how-grants-work]: /docs/aperture/how-grants-work

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-visible-groups]: /docs/aperture/visible-groups

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors
