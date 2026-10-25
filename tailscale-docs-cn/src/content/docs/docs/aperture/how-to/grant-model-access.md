---
title: "授予模型访问权限"
description: "Aperture 会拒绝不匹配任何授权的模型请求。不过，新建 Aperture 网关的默认配置会授予所有用户访问所有模型的权限。首先，允许"
---

最后验证于 Oct 1, 2026

Aperture 会拒绝不匹配任何授权的模型请求。不过，新建 Aperture 网关的默认配置会授予所有用户访问所有模型的权限。首先，允许通过你的 tailnet 网络访问 Aperture，然后收窄或替换默认授权，控制每个用户或组可以使用哪些模型。

关于 Aperture 如何使用 Tailscale 身份进行认证与访问控制的细节，参阅 [Aperture 的工作原理][docs-how-aperture-works]。默认拒绝的访问与授权优先级，参阅 [Aperture 授权的工作原理][docs-how-grants-work]。

## 前提条件

开始之前，你需要：

* 一个至少配置了一个提供商的 [Aperture 网关][docs-get-started]。
* Aperture 管理仪表盘的[管理员访问权限][docs-set-up-admin-access]。
* Tailscale 管理控制台的访问权限。

## 第 1 步：允许网络访问 Aperture 网关

在访问模型之前，你的 tailnet 访问控制规则必须允许用户连到 Aperture 网关。

1. 登录 Tailscale 管理控制台。
2. 前往 [Access controls](https://console.tailscale.com/admin/acls/file) 页面。
3. 确认你的访问控制规则允许用户连接 Aperture 网关。

下面的 tailnet 策略文件示例允许 `group:ai-users` 中的所有用户连接主机名为 `ai` 的 Aperture 网关：

```json
{
  "groups": {
    "group:ai-users": [
      "dave@example.com",
      "alice@example.com"
    ]
  },
  "hosts": {
    "ai": "<aperture-ip-address>"
  },
  "grants": [
    {
      "src": ["group:ai-users"],
      "dst": ["ai"],
      "ip": ["tcp:80", "tcp:443", "icmp:*"]
    }
  ]
}
```

把 `<aperture-ip-address>` 替换为你的 Aperture 网关的 Tailscale IP 地址。

> **提示：**
>
> 你也可以使用 [Tailscale 标签][docs-tags]来管理对 Aperture 网关的访问。给网关分配一个 `tag:ai` 之类的标签，并在授权规则中把该标签用作 `dst`。关于在 tailnet 策略文件授权中指定 Aperture 网关的细节，参阅[授权与 tailnet 策略文件授权的对比][docs-aperture-vs-tailnet-grants]。

## 第 2 步：配置授权以控制模型访问

用户能连到 Aperture 网关后，配置授权来定义他们可以访问哪些模型。你可以在 Aperture 配置或 tailnet 策略文件中定义这些授权。Aperture 会合并来自两个来源的匹配授权。

\[Missing snippet: aperture\_admin\_nav.mdx]

在 `/admin/settings/grants` 使用可视化授权编辑器，或在 **Administration** > **Configuration** 页面的 `/admin/settings/config` 中以 JSON 编辑同样的授权。

要以编程方式修改配置，参阅[授权配置参考][docs-aperture-grants]。

下面的示例授予所有用户标准用户权限，并允许他们使用所有 Anthropic 模型：

```json
{
  "grants": [
    {
      "src": ["*"],
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

要限制访问，把 `"*"` 替换为以下任意身份类型：

* 单个登录名，例如 `"alice@example.com"`。
* Tailscale 或 SCIM 组，例如 `"group:ai-users"`。
* 标签，例如 `"tag:ci"`。

对非用户设备（例如 CI 运行器或服务），用标签授予权限。要匹配组，需要为 Aperture 网关启用[可见组][docs-visible-groups]。

下面的示例授予 `group:ai-users` 成员访问所有 Anthropic 模型：

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

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

在 `tailscale.com/cap/aperture` 下的能力条目中使用以下字段：

* **`role`**：设为 `"user"` 表示标准 API 访问，设为 `"admin"` 表示管理访问。`admin` 角色可以访问管理仪表盘。门户访问默认可用，由 `enable_portal` 单独控制。

* **`models`**：可选。`provider/model` 格式的 glob 模式，指定用户可以访问哪些模型。例如 `"anthropic/**"` 匹配所有 Anthropic 模型，`"**"` 匹配所有提供商的所有模型。没有 `models` 字段的条目是"浮动"的：它与模型无关地生效，但本身不授予任何模型访问。

  对[模型别名][docs-model-aliases]，要授予对其目标的访问。例如 `team-chat` 映射到 `openai/gpt-5.4-mini`，模式就必须匹配 `openai/gpt-5.4-mini`，而不是 `team-chat`。

* **`enable_portal`**：可选。门户访问默认可用。设为 `false` 可让匹配的非管理员用户退出门户，设为 `true` 可覆盖更宽泛的退出设置。管理员始终保留门户访问。旧字段 `enable_chat_ui` 效果相同。

* **`connectors`**：可选。FQN glob 数组，授予 MCP 工具、资源和 HTTP 连接器代理的访问。由于 Aperture 默认拒绝，在没有条目匹配之前用户没有任何连接器访问。细节参阅[授予 MCP 工具访问权限][docs-grant-mcp-tool-access]。

### 模型模式示例

下面的示例展示如何用模式授予特定模型的访问权限：

| 模式                 | 匹配                                                |
| :------------------- | :-------------------------------------------------- |
| `"**"`               | 所有提供商的所有模型                                |
| `"anthropic/**"`     | 所有 Anthropic 模型                                 |
| `"openai/gpt-5.5"`   | 精确匹配 `openai/gpt-5.5`                           |
| `"*/claude-sonnet*"` | 任意单个提供商的任意 `claude-sonnet*` 模型          |

### 授予打标签设备的访问权限

用授权让 CI 运行器或其他打标签的设备访问模型，而不必给每个用户开放。在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面找到该设备并记下它的标签，然后为授权选择 `src` 值：

* 要匹配带某一个标签的任意设备，使用 `"src": ["tag:ci-runner"]`。带有额外标签的设备同样匹配该授权。
* 要只匹配具有某一精确标签组合的设备，使用该标签组合的合成登录名。构造方法：把标签按字母排序并用逗号连接，不带空格。例如同时带有 `tag:prod` 和 `tag:api` 的设备，其合成登录名为 `tag:api,tag:prod`，因此使用 `"src": ["tag:api,tag:prod"]`。该值匹配具有相同标签组合的所有设备，而不是某一台特定设备。如果设备的标签变化，需要更新授权。

按前面的示例添加 `role` 和匹配的 `models` 能力。`"src": ["*"]` 只应用于让所有能连到网关的人（包括打标签设备）获得模型访问，不要用它来发现设备的标签。

## 验证访问权限

配置授权后，验证用户可以访问预期的模型。

1. 把一台测试设备连接到你的 tailnet。

2. 用 `curl` 或任意 HTTP 客户端向 Aperture 发送请求。使用与已配置提供商和你的 `models` 授权匹配的模型 ID。可以指定裸模型名（例如 `claude-sonnet-5-5`），也可以指定完整的 `provider/model` 形式：

   ```shell
   curl -s http://<aperture-hostname>/v1/messages \
     -H "Content-Type: application/json" \
     -d '{
       "model": "claude-sonnet-5-5",
       "max_tokens": 25,
       "messages": [{"role": "user", "content": "respond with: hello"}]
     }'
   ```

3. 确认请求返回成功响应，即说明授权生效。

如果请求失败，根据状态码判断原因：

* **HTTP 403**：用户没有 `role` 授权。添加一条 `{ "role": "user" }` 条目。
* **HTTP 404**：用户有角色，但没有匹配所请求模型的 `models` 授权，或者没有提供商配置该模型。检查 `models` 模式，并确认模型 ID 与某个已配置的提供商匹配。

诊断访问问题请参阅[Aperture 故障排除][docs-troubleshooting]。

## 后续步骤

* [授予连接器访问权限][docs-grant-mcp-tool-access]：控制用户可以访问哪些 MCP 工具、资源和 HTTP API。
* [设置按用户的支出限额][docs-set-per-user-spending-limits]：管理成本。
* [设置聊天界面][docs-set-up-chat-ui]：让用户直接在浏览器中与模型对话。
* [设置 LLM 客户端][docs-use-your-tools]：通过 Aperture 连接。

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-aperture-vs-tailnet-grants]: /docs/aperture/reference/aperture-vs-tailnet-grants

[docs-get-started]: /docs/aperture/get-started

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-how-aperture-works]: /docs/aperture/how-aperture-works

[docs-how-grants-work]: /docs/aperture/how-grants-work

[docs-model-aliases]: /docs/aperture/model-aliases

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-set-up-chat-ui]: /docs/aperture/how-to/set-up-chat-ui

[docs-tags]: /docs/features/tags

[docs-troubleshooting]: /docs/aperture/troubleshooting

[docs-use-your-tools]: /docs/aperture/use-your-tools

[docs-visible-groups]: /docs/aperture/visible-groups
