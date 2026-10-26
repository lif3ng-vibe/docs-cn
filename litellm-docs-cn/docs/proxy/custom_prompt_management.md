import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 自定义提示词管理

通过自定义钩子（hooks）将 LiteLLM 接入你的提示词管理系统。

## 概述


<Image 
  img={require('../../img/custom_prompt_management.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>


## 工作原理

## 快速上手

### 1. 创建自定义提示词管理器

创建一个继承自 `CustomPromptManagement` 的类，用来处理提示词的获取与格式化：

**示例实现**

新建一个名为 `custom_prompt.py` 的文件并写入以下代码。这里的关键方法是 `get_chat_completion_prompt`，你可以在其中实现自定义逻辑，根据 `prompt_id` 和 `prompt_variables` 获取并格式化提示词。

```python
from typing import List, Tuple, Optional
from litellm.integrations.custom_prompt_management import CustomPromptManagement
from litellm.types.llms.openai import AllMessageValues
from litellm.types.prompts.init_prompts import PromptSpec
from litellm.types.utils import StandardCallbackDynamicParams

class MyCustomPromptManagement(CustomPromptManagement):
    def get_chat_completion_prompt(
        self,
        model: str,
        messages: List[AllMessageValues],
        non_default_params: dict,
        prompt_id: str,
        prompt_variables: Optional[dict],
        dynamic_callback_params: StandardCallbackDynamicParams,
        prompt_spec: Optional[PromptSpec] = None,
        prompt_label: Optional[str] = None,
        prompt_version: Optional[int] = None,
        ignore_prompt_manager_model: Optional[bool] = False,
        ignore_prompt_manager_optional_params: Optional[bool] = False,
    ) -> Tuple[str, List[AllMessageValues], dict]:
        """
        Retrieve and format prompts based on prompt_id.
        
        Returns:
            - model: The model to use
            - messages: The formatted messages
            - non_default_params: Optional parameters like temperature
        """
        # Example matching the diagram: Add system message for prompt_id "1234"
        if prompt_id == "1234":
            # Prepend system message while preserving existing messages
            new_messages = [
                {"role": "system", "content": "Be a good Bot!"},
            ] + messages
            return model, new_messages, non_default_params
        
        # Default: Return original messages if no prompt_id match
        return model, messages, non_default_params

prompt_management = MyCustomPromptManagement()
```

### 2. 在 LiteLLM `config.yaml` 中配置提示词管理器

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: custom_prompt.prompt_management  # sets litellm.callbacks = [prompt_management]
```

### 3. 启动 LiteLLM 网关

<Tabs>
<TabItem value="docker" label="Docker 运行">

把 `custom_logger.py` 挂载到 LiteLLM 的 Docker 容器中。

```shell
docker run -d \
  -p 4000:4000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  --name my-app \
  -v $(pwd)/my_config.yaml:/app/config.yaml \
  -v $(pwd)/custom_logger.py:/app/custom_logger.py \
  my-app:latest \
  --config /app/config.yaml \
  --port 4000 \
  --detailed_debug \
```

</TabItem>

<TabItem value="py" label="litellm pip 安装">

```shell
litellm --config config.yaml --detailed_debug
```

</TabItem>
</Tabs>

### 4. 测试自定义提示词管理器

当传入 `prompt_id="1234"` 时，自定义提示词管理器会向你的对话添加一条系统消息 “Be a good Bot!”：

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "hi"}],
    extra_body={
        "prompt_id": "1234"
    }
)

print(response.choices[0].message.content)
```
</TabItem>

<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

chat = ChatOpenAI(
    model="{{openai_large}}",
    openai_api_key="sk-<your-api-key>",
    openai_api_base="http://0.0.0.0:4000",
    extra_body={
        "prompt_id": "1234"
    }
)

messages = []
response = chat(messages)

print(response.content)
```
</TabItem>

<TabItem value="curl" label="Curl">

```shell
curl -X POST http://0.0.0.0:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "hi"}],
    "prompt_id": "1234"
}'
```
</TabItem>
</Tabs>

### 直接使用 LiteLLM SDK

如果你在 Python 脚本中直接调用 `litellm.completion()`（不经过代理服务器），请在发起请求前注册你的自定义提示词管理器：

```python

import litellm
from custom_prompt import prompt_management

litellm.callbacks = [prompt_management]

response = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "hi"}],
    prompt_id="1234",
    prompt_variables={"user_message": "hi"},
)
```

> **注意**：SDK 脚本中必须设置 `litellm.callbacks = [prompt_management]`（或等价的 `litellm.logging_callback_manager.add_litellm_callback(prompt_management)`）。代理服务器会自动从 `config.yaml` 读取 `callbacks`，独立运行的脚本则不会。

请求会从：
```json
{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "hi"}],
    "prompt_id": "1234"
}
```

转换为：
```json
{
    "model": "{{openai_large}}",
    "messages": [
        {"role": "system", "content": "Be a good Bot!"},
        {"role": "user", "content": "hi"}
    ]
}
```

