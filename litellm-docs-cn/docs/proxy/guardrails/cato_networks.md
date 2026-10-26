import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cato Networks

## 快速上手
### 1. 创建新的 Cato Networks AI Security Guard

前往 [Cato Networks CMA](https://cc.catonetworks.com/)，创建一个新的 AI Security Guard。

为 Guard 命名，并选择 AI Gateway 选项。

:::info
当 LiteLLM 搭配虚拟密钥（virtual key）使用时，请用虚拟密钥的别名作为 Guard 的名称，以便针对单个密钥设置策略。

发送给 Cato Networks 的只会是虚拟密钥的别名，不会包含密钥本身。
:::

### 2. 配置 Cato Networks AI Security Guard 策略

创建一个 Engine Profile，选择要启用的检测项。
再创建一条引用该 Engine Profile 和你的 Guard 的 Guard Policy 规则，并配置要执行的操作。

### 3. 在 LiteLLM config.yaml 中添加 Cato Networks 防护栏

在 `guardrails` 部分下定义你的防护栏（guardrails）
```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: cato-protected-app
    litellm_params:
      guardrail: cato_networks
      mode: [pre_call, post_call] # "During_call" is also available
      api_key: os.environ/CATO_API_KEY
      api_base: os.environ/CATO_API_BASE
      ssl_verify: False # Optional, set to False to disable SSL verification or a string path to a custom CA bundle
      inspect_embeddings: false # Optional, set to true to inspect /embeddings input
```

在 `api_key` 中填入给你签发的 API 密钥。该密钥可以在 Guard 页面中找到。
你也可以把 `CATO_API_KEY` 设置为环境变量。

默认情况下，`api_base` 为 `https://api.aisec.catonetworks.com`。请设置为适合你所在区域的正确 URL。
如果你使用自托管的 Outpost，可以将 `api_base` 设为你的 Outpost URL。

### 4. 启动 LiteLLM 网关
```shell
litellm --config config.yaml
```

### 5. 发起第一个请求

:::note
下面的示例依赖于在你的策略中启用 *PII*（个人身份信息）检测。
你可以调整请求内容，以匹配不同 Guard 的策略。
:::

<Tabs>
<TabItem label="请求被成功拦截" value = "blocked">

:::note
当 LiteLLM 搭配虚拟密钥使用时，需要在请求中带上携带虚拟密钥的 `Authorization` 请求头。
:::

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ],
    "guardrails": ["cato-protected-app"]
  }'
```

如果配置正确，由于 `ishaan@berri.ai` 会被 Cato Networks AI Security Guard 检测为 PII，你将收到一个状态码为 `400 Bad Request` 的类似响应：

```json
{
  "error": {
    "message": "\"ishaan@berri.ai\" detected as email",
    "type": "None",
    "param": "None",
    "code": "400"
  }
}
```

</TabItem>

<TabItem label="请求被成功放行" value = "allowed">

:::note
当 LiteLLM 搭配虚拟密钥使用时，需要在请求中带上携带虚拟密钥的 `Authorization` 请求头。
:::

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["cato-protected-app"]
  }'
```

上述请求不会被拦截，你将收到正常的 LLM 响应（为便于阅读做了简化）：

```json
{
  "model": "{{openai_small}}",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "I can’t provide live weather updates without the internet. Let me know if you’d like general weather trends for a location and season instead!",
        "role": "assistant"
      }
    }
  ]
}
```

</TabItem>


</Tabs>
