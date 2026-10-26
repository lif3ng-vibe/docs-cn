import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM 提示词管理（GitOps）

把提示词（prompt）以 `.prompt` 文件的形式存放在代码仓库中，直接配合 LiteLLM 使用，无需依赖任何外部服务。

## 支持的集成方式

- **文件系统**：在本地存放 `.prompt` 文件
- **BitBucket**：将 `.prompt` 文件存放在 BitBucket 仓库中，支持基于团队的访问控制
- **Gitlab**：将 `.prompt` 文件存放在 Gitlab 仓库中，支持基于团队的访问控制
## 快速上手

<Tabs>

<TabItem value="sdk" label="SDK">

**1. 创建 .prompt 文件**

创建 `prompts/hello.prompt`：

```yaml nolint
---
model: gpt-5.6-terra
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

**2. 在 LiteLLM 中使用**

```python
import litellm

# Set the global prompt directory
litellm.global_prompt_directory = "prompts/"

response = litellm.completion(
    model="dotprompt/{{openai_large}}",
    prompt_id="hello",
    prompt_variables={"user_message": "What is the capital of France?"}
)
```

</TabItem>
<TabItem value="bitbucket" label="BITBUCKET">

**1. 在 BitBucket 中创建 .prompt 文件**

在 BitBucket 仓库中创建 `prompts/hello.prompt`：

```yaml nolint
---
model: gpt-5.6-terra
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

**2. 配置 BitBucket 访问权限**

```python
import litellm

# Configure BitBucket access
bitbucket_config = {
    "workspace": "your-workspace",
    "repository": "your-repo",
    "access_token": "your-access-token",
    "branch": "main"
}

# Set global BitBucket configuration
litellm.set_global_bitbucket_config(bitbucket_config)
```

**3. 在 LiteLLM 中使用**

```python
response = litellm.completion(
    model="bitbucket/{{openai_large}}",
    prompt_id="hello",
    prompt_variables={"user_message": "What is the capital of France?"}
)
```

</TabItem>
<TabItem value="gitlab" label="GITLAB">

**1. 在 Gitlab 仓库中创建 .prompt 文件**

在 Gitlab 仓库中创建 `prompts/hello.prompt`：

```yaml nolint
---
model: gpt-5.6-terra
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

**2. 配置 Gitlab 访问权限**

```python
import litellm

# Configure gitlab access
gitlab_config = {
    "project": "your-group/your-repo",  # project path or numeric project id
    "access_token": "your-access-token",
    "branch": "main"
}

# Set global gitlab configuration
litellm.set_global_gitlab_config(gitlab_config)
```

**3. 在 LiteLLM 中使用**

```python
response = litellm.completion(
    model="gitlab/{{openai_large}}",
    prompt_id="hello",
    prompt_variables={"user_message": "What is the capital of France?"}
)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

**1. 创建 .prompt 文件**

创建 `prompts/hello.prompt`：

```yaml nolint
---
model: gpt-5.6-terra
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

**2. 配置 config.yaml**

```yaml
model_list:
  - model_name: my-dotprompt-model
    litellm_params:
      model: dotprompt/{{openai_large}}
      prompt_id: "hello"
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  global_prompt_directory: "./prompts"
  # Or use BitBucket for team-based prompt management
  global_bitbucket_config:
    workspace: "your-workspace"
    repository: "your-repo"
    access_token: "your-access-token"
    branch: "main"
  # Or use Gitlab for team-based prompt management
  global_gitlab_config:
    project: "your-group/your-repo"  # project path or numeric project id
    access_token: "your-access-token"
    branch: "main"
```

**3. 启动代理服务器**

```bash
litellm --config config.yaml --detailed_debug
```

**4. 测试效果**

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "my-dotprompt-model",
    "messages": [{"role": "user", "content": "IGNORED"}],
    "prompt_variables": {
        "user_message": "What is the capital of France?"
    }
}'
```

</TabItem>
</Tabs>

### .prompt 文件格式

`.prompt` 文件使用 YAML frontmatter 存放元数据，并支持 Jinja2 模板语法：

```yaml nolint
---
model: gpt-5.6-terra                    # Model to use
temperature: 0.7                # Optional parameters
max_tokens: 1000
input:
  schema:
    user_message: string        # Input validation (optional)
---
System: You are a helpful {{role}} assistant.

User: {{user_message}}
```

### 进阶功能

**多角色对话**：

```yaml nolint
---
model: gpt-5.6-terra
temperature: 0.3
---
System: You are a helpful coding assistant.

User: {{user_question}}
```

**动态选择模型**：

```yaml nolint
---
model: "{{preferred_model}}"  # Model can be a variable
temperature: 0.7
---
System: You are a helpful assistant specialized in {{domain}}.

User: {{user_message}}
```

### API 参考

使用提示词集成时，可配置以下参数：

**文件系统（dotprompt）**：
```
model: dotprompt/<base_model>     # required (e.g., dotprompt/{{openai_large}})
prompt_id: str                    # required - the .prompt filename without extension
prompt_variables: Optional[dict]  # optional - variables for template rendering
```

**BitBucket**：
```
model: bitbucket/<base_model>     # required (e.g., bitbucket/{{openai_large}})
prompt_id: str                    # required - the .prompt filename without extension
prompt_variables: Optional[dict]  # optional - variables for template rendering
bitbucket_config: Optional[dict]  # optional - BitBucket configuration (if not set globally)
```

**Gitlab**：
```
model: gitlab/<base_model>        # required (e.g., gitlab/{{openai_large}})
prompt_id: str                    # required - the .prompt filename without extension
prompt_variables: Optional[dict]  # optional - variables for template rendering
gitlab_config: Optional[dict]     # optional - Gitlab configuration (if not set globally)
```

**API 调用示例**：

```python
# File system integration
response = litellm.completion(
    model="dotprompt/{{openai_large}}",
    prompt_id="hello",
    prompt_variables={"user_message": "Hello world"},
    messages=[{"role": "user", "content": "This will be ignored"}]
)

# BitBucket integration
response = litellm.completion(
    model="bitbucket/{{openai_large}}",
    prompt_id="hello",
    prompt_variables={"user_message": "Hello world"},
    bitbucket_config={
        "workspace": "your-workspace",
        "repository": "your-repo",
        "access_token": "your-token"
    }
)

# Gitlab integration
response = litellm.completion(
    model="gitlab/{{openai_large}}",
    prompt_id="hello",
    prompt_variables={"user_message": "Hello world"},
    gitlab_config={
        "project": "a/b/<repo_name>",
        "access_token": "your-access-token",
        "base_url": "gitlab url",
        "prompts_path": "src/prompts", # folder to point to, defaults to root
        "branch":"main"  # optional, defaults to main
    }
)
```
