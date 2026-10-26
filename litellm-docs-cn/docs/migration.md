# 迁移指南：LiteLLM v1.0.0+

出现破坏性变更（breaking changes，即从 1.x.x 升级到 2.x.x 这类情况）时，我们会把相关变更记录在这里。


## `1.0.0`

**破坏性变更前的最后一个版本**：0.14.0

**有哪些变更？**

- 需要 `openai>=1.0.0`
- `openai.InvalidRequestError` → `openai.BadRequestError`
- `openai.ServiceUnavailableError` → `openai.APIStatusError`
- *新增* litellm 客户端，支持传入 api_key
    - `litellm.Litellm(api_key="sk-123")`
- 响应对象现在继承自 `BaseModel`（之前为 `OpenAIObject`）
- *新增* 默认异常：`APIConnectionError`（之前为 `APIError`）
- litellm.get_max_tokens() 现在返回 int 而不是 dict
    ```python keep-model-ids
    max_tokens = litellm.get_max_tokens("gpt-3.5-turbo") # returns an int not a dict 
    assert max_tokens==4097
    ```
- 流式（streaming）：对于空的流块（chunk），OpenAI 现在会返回 `None`。处理含内容流块的方法如下
    ```python
    response = litellm.completion(model="{{openai_small}}", messages=messages, stream=True)
    for part in response:
        print(part.choices[0].delta.content or "")
    ```

**如何更好地向大家传达这些变更？**
欢迎通过以下方式告诉我们
- [Discord](https://discord.com/invite/wuPM9dRgDw)
- 邮件（support@berri.ai）
