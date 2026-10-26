# 预算重置时间与时区

LiteLLM 支持可预期的预算重置时间，可对齐自然的日历边界。

## 预算重置的工作机制

默认情况下，所有预算都会在所配置时区的午夜（00:00:00）重置，常见时长有专门的处理规则。重置落在一天中的哪个时刻可通过 `budget_reset_time` 配置（见下文[配置重置时刻](#配置重置时刻)）；下表展示的是默认的午夜重置行为。

| 时长 | 重置行为 |
| --- | --- |
| 每日（24h/1d） | 每天午夜重置 |
| 每周（7d） | 每周一午夜重置 |
| 每月（30d） | 每月 1 日午夜重置 |

不足一天的时长（如 `1h`、`30m`、`10s`）会从当前时间起按各自的间隔顺延重置，因此具体时刻设置对它们不适用。

## 配置时区

在配置文件中为所有预算重置指定时区：

```yaml
litellm_settings:
  max_budget: 100 # (float) sets max budget as $100 USD
  budget_duration: 30d # (number)(s/m/h/d)
  timezone: "US/Eastern" # Any valid timezone string
```

这样所有预算重置都会在你指定时区的午夜进行，而不是按 UTC。若未指定时区，则默认使用 UTC。

## 配置重置时刻

:::info

`budget_reset_time` 将在下一个版本（`v1.94.0` 之后）开始提供。

:::

默认情况下，日、周、月预算都在午夜重置。设置 `budget_reset_time` 可以让重置改落在指定的钟表时刻（按所配置的 `timezone` 计算），例如让预算滚动对齐你工作日的开始时间，或上游提供商的计费边界：

```yaml
litellm_settings:
  max_budget: 100 # (float) sets max budget as $100 USD
  budget_duration: 1d # (number)(s/m/h/d)
  timezone: "US/Eastern" # Any valid timezone string
  budget_reset_time: "09:00" # (string) "HH:MM" or "HH:MM:SS", 24-hour clock
```

按上面的配置，每日预算每天在美国东部时间 09:00 重置，每周预算在周一 09:00 重置，每月预算在每月 1 日 09:00 重置。该值接受 24 小时制的 `"HH:MM"` 或 `"HH:MM:SS"` 字符串，且必须加引号。若省略，重置仍固定在午夜。格式错误的值会让配置在启动时直接加载失败，而不是静默回退到午夜，拼写错误会立刻暴露，而不是悄悄改变预算重置的时间。不足一天的时长会忽略 `budget_reset_time`，因为对它们而言具体时刻没有意义。

## 支持的时区

任何有效的 [IANA 时区字符串](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)都受支持（底层由 Python 的 `zoneinfo` 模块驱动）。夏令时切换会自动处理。

**常用时区取值**：

| 时区 | 说明 |
| --- | --- |
| `UTC` | 协调世界时 |
| `US/Eastern` | 美国东部时间 |
| `US/Pacific` | 美国太平洋时间 |
| `Europe/London` | 英国时间 |
| `Asia/Kolkata` | 印度标准时间（IST） |
| `Asia/Bangkok` | 印支时间（ICT） |
| `Asia/Tokyo` | 日本标准时间 |
| `Australia/Sydney` | 澳大利亚东部时间 |
