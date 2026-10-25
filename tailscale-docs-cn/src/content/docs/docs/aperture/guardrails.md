---
title: "护栏"
description: "在 LLM 请求到达提供商之前进行检查、修改或拦截。"
---

最后验证于 Oct 1, 2026

护栏（guardrail）是请求前钩子，让你能在 Aperture 将 LLM 请求转发给模型提供商之前检查、修改或拦截请求。你可以在网关层面用护栏执行安全策略、清洗 PII（个人身份信息）或限制工具使用。

## 护栏的工作原理

护栏在 Aperture 收到客户端请求时、即 Aperture 将请求转发给上游提供商之前触发。护栏是你部署的一个 HTTP 端点。匹配的授权（grant）会选择 Aperture 发送到该端点的请求数据。端点返回三种动作之一：允许（allow）、拦截（block）或修改（modify）。如果你把端点托管在 tailnet 之外，那么 Aperture 调用端点时，被选中的数据就会离开你的 tailnet。

在 Aperture 配置的 [`hooks`][docs-configuration-hooks] 部分定义端点。然后在授权中加入带 `pre_request` 事件的 `send_hooks`。授权决定哪些请求触发钩子，以及端点接收哪些数据。当请求与授权匹配时，Aperture 会调用你的端点并等待其响应，然后才继续处理。

## 动作

护栏返回以下三种动作之一：

* **允许**（Allow）：请求原样通过。当护栏检查请求后没有发现需要处理的内容时使用。
* **拦截**（Block）：Aperture 拒绝该请求。客户端收到一个带状态码和错误消息的错误响应，请求永远不会到达提供商。用于硬性执行，例如拒绝包含 PII 或违反你定义的策略的请求。
* **修改**（Modify）：护栏返回一个替换后的请求体。Aperture 将修改后的请求体而不是原始请求体转发给提供商。用于在内容到达 LLM 之前清洗敏感数据、移除工具声明或改写内容。

## 钩子链

你可以在同一个请求上叠加多个护栏。当多个护栏匹配时，Aperture 会按顺序调用它们：

1. 护栏按 `preference` 降序运行（值大的先执行），并以钩子键的字母顺序作为并列时的排序依据。
2. `allow` 响应不产生任何效果：链继续执行下一个护栏。
3. `modify` 响应就地改写请求体，链中的下一个护栏收到的是改写后的请求体。
4. `block` 响应终止整条链，后续护栏不再运行。

## 失败行为

每个钩子定义中的 `fail_policy` 设置控制当 Aperture 无法连接护栏端点或端点返回错误时的处理方式：

* **`fail_open`**（默认）：请求照常通过，如同护栏返回了 `allow`。当护栏不健康时保住可用性，代价是跳过执行。
* **`fail_closed`**：Aperture 以 HTTP 503 错误拦截请求。保住执行，代价是可用性。

对必须强制执行的护栏选择 `fail_closed`，例如要求强制执行的 PII 清洗。对可用性比执行更重要的护栏选择 `fail_open`（或接受默认值），例如内容分类。

## 护栏与集成钩子的对比

护栏使用同步的 `pre_request` 事件。Aperture 在转发请求之前会等待护栏的响应，因此护栏可以内联地拦截或修改请求。

[Cerbos][docs-integrate-cerbos]、[Oso][docs-integrate-oso] 等集成钩子使用 `entire_request` 或 `tool_call_entire_request` 事件。这些事件是异步的：Aperture 在响应完成后于后台调用钩子。异步钩子无法拦截或修改请求，它们用于观测、授权决策和审计日志。

零保留（zero retention，即 `duration: "0"`、`require_export: false`）控制的是代理存储的抓取记录，而不是发送给钩子的数据。请求前护栏仍会收到其授权选中的请求数据；响应后的 `entire_request` 钩子仍会收到其授权允许的请求体和响应体字段。如果你还设置了 `purge: ["captures", "tools"]`，Aperture 会跳过工具提取，因此 `tool_call_entire_request` 钩子不会触发。钩子事件与允许字段要和抓取记录的保留分开审计。

如果你需要在请求到达提供商之前执行策略，请使用带 `pre_request` 的护栏。如果你需要观测已完成的请求，或将数据发送到外部授权或日志系统，请使用带 `entire_request` 或 `tool_call_entire_request` 的集成钩子。

## 限制

护栏第一版仅支持请求前过滤。Aperture 不支持响应后护栏（即在 LLM 输出从提供商返回后对其进行过滤）。

## 护栏与连接器流量

护栏在发送给上游提供商的 LLM 请求上触发。以下情况不会触发：

* **出站 [MCP 工具调用][docs-aperture-connectors]**：当 LLM 响应触发对已注册 MCP 服务器的工具调用时，Aperture 会直接执行该工具调用，`pre_request` 钩子不会拦截这次出站调用。
* **HTTP 连接器代理请求**：经由 `/v1/connectors/{id}/` 路由的请求完全绕过护栏管道。

护栏*可以*检查声明了可用工具的 LLM 请求（请求体中的 `tools` 数组），并可以在它到达提供商之前拦截或修改该请求。但当 LLM 调用其中某个工具时，护栏不会拦截随后的出站调用。

这一区别对安全策略很重要：护栏在 LLM 提供商边界执行策略，而不是在 MCP 或连接器边界。如果你需要控制 LLM 可以使用哪些工具，请使用 [MCP 授权][docs-grant-mcp-tool-access]来限制 Aperture 暴露哪些工具，而不是依赖护栏从请求体中过滤工具声明。

## 后续步骤

* [设置护栏][docs-set-up-guardrails]：端到端配置一个 PII 清洗护栏。
* [将 Highflame 与 Aperture 集成][docs-integrate-highflame]：该集成通过同一个端点同时提供请求前执行与响应后观测。
* 查阅[钩子配置参考][docs-configuration-hooks]：了解钩子字段的完整列表、响应格式和链排序。
* [用 tsheadroom 降低 Aperture token 成本][docs-reduce-token-costs]：一个 `pre_request` 护栏的完整示例，无需客户端改动即可压缩臃肿的 LLM 请求体。

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-configuration-hooks]: /docs/aperture/configuration#hooks

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-integrate-cerbos]: /docs/aperture/integrate/cerbos

[docs-integrate-highflame]: /docs/aperture/integrate/highflame

[docs-integrate-oso]: /docs/aperture/integrate/oso

[docs-reduce-token-costs]: /docs/solutions/reduce-aperture-token-costs-with-tsheadroom

[docs-set-up-guardrails]: /docs/aperture/how-to/set-up-guardrails
