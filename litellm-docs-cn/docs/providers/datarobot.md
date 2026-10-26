import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# DataRobot
LiteLLM 支持 [DataRobot](https://datarobot.com) 的全部模型。选择 `datarobot` 作为提供商（provider），请求便会经由 `datarobot` 的 OpenAI 兼容端点（endpoint）路由，底层使用上游的 [OpenAI Python 官方 API 库](https://github.com/openai/openai-python/blob/main/README.md)。

## 使用方法

### 环境变量
```python
import os
from litellm import completion
os.environ["DATAROBOT_API_TOKEN"] = ""
os.environ["DATAROBOT_ENDPOINT"] = "" # [OPTIONAL] defaults to https://app.datarobot.com

response = completion(
            model="datarobot/openai/{{openai_small}}",
            messages=messages,
        )
```


### 对话补全
```python
import litellm
import os

response = litellm.completion(
    model="datarobot/openai/{{openai_small}}",   # add `datarobot/` prefix to model so litellm knows to route through DataRobot
    messages=[
                {
                    "role": "user",
                    "content": "Hey, how's it going?",
                }
    ],
)
print(response)
```

## DataRobot 补全模型

🚨 LiteLLM 支持 _全部_ DataRobot LLM 网关模型。要获取适用于你的安装实例与用户账号的模型列表，请发送以下 CURL 命令：
`curl -X GET -H "Authorization: Bearer $DATAROBOT_API_TOKEN" "$DATAROBOT_ENDPOINT/genai/llmgw/catalog/" | jq | grep 'model":'DATAROBOT_ENDPOINT/genai/llmgw/catalog/`
