import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex 批处理 API

## 配置

在 config.yaml 中配置 Vertex 模型。`gcs_bucket_name` 指向存放批处理预测文件的 GCS 存储桶，是 vertexai 存储文件的必填参数。旧版 LiteLLM 参数 `bucket_name` 仍然受支持，处理方式与 `gcs_bucket_name` 相同；若同一部署上两者都设置了，以 `gcs_bucket_name` 为准。

```yaml showLineNumbers title="litellm-config.yaml"
model_list:
  - model_name: vertex-batch
    litellm_params:
      model: vertex_ai/{{gemini_flash}}
      vertex_project: my-project
      vertex_location: us-central1
      vertex_credentials: /path/to/service_account.json
      gcs_bucket_name: my-batch-bucket # required param for vertexai to store files
    model_info:
      mode: batch
```

如果模型的 `litellm_params` 上没有设置 `gcs_bucket_name`（或 `bucket_name`）和 `vertex_credentials`，LiteLLM 会回退到下列环境变量。之所以单独提供 `GCS_BATCH_BUCKET_NAME`，是因为 [`gcs_bucket` 日志回调](../observability/gcs_bucket_integration) 已经把 `GCS_BUCKET_NAME` 用作写入 LLM 请求日志的存储桶；如果把 `GCS_BUCKET_NAME` 设成批处理存储桶，请求日志也会跟着写进去。查找批处理文件时先检查 `GCS_BATCH_BUCKET_NAME`，未设置时才使用 `GCS_BUCKET_NAME`。

```bash
# GCS 存储桶设置，用于存放批处理预测文件
export GCS_BATCH_BUCKET_NAME="my-batch-bucket" # 存放批处理预测文件的存储桶，优先于 GCS_BUCKET_NAME
export GCS_BUCKET_NAME="my-logging-bucket" # 仅在未设置 GCS_BATCH_BUCKET_NAME 时才用于批处理文件
export GCS_PATH_SERVICE_ACCOUNT="/path/to/service_account.json" # 服务账号 JSON 文件的路径

# Vertex /batch 端点设置，用于 LLM API 请求
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service_account.json" # 服务账号 JSON 文件的路径
export VERTEXAI_LOCATION="us-central1" # 可以是任意 Vertex 区域
export VERTEXAI_PROJECT="my-project" 
```

### 使用方法

请按以下完整流程操作：创建 JSONL 文件 → 上传文件 → 创建批处理 → 查询批处理状态 → 获取文件内容

#### 1. 创建批处理请求 JSONL 文件

LiteLLM 要求文件遵循 **[OpenAI 批处理文件格式](https://platform.openai.com/docs/guides/batch)**。

文件中的每个 `body` 都应是一个 **OpenAI API 请求**。

创建一个名为 `batch_requests.jsonl` 的文件，写入你的请求：
```jsonl
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "{{gemini_flash}}", "messages": [{"role": "system", "content": "You are a helpful assistant."},{"role": "user", "content": "Hello world!"}],"max_tokens": 10}}
{"custom_id": "request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "{{gemini_flash}}", "messages": [{"role": "system", "content": "You are an unhelpful assistant."},{"role": "user", "content": "Hello world!"}],"max_tokens": 10}}
```

#### 2. 上传文件

上传你的 JSONL 文件。对 `vertex_ai` 而言，文件会存入该部署的 `gcs_bucket_name`（或 `bucket_name`），未设置时依次回退到 `GCS_BATCH_BUCKET_NAME` 和 `GCS_BUCKET_NAME`。

<Tabs>
<TabItem value="python" label="Python">

```python showLineNumbers title="upload_file.py"
from openai import OpenAI

oai_client = OpenAI(
    api_key="sk-<your-litellm-api-key>",               # litellm proxy API key
    base_url="http://localhost:4000" # litellm proxy base url
)

file_obj = oai_client.files.create(
    file=open("batch_requests.jsonl", "rb"),
    purpose="batch",
    extra_headers={"custom-llm-provider": "vertex_ai"}
)

print(f"File uploaded with ID: {file_obj.id}")
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Upload File"
curl --request POST \
  --url http://localhost:4000/v1/files \
  --header 'Content-Type: multipart/form-data' \
  --header 'custom-llm-provider: vertex_ai' \
  --form purpose=batch \
  --form file=@batch_requests.jsonl
```

</TabItem>
</Tabs>

**预期响应**：

```json
{
    "id": "gs://my-batch-bucket/litellm-vertex-files/publishers/google/models/{{gemini_flash}}/abc123-def4-5678-9012-34567890abcd",
    "bytes": 416,
    "created_at": 1758303684,
    "filename": "litellm-vertex-files/publishers/google/models/{{gemini_flash}}/abc123-def4-5678-9012-34567890abcd",
    "object": "file",
    "purpose": "batch",
    "status": "uploaded",
    "expires_at": null,
    "status_details": null
}
```

#### 3. 创建批处理

使用上传得到的文件 ID 创建批处理任务。

<Tabs>
<TabItem value="python" label="Python">

```python showLineNumbers title="create_batch.py"
batch_input_file_id = file_obj.id # from step 2
create_batch_response = oai_client.batches.create(
    completion_window="24h",
    endpoint="/v1/chat/completions",
    input_file_id=batch_input_file_id, # e.g. "gs://my-batch-bucket/litellm-vertex-files/publishers/google/models/{{gemini_flash}}/abc123-def4-5678-9012-34567890abcd"
    extra_headers={"custom-llm-provider": "vertex_ai"}
)

print(f"Batch created with ID: {create_batch_response.id}")
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Create Batch Request"
curl --request POST \
  --url http://localhost:4000/v1/batches \
  --header 'Content-Type: application/json' \
  --header 'custom-llm-provider: vertex_ai' \
  --data '{         
    "input_file_id": "gs://my-batch-bucket/litellm-vertex-files/publishers/google/models/{{gemini_flash}}/abc123-def4-5678-9012-34567890abcd",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
}'
```

</TabItem>
</Tabs>

**预期响应**：

```json
{
    "id": "7814463557919047680",
    "completion_window": "24hrs",
    "created_at": 1758328011,
    "endpoint": "",
    "input_file_id": "gs://my-batch-bucket/litellm-vertex-files/publishers/google/models/{{gemini_flash}}/abc123-def4-5678-9012-34567890abcd",
    "object": "batch",
    "status": "validating",
    "cancelled_at": null,
    "cancelling_at": null,
    "completed_at": null,
    "error_file_id": null,
    "errors": null,
    "expired_at": null,
    "expires_at": null,
    "failed_at": null,
    "finalizing_at": null,
    "in_progress_at": null,
    "metadata": null,
    "output_file_id": null,
    "request_counts": null,
    "usage": null
}
```

#### 4. 查询批处理状态

查询批处理任务的状态。批处理会依次经历 `validating` → `in_progress` → `completed` 几个状态；在到达 `completed` 之前，`output_file_id` 一直是 `null`。

<Tabs>
<TabItem value="python" label="Python">

```python showLineNumbers title="retrieve_batch.py"
retrieved_batch = oai_client.batches.retrieve(
    batch_id=create_batch_response.id, # Created batch id, e.g. 7814463557919047680
    extra_headers={"custom-llm-provider": "vertex_ai"}
)

print(f"Batch status: {retrieved_batch.status}")
if retrieved_batch.status == "completed":
    print(f"Output file: {retrieved_batch.output_file_id}")
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Retrieve Batch Status"
curl --request GET \
  --url 'http://localhost:4000/batches/7814463557919047680?provider=vertex_ai' \
  --header "Authorization: Bearer $LITELLM_API_KEY"
```

</TabItem>
</Tabs>

**预期响应**（批处理完成时）：

```json
{
    "id": "7814463557919047680",
    "completion_window": "24hrs",
    "created_at": 1758328011,
    "endpoint": "",
    "input_file_id": "gs://my-batch-bucket/litellm-vertex-files/publishers/google/models/{{gemini_flash}}/abc123-def4-5678-9012-34567890abcd",
    "object": "batch",
    "status": "completed",
    "cancelled_at": null,
    "cancelling_at": null,
    "completed_at": null,
    "error_file_id": null,
    "errors": null,
    "expired_at": null,
    "expires_at": null,
    "failed_at": null,
    "finalizing_at": null,
    "in_progress_at": null,
    "metadata": null,
    "output_file_id": "gs://my-batch-bucket/litellm-vertex-files/publishers/google/models/{{gemini_flash}}/prediction-model-2025-09-19T21:26:51.569037Z/predictions.jsonl",
    "request_counts": null,
    "usage": null
}
```

#### 5. 获取文件内容

批处理完成后，使用批处理响应中的 `output_file_id` 获取结果。

**注意**：`output_file_id` 用在请求路径中时必须进行 URL 编码。

<Tabs>
<TabItem value="python" label="Python">

```python showLineNumbers title="get_file_content.py"
import urllib.parse
import json

output_file_id = retrieved_batch.output_file_id
# URL encode the file ID
encoded_file_id = urllib.parse.quote_plus(output_file_id)

# Get file content
file_content = oai_client.files.content(
    file_id=encoded_file_id,
    extra_headers={"custom-llm-provider": "vertex_ai"}
)

# Process the results
for line in file_content.text.strip().split('\n'):
    result = json.loads(line)
    print(f"Request: {result['request']}")
    print(f"Response: {result['response']}")
    print("---")
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Get File Content"
# Note: The file ID must be URL encoded
curl --request GET \
  --url 'http://localhost:4000/files/gs%253A%252F%252Fmy-batch-bucket%252Flitellm-vertex-files%252Fpublishers%252Fgoogle%252Fmodels%252Fgemini-2.5-flash-lite%252Fprediction-model-2025-09-19T21%253A26%253A51.569037Z%252Fpredictions.jsonl/content?provider=vertex_ai' \
  --header "Authorization: Bearer $LITELLM_API_KEY"
```

</TabItem>
</Tabs>

**预期响应**：

响应内容为 JSONL 格式，每行一个结果：

```jsonl
{"status":"","processed_time":"2025-09-19T21:29:47.352+00:00","request":{"contents":[{"parts":[{"text":"Hello world!"}],"role":"user"}],"generationConfig":{"max_output_tokens":10},"system_instruction":{"parts":[{"text":"You are a helpful assistant."}]}},"response":{"candidates":[{"avgLogprobs":-0.48079710006713866,"content":{"parts":[{"text":"Hello there! It's nice to meet you"}],"role":"model"},"finishReason":"MAX_TOKENS"}],"createTime":"2025-09-19T21:29:47.484619Z","modelVersion":"{{gemini_flash}}","responseId":"S8vNaIvKHdvshMIP_aOtuAg","usageMetadata":{"candidatesTokenCount":10,"candidatesTokensDetails":[{"modality":"TEXT","tokenCount":10}],"promptTokenCount":9,"promptTokensDetails":[{"modality":"TEXT","tokenCount":9}],"totalTokenCount":19,"trafficType":"ON_DEMAND"}}}
{"status":"","processed_time":"2025-09-19T21:29:47.358+00:00","request":{"contents":[{"parts":[{"text":"Hello world!"}],"role":"user"}],"generationConfig":{"max_output_tokens":10},"system_instruction":{"parts":[{"text":"You are an unhelpful assistant."}]}},"response":{"candidates":[{"avgLogprobs":-0.6168075137668185,"content":{"parts":[{"text":"I am unable to assist with this request."}],"role":"model"},"finishReason":"STOP"}],"createTime":"2025-09-19T21:29:47.470889Z","modelVersion":"{{gemini_flash}}","responseId":"S8vNaOneHISShMIP28nA8QQ","usageMetadata":{"candidatesTokenCount":9,"candidatesTokensDetails":[{"modality":"TEXT","tokenCount":9}],"promptTokenCount":9,"promptTokensDetails":[{"modality":"TEXT","tokenCount":9}],"totalTokenCount":18,"trafficType":"ON_DEMAND"}}}
```


### Vertex 原生 JSONL 透传

默认情况下，上传文件时 LiteLLM 会把每一行 OpenAI 格式的内容转换成 Vertex `GenerateContent` 请求，下载输出时再把批处理结果转换回 OpenAI 对话补全的结构。上传时设置 `passthrough=true` 可同时跳过这两步：文件按字节原样存入你的 GCS 存储桶，批处理输出也以 Vertex 原生格式返回，`groundingMetadata` 也一并保留。当转换逻辑覆盖不到某些 Vertex 功能时可以用它，例如带 `excludeDomains` 的 `googleSearch` grounding，同时不必把 GCP 凭证交给调用方。成本追踪不受影响：LiteLLM 会从每行原生输出中读取 `usageMetadata`，并按在线 Gemini 调用的方式计费。

#### 1. 创建原生 JSONL 文件

每一行都是一个 Vertex 批处理预测请求，即带 `request` 键的 JSON 对象：

```jsonl title="native_batch_requests.jsonl"
{"request": {"contents": [{"role": "user", "parts": [{"text": "What is the tallest building in the world?"}]}], "tools": [{"googleSearch": {"excludeDomains": ["example.com"]}}]}}
{"request": {"contents": [{"role": "user", "parts": [{"text": "Who won the last FIFA World Cup?"}]}], "tools": [{"googleSearch": {"excludeDomains": ["example.com"]}}]}}
```

#### 2. 使用 `passthrough=true` 上传

原生格式的行里不带模型信息，因此需要指明由哪个 Vertex 部署来执行批处理：用 `target_model_names`（托管文件模式，需要数据库）或 `model` 查询参数（无需数据库）。LiteLLM 会把对象存到该模型路径下的 `litellm-vertex-files/passthrough/`，批处理输出也放在它旁边，下载步骤据此判断要原样返回。

```yaml title="config.yaml"
model_list:
  - model_name: {{gemini_flash}}
    litellm_params:
      model: vertex_ai/{{gemini_flash}}
      vertex_project: my-project
      vertex_location: us-central1
      gcs_bucket_name: my-batch-bucket
```

<Tabs>
<TabItem value="python" label="Python">

```python showLineNumbers title="upload_native_file.py"
file_obj = oai_client.files.create(
    file=open("native_batch_requests.jsonl", "rb"),
    purpose="batch",
    extra_body={"target_model_names": "{{gemini_flash}}", "passthrough": True},
)

print(f"File uploaded with ID: {file_obj.id}")
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Upload Native File"
curl --request POST \
  --url http://localhost:4000/v1/files \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --form purpose=batch \
  --form target_model_names={{gemini_flash}} \
  --form passthrough=true \
  --form file=@native_batch_requests.jsonl
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK">

```python showLineNumbers title="upload_native_file_sdk.py"
import litellm

file_obj = litellm.create_file(
    file=open("native_batch_requests.jsonl", "rb"),
    purpose="batch",
    custom_llm_provider="vertex_ai",
    model="vertex_ai/{{gemini_flash}}",
    passthrough=True,
)
```

</TabItem>
</Tabs>

创建批处理、轮询状态、下载输出的操作与上文步骤 3 到 5 完全一致。输出就是原始的 Vertex `predictions.jsonl`，每行包含 `request`、`status` 和 `response`；凡是执行过 grounding 的行都会带 `candidates[].groundingMetadata`。

#### passthrough 的校验规则

- `purpose` 必须是 `batch`，且指定的模型必须是该密钥可用的 `vertex_ai` 部署，否则上传会返回 400 并指明问题字段。
- 每一行都必须是带 `request` 键的 JSON 对象。OpenAI 格式的行会被拒绝并返回 400（指明问题行），且不会上传任何内容。
- 批处理防护栏（guardrails）只识别 OpenAI 格式的行，因此当密钥、团队或请求配置了调用前防护栏时，passthrough 上传会被拒绝并返回 400。

passthrough 只对单次上传生效。SDK 级的 `litellm.disable_vertex_batch_output_transformation` 开关仍然作用于所有 Vertex 批处理输出，但从不触及输入侧；而 `passthrough` 则对设置了它的那一个文件的输入和输出同时生效。
