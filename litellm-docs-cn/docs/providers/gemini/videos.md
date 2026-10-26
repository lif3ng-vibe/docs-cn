import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gemini 视频生成（Veo）

LiteLLM 通过统一的 API 接口支持 Google 的 Veo 视频生成模型。

| 属性 | 说明 |
|-------|-------|
| 描述 | Google 的 Veo AI 视频生成模型 |
| LiteLLM 提供商（provider）路由 | `gemini/` |
| 支持的模型 | Veo 3.0 / 3.1 的预览版与正式版 ID（见下表），包括 **Veo 3.1 Lite** |
| 成本追踪（cost tracking） | ✅ 按时长计价；模型目录中列出分辨率档位时，还支持可选的**按分辨率**定价（如 720p 与 1080p） |
| 日志支持 | ✅ 完整的请求/响应日志 |
| 代理服务器支持 | ✅ 完整的代理集成，支持虚拟密钥（virtual key） |
| 花费管理 | ✅ 预算追踪与速率限制 |
| 提供商文档链接 | [Google Veo 文档 ↗](https://ai.google.dev/gemini-api/docs/video) |

## 快速上手

### 所需的 API 密钥

```python
import os 
os.environ["GEMINI_API_KEY"] = "your-google-api-key"
# OR
os.environ["GOOGLE_API_KEY"] = "your-google-api-key"
```

### 基本用法

```python
from litellm import video_generation, video_status, video_content
import os
import time

os.environ["GEMINI_API_KEY"] = "your-google-api-key"

# Step 1: Generate video
response = video_generation(
    model="gemini/veo-3.0-generate-preview",
    prompt="A cat playing with a ball of yarn in a sunny garden"
)

print(f"Video ID: {response.id}")
print(f"Initial Status: {response.status}")  # "processing"

# Step 2: Poll for completion
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

# Step 3: Download video content
video_bytes = video_content(
    video_id=response.id
)

# Save to file
with open("generated_video.mp4", "wb") as f:
    f.write(video_bytes)

print("Video downloaded successfully!")
```

## 支持的模型

| 模型名 | 说明 | 最大时长 | 状态 |
|------------|-------------|--------------|--------|
| veo-3.0-generate-preview | Veo 3.0 视频生成 | 8 秒 | 预览版 |
| veo-3.1-generate-preview | Veo 3.1 视频生成 | 8 秒 | 预览版 |
| veo-3.1-lite-generate-preview | Veo 3.1 **Lite**（更具性价比；参见 [Gemini 定价](https://ai.google.dev/gemini-api/docs/video)） | 以 Google 文档为准 | 预览版 |
| veo-3.1-fast-generate-preview / `…-001` | 更快的版本 / 正式版变体 | 以 Google 文档为准 | 预览版 / GA |
| veo-3.1-generate-001 | Veo 3.1 正式版 | 以 Google 文档为准 | GA |

使用带 `gemini/` 前缀的完整 LiteLLM 模型 ID（例如 `gemini/veo-3.1-lite-generate-preview`）。

## 视频生成参数

LiteLLM 会自动把 OpenAI 风格的参数映射为 Veo 的格式：

| OpenAI 参数 | Veo 参数 | 说明 | 示例 |
|------------------|---------------|-------------|---------|
| `prompt` | `prompt` | 视频的文字描述 | "A cat playing" |
| `size` | `aspectRatio`，适用时还包括 **`resolution`** | 标准宽高值会映射为横屏/竖屏，**并且**映射为 API 的 `720p` 或 `1080p` | 见下文 |
| `seconds` | `durationSeconds` | 时长（秒） | "8" → 8 |
| `input_reference` | `image` | 用于生成动态效果的参考图片 | 文件对象或路径 |
| `model` | `model` | 要使用的模型 | "gemini/veo-3.0-generate-preview" |

### `size` 与输出分辨率

传入**标准 `size`** 字符串时，LiteLLM 会同时设置：

- **宽高比**（`16:9` 或 `9:16`）：与之前一致。
- **输出分辨率**（`720p` 或 `1080p`）：预设能明确高度时一并设置，因此无需额外字段即可请求到正确的 Veo 档位。

| `size` | 宽高比 | 发送给 Veo 的分辨率 |
|--------|----------------|-------------------------|
| `1280x720`, `720x1280` | `16:9` / `9:16` | `720p` |
| `1920x1080`, `1080x1920` | `16:9` / `9:16` | `1080p` |

其他 `size` 取值仍会映射出宽高比（未知时默认 `16:9`）；分辨率则保持 **Google 默认值**，除非你自行设置。

如果需要的显式取值与上述预设不匹配，也可以直接传入 Veo 的 **`resolution`**（例如通过 `extra_body`）。自行设置 `resolution` 时，其优先级高于从 `size` 推断出的值。

### size 与宽高比对照（参考）

- `"1280x720"`, `"1920x1080"` → `"16:9"`（横屏）
- `"720x1280"`, `"1080x1920"` → `"9:16"`（竖屏）

### 支持的 Veo 参数

基于 Veo 的 API：
- **prompt**（必填）：视频的文字描述，可附带音频提示
- **aspectRatio**：`"16:9"`（默认）或 `"9:16"`
- **resolution**：`"720p"`（默认）或 `"1080p"`（仅 Veo 3.1 支持，且仅限 16:9 宽高比）
- **durationSeconds**：视频时长（大多数模型最长 8 秒）
- **image**：用于生成动画的参考图片
- **negativePrompt**：希望从视频中排除的内容（Veo 3.1）
- **referenceImages**：风格与内容参考（仅 Veo 3.1 支持）

## 完整工作流示例

```python
import litellm
import time

def generate_and_download_veo_video(
    prompt: str, 
    output_file: str = "video.mp4",
    size: str = "1280x720",
    seconds: str = "8"
):
    """
    Complete workflow for Veo video generation.
    
    Args:
        prompt: Text description of the video
        output_file: Where to save the video
        size: Video dimensions (e.g., "1280x720" for 16:9)
        seconds: Duration in seconds
        
    Returns:
        bool: True if successful
    """
    print(f"🎬 Generating video: {prompt}")
    
    # Step 1: Initiate generation
    response = litellm.video_generation(
        model="gemini/veo-3.0-generate-preview",
        prompt=prompt,
        size=size,      # Maps to aspectRatio
        seconds=seconds  # Maps to durationSeconds
    )
    
    video_id = response.id
    print(f"✓ Video generation started (ID: {video_id})")
    
    # Step 2: Wait for completion
    max_wait_time = 600  # 10 minutes
    start_time = time.time()
    
    while time.time() - start_time < max_wait_time:
        status_response = litellm.video_status(video_id=video_id)
        
        if status_response.status == "completed":
            print("✓ Video generation completed!")
            break
        elif status_response.status == "failed":
            print("✗ Video generation failed")
            return False
        
        print(f"⏳ Status: {status_response.status}")
        time.sleep(10)
    else:
        print("✗ Timeout waiting for video generation")
        return False
    
    # Step 3: Download video
    print("⬇️  Downloading video...")
    video_bytes = litellm.video_content(video_id=video_id)
    
    with open(output_file, "wb") as f:
        f.write(video_bytes)
    
    print(f"✓ Video saved to {output_file}")
    return True

# Use it
generate_and_download_veo_video(
    prompt="A serene lake at sunset with mountains in the background",
    output_file="sunset_lake.mp4"
)
```

## 异步用法

```python
from litellm import avideo_generation, avideo_status, avideo_content
import asyncio

async def async_video_workflow():
    # Generate video
    response = await avideo_generation(
        model="gemini/veo-3.0-generate-preview",
        prompt="A cat playing with a ball of yarn"
    )
    
    # Poll for completion
    while True:
        status = await avideo_status(video_id=response.id)
        if status.status == "completed":
            break
        await asyncio.sleep(10)
    
    # Download content
    video_bytes = await avideo_content(video_id=response.id)
    
    with open("video.mp4", "wb") as f:
        f.write(video_bytes)

# Run it
asyncio.run(async_video_workflow())
```

## LiteLLM 代理用法

### 配置

在 `config.yaml` 中添加 Veo 模型：

```yaml
model_list:
  - model_name: veo-3
    litellm_params:
      model: gemini/veo-3.0-generate-preview
      api_key: os.environ/GEMINI_API_KEY
```

启动代理：

```bash
litellm --config config.yaml
# Server running on http://0.0.0.0:4000
```

### 发起请求

<Tabs>
<TabItem value="curl" label="Curl">

```bash
# Step 1: Generate video
curl --location 'http://0.0.0.0:4000/v1/videos' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "veo-3",
    "prompt": "A cat playing with a ball of yarn in a sunny garden"
}'

# Response: {"id": "gemini::operations/generate_12345::...", "status": "processing", ...}

# Step 2: Check status
curl --location 'http://localhost:4000/v1/videos/{video_id}' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>'

# Step 3: Download video (when status is "completed")
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

# Generate video
response = litellm.video_generation(
    model="veo-3",
    prompt="A cat playing with a ball of yarn in a sunny garden"
)

# Check status
import time
while True:
    status = litellm.video_status(video_id=response.id)
    if status.status == "completed":
        break
    time.sleep(10)

# Download video
video_bytes = litellm.video_content(video_id=response.id)
with open("video.mp4", "wb") as f:
    f.write(video_bytes)
```

</TabItem>
</Tabs>

## 成本追踪与花费

LiteLLM 依据以下两点估算**视频花费**：

1. 生成片段的**计费时长**（以秒计）；  
2. 该模型在 LiteLLM 模型目录中的**每秒单价**（适用时与 [Google 的 Gemini API 视频定价](https://ai.google.dev/gemini-api/docs/video) 对齐）。

部分模型对 **720p** 与 **1080p** 收取**不同的每秒费率**。使用上述标准 `size` 预设（或显式设置 `resolution`）时，LiteLLM 会采用匹配的档位，使**代理花费、日志与预算**与你请求的分辨率保持一致。

LiteLLM 会自动追踪 Veo 视频生成的成本：

```python
response = litellm.video_generation(
    model="gemini/veo-3.0-generate-preview",
    prompt="A beautiful sunset"
)

# Cost is calculated based on video duration
# Veo pricing: ~$0.10 per second (estimated)
# Default video duration: ~5 seconds
# Estimated cost: ~$0.50
```

## 与 OpenAI 视频 API 的差异

| 特性 | OpenAI（Sora） | Gemini（Veo） |
|---------|---------------|--------------|
| 参考图片 | ✅ 支持 | ❌ 不支持 |
| 尺寸 / 分辨率 | ✅ 支持 | ✅ 支持，通过 `size` 映射为宽高比，预设覆盖时再加上 `720p`/`1080p` |
| 时长（`seconds`） | ✅ 支持 | ✅ 支持（映射为 `durationSeconds`；上限以 Google 文档为准） |
| 视频混剪 / 编辑 | ✅ 支持 | ❌ 不支持 |
| 视频列表 | ✅ 支持 | ❌ 不支持 |
| 基于提示词的生成 | ✅ 支持 | ✅ 支持 |
| 异步操作 | ✅ 支持 | ✅ 支持 |

## 错误处理

```python
from litellm import video_generation, video_status, video_content
from litellm.exceptions import APIError, Timeout

try:
    response = video_generation(
        model="gemini/veo-3.0-generate-preview",
        prompt="A beautiful landscape"
    )
    
    # Poll with timeout
    max_attempts = 60  # 10 minutes (60 * 10s)
    for attempt in range(max_attempts):
        status = video_status(video_id=response.id)
        
        if status.status == "completed":
            video_bytes = video_content(video_id=response.id)
            with open("video.mp4", "wb") as f:
                f.write(video_bytes)
            break
        elif status.status == "failed":
            raise APIError("Video generation failed")
        
        time.sleep(10)
    else:
        raise Timeout("Video generation timed out")
        
except APIError as e:
    print(f"API Error: {e}")
except Timeout as e:
    print(f"Timeout: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## 最佳实践

1. **务必轮询直至完成**：Veo 视频生成是异步的，可能需要数分钟
2. **设置合理的超时**：为视频生成预留至少 5 到 10 分钟
3. **妥善处理失败**：检查 `failed` 状态并实现重试逻辑
4. **使用描述性提示词**：提示词越详细，效果通常越好
5. **保存视频 ID**：记录操作 ID/视频 ID，应用重启后即可继续轮询

## 故障排查

### 视频生成超时

```python
# Increase polling timeout
max_wait_time = 900  # 15 minutes instead of 10
```

### 下载时找不到视频

```python
# Make sure video is completed before downloading
status = video_status(video_id=video_id)
if status.status != "completed":
    print("Video not ready yet!")
```

### API 密钥错误

```python
# Verify your API key is set
import os
print(os.environ.get("GEMINI_API_KEY"))

# Or pass it explicitly
response = video_generation(
    model="gemini/veo-3.0-generate-preview",
    prompt="...",
    api_key="your-api-key-here"
)
```

## 另请参阅

- [OpenAI 视频生成](../openai/videos.md)
- [Azure 视频生成](../azure/videos.md)
- [Vertex AI 视频生成](../vertex_ai/videos.md)
- [视频生成 API 参考](/docs/videos)
- [Veo 透传端点](/docs/pass_through/google_ai_studio#example-4-video-generation-with-veo)
