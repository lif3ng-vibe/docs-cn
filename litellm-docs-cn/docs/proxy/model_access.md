import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 限制模型访问

## **按虚拟密钥（virtual key）限制模型**

通过 `models` 参数为密钥设置允许访问的模型

`models` 列表既会把模型从 `GET /v1/models` 的结果中隐藏，也会拦截对它的调用。如果只想让模型不出现在列表端点、但不拦截调用，可以改为在该模型上设置 `model_info.discoverable: false`（参见[从 `/v1/models` 中隐藏模型](./model_discovery#从-v1models-中隐藏模型)）


```shell
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["{{openai_small}}", "{{openai_large}}"]}'
```

:::info

此密钥只能向 `models` 中的 `{{openai_small}}` 或 `{{openai_large}}` 发起请求

:::

可以通过以下方式验证设置是否正确

<Tabs>
<TabItem label="允许访问" value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>

<TabItem label="不允许访问" value = "not-allowed">

:::info

该请求预期会失败，因为生成的密钥的 `models` 列表中不包含 claude-sonnet-5

:::

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>

</Tabs>


### [API 参考](https://docs.litellm.ai/api-reference/#/key%20management/generate_key_fn_key_generate_post)

## **按 `team_id` 限制模型**
`litellm-dev` 团队只能访问 `azure-gpt-3.5`

**1. 通过 `/team/new` 创建团队**
```shell
curl --location 'http://localhost:4000/team/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "team_alias": "litellm-dev",
  "models": ["azure-gpt-3.5"]
}' 

# returns {...,"team_id": "my-unique-id"}
```

**2. 为该团队创建密钥**
```shell
curl --location 'http://localhost:4000/key/generate' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data-raw '{"team_id": "my-unique-id"}'
```

**3. 实际测一下**
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-qo992IjKOC2CHKZGRoJIGA' \
    --data '{
        "model": "BEDROCK_GROUP",
        "messages": [
            {
                "role": "user",
                "content": "hi"
            }
        ]
    }'
```

```shell
{"error":{"message":"Invalid model for team litellm-dev: BEDROCK_GROUP.  Valid models for team are: ['azure-gpt-3.5']\n\n\nTraceback (most recent call last):\n  File \"/Users/ishaanjaffer/Github/litellm/litellm/proxy/proxy_server.py\", line 2298, in chat_completion\n    _is_valid_team_configs(\n  File \"/Users/ishaanjaffer/Github/litellm/litellm/proxy/utils.py\", line 1296, in _is_valid_team_configs\n    raise Exception(\nException: Invalid model for team litellm-dev: BEDROCK_GROUP.  Valid models for team are: ['azure-gpt-3.5']\n\n","type":"None","param":"None","code":500}}%            
```         

### [API 参考](https://docs.litellm.ai/api-reference/#/team%20management/new_team_team_new_post)


## **查看可用回退模型**

使用 `/v1/models` 端点可以发现某个模型有哪些可用的回退模型（fallback models）。当主模型不可用或受限时，这能帮你了解有哪些备用模型可以顶上。

:::info[扩展点]

`include_metadata` 参数是一个扩展点，为将来公开更多模型元数据预留。目前它只聚焦回退模型，后续会扩展到定价信息、模型能力、速率限制等其他模型元数据。

:::

### 基本用法

获取所有可用模型：

```shell
curl -X GET 'http://localhost:4000/v1/models' \
  -H 'Authorization: Bearer <your-api-key>'
```

### 获取带元数据的回退模型

带上元数据参数即可查看回退模型信息：

```shell
curl -X GET 'http://localhost:4000/v1/models?include_metadata=true' \
  -H 'Authorization: Bearer <your-api-key>'
```

### 获取特定类型的回退

你可以指定想查看的回退类型：

<Tabs>
<TabItem value="general" label="常规回退">

```shell
curl -X GET 'http://localhost:4000/v1/models?include_metadata=true&fallback_type=general' \
  -H 'Authorization: Bearer <your-api-key>'
```

常规回退指能够处理同类请求的其他备选模型。

</TabItem>

<TabItem value="context_window" label="上下文窗口回退">

```shell
curl -X GET 'http://localhost:4000/v1/models?include_metadata=true&fallback_type=context_window' \
  -H 'Authorization: Bearer <your-api-key>'
```

上下文窗口回退指上下文窗口更大的模型；当请求超出主模型的上下文上限时，由它们接手。

</TabItem>

<TabItem value="content_policy" label="内容策略回退">

```shell
curl -X GET 'http://localhost:4000/v1/models?include_metadata=true&fallback_type=content_policy' \
  -H 'Authorization: Bearer <your-api-key>'
```

内容策略回退指在主模型因安全策略拒绝内容时，能够接手处理请求的模型。

</TabItem>

</Tabs>

### 响应示例

指定 `include_metadata=true` 后，每个模型都会带一个 `metadata.fallbacks` 列表，其中只包含一种回退类型，即 `fallback_type` 指定的那一种（省略时为 `general`）。要看到全部三种类型，需要按不同的 `fallback_type` 分别发一次请求：

```json
{
  "data": [
    {
      "id": "{{openai_large}}",
      "object": "model",
      "created": 1677610602,
      "owned_by": "openai",
      "metadata": {
        "fallbacks": ["{{openai_small}}", "{{anthropic}}"]
      }
    }
  ]
}
```

### 使用场景

- **高可用**：找出备用模型，保证服务连续性
- **成本优化**：主模型太贵时，寻找更便宜的替代品
- **内容过滤**：发现内容策略不同的模型
- **上下文长度**：找到能处理更长输入的模型
- **负载均衡**：把请求分散到多个兼容模型上

### API 参数

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `include_metadata` | boolean | 在返回的元数据中附加回退模型等额外信息 |
| `fallback_type` | string | 指定 `metadata.fallbacks` 中返回哪种回退：`general`（默认）、`context_window` 或 `content_policy`。传入其他值会返回 400 |

## **在时间窗口内为团队预留部署**

在部署（deployment）上设置 `model_info.access_windows`，可以把它在每天的某个本地时间窗口内预留给特定团队。窗口生效期间，路由器（Router）只会把该部署分配给密钥所属团队在名单之内的请求；来自其他团队的请求、以及来自无团队密钥（包括主密钥）的请求，会被路由到同一模型组内的其他部署，若所有候选部署都处于预留状态，则返回 `400`。窗口之外，路由行为保持不变。无论何时，该部署都会列在 `/v1/models` 和 `/model/info` 的结果中。

```yaml
model_list:
  - model_name: gpt-4o-ptu
    litellm_params:
      model: azure/gpt-4o-ptu
      api_base: os.environ/AZURE_PTU_BASE
      api_key: os.environ/AZURE_PTU_KEY
    model_info:
      access_windows:
        - start: "22:00"
          end: "06:00"
          timezone: "America/New_York"
          team_ids: ["team-nightly-batch"]
```

`start` 和 `end` 是给定 IANA `timezone` 下的 `HH:MM` 钟表时间（自动应用夏令时）。`start` 含端点、`end` 不含端点；`start` 晚于 `end` 表示窗口跨越午夜。一个部署可以配置多个窗口；只要有任一窗口生效，它就处于预留状态。窗口时间非法、时区未知、`team_ids` 为空、或 `start` 与 `end` 相等时，代理会拒绝启动。

被拒绝的请求会返回如下错误：

```json
{"error":{"message":"litellm.BadRequestError: Deployment gpt-4o-ptu is reserved for another team until 06:00 America/New_York","type":"invalid_request_error","param":null,"code":"400"}}
```

## 进阶：模型访问组

对于更高级的场景，可以使用[模型访问组](./model_access_groups)动态分组多个模型并管理访问，无需重启代理。

## [基于角色的访问控制（RBAC）](./jwt_auth_arch)
