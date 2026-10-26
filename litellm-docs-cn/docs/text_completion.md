import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /completions

## 概览

| 功能 | 是否支持 | 说明 |
|---------|-----------|-------|
| 成本追踪（cost tracking） | ✅ | 适用于所有支持的模型 |
| 日志 | ✅ | 适用于所有集成方式 |
| 终端用户追踪 | ✅ | |
| 流式 | ✅ | |
| 回退机制（fallbacks） | ✅ | 在支持的模型之间生效 |
| 负载均衡（load balancing） | ✅ | 在支持的模型之间生效 |
| 防护栏（guardrails） | ✅ | 作用于输入提示词与输出文本（仅限非流式） |
| 支持的提供商（provider） | 所有对话补全（Chat Completion）提供商 | |

### 用法
<Tabs>
<TabItem value="python" label="LiteLLM Python SDK">

```python
from litellm import text_completion

response = text_completion(
    model="gpt-3.5-turbo-instruct",
    prompt="Say this is a test",
    max_tokens=7
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM 代理服务器">

1. 在 config.yaml 中定义模型

```yaml
model_list:
  - model_name: gpt-3.5-turbo-instruct
    litellm_params:
      model: text-completion-openai/gpt-3.5-turbo-instruct # The `text-completion-openai/` prefix will call openai.completions.create
      api_key: os.environ/OPENAI_API_KEY
  - model_name: text-davinci-003
    litellm_params:
      model: text-completion-openai/text-davinci-003
      api_key: os.environ/OPENAI_API_KEY
```

2. 启动 litellm 代理服务器

```
litellm --config config.yaml
```

<Tabs>
<TabItem value="python" label="OpenAI Python SDK">

```python
from openai import OpenAI

# set base_url to your proxy server
# set api_key to send to proxy server
client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

response = client.completions.create(
    model="gpt-3.5-turbo-instruct",
    prompt="Say this is a test",
    max_tokens=7
)

print(response)
```
</TabItem>

<TabItem value="curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --data '{
        "model": "gpt-3.5-turbo-instruct",
        "prompt": "Say this is a test",
        "max_tokens": 7
    }'
```
</TabItem>
</Tabs>

</TabItem>
</Tabs>

## 输入参数

LiteLLM 会接收 [OpenAI 文本补全（Text Completion）参数](https://platform.openai.com/docs/api-reference/completions)，并在所有支持的提供商之间完成参数转换。

### 必填字段

- `model`: *string* - 要使用的模型 ID
- `prompt`: *string or array* - 用于生成补全的提示词，可传入单个字符串或数组

### 可选字段

- `best_of`: *integer* - 在服务端生成 best_of 个补全，并返回其中“最好”的一个
- `echo`: *boolean* - 除补全结果外，同时原样返回提示词。
- `frequency_penalty`: *number* - 取值介于 -2.0 到 2.0 之间。正值会根据新 token 已出现的频率对其施加惩罚。
- `logit_bias`: *map* - 调整指定 token 出现在补全结果中的可能性
- `logprobs`: *integer* - 返回最可能的 logprobs 个 token 的对数概率。最大值为 5
- `max_tokens`: *integer* - 生成 token 数的上限。
- `n`: *integer* - 为每个提示词生成多少个补全。
- `presence_penalty`: *number* - 取值介于 -2.0 到 2.0 之间。正值会根据新 token 是否已在前文出现对其施加惩罚。
- `seed`: *integer* - 若指定此值，系统将尽力保证采样结果可复现
- `stop`: *string or array* - 最多 4 个停止序列，API 生成到其中任一序列时即停止输出 token
- `stream`: *boolean* - 是否以流式返回部分进度。默认为 false
- `suffix`: *string* - 插入文本补全之后附加的后缀
- `temperature`: *number* - 采样温度，取值介于 0 到 2 之间。
- `top_p`: *number* - 温度采样的替代方案，称为核采样（nucleus sampling）。
- `user`: *string* - 代表终端用户的唯一标识符

## 输出格式
以下是调用补全接口时会得到的精确 JSON 输出格式：


[**遵循 OpenAI 的输出格式**](https://platform.openai.com/docs/api-reference/completions/object)

<Tabs>

<TabItem value="non-streaming" label="非流式响应">

```python
{
  "id": "cmpl-uqkvlQyYK7bGYrRHQ0eXlWi7",
  "object": "text_completion",
  "created": 1589478378,
  "model": "gpt-3.5-turbo-instruct",
  "system_fingerprint": "fp_44709d6fcb",
  "choices": [
    {
      "text": "\n\nThis is indeed a test",
      "index": 0,
      "logprobs": null,
      "finish_reason": "length"
    }
  ],
  "usage": {
    "prompt_tokens": 5,
    "completion_tokens": 7,
    "total_tokens": 12
  }
}

```
</TabItem>
<TabItem value="streaming" label="流式响应">

```python
{
  "id": "cmpl-7iA7iJjj8V2zOkCGvWF2hAkDWBQZe",
  "object": "text_completion",
  "created": 1690759702,
  "choices": [
    {
      "text": "This",
      "index": 0,
      "logprobs": null,
      "finish_reason": null
    }
  ],
  "model": "gpt-3.5-turbo-instruct",
  "system_fingerprint": "fp_44709d6fcb",
}

```

</TabItem>
</Tabs>


## **支持的提供商**

| 提供商    | 用法链接      |
|-------------|--------------------|
| OpenAI      |   [用法](../docs/providers/text_completion_openai)                 |
| Azure OpenAI|   [用法](../docs/providers/azure)                 |
