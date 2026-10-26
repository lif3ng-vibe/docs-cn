# Token 用量
默认情况下，LiteLLM 会在所有补全请求中返回 Token 用量（[见此处](https://litellm.readthedocs.io/en/latest/output/)）

此外，我们还提供 3 个公开的辅助函数，用于计算各提供商的 Token 用量：

- `token_counter`：返回给定输入的 Token 数量——会根据模型选用对应的分词器，若没有该模型专用的分词器，则默认使用 tiktoken。

- `cost_per_token`：返回提示（输入）与补全（输出）Token 的成本（以美元计）。它使用我们的 model_cost 映射表，该表见 `__init__.py`，也可作为[社区资源](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)查阅。

- `completion_cost`：返回一次 LLM API 调用的总成本（以美元计）。它结合 `token_counter` 与 `cost_per_token`，计入输入与输出两部分，返回该次查询的成本。

## 用法示例

1. `token_counter`

```python
from litellm import token_counter

messages = [{"role": "user", "content": "Hey, how's it going"}]
print(token_counter(model="gpt-3.5-turbo", messages=messages))
```

2. `cost_per_token`

```python
from litellm import cost_per_token

prompt_tokens =  5
completion_tokens = 10
prompt_tokens_cost_usd_dollar, completion_tokens_cost_usd_dollar = cost_per_token(model="gpt-3.5-turbo", prompt_tokens=prompt_tokens, completion_tokens=completion_tokens)

print(prompt_tokens_cost_usd_dollar, completion_tokens_cost_usd_dollar)
```

3. `completion_cost`

```python
from litellm import completion_cost

prompt = "Hey, how's it going"
completion = "Hi, I'm gpt - I am doing well"
cost_of_query = completion_cost(model="gpt-3.5-turbo", prompt=prompt, completion=completion))

print(cost_of_query)
```
