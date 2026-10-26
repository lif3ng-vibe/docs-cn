# /videos

| 功能 | 支持情况 |
|---------|-----------|
| 成本追踪（cost tracking） | ✅ |
| 日志 | ✅（完整的请求/响应日志） |
回退 | ✅（在支持的模型之间） |
| 负载均衡 | ✅ |
| 防护栏（guardrails）支持 | ✅ 内容审核与安全检查 |
| 代理服务器支持 | ✅ 通过虚拟密钥（virtual key）实现完整的代理集成 |
| 花费管理 | ✅ 预算追踪与速率限制 |
| 支持的提供商 | `openai`, `azure`, `gemini`, `vertex_ai`, `runwayml`, `qwencloud`, `qwen_ai_platform`, `dashscope` |

:::tip

LiteLLM 遵循 [OpenAI 视频生成 API 规范](https://platform.openai.com/docs/guides/video-generation)

:::

## **LiteLLM Python SDK 用法**
### 快速上手

```python
from litellm import video_generation, video_status, video_content
import os
import time

os.environ["OPENAI_API_KEY"] = "sk-.."

# Generate video
response = video_generation(
    model="openai/sora-2",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    seconds="8",
    size="720x1280"
)

print(f"Video ID: {response.id}")
print(f"Initial Status: {response.status}")

# Check status until video is ready
while True:
    status_response = video_status(
        video_id=response.id
    )
    
    print(f"Current Status: {status_response.status}")
    
    if status_response.status == "completed":
        break
    elif status_response.status == "failed":
        print("Video generation failed")
        break
    
    time.sleep(10)  # Wait 10 seconds before checking again

# Download video content when ready
video_bytes = video_content(
    video_id=response.id
)

# Save to file
with open("generated_video.mp4", "wb") as f:
    f.write(video_bytes)
```

### 异步用法

```python
from litellm import avideo_generation, avideo_status, avideo_content
import os, asyncio

os.environ["OPENAI_API_KEY"] = "sk-.."

async def test_async_video(): 
    response = await avideo_generation(
        model="openai/sora-2",
        prompt="A cat playing with a ball of yarn in a sunny garden",
        seconds="8",
        size="720x1280"
    )
    
    print(f"Video ID: {response.id}")
    print(f"Initial Status: {response.status}")
    
    # Check status until video is ready
    while True:
        status_response = await avideo_status(
            video_id=response.id
        )
        
        print(f"Current Status: {status_response.status}")
        
        if status_response.status == "completed":
            break
        elif status_response.status == "failed":
            print("Video generation failed")
            break
        
        await asyncio.sleep(10)  # Wait 10 seconds before checking again
    
    # Download video content when ready
    video_bytes = await avideo_content(
        video_id=response.id
    )
    
    # Save to file
    with open("generated_video.mp4", "wb") as f:
        f.write(video_bytes)

asyncio.run(test_async_video())
```

### 查询视频状态

```python
from litellm import video_status

status_response = video_status(
    video_id="video_1234567890"
)

print(f"Video Status: {status_response.status}")
print(f"Created At: {status_response.created_at}")
print(f"Model: {status_response.model}")
```

### 列出视频

列出视频时需要显式指定提供商，因为没有 video_id 可以用来解码：

```python
from litellm import video_list

# List videos from OpenAI
videos = video_list(custom_llm_provider="openai")

for video in videos:
    print(f"Video ID: {video['id']}")
```

### 使用参考图生成视频

```python
from litellm import video_generation

# Video generation with reference image
response = video_generation(
    model="openai/sora-2",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    input_reference=open("path/to/image.jpg", "rb"),  # Reference image as file object
    seconds="8",
    size="720x1280"
)

print(f"Video ID: {response.id}")
```

### 视频混剪（视频编辑）

```python
from litellm import video_remix

# Remix an existing video by its ID with a new prompt
response = video_remix(
    video_id="video_1234567890",
    prompt="Make the cat jump higher",
    custom_llm_provider="openai"
)

print(f"Video ID: {response.id}")
```

### 可选参数

```python
response = video_generation(
    model="openai/sora-2",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    seconds="8",                    # Video duration in seconds
    size="720x1280",               # Video dimensions
    input_reference=open("path/to/image.jpg", "rb"),  # Reference image as file object
    user="user_123"                # User identifier for tracking
)
```

### Azure 视频生成

```python
from litellm import video_generation
import os

os.environ["AZURE_OPENAI_API_KEY"] = "your-azure-api-key"
os.environ["AZURE_OPENAI_API_BASE"] = "https://your-resource.openai.azure.com/"
os.environ["AZURE_OPENAI_API_VERSION"] = "2024-02-15-preview"

response = video_generation(
    model="azure/sora-2",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    seconds="8",
    size="720x1280"
)

print(f"Video ID: {response.id}")
```

## **LiteLLM 代理用法**

LiteLLM 提供与 OpenAI API 兼容的视频端点，覆盖完整的视频生成流程：

- `/videos` - 生成新视频
- `/videos/remix` - 使用参考图像编辑已有视频  
- `/videos/status` - 查询视频生成状态
- `/videos/retrieval` - 下载已完成的视频

**配置**

将以下内容添加到 litellm 代理的 config.yaml 中

```yaml
model_list:
  - model_name: sora-2
    litellm_params:
      model: openai/sora-2
      api_key: os.environ/OPENAI_API_KEY
  - model_name: azure-sora-2
    litellm_params:
      model: azure/sora-2
      api_key: os.environ/AZURE_OPENAI_API_KEY
      api_base: os.environ/AZURE_OPENAI_API_BASE
```

启动 litellm

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

测试视频生成请求

```bash
curl --location 'http://localhost:4000/v1/videos' \
--header 'Content-Type: application/json' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>' \
--data '{
    "model": "sora-2",
    "prompt": "A beautiful sunset over the ocean"
}'
```

测试视频状态查询请求

```bash
curl --location 'http://localhost:4000/v1/videos/{video_id}' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>'
```

测试视频下载请求

```bash
curl --location 'http://localhost:4000/v1/videos/{video_id}/content' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>' \
--output video.mp4
```

测试视频混剪请求

```bash
curl --location --request POST 'http://localhost:4000/v1/videos/{video_id}/remix' \
--header 'Content-Type: application/json' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>' \
--data '{
    "prompt": "New remix instructions"
}'
```

测试视频列表请求（需要指定 custom_llm_provider）

```bash
# Note: video_list requires custom_llm_provider since there's no video_id to decode from
curl --location 'http://localhost:4000/v1/videos?custom_llm_provider=openai' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>'

# Or using header
curl --location 'http://localhost:4000/v1/videos' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>' \
--header 'custom-llm-provider: azure'
```

### 角色、编辑与扩展端点

LiteLLM 代理还支持以下与 OpenAI 兼容的视频路由：

- `POST /v1/videos/characters`
- `GET /v1/videos/characters/{character_id}`
- `POST /v1/videos/edits`
- `POST /v1/videos/extensions`

#### 路由行为（`target_model_names`、编码 ID 与提供商覆盖）

- `POST /v1/videos/characters` 支持 `target_model_names`，用法与 `POST /v1/videos` 相同。
- 创建角色时如果提供了 `target_model_names`，LiteLLM 会在返回的 `character_id` 中编码路由元数据。
- `GET /v1/videos/characters/{character_id}` 可以直接接受编码后的角色 ID。LiteLLM 会在内部解码该 ID，并使用正确的模型/提供商元数据进行路由。
- `POST /v1/videos/edits` 与 `POST /v1/videos/extensions` 两者都支持：
  - 普通的 `video.id`
  - LiteLLM 返回的编码版 `video.id`
- `custom_llm_provider` 的传递方式与其他代理端点相同：
  - 请求头：`custom-llm-provider`
  - 查询参数：`?custom_llm_provider=...`
  - 请求体：`custom_llm_provider`（适用时也可用 `extra_body.custom_llm_provider`）

#### 使用 `target_model_names` 创建角色

```bash
curl --location 'http://localhost:4000/v1/videos/characters' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
-F 'name=hero' \
-F 'target_model_names={{openai_large}}' \
-F 'video=@/path/to/character.mp4'
```

响应示例（编码后的 `id`）：

```json
{
  "id": "character_...",
  "object": "character",
  "created_at": 1712697600,
  "name": "hero"
}
```

#### 使用编码后的 `character_id` 获取角色

```bash
curl --location 'http://localhost:4000/v1/videos/characters/character_...' \
--header "Authorization: Bearer $LITELLM_API_KEY"
```

#### 使用编码后的 `video.id` 编辑视频

```bash
curl --location 'http://localhost:4000/v1/videos/edits' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
  "prompt": "Make this brighter",
  "video": { "id": "video_..." }
}'
```

#### 通过 `extra_body` 覆盖提供商进行视频扩展

```bash
curl --location 'http://localhost:4000/v1/videos/extensions' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
  "prompt": "Continue this scene",
  "seconds": "4",
  "video": { "id": "video_..." },
  "extra_body": { "custom_llm_provider": "openai" }
}'
```

测试 Azure 视频生成请求

```bash
curl http://localhost:4000/v1/videos \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-sora-2",
    "prompt": "A cat playing with a ball of yarn in a sunny garden",
    "seconds": "8",
    "size": "720x1280"
  }'
```

## **在 LiteLLM 代理上使用 OpenAI 客户端**

你可以使用标准的 OpenAI Python 客户端来调用 LiteLLM 的视频端点。这样既保留了熟悉的接口形式，又能享受 LiteLLM 的提供商抽象与代理特性。

### 配置

首先，让 OpenAI 客户端指向你的 LiteLLM 代理：

```python
from openai import OpenAI

# Point the OpenAI client to your LiteLLM proxy
client = OpenAI(
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM proxy API key
    base_url="http://localhost:4000/v1"  # Your LiteLLM proxy URL
)
```

### 视频生成

使用 OpenAI 客户端接口生成新视频：

```python
# Basic video generation
response = client.videos.create(
    model="sora-2",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    seconds=8,
    size="720x1280"
)

print(f"Video ID: {response.id}")
print(f"Status: {response.status}")
```

### 使用参考图生成视频

使用参考图像创建视频：

```python
# Video generation with reference image
response = client.videos.create(
    model="sora-2",
    prompt="Add clouds to the video",
    seconds=4,
    input_reference=open("/path/to/your/image.jpg", "rb")
)

print(f"Video ID: {response.id}")
print(f"Status: {response.status}")
```

### 查询视频状态

查询视频生成任务的进度：

```python
# Check video status
status_response = client.videos.retrieve(
    video_id="video_6900378779308191a7359266e59b53fc01cd6bbd27a70763"
)

print(f"Status: {status_response.status}")
print(f"Progress: {status_response.progress}%")

# Poll until completion
import time

while status_response.status not in ["completed", "failed"]:
    time.sleep(10)  # Wait 10 seconds
    status_response = client.videos.retrieve(
        video_id="video_6900378779308191a7359266e59b53fc01cd6bbd27a70763"
    )
    print(f"Current status: {status_response.status}")
```

### 列出视频

获取你的视频列表：

```python
# List all videos
videos = client.videos.list()

for video in videos.data:
    print(f"Video ID: {video.id}, Status: {video.status}")
```

### 下载视频内容

下载已完成的视频：

```python
# Download video content
response = client.videos.download_content(
    video_id="video_68fa2938848c8190bb718f977503aba6092ab18d68938fed"
)

# Save the video to file
with open("generated_video.mp4", "wb") as f:
    f.write(response.content)

print("Video downloaded successfully!")
```

### 视频混剪（编辑）

按新的指令编辑已有视频：

```python
# Remix/edit an existing video
response = client.videos.remix(
    video_id="video_68fa2574bdd88190873a8af06a370ff407094ddbc4bbb91b",
    prompt="Slow the cloud movement",
    seconds=8
)

print(f"Remix Video ID: {response.id}")
print(f"Status: {response.status}")
```

### 完整流程示例

下面是一个展示完整视频生成流程的示例：

```python
from openai import OpenAI
import time

# Initialize client
client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000/v1"
)

# 1. Generate video
print("Generating video...")
response = client.videos.create(
    model="sora-2",
    prompt="A serene lake with mountains in the background",
    seconds=8,
    size="1280x720"
)

video_id = response.id
print(f"Video generation started. ID: {video_id}")

# 2. Poll for completion
print("Waiting for video to complete...")
while True:
    status = client.videos.retrieve(video_id=video_id)
    print(f"Status: {status.status}")
    
    if status.status == "completed":
        print("Video generation completed!")
        break
    elif status.status == "failed":
        print("Video generation failed!")
        break
    
    time.sleep(10)

# 3. Download video
if status.status == "completed":
    print("Downloading video...")
    video_content = client.videos.download_content(video_id=video_id)
    
    with open(f"video_{video_id}.mp4", "wb") as f:
        f.write(video_content.content)
    
    print("Video saved successfully!")

# 4. Optional: Remix the video
print("Creating a remix...")
remix_response = client.videos.remix(
    video_id=video_id,
    prompt="Add gentle ripples to the lake surface"
)

print(f"Remix started. ID: {remix_response.id}")
```

## **请求/响应格式**

:::info

LiteLLM 遵循 **OpenAI 视频生成 API 规范**。

完整细节请参阅 [OpenAI 视频生成官方文档](https://platform.openai.com/docs/guides/video-generation)。

:::

### 请求示例

```python
{
    "model": "openai/sora-2",
    "prompt": "A cat playing with a ball of yarn in a sunny garden",
    "seconds": "8",
    "size": "720x1280",
    "user": "user_123"
}
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `model` | string | 是 | 要使用的视频生成模型（如 `"openai/sora-2"`） |
| `prompt` | string | 是 | 对目标视频的文字描述 |
| `seconds` | string | 否 | 视频时长（秒），如 "8"、"16" |
| `size` | string | 否 | 视频尺寸，如 "720x1280"、"1280x720" |
| `input_reference` | file object | 否 | 用于视频生成的参考图像（混剪不支持） |
| `user` | string | 否 | 用于追踪的用户标识 |
| `video_id` | string | 是（status/retrieval） | 用于状态查询或下载的视频 ID |

#### 视频生成请求示例

**视频生成**：
```json
{
  "model": "sora-2",
  "prompt": "A cat playing with a ball of yarn in a sunny garden",
  "seconds": "8",
  "size": "720x1280"
}
```

**带参考图像的视频生成**：
```python
{
  "model": "sora-2",
  "prompt": "A cat playing with a ball of yarn in a sunny garden",
  "input_reference": open("path/to/image.jpg", "rb"),  # File object
  "seconds": "8",
  "size": "720x1280"
}
```

**查询视频状态**：
```json
{
  "video_id": "video_1234567890",
  "model": "sora-2"
}
```

**下载视频**：
```json
{
  "video_id": "video_1234567890",
  "model": "sora-2"
}
```

### 响应格式

响应遵循 OpenAI 的视频生成格式，结构如下：

```json
{
    "id": "video_6900378779308191a7359266e59b53fc01cd6bbd27a70763",
    "object": "video",
    "status": "queued",
    "created_at": 1761621895,
    "completed_at": null,
    "expires_at": null,
    "error": null,
    "progress": 0,
    "remixed_from_video_id": null,
    "seconds": "4",
    "size": "720x1280",
    "model": "sora-2",
    "usage": {
        "duration_seconds": 4.0
    }
}
```

#### 响应字段

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `id` | string | 视频的唯一标识 |
| `object` | string | 视频响应中固定为 `"video"` |
| `status` | string | 视频处理状态（`"queued"`、`"processing"`、`"completed"`） |
| `created_at` | integer | 视频创建时间的 Unix 时间戳 |
| `model` | string | 用于视频生成的模型 |
| `size` | string | 视频尺寸 |
| `seconds` | string | 视频时长（秒） |
| `usage` | object | Token 用量与时长信息 |


## **支持的提供商**

| 提供商    | 用法链接      |
|-------------|--------------------|
| OpenAI      |   [用法](providers/openai/videos)  |
| Azure       |   [用法](providers/azure/videos)   |
| Gemini       |   [用法](providers/gemini/videos)   |
| Vertex AI   |   [用法](providers/vertex_ai/videos) |
| RunwayML    |   [用法](providers/runwayml/videos) |
| QwenCloud / Qianwen AI Platform / DashScope | [用法](providers/qwencloud#视频生成) |
