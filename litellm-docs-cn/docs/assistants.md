import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /assistants

:::warning[弃用通知]

OpenAI 已弃用 Assistants API，它将于 **2026 年 8 月 26 日**下线。

建议迁移到 [Responses API](/docs/response_api)。详见 [OpenAI 迁移指南](https://platform.openai.com/docs/guides/responses-vs-assistants)。

:::

覆盖 Threads（线程）、Messages（消息）、Assistants（助手）。

LiteLLM 目前支持：
- 创建助手
- 删除助手
- 获取助手
- 创建线程
- 获取线程
- 添加消息
- 获取消息
- 运行线程


## **支持的提供商**
- [OpenAI](#快速上手)
- [Azure OpenAI](#azure-openai)
- [OpenAI 兼容 API](#openai-兼容-api)

## 快速上手

调用一个已有的助手。

- 获取助手

- 用户发起会话时，创建一个线程。

- 用户提问时，向线程中添加消息。

- 在线程上运行助手，调用模型与工具来生成响应。

### SDK + PROXY
<Tabs>
<TabItem value="sdk" label="SDK">

**创建助手**


```python
import litellm
import os 

# setup env
os.environ["OPENAI_API_KEY"] = "sk-.."

assistant = litellm.create_assistants(
            custom_llm_provider="openai",
            model="{{openai_large}}",
            instructions="You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
            name="Math Tutor",
            tools=[{"type": "code_interpreter"}],
)

### ASYNC USAGE ### 
# assistant = await litellm.acreate_assistants(
#             custom_llm_provider="openai",
#             model="{{openai_large}}",
#             instructions="You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
#             name="Math Tutor",
#             tools=[{"type": "code_interpreter"}],
# )
```

**获取助手**

```python
from litellm import get_assistants, aget_assistants
import os 

# setup env
os.environ["OPENAI_API_KEY"] = "sk-.."

assistants = get_assistants(custom_llm_provider="openai")

### ASYNC USAGE ### 
# assistants = await aget_assistants(custom_llm_provider="openai")
```

**创建线程**

```python
from litellm import create_thread, acreate_thread
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

new_thread = create_thread(
            custom_llm_provider="openai",
            messages=[{"role": "user", "content": "Hey, how's it going?"}],  # type: ignore
        )

### ASYNC USAGE ### 
# new_thread = await acreate_thread(custom_llm_provider="openai",messages=[{"role": "user", "content": "Hey, how's it going?"}])
```

**向线程添加消息**

```python
from litellm import create_thread, get_thread, aget_thread, add_message, a_add_message
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

## CREATE A THREAD
_new_thread = create_thread(
            custom_llm_provider="openai",
            messages=[{"role": "user", "content": "Hey, how's it going?"}],  # type: ignore
        )

## OR retrieve existing thread
received_thread = get_thread(
            custom_llm_provider="openai",
            thread_id=_new_thread.id,
        )

### ASYNC USAGE ### 
# received_thread = await aget_thread(custom_llm_provider="openai", thread_id=_new_thread.id,)

## ADD MESSAGE TO THREAD
message = {"role": "user", "content": "Hey, how's it going?"}
added_message = add_message(
            thread_id=_new_thread.id, custom_llm_provider="openai", **message
        )

### ASYNC USAGE ### 
# added_message = await a_add_message(thread_id=_new_thread.id, custom_llm_provider="openai", **message)
```

**在线程上运行助手**

```python
from litellm import get_assistants, create_thread, add_message, run_thread, arun_thread
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."
assistants = get_assistants(custom_llm_provider="openai")

## get the first assistant ###
assistant_id = assistants.data[0].id

## GET A THREAD
_new_thread = create_thread(
            custom_llm_provider="openai",
            messages=[{"role": "user", "content": "Hey, how's it going?"}],  # type: ignore
        )

## ADD MESSAGE
message = {"role": "user", "content": "Hey, how's it going?"}
added_message = add_message(
            thread_id=_new_thread.id, custom_llm_provider="openai", **message
        )

## 🚨 RUN THREAD
response = run_thread(
            custom_llm_provider="openai", thread_id=thread_id, assistant_id=assistant_id
        )

### ASYNC USAGE ### 
# response = await arun_thread(custom_llm_provider="openai", thread_id=thread_id, assistant_id=assistant_id)

print(f"run_thread: {run_thread}")
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
assistant_settings:
  custom_llm_provider: azure
  litellm_params: 
    api_key: os.environ/AZURE_API_KEY
    api_base: os.environ/AZURE_API_BASE
    api_version: os.environ/AZURE_API_VERSION
```

```bash
$ litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```


**创建助手**

```bash
curl "http://localhost:4000/v1/assistants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "instructions": "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
    "name": "Math Tutor",
    "tools": [{"type": "code_interpreter"}],
    "model": "{{openai_large}}"
  }'
```


**获取助手**

```bash
curl "http://0.0.0.0:4000/v1/assistants?order=desc&limit=20" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**创建线程**

```bash
curl http://0.0.0.0:4000/v1/threads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d ''
```

**获取线程**

```bash
curl http://0.0.0.0:4000/v1/threads/{thread_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**向线程添加消息**

```bash
curl http://0.0.0.0:4000/v1/threads/{thread_id}/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
      "role": "user",
      "content": "How does AI work? Explain it in simple terms."
    }'
```

**在线程上运行助手**

```bash
curl http://0.0.0.0:4000/v1/threads/thread_abc123/runs \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "asst_abc123"
  }'
```

</TabItem>
</Tabs>

## 流式

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import run_thread_stream 
import os

os.environ["OPENAI_API_KEY"] = "sk-.."

message = {"role": "user", "content": "Hey, how's it going?"}  

data = {"custom_llm_provider": "openai", "thread_id": _new_thread.id, "assistant_id": assistant_id, **message}

run = run_thread_stream(**data)
with run as run:
    assert isinstance(run, AssistantEventHandler)
    for chunk in run: 
      print(f"chunk: {chunk}")
    run.until_done()
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl -X POST 'http://0.0.0.0:4000/threads/{thread_id}/runs' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
      "assistant_id": "asst_6xVZQFFy1Kw87NbnYeNebxTf",
      "stream": true
}'
```

</TabItem>
</Tabs>

## [👉 Proxy API 参考](https://docs.litellm.ai/api-reference/#/assistants)


## Azure OpenAI

**配置**
```yaml
assistant_settings:
  custom_llm_provider: azure
  litellm_params: 
    api_key: os.environ/AZURE_API_KEY
    api_base: os.environ/AZURE_API_BASE
```

**curl**

```bash
curl -X POST "http://localhost:4000/v1/assistants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "instructions": "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
    "name": "Math Tutor",
    "tools": [{"type": "code_interpreter"}],
    "model": "<my-azure-deployment-name>"
  }'
```

## OpenAI 兼容 API

要调用 OpenAI 兼容的 Assistants API（例如 Astra Assistants API），只需在模型名前加上 `openai/`：


**配置**
```yaml
assistant_settings:
  custom_llm_provider: openai
  litellm_params: 
    api_key: os.environ/ASTRA_API_KEY
    api_base: os.environ/ASTRA_API_BASE
```

**curl**

```bash
curl -X POST "http://localhost:4000/v1/assistants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "instructions": "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
    "name": "Math Tutor",
    "tools": [{"type": "code_interpreter"}],
    "model": "openai/<my-astra-model-name>"
  }'
```
