import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Deepseek
https://deepseek.com/

**我们支持所有 DeepSeek 模型，发送补全（completion）请求时只需加上 `deepseek/` 前缀**

## API 密钥
```python
# env variable
os.environ['DEEPSEEK_API_KEY']
```

## 使用示例
```python
from litellm import completion
import os

os.environ['DEEPSEEK_API_KEY'] = ""
response = completion(
    model="deepseek/deepseek-chat", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 使用示例：流式
```python
from litellm import completion
import os

os.environ['DEEPSEEK_API_KEY'] = ""
response = completion(
    model="deepseek/deepseek-chat", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```


## 支持的模型：所有 DeepSeek 模型均可使用！
我们支持所有 DeepSeek 模型，发送补全请求时只需加上 `deepseek/` 前缀。

| 模型名               | 调用方式                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| deepseek-chat | `completion(model="deepseek/deepseek-chat", messages)` | 
| deepseek-coder | `completion(model="deepseek/deepseek-coder", messages)` | 
| deepseek-flash | `completion(model="deepseek/deepseek-flash", messages)` | 
| deepseek-v4-pro | `completion(model="deepseek/deepseek-v4-pro", messages)` | 


## 推理模型
| 模型名               | 调用方式                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| deepseek-reasoner | `completion(model="deepseek/deepseek-reasoner", messages)` |

### 思考 / 推理模式

通过 `thinking` 或 `reasoning_effort` 参数，为 DeepSeek reasoner 模型开启思考模式：

<Tabs>
<TabItem value="thinking" label="thinking 参数">

```python
from litellm import completion
import os

os.environ['DEEPSEEK_API_KEY'] = ""

resp = completion(
    model="deepseek/deepseek-reasoner",
    messages=[{"role": "user", "content": "What is 2+2?"}],
    thinking={"type": "enabled"},
)
print(resp.choices[0].message.reasoning_content)  # Model's reasoning
print(resp.choices[0].message.content)  # Final answer
```

</TabItem>
<TabItem value="reasoning_effort" label="reasoning_effort 参数">

```python
from litellm import completion
import os

os.environ['DEEPSEEK_API_KEY'] = ""

resp = completion(
    model="deepseek/deepseek-reasoner",
    messages=[{"role": "user", "content": "What is 2+2?"}],
    reasoning_effort="medium",  # low, medium, high all map to thinking enabled
)
print(resp.choices[0].message.reasoning_content)  # Model's reasoning
print(resp.choices[0].message.content)  # Final answer
```

</TabItem>
</Tabs>

:::note
DeepSeek 仅支持 `{"type": "enabled"}`；与 Anthropic 不同，它不支持 `budget_tokens`。`reasoning_effort` 只要取值不是 `"none"`，就会开启思考模式。
:::

### 基本用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['DEEPSEEK_API_KEY'] = ""
resp = completion(
    model="deepseek/deepseek-reasoner",
    messages=[{"role": "user", "content": "Tell me a joke."}],
)

print(
    resp.choices[0].message.reasoning_content
)
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: deepseek-reasoner
    litellm_params:
        model: deepseek/deepseek-reasoner
        api_key: os.environ/DEEPSEEK_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "deepseek-reasoner",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "Hi, how are you ?"
          }
        ]
      }
    ]
}'
```

</TabItem>

</Tabs>

## 低峰期定价

DeepSeek 在高峰时段之外按标价的一半计费。高峰时段为周一至周五的 UTC 01:00-04:00 和 06:00-10:00，中国法定节假日除外。其余时间均为低峰时段，周末与中国法定节假日全天按低峰计费。下表为每 1M token 的美元费率，取自 [DeepSeek 定价页](https://api-docs.deepseek.com/quick_start/pricing)，适用于 `deepseek-flash`（DeepSeek-V4.1-Flash）和 `deepseek-v4-pro`（DeepSeek-V4-Pro-0813）。

| 模型 | 费率 | 输入 | 输出 | 缓存命中 |
|-------|------|-------|--------|-----------|
| deepseek-flash | Peak | $0.30 | $1.20 | $0.006 |
| deepseek-flash | Off-peak | $0.15 | $0.60 | $0.003 |
| deepseek-v4-pro | Peak | $1.32 | $3.96 | $0.044 |
| deepseek-v4-pro | Off-peak | $0.66 | $1.98 | $0.022 |

LiteLLM 的成本追踪（cost tracking）会自动套用低峰费率。这些模型的内置成本映射条目已包含上述时段表，每笔请求按完成时刻的 UTC 时间与星期计价，因此无需任何额外配置，统计到的花费即可与 DeepSeek 账单对上。中国法定节假日未纳入时段模型，节假日期间高峰时段仍按高峰费率计费，属于小幅高估。旧模型名 `deepseek-v4-flash` 与 `deepseek-v4-flash-vision-exp` 实际由 DeepSeek-V4.1-Flash 提供，按 Flash 费率计费，低峰时段同样适用。要修改时段表或费率，或为其他部署（deployment）配置时段表，参见 [低峰期定价](../proxy/off_peak_pricing)。
