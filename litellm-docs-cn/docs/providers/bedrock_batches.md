import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bedrock 批处理

通过 LiteLLM 使用 Amazon Bedrock 批处理推理（Batch Inference）API。

| 属性 | 详情 |
|----------|---------|
| 描述 | Amazon Bedrock 批处理推理支持对大型数据集异步运行推理 |
| 提供商文档 | [AWS Bedrock Batch Inference ↗](https://docs.aws.amazon.com/bedrock/latest/userguide/batch-inference.html) |
| 成本追踪 | ✅ 支持 |

## 概览

你可以用它来：

- 使用 Bedrock 模型对大型数据集运行批处理推理
- 按密钥/用户/团队控制批处理模型的访问（与对话补全模型的控制方式相同）
- 管理批处理输入/输出文件的 S3 存储

## （Proxy 管理员）使用方法

下面介绍如何让开发者访问你的 Bedrock 批处理模型。

### 1. 配置 config.yaml

- 为每个模型指定 `mode: batch`：让开发者知道这是一个批处理模型
- 为批处理操作配置 S3 存储桶和 AWS 凭证

```yaml showLineNumbers title="litellm_config.yaml"
model_list:
  - model_name: "bedrock-batch-claude"
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      #########################################################
      ########## batch specific params ########################
      s3_bucket_name: litellm-proxy
      s3_region_name: us-west-2
      s3_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      s3_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_batch_role_arn: arn:aws:iam::888602223428:role/service-role/AmazonBedrockExecutionRoleForAgents_BB9HNW6V4CV
      # Optional: Custom KMS encryption key for the S3 input upload and the batch output
      # s3_encryption_key_id: arn:aws:kms:us-west-2:123456789012:key/12345678-1234-1234-1234-123456789012
      # Optional: AWS account id that owns the S3 buckets, when they live in another account
      # s3_bucket_owner: "123456789012"
    model_info: 
      mode: batch # 👈 SPECIFY MODE AS BATCH, to tell user this is a batch model
```

**必需参数**：

| 参数 | 描述 |
|-----------|-------------|
| `s3_bucket_name` | 存放批处理输入/输出文件的 S3 存储桶 |
| `s3_region_name` | S3 存储桶所在的 AWS 区域 |
| `s3_access_key_id` | 访问 S3 存储桶的 AWS 访问密钥 |
| `s3_secret_access_key` | 访问 S3 存储桶的 AWS 秘密访问密钥 |
| `aws_batch_role_arn` | 用于 Bedrock 批处理操作的 IAM 角色 ARN。Bedrock Batch API 要求必须设置 IAM 角色 ARN。 |
| `mode: batch` | 告诉 LiteLLM 这是一个批处理模型 |

**可选参数**：

| 参数 | 描述 |
|-----------|-------------|
| `s3_encryption_key_id` | 自定义 KMS 加密密钥 ID，用于 LiteLLM 上传到 S3 的批处理输入文件以及批处理输出数据。LiteLLM 签名上传所用的凭证需要对该密钥拥有 `kms:GenerateDataKey` 权限。未指定时，Bedrock 使用 AWS 托管加密密钥。 |
| `s3_bucket_owner` | 拥有批处理输入和输出 S3 存储桶的 AWS 账户 ID。该值会作为 `s3BucketOwner` 随 Bedrock 任务的输入与输出数据配置一并发送。当存储桶属于另一个账户（而非运行批处理任务的账户）时需要设置，否则 Bedrock 会按任务所属账户校验存储桶所有权并导致任务失败。也可通过 `AWS_S3_BUCKET_OWNER` 环境变量设置。 |

### 2. 创建虚拟密钥

```bash showLineNumbers title="create_virtual_key.sh"
curl -L -X POST 'https://{PROXY_BASE_URL}/key/generate' \
-H 'Authorization: Bearer ${PROXY_API_KEY}' \
-H 'Content-Type: application/json' \
-d '{"models": ["bedrock-batch-claude"]}'
```

现在可以使用这个虚拟密钥（virtual key）访问批处理模型（见开发者流程）。

## （开发者）使用方法

下面介绍如何创建 LiteLLM 托管文件，并用它执行 Bedrock 批处理 CRUD 操作。

### 1. 创建 request.jsonl

- 通过 `/model_group/info` 查看可用模型
- 找出所有 `mode: batch` 的模型
- 把 .jsonl 里的 `model` 设置为 `/model_group/info` 返回的模型名

```json showLineNumbers title="bedrock_batch_completions.jsonl"
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "bedrock-batch-claude", "messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "Hello world!"}], "max_tokens": 1000}}
{"custom_id": "request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "bedrock-batch-claude", "messages": [{"role": "system", "content": "You are an unhelpful assistant."}, {"role": "user", "content": "Hello world!"}], "max_tokens": 1000}}
```

预期效果：

- LiteLLM 会将其转换为 Bedrock 部署对应的实际值（例如 `bedrock/us.anthropic.{{anthropic}}`）

### 2. 上传文件

指定 `target_model_names: "<model-name>"` 以启用 LiteLLM 托管文件与请求校验。

model-name 应与 request.jsonl 中的 model-name 保持一致。

<Tabs>
<TabItem value="python" label="Python">

```python showLineNumbers title="bedrock_batch.py"
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",
)

# Upload file
batch_input_file = client.files.create(
    file=open("./bedrock_batch_completions.jsonl", "rb"), # {"model": "bedrock-batch-claude"} <-> {"model": "bedrock/us.anthropic.{{anthropic}}"}
    purpose="batch",
    extra_body={"target_model_names": "bedrock-batch-claude"}
)
print(batch_input_file)
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Upload File"
curl http://localhost:4000/v1/files \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -F purpose="batch" \
    -F file="@bedrock_batch_completions.jsonl" \
    -F extra_body='{"target_model_names": "bedrock-batch-claude"}'
```

</TabItem>
</Tabs>

**文件写到了哪里**？

文件会写入你在配置中指定的 S3 存储桶，并为 Bedrock 批处理推理做好准备。

### 3. 创建批处理

<Tabs>
<TabItem value="python" label="Python">

```python showLineNumbers title="bedrock_batch.py"
...
# Create batch
batch = client.batches.create( 
    input_file_id=batch_input_file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
    metadata={"description": "Test batch job"},
)
print(batch)
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Create Batch Request"
curl http://localhost:4000/v1/batches \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "input_file_id": "file-abc123",
        "endpoint": "/v1/chat/completions",
        "completion_window": "24h",
        "metadata": {"description": "Test batch job"}
    }'
```

</TabItem>
</Tabs>

### 4. 获取批处理结果

批处理任务完成后，从 S3 下载结果：

<Tabs>
<TabItem value="python" label="Python">

```python showLineNumbers title="bedrock_batch.py"
...
# Wait for batch completion (check status periodically)
batch_status = client.batches.retrieve(batch_id=batch.id)

if batch_status.status == "completed":
    # Download the output file
    result = client.files.content(
        file_id=batch_status.output_file_id,
        extra_headers={"custom-llm-provider": "bedrock"}
    )
    
    # Save or process the results
    with open("batch_output.jsonl", "wb") as f:
        f.write(result.content)
    
    # Parse JSONL results
    for line in result.text.strip().split('\n'):
        record = json.loads(line)
        print(f"Record ID: {record['recordId']}")
        print(f"Output: {record.get('modelOutput', {})}")
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Download Batch Results"
# First retrieve batch to get output_file_id
curl http://localhost:4000/v1/batches/batch_abc123 \
    -H "Authorization: Bearer $LITELLM_API_KEY"

# Then download the output file
curl http://localhost:4000/v1/files/{output_file_id}/content \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "custom-llm-provider: bedrock" \
    -o batch_output.jsonl
```

</TabItem>
<TabItem value="litellm-direct" label="LiteLLM 直接调用">

```python showLineNumbers title="bedrock_batch.py"
import litellm
from litellm import file_content

# Download using litellm directly (bypasses proxy managed files)
result = file_content(
    file_id=batch_status.output_file_id,  # Can be S3 URI or unified file ID
    custom_llm_provider="bedrock",
    aws_region_name="us-west-2",
)

# Process results
print(result.text)
```

</TabItem>
</Tabs>

**输出格式**：

批处理输出文件为 JSONL 格式，每行包含：

```json
{
  "recordId": "request-1",
  "modelInput": {
    "messages": [...],
    "max_tokens": 1000
  },
  "modelOutput": {
    "content": [...],
    "id": "msg_abc123",
    "model": "us.anthropic.{{anthropic}}",
    "role": "assistant",
    "stop_reason": "end_turn",
    "usage": {
      "input_tokens": 15,
      "output_tokens": 10
    }
  }
}
```

## 常见问题（FAQ）

### 文件写到哪里？

指定 `target_model_names` 时，文件会写入 Bedrock 批处理模型配置中设置的 S3 存储桶。

### 支持哪些模型？

凡是 AWS 在[批处理推理](https://docs.aws.amazon.com/bedrock/latest/userguide/batch-inference-supported.html)文档中列出的 Bedrock 模型均可使用，前提是 LiteLLM 能把输入文件中的 OpenAI 格式记录转换成该模型的请求体。目前覆盖 Anthropic Claude 模型、Amazon Nova 模型（每条记录按 Nova 期望的 Converse 请求格式写入）、面向 `/v1/embeddings` 记录的 Amazon Titan Text Embeddings V2，以及 `openai.gpt-oss-120b-1:0`、Qwen、DeepSeek 等 OpenAI 兼容的 Bedrock 模型（这类记录会按 OpenAI 风格的对话请求体透传）。对话类记录的 `url` 可用 `/v1/chat/completions`、`/v1/completions` 或 `/v1/responses`；completions 与 responses 记录会在上传前转换为对话请求。目前唯一支持转换的嵌入模型是 Titan Text Embeddings V2。

请使用你的区域中 AWS 接受用于批处理任务的模型 ID。当前大多数模型只能通过跨区域推理配置文件（cross-region inference profile）运行批处理任务，因此模型 ID 通常带有 `us.`（或 `eu.`、`apac.`）前缀，例如应使用 `us.amazon.nova-lite-v1:0` 而非 `amazon.nova-lite-v1:0`。此外，无论用什么模型，Bedrock 都会拒绝记录数少于 100 条的任务。

非 Anthropic 的批处理模型可按与上文 Claude 示例相同的方式配置：

```yaml showLineNumbers title="litellm_config.yaml"
model_list:
  - model_name: "bedrock-batch-nova"
    litellm_params:
      model: bedrock/us.amazon.nova-lite-v1:0
      s3_bucket_name: litellm-proxy
      s3_region_name: us-east-1
      s3_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      s3_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_batch_role_arn: arn:aws:iam::123456789012:role/LiteLLMBedrockBatchRole
    model_info:
      mode: batch
  - model_name: "bedrock-batch-titan-embeddings"
    litellm_params:
      model: bedrock/amazon.titan-embed-text-v2:0
      s3_bucket_name: litellm-proxy
      s3_region_name: us-east-1
      s3_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      s3_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_batch_role_arn: arn:aws:iam::123456789012:role/LiteLLMBedrockBatchRole
    model_info:
      mode: batch
```

之后，输入文件中的记录引用这里的 `model_name`（即 `{"model": "bedrock-batch-nova", ...}`），上传时把 `target_model_names` 设为同一个名称，创建批处理时 `endpoint` 对对话模型设为 `/v1/chat/completions`、对嵌入模型设为 `/v1/embeddings`。`aws_batch_role_arn` 中的 IAM 角色需要对你运行批处理任务的每个模型拥有 `bedrock:InvokeModel` 权限。

如果 LiteLLM 还不支持转换你需要的 Bedrock 模型（例如其他嵌入模型），请在[此处](https://github.com/BerriAI/litellm/issues/new/choose)提交 issue。

### 如何使用自定义 KMS 加密密钥？

如果你的 S3 存储桶要求使用自定义 KMS 加密密钥，可以在配置中通过 `s3_encryption_key_id` 指定。这对有特定加密需求的企业版（enterprise）客户很有用。

该密钥覆盖 LiteLLM 接触的两个对象：它上传到你存储桶的批处理输入文件，以及 Bedrock 写回的批处理输出。输入文件上传时会以 `x-amz-server-side-encryption: aws:kms` 和该密钥 ARN 签名，因此 LiteLLM 上传所用的 AWS 身份需要对该密钥拥有 `kms:GenerateDataKey` 权限。请先授予该权限再设置密钥，否则 `POST /v1/files` 会因 S3 的 `AccessDenied` 而失败

有两种设置加密密钥的方式：

1. **在 config.yaml 中**（推荐）：
```yaml
model_list:
  - model_name: "bedrock-batch-claude"
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      s3_encryption_key_id: arn:aws:kms:us-west-2:123456789012:key/12345678-1234-1234-1234-123456789012
      # ... other params
```

2. **以环境变量方式**：
```bash
export AWS_S3_ENCRYPTION_KEY_ID=arn:aws:kms:us-west-2:123456789012:key/12345678-1234-1234-1234-123456789012
```

### 如何使用其他 AWS 账户拥有的 S3 存储桶？

Bedrock 会校验输入和输出存储桶是否属于 `s3BucketOwner` 中指定的账户，该字段缺失时默认为运行批处理任务的账户。如果存储桶属于另一个账户，即使存储桶策略已授予访问权限，任务也会因 S3 权限错误而校验失败。把 `s3_bucket_owner` 设置为存储桶所属账户的 ID，LiteLLM 就会在输入和输出数据配置中都带上这个值

经由代理调用时，`/v1/batches` 请求体中传入的 `s3_bucket_owner` 优先于部署的 `litellm_params` 值，后者又优先于 `AWS_S3_BUCKET_OWNER` 环境变量。这与路由器（router）对其余部署参数（如 `s3_bucket_name`、`s3_encryption_key_id`）的优先级顺序一致。三者都未设置时会省略该字段，Bedrock 保持默认行为

```yaml
model_list:
  - model_name: "bedrock-batch-claude"
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      s3_bucket_name: shared-batch-bucket
      s3_bucket_owner: "123456789012"
      # ... other params
```

```bash
export AWS_S3_BUCKET_OWNER=123456789012
```

### LiteLLM 如何获取 Bedrock 输出文件详情？

Bedrock 没有文件详情 API，因此 LiteLLM 会用与该批处理部署相同的凭证，直接从 S3 对象读取文件大小和最后修改时间。空的输出或错误文件会显示为 `bytes: 0`。LiteLLM 何时查询这些信息，见[输出与错误文件](../proxy/managed_batches#输出与错误文件)。

## 延伸阅读

- [AWS Bedrock 批处理推理文档](https://docs.aws.amazon.com/bedrock/latest/userguide/batch-inference.html)
- [LiteLLM 托管批处理](../proxy/managed_batches)
- [LiteLLM 对 Bedrock 的身份验证](https://docs.litellm.ai/docs/providers/bedrock#boto3---authentication)
