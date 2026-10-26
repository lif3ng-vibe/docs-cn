# Arize Phoenix 提示词管理

在 LiteLLM SDK 和 Proxy 中使用 [Arize Phoenix](https://phoenix.arize.com/) 的提示词（prompt）版本。

## 快速上手

### SDK

```python
import litellm

response = litellm.completion(
    model="{{openai_large}}",
    prompt_id="UHJvbXB0VmVyc2lvbjox",
    prompt_integration="arize_phoenix",
    api_key="your-arize-phoenix-token",
    api_base="https://app.phoenix.arize.com/s/your-workspace",
    prompt_variables={"question": "What is AI?"},
)
```

### Proxy

**1. 将提示词加入配置**

```yaml
prompts:
  - prompt_id: "simple_prompt"
    litellm_params:
      prompt_id: "UHJvbXB0VmVyc2lvbjox"
      prompt_integration: "arize_phoenix"
      api_base: https://app.phoenix.arize.com/s/your-workspace
      api_key: os.environ/PHOENIX_API_KEY
      ignore_prompt_manager_model: true # optional: use model from config instead
      ignore_prompt_manager_optional_params: true # optional: ignore temp, max_tokens from prompt
```

**2. 发起请求**

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "prompt_id": "simple_prompt",
    "prompt_variables": {
      "question": "Explain quantum computing"
    }
  }'
```

## 配置

### 获取 Arize Phoenix 凭证

1. **API Token**：从 [Arize Phoenix Settings](https://app.phoenix.arize.com/) 获取
2. **Workspace URL**：`https://app.phoenix.arize.com/s/{your-workspace}`
3. **Prompt ID**：在提示词版本的 URL 中可以找到

**设置环境变量**：
```bash
export PHOENIX_API_KEY="your-token"
```

### SDK 与 Proxy 选项

| 参数 | 必填 | 说明 |
|-----------|----------|-------------|
| `prompt_id` | 是 | Arize Phoenix 提示词版本 ID |
| `prompt_integration` | 是 | 设为 `"arize_phoenix"` |
| `api_base` | 是 | 工作区 URL |
| `api_key` | 是 | 访问令牌 |
| `prompt_variables` | 否 | 模板中使用的变量 |

### 仅 Proxy 选项

| 参数 | 说明 |
|-----------|-------------|
| `ignore_prompt_manager_model` | 使用配置中的模型，而非提示词自带的模型 |
| `ignore_prompt_manager_optional_params` | 忽略提示词中的 temperature 与 max_tokens |

## 变量模板

Arize Phoenix 使用 Mustache/Handlebars 语法：

```python
# Template: "Hello {{name}}, question: {{question}}"
prompt_variables = {
    "name": "Alice",
    "question": "What is ML?"
}
# Result: "Hello Alice, question: What is ML?"
```


## 结合额外消息使用

```python
response = litellm.completion(
    model="{{openai_large}}",
    prompt_id="UHJvbXB0VmVyc2lvbjox",
    prompt_integration="arize_phoenix",
    api_base="https://app.phoenix.arize.com/s/your-workspace",
    prompt_variables={"question": "Explain AI"},
    messages=[
        {"role": "user", "content": "Keep it under 50 words"}
    ]
)
```


## 错误处理

```python
try:
    response = litellm.completion(
        model="{{openai_large}}",
        prompt_id="invalid-id",
        prompt_integration="arize_phoenix",
        api_base="https://app.phoenix.arize.com/s/workspace"
    )
except Exception as e:
    print(f"Error: {e}")
    # 404: Prompt not found
    # 401: Invalid credentials
    # 403: Access denied
```

## 支持

- [LiteLLM GitHub Issues](https://github.com/BerriAI/litellm/issues)
- [Arize Phoenix 文档](https://docs.arize.com/phoenix)
