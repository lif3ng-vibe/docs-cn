import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 各提供商专属的通配路由

**代理某个提供商的所有模型**

如果你想**代理某个提供商的全部模型，又不想在 config.yaml 里逐个定义**，就可以用这个方式。

## 第 1 步：定义特定提供商的路由

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import Router

router = Router(
    model_list=[
        {
            "model_name": "anthropic/*",
            "litellm_params": {
                "model": "anthropic/*",
                "api_key": os.environ["ANTHROPIC_API_KEY"]
            }
        }, 
        {
            "model_name": "groq/*",
            "litellm_params": {
                "model": "groq/*",
                "api_key": os.environ["GROQ_API_KEY"]
            }
        }, 
        {
            "model_name": "fo::*:static::*", # all requests matching this pattern will be routed to this deployment, example: model="fo::hi::static::hi" will be routed to deployment: "openai/fo::*:static::*"
            "litellm_params": {
                "model": "openai/fo::*:static::*",
                "api_key": os.environ["OPENAI_API_KEY"]
            }
        }
    ]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

**第 1 步** - 在 config.yaml 中定义特定提供商的路由
```yaml
model_list:
  # provider specific wildcard routing
  - model_name: "anthropic/*"
    litellm_params:
      model: "anthropic/*"
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: "groq/*"
    litellm_params:
      model: "groq/*"
      api_key: os.environ/GROQ_API_KEY
  - model_name: "fo::*:static::*" # all requests matching this pattern will be routed to this deployment, example: model="fo::hi::static::hi" will be routed to deployment: "openai/fo::*:static::*"
    litellm_params:
      model: "openai/fo::*:static::*"
      api_key: os.environ/OPENAI_API_KEY
```
</TabItem>
</Tabs>

## [仅 PROXY] 第 2 步 - 运行 litellm 代理

```shell
$ litellm --config /path/to/config.yaml
```

## 第 3 步 - 测试

<Tabs>  
<TabItem value="sdk" label="SDK">

```python
from litellm import Router

router = Router(model_list=...)

# Test with `anthropic/` - all models with `anthropic/` prefix will get routed to `anthropic/*`
resp = router.completion(model="anthropic/{{anthropic}}", messages=[{"role": "user", "content": "Hello, Claude!"}])
print(resp)

# Test with `groq/` - all models with `groq/` prefix will get routed to `groq/*`
resp = router.completion(model="groq/llama3-8b-8192", messages=[{"role": "user", "content": "Hello, Groq!"}])
print(resp)

# Test with `fo::*::static::*` - all requests matching this pattern will be routed to `openai/fo::*:static::*`
resp = router.completion(model="fo::hi::static::hi", messages=[{"role": "user", "content": "Hello, Claude!"}])
print(resp)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

用 `anthropic/` 测试 - 所有带 `anthropic/` 前缀的模型都会被路由到 `anthropic/*`
```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "anthropic/{{anthropic}}",
    "messages": [
      {"role": "user", "content": "Hello, Claude!"}
    ]
  }'
```

用 `groq/` 测试 - 所有带 `groq/` 前缀的模型都会被路由到 `groq/*`
```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "groq/llama3-8b-8192",
    "messages": [
      {"role": "user", "content": "Hello, Claude!"}
    ]
  }'
```

用 `fo::*::static::*` 测试 - 所有匹配该模式的请求都会被路由到 `openai/fo::*:static::*`
```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "fo::hi::static::hi",
    "messages": [
      {"role": "user", "content": "Hello, Claude!"}
    ]
  }'
```

</TabItem>
</Tabs>


## [[仅 PROXY] 控制通配模型的访问权限](/docs/proxy/model_access#进阶模型访问组)
