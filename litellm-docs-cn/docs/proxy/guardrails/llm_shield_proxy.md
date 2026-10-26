import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LLM Shield Proxy

LLM Shield Proxy 防护栏（guardrails）会在请求到达模型之前，把其中的个人数据替换成逼真的替身值（stand-in），再在回复中把原始值还原。替身值及其背后的原始值都保存在你自己的 [LLM Shield Proxy](https://github.com/ninadphalak/LLM-Shield-Proxy) 部署内部的会话保管库（session vault）里，因此提供商永远收不到原始数据，而调用方仍能看到它们。

由于替换是可逆的，两种模式应配置在同一条防护栏条目中：`pre_call` 对请求脱敏（redact），`post_call` 还原回复。只配置 `pre_call` 时，请求会被脱敏，替身值随后原样返回给调用方。Admin UI 中 LLM Shield Proxy 的预设会同时启用这两种模式。

这条防护栏采取失败即拦截（fail closed）策略。如果你的 Shield 部署不可达、超时或返回错误状态码，请求会被拦截而不是转发，因为脱敏防护栏一旦失败放行（fail open），它本来要保护的数据就会径直发给提供商。

覆盖 `/v1/chat/completions`、`/v1/completions`、`/v1/responses` 和 `/v1/messages`，流式与非流式均支持。

## 快速上手

### 1. 运行 LLM Shield Proxy

```shell
docker run -d --name llm-shield -p 8000:8000 \
  -e VALID_VIRTUAL_KEYS=sk-shield-change-me \
  ghcr.io/ninadphalak/llm-shield-proxy:latest
```

`VALID_VIRTUAL_KEYS` 是 LiteLLM 出示给 Shield 的密钥。还原操作会返回明文，因此缺少密钥的防护栏调用会被 Shield 拒绝。Shield 也发布在 PyPI 上，包名为 `llm-shield-proxy`。

### 2. 将 LLM Shield Proxy 添加到 LiteLLM config.yaml

```yaml title="config.yaml"
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: llm-shield
    litellm_params:
      guardrail: llm_shield_proxy
      mode: [pre_call, post_call]
      default_on: true
      api_base: http://localhost:8000
      api_key: os.environ/LLM_SHIELD_PROXY_API_KEY
```

同样的配置项也可以在 Admin UI 的 **Guardrails > Add Guardrail > LLM Shield Proxy** 中找到。

### 3. 启动 LiteLLM Proxy

```shell
export OPENAI_API_KEY=sk-...
export LLM_SHIELD_PROXY_API_KEY=sk-shield-change-me
litellm --config config.yaml
```

### 4. 发起第一个请求

<Tabs>
<TabItem label="脱敏与还原" value="restored">

```shell
curl -sSLX POST 'http://0.0.0.0:4000/v1/chat/completions' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
  "model": "{{openai_small}}",
  "messages": [
    {"role": "user", "content": "Repeat exactly: email jane.doe@example.com about card 4111 1111 1111 1111"}
  ]
}'
```

提供商收到的是 `john10@example.net` 和 `6567211639751374` 这类替身值，而不是真实的邮箱地址和卡号。你拿到的回复里，`jane.doe@example.com` 和 `4111 1111 1111 1111` 已经还原回真实值。

</TabItem>
<TabItem label="流式" value="streaming">

```shell
curl -sSLX POST 'http://0.0.0.0:4000/v1/chat/completions' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
  "model": "{{openai_small}}",
  "stream": true,
  "messages": [
    {"role": "user", "content": "Repeat exactly: email jane.doe@example.com"}
  ]
}'
```

Token 一到就转发，不会缓冲到响应结束才处理。Shield 只扣留那些可能仍属于某个替身值的尾部字符，因此被拆分到两个分块中的值会完整还原，绝不会以残缺片段的形式输出。

</TabItem>
<TabItem label="Shield 不可达" value="blocked">

```json
{
  "error": {
    "message": "Guardrail raised an exception, Guardrail: llm-shield, Message: LLM Shield Proxy is unreachable; blocking the request.",
    "type": "invalid_request_error",
    "param": null,
    "code": "400"
  }
}
```

</TabItem>
</Tabs>

## 哪些内容会被替换、哪些会被还原

在请求侧，防护栏会收集聊天消息文本和工具调用参数，涵盖 chat、Responses 的 `input`、Completions 的 `prompt` 与 `suffix`，以及 Anthropic 消息，包括嵌套的工具结果。同样会被遍历的还有：Anthropic 文档部分（其 `title`、`context` 以及 `text` 来源的文本）、Responses 函数调用输出（字符串或 `output_text` 部分）、自定义工具调用的 `input`、代码解释器的 `code`、带类型的提示词变量，以及 `extra_body` 下的所有内容。LiteLLM 会在发送前把 `extra_body` 合并进转换后的请求，其中若有未脱敏的 `messages` 或 `system`，就会在实际发出的请求里覆盖已脱敏的版本。每个请求都会拿到一个由 LiteLLM 生成、以进程为命名空间的全新保管库 id；调用方发送的任何内容都不会被用来命名保管库，因此调用方无法通过让替身值回显来触达其他请求的值。

由应用而非调用方写入的文本会被脱敏进第二个保管库，且这个保管库永远不会用于还原：`system` 与 `developer` 轮次、Responses `input` 中的 `system` 与 `developer` 条目、Anthropic 顶层的 `system`、Responses `instructions`、工具描述与参数 schema、结构化输出 schema、网页搜索的用户位置信息，以及 `user` 和 `safety_identifier` 字段。例外是 schema 中的 `enum` 和 `const` 值，它们会进入调用方的保管库，这样用到它们的工具调用或结构化输出在返回时才能带上真实值。嵌套深度超过遍历上限的请求会被直接拒绝，而不是带着未脱敏的部分被转发。

在回复侧，防护栏会还原消息内容、工具调用参数、Completions 的 `text`、Anthropic 文本与 `tool_use` 输入，以及 Responses 输出条目，完整回复与流式响应都适用。每条流（每个 choice 的内容、每个工具调用、每个 Anthropic 内容块、每个 Responses delta 族）都维护自己的窗口，因此为某条流扣留的文本不会混入另一条流。图像和音频部分不含文本，原样通过。

## 在 LiteLLM SDK 中使用

在代理之外，可以把这条防护栏作为模型级回调挂载，并在每次调用时按名称指定。请求会在部署的 pre-call 钩子中脱敏，回复则在部署的 post-call 钩子中还原：

```python
import litellm
from litellm.proxy.guardrails.guardrail_hooks.llm_shield_proxy import LLMShieldProxyGuardrail

litellm.callbacks.append(
    LLMShieldProxyGuardrail(
        api_base="http://localhost:8000",
        api_key="sk-shield-change-me",
        event_hook=["pre_call", "post_call"],
    )
)

response = await litellm.acompletion(
    model="openai/gpt-4.1-mini",
    messages=[{"role": "user", "content": "Email jane.doe@example.com the invoice"}],
    guardrails=["llm_shield_proxy"],
)
```

传给 `guardrails` 的名称必须与防护栏的 `guardrail_name` 一致（未自定义时就是 `llm_shield_proxy`）。这条路径有两个限制：

- **不支持流式**。SDK 流没有任何还原机制，因此这里的 `stream=True` 请求会失败并报出 `LLM Shield Proxy cannot restore a streamed reply for a model-level guardrail outside the LiteLLM proxy`。流式请求请经由代理发送，代理会逐步还原。
- **绕过响应缓存**。缓存命中会在任何 post-call 钩子执行前直接返回，而如果在还原之后再写入缓存，就会把某个调用方的值交给下一个脱敏后恰好匹配的调用方，因此模型级防护栏的请求既不读缓存也不写缓存。

## 经由代理的缓存与遥测

经由代理使用时，LiteLLM 缓存的是脱敏后的回复。还原发生在缓存写入之后，因此响应缓存里永远不会出现明文。防护栏遥测记录的同样是防护栏发出的替身值，而不是还原后的值。

## 支持的参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| `api_base` | `http://localhost:8000` | 你的 LLM Shield Proxy 部署的基础 URL。若未设置，回退到环境变量 `LLM_SHIELD_PROXY_API_BASE` |
| `api_key` | `None` | Shield 的 `VALID_VIRTUAL_KEYS` 之一，以 Bearer 凭证形式发送。若未设置，回退到环境变量 `LLM_SHIELD_PROXY_API_KEY` |

每次对 Shield 的调用在 10 秒后超时，超时会像其他 Shield 故障一样拦截请求。

## 支持的模式

| 模式 | 作用 |
|---|---|
| `pre_call` | 把请求中的个人数据替换成替身值，替身值保存在你的 Shield 部署内部的保管库中 |
| `post_call` | 还原回复中的原始值，流式与非流式均支持。保管库始终留在你的部署内，LiteLLM 从不存储明文 |

## 延伸阅读

- [GitHub 上的 LLM Shield Proxy](https://github.com/ninadphalak/LLM-Shield-Proxy)
- [PyPI 上的 llm-shield-proxy](https://pypi.org/project/llm-shield-proxy/)
