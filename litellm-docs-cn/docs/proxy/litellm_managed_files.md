import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import Image from '@theme/IdealImage';

# [BETA] LiteLLM 托管文件（Managed Files）

- 在不同提供商（provider）之间复用同一个文件。
- 防止用户在 `list` 和 `retrieve` 调用中看到自己无权访问的文件。

<EnterpriseFeature free />

| 属性 | 取值 | 说明 |
| --- | --- | --- |
| Proxy | ✅ |  |
| SDK | ❌ | 需要 Postgres 数据库来存储文件 ID。 |
| 所有提供商均可用 | ✅ |  |
| 支持的端点 | `/chat/completions`, `/batch`, `/fine_tuning`, `/responses` |  |

## 用法

### 1. 配置 config.yaml

```yaml
model_list:
    - model_name: "{{gemini_flash}}"
      litellm_params:
        model: vertex_ai/{{gemini_flash}}
        vertex_project: my-project-id
        vertex_location: us-central1
    - model_name: "gpt-4o-mini-openai"
      litellm_params:
        model: {{openai_small}}
        api_key: os.environ/OPENAI_API_KEY

general_settings: 
  master_key: os.environ/LITELLM_MASTER_KEY  # alternatively use the env var - LITELLM_MASTER_KEY
  database_url: "postgresql://<user>:<password>@<host>:<port>/<dbname>" # alternatively use the env var - DATABASE_URL

litellm_settings:
  require_managed_files: true # optional - reject POST /v1/files without target_model_names
```

#### （可选）上传时强制使用托管文件

默认情况下，省略 `target_model_names` 时，`POST /v1/files` 会回退到经典的提供商文件路径。在 `litellm_settings` 下设置 `require_managed_files: true`，即可要求每次上传都使用托管文件。

```yaml
litellm_settings:
  require_managed_files: true
```

启用后，不带 `target_model_names` 的上传请求会返回 `400`。如果提供了 `target_model_names`，既有托管文件行为保持不变。

```python
# String (comma-separated for multiple models)
extra_body={"target_model_names": "gpt-4o-mini-openai, {{gemini_flash}}"}

# List (OpenAI Python SDK sends this as target_model_names[] in multipart form)
extra_body={"target_model_names": ["gpt-4o-mini-openai"]}
```

### 2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

### 3. 测试一下！

指定 `target_model_names`，即可在不同提供商之间使用同一个文件 ID。它对应通过 config.yaml 设置的 model_names 列表（或在管理界面 Admin UI 中设置的 "public_model_names"）。

```python
target_model_names="gpt-4o-mini-openai, {{gemini_flash}}" # 👈 Specify model_names
```

查看 `/v1/models` 即可看到某个密钥可用的模型名称列表。

#### **存储 PDF 文件**

```python
from openai import OpenAI

client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-<your-litellm-api-key>", max_retries=0)


# Download and save the PDF locally 
url = (
    "https://storage.googleapis.com/cloud-samples-data/generative-ai/pdf/2403.05530.pdf"
)
response = requests.get(url)
response.raise_for_status()

# Save the PDF locally
with open("2403.05530.pdf", "wb") as f:
    f.write(response.content)

file = client.files.create(
    file=open("2403.05530.pdf", "rb"),
    purpose="user_data", # can be any openai 'purpose' value
    extra_body={"target_model_names": "gpt-4o-mini-openai, {{gemini_flash}}"}, # 👈 Specify model_names
)

print(f"file id={file.id}")
```

#### **跨提供商使用同一个文件 ID**

<Tabs>
<TabItem value="openai" label="OpenAI">

```python
completion = client.chat.completions.create(
    model="gpt-4o-mini-openai",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this recording?"},
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                    },
                },
            ],
        },
    ]
)

print(completion.choices[0].message)
```


</TabItem>
<TabItem value="vertex" label="Vertex AI">

```python
completion = client.chat.completions.create(
    model="{{gemini_flash}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this recording?"},
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                    },
                },
            ],
        },
    ]
)

print(completion.choices[0].message)

```

</TabItem>
</Tabs>

### 完整示例

```python   
import base64
import requests
from openai import OpenAI

client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-<your-litellm-api-key>", max_retries=0)


# Download and save the PDF locally
url = (
    "https://storage.googleapis.com/cloud-samples-data/generative-ai/pdf/2403.05530.pdf"
)
response = requests.get(url)
response.raise_for_status()

# Save the PDF locally
with open("2403.05530.pdf", "wb") as f:
    f.write(response.content)

# Read the local PDF file
file = client.files.create(
    file=open("2403.05530.pdf", "rb"),
    purpose="user_data", # can be any openai 'purpose' value
    extra_body={"target_model_names": "gpt-4o-mini-openai, vertex_ai/{{gemini_flash}}"},
)

print(f"file.id: {file.id}") # 👈 Unified file id

## GEMINI CALL ### 
completion = client.chat.completions.create(
    model="{{gemini_flash}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this recording?"},
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                    },
                },
            ],
        },
    ]
)

print(completion.choices[0].message)


### OPENAI CALL ### 
completion = client.chat.completions.create(
    model="gpt-4o-mini-openai",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this recording?"},
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                    },
                },
            ],
        },
    ],
)

print(completion.choices[0].message)

```

## 文件权限

防止用户在 `list` 和 `retrieve` 调用中看到自己无权访问的文件。

### 1. 配置 config.yaml

```yaml
model_list:
    - model_name: "gpt-4o-mini-openai"
      litellm_params:
        model: {{openai_small}}
        api_key: os.environ/OPENAI_API_KEY

general_settings: 
  master_key: os.environ/LITELLM_MASTER_KEY  # alternatively use the env var - LITELLM_MASTER_KEY
  database_url: "postgresql://<user>:<password>@<host>:<port>/<dbname>" # alternatively use the env var - DATABASE_URL
```

### 2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

### 3. 给用户发放密钥

我们来创建一个 ID 为 `user_123` 的用户。

```bash
curl -L -X POST 'http://0.0.0.0:4000/user/new' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{"models": ["gpt-4o-mini-openai"], "user_id": "user_123"}'
```

从响应中取出密钥。

```json
{
    "key": "sk-..."
}
```

### 4. 用户创建文件

#### 4a. 创建文件

```jsonl
{"messages": [{"role": "system", "content": "Clippy is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "What's the capital of France?"}, {"role": "assistant", "content": "Paris, as if everyone doesn't know that already."}]}
{"messages": [{"role": "system", "content": "Clippy is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "Who wrote 'Romeo and Juliet'?"}, {"role": "assistant", "content": "Oh, just some guy named William Shakespeare. Ever heard of him?"}]}
```

#### 4b. 上传文件

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-...", # 👈 Use the key you generated in step 3
    max_retries=0
)

# Upload file
finetuning_input_file = client.files.create(
    file=open("./fine_tuning.jsonl", "rb"), # {"model": "azure-gpt-4o"} <-> {"model": "gpt-4o-my-special-deployment"}
    purpose="fine-tune",
    extra_body={"target_model_names": "gpt-4.1-openai"} # 👈 Tells litellm which regions/projects to write the file in. 
)
print(finetuning_input_file) # file.id = "litellm_proxy/..." = {"model_name": {"deployment_id": "deployment_file_id"}}
```

### 5. 用户获取文件

<Tabs>
<TabItem value="has_access" label="用户创建的文件">

```python
from openai import OpenAI

... # User created file (3b)

file = client.files.retrieve(
    file_id=finetuning_input_file.id
)

print(file) # File retrieved successfully
```

</TabItem>
<TabItem value="no_access" label="用户未创建的文件">

```python
from openai import OpenAI

... # User created file (3b)

try: 
    file = client.files.retrieve(
        file_id="bGl0ZWxsbV9wcm94eTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07dW5pZmllZF9pZCwyYTgzOWIyYS03YzI1LTRiNTUtYTUxYS1lZjdhODljNzZkMzU7dGFyZ2V0X21vZGVsX25hbWVzLGdwdC00by1iYXRjaA"
    )
except Exception as e:
    print(e) # User does not have access to this file

```

</TabItem>
</Tabs>




## 支持的端点

#### 创建文件 - `/files`

```python
from openai import OpenAI

client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-<your-litellm-api-key>", max_retries=0)

# Download and save the PDF locally
url = (
    "https://storage.googleapis.com/cloud-samples-data/generative-ai/pdf/2403.05530.pdf"
)
response = requests.get(url)
response.raise_for_status()

# Save the PDF locally
with open("2403.05530.pdf", "wb") as f:
    f.write(response.content)

# Read the local PDF file
file = client.files.create(
    file=open("2403.05530.pdf", "rb"),
    purpose="user_data", # can be any openai 'purpose' value
    extra_body={"target_model_names": "gpt-4o-mini-openai, vertex_ai/{{gemini_flash}}"},
)
```

#### 获取文件 - `/files/{file_id}`

```python
client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-<your-litellm-api-key>", max_retries=0)

file = client.files.retrieve(file_id=file.id)
```

#### 删除文件 - `/files/{file_id}/delete`

```python
client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-<your-litellm-api-key>", max_retries=0)

file = client.files.delete(file_id=file.id)
```

#### 列出文件 - `/files`

```python
client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-<your-litellm-api-key>", max_retries=0)

files = client.files.list(extra_body={"target_model_names": "gpt-4o-mini-openai"})

print(files) # All files user has created
```

列出文件在 Pre-GA 阶段的限制：
 - 暂不支持多模型：目前仅支持 1 个模型名称。
 - 暂不支持多部署：目前仅支持该模型的 1 个部署（例如，如果 `gpt-4o-mini-openai` 这个公开模型名下有 2 个部署，系统会任选其一，并返回该部署上的所有文件）。

这些 Pre-GA 限制会在托管文件功能正式 GA 之前修复。

## 常见问题（FAQ）

**1. LiteLLM 会存储文件本身吗？**

不会。LiteLLM 不存储文件本身，只在 Postgres 数据库中保存文件 ID。

**2. 给定一个文件 ID，LiteLLM 怎么知道该用哪个文件？**

LiteLLM 在 Postgres 数据库中保存 litellm 文件 ID 到模型专属文件 ID 的映射。请求进来时，LiteLLM 会查出对应的模型专属文件 ID，并在发往提供商的请求中使用它。

**3. 文件删除是怎么工作的？**

删除文件时，LiteLLM 会删除 Postgres 数据库中的映射记录，以及各提供商上的文件。

**4. 用户能调用其他用户创建的文件 ID 吗？**

不能。从 `v1.71.2` 起，用户只能查看、编辑、删除自己创建的文件。



## 架构





<Image img={require('../../img/managed_files_arch.png')}  style={{ width: '800px', height: 'auto' }} />

## 另请参阅

- [搭配微调 API 的托管文件](../../docs/proxy/managed_finetuning)
- [搭配批处理 API 的托管文件](../../docs/proxy/managed_batches)
