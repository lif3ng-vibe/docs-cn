# /ocr

| 功能 | 是否支持 | 
|---------|-----------|
| 成本追踪 | ✅ |
| 日志 | ✅（不支持基础日志） |
| 负载均衡 | ✅ |
| 支持的提供商 | `mistral`, `azure_ai`, `vertex_ai`, `cohere` |

:::tip

LiteLLM 遵循 [Mistral API 的 OCR 请求/响应规范](https://docs.mistral.ai/capabilities/vision/#optical-character-recognition-ocr)

:::

## **LiteLLM Python SDK 用法**
### 快速上手

```python
from litellm import ocr
import os

os.environ["MISTRAL_API_KEY"] = "sk-.."

response = ocr(
    model="mistral/mistral-ocr-latest",
    document={
        "type": "document_url",
        "document_url": "https://arxiv.org/pdf/2201.04234"
    }
)

# Access extracted text
for page in response.pages:
    print(f"Page {page.index}:")
    print(page.markdown)
```

### 异步用法

```python
from litellm import aocr
import os, asyncio

os.environ["MISTRAL_API_KEY"] = "sk-.."

async def test_async_ocr(): 
    response = await aocr(
        model="mistral/mistral-ocr-latest",
        document={
            "type": "document_url",
            "document_url": "https://arxiv.org/pdf/2201.04234"
        }
    )
    
    # Access extracted text
    for page in response.pages:
        print(f"Page {page.index}:")
        print(page.markdown)

asyncio.run(test_async_ocr())
```

### 使用本地文件

LiteLLM 可以直接读取本地文件，无需手动进行 base64 编码：

```python
from pathlib import Path
from litellm import ocr

# OCR with a local PDF file path (pass a pathlib.Path, a plain str is rejected)
response = ocr(
    model="mistral/mistral-ocr-latest",
    document={
        "type": "file",
        "file": Path("/path/to/document.pdf")
    }
)

# OCR with a file object
response = ocr(
    model="mistral/mistral-ocr-latest",
    document={
        "type": "file",
        "file": open("document.pdf", "rb")
    }
)

# OCR with raw bytes
with open("document.pdf", "rb") as f:
    pdf_bytes = f.read()

response = ocr(
    model="mistral/mistral-ocr-latest",
    document={
        "type": "file",
        "file": pdf_bytes,
        "mime_type": "application/pdf"  # recommended for raw bytes (auto-detected from extension for file paths)
    }
)
```

`file` 字段接受以下几种输入：
- **文件路径**（`pathlib.Path` 或任意 `os.PathLike`）：LiteLLM 会读取文件并根据扩展名识别 MIME 类型。直接传纯 `str` 会被拒绝并报错 `OCR file input does not accept bare str values`，所以字符串路径要用 `Path(...)` 包一层
- **文件对象**（二进制文件类对象）：例如 `open("doc.pdf", "rb")`
- **原始字节**（`bytes`）：用 `mime_type` 指定内容类型

LiteLLM 会在内部自动把文件输入转换成 base64 data URI，因此各提供商无需额外处理即可正常工作。

### 使用 Base64 编码的文档

```python
import base64
from litellm import ocr

# Encode PDF to base64
with open("document.pdf", "rb") as f:
    base64_pdf = base64.b64encode(f.read()).decode('utf-8')

response = ocr(
    model="mistral/mistral-ocr-latest",
    document={
        "type": "document_url",
        "document_url": f"data:application/pdf;base64,{base64_pdf}"
    }
)
```

### 可选参数

```python
response = ocr(
    model="mistral/mistral-ocr-latest",
    document={
        "type": "document_url",
        "document_url": "https://example.com/doc.pdf"
    },
    # Optional Mistral parameters
    pages=[0, 1, 2],              # Only process specific pages
    include_image_base64=True,     # Include extracted images
    image_limit=10,                # Max images to return
    image_min_size=100             # Min image size to include
)
```

## **LiteLLM 代理用法**

LiteLLM 提供兼容 Mistral API 的 `/ocr` 端点，用于处理 OCR 调用。

**设置**

把下面的配置添加到 litellm 代理的 config.yaml 中：

```yaml
model_list:
  - model_name: mistral-ocr
    litellm_params:
      model: mistral/mistral-ocr-latest
      api_key: os.environ/MISTRAL_API_KEY
```

启动 litellm

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**测试请求：JSON 请求体**

```bash
curl http://0.0.0.0:4000/v1/ocr \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral-ocr",
    "document": {
        "type": "document_url",
        "document_url": "https://arxiv.org/pdf/2201.04234"
    }
  }'
```

**测试请求：multipart 文件上传**

直接用 multipart 表单数据上传文件即可，无需自行进行 base64 编码。

```bash
curl http://0.0.0.0:4000/v1/ocr \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F "model=mistral-ocr" \
  -F "file=@/path/to/document.pdf"
```

还可以把可选参数作为额外的表单字段传入：

```bash
curl http://0.0.0.0:4000/v1/ocr \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F "model=mistral-ocr" \
  -F "file=@screenshot.png" \
  -F 'pages=[0,1,2]' \
  -F "include_image_base64=true"
```

## **请求/响应格式**

:::info

LiteLLM 遵循 **Mistral OCR API 规范**。

完整细节请参阅 [Mistral OCR 官方文档](https://docs.mistral.ai/capabilities/vision/#optical-character-recognition-ocr)。

:::

### 请求示例

```python
{
    "model": "mistral/mistral-ocr-latest",
    "document": {
        "type": "document_url",
        "document_url": "https://arxiv.org/pdf/2201.04234"
    },
    "pages": [0, 1, 2],              # Optional: specific pages to process
    "include_image_base64": True,     # Optional: include extracted images
    "image_limit": 10,                # Optional: max images to return
    "image_min_size": 100             # Optional: min image size in pixels
}
```

### 请求参数

| 参数 | 类型 | 是否必填 | 说明 |
|-----------|------|----------|-------------|
| `model` | string | 是 | 使用的 OCR 模型（如 `"mistral/mistral-ocr-latest"`） |
| `document` | object | 是 | 要处理的文档。必须包含 `type` 和对应的字段 |
| `document.type` | string | 是 | PDF/文档用 `"document_url"`，图片用 `"image_url"`，本地文件用 `"file"` |
| `document.document_url` | string | 条件性 | 文档的 URL 或 data URI（`type` 为 `"document_url"` 时必填） |
| `document.image_url` | string | 条件性 | 图片的 URL 或 data URI（`type` 为 `"image_url"` 时必填） |
| `document.file` | pathlib.Path/bytes/file | 条件性 | `pathlib.Path`、bytes 或二进制文件类对象（`type` 为 `"file"` 时必填）。纯 `str` 路径会被拒绝 |
| `document.mime_type` | string | 否 | 文件输入的显式 MIME 类型（未提供时根据扩展名自动识别） |
| `pages` | array | 否 | 要处理的页码列表（从 0 开始计数） |
| `include_image_base64` | boolean | 否 | 是否以 base64 字符串的形式返回提取出的图片 |
| `image_limit` | integer | 否 | 返回图片的最大数量 |
| `image_min_size` | integer | 否 | 纳入图片的最小尺寸（像素） |

#### 文档格式示例

**PDF 和文档**（URL）：
```json
{
  "type": "document_url",
  "document_url": "https://example.com/document.pdf"
}
```

**图片**（URL）：
```json
{
  "type": "image_url",
  "image_url": "https://example.com/image.png"
}
```

**base64 编码内容**：
```json
{
  "type": "document_url",
  "document_url": "data:application/pdf;base64,JVBERi0xLjQKJ..."
}
```

**本地文件**（SDK）：
```python
{"type": "file", "file": Path("/path/to/document.pdf")}
{"type": "file", "file": open("image.png", "rb")}
{"type": "file", "file": pdf_bytes, "mime_type": "application/pdf"}
```

**文件上传**（代理，multipart 表单）：
```bash
curl http://0.0.0.0:4000/v1/ocr \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F "model=mistral-ocr" \
  -F "file=@document.pdf"
```

### 响应格式

响应遵循 Mistral 的 OCR 格式，结构如下：

```json
{
  "pages": [
    {
      "index": 0,
      "markdown": "# Document Title\n\nExtracted text content...",
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      },
      "images": [
        {
          "image_base64": "base64string...",
          "bbox": {
            "x": 100,
            "y": 200,
            "width": 300,
            "height": 400
          }
        }
      ]
    }
  ],
  "model": "mistral-ocr-2505-completion",
  "usage_info": {
    "pages_processed": 29,
    "doc_size_bytes": 3002783
  },
  "document_annotation": null,
  "object": "ocr"
}
```

#### 响应字段

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `pages` | array | 处理过的页面列表，包含提取的内容 |
| `pages[].index` | integer | 页码（从 0 开始计数） |
| `pages[].markdown` | string | 以 Markdown 格式呈现的提取文本 |
| `pages[].dimensions` | object | 页面尺寸（dpi、高、宽，单位为像素） |
| `pages[].images` | array | 从页面中提取的图片（当 `include_image_base64=true` 时） |
| `model` | string | 执行 OCR 处理所用的模型 |
| `usage_info` | object | 处理统计信息（处理页数、文档大小） |
| `document_annotation` | object | 可选的文档级标注 |
| `object` | string | OCR 响应中固定为 `"ocr"` |


## **批处理 OCR**

Mistral OCR 也可以通过 [Batches API](./batches) 运行：上传一个 JSONL 文件，其中每一行的目标端点都是 `/v1/ocr`，然后用 `"endpoint": "/v1/ocr"` 创建批处理任务，完成后下载输出文件即可。批处理中处理的页面按模型的 `ocr_cost_per_page_batches` 费率计费。完整流程与费用键说明见 [Mistral AI 批处理 API](./providers/mistral_batches)。

## **支持的提供商**

| 提供商    | 用法链接      |
|-------------|--------------------|
| Mistral AI  |   [用法](#快速上手)、[批处理 OCR](./providers/mistral_batches)                 |
| Azure AI（Mistral、Cohere Parse） |   [用法](../docs/providers/azure_ocr)                 |
| Vertex AI   |   [用法](../docs/providers/vertex_ocr)                 |
| Cohere Parse |   [用法](../docs/providers/cohere#parseocr)                 |
