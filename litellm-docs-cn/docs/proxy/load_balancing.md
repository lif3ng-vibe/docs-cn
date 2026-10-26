import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Proxy - 负载均衡
对同一模型的多个实例做负载均衡（load balancing）

代理会负责请求的路由（使用 LiteLLM 的 Router）。**如果想最大化吞吐量，请在配置中设置 `rpm`**


:::info

更多路由策略与参数的细节，请参阅 [路由](../routing.md)

:::

## 负载均衡的工作原理

LiteLLM 通过内置的 Router 自动把请求分发到同一模型的多个部署（deployment）上，由代理调度流量，兼顾性能与可靠性。

默认使用 "simple-shuffle" 路由策略。

### 路由策略

| 策略 | 说明 | 适用场景 |
|----------|-------------|-------------|
| **simple-shuffle**（推荐） | 随机分发请求 | 通用场景，负载分布均匀 |
| **least-busy** | 路由到活跃请求最少的部署 | 高并发场景 |
| **usage-based-routing**（性能较差） | 路由到当前用量（RPM/TPM）最低的部署 | 希望均匀遵守速率限制时 |
| **latency-based-routing** | 路由到响应最快的部署 | 对延迟敏感的应用 |
| **cost-based-routing** | 路由到成本最低的部署 | 对成本敏感的应用 |

:::tip[部署优先级]
使用 `order` 参数可以让特定部署获得更高优先级。详见[部署顺序（优先级）](#部署顺序优先级)。
:::


## 快速上手 - 负载均衡
#### 第 1 步 - 在配置中设置部署

**下面是示例配置**。其中携带 `model={{openai_small}}` 的请求会被路由到 `azure/{{openai_small}}` 的多个实例上。
```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/<your-deployment-name>
      api_base: <your-azure-endpoint>
      api_key: <your-azure-api-key>
      rpm: 6      # Rate limit for this deployment: in requests per minute (rpm)
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/gpt-turbo-small-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: <your-azure-api-key>
      rpm: 6
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/gpt-turbo-large
      api_base: https://openai-france-1234.openai.azure.com/
      api_key: <your-azure-api-key>
      rpm: 1440

router_settings:
  routing_strategy: simple-shuffle # Literal["simple-shuffle", "least-busy", "usage-based-routing","latency-based-routing"], default="simple-shuffle"
  model_group_alias: {"{{openai_large}}": "{{openai_small}}"} # all requests with `{{openai_large}}` will be routed to models with `{{openai_small}}`
  num_retries: 2
  timeout: 30                                  # 30 seconds
  redis_host: <your redis host>                # set this when using multiple litellm proxy deployments, load balancing state stored in redis
  redis_password: <your redis password>
  redis_port: 1992
```

## 强制执行模型速率限制

严格执行为各部署设置的 RPM/TPM 限制（每分钟请求数/每分钟 Token 数）。超出限制时，请求会在到达 LLM 提供商**之前**被拦截，并返回 `429 Too Many Requests` 错误。

:::tip[分别设置输入/输出限制]
当提供商公布的输入与输出吞吐限制各不相同时，请设置 `itpm` 和 `otpm`，而不是 `tpm`/`rpm`。参见[分别设置 ITPM / OTPM 速率限制](./io_token_rate_limits)。
:::

:::info
默认情况下，`rpm` 和 `tpm` 值只用于**路由决策**（挑选有剩余容量的部署）。配置 `enforce_model_rate_limits` 后，它们会变成**硬性限制**。
:::

### 快速上手

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
    rpm: 60     # 60 requests per minute
    tpm: 90000  # 90k tokens per minute

router_settings:
  optional_pre_call_checks:
    - enforce_model_rate_limits  # 👈 Enables strict enforcement
```

### 工作原理

| 限制类型 | 执行方式 | 准确性 |
|------------|-------------|----------|
| **RPM** | 硬性限制 - 恰好达到阈值即拦截 | 100% 准确 |
| **TPM** | 尽力而为 - 可能略有超出 | 已超限时才会拦截 |

**为什么 TPM 是尽力而为**：在 LLM 响应之前无法得知 Token 数量。TPM 会在每次请求前检查（已超限则拦截），并在请求完成后统计（累加实际消耗的 Token）。

### 错误响应

```json
{
  "error": {
    "message": "Model rate limit exceeded. RPM limit=60, current usage=60",
    "type": "rate_limit_error",
    "code": 429
  }
}
```

响应中包含 `retry-after: 60` 响应头。

### 多实例部署

若运行多个 LiteLLM 代理实例，请添加 Redis 来共享速率限制状态：

```yaml
router_settings:
  optional_pre_call_checks:
    - enforce_model_rate_limits
  redis_host: redis.example.com
  redis_port: 6379
  redis_password: your-password
```


:::info
关于路由策略的详细信息，请参阅[此处](../routing)
:::

#### 第 2 步：使用配置启动代理

```shell
$ litellm --config /path/to/config.yaml
```

### 测试 - 简单调用

其中 model=gpt-5.6-luna 的请求会被路由到 azure/gpt-5.6-luna 的多个实例上。

👉 关键改动：`model="{{openai_small}}"`

**检查响应头中的 `model_id`，确认请求确实被负载均衡了**

<Tabs>

<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{openai_small}}",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ]
)

print(response)
```
</TabItem>

<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```
</TabItem>

</Tabs>
### 测试 - 负载均衡

这个请求会发生以下情况：
1. 抛出速率限制异常
2. LiteLLM 代理会在模型组上重试该请求（默认重试 3 次）。

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "{{openai_small}}",
  "messages": [
        {"role": "user", "content": "Hi there!"}
    ],
    "mock_testing_rate_limit_error": true
}'
```

[**查看代码**](https://github.com/BerriAI/litellm/blob/6b8806b45f970cb2446654d2c379f8dcaa93ce3c/litellm/router.py#L2535)


## 使用多个 litellm 实例进行负载均衡（Kubernetes、自动扩缩容）

LiteLLM Proxy 支持在多个 litellm 实例之间共享 rpm/tpm 用量，传入 `redis_host`、`redis_password` 和 `redis_port` 即可启用。（LiteLLM 会使用 Redis 来追踪 rpm/tpm 用量）

配置示例

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/<your-deployment-name>
      api_base: <your-azure-endpoint>
      api_key: <your-azure-api-key>
      rpm: 6      # Rate limit for this deployment: in requests per minute (rpm)
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/gpt-turbo-small-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: <your-azure-api-key>
      rpm: 6
router_settings:
  redis_host: <your redis host>
  redis_password: <your redis password>
  redis_port: 1992
  cache_params:
    type: redis
    max_connections: 100  # maximum Redis connections in the pool; tune based on expected concurrency/load
```

## 配置中的 Router 设置 - routing_strategy、model_group_alias

在代理服务器上为一个 `model_name` 对外暴露别名（alias）。

```
model_group_alias: {
  "{{openai_large}}": "{{openai_small}}"
}
```

这些别名默认会显示在 `/v1/models`、`/v1/model/info` 和 `/v1/model_group/info` 上。

litellm.Router() 的设置可以放在 `router_settings` 下，可设置 `model_group_alias`、`routing_strategy`、`num_retries`、`timeout`。Router 支持的全部参数见[此处](https://github.com/BerriAI/litellm/blob/1b942568897a48f014fa44618ec3ce54d7570a46/litellm/router.py#L64)



### 用法

带 `router_settings` 的配置示例

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/<your-deployment-name>
      api_base: <your-azure-endpoint>
      api_key: <your-azure-api-key>

router_settings:
  model_group_alias: {"{{openai_large}}": "{{openai_small}}"} # all requests with `{{openai_large}}` will be routed to models 
```

### 隐藏别名模型

如果你想为以下情况设置别名，可以使用这一功能：

1. 拼写错误
2. 模型小版本变更
3. 更新之间的差异仅大小写不同

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/<your-deployment-name>
      api_base: <your-azure-endpoint>
      api_key: <your-azure-api-key>

router_settings:
  model_group_alias:
    "GPT-5.6-luna": # alias
      model: "{{openai_small}}"  # Actual model name in 'model_list'
      hidden: true             # Exclude from `/v1/models`, `/v1/model/info`, `/v1/model_group/info`
```

如果要隐藏的是 `model_list` 条目本身而不是别名，请在其上设置 `model_info.discoverable: false`（[从 `/v1/models` 隐藏模型](./model_discovery#从-v1models-中隐藏模型)）

### 完整定义

```python
model_group_alias: Optional[Dict[str, Union[str, RouterModelGroupAliasItem]]] = {}


class RouterModelGroupAliasItem(TypedDict):
    model: str
    hidden: bool  # if 'True', don't return on `/v1/models`, `/v1/model/info`, `/v1/model_group/info`
```

## 部署顺序（优先级）

在 `litellm_params` 中设置 `order` 可以为部署排定优先级。数值越小，优先级越高。当多个部署的 `order` 相同时，由路由策略在其中挑选。

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/gpt-4-primary
      api_key: os.environ/AZURE_API_KEY
      order: 1  # 👈 Highest priority - always tried first

  - model_name: {{openai_large}}
    litellm_params:
      model: azure/gpt-4-fallback
      api_key: os.environ/AZURE_API_KEY_2
      order: 2  # 👈 Used when order=1 fails
```

### 基于 order 的回退如何工作

当发往 `order=1` 部署的请求失败（连接错误、404、429 等）时，路由器会自动改试 `order=2` 的部署，接着是 `order=3`，依此类推。每个 order 层级在升级到下一层之前，都有自己的一组重试机会。

如果所有 order 层级都已耗尽，路由器会转入已配置的[模型级回退](./reliability.md)。

如果跳转目标部署无法解密失败部署的加密推理内容（另一个提供商，或另一个 API 密钥），路由会丢弃这些推理项并保留其摘要，跳转后的部署因此能正常应答，而不是以 `invalid_encrypted_content` 失败；参见[回退机制](./reliability.md#explanation)

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/gpt-4-primary
      api_key: os.environ/AZURE_API_KEY
      order: 1

  - model_name: {{openai_large}}
    litellm_params:
      model: azure/gpt-4-secondary
      api_key: os.environ/AZURE_API_KEY_2
      order: 2

  - model_name: gpt-4-fallback
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

router_settings:
  fallbacks:
    - {{openai_large}}:
        - gpt-4-fallback  # tried after all order levels fail
```

上述配置的回退链：`order=1` → `order=2` → `gpt-4-fallback`。

对于 429（速率限制）错误，失败的部署会立即进入冷却。如果所有 `order=1` 部署都在冷却中，路由器会在重试时直接挑选 `order=2` 的部署，而不必等待回退路径。

### 团队范围模型与旧版 `model_aliases` {#team-scoped-models-and-legacy-model_aliases}

团队范围的部署通过 `model_info.team_id` 和 `model_info.team_public_model_name` 标识。请求应使用**公开**模型名；路由器会解析出公开名相同的全部兄弟部署（`api_base` / `order` 等不同），用于路由、故障转移和部署 `order` 排序。

路由器内部：当请求处于 `team_id` 作用域内时，优化查找以 `(team_id, team_public_model_name)` 为键。如果代码传入的是内部部署 ID（如 `model_name_<team_id>_<uuid>`）而非公开名，路由仍会通过常规的部署名路径工作，只是团队专属的快速路径只对公开名生效。

**旧版团队行为**：更早的代理版本可能在团队记录上持久化 `model_aliases`，把公开名映射到单个内部部署 ID（`model_name_<team_id>_<uuid>`）。每次请求时，调用前逻辑仍可能在**路由之前**把 `model` 改写成该内部名称，这会把可用部署收缩为一个，较新的兄弟部署可能因此无法访问。

**迁移方案**：

1. **升级时推荐**：设置环境变量 `LITELLM_ENABLE_TEAM_STALE_ALIAS_BYPASS=true`，当公开名下存在兄弟团队部署时，将跳过过期别名的改写，应用团队范围的路由（包括 `order` 与故障转移）。参见代理设置文档中的[环境变量](./config_settings)表。
2. **数据清理**：从数据库的团队记录中删除团队公开名对应的过时 `model_aliases` 条目，让访问只由 `team_public_model_name` 加团队模型列表决定。

如果检测到过时别名而旁路开关**未**启用，代理可能会在日志中输出一条**一次性**警告，说明在设置该开关或清理别名之前，兄弟部署可能无法访问。

### 何时能看到负载均衡生效

**立竿见影的效果**：

- 后续请求由不同部署分别处理（日志中可见）
- 高流量时响应时间更短

**可观察的收益**：
- **更高吞吐**：多个部署同时处理更多请求
- **更高可靠性**：某个部署故障时，流量自动转向健康的部署
- **更充分的资源利用**：负载均匀分布在所有可用部署上

## Responses API 的特别注意事项

当用**不同 API 密钥**的部署（例如不同 Azure 区域或组织）对 OpenAI Responses API 做负载均衡时，加密内容项（如 `rs_...` 推理项）只能由创建它的那个 API 密钥解密。

**解决方案**：使用 `encrypted_content_affinity` 调用前检查（需要 LiteLLM >= 1.82.3），自动把包含加密内容的后续请求路由到正确的部署：

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/{{openai_large}}
      api_base: https://eastus.openai.azure.com/
      api_key: os.environ/AZURE_API_KEY_EASTUS
    model_info:
      id: "deployment-eastus"
  
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/{{openai_large}}
      api_base: https://westeurope.openai.azure.com/
      api_key: os.environ/AZURE_API_KEY_WESTEUROPE
    model_info:
      id: "deployment-westeurope"

router_settings:
  optional_pre_call_checks:
    - encrypted_content_affinity  # 👈 Prevents invalid_encrypted_content errors
```

这样可以确保包含加密内容的请求被路由到创建这些内容的部署，其他请求则照常参与负载均衡。

当后续请求到达时该部署已不在健康池中（正在冷却、已被移除，或这一轮被路由到了其他模型组），且没有任何部署同时具备相同的 `api_base` 和 `api_key`，LiteLLM 会从请求中丢弃加密推理内容，保留对话的其余部分，转发给健康的部署，并记录一条路由器警告；这一轮对话会用全新的推理正常完成，而不是失败。

无论该检查是否开启，回退跳转都会做同样的处理。按 order 跳到下一个 `order` 层级、按配置的 `fallbacks` 跳到其他模型组，以及重试中途断开的 Responses 流，都会丢弃跳转目标无法解密的加密推理内容并保留摘要，这一行为没有按部署区分的开关。对于由两个提供商组成的 order 组，也建议保持该检查开启：它会用产出部署标记每个推理项，因此当 `order: 1` 冷却、对话直接派发到 `order: 2` 时（没有跳转，也就没有跳转丢弃逻辑），无法解密的推理内容同样会被丢弃；而经过跳转的对话则保留应答部署的推理内容，不必先付出一次失败的调用。

**[进一步了解加密内容亲和性（Encrypted Content Affinity）→](../response_api.md#加密内容亲和性多区域负载均衡)**
