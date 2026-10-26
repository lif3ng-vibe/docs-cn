# Azure AI OCR（Mistral、Cohere Parse）

## 概述

| 属性 | 详情 |
|-------|-------|
| 说明 | Azure AI OCR 由 Mistral 与 Cohere Parse 驱动，提供文档智能能力，可从 PDF 和图像中提取文本 |
| LiteLLM 提供商路由 | `azure_ai/` |
| 支持的操作 | `/ocr` |
| 提供商文档链接 | [Azure AI ↗](https://ai.azure.com/) |

借助 Azure AI 的 OCR 模型（由 Mistral 驱动），从文档和图像中提取文本。Cohere Parse 部署见[下文](#cohere-parse)。

## 快速上手

### **LiteLLM SDK**

```python showLineNumbers title="SDK Usage"
import litellm
import os

# Set environment variables
os.environ["AZURE_AI_API_KEY"] = ""
os.environ["AZURE_AI_API_BASE"] = ""

# OCR with PDF URL
response = litellm.ocr(
    model="azure_ai/mistral-document-ai-2505",
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
  - model_name: azure-ocr
    litellm_params:
      model: azure_ai/mistral-document-ai-2505
      api_key: "os.environ/AZURE_AI_API_KEY"
      api_base: "os.environ/AZURE_AI_API_BASE"
    model_info:
      mode: ocr
```

## 文档类型

Azure AI OCR 同时支持 PDF 和图像。

### PDF 文档

```python showLineNumbers title="PDF OCR"
response = litellm.ocr(
    model="azure_ai/mistral-document-ai-2505",
    document={
        "type": "document_url",
        "document_url": "https://example.com/document.pdf"
    }
)
```

### 图像文档

```python showLineNumbers title="Image OCR"
response = litellm.ocr(
    model="azure_ai/mistral-document-ai-2505",
    document={
        "type": "image_url",
        "image_url": "https://example.com/image.png"
    }
)
```

### Base64 编码文档

```python showLineNumbers title="Base64 PDF"
import base64

# Read and encode PDF
with open("document.pdf", "rb") as f:
    pdf_base64 = base64.b64encode(f.read()).decode()

response = litellm.ocr(
    model="azure_ai/mistral-document-ai-2505",
    document={
        "type": "document_url",
        "document_url": f"data:application/pdf;base64,{pdf_base64}"
    }
)
```

## 支持的参数

```python showLineNumbers title="All Parameters"
response = litellm.ocr(
    model="azure_ai/mistral-document-ai-2505",
    document={                           # Required: Document to process
        "type": "document_url",
        "document_url": "https://..."
    },
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
    model="azure_ai/mistral-document-ai-2505",
    document={
        "type": "document_url",
        "document_url": "https://example.com/document.pdf"
    }
)
```

## 重要说明

:::info[URL 转换]
Azure AI OCR 端点无法访问互联网。LiteLLM 会在向 Azure AI 发送请求前，自动把公开 URL 转换为 base64 数据 URI。
:::

## Cohere Parse

Azure AI Foundry 也通过同一个 `/ocr` 端点提供 [Cohere Parse](https://ai.azure.com/catalog/models/Cohere-parse-v5)。使用 `azure_ai/<deployment name>` 时，名称中同时含有 `cohere` 和 `parse` 的部署（目录默认名 `Cohere-parse-v5` 即满足此条件）会路由到你 Foundry 资源上的 Cohere Parse API，地址为 `{api_base}/providers/cohere/v2/parse`。其他名称仍会路由到 Mistral OCR，因此重命名部署时请在名称中保留 `cohere` 和 `parse`。

Parse 只接受 `image_url` 类型的文档，即图像 URL 或 base64 的 `data:image/...` URI。PDF 和 `document_url` 输入在任何内容发往 Azure 之前就会收到 400 错误。Foundry 无法抓取外部 URL，因此 LiteLLM 会先下载远程图像，再以数据 URI 的形式内联发送，与上文 Mistral 模型所做的转换一致。

### **LiteLLM SDK**

```python showLineNumbers title="Cohere Parse on Azure AI"
import litellm
import os

os.environ["AZURE_AI_API_KEY"] = ""
os.environ["AZURE_AI_API_BASE"] = "https://<resource>.services.ai.azure.com"

response = litellm.ocr(
    model="azure_ai/Cohere-parse-v5",
    document={
        "type": "image_url",
        "image_url": "https://raw.githubusercontent.com/mistralai/cookbook/refs/heads/main/mistral/ocr/receipt.png",
    },
    output_format="markdown",
)

for page in response.pages:
    print(page.markdown)
print(response.usage_info.pages_processed)
```

### **LiteLLM PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: azure-cohere-parse
    litellm_params:
      model: azure_ai/Cohere-parse-v5
      api_key: "os.environ/AZURE_AI_API_KEY"
      api_base: "os.environ/AZURE_AI_API_BASE"
```

```bash showLineNumbers title="Test request"
curl http://0.0.0.0:4000/v1/ocr \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-cohere-parse",
    "document": {
      "type": "image_url",
      "image_url": "https://raw.githubusercontent.com/mistralai/cookbook/refs/heads/main/mistral/ocr/receipt.png"
    }
  }'
```

`output_format` 接受 `markdown`（默认）或 `blocks`，而 `req_format: native` 会返回 Cohere 自身的响应体，而不是 LiteLLM 的 OCR 响应结构。成本追踪按模型成本映射（model cost map）中的单页价格，对 `usage_info.pages_processed` 计费。

模型成本映射中 `azure_ai/Cohere-parse-v5` 的价格为 Cohere 公布的每 1,000 页 1.50 美元，Foundry 目录中此模型链接所指向的正是这一价格。

健康检查（`/health` 和管理界面的 Test Connection 按钮）会向 Parse 发送一张小尺寸 PNG，而不是 Mistral OCR 所用的 PDF。每次探测都是一次真实的单页 Parse 调用，因此每检查一次就会为每个部署计费一页。`ocr` 探测模式和单页价格都在模型成本映射的 `Cohere-parse-v5` 条目下查询；以其他名称命名的部署需要在 `model_list` 条目中配置 `model_info: {mode: ocr, base_model: azure_ai/Cohere-parse-v5}`，这与其他所有 Azure 模型沿用的 `mode` 和 `base_model` 约定一致，这样健康检查才会把它当作 OCR 来探测，花费追踪也能查到 Parse 的价格，而不是记为 $0。

## 支持的模型

- `mistral-document-ai-2505` - Azure AI 上最新的 Mistral OCR 模型
- `Cohere-parse-v5` - Cohere Parse，仅支持图像文档

使用 Azure AI 提供商前缀：`azure_ai/<model-name>`
