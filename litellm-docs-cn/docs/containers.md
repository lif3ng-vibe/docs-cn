# /containers

管理 OpenAI 与 Azure OpenAI 的代码解释器容器（container，即会话），用于在隔离环境中执行代码。

:::tip
想了解代码解释器的用法？参见[代码解释器指南](/docs/guides/code_interpreter)。
:::

| 功能 | 支持情况 |
|---------|-----------|
| 成本追踪 | ✅ |
| 日志 | ✅（完整记录请求与响应） |
| 负载均衡 | ✅ |
| 代理服务器支持 | ✅ 与虚拟密钥（virtual key）完全集成 |
| 花费管理 | ✅ 支持预算追踪与速率限制 |
| 支持的提供商 | `openai`、`azure` |

:::tip

容器为代码解释器会话提供相互隔离的执行环境。你可以创建、列出、获取和删除容器。

:::

## **LiteLLM Python SDK 用法**

### 快速上手

**创建容器**

```python
import litellm
import os 

# setup env
os.environ["OPENAI_API_KEY"] = "sk-.."

container = litellm.create_container(
    name="My Code Interpreter Container",
    custom_llm_provider="openai",
    expires_after={
        "anchor": "last_active_at",
        "minutes": 20
    }
)

print(f"Container ID: {container.id}")
print(f"Container Name: {container.name}")
```

### 异步用法

```python
from litellm import acreate_container
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

container = await acreate_container(
    name="My Code Interpreter Container",
    custom_llm_provider="openai",
    expires_after={
        "anchor": "last_active_at",
        "minutes": 20
    }
)

print(f"Container ID: {container.id}")
print(f"Container Name: {container.name}")
```

### 列出容器

```python
from litellm import list_containers
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

containers = list_containers(
    custom_llm_provider="openai",
    limit=20,
    order="desc"
)

print(f"Found {len(containers.data)} containers")
for container in containers.data:
    print(f"  - {container.id}: {container.name}")
```

**异步用法**：

```python
from litellm import alist_containers

containers = await alist_containers(
    custom_llm_provider="openai",
    limit=20,
    order="desc"
)

print(f"Found {len(containers.data)} containers")
for container in containers.data:
    print(f"  - {container.id}: {container.name}")
```

### 获取容器

```python
from litellm import retrieve_container
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

container = retrieve_container(
    container_id="cntr_123...",
    custom_llm_provider="openai"
)

print(f"Container: {container.name}")
print(f"Status: {container.status}")
print(f"Created: {container.created_at}")
```

**异步用法**：

```python
from litellm import aretrieve_container

container = await aretrieve_container(
    container_id="cntr_123...",
    custom_llm_provider="openai"
)

print(f"Container: {container.name}")
print(f"Status: {container.status}")
print(f"Created: {container.created_at}")
```

### 删除容器

```python
from litellm import delete_container
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

result = delete_container(
    container_id="cntr_123...",
    custom_llm_provider="openai"
)

print(f"Deleted: {result.deleted}")
print(f"Container ID: {result.id}")
```

**异步用法**：

```python
from litellm import adelete_container

result = await adelete_container(
    container_id="cntr_123...",
    custom_llm_provider="openai"
)

print(f"Deleted: {result.deleted}")
print(f"Container ID: {result.id}")
```

## **LiteLLM 代理用法**

LiteLLM 提供与 OpenAI API 兼容的容器端点（endpoint），用于管理代码解释器会话：

- `/v1/containers` - 创建和列出容器
- `/v1/containers/{container_id}` - 获取和删除容器

**配置**

```bash
$ export OPENAI_API_KEY="sk-..."

$ litellm

# RUNNING on http://0.0.0.0:4000
```

OpenAI 密钥也可以不放在环境变量里，而是直接写在 `model_list` 中。创建时在请求体里传入该部署（deployment）的 `model`，列出时作为 `model` 查询参数传入，代理就会使用该部署的 `api_key` 和 `api_base` 调用 OpenAI。获取、删除以及容器文件相关的调用不需要传 `model`：路由创建返回的 ID 中已编码了部署信息，这些调用会自行完成路由。

```yaml
model_list:
  - model_name: gpt-5.6
    litellm_params:
      model: openai/gpt-5.6
      api_key: os.environ/OPENAI_API_KEY_TEAM_A
```

```bash
$ litellm --config config.yaml
```

**自定义提供商指定方式**

你可以用多种方式指定自定义 LLM 提供商（provider），按优先级从高到低：
1. 请求头：`-H "custom-llm-provider: openai"`
2. 查询参数：`?custom_llm_provider=openai`
3. 请求体：`{"custom_llm_provider": "openai", ...}`
4. 未指定时默认为 "openai"

**创建容器**

```bash
# 默认提供商（openai）
curl -X POST "http://localhost:4000/v1/containers" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "My Container",
        "expires_after": {
            "anchor": "last_active_at",
            "minutes": 20
        }
    }'
```

```bash
# 通过请求头指定
curl -X POST "http://localhost:4000/v1/containers" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "custom-llm-provider: openai" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "My Container"
    }'
```

```bash
# 通过查询参数指定
curl -X POST "http://localhost:4000/v1/containers?custom_llm_provider=openai" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "My Container"
    }'
```

```bash
# 使用 model_list 凭据：指定部署
curl -X POST "http://localhost:4000/v1/containers" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "My Container",
        "model": "gpt-5.6"
    }'
```

**列出容器**

```bash
curl "http://localhost:4000/v1/containers?limit=20&order=desc" \
    -H "Authorization: Bearer $LITELLM_API_KEY"
```

```bash
# 使用 model_list 凭据：指定部署
curl "http://localhost:4000/v1/containers?model=gpt-5.6&limit=20&order=desc" \
    -H "Authorization: Bearer $LITELLM_API_KEY"
```

**获取容器**

```bash
curl "http://localhost:4000/v1/containers/cntr_123..." \
    -H "Authorization: Bearer $LITELLM_API_KEY"
```

**删除容器**

```bash
curl -X DELETE "http://localhost:4000/v1/containers/cntr_123..." \
    -H "Authorization: Bearer $LITELLM_API_KEY"
```

## **通过 OpenAI 客户端使用 LiteLLM 代理**

你可以使用标准的 OpenAI Python 客户端与 LiteLLM 的容器端点交互，既能获得熟悉的接口，又能保留 LiteLLM 代理的各项功能。

### 配置

首先，配置 OpenAI 客户端，让它指向你的 LiteLLM 代理：

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM proxy key
    base_url="http://localhost:4000"  # LiteLLM proxy URL
)
```

### 创建容器

```python
container = client.containers.create(
    name="test-container",
    expires_after={
        "anchor": "last_active_at",
        "minutes": 20
    },
    extra_body={"custom_llm_provider": "openai"}
)

print(f"Container ID: {container.id}")
print(f"Container Name: {container.name}")
print(f"Created at: {container.created_at}")
```

使用 `model_list` 凭据时，在 `extra_body` 中指定部署：

```python
container = client.containers.create(
    name="test-container",
    extra_body={"model": "gpt-5.6"}
)
```

### 列出容器

```python
containers = client.containers.list(
    limit=20,
    extra_body={"custom_llm_provider": "openai"}
)

print(f"Found {len(containers.data)} containers")
for container in containers.data:
    print(f"  - {container.id}: {container.name}")
```

使用 `model_list` 凭据时，由于列出操作是 GET 请求，需在 `extra_query` 中指定部署：

```python
containers = client.containers.list(
    limit=20,
    extra_query={"model": "gpt-5.6"}
)
```

### 获取容器

```python
container = client.containers.retrieve(
    container_id="cntr_6901d28b3c8881908b702815828a5bde0380b3408aeae8c7",
    extra_body={"custom_llm_provider": "openai"}
)

print(f"Container: {container.name}")
print(f"Status: {container.status}")
print(f"Last active: {container.last_active_at}")
```

### 删除容器

```python
result = client.containers.delete(
    container_id="cntr_6901d28b3c8881908b702815828a5bde0380b3408aeae8c7",
    extra_body={"custom_llm_provider": "openai"}
)

print(f"Deleted: {result.deleted}")
print(f"Container ID: {result.id}")
```

### 完整流程示例

下面这个示例完整演示了容器管理的全流程：

```python
from openai import OpenAI

# Initialize client
client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

# 1. Create a container
print("Creating container...")
container = client.containers.create(
    name="My Code Interpreter Session",
    expires_after={
        "anchor": "last_active_at",
        "minutes": 20
    },
    extra_body={"custom_llm_provider": "openai"}
)

container_id = container.id
print(f"Container created. ID: {container_id}")

# 2. List all containers
print("\nListing containers...")
containers = client.containers.list(
    extra_body={"custom_llm_provider": "openai"}
)

for c in containers.data:
    print(f"  - {c.id}: {c.name} (Status: {c.status})")

# 3. Retrieve specific container
print(f"\nRetrieving container {container_id}...")
retrieved = client.containers.retrieve(
    container_id=container_id,
    extra_body={"custom_llm_provider": "openai"}
)

print(f"Container: {retrieved.name}")
print(f"Status: {retrieved.status}")
print(f"Last active: {retrieved.last_active_at}")

# 4. Delete container
print(f"\nDeleting container {container_id}...")
result = client.containers.delete(
    container_id=container_id,
    extra_body={"custom_llm_provider": "openai"}
)

print(f"Deleted: {result.deleted}")
```

## 容器参数

### 创建容器参数

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `name` | string | Yes | 容器名称 |
| `expires_after` | object | No | 容器过期设置 |
| `expires_after.anchor` | string | No | 过期锚点（例如 "last_active_at"） |
| `expires_after.minutes` | integer | No | 从锚点起多少分钟后过期 |
| `file_ids` | array | No | 要纳入容器的文件 ID 列表 |
| `custom_llm_provider` | string | No | 要使用的 LLM 提供商（默认为 "openai"） |

### 列出容器参数

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `after` | string | No | 分页游标 |
| `limit` | integer | No | 返回的条目数（1-100，默认：20） |
| `order` | string | No | 排序方式："asc" 或 "desc"（默认："desc"） |
| `custom_llm_provider` | string | No | 要使用的 LLM 提供商（默认为 "openai"） |

### 获取/删除容器参数

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `container_id` | string | Yes | 要获取/删除的容器 ID |
| `custom_llm_provider` | string | No | 要使用的 LLM 提供商（默认为 "openai"） |

## 响应对象

### ContainerObject

```json
{
  "id": "cntr_123...",
  "object": "container",
  "created_at": 1234567890,
  "name": "My Container",
  "status": "active",
  "last_active_at": 1234567890,
  "expires_at": 1234569090,
  "file_ids": []
}
```

### ContainerListResponse

```json
{
  "object": "list",
  "data": [
    {
      "id": "cntr_123...",
      "object": "container",
      "created_at": 1234567890,
      "name": "My Container",
      "status": "active"
    }
  ],
  "first_id": "cntr_123...",
  "last_id": "cntr_456...",
  "has_more": false
}
```

### DeleteContainerResult

```json
{
  "id": "cntr_123...",
  "object": "container.deleted",
  "deleted": true
}
```

## **支持的提供商**

| 提供商    | 支持状态 | 说明 |
|-------------|----------------|-------|
| OpenAI      | ✅ 已支持   | 完整支持所有容器操作 |
| Azure OpenAI | ✅ 已支持  | 设置 `custom_llm_provider="azure"`。请求会带上 `api-key` 请求头发往 `{api_base}/openai/v1/containers` |

对于 Azure OpenAI，把资源端点作为 `api_base`、密钥作为 `api_key` 传入，或者设置 `AZURE_API_BASE` 和 `AZURE_API_KEY`。

```python
container = litellm.create_container(
    name="My Code Interpreter Container",
    custom_llm_provider="azure",
    api_base="https://<your-resource>.openai.azure.com",
    api_key=os.environ["AZURE_API_KEY"],
)
```

在代理上，带上 `-H "custom-llm-provider: azure"` 请求头即可使用 `AZURE_API_BASE` 和 `AZURE_API_KEY` 环境变量；也可以传入 `model_list` 中某个 `azure/` 部署的 `model`，改用该部署的 `api_base` 和 `api_key`。

## 相关文档

- [容器文件 API](/docs/container_files) - 管理容器内的文件
- [代码解释器指南](/docs/guides/code_interpreter) - 在 LiteLLM 中使用代码解释器
