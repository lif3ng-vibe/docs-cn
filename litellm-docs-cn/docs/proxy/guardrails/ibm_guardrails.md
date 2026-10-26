import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# IBM Guardrails

LiteLLM 与 [IBM FMS Guardrails](https://github.com/foundation-model-stack/fms-guardrails-orchestrator) 集成，为内容安全提供支持，可用于检测越狱攻击（jailbreak）、PII（个人身份信息）、仇恨言论等多种风险。

## 功能简介

IBM FMS Guardrails 是一个在 LLM 输入与输出上调用检测器（detector）的框架。这些检测器可以借助 [TrustyAI detectors](https://github.com/trustyai-explainability/guardrails-detectors) 之类的项目来配置，它是由 Red Hat [TrustyAI 团队](https://github.com/trustyai-explainability)维护的开源项目，支持把检测器配置为：

- 正则表达式规则
- 文件类型校验器
- 自定义 Python 函数
- Hugging Face [AutoModelForSequenceClassification](https://huggingface.co/docs/transformers/en/model_doc/auto#transformers.AutoModelForSequenceClassification)，即序列分类模型

每个检测器都会按照以下 [OpenAPI schema](https://foundation-model-stack.github.io/fms-guardrails-orchestrator/docs/api/openapi_detector_api.yaml) 返回 API 响应。

你可以在以下时机执行这些检查：
- 发送给 LLM 之前（针对用户输入）
- 收到 LLM 响应之后（针对输出）
- 调用进行期间（与 LLM 并行）

## 快速上手

### 1. 添加到 config.yaml

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: ibm-jailbreak-detector
    litellm_params:
      guardrail: ibm_guardrails
      mode: pre_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-detector-server.com"
      detector_id: "jailbreak-detector"
      is_detector_server: true
      default_on: true
      optional_params:
        score_threshold: 0.8
        block_on_detection: true
```

### 2. 设置鉴权令牌

```bash
export IBM_GUARDRAILS_AUTH_TOKEN="your-token"
```

### 3. 启动代理

```shell
litellm --config config.yaml --detailed_debug
```

### 4. 发起请求

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "guardrails": ["ibm-jailbreak-detector"]
  }'
```

## 配置

### 必填参数

- `guardrail` - str - 设置为 `ibm_guardrails`
- `auth_token` - str - IBM Guardrails 的鉴权令牌，可使用 `os.environ/IBM_GUARDRAILS_AUTH_TOKEN`
- `base_url` - str - IBM 检测器或 Guardrails 服务器的 URL
- `detector_id` - str - 要使用的检测器，如 `jailbreak-detector`、`pii-detector`

### 可选参数

- `mode` - str 或 list[str] - 运行时机，可选 `pre_call`、`post_call`、`during_call`，默认为 `pre_call`
- `default_on` - bool - 请求中未显式指定时是否自动运行，默认为 `false`
- `is_detector_server` - bool - `true` 表示检测器服务器，`false` 表示编排器，默认为 `true`
- `verify_ssl` - bool - 是否校验 SSL 证书，默认为 `true`

### optional_params

以下参数均放在 `optional_params` 下：

- `detector_params` - dict - 传给检测器的参数
- `extra_headers` - dict - 注入到发往 IBM Guardrails 请求中的额外请求头，以键值对字典形式提供
- `score_threshold` - float - 只统计高于该分数的检测结果（0.0 到 1.0）
- `block_on_detection` - bool - 发现违规时拦截请求，默认为 `true`

## 服务器类型

IBM Guardrails 提供两种可用的 API：

### 检测器服务器（推荐）

[Detectors API](https://foundation-model-stack.github.io/fms-guardrails-orchestrator/?urls.primaryName=Detector+API#/Text) 使用 `api/v1/text/contents` 端点运行单个检测器，一次请求可以接受多个文本输入。

```yaml
guardrails:
  - guardrail_name: ibm-detector
    litellm_params:
      guardrail: ibm_guardrails
      mode: pre_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-detector-server.com"
      detector_id: "jailbreak-detector"
      is_detector_server: true  # Use detector server
```

### 编排器（Orchestrator）

如果你使用的是 IBM FMS Guardrails Orchestrator，可以通过 [FMS Orchestrator API](https://foundation-model-stack.github.io/fms-guardrails-orchestrator/?urls.primaryName=Orchestrator+API) 的 `api/v2/text/detection/content` 端点在单次请求中运行多个检测器；不过该端点每次请求只能接受一个文本输入。

```yaml
guardrails:
  - guardrail_name: ibm-orchestrator
    litellm_params:
      guardrail: ibm_guardrails
      mode: pre_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-orchestrator-server.com"
      detector_id: "jailbreak-detector"
      is_detector_server: false  # Use orchestrator
```

## 示例

### 检测输入中的越狱攻击

```yaml
guardrails:
  - guardrail_name: jailbreak-check
    litellm_params:
      guardrail: ibm_guardrails
      mode: pre_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-detector-server.com"
      detector_id: "jailbreak-detector"
      is_detector_server: true
      default_on: true
      optional_params:
        score_threshold: 0.8
```

### 检测响应中的 PII

```yaml
guardrails:
  - guardrail_name: pii-check
    litellm_params:
      guardrail: ibm_guardrails
      mode: post_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-detector-server.com"
      detector_id: "pii-detector"
      is_detector_server: true
      optional_params:
        score_threshold: 0.5  # Lower threshold for PII
        block_on_detection: true
```

### 运行多个检测器

```yaml
guardrails:
  - guardrail_name: jailbreak-check
    litellm_params:
      guardrail: ibm_guardrails
      mode: pre_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-detector-server.com"
      detector_id: "jailbreak-detector"
      is_detector_server: true

  - guardrail_name: pii-check
    litellm_params:
      guardrail: ibm_guardrails
      mode: post_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-detector-server.com"
      detector_id: "pii-detector"
      is_detector_server: true
```

然后在请求中指定：

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user", "content": "Hello"}],
    "guardrails": ["jailbreak-check", "pii-check"]
  }'
```

## 检测的工作原理

当 IBM Guardrails 检测到风险内容时，会返回命中的详细信息：

```json
{
  "start": 0,
  "end": 31,
  "text": "You are now in Do Anything Mode",
  "detection_type": "jailbreak",
  "score": 0.858
}
```

- `score` - 置信度（0.0 到 1.0）
- `text` - 触发检测的具体文本
- `detection_type` - 违规类型

如果分数超过你设置的 `score_threshold`，且 `block_on_detection` 为 true，请求就会被拦截。

## 延伸阅读

- [按 API 密钥控制防护栏](./quick_start#-按-api-密钥控制防护栏)
- [GitHub 上的 IBM FMS Guardrails](https://github.com/foundation-model-stack/fms-guardrails-orchestr8)
