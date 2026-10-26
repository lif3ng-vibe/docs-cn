import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex AI 视频生成（Veo）

LiteLLM 通过统一的 OpenAI 视频 API 接口，支持 Vertex AI 的 Veo 视频生成模型。

| 属性 | 说明 |
|-------|-------|
| 描述 | Google Cloud Vertex AI 的 Veo 视频生成模型 |
| LiteLLM 提供商路由 | `vertex_ai/` |
| 支持的模型 | `veo-2.0-generate-001`, `veo-3.0-generate-001`, `veo-3.0-fast-generate-001`, `veo-3.1-generate-preview`, `veo-3.1-fast-generate-preview`, `veo-3.1-lite-generate-001` |
| 成本追踪 | ✅ 按时长计价；在 Google 提供分档定价的模型上（Veo 3.1 Lite）区分 720p 与 1080p 两档 |
| 日志支持 | ✅ 完整的请求/响应日志 |
| 代理服务器支持 | ✅ 完整的代理集成，支持虚拟密钥（virtual key） |
| 花费管理 | ✅ 预算追踪与限流 |
| 提供商文档 | [Vertex AI Veo 文档 ↗](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation) |

## 快速上手

### 必需的环境配置

```python
import json
import os

os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

# Option 1: Point to a service account file
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/path/to/service_account.json"

# Option 2: Store the service account JSON directly
with open("/path/to/service_account.json", "r", encoding="utf-8") as f:
    os.environ["VERTEXAI_CREDENTIALS"] = f.read()
```

### 基本用法

```python
from litellm import video_generation, video_status, video_content
import json
import os
import time

with open("/path/to/service_account.json", "r", encoding="utf-8") as f:
    vertex_credentials = f.read()

response = video_generation(
    model="vertex_ai/veo-3.0-generate-001",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    vertex_project="your-gcp-project-id",
    vertex_location="us-central1",
    vertex_credentials=vertex_credentials,
    seconds="8",
    size="1280x720",
)

print(f"Video ID: {response.id}")
print(f"Initial Status: {response.status}")

# Poll for completion
while True:
    status = video_status(
        video_id=response.id,
        vertex_project="your-gcp-project-id",
        vertex_location="us-central1",
        vertex_credentials=vertex_credentials,
    )

    print(f"Current Status: {status.status}")

    if status.status == "completed":
        break
    if status.status == "failed":
        raise RuntimeError("Video generation failed")

    time.sleep(10)

# Download the rendered video
video_bytes = video_content(
    video_id=response.id,
    vertex_project="your-gcp-project-id",
    vertex_location="us-central1",
    vertex_credentials=vertex_credentials,
)

with open("generated_video.mp4", "wb") as f:
    f.write(video_bytes)
```

## 支持的模型

| 模型名 | 说明 | 最大时长 | 状态 |
|------------|-------------|--------------|--------|
| veo-2.0-generate-001 | Veo 2.0 视频生成 | 5 秒 | GA |
| veo-3.0-generate-001 | Veo 3.0 高质量 | 8 秒 | GA |
| veo-3.0-fast-generate-001 | Veo 3.0 快速生成 | 8 秒 | GA |
| veo-3.1-generate-preview | Veo 3.1 高质量 | 10 秒 | Preview |
| veo-3.1-fast-generate-preview | Veo 3.1 快速 | 10 秒 | Preview |
| veo-3.1-lite-generate-001 | Veo 3.1 Lite，成本最低的档位，输出 720p 或 1080p | 8 秒 | Preview |

Veo 3.1 Lite 按输出秒数计价，720p 每秒 $0.05，1080p 每秒 $0.08；除非请求明确要求 1080p，否则 Veo 一律渲染 720p。如何通过 OpenAI 的 `size` 参数请求 1080p，见 [size 与分辨率对照](#size-与分辨率对照)。

## 视频生成参数

LiteLLM 会自动把 OpenAI 风格的参数转换成 Veo 的 API 格式：

| OpenAI 参数 | Vertex AI 参数 | 说明 | 示例 |
|------------------|---------------------|-------------|---------|
| `prompt` | `instances[].prompt` | 视频的文字描述 | "A cat playing" |
| `size` | `parameters.aspectRatio`，带 1080p 价格档位的模型还会加上 `parameters.resolution` | 转换为 `16:9` 或 `9:16`；在按分辨率计价的模型上还会转换为 `720p` 或 `1080p` | "1920x1080" → `16:9` 和 `1080p` |
| `seconds` | `parameters.durationSeconds` | 片段时长（秒） | "8" → `8` |
| `input_reference` | `instances[].image` | 用于驱动动画的参考图 | `open("image.jpg", "rb")` |
| 提供商专属参数 | `extra_body` | 原样转发给 Vertex API | `{"negativePrompt": "blurry"}` |

### size 与宽高比对照

- `1280x720`, `1920x1080` → `16:9`
- `720x1280`, `1080x1920` → `9:16`
- 未知尺寸默认取 `16:9`

### size 与分辨率对照

Veo 依据自己的 `resolution` 参数决定输出分辨率，而不是看宽高比，所以只设置 `aspectRatio` 的 `1920x1080` 请求，返回的仍是 720p。对 LiteLLM 定价中单列 1080p 费率的模型（目前是 `veo-3.1-lite-generate-001`），LiteLLM 还会从 `size` 推断 `resolution`：

| `size` | 发送的 `aspectRatio` | 发送的 `resolution` |
|--------|--------------------|-------------------|
| `1280x720` | `16:9` | `720p` |
| `720x1280` | `9:16` | `720p` |
| `1920x1080` | `16:9` | `1080p` |
| `1080x1920` | `9:16` | `1080p` |

其他任何 `size` 取值都只映射宽高比，分辨率交由 Veo 的默认行为决定。没有 1080p 价格档位的模型（Veo 2.0、Veo 3.0 以及其余 Veo 3.1 变体）永远不会被推断出 `resolution`，请求保持原样。自己传入 `resolution` 时（无论是顶层参数还是放进 `extra_body`），它的优先级始终高于从 `size` 推断出的值。

```bash
curl --location 'http://0.0.0.0:4000/v1/videos' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
  "model": "veo-3.1-lite-generate-001",
  "prompt": "A slow aerial shot of a lighthouse at sunrise",
  "seconds": "8",
  "size": "1920x1080"
}'
```

响应中的 `usage` 会报告所请求的分辨率，花费日志也按该档位计价：

```json
{"duration_seconds": 8.0, "video_resolution": "1080p"}
```

因此一段 8 秒的 Veo 3.1 Lite 片段，`1280x720` 下花费 $0.40，`1920x1080` 下花费 $0.64。

## 异步用法

```python
from litellm import avideo_generation, avideo_status, avideo_content
import asyncio
import json

with open("/path/to/service_account.json", "r", encoding="utf-8") as f:
    vertex_credentials = f.read()


async def workflow():
    response = await avideo_generation(
        model="vertex_ai/veo-3.1-generate-preview",
        prompt="Slow motion water droplets splashing into a pool",
        seconds="10",
        vertex_project="your-gcp-project-id",
        vertex_location="us-central1",
        vertex_credentials=vertex_credentials,
    )

    while True:
        status = await avideo_status(
            video_id=response.id,
            vertex_project="your-gcp-project-id",
            vertex_location="us-central1",
            vertex_credentials=vertex_credentials,
        )

        if status.status == "completed":
            break
        if status.status == "failed":
            raise RuntimeError("Video generation failed")

        await asyncio.sleep(10)

    video_bytes = await avideo_content(
        video_id=response.id,
        vertex_project="your-gcp-project-id",
        vertex_location="us-central1",
        vertex_credentials=vertex_credentials,
    )

    with open("veo_water.mp4", "wb") as f:
        f.write(video_bytes)

asyncio.run(workflow())
```

## LiteLLM 代理用法

在 `config.yaml` 中添加 Veo 模型：

```yaml
model_list:
  - model_name: veo-3
    litellm_params:
      model: vertex_ai/veo-3.0-generate-001
      vertex_project: os.environ/VERTEXAI_PROJECT
      vertex_location: os.environ/VERTEXAI_LOCATION
      vertex_credentials: os.environ/VERTEXAI_CREDENTIALS
```

启动代理并发起请求：

<Tabs>
<TabItem value="curl" label="Curl">

```bash
# Step 1: Generate video
curl --location 'http://0.0.0.0:4000/videos' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
  "model": "veo-3",
  "prompt": "Aerial shot over a futuristic city at sunrise",
  "seconds": "8"
}'

# Step 2: Poll status
curl --location 'http://localhost:4000/v1/videos/{video_id}' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>'

# Step 3: Download video
curl --location 'http://localhost:4000/v1/videos/{video_id}/content' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>' \
--output video.mp4
```

</TabItem>
<TabItem value="python" label="Python SDK">

```python
import litellm

litellm.api_base = "http://0.0.0.0:4000"
litellm.api_key = "sk-<your-litellm-api-key>"

response = litellm.video_generation(
    model="veo-3",
    prompt="Aerial shot over a futuristic city at sunrise",
)

status = litellm.video_status(video_id=response.id)
while status.status not in ["completed", "failed"]:
    status = litellm.video_status(video_id=response.id)

if status.status == "completed":
    content = litellm.video_content(video_id=response.id)
    with open("veo_city.mp4", "wb") as f:
        f.write(content)
```

</TabItem>
</Tabs>

## 成本追踪

LiteLLM 会记录 Veo 返回的时长，方便你套用按时长计费的费率。

```python
with open("/path/to/service_account.json", "r", encoding="utf-8") as f:
    vertex_credentials = f.read()

response = video_generation(
    model="vertex_ai/veo-2.0-generate-001",
    prompt="Flowers blooming in fast forward",
    seconds="5",
    vertex_project="your-gcp-project-id",
    vertex_location="us-central1",
    vertex_credentials=vertex_credentials,
)

print(response.usage)  # {"duration_seconds": 5.0}
```

对按分辨率计价的模型，`usage` 还会带上 `video_resolution`（`720p` 或 `1080p`），成本按该档位的每秒费率计算，详见 [size 与分辨率对照](#size-与分辨率对照)。

## 故障排查

- **`vertex_project is required`**：设置 `VERTEXAI_PROJECT` 环境变量，或在请求中传入 `vertex_project`。
- **`Permission denied`**：确认服务账号已拥有 `Vertex AI User` 角色，并已启用正确的区域。
- **视频卡在 `processing`**：Veo 的操作耗时较长。请保持每 10–15 秒轮询一次，最多等约 10 分钟。

## 另请参阅

- [OpenAI 视频生成](../openai/videos.md)
- [Azure 视频生成](../azure/videos.md)
- [Gemini 视频生成](../gemini/videos.md)
- [视频生成 API 参考](/docs/videos)
