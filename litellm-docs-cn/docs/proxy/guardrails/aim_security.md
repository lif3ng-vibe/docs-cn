import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Aim Security

## 快速上手
### 1. 创建新的 Aim Guard

前往 [Aim 应用控制台](https://app.aim.security/inventory/custom-ai-apps)，创建一个新的 guard。

出现提示时选择 API 选项，并为你的 guard 命名。


:::note
如果你想在本地环境（on-premise）托管你的 guard，可以在创建 guard 之前先[安装 Aim Outpost](https://app.aim.security/settings/on-prem-deployment) 来启用该选项。
:::

### 2. 配置 Aim Guard 策略

在新建 guard 的页面里，可以找到进入该 guard 提示词策略中心的入口。

你可以自行决定启用哪些检测项，并为每项检测设置阈值。

:::info
LiteLLM 搭配虚拟密钥（virtual key）使用时，可以在 Aim 的 guards 页面直接设置针对单个密钥的策略：创建 guard 时指定虚拟密钥的别名即可。

发送给 Aim 的只有虚拟密钥的别名，不会包含密钥本身。
:::

### 3. 在 LiteLLM config.yaml 中添加 Aim 防护栏

在 `guardrails` 配置段下定义你的防护栏（guardrail）
```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: aim-protected-app
    litellm_params:
      guardrail: aim
      mode: [pre_call, post_call] # "During_call" is also available
      api_key: os.environ/AIM_API_KEY
      api_base: os.environ/AIM_API_BASE # Optional, use only when using a self-hosted Aim Outpost
      ssl_verify: False # Optional, set to False to disable SSL verification or a string path to a custom CA bundle
      inspect_embeddings: false # Optional, set to true to inspect /embeddings input
```

在 `api_key` 处填入给你签发的 API 密钥（API key）。这个密钥可以在 guard 页面找到。
也可以把 `AIM_API_KEY` 设置为环境变量。

`api_base` 默认为 `https://api.aim.security`。如果你使用自托管（self-hosted）的 Aim Outpost，可以把 `api_base` 设为你的 Outpost URL。

### 4. 启动 LiteLLM 网关
```shell
litellm --config config.yaml
```

### 5. 发出第一个请求

:::note
下面的示例依赖于在你的 guard 中启用 *PII*（个人身份信息）检测。
你可以调整请求内容，以匹配 guard 的其他策略。
:::

<Tabs>
<TabItem label="成功拦截的请求" value = "blocked">

:::note
LiteLLM 搭配虚拟密钥使用时，需要在请求中携带带有虚拟密钥的 `Authorization` 请求头。
:::

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ],
    "guardrails": ["aim-protected-app"]
  }'
```

如果配置正确，`ishaan@berri.ai` 会被 Aim Guard 识别为 PII，你将收到类似如下的响应，状态码为 `400 Bad Request`：

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

<TabItem label="成功放行的请求" value = "allowed">

:::note
LiteLLM 搭配虚拟密钥使用时，需要在请求中携带带有虚拟密钥的 `Authorization` 请求头。
:::

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["aim-protected-app"]
  }'
```

上面的请求不会被拦截，你会收到一条正常的 LLM 响应（为节省篇幅做了简化）：

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

## 高级用法

Aim Guard 提供针对具体用户的防护栏策略，让你可以为单个用户定制专属策略。
要使用这一功能，请在请求负载中带上终端用户的邮箱，也就是设置请求的 `x-aim-user-email` 请求头。

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-aim-user-email: ishaan@berri.ai" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["aim-protected-app"]
  }'
```
