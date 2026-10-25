---
title: "设置按用户的支出限额"
description: "当多人通过 Aperture 使用 LLM 时，单个用户可能消耗掉不成比例的 AI 预算。按用户的支出限额给每个人一份会自动"
---

最后验证于 Sep 28, 2026

当多人通过 Aperture 使用 LLM 时，单个用户可能消耗掉不成比例的 AI 预算。按用户的支出限额给每个人一份自动补充的独立预算，谁也不会耗尽团队的资源。

Aperture 使用配额桶来执行支出限额。每个桶有一个容量（最大余额）、一个补充速率，以及超限时的行为。在桶名中使用 `<user>` 模板变量，即可为每个通过 Aperture 发送请求的人创建一个独立的桶。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个至少配置了一个提供商的 [Aperture 网关][docs-get-started]。
* 对 [Aperture 配置][docs-aperture-configuration]的管理员访问权限。

## 定义按用户的配额桶

\[Missing snippet: aperture\_admin\_nav.mdx] 在配置中添加 `quotas` 部分。下面的示例创建一个按用户的桶，容量为 $10，每天补充 $5：

```json
"quotas": {
  "daily:<user>": {
    "capacity": "$10.00",
    "rate": "$5.00/day",
    "on_exceed": "reject"
  }
}
```

`<user>` 模板在请求时展开为每个调用者的 Tailscale 登录名。例如，`alice@example.com` 发送请求时，Aperture 记入 `daily:alice@example.com` 桶；`bob@example.com` 发送请求时，Aperture 记入 `daily:bob@example.com` 桶。每个桶独立跟踪自己的余额。

`capacity` 字段设置桶可持有的最大余额，也是初始余额。`rate` 字段控制桶的补充速度。支持的时间单位为 `min`、`hour`、`day`、`week` 和 `month`（30 天）。

当 `on_exceed` 设为 `"reject"` 时，Aperture 会拦截会把桶扣到零以下的请求，并返回带 `Retry-After` 头部的 HTTP 429。`"reject"` 是 `on_exceed` 唯一支持的值。

## 把配额挂到授权上

配额桶在授权引用它之前不会生效。在 `grants` 部分中需要执行该限额的能力里添加一个 `quotas` 条目：

```json
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "user" },
        {
          "models": "**",
          "quotas": [
            {"bucket": "daily:<user>"}
          ]
        }
      ]
    }
  }
]
```

这条授权把按用户配额应用到所有用户的所有模型上。当请求匹配授权时，Aperture 会在转发请求前检查该用户的桶余额；响应完成后，Aperture 从桶中扣除估算成本。

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## 把配额限定到特定模型

要限制昂贵模型上的支出而让其他模型不计费，可以创建只作用于特定模型模式的配额：

```json
"quotas": {
  "opus:<user>": {
    "capacity": "$5.00",
    "rate": "$2.50/day",
    "on_exceed": "reject"
  }
},
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "models": "**" },
        {
          "models": "*/claude-opus*",
          "quotas": [
            {"bucket": "opus:<user>"}
          ]
        }
      ]
    }
  }
]
```

在这份配置中，发往 Opus 模型的请求按 `opus:<user>` 桶计费，其余模型没有支出限制。

对[模型别名][docs-aperture-model-aliases]，配额的模型模式匹配的是解析后的目标模型，而不是别名名称。

## 验证配置

保存配置后，确认配额已生效：

1. 通过 Aperture 发送一条测试请求。
2. 通过 API（`GET /api/quotas`）或聊天门户中 `/quotas` 的个人 **Quotas** 页面查看[配额状态][docs-monitor-quotas]。你的用户对应的配额桶应该已出现，容量正确，且余额因测试请求的成本而减少。

如果请求超出配额，Aperture 会返回与其提供商原生错误格式一致的错误（例如 Anthropic 的 `rate_limit_error`、OpenAI 的 `insufficient_quota`）。故障排除细节请参阅 [Aperture 故障排除][docs-troubleshooting]。

## 后续步骤

* [设置团队预算][docs-set-team-budget]，在按用户限额之外增加组织级的支出上限。
* [检查并补充预算][docs-monitor-quotas]，监控桶余额并手动添加额度。
* 完整字段参考与更多示例请参阅[配额配置参考][docs-aperture-quotas]。

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-model-aliases]: /docs/aperture/model-aliases#配额

[docs-aperture-quotas]: /docs/aperture/configuration#配额

[docs-get-started]: /docs/aperture/get-started

[docs-monitor-quotas]: /docs/aperture/how-to/check-and-refill-budgets

[docs-set-team-budget]: /docs/aperture/how-to/set-team-budget

[docs-troubleshooting]: /docs/aperture/troubleshooting
