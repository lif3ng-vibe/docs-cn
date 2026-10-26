# 补全 Token 用量与成本
默认情况下，LiteLLM 会在所有补全请求中返回 Token 用量（[详见这里](https://litellm.readthedocs.io/en/latest/output/)）

LiteLLM 在所有调用中都会返回 `response_cost`。

```python
from litellm import completion

response = litellm.completion(
            model="{{openai_small}}",
            messages=[{"role": "user", "content": "Hey, how's it going?"}],
            mock_response="Hello world",
        )

print(response._hidden_params["response_cost"])
```

LiteLLM 还提供了一些辅助函数：

- `encode`：对传入的文本进行编码，使用模型对应的分词器。[**跳转到代码**](#1-encode)

- `decode`：对传入的 Token 进行解码，使用模型对应的分词器。[**跳转到代码**](#2-decode)

- `token_counter`：返回给定输入的 Token 数量。它会根据模型选用对应的分词器，如果没有模型专属分词器，则默认使用 tiktoken。[**跳转到代码**](#3-token_counter)

- `create_pretrained_tokenizer` 和 `create_tokenizer`：LiteLLM 为 OpenAI、Cohere、Anthropic、Llama2 和 Llama3 模型提供了默认分词器支持。如果你使用的是其他模型，可以创建自定义分词器，并作为 `custom_tokenizer` 传给 `encode`、`decode` 和 `token_counter` 方法。[**跳转到代码**](#4-create_pretrained_tokenizer-与-create_tokenizer)

- `cost_per_token`：返回提示词（输入）和补全（输出）Token 的单价（美元）。数据取自 `api.litellm.ai` 的实时列表。[**跳转到代码**](#5-cost_per_token)

- `completion_cost`：返回一次 LLM API 调用的总费用（美元）。它结合 `token_counter` 和 `cost_per_token`，算出该次查询的花费（同时计入输入和输出的开销）。[**跳转到代码**](#6-completion_cost)

- `get_max_tokens`：返回给定模型允许的最大 Token 数。[**跳转到代码**](#7-get_max_tokens)

- `model_cost`：返回一个包含所有模型的字典，记录各模型的 max_tokens、input_cost_per_token 和 output_cost_per_token。数据通过下文的 `api.litellm.ai` 调用获取。[**跳转到代码**](#8-model_cost)

- `register_model`：向模型成本字典中注册新模型，或覆盖现有模型（含其定价信息）。[**跳转到代码**](#9-register_model)

- `api.litellm.ai`：[所有支持的模型](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)的实时 Token 数量与价格统计。**跳转到代码**

📣 [这是一份社区维护的列表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)，欢迎贡献！❤️

## 使用示例

### 1. `encode`
anthropic、cohere、llama2 和 openai 均有模型专属的分词器。如果传入的模型不受支持，将默认使用 tiktoken（openai 的分词器）。

```python
from litellm import encode, decode

sample_text = "Hellö World, this is my input string!"
# openai encoding + decoding
openai_tokens = encode(model="{{openai_small}}", text=sample_text)
print(openai_tokens)
```

### 2. `decode`

anthropic、cohere、llama2 和 openai 均支持解码。

```python
from litellm import encode, decode

sample_text = "Hellö World, this is my input string!"
# openai encoding + decoding
openai_tokens = encode(model="{{openai_small}}", text=sample_text)
openai_text = decode(model="{{openai_small}}", tokens=openai_tokens)
print(openai_text)
```

### 3. `token_counter`

```python
from litellm import token_counter

messages = [{"user": "role", "content": "Hey, how's it going"}]
print(token_counter(model="{{openai_small}}", messages=messages))
```

### 4. `create_pretrained_tokenizer` 与 `create_tokenizer`

```python
from litellm import create_pretrained_tokenizer, create_tokenizer

# get tokenizer from huggingface repo
custom_tokenizer_1 = create_pretrained_tokenizer("Xenova/llama-3-tokenizer")

# use tokenizer from json file
with open("tokenizer.json") as f:
    json_data = json.load(f)

json_str = json.dumps(json_data)

custom_tokenizer_2 = create_tokenizer(json_str)
```

### 5. `cost_per_token`

```python
from litellm import cost_per_token

prompt_tokens =  5
completion_tokens = 10
prompt_tokens_cost_usd_dollar, completion_tokens_cost_usd_dollar = cost_per_token(model="{{openai_small}}", prompt_tokens=prompt_tokens, completion_tokens=completion_tokens)

print(prompt_tokens_cost_usd_dollar, completion_tokens_cost_usd_dollar)
```

### 6. `completion_cost`

* 输入：接受 `litellm.completion()` 的响应**或**提示词 + 补全字符串
* 输出：返回 `completion` 调用的费用，类型为 `float`

**litellm.completion()**
```python
from litellm import completion, completion_cost

response = completion(
            model="bedrock/us.anthropic.{{anthropic}}",
            messages=messages,
            request_timeout=200,
        )
# pass your response from completion to completion_cost
cost = completion_cost(completion_response=response)
formatted_string = f"${float(cost):.10f}"
print(formatted_string)
```

**提示词 + 补全字符串**
```python
from litellm import completion_cost
cost = completion_cost(model="bedrock/us.anthropic.{{anthropic}}", prompt="Hey!", completion="How's it going?")
formatted_string = f"${float(cost):.10f}"
print(formatted_string)
```
### 7. `get_max_tokens`

输入：接受一个模型名称，例如 gpt-5.6-luna（完整列表可调用 litellm.model_list 获取）。
输出：返回给定模型允许的最大 Token 数

```python
from litellm import get_max_tokens

model = "{{openai_small}}"

print(get_max_tokens(model)) # Output: 128000
```

### 8. `model_cost`

* 输出：返回一个字典对象，包含[社区维护列表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)中所有模型的 max_tokens、input_cost_per_token 和 output_cost_per_token

```python
from litellm import model_cost

print(model_cost) # {'{{openai_small}}': {'max_tokens': 128000, 'input_cost_per_token': 2e-07, 'output_cost_per_token': 1.2e-06}, ...}
```

### 9. `register_model`

* 输入：既可以传入模型成本字典，也可以传入托管 json blob 的 URL
* 输出：返回更新后的 model_cost 字典，并将模型详情同步写入 litellm.model_cost

**字典**
```python
import litellm

litellm.register_model({
        "{{openai_large}}": {
        "max_tokens": 128000,
        "input_cost_per_token": 0.000002,
        "output_cost_per_token": 0.000012,
        "litellm_provider": "openai",
        "mode": "chat"
    },
})
```

**json blob 的 URL**
```python
import litellm

litellm.register_model(model_cost=
"https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json")
```

**不拉取托管的 model_cost_map**  
如果你的环境有防火墙限制，只想使用模型成本表的本地副本，可以这样设置：
```bash
export LITELLM_LOCAL_MODEL_COST_MAP="True"
```

注意：这意味着你需要升级 LiteLLM，才能获取最新的定价和新模型。
