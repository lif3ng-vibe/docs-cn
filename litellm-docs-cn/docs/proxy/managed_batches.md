# [BETA] LiteLLM 托管文件与批处理

<EnterpriseFeature free />

| 功能 | 支持情况 | 说明 |
| --- | --- | --- |
| Proxy | ✅ |  |
| SDK | ❌ | 需要一个 Postgres 数据库来存储文件 id |
| 所有 [Batch 提供商](../batches#支持的提供商)均可用 | ✅ |  |

## 概览

可以用它来：

- 在多个 Azure Batch 部署之间做负载均衡
- 按密钥 / 用户 / 团队控制批处理模型的访问权限（与对话补全模型一致）

## （Proxy 管理员）用法

为开发者授予 Batch 模型的访问权限。

### 1. 配置 config.yaml

- 为每个模型指定 `mode: batch`，让开发者能一眼看出这是批处理模型。
- 可选：对特定的批处理提供商或模型跳过批处理输入文件的预读取（对自定义 vLLM 批处理部署上的大文件尤其有用）。

```yaml showLineNumbers title="litellm-config.yaml"
model_list:
  - model_name: "gpt-4o-batch"
    litellm_params:
      model: azure/gpt-4o-mini-general-deployment
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
    model_info:
      mode: batch # metadata, tells developers this is a batch model

  - model_name: "gpt-4o-batch"
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      mode: batch # metadata, tells developers this is a batch model

  - model_name: vertex-batch
    litellm_params:
      model: vertex_ai/gemini-3.5-flash
      vertex_project: <vertex-project>
      vertex_location: global
      vertex_credentials: /path/to/credentials
      gcs_bucket_name: litellm-batch-api-bucket # required param for vertexai to store files
    model_info:
      mode: batch


general_settings:
  # Optional: do not charge batch input files against TPM/RPM
  # disable_batch_input_file_rate_limiting: true

  # Optional: apply this behavior only to selected providers
  skip_batch_input_file_rate_limiting_for_providers:
    - hosted_vllm

litellm_settings:
  # Optional: require target_model_names on POST /v1/files (blocks classic file uploads)
  # require_managed_files: true
```

默认情况下，LiteLLM 会在提交前读取每个批处理输入文件，并把其中的 Token 数与记录数计入调用者的 TPM（每分钟 Token 数）和 RPM（每分钟请求数）限额，这对大文件会带来额外延迟。仅当批处理提交不需要纳入 TPM 或 RPM 统计时，才使用上述配置。如果想按未完成的批处理工作量、而不是每分钟窗口来约束批处理提交，参见[排队 Token 上限](../batches#排队-token-限制)。细节与限制参见 [Batches API 的限流工作原理](../batches#batches-api-限流的工作方式)。

### 2. 创建虚拟密钥（virtual key）

```bash
curl -L -X POST 'https://${PROXY_BASE_URL}/key/generate' \
-H 'Authorization: Bearer ${PROXY_API_KEY}' \
-H 'Content-Type: application/json' \
-d '{"models": ["gpt-4o-batch"]}'
```

返回的虚拟密钥即拥有这些批处理模型的访问权限（参见[开发者用法](#开发者用法)）。

## （开发者）用法

先创建一个 LiteLLM 托管文件，再对它执行批处理操作。下面的步骤展示用 curl 发起的原始 HTTP 调用；同样的流程如何用 OpenAI Python SDK 完成，参见[批处理生命周期](#批处理生命周期)。

### 1. 创建 request.jsonl

每行中的 `model` 必须是 `/model_group/info` 返回的、带 `mode: batch` 的模型名。

```json showLineNumbers title="request.jsonl"
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-4o-batch", "messages": [{"role": "system", "content": "You are a helpful assistant."},{"role": "user", "content": "Hello world!"}],"max_tokens": 1000}}
{"custom_id": "request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-4o-batch", "messages": [{"role": "system", "content": "You are an unhelpful assistant."},{"role": "user", "content": "Hello world!"}],"max_tokens": 1000}}
```

LiteLLM 会把该模型名转换成 Azure 部署的实际名称（例如 `gpt-4o-mini-general-deployment`）。

### 2. 上传文件

`target_model_names` 用于启用 LiteLLM 托管文件与请求校验，它必须与 request.jsonl 中的 `model` 一致。上传会返回一个文件对象，其 `id` 就是第 3 步要用的 `input_file_id`。

```bash showLineNumbers
export LITELLM_BASE_URL="http://0.0.0.0:4000"
export LITELLM_API_KEY="sk-<your-litellm-api-key>"

curl -s "${LITELLM_BASE_URL}/v1/files" \
  -H "Authorization: Bearer ${LITELLM_API_KEY}" \
  -F purpose="batch" \
  -F file="@./request.jsonl" \
  -F target_model_names="gpt-4o-batch"
```

**文件被写到了哪里？**

文件会被写入所有匹配 `target_model_names` 的部署（这里是 `gpt-4o-mini-general-deployment` 和 `gpt-4o-mini-special-deployment`），这样第 3 步就能在这些部署之间做负载均衡。

### 3. 创建并查询批处理

`input_file_id` 是第 2 步拿到的文件 `id`。创建调用会返回一个批处理对象，其 `status` 会依次经历[批处理生命周期](#批处理生命周期)中描述的各个状态。

```bash showLineNumbers
# Create the batch
curl -s "${LITELLM_BASE_URL}/v1/batches" \
  -H "Authorization: Bearer ${LITELLM_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-abc123",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h",
    "metadata": {"description": "Test batch job"}
  }'

# Retrieve the batch, using the id the create call returned
export BATCH_ID="batch_abc123"

curl -s "${LITELLM_BASE_URL}/v1/batches/${BATCH_ID}" \
  -H "Authorization: Bearer ${LITELLM_API_KEY}"
```

### 4. 获取批处理内容

当批处理的 `status` 变为 `completed` 后，批处理对象上就会出现 `output_file_id`。文件内容每行一条 JSON 结果，以 request.jsonl 中的 `custom_id` 为键。

```bash showLineNumbers
OUTPUT_FILE_ID=$(curl -s "${LITELLM_BASE_URL}/v1/batches/${BATCH_ID}" \
  -H "Authorization: Bearer ${LITELLM_API_KEY}" | jq -r '.output_file_id')

curl -s "${LITELLM_BASE_URL}/v1/files/${OUTPUT_FILE_ID}/content" \
  -H "Authorization: Bearer ${LITELLM_API_KEY}"
```

### 5. 列出批处理

按时间从新到旧返回调用密钥、用户或团队拥有的托管批处理。`limit` 取值必须在 0 到 100 之间，默认为 20；用 `after` 翻页。托管批处理不支持 `provider` 和 `target_model_names` 过滤器，传入会返回 `400`。

```bash showLineNumbers
curl -s "${LITELLM_BASE_URL}/v1/batches?limit=10" \
  -H "Authorization: Bearer ${LITELLM_API_KEY}"
```

### 6. 取消批处理

取消调用会返回带 `status: "cancelling"` 的批处理对象。

```bash showLineNumbers
curl -s -X POST "${LITELLM_BASE_URL}/v1/batches/${BATCH_ID}/cancel" \
  -H "Authorization: Bearer ${LITELLM_API_KEY}"
```

## 批处理生命周期

批处理的 `status` 会依次经过 `validating` → `in_progress` → `finalizing` → `completed`。其余终态包括 `failed`（校验失败）、`expired`（补全窗口已到期）和 `cancelled`（调用取消接口之后；该接口先报告 `cancelling`）。

下面的脚本用 OpenAI Python SDK 走完整个生命周期：上传输入文件、创建批处理、轮询直至进入终态，然后下载输出文件（没有输出时则下载错误文件）。

```python showLineNumbers title="create_batch.py"
import json
import time
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",       # your LiteLLM proxy URL
    api_key="sk-<your-litellm-api-key>",  # your LiteLLM virtual key
)

# 1. Upload the input file (request.jsonl from Developer Usage Step 1)
batch_input_file = client.files.create(
    file=open("./request.jsonl", "rb"),
    purpose="batch",
    extra_body={"target_model_names": "gpt-4o-batch"},
)
print(f"file id: {batch_input_file.id}")

# 2. Create the batch
batch = client.batches.create(
    input_file_id=batch_input_file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
    metadata={"description": "Test batch job"},
)
print(f"batch id: {batch.id}, status: {batch.status}")

# 3. Poll until the batch reaches a terminal status
terminal_statuses = {"completed", "failed", "expired", "cancelled"}
while batch.status not in terminal_statuses:
    time.sleep(30)
    batch = client.batches.retrieve(batch.id)
    print(f"status: {batch.status}")

# 4. Download the results: output file, or error file when there is no output
result_file_id = batch.output_file_id or batch.error_file_id

if result_file_id:
    file_response = client.files.content(result_file_id)
    with open("batch_output.jsonl", "w") as output_file:
        for line in file_response.text.strip().split("\n"):
            json.dump(json.loads(line), output_file)
            output_file.write("\n")
    print(f"results written to batch_output.jsonl")
```

要在批处理完成之前取消它，可调用 `client.batches.cancel(batch.id)`：其状态会先变为 `cancelling`，再变为 `cancelled`。

## 输出与错误文件

托管批处理结束后，提供商会创建一个输出文件；如果有请求失败，还会创建一个错误文件。LiteLLM 会为每个文件保存一条托管文件记录，其所有者与团队和批处理一致，因此它们会像上传的文件一样出现在文件相关端点中，并适用相同的访问规则。

- `GET /v1/files` 列出输入、输出和错误文件。
- `GET /v1/files?purpose=batch` 只列出输入文件。
- `GET /v1/files?purpose=batch_output` 列出输出和错误文件。

### 文件详情

LiteLLM 首次保存输出或错误文件记录时，会向提供商查询该文件的详情，例如大小和创建时间。每次查询对超时、连接错误、429 和 5xx 响应最多重试 3 次，总计 10 秒后放弃。

如果提供商仍不响应，LiteLLM 会改为保存一条基础条目，其 `purpose: "batch_output"`、`status: "processed"`、`bytes: 0`（若后台轮询器已为计算成本下载过该文件，则为真实大小）。文件立即就可以列出和下载。

之后，LiteLLM 会在下一次 `GET /v1/files/{file_id}` 调用时，或在条目存在至少 60 秒之后的下一次批处理查询、取消或轮询器运行时，用提供商返回的详情替换基础条目。发生变化的只有文件详情：所有者、团队和提供商映射保持不变；详情获取期间被删除的文件仍保持已删除状态。已带有提供商详情的记录不会再被查询。

### 哪些端点会调用提供商

| 端点 | 是否向提供商查询文件详情 | 是否保存或修改文件记录 | 提供商查询失败时 |
| --- | --- | --- | --- |
| `GET /v1/files` | 否 | 否 | 不适用 |
| `GET /v1/files/{file_id}` | 仅对基础条目，或没有已存详情的旧记录 | 用提供商详情更新基础条目 | 返回基础条目；没有已存详情的旧记录会返回错误 |
| `GET /v1/files/{file_id}/content` | 否，它下载的是内容 | 否 | 返回错误 |
| `DELETE /v1/files/{file_id}` | 否，它会请求提供商删除该文件 | 删除该记录 | 返回错误并保留记录 |
| `GET /v1/batches` | 否 | 为尚无记录的输出或错误文件保存基础条目 | 不适用 |
| `GET /v1/batches/{batch_id}` | 输出或错误文件尚无记录时，或基础条目已存在至少 60 秒时 | 保存记录，或更新基础条目 | 保存或保留基础条目，仍返回批处理 |
| `POST /v1/batches/{batch_id}/cancel` | 同批处理查询 | 同批处理查询 | 同批处理查询 |

追踪批处理成本的后台轮询器，其行为与批处理查询相同。当 `GET /v1/files` 或 `GET /v1/batches` 带上提供商或模型参数调用时，列表直接来自该提供商而非数据库。

## 可观测性

托管批处理到达 `completed` 后，代理服务器的批处理成本轮询器会下载其输出文件、为每一行计价，并为整个批处理写入一条花费日志记录。`/spend/logs` 和 Logs 页面读取的就是这条记录；每个请求的成功 / 失败计数、推理 Token 总量以及批处理的成本也都记录在这里。

轮询器按定时器运行，因此这条记录要在批处理结束后过一段时间才会出现，而不是完成的那一刻。`general_settings` 中的 `proxy_batch_polling_interval`（或环境变量 `PROXY_BATCH_POLLING_INTERVAL`）以秒为单位设定基础间隔，默认值为 `3600`，轮询器还会在此基础上叠加最多 30 秒的抖动。测试时可以把它设成 `30` 这样的小值。

### 花费日志字段

批处理的成本记录带 `call_type: "aretrieve_batch"`，其 `request_id` 为 `<batch id>_batch_cost`，其中 `<batch id>` 就是 `POST /v1/batches` 返回的 id：

```bash showLineNumbers
curl -s "http://0.0.0.0:4000/spend/logs?request_id=${BATCH_ID}_batch_cost" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

```json showLineNumbers title="batch cost row (trimmed)"
{
  "request_id": "bGl0ZWxsbV9wcm94eTttb2RlbF9pZDo3YjJl..._batch_cost",
  "session_id": "bGl0ZWxsbV9wcm94eTttb2RlbF9pZDo3YjJl...",
  "call_type": "aretrieve_batch",
  "model": "gemini-2.5-flash",
  "model_group": "gemini-batch",
  "spend": 0.0003221,
  "prompt_tokens": 14,
  "completion_tokens": 256,
  "total_tokens": 270,
  "status": "success",
  "metadata": {
    "batch_models": ["gemini-2.5-flash"],
    "batch_successful_requests": 2,
    "batch_failed_requests": 1,
    "cost_breakdown": {
      "input_cost": 0.0000021,
      "output_cost": 0.00032,
      "total_cost": 0.0003221,
      "tool_usage_cost": 0.0
    },
    "usage_object": {
      "prompt_tokens": 14,
      "completion_tokens": 256,
      "total_tokens": 270,
      "completion_tokens_details": {"text_tokens": 32, "reasoning_tokens": 224}
    }
  }
}
```

| 字段 | 含义 |
| --- | --- |
| `request_id` | 批处理 id 后追加 `_batch_cost` |
| `session_id` | 即批处理 id，与创建记录共用，因此二者会归入同一条追踪记录 |
| `spend` | 整个批处理的成本，只统计成功的行 |
| `prompt_tokens`、`completion_tokens`、`total_tokens` | 对所有成功的行求和 |
| `metadata.batch_successful_requests` | 提供商成功处理的请求数 |
| `metadata.batch_failed_requests` | 被提供商拒绝的请求数，来自输出文件和错误文件 |
| `metadata.batch_models` | 批处理所运行的模型 |
| `metadata.usage_object.completion_tokens_details.reasoning_tokens` | 成功行合计的推理 Token 数 |
| `metadata.cost_breakdown` | `spend` 背后的输入 / 输出成本拆分 |

`/spend/logs/v2` 返回相同的字段并支持分页，凡超出单次查询需求的场景都应使用它。即使传了 `request_id`，它也要求提供 `start_date` 和 `end_date`，因此想拉取单个批处理的记录时，上面那个简单的 `/spend/logs?request_id=` 调用仍是更省事的方式。

### 在 Logs 页面查看

轮询器运行过后，打开 [http://localhost:4000/ui/?page=logs](http://localhost:4000/ui/?page=logs)。批处理的创建记录与成本记录共用同一个 session，因此页面会把它们合并为一行分组展示，携带批处理的总成本与总 Token 数，Type 列显示 **Batch** 徽标而非通常的 LLM 徽标。结果如何体现在 Status 列：全部请求成功时显示绿色 **Success** 徽标；部分失败时显示琥珀色 **N/M succeeded** 徽标，其中 `N` 是成功数、`M` 是总数，`2/3 succeeded` 即表示三个请求里有一个失败。Request ID 列在一个小的 `batch cost` 标签下直接显示批处理 id 本身，而不是原始的 `<batch id>_batch_cost` 字符串，这样它就与你从 `POST /v1/batches` 拿回的 id 一致。

点击该行打开抽屉。**Batch Results** 卡片列出批处理 id、成功与失败的请求计数（失败数非零时以红色高亮），以及批处理所运行的模型。只要批处理聚合到了推理 Token，**Metrics** 区就会多出 **Reasoning Tokens** 一行；**Cost Breakdown** 则展示该行成本背后的输入 / 输出拆分。

### 解读部分失败的批处理

批处理只要运行结束，在提供商那边就会变为 `completed`，无论其中每个请求是否都成功，所以单看状态无法判断有没有失败。真正能说明问题的是成本记录上的计数，而且它们与批处理对象自身的 `request_counts` 一致：

```bash showLineNumbers
# what the provider reports
curl -s "http://0.0.0.0:4000/v1/batches/${BATCH_ID}" \
  -H "Authorization: Bearer $LITELLM_API_KEY" | jq '.status, .request_counts'
# "completed"
# {"completed": 2, "failed": 1, "total": 3}

# what the spend log recorded
curl -s "http://0.0.0.0:4000/spend/logs?request_id=${BATCH_ID}_batch_cost" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  | jq '.[0].metadata | {batch_successful_requests, batch_failed_requests}'
# {"batch_successful_requests": 2, "batch_failed_requests": 1}
```

想知道失败的请求究竟为何失败，可以下载该批处理的错误文件。每个被拒绝的请求占一行，以你在输入文件里设置的 `custom_id` 为键：

```bash showLineNumbers
ERROR_FILE_ID=$(curl -s "http://0.0.0.0:4000/v1/batches/${BATCH_ID}" \
  -H "Authorization: Bearer $LITELLM_API_KEY" | jq -r '.error_file_id')

curl -s "http://0.0.0.0:4000/v1/files/${ERROR_FILE_ID}/content" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

失败的请求不产生任何费用，因此 `spend` 只覆盖成功的行，失败一半的批处理成本大约只有预算的一半。提供商已受理但 LiteLLM 无法计价的请求仍算成功，按 `$0` 计费，这保证这些计数与提供商自己的数字能够对账。请求全部失败的批处理根本没有输出文件，其成本记录会记下 `$0`、零个成功请求，以及从错误文件读出的失败数。Anthropic 和 Bedrock 的 extended thinking 批处理不按行报告推理 Token，因此即便模型确实进行了推理，`reasoning_tokens` 对它们依然缺失。唯一一种两个计数之和不等于提供商总数的情况，是某行输出不是合法 JSON——该行会连同一条警告一起被跳过，不计入任何一方的计数。

## 常见问题（FAQ）

### 我的文件写到哪里去了？

指定了 `target_model_names` 时，文件会被写入所有匹配它的部署。无需任何额外基础设施。

### 批处理会不会在一个部署（如 eastus-01）上创建，而后续查询却被路由到另一个部署（如 eastus2-01）？

不会。LiteLLM 只在最初创建批处理时在部署之间做负载均衡。返回的批处理 id 中编码了所用部署的信息，因此查询、取消和文件内容调用都会固定在该部署上。
