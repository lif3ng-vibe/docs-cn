import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 超时

在路由器（Router）中设置的超时作用于整个调用的全程，同时也会向下传递到 completion() 调用这一层。

### 全局超时

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router 

model_list = [{...}]

router = Router(model_list=model_list, 
                timeout=30) # raise timeout error if call takes > 30s 

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
router_settings:
    timeout: 30 # sets a 30s timeout for the entire call
```

**启动代理**

```shell
$ litellm --config /path/to/config.yaml
```

</TabItem>
</Tabs>

`litellm_settings.request_timeout`（或环境变量 `REQUEST_TIMEOUT`）是代理级默认值，在没有设置路由器或部署（deployment）超时时生效。它同样适用于原生的 `/v1/responses` 和 `/v1/messages` 流：每次等待下一个分片的时长都受它约束，上游停滞时会以报错结束流，而不是无限挂起。完整的优先级规则参见[透传路由的超时设置](./pass_through#请求超时)。

### 按模型自定义超时与流式超时

对每个模型，都可以在 `litellm_params` 下设置 `timeout` 和 `stream_timeout`：

- **`timeout`** → *完整响应*允许的最长时间。
  用它来为长时间运行的补全设置上限。

- **`stream_timeout`** → 流式响应中等待*第一个分片*（即首个 token）的最长时间。
  用它中止一直“挂着”的提供商（例如 Bedrock 启动缓慢），并改试另一个模型。
<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router 
import asyncio

model_list = [{
    "model_name": "{{openai_small}}",
    "litellm_params": {
        "model": "azure/chatgpt-v-2",
        "api_key": os.getenv("AZURE_API_KEY"),
        "api_version": os.getenv("AZURE_API_VERSION"),
        "api_base": os.getenv("AZURE_API_BASE"),
        "timeout": 300, # sets a 5 minute timeout
        "stream_timeout": 30, # sets a 30s timeout for streaming calls
    }
}]

# init router
router = Router(model_list=model_list, routing_strategy="least-busy")
async def router_acompletion():
    response = await router.acompletion(
        model="{{openai_small}}", 
        messages=[{"role": "user", "content": "Hey, how's it going?"}]
    )
    print(response)
    return response

asyncio.run(router_acompletion())
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/gpt-turbo-small-eu
      api_base: https://my-endpoint-europe-berri-992.openai.azure.com/
      api_key: <your-key>
      timeout: 0.1                      # timeout in (seconds)
      stream_timeout: 0.01              # timeout for stream requests (seconds)
      max_retries: 5
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/gpt-turbo-small-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: 
      timeout: 0.1                      # timeout in (seconds)
      stream_timeout: 0.01              # timeout for stream requests (seconds)
      max_retries: 5

```


**启动代理**

```shell
$ litellm --config /path/to/config.yaml
```


</TabItem>
</Tabs>

### 为空闲流式连接发送保活心跳

`timeout` 和 `stream_timeout` 限制的是一个请求最多能运行多久。另一个独立的问题是：代理前面的负载均衡器和反向代理经常会关掉看起来空闲的连接，哪怕客户端确实在等响应。对首 token 之前有较长静默期的模型（比如扩展思考或自适应思考类模型），以及其他响应偏慢的提供商，流式请求可能在任何内容到达之前就触发这类空闲连接超时。

在部署的 `litellm_params` 下设置 `keepalive_seconds`，即可在这些静默期维持连接。当流的静默时间超过 `keepalive_seconds`，代理会沿连接发送一个 SSE 注释帧（`: ping`），此后每隔 `keepalive_seconds` 重复一次，直到真实内容恢复。注释帧是 SSE 规范的一部分，客户端和中间代理按规范应忽略它们，因此不会影响你的应用看到的响应。

```yaml
model_list:
  - model_name: claude-opus
    litellm_params:
      model: anthropic/{{anthropic_large}}
      api_key: os.environ/ANTHROPIC_API_KEY
      keepalive_seconds: 15
```

```shell
curl http://0.0.0.0:4000/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-opus",
    "messages": [{"role": "user", "content": "Think step by step about..."}],
    "stream": true
  }'
```

默认情况下，`keepalive_seconds` 只有运营方（operator）能设置。客户端在请求里传入的 `keepalive_seconds` 不生效，除非部署同时设置了 `allow_client_keepalive_override: true`，因为如果任一客户端都能随意开启心跳，它就能让一条看似空闲的流一直存活、无限越过负载均衡器的超时，把 `max_parallel_requests` 的一个并发槽位占用得比预期更久。

```yaml
model_list:
  - model_name: claude-opus
    litellm_params:
      model: anthropic/{{anthropic_large}}
      api_key: os.environ/ANTHROPIC_API_KEY
      keepalive_seconds: 15
      allow_client_keepalive_override: true
```

允许覆盖后，请求可以修改部署的默认值，也可以用显式的 `0` 直接关闭：

```shell
curl http://0.0.0.0:4000/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-opus",
    "messages": [{"role": "user", "content": "Think step by step about..."}],
    "stream": true,
    "keepalive_seconds": 1
  }'
```

如果没有设置 `allow_client_keepalive_override`，同样的请求体会被静默忽略，实际生效的是部署自身配置的值。部署级的 `keepalive_seconds: 0` 是硬关闭，优先级高于一切，包括授予了覆盖权限的情况：无论如何都无法通过请求重新开启。实际生效值会被限制在 1-300 秒的范围内。

`keepalive_seconds` 也可以不放在请求体字段里，而是通过 `x-litellm-keepalive-seconds` 请求头来设置，方便那些设置自定义请求头比附加请求体字段更容易的客户端：

```shell
curl http://0.0.0.0:4000/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'x-litellm-keepalive-seconds: 1' \
  -d '{
    "model": "claude-opus",
    "messages": [{"role": "user", "content": "Think step by step about..."}],
    "stream": true
  }'
```

该请求头与请求体字段走同一个 `allow_client_keepalive_override` 开关，对未开启此项的部署同样不生效。

#### 代理级默认值

`keepalive_seconds` 是按部署设置的。若要让同一个间隔覆盖所有部署以及每一条透传（pass-through）路由，可在 `litellm_settings` 下设置 `sse_keepalive_ping_interval_seconds`：

```yaml
litellm_settings:
  sse_keepalive_ping_interval_seconds: 15
```

部署自身设置了 `keepalive_seconds` 的地方仍以它为准，部署级的 `0` 也仍然是硬关闭。全局值只在没有更具体设置的地方生效。

有一个细节只出现在上游尚未应答、还没有任何部署接手请求的阶段：只有在请求的模型名背后所有部署都配置了相同的值时，才会采用按部署的值。如果各部署的值不一致，就先用全局值，一旦确定由哪个部署服务，之后的流就改用它自己的设置。

#### 上游完全未响应前的静默期

有些提供商要等到首 token 才返回响应头，在这类提供商上，模型整个思考时间过去之后，代理才有东西可转发。`sse_keepalive_ping_interval_seconds` 同样覆盖这段窗口：如果一个间隔内上游调用仍未返回，代理会打开 SSE 响应并开始发送 `: ping` 注释，等真实响应到达后再在同一连接上回放它。

这么早打开响应会带来两个后果，也正因如此，在你主动设置间隔之前它一直处于关闭状态：

- 状态行在结果未知时就已确定，因此第一个 ping 之后才失败的请求，会以 `200` 下的 SSE 错误帧形式出现，而不是 HTTP 错误状态码。你的回调所做的任何错误转换仍然会作用于该帧。
- LiteLLM 的 `x-litellm-*` 响应头此时还无从得知，因此发送过 ping 的流上没有这些响应头。


### 按请求动态设置超时

LiteLLM 支持按请求设置 `timeout`

**示例用法**
<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router 

model_list = [{...}]
router = Router(model_list=model_list)

response = router.completion(
    model="{{openai_small}}", 
    messages=[{"role": "user", "content": "what color is red"}],
    timeout=1
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
     --header 'Content-Type: application/json' \
     --data-raw '{
        "model": "{{openai_small}}",
        "messages": [
            {"role": "user", "content": "what color is red"}
        ],
        "logit_bias": {12481: 100},
        "timeout": 1
     }'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai


client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{openai_small}}",
    messages=[
        {"role": "user", "content": "what color is red"}
    ],
    logit_bias={12481: 100},
    extra_body={"timeout": 1} # 👈 KEY CHANGE
)

print(response)
```
</TabItem>
</Tabs>

</TabItem>
</Tabs>


## 测试超时处理

要测试重试/回退逻辑能否应对超时，可以在测试时设置 `mock_timeout=True`。

目前只有 `/chat/completions` 和 `/completions` 端点支持。如果你需要用于其他端点，请[告诉我们](https://github.com/BerriAI/litellm/issues)。

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    --data-raw '{
        "model": "gemini/{{gemini_flash}}",
        "messages": [
        {"role": "user", "content": "hi my email is ishaan@berri.ai"}
        ],
        "mock_timeout": true # 👈 KEY CHANGE
    }'
```
