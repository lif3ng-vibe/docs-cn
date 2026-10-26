# 设置 API 密钥、Base 与版本

LiteLLM 支持你指定以下配置项：
* API 密钥（API Key）
* API Base（接口地址）
* API 版本（API Version）
* API 类型（API Type）
* 项目（Project）
* 位置（Location）
* 令牌（Token）

实用的辅助函数：
* [`check_valid_key()`](#check_valid_key)
* [`get_valid_models()`](#get_valid_models)

你可以通过以下方式设置这些 API 配置：
* 环境变量
* litellm 变量，如 `litellm.api_key`
* 向 `completion()` 传参

## 环境变量

### 设置 API 密钥

设置 LiteLLM 的 API 密钥，或某个提供商专用的密钥：

```python
import os

# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = "Your API Key"
os.environ["ANTHROPIC_API_KEY"] = "Your API Key"
os.environ["XAI_API_KEY"] = "Your API Key"
os.environ["REPLICATE_API_KEY"] = "Your API Key"
os.environ["TOGETHERAI_API_KEY"] = "Your API Key"
```

### 设置 API Base、API 版本与 API 类型

```python
# for azure openai
os.environ['AZURE_API_BASE'] = "https://openai-gpt-4-test2-v-12.openai.azure.com/"
os.environ['AZURE_API_VERSION'] = "2023-05-15" # [OPTIONAL]
os.environ['AZURE_API_TYPE'] = "azure" # [OPTIONAL]

# for openai
os.environ['OPENAI_BASE_URL'] = "https://your_host/v1"
```

### 设置 Project、Location 与 Token

对于以下云提供商：
- Azure
- Bedrock
- GCP
- Watson AI

你可能需要额外设置一些参数。LiteLLM 提供了一组通用参数，并会自动映射到各家提供商对应的参数上。

|      | LiteLLM 参数 | Watson       | Vertex AI    | Azure        | Bedrock      |
|------|--------------|--------------|--------------|--------------|--------------|
| 项目（Project） | project | watsonx_project | vertex_project | n/a | n/a |
| 地区（Region） | region_name | watsonx_region_name | vertex_location | n/a | aws_region_name |
| 令牌（Token） | token | watsonx_token or token | n/a | azure_ad_token | n/a |

如果需要，你也可以直接用各提供商专有的参数名来设置。

## litellm 变量

### litellm.api_key
所有提供商都会检查这个变量。

```python
import litellm
# openai call
litellm.api_key = "sk-OpenAIKey"
response = litellm.completion(messages=messages, model="{{openai_small}}")

# anthropic call
litellm.api_key = "sk-AnthropicKey"
response = litellm.completion(messages=messages, model="{{anthropic}}")
```

### litellm.provider_key（例如 litellm.openai_key）

```python
litellm.openai_key = "sk-OpenAIKey"
response = litellm.completion(messages=messages, model="{{openai_small}}")

# anthropic call
litellm.anthropic_key = "sk-AnthropicKey"
response = litellm.completion(messages=messages, model="{{anthropic}}")
```

### litellm.api_base

```python
import litellm
litellm.api_base = "https://hosted-llm-api.co"
response = litellm.completion(messages=messages, model="{{openai_small}}")
```

### litellm.api_version

```python
import litellm
litellm.api_version = "2023-05-15"
response = litellm.completion(messages=messages, model="{{openai_small}}")
```

### litellm.organization
```python
import litellm
litellm.organization = "LiteLlmOrg"
response = litellm.completion(messages=messages, model="{{openai_small}}")
```

## 向 completion() 传参（或任意 litellm 端点，如 `transcription`、`embedding`、`text_completion` 等）

你可以在调用 `completion()` 时直接传入 API 密钥：

### api_key
```python
from litellm import completion

messages = [{ "content": "Hello, how are you?","role": "user"}]

response = completion("command-nightly", messages, api_key="Your-Api-Key")
```

### api_base

```python
from litellm import completion

messages = [{ "content": "Hello, how are you?","role": "user"}]

response = completion("command-nightly", messages, api_base="https://hosted-llm-api.co")
```

### api_version

```python
from litellm import completion

messages = [{ "content": "Hello, how are you?","role": "user"}]

response = completion("command-nightly", messages, api_version="2023-02-15")
```

## 辅助函数

### `check_valid_key()`

检查用户为想调用的模型提交的密钥是否有效。

```python
key = "bad-key"
response = check_valid_key(model="{{openai_small}}", api_key=key)
assert(response == False)
```

### `get_valid_models()`

该辅助函数会读取 .env 文件，并返回其中受支持且可用的 LLM 列表。

```python
old_environ = os.environ
os.environ = {'OPENAI_API_KEY': 'temp'} # mock set only openai key in environ

valid_models = get_valid_models()
print(valid_models)

# list of openai supported llms on litellm
expected_models = litellm.open_ai_chat_completion_models + litellm.open_ai_text_completion_models

assert(valid_models == expected_models)

# reset replicate env key
os.environ = old_environ
```

### `get_valid_models(check_provider_endpoint: True)`

该辅助函数会去提供商的端点查询有效模型。

目前已支持：
- OpenAI（需设置 OPENAI_API_KEY）
- Fireworks AI（需设置 FIREWORKS_AI_API_KEY）
- LiteLLM Proxy（需设置 LITELLM_PROXY_API_KEY）
- Gemini（需设置 GEMINI_API_KEY）
- XAI（需设置 XAI_API_KEY）
- Anthropic（需设置 ANTHROPIC_API_KEY）

你也可以指定要检查的自定义提供商：

**所有提供商**：
```python
from litellm import get_valid_models

valid_models = get_valid_models(check_provider_endpoint=True)
print(valid_models)
```

**指定提供商**：
```python
from litellm import get_valid_models

valid_models = get_valid_models(check_provider_endpoint=True, custom_llm_provider="openai")
print(valid_models)
```

### `validate_environment(model: str)`

该辅助函数会告诉你某个模型所需的环境变量是否齐全，不齐全时还会指出缺了哪些。

```python
from litellm import validate_environment

print(validate_environment("openai/{{openai_small}}"))
```
