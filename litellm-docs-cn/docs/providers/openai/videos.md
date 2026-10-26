import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI 视频生成

LiteLLM 支持 OpenAI 的视频生成模型，包括 Sora。

## 快速上手

### 所需 API 密钥

```python
import os 
os.environ["OPENAI_API_KEY"] = "your-api-key"
```

### 基本用法

```python
from litellm import video_generation, video_content
import os

os.environ["OPENAI_API_KEY"] = "your-api-key"

# Generate a video
response = video_generation(
    prompt="A cat playing with a ball of yarn in a sunny garden",
    model="sora-2",
    seconds="8",
    size="720x1280"
)

print(f"Video ID: {response.id}")
print(f"Status: {response.status}")

# Download video content when ready
video_bytes = video_content(
    video_id=response.id,
)

# Save to file
with open("generated_video.mp4", "wb") as f:
    f.write(video_bytes)
```

## **LiteLLM 代理用法**

LiteLLM 提供与 OpenAI API 兼容的视频端点，覆盖完整的视频生成流程：

- `POST /v1/videos` - 生成新视频
- `GET /v1/videos/{video_id}` - 查询视频生成状态
- `GET /v1/videos/{video_id}/content` - 下载已完成的视频
- `POST /v1/videos/{video_id}/remix` - 以新提示词对现有视频进行 remix

每条路由也提供不带 `/v1` 前缀的访问方式。

**配置**

将以下内容加入 litellm 代理的 config.yaml：

```yaml
model_list:
  - model_name: sora-2
    litellm_params:
      model: openai/sora-2
      api_key: os.environ/OPENAI_API_KEY
```

启动 litellm

```bash
litellm --config /path/to/config.yaml

# 服务运行于 http://0.0.0.0:4000
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

测试视频状态请求

```bash
# 使用 custom-llm-provider 请求头
curl --location 'http://localhost:4000/v1/videos/video_id' \
--header 'Accept: application/json' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>' \
--header 'custom-llm-provider: openai'
```

测试视频获取请求

```bash
# 使用 custom-llm-provider 请求头
curl --location 'http://localhost:4000/v1/videos/video_id/content' \
--header 'Accept: application/json' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>' \
--header 'custom-llm-provider: openai' \
--output video.mp4

# 或使用查询参数
curl --location 'http://localhost:4000/v1/videos/video_id/content?custom_llm_provider=openai' \
--header 'Accept: application/json' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>' \
--output video.mp4
```

测试视频 remix 请求

```bash
# 在请求体中使用 custom_llm_provider
curl --location --request POST 'http://localhost:4000/v1/videos/video_id/remix' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>' \
--data '{
    "prompt": "New remix instructions",
    "custom_llm_provider": "openai"
}'

# 或使用 custom-llm-provider 请求头
curl --location --request POST 'http://localhost:4000/v1/videos/video_id/remix' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>' \
--header 'custom-llm-provider: openai' \
--data '{
    "prompt": "New remix instructions"
}'
```

### 角色、编辑与扩展路由

LiteLLM 代理支持的 OpenAI 视频路由：

- `POST /v1/videos/characters`
- `GET /v1/videos/characters/{character_id}`
- `POST /v1/videos/edits`
- `POST /v1/videos/extensions`

#### 角色创建支持 `target_model_names`

`POST /v1/videos/characters` 支持 `target_model_names`，可按模型路由（与视频创建行为一致）。

```bash
curl --location 'http://localhost:4000/v1/videos/characters' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
-F 'name=hero' \
-F 'target_model_names={{openai_large}}' \
-F 'video=@/path/to/character.mp4'
```

使用 `target_model_names` 时，LiteLLM 会返回一个编码后的角色 ID：

```json
{
  "id": "character_...",
  "object": "character",
  "created_at": 1712697600,
  "name": "hero"
}
```

查询时直接使用这个编码后的 ID 即可：

```bash
curl --location 'http://localhost:4000/v1/videos/characters/character_...' \
--header "Authorization: Bearer $LITELLM_API_KEY"
```

#### 编辑与扩展的编码及非编码视频 ID

编辑与扩展两个路由都接受普通或编码形式的 `video.id`：

- `POST /v1/videos/edits`
- `POST /v1/videos/extensions`

```bash
curl --location 'http://localhost:4000/v1/videos/edits' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
  "prompt": "Make this brighter",
  "video": { "id": "video_..." }
}'
```

```bash
curl --location 'http://localhost:4000/v1/videos/extensions' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
  "prompt": "Continue this scene",
  "seconds": "4",
  "video": { "id": "video_..." }
}'
```

#### `custom_llm_provider` 的输入来源

对于这些路由，`custom_llm_provider` 可通过以下方式提供：

- 请求头：`custom-llm-provider`
- 查询参数：`?custom_llm_provider=...`
- 请求体：`custom_llm_provider`（在支持的情况下也可用 `extra_body.custom_llm_provider`）

测试 OpenAI 视频生成请求

```bash
curl http://localhost:4000/v1/videos \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sora-2",
    "prompt": "A cat playing with a ball of yarn in a sunny garden",
    "seconds": "8",
    "size": "720x1280"
  }'
```


## 支持的模型

| 模型名称 | 说明 | 最长时长 | 支持的尺寸 |
|------------|-------------|--------------|-----------------|
| sora-2 | OpenAI 最新的视频生成模型 | 8 秒 | 720x1280、1280x720 |

## 视频生成参数

- `prompt`（必填）：期望视频的文字描述
- `model`（可选）：使用的模型，默认为 "sora-2"
- `seconds`（可选）：视频时长（秒），例如 "8"、"16"
- `size`（可选）：视频尺寸，例如 "720x1280"、"1280x720"
- `input_reference`（可选）：用于视频编辑的参考图
- `user`（可选）：用于追踪的用户标识

## 获取视频内容

```python
# Download video content
video_bytes = video_content(
    video_id="video_1234567890"
)

# Save to file
with open("video.mp4", "wb") as f:
    f.write(video_bytes)
```

## 完整工作流

```python
import litellm
import time

def generate_and_download_video(prompt):
    # Step 1: Generate video
    response = litellm.video_generation(
        prompt=prompt,
        model="sora-2",
        seconds="8",
        size="720x1280"
    )
    
    video_id = response.id
    print(f"Video ID: {video_id}")
    
    # Step 2: Wait for processing (in practice, poll status)
    time.sleep(30)
    
    # Step 3: Download video
    video_bytes = litellm.video_content(
        video_id=video_id
    )
    
    # Step 4: Save to file
    with open(f"video_{video_id}.mp4", "wb") as f:
        f.write(video_bytes)
    
    return f"video_{video_id}.mp4"

# Usage
video_file = generate_and_download_video(
    "A cat playing with a ball of yarn in a sunny garden"
)
```


## 使用参考图编辑视频

```python
# Video editing with reference image
response = litellm.video_generation(
    prompt="Make the cat jump higher",
    input_reference=open("path/to/image.jpg", "rb"),  # Reference image
    model="sora-2",
    seconds="8"
)

print(f"Video ID: {response.id}")
```

## 错误处理

```python
from litellm.exceptions import BadRequestError, AuthenticationError

try:
    response = video_generation(
        prompt="A cat playing with a ball of yarn"
    )
except AuthenticationError as e:
    print(f"Authentication failed: {e}")
except BadRequestError as e:
    print(f"Bad request: {e}")
```
