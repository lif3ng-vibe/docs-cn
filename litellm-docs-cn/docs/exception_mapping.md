# 异常映射

LiteLLM 会把所有提供商（provider）的异常统一映射为对应的 OpenAI 异常。

所有异常都可以从 `litellm` 导入，例如 `from litellm import BadRequestError`。

如果你是通过 AI 网关而非 SDK 发起调用，请参阅[错误参考](/docs/proxy/error_reference)，了解 JSON 错误负载、响应头，以及如何区分网关错误与提供商错误。

## LiteLLM 异常

| 状态码 | 错误类型               | 继承自 | 说明 |
|-------------|--------------------------|---------------|-------------|
| 400         | BadRequestError          | openai.BadRequestError |
| 400 | UnsupportedParamsError | litellm.BadRequestError | 传入不支持的参数时抛出 |
| 400         | ContextWindowExceededError| litellm.BadRequestError | 上下文窗口（context window）超限错误的专用类型，支持上下文窗口回退 |
| 400         | ContentPolicyViolationError| litellm.BadRequestError | 内容政策违规错误的专用类型，支持内容政策回退 |
| 400         | ImageFetchError | litellm.BadRequestError | 获取或处理图像出错时抛出 |
| 400 | InvalidRequestError | openai.BadRequestError | 已弃用的异常，请改用 BadRequestError |
| 401         | AuthenticationError      | openai.AuthenticationError |
| 402         | PaymentRequiredError     | litellm.BadRequestError | 提供商返回 402 时抛出，例如账户额度用尽。当该模型组（model group）下还有其他部署时，路由器（router）会将该部署冷却 |
| 403         | PermissionDeniedError    | openai.PermissionDeniedError |
| 404         | NotFoundError            | openai.NotFoundError | 传入无效模型时抛出，例如 gpt-8 |
| 408 | Timeout | openai.APITimeoutError | 发生超时时抛出 |
| 422         | UnprocessableEntityError | openai.UnprocessableEntityError |
| 429         | RateLimitError           | openai.RateLimitError |
| 500         | APIConnectionError       | openai.APIConnectionError | 返回了任何未映射的错误时，统一返回该异常 |
| 500         | APIError | openai.APIError | 通用的 500 状态码错误 | 
| 503 | ServiceUnavailableError | openai.APIStatusError | 提供商返回服务不可用错误时抛出 |
| >=500       | InternalServerError      | openai.InternalServerError | 返回了任何未映射的 500 状态码错误时抛出 |
| N/A         | APIResponseValidationError | openai.APIResponseValidationError | 启用了规则（Rules）且请求或响应未通过某条规则时抛出 |
| N/A | BudgetExceededError | Exception | 代理场景下超出预算（budget）时抛出 |
| N/A | JSONSchemaValidationError | litellm.APIResponseValidationError | 响应不符合预期的 JSON schema 时抛出；在传入 `response_schema` 参数并设置 `enforce_validation=True` 时使用 |
| N/A | MockException | Exception | 内部异常，由 mock_completion 类抛出，请勿直接使用 | 
| N/A | OpenAIError | openai.OpenAIError | 已弃用的内部异常，继承自 openai.OpenAIError。 |



默认情况下返回 APIConnectionError。

所有 LiteLLM 异常都继承自 OpenAI 的异常类型，因此你针对 OpenAI 异常编写的错误处理逻辑无需改动即可直接用于 LiteLLM。 

无论哪种情况，返回的异常都继承自原始的 OpenAI 异常，但额外带有 3 个属性： 
* status_code - 异常的 HTTP 状态码
* message - 错误信息
* llm_provider - 抛出异常的提供商

## 用法

```python 
import litellm
import openai

try:
    response = litellm.completion(
                model="{{openai_large}}",
                messages=[
                    {
                        "role": "user",
                        "content": "hello, write a 20 pageg essay"
                    }
                ],
                timeout=0.01, # this will raise a timeout exception
            )
except openai.APITimeoutError as e:
    print("Passed: Raised correct exception. Got openai.APITimeoutError\nGood Job", e)
    print(type(e))
    pass
```

## 用法：捕获流式异常
```python
import litellm
try:
    response = litellm.completion(
        model="{{openai_small}}",
        messages=[
            {
                "role": "user",
                "content": "hello, write a 20 pg essay"
            }
        ],
        timeout=0.0001, # this will raise an exception
        stream=True,
    )
    for chunk in response:
        print(chunk)
except openai.APITimeoutError as e:
    print("Passed: Raised correct exception. Got openai.APITimeoutError\nGood Job", e)
    print(type(e))
    pass
except Exception as e:
    print(f"Did not raise error `openai.APITimeoutError`. Instead raised error type: {type(e)}, Error: {e}")

```

## 用法：该异常是否应该重试

```
import litellm
import openai

try:
    response = litellm.completion(
                model="{{openai_large}}",
                messages=[
                    {
                        "role": "user",
                        "content": "hello, write a 20 pageg essay"
                    }
                ],
                timeout=0.01, # this will raise a timeout exception
            )
except openai.APITimeoutError as e:
    should_retry = litellm._should_retry(e.status_code)
    print(f"should_retry: {should_retry}")
```

## 高级用法

### 访问提供商特定的错误详情

LiteLLM 异常包含一个 `provider_specific_fields` 属性，其中带有各提供商特有的补充错误信息。这对 Azure OpenAI 尤其有用，因为它会返回详细的内容过滤信息。

#### Azure OpenAI：访问内容政策违规的内部错误

当 Azure OpenAI 返回内容政策违规时，可以通过 `innererror` 字段访问详细的内容过滤结果：

```python
import litellm
from litellm.exceptions import ContentPolicyViolationError

try:
    response = litellm.completion(
        model="azure/{{openai_large}}",
        messages=[
            {
                "role": "user", 
                "content": "Some content that might violate policies"
            }
        ]
    )
except ContentPolicyViolationError as e:
    # Access Azure-specific error details
    if e.provider_specific_fields and "innererror" in e.provider_specific_fields:
        innererror = e.provider_specific_fields["innererror"]
        
        # Access content filter results
        content_filter_result = innererror.get("content_filter_result", {})
        
        print(f"Content filter code: {innererror.get('code')}")
        print(f"Hate filtered: {content_filter_result.get('hate', {}).get('filtered')}")
        print(f"Violence severity: {content_filter_result.get('violence', {}).get('severity')}")
        print(f"Sexual content filtered: {content_filter_result.get('sexual', {}).get('filtered')}")
```

**响应结构示例**：

调用 LiteLLM 代理时，内容政策违规将返回详细的过滤信息：

```json
{
  "error": {
    "message": "litellm.ContentPolicyViolationError: AzureException - The response was filtered due to the prompt triggering Azure OpenAI's content management policy...",
    "type": null,
    "param": null,
    "code": "400",
    "provider_specific_fields": {
      "innererror": {
        "code": "ResponsibleAIPolicyViolation",
        "content_filter_result": {
          "hate": {
            "filtered": true,
            "severity": "high"
          },
          "jailbreak": {
            "filtered": false,
            "detected": false
          },
          "self_harm": {
            "filtered": false,
            "severity": "safe"
          },
          "sexual": {
            "filtered": false,
            "severity": "safe"
          },
          "violence": {
            "filtered": true,
            "severity": "medium"
          }
        }
      }
    }
  }
}
```

## 实现细节

想看具体实现，可以[查看代码](https://github.com/BerriAI/litellm/blob/a42c197e5a6de56ea576c73715e6c7c6b19fa249/litellm/utils.py#L1217)。

如果你想改进异常映射，欢迎[提交 issue](https://github.com/BerriAI/litellm/issues/new)**或**[发起 PR](https://github.com/BerriAI/litellm/pulls)。

**注意** 对于 OpenAI 和 Azure，我们直接返回原始异常（因为它们本身就属于 OpenAI 错误类型），但会为其添加 'llm_provider' 属性。[参见代码](https://github.com/BerriAI/litellm/blob/a42c197e5a6de56ea576c73715e6c7c6b19fa249/litellm/utils.py#L1221)

## 自定义映射表

默认情况：返回 `litellm.APIConnectionError` 异常（继承自 openai 的 APIConnectionError 异常）。

| custom_llm_provider        | Timeout | ContextWindowExceededError | BadRequestError | NotFoundError | ContentPolicyViolationError | AuthenticationError | APIError | RateLimitError | ServiceUnavailableError | PermissionDeniedError | UnprocessableEntityError |
|----------------------------|---------|----------------------------|------------------|---------------|-----------------------------|---------------------|----------|----------------|-------------------------|-----------------------|-------------------------|
| openai                     | ✓       | ✓                          | ✓                |               | ✓                           | ✓                   |          |                |                         |                       |                           |
| watsonx                     |       | | | | | | |✓| | | |
| text-completion-openai     | ✓       | ✓                          | ✓                |               | ✓                           | ✓                   |          |                |                         |                       |                           |
| custom_openai              | ✓       | ✓                          | ✓                |               | ✓                           | ✓                   |          |                |                         |                       |                           |
| openai_compatible_providers| ✓       | ✓                          | ✓                |               | ✓                           | ✓                   |          |                |                         |                       |                           |
| anthropic                  | ✓       | ✓                          | ✓                | ✓             |                             | ✓                   |          |                | ✓                       | ✓                     |                           |
| replicate                  | ✓       | ✓                          | ✓                | ✓             |                             | ✓                   |          | ✓              | ✓                       |                       |                           |
| bedrock                    | ✓       | ✓                          | ✓                | ✓             |                             | ✓                   |          | ✓              | ✓                       | ✓                     |                           |
| sagemaker                  |         | ✓                          | ✓                |               |                             |                     |          |                |                         |                       |                           |
| vertex_ai                  | ✓       |                            | ✓                |               |                             |                     | ✓        |                |                         |                       | ✓                         |
| palm                       | ✓       | ✓                          |                  |               |                             |                     | ✓        |                |                         |                       |                           |
| gemini                     | ✓       | ✓                          |                  |               |                             |                     | ✓        |                |                         |                       |                           |
| cloudflare                 |         |                            | ✓                |               |                             | ✓                   |          |                |                         |                       |                           |
| cohere                     |         | ✓                          | ✓                |               |                             | ✓                   |          |                | ✓                       |                       |                           |
| cohere_chat                |         | ✓                          | ✓                |               |                             | ✓                   |          |                | ✓                       |                       |                           |
| huggingface                | ✓       | ✓                          | ✓                |               |                             | ✓                   |          | ✓              | ✓                       |                       |                           |
| ai21                       | ✓       | ✓                          | ✓                | ✓             |                             | ✓                   |          | ✓              |                         |                       |                           |
| nlp_cloud                  | ✓       | ✓                          | ✓                |               |                             | ✓                   | ✓        | ✓              | ✓                       |                       |                           |
| together_ai                | ✓       | ✓                          | ✓                |               |                             | ✓                   |          |                |                         |                       |                           |
| aleph_alpha                |         |                            | ✓                |               |                             | ✓                   |          |                |                         |                       |                           |
| ollama                     | ✓       |                            | ✓                |               |                             |                     |          |                | ✓                       |                       |                           |
| ollama_chat                | ✓       |                            | ✓                |               |                             |                     |          |                | ✓                       |                       |                           |
| vllm                       |         |                            |                  |               |                             | ✓                   | ✓        |                |                         |                       |                           |
| azure                      | ✓       | ✓                          | ✓                | ✓             | ✓                           | ✓                   |          |                | ✓                       |                       |                           |

- "✓" 表示对应的 `custom_llm_provider` 会抛出该异常。
- 空白单元格表示两者没有关联，或该提供商按函数逻辑不会抛出对应的异常类型。


> 想更深入地理解这些异常，可以查看[这份实现](https://github.com/BerriAI/litellm/blob/d7e58d13bf9ba9edbab2ab2f096f3de7547f35fa/litellm/utils.py#L1544)获取更多细节。

`ContextWindowExceededError` 是 `InvalidRequestError` 的子类，引入它是为了让异常处理场景能够更细粒度地区分错误。详情请参阅[这个 issue](https://github.com/BerriAI/litellm/issues/228)。

欢迎[参与贡献](https://github.com/BerriAI/litellm#contributing)，一起改进异常映射。
