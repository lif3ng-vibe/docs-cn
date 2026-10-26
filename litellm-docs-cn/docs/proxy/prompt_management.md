import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 提示词管理

直接在提示词管理工具（如 Langfuse）中做实验或更换具体模型（例如从 gpt-5.6-terra 换成 gpt-5.6-luna 微调版），而不必改动应用本身。

| 支持的集成 | 链接 |
|------------------------|------|
| LiteLLM 原生 GitOps（.prompt 文件） | [快速上手](native_litellm_prompt) |
| Langfuse               | [快速上手](https://langfuse.com/docs/prompts/get-started) |
| Humanloop              | [快速上手](../observability/humanloop) |
| 通用提示词管理 API | [快速上手](../adding_provider/generic_prompt_management_api) |

## 通过 config.yaml 载入提示词

你可以直接在 `config.yaml` 文件中登记并初始化提示词。这样可以：

- 在代理启动时加载提示词
- 把提示词当作代码，与代理配置一同管理
- 使用任何支持配置登记的提示词集成（dotprompt、BitBucket、GitLab、Generic Prompt Management、Arize Phoenix）

### 基本结构

在 config.yaml 中添加一个 `prompts` 字段：

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

prompts:
  - prompt_id: "my_prompt_id"
    litellm_params:
      prompt_id: "my_prompt_id"
      prompt_integration: "dotprompt"  # or bitbucket, gitlab, generic_prompt_management, arize_phoenix
      # integration-specific parameters below
```

### 理解 `prompt_integration`

`prompt_integration` 字段决定提示词从哪里加载、如何加载：

- **`dotprompt`**：从本地 `.prompt` 文件或内联内容加载
- **`bitbucket`**：从 BitBucket 仓库中的 `.prompt` 文件加载（按团队控制访问权限）
- **`gitlab`**：从 GitLab 仓库中的 `.prompt` 文件加载（按团队控制访问权限）
- **`generic_prompt_management`**：通过一个简单的 API 端点接入任意提示词管理系统（无需提 PR）
- **`arize_phoenix`**：从 [Arize Phoenix](./arize_phoenix_prompts) 拉取提示词

每种集成都有各自的配置参数与访问控制机制。其他任何 `prompt_integration` 取值（包括 `langfuse` 和 `custom`）都会导致代理启动失败，报 `ValueError: Unsupported prompt: <value>`。Langfuse 提示词通过带 `prompt_id` 的 `langfuse/` 模型使用（参见[快速上手](#快速上手)），自定义提示词管理器则以 `callbacks` 形式注册（参见[自定义提示词管理](./custom_prompt_management)）。

### 支持的集成

<Tabs>
<TabItem value="dotprompt" label="DotPrompt（基于文件）">

**方式 1：使用 .prompt 文件**

用 `prompt_file` 让每个条目指向单个文件；也可以省略该参数，从 `litellm_settings.global_prompt_directory` 加载 `<prompt_id>.prompt`。若为单个提示词单独设置 `prompt_directory`，启动时会被拒绝，报 `ValueError: Cannot set prompt_directory when working with prompt_initializer`

```yaml
prompts:
  - prompt_id: "hello"
    litellm_params:
      prompt_id: "hello"
      prompt_integration: "dotprompt"
      prompt_file: "./prompts/hello.prompt"  # Path to a single .prompt file

  - prompt_id: "goodbye"
    litellm_params:
      prompt_id: "goodbye"
      prompt_integration: "dotprompt"  # Loads ./prompts/goodbye.prompt from global_prompt_directory

litellm_settings:
  global_prompt_directory: "./prompts"  # Global setting for all dotprompt integrations
```

**方式 2：使用内联提示词数据**

```yaml
prompts:
  - prompt_id: "my_inline_prompt"
    litellm_params:
      prompt_id: "my_inline_prompt"
      prompt_integration: "dotprompt"
      prompt_data:
        my_inline_prompt:
          content: "Hello {{name}}! How can I help you with {{topic}}?"
          metadata:
            model: "{{openai_large}}"
            temperature: 0.7
            max_tokens: 150
```

**方式 3：用 dotprompt_content 定义单个提示词**

```yaml
prompts:
  - prompt_id: "simple_prompt"
    litellm_params:
      prompt_id: "simple_prompt"
      prompt_integration: "dotprompt"
      dotprompt_content: |
        ---
        model: {{openai_large}}
        temperature: 0.7
        ---
        System: You are a helpful assistant.
        
        User: {{user_message}}
```

在提示词目录下创建 `.prompt` 文件：

```yaml nolint
# prompts/hello.prompt
---
model: gpt-5.6-terra
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

</TabItem>

<TabItem value="bitbucket" label="BitBucket">

```yaml
prompts:
  - prompt_id: "my_bitbucket_prompt"
    litellm_params:
      prompt_id: "my_bitbucket_prompt"
      prompt_integration: "bitbucket"
      bitbucket_workspace: "your-workspace"
      bitbucket_repository: "your-repo"
      bitbucket_access_token: "os.environ/BITBUCKET_ACCESS_TOKEN"
      bitbucket_branch: "main"  # optional, defaults to main

litellm_settings:
  global_bitbucket_config:
    workspace: "your-workspace"
    repository: "your-repo"
    access_token: "os.environ/BITBUCKET_ACCESS_TOKEN"
    branch: "main"
```

你的 BitBucket 仓库中应包含 `.prompt` 文件：

```yaml nolint
# prompts/my_bitbucket_prompt.prompt
---
model: gpt-5.6-terra
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

</TabItem>

<TabItem value="gitlab" label="GitLab">

```yaml
prompts:
  - prompt_id: "my_gitlab_prompt"
    litellm_params:
      prompt_id: "my_gitlab_prompt"
      prompt_integration: "gitlab"
      gitlab_project: "group/sub/repo"
      gitlab_access_token: "os.environ/GITLAB_ACCESS_TOKEN"
      gitlab_branch: "main"  # optional
      gitlab_prompts_path: "prompts"  # optional, defaults to root

litellm_settings:
  global_gitlab_config:
    project: "group/sub/repo"
    access_token: "os.environ/GITLAB_ACCESS_TOKEN"
    branch: "main"
```

你的 GitLab 仓库中应包含 `.prompt` 文件：

```yaml nolint
# prompts/my_gitlab_prompt.prompt
---
model: gpt-5.6-terra
temperature: 0.7
---
System: You are a helpful assistant.

User: {{user_message}}
```

</TabItem>

<TabItem value="generic" label="通用提示词管理">

```yaml
prompts:
  - prompt_id: "simple_prompt"
    litellm_params:
      prompt_integration: "generic_prompt_management"
      provider_specific_query_params:
        project_name: litellm
        slug: hello-world-prompt-2bac
      api_base: http://localhost:8080
      api_key: os.environ/GENERIC_PROMPT_API_KEY
      ignore_prompt_manager_model: true  # optional
      ignore_prompt_manager_optional_params: true  # optional
```

**你需要实现的内容**：

一个位于 `/beta/litellm_prompt_management` 的 GET 端点，返回：

```json
{
  "prompt_id": "simple_prompt",
  "prompt_template": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Help me with {task}"
    }
  ],
  "prompt_template_model": "{{openai_large}}",
  "prompt_template_optional_params": {
    "temperature": 0.7,
    "max_tokens": 500
  }
}
```

**优势**：

- 无需提 PR，即可接入任意提示词管理系统
- 提示词的存储与版本管理完全由你掌控
- 支持 `{variable}` 语法的变量替换
- 可用自定义查询参数做过滤与访问控制

**了解更多**：[通用提示词管理 API 文档](../adding_provider/generic_prompt_management_api)

</TabItem>
</Tabs>

### 完整示例

下面是一个包含多个提示词的完整示例：

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

prompts:
  # File-based dotprompt
  - prompt_id: "coding_assistant"
    litellm_params:
      prompt_id: "coding_assistant"
      prompt_integration: "dotprompt"
      prompt_file: "./prompts/coding_assistant.prompt"
  
  # Inline dotprompt
  - prompt_id: "simple_chat"
    litellm_params:
      prompt_id: "simple_chat"
      prompt_integration: "dotprompt"
      prompt_data:
        simple_chat:
          content: "You are a {{personality}} assistant. User: {{message}}"
          metadata:
            model: "{{openai_large}}"
            temperature: 0.8

litellm_settings:
  global_prompt_directory: "./prompts"
```

### 工作原理

1. **启动时**：代理启动后会读取 `config.yaml` 中的 `prompts` 字段
2. **初始化**：每个提示词按其 `prompt_integration` 类型完成初始化
3. **内存存储**：提示词保存在 `IN_MEMORY_PROMPT_REGISTRY` 中
4. **使用**：在请求中带上 `prompt_id`，通过 `/v1/chat/completions` 或 `/v1/responses` 使用这些提示词

### 使用配置载入的提示词

通过 config.yaml 载入提示词后，即可在 API 请求中使用：

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_large}}",
    "prompt_id": "coding_assistant",
    "prompt_variables": {
        "language": "python",
        "task": "create a web scraper"
    }
}'
```

也可以在 Responses API 中使用同一个 `prompt_id`：

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/responses' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_large}}",
    "prompt_id": "coding_assistant",
    "prompt_variables": {
        "language": "python",
        "task": "create a web scraper"
    },
    "input": []
}'
```

### 提示词结构参考

`prompts` 列表中的每个提示词需要以下字段：

- **`prompt_id`**（string，必填）：提示词的唯一标识
- **`litellm_params`**（object，必填）：提示词的配置
  - **`prompt_id`**（string，必填）：必须与顶层的 prompt_id 一致
  - **`prompt_integration`**（string，必填）：取 `dotprompt`、`bitbucket`、`gitlab`、`generic_prompt_management`、`arize_phoenix` 之一
  - 其他集成专属参数（见上方标签页）
- **`prompt_info`**（object，可选）：提示词的元数据
  - **`prompt_type`**（string）：配置载入的提示词默认为 `"config"`

### 注意事项

- 配置载入的提示词带有 `prompt_type: "config"`，**无法通过 API 更新**
- 要更新这类提示词，请修改 `config.yaml` 后重启代理
- 如需可通过 API 更新的动态提示词，请改用 `/prompts` 端点
- 所有受支持的集成都可用于配置载入的提示词


## 快速上手


<Tabs>

<TabItem value="sdk" label="SDK">

```python
import os 
import litellm

os.environ["LANGFUSE_PUBLIC_KEY"] = "public_key" # [OPTIONAL] set here or in `.completion`
os.environ["LANGFUSE_SECRET_KEY"] = "secret_key" # [OPTIONAL] set here or in `.completion`

litellm.set_verbose = True # see raw request to provider

resp = litellm.completion(
    model="langfuse/{{openai_small}}",
    prompt_id="test-chat-prompt",
    prompt_variables={"user_message": "this is used"}, # [OPTIONAL]
    messages=[{"role": "user", "content": "<IGNORED>"}],
)
```



</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: my-langfuse-model
    litellm_params:
      model: langfuse/openai-model
      prompt_id: "<langfuse_prompt_id>"
      api_key: os.environ/OPENAI_API_KEY
  - model_name: openai-model
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
```

2. 启动代理

```bash
litellm --config config.yaml --detailed_debug
```

3. 测试一下！

<Tabs>
<TabItem value="curl" label="CURL">

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "my-langfuse-model",
    "messages": [
        {
            "role": "user",
            "content": "THIS WILL BE IGNORED"
        }
    ],
    "prompt_variables": {
        "key": "this is used"
    }
}'
```
</TabItem>
<TabItem value="OpenAI Python SDK" label="OpenAI Python SDK">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="{{openai_small}}",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
        "prompt_variables": { # [OPTIONAL]
            "key": "this is used"
        }
    }
)

print(response)
```

</TabItem>
</Tabs>

</TabItem>
</Tabs>


**预期日志**：

```
POST Request Sent from LiteLLM:
curl -X POST \
https://api.openai.com/v1/ \
-d '{'model': '{{openai_small}}', 'messages': <YOUR LANGFUSE PROMPT TEMPLATE>}'
```

## 如何设置模型

### 在 LiteLLM 侧设置模型

可以写成 `langfuse/<litellm_model_name>`。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
litellm.completion(
    model="langfuse/{{openai_small}}", # or `langfuse/anthropic/{{anthropic}}`
    # ...
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: langfuse/{{openai_small}} # OR langfuse/anthropic/{{anthropic}}
      prompt_id: <langfuse_prompt_id>
      api_key: os.environ/OPENAI_API_KEY
```

</TabItem>
</Tabs>

### 在 Langfuse 中设置模型

如果 Langfuse 配置中指定了模型，就会使用该模型。

<Image img={require('../../img/langfuse_prompt_management_model_config.png')} />

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/chatgpt-v-2
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
```

## `prompt_variables` 是什么？

- `prompt_variables`：一个变量字典，用于替换提示词中的部分内容。


## `prompt_id` 是什么？

- `prompt_id`：本次请求所使用提示词的 ID。

<Image img={require('../../img/langfuse_prompt_id.png')} />

## 格式化后的提示词长什么样？

### `/chat/completions` 的 messages

客户端传入的 `messages` 字段会被忽略。

Langfuse 提示词会替换掉 `messages` 字段。

要替换提示词中的部分内容，请使用 `prompt_variables` 字段。[查看提示词变量的使用方式](https://github.com/BerriAI/litellm/blob/017f83d038f85f93202a083cf334de3544a3af01/litellm/integrations/langfuse/langfuse_prompt_management.py#L127)

如果 Langfuse 提示词是字符串，会作为用户消息发送（并非所有提供商都支持系统消息）。

如果 Langfuse 提示词是列表，会原样发送（Langfuse 对话提示词与 OpenAI 格式兼容）。

## 架构概览

<Image img={require('../../img/prompt_management_architecture_doc.png')} />

## API 参考

以下参数既可在 SDK 中传给 `litellm.completion` 函数，也可在 config.yaml 中写入 `litellm_params`：

```
prompt_id: str # required
prompt_variables: Optional[dict] # optional
prompt_version: Optional[int] # optional
langfuse_public_key: Optional[str] # optional
langfuse_secret: Optional[str] # optional
langfuse_secret_key: Optional[str] # optional
langfuse_host: Optional[str] # optional
```
