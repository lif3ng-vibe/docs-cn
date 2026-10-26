# RunwayML - 视频生成

LiteLLM 支持 RunwayML 的 Gen-4 视频生成 API，可以通过文本提示词和图片生成视频。

## 快速上手

```python showLineNumbers title="基础视频生成"
from litellm import video_generation
import os

os.environ["RUNWAYML_API_KEY"] = "your-api-key"

# Generate video from text and image
response = video_generation(
    model="runwayml/gen4_turbo",
    prompt="A high quality demo video of litellm ai gateway",
    input_reference="https://media.licdn.com/dms/image/v2/D4D0BAQFqOrIAJEgtLw/company-logo_200_200/company-logo_200_200/0/1714076049190/berri_ai_logo?e=2147483647&v=beta&t=7tG_KRZZ4MPGc7Iin79PcFcrpvf5Hu6rBM4ptHGU1DY",
    seconds=5,
    size="1280x720"
)

print(f"Video ID: {response.id}")
print(f"Status: {response.status}")
```

## 身份验证

设置你的 RunwayML API 密钥：

```python showLineNumbers title="设置 API 密钥"
import os

os.environ["RUNWAYML_API_KEY"] = "your-api-key"
```

## 支持的参数

| 参数 | 类型 | 是否必填 | 说明 |
|-----------|------|----------|-------------|
| `model` | string | 是 | 要使用的模型（如 `runwayml/gen4_turbo`） |
| `prompt` | string | 是 | 视频的文字描述 |
| `input_reference` | string/file | 是 | 参考图片的 URL 或文件路径 |
| `seconds` | int | 否 | 视频时长（5 或 10 秒） |
| `size` | string | 否 | 视频尺寸（`1280x720` 或 `720x1280`），也可以使用 `ratio` 格式（`1280:720`） |

## 完整流程

```python showLineNumbers title="完整视频生成流程"
from litellm import video_generation, video_status, video_content
import os
import time

os.environ["RUNWAYML_API_KEY"] = "your-api-key"

# 1. Generate video
response = video_generation(
    model="runwayml/gen4_turbo",
    prompt="A high quality demo video of litellm ai gateway",
    input_reference="https://media.licdn.com/dms/image/v2/D4D0BAQFqOrIAJEgtLw/company-logo_200_200/company-logo_200_200/0/1714076049190/berri_ai_logo?e=2147483647&v=beta&t=7tG_KRZZ4MPGc7Iin79PcFcrpvf5Hu6rBM4ptHGU1DY",
    seconds=5,
    size="1280x720"
)

video_id = response.id
print(f"Video generation started: {video_id}")

# 2. Check status until completed
while True:
    status_response = video_status(video_id=video_id)
    print(f"Status: {status_response.status}")
    
    if status_response.status == "completed":
        print("Video generation completed!")
        break
    elif status_response.status == "failed":
        print("Video generation failed")
        break
    
    time.sleep(10)  # Wait 10 seconds before checking again

# 3. Download video content
video_bytes = video_content(video_id=video_id)

# 4. Save to file
with open("generated_video.mp4", "wb") as f:
    f.write(video_bytes)

print("Video saved successfully!")
```

## 异步用法

```python showLineNumbers title="异步视频生成"
from litellm import avideo_generation, avideo_status, avideo_content
import os
import asyncio

os.environ["RUNWAYML_API_KEY"] = "your-api-key"

async def generate_video():
    # Generate video
    response = await avideo_generation(
        model="runwayml/gen4_turbo",
        prompt="A serene lake with mountains in the background",
        input_reference="https://example.com/lake.jpg",
        seconds=5,
        size="1280x720"
    )
    
    video_id = response.id
    print(f"Video generation started: {video_id}")
    
    # Poll for completion
    while True:
        status_response = await avideo_status(video_id=video_id)
        print(f"Status: {status_response.status}")
        
        if status_response.status == "completed":
            break
        elif status_response.status == "failed":
            print("Video generation failed")
            return
        
        await asyncio.sleep(10)
    
    # Download video
    video_bytes = await avideo_content(video_id=video_id)
    
    # Save to file
    with open("generated_video.mp4", "wb") as f:
        f.write(video_bytes)
    
    print("Video saved successfully!")

asyncio.run(generate_video())
```

## LiteLLM 代理用法

将 RunwayML 加入你的代理配置：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gen4-turbo
    litellm_params:
      model: runwayml/gen4_turbo
      api_key: os.environ/RUNWAYML_API_KEY
```

启动代理：

```bash
litellm --config /path/to/config.yaml
```

通过代理生成视频：

```bash showLineNumbers title="代理请求"
curl --location 'http://localhost:4000/v1/videos' \
--header 'Content-Type: application/json' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>' \
--data '{
    "model": "runwayml/gen4_turbo",
    "prompt": "A high quality demo video of litellm ai gateway",
    "input_reference": "https://media.licdn.com/dms/image/v2/D4D0BAQFqOrIAJEgtLw/company-logo_200_200/company-logo_200_200/0/1714076049190/berri_ai_logo?e=2147483647&v=beta&t=7tG_KRZZ4MPGc7Iin79PcFcrpvf5Hu6rBM4ptHGU1DY",
    "ratio": "1280:720"
}'
```

查询视频状态：

```bash showLineNumbers title="查询状态"
curl --location 'http://localhost:4000/v1/videos/{video_id}' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>'
```

下载视频内容：

```bash showLineNumbers title="下载视频"
curl --location 'http://localhost:4000/v1/videos/{video_id}/content' \
--header 'x-litellm-api-key: sk-<your-litellm-api-key>' \
--output video.mp4
```

## 支持的模型

| 模型 | 说明 | 时长 | 宽高比 |
|-------|-------------|----------|---------------|
| `runwayml/gen4_turbo` | 快速视频生成 | 5-10s | 1280x720, 720x1280 |

## 错误处理

```python showLineNumbers title="错误处理"
from litellm import video_generation, video_status
import time

try:
    response = video_generation(
        model="runwayml/gen4_turbo",
        prompt="A scenic mountain view",
        input_reference="https://example.com/mountain.jpg",
        seconds=5
    )
    
    # Poll for completion
    max_attempts = 60  # 10 minutes max
    attempts = 0
    
    while attempts < max_attempts:
        status_response = video_status(video_id=response.id)
        
        if status_response.status == "completed":
            print("Video generation completed!")
            break
        elif status_response.status == "failed":
            error = status_response.error or {}
            print(f"Video generation failed: {error.get('message', 'Unknown error')}")
            break
        
        time.sleep(10)
        attempts += 1
    
    if attempts >= max_attempts:
        print("Video generation timed out")
        
except Exception as e:
    print(f"Error: {str(e)}")
```

## 成本追踪

LiteLLM 会自动追踪 RunwayML 视频生成的成本：

```python showLineNumbers title="成本追踪"
from litellm import video_generation, completion_cost

response = video_generation(
    model="runwayml/gen4_turbo",
    prompt="A high quality demo video of litellm ai gateway",
    input_reference="https://media.licdn.com/dms/image/v2/D4D0BAQFqOrIAJEgtLw/company-logo_200_200/company-logo_200_200/0/1714076049190/berri_ai_logo?e=2147483647&v=beta&t=7tG_KRZZ4MPGc7Iin79PcFcrpvf5Hu6rBM4ptHGU1DY",
    seconds=5,
    size="1280x720"
)

# Calculate cost
cost = completion_cost(completion_response=response)
print(f"Video generation cost: ${cost}")
```

## API 参考

完整的 API 细节请参考 [OpenAI 视频生成 API 规范](https://platform.openai.com/docs/guides/video-generation)，LiteLLM 遵循该规范。

## 支持的功能

| 功能 | 是否支持 |
|---------|-----------|
| 视频生成 | ✅ |
| 图生视频 | ✅ |
| 状态查询 | ✅ |
| 内容下载 | ✅ |
| 成本追踪 | ✅ |
| 日志记录 | ✅ |
| 回退 | ✅ |
| 负载均衡 | ✅ |
