# Mistral AI Batch API

LiteLLM 会把与 OpenAI 兼容的 `/v1/files` 和 `/v1/batches` 端点路由到 Mistral 的 [Files](https://docs.mistral.ai/api/#tag/files) 和 [Batch](https://docs.mistral.ai/api/#tag/batch) API。Mistral 的批处理（batch）任务会对输入文件的每一行运行同一个模型，因此模型只需在文件上传或创建批处理请求时选定一次，而无需逐行指定。任务可以面向 `/v1/chat/completions` 或 `/v1/ocr`，批处理内的 OCR 页面按 Mistral 的批处理费率计费。

| 功能 | 支持情况 |
|---------|-----------|
| 上传、查询、列出、删除文件 | ✅ |
| 下载文件内容 | ✅ |
| 创建和查询批处理任务 | ✅ |
| 列出和取消批处理任务 | 尚未支持 |
| 批处理 OCR 的成本追踪 | ✅ 按页计费，参见 [Batch OCR 成本追踪](#batch-ocr-成本追踪) |

## 1. 在 config.yaml 中添加 Mistral 模型

```yaml
model_list:
  - model_name: mistral-ocr
    litellm_params:
      model: mistral/mistral-ocr-latest
      api_key: os.environ/MISTRAL_API_KEY
```

## 2. 上传批处理输入文件

每一行都是一个 OpenAI 格式的批处理请求。OCR 场景下 `url` 为 `/v1/ocr`，`body` 则是一个 Mistral OCR 请求：

```json
{"custom_id": "doc-0", "method": "POST", "url": "/v1/ocr", "body": {"document": {"type": "document_url", "document_url": "https://arxiv.org/pdf/2201.04234"}}}
{"custom_id": "doc-1", "method": "POST", "url": "/v1/ocr", "body": {"document": {"type": "document_url", "document_url": "https://arxiv.org/pdf/2201.04234"}}}
```

上传时附带 `model` 参数，LiteLLM 就会用该部署的凭证发送文件，并把模型编码进返回的文件 id。之后所有携带该 id 的调用都会复用它。

```bash
curl http://0.0.0.0:4000/v1/files \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F purpose="batch" \
  -F model="mistral-ocr" \
  -F file="@ocr_batch_input.jsonl"
```

Mistral 接受 `batch`、`fine-tune` 和 `ocr` 这几种 purpose 值。LiteLLM 会把 `user_data` 映射为 `ocr`；其余 purpose（`assistants`、`vision`、`evals`）会被 400 拒绝，因为 Mistral 没有对应的类型。

## 3. 创建批处理任务

OCR 任务的 `endpoint` 为 `/v1/ocr`，对话任务则为 `/v1/chat/completions`。`model` 会从编码进文件 id 的信息中读取，因此再次传入是可选的。

```bash
curl http://0.0.0.0:4000/v1/batches \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-bGl0ZWxsbTo1YTJm...",
    "endpoint": "/v1/ocr",
    "completion_window": "24h",
    "model": "mistral-ocr"
  }'
```

Mistral 没有 `completion_window`；该值会被接受，并统一以 `24h` 回显。

## 4. 轮询批处理任务并下载输出

```bash
curl http://0.0.0.0:4000/v1/batches/batch_bGl0ZWxsbTo1YzU4... \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

Mistral 的任务状态与 OpenAI 状态的对应关系如下：`QUEUED` -> `validating`，`RUNNING` -> `in_progress`，`SUCCESS` -> `completed`，`FAILED` -> `failed`，`TIMEOUT_EXCEEDED` -> `expired`，`CANCELLATION_REQUESTED` -> `cancelling`，`CANCELLED` -> `cancelled`。状态到达 `completed` 后，即可下载 `output_file_id`：

```bash
curl http://0.0.0.0:4000/v1/files/file-bGl0ZWxsbToyNjE0.../content \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

输出的每一行都在 `response.body` 下携带 OCR 响应，其中包含 `usage_info.pages_processed`。

## 列出文件

LiteLLM 编码过的文件 id 自带路由信息，但普通的列表请求没有 id 可供路由，因此需要在请求中指定提供商：

```bash
curl "http://0.0.0.0:4000/v1/files?provider=mistral&purpose=batch" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

OCR 文件回读时带有 `purpose=user_data`；由 Mistral 其他产品创建、purpose 不被上传端点接受的文件（如 `playground`、`audio` 等）回读时同样显示为 `user_data`，因此不加过滤的列表请求不会因它们而失败。

## Batch OCR 成本追踪

面向 `/v1/ocr` 的批处理任务完成后，LiteLLM 会从输出文件的每一行读取 `usage_info.pages_processed` 与 `usage_info.pages_processed_annotation`，并按该模型的批处理费率为每页计费。费率来自 [模型成本表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)：

| 键 | 用途 |
|-----|----------|
| `ocr_cost_per_page_batches` | 批处理内的 OCR 页面 |
| `annotation_cost_per_page_batches` | 批处理内的标注（annotation）页面 |
| `ocr_cost_per_page` | 同步 `/v1/ocr` 调用；未设置批处理费率时的回退 |
| `annotation_cost_per_page` | 同步标注页面；未设置批处理费率时的回退 |

`mistral/mistral-ocr-latest` 的批处理费率是同步按页费率的一半，与 Mistral 50% 的批处理折扣一致。如需按其他费率计费，可以在该部署的 `model_info` 上设置这些键，其优先级高于成本表中该部署的费率：

```yaml
model_list:
  - model_name: mistral-ocr
    litellm_params:
      model: mistral/mistral-ocr-latest
      api_key: os.environ/MISTRAL_API_KEY
    model_info:
      ocr_cost_per_page_batches: 0.002
      annotation_cost_per_page_batches: 0.0025
```

花费会在已完成的批处理任务首次被查询时记录：记在创建该任务的密钥名下，以批处理 id 加 `_batch_cost` 后缀为标识，并显示在 `/spend/logs` 路由与管理界面（Admin UI）的 Logs 页面上。
