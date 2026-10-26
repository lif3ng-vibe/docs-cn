# /skills - Anthropic Skills API

| 功能 | 是否支持 |
|---------|-----------|
| 成本追踪 | ✅ |
| 日志 | ✅ |
| 负载均衡 | ✅ |
| 支持的提供商 | `anthropic` |

:::tip

LiteLLM 遵循 [Anthropic Skills API](https://docs.anthropic.com/en/docs/build-with-claude/skills) 规范来创建、管理和使用可复用的 AI 能力。

:::

## **LiteLLM Python SDK 用法**

### 快速上手：创建技能

```python showLineNumbers title="create_skill.py"
from litellm import create_skill
import zipfile
import os

# Create a SKILL.md file
skill_content = """---
name: test-skill
description: A custom skill for data analysis
---

# Test Skill

This skill helps with data analysis tasks.
"""

# Create skill directory and SKILL.md
os.makedirs("test-skill", exist_ok=True)
with open("test-skill/SKILL.md", "w") as f:
    f.write(skill_content)

# Create a zip file
with zipfile.ZipFile("test-skill.zip", "w") as zipf:
    zipf.write("test-skill/SKILL.md", "test-skill/SKILL.md")

# Create the skill
response = create_skill(
    display_title="My Custom Skill",
    files=[open("test-skill.zip", "rb")],
    custom_llm_provider="anthropic",
    api_key="sk-ant-..."
)

print(f"Skill created: {response.id}")
```

### 列出技能

```python showLineNumbers title="list_skills.py"
from litellm import list_skills

response = list_skills(
    custom_llm_provider="anthropic",
    api_key="sk-ant-...",
    limit=20
)

for skill in response.data:
    print(f"{skill.display_title}: {skill.id}")
```

### 获取技能详情

```python showLineNumbers title="get_skill.py"
from litellm import get_skill

skill = get_skill(
    skill_id="skill_01...",
    custom_llm_provider="anthropic",
    api_key="sk-ant-..."
)

print(f"Skill: {skill.display_title}")
print(f"Description: {skill.description}")
```

### 删除技能

```python showLineNumbers title="delete_skill.py"
from litellm import delete_skill

response = delete_skill(
    skill_id="skill_01...",
    custom_llm_provider="anthropic",
    api_key="sk-ant-..."
)

print(f"Deleted: {response.id}")
```

### 异步用法

```python showLineNumbers title="async_skills.py"
from litellm import acreate_skill, alist_skills, aget_skill, adelete_skill
import asyncio

async def manage_skills():
    # Create skill
    with open("test-skill.zip", "rb") as f:
        skill = await acreate_skill(
            display_title="My Async Skill",
            files=[f],
            custom_llm_provider="anthropic",
            api_key="sk-ant-..."
        )

    # List skills
    skills = await alist_skills(
        custom_llm_provider="anthropic",
        api_key="sk-ant-..."
    )

    # Get skill
    skill_detail = await aget_skill(
        skill_id=skill.id,
        custom_llm_provider="anthropic",
        api_key="sk-ant-..."
    )

    # Delete skill (if no versions exist)
    # await adelete_skill(
    #     skill_id=skill.id,
    #     custom_llm_provider="anthropic",
    #     api_key="sk-ant-..."
    # )

asyncio.run(manage_skills())
```

## **LiteLLM 代理用法**

LiteLLM 提供与 Anthropic 兼容的 `/skills` 端点，用于管理技能。

### 身份验证

Skills API 请求有两种认证方式：

**方式 1**：使用默认的 ANTHROPIC_API_KEY

设置 `ANTHROPIC_API_KEY` 环境变量。不带 `model` 参数的请求会使用这个默认密钥。

```yaml showLineNumbers title="config.yaml"
# 无需配置 model_list，直接使用环境变量
# ANTHROPIC_API_KEY=sk-ant-...
```

```bash
# 请求会使用环境变量中的 ANTHROPIC_API_KEY
curl "http://0.0.0.0:4000/v1/skills?beta=true" \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

**方式 2**：指定模型以选择凭据

在配置中定义多个模型，然后用 `model` 参数指定使用哪一组凭据。

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
```

启动 litellm

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 基本用法

下面所有示例对**两种**认证方式（默认环境变量密钥或基于模型的路由）都适用。

#### 创建技能

你可以上传 ZIP 文件，也可以直接上传 SKILL.md 文件：

**方式 1**：上传 ZIP 文件

```bash showLineNumbers title="create_skill_zip.sh"
curl "http://0.0.0.0:4000/v1/skills?beta=true" \
  -X POST \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02" \
  -F "display_title=My Skill" \
  -F "files[]=@test-skill.zip"
```

**方式 2**：直接上传 SKILL.md

```bash showLineNumbers title="create_skill_md.sh"
curl "http://0.0.0.0:4000/v1/skills?beta=true" \
  -X POST \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02" \
  -F "display_title=My Skill" \
  -F "files[]=@test-skill/SKILL.md;filename=test-skill/SKILL.md"
```

#### 列出技能

```bash showLineNumbers title="list_skills.sh"
curl "http://0.0.0.0:4000/v1/skills?beta=true" \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

#### 获取技能

```bash showLineNumbers title="get_skill.sh"
curl "http://0.0.0.0:4000/v1/skills/skill_01abc?beta=true" \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

#### 删除技能

```bash showLineNumbers title="delete_skill.sh"
curl "http://0.0.0.0:4000/v1/skills/skill_01abc?beta=true" \
  -X DELETE \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

### 基于模型的路由（多账号）

如果你有多个 Anthropic 账号，可以用基于模型的路由（model-based routing）来指定使用哪个账号：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: claude-team-a
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY_TEAM_A
  
  - model_name: claude-team-b
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY_TEAM_B
```

然后用 `model` 参数路由到指定账号：

**通过路由创建技能**

```bash showLineNumbers title="create_with_routing.sh"
# 路由到 Team A：使用 ZIP 文件
curl "http://0.0.0.0:4000/v1/skills?beta=true" \
  -X POST \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02" \
  -F "model=claude-team-a" \
  -F "display_title=Team A Skill" \
  -F "files[]=@test-skill.zip"

# 路由到 Team B：直接上传 SKILL.md
curl "http://0.0.0.0:4000/v1/skills?beta=true" \
  -X POST \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02" \
  -F "model=claude-team-b" \
  -F "display_title=Team B Skill" \
  -F "files[]=@test-skill/SKILL.md;filename=test-skill/SKILL.md"
```

**通过路由列出技能**

```bash showLineNumbers title="list_with_routing.sh"
# 列出 Team A 的技能
curl "http://0.0.0.0:4000/v1/skills?beta=true&model=claude-team-a" \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"

# 列出 Team B 的技能
curl "http://0.0.0.0:4000/v1/skills?beta=true&model=claude-team-b" \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

**通过路由获取技能**

```bash showLineNumbers title="get_with_routing.sh"
# 获取 Team A 的技能
curl "http://0.0.0.0:4000/v1/skills/skill_01abc?beta=true&model=claude-team-a" \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"

# 获取 Team B 的技能
curl "http://0.0.0.0:4000/v1/skills/skill_01xyz?beta=true&model=claude-team-b" \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

**通过路由删除技能**

```bash showLineNumbers title="delete_with_routing.sh"
# 删除 Team A 的技能
curl "http://0.0.0.0:4000/v1/skills/skill_01abc?beta=true&model=claude-team-a" \
  -X DELETE \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"

# 删除 Team B 的技能
curl "http://0.0.0.0:4000/v1/skills/skill_01xyz?beta=true&model=claude-team-b" \
  -X DELETE \
  -H "X-Api-Key: sk-<your-litellm-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02"
```

## **SKILL.md 格式**

技能需要一个带 YAML frontmatter 的 `SKILL.md` 文件：

```markdown showLineNumbers title="SKILL.md"
---
name: test-skill
description: A brief description of what this skill does
license: MIT
allowed-tools:
  - computer_20250124
  - text_editor_20250124
---

# Test Skill

Detailed instructions for Claude on how to use this skill.

## Usage

Examples and best practices...
```

### YAML Frontmatter 要求

| 字段 | 是否必填 | 说明 |
|-------|----------|-------------|
| `name` | 是 | 技能标识符（仅限小写字母、数字和连字符），必须与目录名一致。 |
| `description` | 是 | 对技能的简要描述 |
| `license` | 否 | 许可证类型（如 MIT、Apache-2.0） |
| `allowed-tools` | 否 | 该技能可以使用的 Claude 工具列表 |
| `metadata` | 否 | 其他自定义元数据 |

**重要**：`name` 字段必须与技能目录名完全一致。例如目录是 `test-skill`，frontmatter 里就必须写 `name: test-skill`。

### 文件结构

**方式 1**：ZIP 文件结构

打包技能时必须带一个与技能名同名的顶层目录：

```
test-skill.zip
└── test-skill/         # Top-level folder (name must match skill name in SKILL.md)
    └── SKILL.md        # Required skill definition file
```

所有文件都必须放在同一个顶层目录里，且 `SKILL.md` 必须位于该目录根部。

**方式 2**：直接上传 SKILL.md

直接上传 `SKILL.md`（不打包 ZIP）时，必须在 filename 参数中带上技能目录路径，以保持所需的结构：

```bash
# filename 参数必须包含技能目录路径
-F "files[]=@test-skill/SKILL.md;filename=test-skill/SKILL.md"
```

这样 API 就知道 `SKILL.md` 属于 `test-skill` 目录。

**重要要求**：
- 文件夹名（ZIP 里或 filename 路径中）必须与 SKILL.md frontmatter 中的 `name` 字段**完全一致**
- `SKILL.md` 必须位于技能目录根部（不能放在子目录里）
- 其余文件也必须放在同一个技能目录里

## **响应格式**

### Skill 对象

```json showLineNumbers
{
  "id": "skill_01abc123",
  "type": "skill",
  "name": "my-skill",
  "display_title": "My Custom Skill",
  "description": "A brief description",
  "created_at": "2025-01-15T10:30:00.000Z",
  "updated_at": "2025-01-15T10:30:00.000Z",
  "latest_version_id": "skillver_01xyz789"
}
```

### 列出技能的响应

```json showLineNumbers
{
  "data": [
    {
      "id": "skill_01abc",
      "type": "skill",
      "name": "skill-one",
      "display_title": "Skill One",
      "description": "First skill"
    },
    {
      "id": "skill_02def",
      "type": "skill",
      "name": "skill-two",
      "display_title": "Skill Two",
      "description": "Second skill"
    }
  ],
  "has_more": false,
  "first_id": "skill_01abc",
  "last_id": "skill_02def"
}
```


## **LiteLLM 托管技能的语义搜索**

`custom_llm_provider=litellm_proxy` 的技能（存放在代理自己的数据库里，而不是转发给 Anthropic）支持按语义相似度排序，调用方只需描述自己想要什么，不必翻遍整个技能注册表。

:::info[相关文档]
- [MCP 工具搜索](./mcp_tool_search.md#工作原理)：介绍 `skill_search` 这个 MCP 虚拟工具
:::

### 启用方法

在 `litellm_settings` 里设置一个嵌入（embedding）模型：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: text-embedding-3-small
    litellm_params:
      model: openai/text-embedding-3-small
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  skill_search_embedding_model: text-embedding-3-small
```

### 通过 REST 搜索

向 `GET /v1/skills` 传入 `query`（可选传 `top_k`，默认 5）：

```bash showLineNumbers title="search_skills.sh"
curl "http://0.0.0.0:4000/v1/skills?custom_llm_provider=litellm_proxy&query=summarize+a+pdf&top_k=5" \
  -H "Authorization: Bearer $LITELLM_KEY"
```

每个结果都会带有 `search_score`（与查询的余弦相似度），而且不同于普通列表，`description` 字段会有值：

```json showLineNumbers
{
  "data": [
    {
      "id": "litellm_skill_...",
      "display_title": "Document Summarizer",
      "description": "Reads a PDF and produces a short summary",
      "search_score": 0.71,
      ...
    }
  ],
  "has_more": false
}
```

`query` 只支持 `custom_llm_provider=litellm_proxy`；搭配其他 provider 使用会返回 `400 skill_search_unsupported_provider`。如果没有设置 `skill_search_embedding_model`，同样的请求会返回 `400 skill_search_not_configured`，报错信息里会指出需要添加的配置项。

### 授权

搜索只会对调用密钥本来就能访问的技能做排序：`GET /v1/skills` 现有的可见性规则会在排序之前先执行，因此无法通过搜索枚举出密钥权限范围之外的技能。

## **支持的提供商**

| 提供商 | 用法链接 |
|----------|---------------|
| Anthropic | [用法](#快速上手创建技能) |
| LiteLLM（自托管） | [语义搜索](#litellm-托管技能的语义搜索) |
