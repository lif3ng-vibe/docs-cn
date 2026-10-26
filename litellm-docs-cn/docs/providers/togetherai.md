import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Together AI
LiteLLM 支持 Together AI 上的所有模型。

## API 密钥

```python 
import os 
os.environ["TOGETHERAI_API_KEY"] = "your-api-key"
```
## 使用示例

```python
from litellm import completion 

os.environ["TOGETHERAI_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Write me a poem about the blue sky"}]

completion(model="together_ai/togethercomputer/Llama-2-7B-32K-Instruct", messages=messages)
```

## Together AI 模型
LiteLLM 支持向 https://api.together.xyz/ 上的所有模型发起 `non-streaming` 与 `streaming` 请求。

TogetherAI 使用示例——注意：LiteLLM 支持部署在 TogetherAI 上的所有模型。


### Llama LLM - 对话
| Model Name                        | Function Call                                                           | Required OS Variables              |
|-----------------------------------|-------------------------------------------------------------------------|------------------------------------|
| togethercomputer/llama-2-70b-chat | `completion('together_ai/togethercomputer/llama-2-70b-chat', messages)` | `os.environ['TOGETHERAI_API_KEY']` |

### Llama LLM - 语言 / 指令
| Model Name                               | Function Call                                                                  | Required OS Variables              |
|------------------------------------------|--------------------------------------------------------------------------------|------------------------------------|
| togethercomputer/llama-2-70b             | `completion('together_ai/togethercomputer/llama-2-70b', messages)`             | `os.environ['TOGETHERAI_API_KEY']` |
| togethercomputer/LLaMA-2-7B-32K          | `completion('together_ai/togethercomputer/LLaMA-2-7B-32K', messages)`          | `os.environ['TOGETHERAI_API_KEY']` |
| togethercomputer/Llama-2-7B-32K-Instruct | `completion('together_ai/togethercomputer/Llama-2-7B-32K-Instruct', messages)` | `os.environ['TOGETHERAI_API_KEY']` |
| togethercomputer/llama-2-7b              | `completion('together_ai/togethercomputer/llama-2-7b', messages)`              | `os.environ['TOGETHERAI_API_KEY']` |

### Falcon LLM
| Model Name                           | Function Call                                                              | Required OS Variables              |
|--------------------------------------|----------------------------------------------------------------------------|------------------------------------|
| togethercomputer/falcon-40b-instruct | `completion('together_ai/togethercomputer/falcon-40b-instruct', messages)` | `os.environ['TOGETHERAI_API_KEY']` |
| togethercomputer/falcon-7b-instruct  | `completion('together_ai/togethercomputer/falcon-7b-instruct', messages)`  | `os.environ['TOGETHERAI_API_KEY']` |

### Alpaca LLM
| Model Name                 | Function Call                                                    | Required OS Variables              |
|----------------------------|------------------------------------------------------------------|------------------------------------|
| togethercomputer/alpaca-7b | `completion('together_ai/togethercomputer/alpaca-7b', messages)` | `os.environ['TOGETHERAI_API_KEY']` |

### 其他对话 LLM
| Model Name                   | Function Call                                                      | Required OS Variables              |
|------------------------------|--------------------------------------------------------------------|------------------------------------|
| HuggingFaceH4/starchat-alpha | `completion('together_ai/HuggingFaceH4/starchat-alpha', messages)` | `os.environ['TOGETHERAI_API_KEY']` |

### 代码 LLM
| Model Name                              | Function Call                                                                 | Required OS Variables              |
|-----------------------------------------|-------------------------------------------------------------------------------|------------------------------------|
| togethercomputer/CodeLlama-34b          | `completion('together_ai/togethercomputer/CodeLlama-34b', messages)`          | `os.environ['TOGETHERAI_API_KEY']` |
| togethercomputer/CodeLlama-34b-Instruct | `completion('together_ai/togethercomputer/CodeLlama-34b-Instruct', messages)` | `os.environ['TOGETHERAI_API_KEY']` |
| togethercomputer/CodeLlama-34b-Python   | `completion('together_ai/togethercomputer/CodeLlama-34b-Python', messages)`   | `os.environ['TOGETHERAI_API_KEY']` |
| defog/sqlcoder                          | `completion('together_ai/defog/sqlcoder', messages)`                          | `os.environ['TOGETHERAI_API_KEY']` |
| NumbersStation/nsql-llama-2-7B          | `completion('together_ai/NumbersStation/nsql-llama-2-7B', messages)`          | `os.environ['TOGETHERAI_API_KEY']` |
| WizardLM/WizardCoder-15B-V1.0           | `completion('together_ai/WizardLM/WizardCoder-15B-V1.0', messages)`           | `os.environ['TOGETHERAI_API_KEY']` |
| WizardLM/WizardCoder-Python-34B-V1.0    | `completion('together_ai/WizardLM/WizardCoder-Python-34B-V1.0', messages)`    | `os.environ['TOGETHERAI_API_KEY']` |

### 语言 LLM
| Model Name                          | Function Call                                                             | Required OS Variables              |
|-------------------------------------|---------------------------------------------------------------------------|------------------------------------|
| NousResearch/Nous-Hermes-Llama2-13b | `completion('together_ai/NousResearch/Nous-Hermes-Llama2-13b', messages)` | `os.environ['TOGETHERAI_API_KEY']` |
| Austism/chronos-hermes-13b          | `completion('together_ai/Austism/chronos-hermes-13b', messages)`          | `os.environ['TOGETHERAI_API_KEY']` |
| upstage/SOLAR-0-70b-16bit           | `completion('together_ai/upstage/SOLAR-0-70b-16bit', messages)`           | `os.environ['TOGETHERAI_API_KEY']` |
| WizardLM/WizardLM-70B-V1.0          | `completion('together_ai/WizardLM/WizardLM-70B-V1.0', messages)`          | `os.environ['TOGETHERAI_API_KEY']` |


## 提示词模板

Together AI 上的对话模型用的是它自己的提示词格式？

### 使用 Llama2 Instruct 模型
如果你使用的是 Together AI 的 Llama2 变体（`model=togethercomputer/llama-2..-instruct`），LiteLLM 可以自动在 OpenAI 提示词格式与 TogetherAI 的 Llama2 格式（`[INST]..[/INST]`）之间互转。

```python
from litellm import completion 

# set env variable 
os.environ["TOGETHERAI_API_KEY"] = ""

messages = [{"role": "user", "content": "Write me a poem about the blue sky"}]

completion(model="together_ai/togethercomputer/Llama-2-7B-32K-Instruct", messages=messages)
```

### 使用其他模型

你可以在 LiteLLM 中创建自定义提示词模板（我们也[欢迎提交 PR](https://github.com/BerriAI/litellm)，把它们加入主仓库 🤗）

我们来为 `OpenAssistant/llama2-70b-oasst-sft-v10` 做一个吧！

它接受的模板格式如下：[参考](https://huggingface.co/OpenAssistant/llama2-70b-oasst-sft-v10-)
```
"""
<|im_start|>system
{system_message}<|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant
"""
```

接着注册这个自定义提示词模板：[实现代码](https://github.com/BerriAI/litellm/blob/64f3d3c56ef02ac5544983efc78293de31c1c201/litellm/llms/prompt_templates/factory.py#L77)
```python
import litellm 

litellm.register_prompt_template(
	    model="OpenAssistant/llama2-70b-oasst-sft-v10",
	    roles={
            "system": {
                "pre_message": "[<|im_start|>system",
                "post_message": "\n"
            },
            "user": {
                "pre_message": "<|im_start|>user",
                "post_message": "\n"
            }, 
            "assistant": {
                "pre_message": "<|im_start|>assistant",
                "post_message": "\n"
            }
        }
    )
```

来试试吧！

```python
from litellm import completion 

# set env variable 
os.environ["TOGETHERAI_API_KEY"] = ""

messages=[{"role":"user", "content": "Write me a poem about the blue sky"}]

completion(model="together_ai/OpenAssistant/llama2-70b-oasst-sft-v10", messages=messages)
```

**完整代码**

```python
import litellm 
from litellm import completion

# set env variable 
os.environ["TOGETHERAI_API_KEY"] = ""

litellm.register_prompt_template(
	    model="OpenAssistant/llama2-70b-oasst-sft-v10",
	    roles={
            "system": {
                "pre_message": "[<|im_start|>system",
                "post_message": "\n"
            },
            "user": {
                "pre_message": "<|im_start|>user",
                "post_message": "\n"
            }, 
            "assistant": {
                "pre_message": "<|im_start|>assistant",
                "post_message": "\n"
            }
        }
    )

messages=[{"role":"user", "content": "Write me a poem about the blue sky"}]

response = completion(model="together_ai/OpenAssistant/llama2-70b-oasst-sft-v10", messages=messages)

print(response)
```

**输出**
```json
{
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": ".\n\nThe sky is a canvas of blue,\nWith clouds that drift and move,",
        "role": "assistant",
        "logprobs": null
      }
    }
  ],
  "created": 1693941410.482018,
  "model": "OpenAssistant/llama2-70b-oasst-sft-v10",
  "usage": {
    "prompt_tokens": 7,
    "completion_tokens": 16,
    "total_tokens": 23
  },
  "litellm_call_id": "f21315db-afd6-4c1e-b43a-0b5682de4b06"
}
```


## 通过 `chat_template_kwargs` 控制推理

Together 通过请求级的 `chat_template_kwargs` 对象来控制它的推理模型（见 [Together 文档](https://docs.together.ai/docs/deepseek-v3-1#hybrid-reasoning-model)）。无论走 SDK 还是任何代理端点（`/v1/chat/completions`、`/v1/messages`、`/v1/responses`），包括流式请求，LiteLLM 都会原样透传该对象，因此 Together 为你的模型文档化的一切键都可以直接使用。Together 会在服务端校验这些键，并静默忽略模型不支持的键。

### 切换混合推理模型的思考模式

混合推理模型（如 `Qwen/Qwen3.5-9B`）默认开启思考；传入 `{"thinking": false}` 即可关闭。

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK 用法">

```python
from litellm import completion
import os

os.environ["TOGETHERAI_API_KEY"] = "your-api-key"

response = completion(
    model="together_ai/Qwen/Qwen3.5-9B",
    messages=[{"role": "user", "content": "What is 17*23? Answer with just the number."}],
    chat_template_kwargs={"thinking": False},
)
print(response.choices[0].message.content)  # direct answer, no reasoning_content
```
</TabItem>

<TabItem value="proxy" label="LiteLLM 代理用法">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen3.5-9B",
    "messages": [{"role": "user", "content": "What is 17*23? Answer with just the number."}],
    "chat_template_kwargs": {"thinking": false}
  }'
```

</TabItem>
</Tabs>

### 跨轮次保留思考内容

`zai-org/GLM-5.2` 这类模型默认会从提示词中清除之前轮次的推理内容。传入 `{"clear_thinking": false}` 可以将其保留，但前提是重放每一轮 assistant 消息时，把该轮的 `reasoning_content` 原封不动地连同 `content` 一起带上。LiteLLM 会把重放的 `reasoning_content` 转发给 Together，并从发出的请求中剔除自身的簿记字段（`thinking_blocks`、`provider_specific_fields`），因此直接原样重放 LiteLLM 的响应对象是安全的。

```python
from litellm import completion
import os

os.environ["TOGETHERAI_API_KEY"] = "your-api-key"

first = completion(
    model="together_ai/zai-org/GLM-5.2",
    messages=[{"role": "user", "content": "Pick a secret two-digit number. Reply with only the sum of its digits."}],
)

followup = completion(
    model="together_ai/zai-org/GLM-5.2",
    messages=[
        {"role": "user", "content": "Pick a secret two-digit number. Reply with only the sum of its digits."},
        {
            "role": "assistant",
            "content": first.choices[0].message.content,
            "reasoning_content": first.choices[0].message.reasoning_content,
        },
        {"role": "user", "content": "What was the secret number? Reply with only the number."},
    ],
    chat_template_kwargs={"clear_thinking": False},
)
print(followup.choices[0].message.content)  # recalls the number from the replayed reasoning
```

把 Anthropic SDK 客户端指向代理的 `/v1/messages` 端点时，也能得到同样的行为：重放 assistant 的 `thinking` 块，并在请求顶层传入 `chat_template_kwargs: {"clear_thinking": false}` 即可。

## 重排序

### 用法



<Tabs>
<TabItem value="sdk" label="LiteLLM SDK 用法">

```python
from litellm import rerank
import os

os.environ["TOGETHERAI_API_KEY"] = "sk-.."

query = "What is the capital of the United States?"
documents = [
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Washington, D.C. is the capital of the United States.",
    "Capital punishment has existed in the United States since before it was a country.",
]

response = rerank(
    model="together_ai/rerank-english-v3.0",
    query=query,
    documents=documents,
    top_n=3,
)
print(response)
```
</TabItem>

<TabItem value="proxy" label="LiteLLM 代理用法">

LiteLLM 提供了与 Cohere API 兼容的 `/rerank` 端点，用于处理重排序调用。

**设置**

将以下配置添加到 LiteLLM 代理的 config.yaml 中

```yaml
model_list:
  - model_name: Salesforce/Llama-Rank-V1
    litellm_params:
      model: together_ai/Salesforce/Llama-Rank-V1
      api_key: os.environ/TOGETHERAI_API_KEY
```

启动 litellm

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

测试请求

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Salesforce/Llama-Rank-V1",
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

</TabItem>
</Tabs>
