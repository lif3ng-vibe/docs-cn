import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /moderations


### 用法
<Tabs>
<TabItem value="python" label="LiteLLM Python SDK">

```python
from litellm import moderation

response = moderation(
    input="hello from litellm",
    model="text-moderation-stable"
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM 代理服务器">

对于 `/moderations` 端点，**无需在请求体或 litellm 的 config.yaml 中指定 `model`**


1. 配置 config.yaml
```yaml
model_list:
  - model_name: text-moderation-stable
    litellm_params:
      model: openai/omni-moderation-latest
```

2. 启动 litellm 代理服务器（proxy server）

```
litellm --config /path/to/config.yaml
```


<Tabs>
<TabItem value="python" label="OpenAI Python SDK">

```python
from openai import OpenAI

# set base_url to your proxy server
# set api_key to send to proxy server
client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

response = client.moderations.create(
    input="hello from litellm",
    model="text-moderation-stable"
)

print(response)
```
</TabItem>

<TabItem value="curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/moderations' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --data '{"input": "Sample text goes here", "model": "text-moderation-stable"}'
```
</TabItem>
</Tabs>

</TabItem>
</Tabs>

## 输入参数
LiteLLM 会在所有支持的提供商之间统一接收并转换 [OpenAI 内容审核（moderation）参数](https://platform.openai.com/docs/api-reference/moderations)。

### 必填字段

- `input`：*字符串或数组* - 待分类的输入（一个或多个）。可以是单个字符串、字符串数组，或与其他模型类似的多模态输入对象数组。
  - 若为字符串：待审核分类的一段文本
  - 若为字符串数组：待审核分类的字符串数组
  - 若为对象数组：传给审核模型的多模态输入数组，其中每个对象可以是：
    - 描述待分类图像的对象，包含：
      - `type`：*字符串，必填* - 固定为 `image_url`
      - `image_url`：*对象，必填* - 包含图片 URL，或 base64 编码图片的 data URL
    - 描述待分类文本的对象，包含：
      - `type`：*字符串，必填* - 固定为 `text`
      - `text`：*字符串，必填* - 待分类的一段文本

### 可选字段

- `model`：*字符串（可选）* - 要使用的内容审核模型。默认为 `omni-moderation-latest`。

## 输出格式
以下是所有内容审核调用都会返回的确切 JSON 输出与类型：

[**LiteLLM 遵循 OpenAI 的输出格式**](https://platform.openai.com/docs/api-reference/moderations/object)


```python
{
  "id": "modr-AB8CjOTu2jiq12hp1AQPfeqFWaORR",
  "model": "text-moderation-007",
  "results": [
    {
      "flagged": true,
      "categories": {
        "sexual": false,
        "hate": false,
        "harassment": true,
        "self-harm": false,
        "sexual/minors": false,
        "hate/threatening": false,
        "violence/graphic": false,
        "self-harm/intent": false,
        "self-harm/instructions": false,
        "harassment/threatening": true,
        "violence": true
      },
      "category_scores": {
        "sexual": 0.000011726012417057063,
        "hate": 0.22706663608551025,
        "harassment": 0.5215635299682617,
        "self-harm": 2.227119921371923e-6,
        "sexual/minors": 7.107352217872176e-8,
        "hate/threatening": 0.023547329008579254,
        "violence/graphic": 0.00003391829886822961,
        "self-harm/intent": 1.646940972932498e-6,
        "self-harm/instructions": 1.1198755256458526e-9,
        "harassment/threatening": 0.5694745779037476,
        "violence": 0.9971134662628174
      }
    }
  ]
}

```


## **支持的提供商**

#### ⚡️在 [models.litellm.ai](https://models.litellm.ai/) 查看所有支持的模型与提供商

| 提供商    |
|-------------|
| OpenAI      |  
