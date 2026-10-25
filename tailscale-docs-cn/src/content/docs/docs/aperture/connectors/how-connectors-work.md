---
title: "连接器的工作原理"
description: "连接器让智能体通过 Aperture 调用工具和查询 API。连接器的区别在于其工具在哪里运行。"
---

最后验证于 Oct 1, 2026

连接器让智能体通过 Aperture 调用工具和查询 API。连接器的区别在于其工具在哪里运行：

* 内置连接器的工具在 Aperture 内部运行。
* 经验证连接器和自定义连接器把调用发送到上游 MCP 服务器或 HTTP API。Aperture 可以在每次调用中注入配置的凭证。

连接器授权控制所有类型的访问。每种类型的更多信息参阅[连接器的种类][docs-connectors-kinds]。字段定义参阅[连接器参考][docs-connectors-reference]。

## 连接器与提供商

Aperture 路由两类智能体流量：

* [提供商][docs-aperture-set-up-providers]把 LLM 请求路由到上游模型 API。
* 连接器让智能体访问工具和 API。它们把请求转发给上游服务，或在 Aperture 内部运行内置工具。

连接器绝不提供模型补全，提供商也绝不暴露工具。两者配合，让 Aperture 能通过一个网关洞察模型和工具的使用情况。要让智能体调用工具或查询 API，请使用连接器。

## 两种协议

每个经验证连接器或自定义连接器使用两种协议之一。协议决定了 Aperture 如何与上游服务通信，以及智能体如何访问该连接器。

* **MCP 连接器**：指向远程 [Model Context Protocol][xt-mcp-spec] 服务器。Aperture 把它们的工具和资源聚合在 `/v1/mcp` 端点之后。智能体通过 Aperture 发现和调用工具，无需知道每个工具由哪个后端提供。
* **HTTP 连接器**：把 Aperture 变成带认证的反向代理。智能体向 `/v1/connectors/<id>/<path>` 发送请求，Aperture 自动注入凭证后转发给上游 API。

两种协议可以在同一配置中混用。MCP 工具通过 `/v1/mcp` 暴露，HTTP API 通过各自的代理路径暴露。存在至少一个 HTTP 连接器时，Aperture 还会暴露一个内置工具，让模型能够发现可用的 HTTP 连接器。

### 名称加前缀

每个连接器 ID 都会成为名称前缀，避免两台服务器暴露同名工具时发生冲突。工具的名称是 ID 加下划线（`docs_search`）；资源和资源模板的名称是 ID 加连字符（`docs-files://readme.md`）。Aperture 在把调用转发给上游时会剥掉前缀。这也是连接器 ID 只允许字母和数字的原因：下划线和连字符被保留，用作暴露给智能体的带前缀名称中的分隔符。

## 认证模型

经验证连接器和自定义连接器集中管理凭证。你把 API 密钥和令牌存放在 Aperture 配置中，而不是交给每个智能体运行时。Aperture 会在每个出站请求中注入正确的凭证，因此只需在一处轮换凭证。

这些连接器支持多种认证方案，包括静态令牌、API 密钥、HTTP basic 和两种 OAuth 2.0 流程。对行为影响最大的区分是共享凭证与按用户凭证：

* **共享凭证**，例如静态令牌、API 密钥、basic 和 OAuth 2.0 client credentials，认证的是 Aperture 自身。所有拥有匹配授权的用户都使用同一个凭证。请把这类凭证的范围收窄，最好只读。
* **按用户凭证**，例如 OAuth 2.0 授权码，要求每个用户单独完成一次授权同意流程。Aperture 为每个用户提供隔离的会话，并分开存储其令牌，因此把状态绑定到令牌的后端不会混用不同用户的会话。

按用户连接器在该用户完成 OAuth 授权之前不会向其暴露工具。Aperture 在授权之后如何发现工具，参阅[能力发现与更新][ar-capability-discovery-and-updates]。

有些工具在智能体调用时会要求用户授权一个具体操作，而不是要求预先对整个连接器授权。内置的 [`Tailnet` 连接器][docs-connectors-built-in]就是这样。它使用 OAuth 2.0 授权码类型，但其工具仅凭一条授权即可使用，**Connect** 按钮不适用。第一次调用返回一个授权链接，用户批准后的下一次调用返回结果。其[授权流程][docs-connectors-built-in-auth-flow]参阅相关章节。认证要求、各方案专属字段和提供商专属配置参数，参阅[连接器参考][docs-connectors-reference]。

## 能力发现与更新

Aperture 向每个用户展示其授权允许的 MCP 工具、资源和模板。

对没有按用户凭证的经验证或自定义 MCP 连接器，Aperture 每隔几秒轮询一次上游。上游新增或移除工具时，Aperture 会更新已注册的能力。上游不可达时，Aperture 会把它的工具从 `/v1/mcp` 中移除，直到上游恢复。Aperture Chat 仍可显示最近缓存的工具列表。列出某个工具并不保证实时调用一定成功。

内置连接器工具在 Aperture 内部运行，因此 Aperture 不会轮询它们。

按用户 OAuth 连接器不使用后台轮询。Aperture 会用每个用户自己的凭证为该用户发现并缓存一份独立的工具目录：

* 用户同意授权后，Aperture 会尽量在把用户重定向到 Aperture Chat 之前发现工具。如果上游缓慢或不可达，工具可能不会立即出现。
* 如果首次发现没有完成，该用户后续的请求仍可发现工具。
* 一个用户的目录不会填充另一个用户的工具。

连接器的详情页只显示缓存的能力，不会联系上游。要获取上游的工具变更，请在 [Aperture Chat 门户][docs-aperture-chat-connectors]的 **Connectors** 下打开连接器详情页，并选择 **Refresh tools**。发现和刷新都会联系上游，因此上游不可达时两者都可能失败。刷新失败会报告上游错误，但不会改变 **Ready** 状态。连接器状态描述的是访问与授权，而不是上游健康。发现和刷新都不需要重启 Aperture。

## 访问控制

对连接器，Aperture 与网关其余部分一样默认拒绝。没有匹配授权的用户看不到任何连接器能力。授权使用 `"connectorID/category/resource"` glob 模式，类别是 `tools`、`resources`、`templates` 或 `proxy`。Aperture 在客户端列出能力和调用能力时都会检查授权，因此用户只能列出和调用其授权允许的内容。作为内置系统连接器并不会在授权路径上带来特殊待遇——它同样受授权体系管辖，这就是为什么内置工具是通过默认配置中的一条授权到达用户的，而不是代码中的例外。

`proxy` 类别管辖原始代理路径 `/v1/connectors/<id>/...`。MCP 连接器也可以通过该路径访问，且在这条路径上 Aperture 只应用连接器级的 `proxy` 授权，而不会像在 `/v1/mcp` 上那样按工具、按资源过滤。

### 标签把连接器分组以便授权

FQN 模式点名单个连接器，因此只用 FQN 模式表达的策略，每加一个连接器就要多一条条目。标签解决了这个问题。标签是连接器上的一个扁平字符串，`label:<name>` 授权模式会匹配携带该标签的每个连接器。把一组连接器都打上 `sales` 标签，授权一次 `label:sales`，之后加入该组的连接器无需修改策略即可被覆盖。

从 Aperture 评估标签的方式可以推出两条规则。匹配是精确匹配而非 glob 匹配，与 Tailscale 授权中的 `tag:` 和 `group:` 相同，因此 `label:team.*` 什么都匹配不到。而且匹配到的标签会授予整个连接器的所有类别和资源，因此标签适合表达连接器级策略，要触及单个工具仍需使用 FQN 模式。

标签也是新建 Aperture 网关的起点。内置的 `aperture` 系统连接器自动携带 `system` 标签，出厂默认配置授予 `label:system`，因此配置中自带一个可用的基于标签的访问示例。已配置的 [`Tailnet` 和 `TailnetSSH` 连接器][docs-connectors-built-in]不会获得这个标签，也不能获得：Aperture 会从每个 `connectors.servers` 条目中剥除保留的 `system` 标签。请按 ID 授权这些连接器。管理员在 **Administration** > **Connectors** 下管理和查看连接器标签。个人 Chat 门户不列出连接器标签。

标签只会扩大访问。授权是叠加且只允许的，因此标签只会把它匹配的连接器加入用户的访问范围，绝不会减去任何东西。像 `restricted` 这样的敏感性标签只记录意图，本身不强制任何限制：拥有宽泛 `"**"` 授权的用户仍然可以访问打了 `restricted` 标签的连接器。要限制访问，请使用狭窄的授权。标签语法和保留的 `system` 标签参阅[连接器参考][docs-connectors-reference-labels]；具体操作参阅[按标签授予连接器访问权限][docs-grant-connector-access-by-label]。

## HTTP 连接器如何限制凭证暴露

由于 HTTP 连接器会把任意客户端请求带着注入的凭证转发给上游，Aperture 对代理做了约束以降低凭证泄露风险：

* 转发前剥除客户端提供的 `Authorization` 和 `Cookie` 头，再注入连接器自己的凭证。
* 从上游响应中剥除 `Set-Cookie` 头。
* 阻止所有上游重定向，降低凭证经由重定向链外泄的风险。
* 只接受标准请求方法（`GET`、`POST`、`PUT`、`PATCH`、`DELETE`、`HEAD`、`OPTIONS`），拒绝 `TRACE` 这类会把注入的凭证回显给客户端的方法。

这些规则意味着 HTTP 连接器的行为像一个狭窄的、注入凭证的网关，而不是通用代理。上游服务对转发请求的处理遵循你与该服务之间的协议。

这也决定了失败的呈现方式。上游不可达或在连接层报错时，Aperture 返回 `502 Bad Gateway`。使用被禁方法的请求返回 `405 Method Not Allowed`。大响应会被大小上限截断，因此被截断的响应可能是超出了该上限。

## 相关内容

* [使用连接器][docs-connectors-use]，授权连接器、调用其工具或查询其 API。
* [连接器入门][docs-connectors-get-started]，以管理员身份添加连接器并授予访问权限。
* [连接器的种类][docs-connectors-kinds]，了解哪些连接器由 Aperture 自行运行、哪些会转发调用。
* [按标签授予连接器访问权限][docs-grant-connector-access-by-label]，对连接器分组并一次授权一组。
* [连接器参考][docs-connectors-reference]，字段定义、认证类型和校验规则。

[ar-capability-discovery-and-updates]: #能力发现与更新

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors

[docs-aperture-set-up-providers]: /docs/aperture/set-up-providers

[docs-connectors-built-in]: /docs/aperture/connectors/built-in-connectors

[docs-connectors-built-in-auth-flow]: /docs/aperture/connectors/built-in-connectors#authorization-flow

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-connectors-kinds]: /docs/aperture/connectors/kinds-of-connector

[docs-connectors-reference-labels]: /docs/aperture/connectors/reference#connector-labels

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-connectors-use]: /docs/aperture/connectors/use-a-connector

[docs-grant-connector-access-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[xt-mcp-spec]: https://modelcontextprotocol.io/specification
