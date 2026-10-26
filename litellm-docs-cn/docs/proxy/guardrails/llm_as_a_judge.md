import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LLM 即裁判（LLM-as-a-Judge）

## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | 使用评判模型（judge model）按加权标准为每个传入请求或 LLM 响应打 0-100 分，并拦截或记录低于阈值的项。 |
| 提供商 | LiteLLM 原生（代理上的任意对话模型或任意提供商的模型都可以充当评判者） |
| 支持的动作 | `block`（分数低于阈值时抛出 HTTP 422）、`log`（记录裁定结果，放行请求或响应） |
| 支持的模式 | `pre_call`（评判模型在请求消息到达 LLM 之前进行评估）、`during_call`（与 `pre_call` 相同，但评判与 LLM 调用并行执行）、`post_call`（评判模型评估 LLM 响应） |
| 流式支持 | 支持。评判不通过会终止流。 |
| API 要求 | 需要评判模型的凭据：可以是代理上的一个部署，也可以是提供商环境变量 |

## 工作原理

在 `post_call` 模式下，防护栏（guardrail）会把对话内容连同 LLM 响应一起，附带你定义的标准发给评判模型。在 `pre_call` 和 `during_call` 模式下，评判对象改为最新一轮请求，此前的带角色消息只作为上下文一并传入，这样切题的历史掩盖不了跑题的新一轮，早前被拒的一轮也不会连累之后合法的请求。被评判的一轮指请求末尾连续的 `user` 消息，取其全部文本部分拼接而成，消息范围以防护栏作用域保留的结果为准（`skip_system_message_in_guardrail`、`skip_tool_message_in_guardrail` 和 `scan_only_tool_results` 照常生效）；当请求不以 user 轮结尾（例如是一次工具结果往返），或端点未向防护栏提供逐条消息结构时，评判模型会评估保留的全部请求文本。这一步在任何响应产生之前运行，因此评判模型无需在主模型上消耗 Token 就能拒绝跑题或违规的请求（`during_call` 仍会并行执行主调用，评判拒绝时丢弃其结果）。评判模型对每条标准返回一个裁定（0-100 分、理由、通过与否），并给出加权总分。若总分低于 `overall_threshold` 且 `on_failure` 为 `block`，请求将以 HTTP 422 失败，并携带全部裁定结果；若为 `on_failure: log`，调用照常进行，裁定结果记入请求的日志元数据（`eval_information`），可在花费日志和日志集成中查看。

每次评判请求或响应，都要额外向评判模型发起一次 LLM 调用。

## 快速上手

### 1. 在 LiteLLM config.yaml 中定义防护栏

在 `guardrails` 配置段中定义防护栏：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: chat-model
    litellm_params:
      model: anthropic/{{anthropic_large}}
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: my-judge-model
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

guardrails:
  - guardrail_name: "quality-judge"
    litellm_params:
      guardrail: llm_as_a_judge
      mode: post_call
      judge_model: my-judge-model
      overall_threshold: 80
      on_failure: block
      default_on: true
      criteria:
        - name: helpfulness
          weight: 60
          description: Is the response helpful and correct?
        - name: tone
          weight: 40
          description: Is the response professional and polite?
```

各标准权重之和必须等于 100。`overall_threshold` 默认为 80，`on_failure` 默认为 `block`。

若要评判请求而非响应，设置 `mode: pre_call`（或 `mode: [pre_call, post_call]` 同时评判两侧），并把标准写成针对请求的内容，例如 `description: Is the request about cooking or recipes?`。被拒的请求返回 HTTP 422，附带 `"message": "LLM judge rejected request: score below threshold"` 以及与下文相同的 `verdicts` 负载，且主模型完全不会被调用。

### 2. 启动 LiteLLM 网关

```shell
litellm --config config.yaml --detailed_debug
```

### 3. 测试请求

<Tabs>
<TabItem label="被拦截的请求" value="blocked">

未达标准的响应会被拒绝，返回 HTTP 422 并附带裁定结果：

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "chat-model",
    "messages": [{"role": "user", "content": "hi"}]
  }'
```

```json
{
  "error": {
    "message": "LLM judge rejected response: score below threshold",
    "code": "422",
    "provider_specific_fields": {
      "overall_score": 40.0,
      "threshold": 80.0,
      "verdicts": [
        {"criterion_name": "helpfulness", "score": 40, "reasoning": "...", "passed": false, "weight": 60}
      ],
      "guardrail_name": "quality-judge"
    }
  }
}
```

</TabItem>
<TabItem label="通过的请求" value="passing">

达到阈值的响应原样返回。在 `on_failure: log` 下，即使未达标的响应也会返回；裁定结果记录在请求元数据的 `eval_information` 中，随后进入花费日志和日志回调。

</TabItem>
</Tabs>

## 从管理界面（Admin UI）创建防护栏

防护栏可以完全在仪表板中创建：进入 Guardrails，点击 Add New Guardrail，提供商选择 "LiteLLM LLM as a Judge"。评判模型下拉列表的选项来自代理的模型列表，标准、阈值与失败动作则对应上文的配置字段。以此方式创建的防护栏保存在数据库中，启动时自动加载，无需在配置文件中添加条目。

<Image img={require('../../../img/llm_judge_ui_dropdown.png')} />

在 Playground 中看到的被拦截响应；评判模型的拒绝会终止流：

<Image img={require('../../../img/llm_judge_playground_blocked.png')} />

## 评判模型凭据如何解析

`judge_model` 首先会到代理的 Router 上解析。如果名称匹配某个已配置的部署（完全一致的公开名称、`anthropic/*` 这类通配路由，或 `model_group_alias` 条目），评判调用就走该部署并使用其凭据；管理界面下拉列表中选择的评判模型正是靠这一机制工作的，因为它们的密钥存放在部署里而不是环境变量中。Router 无法服务的名称则回退到 SDK，像直接调用 `litellm.completion` 一样从环境变量解析凭据。

走 Router 路径有两个值得了解的后果。如果评判模型名称同时匹配某个部署和某个有效的提供商模型 id，部署胜出，使用的是部署的密钥而非环境变量密钥。此外，经由部署发起的评判调用与其他调用一样参与该部署的限流与冷却统计，因此一个持续失败的评判模型可能把与用户流量共享的部署拖入冷却。评判调用本身在禁用重试和标准回退机制的情况下发出，以确保配置的 `judge_model` 始终具有权威性。

## 失败行为

防护栏在评判出错时选择放行（fail open）：如果评判调用失败或返回无法解析的裁定，会记录一条警告，防护栏状态记为 `guardrail_failed_to_respond`，响应照常返回给调用方。以 Markdown 代码围栏包裹的 JSON 裁定（某些评判模型会这样输出）会被正常解析，不算失败。只有成功解析且低于阈值的裁定才会触发拦截。

## 支持的参数

```yaml
guardrails:
  - guardrail_name: string          # required, unique name
    litellm_params:
      guardrail: llm_as_a_judge     # required
      mode: pre_call | during_call | post_call  # required; pre_call and during_call judge the request, post_call judges the response
      judge_model: string           # required, proxy model name or provider model id
      criteria:                     # required, at least one entry, weights sum to 100
        - name: string
          weight: number            # percent share of the overall score
          description: string       # what the judge checks for this criterion
      overall_threshold: number     # optional, 0-100, default 80
      on_failure: block | log       # optional, default block
      default_on: boolean           # optional, run on every request without being requested per-call
```
