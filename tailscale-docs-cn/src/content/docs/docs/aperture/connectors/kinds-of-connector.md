---
title: "连接器的种类"
description: "Aperture 的工具来自不同来源。有的随网关内置，有的需要配置，有的会把调用转发给上游服务。区分它们的两个属性是：谁来运行工具、谁能访问工具。"
---

最后验证于 Sep 28, 2026

Aperture 的工具来自不同来源。有的随网关内置，有的需要配置，有的会把调用转发给上游服务。区分它们的两个属性是：谁来运行工具，以及谁能访问工具。

字段定义参阅[连接器参考][docs-connectors-reference]。连接器模型参阅[连接器的工作原理][docs-connectors-how-it-works]。

## 执行与可达性

Aperture 中的每个工具都落在两个维度上：

1. **执行**：由 Aperture 自己运行工具，或由 Aperture 把调用转发给上游服务。
2. **可达性**：工具仅对 chat 可用，或对 chat 和连接到网关的智能体都可用。

执行决定依赖关系。内置工具不需要上游 MCP 服务器，但节点预配、Tailscale SSH 和网页工具仍然依赖对各自服务的网络访问。转发的工具还依赖上游连接器服务。

可达性决定授权是否适用。智能体可达的工具要经过授权体系，仅 chat 可用的能力则不需要。

## 连接器类型

| 类型 | 执行 | 可达性 | 需要配置 | 受授权管辖 |
| --- | --- | --- | --- | --- |
| 仅 Chat 可用的工具 | Aperture | Chat | 否 | 否 |
| `aperture` 连接器 | Aperture | Chat 和智能体 | 否 | 是 |
| 内置连接器 | Aperture | Chat 和智能体 | 是 | 是 |
| 经验证连接器 | 上游 | Chat 和智能体 | 是 | 是 |
| 自定义连接器 | 上游 | Chat 和智能体 | 是 | 是 |

后三种需要配置条目，前两种随网关内置。

### 仅 Chat 可用的工具

chat 沙盒和位置属于 chat 界面的能力，而不是连接器。它们在你的配置中没有条目、没有上游 URL、也没有连接器 ID。连接到 `/v1/mcp` 的智能体在工具列表中永远不会收到它们，因此没有任何授权模式能够触及或排除它们。

可用性取决于 Tailscale 是否为你的网关启用了该能力、用户的会话设置，以及任何用户或项目工具策略。连接器授权不控制这些能力。

位置比沙盒更进一步：它根本不注册任何工具。Chat 直接从请求中读取用户坐标并放进 system prompt，因此模型无需任何工具调用就能拿到信息。

沙盒的功能参阅 [chat 沙盒功能指南][docs-chat-sandbox]。

### `aperture` 连接器

内置的 `aperture` 连接器跨在常规分界线上。它的工具由 Aperture 运行，与仅 chat 可用的能力一样；但它仍然出现在连接器列表中，智能体仍然会收到它的工具，授权也仍然管辖它。它在你配置中没有条目，因为它随每个网关内置。

它的工具包括 `aperture_list_connectors`，让模型发现自己可访问的 HTTP 连接器。当网关可以使用网页搜索时，还会出现网页工具 `aperture_web_search` 和 `aperture_web_fetch`。可用性有问题请联系 Tailscale。

该连接器携带 `system` 标签，出厂默认配置授予 `label:system`。这条授权就是内置工具在新网关上能直接工作的原因，也为你提供了一个可用的基于标签的访问示例。授权路径上没有为它开任何例外。

### 内置连接器

内置连接器和 `aperture` 连接器一样在 Aperture 内部运行，但必须先在你的配置中有条目才能做任何事。tailnet 连接器在你的 tailnet 中预配节点；Tailscale SSH 连接器列出 tailnet 机器并在其上运行命令。

这些连接器在 Aperture 中运行工具，而不是把调用转发给上游 MCP 服务器。它们的配置仍然需要 `url`。原始代理路径 `/v1/connectors/<id>/<path>` 会返回 404，因为这些连接器不提供 HTTP 代理。

由于需要配置，内置连接器同样受授权管辖，并和指向外部服务的连接器一样带着状态出现在连接器列表中。两者的访问控制完全一致，不同的只是工具的来源。

### 经验证连接器

经验证连接器指向外部服务，Aperture 把每次调用转发给它。其提供商出现在 Aperture 的注册表中，注册表提供起始配置：协议、认证类型、授权与 token 端点，以及作用域。

注册表帮你省去找这些值的功夫，并且不在运行时做任何事。管理员保存连接器后，Aperture 只读取存储的配置，因此提供商侧变化的注册表值不会影响你的网关。

### 自定义连接器

自定义连接器就是没有预设的经验证连接器。URL、协议、认证方案和凭证都由你提供。运行时 Aperture 对二者的处理完全相同。

尽管常见误解如此，“自定义”并不等于“你自己 tailnet 上的上游”。区别在于是否在注册表中；自定义连接器可以指向 Aperture 能访问的任何地址。`send_caller_identity` 字段确实要求 tailnet 上游：它把调用者的 Tailscale 身份转发给上游，URL 不是 MagicDNS 名称或 Tailscale IP 地址时会被拒绝。

## 各类型的行为差异

**授权**：`"**"` 授权覆盖所有连接器的所有工具，包括内置连接器，但不包括仅 chat 可用的能力。要控制沙盒，请使用[仅 Chat 可用的工具][ar-chat-only-tools]中描述的会话设置和工具策略。

**凭证**：认证方式取决于连接器。Tailnet 节点预配需要 Tailscale OAuth 客户端密钥。Tailscale SSH 使用网关的 Tailscale 身份而非连接器凭证。凭证配置参阅[连接器参考][docs-connectors-reference]。

## 能力更新

经验证和自定义 MCP 连接器的能力会随其上游服务器变化。对不使用按用户凭证的连接器，Aperture 会轮询这些变化。对按用户的连接器，打开其 Chat 详情页并选择 **Refresh tools**，用你的凭证请求当前工具列表。内置连接器的工具集随 Aperture 版本更新而变化。

上游请求或刷新失败时，连接器仍可保持 **Ready**。**Ready** 描述的是访问与授权，不代表上游健康。

## API 类别

API 中的连接器列表包含一个 `category` 字段，取值为 `system`、`verified` 或 `custom`。这三个值与五种连接器类型并非一一对应：

* 仅 chat 可用的能力不出现在列表中，因此没有类别。
* 内置连接器被报告为 `system`，与始终存在的 `aperture` 连接器归在一起，尽管它们需要配置。
* `verified` 和 `custom` 与上文描述的类型对应。

注册表的类别元数据用于分类提供商，而当前的管理员连接器设置页面呈现的是可搜索的连接器列表。要预判连接器行为，请使用[连接器类型][ar-connector-types]中描述的执行与可达性属性。字段定义参阅[连接器参考][docs-connectors-reference]。

## 示例

**同事在你的 tailnet 的 MCP 服务器上新增了一个工具。智能体何时能调用它？** Aperture 会保持共享凭证连接器的能力最新。对按用户的连接器，打开其 Chat 详情页并选择 **Refresh tools** 请求当前工具列表。而内置连接器的新工具只会随 Aperture 版本发布到来。

**用户拥有 `"**"` 授权，但 chat 沙盒不可用。该查哪里？** 检查是否选中了 **Code Sandbox**，以及是否有用户或项目工具策略禁用了它。如果该能力对你的网关不可用，请联系 Tailscale。

**一个上游 MCP 服务器返回错误。哪些工具受影响？** 该服务器的工具独立失败，不影响其他连接器的工具。内置工具也可能失败，前提是其自身依赖（如 Tailscale API 或 SSH 目标）不可用。

**你想让 Tailscale SSH 只对一个团队开放。该改什么？** 给该团队授予该连接器的访问权限。网关能访问哪些机器由 tailnet 的 SSH 策略单独控制。

## 相关内容

* [连接器的工作原理][docs-connectors-how-it-works]，了解连接器模型、MCP 与 HTTP 协议、认证和访问控制。
* [连接器参考][docs-connectors-reference]，字段定义、认证类型和 `category` 字段。
* [授权的工作方式][docs-how-grants-work]，了解管辖五种类型中四种的授权语法。
* [添加经验证的连接器][docs-connectors-add-verified]，从注册表配置连接器。
* [Chat 沙盒][docs-chat-sandbox]，了解仅 chat 可用的沙盒能力能做什么。

[ar-chat-only-tools]: #仅-chat-可用的工具

[ar-connector-types]: #连接器类型

[docs-chat-sandbox]: /docs/aperture/chat-sandbox

[docs-connectors-add-verified]: /docs/aperture/connectors/add-verified-connector

[docs-connectors-how-it-works]: /docs/aperture/connectors/how-connectors-work

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-how-grants-work]: /docs/aperture/how-grants-work
