import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# QwenCloud 与千问 AI 平台（Qwen 模型）

阿里巴巴将其模型平台品牌（DashScope、Bailian、Model Studio）统一为两个品牌：中国大陆以外的 [QwenCloud](https://www.qwencloud.com/)，以及中国大陆的千问 AI 平台（[Qianwen AI Platform](https://www.qianwenai.com/)）。LiteLLM 通过既有的 DashScope 实现同时接入这两个品牌，旧的 `dashscope/` 前缀仍作为别名继续可用。

## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | 阿里巴巴的 Qwen 模型平台，通过 OpenAI 兼容 API 提供服务 |
| LiteLLM 上的提供商路由 | `qwencloud/`（国际站）、`qwen_ai_platform/`（中国大陆）、`dashscope/`（旧别名） |
| 提供商文档链接 | [QwenCloud 文档](https://docs.qwencloud.com/developer-guides/getting-started/introduction)、[千问 AI 平台文档](https://platform.qianwenai.com/docs/developer-guides/getting-started/first-api-call) |
| 支持的操作 | `/chat/completions`、`/embeddings`、`/rerank`、`/images/generations` |

这些路由支持按量付费的 API 密钥。Token Plan 与 Coding Plan 端点尚未在 LiteLLM 中映射（进展见 [issue #36150](https://github.com/BerriAI/litellm/issues/36150)）。

## QwenCloud（国际站）

在中国大陆以外使用 `qwencloud/` 前缀。

| 配置项 | 取值 |
|-------|-------|
| 前缀 | `qwencloud/` |
| 默认 API 地址 | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| 重排序端点 | `https://dashscope-intl.aliyuncs.com/compatible-api/v1/reranks` |
| 图像生成端点 | `https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation` |
| 视频生成主机 | `https://dashscope-intl.aliyuncs.com` |
| API 密钥环境变量 | `QWENCLOUD_API_KEY`（未设置时回退到 `DASHSCOPE_API_KEY`） |
| Base URL 覆盖项 | `QWENCLOUD_API_BASE`、`QWENCLOUD_API_BASE_RERANK`、`QWENCLOUD_API_BASE_IMAGE`、`QWENCLOUD_API_BASE_VIDEO` |

## 千问 AI 平台（中国大陆）

在中国大陆使用 `qwen_ai_platform/` 前缀，其访问的是大陆主机上的相同路径。

| 配置项 | 取值 |
|-------|-------|
| 前缀 | `qwen_ai_platform/` |
| 默认 API 地址 | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| 重排序端点 | `https://dashscope.aliyuncs.com/compatible-api/v1/reranks` |
| 图像生成端点 | `https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation` |
| 视频生成主机 | `https://dashscope.aliyuncs.com` |
| API 密钥环境变量 | `QWEN_AI_PLATFORM_API_KEY`（未设置时回退到 `DASHSCOPE_API_KEY`） |
| Base URL 覆盖项 | `QWEN_AI_PLATFORM_API_BASE`、`QWEN_AI_PLATFORM_API_BASE_RERANK`、`QWEN_AI_PLATFORM_API_BASE_IMAGE`、`QWEN_AI_PLATFORM_API_BASE_VIDEO` |

## API 密钥

```python showLineNumbers title="Environment Variables"
import os

os.environ["QWENCLOUD_API_KEY"] = "your-api-key"
```

中国大陆改设 `QWEN_AI_PLATFORM_API_KEY`。两个前缀在自己的密钥未设置时也会读取 `DASHSCOPE_API_KEY`，因此现有的 DashScope 凭据无需改动即可继续使用。

## 模型

两个前缀都接受 DashScope 目录中的任意模型，例如 `qwencloud/qwen-max`、`qwencloud/qwen-flash`、`qwencloud/qwen-image-3.0` 或 `qwen_ai_platform/qwen-plus`。完整模型列表见 [DashScope 页面](./dashscope)。

## 用法 - LiteLLM Python SDK

### 对话补全

```python showLineNumbers title="QwenCloud Chat Completion"
import os
from litellm import completion

os.environ["QWENCLOUD_API_KEY"] = "your-api-key"

response = completion(
    model="qwencloud/qwen-max",
    messages=[{"role": "user", "content": "hello from litellm"}],
)

print(response.choices[0].message.content)
```

### 流式

```python showLineNumbers title="QwenCloud Streaming Chat Completion"
import os
from litellm import completion

os.environ["QWENCLOUD_API_KEY"] = "your-api-key"

response = completion(
    model="qwencloud/qwen-flash",
    messages=[{"role": "user", "content": "hello from litellm"}],
    stream=True,
)

for chunk in response:
    print(chunk)
```

### 嵌入

```python showLineNumbers title="QwenCloud Embedding"
import os
from litellm import embedding

os.environ["QWENCLOUD_API_KEY"] = "your-api-key"

response = embedding(
    model="qwencloud/text-embedding-v4",
    input=["hello from litellm"],
)

print(response.data[0]["embedding"][:5])
```

### 重排序

```python showLineNumbers title="QwenCloud Rerank"
import os
from litellm import rerank

os.environ["QWENCLOUD_API_KEY"] = "your-api-key"

response = rerank(
    model="qwencloud/gte-rerank-v2",
    query="What is the capital of France?",
    documents=["Paris is the capital of France", "Berlin is the capital of Germany"],
)

print(response.results)
```

### 图像生成

```python showLineNumbers title="QwenCloud Image Generation"
import os
from litellm import image_generation

os.environ["QWENCLOUD_API_KEY"] = "your-api-key"

response = image_generation(
    model="qwencloud/qwen-image-3.0",
    prompt="A cup of coffee on a wooden table",
)

print(response.data[0].url)
```

### 视频生成

视频生成通过 DashScope 任务 API 以异步任务方式运行。`video_generation` 会立即返回任务 id，轮询 `video_status` 直到状态变为 `completed`，再用 `video_content` 下载 mp4。

```python showLineNumbers title="QwenCloud Video Generation"
import os
import time
from litellm import video_content, video_generation, video_status

os.environ["QWENCLOUD_API_KEY"] = "your-api-key"

video = video_generation(
    model="qwencloud/wan3.0-video",
    prompt="A paper boat drifting down a rain-soaked city gutter",
    seconds="5",
    size="1280x720",
)

while video.status not in ("completed", "failed"):
    time.sleep(20)
    video = video_status(video_id=video.id)

with open("video.mp4", "wb") as f:
    f.write(video_content(video_id=video.id))
```

支持的模型有 `wan3.0-video`、`wan3.0-video-prime`、`wan2.7-t2v`、`wan2.7-i2v`、`wan2.7-r2v`、`happyhorse-1.1-t2v`、`happyhorse-1.1-i2v`、`happyhorse-1.1-r2v`、`happyhorse-1.0-t2v`、`happyhorse-1.0-i2v` 和 `happyhorse-1.0-r2v`，在 `qwencloud/`、`qwen_ai_platform/` 和 `dashscope/` 任一前缀下均可使用。每个前缀按其默认主机所在区域的价目表计费。

`seconds` 设置时长。`size` 会从 16:9、9:16、1:1、4:3 和 3:4 中选择最接近的宽高比，并按其较短边确定计费分辨率档位：短边小于 600 px 为 480P，小于 900 px 为 720P，更大则为 1080P。想使用模型支持的其他宽高比（例如 Wan 3.0 上的 21:9），可以直接传 `ratio`。不传 `size` 时任务按 1080P 运行并计费，不传 `seconds` 时时长为 5 秒。图生视频与参考图生视频模型通过 `input_reference` 传入图像，可以是 URL 或文件（打开的文件对象、字节或 `pathlib.Path`）。`resolution`、`ratio`、`audio`、`seed`、`negative_prompt`、`prompt_extend`、`watermark` 等 DashScope 请求字段可以作为额外参数透传。智能时长（`duration: -1`）会被拒绝，DashScope 也没有提供列举、删除或 remix 端点。

要在代理上提供这些模型，请在部署上设置 `mode: video_generation` 并调用 `/v1/videos`：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: wan3-video
    litellm_params:
      model: qwencloud/wan3.0-video
      api_key: os.environ/QWENCLOUD_API_KEY
    model_info:
      mode: video_generation
```

```bash showLineNumbers title="Video generation via Proxy - cURL"
curl http://localhost:4000/v1/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "wan3-video",
    "prompt": "A paper boat drifting down a rain-soaked city gutter",
    "seconds": "5",
    "size": "1280x720"
  }'

curl http://localhost:4000/v1/videos/$VIDEO_ID \
  -H "Authorization: Bearer $LITELLM_API_KEY"

curl http://localhost:4000/v1/videos/$VIDEO_ID/content \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -o video.mp4
```

## 用法 - LiteLLM 代理

将模型加入 LiteLLM 代理配置：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: qwen-max
    litellm_params:
      model: qwencloud/qwen-max
      api_key: os.environ/QWENCLOUD_API_KEY
  - model_name: qwen-plus-cn
    litellm_params:
      model: qwen_ai_platform/qwen-plus
      api_key: os.environ/QWEN_AI_PLATFORM_API_KEY
```

启动代理：

```bash showLineNumbers title="Start LiteLLM Proxy"
export QWENCLOUD_API_KEY="your-api-key"
litellm --config config.yaml --port 4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="QwenCloud via Proxy - OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-key",
)

response = client.chat.completions.create(
    model="qwen-max",
    messages=[{"role": "user", "content": "hello from litellm"}],
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="QwenCloud via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "qwen-max",
    "messages": [{"role": "user", "content": "hello from litellm"}]
  }'
```

</TabItem>
</Tabs>

## 与 DashScope 的向后兼容

`dashscope/` 前缀、`DASHSCOPE_API_KEY`、`DASHSCOPE_API_BASE` 以及所有现有 DashScope 配置都保持原样继续可用。`qwencloud/` 和 `qwen_ai_platform/` 只是同一实现之上的别名，无需迁移：想换前缀随时可以换，不换也完全可以。
