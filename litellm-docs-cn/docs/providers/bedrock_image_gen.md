import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AWS Bedrock - 图像生成

通过 Bedrock 使用 Stable Diffusion、Amazon Titan Image Generator 和 Amazon Nova Canvas 模型生成图像。

## 支持的模型

| 模型名称              | 调用方式                               | 成本追踪 |
|-------------------------|---------------------------------------------|---------------|
| Stable Diffusion 3 - v0 | `image_generation(model="bedrock/stability.stability.sd3-large-v1:0", prompt=prompt)` | ✅ |
| Stable Diffusion - v0   | `image_generation(model="bedrock/stability.stable-diffusion-xl-v0", prompt=prompt)` | ✅ |
| Stable Diffusion - v1   | `image_generation(model="bedrock/stability.stable-diffusion-xl-v1", prompt=prompt)` | ✅ |
| Amazon Titan Image Generator - v1 | `image_generation(model="bedrock/amazon.titan-image-generator-v1", prompt=prompt)` | ✅ |
| Amazon Titan Image Generator - v2 | `image_generation(model="bedrock/amazon.titan-image-generator-v2:0", prompt=prompt)` | ✅ |
| Amazon Nova Canvas - v1 | `image_generation(model="bedrock/amazon.nova-canvas-v1:0", prompt=prompt)` | ✅ |

## 用法

<Tabs>
<TabItem value="sdk" label="SDK">

### 基本用法

```python
import os
from litellm import image_generation

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = image_generation(
    prompt="A cute baby sea otter",
    model="bedrock/stability.stable-diffusion-xl-v0",
)
print(f"response: {response}")
```

### 设置可选参数

```python
import os
from litellm import image_generation

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = image_generation(
    prompt="A cute baby sea otter",
    model="bedrock/stability.stable-diffusion-xl-v0",
    ### OPENAI-COMPATIBLE ###
    size="128x512", # width=128, height=512
    ### PROVIDER-SPECIFIC ### see `AmazonStabilityConfig` in bedrock.py for all params
    seed=30
)
print(f"response: {response}")
```

</TabItem>
<TabItem value="proxy" label="代理">

### 1. 设置 config.yaml

```yaml
model_list:
  - model_name: amazon.nova-canvas-v1:0
    litellm_params:
      model: bedrock/amazon.nova-canvas-v1:0
      aws_region_name: "us-east-1"
      aws_access_key_id: my-id # OPTIONAL - all boto3 auth params supported
      aws_secret_access_key: my-key # OPTIONAL - all boto3 auth params supported
```

### 2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

### 3. 测试

**文生图**：

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/images/generations' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer $LITELLM_VIRTUAL_KEY' \
-d '{
    "model": "amazon.nova-canvas-v1:0",
    "prompt": "A cute baby sea otter"
}'
```

**颜色引导生成**：

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/images/generations' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer $LITELLM_VIRTUAL_KEY' \
-d '{
    "model": "amazon.nova-canvas-v1:0",
    "prompt": "A cute baby sea otter",
    "taskType": "COLOR_GUIDED_GENERATION",
    "colorGuidedGenerationParams":{"colors":["#FFFFFF"]}
}'
```

</TabItem>
</Tabs>

## Amazon Nova Canvas - 图像编辑

在 Bedrock Nova Canvas（`amazon.nova-canvas-v1:0`）上使用 OpenAI 兼容的 `image_edit()`。编辑请求与生成请求一样走 `InvokeModel` API，LiteLLM 会将输入映射为对应的 [Nova Canvas 任务类型](https://docs.aws.amazon.com/nova/latest/userguide/image-gen-access.html)：

| 场景 | 发送给 Bedrock 的 `taskType` |
|----------|----------------------------|
| 图像 + 提示词（无蒙版） | `IMAGE_VARIATION` |
| 图像 + 提示词 + 蒙版 | `INPAINTING`（`inPaintingParams.image`、`maskImage` 或 `maskPrompt`） |
| `taskType: OUTPAINTING` + `mask` 或 `maskPrompt` | `OUTPAINTING`（Bedrock 要求二者提供其一；两者都缺时 LiteLLM 会抛出明确的错误） |
| `taskType: BACKGROUND_REMOVAL` | `BACKGROUND_REMOVAL` |

```python
from litellm import image_edit

response = image_edit(
    image=open("photo.png", "rb"),
    prompt="Add soft sunset lighting",
    model="bedrock/amazon.nova-canvas-v1:0",
)
```

对于 **`BACKGROUND_REMOVAL`**，AWS 请求中不能包含 `imageGenerationConfig`；即使传入 `size`、`n`、`seed` 等参数，LiteLLM 在该任务下也会将其省略。其余用于图像编辑的 Nova Canvas inference ID 应在 `model_prices_and_context_window.json` 中设置 **`supports_nova_canvas_image_edit`: true**（参见 `amazon.nova-canvas-v1:0`）。

## 在图像生成中使用 Inference Profiles

对于用于图像生成的 AWS Bedrock Application Inference Profiles（应用推理配置文件），请使用 `model_id` 参数指定推理配置文件的 ARN：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import image_generation

response = image_generation(
    model="bedrock/amazon.nova-canvas-v1:0",
    model_id="arn:aws:bedrock:eu-west-1:000000000000:application-inference-profile/a0a0a0a0a0a0",
    prompt="A cute baby sea otter"
)
print(f"response: {response}")
```

</TabItem>
<TabItem value="proxy" label="代理">

```yaml
model_list:
  - model_name: nova-canvas-inference-profile
    litellm_params:
      model: bedrock/amazon.nova-canvas-v1:0
      model_id: arn:aws:bedrock:eu-west-1:000000000000:application-inference-profile/a0a0a0a0a0a0
      aws_region_name: "eu-west-1"
```

</TabItem>
</Tabs>

## 身份验证

图像生成支持所有标准的 Bedrock 身份验证方式，详见 [Bedrock 身份验证](./bedrock#boto3-认证)。
