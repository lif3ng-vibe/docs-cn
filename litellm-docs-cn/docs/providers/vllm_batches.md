import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# vLLM - 批处理与 Files API

vLLM 的 OpenAI 兼容服务器提供 `/v1/chat/completions`、`/v1/completions`、`/v1/embeddings` 和 `/v1/responses`，但没有 `/v1/files` 和 `/v1/batches` 路由。LiteLLM 补上了这个缺口：对于服务器没有 Files API 的 `hosted_vllm` 部署（deployment），代理（proxy）会自己存储批处理输入，把每一行都跑一遍该部署，并对外提供批处理状态和输出文件，OpenAI Batch API 因此可以在 vLLM 上原样使用。

| 特性 | 支持情况 |
|---------|-----------|
| `/v1/files` | ✅ 由 LiteLLM 存储 |
| `/v1/batches` | ✅ 由 LiteLLM 运行 |
| 成本追踪（cost tracking） | ✅ 每一行都计入创建批处理所用密钥的账下 |

这套流程运行在代理上，并且需要数据库（`DATABASE_URL`），因为输入文件、批处理状态和结果文件都存放在数据库里。

## LiteLLM 何时自行运行批处理

LiteLLM 按请求逐一判断。部署满足以下条件即符合：其 `litellm_params.model` 以 `hosted_vllm/` 开头，且对其服务器发起 `GET {api_base}/files` 返回 404。其他所有部署，以及服务器确实实现了 Files API 的 `hosted_vllm` 部署（例如 vLLM production-stack 路由器），则保持透传（passthrough）行为：上传和批处理请求原样转发给服务器，由服务器运行批处理。

`api_base` 要指向服务器的 `/v1` 根路径，这样探测请求才能命中正确的路由。

## 快速上手

### 1. 配置 config.yaml

```yaml
model_list:
  - model_name: my-vllm-model
    litellm_params:
      model: hosted_vllm/Qwen/Qwen2.5-0.5B-Instruct
      api_base: http://localhost:8000/v1  # your vLLM server
      api_key: os.environ/HOSTED_VLLM_API_KEY  # only if your server checks one

general_settings:
  database_url: os.environ/DATABASE_URL
```

### 2. 启动 LiteLLM 代理

```bash
litellm --config /path/to/config.yaml
```

### 3. 创建批处理文件

每一行都遵循 OpenAI 批处理输入的格式。LiteLLM 会把 `body.model` 替换成批处理所属部署的名称，所以你在那里填什么并不会改变由哪台服务器来运行这一行。

```jsonl
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "my-vllm-model", "messages": [{"role": "user", "content": "Hello!"}]}}
{"custom_id": "request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "my-vllm-model", "messages": [{"role": "user", "content": "How are you?"}]}}
```

每一行的 `url` 必须相同，并且要与创建批处理时给出的 `endpoint` 一致。带 `stream: true` 的行、重复的 `custom_id`，以及未知的顶层字段，都会在上传时被 400 拒绝，错误信息会指出出错的行。

### 4. 上传文件并创建批处理

:::tip[模型路由]
上传时必须指明部署，方式可以是 `x-litellm-model` 请求头、`?model=` 查询参数，或 `target_model_names` 表单字段。请使用 `purpose=batch`：对由 LiteLLM 运行批处理的部署，用其他 purpose 上传会返回 400，因为没有服务器替你保存这个文件。返回的文件 id 是一个很长的 base64 id，而不是 OpenAI 风格的 `file-...` id；对它执行的批处理操作会自动路由到同一个部署。
:::

<Tabs>
<TabItem value="curl" label="cURL">

**上传文件**

```bash
curl http://localhost:4000/v1/files \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "x-litellm-model: my-vllm-model" \
  -F purpose="batch" \
  -F file="@batch_requests.jsonl"
```

**创建批处理**

```bash
curl http://localhost:4000/v1/batches \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "<file id from the upload>",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'
```

**查看批处理状态**

```bash
curl http://localhost:4000/v1/batches/<batch id> \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**下载结果**

```bash
curl http://localhost:4000/v1/files/<output_file_id>/content \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

</TabItem>
<TabItem value="python" label="OpenAI SDK">

```python
import os
import time

from openai import OpenAI

client = OpenAI(api_key=os.environ["LITELLM_API_KEY"], base_url="http://localhost:4000/v1")

input_file = client.files.create(
    file=open("batch_requests.jsonl", "rb"),
    purpose="batch",
    extra_headers={"x-litellm-model": "my-vllm-model"},
)

batch = client.batches.create(
    input_file_id=input_file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
)

while batch.status not in ("completed", "failed", "cancelled", "expired"):
    time.sleep(5)
    batch = client.batches.retrieve(batch.id)

if batch.output_file_id:
    print(client.files.content(batch.output_file_id).text)
if batch.error_file_id:
    print(client.files.content(batch.error_file_id).text)
```

</TabItem>
</Tabs>

## 支持的操作

| 操作 | 端点 | 方法 |
|-----------|----------|--------|
| 上传文件 | `/v1/files` | POST |
| 查询文件 | `/v1/files/{file_id}` | GET |
| 删除文件 | `/v1/files/{file_id}` | DELETE |
| 获取文件内容 | `/v1/files/{file_id}/content` | GET |
| 创建批处理 | `/v1/batches` | POST |
| 列出批处理 | `/v1/batches` | GET |
| 查询批处理 | `/v1/batches/{batch_id}` | GET |
| 取消批处理 | `/v1/batches/{batch_id}/cancel` | POST |

批处理的 `endpoint` 可以是 `/v1/chat/completions`、`/v1/completions`、`/v1/embeddings` 或 `/v1/responses`。

## 批处理如何运行

批处理创建时处于 `validating`，随后在收到创建请求的那份代理副本运行各行的过程中转为 `in_progress`，接着在写入结果文件时进入 `finalizing`，最后以 `completed` 结束。被服务器拒绝的行会连同服务器的状态码一起写入错误文件，批处理本身仍会完成。取消操作先把批处理标记为 `cancelling`，等正在运行的那一行跑完，然后以 `cancelled` 结束，并保留已完成行的输出。24 小时的 `completion_window` 也按同样的方式执行：窗口关闭时仍未完成的行会被切断，以 `batch_expired` 写入错误文件，批处理以 `expired` 结束，并保留在时限内完成的那部分行的输出。

结果以 OpenAI 批处理输出的格式返回：`output_file_id` 中每个成功请求占一行，`error_file_id` 中每个失败请求占一行。两者都只对创建批处理的密钥开放。

每一行都会作为独立请求经路由器（router）计费，花费日志上记录创建批处理的密钥、团队和标签，价格按部署上的配置计。没有配置价格的部署，其各行按花费 0 记录。

如果运行批处理的副本重启了，那么在最近一次进度写入超过三分钟之后再次查询该批处理时，它会被标记为 `failed`，错误为 `runner_lost`。此时请重新提交。

## 配置项

| 设置项 | 默认值 | 说明 |
|---------|---------|-------------|
| `LITELLM_EXECUTED_BATCH_CONCURRENCY` | `4` | 同一批处理中有多少行并行运行 |
| `general_settings.allow_client_side_credentials` | `false` | 批处理各行与实时请求遵循同样的规则：请求体带有 `api_base`、`api_key` 或其他客户端凭证字段的行，上传时会被拒绝，除非该项为 `true`，或部署在 `configurable_clientside_auth_params` 中列出了该字段 |

批处理各行会跳过代理的调用前防护栏（guardrails），这与提供商自行运行的批处理行为一致。

## 相关文档

- [vLLM 提供商概览](./vllm)
- [Batch API 概览](../batches)
- [Files API](../files_endpoints)
