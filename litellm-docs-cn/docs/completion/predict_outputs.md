import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 预测输出（Predicted Outputs）

| 属性 | 说明 |
|-------|-------|
| 描述 | 当 LLM 输出的大部分内容可以提前预知时使用。例如，让模型改写一段只需少量修改的文本或代码时，可以把现有内容作为预测（prediction）传入，借助预测输出（Predicted Outputs）显著降低延迟。 |
| 支持的提供商 | `openai` |
| OpenAI 官方文档：预测输出 | [预测输出 ↗](https://platform.openai.com/docs/guides/latency-optimization#use-predicted-outputs) |
| LiteLLM 支持起始版本 | `v1.51.4` |



## 使用预测输出

<Tabs>
<TabItem label="LiteLLM Python SDK" value="Python">

在这个例子中，我们想重构一段 C# 代码，把其中的 Username 属性改成 Email：
```python
import litellm
os.environ["OPENAI_API_KEY"] = "your-api-key"
code = """
/// <summary>
/// Represents a user with a first name, last name, and username.
/// </summary>
public class User
{
    /// <summary>
    /// Gets or sets the user's first name.
    /// </summary>
    public string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name.
    /// </summary>
    public string LastName { get; set; }

    /// <summary>
    /// Gets or sets the user's username.
    /// </summary>
    public string Username { get; set; }
}
"""

completion = litellm.completion(
    model="{{openai_small}}",
    messages=[
        {
            "role": "user",
            "content": "Replace the Username property with an Email property. Respond only with code, and with no markdown formatting.",
        },
        {"role": "user", "content": code},
    ],
    prediction={"type": "content", "content": code},
)

print(completion)
```

</TabItem>
<TabItem label="LiteLLM 代理服务器" value="proxy">

1. 在 config.yaml 中定义模型

```yaml
model_list:
  - model_name: {{openai_small}} # OpenAI {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY 

```

2. 启动代理服务器

```bash
litellm --config config.yaml
```

3. 用 OpenAI Python SDK 测试


```python
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY", # sk-<your-litellm-api-key>
    base_url="LITELLM_PROXY_BASE" # http://0.0.0.0:4000
)

completion = client.chat.completions.create(
    model="{{openai_small}}",
    messages=[
        {
            "role": "user",
            "content": "Replace the Username property with an Email property. Respond only with code, and with no markdown formatting.",
        },
        {"role": "user", "content": code},
    ],
    prediction={"type": "content", "content": code},
)

print(completion)
```

</TabItem>
</Tabs>
