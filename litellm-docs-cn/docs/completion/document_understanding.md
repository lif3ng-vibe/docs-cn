import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 使用 PDF 输入

如何向 `/chat/completions` 端点发送 / 接收 PDF（及其他文档类型）

适用于：
- Vertex AI 模型（Gemini + Anthropic）
- Bedrock 模型
- Anthropic API 模型
- OpenAI API 模型
- Mistral（仅支持使用已上传文件的 file ID，类似 OpenAI 的 file_id 输入）

## 快速上手

### url

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
from litellm.utils import supports_pdf_input

# set aws credentials
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


# pdf url
file_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

# model
model = "bedrock/us.anthropic.{{anthropic}}"

file_content = [
    {"type": "text", "text": "What's this file about?"},
    {
        "type": "file",
        "file": {
            "file_id": file_url,
        }
    },
]


if not supports_pdf_input(model, None):
    print("Model does not support image input")

response = completion(
    model=model,
    messages=[{"role": "user", "content": file_content}],
)
assert response is not None
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "bedrock-model",
    "messages": [
        {"role": "user", "content": [
            {"type": "text", "text": "What's this file about?"},
            {
                "type": "file",
                "file": {
                    "file_id": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                }
            }
        ]},
    ]
}'
```
</TabItem>
</Tabs>

### base64

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
from litellm.utils import supports_pdf_input

# set aws credentials
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


# pdf url
image_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
response = requests.get(url)
file_data = response.content

encoded_file = base64.b64encode(file_data).decode("utf-8")
base64_url = f"data:application/pdf;base64,{encoded_file}"

# model
model = "bedrock/us.anthropic.{{anthropic}}"

file_content = [
    {"type": "text", "text": "What's this file about?"},
    {
        "type": "file",
        "file": {
            "file_data": base64_url,
        }
    },
]


if not supports_pdf_input(model, None):
    print("Model does not support image input")

response = completion(
    model=model,
    messages=[{"role": "user", "content": file_content}],
)
assert response is not None
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "bedrock-model",
    "messages": [
        {"role": "user", "content": [
            {"type": "text", "text": "What's this file about?"},
            {
                "type": "file",
                "file": {
                    "file_data": "data:application/pdf;base64...",
                }
            }
        ]},
    ]
}'
```
</TabItem>
</Tabs>

## 指定格式

如需指定文档的格式，可以使用 `format` 参数。


<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
from litellm.utils import supports_pdf_input

# set aws credentials
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


# pdf url
file_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

# model
model = "bedrock/us.anthropic.{{anthropic}}"

file_content = [
    {"type": "text", "text": "What's this file about?"},
    {
        "type": "file",
        "file": {
            "file_id": file_url,
            "format": "application/pdf",
        }
    },
]


if not supports_pdf_input(model, None):
    print("Model does not support image input")

response = completion(
    model=model,
    messages=[{"role": "user", "content": file_content}],
)
assert response is not None
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "bedrock-model",
    "messages": [
        {"role": "user", "content": [
            {"type": "text", "text": "What's this file about?"},
            {
                "type": "file",
                "file": {
                    "file_id": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    "format": "application/pdf",
                }
            }
        ]},
    ]
}'
```
</TabItem>
</Tabs>


## Mistral 示例

以下是使用 Mistral 模型进行文档理解（document understanding）的负载示例：


<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# pdf file_id received from files endpoint
file_id = "fa778e5e-46ec-4562-8418-36623fe25a71"

# model
model = "mistral/mistral-large-latest"

file_content = [
    {"type": "text", "text": "What's this file about?"},
    {
        "type": "file",
        "file": {
            "file_id": file_id,
        }
    },
]

response = completion(
    model=model,
    messages=[{"role": "user", "content": file_content}],
)
assert response is not None
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "mistral/mistral-large-latest",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What is the content of the file?"
                },
                {
                    "type": "file",
                    "file": {
                        "file_id": "fa778e5e-46ec-4562-8418-36623fe25a71"
                    }
                }
            ]
        }
    ]
}
```
</TabItem>
</Tabs>

## 检查模型是否支持 PDF 输入

<Tabs>
<TabItem label="SDK" value="sdk">

使用 `litellm.utils` 中的 `supports_pdf_input(model="bedrock/us.anthropic.{{anthropic}}")`：如果模型可以接受 PDF 输入，它会返回 `True`。该函数没有从顶层 `litellm` 模块导出。

```python
from litellm.utils import supports_pdf_input

assert supports_pdf_input(model="bedrock/us.anthropic.{{anthropic}}") == True
```
</TabItem>

<TabItem label="PROXY" value="proxy">

1. 在 config.yaml 中定义 Bedrock 模型

```yaml
model_list:
  - model_name: bedrock-model # model group name
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
    model_info: # OPTIONAL - set manually
      supports_pdf_input: True
```

2. 启动代理服务器

```bash
litellm --config config.yaml
```

3. 调用 `/model/info` 检查模型是否支持 `pdf` 输入。`/model_group/info` 不会返回 `supports_pdf_input`

```shell
curl -X 'GET' \
  'http://localhost:4000/model/info' \
  -H 'accept: application/json' \
  -H "x-api-key: $LITELLM_API_KEY"
```

预期响应

```json
{
  "data": [
    {
      "model_name": "bedrock-model",
      "litellm_params": {...},
      "model_info": {
        "litellm_provider": "bedrock_converse",
        "mode": "chat",
        ...,
        "supports_pdf_input": true
      }
    }
  ]
}
```

</TabItem>
</Tabs>
