# Heroku

## 开通模型

要在 LiteLLM 中使用 Heroku，需先[配置一个 Heroku 应用并挂载受支持的模型](https://devcenter.heroku.com/articles/heroku-inference#provision-access-to-an-ai-model-resource)。


## 支持的模型

LiteLLM 的 Heroku 接入支持多种[对话（chat）](https://devcenter.heroku.com/articles/heroku-inference-api-v1-chat-completions)模型：

| 模型                              | 区域    |
|-----------------------------------|---------|
| [`heroku/claude-sonnet-4`](https://devcenter.heroku.com/articles/heroku-inference-api-model-claude-4-sonnet)          | US, EU  |
| [`heroku/claude-3-7-sonnet`](https://devcenter.heroku.com/articles/heroku-inference-api-model-claude-3-7-sonnet)        | US, EU  |
| [`heroku/claude-3-5-sonnet-latest`](https://devcenter.heroku.com/articles/heroku-inference-api-model-claude-3-5-sonnet-latest) | US      |
| [`heroku/claude-3-5-haiku`](https://devcenter.heroku.com/articles/heroku-inference-api-model-claude-3-5-haiku)         | US      |
| [`heroku/claude-3`](https://devcenter.heroku.com/articles/heroku-inference-api-model-claude-3-haiku)                 | EU      |

## 环境变量

将模型挂载到 Heroku 应用后，系统会自动设置以下三个配置变量：

- `INFERENCE_KEY`：发起模型请求时用于鉴权的 API 密钥（API key）。
- `INFERENCE_MODEL_ID`：模型名称，例如 `claude-3-5-haiku`。
- `INFERENCE_URL`：调用模型所需的基础 URL。

调用模型时，`INFERENCE_KEY` 和 `INFERENCE_URL` 两者都必须设置。

有关这些变量的更多信息，请参阅 [Heroku 文档](https://devcenter.heroku.com/articles/heroku-inference#model-resource-config-vars)。

## 使用示例
### 使用配置变量

Heroku 会用到以下 LiteLLM API 配置变量：

- `HEROKU_API_KEY`：对应 [LiteLLM 的 `api_key` 参数](https://docs.litellm.ai/docs/set_keys#litellmapi_key)。请将该变量设为 Heroku 的 `INFERENCE_KEY` 配置变量的值。
- `HEROKU_API_BASE`：对应 [LiteLLM 的 `api_base` 参数](https://docs.litellm.ai/docs/set_keys#litellmapi_base)。请将该变量设为 Heroku 的 `INFERENCE_URL` 配置变量的值。

本示例没有显式传入 `api_key` 和 `api_base`，而是设置了供 Heroku 使用的配置变量：

```python
import os
from litellm import completion

os.environ["HEROKU_API_BASE"] = "https://us.inference.heroku.com"
os.environ["HEROKU_API_KEY"] = "fake-heroku-key"

response = completion(
    model="heroku/claude-3-5-haiku",
    messages=[
        {"role": "user", "content": "write code for saying hey from LiteLLM"}
    ]
)

print(response)
```

> 模型名称需包含 `heroku/` 前缀，LiteLLM 才能识别要使用的提供商。

### 显式设置 `api_key` 与 `api_base`

```python
from litellm import completion

response = completion(
    model="heroku/claude-sonnet-4",
    api_key="fake-heroku-key",
    api_base="https://us.inference.heroku.com",
    messages=[
        {"role": "user", "content": "write code for saying hey from LiteLLM"}
    ],
)
```

> 模型名称需包含 `heroku/` 前缀，LiteLLM 才能识别要使用的提供商。
