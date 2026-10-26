import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 防护栏（Guardrails）快速上手

在 LiteLLM 代理（AI 网关）上配置提示注入（prompt injection）检测与 PII（个人身份信息）脱敏。

想了解防护栏与网关其他能力对标 OWASP LLM 应用 Top 10（2026）的情况，请阅读 [OWASP LLM Top 10 映射](../security_owasp_llm_top10)。

## 1. 在 LiteLLM config.yaml 中定义防护栏

在 `guardrails` 配置段下定义你的防护栏

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: general-guard
    litellm_params:
      guardrail: cato_networks
      mode: [pre_call, post_call]
      api_key: os.environ/CATO_API_KEY
      api_base: os.environ/CATO_API_BASE
      default_on: true # Optional
  
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
    guardrail_info: # Optional field, info is returned on GET /guardrails/list
      # you can enter any fields under info for consumers of your guardrail
      params:
        - name: "toxicity_score"
          type: "float"
          description: "Score between 0-1 indicating content toxicity level"
        - name: "pii_detection"
          type: "boolean"

# Example Presidio guardrail config with entity actions + confidence score thresholds
  - guardrail_name: "presidio-pii"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
      presidio_language: "en"
      pii_entities_config:
        CREDIT_CARD: "MASK"
        EMAIL_ADDRESS: "MASK"
        US_SSN: "MASK"
      presidio_score_thresholds:  # minimum confidence scores for keeping detections
        CREDIT_CARD: 0.8
        EMAIL_ADDRESS: 0.6

# Example Pillar Security config via Generic Guardrail API
  - guardrail_name: "pillar-security"
    litellm_params:
      guardrail: generic_guardrail_api
      mode: [pre_call, post_call]
      api_base: https://api.pillar.security/api/v1/integrations/litellm
      api_key: os.environ/PILLAR_API_KEY
      additional_provider_specific_params:
        plr_mask: true
        plr_evidence: true
        plr_scanners: true
```

通用防护栏 API 还可以设置**静态请求头**（`headers`：每次请求都会携带的键值对）和**动态请求头**（`extra_headers`：需要透传的客户端请求头名称列表）。参见[通用防护栏 API 的静态与动态请求头](/docs/adding_provider/generic_guardrail_api#静态与动态请求头)。

### `mode` 的可选值（事件钩子）

- `pre_call`：在 LLM 调用**之前**运行，作用于**输入**
- `post_call`：在 LLM 调用**之后**运行，作用于**输入与输出**
- `during_call`：在 LLM 调用**期间**运行，作用于**输入**。与 `pre_call` 类似，但与 LLM 调用并行执行；防护栏检查完成之前不会返回响应
- `logging_only`：只扫描被记录的输入与输出，不改动返回给客户端的响应。是否支持取决于具体的防护栏集成
- 也可以传入一个取值列表来同时运行多种模式，例如 `mode: [pre_call, post_call]`

### 用 `stream_scope` 限定只在流式或非流式请求上运行

防护栏默认对流式和非流式请求都会运行。在该防护栏的 `litellm_params` 下设置 `stream_scope`，选择它评估哪些请求形态：

- `streaming`：只在客户端要求流式响应时运行
- `non_streaming`：只在普通请求/响应调用时运行
- `both`：对所有请求都运行（默认值，也是未设置 `stream_scope` 时的原有行为）

```yaml
guardrails:
  # runs only on streaming requests; non-streaming calls bypass the scan
  - guardrail_name: "moderate-streams-only"
    litellm_params:
      guardrail: generic_guardrail_api
      mode: post_call
      stream_scope: streaming
      api_base: os.environ/GUARDRAIL_API_BASE
      default_on: true

  # runs only on non-streaming requests
  - guardrail_name: "moderate-non-streams"
    litellm_params:
      guardrail: generic_guardrail_api
      mode: post_call
      stream_scope: non_streaming
      api_base: os.environ/GUARDRAIL_API_BASE
      default_on: true
```

配置了多种模式的防护栏（例如 `mode: [pre_call, post_call]`）可以用一个映射为每种模式单独设定范围。键是模式名；映射里没列出的模式默认为 `both`：

```yaml
guardrails:
  - guardrail_name: "scoped-by-mode"
    litellm_params:
      guardrail: generic_guardrail_api
      mode: [pre_call, post_call]
      stream_scope:
        pre_call: streaming
        post_call: both
      api_base: os.environ/GUARDRAIL_API_BASE
      default_on: true
```

管理界面在防护栏创建表单上也提供同一个控件，名为 **Request shape（请求形态）**；每种已配置的模式都有各自的下拉框。

<Image
  img={require('../../../img/stream_scope_request_shape_ui.png')}
  alt="创建防护栏表单：Request shape 控件，pre_call applies to 下拉框设为 Streaming only"
  style={{ width: '100%', maxWidth: '900px', height: 'auto' }}
/>

下拉框展开后可见三个范围选项：

<Image
  img={require('../../../img/stream_scope_request_shape_closeup.png')}
  alt="特写：pre_call applies to 下拉框展开，含 Streaming and non-streaming、Streaming only、Non-streaming only 三个选项"
  style={{ width: '100%', maxWidth: '700px', height: 'auto' }}
/>

已保存防护栏的详情页会显示各模式的范围摘要：

<Image
  img={require('../../../img/stream_scope_guardrail_detail_ui.png')}
  alt="防护栏详情页：各模式的流范围摘要，pre_call 为 Streaming only，post_call 为 Streaming and non-streaming"
  style={{ width: '100%', maxWidth: '900px', height: 'auto' }}
/>

实时音频输入转写按流式处理，所以 `streaming` 范围同样覆盖跑在实时转写事件上的防护栏，`non_streaming` 范围则把它们排除在外。

Bedrock 透传请求的流式状态取自所调用的 Bedrock 操作，因此 `stream_scope` 对它们的控制方式与原生路由一致。

#### 校验

`stream_scope` 的取值若不是 `streaming`、`non_streaming` 或 `both`（或映射的键不是模式名），创建和更新时都会以 `422` 拒绝。启动阶段无论是从配置文件还是数据库记录加载，非法的 `stream_scope` 都会被忽略并记一条警告日志，防护栏继续以默认的 `both` 范围运行。

### 用 `logging_only_scope` 只观察单个方向 {#observe-only-one-direction-with-logging_only_scope}

`logging_only` 防护栏默认同时观察请求和响应。在该防护栏的 `litellm_params` 下设置 `logging_only_scope`，选择扫描观察哪个方向：

- `input`：只扫描请求
- `output`：只扫描响应
- `both`：双向都扫描（默认方向）
- 未设置 / `null`（默认）：双向都扫描，保持原有行为，已有部署不受影响

```yaml
guardrails:
  # unset (default): scans request and response, pre-existing behavior
  - guardrail_name: "observe-default"
    litellm_params:
      guardrail: generic_guardrail_api
      mode: logging_only
      api_base: os.environ/GUARDRAIL_API_BASE
      default_on: true

  # scans only the request
  - guardrail_name: "observe-requests"
    litellm_params:
      guardrail: generic_guardrail_api
      mode: logging_only
      logging_only_scope: input
      api_base: os.environ/GUARDRAIL_API_BASE
      default_on: true

  # scans only the response
  - guardrail_name: "observe-responses"
    litellm_params:
      guardrail: generic_guardrail_api
      mode: logging_only
      logging_only_scope: output
      api_base: os.environ/GUARDRAIL_API_BASE
      default_on: true

  # explicitly scans both directions
  - guardrail_name: "observe-both"
    litellm_params:
      guardrail: generic_guardrail_api
      mode: logging_only
      logging_only_scope: both
      api_base: os.environ/GUARDRAIL_API_BASE
      default_on: true
```

以上任何一种情况下，扫描都不会拦截或改动客户端调用；每个判定结果（包括本应拦截的判定）都会记录在花费日志的 `guardrail_information` 里，并计入防护栏监控面板（Guardrails Monitor）。

#### 输入扫描失败时

`logging_only` 模式不会真正拦截任何请求，被输入扫描标记的请求仍会到达模型，对话继续进行。范围设置决定响应是否仍被观察：

- **未设置范围**（默认）：输入扫描失败时（防护栏报错，或返回了本应拦截该调用的判定），跳过输出扫描，只记录输入侧的判定或错误。这是原有行为，已有部署不受影响。
- **显式设置 `both`**：输入扫描的失败会记为警告，响应**仍会被扫描**，两份判定都能拿到。`logging_only` 模式下本来就不会拦截任何内容，显式设置 `both` 可以持续盯着被标记对话的响应。

`input` 和 `output` 本来就只扫一个方向，所以上述差别只出现在未设置和 `both` 这两种情况上。

#### 校验

- `logging_only_scope` 的取值若不是 `input`、`output` 或 `both`，创建和更新时都会以 `422` 拒绝。
- 防护栏用不上的范围（`mode` 里没有 `logging_only` 却设置了 `logging_only_scope`，或者对自带日志钩子的防护栏设置 `input`/`output`）在创建时返回 `400`，更新中出现同样设置则返回 `422`。被拒绝的写入会回滚，已保存的防护栏保持原配置。
- 启动阶段无论是从配置文件还是数据库记录加载，非法的 `logging_only_scope` 都会被忽略并记一条错误日志，防护栏保持其已配置的模式。

`logging_only_scope` 只收窄 `logging_only` 这一路扫描。同一防护栏上的拦截模式（`pre_call`、`during_call`、`post_call`）不受影响，照样拦截：`mode: [pre_call, logging_only]` 搭配 `logging_only_scope: output`，既拦下问题请求，又记录响应判定而不拦截响应。只想观察某个方向而永不拦截的话，就不要在 `mode` 里加对应的拦截模式。

方向性范围只对通过通用 `apply_guardrail` 接口执行 `logging_only` 扫描的防护栏生效。自带日志钩子的防护栏（例如 Presidio，它有自己的 `presidio_filter_scope`）会忽略这里的 `input`/`output`。

编辑防护栏（例如只改描述的 PUT 请求）不会再打乱防护栏的执行顺序：防护栏顺序在多次更新之间保持稳定，同一内容上 BLOCK 和 MASK 谁胜出也不会变。

### 在防护栏评估中跳过 system 消息

你可以让防护栏不再扫描 `role: system` 内容，同时发给模型的仍是完整的 `messages` 列表。

**全局**，在 `litellm_settings` 中：

```yaml
litellm_settings:
  skip_system_message_in_guardrail: true
```

**按防护栏**，在该防护栏的 `litellm_params` 下：设置 `skip_system_message_in_guardrail: true` 或 `false`。省略时使用全局 `litellm_settings` 的值；防护栏级的 `false` 会强制纳入 system 消息，即使全局开关是 `true`。

**通过 LiteLLM UI**，在 LiteLLM 管理面板中**创建**或**编辑**防护栏时，设置**在防护栏扫描中跳过 system 消息**（创建时位于 Basic Info 下方，编辑或防护栏设置流程里也可设置）：


| UI 选项 | 效果 |
| --- | --- |
| **使用全局默认** | 使用代理配置里 `litellm_settings.skip_system_message_in_guardrail` 的值 |
| **是：不纳入防护栏扫描** | 设置该防护栏的 `skip_system_message_in_guardrail: true` |
| **否：始终纳入扫描** | 设置该防护栏的 `skip_system_message_in_guardrail: false`（覆盖全局跳过） |


<Image
  img={require('../../../img/skip_system_message_guardrail_ui.png')}
  dark={require('../../../img/skip_system_message_guardrail_ui_dark.png')}
  alt="创建防护栏：Skip system messages in guardrail 下拉框，含 Use global default、Yes exclude from guardrail scan、No always include in scan 三个选项"
  style={{ width: '100%', maxWidth: '900px', height: 'auto' }}
/>

### 在防护栏评估中跳过 tool 消息

同样的思路，用于 `role: tool` 内容：让防护栏不再扫描工具调用结果，同时发给模型的仍是完整的 `messages` 列表。

**全局**（在 `litellm_settings` 中）：

```yaml
litellm_settings:
  skip_tool_message_in_guardrail: true
```

**按防护栏**：在该防护栏的 `litellm_params` 下设置 `skip_tool_message_in_guardrail: true` 或 `false`，全局/防护栏级的优先级与上面的 system 消息开关相同。

**通过 LiteLLM UI**：以同样方式设置**在防护栏扫描中跳过 tool 消息**，位置就在上文 system 消息下拉框的正下方，三个选项也一致（**使用全局默认**、**是：不纳入防护栏扫描**、**否：始终纳入扫描**）。

### 这些跳过开关的适用范围

**适用范围：** 走**统一**防护栏路径的提供商（实现了 `apply_guardrail`、经 LiteLLM 消息翻译层运行的那些），作用于 **OpenAI Chat Completions**（`/v1/chat/completions`）和 **Anthropic Messages**（`/v1/messages`）两类路由。例如 Presidio、Bedrock 防护栏、`litellm_content_filter`、OpenAI Moderation、Generic Guardrail API，以及定义了 `apply_guardrail` 的自定义代码防护栏。**Lakera v2** 虽然通过直接钩子而非统一路径运行，同样遵守这两个开关；参见 [Lakera AI](./lakera_ai#支持的参数)。

***不*适用的范围：** 其他只通过直接钩子跑在原始请求上的防护栏（例如 Aporia、DynamoAI、Javelin、Lasso、Pangea、Model Armor、Azure Content Safety 钩子、Guardrails AI、AIM、Cato Networks、tool permission、MCP security）。在这些端点接入同一翻译层之前，这两个开关也不作用于其他路由（例如 Responses API、嵌入、语音）。

### 防护栏负载均衡

想把防护栏请求分散到多个账户或多个区域？详见[防护栏负载均衡](./guardrail_load_balancing.md)，包括：

- 跨多个 AWS Bedrock 账户做负载均衡（有利于管理速率限制）
- 防护栏实例之间的加权分发
- 多区域防护栏部署

## 2. 启动 LiteLLM 网关

```shell
litellm --config config.yaml --detailed_debug
```

## 3. 测试请求

**[Langchain、OpenAI SDK 用法示例](/docs/proxy/user_keys#请求格式)**



预期这条请求会失败，因为请求里的 `ishaan@berri.ai` 是 PII

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

失败时的预期响应

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





## **默认开启的防护栏**

在防护栏配置里设 `default_on: true`，防护栏就会在每个请求上运行。适合不想让用户手动指定、希望防护栏全程生效的场景。

**注意**：即使用户指定了别的防护栏，或传了空的 guardrails 数组，这些防护栏也会照常运行。

```yaml
guardrails:
  - guardrail_name: "aporia-pre-guard"
    litellm_params:
      guardrail: aporia
      mode: "pre_call"
      default_on: true
```

**测试请求**

这条请求里，由于设置了 `default_on: true`，防护栏 `aporia-pre-guard` 会在每个请求上运行。

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ]
  }'
```

**预期响应**

响应头里会出现 `x-litellm-applied-guardrails`，标明已应用的防护栏

```
x-litellm-applied-guardrails: aporia-pre-guard
```

### 防护栏策略

需要更细的控制？用[防护栏策略](./guardrail_policies.md)可以：

- 把多个防护栏组成可复用的策略
- 针对特定团队、密钥或模型启用/停用防护栏
- 从现有策略继承并覆盖其中部分防护栏

## **在客户端使用防护栏**

### 自己动手测试 **（OSS）**

在请求体里传入 `guardrails` 来试一下

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

### 在响应中查看防护栏结果 **（OSS）**

在请求体里设置 `include_guardrail_response: true`，响应顶层就会多出一个 `guardrail_information` 列表，返回防护栏的执行记录。不设置时响应体保持不变，现有客户端不受影响。这个标志在请求到达提供商之前就会被剥掉

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user", "content": "Reply OK"}],
    "guardrails": ["aporia-pre-guard"],
    "include_guardrail_response": true
  }'
```

预期响应（省略部分字段）

```json
{
  "id": "chatcmpl-EQjb0XEZzNUUGhbbYLfB2FApCuPJc",
  "choices": [{"message": {"role": "assistant", "content": "OK"}}],
  "guardrail_information": [
    {
      "guardrail_name": "aporia-pre-guard",
      "guardrail_provider": "aporia",
      "guardrail_mode": "pre_call",
      "guardrail_status": "success",
      "guardrail_response": [],
      "start_time": 1790040506.278482,
      "end_time": 1790040506.278695,
      "duration": 0.000214,
      "masked_entity_count": {}
    }
  ]
}
```

每条记录的结构与 [`StandardLoggingPayload`](../logging_spec#standardloggingguardrailinformation) 中的 `guardrail_information` 一致。该请求没有防护栏运行时，`guardrail_information` 为 `[]`。只有 JSON 布尔值 `true` 能开启它；`"true"` 或 `1` 都视为关闭。流式响应不携带该字段。`guardrail_response` 里任何 `keyword`、`snippet`、`match` 或 `regex` 值都会以 `"[REDACTED]"` 返回，被脱敏的内容永远不会回显给调用方

### 开放给你的用户 **（企业版）**

按下面这套简单流程来落地并调优防护栏：

### 1. 查看可用防护栏

先看看有哪些防护栏可用、参数是什么：

调用 `/guardrails/list` 查看可用防护栏及其信息（支持的参数、描述等）

```shell
curl -X GET 'http://0.0.0.0:4000/guardrails/list'
```

预期响应

```json
{
    "guardrails": [
        {
        "guardrail_name": "aporia-post-guard",
        "guardrail_info": {
            "params": [
            {
                "name": "toxicity_score",
                "type": "float",
                "description": "Score between 0-1 indicating content toxicity level"
            },
            {
                "name": "pii_detection",
                "type": "boolean"
            }
            ]
        }
        }
    ]
}
```



这份配置就会返回上面的 `/guardrails/list` 响应。`guardrail_info` 字段是可选的，你可以在 info 下随意添加字段，给防护栏的使用方参考



```yaml
- guardrail_name: "aporia-post-guard"
  litellm_params:
      guardrail: aporia  # supported values: "aporia", "lakera"
      mode: "post_call"
      api_key: os.environ/APORIA_API_KEY_2
      api_base: os.environ/APORIA_API_BASE_2
  guardrail_info: # Optional field, info is returned on GET /guardrails/list
      # you can enter any fields under info for consumers of your guardrail
      params:
        - name: "toxicity_score"
          type: "float"
          description: "Score between 0-1 indicating content toxicity level"
        - name: "pii_detection"
          type: "boolean"
```

### 2. 应用防护栏

把选好的防护栏加进对话补全请求：

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user", "content": "your message"}],
    "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
  }'
```

### 3. 用 Mock LLM 补全测试

发送 `mock_response` 即可在不真正调用 LLM 的情况下测试防护栏。`mock_response` 的更多信息见[这里](../../completion/mock_requests)

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ],
    "mock_response": "This is a mock response",
    "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
  }'
```

### 4. ✨ 向防护栏传递动态参数

<EnterpriseFeature />

用它可以在调用防护栏 API 时附带额外参数，比如成功阈值这类。**[更多细节见 `guardrails` 参数规范](/docs/proxy/guardrails/quick_start#guardrails-请求参数)**





设置 `guardrails={"aporia-pre-guard": {"extra_body": {"success_threshold": 0.9}}}`，即可给防护栏传额外参数

这个例子里，`success_threshold=0.9` 被传进了 `aporia-pre-guard` 防护栏的请求体

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
    ],
    extra_body={
      "guardrails": {
        "aporia-pre-guard": {
          "extra_body": {
            "success_threshold": 0.9
          }
        }
      }
    }

)

print(response)
```





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
    ],
    "guardrails": {
      "aporia-pre-guard": {
        "extra_body": {
          "success_threshold": 0.9
        }
      }
    }
}'
```



## **代理管理控制**

### 监控防护栏

监控哪些防护栏执行过、各自是通过还是失败。例如某个防护栏出了故障，把本不该拦的请求也拦了下来

:::

#### 设置

1. 把 LiteLLM 接到一个[受支持的日志提供商](../logging)
2. 发一个带 `guardrails` 参数的请求
3. 到你的日志提供商里查看防护栏追踪记录

#### 追踪到的防护栏成功

<Image img={require('../../../img/gd_success.png')} />

#### 追踪到的防护栏失败

<Image img={require('../../../img/gd_fail.png')} />

### ✨ 按 API 密钥控制防护栏

<EnterpriseFeature />

用它可以从 API 密钥的粒度控制运行哪些防护栏。本教程只想让下面这组防护栏对某一个 API 密钥生效

- `guardrails`: ["aporia-pre-guard", "aporia-post-guard"]

**步骤 1** 创建带防护栏设置的密钥



```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{
            "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
    }'
```



```shell
curl --location 'http://0.0.0.0:4000/key/update' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
        "key": "sk-jNm1Zar7XfNdZXp49Z1kSQ",
        "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
}'
```



**步骤 2** 用新密钥试一下

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

### ✨ 基于标签的防护栏模式

<EnterpriseFeature />

根据 user-agent 请求头来决定运行什么防护栏。典型用法：对 OpenWebUI 跑调用前检查，而对 Claude CLI 只在日志里脱敏。

`default` 和标签值都可以是单个模式字符串，也可以是模式列表。



```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "guardrails_ai-guard"
    litellm_params:
      guardrail: guardrails_ai
      guard_name: "pii_detect" # 👈 Guardrail AI guard name
      mode:
        tags:
            "User-Agent: claude-cli": "logging_only"                 # Claude CLI - only mask in logs
        default: "pre_call"               # Default mode when no tags match
      api_base: os.environ/GUARDRAILS_AI_API_BASE # 👈 Guardrails AI API Base. Defaults to "http://0.0.0.0:8000"
      default_on: true # run on every request
```



```yaml
Per guardrailmodel_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "guardrails_ai-guard"
    litellm_params:
      guardrail: guardrails_ai
      guard_name: "pii_detect"
      mode:
        tags:
            "User-Agent: claude-cli": "logging_only"
        default: ["pre_call", "post_call"]  # Run on both pre and post call when no tags match
      api_base: os.environ/GUARDRAILS_AI_API_BASE
      default_on: true
```



```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "guardrails_ai-guard"
    litellm_params:
      guardrail: guardrails_ai
      guard_name: "pii_detect"
      mode:
        tags:
            "User-Agent: claude-cli": ["pre_call", "post_call"]  # Run both pre and post call for claude-cli
        default: "logging_only"  # Default to logging only when no tags match
      api_base: os.environ/GUARDRAILS_AI_API_BASE
      default_on: true
```



### ✨ 模型级防护栏

<EnterpriseFeature />

适合这种场景：你同时有本地部署和云端托管的模型，只想防止 PII 被发给托管模型那边。

```yaml
model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
      api_base: https://api.anthropic.com/v1
      guardrails: ["azure-text-moderation"]
  - model_name: openai-gpt-4o
    litellm_params:
      model: openai/{{openai_large}}

guardrails:
  - guardrail_name: "presidio-pii"
    litellm_params:
      guardrail: presidio  # supported values: "aporia", "bedrock", "lakera", "presidio"
      mode: "pre_call"
      presidio_language: "en"  # optional: set default language for PII analysis
      pii_entities_config:
        PERSON: "BLOCK"  # Will mask credit card numbers
  - guardrail_name: azure-text-moderation
    litellm_params:
      guardrail: azure/text_moderations
      mode: "post_call" 
      api_key: os.environ/AZURE_GUARDRAIL_API_KEY
      api_base: os.environ/AZURE_GUARDRAIL_API_BASE 
```

### ✨ 禁止团队开启/关闭防护栏

<EnterpriseFeature />

#### 1. 禁止团队修改防护栏

```bash
curl -X POST 'http://0.0.0.0:4000/team/update' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "team_id": "4198d93c-d375-4c83-8d5a-71e7c5473e50",
    "metadata": {"guardrails": {"modify_guardrails": false}}
}'
```

#### 2. 尝试在一次调用中关闭防护栏

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_VIRTUAL_KEY' \
--data '{
"model": "{{openai_small}}",
    "messages": [
      {
        "role": "user",
        "content": "Think of 10 random colors."
      }
    ],
    "metadata": {"guardrails": {"hide_secrets": false}}
}'
```

#### 3. 收到 403 错误

```
{
    "error": {
        "message": {
            "error": "Your team does not have permission to modify guardrails."
        },
        "type": "auth_error",
        "param": "None",
        "code": 403
    }
}
```

在你的回调写入的服务端日志里，不应再出现 `+1 412-612-9992`。

:::info
这条请求之所以跑了 `pii_masking` 防护栏，是因为密钥 sk-jNm1Zar7XfNdZXp49Z1kSQ 带有 `"permissions": {"pii_masking": true}`
:::

## 规格说明

### YAML 中的 `guardrails` 配置

```yaml
guardrails:
  - guardrail_name: string     # Required: Name of the guardrail
    litellm_params:            # Required: Configuration parameters
      guardrail: string        # Required: One of "aporia", "bedrock", "guardrails_ai", "lakera", "presidio", "hide-secrets"
      mode: Union[string, List[string], Mode]             # Required: One or more of "pre_call", "post_call", "during_call", "logging_only"
      api_key: string          # Required: API key for the guardrail service
      api_base: string         # Optional: Base URL for the guardrail service
      default_on: boolean      # Optional: Default False. When set to True, will run on every request, does not need client to specify guardrail in request
      logging_only_scope: string # Optional: "input" (request only), "output" (response only), or "both" (both directions). Unset scans both directions and keeps the pre-existing behavior
    guardrail_info:            # Optional[Dict]: Additional information about the guardrail
      
```

模式规格

`default` 和标签值都接受单个字符串或字符串列表。

```python
from litellm.types.guardrails import Mode

# Single default mode
mode = Mode(
    tags={"User-Agent: claude-cli": "logging_only"},
    default="logging_only"
)

# Multiple default modes
mode = Mode(
    tags={"User-Agent: claude-cli": "logging_only"},
    default=["pre_call", "post_call"]
)

# Multiple modes on a tag value
mode = Mode(
    tags={"User-Agent: claude-cli": ["pre_call", "post_call"]},
    default="logging_only"
)
```
### `guardrails` 请求参数

`guardrails` 参数可以传给任何 LiteLLM 代理服务器（Proxy）端点（`/chat/completions`、`/completions`、`/embeddings`）。

#### 格式选项

1. 简单列表格式：

```python
{"guardrails": [
    "aporia-pre-guard",
    "aporia-post-guard"
]}
```

1. 高级字典格式：

这种格式下，字典的键就是你要运行的 `guardrail_name`

```python
{"guardrails": {
    "aporia-pre-guard": {
        "extra_body": {
            "success_threshold": 0.9,
            "other_param": "value"
        }
    }
}}
```

#### 类型定义

```python
guardrails: Union[
    List[str],                              # Simple list of guardrail names
    Dict[str, DynamicGuardrailParams]       # Advanced configuration
]

class DynamicGuardrailParams:
    extra_body: Dict[str, Any]              # Additional parameters for the guardrail
```
