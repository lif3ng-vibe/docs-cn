import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# vLLM

LiteLLM 支持 vLLM 上的所有模型。

| 属性 | 说明 |
|-------|-------|
| 描述 | vLLM 是一个快速、易用的 LLM 推理与服务库。[文档](https://docs.vllm.ai/en/latest/index.html) |
| LiteLLM 中的提供商（provider）路由 | `hosted_vllm/`（对应 OpenAI 兼容服务器），`vllm/`（对应 vLLM SDK 用法，[已废弃]） |
| 提供商文档 | [vLLM ↗](https://docs.vllm.ai/en/latest/index.html) |
| 支持的端点 | `/chat/completions`、`/embeddings`、`/completions`、`/rerank`、`/audio/transcriptions` |


## 快速上手

## 用法 - litellm.completion（调用 OpenAI 兼容端点）
vLLM 提供 OpenAI 兼容端点，下面介绍如何通过 LiteLLM 调用它。

要用 litellm 调用托管的 vLLM 服务器，请在补全（completion）调用中加入以下两项：

* `model="hosted_vllm/<your-vllm-model-name>"` 
* `api_base = "your-hosted-vllm-server"`

```python
import litellm 

response = litellm.completion(
            model="hosted_vllm/facebook/opt-125m", # pass the vllm model name
            messages=messages,
            api_base="https://hosted-vllm-api.co",
            temperature=0.2,
            max_tokens=80)

print(response)
```


## 用法 - LiteLLM 代理服务器（调用 OpenAI 兼容端点）

下面演示如何通过 LiteLLM 代理服务器（Proxy Server）调用 OpenAI 兼容端点。

1. 修改 config.yaml

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: hosted_vllm/facebook/opt-125m  # add hosted_vllm/ prefix to route as OpenAI provider
        api_base: https://hosted-vllm-api.co      # add api base for OpenAI compatible provider
  ```

2. 启动代理 

  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. 向 LiteLLM 代理服务器发送请求

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python
  import openai
  client = openai.OpenAI(
      api_key="sk-<your-litellm-api-key>",             # pass litellm proxy key, if you're using virtual keys
      base_url="http://0.0.0.0:4000" # litellm-proxy-base url
  )

  response = client.chat.completions.create(
      model="my-model",
      messages = [
          {
              "role": "user",
              "content": "what llm are you"
          }
      ],
  )

  print(response)
  ```
  </TabItem>

  <TabItem value="curl" label="curl">

  ```shell
  curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header "Authorization: Bearer $LITELLM_API_KEY" \
      --header 'Content-Type: application/json' \
      --data '{
      "model": "my-model",
      "messages": [
          {
          "role": "user",
          "content": "what llm are you"
          }
      ],
  }'
  ```
  </TabItem>

  </Tabs>

  ## 推理力度

  <Tabs>
  <TabItem value="sdk" label="SDK">

  ```python
  from litellm import completion

  response = completion(
      model="hosted_vllm/gpt-oss-120b",
      messages=[{"role": "user", "content": "whats 2 + 2"}],
      reasoning_effort="high",
      api_base="https://hosted-vllm-api.co",
  )
  print(response)
  ```
  </TabItem>
  <TabItem value="proxy" label="PROXY">

  1. 配置 config.yaml

  ```yaml
  model_list:
    - model_name: gpt-oss-120b
      litellm_params:
        model: hosted_vllm/gpt-oss-120b
        api_base: https://hosted-vllm-api.co
  ```

  2. 启动代理

  ```bash
  litellm --config /path/to/config.yaml
  ```

  3. 测试一下

  ```bash
  curl http://0.0.0.0:4000/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{"model": "gpt-oss-120b", "messages": [{"role": "user", "content": "whats 2 + 2"}], "reasoning_effort": "high"}'
  ```

  </TabItem>
  </Tabs>


## 嵌入

vLLM 提供 OpenAI 兼容的 `/v1/embeddings` 端点。当客户端省略 `encoding_format` 时，LiteLLM 会为 OpenAI 兼容的嵌入（embedding）路由填上默认值（依次回退：请求参数 → 模型 `litellm_params` → `LITELLM_DEFAULT_EMBEDDING_ENCODING_FORMAT` → `float`）。参见[嵌入](../proxy/embedding.md#embedding-encoding-format)。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding   
import os

os.environ["HOSTED_VLLM_API_BASE"] = "http://localhost:8000"


embedding = embedding(model="hosted_vllm/facebook/opt-125m", input=["Hello world"])

print(embedding)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: my-model
      litellm_params:
        model: hosted_vllm/facebook/opt-125m  # add hosted_vllm/ prefix to route as OpenAI provider
        api_base: https://hosted-vllm-api.co      # add api base for OpenAI compatible provider
```

2. 启动代理 

```bash
$ litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下 

```bash
curl -L -X POST 'http://0.0.0.0:4000/embeddings' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{"input": ["hello world"], "model": "my-model"}'
```

[查看 OpenAI SDK/Langchain 等示例](../proxy/user_keys.md#embeddings)

</TabItem>
</Tabs>

## 重排序

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import rerank
import os

os.environ["HOSTED_VLLM_API_BASE"] = "http://localhost:8000"
os.environ["HOSTED_VLLM_API_KEY"] = ""  # [optional], if your VLLM server requires an API key

query = "What is the capital of the United States?"
documents = [
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Washington, D.C. is the capital of the United States.",
    "Capital punishment has existed in the United States since before it was a country.",
]

response = rerank(
    model="hosted_vllm/your-rerank-model",
    query=query,
    documents=documents,
    top_n=3,
)
print(response)
```

### 异步用法

```python
from litellm import arerank
import os, asyncio

os.environ["HOSTED_VLLM_API_BASE"] = "http://localhost:8000"
os.environ["HOSTED_VLLM_API_KEY"] = ""  # [optional], if your VLLM server requires an API key

async def test_async_rerank(): 
    query = "What is the capital of the United States?"
    documents = [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country.",
    ]

    response = await arerank(
        model="hosted_vllm/your-rerank-model",
        query=query,
        documents=documents,
        top_n=3,
    )
    print(response)

asyncio.run(test_async_rerank())
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: my-rerank-model
      litellm_params:
        model: hosted_vllm/your-rerank-model  # add hosted_vllm/ prefix to route as VLLM provider
        api_base: http://localhost:8000      # add api base for your VLLM server
        # api_key: your-api-key             # [optional] if your VLLM server requires authentication
```

2. 启动代理 

```bash
$ litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下 

```bash
curl -L -X POST 'http://0.0.0.0:4000/rerank' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "model": "my-rerank-model",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "top_n": 3
}'
```

[查看 OpenAI SDK/Langchain 等示例](../rerank.md#litellm-proxy-usage)

</TabItem>
</Tabs>

### 截断长文档

vLLM 的 `/rerank` 端点自带截断控制参数，只要设置了这些参数，LiteLLM 就会把它们透传给 `hosted_vllm` 的重排序（rerank）模型。若一个都不设，文档长度一旦超过重排序模型的上下文窗口（context window），调用就会报上下文长度错误而失败。

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `truncate_prompt_tokens` | integer | 打分前，把每对查询与文档截断到这个 Token 数 |
| `truncation_side` | `left` 或 `right` | 输入从哪一端截掉 |
| `max_tokens_per_doc` | integer | 每篇文档最多计入这么多 Token |
| `max_tokens_per_query` | integer | 查询最多计入这么多 Token |

如果取值不合法（比如 `truncation_side: "middle"`），请求在发往 vLLM 之前就会返回 400。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import rerank

response = rerank(
    model="hosted_vllm/your-rerank-model",
    query="What is the capital of the United States?",
    documents=["<a document longer than the reranker context window>"],
    truncate_prompt_tokens=512,
    truncation_side="left",
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl -L -X POST 'http://0.0.0.0:4000/rerank' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "model": "my-rerank-model",
    "query": "What is the capital of the United States?",
    "documents": ["<a document longer than the reranker context window>"],
    "truncate_prompt_tokens": 512,
    "truncation_side": "left"
}'
```

</TabItem>
</Tabs>

## 图像编辑

vLLM-Omni 为 `Qwen/Qwen-Image-Edit-2511` 这类图像编辑模型提供 OpenAI 兼容的 `/v1/images/edits` 端点。使用 `hosted_vllm/` 前缀，并把 `api_base` 指向 vLLM-Omni 服务器；`seed`、`negative_prompt` 等额外的提供商字段会作为表单字段透传。vLLM-Omni 没有 `quality` 和 `input_fidelity` 表单字段，遮罩要用 `mask_image`（一个 URL 字符串）传入，而不是 OpenAI 的 `mask` 文件，因此对 `hosted_vllm/` 模型，LiteLLM 会拒绝 `mask`、`quality`、`input_fidelity` 这几个参数，除非设置 `drop_params: true`，此时它们会在请求发出前被丢弃。要做遮罩编辑，请把遮罩的 URL 作为额外字段传给 `mask_image`。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import image_edit
import os

os.environ["HOSTED_VLLM_API_BASE"] = "http://localhost:8091"

response = image_edit(
    model="hosted_vllm/Qwen/Qwen-Image-Edit-2511",
    image=open("original_image.png", "rb"),
    prompt="Add a red hat to the person in the image",
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: qwen-image-edit
      litellm_params:
        model: hosted_vllm/Qwen/Qwen-Image-Edit-2511  # add hosted_vllm/ prefix to route as OpenAI provider
        api_base: http://localhost:8091              # your vLLM-Omni server
      model_info:
        mode: image_edit
```

2. 启动代理 

```bash
$ litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下 

```bash
curl -X POST 'http://0.0.0.0:4000/v1/images/edits' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-F 'model=qwen-image-edit' \
-F 'image=@original_image.png' \
-F 'prompt=Add a red hat to the person in the image'
```

</TabItem>
</Tabs>

## 向 vLLM 发送视频 URL

vLLM 侧的示例实现见[这里](https://github.com/vllm-project/vllm/pull/10020)

<Tabs>
<TabItem value="files_message" label="（统一格式）Files 消息">

这种方式借助 OpenAI 的 `files` 消息类型，用同一套格式同时向 vLLM 和 Gemini 发送视频 URL。

向 vLLM 发送视频 URL 有两种方式：

1. 直接传入视频 URL

```
{"type": "file", "file": {"file_id": video_url}},
```

2. 以 base64 传入视频数据

```
{"type": "file", "file": {"file_data": f"data:video/mp4;base64,{video_data_base64}"}}
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

messages=[
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "Summarize the following video"
            },
            {
                "type": "file",
                "file": {
                    "file_id": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                }
            }
        ]
    }
]

# call vllm 
os.environ["HOSTED_VLLM_API_BASE"] = "https://hosted-vllm-api.co"
os.environ["HOSTED_VLLM_API_KEY"] = "" # [optional], if your VLLM server requires an API key
response = completion(
    model="hosted_vllm/qwen", # pass the vllm model name
    messages=messages,
)

# call gemini 
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"
response = completion(
    model="gemini/{{gemini_flash}}", # pass the gemini model name
    messages=messages,
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: my-model
      litellm_params:
        model: hosted_vllm/qwen  # add hosted_vllm/ prefix to route as OpenAI provider
        api_base: https://hosted-vllm-api.co      # add api base for OpenAI compatible provider
    - model_name: my-gemini-model
      litellm_params:
        model: gemini/{{gemini_flash}}  # add gemini/ prefix to route as Google AI Studio provider
        api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理 

```bash
$ litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下 

```bash
curl -X POST http://0.0.0.0:4000/chat/completions \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "my-model",
    "messages": [
        {"role": "user", "content": 
            [
                {"type": "text", "text": "Summarize the following video"},
                {"type": "file", "file": {"file_id": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}}
            ]
        }
    ]
}'
```

</TabItem>
</Tabs>


</TabItem>
<TabItem value="video_url" label="（vLLM 专用）视频消息">

这种方式用 vLLM 原生的消息格式（`video_url`）发送视频 URL。

向 vLLM 发送视频 URL 有两种方式：

1. 直接传入视频 URL

```
{"type": "video_url", "video_url": {"url": video_url}},
```

2. 以 base64 传入视频数据

```
{"type": "video_url", "video_url": {"url": f"data:video/mp4;base64,{video_data_base64}"}}
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
            model="hosted_vllm/qwen", # pass the vllm model name
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Summarize the following video"
                        },
                        {
                            "type": "video_url",
                            "video_url": {
                                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            }
                        }
                    ]
                }
            ],
            api_base="https://hosted-vllm-api.co")

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: my-model
      litellm_params:
        model: hosted_vllm/qwen  # add hosted_vllm/ prefix to route as OpenAI provider
        api_base: https://hosted-vllm-api.co      # add api base for OpenAI compatible provider
```

2. 启动代理 

```bash
$ litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下 

```bash
curl -X POST http://0.0.0.0:4000/chat/completions \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "my-model",
    "messages": [
        {"role": "user", "content": 
            [
                {"type": "text", "text": "Summarize the following video"},
                {"type": "video_url", "video_url": {"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}}
            ]
        }
    ]
}'
```

</TabItem>
</Tabs>


</TabItem>
</Tabs>


## （已废弃）适用于打包安装的 `vllm`
### 用法 - `litellm.completion`

```
uv add litellm vllm
```
```python
import litellm 

response = litellm.completion(
            model="vllm/facebook/opt-125m", # add a vllm prefix so litellm knows the custom_llm_provider==vllm
            messages=messages,
            temperature=0.2,
            max_tokens=80)

print(response)
```


### 批量补全

```python
from litellm import batch_completion

model_name = "facebook/opt-125m"
provider = "vllm"
messages = [[{"role": "user", "content": "Hey, how's it going"}] for _ in range(5)]

response_list = batch_completion(
            model=model_name, 
            custom_llm_provider=provider, # can easily switch to huggingface, replicate, together ai, sagemaker, etc.
            messages=messages,
            temperature=0.2,
            max_tokens=80,
        )
print(response_list)
```
### 提示词模板

对带有特殊提示词模板（prompt template）的模型（如 Llama2），我们会把提示词格式化成符合其模板的形式。

**我们不支持你需要的模型怎么办**？
如果内置模板还没覆盖你的模型，也可以自行指定自定义的提示词格式。

**这是否意味着所有模型都要指定提示词**？
不用。默认会把你的消息内容拼接成提示词（Bloom、T-5、Llama-2 base 等模型预期的格式）。

**默认提示词模板**
```python
def default_pt(messages):
    return " ".join(message["content"] for message in messages)
```

[LiteLLM 提示词模板的实现代码](https://github.com/BerriAI/litellm/blob/main/litellm/llms/prompt_templates/factory.py)


#### 已内置提示词模板的模型

| 模型名                              | 适用模型                         | 函数调用                                                                                                    |
|--------------------------------------|-----------------------------------|------------------------------------------------------------------------------------------------------------------|
| meta-llama/Llama-2-7b-chat           | 所有 meta-llama llama2 对话模型 | `completion(model='vllm/meta-llama/Llama-2-7b', messages=messages, api_base="your_api_endpoint")`                |
| tiiuae/falcon-7b-instruct            | 所有 falcon 指令模型        | `completion(model='vllm/tiiuae/falcon-7b-instruct', messages=messages, api_base="your_api_endpoint")`            |
| mosaicml/mpt-7b-chat                 | 所有 mpt 对话模型               | `completion(model='vllm/mosaicml/mpt-7b-chat', messages=messages, api_base="your_api_endpoint")`                 |
| codellama/CodeLlama-34b-Instruct-hf  | 所有 codellama 指令模型     | `completion(model='vllm/codellama/CodeLlama-34b-Instruct-hf', messages=messages, api_base="your_api_endpoint")`  |
| WizardLM/WizardCoder-Python-34B-V1.0 | 所有 wizardcoder 模型            | `completion(model='vllm/WizardLM/WizardCoder-Python-34B-V1.0', messages=messages, api_base="your_api_endpoint")` |
| Phind/Phind-CodeLlama-34B-v2         | 所有 phind-codellama 模型        | `completion(model='vllm/Phind/Phind-CodeLlama-34B-v2', messages=messages, api_base="your_api_endpoint")`         |

#### 自定义提示词模板

```python 
# Create your own custom prompt template works 
litellm.register_prompt_template(
	model="togethercomputer/LLaMA-2-7B-32K",
	roles={
            "system": {
                "pre_message": "[INST] <<SYS>>\n",
                "post_message": "\n<</SYS>>\n [/INST]\n"
            },
            "user": { 
                "pre_message": "[INST] ",
                "post_message": " [/INST]\n"
            }, 
            "assistant": {
                "pre_message": "\n",
                "post_message": "\n",
            }
        } # tell LiteLLM how you want to map the openai messages to this model
)

def test_vllm_custom_model():
    model = "vllm/togethercomputer/LLaMA-2-7B-32K"
    response = completion(model=model, messages=messages)
    print(response['choices'][0]['message']['content'])
    return response

test_vllm_custom_model()
```

[实现代码](https://github.com/BerriAI/litellm/blob/6b3cb1898382f2e4e80fd372308ea232868c78d1/litellm/utils.py#L1414)
