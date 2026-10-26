
# 动态 TPM/RPM 分配

防止项目吃掉过多的 TPM/RPM。

**另请参阅**：[请求优先级排序](../scheduler.md) - 在高流量场景下，把 LLM API 请求加入优先级队列，让重要请求优先得到处理。

模型的 TPM/RPM 容量可以在多个密钥和团队之间共享。限流器会持续观察模型的饱和程度：当已记录的用量低于可配置的饱和阈值时，任何密钥都可以使用空闲容量；一旦用量越过阈值，每个优先级就只能占用各自预留的份额。[**查看代码**](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/hooks/dynamic_rate_limiter_v3.py)

## 快速上手

1. 配置 config.yaml

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: my-fake-model
    litellm_params:
      model: {{openai_small}}
      api_key: my-fake-key
      mock_response: hello-world
      tpm: 60

litellm_settings:
  callbacks: ["dynamic_rate_limiter_v3"]

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY # OR set `LITELLM_MASTER_KEY=".."` in your .env
  database_url: postgres://.. # OR set `DATABASE_URL=".."` in your .env
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```python showLineNumbers title="test.py"
"""
- Run 2 keys calling the same model
- model has 60 TPM
- Mock response returns 30 total tokens / request
- The model serves 2 requests in the window (2 x 30 = 60 tokens),
  then 429s every key until the 60s window rolls
"""

import requests
from openai import OpenAI, RateLimitError

def create_key(api_key: str, base_url: str):
    response = requests.post(
        url="{}/key/generate".format(base_url),
        json={},
        headers={
            "Authorization": "Bearer {}".format(api_key)
        }
    )

    _response = response.json()

    return _response["key"]

key_1 = create_key(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")
key_2 = create_key(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

# call proxy with key 1 - works
openai_client_1 = OpenAI(api_key=key_1, base_url="http://0.0.0.0:4000")

response = openai_client_1.chat.completions.with_raw_response.create(
    model="my-fake-model", messages=[{"role": "user", "content": "Hello world!"}],
)

print("Headers for call 1 - {}".format(response.headers))
_response = response.parse()
print("Total tokens for call - {}".format(_response.usage.total_tokens))


# call proxy with key 2 -  works
openai_client_2 = OpenAI(api_key=key_2, base_url="http://0.0.0.0:4000")

response = openai_client_2.chat.completions.with_raw_response.create(
    model="my-fake-model", messages=[{"role": "user", "content": "Hello world!"}],
)

print("Headers for call 2 - {}".format(response.headers))
_response = response.parse()
print("Total tokens for call - {}".format(_response.usage.total_tokens))
# call proxy with key 2 -  fails
try:
    openai_client_2.chat.completions.with_raw_response.create(model="my-fake-model", messages=[{"role": "user", "content": "Hey, how's it going?"}])
    raise Exception("This should have failed!")
except RateLimitError as e:
    print("This was rate limited b/c - {}".format(str(e)))

```

**预期响应**

```
This was rate limited b/c - Error code: 429 - {'error': {'message': 'Model capacity reached for my-fake-model. Priority: None, Rate limit type: tokens, Model TPM: 60, Model RPM: not configured, Remaining: 0', 'type': 'throttling_error', 'param': None, 'code': '429'}}
```

每次响应完成后，Token 用量才会记入限流器的计数器，因此阻断发生在已记录用量达到模型 TPM 之后的第一个请求上。预算耗尽时仍在途中的请求不会被拦截；详见下文[限流执行机制](#限流执行机制)。


## [BETA] 设置优先级 / 预留配额

为不同的环境或用例预留 TPM/RPM 容量。这样关键的生产负载始终有保障的容量可用，而开发或其他较低优先级的任务则使用剩余配额。

**使用场景：**
- 生产环境与开发环境
- 实时应用与批处理
- 关键服务与实验性功能

<EnterpriseFeature feature="按优先级为密钥预留 TPM/RPM" />

### 优先级预留的工作原理

优先级预留会按百分比把模型的总 TPM/RPM 分配给特定的优先级。优先级更高的密钥会优先获得预留配额的保障。

**示例场景：**
- 模型总容量为 10 RPM
- 优先级预留配置：`{"prod": 0.9, "dev": 0.1}`
- 结果：生产密钥保证有 9 RPM，开发密钥保证有 1 RPM

### 配置

#### 1. 配置 config.yaml

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: "{{openai_small}}"
      api_key: os.environ/OPENAI_API_KEY
      rpm: 10   # Total model capacity

litellm_settings:
  callbacks: ["dynamic_rate_limiter_v3"]
  priority_reservation:
    "prod": 0.9 # 90% reserved for production (9 RPM)
    "dev": 0.1 # 10% reserved for development (1 RPM)
    # Alternative format:
    # "prod":
    #   type: "rpm"    # Reserve based on requests per minute
    #   value: 9       # 9 RPM = 90% of 10 RPM capacity
    # "dev":
    #   type: "tpm"    # Reserve based on tokens per minute
    #   value: 100     # 100 TPM
  priority_reservation_settings:
    default_priority: 0  # Weight (0%) assigned to keys without explicit priority metadata
    saturation_threshold: 0.50 #  A model is saturated if it has hit 50% of its RPM limit
    saturation_check_cache_ttl: 60 # How long (seconds) saturation values are cached locally

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY # OR set `LITELLM_MASTER_KEY=".."` in your .env
  database_url: postgres://.. # OR set `DATABASE_URL=".."` in your.env
```

**配置细节：**

`priority_reservation`：Dict[str, Union[float, PriorityReservationDict]]
- **Key**（str）：优先级名称（任意字符串均可，如 "prod"、"dev"、"critical" 等）
- **Value**：可以是浮点数（0.0-1.0），也可以是带 `type` 与 `value` 的字典
  - 浮点数：`0.9` 表示 90% 的容量
  - 字典：`{"type": "rpm", "value": 9}` 表示每分钟 9 个请求
  - 支持的类型：`"percent"`、`"rpm"`、`"tpm"`

`priority_reservation_settings`：Object（可选）
- **default_priority**（float）：分配给未设置优先级元数据的 API 密钥的权重/百分比（0.0 到 1.0），默认 0.25。所有未显式设置优先级的密钥共享同一个该大小的池子，并非每个密钥各分一份。因此两个都没有标记的团队会在同一个默认池内竞争，彼此之间没有任何下限保障
- **saturation_threshold**（float）：模型饱和度达到该水平（0.0 到 1.0）时，严格的优先级限流开始生效。饱和度按 `max(current_rpm/max_rpm, current_tpm/max_tpm)` 计算。低于该阈值时，宽松模式允许各优先级借用未使用的容量；高于阈值时，严格模式强制执行按比例归一化的优先级上限。
  - 示例：模型用量低时，密钥可以使用超出其分配份额的容量；模型用量高时，密钥会被严格限制在分配份额之内。
- **saturation_check_cache_ttl**（int）：从 Redis 读取饱和度值时本地缓存的 TTL，单位为秒（默认 60）。在多节点部署中，它决定各节点多快收敛到同一饱和状态。取值越小，收敛越快，但 Redis 读取也越多。
  - 示例：设为 `5` 可加快多节点间的一致性，设为 `0` 则始终直接读取 Redis。

**启动代理**

```bash
litellm --config /path/to/config.yaml
```

### 在团队或密钥上设置优先级

优先级既可以设置在**团队层级**，也可以设置在**密钥层级**；团队级设置优先于密钥级生效。

**方式 A：在团队上设置优先级（推荐）**

团队内的所有密钥都会继承团队的优先级。当你希望某个环境或项目的所有密钥都拥有相同优先级时，这种方式很有用。

```bash
curl -X POST 'http://0.0.0.0:4000/team/new' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
  "team_alias": "production-team",
  "metadata": {"priority": "prod"}
}'
```

为该团队创建密钥：
```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
  "team_id": "team-id-from-previous-response"
}'
```

**方式 B：在单个密钥上设置优先级**

直接在密钥上设置优先级。当你需要对每个密钥做细粒度控制时，这种方式很有用。

**生产密钥：**
```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
  "metadata": {"priority": "prod"}
}'
```

**开发密钥：**
```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
  "metadata": {"priority": "dev"}
}'
```

**未设置优先级的密钥（使用 default_priority 权重）：**
```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{}'
```

**预期响应：**
```json
{
  "key": "sk-...",
  "metadata": {"priority": "prod"}, // or "dev"
  ...
}
```

**优先级判定顺序：**
1. 密钥所属团队设置了 `metadata.priority` → 使用团队优先级
2. 否则，若密钥自身设置了 `metadata.priority` → 使用密钥优先级
3. 否则 → 使用配置中的 `default_priority`

#### 3. 测试优先级分配

**测试生产密钥（应获得 9 RPM）：**
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-prod-key' \
  -d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user", "content": "Hello from prod"}]
  }'
```

**测试开发密钥（应获得 1 RPM）：**
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-dev-key' \
  -d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user", "content": "Hello from dev"}]
  }'
```

### 预期行为

某个优先级的预留量是下限，不是上限。密钥实际能用多少，取决于模型的饱和程度：

1. **低于饱和阈值**（宽松模式）：只执行模型级总容量限制。任何密钥无论优先级高低，都可以使用超出自身预留量的空闲容量
2. **达到或超过阈值**（严格模式）：在当前窗口的剩余时间内，每个优先级都被限制在其预留份额之内。优先级池耗尽的密钥会收到 429，而仍在预留额度内的优先级会继续得到服务
3. **未显式设置优先级的密钥**共享一个按 `default_priority` 加权的池。按上文的配置（`default_priority: 0`），它们什么也拿不到；按默认值（`0.25`），所有未标记的密钥合计拿到 25%
4. 密钥在宽松模式下借用消耗的容量，不会在严格模式启动后被收回。下限保护的是尚未被消耗的容量，因此只有当受保护的优先级在整个窗口内持续发送流量时，其下限才能得到完整保障

（1）和（2）带来一个重要推论：饱和度衡量的是已记录的用量，而不是活跃密钥的数量。即使模型上只有一个密钥，它自己的流量也会触发严格模式。因此单个优先级在一个窗口内最多能用 `max(its reservation, saturation_threshold) x model capacity`，外加至多一个在途请求。除非预留量或阈值允许，单个密钥永远到不了模型容量的 100%。

#### 示例推演

模型配置为 `tpm: 1000`、`priority_reservation: {"team_a": 0.5, "team_b": 0.5}`、`saturation_threshold: 0.5`。团队 A 每分钟的需求都超过全部容量；团队 B 的需求见各行所示。每一行都是一个全新的 60 秒窗口：

| 窗口 | A 的需求 | B 的需求 | A 实际获得 | B 实际获得 | 原因 |
|---|---|---|---|---|---|
| 1 | 100%+ | 空闲 | ~500 | | A 独自就把模型压到 50% 饱和，严格模式将 A 封顶在自身 500 的预留下限 |
| 2 | 100%+ | 500 | ~500 | ~500 | 严格模式按 50/50 的预留下限切分容量 |
| 3 | 100%+ | 400 | ~500 | ~400 | B 在自身下限之内，需求全部满足，没有 429；A 拿走剩余容量 |

把 `saturation_threshold` 提高到 `0.8` 会让窗口 1 变成约 800（A 一路借到阈值），但会削弱窗口 2：在严格模式启动前，A 在宽松模式里抢到约 600；B 最终只能拿到 420 左右，因为 A 借走的容量不会被收回，而模型级总量上限挡住了剩下的部分。

#### 限流执行机制

请求数会在调用 LLM 之前检查并累加，因此 RPM 限制是精确的。Token 数只有等响应完成才能确定，所以 TPM 的执行本质上是基于已记录用量的准入控制：只要已记录的 Token 低于上限，请求就会被放行，它自身的 Token 在之后才计入计数器。由此带来两个后果：

1. 窗口内实际服务的 Token 量可能超出配置的 TPM，超出量约为每个并发发送密钥一次请求的 Token 量。一波同时放行的并行请求还可能超出更多；TPM 并不是分钟内的硬上限
2. 如果配置的 TPM 小于单次典型响应的 Token 量，一个请求就会耗光全部预算，限流会退化成每个窗口大约只放行一个请求。测试这个功能时，请把 TPM 设得远高于单次请求的典型 Token 量

窗口是从模型收到第一个请求起滚动的 60 秒，而不是自然分钟。在多节点部署中，饱和度值还会在本地额外缓存 `saturation_check_cache_ttl` 秒，因此对未承接触发流量的节点来说，严格模式最多可能晚这么多秒才启动。

**限流报错示例：**

严格模式下优先级池耗尽：

```json
{
  "error": {
    "message": "Priority-based rate limit exceeded. Model: {{openai_small}}, Priority: dev, Rate limit type: tokens, Model TPM: 1000, Model RPM: not configured, Remaining: 0, Model saturation: 52.8%",
    "type": "throttling_error",
    "code": "429"
  }
}
```

模型级容量耗尽（任何优先级）：

```json
{
  "error": {
    "message": "Model capacity reached for {{openai_small}}. Priority: prod, Rate limit type: tokens, Model TPM: 1000, Model RPM: not configured, Remaining: 0",
    "type": "throttling_error",
    "code": "429"
  }
}
```

### 演示视频

这段视频完整演示了如何配置带优先级预留的动态限流，并通过 locust 压测验证其行为。

<iframe width="840" height="500" src="https://www.loom.com/embed/1b54b93139ee415d959402cc0629f3f7
" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
