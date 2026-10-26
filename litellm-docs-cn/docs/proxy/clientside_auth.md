import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 客户端侧 LLM 凭据


### 传入用户 LLM API 密钥与回退

允许终端用户传入自己的模型列表、API 地址、OpenAI API 密钥（任何 LiteLLM 支持的提供商）来发起请求。

**注意** 此功能与[虚拟密钥（virtual key）](./virtual_keys.md)无关。它适用于你想让用户传入自己真实 LLM API 密钥的场景。

:::info

**你可以将 litellm.RouterConfig 作为 `user_config` 传入，支持的完整参数列表见 https://github.com/BerriAI/litellm/blob/main/litellm/types/router.py**

:::

<Tabs>

<TabItem value="openai-py" label="OpenAI Python">

#### 步骤 1：定义用户模型列表与配置
```python
import os

user_config = {
    'model_list': [
        {
            'model_name': 'user-azure-instance',
            'litellm_params': {
                'model': 'azure/chatgpt-v-2',
                'api_key': os.getenv('AZURE_API_KEY'),
                'api_version': os.getenv('AZURE_API_VERSION'),
                'api_base': os.getenv('AZURE_API_BASE'),
                'timeout': 10,
            },
            'tpm': 240000,
            'rpm': 1800,
        },
        {
            'model_name': 'user-openai-instance',
            'litellm_params': {
                'model': '{{openai_small}}',
                'api_key': os.getenv('OPENAI_API_KEY'),
                'timeout': 10,
            },
            'tpm': 240000,
            'rpm': 1800,
        },
    ],
    'num_retries': 2,
    'allowed_fails': 3,
    'fallbacks': [
        {
            'user-azure-instance': ['user-openai-instance']
        }
    ]
}


```

#### 步骤 2：在 `extra_body` 中传入 user_config
```python
import openai
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

# send request to `user-azure-instance`
response = client.chat.completions.create(model="user-azure-instance", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
], 
    extra_body={
      "user_config": user_config
    }
) # 👈 User config

print(response)
```

</TabItem>

<TabItem value="openai-js" label="OpenAI JS">

#### 步骤 1：定义用户模型列表与配置
```javascript
const os = require('os');

const userConfig = {
    model_list: [
        {
            model_name: 'user-azure-instance',
            litellm_params: {
                model: 'azure/chatgpt-v-2',
                api_key: process.env.AZURE_API_KEY,
                api_version: process.env.AZURE_API_VERSION,
                api_base: process.env.AZURE_API_BASE,
                timeout: 10,
            },
            tpm: 240000,
            rpm: 1800,
        },
        {
            model_name: 'user-openai-instance',
            litellm_params: {
                model: '{{openai_small}}',
                api_key: process.env.OPENAI_API_KEY,
                timeout: 10,
            },
            tpm: 240000,
            rpm: 1800,
        },
    ],
    num_retries: 2,
    allowed_fails: 3,
    fallbacks: [
        {
            'user-azure-instance': ['user-openai-instance']
        }
    ]
};
```

#### 步骤 2：将 `user_config` 作为参数传给 `openai.chat.completions.create`

```javascript
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: "sk-<your-api-key>",
  baseURL: "http://0.0.0.0:4000"
});

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: '{{openai_small}}',
    user_config: userConfig // # 👈 User config
  });
}

main();
```

</TabItem>

</Tabs>

### 传入用户 LLM API 密钥与 API 地址

允许用户传入自己的 OpenAI API 密钥或 API 地址（任何 LiteLLM 支持的提供商）来发起请求。

具体做法如下：

#### 1. 为提供商启用可配置的客户端侧鉴权凭据

```yaml
model_list:
  - model_name: "fireworks_ai/*"
    litellm_params:
      model: "fireworks_ai/*"
      configurable_clientside_auth_params: ["api_base"]
      # OR 
      configurable_clientside_auth_params: [{"api_base": '^https://litellm.*direct\.fireworks\.ai/v1$'}] # 👈 regex
```

指定你允许用户自行配置的端点参数：

- api_base（支持正则表达式）
- base_url

若不做上述声明，也没有在代理全局开启 `general_settings.allow_client_side_credentials: true`，请求体中设置了 `api_base` 或 `base_url` 的请求会被拒绝，并返回 `Rejected Request: api_base is not allowed in request body`。

`api_key` 无需列入其中。请求体中的 `api_key` 在任何部署上都会被接受，无论该部署是不是通配路由，且只会在该次请求中替换部署已配置的密钥。若想把用户的密钥以提供商请求头的形式发送（例如 Anthropic 的 `x-api-key`），参见[透传 LLM 提供商鉴权请求头](./forward_client_headers.md#转发-llm-提供商认证请求头)。

（各提供商特有的鉴权参数请查阅[提供商文档](../providers/)，例如 `vertex_project`）


#### 2. 测试一下

```python
import openai
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="{{openai_small}}", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
], 
    extra_body={"api_key": "my-bad-key", "api_base": "https://litellm-dev.direct.fireworks.ai/v1"}) # 👈 clientside credentials

print(response)
```

更多示例：
<Tabs>
<TabItem value="openai-py" label="Azure 凭据">

通过 OpenAI 客户端的 `extra_body` 参数传入 litellm_params（例如 api_key、api_base 等）。

```python
import openai
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="{{openai_small}}", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
], 
    extra_body={
      "api_key": "my-azure-key",
      "api_base": "my-azure-base",
      "api_version": "my-azure-version"
    }) # 👈 User Key

print(response)
```


</TabItem>
<TabItem value="openai-js" label="OpenAI JS">

在 JS 中，OpenAI 客户端支持照常在 `create(..)` 请求体里传参。

```javascript
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: "sk-<your-api-key>",
  baseURL: "http://0.0.0.0:4000"
});

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: '{{openai_small}}',
    api_key: "my-bad-key" // 👈 User Key
  });
}

main();
```
</TabItem>
</Tabs>

### 传入提供商特有参数（如区域、项目 ID 等）

在客户端一侧指定请求 Vertex AI 时使用的区域、项目 ID 等参数。

凡是在代理请求体中传入的值，LiteLLM 都会对照已映射的 openai / litellm 鉴权参数进行检查。

未被映射的参数将被视为提供商特有参数，并原样透传给提供商，进入 LLM API 的请求体。

```bash
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
    extra_body={ # pass any additional litellm_params here
        vertex_ai_location: "us-east1" 
    }
)

print(response)
```
