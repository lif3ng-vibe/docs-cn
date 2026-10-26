import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Z.AI (Zhipu AI)
https://z.ai/

**我们支持 Z.AI GLM 的文本/对话模型，发送补全（completion）请求时只需在模型名前加上 `zai/` 前缀**

## API 密钥
```python
# env variable
os.environ['ZAI_API_KEY']
```

## 使用示例
```python
from litellm import completion
import os

os.environ['ZAI_API_KEY'] = ""
response = completion(
    model="zai/glm-4.7",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 流式调用示例
```python
from litellm import completion
import os

os.environ['ZAI_API_KEY'] = ""
response = completion(
    model="zai/glm-4.7",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 支持的模型

我们支持全部 Z.AI GLM 模型，发送补全请求时只需在模型名前加上 `zai/` 前缀即可。

| 模型名称 | 调用方式 | 说明 |
|------------|---------------|-------|
| glm-4.7 | `completion(model="zai/glm-4.7", messages)` | **最新旗舰模型**，200K 上下文，**支持推理** |
| glm-4.6 | `completion(model="zai/glm-4.6", messages)` | 200K 上下文 |
| glm-4.5 | `completion(model="zai/glm-4.5", messages)` | 128K 上下文 |
| glm-4.5v | `completion(model="zai/glm-4.5v", messages)` | 视觉模型 |
| glm-4.5-x | `completion(model="zai/glm-4.5-x", messages)` | 高级档位 |
| glm-4.5-air | `completion(model="zai/glm-4.5-air", messages)` | 轻量版 |
| glm-4.5-airx | `completion(model="zai/glm-4.5-airx", messages)` | 高速轻量版 |
| glm-4-32b-0414-128k | `completion(model="zai/glm-4-32b-0414-128k", messages)` | 32B 参数模型 |
| glm-4.5-flash | `completion(model="zai/glm-4.5-flash", messages)` | **免费档** |

## 模型价格

| 模型 | 输入（$/1M tokens） | 输出（$/1M tokens） | 缓存输入（$/1M tokens） | 上下文窗口 |
|-------|---------------------|----------------------|---------------------------|----------------|
| glm-4.7 | $0.60 | $2.20 | $0.11 | 200K |
| glm-4.6 | $0.60 | $2.20 | - | 200K |
| glm-4.5 | $0.60 | $2.20 | - | 128K |
| glm-4.5v | $0.60 | $1.80 | - | 128K |
| glm-4.5-x | $2.20 | $8.90 | - | 128K |
| glm-4.5-air | $0.20 | $1.10 | - | 128K |
| glm-4.5-airx | $1.10 | $4.50 | - | 128K |
| glm-4-32b-0414-128k | $0.10 | $0.10 | - | 128K |
| glm-4.5-flash | **FREE** | **FREE** | - | 128K |

## 在 LiteLLM 代理中使用

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['ZAI_API_KEY'] = ""
response = completion(
    model="zai/glm-4.7",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: glm-4.7
    litellm_params:
        model: zai/glm-4.7
        api_key: os.environ/ZAI_API_KEY
  - model_name: glm-4.5-flash  # Free tier
    litellm_params:
        model: zai/glm-4.5-flash
        api_key: os.environ/ZAI_API_KEY
```

2. 启动代理

```bash
litellm --config config.yaml
```

3. 测试一下

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "glm-4.7",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ]
}'
```

</TabItem>
</Tabs>
