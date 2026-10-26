import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 语义自动路由器（已弃用）

:::warning[已弃用]

语义自动路由器已被[自动路由](./auto_routing.md)取代，后者把语义关键词匹配、复杂度评分与自适应路由整合进单一的 `auto_router/complexity_router`。新部署请直接使用该方案；本页仅保留给已有配置参考。

:::

LiteLLM 可以根据你定义的规则，为请求自动挑选最合适的模型。

<Image alt="自动路由" img={require('../../img/auto_router.png')} style={{ borderRadius: '8px', marginBottom: '1em', maxWidth: '100%' }} />

## LiteLLM Python SDK

自动路由（auto routing）让你定义一组路由规则，依据请求的输入内容自动选出最合适的模型，适合把不同类型的查询分发给各自专长的模型。

### 设置

1. **创建路由器配置文件**（例如 `router.json`）：

```json
{
    "encoder_type": "openai",
    "encoder_name": "text-embedding-3-large",
    "routes": [
        {
            "name": "litellm-gpt-4.1",
            "utterances": [
                "litellm is great"
            ],
            "description": "positive affirmation",
            "function_schemas": null,
            "llm": null,
            "score_threshold": 0.5,
            "metadata": {}
        },
        {
            "name": "litellm-claude-35",
            "utterances": [
                "how to code a program in [language]"
            ],
            "description": "coding assistant",
            "function_schemas": null,
            "llm": null,
            "score_threshold": 0.5,
            "metadata": {}
        }
    ]
}
```

2. **为 Router 配置自动路由模型**：

```python
from litellm import Router
import os

router = Router(
    model_list=[
        # Embedding models for routing
        {
            "model_name": "custom-text-embedding-model",
            "litellm_params": {
                "model": "text-embedding-3-large",
                "api_key": os.getenv("OPENAI_API_KEY"),
            },
        },
        # Your target models
        {
            "model_name": "litellm-gpt-4.1",
            "litellm_params": {
                "model": "{{openai_large}}",
            },
            "model_info": {"id": "openai-id"},
        },
        {
            "model_name": "litellm-claude-35",
            "litellm_params": {
                "model": "{{anthropic}}",
            },
            "model_info": {"id": "claude-id"},
        },
        # Auto router configuration
        {
            "model_name": "auto_router1",
            "litellm_params": {
                "model": "auto_router/auto_router_1",
                "auto_router_config_path": "router.json",
                "auto_router_default_model": "{{openai_small}}",
                "auto_router_embedding_model": "custom-text-embedding-model",
            },
        },
    ],
)
```

### 用法

配置完成后，调用时传入自动路由器的模型名即可使用它：

```python
# This request will be routed to {{openai_large}} based on the utterance match
response = await router.acompletion(
    model="auto_router1",
    messages=[{"role": "user", "content": "litellm is great"}],
)

# This request will be routed to {{anthropic}} for coding queries
response = await router.acompletion(
    model="auto_router1",
    messages=[{"role": "user", "content": "how to code a program in python"}],
)
```

### 配置参数

- **auto_router_config_path**：`router.json` 配置文件的路径
- **auto_router_default_model**：没有路由命中时使用的回退（fallback）模型
- **auto_router_embedding_model**：用于生成嵌入（embedding）以便与话语（utterance）做匹配的模型

### Router 配置结构

`router.json` 文件支持以下结构：

- **encoder_type**：编码器类型（例如 "openai"）
- **encoder_name**：嵌入模型的名称
- **routes**：路由规则数组，每条规则包含：
  - **name**：目标模型名（必须与 model_list 中的某个模型一致）
  - **utterances**：用于匹配的示例短语或模式
  - **description**：这条路由的易读描述
  - **score_threshold**：触发该路由所需的最低相似度得分（0.0-1.0）
  - **metadata**：这条路由的附加元数据


## LiteLLM 代理服务器

### 设置

进入 LiteLLM 管理界面（Admin UI），依次打开 **Models+Endpoints** > **Add Model** > **Auto Router** 标签页。

需要配置以下必填字段：

- **Auto Router Name**：开发者在向 LiteLLM 发起 LLM API 请求时使用的模型名
- **Default Model**：没有路由命中时使用的回退模型（例如设为 "gpt-5.6-luna" 时，未命中的请求都会被路由到 gpt-5.6-luna）
- **Embedding Model**：为输入消息生成嵌入的模型。这些嵌入用于把输入与各路由中定义的话语做语义匹配

#### 路由配置

<Image alt="自动路由器设置" img={require('../../img/auto_router2.png')} style={{ borderRadius: '8px', marginBottom: '1em', maxWidth: '100%' }} />

<br />

<br />

点击 **Add Route** 新建一条路由规则。每条路由由一组话语组成，系统将其与输入消息匹配后决定目标模型。

每条路由需要配置：

- **Utterances**：会触发这条路由的示例短语。变量用方括号占位：

```json
[
"how to code a program in [language]",
"can you explain this [language] code",
"can you explain this [language] script",
"can you convert this [language] code to [target_language]"
]
```

- **Description**：描述这条路由处理什么内容的易读说明
- **Score Threshold**：触发这条路由所需的最低相似度得分（0.0-1.0）


### 用法

添加完成后，开发者在 LLM API 请求的 `model` 字段中填入 `auto_router1` 即可。

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>", # replace with your LiteLLM API key
    base_url="http://localhost:4000"
)

# This request will be auto-routed based on the content
response = client.chat.completions.create(
    model="auto_router1",
    messages=[
        {
            "role": "user",
            "content": "how to code a program in python"
        }
    ]
)

print(response)
```
</TabItem>

<TabItem value="curl" label="Curl 请求">

```shell
curl -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "auto_router1",
    "messages": [{"role": "user", "content": "how to code a program in python"}]
}'
```
</TabItem>
</Tabs>



## 工作原理

1. 请求到达时，LiteLLM 为输入消息生成嵌入
2. 随后把这些嵌入与**所有**路由中定义的**全部**话语同时比对
3. 找出**相似度得分最高**的那条路由。如果该得分超过这条路由设定的阈值，请求就会被路由到对应的模型。*（路由器选取的是全局最高分，而不是在第一个匹配处就停下，因此配置中路由的先后顺序不影响最终选中哪条路由。）*
4. 如果所有路由的最高分都达不到各自的阈值，请求将交给默认模型处理
