# [BETA] 通用提示词管理 API——无需提交 PR 即可集成

## 问题所在

作为提示词管理提供商（provider），过去与 LiteLLM 集成通常需要：
- 向 LiteLLM 仓库提交 PR
- 等待评审与合并
- 在 LiteLLM 代码库中维护提供商专属代码
- API 一有变动就要同步更新集成代码

## 解决方案

只需实现一个简单的 API 端点，**通用提示词管理 API**（Generic Prompt Management API）就能让你与 LiteLLM **即时**集成，无需提交任何 PR。

### 核心优势

1. **无需提交 PR**——立即部署、立即集成
3. **契约简单**——只需一个 GET 端点，返回标准 JSON
4. **变量替换**——支持 `{variable}` 语法的提示词变量
5. **自定义参数**——通过配置传递提供商专属的查询参数
6. **完全掌控**——提示词管理 API 由你自行拥有和维护
7. **模型与参数覆盖**——可选择用提示词中的设置覆盖客户端的模型与参数

## 三步快速上手

### 第 1 步：配置 LiteLLM

在你的 `config.yaml` 中添加：

```yaml
prompts:
  - prompt_id: "simple_prompt"
    litellm_params:
      prompt_integration: "generic_prompt_management"
      api_base: http://localhost:8080
      api_key: os.environ/YOUR_API_KEY
```

### 第 2 步：实现你的 API 端点

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/beta/litellm_prompt_management")
async def get_prompt(prompt_id: str):
    return {
        "prompt_id": prompt_id,
        "prompt_template": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Help me with {task}"}
        ],
        "prompt_template_model": "{{openai_large}}",
        "prompt_template_optional_params": {"temperature": 0.7}
    }
```

### 第 3 步：在你的应用中使用

```python
from litellm import completion

response = completion(
    model="{{openai_large}}",
    prompt_id="simple_prompt",
    prompt_variables={"task": "data analysis"},
    messages=[{"role": "user", "content": "I have sales data"}]
)
```

搞定！LiteLLM 会获取你的提示词、替换变量并发起请求。

## API 契约

### 端点

实现 `GET /beta/litellm_prompt_management`

### 请求格式

你的端点将收到一个携带查询参数的 GET 请求：

```
GET /beta/litellm_prompt_management?prompt_id={prompt_id}&{custom_params}
```

**查询参数**：
- `prompt_id`（必填）：要获取的提示词 ID
- 自定义参数：你在 `provider_specific_query_params` 中配置的其他参数

**示例**：
```
GET /beta/litellm_prompt_management?prompt_id=hello-world-prompt-2bac&project_name=litellm&slug=hello-world-prompt-2bac
```

### 响应格式

```json
{
  "prompt_id": "hello-world-prompt-2bac",
  "prompt_template": [
    {
      "role": "system",
      "content": "You are a helpful assistant specialized in {domain}."
    },
    {
      "role": "user",
      "content": "Help me with {task}"
    }
  ],
  "prompt_template_model": "{{openai_large}}",
  "prompt_template_optional_params": {
    "temperature": 0.7,
    "max_tokens": 500,
    "top_p": 0.9
  }
}
```

**响应字段**：
- `prompt_id`（string，必填）：提示词 ID
- `prompt_template`（array，必填）：OpenAI 格式的消息数组，可含 `{variable}` 占位符
- `prompt_template_model`（string，可选）：该提示词要使用的模型（除非设置了 `ignore_prompt_manager_model: true`，否则会覆盖客户端指定的模型）
- `prompt_template_optional_params`（object，可选）：temperature、max_tokens 等附加参数（除非设置了 `ignore_prompt_manager_optional_params: true`，否则会与客户端参数合并）

## LiteLLM 配置

在 `config.yaml` 中添加：

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

prompts:
  - prompt_id: "simple_prompt"
    litellm_params:
      prompt_integration: "generic_prompt_management"
      provider_specific_query_params:
        project_name: litellm
        slug: hello-world-prompt-2bac
      api_base: http://localhost:8080
      api_key: os.environ/YOUR_PROMPT_API_KEY  # optional
      ignore_prompt_manager_model: true  # optional, keep client's model
      ignore_prompt_manager_optional_params: true  # optional, don't merge prompt manager's params (e.g. temperature, max_tokens, etc.)
```

### 配置参数

- `prompt_integration`：必须为 `"generic_prompt_management"`
- `provider_specific_query_params`：发送给你的 API 的自定义查询参数（可选）
- `api_base`：你的提示词管理 API 的基础 URL
- `api_key`：用于鉴权的 API 密钥（可选），以 `Bearer` 令牌形式发送
- `ignore_prompt_manager_model`：若为 `true`，则使用客户端指定的模型而非提示词中的模型（默认：`false`）
- `ignore_prompt_manager_optional_params`：若为 `true`，则不将提示词的可选参数与客户端参数合并（默认：`false`）

## 用法

### 在 LiteLLM SDK 中使用

**通过提示词 ID 的基本用法**：

```python
from litellm import completion

response = completion(
    model="{{openai_large}}",
    prompt_id="simple_prompt",
    messages=[{"role": "user", "content": "Additional message"}]
)
```

**使用提示词变量**：

```python
response = completion(
    model="{{openai_large}}",
    prompt_id="simple_prompt",
    prompt_variables={
        "domain": "data science",
        "task": "analyzing customer churn"
    },
    messages=[{"role": "user", "content": "Please provide a detailed analysis"}]
)
```

提示词模板中的 `{domain}` 会被替换为 "data science"，`{task}` 会被替换为 "analyzing customer churn"。

### 在 LiteLLM 代理中使用

**1. 使用你的配置启动代理**：

```bash
litellm --config /path/to/config.yaml
```

**2. 携带 prompt_id 发起请求**：

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "prompt_id": "simple_prompt",
    "prompt_variables": {
      "domain": "healthcare",
      "task": "patient risk assessment"
    },
    "messages": [
      {"role": "user", "content": "Analyze the following data..."}
    ]
  }'
```

**3. 通过 OpenAI SDK 使用**：

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>"
)

response = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[
        {"role": "user", "content": "Analyze the data"}
    ],
    extra_body={
        "prompt_id": "simple_prompt",
        "prompt_variables": {
            "domain": "finance",
            "task": "fraud detection"
        }
    }
)
```

## 实现示例

完整参考实现（含多个示例提示词、鉴权逻辑和若干便捷端点）见 [mock_prompt_management_server.py](https://github.com/BerriAI/litellm/blob/main/cookbook/mock_prompt_management_server/mock_prompt_management_server.py)。

**最简 FastAPI 示例**：

```python
from fastapi import FastAPI, HTTPException, Header
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

app = FastAPI()

# In-memory prompt storage (replace with your database)
PROMPTS = {
    "hello-world-prompt": {
        "prompt_id": "hello-world-prompt",
        "prompt_template": [
            {
                "role": "system",
                "content": "You are a helpful assistant specialized in {domain}."
            },
            {
                "role": "user", 
                "content": "Help me with: {task}"
            }
        ],
        "prompt_template_model": "{{openai_large}}",
        "prompt_template_optional_params": {
            "temperature": 0.7,
            "max_tokens": 500
        }
    },
    "code-review-prompt": {
        "prompt_id": "code-review-prompt",
        "prompt_template": [
            {
                "role": "system",
                "content": "You are an expert code reviewer. Review code for {language}."
            },
            {
                "role": "user",
                "content": "Review the following code:\n\n{code}"
            }
        ],
        "prompt_template_model": "{{openai_large}}",
        "prompt_template_optional_params": {
            "temperature": 0.3,
            "max_tokens": 1000
        }
    }
}

class PromptResponse(BaseModel):
    prompt_id: str
    prompt_template: List[Dict[str, str]]
    prompt_template_model: Optional[str] = None
    prompt_template_optional_params: Optional[Dict[str, Any]] = None

@app.get("/beta/litellm_prompt_management", response_model=PromptResponse)
async def get_prompt(
    prompt_id: str,
    authorization: Optional[str] = Header(None),
    project_name: Optional[str] = None,
    slug: Optional[str] = None,
):
    """
    Get a prompt by ID with optional filtering by project_name and slug.
    
    Args:
        prompt_id: The ID of the prompt to fetch
        authorization: Optional Bearer token for authentication
        project_name: Optional project name filter
        slug: Optional slug filter
    """
    
    # Optional: Validate authorization
    if authorization:
        token = authorization.replace("Bearer ", "")
        # Validate your token here
        if not is_valid_token(token):
            raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Optional: Apply additional filtering based on custom params
    if project_name or slug:
        # You can use these parameters to filter or validate access
        # For example, check if the user has access to this project
        pass
    
    # Fetch the prompt from your storage
    if prompt_id not in PROMPTS:
        raise HTTPException(
            status_code=404,
            detail=f"Prompt '{prompt_id}' not found"
        )
    
    prompt_data = PROMPTS[prompt_id]
    
    return PromptResponse(**prompt_data)

def is_valid_token(token: str) -> bool:
    """Validate API token - implement your logic here"""
    # Example: Check against your database or secret store
    valid_tokens = ["your-secret-token", "another-valid-token"]
    return token in valid_tokens

# Optional: Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Optional: List all prompts endpoint
@app.get("/prompts")
async def list_prompts(authorization: Optional[str] = Header(None)):
    """List all available prompts"""
    if authorization:
        token = authorization.replace("Bearer ", "")
        if not is_valid_token(token):
            raise HTTPException(status_code=401, detail="Invalid API key")
    
    return {
        "prompts": [
            {"prompt_id": pid, "model": p.get("prompt_template_model")}
            for pid, p in PROMPTS.items()
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

### 运行示例服务器

1. 安装依赖：
```bash
uv add fastapi uvicorn
```

2. 将上面的代码保存为 `prompt_server.py`

3. 启动服务器：
```bash
python prompt_server.py
```

4. 测试端点：
```bash
curl "http://localhost:8080/beta/litellm_prompt_management?prompt_id=hello-world-prompt&project_name=litellm&slug=hello-world-prompt-2bac"
```

预期响应：
```json
{
  "prompt_id": "hello-world-prompt",
  "prompt_template": [
    {
      "role": "system",
      "content": "You are a helpful assistant specialized in {domain}."
    },
    {
      "role": "user",
      "content": "Help me with: {task}"
    }
  ],
  "prompt_template_model": "{{openai_large}}",
  "prompt_template_optional_params": {
    "temperature": 0.7,
    "max_tokens": 500
  }
}
```

## 高级特性

### 变量替换

LiteLLM 会自动替换提示词模板中使用 `{variable}` 语法的变量，`{variable}` 与 `{{variable}}` 两种格式都支持。

**提示词模板示例**：
```json
{
  "prompt_template": [
    {
      "role": "system",
      "content": "You are an expert in {domain} with {years} years of experience."
    }
  ]
}
```

**客户端请求**：
```python
completion(
    model="{{openai_large}}",
    prompt_id="expert_prompt",
    prompt_variables={
        "domain": "machine learning",
        "years": "10"
    }
)
```

**结果**：
```
"You are an expert in machine learning with 10 years of experience."
```

### 缓存

LiteLLM 会自动把获取到的提示词缓存在内存中。缓存键包括：
- `prompt_id`
- `prompt_label`（如提供）
- `prompt_version`（如提供）

也就是说，同一份提示词配置只会让你的 API 端点被调用一次。

### 模型覆盖行为

**默认行为**（未设置 `ignore_prompt_manager_model` 时）：
```yaml
prompts:
  - prompt_id: "my_prompt"
    litellm_params:
      prompt_integration: "generic_prompt_management"
      api_base: http://localhost:8080
```

如果你的 API 返回了 `"prompt_template_model": "{{openai_large}}"`，那么无论客户端指定了什么模型，LiteLLM 都会使用 `{{openai_large}}`。

**设置 `ignore_prompt_manager_model: true` 时**：
```yaml
prompts:
  - prompt_id: "my_prompt"
    litellm_params:
      prompt_integration: "generic_prompt_management"
      api_base: http://localhost:8080
      ignore_prompt_manager_model: true
```

LiteLLM 将使用客户端指定的模型，忽略提示词中的模型。

### 参数合并行为

**默认行为**（未设置 `ignore_prompt_manager_optional_params` 时）：

客户端参数会与提示词参数合并，且提示词参数优先：
```python
# Prompt returns: {"temperature": 0.7, "max_tokens": 500}
# Client sends: {"temperature": 0.9, "top_p": 0.95}
# Final params: {"temperature": 0.7, "max_tokens": 500, "top_p": 0.95}
```

**设置 `ignore_prompt_manager_optional_params: true` 时**：

只使用客户端参数：
```python
# Prompt returns: {"temperature": 0.7, "max_tokens": 500}
# Client sends: {"temperature": 0.9, "top_p": 0.95}
# Final params: {"temperature": 0.9, "top_p": 0.95}
```

## 安全注意事项

1. **鉴权**：使用 `api_key` 参数保护你的提示词管理 API
2. **授权**：借助自定义查询参数实现基于团队/用户的访问控制
3. **限流**：添加速率限制，防止 API 被滥用
4. **输入校验**：在处理前校验所有查询参数
5. **HTTPS**：生产环境务必使用 HTTPS 以保证通信加密
6. **密钥保管**：API 密钥存放在环境变量中，不要写进配置文件

## 适用场景

✅ **以下情况适合使用通用提示词管理 API**：
- 你想即时完成集成，不想等 PR
- 你自维护一套提示词管理服务
- 你需要完全掌控提示词的版本管理与更新
- 你想构建自定义的提示词管理功能
- 你需要与自己的内部系统集成

✅ **常见场景**：
- 组织内部的提示词管理系统
- 多租户提示词管理，按团队做访问控制
- 对不同提示词版本做 A/B 测试
- 提示词实验与分析
- 与现有提示词工程工作流集成

## 何时使用

✅ **以下情况适合使用通用提示词管理 API**：
- 你想即时完成集成，不想等 PR
- 你自维护一套提示词管理服务
- 你需要完全掌控更新与功能
- 你想要自定义的提示词存储与版本管理逻辑

❌ **以下情况请提交 PR**：
- 你想与 LiteLLM 内部机制做更深入的集成
- 你的集成需要复杂的 LiteLLM 专属逻辑
- 你想成为内置提供商
- 你在为社区构建可复用的集成

## 故障排查

### 提示词未找到
- 核对 `prompt_id` 是否完全一致（区分大小写）
- 检查 LiteLLM 能否访问你的 API 端点
- 如果使用了 `api_key`，检查鉴权配置是否正确

### 变量未被替换
- 确保变量使用 `{variable}` 或 `{{variable}}` 语法
- 检查 `prompt_variables` 中的变量名是否与模板完全一致
- 变量名区分大小写

### 模型未被覆盖
- 检查配置中是否设置了 `ignore_prompt_manager_model: true`
- 确认你的 API 响应中返回了 `prompt_template_model`

### 参数未被应用
- 检查是否设置了 `ignore_prompt_manager_optional_params: true`
- 确认你的 API 返回了 `prompt_template_optional_params`
- 确保参数名与 OpenAI 的参数名一致

## 有疑问？

该 API 目前处于 **beta 阶段**，我们会根据反馈持续改进。如需更多能力，欢迎提交 issue 或 PR。

## 相关文档

- [提示词管理概览](../proxy/prompt_management.md)
- [通用防护栏 API](./generic_guardrail_api.md)
- [LiteLLM 代理搭建](../proxy/quick_start.md)
