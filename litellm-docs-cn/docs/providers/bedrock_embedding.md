# Bedrock 嵌入

## 支持的嵌入模型

| 提供商 | LiteLLM 路由 | AWS 文档 | 成本追踪 |
|----------|---------------|-------------------|---------------|
| Amazon Titan | `bedrock/amazon.titan-*` | [Amazon Titan Embeddings](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html) | ✅ |
| Amazon Nova | `bedrock/amazon.nova-*` | [Amazon Nova Embeddings](https://docs.aws.amazon.com/bedrock/latest/userguide/nova-embed.html) | ✅ |
| Cohere | `bedrock/cohere.*` | [Cohere Embeddings](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-cohere-embed.html) | ✅ |
| TwelveLabs | `bedrock/twelvelabs.*`, `bedrock/us.twelvelabs.*`, `bedrock/eu.twelvelabs.*` | [TwelveLabs](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-twelvelabs.html), [Marengo Embed 3.0](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-marengo-3.html) | ✅ |

## 异步调用支持

LiteLLM 支持 AWS Bedrock 的异步调用（async-invoke）功能，适用于需要异步处理的嵌入（embedding）模型，对大型媒体文件（视频、音频）或需要在后台处理嵌入的场景尤其有用。

### 支持的模型

| 提供商 | 异步调用路由 | 适用场景 |
|----------|-------------------|----------|
| Amazon Nova | `bedrock/async_invoke/amazon.nova-2-multimodal-embeddings-v1:0` | 面向长文本、视频和音频的多模态嵌入，支持分段处理 |
| TwelveLabs Marengo Embed 2.7 | `bedrock/async_invoke/twelvelabs.marengo-embed-2-7-v1:0` | 视频、音频、图像和文本嵌入 |
| TwelveLabs Marengo Embed 3.0 | `bedrock/async_invoke/twelvelabs.marengo-embed-3-0-v1:0` | 视频和音频嵌入（文本和图像为同步处理，见 [Marengo Embed 3.0](#twelvelabs-marengo-embed-30)） |

### 必需参数

Bedrock 的异步调用只接受基础模型 ID，因此这里请使用 `twelvelabs.marengo-embed-2-7-v1:0` 或 `twelvelabs.marengo-embed-3-0-v1:0`，而不要用 `us.` 或 `eu.` 推理配置文件（inference profile），否则 Bedrock 会报错 `The provided model doesn't support async inference`

使用异步调用时，必须提供以下参数：

| 参数 | 说明 | 是否必填 |
|-----------|-------------|----------|
| `output_s3_uri` | 存储嵌入结果的 S3 URI | ✅ 是 |
| `input_type` | 输入类型：`"text"`、`"image"`、`"video"` 或 `"audio"`（Marengo Embed 3.0 还接受 `"text_image"` 和 `"multi_input"`） | ✅ 是 |
| `aws_region_name` | 请求所用的 AWS 区域 | ✅ 是 |

### 用法

#### 基础异步调用

```python
from litellm import embedding

# Text embedding with async-invoke
response = embedding(
    model="bedrock/async_invoke/twelvelabs.marengo-embed-2-7-v1:0",
    input=["Hello world from LiteLLM async invoke!"],
    aws_region_name="us-east-1",
    input_type="text",
    output_s3_uri="s3://your-bucket/async-invoke-output/"
)

print(f"Job submitted! Invocation ARN: {response._hidden_params._invocation_arn}")
```

#### 视频与音频嵌入

```python
# Video embedding (requires async-invoke)
response = embedding(
    model="bedrock/async_invoke/twelvelabs.marengo-embed-2-7-v1:0",
    input=["s3://your-bucket/video.mp4"],  # S3 URL for video
    aws_region_name="us-east-1",
    input_type="video",
    output_s3_uri="s3://your-bucket/async-invoke-output/"
)

print(f"Video embedding job submitted! ARN: {response._hidden_params._invocation_arn}")
```

#### Base64 图像嵌入

```python
import base64

# Load and encode image
with open("image.jpg", "rb") as img_file:
    img_data = base64.b64encode(img_file.read()).decode('utf-8')
    img_base64 = f"data:image/jpeg;base64,{img_data}"

response = embedding(
    model="bedrock/async_invoke/twelvelabs.marengo-embed-2-7-v1:0",
    input=[img_base64],
    aws_region_name="us-east-1",
    input_type="image",
    output_s3_uri="s3://your-bucket/async-invoke-output/"
)
```

### 查询任务信息

#### 获取任务 ID 与调用 ARN

异步调用的响应会在隐藏参数中返回调用 ARN：

```python
response = embedding(
    model="bedrock/async_invoke/twelvelabs.marengo-embed-2-7-v1:0",
    input=["Hello world"],
    aws_region_name="us-east-1",
    input_type="text",
    output_s3_uri="s3://your-bucket/async-invoke-output/"
)

# Access invocation ARN
invocation_arn = response._hidden_params._invocation_arn
print(f"Invocation ARN: {invocation_arn}")

# Extract job ID from ARN (last part after the last slash)
job_id = invocation_arn.split("/")[-1]
print(f"Job ID: {job_id}")
```

#### 检查任务状态

使用 LiteLLM 的 `retrieve_batch` 函数（批处理 API）检查任务是否仍在处理中：

```python
from litellm import retrieve_batch

def check_async_job_status(invocation_arn, aws_region_name="us-east-1"):
    """Check the status of an async invoke job using LiteLLM batch API"""
    try:
        response = retrieve_batch(
            batch_id=invocation_arn,  # Pass the invocation ARN here
            custom_llm_provider="bedrock",
            aws_region_name=aws_region_name
        )
        return response
    except Exception as e:
        print(f"Error checking job status: {e}")
        return None

# Check status
status = check_async_job_status(invocation_arn, "us-east-1")
if status:
    print(f"Job Status: {status.status}")  # "in_progress", "completed", or "failed"
    print(f"Output Location: {status.metadata['output_file_id']}")  # S3 URI where results are stored
```

#### 轮询直至完成

下面是轮询任务直至完成的完整示例：

```python
def wait_for_async_job(invocation_arn, aws_region_name="us-east-1", max_wait=3600):
    """Poll job status until completion"""
    start_time = time.time()
    
    while True:
        status = retrieve_batch(
            batch_id=invocation_arn,
            custom_llm_provider="bedrock",
            aws_region_name=aws_region_name,
        )
        
        if status.status == "completed":
            print("✅ Job completed!")
            return status
        elif status.status == "failed":
            error_msg = status.metadata.get('failure_message', 'Unknown error')
            raise Exception(f"❌ Job failed: {error_msg}")
        else:
            elapsed = time.time() - start_time
            if elapsed > max_wait:
                raise TimeoutError(f"Job timed out after {max_wait} seconds")
            
            print(f"⏳ Job still processing... (elapsed: {elapsed:.0f}s)")
            time.sleep(10)  # Wait 10 seconds before checking again

# Wait for completion
completed_status = wait_for_async_job(invocation_arn)
output_s3_uri = completed_status.metadata['output_file_id']
print(f"Results available at: {output_s3_uri}")
```

**注意**：实际的嵌入结果存储在 S3 中。任务完成后，请从 `status.metadata['output_file_id']` 指定的 S3 位置下载结果。结果为 JSON/JSONL 格式，内含嵌入向量。

## TwelveLabs Marengo Embed 3.0

Marengo Embed 3.0（`twelvelabs.marengo-embed-3-0-v1:0`，以及面向 us-east-1 和 eu-west-1 的 `us.`、`eu.` 推理配置文件）返回 512 维向量，文本输入最多 500 个 token。文本、图像、图文和多图输入通过 `bedrock/<model id>` 同步处理；视频和音频则通过 `bedrock/async_invoke/twelvelabs.marengo-embed-3-0-v1:0` 并携带 `output_s3_uri` 处理，且必须使用基础模型 ID，因为 Bedrock 的异步调用不接受推理配置文件。3.0 发送给 Bedrock 的请求体与 2.7 不同，LiteLLM 仍基于同一个 `input_type` 参数构造请求，因此从 2.7（计划于 2026-11-30 弃用）迁移只需更换模型 ID

### 输入类型

| `input_type` | `input` | 额外参数 |
|--------------|---------|------------------|
| `text`（默认） | 要嵌入的文本 | |
| `image` | base64 图像或 `s3://` URI | |
| `text_image` | 文本 | `media_source`：base64 图像或 `s3://` URI |
| `multi_input` | 文本，以 `<@name>` 引用各张图像 | `media_sources`：名称到 base64 图像或 `s3://` URI 的映射 |
| `video`、`audio` | `s3://` URI 或 base64 媒体，仅支持异步调用 | `startSec`、`endSec`、`segmentation`、`embeddingOption`、`embeddingType`、`embeddingScope`，含义见 [AWS 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-marengo-3.html) |

所有输入类型都会透传 `inferenceId` 和 `bucketOwner`（用于 `s3://` URI 归属其他账号的情况）。`text_image` 请求缺少 `media_source`，或 `multi_input` 请求缺少 `media_sources`，会被 400 错误拒绝，并在报错中指明缺失的参数。Marengo 2.7 的 `textTruncate`、`lengthSec`、`useFixedLengthSec`、`minClipSec`，以及其他输入类型上的视频和音频选项，在 3.0 上都会收到 400 拒绝，除非设置了 `drop_params`，此时这些参数会被直接丢弃

### 代理配置

```yaml
model_list:
  - model_name: marengo-3
    litellm_params:
      model: bedrock/us.twelvelabs.marengo-embed-3-0-v1:0
      aws_region_name: us-east-1
  - model_name: marengo-3-async
    litellm_params:
      model: bedrock/async_invoke/twelvelabs.marengo-embed-3-0-v1:0
      aws_region_name: us-east-1
```

### 文本

```bash
curl http://0.0.0.0:4000/v1/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" -H "Content-Type: application/json" \
  -d '{"model": "marengo-3", "input": "a dog running on the beach", "input_type": "text"}'
```

### 图像

```bash
curl http://0.0.0.0:4000/v1/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" -H "Content-Type: application/json" \
  -d '{"model": "marengo-3", "input": "<base64 image>", "input_type": "image"}'
```

### 文本加图像

```bash
curl http://0.0.0.0:4000/v1/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" -H "Content-Type: application/json" \
  -d '{"model": "marengo-3", "input": "a duck", "input_type": "text_image", "media_source": "s3://your-bucket/duck.png"}'
```

### 多张图像

```bash
curl http://0.0.0.0:4000/v1/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" -H "Content-Type: application/json" \
  -d '{"model": "marengo-3", "input": "a photo of <@bird> on water", "input_type": "multi_input", "media_sources": {"bird": "<base64 image>"}}'
```

### 通过异步调用处理视频

```python
from litellm import embedding

response = embedding(
    model="bedrock/async_invoke/twelvelabs.marengo-embed-3-0-v1:0",
    input=["s3://your-bucket/video.mp4"],
    aws_region_name="us-east-1",
    input_type="video",
    embeddingOption=["visual", "audio"],
    segmentation={"method": "fixed", "fixed": {"durationSec": 10}},
    output_s3_uri="s3://your-bucket/async-invoke-output/",
)
print(response._hidden_params._invocation_arn)
```

## Amazon Nova 多模态嵌入

Amazon Nova 支持文本、图像、视频和音频的多模态嵌入，提供灵活的嵌入维度和嵌入用途（embedding purpose）选项，针对不同使用场景做了优化。

### 支持的特性

- **模态**：文本、图像、视频、音频
- **维度**：256、384、1024、3072（默认 3072）
- **嵌入用途**：
  - `GENERIC_INDEX`（默认）
  - `GENERIC_RETRIEVAL`
  - `TEXT_RETRIEVAL`
  - `IMAGE_RETRIEVAL`
  - `VIDEO_RETRIEVAL`
  - `AUDIO_RETRIEVAL`
  - `CLASSIFICATION`
  - `CLUSTERING`

### 文本嵌入

```python
from litellm import embedding

response = embedding(
    model="bedrock/amazon.nova-2-multimodal-embeddings-v1:0",
    input=["Hello, world!"],
    aws_region_name="us-east-1",
    dimensions=1024,  # Optional: 256, 384, 1024, or 3072
)

print(response.data[0].embedding)
```

### 通过 Base64 嵌入图像

Amazon Nova 接受 base64 格式的图像，需按标准 data URL 格式提供：

```python
import base64
from litellm import embedding

# Method 1: Load image from file
with open("image.jpg", "rb") as image_file:
    image_data = base64.b64encode(image_file.read()).decode('utf-8')
    # Create data URL with proper format
    image_base64 = f"data:image/jpeg;base64,{image_data}"

response = embedding(
    model="bedrock/amazon.nova-2-multimodal-embeddings-v1:0",
    input=[image_base64],
    aws_region_name="us-east-1",
    dimensions=1024,
)

print(f"Image embedding: {response.data[0].embedding[:10]}...")  # First 10 dimensions
```

#### 支持的图像格式

Nova 支持以下图像格式：
- JPEG：`data:image/jpeg;base64,...`
- PNG：`data:image/png;base64,...`
- GIF：`data:image/gif;base64,...`
- WebP：`data:image/webp;base64,...`

#### 带错误处理的完整示例

```python
import base64
from litellm import embedding

def get_image_embedding(image_path, dimensions=1024):
    """
    Get embedding for an image file.
    
    Args:
        image_path: Path to the image file
        dimensions: Embedding dimension (256, 384, 1024, or 3072)
    
    Returns:
        List of embedding values
    """
    try:
        # Determine image format from file extension
        if image_path.lower().endswith('.png'):
            mime_type = "image/png"
        elif image_path.lower().endswith(('.jpg', '.jpeg')):
            mime_type = "image/jpeg"
        elif image_path.lower().endswith('.gif'):
            mime_type = "image/gif"
        elif image_path.lower().endswith('.webp'):
            mime_type = "image/webp"
        else:
            raise ValueError(f"Unsupported image format: {image_path}")
        
        # Read and encode image
        with open(image_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            image_base64 = f"data:{mime_type};base64,{image_data}"
        
        # Get embedding
        response = embedding(
            model="bedrock/amazon.nova-2-multimodal-embeddings-v1:0",
            input=[image_base64],
            aws_region_name="us-east-1",
            dimensions=dimensions,
        )
        
        return response.data[0].embedding
        
    except Exception as e:
        print(f"Error getting image embedding: {e}")
        raise

# Example usage
image_embedding = get_image_embedding("photo.jpg", dimensions=1024)
print(f"Got embedding with {len(image_embedding)} dimensions")
```

### 错误处理

#### 常见错误

| 错误 | 原因 | 解决办法 |
|-------|-------|----------|
| `ValueError: output_s3_uri cannot be empty` | 缺少 S3 输出 URI | 提供有效的 S3 URI |
| `ValueError: Input type 'video' requires async_invoke route` | 视频/音频输入未走异步调用 | 使用 `bedrock/async_invoke/` 模型前缀 |
| `ValueError: input_type is required` | 缺少输入类型参数 | 指定 `input_type` 参数 |

#### 错误处理示例

```python
try:
    response = embedding(
        model="bedrock/async_invoke/twelvelabs.marengo-embed-2-7-v1:0",
        input=["Hello world"],
        aws_region_name="us-east-1",
        input_type="text",
        output_s3_uri="s3://your-bucket/output/"  # Required for async-invoke
    )
    print("Job submitted successfully!")
    
except ValueError as e:
    if "output_s3_uri cannot be empty" in str(e):
        print("Error: Please provide a valid S3 output URI")
    elif "requires async_invoke route" in str(e):
        print("Error: Use async_invoke model for video/audio inputs")
    else:
        print(f"Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

### 最佳实践

1. **大文件使用异步调用**：视频和音频文件更适合异步处理
2. **使用 LiteLLM 批处理 API**：查询状态时用 `retrieve_batch()`，而不要直接调用 Bedrock API
3. **监控任务状态**：定期通过批处理 API 查询任务状态，掌握结果何时就绪
4. **妥善处理错误**：针对网络问题和任务失败实现完善的错误处理
5. **设置合理的超时时间**：把大文件的处理耗时考虑在内
6. **大输入走 S3**：视频/音频请使用 S3 URL，而不要用 base64 编码

### 限制

- 异步调用仅支持 TwelveLabs Marengo 和 Amazon Nova 模型
- 结果存储在 S3 中，需要另行通过输出文件 ID 获取
- 查询任务状态必须使用 LiteLLM 的 `retrieve_batch()` 函数
- LiteLLM 没有内置轮询机制（需自行实现状态查询循环）

### API 密钥
这些密钥可以设置为环境变量，也可以**作为参数传给 litellm.embedding()**
```python
import os
os.environ["AWS_ACCESS_KEY_ID"] = ""        # Access key
os.environ["AWS_SECRET_ACCESS_KEY"] = ""    # Secret access key
os.environ["AWS_REGION_NAME"] = ""           # us-east-1, us-east-2, us-west-1, us-west-2
```

## 用法
### LiteLLM Python SDK
```python
from litellm import embedding
response = embedding(
    model="bedrock/amazon.titan-embed-text-v1",
    input=["good morning from litellm"],
)
print(response)
```

### LiteLLM 代理服务器

#### 1. 配置 config.yaml
```yaml
model_list:
  - model_name: titan-embed-v1
    litellm_params:
      model: bedrock/amazon.titan-embed-text-v1
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1
  - model_name: titan-embed-v2
    litellm_params:
      model: bedrock/amazon.titan-embed-text-v2:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1
```

#### 2. 启动代理
```bash
litellm --config /path/to/config.yaml
```

#### 3. 配合 OpenAI Python SDK 使用
```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.embeddings.create(
    input=["good morning from litellm"],
    model="titan-embed-v1"
)
print(response)
```

#### 4. 配合 LiteLLM Python SDK 使用
```python
import litellm
response = litellm.embedding(
    model="titan-embed-v1", # model alias from config.yaml
    input=["good morning from litellm"],
    api_base="http://0.0.0.0:4000",
    api_key="anything"
)
print(response)
```

## 支持的 AWS Bedrock 嵌入模型

| 模型名称           | 用法                               | 支持的其他 OpenAI 参数 |
|----------------------|---------------------------------------------|-----|
| **Amazon Nova Multimodal Embeddings** | `embedding(model="bedrock/amazon.nova-2-multimodal-embeddings-v1:0", input=input)` | 支持多模态输入（文本、图像、视频、音频）、多种用途、多个维度（256、384、1024、3072） |
| Titan Embeddings V2 | `embedding(model="bedrock/amazon.titan-embed-text-v2:0", input=input)` | [详见](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/amazon_titan_v2_transformation.py#L59) |
| Titan Embeddings - V1 | `embedding(model="bedrock/amazon.titan-embed-text-v1", input=input)` | [详见](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/amazon_titan_g1_transformation.py#L53)
| Titan Multimodal Embeddings | `embedding(model="bedrock/amazon.titan-embed-image-v1", input=input)` | [详见](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/amazon_titan_multimodal_transformation.py#L28) |
| TwelveLabs Marengo Embed 2.7 | `embedding(model="bedrock/us.twelvelabs.marengo-embed-2-7-v1:0", input=input)` | 支持多模态输入（文本、视频、音频、图像） |
| TwelveLabs Marengo Embed 3.0 | `embedding(model="bedrock/us.twelvelabs.marengo-embed-3-0-v1:0", input=input)` | 文本、图像、`text_image`、`multi_input` 走同步调用，视频和音频走异步调用，512 维 |
| Cohere Embeddings - English | `embedding(model="bedrock/cohere.embed-english-v3", input=input)` | [详见](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/cohere_transformation.py#L18)
| Cohere Embeddings - Multilingual | `embedding(model="bedrock/cohere.embed-multilingual-v3", input=input)` | [详见](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/cohere_transformation.py#L18)
| Cohere Embed v4 | `embedding(model="bedrock/cohere.embed-v4:0", input=input)` | 支持文本和图像输入，维度可配置（256、512、1024、1536），上下文长度 128k |

### 进阶 - [丢弃不支持的参数](https://docs.litellm.ai/docs/completion/drop_params#openai-proxy-usage)

### 进阶 - [传入模型/提供商专属参数](https://docs.litellm.ai/docs/completion/provider_specific_params#proxy-usage)
