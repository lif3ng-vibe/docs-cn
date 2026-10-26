import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# [BETA] 请求优先级

:::info 

Beta 功能，仅供测试使用。

[帮我们改进此功能](https://github.com/BerriAI/litellm/issues)
:::

在高流量场景下为 LLM API 请求排定优先级。

- 将请求加入优先级队列
- 轮询队列，检查请求能否发出。返回 'True' 的情况：
    * 存在健康的部署（deployment）
    * 或请求已位于队首
- Priority：数字越小，优先级越高：
    * 例如 `priority=0` 优于 `priority=2000`

支持的 Router 端点：
- `acompletion`（Proxy 上对应 `/v1/chat/completions`）
- `atext_completion`（Proxy 上对应 `/v1/completions`）


## 快速上手

```python
from litellm import Router

router = Router(
    model_list=[
        {
            "model_name": "{{openai_small}}",
            "litellm_params": {
                "model": "{{openai_small}}",
                "mock_response": "Hello world this is Macintosh!", # fakes the LLM API call
                "rpm": 1,
            },
        },
    ],
    timeout=2, # timeout request if takes > 2s
    routing_strategy="simple-shuffle", # recommended for best performance
    polling_interval=0.03 # poll queue every 3ms if no healthy deployments
)

try:
    _response = await router.acompletion( # 👈 ADDS TO QUEUE + POLLS + MAKES CALL
        model="{{openai_small}}",
        messages=[{"role": "user", "content": "Hey!"}],
        priority=0, # 👈 LOWER IS BETTER
    )
except Exception as e:
    print("didn't make request")
```

## LiteLLM Proxy

要在 LiteLLM Proxy 上为请求排定优先级，在请求中加上 `priority` 参数即可。

<Tabs>
<TabItem value="curl" label="curl">

```curl 
curl -X POST 'http://localhost:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-D '{
    "model": "gpt-3.5-turbo-fake-model",
    "messages": [
        {
        "role": "user",
        "content": "what is the meaning of the universe? 1234"
        }],
    "priority": 0 👈 SET VALUE HERE
}'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="{{openai_small}}",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={ 
        "priority": 0 # 👈 SET VALUE HERE
    }
)

print(response)
```

</TabItem>
</Tabs>

## 进阶：Redis 缓存

借助 Redis 缓存，可以让请求优先级机制在多个 LiteLLM 实例之间生效。

### SDK 
```python
from litellm import Router

router = Router(
    model_list=[
        {
            "model_name": "{{openai_small}}",
            "litellm_params": {
                "model": "{{openai_small}}",
                "mock_response": "Hello world this is Macintosh!", # fakes the LLM API call
                "rpm": 1,
            },
        },
    ],
    ### REDIS PARAMS ###
    redis_host=os.environ["REDIS_HOST"], 
    redis_password=os.environ["REDIS_PASSWORD"], 
    redis_port=os.environ["REDIS_PORT"], 
)

try:
    _response = await router.acompletion( # 👈 ADDS TO QUEUE + POLLS + MAKES CALL
        model="{{openai_small}}",
        messages=[{"role": "user", "content": "Hey!"}],
        priority=0, # 👈 LOWER IS BETTER
    )
except Exception as e:
    print("didn't make request")
```

### PROXY 

```yaml
model_list:
    - model_name: gpt-3.5-turbo-fake-model
      litellm_params:
        model: {{openai_small}}
        mock_response: "hello world!" 
        api_key: my-good-key

litellm_settings:
    request_timeout: 600 # 👈 Will keep retrying until timeout occurs

router_settings:
    redis_host: os.environ/REDIS_HOST
    redis_password: os.environ/REDIS_PASSWORD
    redis_port: os.environ/REDIS_PORT
```

```bash
$ litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000s
```

```bash
curl -X POST 'http://localhost:4000/queue/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-D '{
    "model": "gpt-3.5-turbo-fake-model",
    "messages": [
        {
        "role": "user",
        "content": "what is the meaning of the universe? 1234"
        }],
    "priority": 0 👈 SET VALUE HERE
}'
```
