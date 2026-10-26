---
title: 花费捕获率
description: 将同日期内 LiteLLM 记录到的 OpenAI 花费与 OpenAI 实际计费金额进行比对，既可按计划定时执行（配合 Slack 告警与 Prometheus 指标），也可通过管理员端点按需触发。
---

# 花费捕获率

:::info
花费捕获率检查将在即将发布的版本中提供，当前稳定版本暂未包含
:::

捕获率检查会把 LiteLLM 为某个提供商记录到的花费，与该提供商在同一批 UTC 日期内的实际账单进行比对，告诉你账单中有多少比例经过了 LiteLLM：

```
capture_rate = captured_spend / provider_spend
```

比率为 1.0 表示提供商账单里的每一美元都经过了 LiteLLM 并完成计价。比率低于 1.0 表示有请求绕开 LiteLLM 直达提供商（直接使用 API 密钥、走了另一个网关），或者 LiteLLM 的成本追踪（cost tracking）漏记了花费。比率高于 1.0 表示 LiteLLM 的计价高于实际账单。

本版本仅接入了 OpenAI。LiteLLM 一侧的数据来自 `LiteLLM_DailyUserSpend` 表，对 `custom_llm_provider` 取值为 `openai` 和 `text-completion-openai` 的记录求和。OpenAI 一侧则通过 [组织成本 API](https://platform.openai.com/docs/api-reference/usage/costs)（即带 `bucket_width=1d` 的 `GET https://api.openai.com/v1/organization/costs`）读取，需要使用 OpenAI 管理员 API 密钥。其他提供商仍请按照 [排查成本差异](../troubleshoot/cost_discrepancy) 中的手工比对方法操作。

## 设置

在 [platform.openai.com/settings/organization/admin-keys](https://platform.openai.com/settings/organization/admin-keys) 创建一个管理员 API 密钥（Admin API key），只读权限即可。然后在代理上将其设置为 `OPENAI_ADMIN_KEY`：

```bash
export OPENAI_ADMIN_KEY="sk-admin-..."
```

这把密钥与各部署使用的 `OPENAI_API_KEY` 相互独立，它只读取账单数据，从不参与请求服务。该检查还需要代理数据库，因为已捕获花费来自 `LiteLLM_DailyUserSpend` 表。

## 定时检查

在 `general_settings` 下启用每日检查：

```yaml
general_settings:
  spend_capture_rate_check:
    providers: ["openai"]        # default ["openai"], the only value today
    threshold: 0.9               # default 0.9, alert when the rate over the window is under it
    lookback_days: 7             # default 7, window is the closed UTC days before today (yesterday back), 1 to 180
    openai_project_ids: []       # optional, scope the OpenAI bill to these project ids; default is the whole organization
```

| 键名 | 默认值 | 说明 |
| --- | --- | --- |
| `providers` | `["openai"]` | 要检查的提供商。目前 `openai` 是唯一可用取值 |
| `threshold` | `0.9` | 窗口内比率低于该值时告警。取值大于 0 且不超过 1 |
| `lookback_days` | `7` | 要比对的已结束 UTC 天数，从昨天往回数。取值 1 到 180 |
| `openai_project_ids` | `[]` | 将账单范围限定到这些 OpenAI 项目 ID。留空表示整个组织。已捕获花费不会按项目筛选，因此请列出 LiteLLM 的 OpenAI 密钥所属的全部项目 |

未知键名或超出范围的取值会让代理启动失败并报校验错误，拼写错误不会以静默默认值的方式悄悄生效。该配置段在每次运行前都会重新读取，因此通过数据库配置热加载进来的修改会在下一次运行时生效，无需重启；若热加载进来的是非法值，该次运行会以同样的校验错误失败，并记录在代理日志中。

该任务每天 01:15 UTC 运行一次，代理启动约两分钟后也会额外运行一次，让你启用后马上能看到第一份读数。它会在代理的每个副本（replica）的每个 worker 进程中运行，因此每个进程都会设置自己的 Prometheus gauge 指标。配置了 Redis 时，如果某个副本跑完的检查发现需要告警，它会获取一把持续 15 分钟的跨副本锁，且只有拿到锁的副本才发送告警，这样同一个窗口低于阈值只会产生一条告警，而不是每个 worker 一条。检查中途失败的副本不会获取锁，因此也不会压掉其他成功跑完的副本的告警。未配置 Redis 或锁无法读取时，每个副本都会各自告警，毕竟漏报警比重复报警代价更高。

当窗口内比率低于阈值、代理上未设置 `OPENAI_ADMIN_KEY`，或 OpenAI 成本 API 无法读取时，该检查会把比率发布到 Prometheus，并通过代理配置的 [告警机制](./alerting) 发出告警（告警类型 `failed_tracking_spend`，级别 High）。告警内容包含比率、阈值、已捕获与已计费金额以及日期范围，并附有指回本页面的链接。

如果窗口内 OpenAI 没有任何账单，则不存在比率：指标会被设为 `NaN`，且不会告警。比率高于 1.0 时会照常发布数值，但不会告警。

## Prometheus 指标

设置 `litellm_settings.callbacks: ["prometheus"]` 后（参见 [Prometheus 指标](./prometheus)），定时检查会发布一个 gauge（仪表）指标：

| 指标 | 标签 | 值 |
| --- | --- | --- |
| `litellm_spend_capture_rate` | `api_provider` | 检查窗口内的比率。上一次检查未产生比率时为 `NaN` |

只有定时检查会写入该指标，下面的按需端点从不改动它。未产生比率的检查（OpenAI 无账单、`OPENAI_ADMIN_KEY` 未设置，或成本 API 读取失败）会将其设为 `NaN`，而不是保留上一个有效值，因此过期的比率不会被误读为当前值。`NaN` 在 PromQL 中的比较结果恒为 false，所以下面的告警规则不会因此触发；密钥缺失和账单不可读这两种情况会通过代理自身的告警通知你。

只要代理配有数据库和 Prometheus 回调，该指标就存在，即使尚未配置 `spend_capture_rate_check`：此时任务会把每个受支持提供商的指标都设为 `NaN`，这样以该指标名为准的仪表板或规则在检查启用前就能找到对应的时间序列。设置了 `prometheus_metrics_config` 时，必须把 `litellm_spend_capture_rate` 列入某个分组，否则该指标不会被输出。通过 `prometheus_exclude_labels` 排除 `api_provider` 后，该指标将不带任何标签，为唯一受支持的提供商输出单条时间序列。

下面是一条当比率持续低于 0.9 达一小时就触发的 Prometheus 告警规则：

```yaml
groups:
  - name: litellm-spend-capture-rate
    rules:
      - alert: LiteLLMSpendCaptureRateLow
        expr: litellm_spend_capture_rate < 0.9
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "LiteLLM is capturing under 90% of the OpenAI bill"
          description: "Spend is reaching OpenAI outside LiteLLM, or cost tracking is dropping it. See https://docs.litellm.ai/docs/proxy/spend_capture_rate"
```

## 按需检查

`GET /spend/capture_rate` 可对任意日期范围执行同样的比对并返回按天明细。它需要代理管理员密钥（`PROXY_ADMIN` 或 `PROXY_ADMIN_VIEW_ONLY`，参见 [基于角色的访问控制](./access_control)），并且会实时读取 OpenAI 账单，因此代理上必须设置 `OPENAI_ADMIN_KEY`。

```bash
curl "http://localhost:4000/spend/capture_rate?provider=openai&start_date=2026-09-17&end_date=2026-09-23&threshold=0.9&project_ids=proj_a&project_ids=proj_b" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

| 查询参数 | 是否必填 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `start_date` | 是 | | 起始 UTC 日期，`YYYY-MM-DD` 格式，包含当天 |
| `end_date` | 是 | | 结束 UTC 日期，`YYYY-MM-DD` 格式，包含当天 |
| `provider` | 否 | `openai` | 要比对的提供商。目前 `openai` 是唯一可用取值 |
| `threshold` | 否 | `0.9` | 比率低于该值时 `below_threshold` 为 true。取值大于 0 且不超过 1 |
| `project_ids` | 否 | | 将账单范围限定到这些 OpenAI 项目 ID。多个项目请重复传入该参数。已捕获花费不会按项目筛选 |

响应：

```json
{
  "provider": "openai",
  "start_date": "2026-09-17",
  "end_date": "2026-09-23",
  "captured_spend": 812.4,
  "provider_spend": 903.1,
  "capture_rate": 0.8996,
  "threshold": 0.9,
  "below_threshold": true,
  "days": [
    {"date": "2026-09-17", "captured_spend": 120.1, "provider_spend": 130.0, "capture_rate": 0.9238},
    {"date": "2026-09-18", "captured_spend": 0.0, "provider_spend": 0.0, "capture_rate": null}
  ]
}
```

当天没有账单时 `capture_rate` 为 `null`；若整个范围内 OpenAI 均无账单，则整个范围的结果也是 `null`，此时 `below_threshold` 为 `false`。返回值为原始计算结果，不做四舍五入。

| 状态码 | 触发条件 |
| --- | --- |
| `400` | `end_date` 早于 `start_date`，或范围超过 180 天 |
| `401` | 密钥不是代理管理员 |
| `422` | 某个查询参数未通过校验，例如日期格式错误，或 `threshold` 超出 (0, 1] 区间 |
| `500` | 代理没有配置数据库 |
| `502` | OpenAI 成本 API 无法读取。响应 detail 中会附带 OpenAI 返回的状态码与错误信息 |
| `503` | 代理上未设置 `OPENAI_ADMIN_KEY` |

## 如何解读这个数值

比对按已结束的 UTC 天进行。定时检查永远不会包含今天，而端点范围一旦包含今天，两侧数据都只是部分值，因此今天这一行应视为进行中，而不是数据缺口。

除非用 `openai_project_ids`（或端点上的 `project_ids`）限定范围，OpenAI 账单默认覆盖整个组织，而已捕获花费始终是 LiteLLM 为 OpenAI 记录到的全部花费。只要组织里存在任何绕开 LiteLLM 的流量，比率就会因此低于 1.0。要么把检查范围限定到 LiteLLM 密钥所属的全部项目（漏掉一个项目会让比率偏高，因为该项目的已捕获花费仍会计入），要么把这个缺口当作直连流量的度量，并找产生这些流量的团队沟通解决。

所有配置为 `custom_llm_provider: openai` 的部署都计入已捕获花费，包括 `api_base` 指向 OpenAI 兼容服务器的部署，例如某台 vLLM 机器或另一个网关。这部分花费不会出现在 OpenAI 账单上，因此会推高比率。如果你希望比率只反映 OpenAI，请给这些部署指定一个独立的提供商，例如 `hosted_vllm`。

LiteLLM 使用自己的 [成本映射表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json) 计价，因此任何一侧的价格变动都会让比率随之波动，直到映射表更新跟上。没有直连流量时比率却高于 1.0，通常意味着成本映射表中某项价格高于 OpenAI 当前的实际收费。

OpenAI 的成本 API 可能比实际用量滞后几个小时，因此最近一天的数据在结算完成前可能偏低。这也是定时检查的窗口只统计到昨天的又一个原因。

其他提供商（Anthropic、Azure、Bedrock、Vertex AI）尚未接入。针对这些提供商，请参考 [排查成本差异](../troubleshoot/cost_discrepancy)。

## 另请参阅

- [花费追踪](./cost_tracking)
- [告警 / Webhooks](./alerting)
- [Prometheus 指标](./prometheus)
- [排查成本差异](../troubleshoot/cost_discrepancy)
