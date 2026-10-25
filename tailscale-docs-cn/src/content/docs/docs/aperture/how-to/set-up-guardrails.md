---
title: "设置护栏"
description: "使用[护栏][docs-guardrails]在 LLM 请求离开你的网络之前对其执行策略。本主题介绍设置一个用于清洗 PII 的护栏，它可以检测并脱敏"
---

最后验证于 Sep 28, 2026

使用[护栏][docs-guardrails]在 LLM 请求离开你的网络之前对其执行策略。本主题介绍设置一个用于清洗 PII 的护栏，它旨在在请求到达提供商之前检测并脱敏用户消息中的敏感数据，例如社会安全号（SSN）。

> **注意：**
>
> 护栏的检测与脱敏准确度取决于你部署的端点，Aperture 不对其作保证。请把护栏视为纵深防御中的一层，而不是保证。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个正在运行且可从你的设备访问的 [Aperture 网关][docs-get-started]。
* 一个护栏钩子端点：一个 HTTP 服务，从 Aperture 接收请求数据、进行扫描，并返回允许、拦截或修改的决定。该端点必须接受 POST 请求并返回 JSON。预期的请求与响应格式细节，请参阅配置参考中的[钩子响应格式][docs-configuration-hook-response-format]。

## 配置钩子端点

在 Aperture 配置中定义护栏，让 Aperture 知道把请求数据发送到哪里检查。

1. \[Missing snippet: aperture\_admin\_nav.mdx]
2. 在 `hooks` 部分添加一个条目，包含端点 URL 和你的护栏服务凭证。

   ```json
   "hooks": {
       "ssn-scrubber": {
           "url": "http://ssn-guard.example.ts.net:8080/scrub",
           "apikey": "<guardrail-api-key>",
           "fail_policy": "fail_closed",
           "timeout": "500ms",
           "preference": 10
       }
   }
   ```

   把 `http://ssn-guard.example.ts.net:8080/scrub` 替换为你的护栏服务 URL，把 `<guardrail-api-key>` 替换为它的 API 密钥。

   * `fail_policy` 控制 Aperture 无法连接端点时的行为。`fail_closed` 在护栏不可用时拦截请求，适合必须强制执行的 PII 清洗场景。如果你希望护栏宕机时请求照常通过，使用 `fail_open`。
   * `timeout` 设置 Aperture 等待响应的最长时间。对 `pre_request` 钩子请保持较短（500ms 到 2s），以限制客户端可见的延迟。
   * `preference` 控制多个钩子匹配同一请求时的执行顺序，值越大越先执行。

## 把钩子接入请求

用带 `send_hooks` 条目的授权把护栏连接到传入请求。

1. 在 JSON 编辑器中，添加一条授权，其中带引用你所定义钩子的 `send_hooks` 条目。

   ```json
   "grants": [
       {
           "src": ["*"],
           "app": {
               "tailscale.com/cap/aperture": [
                   {
                       "models": "**"
                   },
                   {
                       "send_hooks": [
                           {
                               "name": "ssn-scrubber",
                               "events": ["pre_request"],
                               "send": ["request_body", "user_message"]
                           }
                       ]
                   }
               ]
           }
       }
   ]
   ```

   * `name` 引用你在 `hooks` 部分定义的钩子键。
   * `events` 必须包含 `pre_request`，护栏才能在请求到达提供商之前触发。
   * `send` 控制 Aperture 在发给钩子的载荷中包含哪些数据。`user_message` 是用户发送的最后一条消息，无论 API 格式如何都从请求体中提取。用它作为检测 PII 的扫描面。`request_body` 是完整的请求体。用它作为修改面：当钩子返回 `modify` 动作时，响应中的 `request_body` 会替换原始请求体。

2. 保存配置。

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## 验证护栏

配置好钩子后，确认护栏能拦截并处理请求。

1. 通过 Aperture 发送一条包含样例 SSN（如 `123-45-6789`）的测试请求。
2. 检查响应。如果你的护栏修改了请求，LLM 应该收到脱敏后的内容（例如 `XXX-XX-XXXX`），而不是原文。
3. 打开 Aperture 管理仪表盘的 `/admin/logs`，在 **Logs** 页面选择该请求查看其捕获详情。捕获的请求体应显示修改后的内容，而不是原始 PII。Aperture 在捕获记录中存储的是转发（修改后）的请求体。

如果请求未经修改就通过了，检查 `send_hooks` 中的 `name` 是否与 `hooks` 部分中的键一致，以及授权的 `src` 字段是否包含发送请求的用户。

## 变体

PII 清洗示例演示了护栏的一个常见用例，但你也可以通过修改钩子逻辑和响应来实现不同的策略。例如：

### 拦截请求

护栏也可以不清洗 PII，而是直接拦截请求。当钩子检测到违反策略时，返回拦截响应：

```json
{"action": "block", "status_code": 451, "message": "request contains PII"}
```

客户端收到错误响应，请求永远不会到达提供商。

### 剥离工具声明

要阻止特定工具对 LLM 可用，钩子可以返回修改后的 `request_body`，把这些工具从 `tools` 数组中移除。LLM 收到的请求不含被剥离的工具，因此无法调用它们。

## 后续步骤

* 在[护栏][docs-guardrails]中了解护栏的工作原理。
* 查阅配置参考中的[钩子响应格式][docs-configuration-hook-response-format]和[钩子链][docs-configuration-hook-chains]。
* 异步观测与授权钩子请参阅[将 Cerbos 与 Aperture 集成][docs-integrate-cerbos]或[将 Oso 与 Aperture 集成][docs-integrate-oso]。
* [将 Highflame 与 Aperture 集成][docs-integrate-highflame]：该集成把请求前执行与异步观测结合在一起。

[docs-configuration-hook-chains]: /docs/aperture/configuration#hook-chains

[docs-configuration-hook-response-format]: /docs/aperture/configuration#hook-response-format

[docs-get-started]: /docs/aperture/get-started

[docs-guardrails]: /docs/aperture/guardrails

[docs-integrate-cerbos]: /docs/aperture/integrate/cerbos

[docs-integrate-highflame]: /docs/aperture/integrate/highflame

[docs-integrate-oso]: /docs/aperture/integrate/oso
