# 基于健康检查的路由

在用户请求报错之前，就把流量从不健康的部署（deployment）上引开。后台健康检查（health check）按可配置的间隔运行，任何未通过检查的部署都会被主动移出路由池，而不是等到用户请求已经失败之后才处理。


## 架构

<svg viewBox="0 0 860 600" xmlns="http://www.w3.org/2000/svg" style={{maxWidth: '100%', fontFamily: 'system-ui, sans-serif'}}>
  {/* Background */}
  <rect width="860" height="600" fill="#f8fafc" rx="12"/>

  {/* LEFT PANEL: Background health check loop */}
  <rect x="20" y="20" width="240" height="560" fill="#eff6ff" rx="10" stroke="#bfdbfe" strokeWidth="1.5"/>
  <text x="140" y="48" textAnchor="middle" fill="#1d4ed8" fontSize="13" fontWeight="600">后台循环</text>
  <text x="140" y="64" textAnchor="middle" fill="#3b82f6" fontSize="11">每 health_check_interval 秒一轮</text>

  {/* Deployment A */}
  <rect x="40" y="82" width="200" height="50" fill="white" rx="8" stroke="#93c5fd" strokeWidth="1.5"/>
  <text x="140" y="102" textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="500">Deployment A</text>
  <text x="140" y="120" textAnchor="middle" fill="#64748b" fontSize="11">ahealth_check() → 200 ✓</text>

  {/* Deployment B */}
  <rect x="40" y="148" width="200" height="50" fill="white" rx="8" stroke="#fca5a5" strokeWidth="1.5"/>
  <text x="140" y="168" textAnchor="middle" fill="#991b1b" fontSize="12" fontWeight="500">Deployment B</text>
  <text x="140" y="186" textAnchor="middle" fill="#64748b" fontSize="11">ahealth_check() → 401 ✗</text>

  {/* Deployment C */}
  <rect x="40" y="214" width="200" height="50" fill="white" rx="8" stroke="#fde68a" strokeWidth="1.5"/>
  <text x="140" y="234" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="500">Deployment C</text>
  <text x="140" y="252" textAnchor="middle" fill="#64748b" fontSize="11">ahealth_check() → 429 ⚡</text>

  {/* ignore_transient box */}
  <rect x="40" y="282" width="200" height="68" fill="#fefce8" rx="8" stroke="#fde047" strokeWidth="1.5"/>
  <text x="140" y="302" textAnchor="middle" fill="#713f12" fontSize="11" fontWeight="600">ignore_transient_errors: true</text>
  <text x="140" y="320" textAnchor="middle" fill="#92400e" fontSize="11">429 / 408 → 忽略</text>
  <text x="140" y="338" textAnchor="middle" fill="#92400e" fontSize="11">不写入缓存</text>

  {/* allowed_fails_policy box */}
  <rect x="40" y="368" width="200" height="84" fill="#f0fdf4" rx="8" stroke="#86efac" strokeWidth="1.5"/>
  <text x="140" y="388" textAnchor="middle" fill="#166534" fontSize="11" fontWeight="600">allowed_fails_policy</text>
  <text x="140" y="406" textAnchor="middle" fill="#15803d" fontSize="11">401 → 计数器加一</text>
  <text x="140" y="424" textAnchor="middle" fill="#15803d" fontSize="11">计数器 &gt; 阈值</text>
  <text x="140" y="442" textAnchor="middle" fill="#15803d" fontSize="11">→ 触发冷却</text>

  {/* CENTER PANEL: Shared State */}
  <rect x="300" y="20" width="220" height="560" fill="#f5f3ff" rx="10" stroke="#c4b5fd" strokeWidth="1.5"/>
  <text x="410" y="48" textAnchor="middle" fill="#6d28d9" fontSize="13" fontWeight="600">共享状态</text>

  {/* Health State Cache */}
  <rect x="320" y="62" width="180" height="116" fill="white" rx="8" stroke="#a78bfa" strokeWidth="1.5"/>
  <text x="410" y="84" textAnchor="middle" fill="#5b21b6" fontSize="12" fontWeight="600">DeploymentHealthCache</text>
  <text x="410" y="104" textAnchor="middle" fill="#64748b" fontSize="11">A → 健康 ✓</text>
  <text x="410" y="122" textAnchor="middle" fill="#64748b" fontSize="11">B → 不健康 ✗</text>
  <text x="410" y="140" textAnchor="middle" fill="#64748b" fontSize="11">C → 未写入（已忽略）</text>
  <text x="410" y="164" textAnchor="middle" fill="#94a3b8" fontSize="10">TTL: staleness_threshold × 1.5</text>

  {/* Cooldown Cache */}
  <rect x="320" y="196" width="180" height="104" fill="white" rx="8" stroke="#a78bfa" strokeWidth="1.5"/>
  <text x="410" y="218" textAnchor="middle" fill="#5b21b6" fontSize="12" fontWeight="600">冷却缓存</text>
  <text x="410" y="238" textAnchor="middle" fill="#64748b" fontSize="11">B → 冷却中</text>
  <text x="410" y="256" textAnchor="middle" fill="#64748b" fontSize="11">（超过策略阈值后）</text>
  <text x="410" y="278" textAnchor="middle" fill="#94a3b8" fontSize="10">TTL: cooldown_time</text>

  {/* failed_calls counter */}
  <rect x="320" y="318" width="180" height="90" fill="white" rx="8" stroke="#a78bfa" strokeWidth="1.5"/>
  <text x="410" y="340" textAnchor="middle" fill="#5b21b6" fontSize="12" fontWeight="600">failed_calls 计数器</text>
  <text x="410" y="360" textAnchor="middle" fill="#64748b" fontSize="11">B: 2 / AuthAllowedFails: 1</text>
  <text x="410" y="378" textAnchor="middle" fill="#64748b" fontSize="11">→ 超过阈值</text>
  <text x="410" y="398" textAnchor="middle" fill="#94a3b8" fontSize="10">TTL：cooldown_time（必须 &gt; interval）</text>

  {/* RIGHT PANEL: Request path */}
  <rect x="560" y="20" width="280" height="560" fill="#fff7ed" rx="10" stroke="#fed7aa" strokeWidth="1.5"/>
  <text x="700" y="48" textAnchor="middle" fill="#c2410c" fontSize="13" fontWeight="600">请求路径</text>

  {/* Incoming request */}
  <rect x="580" y="62" width="240" height="38" fill="#fff" rx="7" stroke="#fb923c" strokeWidth="1.5"/>
  <text x="700" y="85" textAnchor="middle" fill="#9a3412" fontSize="12" fontWeight="500">传入请求</text>

  {/* All deployments */}
  <rect x="580" y="120" width="240" height="38" fill="#fff" rx="7" stroke="#fb923c" strokeWidth="1.5"/>
  <text x="700" y="143" textAnchor="middle" fill="#9a3412" fontSize="12">全部部署 [A, B, C]</text>

  <line x1="700" y1="100" x2="700" y2="120" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-orange)"/>

  {/* Health check filter */}
  <rect x="580" y="178" width="240" height="62" fill="#fff" rx="7" stroke="#fb923c" strokeWidth="1.5"/>
  <text x="700" y="200" textAnchor="middle" fill="#9a3412" fontSize="12" fontWeight="600">① 健康检查过滤</text>
  <text x="700" y="218" textAnchor="middle" fill="#64748b" fontSize="11">已设 policy → 跳过</text>
  <text x="700" y="234" textAnchor="middle" fill="#64748b" fontSize="11">否则 → 移除不健康项</text>

  <line x1="700" y1="158" x2="700" y2="178" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-orange)"/>

  {/* Cooldown filter */}
  <rect x="580" y="262" width="240" height="50" fill="#fff" rx="7" stroke="#fb923c" strokeWidth="1.5"/>
  <text x="700" y="284" textAnchor="middle" fill="#9a3412" fontSize="12" fontWeight="600">② 冷却过滤</text>
  <text x="700" y="302" textAnchor="middle" fill="#64748b" fontSize="11">移除冷却中的部署</text>

  <line x1="700" y1="240" x2="700" y2="262" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-orange)"/>

  {/* Safety net */}
  <rect x="580" y="334" width="240" height="52" fill="#fef9c3" rx="7" stroke="#fbbf24" strokeWidth="1.5"/>
  <text x="700" y="356" textAnchor="middle" fill="#713f12" fontSize="12" fontWeight="600">安全网</text>
  <text x="700" y="376" textAnchor="middle" fill="#713f12" fontSize="11">若全部被移除 → 返回全部</text>

  <line x1="700" y1="312" x2="700" y2="334" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-orange)"/>

  {/* Load balancer */}
  <rect x="580" y="408" width="240" height="38" fill="#fff" rx="7" stroke="#fb923c" strokeWidth="1.5"/>
  <text x="700" y="431" textAnchor="middle" fill="#9a3412" fontSize="12" fontWeight="600">③ 负载均衡器</text>

  <line x1="700" y1="386" x2="700" y2="408" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-orange)"/>

  {/* Selected deployment */}
  <rect x="580" y="468" width="240" height="38" fill="#dcfce7" rx="7" stroke="#4ade80" strokeWidth="1.5"/>
  <text x="700" y="491" textAnchor="middle" fill="#14532d" fontSize="12" fontWeight="600">已选：Deployment A ✓</text>

  <line x1="700" y1="446" x2="700" y2="468" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrow-green)"/>

  {/* ARROWS: left → center */}
  <line x1="240" y1="107" x2="320" y2="110" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-blue)"/>
  <line x1="240" y1="173" x2="320" y2="240" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-red)"/>
  <line x1="240" y1="173" x2="320" y2="348" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-red)"/>
  <line x1="240" y1="316" x2="320" y2="130" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-yellow)"/>

  {/* ARROWS: center → right */}
  <line x1="500" y1="120" x2="580" y2="190" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-purple)"/>
  <line x1="500" y1="248" x2="580" y2="274" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-purple)"/>

  {/* Arrow markers */}
  <defs>
    <marker id="arrow-orange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#fb923c"/>
    </marker>
    <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#3b82f6"/>
    </marker>
    <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#ef4444"/>
    </marker>
    <marker id="arrow-yellow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#eab308"/>
    </marker>
    <marker id="arrow-purple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#8b5cf6"/>
    </marker>
    <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#4ade80"/>
    </marker>
  </defs>
</svg>


## 解决什么问题

默认情况下，LiteLLM 会把流量路由到所有部署，直到某个部署让用户请求实际失败之后，才停止向它发送请求。冷却机制是被动的。

基于健康检查的路由让这件事变成**主动**的：后台循环按可配置的间隔探测每一个部署。一旦某个部署未通过健康检查，就会立即被移出路由池，赶在用户请求落到它之前完成隔离。

如果再配置 `allowed_fails_policy`，你就能精确控制每种错误类型（认证错误、速率限制、超时）需要累积多少次健康检查失败，部署才会进入冷却，避免瞬时抖动造成误判。


## 配置步骤

### 第 1 步：启用后台健康检查

后台健康检查默认关闭。在 `general_settings` 中打开它：

```yaml
general_settings:
  background_health_checks: true
  health_check_interval: 60    # seconds between each full check cycle
```

### 第 2 步：启用健康检查路由

```yaml
general_settings:
  background_health_checks: true
  health_check_interval: 60
  enable_health_check_routing: true  # ← route away from unhealthy deployments
```

到这里，任何未通过健康检查的部署都会立即被排除在路由之外，直到下一轮检查确认它恢复为止。

### 第 3 步：添加策略控制多少次失败触发冷却

不配置策略时，健康检查第一次失败就会把部署标记为不健康。如果想更宽容一些（比如连续 2 次认证失败后才采取动作），请使用 `allowed_fails_policy`：

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY_SECONDARY

general_settings:
  background_health_checks: true
  health_check_interval: 30
  enable_health_check_routing: true

router_settings:
  cooldown_time: 60              # how long a deployment stays in cooldown
  allowed_fails_policy:
    AuthenticationErrorAllowedFails: 1   # cooldown after 2nd auth failure
    TimeoutErrorAllowedFails: 3          # cooldown after 4th timeout
```

设置 `allowed_fails_policy` 之后，二值健康检查过滤器会被绕过：路由排除完全交由冷却系统控制，且只有越过你配置的阈值才会触发。唯一的例外是同时设置了 `background_health_check_model_groups`（见第 5 步）：此时列出的模型组即便配置了策略，也保留二值过滤器。

### 第 4 步（可选）：忽略瞬时错误

健康检查返回的 429（速率限制）和 408（超时）通常说明部署只是暂时过载，而不是真的坏了。要完全不让这些结果影响路由：

```yaml
general_settings:
  background_health_checks: true
  health_check_interval: 30
  enable_health_check_routing: true
  health_check_ignore_transient_errors: true  # 429 and 408 never affect routing
```

开启后，只有硬性失败（401、404、5xx）会计入冷却。

### 第 5 步（可选）：将健康检查限定到特定模型组

默认情况下，后台循环会探测每一个模型组。如果只想让部分组接受这套管理，把它们列进 `background_health_check_model_groups`：

```yaml
general_settings:
  background_health_checks: true
  health_check_interval: 30
  enable_health_check_routing: true
  background_health_check_model_groups: ["prod-openai"]
```

设置白名单后：

- 只有列出组内的部署会被探测，未列出的组不产生任何后台探测流量与成本
- `GET /health` 直接返回后台检查结果，因此只报告列出的组
- 健康检查路由只在列出的组内调度流量；未列出的组沿用各自配置的路由策略与普通的请求时重试行为
- 之后新增的模型组不会纳入，除非你把它们加进列表
- 即使设置了 `allowed_fails_policy`，列出的组也保留二值健康过滤器
- 如果配置值不是字符串列表，代理启动时会直接报错，而不是静默忽略


## 完整示例

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY_SECONDARY

  - model_name: {{openai_large}}
    litellm_params:
      model: azure/{{openai_large}}
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY

general_settings:
  background_health_checks: true
  health_check_interval: 30
  enable_health_check_routing: true
  health_check_ignore_transient_errors: true

router_settings:
  cooldown_time: 60
  allowed_fails_policy:
    AuthenticationErrorAllowedFails: 0   # cooldown immediately on auth failure
    TimeoutErrorAllowedFails: 2          # cooldown after 3 timeouts
    RateLimitErrorAllowedFails: 5        # cooldown after 6 rate limits (if not ignoring transients)
```


## 配置参考

| 配置项 | 所属位置 | 默认值 | 说明 |
|---|---|---|---|
| `enable_health_check_routing` | `general_settings` | `false` | 把未通过健康检查的部署移出路由 |
| `background_health_checks` | `general_settings` | `false` | 健康检查路由生效的前提，必须设为 `true` |
| `health_check_interval` | `general_settings` | `300` | 两轮完整健康检查之间的间隔秒数 |
| `health_check_staleness_threshold` | `general_settings` | `600` | 缓存的健康状态经过多少秒后视为过期。默认值固定为默认间隔 300 秒的 2 倍，不跟随 `health_check_interval` 联动，因此修改间隔时需要显式设置（例如 `2 x health_check_interval`） |
| `health_check_ignore_transient_errors` | `general_settings` | `false` | 忽略健康检查返回的 429 和 408；这些状态码不影响路由 |
| `background_health_check_model_groups` | `general_settings` | `null` | 只探测列出的模型组并对其应用健康检查路由；未列出的组保持正常路由 |
| `cooldown_time` | `router_settings` | `5` | 越过阈值后部署保持冷却的秒数 |
| `allowed_fails_policy` | `router_settings` | `null` | 按错误类型设定的冷却前失败阈值（见下文） |

### `allowed_fails_policy` 字段

| 字段 | 错误类型 | HTTP 状态码 |
|---|---|---|
| `AuthenticationErrorAllowedFails` | API 密钥无效 | 401 |
| `TimeoutErrorAllowedFails` | 请求超时 | 408 |
| `RateLimitErrorAllowedFails` | 超过速率限制 | 429 |
| `BadRequestErrorAllowedFails` | 请求格式错误 | 400 |
| `ContentPolicyViolationErrorAllowedFails` | 内容被过滤 | 400 |

该值是冷却发生前**可容忍**的失败次数。`0` 表示第一次失败就触发冷却，`2` 表示第三次失败才触发。


## 注意事项

- **计数器的 TTL 必须长于健康检查间隔**。`allowed_fails_policy` 的原理是为每个部署维护一个 `failed_calls` 计数器，该计数器会在 `cooldown_time` 秒后过期。如果 `cooldown_time` 短于 `health_check_interval`，计数器会在每轮检查之间被清零，失败永远累积不起来。使用 `allowed_fails_policy` 时，请把 `cooldown_time` 设置得大于 `health_check_interval`。

  ```yaml
  router_settings:
    cooldown_time: 60       # must be > health_check_interval (30s here)

  general_settings:
    health_check_interval: 30
  ```

- **`AllowedFails: N` 表示第 (N+1) 次失败时触发冷却**。计数判断条件是 `updated_fails > allowed_fails`，因此 `0` 在第 1 次失败触发，`1` 在第 2 次，`2` 在第 3 次。

  | `AllowedFails` | 触发冷却的时机 |
  |---|---|
  | `0` | 第 1 次失败 |
  | `1` | 第 2 次失败 |
  | `2` | 第 3 次失败 |

- **不设 `allowed_fails_policy` 时，一次失败就足够**。健康检查第一次失败就会立即把部署排除出路由。如果希望对偶发的检查抖动更宽容，就使用 `allowed_fails_policy`。

- **所有部署都不健康时，过滤器会被绕过**。流量仍会继续发出，而不是返回空部署列表。请求可能会失败，但路由器会持续尝试。

- **健康检查失败与请求失败共用同一批计数器**。设置 `allowed_fails_policy` 后，两种来源累加的是同一个 `failed_calls` 计数器。一个已有 1 次健康检查失败的部署，再收到 1 次失败请求，就会达到 `AllowedFails: 1` 的阈值并进入冷却。


## 调试

以 `--detailed_debug` 参数启动代理，留意以下日志行：

每轮健康检查结束后输出（DEBUG 级别）：
```
health_check_routing_state_updated healthy=2 unhealthy=1
```

健康检查失败使计数器累加并触发冷却时（DEBUG 级别）：
```
checks 'should_run_cooldown_logic'
Attempting to add <deployment_id> to cooldown list
```

因所有部署都处于冷却而触发安全网时：
```
All deployments in cooldown via health-check routing, bypassing cooldown filter
```

因所有部署都被标记为不健康而触发安全网时（二值过滤器，未设 `allowed_fails_policy`）：
```
All deployments marked unhealthy by health checks, bypassing health filter
```
