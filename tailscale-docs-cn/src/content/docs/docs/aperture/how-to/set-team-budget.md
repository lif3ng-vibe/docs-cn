---
title: "设置团队预算"
description: "按用户的支出限额防止个人过度使用，但不能限制组织的总支出。团队预算会创建一个所有用户共用的共享配额桶，让你的组织"
---

最后验证于 Sep 28, 2026

按用户的支出限额防止个人过度使用，但不能限制组织的总支出。团队预算创建一个所有用户共用的共享配额桶，让你组织的 AI 总成本保持在设定的上限之内。

团队预算可以单独使用，也可以与[按用户的支出限额][docs-set-per-user-limits]组合实现分层成本控制。当一条授权引用多个配额桶时，所有桶都必须有正余额，请求才能继续。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个至少配置了一个提供商的 [Aperture 网关][docs-get-started]。
* 对 [Aperture 配置][docs-aperture-configuration]的管理员访问权限。

## 定义共享配额桶

\[Missing snippet: aperture\_admin\_nav.mdx] 在配置的 `quotas` 部分添加一个共享桶。共享桶使用不带模板变量的固定名称，因此所有请求都从同一个余额中扣款：

```json
"quotas": {
  "team-monthly": {
    "capacity": "$500.00",
    "rate": "$500.00/month",
    "on_exceed": "reject"
  }
}
```

这会创建一个名为 `team-monthly` 的单一桶，容量 $500，每月（30 天）补充 $500。每条引用该桶的请求都从同一余额中扣减，无论请求由哪个用户发出。

`capacity` 字段设置桶可持有的最大余额，也是初始余额。`rate` 字段控制补充速度。支持的时间单位为 `min`、`hour`、`day`、`week` 和 `month`（30 天）。当 `on_exceed` 为 `"reject"` 时，Aperture 会拦截会把桶扣到零以下的请求，并返回带 `Retry-After` 头部的 HTTP 429。

`"reject"` 是 `on_exceed` 唯一支持的值。

## 把预算挂到授权上

把共享桶添加到授权的 `quotas` 数组中。下面的示例把团队预算应用到所有用户的所有模型：

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
            {"bucket": "team-monthly"}
          ]
        }
      ]
    }
  }
]
```

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## 与按用户限额组合

要同时执行按用户的每日限额和团队范围的每月上限，定义两个桶并在同一条授权中引用它们：

```json
"quotas": {
  "daily:<user>": {
    "capacity": "$10.00",
    "rate": "$5.00/day",
    "on_exceed": "reject"
  },
  "team-monthly": {
    "capacity": "$500.00",
    "rate": "$500.00/month",
    "on_exceed": "reject"
  }
},
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "user" },
        {
          "models": "**",
          "quotas": [
            {"bucket": "daily:<user>"},
            {"bucket": "team-monthly"}
          ]
        }
      ]
    }
  }
]
```

当授权引用多个配额桶时，Aperture 会在转发请求前检查所有桶。只要任何一个桶已耗尽，即使其他桶还有余额，Aperture 也会拒绝请求。响应完成后，Aperture 从每个被引用的桶中扣除估算成本。

## 验证配置

保存配置后，确认预算已生效：

1. 通过 Aperture 发送一条测试请求。
2. 通过 API（`GET /api/quotas`）或聊天门户中 `/quotas` 的个人 **Quotas** 页面查看[配额状态][docs-monitor-quotas]。`team-monthly` 桶应该已出现，容量正确，且余额因测试请求的成本而减少。

## 后续步骤

* [设置按用户的支出限额][docs-set-per-user-limits]，防止单个用户消耗掉团队预算中不成比例的份额。
* [检查并补充预算][docs-monitor-quotas]，监控团队桶余额，并在需要时手动添加额度。
* 完整字段参考与更多示例请参阅[配额配置参考][docs-aperture-quotas]。

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-quotas]: /docs/aperture/configuration#quotas

[docs-get-started]: /docs/aperture/get-started

[docs-monitor-quotas]: /docs/aperture/how-to/check-and-refill-budgets

[docs-set-per-user-limits]: /docs/aperture/how-to/set-per-user-spending-limits
