import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 会话日志

将请求按会话（session）分组，即可把相关的请求归拢到一起。


<Image img={require('../../img/ui_session_logs.png')}/>

## 用法

### `/chat/completions`

要把多个请求归入同一个会话，只需在每个请求的 metadata 中传入相同的 `litellm_session_id`。具体做法如下：

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

**请求 1**
用一个唯一的 ID 创建新会话并发起第一个请求，之后所有相关请求都会通过这个会话 ID 来追踪。

```python showLineNumbers
import openai
import uuid

# Create a session ID
session_id = str(uuid.uuid4())

client = openai.OpenAI(
    api_key="<your litellm api key>",
    base_url="http://0.0.0.0:4000"
)

# First request in session
response1 = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[
        {
            "role": "user",
            "content": "Write a short story about a robot"
        }
    ],
    extra_body={
        "litellm_session_id": session_id  # Pass the session ID
    }
)
```

**请求 2**
复用同一个会话 ID 再发一次请求，即可与前一个请求关联起来，实现相关请求的统一追踪。

```python showLineNumbers
# Second request using same session ID
response2 = client.chat.completions.create(
    model="{{openai_large}}", 
    messages=[
        {
            "role": "user",
            "content": "Now write a poem about that robot"
        }
    ],
    extra_body={
        "litellm_session_id": session_id  # Reuse the same session ID
    }
)
```

</TabItem>
<TabItem value="langchain" label="Langchain">

**请求 1**
用一个唯一的 ID 初始化新会话，并创建用于发请求的聊天模型实例。会话 ID 会写入模型的配置中。

```python showLineNumbers
from langchain.chat_models import ChatOpenAI
import uuid

# Create a session ID
session_id = str(uuid.uuid4())

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    api_key="<your litellm api key>",
    model="{{openai_large}}",
    extra_body={
        "litellm_session_id": session_id  # Pass the session ID
    }
)

# First request in session
response1 = chat.invoke("Write a short story about a robot")
```

**请求 2**
继续用同一个聊天模型实例发起请求，先前配置的会话 ID 会自动维持会话上下文。

```python showLineNumbers
# Second request using same chat object and session ID
response2 = chat.invoke("Now write a poem about that robot")
```

</TabItem>
<TabItem value="curl" label="Curl">

**请求 1**
生成一个新的会话 ID 并发起第一次 API 调用。metadata 中的会话 ID 将用于追踪这轮对话。

```bash showLineNumbers
# Create a session ID
SESSION_ID=$(uuidgen)

# Store your API key
API_KEY="<your litellm api key>"

# First request in session
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $API_KEY" \
    --data '{
    "model": "{{openai_large}}",
    "messages": [
        {
        "role": "user",
        "content": "Write a short story about a robot"
        }
    ],
    "litellm_session_id": "'$SESSION_ID'"
}'
```

**请求 2**
沿用同一个会话 ID 发起后续请求，以保持对话上下文并持续追踪。

```bash showLineNumbers
# Second request using same session ID
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $API_KEY" \
    --data '{
    "model": "{{openai_large}}",
    "messages": [
        {
        "role": "user",
        "content": "Now write a poem about that robot"
        }
    ],
    "litellm_session_id": "'$SESSION_ID'"
}'
```

</TabItem>
<TabItem value="litellm" label="LiteLLM Python SDK">

**请求 1**
创建一个唯一的 ID 并发起第一个请求，由此开启新会话。相关请求将凭这个会话 ID 归为一组。

```python showLineNumbers
import litellm
import uuid

# Create a session ID
session_id = str(uuid.uuid4())

# First request in session
response1 = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Write a short story about a robot"}],
    api_base="http://0.0.0.0:4000",
    api_key="<your litellm api key>",
    metadata={
        "litellm_session_id": session_id  # Pass the session ID
    }
)
```

**请求 2**
用同一个会话 ID 再发一次请求，继续这轮对话，并自动关联到前一次交互。

```python showLineNumbers
# Second request using same session ID
response2 = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Now write a poem about that robot"}],
    api_base="http://0.0.0.0:4000",
    api_key="<your litellm api key>",
    metadata={
        "litellm_session_id": session_id  # Reuse the same session ID
    }
)
```

</TabItem>
</Tabs>

### `/responses`

对于 `/responses` 端点，使用 `previous_response_id` 把请求归入同一会话。每个请求的响应中都会返回 `previous_response_id`。

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

**请求 1**
发起第一个请求，并保存响应 ID，供后续请求关联使用。

```python showLineNumbers
from openai import OpenAI

client = OpenAI(
    api_key="<your litellm api key>",
    base_url="http://0.0.0.0:4000"
)

# First request in session
response1 = client.responses.create(
    model="anthropic/{{anthropic}}",
    input="Write a short story about a robot"
)

# Store the response ID for the next request
response_id = response1.id
```

**请求 2**
携带上一次的响应 ID 发起后续请求，以维持对话上下文。

```python showLineNumbers
# Second request using previous response ID
response2 = client.responses.create(
    model="anthropic/{{anthropic}}",
    input="Now write a poem about that robot",
    previous_response_id=response_id  # Link to previous request
)
```

</TabItem>
<TabItem value="curl" label="Curl">

**请求 1**
发起第一个请求。响应中会包含一个 ID，可用于关联后续请求。

```bash showLineNumbers
# Store your API key
API_KEY="<your litellm api key>"

# First request in session
curl http://localhost:4000/v1/responses \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $API_KEY" \
    --data '{
        "model": "anthropic/{{anthropic}}",
        "input": "Write a short story about a robot"
    }'

# Response will include an 'id' field that you'll use in the next request
```

**请求 2**
携带上一次的响应 ID 发起后续请求，以维持对话上下文。

```bash showLineNumbers
# Second request using previous response ID
curl http://localhost:4000/v1/responses \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $API_KEY" \
    --data '{
        "model": "anthropic/{{anthropic}}",
        "input": "Now write a poem about that robot",
        "previous_response_id": "resp_abc123..."  # Replace with actual response ID from previous request
    }'
```

</TabItem>
<TabItem value="litellm" label="LiteLLM Python SDK">

**请求 1**
发起第一个请求，并保存响应 ID，供后续请求关联使用。

```python showLineNumbers
import litellm

# First request in session
response1 = litellm.responses(
    model="anthropic/{{anthropic}}",
    input="Write a short story about a robot",
    api_base="http://0.0.0.0:4000",
    api_key="<your litellm api key>"
)

# Store the response ID for the next request
response_id = response1.id
```

**请求 2**
携带上一次的响应 ID 发起后续请求，以维持对话上下文。

```python showLineNumbers
# Second request using previous response ID
response2 = litellm.responses(
    model="anthropic/{{anthropic}}",
    input="Now write a poem about that robot",
    api_base="http://0.0.0.0:4000",
    api_key="<your litellm api key>",
    previous_response_id=response_id  # Link to previous request
)
```

</TabItem>
</Tabs>
