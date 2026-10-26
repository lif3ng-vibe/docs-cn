import Image from '@theme/IdealImage';

# /v1/decisions 与 /v1/systemone

决策模型（decision model）针对输入回答带类型的问题，返回的是概率而不是文本：一个 yes/no 概率、从固定列表中选一项，或某一量级上的打分。LiteLLM 通过两条路由提供服务，两条路由共享同一份提供商列表，因此 `model_list` 里的任何决策模型在两条路由上都能用

| 路由 | 别名 | 请求格式 | 适用场景 |
|-------|-------|----------------|-------------|
| `POST /v1/decisions` | `/decisions` | OpenAI Decisions：`input` 加一组 `predicate`、`choice` 和 `score` 问题 | 你按 OpenAI 格式编写代码，或需要图像输入 |
| `POST /v1/systemone` | `/systemone` | [System One](https://docs.typesafe.ai/api)：`state` 加一张 `noul`、`choice` 和 `score` 问题映射表 | 你手上已有 TypeSafe Jev 的请求体 |

该功能在 `1.104.x` 系列的 `v1.104.2` 及之后版本、`v1.105.0-rc.3` 及之后版本可用。`v1.106.0-dev.1` 在 `/v1/decisions` 上提供的是 System One 格式，因此在该版本上请把这类请求体发送到 `/v1/systemone`。Databricks 与 Microsoft Foundry 的支持在 `v1.106.0-dev.3` 之后合入 `main`，将随下一个版本发布

| 功能 | 是否支持 | 说明 |
|---------|-----------|-------|
| 成本追踪（cost tracking） | 是 | 通过 `x-litellm-response-cost` 响应头返回，并写入花费日志 |
| 日志 | 是 | 适用于所有集成 |
| 虚拟密钥、预算、速率限制 | 是 | 走常规的代理密钥鉴权 |
| 负载均衡、回退 | 是 | 与 `/chat/completions` 一样经过路由器 |
| 图像输入 | 仅 OpenAI | 其他提供商会返回 400 |
| 流式 | 否 | |

## 支持的提供商

| 提供商 | 示例模型 | 凭据 | 上游路径 | 图像 |
|----------|---------------|-------------|---------------|--------|
| [OpenAI](https://developers.openai.com/api/docs/guides/decisions) | `openai/gpt-6-luna` | `OPENAI_API_KEY`，可选 `OPENAI_BASE_URL` | `/v1/decisions` | 是 |
| [TypeSafe Jev](https://docs.typesafe.ai/api) | `typesafe/jev-latest` | `TYPESAFE_API_KEY`，可选 `TYPESAFE_API_BASE` | `/v1/systemone` | 否 |
| [Perplexity](https://docs.perplexity.ai/docs/decisions/quickstart) | `perplexity/pplx-decider-v1-27b` | `PERPLEXITYAI_API_KEY` 或 `PERPLEXITY_API_KEY`，可选 `PERPLEXITY_API_BASE` | `/v1/decisions` | 否 |
| [OpenRouter](https://openrouter.ai/docs/guides/community/jev) | `openrouter/typesafe/jev-1.13` | `OPENROUTER_API_KEY`，可选 `OPENROUTER_API_BASE` | `/api/alpha/decisions` | 否 |
| [Cloudflare Clef](https://developers.cloudflare.com/workers-ai/models/clef/) | `cloudflare/clef` 或 `cloudflare/clef-flash` | `CLOUDFLARE_API_KEY` 和 `CLOUDFLARE_ACCOUNT_ID`，或 `api_base` | `/ai/run/@cf/cloudflare/<model>` | 否 |
| [Databricks](https://docs.databricks.com/aws/en/sql/language-manual/functions/ai_decide) | `databricks/databricks-openjev-qwen35-4b` | `DATABRICKS_API_KEY` 或 `DATABRICKS_TOKEN`，`DATABRICKS_API_BASE` 必填 | `/serving-endpoints/<endpoint>/invocations` | 否 |
| [Microsoft Foundry](https://ai.azure.com/catalog/models/Microsoft-Decision-1) | `azure_ai/<deployment>`，配合 `base_model: azure_ai/Microsoft-Decision-1` | `AZURE_AI_API_KEY`，`AZURE_AI_API_BASE` 必填 | `/providers/microsoft/v1/systemone` | 否 |
| [Strands Decider](https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v19)（自托管） | `strands_decider/strands-decider-2B-hobson-v19` | `STRANDS_DECIDER_API_BASE` 必填，`STRANDS_DECIDER_API_KEY` 可选 | `/v1/systemone` | 否 |
| [vLLM](https://docs.vllm.ai/en/latest/serving/online_serving/structured_decisions.html)（自托管） | `hosted_vllm/Qwen/Qwen3-0.6B` | `HOSTED_VLLM_API_BASE` 或 `api_base` 必填，`HOSTED_VLLM_API_KEY` 可选 | `/v1/systemone` | 否 |

LiteLLM 会在两种格式之间做转换，因此调用哪条路由并不限制你能使用哪些提供商。OpenAI 收到的是 OpenAI 格式的请求体，其余所有提供商收到的是 System One 格式，而返回的答案始终采用你所调用路由的格式。OpenAI `input` 中的文本部分会拼接成 System One 的 `state`，System One 的问题在发给 OpenAI 时以其键名作为问题名

不带 `@cf/` 前缀的 Cloudflare 模型名会自动展开为 `@cf/cloudflare/<model>`，Cloudflare 返回的 `{"result": ...}` 外层包装会被解开，使响应与其他提供商保持相同的结构。在 Databricks 上，模型名就是服务端点本身的名称，`DATABRICKS_API_BASE` 指向 `https://<workspace-host>/serving-endpoints`，请求会发往该端点的 `/invocations` 路由。在 Microsoft Foundry 上，模型名是你的部署名，`AZURE_AI_API_BASE` 是资源主机，即 `https://<resource>.services.ai.azure.com`。若填入项目级别的基础地址（如 `https://<resource>.services.ai.azure.com/api/projects/<project>/openai/v1`），会被裁剪回主机部分。Azure 不允许把部署命名为 `Microsoft-Decision-1`，因此请用其他名称部署，并通过 `base_model` 指定，这样成本追踪才能匹配到价格

```yaml showLineNumbers
model_list:
  - model_name: decision-1
    litellm_params:
      model: azure_ai/decision-1
      api_base: https://<resource>.services.ai.azure.com
      api_key: os.environ/AZURE_AI_API_KEY
    model_info:
      base_model: azure_ai/Microsoft-Decision-1
```

Strands Decider 没有默认主机，请设置 `STRANDS_DECIDER_API_BASE` 或传入 `api_base`。vLLM 只回答 `choice` 类问题，支持 Qwen3 与 Qwen3.5 模型，且需要一个包含 [vllm-project/vllm#59299](https://github.com/vllm-project/vllm/pull/59299)（在 v0.31.0 之后合入）的 vLLM 版本

## 自托管 Laya 与 Nimble

[Laya](https://github.com/NandhaKishorM/laya) 和 [Bespoke Nimble](https://github.com/bespokelabsai/nimble) 是需要你自行托管的决策模型。它们不是 `/v1/decisions` 或 `/v1/systemone` 的提供商，请通过各自专属的网关路由向它们发送 System One 请求

| 模型 | 网关路由 | 服务器配置 |
|-------|---------------|-----------------|
| Laya | `/laya/v1/systemone` | `LAYA_API_BASE`，可选 `LAYA_API_KEY` |
| Bespoke Nimble | `/bespoke/v1/systemone` | `BESPOKE_API_BASE`，可选 `BESPOKE_API_KEY` |

Laya、Nimble 和 Jev 还能为 Auto Router 挑选所用的模型层级。请求示例与分类器配置参见[调用原生决策 API](./auto_router/decision_classifiers.md#调用原生决策-api)

## 代理服务器配置

1. 在 `config.yaml` 中添加决策模型

```yaml showLineNumbers
model_list:
  - model_name: luna
    litellm_params:
      model: openai/gpt-6-luna
      api_key: os.environ/OPENAI_API_KEY
  - model_name: jev
    litellm_params:
      model: typesafe/jev-latest
      api_key: os.environ/TYPESAFE_API_KEY
```

2. 启动代理服务器

```bash showLineNumbers
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

## /v1/decisions

用 OpenAI 格式对每种类型各提一个问题

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/v1/decisions' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
  "model": "luna",
  "input": [
    {
      "type": "message",
      "role": "user",
      "content": [
        {"type": "input_text", "text": "Customer wrote: I was charged twice for my order #4411 and want one of the charges refunded today."}
      ]
    }
  ],
  "questions": [
    {"type": "predicate", "name": "is_refund_request", "instructions": "Is the customer asking for a refund?"},
    {
      "type": "choice",
      "name": "needs_human",
      "instructions": "Should a human agent take over?",
      "choices": [{"value": true, "description": "billing dispute that needs a person"}, {"value": false}]
    },
    {
      "type": "score",
      "name": "frustration",
      "instructions": "How frustrated is the customer?",
      "levels": [{"label": "calm"}, {"label": "mildly annoyed"}, {"label": "angry", "description": "uses hostile language"}]
    }
  ]
}'
```

返回结果

```json
{
  "model": "gpt-6-luna",
  "answers": [
    {"type": "predicate", "name": "is_refund_request", "probability": 1.0},
    {
      "type": "choice",
      "name": "needs_human",
      "choice": true,
      "probabilities": [{"value": true, "probability": 0.99}, {"value": false, "probability": 0.01}],
      "confidence": 0.98
    },
    {
      "type": "score",
      "name": "frustration",
      "score": 0.74,
      "probabilities": [
        {"value": 0, "label": "calm", "probability": 0.26},
        {"value": 1, "label": "mildly annoyed", "probability": 0.74},
        {"value": 2, "label": "angry", "probability": 0.0}
      ],
      "confidence": 0.61
    }
  ],
  "usage": {
    "input_tokens": 401,
    "input_tokens_details": {"cached_tokens": 0, "cache_write_tokens": 0},
    "output_tokens": 0,
    "output_tokens_details": {"reasoning_tokens": 0},
    "total_tokens": 401
  }
}
```

把 `"model"` 改成 `"jev"` 会把同样的问题发给 TypeSafe，返回结构保持一致

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `model` | string | 代理模型名；SDK 中也可以用 `<provider>/<model>` |
| `input` | string or array | 可以是一个字符串，也可以是 `{"type": "message", "role": "user", "content": ...}` 形状的消息；`content` 可以是字符串，也可以是 `input_text` 和 `input_image` 部件组成的列表 |
| `questions` | array | 1 到 128 个问题；答案按相同顺序返回 |
| `safety_identifier` | string, optional | 终端用户的稳定标识。会发送给 OpenAI，其他提供商则丢弃 |

每个问题都要提供 `instructions`，并可附带一个可选的 `name`，它会原样出现在对应的答案里

| `type` | 额外字段 | 答案字段 |
|--------|--------------|---------------|
| `predicate` | 无 | `probability`：答案为 yes 的概率 |
| `choice` | `choices`：2 到 255 个 `{"value": string or boolean, "description": optional}` 条目 | `choice`、每个取值的 `probabilities`、`confidence` |
| `score` | `levels`：2 到 10 个 `{"label": ..., "description": optional}` 条目，从低到高排列 | `score`（按概率加权的档位下标）、每个档位的 `probabilities`、`confidence` |

模型拒绝回答的问题会以 `{"type": "refusal", "name": ...}` 的形式返回

### 图像输入

`input_image` 部件只在 OpenAI 模型上可用。`detail` 为可选

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/v1/decisions' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
  "model": "luna",
  "input": [
    {
      "type": "message",
      "role": "user",
      "content": [
        {"type": "input_text", "text": "Here is the swatch the customer uploaded."},
        {"type": "input_image", "image_url": "data:image/png;base64,<BASE64_PNG>", "detail": "low"}
      ]
    }
  ],
  "questions": [
    {"type": "predicate", "name": "is_red", "instructions": "Is the swatch mostly red?"},
    {
      "type": "choice",
      "name": "color",
      "instructions": "Which color dominates the swatch?",
      "choices": [{"value": "red"}, {"value": "green"}, {"value": "blue"}]
    }
  ],
  "safety_identifier": "user-1234"
}'
```

输入纯红色方块时的返回结果

```json
{
  "model": "gpt-6-luna",
  "answers": [
    {"type": "predicate", "name": "is_red", "probability": 1.0},
    {
      "type": "choice",
      "name": "color",
      "choice": "red",
      "probabilities": [
        {"value": "red", "probability": 1.0},
        {"value": "green", "probability": 0.0},
        {"value": "blue", "probability": 0.0}
      ],
      "confidence": 1.0
    }
  ],
  "usage": {
    "input_tokens": 277,
    "input_tokens_details": {"cached_tokens": 0, "cache_write_tokens": 0},
    "output_tokens": 0,
    "output_tokens_details": {"reasoning_tokens": 0},
    "total_tokens": 277
  }
}
```

System One 提供商只接受文本，因此把请求改成 `"model": "jev"` 后，还没调用 TypeSafe 就会被拒绝

```json
{
  "error": {
    "message": "litellm.BadRequestError: Decisions provider 'typesafe' cannot serve this request: input_image content parts are not supported because System One providers accept text input only\n\nLiteLLM: model group 'jev' failed with the error above. No fallback was attempted.",
    "type": "invalid_request_error",
    "param": null,
    "code": "400"
  }
}
```

## /v1/systemone

用 System One 格式发出的同类请求

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/v1/systemone' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
  "model": "jev",
  "state": "Customer wrote: I was charged twice for my order #4411 and want one of the charges refunded today.",
  "questions": {
    "is_refund_request": {"type": "noul", "instructions": "Is the customer asking for a refund?"},
    "urgency": {
      "type": "choice",
      "instructions": "How urgent is this?",
      "criteria": {"low": "can wait a week", "high": "needs action today"}
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated is the customer?",
      "criteria": ["calm", "mildly annoyed", "angry"]
    }
  }
}'
```

返回结果

```json
{
  "model": "jev-1.13.0",
  "answers": {
    "is_refund_request": {"type": "noul", "noul": 0.99},
    "urgency": {
      "type": "choice",
      "choice": "high",
      "confidence": 1.0,
      "probabilities": {"low": 0.0, "high": 1.0}
    },
    "frustration": {
      "type": "score",
      "score": 0.95,
      "confidence": 0.86,
      "legend": {"0": "calm", "1": "mildly annoyed", "2": "angry"},
      "probabilities": {"0": 0.07, "1": 0.91, "2": 0.02}
    }
  },
  "usage": {"input_tokens": 391, "output_tokens": 67}
}
```

把 `"model"` 改成 `"luna"` 则改由 OpenAI 回答，返回的仍是按问题名作键的 System One 答案

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `model` | string | 代理模型名；SDK 中也可以用 `<provider>/<model>` |
| `state` | string, object or array | 待判断的对象，比如工单、文档或聊天记录 |
| `questions` | object | 1 到 128 个带名称的问题；每个键会成为 `answers` 中的一个键 |

每个问题都有一个 `type` 和可选的 `instructions` 字段。问题上的其他额外字段会原样透传给 System One 提供商

| `type` | `criteria` | 答案字段 |
|--------|------------|---------------|
| `noul` | 可选对象，包含 `true` 与 `false` 的说明。noul 问题需要提供 `instructions` 或 `criteria` | `noul`：答案为 true 的概率 |
| `choice` | 必填对象，把 1 到 255 个标签映射到说明 | `choice`、`confidence`、每个标签的 `probabilities` |
| `score` | 必填数组，1 到 10 个档位，从低到高排列 | `score`（0 到 levels - 1）、`confidence`、`legend`、每个档位的 `probabilities` |

在两条路由上，违反上述规则的请求都会在调用任何提供商之前被 LiteLLM 以 400 拒绝，例如一个问题时都没有、choice 取值重复，或 `score` 问题给出 11 个档位

## SDK 用法

`litellm.decisions` 在 OpenAI 格式下接收 `input`，在 System One 格式下接收 `state`，并返回对应的响应类型。两者同时传入会抛出 `BadRequestError`

```python showLineNumbers
import os
import litellm

os.environ["OPENAI_API_KEY"] = ""

response = litellm.decisions(
    model="openai/gpt-6-luna",
    input="Customer wrote: I was charged twice for my order #4411 and want one of the charges refunded today.",
    questions=[
        {"type": "predicate", "name": "is_refund_request", "instructions": "Is the customer asking for a refund?"},
    ],
)
print(response.answers[0].probability)
print(response.usage)
```

异步版本是 `litellm.adecisions`，参数完全相同

```python showLineNumbers
import asyncio
import os
import litellm

os.environ["TYPESAFE_API_KEY"] = ""

async def main():
    response = await litellm.adecisions(
        model="typesafe/jev-latest",
        state="Customer wrote: I was charged twice for my order #4411 and want one of the charges refunded today.",
        questions={
            "is_refund_request": {"type": "noul", "instructions": "Is the customer asking for a refund?"},
        },
    )
    print(response.answers["is_refund_request"].noul)

asyncio.run(main())
```

两个函数还接受 `safety_identifier`、`api_key`、`api_base`、`timeout`、`custom_llm_provider` 和 `extra_headers`。模型前缀不属于任何受支持的提供商时会抛出 `BadRequestError`，错误信息中会列出受支持的提供商

## 限制

OpenAI 要求每个问题都带 `instructions`，且 choice 或 score 至少要有 2 个选项或档位。当不带 `instructions` 的 System One 问题发给 OpenAI 模型时，LiteLLM 会补一个通用的说明，比如 "Which choice best fits the input?"；noul 问题的 `criteria` 则会合并进 OpenAI 看到的 instructions 里。只有一个标签的 choice 或只有一个档位的 score 在 OpenAI 侧没有对应能力，LiteLLM 会在调用 OpenAI 之前以 400 拒绝

choice 问题不能同时包含文本相同的布尔值和字符串取值（比如 `true` 和 `"true"`），因为 System One 提供商以文本作为选项的键。这类请求会被 LiteLLM 以 400 拒绝

## 在 Admin UI 中试用

### 添加决策模型

进入 **Models + Endpoints**，打开 **Add Model** 标签页并选择提供商。带决策模型的提供商会在选择器的提供商名称下列出它们，例如 OpenAI 下面的 "Decision models: gpt-6-luna"。在 **LiteLLM Model Name(s)** 下选中决策模型后，会出现一条 **Decision model** 提示确认选择，并附上 Decisions 演练场的链接。像其他模型一样填入提供商凭据，然后点击 **Add Model**。之后该模型就能以公开的模型名在 `/v1/decisions` 和 `/v1/systemone` 上作答。需要端点 URL 的提供商（如 Databricks 和 Microsoft Foundry）在 **API Base** 字段中填写，对应上文[代理服务器配置](#代理服务器配置)中的 `api_base`。

<Image img={require('../img/decisions_add_model.png')} alt="选中 OpenAI 与 gpt-6-luna 的 Add Model 界面，显示 Decision model 提示" />

### Decisions 演练场

Playground 的 **Decisions** 标签页里有一个 **Endpoint** 选择器。选择 **Decisions · /v1/systemone** 即可让请求走你的 `model_list`，`model` 填上面配置中的代理模型名，如 `jev` 或 `luna`。访问 `LITELLM_PROXY_BASE_URL/ui/?page=llm-playground&tab=system-one` 即可打开。该标签页只发送 System One 格式，且在 `v1.104.2` 和 `v1.105.0` 中并不存在，因此 `/v1/decisions`、图像输入以及这两个版本请改用 curl 或 SDK。在 `v1.106.0` 及更早版本中，这个标签页名为 **System One**。编辑器、校验与答案视图的说明见 [TypeSafe 页面](./pass_through/typesafe.md#try-it-in-the-admin-ui)

## 决策路由与 TypeSafe 透传

位于 `/typesafe/v1/systemone` 的 [TypeSafe 透传](./pass_through/typesafe.md)只把原始请求转发给 TypeSafe，并从代理的环境变量中读取密钥。`/v1/decisions` 和 `/v1/systemone` 则使用 `model_list` 中的模型，因此无需改动请求体就能切换提供商、做负载均衡，并为每个部署配置各自的密钥
