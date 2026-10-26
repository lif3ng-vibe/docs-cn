# Vertex AI OCR

## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | Vertex AI OCR 提供由 Mistral 驱动的文档智能能力，支持从 PDF 和图片中提取文本 |
| LiteLLM 提供商路由 | `vertex_ai/` |
| 支持的操作 | `/ocr` |
| 提供商文档链接 | [Vertex AI ↗](https://cloud.google.com/vertex-ai) |

使用 Vertex AI 的 OCR 模型（由 Mistral 提供支持）从文档和图片中提取文本。

## 快速上手

### **LiteLLM SDK**

```python showLineNumbers title="SDK Usage"
import litellm
import os

# Set environment variables
os.environ["VERTEXAI_PROJECT"] = "your-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

# OCR with PDF URL
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={
        "type": "document_url",
        "document_url": "https://example.com/document.pdf"
    }
)

# Access extracted text
for page in response.pages:
    print(page.markdown)
```

### **LiteLLM PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: vertex-ocr
    litellm_params:
      model: vertex_ai/mistral-ocr-2505
      vertex_project: os.environ/VERTEXAI_PROJECT
      vertex_location: os.environ/VERTEXAI_LOCATION
      vertex_credentials: path/to/service-account.json  # Optional
    model_info:
      mode: ocr
```

**启动代理**
```bash
litellm --config proxy_config.yaml
```

**通过代理调用 OCR**
```bash showLineNumbers title="cURL Request"
curl -X POST http://localhost:4000/ocr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "vertex-ocr",
    "document": {
      "type": "document_url",
      "document_url": "https://arxiv.org/pdf/2201.04234"
    }
  }'
```

## 身份验证

Vertex AI OCR 支持多种身份验证方式：

### 服务账号 JSON

```python showLineNumbers title="Service Account Auth"
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={"type": "document_url", "document_url": "https://..."},
    vertex_project="your-project-id",
    vertex_location="us-central1",
    vertex_credentials="path/to/service-account.json"
)
```

### 应用默认凭据（Application Default Credentials）

```python showLineNumbers title="Default Credentials"
# Relies on GOOGLE_APPLICATION_CREDENTIALS environment variable
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={"type": "document_url", "document_url": "https://..."},
    vertex_project="your-project-id",
    vertex_location="us-central1"
)
```

## 文档类型

Vertex AI OCR 同时支持 PDF 和图片。

### PDF 文档

```python showLineNumbers title="PDF OCR"
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={
        "type": "document_url",
        "document_url": "https://example.com/document.pdf"
    },
    vertex_project="your-project-id",
    vertex_location="us-central1"
)
```

### 图片文档

```python showLineNumbers title="Image OCR"
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={
        "type": "image_url",
        "image_url": "https://example.com/image.png"
    },
    vertex_project="your-project-id",
    vertex_location="us-central1"
)
```

### Base64 编码文档

```python showLineNumbers title="Base64 PDF"
import base64

# Read and encode PDF
with open("document.pdf", "rb") as f:
    pdf_base64 = base64.b64encode(f.read()).decode()

response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505", # This doesn't work for deepseek
    document={
        "type": "document_url",
        "document_url": f"data:application/pdf;base64,{pdf_base64}"
    },
    vertex_project="your-project-id",
    vertex_location="us-central1"
)
```

## 支持的参数

```python showLineNumbers title="All Parameters"
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={                           # Required: Document to process
        "type": "document_url",
        "document_url": "https://..."
    },
    vertex_project="your-project-id",   # Required: GCP project ID
    vertex_location="us-central1",       # Optional: Defaults to us-central1
    vertex_credentials="path/to/key.json", # Optional: Service account key
    include_image_base64=True,           # Optional: Include base64 images
    pages=[0, 1, 2],                     # Optional: Specific pages to process
    image_limit=10                       # Optional: Limit number of images
)
```

## 响应格式

```python showLineNumbers title="Response Structure"
# Response has the following structure
response.pages          # List of pages with extracted text
response.model          # Model used
response.object         # "ocr"
response.usage_info     # Token usage information

# Access page content
for page in response.pages:
    print(f"Page {page.index}:")
    print(page.markdown)
```

## 异步支持

```python showLineNumbers title="Async Usage"
import litellm

response = await litellm.aocr(
    model="vertex_ai/mistral-ocr-2505",
    document={
        "type": "document_url",
        "document_url": "https://example.com/document.pdf"
    },
    vertex_project="your-project-id",
    vertex_location="us-central1"
)
```

## 成本追踪

LiteLLM 会自动追踪 Vertex AI OCR 的成本：

- **每页成本**：$0.0005（按每 1,000 页 $1.50 折算）

```python showLineNumbers title="View Cost"
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={"type": "document_url", "document_url": "https://..."},
    vertex_project="your-project-id"
)

# Access cost information
print(f"Cost: ${response._hidden_params.get('response_cost', 0)}")
```

## 重要说明

:::info[URL 转换]
Vertex AI 的 Mistral OCR 端点无法访问互联网。LiteLLM 会在向 Vertex AI 发送请求前，自动将公开 URL 转换为 base64 数据 URI。
:::

:::tip[区域可用性]
Mistral OCR 已在多个区域上线。指定 `vertex_location` 即可使用离你的数据更近的区域：
- `us-central1`（默认）
- `europe-west1`
- `asia-southeast1`

Deepseek OCR 仅支持 global 区域。
:::

## 支持的模型

- `mistral-ocr-2505` - Vertex AI 上最新的 Mistral OCR 模型
- `deepseek-ocr-maas` - Vertex AI 上最新的 Deepseek OCR 模型

使用 Vertex AI 提供商前缀：`vertex_ai/<model-name>`
