# 模型别名（Model Alias）

展示给最终用户的模型名称，可能与实际传给 LiteLLM 的名称不同。例如，前端向用户展示 `GPT-5.6`，后端实际调用的是 `{{openai_small}}`。

LiteLLM 简化了这件事：只需传入一份模型别名映射即可。

## 预期格式

```python
litellm.model_alias_map = {
    # a dictionary containing a mapping of the alias string to the actual litellm model name string
    "model_alias": "litellm_model_name"
}
```

## 用法

### 相关代码
```python
model_alias_map = {
    "GPT-5.6": "{{openai_small}}",
    "llama2": "replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf"
}

litellm.model_alias_map = model_alias_map
```

### 完整代码
```python
import litellm
from litellm import completion


## set ENV variables
os.environ["OPENAI_API_KEY"] = "openai key"
os.environ["REPLICATE_API_KEY"] = "cohere key"

## set model alias map
model_alias_map = {
    "GPT-5.6": "{{openai_small}}",
    "llama2": "replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf"
}

litellm.model_alias_map = model_alias_map

messages = [{ "content": "Hello, how are you?","role": "user"}]

# call "{{openai_small}}"
response = completion(model="GPT-5.6", messages=messages)

# call replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca1...
response = completion("llama2", messages)
```
