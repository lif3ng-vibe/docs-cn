import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Aporia

使用 [Aporia](https://www.aporia.com/) 检测请求中的 PII（个人身份信息）和响应中的不雅内容

## 1. 在 Aporia 上设置防护栏

### 创建 Aporia 项目

在 [Aporia](https://guardrails.aporia.com/) 上创建两个项目

1. Pre LLM API Call：配置所有要在 LLM API 调用前执行的策略
2. Post LLM API Call：配置所有要在 LLM API 调用后执行的策略

<Image img={require('../../../img/aporia_projs.png')} />


### 调用前：检测 PII

把 `PII - Prompt` 添加到你的 Pre LLM API Call 项目中

<Image img={require('../../../img/aporia_pre.png')} />

### 调用后：检测响应中的不雅内容

把 `Toxicity - Response` 添加到你的 Post LLM API Call 项目中

<Image img={require('../../../img/aporia_post.png')} />


## 2. 在 LiteLLM 的 config.yaml 中定义防护栏

- 在 `guardrails` 部分下定义你的防护栏
```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "aporia-pre-guard"
    litellm_params:
      guardrail: aporia  # supported values: "aporia", "lakera"
      mode: "during_call"
      api_key: os.environ/APORIA_API_KEY_1
      api_base: os.environ/APORIA_API_BASE_1
  - guardrail_name: "aporia-post-guard"
    litellm_params:
      guardrail: aporia  # supported values: "aporia", "lakera"
      mode: "post_call"
      api_key: os.environ/APORIA_API_KEY_2
      api_base: os.environ/APORIA_API_BASE_2
```

### `mode` 的可选值

- `pre_call` 在 LLM 调用**之前**运行，作用于**输入**
- `post_call` 在 LLM 调用**之后**运行，作用于**输入与输出**
- `during_call` 在 LLM 调用**期间**运行，作用于**输入**。与 `pre_call` 类似，但与 LLM 调用并行执行，防护栏检查完成前不会返回响应

## 3. 启动 LiteLLM 网关


```shell
litellm --config config.yaml --detailed_debug
```

## 4. 测试请求

**[Langchain、OpenAI SDK 用法示例](/docs/proxy/user_keys#请求格式)**

<Tabs>
<TabItem label="调用失败" value = "not-allowed">

这条请求预期会失败，因为请求中的 `ishaan@berri.ai` 属于 PII

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ],
    "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
  }'
```

失败时返回的响应如下

```shell
{
  "error": {
    "message": {
      "error": "Violated guardrail policy",
      "aporia_ai_response": {
        "action": "block",
        "revised_prompt": null,
        "revised_response": "Aporia detected and blocked PII",
        "explain_log": null
      }
    },
    "type": "None",
    "param": "None",
    "code": "400"
  }
}

```

</TabItem>

<TabItem label="调用成功" value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
  }'
```

</TabItem>


</Tabs>

## 5. ✨ 按项目（API 密钥）控制防护栏

<EnterpriseFeature />

用它来控制每个项目（API 密钥）各自运行哪些防护栏。在本教程中，我们只希望以下防护栏对 1 个项目（API 密钥）生效
- `guardrails`: ["aporia-pre-guard", "aporia-post-guard"]

**第 1 步** 创建带防护栏配置的密钥

<Tabs>
<TabItem value="/key/generate" label="/key/generate">

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{
            "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
        }'
```

</TabItem>
<TabItem value="/key/update" label="/key/update">

```shell
curl --location 'http://0.0.0.0:4000/key/update' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
        "key": "sk-jNm1Zar7XfNdZXp49Z1kSQ",
        "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
    }'
```

</TabItem>
</Tabs>

**第 2 步** 用新密钥测试

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Authorization: Bearer sk-jNm1Zar7XfNdZXp49Z1kSQ' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "my email is ishaan@berri.ai"
        }
    ]
}'
```
