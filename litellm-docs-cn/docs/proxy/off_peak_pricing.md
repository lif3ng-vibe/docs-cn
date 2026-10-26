# 低谷时段定价

一些提供商会在固定的时钟时段内降低收费，DeepSeek 就是典型例子，其高峰时段之外费率减半。模型定价条目上的 `off_peak_pricing` 字段让 LiteLLM 的成本追踪（cost tracking）掌握这一时间表：只要配置的时段处于生效状态，花费就按低谷费率而非标准费率计算，从而使追踪到的花费全天候与提供商账单保持一致。

## 每日时段

`off_peak_pricing` 是一个模型定价键，与[模型成本映射表（model cost map）](./custom_model_cost_map)中的 `input_cost_per_token` 属于同类条目。把它挂在某个部署（deployment）的 `model_info` 之下即可：

```yaml
model_list:
  - model_name: deepseek-chat
    litellm_params:
      model: deepseek/deepseek-chat
      api_key: os.environ/DEEPSEEK_API_KEY
    model_info:
      off_peak_pricing:
        hours_utc: "16:30-00:30"
        input_cost_per_token: 1.35e-7
        output_cost_per_token: 5.5e-7
        cache_read_input_token_cost: 3.5e-8
```

`hours_utc` 是一个 `"HH:MM-HH:MM"` 格式的 UTC 时段，也可以是这类时段组成的列表，适用于一天内有多个时段的提供商。这些时段每周七天均适用。时段可以像上例那样跨越午夜；起点包含在内，终点不包含；起点与终点相同的时段覆盖全天。文中的数字与时段仅为示例，实际的时间表与费率请以提供商的价格单为准。

这套时间表只对配置它的部署生效。同一后端模型的其他部署保留各自的定价，因此两个部署可以携带不同的时间表，而没有该配置块的部署始终按标准费率计费。

当 `model_info` 只包含 `off_peak_pricing` 这一块时（如上例），时段之外适用的标准费率来自后端模型在内置成本映射表中的条目。若要覆盖，可在该块旁并列设置 `input_cost_per_token` 与 `output_cost_per_token`。

## 按星期限定的时段

当提供商的时间表按星期几有所区分时，可以使用 `windows`，即一组规则，每条规则将 `hours_utc` 与其生效的星期配对。星期可用 ISO 数字（1 表示周一，7 表示周日）或英文全名、缩写表示。不带 `weekdays` 的规则每天都生效，写在顶层的普通 `hours_utc` 会与这些规则并行生效；只要任意一条命中，请求即按低谷时段计费。

```yaml
model_info:
  off_peak_pricing:
    weekday_timezone: Asia/Shanghai
    windows:
      - hours_utc: ["10:00-01:00", "04:00-06:00"]
        weekdays: [mon, tue, wed, thu, fri]
      - hours_utc: "00:00-00:00"   # whole day
        weekdays: [sat, sun]
    input_cost_per_token: 1.35e-7
    output_cost_per_token: 5.5e-7
```

`weekday_timezone` 是该块可选的 IANA 时区名称。小时数始终按 UTC 解释；时区只决定在检查星期时某个时刻归属于哪个日历日。当提供商按本地星期定义时间表时，这一点很关键：周五的 23:00 UTC 在 Asia/Shanghai 已是周六，因此按上面的配置，它会命中周末规则。默认值为 UTC，无法识别的名称会回退为 UTC。

## 费率的生效方式

低谷费率会直接取代原本适用的费率，而不是在原有费率上打折。分层的 `above_{N}k` 定价也不例外：时段生效期间，整个请求都按统一的低谷费率计费。该块支持 `input_cost_per_token`、`output_cost_per_token`、`output_cost_per_reasoning_token`、`cache_read_input_token_cost` 与 `cache_creation_input_token_cost`，任何一项未设置时回退到标准费率。`output_cost_per_reasoning_token` 未设置时，推理 token 的计费方式与时段之外一致：模型有专门的推理费率就按该费率计，否则按输出费率计，低谷时段同样适用。1 小时以上的缓存创建费率（`cache_creation_input_token_cost_above_1hr`）始终不受影响。

请求按其完成时刻计价：以标准费率开始、在时段内完成的请求整笔按低谷费率计费，而跨越时段结束边界的请求整笔按标准费率计费。

格式错误的时段与星期取值永远不会命中，因此时间表里出现笔误的结果只是按标准费率计费，而不会在错误的时间应用折扣。配置新的时间表后，可通过 `/spend/logs` 或用量仪表板（usage dashboard）比较同一请求在时段内外的追踪花费，以此加以验证。

`off_peak_pricing` 在任何存放模型定价条目的地方都能生效：如上例那样放在部署的 `model_info` 里、放入[自托管成本映射表](./custom_model_cost_map#方式二托管你自己的成本表)的条目中，或在 SDK 里通过 `litellm.register_model` 注册。它并不是[自定义定价覆盖（custom pricing override）](./custom_pricing)那种机制，因此写进 `litellm_params` 不会生效。
