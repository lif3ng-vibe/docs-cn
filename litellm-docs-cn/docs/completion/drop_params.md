import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 丢弃不支持的参数

丢弃你的 LLM 提供商（provider）不支持的 OpenAI 参数。

## 默认行为

默认情况下，**如果你向模型传入它不支持的参数，LiteLLM 会抛出异常**。

举例来说，如果你给一个不支持 `temperature` 参数的模型发送 `temperature=0.2`，LiteLLM 就会抛出异常。

**而当设置了 `drop_params=True` 时**，LiteLLM 会改为丢弃这个不支持的参数，而不是抛出异常。这样你的代码无需为每家提供商单独调整参数，就能在不同提供商之间通用。

## 快速上手

```python
import litellm
import os

# set keys
os.environ["COHERE_API_KEY"] = "co-.."

litellm.drop_params = True # 👈 KEY CHANGE

response = litellm.completion(
                model="command-r",
                messages=[{"role": "user", "content": "Hey, how's it going?"}],
                response_format={"key": "value"},
            )
```


LiteLLM 按"提供商 + 模型"的粒度维护所有受支持的 OpenAI 参数（例如 Anthropic 在 Bedrock 上的模型支持函数调用（function calling），而 Titan 模型不支持）。

参见 `litellm.get_supported_openai_params("command-r")` 的[**源码**](https://github.com/BerriAI/litellm/blob/main/litellm/utils.py#L3584)

如果某个提供商或模型不支持某个特定参数，你可以选择丢弃它。

## OpenAI 代理用法

```yaml
litellm_settings:
    drop_params: true
```

## 在 `completion(..)` 中传入 drop_params

只需在调用特定模型时传入 drop_params 即可

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
import os

# set keys
os.environ["COHERE_API_KEY"] = "co-.."

response = litellm.completion(
                model="command-r",
                messages=[{"role": "user", "content": "Hey, how's it going?"}],
                response_format={"key": "value"},
                drop_params=True
            )
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
- litellm_params:
    api_base: my-base
    model: openai/my-model
    drop_params: true # 👈 KEY CHANGE
  model_name: my-model
```
</TabItem>
</Tabs>

## 指定要丢弃的参数

调用某个提供商时只想丢弃特定参数（例如 vLLM 的 "logit_bias"）

使用 `additional_drop_params`

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
import os

# set keys
os.environ["COHERE_API_KEY"] = "co-.."

response = litellm.completion(
                model="command-r",
                messages=[{"role": "user", "content": "Hey, how's it going?"}],
                response_format={"key": "value"},
                additional_drop_params=["response_format"]
            )
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
- litellm_params:
    api_base: my-base
    model: openai/my-model
    additional_drop_params: ["response_format"] # 👈 KEY CHANGE
  model_name: my-model
```
</TabItem>
</Tabs>

**additional_drop_params**：列表或 null，即在调用模型时你希望丢弃的 OpenAI 参数列表。

### 移除嵌套字段

支持用类 JSONPath 的写法，丢弃复杂对象中的嵌套字段：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

response = litellm.completion(
    model="bedrock/us.anthropic.{{anthropic}}",
    messages=[{"role": "user", "content": "Hello"}],
    tools=[{
        "name": "search",
        "description": "Search files",
        "input_schema": {"type": "object", "properties": {"query": {"type": "string"}}},
        "input_examples": [{"query": "test"}]  # Will be removed
    }],
    additional_drop_params=["tools[*].input_examples"]  # Remove from all tools
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: my-bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      additional_drop_params: ["tools[*].input_examples"]  # Remove from all tools
```

</TabItem>
</Tabs>

**支持的语法**：
- `field`：顶层字段
- `parent.child`：嵌套对象的字段
- `array[*]`：数组的所有元素
- `array[0]`：数组的指定下标
- `tools[*].input_examples`：所有数组元素中的该字段
- `tools[0].metadata.field`：指定下标 + 嵌套字段

**典型用例**：
- 从工具定义中移除 `input_examples`（Claude Code + AWS Bedrock 场景）
- 从嵌套结构中去掉提供商特有的字段
- 在把参数发给 LLM 之前清理嵌套参数

## 在请求中指定允许的 OpenAI 参数

告诉 litellm 在请求中允许哪些特定的 OpenAI 参数。如果你遇到 `litellm.UnsupportedParamsError`，又希望放行某个参数，就可以用它。LiteLLM 会将该参数原样传给模型。



<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

本例传入 `allowed_openai_params=["tools"]`，放行 `tools` 参数。

```python showLineNumbers title="向 LiteLLM Python SDK 传入 allowed_openai_params"
await litellm.acompletion(
    model="azure/o_series/<my-deployment-name>",
    api_key="xxxxx",
    api_base=api_base,
    messages=[{"role": "user", "content": "Hello! return a json object"}],
    tools=[{"type": "function", "function": {"name": "get_current_time", "description": "Get the current time in a given location.", "parameters": {"type": "object", "properties": {"location": {"type": "string", "description": "The city name, e.g. San Francisco"}}, "required": ["location"]}}}],
    allowed_openai_params=["tools"],
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

使用 litellm 代理时，有两种传入 `allowed_openai_params` 的方式：

1. 在请求中动态传入 `allowed_openai_params`
2. 在 config.yaml 中为特定模型设置 `allowed_openai_params`

#### 在请求中动态传入 allowed_openai_params
本例传入 `allowed_openai_params=["tools"]`，为发送到代理上所配置模型的请求放行 `tools` 参数。

```python showLineNumbers title="在请求中动态传入 allowed_openai_params"
import openai
from openai import AsyncAzureOpenAI

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{openai_small}}",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
        "allowed_openai_params": ["tools"]
    }
)
```

#### 在 config.yaml 中设置 allowed_openai_params

你也可以在 config.yaml 中为特定模型设置 `allowed_openai_params`，这样所有发往该部署（deployment）的请求都允许传入 `tools` 参数。

```yaml showLineNumbers title="在 config.yaml 中设置 allowed_openai_params"
model_list:
  - model_name: azure-o1-preview
    litellm_params:
      model: azure/o_series/<my-deployment-name>
      api_key: xxxxx
      api_base: https://openai-prod-test.openai.azure.com/openai/deployments/o1/chat/completions?api-version=2025-01-01-preview
      allowed_openai_params: ["tools"]
```
</TabItem>
</Tabs>
