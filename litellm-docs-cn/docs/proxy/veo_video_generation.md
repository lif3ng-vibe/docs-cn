import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 使用 Google AI Studio 的 Veo 视频生成

通过 LiteLLM 的透传端点，使用 Google 的 Veo 模型生成视频。

## 快速上手

LiteLLM 支持通过透传路由零配置使用 Google AI Studio 的 Veo 视频生成 API。

### 1. 在环境变量中配置 Google AI Studio API 密钥

```bash
export GEMINI_API_KEY="your_google_ai_studio_api_key"
```

### 2. 启动 LiteLLM 代理

```bash
litellm

# 已在 http://0.0.0.0:4000 上运行
```

### 3. 生成视频

<Tabs>
<TabItem value="python" label="Python">

```python
import requests
import time
import json

# Configuration
BASE_URL = "http://localhost:4000/gemini/v1beta"
API_KEY = "anything"  # Use "anything" as the key

headers = {
    "x-goog-api-key": API_KEY,
    "Content-Type": "application/json"
}

# Step 1: Initiate video generation
def generate_video(prompt):
    url = f"{BASE_URL}/models/veo-3.0-generate-preview:predictLongRunning"
    payload = {
        "instances": [{
            "prompt": prompt
        }]
    }

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()

    data = response.json()
    return data.get("name")  # Operation name

# Step 2: Poll for completion
def wait_for_completion(operation_name):
    operation_url = f"{BASE_URL}/{operation_name}"

    while True:
        response = requests.get(operation_url, headers=headers)
        response.raise_for_status()

        data = response.json()

        if data.get("done", False):
            # Extract video URI
            video_uri = data["response"]["generateVideoResponse"]["generatedSamples"][0]["video"]["uri"]
            return video_uri

        time.sleep(10)  # Wait 10 seconds before next poll

# Step 3: Download video
def download_video(video_uri, filename="generated_video.mp4"):
    # Replace Google URL with LiteLLM proxy URL
    litellm_url = video_uri.replace(
        "https://generativelanguage.googleapis.com/v1beta",
        BASE_URL
    )

    response = requests.get(litellm_url, headers=headers, stream=True)
    response.raise_for_status()

    with open(filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

    return filename

# Complete workflow
prompt = "A cat playing with a ball of yarn in a sunny garden"

print("Generating video...")
operation_name = generate_video(prompt)

print("Waiting for completion...")
video_uri = wait_for_completion(operation_name)

print("Downloading video...")
filename = download_video(video_uri)

print(f"Video saved as: {filename}")
```

</TabItem>

<TabItem value="curl" label="Curl">

```bash
# 第 1 步：发起视频生成
curl -X POST "http://localhost:4000/gemini/v1beta/models/veo-3.0-generate-preview:predictLongRunning" \
  -H "x-goog-api-key: anything" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "A cat playing with a ball of yarn in a sunny garden"
    }]
  }'

# 响应中会包含操作名：
# {"name": "operations/generate_12345"}

# 第 2 步：轮询直至完成
curl -X GET "http://localhost:4000/gemini/v1beta/operations/generate_12345" \
  -H "x-goog-api-key: anything"

# 第 3 步：下载视频（done=true 时）
curl -X GET "http://localhost:4000/gemini/v1beta/files/VIDEO_ID:download?alt=media" \
  -H "x-goog-api-key: anything" \
  --output generated_video.mp4
```

</TabItem>
</Tabs>

## 完整示例

包含错误处理与日志的完整可运行示例，见 [Veo 视频生成 Cookbook](https://github.com/BerriAI/litellm/blob/main/cookbook/veo_video_generation.py)。

## 工作原理

1. **视频生成请求**：向 Veo 的 `predictLongRunning` 端点发送提示词
2. **轮询操作**：持续监视这个长时间运行的操作，直至其完成
3. **文件下载**：通过 LiteLLM 的透传下载生成的视频，重定向自动处理

LiteLLM 会处理以下事项：
- ✅ 与 Google AI Studio 的身份验证
- ✅ 请求路由与代理转发
- ✅ 文件下载的重定向自动处理

## 配置选项

### 环境变量

```bash
export GEMINI_API_KEY="your_google_ai_studio_api_key"
```
